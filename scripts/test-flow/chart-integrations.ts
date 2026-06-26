import { runChartPanelIntegrationTests } from "./chart-panel-integration-flow.js";
import { runMapComponentIntegrationTests } from "./map-component-integration-flow.js";

export function runChartIntegrationTests(): void {
  runChartPanelIntegrationTests();
  runMapComponentIntegrationTests();
}
