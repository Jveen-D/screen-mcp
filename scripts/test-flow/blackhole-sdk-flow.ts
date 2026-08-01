import assert from "node:assert/strict";
import ts from "typescript";
import {
  generateBlackHoleCode,
  getBlackHoleApiCapability,
  listBlackHoleModules,
  searchBlackHoleSdk,
  validateBlackHoleScriptSpec,
} from "../../src/core/blackholeSdk.js";
import type { JsonObject } from "../../src/types/component.js";

export const blackHoleScriptSpecFixture: JsonObject = {
  sdkVersion: "3.2.0.3808",
  language: "javascript",
  functionName: "setupModelScene",
  inputs: [
    { name: "dataSetList", description: "User-provided model datasets" },
    { name: "dataSetId", description: "User-provided dataset id for cleanup" },
    { name: "onDataSetLoaded", description: "User-provided event callback" },
  ],
  eventHandlers: [
    {
      event: "Event.REDataSetLoadFinish",
      handlerName: "onDataSetLoadFinish",
      callbackInput: "onDataSetLoaded",
    },
  ],
  operations: [
    {
      api: "Model.loadDataSet",
      args: [{ $input: "dataSetList" }],
    },
    {
      api: "BIM.setSelElemsClr",
      args: [
        {
          $constructor: "REColor",
          args: [0, 229, 255, 255],
        },
      ],
    },
  ],
  cleanup: [
    {
      api: "Model.unloadDataSet",
      args: [{ $input: "dataSetId" }],
    },
  ],
  hostIntegration: {
    executionTarget: "componentDidMount",
    cleanupTarget: "componentWillUnMount",
    chineseComment: "页面加载时注册模型事件并初始化场景",
    inputBindings: [
      {
        input: "dataSetList",
        source: {
          type: "state",
          literal: "dataSetList",
          createState: { displayName: "模型数据集", initialValue: [] },
        },
      },
      {
        input: "dataSetId",
        source: {
          type: "state",
          literal: "dataSetId",
          createState: { displayName: "数据集 ID", initialValue: "" },
        },
      },
      {
        input: "onDataSetLoaded",
        source: {
          type: "stateSetter",
          literal: "lastDataSetLoadEvent",
          createState: { displayName: "最近数据集加载事件", initialValue: null },
        },
      },
    ],
    selectedNodeUsages: [
      {
        nodeId: "screen-root",
        role: "unused",
        reason: "The selected editor node is unrelated to the SDK listener",
      },
    ],
    reason: "The SDK listener and scene initialization start with the page",
  },
};

