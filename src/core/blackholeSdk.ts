import { blackHoleCatalog } from "../data/blackhole/catalog.generated.js";
import type {
  BlackHoleApiDefinition,
} from "../types/blackhole.js";
import type { JsonObject, JsonValue } from "../types/component.js";

const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/u;
const INTEGRATION_ID_PATTERN = /^blackhole-[a-z0-9]+$/u;
const HAN_CHARACTER_PATTERN = /\p{Script=Han}/u;
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

type ElementEffectTarget = "elementValidity" | "elementAppearance" | "elementUv";

type ElementEffectSemantics = {
  effectTarget: ElementEffectTarget;
  summary: string;
  chooseWhen: string;
  avoidWhen: string;
};

const ELEMENT_EFFECT_SEMANTICS: Record<string, ElementEffectSemantics> = {
  "BIM.setElemsValidState": {
    effectTarget: "elementValidity",
    summary:
      "控制整个构件的有效性；false 会隐藏构件，并使后续 SDK 接口不再作用于该构件。",
    chooseWhen:
      "普通构件显示/隐藏且需要同步改变后续 API 参与状态时使用。",
    avoidWhen: "不要用于仅控制构件 UV，或只通过透明度改变外观的需求。",
  },
  "BIM.setElemAttr": {
    effectTarget: "elementAppearance",
    summary:
      "控制构件颜色、透明度、自发光、光泽度和金属质感等外观，构件仍保持有效。",
    chooseWhen:
      "需要改变构件外观时使用；可通过透明度在不改变有效性的情况下实现视觉隐藏。",
    avoidWhen:
      "不要用于需要让构件失效的场景，也不要用于明确的 UV 显隐需求。",
  },
  "BIM.setElemUVVisible": {
    effectTarget: "elementUv",
    summary: "只控制构件 UV 的显示状态，不代表普通的整个构件显示/隐藏。",
    chooseWhen:
      "只有用户明确要求 UV、纹理坐标或 UV 映射表面显隐时才使用。",
    avoidWhen:
      "绝不能替代普通的构件显示/隐藏 API。",
  },
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
  const effectSemantics = ELEMENT_EFFECT_SEMANTICS[api.id];
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
    ...(effectSemantics ? { effectSemantics } : {}),
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
  const aliases: Record<string, string[]> = {
    "点击": ["单击", "鼠标", "探测"],
    "点选": ["选择", "单击", "鼠标", "探测"],
    "拾取": ["鼠标", "探测"],
  };
  for (const term of [...terms]) {
    terms.push(...(aliases[term] ?? []));
  }
  return [...new Set([normalized, ...terms].filter(Boolean))];
}

function searchableText(api: BlackHoleApiDefinition): string {
  const effectSemantics = ELEMENT_EFFECT_SEMANTICS[api.id];
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
    ...(effectSemantics
      ? [
        effectSemantics.effectTarget,
        effectSemantics.summary,
        effectSemantics.chooseWhen,
        effectSemantics.avoidWhen,
      ]
      : []),
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
  const effectSemantics = ELEMENT_EFFECT_SEMANTICS[api.id];
  if (detail === "full") {
    return {
      sdkVersion: blackHoleCatalog.sdkVersion,
      compact: false,
      ...api,
      ...(effectSemantics ? { effectSemantics } : {}),
    } as unknown as JsonObject;
  }
  return {
    sdkVersion: blackHoleCatalog.sdkVersion,
    compact: true,
    ...compactApi(api),
  };
}

