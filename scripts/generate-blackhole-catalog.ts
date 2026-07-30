import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { strFromU8, unzipSync } from "fflate";
import { XMLParser } from "fast-xml-parser";
import type {
  BlackHoleApiDefinition,
  BlackHoleCatalog,
  BlackHoleFieldDefinition,
  BlackHoleModelDefinition,
  BlackHoleModuleDefinition,
} from "../src/types/blackhole.js";

const SOURCE_DOCUMENT = "docs/BlackHole Engine API_Web-v3.2.0.3808.docx";
const OUTPUT_PATH = "src/data/blackhole/catalog.generated.ts";
const CHECK_MODE = process.argv.includes("--check");

type XmlNode = Record<string, unknown>;

type ParagraphBlock = {
  kind: "paragraph";
  blockIndex: number;
  styleName: string;
  text: string;
};

type TableBlock = {
  kind: "table";
  blockIndex: number;
  rows: string[][];
};

type DocumentBlock = ParagraphBlock | TableBlock;

type CatalogScope = {
  label: string;
  namespace: string;
  kind: "api" | "event";
};

type ApiDraft = BlackHoleApiDefinition & {
  detailMode: "details" | "description" | "parameters" | "returns" | "examples" | "model";
  currentModel?: BlackHoleModelDefinition;
  exampleLines: string[];
};

function isObject(value: unknown): value is XmlNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNodes(value: unknown): XmlNode[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function findNode(nodes: XmlNode[], key: string): XmlNode[] {
  const node = nodes.find((item) => key in item);
  return node ? asNodes(node[key]) : [];
}

function attributes(node: XmlNode): XmlNode {
  return isObject(node[":@"]) ? node[":@"] : {};
}

function textFromNodes(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(textFromNodes).join("");
  }
  if (!isObject(value)) {
    return "";
  }

  let text = "";
  for (const [key, child] of Object.entries(value)) {
    if (key === ":@") {
      continue;
    }
    if (key === "w:tab") {
      text += "\t";
      continue;
    }
    if (key === "w:br" || key === "w:cr") {
      text += "\n";
      continue;
    }
    text += textFromNodes(child);
  }
  return text;
}

function normalizeText(value: string): string {
  return value.replace(/\u00a0/gu, " ").replace(/\r\n?/gu, "\n").trim();
}

function paragraphStyleId(nodes: XmlNode[]): string {
  const properties = findNode(nodes, "w:pPr");
  const style = properties.find((item) => "w:pStyle" in item);
  if (!style) {
    return "";
  }
  const styleNodes = asNodes(style["w:pStyle"]);
  const styleAttributes = isObject(style[":@"]) ? attributes(style) : attributes(styleNodes[0] ?? {});
  return typeof styleAttributes["w:val"] === "string" ? styleAttributes["w:val"] : "";
}

function paragraphText(nodes: XmlNode[]): string {
  return normalizeText(textFromNodes(nodes));
}

function tableRows(nodes: XmlNode[]): string[][] {
  return nodes
    .filter((item) => "w:tr" in item)
    .map((row) => {
      return asNodes(row["w:tr"])
        .filter((item) => "w:tc" in item)
        .map((cell) => {
          const paragraphs = asNodes(cell["w:tc"])
            .filter((item) => "w:p" in item)
            .map((item) => paragraphText(asNodes(item["w:p"])))
            .filter(Boolean);
          return paragraphs.join("\n");
        });
    })
    .filter((row) => row.some(Boolean));
}

function styleMap(xml: string): Map<string, string> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  const parsed = parser.parse(xml) as XmlNode;
  const stylesRoot = isObject(parsed["w:styles"]) ? parsed["w:styles"] : {};
  const styles = Array.isArray(stylesRoot["w:style"])
    ? stylesRoot["w:style"].filter(isObject)
    : isObject(stylesRoot["w:style"])
      ? [stylesRoot["w:style"]]
      : [];
  return new Map(styles.flatMap((style) => {
    const id = style["w:styleId"];
    const nameNode = style["w:name"];
    const name = isObject(nameNode) ? nameNode["w:val"] : undefined;
    return typeof id === "string" && typeof name === "string" ? [[id, name]] : [];
  }));
}

