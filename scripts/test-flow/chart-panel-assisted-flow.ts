import { runChartPanelAssistedDirectTests } from "./chart-panel-assisted-direct-flow.js";
import { runChartPanelAssistedEdgeTests } from "./chart-panel-assisted-edge-flow.js";

export function runChartPanelAssistedFlowTests(): void {
  const { terseUserPanelInput } = runChartPanelAssistedDirectTests();
  runChartPanelAssistedEdgeTests(terseUserPanelInput);
}
