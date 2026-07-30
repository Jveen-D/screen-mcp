import { blackHoleCatalog } from "../data/blackhole/catalog.generated.js";
import type {
  BlackHoleApiDefinition,
} from "../types/blackhole.js";
import type { JsonObject, JsonValue } from "../types/component.js";

const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/u;
const DEFAULT_SEARCH_LIMIT = 8;
const MAX_SEARCH_LIMIT = 20;

type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

type CompileContext = {
  engineParameter: string;
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

function assertIdentifier(value: string, fieldName: string): void {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`${fieldName} must be a valid JavaScript identifier`);
  }
}

function apiAliases(api: BlackHoleApiDefinition): string[] {
  return [api.id, api.callPath, api.name];
}

function resolveBlackHoleApi(apiId: string, kind?: "api" | "event"): BlackHoleApiDefinition {
  const normalized = apiId.trim().toLowerCase();
  if (normalized === "") {
    throw new Error("missing BlackHole API id");
  }
  const candidates = blackHoleCatalog.apis.filter((api) => {
    return (!kind || api.kind === kind) &&
      apiAliases(api).some((alias) => alias.toLowerCase() === normalized);
  });
  if (candidates.length === 0) {
    throw new Error(`unknown BlackHole API: ${apiId}`);
  }
  if (candidates.length > 1) {
    throw new Error(
      `ambiguous BlackHole API ${apiId}; use a qualified id: ${candidates.map((api) => api.id).join(", ")}`,
    );
  }
  return candidates[0];
}

function compactApi(api: BlackHoleApiDefinition): JsonObject {
  return {
    id: api.id,
    name: api.name,
    namespace: api.namespace,
    module: api.module,
    ...(api.group ? { group: api.group } : {}),
    kind: api.kind,
    callPath: api.callPath,
    description: api.description,
    parameters: api.parameters.map((parameter) => ({
      name: parameter.name,
      description: parameter.description,
      ...(parameter.position ? { position: parameter.position } : {}),
    })),
    modelNames: api.models.map((model) => model.name),
    noteCount: api.notes.length,
    exampleCount: api.examples.length,
    usageForms: api.usageForms,
    source: api.source as unknown as JsonValue,
  };
}

export function listBlackHoleModules(): JsonObject {
  return {
    sdkVersion: blackHoleCatalog.sdkVersion,
    sourceDocument: blackHoleCatalog.sourceDocument,
    sourceSha256: blackHoleCatalog.sourceSha256,
    apiCount: blackHoleCatalog.apiCount,
    modules: blackHoleCatalog.modules as unknown as JsonValue,
  };
}

function queryTerms(query: string): string[] {
  const normalized = query.trim().toLowerCase();
  const terms = normalized.split(/[\s,，。;；:：/\\()[\]{}]+/u).filter(Boolean);
  for (const sequence of normalized.match(/[\p{Script=Han}]{2,}/gu) ?? []) {
    for (let index = 0; index < sequence.length - 1; index += 1) {
      terms.push(sequence.slice(index, index + 2));
    }
  }
  return [...new Set([normalized, ...terms].filter(Boolean))];
}

function searchableText(api: BlackHoleApiDefinition): string {
  return [
    api.id,
    api.callPath,
    api.name,
    api.module,
    api.group ?? "",
    api.description,
    ...api.notes,
    ...api.parameters.flatMap((parameter) => [parameter.name, parameter.description]),
    ...api.models.flatMap((model) => [
      model.name,
      ...model.fields.flatMap((field) => [field.name, field.description]),
    ]),
  ].join(" ").toLowerCase();
}

function searchScore(api: BlackHoleApiDefinition, query: string, terms: string[]): number {
  const normalized = query.toLowerCase();
  const text = searchableText(api);
  let score = 0;
  if (api.id.toLowerCase() === normalized || api.callPath.toLowerCase() === normalized) {
    score += 200;
  } else if (api.name.toLowerCase() === normalized) {
    score += 160;
  }
  if (text.includes(normalized)) {
    score += 80;
  }
  if (terms.some((term) => term.length >= 2 && api.description.toLowerCase().startsWith(term))) {
    score += 25;
  }
  for (const term of terms) {
    if (api.name.toLowerCase().includes(term)) {
      score += 30;
    } else if (api.id.toLowerCase().includes(term)) {
      score += 20;
    } else if (text.includes(term)) {
      score += term.length >= 2 ? 8 : 1;
    }
  }
  return score;
}

