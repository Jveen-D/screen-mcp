
import assert from "node:assert/strict";
import { generateModuleSchema, generateModuleTreeSchema } from "../../src/core/modules.js";
import type { JsonObject } from "../../src/types/component.js";
import { assertRandomizedId, assertUniqueIds } from "./helpers.js";

export interface ChartPanelFlowFixtures {
  chartPanelInput: JsonObject;
}

export function runChartPanelFlowTests(): ChartPanelFlowFixtures {
  const chartPanelInput = {
    moduleName: "ChartPanel",
    layoutMode: "assisted",
    logicalId: "sales_channel_panel",
    parentLogicalId: "root",
    title: "销售渠道占比",
    style: {
      left: 48,
      top: 96,
      width: 520,
      height: 360,
      position: "absolute",
    },
    theme: {
      primaryColor: "#00E5FF",
      secondaryColor: "#7C4DFF",
      accentColor: "#FFB300",
      textColor: "#DFF8FF",
    },
    slots: {
      background: {
        componentName: "SingleImage",
        props: {
          imageBase64: "data:image/png;base64,BBBB",
          opacity: 0.95,
        },
      },
      title: {
        componentName: "SingleText",
        props: {
          textContent: "销售渠道占比",
        },
      },
      mainChart: {
        componentName: "PieChart",
        props: {
          chartData: {
            constant: {
              data: [
                { name: "直销", type: "渠道", value: 128 },
                { name: "代理", type: "渠道", value: 96 },
                { name: "线上", type: "渠道", value: 76 },
              ],
            },
          },
          option: {
            legend: {
              left: "center",
              top: "bottom",
            },
            series: [
              {
                radius: ["42%", "68%"],
              },
            ],
          },
        },
      },
      decorations: [
        {
          componentName: "SvgDecoration",
          props: {
            svgPreset: "icon-Frame3",
            primaryColor: "#00E5FF",
          },
        },
      ],
      auxiliaryTexts: [
        {
          componentName: "SingleText",
          props: {
            textContent: "高等级风险占比 29.0%，处置优先级：红 / 橙",
          },
        },
      ],
    },
  } satisfies JsonObject;

  const moduleSchemas = generateModuleSchema(chartPanelInput);
  assert.equal(moduleSchemas.length, 5);
  assertUniqueIds(
    moduleSchemas.map((item) => item.businessElementId),
    "ChartPanel generated component ids should be unique",
  );
  const longModuleIdInput = {
    ...chartPanelInput,
    logicalId: "very_long_chart_panel_identifier_for_backend_component_id_limit_over_fifty_chars",
  } satisfies JsonObject;
  const longModuleSchemas = generateModuleSchema(longModuleIdInput);
  assert.ok(
    longModuleSchemas.every(
      (item) =>
        item.businessElementId.length <= 50 &&
        ((item.props.logicalId as string | undefined)?.length ?? 0) <= 50,
    ),
    "ChartPanel generated component ids should not exceed backend id length limit",
  );
  assertUniqueIds(
    longModuleSchemas.map((item) => item.businessElementId),
    "ChartPanel generated long component ids should be unique",
  );
  assert.ok(
    longModuleSchemas.every(
      (item) => ((item.props.parentLogicalId as string | undefined)?.length ?? 0) <= 50,
    ),
    "ChartPanel generated child parent ids should not exceed backend id length limit",
  );
  assert.ok(
    longModuleSchemas.every((item) => /_[0-9a-f]{8}$/u.test(item.businessElementId)),
    "ChartPanel generated component ids should include random segment",
  );
  const longModuleTreeSchema = generateModuleTreeSchema(longModuleIdInput);
  assert.ok(
    longModuleTreeSchema.id.length <= 50,
    "ChartPanel group id should not exceed backend id length limit",
  );
  assert.match(
    longModuleTreeSchema.id,
    /_[0-9a-f]{8}$/u,
    "ChartPanel group id should include random segment",
  );
  assert.ok(
    longModuleTreeSchema.children.every(
      (item) =>
        item.id.length <= 50 &&
        ((item.props.logicalId as string | undefined)?.length ?? 0) <= 50,
    ),
    "ChartPanel tree child ids should not exceed backend id length limit",
  );
  assertUniqueIds(
    [longModuleTreeSchema.id, ...longModuleTreeSchema.children.map((item) => item.id)],
    "ChartPanel tree ids should be unique",
  );
  assert.ok(
    longModuleTreeSchema.children.every(
      (item) => (item.props.parentLogicalId as string | undefined) === longModuleTreeSchema.id,
    ),
    "ChartPanel tree child parent ids should reference randomized group id",
  );
  assert.deepEqual(
    moduleSchemas.map((item) => item.componentName),
    ["SingleText", "SingleText", "PieChart", "SvgDecoration", "SingleImage"],
  );
  assert.deepEqual(
    moduleSchemas.map((item) => item.indexNum),
    [1, 2, 3, 4, 5],
  );
  assertRandomizedId(moduleSchemas[0]?.businessElementId ?? "", "title", "module title id");
  assertRandomizedId(moduleSchemas[1]?.businessElementId ?? "", "aux_text_1", "module auxiliary text id");
  assertRandomizedId(moduleSchemas[2]?.businessElementId ?? "", "main_chart", "module main chart id");
  assertRandomizedId(moduleSchemas[3]?.businessElementId ?? "", "decoration_1", "module decoration id");
  assertRandomizedId(moduleSchemas[4]?.businessElementId ?? "", "background", "module background id");
  const moduleTextDatasource = moduleSchemas[0]?.props.datasource as JsonObject;
  const moduleTextConstantData = moduleTextDatasource.constantData as JsonObject[];
  const moduleTitleEntryAnimation = moduleSchemas[0]?.props.entryAnimiation as JsonObject;
  assert.equal(moduleTextConstantData[0]?.text, "销售渠道占比");
  assert.deepEqual(moduleTitleEntryAnimation, {
    isShow: true,
    type: "animate__fadeInLeft",
  });
  const moduleTitleStyle = moduleSchemas[0]?.props.style as JsonObject;
  assert.equal(moduleTitleStyle.left, 72);
  assert.equal(moduleTitleStyle.top, 114);
  assert.equal(moduleTitleStyle.width, 472);
  assert.equal(moduleTitleStyle.height, 22);
  assert.equal(moduleTitleStyle.fontSize, 22);
  assert.equal(moduleTitleStyle.lineHeight, 1);
  const moduleAuxText = moduleSchemas.find(
    (item) => item.businessElementId.includes("aux_text_1"),
  );
  assert.ok(moduleAuxText, "module should include explicit auxiliary text");
  const moduleAuxTextDatasource = moduleAuxText.props.datasource as JsonObject;
  const moduleAuxTextConstantData =
    moduleAuxTextDatasource.constantData as JsonObject[];
  const moduleAuxTextEntryAnimation = moduleAuxText.props.entryAnimiation as JsonObject;
  assert.equal(
    moduleAuxTextConstantData[0]?.text,
    "高等级风险占比 29.0%，处置优先级：红 / 橙",
  );
  assert.deepEqual(moduleAuxTextEntryAnimation, {
    isShow: true,
    type: "animate__fadeInLeft",
  });
  const moduleAuxTextStyle = moduleAuxText.props.style as JsonObject;
  assert.equal(moduleAuxTextStyle.height, 14);
  assert.equal(moduleAuxTextStyle.lineHeight, 1);
  const moduleDecoration = moduleSchemas.find(
    (item) => item.businessElementId.includes("decoration_1"),
  );
  assert.ok(moduleDecoration, "module should include explicit decoration");
  assert.equal(moduleDecoration.props.name, "模块装饰1");
  assert.equal(moduleDecoration.props.svgSource, "preset");
  assert.deepEqual(moduleDecoration.props.entryAnimiation, {
    isShow: true,
    type: "animate__fadeInLeft",
  });
  const emptyDecorationModuleSchemas = generateModuleSchema({
    ...chartPanelInput,
    logicalId: "chart_panel_empty_svg_decoration",
    slots: {
      ...(chartPanelInput.slots as JsonObject),
      decorations: [
        {
          componentName: "SvgDecoration",
          props: {
            primaryColor: "#00E5FF",
          },
        },
      ],
    },
  } satisfies JsonObject);
  const emptyModuleDecoration = emptyDecorationModuleSchemas.find(
    (item) => item.componentName === "SvgDecoration" && item.props.name === "模块装饰1",
  );
  assert.equal(
    emptyModuleDecoration,
    undefined,
    "module should drop empty explicit decoration slots instead of emitting invisible placeholders",
  );
  const moduleDecorationStyle = moduleDecoration.props.style as JsonObject;
  assert.equal(moduleDecorationStyle.left, 372);
  assert.equal(moduleDecorationStyle.top, 116);
  assert.equal(moduleDecorationStyle.width, 180);
  assert.equal(moduleDecorationStyle.height, 72);
  const moduleBackground = moduleSchemas.find(
    (item) => item.businessElementId.includes("background"),
  );
  assert.ok(moduleBackground, "module should include explicit background");
  assert.equal(moduleBackground.props.imageBase64, "");
  assert.equal(moduleBackground.props.imageUseMode, "upload");
  assert.equal(moduleBackground.props.svgSource, "");
  assert.deepEqual(moduleBackground.props.entryAnimiation, {
    isShow: false,
    type: "",
  });
  const moduleBackgroundStyle = moduleBackground.props.style as JsonObject;
  assert.equal(moduleBackgroundStyle.backgroundColor, "rgba(0,0,0,0)");
  assert.equal(moduleBackgroundStyle.zIndex, 10);
  const moduleChart = moduleSchemas.find(
    (item) => item.businessElementId.includes("main_chart"),
  );
  assert.ok(moduleChart, "module should include main chart");
  const moduleChartOption = moduleChart.props.option as JsonObject;
  const moduleChartData = moduleChart.props.chartData as JsonObject;
  const moduleChartEntryAnimation = moduleChart.props.entryAnimiation as JsonObject;
  const moduleChartDataConstant = moduleChartData.constant as JsonObject;
  const moduleChartRows = moduleChartDataConstant.data as JsonObject[];
  const moduleChartSeries = moduleChartOption.series as JsonObject[];
  assert.equal(moduleChartOption.backgroundColor, "transparent");
  assert.equal(moduleChartData.sourceType, "constant");
  assert.deepEqual(moduleChartRows, [
    { name: "直销", type: "渠道", value: 128 },
    { name: "代理", type: "渠道", value: 96 },
    { name: "线上", type: "渠道", value: 76 },
  ]);
  assert.deepEqual(moduleChartEntryAnimation, {
    isShow: true,
    type: "animate__zoomIn",
  });
  assert.deepEqual(moduleChartSeries[0]?.radius, ["36%", "64%"]);
  assert.deepEqual(moduleChartSeries[0]?.center, ["50%", "44%"]);
  assert.equal(moduleChartSeries[0]?.left, 0);
  assert.equal(moduleChartSeries[0]?.top, 0);
  assert.equal(moduleChartSeries[0]?.right, 0);
  assert.equal(moduleChartSeries[0]?.bottom, 0);
  assert.equal(moduleChartSeries[0]?.type, "pie");
  assert.equal(moduleChartSeries[0]?.selectedMode, false);
  assert.equal(moduleChartSeries[0]?.selectOffset, 0);
  const moduleChartSeriesEmphasis = moduleChartSeries[0]?.emphasis as JsonObject;
  const moduleChartSeriesSelect = moduleChartSeries[0]?.select as JsonObject;
  assert.equal(moduleChartSeriesEmphasis.disabled, true);
  assert.equal(moduleChartSeriesSelect.disabled, true);
  const moduleChartLegend = moduleChartOption.legend as JsonObject;
  assert.equal(moduleChartLegend.top, "bottom");
  assert.equal(moduleChartLegend.left, "center");
  assert.equal(moduleChartLegend.icon, "roundRect");
  assert.equal(moduleChartLegend.itemGap, 18);
  assert.equal(moduleChartLegend.backgroundColor, "rgba(0, 229, 255, 0.055)");
  assert.equal(moduleChartLegend.borderColor, "rgba(0, 229, 255, 0.2)");
  assert.equal(moduleChartLegend.borderWidth, 1);
  const moduleChartLegendTextStyle = moduleChartLegend.textStyle as JsonObject;
  assert.equal(moduleChartLegendTextStyle.fontSize, 12);
  assert.equal(moduleChartLegendTextStyle.fontWeight, "normal");
  const moduleChartStyle = moduleChart.props.style as JsonObject;
  assert.equal(moduleTitleStyle.zIndex, 18);
  assert.equal(moduleChartStyle.zIndex, 12);
  assert.equal(moduleDecorationStyle.zIndex, 14);
  assert.equal(moduleChartStyle.left, 68);
  assert.equal(moduleChartStyle.top, 188);
  assert.equal(moduleChartStyle.width, 480);
  assert.ok(
    (moduleChartStyle.height as number) >= 160,
    "module chart should use the released bottom space to make the left panel taller",
  );
  assert.equal(
    moduleSchemas.some((item) => item.props.name === "侧边摘要容器"),
    false,
    "manual ChartPanel should not synthesize a side summary container",
  );
  assert.equal(
    moduleSchemas.some((item) => item.props.name === "底部结构线"),
    false,
    "manual ChartPanel should not synthesize bottom structure lines",
  );

  assert.throws(
    () =>
      generateModuleSchema({
        ...chartPanelInput,
        layoutMode: "manual",
        logicalId: "manual_panel_missing_auxiliary_text",
        slots: {
          ...(chartPanelInput.slots as JsonObject),
          auxiliaryTexts: [],
        },
      } satisfies JsonObject),
    /manual ChartPanel must include slots\.auxiliaryTexts/,
    "direct manual ChartPanel generation should reject missing auxiliary business text",
  );

  const noResourcePanelInput = {
    ...chartPanelInput,
    logicalId: "no_resource_panel",
    slots: {
      ...chartPanelInput.slots,
      background: {
        componentName: "SingleImage",
        props: {},
      },
    },
  } satisfies JsonObject;
  const noResourceSchemas = generateModuleSchema(noResourcePanelInput);
  const noResourceBackground = noResourceSchemas.find(
    (item) => item.businessElementId.includes("background"),
  );
  assert.ok(noResourceBackground, "no-resource module should include background");
  assert.equal(noResourceBackground?.props.imageSrc, "");
  assert.equal(noResourceBackground?.props.imageBase64, "");
  assert.equal(noResourceBackground?.props.imageUseMode, "upload");
  assert.equal(noResourceBackground?.props.opacity, 1);
  assert.equal(noResourceBackground?.props.svgSource, "");

  const sideTextDerivedDataInput = {
    moduleName: "ChartPanel",
    logicalId: "risk_level_panel",
    parentLogicalId: "root",
    title: "风险等级分析",
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
          },
        },
      },
      auxiliaryTexts: [
        {
          componentName: "SingleText",
          props: {
            textContent: "风险总数 126",
          },
        },
        {
          componentName: "SingleText",
          props: {
            textContent: "高风险 18",
          },
        },
        {
          componentName: "SingleText",
          props: {
            textContent: "中风险 37",
          },
        },
        {
          componentName: "SingleText",
          props: {
            textContent: "低风险 71",
          },
        },
        {
          componentName: "SingleText",
          props: {
            textContent: "处置优先级：高风险项优先闭环，中风险项限期跟踪",
          },
        },
      ],
    },
  } satisfies JsonObject;
  const sideTextDerivedSchemas = generateModuleSchema(sideTextDerivedDataInput);
  const sideTextDerivedChart = sideTextDerivedSchemas.find(
    (item) => item.componentName === "PieChart",
  );
  assert.ok(sideTextDerivedChart, "derived data module should include PieChart");
  const sideTextDerivedChartData = sideTextDerivedChart.props.chartData as JsonObject;
  const sideTextDerivedConstant = sideTextDerivedChartData.constant as JsonObject;
  assert.deepEqual(sideTextDerivedConstant.data, [
    { name: "高风险", type: "系列", value: 18 },
    { name: "中风险", type: "系列", value: 37 },
    { name: "低风险", type: "系列", value: 71 },
  ]);

  const moduleDataItemsInput = {
    ...sideTextDerivedDataInput,
    logicalId: "risk_level_data_items_panel",
    dataItems: [
      { name: "重大风险", type: "风险", value: 34 },
      { name: "较大风险", type: "风险", value: 78 },
      { name: "一般风险", type: "风险", value: 156 },
      { name: "低风险", type: "风险", value: 118 },
    ],
  } satisfies JsonObject;
  const moduleDataItemsSchemas = generateModuleSchema(moduleDataItemsInput);
  const moduleDataItemsChart = moduleDataItemsSchemas.find(
    (item) => item.componentName === "PieChart",
  );
  assert.ok(moduleDataItemsChart, "dataItems module should include PieChart");
  const moduleDataItemsChartData = moduleDataItemsChart.props.chartData as JsonObject;
  const moduleDataItemsConstant = moduleDataItemsChartData.constant as JsonObject;
  assert.deepEqual(moduleDataItemsConstant.data, [
    { name: "重大风险", type: "风险", value: 34 },
    { name: "较大风险", type: "风险", value: 78 },
    { name: "一般风险", type: "风险", value: 156 },
    { name: "低风险", type: "风险", value: 118 },
  ]);
  return { chartPanelInput };
}
