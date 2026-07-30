import fs from "node:fs";
import path from "node:path";
import {
  getScreenToolDefinitions,
  SCREEN_TOOL_CATEGORY_LABELS,
  type ScreenToolCategory,
} from "../src/mcp/screenServer.js";
import { listComponents } from "../src/core/registry.js";
import { listModules } from "../src/core/modules.js";
import { listBlackHoleModules } from "../src/core/blackholeSdk.js";
import type { JsonObject } from "../src/types/component.js";

const CHECK_MODE = process.argv.includes("--check");
const README_PATH = "README.md";
const DOCS_DIR = "docs";
const TOOL_REFERENCE_PATH = path.join(DOCS_DIR, "tool-reference.md");
const COMPONENT_REFERENCE_PATH = path.join(DOCS_DIR, "component-reference.md");
const MODULE_REFERENCE_PATH = path.join(DOCS_DIR, "module-reference.md");
const BLACKHOLE_REFERENCE_PATH = path.join(DOCS_DIR, "blackhole-sdk-reference.md");

function writeOrCheck(filePath: string, content: string): boolean {
  if (!CHECK_MODE) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    return true;
  }

  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (existing !== content) {
    console.error(`${filePath} is stale. Run npm run docs:generate.`);
    return false;
  }

  return true;
}

function updateReadmeCapabilities(summary: string): boolean {
  const readme = fs.readFileSync(README_PATH, "utf8");
  const beginMarker = "<!-- BEGIN AUTO GENERATED CAPABILITIES -->";
  const endMarker = "<!-- END AUTO GENERATED CAPABILITIES -->";
  const begin = readme.indexOf(beginMarker);
  const end = readme.indexOf(endMarker);

  if (begin === -1 || end === -1 || end < begin) {
    throw new Error("README.md missing auto-generated capabilities markers");
  }

  const before = readme.slice(0, begin + beginMarker.length);
  const after = readme.slice(end);
  const next = `${before}\n${summary}\n${after}`;

  if (!CHECK_MODE) {
    fs.writeFileSync(README_PATH, next);
    return true;
  }

  if (readme !== next) {
    console.error("README.md generated capabilities section is stale. Run npm run docs:generate.");
    return false;
  }

  return true;
}

function bulletLink(label: string, href: string): string {
  return `- [${label}](${href})`;
}

function generateCapabilitySummary(): string {
  const components = listComponents();
  const modules = listModules();
  const tools = getScreenToolDefinitions();

  return [
    "",
    "此区块由 `npm run docs:generate` 生成，请不要手写维护。",
    "",
    `当前 MCP 工具：${tools.length} 个。`,
    `当前内置组件：${components.length} 个。`,
    `当前内置模块：${modules.length} 个。`,
    "",
    bulletLink("工具参考", "docs/tool-reference.md"),
    bulletLink("组件参考", "docs/component-reference.md"),
    bulletLink("模块参考", "docs/module-reference.md"),
    bulletLink("BlackHole SDK 参考", "docs/blackhole-sdk-reference.md"),
    bulletLink("开发规范", "docs/development-rules.md"),
    "",
  ].join("\n");
}

