import type { JsonObject } from "../../src/types/component.js";
import { runDashboardCompilerTests } from "./dashboard-compiler-flow.js";
import { runDashboardFallbackBackgroundTests } from "./dashboard-fallback-background-flow.js";
import {
  createDashboardProjectSpec,
  runDashboardProjectTests,
} from "./dashboard-project-flow.js";
import { createDashboardSpec } from "./dashboard-spec-fixture.js";
import { runDashboardTitleBackdropTests } from "./dashboard-title-backdrop-flow.js";
import { runDashboardValidationTests } from "./dashboard-validation-flow.js";
import type { ModuleFlowFixtures } from "./module-flow.js";

export interface DashboardFlowFixtures {
  dashboardSpec: JsonObject;
  dashboardProjectSpec: JsonObject;
}

export function runDashboardFlowTests(moduleFixtures: ModuleFlowFixtures): DashboardFlowFixtures {
  const { freeformModuleInput } = moduleFixtures;
  runDashboardTitleBackdropTests();
  const dashboardSpec = createDashboardSpec(freeformModuleInput);
  runDashboardValidationTests(dashboardSpec);
  runDashboardFallbackBackgroundTests();
  runDashboardCompilerTests(dashboardSpec);
  const dashboardProjectSpec = createDashboardProjectSpec();
  runDashboardProjectTests(dashboardProjectSpec);

  return { dashboardSpec, dashboardProjectSpec };
}