function documentBlocks(documentXml: string, styles: Map<string, string>): DocumentBlock[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    preserveOrder: true,
  });
  const parsed = asNodes(parser.parse(documentXml));
  const document = parsed.find((item) => "w:document" in item);
  const body = document ? findNode(asNodes(document["w:document"]), "w:body") : [];

  return body.flatMap((item, blockIndex): DocumentBlock[] => {
    if ("w:p" in item) {
      const nodes = asNodes(item["w:p"]);
      const styleId = paragraphStyleId(nodes);
      return [{
        kind: "paragraph",
        blockIndex,
        styleName: styles.get(styleId) ?? styleId,
        text: paragraphText(nodes),
      }];
    }
    if ("w:tbl" in item) {
      return [{
        kind: "table",
        blockIndex,
        rows: tableRows(asNodes(item["w:tbl"])),
      }];
    }
    return [];
  });
}

function namespaceFromLabel(label: string): string {
  const match = label.match(/（([^（）]+)）/u);
  return match?.[1]?.trim() ?? "";
}

function scopeFromSection(label: string, styleName: string): CatalogScope | undefined {
  if (styleName === "样式3") {
    if (["基本介绍", "问题汇总", "更新日志"].includes(label)) {
      return undefined;
    }
    if (label === "引擎模块") {
      return { label, namespace: "", kind: "api" };
    }
    if (label === "监听事件") {
      return { label, namespace: "Event", kind: "event" };
    }
    const namespace = namespaceFromLabel(label);
    return namespace ? { label, namespace, kind: "api" } : undefined;
  }

  if (styleName.toLowerCase() === "heading 1") {
    const namespace = namespaceFromLabel(label);
    return namespace ? { label, namespace, kind: "api" } : undefined;
  }
  return undefined;
}

function fieldRows(rows: string[][]): BlackHoleFieldDefinition[] {
  return rows.flatMap((row, index) => {
    const cells = row.map(normalizeText);
    if (cells.length < 2) {
      return [];
    }
    const numericPosition = /^\d+$/u.test(cells[0]);
    const name = numericPosition ? cells[1] : cells[0];
    const description = (numericPosition ? cells.slice(2) : cells.slice(1)).join(" ").trim();
    if (!name || /^(?:参数|名称|name)$/iu.test(name)) {
      return [];
    }
    return [{
      name,
      description,
      ...(numericPosition ? { position: Number(cells[0]) } : { position: index + 1 }),
    }];
  });
}

function apiId(scope: CatalogScope, name: string): string {
  if (scope.kind === "event") {
    return `Event.${name}`;
  }
  return `${scope.namespace || "Engine"}.${name}`;
}

function callPath(scope: CatalogScope, name: string): string {
  if (scope.kind === "event") {
    return name;
  }
  return `BlackHole3D${scope.namespace ? `.${scope.namespace}` : ""}.${name}`;
}

function createDraft(
  scope: CatalogScope,
  group: string | undefined,
  name: string,
  sourceDocument: string,
  blockIndex: number,
): ApiDraft {
  return {
    id: apiId(scope, name),
    name,
    namespace: scope.namespace,
    module: scope.label,
    ...(group ? { group } : {}),
    kind: scope.kind,
    callPath: callPath(scope, name),
    description: "",
    notes: [],
    parameters: [],
    models: [],
    returns: [],
    examples: [],
    usageForms: scope.kind === "event" ? [] : ["call"],
    source: {
      document: sourceDocument,
      section: scope.label,
      ...(group ? { group } : {}),
      blockIndex,
    },
    detailMode: "details",
    exampleLines: [],
  };
}

