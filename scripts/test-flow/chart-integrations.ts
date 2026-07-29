import { runCartesianChartContractFlowTests } from "./cartesian-chart-contract-flow.js";
import { runChartPanelIntegrationTests } from "./chart-panel-integration-flow.js";
import { runMapComponentIntegrationTests } from "./map-component-integration-flow.js";
import { runRingComponentFlowTests } from "./ring-component-flow.js";

export function runChartIntegrationTests(): void {
  runCartesianChartContractFlowTests();
  runChartPanelIntegrationTests();
  runMapComponentIntegrationTests();
  runRingComponentFlowTests();
}