function validateElementEffectTarget(
  operation: JsonObject,
  api: BlackHoleApiDefinition,
  fieldName: string,
  errors: string[],
): void {
  const semantics = ELEMENT_EFFECT_SEMANTICS[api.id];
  if (!semantics) {
    if (operation.effectTarget !== undefined) {
      errors.push(
        `${fieldName}.effectTarget is only supported for APIs with declared element-effect semantics`,
      );
    }
    return;
  }

  if (operation.effectTarget !== semantics.effectTarget) {
    errors.push(
      `${fieldName}.effectTarget must be ${semantics.effectTarget} for ${api.id}. ${semantics.summary} ${semantics.avoidWhen}`,
    );
  }
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
    validateElementEffectTarget(rawOperation, api, operationField, errors);

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
    const callbackInput = stringValue(rawHandler.callbackInput);
    if (callbackInput !== "") {
      if (!IDENTIFIER_PATTERN.test(callbackInput)) {
        errors.push(`${fieldName}.callbackInput must be a valid JavaScript identifier`);
      } else if (!inputs.has(callbackInput)) {
        errors.push(`${fieldName}.callbackInput must reference a declared input: ${callbackInput}`);
      }
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
    if ((!Array.isArray(rawHandler.operations) || rawHandler.operations.length === 0) && callbackInput === "") {
      errors.push(`${fieldName} must include operations or callbackInput`);
    }
  });
}

const HOST_EXECUTION_TARGETS = new Set([
  "componentDidMount",
  "componentWillUnMount",
  "componentEvent",
  "manualMethod",
]);
const HOST_CLEANUP_TARGETS = new Set(["componentWillUnMount", "none"]);
const HOST_SELECTION_ROLES = new Set(["eventSource", "outputTarget", "contextTarget", "unused"]);
const HOST_INPUT_SOURCE_TYPES = new Set([
  "state",
  "stateSetter",
  "event",
  "extraParam",
  "customMethod",
  "nodeVisibility",
  "unresolved",
]);

function validateHostInputBindings(
  value: JsonObject,
  inputs: Set<string>,
  executionTarget: string,
  errors: string[],
): void {
  const rawBindings = value.inputBindings;
  if (inputs.size === 0 && rawBindings === undefined) {
    return;
  }
  if (!Array.isArray(rawBindings)) {
    errors.push("hostIntegration.inputBindings must be an array covering every declared input");
    return;
  }

  const boundInputs = new Set<string>();
  rawBindings.forEach((rawBinding, index) => {
    const fieldName = `hostIntegration.inputBindings[${index}]`;
    if (!isJsonObject(rawBinding)) {
      errors.push(`${fieldName} must be an object`);
      return;
    }
    const inputName = stringValue(rawBinding.input);
    if (!inputs.has(inputName)) {
      errors.push(`${fieldName}.input must reference a declared input: ${inputName || "<empty>"}`);
    } else if (boundInputs.has(inputName)) {
      errors.push(`${fieldName}.input is duplicated: ${inputName}`);
    } else {
      boundInputs.add(inputName);
    }

    if (!isJsonObject(rawBinding.source)) {
      errors.push(`${fieldName}.source must be an object`);
      return;
    }
    const source = rawBinding.source;
    const sourceType = stringValue(source.type);
    if (!HOST_INPUT_SOURCE_TYPES.has(sourceType)) {
      errors.push(`${fieldName}.source.type is invalid`);
      return;
    }

    if (sourceType === "state" || sourceType === "stateSetter") {
      const literal = stringValue(source.literal);
      if (!IDENTIFIER_PATTERN.test(literal)) {
        errors.push(`${fieldName}.source.literal must be a valid JavaScript identifier`);
      }
      if (source.createState !== undefined) {
        if (!isJsonObject(source.createState)) {
          errors.push(`${fieldName}.source.createState must be an object`);
        } else if (!("initialValue" in source.createState)) {
          errors.push(`${fieldName}.source.createState.initialValue is required`);
        }
      }
    } else if (sourceType === "event" || sourceType === "extraParam") {
      if (executionTarget !== "componentEvent" && executionTarget !== "manualMethod") {
        errors.push(`${fieldName}.source.type ${sourceType} requires a custom method execution target`);
      }
      if (
        source.path !== undefined &&
        (!Array.isArray(source.path) || source.path.some((segment) => typeof segment !== "string" || segment === ""))
      ) {
        errors.push(`${fieldName}.source.path must be an array of non-empty strings`);
      }
    } else if (sourceType === "customMethod") {
      if (!IDENTIFIER_PATTERN.test(stringValue(source.methodName))) {
        errors.push(`${fieldName}.source.methodName must be a valid JavaScript identifier`);
      }
    } else if (sourceType === "nodeVisibility") {
      if (stringValue(source.nodeId) === "") {
        errors.push(`${fieldName}.source.nodeId is required`);
      }
      if (source.action !== "show" && source.action !== "hide") {
        errors.push(`${fieldName}.source.action must be show or hide`);
      }
    } else if (sourceType === "unresolved" && stringValue(source.reason) === "") {
      errors.push(`${fieldName}.source.reason is required`);
    }
  });

  for (const inputName of inputs) {
    if (!boundInputs.has(inputName)) {
      errors.push(`hostIntegration.inputBindings is missing declared input: ${inputName}`);
    }
  }
}