function finishDraft(draft: ApiDraft | undefined): BlackHoleApiDefinition | undefined {
  if (!draft) {
    return undefined;
  }
  const example = draft.exampleLines.join("\n").replace(/\n{3,}/gu, "\n\n").trim();
  if (example) {
    draft.examples.push(example);
  }
  const assignmentPattern = new RegExp(
    `(?:${draft.callPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}|${draft.name})[^\\n=]*=`,
    "u",
  );
  if (draft.kind === "api" && (/^[mg]_re_/u.test(draft.name) || assignmentPattern.test(example))) {
    draft.usageForms = ["assignment"];
  }

  const { detailMode: _detailMode, currentModel: _currentModel, exampleLines: _exampleLines, ...api } = draft;
  return api;
}

function setParagraphMode(draft: ApiDraft, text: string): boolean {
  if (/^功能[：:]$/u.test(text)) {
    draft.detailMode = "description";
    return true;
  }
  if (/^参数[：:]$/u.test(text)) {
    draft.detailMode = "parameters";
    return true;
  }
  if (/^返回值[：:]$/u.test(text)) {
    draft.detailMode = "returns";
    return true;
  }
  if (/^(?:调用)?示例[：:]$/u.test(text)) {
    draft.detailMode = "examples";
    return true;
  }
  const modelMatch = text.match(/^(.+?)(?:模型|枚举(?:类型)?)解析[：:]$/u);
  if (modelMatch) {
    const model: BlackHoleModelDefinition = { name: modelMatch[1].trim(), fields: [] };
    draft.models.push(model);
    draft.currentModel = model;
    draft.detailMode = "model";
    return true;
  }
  return false;
}

function consumeParagraph(draft: ApiDraft, text: string): void {
  if (setParagraphMode(draft, text)) {
    return;
  }
  if (draft.detailMode === "examples") {
    draft.exampleLines.push(text);
    return;
  }
  if (!text) {
    return;
  }
  if (draft.detailMode === "description" && draft.description === "") {
    draft.description = text;
    return;
  }
  if (draft.detailMode === "returns") {
    if (text !== "无") {
      draft.returns.push(text);
    }
    return;
  }
  draft.notes.push(text);
}

function consumeTable(draft: ApiDraft, rows: string[][]): void {
  const fields = fieldRows(rows);
  if (draft.detailMode === "parameters") {
    draft.parameters.push(...fields);
    return;
  }
  if (draft.detailMode === "model" && draft.currentModel) {
    draft.currentModel.fields.push(...fields);
    return;
  }
  if (draft.detailMode === "returns") {
    draft.returns.push(...fields.map((field) => `${field.name}: ${field.description}`));
    return;
  }
  draft.notes.push(...fields.map((field) => `${field.name}: ${field.description}`));
}

function parseApis(blocks: DocumentBlock[], sourceDocument: string): BlackHoleApiDefinition[] {
  const apis: BlackHoleApiDefinition[] = [];
  let scope: CatalogScope | undefined;
  let group: string | undefined;
  let draft: ApiDraft | undefined;

  const flush = () => {
    const api = finishDraft(draft);
    if (api) {
      apis.push(api);
    }
    draft = undefined;
  };

  for (const block of blocks) {
    if (block.kind === "table") {
      if (draft) {
        consumeTable(draft, block.rows);
      }
      continue;
    }

    const sectionScope = scopeFromSection(block.text, block.styleName);
    if (block.styleName === "样式3" || block.styleName.toLowerCase() === "heading 1") {
      flush();
      scope = sectionScope;
      group = undefined;
      continue;
    }
    if (block.styleName.toLowerCase() === "heading 2") {
      flush();
      group = block.text || undefined;
      continue;
    }
    if (block.styleName === "样式4" && scope && block.text) {
      flush();
      draft = createDraft(scope, group, block.text, sourceDocument, block.blockIndex);
      continue;
    }
    if (draft) {
      consumeParagraph(draft, block.text);
    }
  }
  flush();
  return apis;
}