export function searchBlackHoleSdk(input: JsonObject): JsonObject {
  const query = stringValue(input.query);
  if (query === "") {
    throw new Error("missing required search query");
  }
  const moduleFilter = stringValue(input.module).toLowerCase();
  const requestedLimit = typeof input.limit === "number" && Number.isFinite(input.limit)
    ? Math.trunc(input.limit)
    : DEFAULT_SEARCH_LIMIT;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_SEARCH_LIMIT);
  const terms = queryTerms(query);
  const results = blackHoleCatalog.apis
    .filter((api) => {
      if (moduleFilter === "") {
        return true;
      }
      return [api.namespace, api.module, api.kind === "event" ? "event" : "engine"]
        .some((value) => value.toLowerCase().includes(moduleFilter));
    })
    .map((api) => ({ api, score: searchScore(api, query, terms) }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.api.id.localeCompare(right.api.id))
    .slice(0, limit);

  return {
    sdkVersion: blackHoleCatalog.sdkVersion,
    query,
    resultCount: results.length,
    results: results.map(({ api, score }) => ({ ...compactApi(api), score })),
  };
}

export function getBlackHoleApiCapability(apiId: string, detail = "compact"): JsonObject {
  const api = resolveBlackHoleApi(apiId);
  if (detail === "full") {
    return {
      sdkVersion: blackHoleCatalog.sdkVersion,
      compact: false,
      ...api,
    } as unknown as JsonObject;
  }
  return {
    sdkVersion: blackHoleCatalog.sdkVersion,
    compact: true,
    ...compactApi(api),
  };
}

function inputNames(input: JsonObject, errors: string[]): Set<string> {
  const result = new Set<string>();
  if (input.inputs === undefined) {
    return result;
  }
  if (!Array.isArray(input.inputs)) {
    errors.push("inputs must be an array");
    return result;
  }
  input.inputs.forEach((rawItem, index) => {
    if (!isJsonObject(rawItem)) {
      errors.push(`inputs[${index}] must be an object`);
      return;
    }
    const item = rawItem;
    const name = stringValue(item.name);
    if (!IDENTIFIER_PATTERN.test(name)) {
      errors.push(`inputs[${index}].name must be a valid JavaScript identifier`);
      return;
    }
    if (result.has(name)) {
      errors.push(`duplicate input name: ${name}`);
      return;
    }
    result.add(name);
  });
  return result;
}

function documentedConstructor(name: string): boolean {
  return blackHoleCatalog.apis.some((api) => {
    return api.models.some((model) => model.name === name) ||
      api.parameters.some((parameter) => parameter.description.includes(name)) ||
      api.notes.some((note) => note.includes(name));
  });
}

function validateValue(
  value: JsonValue,
  fieldName: string,
  allowedReferences: Set<string>,
  inputs: Set<string>,
  errors: string[],
  warnings: string[],
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      validateValue(item, `${fieldName}[${index}]`, allowedReferences, inputs, errors, warnings)
    );
    return;
  }
  if (!isJsonObject(value)) {
    return;
  }

  if ("$input" in value) {
    const name = stringValue(value.$input);
    if (!inputs.has(name)) {
      errors.push(`${fieldName} references unknown input ${name || "<empty>"}`);
    }
    return;
  }
  if ("$ref" in value) {
    const name = stringValue(value.$ref);
    if (!allowedReferences.has(name)) {
      errors.push(`${fieldName} references unknown or not-yet-defined value ${name || "<empty>"}`);
    }
    return;
  }
  if ("$constructor" in value) {
    const name = stringValue(value.$constructor);
    if (!IDENTIFIER_PATTERN.test(name)) {
      errors.push(`${fieldName} has invalid SDK constructor name`);
    } else if (!documentedConstructor(name)) {
      warnings.push(`${fieldName} uses constructor ${name}, which is not described by the SDK catalog`);
    }
    if (!Array.isArray(value.args)) {
      errors.push(`${fieldName} constructor args must be an array`);
    } else {
      value.args.forEach((item, index) =>
        validateValue(item, `${fieldName}.args[${index}]`, allowedReferences, inputs, errors, warnings)
      );
    }
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    validateValue(child, `${fieldName}.${key}`, allowedReferences, inputs, errors, warnings);
  }
}