function validateHostIntegration(
  value: JsonValue | undefined,
  inputs: Set<string>,
  hasEventHandlers: boolean,
  hasCleanupOperations: boolean,
  errors: string[],
): void {
  if (value === undefined) {
    return;
  }
  if (!isJsonObject(value)) {
    errors.push("hostIntegration must be an object");
    return;
  }

  const executionTarget = stringValue(value.executionTarget);
  const cleanupTarget = stringValue(value.cleanupTarget);
  const customMethodName = stringValue(value.customMethodName);
  const chineseComment = stringValue(value.chineseComment);
  const replaceIntegrationId = stringValue(value.replaceIntegrationId);
  const reason = stringValue(value.reason);
  if (!HOST_EXECUTION_TARGETS.has(executionTarget)) {
    errors.push("hostIntegration.executionTarget is invalid");
  }
  if (!HOST_CLEANUP_TARGETS.has(cleanupTarget)) {
    errors.push("hostIntegration.cleanupTarget is invalid");
  }
  if (reason === "") {
    errors.push("hostIntegration.reason is required");
  }
  if (executionTarget === "componentDidMount") {
    if (chineseComment === "" || !HAN_CHARACTER_PATTERN.test(chineseComment)) {
      errors.push("hostIntegration.chineseComment must contain a Chinese explanation for componentDidMount code");
    } else if (/\r|\n|\u2028|\u2029/u.test(chineseComment)) {
      errors.push("hostIntegration.chineseComment must be a single-line comment");
    } else if (chineseComment.length > 100) {
      errors.push("hostIntegration.chineseComment must not exceed 100 characters");
    }
  } else if (value.chineseComment !== undefined) {
    errors.push("hostIntegration.chineseComment is only valid for componentDidMount execution");
  }
  if (replaceIntegrationId !== "") {
    if (executionTarget !== "componentDidMount") {
      errors.push("hostIntegration.replaceIntegrationId is only valid for componentDidMount execution");
    } else if (!INTEGRATION_ID_PATTERN.test(replaceIntegrationId)) {
      errors.push("hostIntegration.replaceIntegrationId must be a valid BlackHole integration id");
    }
  }
  validateHostInputBindings(value, inputs, executionTarget, errors);

  const componentEvent = isJsonObject(value.componentEvent) ? value.componentEvent : undefined;
  if (executionTarget === "componentEvent") {
    if (!componentEvent || stringValue(componentEvent.nodeId) === "" || stringValue(componentEvent.eventName) === "") {
      errors.push("hostIntegration.componentEvent requires nodeId and eventName for componentEvent execution");
    }
    if (!IDENTIFIER_PATTERN.test(customMethodName)) {
      errors.push("hostIntegration.customMethodName must be a valid JavaScript identifier for componentEvent execution");
    }
  } else if (componentEvent) {
    errors.push("hostIntegration.componentEvent is only valid for componentEvent execution");
  }

  if (executionTarget === "manualMethod") {
    if (!IDENTIFIER_PATTERN.test(customMethodName)) {
      errors.push("hostIntegration.customMethodName must be a valid JavaScript identifier for manualMethod execution");
    }
  } else if (executionTarget !== "componentEvent" && customMethodName !== "") {
    errors.push("hostIntegration.customMethodName is only valid for componentEvent or manualMethod execution");
  }

  if ((hasEventHandlers || hasCleanupOperations) && executionTarget === "componentWillUnMount") {
    errors.push(
      "componentWillUnMount execution cannot register handlers or declare cleanup; put teardown calls in operations",
    );
  }
  if (hasCleanupOperations && cleanupTarget !== "componentWillUnMount") {
    errors.push(
      "hostIntegration.cleanupTarget must be componentWillUnMount when the script declares cleanup operations",
    );
  } else if (!hasCleanupOperations && cleanupTarget !== "none") {
    errors.push(
      "hostIntegration.cleanupTarget must be none when the script has no cleanup operations; event handlers are not automatically removed",
    );
  }

  if (value.selectedNodeUsages !== undefined && !Array.isArray(value.selectedNodeUsages)) {
    errors.push("hostIntegration.selectedNodeUsages must be an array");
    return;
  }
  const usedNodeIds = new Set<string>();
  for (const [index, rawUsage] of (value.selectedNodeUsages ?? []).entries()) {
    const fieldName = `hostIntegration.selectedNodeUsages[${index}]`;
    if (!isJsonObject(rawUsage)) {
      errors.push(`${fieldName} must be an object`);
      continue;
    }
    const nodeId = stringValue(rawUsage.nodeId);
    const role = stringValue(rawUsage.role);
    if (nodeId === "") {
      errors.push(`${fieldName}.nodeId is required`);
    } else if (usedNodeIds.has(nodeId)) {
      errors.push(`${fieldName}.nodeId is duplicated: ${nodeId}`);
    } else {
      usedNodeIds.add(nodeId);
    }
    if (!HOST_SELECTION_ROLES.has(role)) {
      errors.push(`${fieldName}.role is invalid`);
    }
    if (stringValue(rawUsage.reason) === "") {
      errors.push(`${fieldName}.reason is required`);
    }
  }

  if (executionTarget === "componentEvent" && componentEvent) {
    const eventNodeId = stringValue(componentEvent.nodeId);
    const eventSource = (value.selectedNodeUsages ?? []).some((rawUsage) =>
      isJsonObject(rawUsage) &&
      stringValue(rawUsage.nodeId) === eventNodeId &&
      stringValue(rawUsage.role) === "eventSource"
    );
    if (!eventSource) {
      errors.push("hostIntegration.componentEvent.nodeId must have an eventSource selected-node usage");
    }
  }
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
  validateHostIntegration(
    input.hostIntegration,
    inputs,
    hasEventHandlers,
    Array.isArray(input.cleanup) && input.cleanup.length > 0,
    errors,
  );

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

function compileHostEngineLookup(context: CompileContext, indentLevel: number): string[] {
  const indent = "  ".repeat(indentLevel);
  return [
    `${indent}const ${context.engineParameter} = window.BlackHole3D;`,
    `${indent}if (!${context.engineParameter}) {`,
    `${indent}  throw new Error("BlackHole3D SDK is not ready");`,
    `${indent}}`,
  ];
}

function compileSetupBody(
  input: JsonObject,
  context: CompileContext,
  usedApis: BlackHoleApiDefinition[],
): string[] {
  const lines: string[] = [];
  const inputs = asObjects(input.inputs).map((item) => stringValue(item.name));
  const topLevelOperations = asObjects(input.operations);
  const cleanupOperations = asObjects(input.cleanup);
  if (inputs.length > 0) {
    lines.push(`  const { ${inputs.join(", ")} } = inputs;`, "");
  }
  asObjects(input.eventHandlers).forEach((handler, index) => {
    const event = resolveBlackHoleApi(stringValue(handler.event), "event");
    const handlerName = stringValue(handler.handlerName) || `onBlackHoleEvent${index + 1}`;
    const callbackInput = stringValue(handler.callbackInput);
    lines.push(`  const ${handlerName} = (event) => {`);
    const operations = asObjects(handler.operations);
    if (operations.length === 0 && callbackInput === "") {
      lines.push("    void event;");
    } else {
      for (const operation of operations) {
        const compiled = compileOperation(operation, context, 2);
        lines.push(compiled.line);
        usedApis.push(compiled.api);
      }
      if (callbackInput !== "") {
        lines.push(
          `    if (typeof ${callbackInput} === "function") {`,
          `      ${callbackInput}(event);`,
          "    }",
        );
      }
    }
    lines.push("  };", `  document.addEventListener(${JSON.stringify(event.name)}, ${handlerName});`, "");
    usedApis.push(event);
  });

  for (const operation of topLevelOperations) {
    const compiled = compileOperation(operation, context, 1);
    lines.push(compiled.line);
    usedApis.push(compiled.api);
  }
  if (topLevelOperations.length > 0) {
    lines.push("");
  }
  lines.push("  return function cleanupBlackHole() {");
  for (const operation of cleanupOperations) {
    const compiled = compileOperation(operation, context, 2);
    lines.push(compiled.line);
    usedApis.push(compiled.api);
  }
  if (cleanupOperations.length === 0) {
    lines.push("    // No SDK cleanup operations were declared by the LLM-authored spec.");
  }
  lines.push("  };");
  return lines;
}

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function canonicalizeJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(canonicalizeJson);
  }
  if (!isJsonObject(value)) {
    return value;
  }
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalizeJson(value[key])]),
  );
}

