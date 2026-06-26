import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { ComponentFlowFixtures } from "./component-flow.js";
import type { DashboardFlowFixtures } from "./dashboard-flow.js";
import { runMcpComponentToolTests } from "./mcp-component-tools-flow.js";
import { runMcpDashboardToolTests } from "./mcp-dashboard-tools-flow.js";
import { runMcpDiagnosticsTests } from "./mcp-diagnostics-flow.js";
import { runMcpDiscoveryTests } from "./mcp-discovery-flow.js";
import { runMcpModuleToolTests } from "./mcp-module-tools-flow.js";
import { runMcpPromptToolTests } from "./mcp-prompt-tools-flow.js";
import type { McpToolContext } from "./mcp-tool-context.js";
import type { ModuleFlowFixtures } from "./module-flow.js";

export interface McpToolTestFixtures {
  componentFixtures: ComponentFlowFixtures;
  moduleFixtures: ModuleFlowFixtures;
  dashboardFixtures: DashboardFlowFixtures;
}

export async function runMcpToolTests({
  componentFixtures,
  moduleFixtures,
  dashboardFixtures,
}: McpToolTestFixtures): Promise<void> {
  const { aiProps, inputFirstSeries, imageProps, textProps, svgProps } = componentFixtures;
  const { chartPanelInput, freeformModuleInput } = moduleFixtures;
  const { dashboardSpec } = dashboardFixtures;

  const nodePath = process.execPath;
  const client = new Client({
    name: "screen-component-mcp-test-client",
    version: "0.1.0",
  });
  const transport = new StdioClientTransport({
    command: nodePath,
    args: ["node_modules/tsx/dist/cli.mjs", "src/server.ts"],
  });

  await client.connect(transport);

  const context: McpToolContext = {
    client,
    aiProps,
    inputFirstSeries,
    imageProps,
    textProps,
    svgProps,
    chartPanelInput,
    freeformModuleInput,
    dashboardSpec,
  };

  try {
    await runMcpDiscoveryTests(context);
    await runMcpDiagnosticsTests(context);
    await runMcpComponentToolTests(context);
    await runMcpModuleToolTests(context);
    await runMcpDashboardToolTests(context);
    await runMcpPromptToolTests(context);
  } finally {
    await client.close();
  }
}
