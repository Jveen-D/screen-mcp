import type { EditorGroupNode, JsonObject } from "../types/component.js";

export function generateFullScreenFromPrompt(input: JsonObject): EditorGroupNode {
  const promptValue = input.prompt;
  if (typeof promptValue !== "string" || promptValue.trim() === "") {
    throw new Error("missing required prompt");
  }

  throw new Error(
    "generate_full_screen_from_prompt is disabled for production generation because it creates template-like screens. Ask the LLM to design a complete DashboardSpec first, then call generate_dashboard_schema.",
  );
}
