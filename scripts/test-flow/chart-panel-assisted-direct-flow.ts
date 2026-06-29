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
    logicalId: "terse_status_panel",
    parentLogicalId: "root",
    title: "状态分布分析",
    dataItems: [
      { name: "状态A", type: "状态", value: 18 },
      { name: "状态B", type: "状态", value: 37 },
      { name: "状态C", type: "状态", value: 71 },
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
    { name: "状态A", type: "状态", value: 18 },
    { name: "状态B", type: "状态", value: 37 },
    { name: "状态C", type: "状态", value: 71 },
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
    hasTextWithFragments(terseTexts, ["状态A", "18", "14.3%"]),
    "terse input should derive side summary data from dataItems",
  );
  assert.ok(
    hasTextWithFragments(terseTexts, ["状态A", "14.3%"]),
    "terse input should derive a real conclusion from data",
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

  const sourcePanelInput = {
    moduleName: "ChartPanel",
    layoutMode: "assisted",
    logicalId: "source_category_panel",
    parentLogicalId: "root",
    title: "类别分类分析",
    dataItems: [
      { name: "类别A", type: "类别", value: 86 },
      { name: "类别B", type: "类别", value: 54 },
      { name: "类别C保留原名", type: "类别", value: 37 },
      { name: "类别D", type: "类别", value: 23 },
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
  const sourceSchemas = generateModuleSchema(sourcePanelInput);
  const sourceTexts = sourceSchemas
    .filter((item) => item.componentName === "SingleText")
    .map((item) => item.props.textContent);
  assert.ok(
    hasTextWithFragments(sourceTexts, ["类别A", "86", "43%"]),
    "source category panel should keep source summary data on one line",
  );
  assert.ok(
    hasTextWithFragments(sourceTexts, ["类别B", "54", "27%"]),
    "source category panel should preserve source category data",
  );
  assert.ok(
    hasTextWithFragments(sourceTexts, ["类别C保留原名", "37", "18.5%"]),
    "source category panel should preserve original category names",
  );
  assert.ok(
    hasTextWithFragments(sourceTexts, ["类别A", "43%"]),
    "source category panel should derive a conclusion from source categories",
  );
  assert.equal(
    sourceTexts.some((text) => typeof text === "string" && text.includes("类别C")),
    true,
    "source category panel should keep the original source category label",
  );
  assert.equal(
    sourceTexts.some((text) => typeof text === "string" && text.includes("改写类别C")),
    false,
    "source category panel should not rewrite source category names",
  );
  const sourceSideText = sourceSchemas.find(
    (item) => item.props.name === "侧边摘要1",
  );
  const sourceChart = sourceSchemas.find(
    (item) => item.componentName === "PieChart",
  );
  assert.ok(sourceSideText, "source category panel should include side summary text");
  assert.ok(sourceChart, "source category panel should include chart");
  const sourceSideTextStyle = sourceSideText.props.style as JsonObject;
  const sourceChartOption = sourceChart.props.option as JsonObject;
  const sourceChartSeries = sourceChartOption.series as JsonObject[];
  const sourceChartLabel = sourceChartSeries[0]?.label as JsonObject;
  const sourceChartLabelLine = sourceChartSeries[0]?.labelLine as JsonObject;
  assert.ok(
    !((sourceSideText.props.textContent as string | undefined) ?? "").includes("\n"),
    "source category side summary should not wrap when the single-line text fits",
  );
  assert.ok(
    (sourceSideTextStyle.width as number) >= 220,
    "source category side text should avoid breaking short phrases and percentages",
  );
  assert.equal(sourceSideTextStyle.height, 14);
  assert.equal(sourceSideTextStyle.fontSize, 14);
  assert.equal(sourceSideTextStyle.lineHeight, 1);
  assert.equal(sourceChartLabel.fontSize, 11);
  assert.equal(sourceChartLabel.show, true);
  assert.equal(sourceChartLabelLine.length, 8);
  assert.equal(sourceChartLabelLine.length2, 4);

  const denseCategoryPanelInput = {
    moduleName: "ChartPanel",
    layoutMode: "assisted",
    logicalId: "dense_category_panel",
    parentLogicalId: "root",
    title: "五项分类占比",
    dataItems: [
      { name: "分类A", type: "分类", value: 46 },
      { name: "分类B", type: "分类", value: 22 },
      { name: "分类C", type: "分类", value: 18 },
      { name: "分类D", type: "分类", value: 9 },
      { name: "分类E", type: "分类", value: 5 },
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
  const denseCategorySchemas = generateModuleSchema(denseCategoryPanelInput);
  const denseCategoryChart = denseCategorySchemas.find(
    (item) => item.componentName === "PieChart",
  );
  assert.ok(denseCategoryChart, "dense category panel should include chart");
  const denseCategoryChartStyle = denseCategoryChart.props.style as JsonObject;
  const denseCategoryChartOption = denseCategoryChart.props.option as JsonObject;
  const denseCategoryLegend = denseCategoryChartOption.legend as JsonObject;
  const denseCategoryLegendTextStyle = denseCategoryLegend.textStyle as JsonObject;
  const denseCategorySeries = denseCategoryChartOption.series as JsonObject[];
  const denseCategoryFirstSeries = denseCategorySeries[0] as JsonObject;
  const denseCategoryLabel = denseCategoryFirstSeries.label as JsonObject;
  const denseCategoryLabelLine = denseCategoryFirstSeries.labelLine as JsonObject;
  assert.equal(denseCategoryChartStyle.left, 24);
  assert.equal(denseCategoryChartStyle.top, 30);
  assert.equal(denseCategoryChartStyle.width, 768);
  assert.equal(
    denseCategoryChartStyle.height,
    532,
    "dense category chart component should fill the module even when the input style is smaller",
  );
  assert.ok(
    (denseCategoryLegend.itemGap as number) <= 14,
    "narrow category panel should compact legend gap without locking a template value",
  );
  assert.ok(
    (denseCategoryLegendTextStyle.fontSize as number) <= 12,
    "narrow category panel should compact legend text without locking a template value",
  );
  assert.ok(isPercentPair(denseCategoryFirstSeries.center), "category pie center should stay percentage based");
  assert.ok(isPercentPair(denseCategoryFirstSeries.radius), "category pie radius should stay percentage based");
  assert.ok(
    (denseCategoryLabel.fontSize as number) <= 12,
    "dense category panel should keep external labels restrained without shrinking the chart component",
  );
  assert.ok(
    (denseCategoryLabelLine.length as number) <= 8 && (denseCategoryLabelLine.length2 as number) <= 4,
    "dense category panel should keep label lines restrained without shrinking the chart component",
  );
  return { terseUserPanelInput };
}
