import assert from "node:assert/strict";
import { generateScreenModuleFromPrompt } from "../../src/core/promptModule.js";
import type { JsonObject } from "../../src/types/component.js";
import { flattenEditorNodes, hasTextWithFragments, isPercentPair, nodeProps } from "./helpers.js";

export function runChartPanelPromptTests(): void {
  const cleanEnergyPanel = generateScreenModuleFromPrompt({
    prompt: "做个新能源发电结构分析模块，光伏发电48，风力发电31，储能放电14，外购绿电7。偏绿色科技风。",
    style: {
      left: 24,
      top: 30,
      width: 1060,
      height: 600,
    },
  });
  const cleanEnergyNodes = flattenEditorNodes(cleanEnergyPanel as unknown as JsonObject);
  const cleanEnergyChart = cleanEnergyNodes.find(
    (item) => item.componentName === "PieChart",
  );
  assert.ok(cleanEnergyChart, "clean energy prompt should generate a chart");
  const cleanEnergyConclusion = cleanEnergyNodes.find(
    (item) => nodeProps(item).name === "顶部结论",
  );
  const cleanEnergySideSummary1 = cleanEnergyNodes.find(
    (item) => nodeProps(item).name === "侧边摘要1",
  );
  const cleanEnergySideSummary2 = cleanEnergyNodes.find(
    (item) => nodeProps(item).name === "侧边摘要2",
  );
  const cleanEnergySideSummary3 = cleanEnergyNodes.find(
    (item) => nodeProps(item).name === "侧边摘要3",
  );
  const cleanEnergySideMarker1 = cleanEnergyNodes.find(
    (item) => nodeProps(item).name === "侧边摘要色标1",
  );
  assert.equal(
    cleanEnergyNodes.some((item) => nodeProps(item).name === "侧边摘要容器"),
    false,
    "clean energy prompt should not synthesize side summary card decoration",
  );
  assert.equal(
    cleanEnergyNodes.some((item) => nodeProps(item).name === "主图侧卡关联线"),
    false,
    "clean energy prompt should not synthesize side-card connector decoration",
  );
  assert.ok(cleanEnergyConclusion, "clean energy prompt should generate assisted conclusion");
  assert.ok(cleanEnergySideSummary1, "clean energy prompt should generate first side summary");
  assert.ok(cleanEnergySideSummary2, "clean energy prompt should generate second side summary");
  assert.ok(cleanEnergySideSummary3, "clean energy prompt should generate third side summary");
  assert.ok(cleanEnergySideMarker1, "clean energy prompt should keep side summary color anchors");
  const cleanEnergyConclusionProps = nodeProps(cleanEnergyConclusion);
  const cleanEnergySideMarker1Props = nodeProps(cleanEnergySideMarker1);
  const cleanEnergySideSummary1Props = nodeProps(cleanEnergySideSummary1);
  const cleanEnergySideSummary2Props = nodeProps(cleanEnergySideSummary2);
  const cleanEnergySideSummary3Props = nodeProps(cleanEnergySideSummary3);
  const cleanEnergyConclusionStyle = cleanEnergyConclusionProps.style as JsonObject;
  const cleanEnergySideMarker1Style = cleanEnergySideMarker1Props.style as JsonObject;
  const cleanEnergySideSummary1Style = cleanEnergySideSummary1Props.style as JsonObject;
  const cleanEnergySideTexts = [
    cleanEnergySideSummary1Props.textContent,
    cleanEnergySideSummary2Props.textContent,
    cleanEnergySideSummary3Props.textContent,
  ];
  assert.equal(cleanEnergyConclusionStyle.height, 12);
  assert.equal(cleanEnergyConclusionStyle.lineHeight, 1);
  assert.ok(
    hasTextWithFragments(cleanEnergySideTexts, ["光伏发电", "48"]),
    "clean energy side summary should preserve prompt category data",
  );
  assert.ok(
    hasTextWithFragments(cleanEnergySideTexts, ["风力发电", "31"]),
    "clean energy side summary should preserve wind category data",
  );
  assert.ok(
    hasTextWithFragments(cleanEnergySideTexts, ["储能放电", "14"]),
    "clean energy side summary should preserve storage category data",
  );
  assert.ok(
    (cleanEnergySideMarker1Style.left as number) <
      (cleanEnergySideSummary1Style.left as number),
    "side summary color anchor should sit before the matching side summary text",
  );
  const cleanEnergyOption = nodeProps(cleanEnergyChart).option as JsonObject;
  const cleanEnergySeries = cleanEnergyOption.series as JsonObject[];
  const cleanEnergyLabel = cleanEnergySeries[0]?.label as JsonObject;
  assert.equal(
    cleanEnergyLabel.show,
    true,
    "clean energy prompt should keep external pie labels visible but lightweight",
  );
  assert.ok(
    isPercentPair(cleanEnergySeries[0]?.radius),
    "clean energy prompt should keep pie radius percentage based without locking a template value",
  );

  // LineChart prompt test
  const lineChartPromptPanel = generateScreenModuleFromPrompt({
    prompt: "做个季度访问量趋势分析，第一季度访问量120，第二季度访问量200，第三季度访问量150，第四季度访问量280。用折线图展示。",
    style: {
      left: 120,
      top: 120,
      width: 840,
      height: 520,
    },
  });
  assert.equal(lineChartPromptPanel.componentName, "__Group__");
  assert.equal(lineChartPromptPanel.title, "季度访问量趋势分析");
  const lineChartPromptChart = lineChartPromptPanel.children.find(
    (item) => item.componentName === "LineChart",
  );
  assert.ok(lineChartPromptChart, "line chart prompt should generate LineChart child");
  const lineChartPromptProps = lineChartPromptChart.props as JsonObject;
  const lineChartPromptOption = lineChartPromptProps.option as JsonObject;
  assert.equal(lineChartPromptOption.backgroundColor, "transparent");
  const lineChartPromptLegend = lineChartPromptOption.legend as JsonObject;
  assert.equal(lineChartPromptLegend.left, "center");
  assert.equal(lineChartPromptLegend.top, "top");
  assert.equal(lineChartPromptLegend.offsetY, 0);
  const lineChartPromptTooltip = lineChartPromptOption.tooltip as JsonObject;
  assert.equal(lineChartPromptTooltip.trigger, "axis");
  const lineChartPromptXAxis = lineChartPromptOption.xAxis as JsonObject;
  assert.equal(lineChartPromptXAxis.type, "category");
  const lineChartPromptYAxis = lineChartPromptOption.yAxis as JsonObject;
  assert.equal(lineChartPromptYAxis.type, "value");
  const lineChartPromptSeries = lineChartPromptOption.series as JsonObject[];
  assert.equal(lineChartPromptSeries.length, 1);
  const lineChartPromptFirstSeries = lineChartPromptSeries[0] as JsonObject;
  assert.equal(lineChartPromptFirstSeries.type, "line");
  assert.equal(lineChartPromptFirstSeries.smooth, false);
  assert.equal(lineChartPromptFirstSeries.symbol, "emptyCircle");
  assert.equal(lineChartPromptFirstSeries.symbolSize, 0);
  const lineChartPromptChartData = lineChartPromptProps.chartData as JsonObject;
  const lineChartPromptConstant = lineChartPromptChartData.constant as JsonObject;
  assert.deepEqual(lineChartPromptConstant.data, [
    { name: "第一季度访问量", type: "系列", value: 120 },
    { name: "第二季度访问量", type: "系列", value: 200 },
    { name: "第三季度访问量", type: "系列", value: 150 },
    { name: "第四季度访问量", type: "系列", value: 280 },
  ]);
  assert.ok(
    lineChartPromptPanel.children.some(
      (item) => item.componentName === "SingleText" && (item.props.name as string | undefined)?.includes("标题"),
    ),
    "line chart prompt should include title text",
  );

  const redComplaintPanel = generateScreenModuleFromPrompt({
    prompt:
      "做个门店投诉来源分析模块，产品问题38，物流延迟27，服务态度19，价格争议11，其他5，整体用红色科技风，并给我完整schema。",
    style: {
      left: 120,
      top: 120,
      width: 840,
      height: 520,
    },
  });
  const redComplaintNodes = flattenEditorNodes(redComplaintPanel as unknown as JsonObject);
  const redComplaintChart = redComplaintNodes.find(
    (item) => item.componentName === "PieChart",
  );
  const redComplaintChartIndex = redComplaintNodes.findIndex(
    (item) => item.componentName === "PieChart",
  );
  const redComplaintSideSummary1 = redComplaintNodes.find(
    (item) => nodeProps(item).name === "侧边摘要1",
  );
  const redComplaintTotal = redComplaintNodes.find(
    (item) => nodeProps(item).name === "总数",
  );
  const redComplaintTotalIndex = redComplaintNodes.findIndex(
    (item) => nodeProps(item).name === "总数",
  );
  assert.ok(redComplaintChart, "red complaint prompt should generate PieChart");
  assert.equal(
    redComplaintNodes.some((item) => nodeProps(item).name === "侧边摘要容器"),
    false,
    "red complaint prompt should not synthesize side summary card decoration",
  );
  assert.ok(redComplaintSideSummary1, "red complaint prompt should generate side summary text");
  assert.ok(redComplaintTotal, "red complaint prompt should generate center total text");
  const redComplaintChartProps = nodeProps(redComplaintChart);
  const redComplaintChartStyle = redComplaintChartProps.style as JsonObject;
  const redComplaintOption = redComplaintChartProps.option as JsonObject;
  const redComplaintSeries = redComplaintOption.series as JsonObject[];
  const redComplaintFirstSeries = redComplaintSeries[0] as JsonObject;
  const redComplaintSideSummary1Props = nodeProps(redComplaintSideSummary1);
  const redComplaintTotalProps = nodeProps(redComplaintTotal);
  const redComplaintSideSummary1Style = redComplaintSideSummary1Props.style as JsonObject;
  const redComplaintTotalStyle = redComplaintTotalProps.style as JsonObject;
  assert.ok(
    redComplaintTotalIndex < redComplaintChartIndex,
    "center total text should be emitted before PieChart so it stays above the chart layer",
  );
  const redComplaintCenter = redComplaintFirstSeries.center as string[];
  const redComplaintCenterY = Number(redComplaintCenter[1]?.replace(/[^0-9.]/g, "") ?? 50);
  const redComplaintPieCenterX =
    (redComplaintChartStyle.left as number) + (redComplaintChartStyle.width as number) / 2;
  const redComplaintPieCenterY =
    (redComplaintChartStyle.top as number) +
    ((redComplaintChartStyle.height as number) * redComplaintCenterY) / 100;
  assert.ok(
    Math.abs(
      (redComplaintTotalStyle.left as number) +
        (redComplaintTotalStyle.width as number) / 2 -
        redComplaintPieCenterX,
    ) <= 1,
    "red complaint center total should align horizontally with pie center",
  );
  assert.ok(
    Math.abs((redComplaintTotalStyle.top as number) + 26 - redComplaintPieCenterY) <= 1,
    "red complaint center total should align vertically with pie center",
  );
  assert.equal(redComplaintFirstSeries.left, 0);
  assert.equal(redComplaintFirstSeries.top, 0);
  assert.equal(redComplaintFirstSeries.right, 0);
  assert.equal(redComplaintFirstSeries.bottom, 0);
  assert.ok(
    isPercentPair(redComplaintCenter),
    "red complaint prompt should keep pie center percentage based without locking a template value",
  );
  assert.ok(
    isPercentPair(redComplaintFirstSeries.radius),
    "red complaint prompt should keep pie radius percentage based without locking a template value",
  );
  assert.equal((redComplaintFirstSeries.label as JsonObject).show, true);
  assert.equal((redComplaintFirstSeries.label as JsonObject).formatter, "{b}");
  assert.equal(redComplaintSideSummary1Style.height, 14);
  assert.equal(redComplaintSideSummary1Style.fontSize, 14);
  assert.equal(redComplaintSideSummary1Style.lineHeight, 1);
  assert.ok(
    !((redComplaintSideSummary1Props.textContent as string | undefined) ?? "").includes("\n"),
    "red complaint single-line side summary should not use a two-line 52px text box",
  );
}
