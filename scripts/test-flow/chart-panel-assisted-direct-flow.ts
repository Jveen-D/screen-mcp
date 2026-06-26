import assert from "node:assert/strict";
import { generateModuleSchema } from "../../src/core/modules.js";
import type { JsonObject } from "../../src/types/component.js";
import { hasTextWithFragments, isPercentPair } from "./helpers.js";

export type ChartPanelAssistedInput = JsonObject & { slots: JsonObject };

export interface ChartPanelAssistedDirectFixtures {
  terseUserPanelInput: ChartPanelAssistedInput;
}

export function runChartPanelAssistedDirectTests(): ChartPanelAssistedDirectFixtures {
  const terseUserPanelInput = {
    moduleName: "ChartPanel",
    layoutMode: "assisted",
    logicalId: "terse_risk_level_panel",
    parentLogicalId: "root",
    title: "风险等级分析",
    dataItems: [
      { name: "高风险", type: "风险", value: 18 },
      { name: "中风险", type: "风险", value: 37 },
      { name: "低风险", type: "风险", value: 71 },
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
  } satisfies ChartPanelAssistedInput;
  const terseUserPanelSchemas = generateModuleSchema(terseUserPanelInput);
  const terseComponentNames = terseUserPanelSchemas.map((item) => item.componentName);
  assert.equal(terseUserPanelSchemas.at(-1)?.componentName, "PieChart");
  assert.equal(
    terseComponentNames.filter((componentName) => componentName === "SvgDecoration").length,
    3,
    "assisted layout should keep generated color anchors but not synthesize structural decoration templates",
  );
  assert.ok(
    terseComponentNames.filter((componentName) => componentName === "SingleText").length >= 7,
    "assisted layout should still include title, center summary, side summaries, and conclusion",
  );
  const terseDecorations = terseUserPanelSchemas.filter(
    (item) => item.componentName === "SvgDecoration",
  );
  assert.equal(
    terseDecorations.filter((item) =>
      typeof item.props.name === "string" && item.props.name.startsWith("侧边摘要色标"),
    ).length,
    3,
    "assisted layout should include side summary color anchors",
  );
  assert.equal(
    terseDecorations.some((item) => item.props.name === "侧边摘要容器"),
    false,
    "assisted layout should not synthesize side summary container decoration",
  );
  assert.equal(
    terseDecorations.some((item) => item.props.name === "底部结构线"),
    false,
    "assisted layout should not synthesize bottom structure decoration",
  );
  const terseChart = terseUserPanelSchemas.find(
    (item) => item.componentName === "PieChart",
  );
  assert.ok(terseChart, "terse input should include a real PieChart");
  const terseChartData = terseChart.props.chartData as JsonObject;
  const terseChartConstant = terseChartData.constant as JsonObject;
  assert.deepEqual(terseChartConstant.data, [
    { name: "高风险", type: "风险", value: 18 },
    { name: "中风险", type: "风险", value: 37 },
    { name: "低风险", type: "风险", value: 71 },
  ]);
  const terseTexts = terseUserPanelSchemas
    .filter((item) => item.componentName === "SingleText")
    .map((item) => item.props.textContent);
  assert.ok(terseTexts.includes("126"), "terse input should derive center total text");
  const terseSideSummary1 = terseUserPanelSchemas.find(
    (item) => item.props.name === "侧边摘要1",
  );
  const terseSideSummary2 = terseUserPanelSchemas.find(
    (item) => item.props.name === "侧边摘要2",
  );
  assert.ok(terseSideSummary1, "terse input should include first side summary text");
  assert.ok(terseSideSummary2, "terse input should include second side summary text");
  const terseSideSummary1Style = terseSideSummary1.props.style as JsonObject;
  assert.equal(terseSideSummary1Style.height, 14);
  assert.equal(terseSideSummary1Style.lineHeight, 1);
  assert.ok(
    hasTextWithFragments(terseTexts, ["高风险", "18", "14.3%"]),
    "terse input should derive side summary data from dataItems",
  );
  assert.ok(
    hasTextWithFragments(terseTexts, ["高风险", "14.3%"]),
    "terse input should derive a real conclusion from risk data",
  );
  assert.equal(
    terseTexts.some((text) => typeof text === "string" && text.includes("图例")),
    false,
    "terse input should not call side summary a legend",
  );
  const terseChartOption = terseChart.props.option as JsonObject;
  const terseChartLegend = terseChartOption.legend as JsonObject;
  const terseChartSeries = terseChartOption.series as JsonObject[];
  const terseChartLabel = terseChartSeries[0]?.label as JsonObject;
  assert.equal(terseChartLegend.show, true);
  assert.equal(terseChartLegend.icon, "roundRect");
  assert.equal(terseChartLegend.backgroundColor, "rgba(0, 229, 255, 0.055)");
  const terseChartLegendTextStyle = terseChartLegend.textStyle as JsonObject;
  assert.equal(terseChartLegendTextStyle.fontWeight, "normal");
  assert.equal(terseChartLabel.show, true);
  assert.equal(terseChartLabel.formatter, "{b}");
  assert.equal(terseChartLabel.fontWeight, "normal");
  const terseConclusion = terseUserPanelSchemas.find(
    (item) => item.props.name === "顶部结论",
  );
  assert.ok(terseConclusion, "terse input should include assisted conclusion text");
  const terseConclusionStyle = terseConclusion.props.style as JsonObject;
  assert.equal(terseConclusionStyle.height, 12);
  assert.equal(terseConclusionStyle.fontSize, 12);
  assert.equal(terseConclusionStyle.lineHeight, 1);
  assert.equal(
    terseConclusionStyle.color,
    "#DFF8FF",
    "conclusion should use normal text color instead of full-line accent highlight",
  );
  const terseCenterValue = terseUserPanelSchemas.find(
    (item) => item.componentName === "SingleText" && item.props.textContent === "126",
  );
  const terseChartIndex = terseUserPanelSchemas.findIndex(
    (item) => item.componentName === "PieChart",
  );
  const terseCenterValueIndex = terseUserPanelSchemas.findIndex(
    (item) => item.componentName === "SingleText" && item.props.textContent === "126",
  );
  const terseCenterLabel = terseUserPanelSchemas.find(
    (item) => item.props.name === "中心指标说明",
  );
  assert.ok(terseCenterValue, "terse input should include center total value");
  assert.ok(terseCenterLabel, "terse input should include center total label");
  assert.ok(
    terseCenterValueIndex < terseChartIndex,
    "terse center total should be emitted before PieChart",
  );
  const terseCenterValueStyle = terseCenterValue.props.style as JsonObject;
  const terseCenterLabelStyle = terseCenterLabel.props.style as JsonObject;
  assert.ok(
    (terseCenterValueStyle.top as number) + (terseCenterValueStyle.height as number) + 8 <=
      (terseCenterLabelStyle.top as number),
    "center total label should not stick to the center number",
  );
  assert.equal(
    terseUserPanelSchemas.some((item) => item.businessElementId.includes("background")),
    false,
    "assisted layout should not synthesize default backgrounds",
  );
  assert.deepEqual(terseChart.props.entryAnimiation, {
    isShow: true,
    type: "animate__zoomIn",
  });

  const customerSourcePanelInput = {
    moduleName: "ChartPanel",
    layoutMode: "assisted",
    logicalId: "customer_source_panel",
    parentLogicalId: "root",
    title: "客户来源分析",
    dataItems: [
      { name: "线上广告", type: "来源", value: 86 },
      { name: "老客户推荐", type: "来源", value: 54 },
      { name: "门店自然到访", type: "来源", value: 37 },
      { name: "活动引流", type: "来源", value: 23 },
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
  const customerSourceSchemas = generateModuleSchema(customerSourcePanelInput);
  const customerSourceTexts = customerSourceSchemas
    .filter((item) => item.componentName === "SingleText")
    .map((item) => item.props.textContent);
  assert.ok(
    hasTextWithFragments(customerSourceTexts, ["线上广告", "86", "43%"]),
    "customer source panel should keep source summary data on one line",
  );
  assert.ok(
    hasTextWithFragments(customerSourceTexts, ["老客户推荐", "54", "27%"]),
    "customer source panel should preserve customer-source category data",
  );
  assert.ok(
    hasTextWithFragments(customerSourceTexts, ["门店自然到访", "37", "18.5%"]),
    "customer source panel should preserve original category names",
  );
  assert.ok(
    hasTextWithFragments(customerSourceTexts, ["线上广告", "43%"]),
    "customer source panel should derive a conclusion from source categories",
  );
  assert.equal(
    customerSourceTexts.some((text) => typeof text === "string" && text.includes("门店到访")),
    false,
    "customer source panel should not rewrite source category names",
  );
  const customerSideText = customerSourceSchemas.find(
    (item) => item.props.name === "侧边摘要1",
  );
  const customerChart = customerSourceSchemas.find(
    (item) => item.componentName === "PieChart",
  );
  assert.ok(customerSideText, "customer source panel should include side summary text");
  assert.ok(customerChart, "customer source panel should include chart");
  const customerSideTextStyle = customerSideText.props.style as JsonObject;
  const customerChartOption = customerChart.props.option as JsonObject;
  const customerChartSeries = customerChartOption.series as JsonObject[];
  const customerChartLabel = customerChartSeries[0]?.label as JsonObject;
  const customerChartLabelLine = customerChartSeries[0]?.labelLine as JsonObject;
  assert.ok(
    !((customerSideText.props.textContent as string | undefined) ?? "").includes("\n"),
    "customer source side summary should not wrap when the single-line text fits",
  );
  assert.ok(
    (customerSideTextStyle.width as number) >= 220,
    "customer source side text should avoid breaking short phrases and percentages",
  );
  assert.equal(customerSideTextStyle.height, 14);
  assert.equal(customerSideTextStyle.fontSize, 14);
  assert.equal(customerSideTextStyle.lineHeight, 1);
  assert.equal(customerChartLabel.fontSize, 11);
  assert.equal(customerChartLabel.show, true);
  assert.equal(customerChartLabelLine.length, 8);
  assert.equal(customerChartLabelLine.length2, 4);

  const energyPanelInput = {
    moduleName: "ChartPanel",
    layoutMode: "assisted",
    logicalId: "energy_usage_panel",
    parentLogicalId: "root",
    title: "园区能耗占比",
    dataItems: [
      { name: "空调", type: "能耗", value: 46 },
      { name: "照明", type: "能耗", value: 22 },
      { name: "动力设备", type: "能耗", value: 18 },
      { name: "办公设备", type: "能耗", value: 9 },
      { name: "其他", type: "能耗", value: 5 },
    ],
    style: {
      left: 24,
      top: 30,
      width: 768,
      height: 532,
      position: "absolute",
    },
    theme: {
      primaryColor: "#00D9FF",
      secondaryColor: "#6C5CFF",
      accentColor: "#FFB300",
      textColor: "#DFF8FF",
    },
    slots: {
      mainChart: {
        componentName: "PieChart",
        props: {
          style: {
            width: 260,
            height: 260,
          },
          option: {
            legend: {
              left: "center",
              top: "bottom",
            },
          },
        },
      },
    },
  } satisfies JsonObject;
  const energyPanelSchemas = generateModuleSchema(energyPanelInput);
  const energyChart = energyPanelSchemas.find(
    (item) => item.componentName === "PieChart",
  );
  assert.ok(energyChart, "energy panel should include chart");
  const energyChartStyle = energyChart.props.style as JsonObject;
  const energyChartOption = energyChart.props.option as JsonObject;
  const energyLegend = energyChartOption.legend as JsonObject;
  const energyLegendTextStyle = energyLegend.textStyle as JsonObject;
  const energySeries = energyChartOption.series as JsonObject[];
  const energyFirstSeries = energySeries[0] as JsonObject;
  const energyLabel = energyFirstSeries.label as JsonObject;
  const energyLabelLine = energyFirstSeries.labelLine as JsonObject;
  assert.ok(
    (energyChartStyle.width as number) < 300,
    "energy test should exercise a narrow chart region with side summary",
  );
  assert.ok(
    (energyLegend.itemGap as number) <= 14,
    "narrow energy panel should compact legend gap without locking a template value",
  );
  assert.ok(
    (energyLegendTextStyle.fontSize as number) <= 12,
    "narrow energy panel should compact legend text without locking a template value",
  );
  assert.ok(isPercentPair(energyFirstSeries.center), "energy pie center should stay percentage based");
  assert.ok(isPercentPair(energyFirstSeries.radius), "energy pie radius should stay percentage based");
  assert.ok(
    (energyLabel.fontSize as number) <= 10,
    "narrow energy panel should compact external labels without locking a template value",
  );
  assert.ok(
    (energyLabelLine.length as number) <= 6 && (energyLabelLine.length2 as number) <= 3,
    "narrow energy panel should compact label lines without locking a template value",
  );
  return { terseUserPanelInput };
}