function semanticInputBindingSource(value: JsonValue | undefined): JsonValue {
  if (!isJsonObject(value)) {
    return {};
  }
  const source = value;
  const createState = isJsonObject(source.createState)
    ? {
      initialValue: source.createState.initialValue,
      ...(typeof source.createState.updateExisting === "boolean"
        ? { updateExisting: source.createState.updateExisting }
        : {}),
    }
    : undefined;
  return {
    ...Object.fromEntries(Object.entries(source).filter(([key]) => key !== "createState" && key !== "reason")),
    ...(createState ? { createState } : {}),
  } as JsonObject;
}

function semanticIntegrationSource(input: JsonObject): JsonValue {
  const integration = isJsonObject(input.hostIntegration) ? input.hostIntegration : {};
  const componentEvent = isJsonObject(integration.componentEvent)
    ? {
      nodeId: integration.componentEvent.nodeId,
      eventName: integration.componentEvent.eventName,
    }
    : undefined;
  return {
    inputs: asObjects(input.inputs).map((item) => ({ name: item.name })),
    operations: input.operations ?? [],
    eventHandlers: asObjects(input.eventHandlers).map((handler) => ({
      event: handler.event,
      ...(handler.callbackInput !== undefined ? { callbackInput: handler.callbackInput } : {}),
      operations: handler.operations ?? [],
    })),
    cleanup: input.cleanup ?? [],
    hostIntegration: {
      executionTarget: integration.executionTarget,
      cleanupTarget: integration.cleanupTarget,
      ...(integration.customMethodName !== undefined
        ? { customMethodName: integration.customMethodName }
        : {}),
      ...(componentEvent ? { componentEvent } : {}),
      inputBindings: asObjects(integration.inputBindings).map((binding) => ({
        input: binding.input,
        source: semanticInputBindingSource(binding.source),
      })),
    },
  };
}

