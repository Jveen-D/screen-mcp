import { runBasicChartPromptIntegrationTests } from "./chart-prompt-basic-flow.js";
import { runExtendedChartPromptIntegrationTests } from "./chart-prompt-extended-flow.js";
import { runChartPanelIntegrationTests } from "./chart-panel-integration-flow.js";
import { runMapComponentIntegrationTests } from "./map-component-integration-flow.js";

export function runChartIntegrationTests(): void {
  runChartPanelIntegrationTests();
  runBasicChartPromptIntegrationTests();
  runExtendedChartPromptIntegrationTests();
  runMapComponentIntegrationTests();
}
