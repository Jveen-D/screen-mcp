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
  ],
  eventHandlers: [
    {
      event: "Event.REDataSetLoadFinish",
      handlerName: "onDataSetLoadFinish",
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
      { event: "REDataSetLoadFinish", handlerName: "result" },
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

  const assignmentValidation = validateBlackHoleScriptSpec({
    operations: [
      { kind: "assign", api: "Engine.m_re_em_window_width", value: 1920 },
    ],
  });
  assert.equal(assignmentValidation.valid, true);

  const generated = generateBlackHoleCode(blackHoleScriptSpecFixture);
  const code = String(generated.code);
  assert.match(code, /export function setupModelScene\(BlackHole3D, inputs = \{\}\)/u);
  assert.match(code, /BlackHole3D\.Model\.loadDataSet\(dataSetList\);/u);
  assert.match(code, /new BlackHole3D\.REColor\(0, 229, 255, 255\)/u);
  assert.match(code, /document\.addEventListener\("REDataSetLoadFinish"/u);
  assert.match(code, /document\.removeEventListener\("REDataSetLoadFinish"/u);
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

  const assignmentCode = String(generateBlackHoleCode({
    operations: [
      { kind: "assign", api: "Engine.m_re_em_window_width", value: 1920 },
    ],
  }).code);
  assert.match(assignmentCode, /BlackHole3D\.m_re_em_window_width = 1920;/u);
}
