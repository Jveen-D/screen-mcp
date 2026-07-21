import { generateDashboardSchema, validateDashboardSpec } from "./dashboard.js";
import { uniqueSchemaId } from "./schema.js";
import type {
  EditorDocumentSchema,
  EditorProjectSchema,
  EditorTreeNode,
  JsonObject,
  JsonValue,
} from "../types/component.js";

type DocumentKind = "page" | "master";

type CompiledDocument = {
  logicalId: string;
  title: string;
  document: EditorDocumentSchema;
};

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asObjects(value: JsonValue | undefined): JsonObject[] {
  return Array.isArray(value) ? value.filter(isJsonObject) : [];
}

function stringValue(value: JsonValue | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function documentLogicalId(input: JsonObject): string {
  return stringValue(input.logicalId);
}

function documentTitle(input: JsonObject, kind: DocumentKind): string {
  const title = stringValue(input.title);
  if (title !== "") {
    return title;
  }

  return kind === "master" ? "未命名母版页面" : "未命名页面";
}

function projectTitle(input: JsonObject): string {
  return stringValue(input.title) || "大屏项目";
}

function canvasSize(input: JsonObject): { width: number; height: number } {
  const canvas = isJsonObject(input.canvas) ? input.canvas : {};
  const width = typeof canvas.width === "number" && Number.isFinite(canvas.width)
    ? canvas.width
    : 1920;
  const height = typeof canvas.height === "number" && Number.isFinite(canvas.height)
    ? canvas.height
    : 1080;

  return { width, height };
}

function hasDashboardContent(input: JsonObject): boolean {
  return [input.components, input.groups, input.modules].some(
    (value) => Array.isArray(value) && value.length > 0,
  );
}

function masterLogicalIds(input: JsonObject): string[] {
  if (!Array.isArray(input.masterLogicalIds)) {
    return [];
  }

  return input.masterLogicalIds
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value !== "");
}

function resolveDocumentSpec(project: JsonObject, document: JsonObject): JsonObject {
  const resolved: JsonObject = { ...document };
  for (const key of ["canvas", "theme", "grouping", "autoPanelBackgrounds"] as const) {
    if (resolved[key] === undefined && project[key] !== undefined) {
      resolved[key] = project[key];
    }
  }
  return resolved;
}

function appendDashboardValidation(
  input: JsonObject,
  fieldName: string,
  errors: string[],
  warnings: string[],
): void {
  const validation = validateDashboardSpec(input);
  const nestedErrors = Array.isArray(validation.errors) ? validation.errors : [];
  const nestedWarnings = Array.isArray(validation.warnings) ? validation.warnings : [];

  nestedErrors.forEach((error) => {
    if (typeof error === "string") {
      errors.push(`${fieldName}: ${error}`);
    }
  });
  nestedWarnings.forEach((warning) => {
    if (typeof warning === "string") {
      warnings.push(`${fieldName}: ${warning}`);
    }
  });
}

function validateDocumentIdentity(
  input: JsonObject,
  fieldName: string,
  seenLogicalIds: Set<string>,
  errors: string[],
): string {
  const logicalId = documentLogicalId(input);
  if (logicalId === "") {
    errors.push(`${fieldName} missing logicalId`);
    return "";
  }

  if (seenLogicalIds.has(logicalId)) {
    errors.push(`duplicate document logicalId ${logicalId}`);
  } else {
    seenLogicalIds.add(logicalId);
  }
  return logicalId;
}

