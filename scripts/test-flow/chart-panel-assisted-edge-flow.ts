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
    title: "门店投诉来源分析",
    dataItems: [
      { name: "产品问题", type: "来源", value: 38 },
      { name: "物流延迟", type: "来源", value: 27 },
      { name: "服务态度", type: "来源", value: 19 },
      { name: "价格争议", type: "来源", value: 11 },
      { name: "其他", type: "来源", value: 5 },
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
              "重点摘要 产品问题 38 38% 主要来源 物流延迟 27 27% 履约关注 服务态度 19 19% 体验短板",
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
      item.props.textContent.includes("物流延迟 27 27%"),
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
    logicalId: "custom_decoration_risk_panel",
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

  const alarmPanelInput = {
    moduleName: "ChartPanel",
    layoutMode: "assisted",
    logicalId: "device_alarm_panel",
    parentLogicalId: "root",
    title: "设备告警分类",
    dataItems: [
      { name: "严重告警", type: "告警", value: 12 },
      { name: "一般告警", type: "告警", value: 46 },
      { name: "提示告警", type: "告警", value: 83 },
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
  const alarmPanelSchemas = generateModuleSchema(alarmPanelInput);
  const alarmTexts = alarmPanelSchemas
    .filter((item) => item.componentName === "SingleText")
    .map((item) => item.props.textContent);
  assert.ok(alarmTexts.includes("141"), "alarm panel should derive total count");
  assert.ok(alarmTexts.includes("总数"), "alarm panel should include a center total label");
  assert.ok(alarmTexts.includes("重点摘要"), "alarm panel should use summary heading");
  assert.ok(
    hasTextWithFragments(alarmTexts, ["严重告警", "12", "8.5%"]),
    "alarm panel should derive severe alarm summary data",
  );
  assert.ok(
    hasTextWithFragments(alarmTexts, ["一般告警", "46", "32.6%"]),
    "alarm panel should derive normal alarm summary data",
  );
  assert.ok(
    hasTextWithFragments(alarmTexts, ["提示告警", "83", "58.9%"]),
    "alarm panel should derive prompt alarm summary data",
  );
  assert.ok(
    hasTextWithFragments(alarmTexts, ["严重告警", "8.5%"]),
    "alarm panel should derive an alarm conclusion from data",
  );
  assert.equal(
    alarmTexts.some((text) => typeof text === "string" && text.includes("风险")),
    false,
    "alarm panel should not leak risk-specific wording",
  );
  const alarmSideContainer = alarmPanelSchemas.find(
    (item) => item.props.name === "侧边摘要容器",
  );
  const alarmSideFirstText = alarmPanelSchemas.find(
    (item) => item.props.name === "侧边摘要1",
  );
  const alarmSideLastText = alarmPanelSchemas.find(
    (item) => item.props.name === "侧边摘要3",
  );
  const alarmConclusion = alarmPanelSchemas.find(
    (item) => item.props.name === "顶部结论",
  );
  const alarmBottomLine = alarmPanelSchemas.find(
    (item) => item.props.name === "底部结构线",
  );
  assert.equal(alarmSideContainer, undefined, "alarm panel should not synthesize side summary container");
  assert.ok(alarmSideFirstText, "alarm panel should include first side summary");
  assert.ok(alarmSideLastText, "alarm panel should include last side summary");
  assert.ok(alarmConclusion, "alarm panel should include assisted conclusion");
  assert.equal(alarmBottomLine, undefined, "alarm panel should not synthesize bottom structure line");
  const alarmSideFirstStyle = alarmSideFirstText.props.style as JsonObject;
  const alarmSideLastStyle = alarmSideLastText.props.style as JsonObject;
  const alarmConclusionStyle = alarmConclusion.props.style as JsonObject;
  assert.ok(
    (alarmSideFirstStyle.height as number) >= (alarmSideFirstStyle.fontSize as number),
    "alarm side rows should reserve enough text height",
  );
  assert.ok(
    (alarmSideLastStyle.top as number) > (alarmSideFirstStyle.top as number),
    "alarm side summaries should keep ordered row positions",
  );
  assert.equal(alarmConclusionStyle.lineHeight, 1, "alarm conclusion should use a single-line text box");

  const sideLegendTextInput = {
    ...terseUserPanelInput,
    logicalId: "side_legend_text_risk_panel",
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