function generateToolReference(): string {
  const tools = getScreenToolDefinitions();
  const byCategory = new Map<ScreenToolCategory, typeof tools>();

  for (const tool of tools) {
    const items = byCategory.get(tool.category) ?? [];
    items.push(tool);
    byCategory.set(tool.category, items);
  }

  const lines = [
    "<!-- AUTO GENERATED DO NOT EDIT - run npm run docs:generate -->",
    "",
    "# Screen MCP Tool Reference",
    "",
    "这些工具只负责编译、校验和暴露能力，不根据行业、关键词或 prompt 套固定大屏模板。",
    "",
  ];

  for (const [category, items] of byCategory.entries()) {
    lines.push(`## ${SCREEN_TOOL_CATEGORY_LABELS[category]}`, "");
    for (const tool of items) {
      const readOnly = tool.config.annotations.readOnlyHint ? "read-only" : "writes schema output";
      lines.push(`### \`${tool.name}\``, "");
      lines.push(`- Title: ${tool.config.title}`);
      lines.push(`- Mode: ${readOnly}`);
      lines.push(`- Description: ${tool.config.description}`);
      lines.push("");
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

function generateComponentReference(): string {
  const components = listComponents();
  const lines = [
    "<!-- AUTO GENERATED DO NOT EDIT - run npm run docs:generate -->",
    "",
    "# Screen MCP Component Reference",
    "",
    "组件能力来自 `src/core/registry.ts`。新增组件必须补 capability、defaultProps/normalizer 以及对应测试。",
    "",
    "| Component | Type | Description |",
    "| --- | --- | --- |",
  ];

  for (const component of components) {
    lines.push(
      `| \`${component.componentName}\` | ${component.componentType} | ${component.description.replace(/\|/g, "\\|")} |`,
    );
  }

  return `${lines.join("\n").trim()}\n`;
}

function generateModuleReference(): string {
  const modules = listModules();
  const lines = [
    "<!-- AUTO GENERATED DO NOT EDIT - run npm run docs:generate -->",
    "",
    "# Screen MCP Module Reference",
    "",
    "模块是结构化编译能力，不是行业模板。图表分析用 `ChartPanel`，KPI、表格、地图、媒体、控制器和混合信息卡优先用 `FreeformModule`。",
    "",
    "| Module | Description |",
    "| --- | --- |",
  ];

  for (const module of modules) {
    lines.push(`| \`${module.moduleName}\` | ${module.description.replace(/\|/g, "\\|")} |`);
  }

  return `${lines.join("\n").trim()}\n`;
}

function generateBlackHoleReference(): string {
  const catalog = listBlackHoleModules();
  const modules = Array.isArray(catalog.modules) ? catalog.modules as JsonObject[] : [];
  const lines = [
    "<!-- AUTO GENERATED DO NOT EDIT - run npm run docs:generate -->",
    "",
    "# BlackHole Engine WebSDK Reference",
    "",
    "LLM 负责理解用户意图并设计 `BlackHoleScriptSpec`；MCP 负责从官方 SDK 能力中检索、校验并编译代码，不根据自然语言套用固定代码模板。",
    "",
    `- SDK version: \`${catalog.sdkVersion}\``,
    `- API count: ${catalog.apiCount}`,
    `- Source document: [${catalog.sourceDocument}](${path.basename(String(catalog.sourceDocument)).replace(/ /g, "%20")})`,
    `- Source SHA-256: \`${catalog.sourceSha256}\``,
    "",
    "## Tool Flow",
    "",
    "1. `list_blackhole_sdk_modules` discovers namespaces.",
    "2. `search_blackhole_sdk` locates candidate APIs by name or description.",
    "3. `get_blackhole_api_capability` reads the exact qualified API contract.",
    "4. The LLM authors `BlackHoleScriptSpec` with explicit inputs and operations.",
    "5. `validate_blackhole_script_spec` reports errors and uncertain optional-parameter warnings.",
    "6. `generate_blackhole_code` compiles JavaScript without executing it.",
    "",
    "## Script Value References",
    "",
    "- `{ \"$input\": \"dataSetList\" }` references a declared runtime input.",
    "- `{ \"$ref\": \"selectedIds\" }` references an earlier operation's `assignTo` value.",
    "- `{ \"$constructor\": \"REColor\", \"args\": [0, 229, 255, 255] }` creates a documented SDK value object.",
    "- Plain JSON values compile as literals. Arbitrary raw code expressions are not supported.",
    "",
    "The generated setup function receives a ready BlackHole3D-compatible SDK instance as its first argument. Resource URLs, credentials, component IDs, dataset IDs, element IDs, and other project-specific values must come from the user through `inputs`; the MCP must not invent them.",
    "",
    "## Modules",
    "",
    "| ID | SDK namespace | Type | APIs | Name |",
    "| --- | --- | --- | ---: | --- |",
  ];
  for (const module of modules) {
    lines.push(
      `| \`${module.id}\` | \`${module.namespace || "BlackHole3D"}\` | ${module.kind} | ${module.apiCount} | ${module.name} |`,
    );
  }
  return `${lines.join("\n").trim()}\n`;
}

let ok = true;
ok = writeOrCheck(TOOL_REFERENCE_PATH, generateToolReference()) && ok;
ok = writeOrCheck(COMPONENT_REFERENCE_PATH, generateComponentReference()) && ok;
ok = writeOrCheck(MODULE_REFERENCE_PATH, generateModuleReference()) && ok;
ok = writeOrCheck(BLACKHOLE_REFERENCE_PATH, generateBlackHoleReference()) && ok;
ok = updateReadmeCapabilities(generateCapabilitySummary()) && ok;

if (!ok) {
  process.exit(1);
}

if (!CHECK_MODE) {
  console.log("docs generated");
}
