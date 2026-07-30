import { runChartIntegrationTests } from "./test-flow/chart-integrations.js";
import { runBlackHoleSdkFlowTests } from "./test-flow/blackhole-sdk-flow.js";
import { runComponentFlowTests } from "./test-flow/component-flow.js";
import { runDashboardFlowTests } from "./test-flow/dashboard-flow.js";
import { runMcpToolTests } from "./test-flow/mcp-tools.js";
import { runModuleFlowTests } from "./test-flow/module-flow.js";

const componentFixtures = runComponentFlowTests();
runBlackHoleSdkFlowTests();
const moduleFixtures = runModuleFlowTests();
const dashboardFixtures = runDashboardFlowTests(moduleFixtures);

await runMcpToolTests({
  componentFixtures,
  moduleFixtures,
  dashboardFixtures,
});

runChartIntegrationTests();

console.log("test-flow passed");
