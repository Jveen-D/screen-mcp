import assert from "node:assert/strict";
import type { JsonObject } from "../../src/types/component.js";
import { flattenEditorNodes, isPercentPair, readToolJson } from "./helpers.js";
import type { McpToolContext } from "./mcp-tool-context.js";

export async function runMcpPromptToolTests({ client }: McpToolContext): Promise<void> {
  const fullScreenPromptResult = await client.callTool({
    name: "generate_full_screen_from_prompt",
    arguments: {
      prompt: "生成一个水电站智慧运行监测大屏",
    },
  });
  assert.equal(fullScreenPromptResult.isError, true);
  assert.ok(Array.isArray(fullScreenPromptResult.content));
  const fullScreenPromptContent = fullScreenPromptResult.content[0];
  const fullScreenPromptText =
    fullScreenPromptContent &&
    typeof fullScreenPromptContent === "object" &&
    "text" in fullScreenPromptContent &&
    typeof fullScreenPromptContent.text === "string"
      ? fullScreenPromptContent.text
      : "";
  assert.ok(
    fullScreenPromptText.includes("disabled") &&
      fullScreenPromptText.includes("DashboardSpec"),
    "full-screen prompt tool should be disabled in favor of DashboardSpec",
  );

  const promptModuleResult = await client.callTool({
    name: "generate_screen_module_from_prompt",
    arguments: {
      prompt: "做个风险等级分析，数据：高风险18，中风险37，低风险71。深色科技风，简洁点。",
      style: {
        left: 120,
        top: 120,
        width: 840,
        height: 520,
      },
    },
  });
  assert.equal(promptModuleResult.isError, undefined);
  const toolPromptModuleTree = readToolJson(promptModuleResult);
  assert.equal(toolPromptModuleTree.componentName, "__Group__");
  assert.equal(toolPromptModuleTree.title, "风险等级分析");
  const toolPromptModuleNodes = flattenEditorNodes(toolPromptModuleTree as JsonObject);
  assert.equal(
    toolPromptModuleNodes.filter(
      (item: JsonObject) => item.componentName === "SvgDecoration",
    ).length,
    3,
  );
  const toolPromptChart = toolPromptModuleNodes.find(
    (item: JsonObject) => item.componentName === "PieChart",
  ) as JsonObject | undefined;
  assert.ok(toolPromptChart, "prompt MCP tool should generate PieChart child");
  const toolPromptChartProps = toolPromptChart.props as JsonObject;
  const toolPromptOption = toolPromptChartProps.option as JsonObject;
  const toolPromptLegend = toolPromptOption.legend as JsonObject;
  assert.equal(toolPromptLegend.icon, "roundRect");
  assert.equal(toolPromptLegend.show, true);
  const toolPromptLegendTextStyle = toolPromptLegend.textStyle as JsonObject;
  assert.equal(toolPromptLegendTextStyle.fontWeight, "normal");
  const toolPromptSeries = toolPromptOption.series as JsonObject[];
  const toolPromptFirstSeries = toolPromptSeries[0] as JsonObject;
  assert.ok(isPercentPair(toolPromptFirstSeries.center), "prompt MCP pie center should stay percentage based");
  assert.ok(isPercentPair(toolPromptFirstSeries.radius), "prompt MCP pie radius should stay percentage based");
  const toolPromptLabel = toolPromptSeries[0]?.label as JsonObject;
  assert.equal(toolPromptLabel.show, true);
  assert.equal(toolPromptLabel.formatter, "{b}");
  assert.equal(toolPromptLabel.fontWeight, "normal");
  const toolPromptChartData = toolPromptChartProps.chartData as JsonObject;
  const toolPromptConstant = toolPromptChartData.constant as JsonObject;
  assert.deepEqual(toolPromptConstant.data, [
    { name: "高风险", type: "风险", value: 18 },
    { name: "中风险", type: "风险", value: 37 },
    { name: "低风险", type: "风险", value: 71 },
  ]);
  const toolPromptTexts = toolPromptModuleNodes
    .filter((item: JsonObject) => item.componentName === "SingleText")
    .map((item: JsonObject) => (item.props as JsonObject).textContent);
  assert.equal(
    toolPromptTexts.some(
      (text: unknown) => typeof text === "string" && text.includes("图例"),
    ),
    false,
    "prompt MCP tool should not call side summary a legend",
  );

  // 3D prompt test
  const prompt3DResult = await client.callTool({
    name: "generate_screen_module_from_prompt",
    arguments: {
      prompt: "做一个3D风险等级分析，数据：高风险18，中风险37，低风险71。",
      style: {
        left: 120,
        top: 120,
        width: 840,
        height: 520,
      },
    },
  });
  assert.equal(prompt3DResult.isError, undefined);
  const toolPrompt3DTree = readToolJson(prompt3DResult);
  assert.equal(toolPrompt3DTree.componentName, "__Group__");
  assert.equal(toolPrompt3DTree.title, "风险等级分析");
  const toolPrompt3DNodes = flattenEditorNodes(toolPrompt3DTree as JsonObject);
  const toolPrompt3DChart = toolPrompt3DNodes.find(
    (item: JsonObject) => item.componentName === "ThreeDPieChart",
  ) as JsonObject | undefined;
  assert.ok(toolPrompt3DChart, "3D prompt should generate ThreeDPieChart child");
  const toolPrompt3DOption = (toolPrompt3DChart.props as JsonObject).option as JsonObject;
  assert.ok(
    toolPrompt3DOption.threeDSettings !== null && typeof toolPrompt3DOption.threeDSettings === "object" && !Array.isArray(toolPrompt3DOption.threeDSettings),
    "3D prompt chart should have threeDSettings",
  );
  assert.equal(
    toolPrompt3DNodes.filter((item: JsonObject) => item.componentName === "SvgDecoration").length,
    3,
    "3D prompt panel should include assisted side summary color anchors",
  );
  const toolPrompt3DTexts = toolPrompt3DNodes
    .filter((item: JsonObject) => item.componentName === "SingleText")
    .map((item: JsonObject) => (item.props as JsonObject).textContent);
  assert.equal(
    toolPrompt3DTexts.some(
      (text: unknown) => typeof text === "string" && text.includes("图例"),
    ),
    false,
    "3D prompt should not call side summary a legend",
  );

  // LineChart prompt test via MCP tool
  const promptLineResult = await client.callTool({
    name: "generate_screen_module_from_prompt",
    arguments: {
      prompt: "做一个季度访问量趋势分析，第一季度访问量120，第二季度访问量200，第三季度访问量150，第四季度访问量280。用折线图展示。",
      style: {
        left: 120,
        top: 120,
        width: 840,
        height: 520,
      },
    },
  });
  assert.equal(promptLineResult.isError, undefined);
  const toolPromptLineTree = readToolJson(promptLineResult);
  assert.equal(toolPromptLineTree.componentName, "__Group__");
  assert.equal(toolPromptLineTree.title, "季度访问量趋势分析");
  const toolPromptLineNodes = flattenEditorNodes(toolPromptLineTree as JsonObject);
  const toolPromptLineChart = toolPromptLineNodes.find(
    (item: JsonObject) => item.componentName === "LineChart",
  ) as JsonObject | undefined;
  assert.ok(toolPromptLineChart, "line chart prompt MCP tool should generate LineChart child");
  const toolPromptLineChartProps = toolPromptLineChart.props as JsonObject;
  const toolPromptLineOption = toolPromptLineChartProps.option as JsonObject;
  assert.equal(toolPromptLineOption.backgroundColor, "transparent");
  const toolPromptLineLegend = toolPromptLineOption.legend as JsonObject;
  assert.equal(toolPromptLineLegend.left, "center");
  assert.equal(toolPromptLineLegend.top, "top");
  assert.equal(toolPromptLineLegend.offsetY, 0);
  const toolPromptLineTooltip = toolPromptLineOption.tooltip as JsonObject;
  assert.equal(toolPromptLineTooltip.trigger, "axis");
  const toolPromptLineXAxis = toolPromptLineOption.xAxis as JsonObject;
  assert.equal(toolPromptLineXAxis.type, "category");
  const toolPromptLineYAxis = toolPromptLineOption.yAxis as JsonObject;
  assert.equal(toolPromptLineYAxis.type, "value");
  const toolPromptLineSeries = toolPromptLineOption.series as JsonObject[];
  assert.equal(toolPromptLineSeries.length, 1);
  const toolPromptLineFirstSeries = toolPromptLineSeries[0] as JsonObject;
  assert.equal(toolPromptLineFirstSeries.type, "line");
  assert.equal(toolPromptLineFirstSeries.smooth, false);
  assert.equal(toolPromptLineFirstSeries.symbol, "emptyCircle");
  assert.equal(toolPromptLineFirstSeries.symbolSize, 0);
  const toolPromptLineChartData = toolPromptLineChartProps.chartData as JsonObject;
  const toolPromptLineConstant = toolPromptLineChartData.constant as JsonObject;
  assert.deepEqual(toolPromptLineConstant.data, [
    { name: "第一季度访问量", type: "系列", value: 120 },
    { name: "第二季度访问量", type: "系列", value: 200 },
    { name: "第三季度访问量", type: "系列", value: 150 },
    { name: "第四季度访问量", type: "系列", value: 280 },
  ]);
  assert.ok(
    toolPromptLineNodes.some(
      (item: JsonObject) => item.componentName === "SingleText" && ((item.props as JsonObject).name as string | undefined)?.includes("标题"),
    ),
    "line chart prompt MCP tool should include title text",
  );
}