function compileOptionalPath(base: string, value: JsonValue | undefined): string {
  if (!Array.isArray(value) || value.length === 0) {
    return base;
  }
  return (value as string[]).reduce((expression, segment) => {
    return `${expression}?.[${JSON.stringify(segment)}]`;
  }, base);
}

function compileHostInputSource(source: JsonObject): string {
  const sourceType = stringValue(source.type);
  if (sourceType === "state") {
    return `ctx.state[${JSON.stringify(stringValue(source.literal))}]`;
  }
  if (sourceType === "stateSetter") {
    const literal = JSON.stringify(stringValue(source.literal));
    return `(value) => ctx.setState({ [${literal}]: value })`;
  }
  if (sourceType === "event") {
    return compileOptionalPath("event", source.path);
  }
  if (sourceType === "extraParam") {
    return compileOptionalPath("extraParam", source.path);
  }
  if (sourceType === "customMethod") {
    return `(...args) => ctx.methods[${JSON.stringify(stringValue(source.methodName))}](...args)`;
  }
  if (sourceType === "nodeVisibility") {
    const action = source.action === "show" ? "show" : "hide";
    const includeDescendants = typeof source.includeDescendants === "boolean"
      ? source.includeDescendants
      : true;
    return `() => ctx.getNodeById(${JSON.stringify(stringValue(source.nodeId))}).${action}(${includeDescendants})`;
  }
  return "undefined";
}

