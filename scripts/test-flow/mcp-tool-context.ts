import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { JsonObject } from "../../src/types/component.js";

export interface McpToolContext {
  client: Client;
  aiProps: JsonObject;
  inputFirstSeries: JsonObject;
  imageProps: JsonObject;
  textProps: JsonObject;
  svgProps: JsonObject;
  chartPanelInput: JsonObject;
  freeformModuleInput: JsonObject;
  layoutPlaceholderInput: JsonObject;
  dashboardSpec: JsonObject;
  dashboardProjectSpec: JsonObject;
}
