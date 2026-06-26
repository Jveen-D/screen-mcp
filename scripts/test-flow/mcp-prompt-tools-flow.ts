import assert from "node:assert/strict";
import type { McpToolContext } from "./mcp-tool-context.js";

export async function runMcpPromptToolTests({ client }: McpToolContext): Promise<void> {
  const fullScreenPromptResult = await client.callTool({
    name: "generate_full_screen_from_prompt",
    arguments: {
      prompt: "生成一个监控大屏",
    },
  });
  assert.equal(fullScreenPromptResult.isError, true);
  assert.ok(Array.isArray(fullScreenPromptResult.content));
  const fullScreenPromptContent = fullScreenPromptResult.content[0];
  const fullScreenPromptText =
    fullScreenPromptContent &&
    typeof fullScreenPromptContent === "object" &&
    "text" in fullScreenPromptContent &&
    typeof fullScreenPromptContent.text === "string"
      ? fullScreenPromptContent.text
      : "";
  assert.ok(
    fullScreenPromptText.includes("disabled") &&
      fullScreenPromptText.includes("DashboardSpec"),
    "full-screen prompt tool should be disabled in favor of DashboardSpec",
  );

}
