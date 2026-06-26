import assert from "node:assert/strict";
import { generateModuleSchema } from "../../src/core/modules.js";
import type { JsonObject } from "../../src/types/component.js";
import type { ChartPanelAssistedInput } from "./chart-panel-assisted-direct-flow.js";
import { hasTextWithFragments } from "./helpers.js";

export function runChartPanelAssistedEdgeTests(terseUserPanelInput: ChartPanelAssistedInput): void {
  const mergedSummaryPanel = generateModuleSchema({
    moduleName: "ChartPanel",
    logicalId: "merged_summary_panel",
    parentLogicalId: "root",
    title: "类别摘要",
    dataItems: [
      { name: "类别A", type: "类别", value: 38 },
      { name: "类别B", type: "类别", value: 27 },
      { name: "类别C", type: "类别", value: 19 },
      { name: "类别D", type: "类别", value: 11 },
      { name: "类别E", type: "类别", value: 5 },
    ],
    style: {
      left: 8,
      top: 8,
      width: 631,
      height: 356,
      position: "absolute",
    },
    slots: {
      mainChart: {
        componentName: "PieChart",
        props: {},
      },
      auxiliaryTexts: [
        {
          componentName: "SingleText",
          props: {
            name: "重点摘要",
            textContent:
              "重点摘要 类别A 38 38% 主要构成 类别B 27 27% 继续关注 类别C 19 19% 补充观察",
            style: {
              position: "absolute",
              left: 398,
              top: 112,
              width: 210,
              height: 52,
              fontSize: 14,
              lineHeight: 1,
            },
          },
        },
      ],
    },
  } satisfies JsonObject);
  const mergedSummaryTexts = mergedSummaryPanel.filter(
    (item) => item.componentName === "SingleText",
  );
  const mergedSummaryRawText = mergedSummaryTexts.find(
    (item) =>
      item.props.name === "重点摘要" &&
      typeof item.props.textContent === "string" &&
      item.props.textContent.includes("类别B 27 27%"),
  );
  const mergedSummaryHeader = mergedSummaryTexts.find(
    (item) => item.props.name === "侧边摘要标题",
  );
  const mergedSummaryRows = mergedSummaryTexts.filter(
    (item) =>
      typeof item.props.name === "string" &&
      /^侧边摘要\d+$/.test(item.props.name),
  );
  assert.equal(
    Boolean(mergedSummaryRawText),
    true,
    "manual ChartPanel should preserve explicitly supplied side-summary paragraph text",
  );
  assert.equal(
    mergedSummaryRows.length,
    0,
    "manual ChartPanel should not regenerate independent side summary rows from explicit text",
  );

  const customDecorationPanelInput = {
    ...terseUserPanelInput,
    logicalId: "custom_decoration_status_panel",
    slots: {
      ...terseUserPanelInput.slots,
      decorations: [
        {
          componentName: "SvgDecoration",
          props: {
            name: "右上角科技装饰",
            svgContent:
              '<svg viewBox="0 0 120 64" xmlns="http://www.w3.org/2000/svg"><path d="M4 60V18C4 10.268 10.268 4 18 4h42" fill="none" stroke="#00E5FF" stroke-width="3" stroke-linecap="round"/></svg>',
          },
        },
      ],
    },
  } satisfies JsonObject;
  const customDecorationPanelSchemas = generateModuleSchema(customDecorationPanelInput);
  const customDecorationNames = customDecorationPanelSchemas
    .filter((item) => item.componentName === "SvgDecoration")
    .map((item) => item.props.name);
  assert.ok(customDecorationNames.includes("右上角科技装饰"));
  assert.equal(
    customDecorationNames.includes("侧边摘要容器"),
    false,
    "ChartPanel should not supplement side-card decoration when custom decorations omit it",
  );
  assert.equal(
    customDecorationNames.includes("底部结构线"),
    false,
    "ChartPanel should not supplement bottom structure decoration when custom decorations omit it",
  );

  const statusPanelInput = {
    moduleName: "ChartPanel",
    layoutMode: "assisted",
    logicalId: "status_category_panel",
    parentLogicalId: "root",
    title: "状态分类",
    dataItems: [
      { name: "状态A", type: "状态", value: 12 },
      { name: "状态B", type: "状态", value: 46 },
      { name: "状态C", type: "状态", value: 83 },
    ],
    style: {
      left: 120,
      top: 120,
      width: 840,
      height: 520,
      position: "absolute",
    },
    slots: {
      mainChart: {
        componentName: "PieChart",
        props: {
          option: {
            legend: {
              left: "center",
              top: "bottom",
            },
            series: [
              {
                radius: ["42%", "66%"],
              },
            ],
          },
        },
      },
    },
  } satisfies JsonObject;
  const statusPanelSchemas = generateModuleSchema(statusPanelInput);
  const statusTexts = statusPanelSchemas
    .filter((item) => item.componentName === "SingleText")
    .map((item) => item.props.textContent);
  assert.ok(statusTexts.includes("141"), "status panel should derive total count");
  assert.ok(statusTexts.includes("总数"), "status panel should include a center total label");
  assert.ok(statusTexts.includes("重点摘要"), "status panel should use summary heading");
  assert.ok(
    hasTextWithFragments(statusTexts, ["状态A", "12", "8.5%"]),
    "status panel should derive first status summary data",
  );
  assert.ok(
    hasTextWithFragments(statusTexts, ["状态B", "46", "32.6%"]),
    "status panel should derive second status summary data",
  );
  assert.ok(
    hasTextWithFragments(statusTexts, ["状态C", "83", "58.9%"]),
    "status panel should derive third status summary data",
  );
  assert.ok(
    hasTextWithFragments(statusTexts, ["状态A", "8.5%"]),
    "status panel should derive a conclusion from data",
  );
  const statusSideContainer = statusPanelSchemas.find(
    (item) => item.props.name === "侧边摘要容器",
  );
  const statusSideFirstText = statusPanelSchemas.find(
    (item) => item.props.name === "侧边摘要1",
  );
  const statusSideLastText = statusPanelSchemas.find(
    (item) => item.props.name === "侧边摘要3",
  );
  const statusConclusion = statusPanelSchemas.find(
    (item) => item.props.name === "顶部结论",
  );
  const statusBottomLine = statusPanelSchemas.find(
    (item) => item.props.name === "底部结构线",
  );
  assert.equal(statusSideContainer, undefined, "status panel should not synthesize side summary container");
  assert.ok(statusSideFirstText, "status panel should include first side summary");
  assert.ok(statusSideLastText, "status panel should include last side summary");
  assert.ok(statusConclusion, "status panel should include assisted conclusion");
  assert.equal(statusBottomLine, undefined, "status panel should not synthesize bottom structure line");
  const statusSideFirstStyle = statusSideFirstText.props.style as JsonObject;
  const statusSideLastStyle = statusSideLastText.props.style as JsonObject;
  const statusConclusionStyle = statusConclusion.props.style as JsonObject;
  assert.ok(
    (statusSideFirstStyle.height as number) >= (statusSideFirstStyle.fontSize as number),
    "status side rows should reserve enough text height",
  );
  assert.ok(
    (statusSideLastStyle.top as number) > (statusSideFirstStyle.top as number),
    "status side summaries should keep ordered row positions",
  );
  assert.equal(statusConclusionStyle.lineHeight, 1, "status conclusion should use a single-line text box");

  const sideLegendTextInput = {
    ...terseUserPanelInput,
    logicalId: "side_legend_text_status_panel",
    slots: {
      ...terseUserPanelInput.slots,
      auxiliaryTexts: [
        {
          componentName: "SingleText",
          props: {
            name: "等级图例标题",
            textContent: "等级图例",
          },
        },
      ],
    },
  } satisfies JsonObject;
  const sideLegendTextSchemas = generateModuleSchema(sideLegendTextInput);
  const sideLegendTextContents = sideLegendTextSchemas
    .filter((item) => item.componentName === "SingleText")
    .map((item) => item.props.textContent);
  const sideLegendTextNames = sideLegendTextSchemas.map((item) => item.props.name);
  assert.ok(
    sideLegendTextContents.includes("重点摘要"),
    "explicit side legend wording should be normalized to a summary heading",
  );
  assert.equal(
    [...sideLegendTextContents, ...sideLegendTextNames].some(
      (value) => typeof value === "string" && value.includes("图例"),
    ),
    false,
    "side-card text and names should not use legend wording",
  );
}