function compileHostInputBindings(inputBindings: JsonObject[]): string[] {
  return inputBindings.map((binding) => {
    const source = isJsonObject(binding.source) ? binding.source : {};
    return `const ${stringValue(binding.input)} = ${compileHostInputSource(source)};`;
  });
}

function appendSection(lines: string[], section: string[]): void {
  if (section.length === 0) {
    return;
  }
  if (lines.length > 0 && lines[lines.length - 1] !== "") {
    lines.push("");
  }
  lines.push(...section);
}

function compileHostMethodBodies(
  input: JsonObject,
  context: CompileContext,
  inputBindings: JsonObject[],
): { mainCode: string; cleanupCode: string } {
  const mainLines: string[] = [];
  const cleanupLines: string[] = [];
  const hostInputLines = compileHostInputBindings(inputBindings);
  appendSection(mainLines, hostInputLines);

  asObjects(input.eventHandlers).forEach((handler, index) => {
    const event = resolveBlackHoleApi(stringValue(handler.event), "event");
    const handlerName = stringValue(handler.handlerName) || `onBlackHoleEvent${index + 1}`;
    const operations = asObjects(handler.operations);
    const callbackInput = stringValue(handler.callbackInput);
    const handlerLines = [`const ${handlerName} = (event) => {`];
    if (operations.length === 0 && callbackInput === "") {
      handlerLines.push("  void event;");
    } else {
      if (operations.length > 0) {
        handlerLines.push(...compileHostEngineLookup(context, 1));
      }
      for (const operation of operations) {
        handlerLines.push(compileOperation(operation, context, 1).line);
      }
      if (callbackInput !== "") {
        handlerLines.push(
          `  if (typeof ${callbackInput} === "function") {`,
          `    ${callbackInput}(event);`,
          "  }",
        );
      }
    }
    handlerLines.push(
      "};",
      `document.addEventListener(${JSON.stringify(event.name)}, ${handlerName});`,
    );
    appendSection(mainLines, handlerLines);
  });

  const topLevelOperations = asObjects(input.operations);
  if (topLevelOperations.length > 0) {
    const operationLines = [...compileHostEngineLookup(context, 0)];
    for (const operation of topLevelOperations) {
      operationLines.push(compileOperation(operation, context, 0).line);
    }
    appendSection(mainLines, operationLines);
  }

  const cleanupOperations = asObjects(input.cleanup);
  if (cleanupOperations.length > 0) {
    appendSection(cleanupLines, hostInputLines);
    const operationLines = [...compileHostEngineLookup(context, 0)];
    for (const operation of cleanupOperations) {
      operationLines.push(compileOperation(operation, context, 0).line);
    }
    appendSection(cleanupLines, operationLines);
  }

  return {
    mainCode: mainLines.join("\n"),
    cleanupCode: cleanupLines.join("\n"),
  };
}