export function validateDashboardProjectSpec(input: JsonObject): JsonObject {
  const errors: string[] = [];
  const warnings: string[] = [];
  const masters = asObjects(input.masters);
  const pages = asObjects(input.pages);
  const seenLogicalIds = new Set<string>();
  const masterIds = new Set<string>();

  if (pages.length === 0) {
    errors.push("dashboard project spec must include at least one page");
  }

  masters.forEach((master, index) => {
    const fieldName = `masters[${index}]`;
    const logicalId = validateDocumentIdentity(master, fieldName, seenLogicalIds, errors);
    if (logicalId !== "") {
      masterIds.add(logicalId);
    }

    if (master.masterLogicalIds !== undefined) {
      errors.push(`${fieldName} cannot apply another master`);
    }

    const resolved = resolveDocumentSpec(input, master);
    appendDashboardValidation(resolved, fieldName, errors, warnings);
  });

  pages.forEach((page, index) => {
    const fieldName = `pages[${index}]`;
    validateDocumentIdentity(page, fieldName, seenLogicalIds, errors);

    if (page.masterLogicalIds !== undefined && !Array.isArray(page.masterLogicalIds)) {
      errors.push(`${fieldName}.masterLogicalIds must be an array of master logicalIds`);
    }

    const references = masterLogicalIds(page);
    const seenReferences = new Set<string>();
    references.forEach((masterLogicalId) => {
      if (seenReferences.has(masterLogicalId)) {
        errors.push(`${fieldName} has duplicate masterLogicalId ${masterLogicalId}`);
      } else {
        seenReferences.add(masterLogicalId);
      }
      if (!masterIds.has(masterLogicalId)) {
        errors.push(`${fieldName} references unknown masterLogicalId ${masterLogicalId}`);
      }
    });

    const resolved = resolveDocumentSpec(input, page);
    if (hasDashboardContent(resolved)) {
      appendDashboardValidation(resolved, fieldName, errors, warnings);
    } else if (references.length === 0) {
      errors.push(`${fieldName} must include dashboard content or at least one masterLogicalId`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function pageRootProps(
  documentId: string,
  title: string,
  kind: DocumentKind,
  input: JsonObject,
): JsonObject {
  const canvas = canvasSize(input);
  return {
    layerRole: "content",
    docId: documentId,
    globalSetting: {
      screenSize: `${canvas.width}x${canvas.height}`,
      screenWidth: canvas.width,
      screenHeight: canvas.height,
      screenType: "Adaptation",
      mobileScreenSize: "420x932",
      mobileScreenWidth: 420,
      mobileScreenHeight: 932,
    },
    mobileSetting: {
      layout: "auto",
    },
    imageShowType: "noRepeat",
    pageTitle: title,
    pageType: kind,
  };
}

function compileDocument(
  project: JsonObject,
  input: JsonObject,
  kind: DocumentKind,
  suppressRootBackground: boolean,
): CompiledDocument {
  const logicalId = documentLogicalId(input);
  const title = documentTitle(input, kind);
  const documentId = uniqueSchemaId(logicalId, "doc");
  const resolved = resolveDocumentSpec(project, input);
  const children: EditorTreeNode[] = hasDashboardContent(resolved)
    ? [generateDashboardSchema(resolved, { suppressRootBackground })]
    : [];

  return {
    logicalId,
    title,
    document: {
      id: documentId,
      name: title,
      rootNode: {
        id: uniqueSchemaId(`${logicalId}_root`, "root"),
        componentName: "NormalRootPage",
        structVersion: "0.0.0",
        props: pageRootProps(documentId, title, kind, resolved),
        title,
        isHidden: false,
        isLocked: false,
        children,
      },
    },
  };
}

function masterReference(document: CompiledDocument): EditorTreeNode {
  return {
    id: document.document.id,
    componentName: "Master",
    structVersion: "0.0.0",
    props: { layerRole: "content" },
    title: document.title,
    isHidden: false,
    isLocked: false,
  };
}

export function generateDashboardProjectSchema(input: JsonObject): EditorProjectSchema {
  const validation = validateDashboardProjectSpec(input);
  const errors = Array.isArray(validation.errors) ? validation.errors : [];
  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  const masters = asObjects(input.masters).map((master) =>
    compileDocument(input, master, "master", true)
  );
  const masterMap = new Map(masters.map((master) => [master.logicalId, master]));
  const pages = asObjects(input.pages).map((page) => {
    const references = masterLogicalIds(page);
    const compiled = compileDocument(input, page, "page", references.length > 0);
    compiled.document.rootNode.children.push(
      ...references.map((logicalId) => masterReference(masterMap.get(logicalId)!)),
    );
    return compiled;
  });

  return {
    name: projectTitle(input),
    version: "0.0.2",
    structVersion: "0.0.2",
    documents: [
      ...pages.map((page) => page.document),
      ...masters.map((master) => master.document),
    ],
  };
}
