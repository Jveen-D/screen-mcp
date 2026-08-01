import assert from "node:assert/strict";
import type { JsonObject } from "../../src/types/component.js";
import { blackHoleScriptSpecFixture } from "./blackhole-sdk-flow.js";
import { readToolJson } from "./helpers.js";
import type { McpToolContext } from "./mcp-tool-context.js";

export async function runMcpBlackHoleToolTests({ client }: McpToolContext): Promise<void> {
  const modulesResult = await client.callTool({
    name: "list_blackhole_sdk_modules",
    arguments: {},
  });
  assert.equal(modulesResult.isError, undefined);
  const modules = readToolJson(modulesResult);
  assert.equal(modules.sdkVersion, "3.2.0.3808");

  const searchResult = await client.callTool({
    name: "search_blackhole_sdk",
    arguments: { query: "loadDataSet", module: "Model" },
  });
  assert.equal(searchResult.isError, undefined);
  const search = readToolJson(searchResult);
  assert.equal(search.results[0].id, "Model.loadDataSet");

  const capabilityResult = await client.callTool({
    name: "get_blackhole_api_capability",
    arguments: { apiId: "Model.loadDataSet", detail: "full" },
  });
  assert.equal(capabilityResult.isError, undefined);
  const capability = readToolJson(capabilityResult);
  assert.equal(capability.description, "加载一个或多个模型资源");
  assert.ok(capability.examples.length > 0);

  const elementUvCapabilityResult = await client.callTool({
    name: "get_blackhole_api_capability",
    arguments: { apiId: "BIM.setElemUVVisible" },
  });
  assert.equal(elementUvCapabilityResult.isError, undefined);
  const elementUvCapability = readToolJson(elementUvCapabilityResult);
  assert.equal(elementUvCapability.effectSemantics.effectTarget, "elementUv");

  const validationResult = await client.callTool({
    name: "validate_blackhole_script_spec",
    arguments: blackHoleScriptSpecFixture,
  });
  assert.equal(validationResult.isError, undefined);
  const validation = readToolJson(validationResult);
  assert.equal(validation.valid, true);

  const invalidElementEffectResult = await client.callTool({
    name: "validate_blackhole_script_spec",
    arguments: {
      operations: [
        {
          api: "BIM.setElemUVVisible",
          effectTarget: "elementValidity",
          args: ["", [], false],
        },
      ],
    },
  });
  assert.equal(invalidElementEffectResult.isError, undefined);
  const invalidElementEffect = readToolJson(invalidElementEffectResult);
  assert.equal(invalidElementEffect.valid, false);
  assert.ok(
    invalidElementEffect.errors.some((error: string) =>
      error.includes("effectTarget must be elementUv")
    ),
  );

  const missingReasonSpec = structuredClone(blackHoleScriptSpecFixture);
  delete (missingReasonSpec.hostIntegration as JsonObject).reason;
  const missingReasonResult = await client.callTool({
    name: "validate_blackhole_script_spec",
    arguments: missingReasonSpec,
  });
  assert.equal(
    missingReasonResult.isError,
    undefined,
    "semantic validation errors should not be rejected as MCP -32602 input errors",
  );
  const missingReasonValidation = readToolJson(missingReasonResult);
  assert.equal(missingReasonValidation.valid, false);
  assert.ok(missingReasonValidation.errors.includes("hostIntegration.reason is required"));

  const generationResult = await client.callTool({
    name: "generate_blackhole_code",
    arguments: blackHoleScriptSpecFixture,
  });
  assert.equal(generationResult.isError, undefined);
  const generated = readToolJson(generationResult);
  assert.ok(generated.code.includes("BlackHole3D.Model.loadDataSet(dataSetList);"));
  assert.ok(generated.code.includes("cleanupBlackHole"));
  assert.ok(
    generated.hostPatch.methods.some((method: JsonObject) =>
      method.id === "componentDidMount" &&
      String(method.code).startsWith("// 页面加载时注册模型事件并初始化场景\n") &&
      String(method.code).includes("const onDataSetLoadFinish = (event) =>")
    ),
  );
  assert.ok(generated.hostPatch.methods.every((method: JsonObject) =>
    !String(method.code).includes("__screenMcpSetup") &&
    !String(method.code).includes("__screenMcpPreviousCleanup") &&
    !String(method.code).includes("__screenMcpBlackHoleCleanup") &&
    !String(method.code).includes("ctx.onDataSetLoadFinish") &&
    !String(method.code).includes("removeEventListener")
  ));
}