function compileBlackHoleHostPatch(
  input: JsonObject,
  context: CompileContext,
): JsonObject | undefined {
  if (!isJsonObject(input.hostIntegration)) {
    return undefined;
  }
  const integration = input.hostIntegration;
  const integrationId = `blackhole-${stableHash(JSON.stringify(canonicalizeJson(semanticIntegrationSource(input))))}`;
  const executionTarget = stringValue(integration.executionTarget);
  const cleanupTarget = stringValue(integration.cleanupTarget);
  const customMethodName = stringValue(integration.customMethodName);
  const replaceIntegrationId = stringValue(integration.replaceIntegrationId);
  const inputBindings = asObjects(integration.inputBindings);
  const unresolvedInputs = inputBindings.flatMap((binding) => {
    const source = isJsonObject(binding.source) ? binding.source : undefined;
    return source?.type === "unresolved"
      ? [{ input: binding.input, reason: source.reason }]
      : [];
  });
  const statesByLiteral = new Map<string, JsonObject>();
  inputBindings.forEach((binding) => {
    const source = isJsonObject(binding.source) ? binding.source : undefined;
    const createState = source && isJsonObject(source.createState) ? source.createState : undefined;
    if (!source || !createState) {
      return;
    }
    const literal = stringValue(source.literal);
    const initialValue = createState.initialValue;
    statesByLiteral.set(literal, {
      literal,
      name: stringValue(createState.displayName) || literal,
      defaultValueType: typeof initialValue === "string" ? "string" : "representation",
      defaultValue: typeof initialValue === "string" ? initialValue : JSON.stringify(initialValue),
      ...(typeof createState.updateExisting === "boolean"
        ? { updateExisting: createState.updateExisting }
        : {}),
    });
  });

  const { mainCode, cleanupCode } = compileHostMethodBodies(input, context, inputBindings);
  const decoratedMainCode = executionTarget === "componentDidMount"
    ? `// ${stringValue(integration.chineseComment)}\n${mainCode}`
    : mainCode;

  const mainMethodId = executionTarget === "componentDidMount" || executionTarget === "componentWillUnMount"
    ? executionTarget
    : `screen-mcp-${integrationId}`;
  const mainMethodName = executionTarget === "componentDidMount" || executionTarget === "componentWillUnMount"
    ? executionTarget
    : customMethodName;
  const methods: JsonObject[] = [{
    id: mainMethodId,
    name: mainMethodName,
    param: executionTarget === "componentEvent" || executionTarget === "manualMethod"
      ? "event, extraParam"
      : "",
    target: executionTarget,
    code: decoratedMainCode,
  }];

  if (cleanupTarget === "componentWillUnMount" && executionTarget !== "componentWillUnMount") {
    methods.push({
      id: "componentWillUnMount",
      name: "componentWillUnMount",
      param: "",
      target: "componentWillUnMount",
      code: cleanupCode,
    });
  }

  const componentEvent = isJsonObject(integration.componentEvent)
    ? {
      nodeId: integration.componentEvent.nodeId,
      eventName: integration.componentEvent.eventName,
      methodId: mainMethodId,
    }
    : undefined;
  return {
    integrationId,
    applicable: unresolvedInputs.length === 0,
    unresolvedInputs,
    states: [...statesByLiteral.values()],
    methods,
    ...(replaceIntegrationId ? { replaceIntegrationId } : {}),
    ...(componentEvent ? { componentEvent } : {}),
  };
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
  const context: CompileContext = {
    engineParameter,
  };
  const usedApis: BlackHoleApiDefinition[] = [];
  const setupBody = compileSetupBody(input, context, usedApis);
  const lines = [
    `// Generated for BlackHole Engine WebSDK v${blackHoleCatalog.sdkVersion}.`,
    "// Pass the ready SDK instance and all user-provided runtime values explicitly.",
    `export function ${functionName}(${engineParameter}, inputs = {}) {`,
    ...setupBody,
    "}",
    "",
  ];
  const hostPatch = compileBlackHoleHostPatch(input, context);

  return {
    sdkVersion: blackHoleCatalog.sdkVersion,
    language: "javascript",
    code: lines.join("\n"),
    requiredInputs: asObjects(input.inputs).map((item) => ({
      name: item.name,
      ...(typeof item.description === "string" ? { description: item.description } : {}),
    })),
    usedApis: uniqueApis(usedApis),
    ...(isJsonObject(input.hostIntegration) ? { hostIntegration: input.hostIntegration } : {}),
    ...(hostPatch ? { hostPatch } : {}),
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