function moduleDefinitions(apis: BlackHoleApiDefinition[]): BlackHoleModuleDefinition[] {
  const modules = new Map<string, BlackHoleModuleDefinition>();
  for (const api of apis) {
    const id = api.kind === "event" ? "Event" : api.namespace || "Engine";
    const existing = modules.get(id);
    if (existing) {
      existing.apiCount += 1;
      continue;
    }
    modules.set(id, {
      id,
      name: api.module,
      namespace: api.namespace,
      kind: api.kind === "event" ? "events" : "module",
      apiCount: 1,
    });
  }
  return [...modules.values()];
}

function coreModifiedAt(xml: string | undefined): string | undefined {
  if (!xml) {
    return undefined;
  }
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
  const parsed = parser.parse(xml) as XmlNode;
  const properties = isObject(parsed["cp:coreProperties"]) ? parsed["cp:coreProperties"] : {};
  const modified = properties["dcterms:modified"];
  return typeof modified === "string" ? modified : undefined;
}

function createCatalog(): BlackHoleCatalog {
  const sourceBuffer = fs.readFileSync(SOURCE_DOCUMENT);
  const archive = unzipSync(new Uint8Array(sourceBuffer));
  const documentXml = archive["word/document.xml"];
  const stylesXml = archive["word/styles.xml"];
  if (!documentXml || !stylesXml) {
    throw new Error(`${SOURCE_DOCUMENT} is missing word/document.xml or word/styles.xml`);
  }

  const version = path.basename(SOURCE_DOCUMENT).match(/v(\d+(?:\.\d+)+)/iu)?.[1];
  if (!version) {
    throw new Error(`cannot determine SDK version from ${SOURCE_DOCUMENT}`);
  }
  const apis = parseApis(
    documentBlocks(strFromU8(documentXml), styleMap(strFromU8(stylesXml))),
    SOURCE_DOCUMENT,
  );
  const catalog: BlackHoleCatalog = {
    sdkVersion: version,
    sourceDocument: SOURCE_DOCUMENT,
    sourceSha256: createHash("sha256").update(sourceBuffer).digest("hex"),
    ...(coreModifiedAt(archive["docProps/core.xml"] ? strFromU8(archive["docProps/core.xml"]) : undefined)
      ? { sourceModifiedAt: coreModifiedAt(strFromU8(archive["docProps/core.xml"])) }
      : {}),
    apiCount: apis.length,
    modules: moduleDefinitions(apis),
    apis,
  };

  if (catalog.apiCount < 1_000) {
    throw new Error(`parsed only ${catalog.apiCount} APIs; expected at least 1000`);
  }
  for (const requiredId of ["Model.loadDataSet", "Event.REDataSetLoadFinish", "Edit.setEditPlaneBtnState"]) {
    if (!catalog.apis.some((api) => api.id === requiredId)) {
      throw new Error(`generated catalog missing required API ${requiredId}`);
    }
  }
  return catalog;
}

function generatedSource(catalog: BlackHoleCatalog): string {
  return [
    "// AUTO GENERATED DO NOT EDIT - run npm run blackhole:generate",
    'import type { BlackHoleCatalog } from "../../types/blackhole.js";',
    "",
    `export const blackHoleCatalog: BlackHoleCatalog = ${JSON.stringify(catalog, null, 2)};`,
    "",
  ].join("\n");
}

const content = generatedSource(createCatalog());
if (CHECK_MODE) {
  const existing = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, "utf8") : "";
  if (existing !== content) {
    console.error(`${OUTPUT_PATH} is stale. Run npm run blackhole:generate.`);
    process.exit(1);
  }
  console.log("BlackHole SDK catalog is current");
} else {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, content);
  console.log(`generated ${OUTPUT_PATH}`);
}