export function runBlackHoleSdkFlowTests(): void {
  const catalog = listBlackHoleModules();
  assert.equal(catalog.sdkVersion, "3.2.0.3808");
  assert.equal(catalog.apiCount, 1004);
  assert.ok(
    Array.isArray(catalog.modules) &&
      (catalog.modules as JsonObject[]).some(
        (module) => module.id === "Model" && module.apiCount === 7,
      ),
    "BlackHole catalog should expose the Model module from the official DOCX",
  );

  const search = searchBlackHoleSdk({ query: "加载模型", module: "Model", limit: 8 });
  assert.ok(
    Array.isArray(search.results) &&
      (search.results as JsonObject[]).some((api) => api.id === "Model.loadDataSet"),
    "Chinese SDK search should find Model.loadDataSet",
  );
  const modelClickSearch = searchBlackHoleSdk({ query: "监听模型点击事件", limit: 8 });
  assert.ok(
    Array.isArray(modelClickSearch.results) &&
      (modelClickSearch.results as JsonObject[]).some((api) => api.id === "Event.RESystemSelElement"),
    "Natural-language model click search should find Event.RESystemSelElement",
  );
  const elementVisibilitySearch = searchBlackHoleSdk({ query: "隐藏构件", limit: 8 });
  assert.equal(
    (elementVisibilitySearch.results as JsonObject[])[0]?.id,
    "BIM.setElemsValidState",
    "ordinary element visibility search should prioritize whole-element validity over UV visibility",
  );

  const compact = getBlackHoleApiCapability("Model.loadDataSet");
  assert.equal(compact.compact, true);
  assert.deepEqual(
    (compact.parameters as JsonObject[]).map((parameter) => parameter.name),
    ["dataSetList", "clearLoaded"],
  );
  const full = getBlackHoleApiCapability("BlackHole3D.Model.loadDataSet", "full");
  assert.equal(full.compact, false);
  assert.ok(
    Array.isArray(full.models) &&
      (full.models as JsonObject[]).some((model) => model.name === "Object"),
    "full API capability should include nested model fields",
  );
  const elementValidityCapability = getBlackHoleApiCapability("BIM.setElemsValidState");
  assert.equal(
    (elementValidityCapability.effectSemantics as JsonObject).effectTarget,
    "elementValidity",
  );
  const elementAppearanceCapability = getBlackHoleApiCapability("BIM.setElemAttr");
  assert.equal(
    (elementAppearanceCapability.effectSemantics as JsonObject).effectTarget,
    "elementAppearance",
  );
  const elementUvCapability = getBlackHoleApiCapability("BIM.setElemUVVisible");
  assert.equal((elementUvCapability.effectSemantics as JsonObject).effectTarget, "elementUv");
  assert.match(
    String((elementUvCapability.effectSemantics as JsonObject).chooseWhen),
    /明确要求 UV/u,
  );
  assert.throws(
    () => getBlackHoleApiCapability("setVisible"),
    /ambiguous BlackHole API/u,
    "bare duplicate API names should require qualified ids",
  );

  const validation = validateBlackHoleScriptSpec(blackHoleScriptSpecFixture);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
  assert.ok(
    Array.isArray(validation.warnings) &&
      validation.warnings.some((warning) =>
        typeof warning === "string" && warning.includes("Model.loadDataSet documents 2")
      ),
    "validator should expose uncertain optional parameter counts as warnings",
  );

  const invalid = validateBlackHoleScriptSpec({
    sdkVersion: "3.2.0.3772",
    operations: [
      { api: "Model.notReal", args: [{ $ref: "missing" }] },
    ],
  });
  assert.equal(invalid.valid, false);
  assert.ok(
    (invalid.errors as string[]).some((error) => error.includes("does not match catalog version")),
  );
  assert.ok(
    (invalid.errors as string[]).some((error) => error.includes("unknown BlackHole API")),
  );
  const invalidReferences = validateBlackHoleScriptSpec({
    inputs: [{ name: "inputs" }],
    operations: [
      { api: "Model.unloadDataSet", args: [{ $ref: "missing" }], assignTo: "result" },
    ],
    eventHandlers: [
      { event: "REDataSetLoadFinish", handlerName: "result", callbackInput: "missingCallback" },
    ],
  });
  assert.equal(invalidReferences.valid, false);
  assert.ok(
    (invalidReferences.errors as string[]).some((error) =>
      error.includes("input name inputs conflicts")
    ),
  );
  assert.ok(
    (invalidReferences.errors as string[]).some((error) =>
      error.includes("unknown or not-yet-defined value missing")
    ),
  );
  assert.ok(
    (invalidReferences.errors as string[]).some((error) =>
      error.includes("handlerName duplicates an existing name: result")
    ),
  );
  assert.ok(
    (invalidReferences.errors as string[]).some((error) =>
      error.includes("callbackInput must reference a declared input: missingCallback")
    ),
  );

  const emptyEventHandler = validateBlackHoleScriptSpec({
    eventHandlers: [
      { event: "Event.REDataSetLoadFinish", handlerName: "handleDataSetLoad" },
    ],
  });
  assert.equal(emptyEventHandler.valid, false);
  assert.ok(
    (emptyEventHandler.errors as string[]).some((error) =>
      error.includes("must include operations or callbackInput")
    ),
  );

  const invalidHostIntegration = validateBlackHoleScriptSpec({
    eventHandlers: [
      {
        event: "Event.REDataSetLoadFinish",
        handlerName: "handleDataSetLoad",
        callbackInput: "onDataSetLoaded",
      },
    ],
    inputs: [{ name: "onDataSetLoaded" }],
    hostIntegration: {
      executionTarget: "componentEvent",
      cleanupTarget: "none",
      componentEvent: { nodeId: "button-1", eventName: "onClick" },
      selectedNodeUsages: [
        { nodeId: "button-1", role: "outputTarget", reason: "Invalid event source" },
      ],
      reason: "Invalid fixture",
    },
  });
  assert.equal(invalidHostIntegration.valid, false);
  assert.ok(
    (invalidHostIntegration.errors as string[]).some((error) =>
      error.includes("customMethodName must be a valid JavaScript identifier")
    ),
  );
  assert.ok(
    (invalidHostIntegration.errors as string[]).some((error) =>
      error.includes("must have an eventSource")
    ),
  );

  const invalidAutomaticEventCleanup = validateBlackHoleScriptSpec({
    eventHandlers: [
      {
        event: "Event.REDataSetLoadFinish",
        operations: [{ api: "Graphics.setViewCubeVisible", args: [false] }],
      },
    ],
    hostIntegration: {
      executionTarget: "componentDidMount",
      cleanupTarget: "componentWillUnMount",
      chineseComment: "页面加载时注册模型完成事件",
      reason: "Invalid automatic event cleanup fixture",
    },
  });
  assert.equal(invalidAutomaticEventCleanup.valid, false);
  assert.ok(
    (invalidAutomaticEventCleanup.errors as string[]).some((error) =>
      error.includes("event handlers are not automatically removed")
    ),
  );

  const invalidInputBindings = validateBlackHoleScriptSpec({
    inputs: [{ name: "dataSetId" }],
    operations: [{ api: "Model.unloadDataSet", args: [{ $input: "dataSetId" }] }],
    hostIntegration: {
      executionTarget: "componentDidMount",
      cleanupTarget: "none",
      chineseComment: "页面加载时卸载指定数据集",
      inputBindings: [],
      reason: "Missing input binding fixture",
    },
  });
  assert.equal(invalidInputBindings.valid, false);
  assert.ok(
    (invalidInputBindings.errors as string[]).some((error) =>
      error.includes("inputBindings is missing declared input: dataSetId")
    ),
  );

  const assignmentValidation = validateBlackHoleScriptSpec({
    operations: [
      { kind: "assign", api: "Engine.m_re_em_window_width", value: 1920 },
    ],
  });
  assert.equal(assignmentValidation.valid, true);

  const missingLifecycleComment = validateBlackHoleScriptSpec({
    operations: [{ api: "Graphics.setViewCubeVisible", args: [false] }],
    hostIntegration: {
      executionTarget: "componentDidMount",
      cleanupTarget: "none",
      reason: "Missing Chinese lifecycle comment fixture",
    },
  });
  assert.equal(missingLifecycleComment.valid, false);
  assert.ok(
    (missingLifecycleComment.errors as string[]).some((error) =>
      error.includes("chineseComment must contain a Chinese explanation")
    ),
  );

  const missingElementEffectTarget = validateBlackHoleScriptSpec({
    operations: [
      { api: "BIM.setElemsValidState", args: ["", [], false] },
    ],
  });
  assert.equal(missingElementEffectTarget.valid, false);
  assert.ok(
    (missingElementEffectTarget.errors as string[]).some((error) =>
      error.includes("effectTarget must be elementValidity")
    ),
  );

  const ordinaryVisibilityUsingUv = validateBlackHoleScriptSpec({
    operations: [
      {
        api: "BIM.setElemUVVisible",
        effectTarget: "elementValidity",
        args: ["", [], false],
      },
    ],
  });
  assert.equal(ordinaryVisibilityUsingUv.valid, false);
  assert.ok(
    (ordinaryVisibilityUsingUv.errors as string[]).some((error) =>
      error.includes("effectTarget must be elementUv") && error.includes("不代表普通")
    ),
  );

  for (const operation of [
    {
      api: "BIM.setElemsValidState",
      effectTarget: "elementValidity",
      args: ["", [], false],
    },
    {
      api: "BIM.setElemAttr",
      effectTarget: "elementAppearance",
      args: [{}],
    },
    {
      api: "BIM.setElemUVVisible",
      effectTarget: "elementUv",
      args: ["", [], false],
    },
  ]) {
    assert.equal(
      validateBlackHoleScriptSpec({ operations: [operation] }).valid,
      true,
      `${operation.api} should accept its matching effectTarget`,
    );
  }

  const generated = generateBlackHoleCode(blackHoleScriptSpecFixture);
  const code = String(generated.code);
  assert.match(code, /export function setupModelScene\(BlackHole3D, inputs = \{\}\)/u);
  assert.match(code, /BlackHole3D\.Model\.loadDataSet\(dataSetList\);/u);
  assert.match(code, /new BlackHole3D\.REColor\(0, 229, 255, 255\)/u);
  assert.match(code, /document\.addEventListener\("REDataSetLoadFinish"/u);
  assert.match(code, /typeof onDataSetLoaded === "function"/u);
  assert.match(code, /onDataSetLoaded\(event\);/u);
  assert.equal(code.includes("document.removeEventListener"), false);
  assert.match(code, /BlackHole3D\.Model\.unloadDataSet\(dataSetId\);/u);
  assert.equal(code.includes("eval("), false, "compiler must not emit eval");
  const syntaxCheck = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(
    syntaxCheck.diagnostics?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error),
    [],
    "generated JavaScript should pass TypeScript syntax parsing",
  );
  assert.ok(
    Array.isArray(generated.usedApis) &&
      (generated.usedApis as JsonObject[]).some((api) => api.id === "Model.loadDataSet"),
    "generated output should cite used SDK APIs",
  );
  assert.deepEqual(generated.hostIntegration, blackHoleScriptSpecFixture.hostIntegration);
  const hostPatch = generated.hostPatch as JsonObject;
  assert.equal(hostPatch.applicable, true);
  assert.match(String(hostPatch.integrationId), /^blackhole-[a-z0-9]+$/u);
  const reorderedGenerated = generateBlackHoleCode({
    hostIntegration: blackHoleScriptSpecFixture.hostIntegration,
    cleanup: blackHoleScriptSpecFixture.cleanup,
    operations: blackHoleScriptSpecFixture.operations,
    eventHandlers: blackHoleScriptSpecFixture.eventHandlers,
    inputs: blackHoleScriptSpecFixture.inputs,
    functionName: blackHoleScriptSpecFixture.functionName,
    language: blackHoleScriptSpecFixture.language,
    sdkVersion: blackHoleScriptSpecFixture.sdkVersion,
  });
  assert.equal(
    (reorderedGenerated.hostPatch as JsonObject).integrationId,
    hostPatch.integrationId,
    "host patch integration id should ignore JSON object key order",
  );
  const semanticallyEquivalentFixture = structuredClone(blackHoleScriptSpecFixture);
  semanticallyEquivalentFixture.hostIntegration = {
    ...(semanticallyEquivalentFixture.hostIntegration as JsonObject),
    chineseComment: "挂载页面后完成模型事件注册和场景初始化",
    reason: "Different explanatory prose must not affect the managed block identity",
    selectedNodeUsages: [
      {
        nodeId: "screen-root",
        role: "unused",
        reason: "Different selected-node prose must not affect the managed block identity",
      },
    ],
  };
  semanticallyEquivalentFixture.eventHandlers = [
    {
      ...(semanticallyEquivalentFixture.eventHandlers as JsonObject[])[0],
      handlerName: "handleLoadedDataSet",
    },
  ];
  ((semanticallyEquivalentFixture.hostIntegration as JsonObject).inputBindings as JsonObject[])[0] = {
    ...((semanticallyEquivalentFixture.hostIntegration as JsonObject).inputBindings as JsonObject[])[0],
    source: {
      ...(((semanticallyEquivalentFixture.hostIntegration as JsonObject).inputBindings as JsonObject[])[0]
        .source as JsonObject),
      createState: {
        displayName: "不同的变量展示名",
        initialValue: [],
      },
    },
  };
  assert.equal(
    (generateBlackHoleCode(semanticallyEquivalentFixture).hostPatch as JsonObject).integrationId,
    hostPatch.integrationId,
    "host patch integration id should depend on executable semantics, not prose or local handler names",
  );

  const changedArgumentFixture = structuredClone(blackHoleScriptSpecFixture);
  (changedArgumentFixture.operations as JsonObject[])[1] = {
    ...(changedArgumentFixture.operations as JsonObject[])[1],
    args: [true],
  };
  assert.notEqual(
    (generateBlackHoleCode(changedArgumentFixture).hostPatch as JsonObject).integrationId,
    hostPatch.integrationId,
    "changing an SDK operation argument must change the integration id",
  );

  const changedEventFixture = structuredClone(blackHoleScriptSpecFixture);
  (changedEventFixture.eventHandlers as JsonObject[])[0] = {
    ...(changedEventFixture.eventHandlers as JsonObject[])[0],
    event: "Event.RESystemSelElement",
  };
  assert.notEqual(
    (generateBlackHoleCode(changedEventFixture).hostPatch as JsonObject).integrationId,
    hostPatch.integrationId,
    "changing the SDK event must change the integration id",
  );

  const replacementFixture = structuredClone(blackHoleScriptSpecFixture);
  replacementFixture.hostIntegration = {
    ...(replacementFixture.hostIntegration as JsonObject),
    replaceIntegrationId: String(hostPatch.integrationId),
  };
  assert.equal(
    (generateBlackHoleCode(replacementFixture).hostPatch as JsonObject).replaceIntegrationId,
    hostPatch.integrationId,
    "host patch should preserve the verified integration id selected for replacement",
  );
  assert.ok(
    Array.isArray(hostPatch.methods) &&
      (hostPatch.methods as JsonObject[]).some((method) =>
        method.id === "componentDidMount" &&
        String(method.code).includes("window.BlackHole3D") &&
        !String(method.code).includes("export function")
      ),
    "host patch should contain a legal componentDidMount method body",
  );
  assert.ok(
    Array.isArray(hostPatch.methods) &&
      (hostPatch.methods as JsonObject[]).some((method) => method.id === "componentWillUnMount"),
    "host patch should route cleanup into componentWillUnMount",
  );
  for (const method of hostPatch.methods as JsonObject[]) {
    const methodCode = String(method.code);
    assert.equal(methodCode.includes("__screenMcpSetup"), false);
    assert.equal(methodCode.includes("__screenMcpPreviousCleanup"), false);
    assert.equal(methodCode.includes("__screenMcpBlackHoleCleanup"), false);
    assert.equal(methodCode.includes("cleanupBlackHole"), false);
  }
  const fixtureUnmountCode = String(
    (hostPatch.methods as JsonObject[]).find((method) => method.id === "componentWillUnMount")?.code,
  );
  assert.equal(fixtureUnmountCode.includes("removeEventListener"), false);
  assert.equal(fixtureUnmountCode.includes("ctx.onDataSetLoadFinish"), false);
  assert.deepEqual(
    (hostPatch.states as JsonObject[]).map((state) => state.literal),
    ["dataSetList", "dataSetId", "lastDataSetLoadEvent"],
  );

  const sdkEventGenerated = generateBlackHoleCode({
    eventHandlers: [
      {
        event: "Event.REDataSetLoadFinish",
        handlerName: "hideViewCubeAfterModelLoad",
        operations: [{ api: "Graphics.setViewCubeVisible", args: [false] }],
      },
    ],
    hostIntegration: {
      executionTarget: "componentDidMount",
      cleanupTarget: "none",
      chineseComment: "模型加载完成后隐藏视图立方体",
      reason: "Listen from page mount and call the SDK only after the model-load event fires",
    },
  });
  const sdkEventMethods = (sdkEventGenerated.hostPatch as JsonObject).methods as JsonObject[];
  const sdkEventMountCode = String(
    sdkEventMethods.find((method) => method.id === "componentDidMount")?.code,
  );
  const activeListeners = new Map<string, (event: unknown) => void>();
  const runtimeDocument = {
    addEventListener(name: string, handler: (event: unknown) => void) {
      activeListeners.set(name, handler);
    },
  };
  const hiddenStates: boolean[] = [];
  const runtimeWindow: {
    BlackHole3D?: { Graphics: { setViewCubeVisible(value: boolean): void } };
  } = {};
  const runtimeCtx: Record<string, unknown> = {};
  const runHostMethod = (methodCode: string) => {
    return new Function("window", "document", "ctx", "event", "extraParam", methodCode)(
      runtimeWindow,
      runtimeDocument,
      runtimeCtx,
      undefined,
      undefined,
    );
  };

  assert.equal(sdkEventMountCode.includes("__screenMcpRegistry"), false);
  assert.equal(sdkEventMountCode.includes("__screenMcpBlackHoleIntegrations"), false);
  assert.equal(sdkEventMountCode.includes("__screenMcpSetup"), false);
  assert.equal(sdkEventMountCode.includes("__screenMcpPreviousCleanup"), false);
  assert.equal(sdkEventMountCode.includes("__screenMcpBlackHoleCleanup"), false);
  assert.equal(sdkEventMountCode.includes("ctx.hideViewCubeAfterModelLoad"), false);
  assert.equal(sdkEventMountCode.includes("removeEventListener"), false);
  assert.match(sdkEventMountCode, /^\/\/ 模型加载完成后隐藏视图立方体$/mu);
  assert.match(sdkEventMountCode, /const hideViewCubeAfterModelLoad = \(event\) =>/u);
  assert.match(
    sdkEventMountCode,
    /document\.addEventListener\("REDataSetLoadFinish", hideViewCubeAfterModelLoad\);/u,
  );
  assert.equal(
    sdkEventMethods.some((method) => method.id === "componentWillUnMount"),
    false,
    "event handlers alone should not generate an unmount method",
  );
  assert.doesNotThrow(
    () => runHostMethod(sdkEventMountCode),
    "page mount should register an SDK event even when BlackHole3D is not ready yet",
  );
  assert.equal(activeListeners.has("REDataSetLoadFinish"), true);

  runtimeWindow.BlackHole3D = {
    Graphics: {
      setViewCubeVisible(value) {
        hiddenStates.push(value);
      },
    },
  };
  activeListeners.get("REDataSetLoadFinish")?.({});
  assert.deepEqual(hiddenStates, [false], "the event handler should resolve and call the ready SDK");
  assert.equal(activeListeners.size, 1);
  assert.deepEqual(Object.keys(runtimeCtx), [], "event registration should not add properties to ctx");

  for (const method of hostPatch.methods as JsonObject[]) {
    const methodSyntaxCheck = ts.transpileModule(
      `function generatedHostMethod(event, extraParam) {\n${String(method.code)}\n}`,
      {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
        reportDiagnostics: true,
      },
    );
    assert.deepEqual(
      methodSyntaxCheck.diagnostics?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error),
      [],
      `host method ${String(method.name)} should pass TypeScript syntax parsing`,
    );
  }

  const componentEventGenerated = generateBlackHoleCode({
    inputs: [{ name: "dataSetId" }],
    operations: [{ api: "Model.unloadDataSet", args: [{ $input: "dataSetId" }] }],
    hostIntegration: {
      executionTarget: "componentEvent",
      cleanupTarget: "none",
      customMethodName: "handleModelClick",
      componentEvent: { nodeId: "button-1", eventName: "onClick" },
      inputBindings: [
        { input: "dataSetId", source: { type: "event", path: ["detail", "dataSetId"] } },
      ],
      selectedNodeUsages: [
        { nodeId: "button-1", role: "eventSource", reason: "The button click supplies the dataset id" },
      ],
      reason: "Run the SDK operation from the selected component event",
    },
  });
  const componentEventPatch = componentEventGenerated.hostPatch as JsonObject;
  assert.equal(componentEventPatch.applicable, true);
  assert.equal((componentEventPatch.componentEvent as JsonObject).nodeId, "button-1");
  assert.match(
    String((componentEventPatch.methods as JsonObject[])[0].code),
    /event\?\.\["detail"\]\?\.\["dataSetId"\]/u,
  );

  const componentEventWithListener = generateBlackHoleCode({
    inputs: [{ name: "onDataSetLoaded" }],
    eventHandlers: [
      {
        event: "Event.REDataSetLoadFinish",
        callbackInput: "onDataSetLoaded",
      },
    ],
    hostIntegration: {
      executionTarget: "componentEvent",
      cleanupTarget: "none",
      customMethodName: "watchDataSetLoad",
      componentEvent: { nodeId: "button-1", eventName: "onClick" },
      inputBindings: [
        { input: "onDataSetLoaded", source: { type: "customMethod", methodName: "recordDataSetLoad" } },
      ],
      selectedNodeUsages: [
        { nodeId: "button-1", role: "eventSource", reason: "The button starts the listener" },
      ],
      reason: "Start the listener from the selected component event",
    },
  });
  assert.equal(
    ((componentEventWithListener.hostPatch as JsonObject).methods as JsonObject[]).some(
      (method) => method.id === "componentWillUnMount"
    ),
    false,
    "component event listeners should not receive an automatic page-unmount cleanup method",
  );

  const unresolvedGenerated = generateBlackHoleCode({
    inputs: [{ name: "dataSetId" }],
    operations: [{ api: "Model.unloadDataSet", args: [{ $input: "dataSetId" }] }],
    hostIntegration: {
      executionTarget: "componentDidMount",
      cleanupTarget: "none",
      chineseComment: "页面加载时卸载指定数据集",
      inputBindings: [
        { input: "dataSetId", source: { type: "unresolved", reason: "The user did not provide a dataset id" } },
      ],
      reason: "The operation belongs to page startup once the input is supplied",
    },
  });
  assert.equal((unresolvedGenerated.hostPatch as JsonObject).applicable, false);
  assert.deepEqual(
    ((unresolvedGenerated.hostPatch as JsonObject).unresolvedInputs as JsonObject[]).map((item) => item.input),
    ["dataSetId"],
  );

  const assignmentCode = String(generateBlackHoleCode({
    operations: [
      { kind: "assign", api: "Engine.m_re_em_window_width", value: 1920 },
    ],
  }).code);
  assert.match(assignmentCode, /BlackHole3D\.m_re_em_window_width = 1920;/u);
}
