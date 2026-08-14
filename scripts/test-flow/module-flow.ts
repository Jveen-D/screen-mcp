
import type { JsonObject } from "../../src/types/component.js";
import { runChartPanelAssistedFlowTests } from "./chart-panel-assisted-flow.js";
import { runChartPanelFlowTests } from "./chart-panel-flow.js";
import { runFreeformModuleFlowTests } from "./freeform-flow.js";
import { runLayoutPlaceholderFlowTests } from "./layout-placeholder-flow.js";
import { runModuleCapabilityTests } from "./module-capabilities.js";
import { runModuleTreeFlowTests } from "./module-tree-flow.js";

export interface ModuleFlowFixtures {
  chartPanelInput: JsonObject;
  freeformModuleInput: JsonObject;
  layoutPlaceholderInput: JsonObject;
}

export function runModuleFlowTests(): ModuleFlowFixtures {
  runModuleCapabilityTests();
  const { chartPanelInput } = runChartPanelFlowTests();
  runChartPanelAssistedFlowTests();
  runModuleTreeFlowTests(chartPanelInput);
  const { freeformModuleInput } = runFreeformModuleFlowTests();
  const { layoutPlaceholderInput } = runLayoutPlaceholderFlowTests();

  return { chartPanelInput, freeformModuleInput, layoutPlaceholderInput };
}