function apiParameterWarning(
  api: BlackHoleApiDefinition,
  argumentCount: number,
  fieldName: string,
  warnings: string[],
): void {
  if (api.parameters.length === 0 || argumentCount === api.parameters.length) {
    return;
  }
  warnings.push(
    `${fieldName} supplies ${argumentCount} arguments while ${api.id} documents ${api.parameters.length}; verify optional parameters`,
  );
}

function validateOperations(
  value: JsonValue | undefined,
  fieldName: string,
  inputs: Set<string>,
  initialReferences: Set<string>,
  errors: string[],
  warnings: string[],
): Set<string> {
  if (!Array.isArray(value)) {
    errors.push(`${fieldName} must be an array`);
    return new Set(initialReferences);
  }
  const references = new Set(initialReferences);
  value.forEach((rawOperation, index) => {
    const operationField = `${fieldName}[${index}]`;
    if (!isJsonObject(rawOperation)) {
      errors.push(`${operationField} must be an object`);
      return;
    }
    const kind = rawOperation.kind === "assign" ? "assign" : "call";
    const apiId = stringValue(rawOperation.api);
    let api: BlackHoleApiDefinition | undefined;
    try {
      api = resolveBlackHoleApi(apiId, "api");
    } catch (error) {
      errors.push(`${operationField}.api: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }

    if (kind === "assign") {
      if (!api.usageForms.includes("assignment")) {
        errors.push(`${operationField} cannot assign ${api.id}; the SDK document describes it as a call`);
      }
      if (!("value" in rawOperation)) {
        errors.push(`${operationField}.value is required for assignment`);
      } else {
        validateValue(rawOperation.value, `${operationField}.value`, references, inputs, errors, warnings);
      }
    } else {
      const args = Array.isArray(rawOperation.args) ? rawOperation.args : [];
      if (rawOperation.args !== undefined && !Array.isArray(rawOperation.args)) {
        errors.push(`${operationField}.args must be an array`);
      }
      args.forEach((argument, argumentIndex) =>
        validateValue(
          argument,
          `${operationField}.args[${argumentIndex}]`,
          references,
          inputs,
          errors,
          warnings,
        )
      );
      apiParameterWarning(api, args.length, operationField, warnings);
    }

    const assignTo = stringValue(rawOperation.assignTo);
    if (assignTo !== "") {
      if (!IDENTIFIER_PATTERN.test(assignTo)) {
        errors.push(`${operationField}.assignTo must be a valid JavaScript identifier`);
      } else if (references.has(assignTo) || inputs.has(assignTo)) {
        errors.push(`${operationField}.assignTo duplicates an existing value: ${assignTo}`);
      } else if (kind === "assign") {
        errors.push(`${operationField}.assignTo is only valid for call operations`);
      } else {
        references.add(assignTo);
      }
    }
  });
  return references;
}

function validateEventHandlers(
  value: JsonValue | undefined,
  inputs: Set<string>,
  reservedReferences: Set<string>,
  errors: string[],
  warnings: string[],
): void {
  if (value === undefined) {
    return;
  }
  if (!Array.isArray(value)) {
    errors.push("eventHandlers must be an array");
    return;
  }
  const handlerNames = new Set<string>();
  value.forEach((rawHandler, index) => {
    const fieldName = `eventHandlers[${index}]`;
    if (!isJsonObject(rawHandler)) {
      errors.push(`${fieldName} must be an object`);
      return;
    }
    const eventId = stringValue(rawHandler.event);
    try {
      resolveBlackHoleApi(eventId, "event");
    } catch (error) {
      errors.push(`${fieldName}.event: ${error instanceof Error ? error.message : String(error)}`);
    }
    const handlerName = stringValue(rawHandler.handlerName) || `onBlackHoleEvent${index + 1}`;
    if (!IDENTIFIER_PATTERN.test(handlerName)) {
      errors.push(`${fieldName}.handlerName must be a valid JavaScript identifier`);
    } else if (
      handlerNames.has(handlerName) ||
      inputs.has(handlerName) ||
      reservedReferences.has(handlerName)
    ) {
      errors.push(`${fieldName}.handlerName duplicates an existing name: ${handlerName}`);
    } else {
      handlerNames.add(handlerName);
    }
    if (rawHandler.operations !== undefined) {
      validateOperations(
        rawHandler.operations,
        `${fieldName}.operations`,
        inputs,
        new Set(["event"]),
        errors,
        warnings,
      );
    }
  });
}

export function validateBlackHoleScriptSpec(input: JsonObject): JsonObject {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sdkVersion = stringValue(input.sdkVersion);
  if (sdkVersion !== "" && sdkVersion !== blackHoleCatalog.sdkVersion) {
    errors.push(
      `sdkVersion ${sdkVersion} does not match catalog version ${blackHoleCatalog.sdkVersion}`,
    );
  }
  if (input.language !== undefined && input.language !== "javascript") {
    errors.push("language must be javascript in the current compiler");
  }
  const functionName = stringValue(input.functionName) || "setupBlackHole";
  const engineParameter = stringValue(input.engineParameter) || "BlackHole3D";
  if (!IDENTIFIER_PATTERN.test(functionName)) {
    errors.push("functionName must be a valid JavaScript identifier");
  }
  if (!IDENTIFIER_PATTERN.test(engineParameter)) {
    errors.push("engineParameter must be a valid JavaScript identifier");
  }
  const inputs = inputNames(input, errors);
  for (const reservedName of [engineParameter, "inputs"]) {
    if (inputs.has(reservedName)) {
      errors.push(`input name ${reservedName} conflicts with a generated function parameter`);
    }
  }
  const hasOperations = Array.isArray(input.operations) && input.operations.length > 0;
  const hasEventHandlers = Array.isArray(input.eventHandlers) && input.eventHandlers.length > 0;
  if (!hasOperations && !hasEventHandlers) {
    errors.push("BlackHoleScriptSpec must include at least one operation or event handler");
  }
  const references = validateOperations(
    input.operations ?? [],
    "operations",
    inputs,
    new Set([engineParameter, "inputs"]),
    errors,
    warnings,
  );
  validateEventHandlers(input.eventHandlers, inputs, references, errors, warnings);
  if (input.cleanup !== undefined) {
    validateOperations(input.cleanup, "cleanup", inputs, references, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    sdkVersion: blackHoleCatalog.sdkVersion,
    errors,
    warnings: [...new Set(warnings)],
  };
}

function formatObjectKey(key: string): string {
  return IDENTIFIER_PATTERN.test(key) ? key : JSON.stringify(key);
}

function compileValue(value: JsonValue, context: CompileContext, depth = 0): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }
    return `[${value.map((item) => compileValue(item, context, depth + 1)).join(", ")}]`;
  }
  if (!isJsonObject(value)) {
    return JSON.stringify(value);
  }
  if ("$input" in value) {
    return stringValue(value.$input);
  }
  if ("$ref" in value) {
    return stringValue(value.$ref);
  }
  if ("$constructor" in value) {
    const args = Array.isArray(value.args) ? value.args : [];
    return `new ${context.engineParameter}.${stringValue(value.$constructor)}(${args
      .map((item) => compileValue(item, context, depth + 1)).join(", ")})`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) {
    return "{}";
  }
  const indent = "  ".repeat(depth + 2);
  const closingIndent = "  ".repeat(depth + 1);
  return `{\n${entries.map(([key, child]) =>
    `${indent}${formatObjectKey(key)}: ${compileValue(child, context, depth + 1)}`
  ).join(",\n")}\n${closingIndent}}`;
}

function compiledCallPath(api: BlackHoleApiDefinition, engineParameter: string): string {
  return api.callPath.replace(/^BlackHole3D/u, engineParameter);
}

function compileOperation(
  operation: JsonObject,
  context: CompileContext,
  indentLevel: number,
): { line: string; api: BlackHoleApiDefinition } {
  const api = resolveBlackHoleApi(stringValue(operation.api), "api");
  const indent = "  ".repeat(indentLevel);
  if (operation.kind === "assign") {
    return {
      line: `${indent}${compiledCallPath(api, context.engineParameter)} = ${compileValue(operation.value, context)};`,
      api,
    };
  }
  const args = Array.isArray(operation.args) ? operation.args : [];
  const call = `${compiledCallPath(api, context.engineParameter)}(${args
    .map((argument) => compileValue(argument, context)).join(", ")})`;
  const assignTo = stringValue(operation.assignTo);
  return {
    line: assignTo ? `${indent}const ${assignTo} = ${call};` : `${indent}${call};`,
    api,
  };
}

function uniqueApis(apis: BlackHoleApiDefinition[]): JsonObject[] {
  const seen = new Set<string>();
  return apis.flatMap((api) => {
    if (seen.has(api.id)) {
      return [];
    }
    seen.add(api.id);
    return [{
      id: api.id,
      callPath: api.callPath,
      description: api.description,
      source: api.source as unknown as JsonValue,
    }];
  });
}

export function generateBlackHoleCode(input: JsonObject): JsonObject {
  const validation = validateBlackHoleScriptSpec(input) as unknown as ValidationResult;
  if (!validation.valid) {
    throw new Error(validation.errors.join("; "));
  }
  const functionName = stringValue(input.functionName) || "setupBlackHole";
  const engineParameter = stringValue(input.engineParameter) || "BlackHole3D";
  assertIdentifier(functionName, "functionName");
  assertIdentifier(engineParameter, "engineParameter");
  const inputs = asObjects(input.inputs).map((item) => stringValue(item.name));
  const context: CompileContext = {
    engineParameter,
  };
  const lines = [
    `// Generated for BlackHole Engine WebSDK v${blackHoleCatalog.sdkVersion}.`,
    "// Pass the ready SDK instance and all user-provided runtime values explicitly.",
    `export function ${functionName}(${engineParameter}, inputs = {}) {`,
  ];
  if (inputs.length > 0) {
    lines.push(`  const { ${inputs.join(", ")} } = inputs;`, "");
  }

  const usedApis: BlackHoleApiDefinition[] = [];
  const registeredHandlers: Array<{ event: BlackHoleApiDefinition; handlerName: string }> = [];
  asObjects(input.eventHandlers).forEach((handler, index) => {
    const event = resolveBlackHoleApi(stringValue(handler.event), "event");
    const handlerName = stringValue(handler.handlerName) || `onBlackHoleEvent${index + 1}`;
    lines.push(`  const ${handlerName} = (event) => {`);
    const operations = asObjects(handler.operations);
    if (operations.length === 0) {
      lines.push("    void event;");
    } else {
      for (const operation of operations) {
        const compiled = compileOperation(operation, context, 2);
        lines.push(compiled.line);
        usedApis.push(compiled.api);
      }
    }
    lines.push("  };", `  document.addEventListener(${JSON.stringify(event.name)}, ${handlerName});`, "");
    registeredHandlers.push({ event, handlerName });
    usedApis.push(event);
  });

  for (const operation of asObjects(input.operations)) {
    const compiled = compileOperation(operation, context, 1);
    lines.push(compiled.line);
    usedApis.push(compiled.api);
  }
  if (asObjects(input.operations).length > 0) {
    lines.push("");
  }
  lines.push("  return function cleanupBlackHole() {");
  for (const { event, handlerName } of registeredHandlers) {
    lines.push(`    document.removeEventListener(${JSON.stringify(event.name)}, ${handlerName});`);
  }
  for (const operation of asObjects(input.cleanup)) {
    const compiled = compileOperation(operation, context, 2);
    lines.push(compiled.line);
    usedApis.push(compiled.api);
  }
  if (registeredHandlers.length === 0 && asObjects(input.cleanup).length === 0) {
    lines.push("    // No SDK cleanup operations were declared by the LLM-authored spec.");
  }
  lines.push("  };", "}", "");

  return {
    sdkVersion: blackHoleCatalog.sdkVersion,
    language: "javascript",
    code: lines.join("\n"),
    requiredInputs: asObjects(input.inputs).map((item) => ({
      name: item.name,
      ...(typeof item.description === "string" ? { description: item.description } : {}),
    })),
    usedApis: uniqueApis(usedApis),
    warnings: validation.warnings,
    assumptions: [
      `${engineParameter} is a ready BlackHole3D SDK instance compatible with v${blackHoleCatalog.sdkVersion}`,
      "event handlers use the browser document event target described by the SDK document",
    ],
  };
}

export function blackHoleCatalogVersion(): string {
  return blackHoleCatalog.sdkVersion;
}

export function blackHoleApiCount(): number {
  return blackHoleCatalog.apiCount;
}
