import assert from "node:assert/strict";
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

  const validationResult = await client.callTool({
    name: "validate_blackhole_script_spec",
    arguments: blackHoleScriptSpecFixture,
  });
  assert.equal(validationResult.isError, undefined);
  const validation = readToolJson(validationResult);
  assert.equal(validation.valid, true);

  const generationResult = await client.callTool({
    name: "generate_blackhole_code",
    arguments: blackHoleScriptSpecFixture,
  });
  assert.equal(generationResult.isError, undefined);
  const generated = readToolJson(generationResult);
  assert.ok(generated.code.includes("BlackHole3D.Model.loadDataSet(dataSetList);"));
  assert.ok(generated.code.includes("cleanupBlackHole"));
}

