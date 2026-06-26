import { runChartPanelAssistedDirectTests } from "./chart-panel-assisted-direct-flow.js";
import { runChartPanelAssistedEdgeTests } from "./chart-panel-assisted-edge-flow.js";
import { runChartPanelPromptEntryTests } from "./chart-panel-prompt-entry-flow.js";
import { runChartPanelPromptTests } from "./chart-panel-prompt-flow.js";

export function runChartPanelAssistedFlowTests(): void {
  const { terseUserPanelInput } = runChartPanelAssistedDirectTests();
  runChartPanelPromptTests();
  runChartPanelAssistedEdgeTests(terseUserPanelInput);
  runChartPanelPromptEntryTests();
}
