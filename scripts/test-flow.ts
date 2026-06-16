import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  generateModuleSchema,
  generateModuleTreeSchema,
  getModuleCapability,
  listModules,
} from "../src/core/modules.js";
import { getComponentCapability, listComponents } from "../src/core/registry.js";
import {
  generateComponentsSchema,
  generateComponentsSchemas,
} from "../src/core/schema.js";
import { generateScreenModuleFromPrompt } from "../src/core/promptModule.js";
import type { JsonObject } from "../src/types/component.js";

function readToolJson(result: Awaited<ReturnType<Client["callTool"]>>) {
  assert.ok(Array.isArray(result.content), "MCP tool should return content");
  const content = result.content[0];
  assert.ok(
    content && content.type === "text",
    "MCP tool should return JSON text content",
  );

  const text = "text" in content ? content.text : "";
  assert.equal(typeof text, "string");

  return JSON.parse(text);
}

function hasPropName(item: JsonObject, name: string): boolean {
  const props = item.props;
  return typeof props === "object" && props !== null && !Array.isArray(props) && props.name === name;
}

function assertUniqueIds(ids: string[], message: string): void {
  assert.equal(new Set(ids).size, ids.length, message);
}

function assertRandomizedId(
  id: string,
  semanticPart: string,
  message: string,
): void {
  assert.ok(id.includes(semanticPart), message);
  assert.match(id, /_[0-9a-f]{8}$/u, `${message}: should end with random segment`);
  assert.ok(id.length <= 50, `${message}: should not exceed backend id length limit`);
}

const components = listComponents();
assert.ok(
  components.some((component) => component.componentName === "PieChart"),
  "list_components should include PieChart",
);
assert.ok(
  components.some((component) => component.componentName === "SingleImage"),
  "list_components should include SingleImage",
);
assert.ok(
  components.some((component) => component.componentName === "SingleText"),
  "list_components should include SingleText",
);
assert.ok(
  components.some((component) => component.componentName === "SvgDecoration"),
  "list_components should include SvgDecoration",
);
assert.ok(
  components.some((component) => component.componentName === "ThreeDPieChart"),
  "list_components should include ThreeDPieChart",
);
assert.ok(
  components.some((component) => component.componentName === "Indicator"),
  "list_components should include Indicator",
);
assert.ok(
  components.some((component) => component.componentName === "Gauge"),
  "list_components should include Gauge",
);
assert.ok(
  components.some((component) => component.componentName === "CircularProgress"),
  "list_components should include CircularProgress",
);
assert.ok(
  components.some((component) => component.componentName === "PercentageBar"),
  "list_components should include PercentageBar",
);
assert.ok(
  components.some((component) => component.componentName === "SingleValueChart"),
  "list_components should include SingleValueChart",
);

const capability = getComponentCapability("PieChart");
assert.ok(Array.isArray(capability.requiredProps), "capability has requiredProps");
assert.ok(
  Array.isArray(capability.aiWritableProps),
  "capability has aiWritableProps",
);
assert.ok(
  Array.isArray(capability.aiForbiddenProps),
  "capability has aiForbiddenProps",
);
assert.ok(Array.isArray(capability.examples), "capability has examples");
assert.equal(capability.componentType, "chart");
assert.ok(capability.baseConfig, "chart capability has baseConfig");
const pieWritableProps = capability.aiWritableProps as JsonObject[];
assert.ok(
  pieWritableProps.some((item) => item.path === "option.backgroundColor"),
  "chart background color should use option.backgroundColor",
);
assert.equal(
  pieWritableProps.some((item) => item.path === "style.backgroundColor"),
  false,
  "chart capability should not expose style.backgroundColor as base background",
);
assert.ok(
  pieWritableProps.some((item) => item.path === "style"),
  "capability should expose base style config",
);
assert.ok(
  pieWritableProps.some((item) => item.path === "rotate"),
  "capability should expose base rotate config",
);
assert.ok(
  pieWritableProps.some((item) => item.path === "opacity"),
  "capability should expose base opacity config",
);
assert.ok(
  pieWritableProps.some((item) => item.path === "chartData.constant.data"),
  "PieChart should expose writable constant data rows",
);
const pieEntryAnimationCapability = pieWritableProps.find(
  (item) => item.path === "entryAnimiation",
) as JsonObject | undefined;
assert.ok(
  pieEntryAnimationCapability,
  "capability should expose base entry animation config",
);
const pieEntryAnimationChildren =
  pieEntryAnimationCapability.children as JsonObject[] | undefined;
assert.ok(
  pieEntryAnimationChildren?.some((item) => item.path === "entryAnimiation.isShow"),
  "entry animation should expose isShow switch",
);
assert.ok(
  pieEntryAnimationChildren?.some((item) => item.path === "entryAnimiation.type"),
  "entry animation should expose type select",
);
const pieRequiredProps = capability.requiredProps as JsonObject[];
const pieLogicalIdRequiredProp = pieRequiredProps.find(
  (item) => item.path === "logicalId",
) as JsonObject | undefined;
assert.ok(
  typeof pieLogicalIdRequiredProp?.description === "string" &&
    pieLogicalIdRequiredProp.description.includes("短随机段"),
  "component capability should document randomized id requirement",
);
const pieStyleRequiredProp = pieRequiredProps.find(
  (item) => item.path === "style",
) as JsonObject | undefined;
assert.ok(pieStyleRequiredProp, "capability should require style");
const pieSeriesCapability = pieWritableProps.find(
  (item) => item.path === "option.series[0]",
) as JsonObject | undefined;
const pieSeriesChildren = pieSeriesCapability?.children as JsonObject[] | undefined;
const pieLegendCapability = pieWritableProps.find(
  (item) => item.path === "option.legend",
) as JsonObject | undefined;
const pieLegendChildren = pieLegendCapability?.children as JsonObject[] | undefined;
assert.ok(
  pieLegendChildren?.some((item) => item.path === "option.legend.offsetX"),
  "PieChart legend should expose horizontal offset",
);
assert.ok(
  pieLegendChildren?.some((item) => item.path === "option.legend.offsetY"),
  "PieChart legend should expose vertical offset",
);
assert.ok(
  pieSeriesChildren?.some((item) => item.path === "option.series[0].center"),
  "PieChart series should expose center position",
);
assert.ok(
  pieSeriesChildren?.some((item) => item.path === "option.series[0].radius"),
  "PieChart series should expose radius pair",
);
const pieLabelCapability = pieSeriesChildren?.find(
  (item) => item.path === "option.series[0].label",
) as JsonObject | undefined;
const pieFormatterRules = pieLabelCapability?.formatterRules as JsonObject | undefined;
const pieFormatterTokens = pieFormatterRules?.tokens as JsonObject[] | undefined;
assert.ok(pieFormatterRules, "PieChart label should expose formatter rules");
assert.ok(
  pieFormatterTokens?.some((item) => item.token === "{a}"),
  "formatter rules should include series name token",
);
assert.ok(
  pieFormatterTokens?.some((item) => item.token === "{b}"),
  "formatter rules should include data name token",
);
assert.ok(
  pieFormatterTokens?.some((item) => item.token === "{c}"),
  "formatter rules should include data value token",
);
assert.ok(
  pieFormatterTokens?.some((item) => item.token === "{@xxx}"),
  "formatter rules should include named dimension token",
);
assert.ok(
  pieFormatterTokens?.some((item) => item.token === "{@[n]}"),
  "formatter rules should include dimension index token",
);
assert.ok(
  pieFormatterTokens?.some((item) => item.token === "\\n"),
  "formatter rules should include newline token",
);
assert.ok(
  Array.isArray(capability.visualRules),
  "PieChart capability should expose visualRules",
);
const pieVisualRules = capability.visualRules as string[];
assert.ok(
  pieVisualRules.some((rule) => rule.includes("不要所有主题都套用同一种形态")),
  "PieChart should guide design thinking without fixed shape defaults",
);
assert.ok(
  pieVisualRules.some((rule) => rule.includes("色彩要服务主题")),
  "PieChart should guide theme-aware color choices",
);
assert.ok(
  pieVisualRules.some((rule) => rule.includes("侧边信息卡")),
  "PieChart should guide label and side-card information roles",
);
assert.ok(
  pieVisualRules.some((rule) => rule.includes("legend 默认必须保留")),
  "PieChart should keep legend by default",
);
assert.ok(
  pieVisualRules.some((rule) => rule.includes("截断是可接受现象")),
  "PieChart should allow label truncation while avoiding overlap",
);
assert.ok(
  pieVisualRules.some((rule) => rule.includes("legend.offsetX/offsetY")),
  "PieChart should document legend offset plus center/radius spacing strategy",
);
const pieForbiddenProps = capability.aiForbiddenProps as JsonObject[];
assert.ok(
  pieForbiddenProps.some((item) => item.path === "chartData.sourceType"),
  "PieChart should forbid chartData sourceType overrides",
);
assert.ok(
  pieForbiddenProps.some((item) => item.path === "option.dataset"),
  "PieChart should forbid option.dataset",
);

const threeDCapability = getComponentCapability("ThreeDPieChart");
assert.ok(Array.isArray(threeDCapability.requiredProps), "ThreeDPieChart capability has requiredProps");
assert.ok(
  Array.isArray(threeDCapability.aiWritableProps),
  "ThreeDPieChart capability has aiWritableProps",
);
assert.ok(
  Array.isArray(threeDCapability.aiForbiddenProps),
  "ThreeDPieChart capability has aiForbiddenProps",
);
assert.ok(Array.isArray(threeDCapability.examples), "ThreeDPieChart capability has examples");
assert.equal(threeDCapability.componentType, "chart");
assert.ok(threeDCapability.baseConfig, "ThreeDPieChart capability has baseConfig");
const threeDWritableProps = threeDCapability.aiWritableProps as JsonObject[];
assert.ok(
  threeDWritableProps.some((item) => item.path === "option.threeDSettings"),
  "ThreeDPieChart should expose threeDSettings",
);
assert.ok(
  threeDWritableProps.some((item) => item.path === "option.series[0]"),
  "ThreeDPieChart should expose series config",
);
assert.ok(
  threeDWritableProps.some((item) => item.path === "option.color"),
  "ThreeDPieChart should expose color via chart base props",
);
const threeDForbiddenProps = threeDCapability.aiForbiddenProps as JsonObject[];
assert.ok(
  threeDForbiddenProps.some((item) => item.path === "option.threeDSettings.cameraPosition"),
  "ThreeDPieChart should forbid cameraPosition overrides",
);

const threeDExample = (threeDCapability.examples as JsonObject[])[0];
const threeDAiProps = threeDExample?.props as JsonObject;
const threeDSchema = generateComponentsSchema(threeDAiProps);
assert.equal(threeDSchema.componentName, "ThreeDPieChart");
const threeDProps = threeDSchema.props;
const threeDOption = threeDProps.option as JsonObject;
const threeDSeries = threeDOption.series as JsonObject[];
const threeDFirstSeries = threeDSeries[0] as JsonObject;
const threeDChartData = threeDProps.chartData as JsonObject;
assert.equal(threeDChartData.sourceType, "constant");
assert.equal(threeDFirstSeries.type, "pie");
assert.deepEqual(threeDFirstSeries.radius, ["72%", "96%"]);
assert.deepEqual(threeDFirstSeries.center, ["50%", "48%"]);
assert.equal((threeDFirstSeries.label as JsonObject | undefined)?.show, false);
assert.equal((threeDFirstSeries.labelLine as JsonObject | undefined)?.show, false);
assert.ok(
  threeDOption.threeDSettings !== null && typeof threeDOption.threeDSettings === "object" && !Array.isArray(threeDOption.threeDSettings),
  "ThreeDPieChart schema should include threeDSettings",
);
assert.equal((threeDOption.threeDSettings as JsonObject).depth, 18);
assert.equal((threeDOption.threeDSettings as JsonObject).topViewAngle, 63);

const examples = capability.examples as JsonObject[];
const firstExample = examples[0];
assert.ok(firstExample, "capability should include at least one example");

const aiProps = firstExample.props as JsonObject;
const schema = generateComponentsSchema(aiProps);
const props = schema.props;
const option = props.option as JsonObject;
const legend = option.legend as JsonObject;
const series = option.series as JsonObject[];
const firstSeries = series[0] as JsonObject;
const inputOption = aiProps.option as JsonObject;
const inputSeries = inputOption.series as JsonObject[];
const inputFirstSeries = inputSeries[0] as JsonObject;
const chartData = props.chartData as JsonObject;
const chartDataConstant = chartData.constant as JsonObject;
const chartDataRows = chartDataConstant.data as JsonObject[];
const chartDataOriginalRows = chartDataConstant.originalData as JsonObject[];

assert.equal(schema.componentName, "PieChart");
assert.equal(chartData.sourceType, "constant");
assert.equal(chartDataRows[0]?.name, "类目1");
assert.equal(chartDataRows[0]?.type, "系列");
assert.equal(chartDataRows[0]?.value, 101);
assert.deepEqual(chartDataOriginalRows, chartDataRows);
assert.equal("title" in option, false);
assert.equal(legend.left, "center");
assert.equal(legend.top, "bottom");
assert.equal(legend.offsetX, 0);
assert.equal(legend.offsetY, -6);
assert.equal(firstSeries.type, "pie");
assert.deepEqual(firstSeries.center, inputFirstSeries.center);
assert.deepEqual(firstSeries.radius, inputFirstSeries.radius);
assertRandomizedId(
  schema.businessElementId,
  aiProps.logicalId as string,
  "component businessElementId should preserve semantic id and include random segment",
);
assert.equal(schema.props.logicalId, schema.businessElementId);
assert.equal(schema.parentBusinessElementId, aiProps.parentLogicalId);
assert.deepEqual(props.entryAnimiation, { type: "", isShow: false });

const longComponentIdSchema = generateComponentsSchema({
  ...aiProps,
  logicalId: "very_long_component_identifier_for_backend_limit_should_be_trimmed_to_fifty_chars",
});
const secondLongComponentIdSchema = generateComponentsSchema({
  ...aiProps,
  logicalId: "very_long_component_identifier_for_backend_limit_should_be_trimmed_to_fifty_chars",
});
assert.ok(
  longComponentIdSchema.businessElementId.length <= 50,
  "component businessElementId should not exceed backend id length limit",
);
assert.match(
  longComponentIdSchema.businessElementId,
  /_[0-9a-f]{8}$/u,
  "component businessElementId should include random segment",
);
assert.equal(
  longComponentIdSchema.props.logicalId,
  longComponentIdSchema.businessElementId,
  "component props logicalId should not exceed backend id length limit",
);
assert.notEqual(
  longComponentIdSchema.businessElementId,
  secondLongComponentIdSchema.businessElementId,
  "component ids from the same semantic input should include different random segments",
);

const forbiddenOverrideSchema = generateComponentsSchema({
  ...aiProps,
  chartData: {
    sourceType: "api",
    constant: {
      originalData: [{ name: "Original should be regenerated", value: 1 }],
      fieldList: [{ fieldName: "bad", fieldDisplayName: "bad", fieldType: "LONGTEXT" }],
      data: [
        { name: "重大风险", value: 34 },
        { name: "较大风险", type: "风险", value: "78" },
        { name: "一般风险", type: "风险", value: 156 },
        { name: "低风险", type: "风险", value: 118 },
      ],
    },
    dimension: [{ fieldName: "bad_dimension" }],
    indicator: [{ fieldName: "bad_indicator" }],
  },
  eventConfigures: [{ eventName: "click" }],
  option: {
    title: {
      text: "AI should not write title",
    },
    dataset: {
      source: [
        ["name", "value"],
        ["AI should not write dataset", 999],
      ],
    },
    series: [
      {
        data: [{ name: "AI should not write data", value: 999 }],
        radius: ["50%", "72%"],
        type: "bar",
      },
    ],
  },
});
const forbiddenOverrideOption = forbiddenOverrideSchema.props.option as JsonObject;
const forbiddenOverrideSeries = forbiddenOverrideOption.series as JsonObject[];
const forbiddenOverrideFirstSeries = forbiddenOverrideSeries[0] as JsonObject;
const forbiddenOverrideChartData =
  forbiddenOverrideSchema.props.chartData as JsonObject;
const forbiddenOverrideConstant =
  forbiddenOverrideChartData.constant as JsonObject;
const forbiddenOverrideRows = forbiddenOverrideConstant.data as JsonObject[];
const forbiddenOverrideOriginalRows =
  forbiddenOverrideConstant.originalData as JsonObject[];
const forbiddenOverrideFieldList =
  forbiddenOverrideConstant.fieldList as JsonObject[];
const forbiddenOverrideDimension =
  forbiddenOverrideChartData.dimension as JsonObject[];
const forbiddenOverrideIndicator =
  forbiddenOverrideChartData.indicator as JsonObject[];
assert.equal(forbiddenOverrideChartData.sourceType, "constant");
assert.deepEqual(forbiddenOverrideRows, [
  { name: "重大风险", type: "系列", value: 34 },
  { name: "较大风险", type: "风险", value: 78 },
  { name: "一般风险", type: "风险", value: 156 },
  { name: "低风险", type: "风险", value: 118 },
]);
assert.deepEqual(forbiddenOverrideOriginalRows, forbiddenOverrideRows);
assert.deepEqual(
  forbiddenOverrideFieldList.map((item) => item.fieldName),
  ["name", "type", "value"],
);
assert.equal(forbiddenOverrideDimension[0]?.fieldName, "name");
assert.equal(forbiddenOverrideIndicator[0]?.fieldName, "value");
assert.equal("title" in forbiddenOverrideOption, false);
assert.equal("dataset" in forbiddenOverrideOption, false);
assert.equal("data" in forbiddenOverrideFirstSeries, false);
assert.equal(forbiddenOverrideFirstSeries.type, "pie");
assert.deepEqual(forbiddenOverrideFirstSeries.radius, ["50%", "72%"]);
assert.deepEqual(forbiddenOverrideSchema.props.eventConfigures, []);

const invalidLegendSchema = generateComponentsSchema({
  ...aiProps,
  option: {
    legend: {
      left: "center",
      top: "center",
    },
  },
});
const invalidLegendOption = invalidLegendSchema.props.option as JsonObject;
const normalizedLegend = invalidLegendOption.legend as JsonObject;
assert.equal(normalizedLegend.left, "center");
assert.equal(normalizedLegend.top, "top");

const imageCapability = getComponentCapability("SingleImage");
assert.ok(Array.isArray(imageCapability.aiWritableProps));
assert.equal(imageCapability.componentType, "base");
assert.ok(imageCapability.baseConfig, "base component capability has baseConfig");
const imageWritableProps = imageCapability.aiWritableProps as JsonObject[];
const imageUseModeCapability = imageWritableProps.find(
  (item) => item.path === "imageUseMode",
) as JsonObject | undefined;
assert.deepEqual(
  imageUseModeCapability?.values,
  ["upload", "base64"],
  "imageUseMode should support upload and base64",
);
assert.ok(
  imageWritableProps.some((item) => item.path === "style.backgroundColor"),
  "base component background color should use style.backgroundColor",
);
assert.equal(
  imageWritableProps.some((item) => item.path === "option.backgroundColor"),
  false,
  "base component capability should not expose option.backgroundColor as base background",
);
const imageSchema = generateComponentsSchema({
  componentName: "SingleImage",
  logicalId: "panel_bg_image",
  parentLogicalId: "sales_group",
  name: "销售面板背景",
  style: {
    position: "absolute",
    left: 48,
    top: 96,
    width: 520,
    height: 360,
    backgroundColor: "rgba(0,0,0,0)",
    borderRadius: 0,
  },
  imageBase64: "data:image/png;base64,AAAA",
  targetUrl: "https://example.com",
  openBrowser: true,
});
assert.equal(imageSchema.componentName, "SingleImage");
assert.equal(imageSchema.props.imageBase64, "data:image/png;base64,AAAA");
assert.equal(imageSchema.props.imageUseMode, "base64");
assert.deepEqual(imageSchema.props.entryAnimiation, { isShow: false, type: "" });
assert.equal(imageSchema.props.targetUrl, "");
assert.equal(imageSchema.props.openBrowser, false);

const textCapability = getComponentCapability("SingleText");
assert.ok(Array.isArray(textCapability.aiForbiddenProps));
const textSchema = generateComponentsSchema({
  componentName: "SingleText",
  logicalId: "sales_panel_title",
  parentLogicalId: "sales_group",
  name: "销售面板标题",
  textContent: "销售渠道占比",
  datasource: {
    sourceType: "api",
  },
  style: {
    position: "absolute",
    left: 80,
    top: 112,
    width: 260,
    height: 36,
    fontSize: 22,
    lineHeight: 24,
    color: "#DFF8FF",
    textAlign: "left",
    backgroundColor: "rgba(0,0,0,0)",
    fontWeight: "bold",
  },
});
const textDatasource = textSchema.props.datasource as JsonObject;
const textConstantData = textDatasource.constantData as JsonObject[];
assert.equal(textSchema.componentName, "SingleText");
assert.equal(textSchema.props.textContent, "销售渠道占比");
assert.deepEqual(textSchema.props.entryAnimiation, { isShow: false, type: "" });
assert.equal(textDatasource.sourceType, "externalConstant");
assert.equal(textConstantData[0]?.text, "销售渠道占比");
const textStyle = textSchema.props.style as JsonObject;
assert.equal(textStyle.lineHeight, 1.09);

// Indicator: textValue should sync to chartData.constant.data[0].value
const indicatorCapability = getComponentCapability("Indicator");
assert.ok(Array.isArray(indicatorCapability.aiWritableProps), "Indicator capability has aiWritableProps");
const indicatorSchema = generateComponentsSchema({
  componentName: "Indicator",
  logicalId: "indicator_test",
  parentLogicalId: "sales_group",
  name: "测试翻牌器",
  textValue: 9876,
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 300,
    height: 80,
  },
});
assert.equal(indicatorSchema.componentName, "Indicator");
const indicatorChartData = asChartObject(indicatorSchema.props.chartData);
const indicatorConstant = asChartObject(indicatorChartData.constant);
const indicatorConstantData = Array.isArray(indicatorConstant.data) ? indicatorConstant.data : [];
assert.equal(asChartObject(indicatorConstantData[0]).value, 9876, "Indicator textValue should sync to chartData");
const indicatorIndicator = Array.isArray(indicatorChartData.indicator) ? indicatorChartData.indicator : [];
assert.equal(asChartObject(indicatorIndicator[0]).fieldName, "value", "Indicator indicator fieldName should be value");

// Gauge: value should sync to datasource.constantData[0].value
const gaugeCapability = getComponentCapability("Gauge");
assert.ok(Array.isArray(gaugeCapability.aiWritableProps), "Gauge capability has aiWritableProps");
const gaugeSchema = generateComponentsSchema({
  componentName: "Gauge",
  logicalId: "gauge_test",
  parentLogicalId: "sales_group",
  name: "测试仪表盘",
  value: 65,
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 400,
    height: 360,
  },
});
assert.equal(gaugeSchema.componentName, "Gauge");
const gaugeDatasource = asChartObject(gaugeSchema.props.datasource);
const gaugeConstantData = Array.isArray(gaugeDatasource.constantData) ? gaugeDatasource.constantData : [];
assert.equal(asChartObject(gaugeConstantData[0]).value, 65, "Gauge value should sync to datasource");
assert.equal(gaugeDatasource.sourceType, "constant", "Gauge datasource sourceType should be constant");

// CircularProgress: data should sync to datasource.constantData
const circularProgressCapability = getComponentCapability("CircularProgress");
assert.ok(Array.isArray(circularProgressCapability.aiWritableProps), "CircularProgress capability has aiWritableProps");
const circularProgressSchema = generateComponentsSchema({
  componentName: "CircularProgress",
  logicalId: "circular_progress_test",
  parentLogicalId: "sales_group",
  name: "测试环形进度图",
  data: [
    { name: "A", value: 30 },
    { name: "B", value: 70 },
  ],
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 500,
    height: 300,
  },
});
assert.equal(circularProgressSchema.componentName, "CircularProgress");
const circularProgressDatasource = asChartObject(circularProgressSchema.props.datasource);
const circularProgressConstantData = Array.isArray(circularProgressDatasource.constantData) ? circularProgressDatasource.constantData : [];
assert.equal(circularProgressConstantData.length, 2, "CircularProgress data should sync to datasource");
assert.equal(asChartObject(circularProgressConstantData[0]).name, "A", "CircularProgress first series name should be A");
assert.equal(asChartObject(circularProgressConstantData[1]).value, 70, "CircularProgress second series value should be 70");

// PercentageBar: value/max/min should sync to datasource.constantData[0]
const percentageBarCapability = getComponentCapability("PercentageBar");
assert.ok(Array.isArray(percentageBarCapability.aiWritableProps), "PercentageBar capability has aiWritableProps");
const percentageBarSchema = generateComponentsSchema({
  componentName: "PercentageBar",
  logicalId: "percentage_bar_test",
  parentLogicalId: "sales_group",
  name: "测试百分比条",
  value: 75,
  max: 200,
  min: 0,
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 800,
    height: 240,
  },
});
assert.equal(percentageBarSchema.componentName, "PercentageBar");
const percentageBarDatasource = asChartObject(percentageBarSchema.props.datasource);
const percentageBarConstantData = Array.isArray(percentageBarDatasource.constantData) ? percentageBarDatasource.constantData : [];
assert.equal(asChartObject(percentageBarConstantData[0]).value, 75, "PercentageBar value should sync to datasource");
assert.equal(asChartObject(percentageBarConstantData[0]).max, 200, "PercentageBar max should sync to datasource");
assert.equal(asChartObject(percentageBarConstantData[0]).min, 0, "PercentageBar min should sync to datasource");

// SingleValueChart: percentValue should sync to chartData.constant.data[0]["百分比"]
const singleValueChartCapability = getComponentCapability("SingleValueChart");
assert.ok(Array.isArray(singleValueChartCapability.aiWritableProps), "SingleValueChart capability has aiWritableProps");
const singleValueChartSchema = generateComponentsSchema({
  componentName: "SingleValueChart",
  logicalId: "single_value_chart_test",
  parentLogicalId: "sales_group",
  name: "测试单值占比图",
  percentValue: 88.8,
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 232,
    height: 196,
  },
});
assert.equal(singleValueChartSchema.componentName, "SingleValueChart");
const singleValueChartChartData = asChartObject(singleValueChartSchema.props.chartData);
const singleValueChartConstant = asChartObject(singleValueChartChartData.constant);
const singleValueChartConstantData = Array.isArray(singleValueChartConstant.data) ? singleValueChartConstant.data : [];
assert.equal(
  Number(asChartObject(singleValueChartConstantData[0])["百分比"]),
  88.8,
  "SingleValueChart percentValue should sync to chartData",
);

const defaultLineBoxTextSchema = generateComponentsSchema({
  componentName: "SingleText",
  logicalId: "single_line_label",
  parentLogicalId: "sales_group",
  textContent: "单行标签",
  style: {
    position: "absolute",
    left: 80,
    top: 150,
    width: 120,
    fontSize: 20,
    backgroundColor: "rgba(0,0,0,0)",
  },
});
const defaultLineBoxTextStyle = defaultLineBoxTextSchema.props.style as JsonObject;
assert.equal(defaultLineBoxTextStyle.height, 20);
assert.equal(defaultLineBoxTextStyle.lineHeight, 1);

const svgCapability = getComponentCapability("SvgDecoration");
assert.ok(Array.isArray(svgCapability.aiWritableProps));
const safeSvg =
  '<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><path d="M0 50 L100 0" stroke="#00E5FF" fill="none"/></svg>';
const svgSchema = generateComponentsSchema({
  componentName: "SvgDecoration",
  logicalId: "panel_corner_svg",
  parentLogicalId: "sales_group",
  name: "右上角科技装饰",
  style: {
    width: 120,
    height: 64,
    position: "absolute",
    left: 448,
    top: 96,
    backgroundColor: "rgba(0,0,0,0)",
  },
  svgSource: "custom",
  svgContent: safeSvg,
  primaryColor: "#00E5FF",
  glow: {
    isActive: true,
    color: "rgba(0,229,255,0.55)",
    blur: 8,
  },
});
assert.equal(svgSchema.componentName, "SvgDecoration");
assert.equal(svgSchema.props.svgSource, "custom");
assert.equal(svgSchema.props.svgContent, safeSvg);
assert.deepEqual(svgSchema.props.entryAnimiation, { isShow: false, type: "" });

const unsafeSvgSchema = generateComponentsSchema({
  componentName: "SvgDecoration",
  logicalId: "unsafe_svg",
  parentLogicalId: "sales_group",
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 100,
    height: 100,
  },
  svgSource: "custom",
  svgContent: "<svg><script>alert(1)</script></svg>",
});
assert.equal(unsafeSvgSchema.props.svgSource, "preset");

const svgChartSchema = generateComponentsSchema({
  componentName: "SvgDecoration",
  logicalId: "svg_chart_misuse",
  parentLogicalId: "sales_group",
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 320,
    height: 240,
  },
  svgSource: "custom",
  svgContent:
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 A40 40 0 0 1 90 50" fill="none"/><path d="M90 50 A40 40 0 0 1 50 90" fill="none"/></svg>',
});
assert.equal(svgChartSchema.props.svgSource, "preset");

const svgTextSchema = generateComponentsSchema({
  componentName: "SvgDecoration",
  logicalId: "svg_text_misuse",
  parentLogicalId: "sales_group",
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 320,
    height: 120,
  },
  svgSource: "custom",
  svgContent:
    '<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg"><text x="20" y="60">风险总量 386</text></svg>',
});
assert.equal(svgTextSchema.props.svgSource, "preset");

const panelSchemas = generateComponentsSchemas([
  imageSchema.props,
  textSchema.props,
  aiProps,
  svgSchema.props,
]);
assert.equal(panelSchemas.length, 4);
assert.deepEqual(
  panelSchemas.map((item) => item.indexNum),
  [1, 2, 3, 4],
);
assert.deepEqual(
  panelSchemas.map((item) => item.componentName),
  ["SingleText", "PieChart", "SvgDecoration", "SingleImage"],
  "batch component generation should place images below text, charts, and icons",
);

const modules = listModules();
assert.ok(
  modules.some((moduleItem) => moduleItem.moduleName === "ChartPanel"),
  "list_modules should include ChartPanel",
);

const moduleCapability = getModuleCapability("ChartPanel");
assert.ok(moduleCapability.slots, "ChartPanel capability should include slots");
const moduleLayoutRules = moduleCapability.layoutRules as string[];
const moduleLayoutRuleGroups = moduleCapability.layoutRuleGroups as JsonObject[];
assert.ok(
  Array.isArray(moduleLayoutRuleGroups),
  "ChartPanel capability should include grouped layout rules",
);
const layoutRuleGroupCategories = moduleLayoutRuleGroups.map(
  (group) => group.category,
);
assert.ok(
  layoutRuleGroupCategories.includes("legend"),
  "ChartPanel grouped rules should include legend category",
);
assert.ok(
  layoutRuleGroupCategories.includes("schema-output-layering"),
  "ChartPanel grouped rules should include schema output layering category",
);
assert.ok(
  layoutRuleGroupCategories.includes("side-summary-and-data-semantics"),
  "ChartPanel grouped rules should include side summary semantics category",
);
assert.ok(
  layoutRuleGroupCategories.includes("svg-decoration-structure"),
  "ChartPanel grouped rules should include SVG decoration structure category",
);
assert.ok(
  moduleLayoutRuleGroups.every((group) =>
    ["must", "should", "niceToHave"].includes(group.priority as string),
  ),
  "ChartPanel grouped rules should use known priority values",
);
assert.deepEqual(
  moduleLayoutRuleGroups.flatMap((group) => group.rules as string[]),
  moduleLayoutRules,
  "ChartPanel grouped rules should flatten to layoutRules for compatibility",
);
const legendRuleGroup = moduleLayoutRuleGroups.find(
  (group) => group.category === "legend",
);
assert.ok(
  (legendRuleGroup?.rules as string[] | undefined)?.some((rule) =>
    rule.includes("legend 默认必须保留"),
  ),
  "legend grouped rules should include default retention",
);
assert.ok(
  (legendRuleGroup?.rules as string[] | undefined)?.some((rule) =>
    rule.includes("预判 legend 是否会换行"),
  ),
  "legend grouped rules should include wrapping forecast",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("连续的主横线")),
  "ChartPanel should guide bottom decorations as one continuous structure line",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("面板框架的一部分")),
  "ChartPanel should guide decorations as panel frame elements",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("避免大面积高亮实色标题底板")),
  "ChartPanel should guide title structure without heavy filled title slabs",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("最终用户通常只会说")),
  "ChartPanel should cover terse end-user prompts",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("自动生成深色背景")),
  "ChartPanel should autonomously fill missing structure slots",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("最终用户通常不会主动提入场动画")),
  "ChartPanel should add restrained entry animations by default",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("ChartPanel 默认动画策略")),
  "ChartPanel should document default animation strategy",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("SingleImage") && rule.includes("遮盖")),
  "ChartPanel should keep image components below visible content",
);
assert.ok(
  moduleLayoutRules.some(
    (rule) => rule.includes("最长 50 个字符") && rule.includes("短随机段"),
  ),
  "ChartPanel should document backend id length and random segment requirements",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("不要太花")),
  "ChartPanel should interpret simple style requests without removing structure",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("不允许只输出裸标题")),
  "ChartPanel should forbid bare layouts even when concise",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("轻量线性承托")),
  "ChartPanel should prefer lightweight title support",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("亮色牌子")),
  "ChartPanel should avoid detached bright title slabs",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("填充透明度应低于 0.18")),
  "ChartPanel should constrain title support fill opacity",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("按语义选择实心饼图、环形图或细环")),
  "ChartPanel should guide semantic pie shape choices",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("不要固定套用某一张设计稿")),
  "ChartPanel should avoid fixed design comp parameters",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("中心总数") && rule.includes("排在 PieChart 之前")),
  "ChartPanel should keep center total text above PieChart",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("分工展示")),
  "ChartPanel should guide information role separation",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("数据复读")),
  "ChartPanel should prevent side summaries from merely repeating legend data",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("主体供给")),
  "ChartPanel should include energy-like semantic side summary examples",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("formatter: \"{b}\"")),
  "ChartPanel should prefer lighter pie labels when summaries carry values",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("show=true")),
  "ChartPanel should keep external pie labels visible but lightweight when side summaries carry values",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("legend 默认必须保留")),
  "ChartPanel should keep PieChart legend by default",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("朴素原生小圆点列表")),
  "ChartPanel should style legend beyond native plain dots",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("视觉重量必须低于主图")),
  "ChartPanel should keep legend visually subordinate",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("右侧信息卡不是 legend")),
  "ChartPanel should prevent side summary cards from being named as legends",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("标题不能压在边框线上")),
  "ChartPanel should keep side-card heading clear of the border",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("按摘要文本行的 top")),
  "ChartPanel should align side summary row rules from text row coordinates",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("预判 legend 是否会换行")),
  "ChartPanel should forecast legend wrapping from chart size and data items",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("主图数据必须和中心摘要")),
  "ChartPanel should require main chart data to match summary cards",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("保留原始分类名")),
  "ChartPanel should preserve source category labels in side summaries",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("分类名 + 数值 + 占比")),
  "ChartPanel should define side summary two-line text structure",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("正文区域宽度不低于 156px")),
  "ChartPanel should reserve enough side summary text width",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("客户来源")),
  "ChartPanel should include customer-source summary semantics",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("信息分工策略")),
  "ChartPanel should treat side cards as information hierarchy, not legend crowding fix",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("连接线应短、少、淡")),
  "ChartPanel should reduce connector line noise",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("只表达区域关联")),
  "ChartPanel should treat side-card connector lines as structural only",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("落到侧边信息卡左边缘")),
  "ChartPanel should anchor connector lines to the side-card edge",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("避免穿过环形图中心")),
  "ChartPanel should keep side-card connectors out of the donut center",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("底部结论默认使用主文本色")),
  "ChartPanel should keep bottom conclusions visually subordinate",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("底部结论默认是单行 SingleText")),
  "ChartPanel should keep bottom conclusion as a single-line text box",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("不能把结构感削没")),
  "ChartPanel should restore lightweight structure after visual dedupe",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("侧边摘要色标")),
  "ChartPanel should keep side summary color anchors visible",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("告警、预警、设备异常")),
  "ChartPanel should use alarm-specific wording outside risk scenes",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("两行排版")),
  "ChartPanel should adapt side-card rows for longer summary text",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("legend 预估行数收缩")),
  "ChartPanel should tighten pie labels according to estimated legend line count",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("高等级风险")),
  "ChartPanel should guide accurate risk wording",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("装饰透明度应主动降低")),
  "ChartPanel should keep decorations below key information",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("业务文本必须使用")),
  "ChartPanel should require real text components for business text",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("禁止用 SvgDecoration")),
  "ChartPanel should forbid SVG-drawn charts and text",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("不要因为禁止 SVG")),
  "ChartPanel should require decoration structures without SVG misuse",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("不使用 SVG 装饰")),
  "ChartPanel should not confuse SVG content bans with removing decorations",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("默认装饰必须肉眼可见")),
  "ChartPanel should require visible default SVG decorations",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("只能作为最低保底结构")),
  "ChartPanel should treat built-in default SVGs as fallback only",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("多个 ChartPanel 模块")),
  "ChartPanel should avoid reusing one default SVG look across many modules",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("结构原则而不是固定图形")),
  "ChartPanel should preserve design autonomy beyond fixed default SVG paths",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("信息卡外框")),
  "ChartPanel should guide side-card shells as decoration",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("裸文字和裸图表")),
  "ChartPanel should avoid bare text and bare chart outputs",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("禁止大面积高饱和纯色背景")),
  "ChartPanel should reject bright solid panel backgrounds",
);

const chartPanelInput = {
  moduleName: "ChartPanel",
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
assert.equal(moduleSchemas.length, 10);
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
  [
    "SingleText",
    "SingleText",
    "SvgDecoration",
    "SvgDecoration",
    "SvgDecoration",
    "SvgDecoration",
    "SvgDecoration",
    "SvgDecoration",
    "PieChart",
    "SingleImage",
  ],
);
assert.deepEqual(
  moduleSchemas.map((item) => item.indexNum),
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
);
assertRandomizedId(moduleSchemas[0]?.businessElementId ?? "", "title", "module title id");
assertRandomizedId(moduleSchemas[1]?.businessElementId ?? "", "aux_text_1", "module auxiliary text id");
assertRandomizedId(moduleSchemas[2]?.businessElementId ?? "", "title_badge", "module title badge id");
assertRandomizedId(moduleSchemas[3]?.businessElementId ?? "", "decoration_1", "module decoration 1 id");
assertRandomizedId(moduleSchemas[4]?.businessElementId ?? "", "decoration_2", "module decoration 2 id");
assertRandomizedId(moduleSchemas[5]?.businessElementId ?? "", "decoration_3", "module decoration 3 id");
assertRandomizedId(moduleSchemas[6]?.businessElementId ?? "", "decoration_4", "module decoration 4 id");
assertRandomizedId(moduleSchemas[7]?.businessElementId ?? "", "decoration_5", "module decoration 5 id");
assertRandomizedId(moduleSchemas[8]?.businessElementId ?? "", "main_chart", "module main chart id");
assertRandomizedId(moduleSchemas[9]?.businessElementId ?? "", "background", "module background id");
const moduleTextDatasource = moduleSchemas[0]?.props.datasource as JsonObject;
const moduleTextConstantData = moduleTextDatasource.constantData as JsonObject[];
const moduleTitleEntryAnimation = moduleSchemas[0]?.props.entryAnimiation as JsonObject;
assert.equal(moduleTextConstantData[0]?.text, "销售渠道占比");
assert.deepEqual(moduleTitleEntryAnimation, {
  isShow: true,
  type: "animate__fadeInLeft",
});
assert.equal(moduleSchemas[2]?.props.svgSource, "custom");
assert.equal(moduleSchemas[2]?.props.name, "标题背景点缀");
assert.equal(moduleSchemas[2]?.props.opacity, 0.72);
assert.deepEqual(moduleSchemas[2]?.props.entryAnimiation, {
  isShow: true,
  type: "animate__fadeInLeft",
});
assert.ok(
  !(moduleSchemas[2]?.props.svgContent as string).includes("<rect"),
  "title support should avoid filled rectangular slabs",
);
const moduleTitleStyle = moduleSchemas[0]?.props.style as JsonObject;
assert.equal(moduleTitleStyle.left, 72);
assert.equal(moduleTitleStyle.top, 114);
assert.equal(moduleTitleStyle.width, 472);
assert.equal(moduleTitleStyle.height, 22);
assert.equal(moduleTitleStyle.fontSize, 22);
assert.equal(moduleTitleStyle.lineHeight, 1);
const moduleTitleBadgeStyle = moduleSchemas[2]?.props.style as JsonObject;
assert.equal(moduleTitleBadgeStyle.left, 56);
assert.equal(moduleTitleBadgeStyle.top, 100);
assert.equal(moduleTitleBadgeStyle.width, 220);
assert.equal(moduleTitleBadgeStyle.height, 52);
assert.equal(moduleTitleBadgeStyle.zIndex, 16);
const moduleAuxText = moduleSchemas.find(
  (item) => item.businessElementId.includes("aux_text_1"),
);
assert.ok(moduleAuxText, "module should include auxiliary text");
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
const moduleBackground = moduleSchemas.find(
  (item) => item.businessElementId.includes("background"),
);
assert.ok(moduleBackground, "module should include background");
assert.equal(moduleBackground.props.imageBase64, "");
assert.equal(moduleBackground.props.imageUseMode, "upload");
assert.equal(moduleBackground.props.svgSource, "custom");
assert.equal(
  (moduleBackground.props.svgContent as string).includes("#00E5FF"),
  false,
  "default background should use theme-driven structure color instead of fixed cyan",
);
assert.deepEqual(moduleBackground.props.entryAnimiation, {
  isShow: false,
  type: "",
});
const moduleBackgroundStyle = moduleBackground.props.style as JsonObject;
assert.equal(moduleBackgroundStyle.backgroundColor, "rgba(4,16,32,0.96)");
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
assert.equal(moduleSchemas[3]?.props.svgSource, "custom");
assert.equal(typeof moduleSchemas[3]?.props.svgContent, "string");
assert.deepEqual(moduleSchemas[3]?.props.entryAnimiation, {
  isShow: true,
  type: "animate__fadeInLeft",
});
const moduleDecorationStyle = moduleSchemas[3]?.props.style as JsonObject;
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
assert.equal(moduleDecorationStyle.left, 372);
assert.equal(moduleDecorationStyle.top, 116);
assert.equal(moduleDecorationStyle.width, 180);
assert.equal(moduleDecorationStyle.height, 72);
assert.ok(
  moduleSchemas.some((item) => item.props.name === "侧边摘要容器"),
  "module should supplement visible side summary decoration",
);
assert.ok(
  moduleSchemas.some((item) => item.props.name === "侧边摘要分隔线"),
  "module should supplement side summary row-rule decoration",
);
assert.ok(
  moduleSchemas.some((item) => item.props.name === "主图侧卡关联线"),
  "module should supplement a subtle chart-to-side-card connector",
);
assert.ok(
  moduleSchemas.some((item) => item.props.name === "底部结构线"),
  "module should supplement visible bottom structure decoration",
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
assert.equal(noResourceBackground?.props.svgSource, "custom");

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

const terseUserPanelInput = {
  moduleName: "ChartPanel",
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
} satisfies JsonObject;
const terseUserPanelSchemas = generateModuleSchema(terseUserPanelInput);
const terseComponentNames = terseUserPanelSchemas.map((item) => item.componentName);
assert.equal(terseUserPanelSchemas.at(-1)?.componentName, "SingleImage");
assert.equal(terseUserPanelSchemas.at(-2)?.componentName, "PieChart");
assert.equal(
  terseComponentNames.filter((componentName) => componentName === "SvgDecoration").length,
  8,
  "terse input should include title support, structural decorations, connector, side row rules, and color anchors",
);
assert.ok(
  terseComponentNames.filter((componentName) => componentName === "SingleText").length >= 7,
  "terse input should still include title, center summary, side summaries, and conclusion",
);
const terseDecorations = terseUserPanelSchemas.filter(
  (item) => item.componentName === "SvgDecoration",
);
assert.ok(
  terseDecorations.every(
    (item) => !(item.props.svgContent as string | undefined)?.includes("currentColor"),
  ),
  "default module decorations should use explicit visible colors",
);
assert.ok(
  terseDecorations.some((item) => item.props.name === "侧边摘要容器"),
  "terse input should include visible side summary SVG container",
);
const terseSideContainer = terseDecorations.find(
  (item) => item.props.name === "侧边摘要容器",
);
const terseSideRowRules = terseDecorations.find(
  (item) => item.props.name === "侧边摘要分隔线",
);
assert.ok(terseSideContainer, "terse input should include side summary container");
assert.ok(terseSideRowRules, "terse input should include side summary row-rule decoration");
assert.equal(
  ((terseSideContainer.props.svgContent as string | undefined) ?? "").includes("M22 58H258"),
  false,
  "side summary container should not bake fixed row rules into its background SVG",
);
assert.ok(
  terseDecorations.some((item) => item.props.name === "主图侧卡关联线"),
  "terse input should include subtle chart-to-side-card connector",
);
const terseSideConnector = terseDecorations.find(
  (item) => item.props.name === "主图侧卡关联线",
);
assert.ok(terseSideConnector, "terse input should include chart-to-side-card connector");
assert.ok(
  (terseSideConnector.props.opacity as number) >= 0.5,
  "chart-to-side-card connector should stay visible enough to show structure",
);
assert.ok(
  terseDecorations.some((item) => item.props.name === "底部结构线"),
  "terse input should include visible bottom SVG structure line",
);
assert.equal(
  terseDecorations.filter((item) =>
    typeof item.props.name === "string" && item.props.name.startsWith("侧边摘要色标"),
  ).length,
  3,
  "terse input should include side summary color anchors",
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
const terseSideSummary2Style = terseSideSummary2.props.style as JsonObject;
const terseSideContainerStyle = terseSideContainer.props.style as JsonObject;
const terseSideConnectorStyle = terseSideConnector.props.style as JsonObject;
const terseSideRowRulesStyle = terseSideRowRules.props.style as JsonObject;
assert.ok(
  (terseSideContainerStyle.height as number) <= 180,
  "side summary container should stay compact for three single-line summaries",
);
assert.ok(
  Math.abs(
    ((terseSideConnectorStyle.left as number) + (terseSideConnectorStyle.width as number)) -
      ((terseSideContainerStyle.left as number) + 22),
  ) <= 2,
  "chart-to-side-card connector should reach the side-card left edge",
);
assert.equal(
  terseSideRowRulesStyle.top,
  (terseSideSummary1Style.top as number) +
    (terseSideSummary1Style.height as number) +
    Math.max(
      ((terseSideSummary2Style.top as number) -
        (terseSideSummary1Style.top as number) -
        (terseSideSummary1Style.height as number)) /
        2 -
        4,
      0,
    ),
  "side summary row-rule decoration should align between text rows",
);
assert.ok(
  terseTexts.includes("处置建议"),
  "terse input should label side card as treatment advice instead of legend",
);
assert.ok(
  terseTexts.includes("高风险 18  14.3% 优先处置"),
  "terse input should derive side summary from dataItems",
);
assert.ok(
  terseTexts.includes("处置优先级：高风险项优先闭环，中风险项限期整改，低风险项常规跟踪"),
  "terse input should derive risk conclusion",
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
  (item) => item.props.name === "底部结论",
);
const terseBottomLine = terseUserPanelSchemas.find(
  (item) => item.props.name === "底部结构线",
);
assert.ok(terseConclusion, "terse input should include conclusion text");
assert.ok(terseBottomLine, "terse input should include bottom structure line");
const terseConclusionStyle = terseConclusion.props.style as JsonObject;
const terseBottomLineStyle = terseBottomLine.props.style as JsonObject;
const terseChartStyle = terseChart.props.style as JsonObject;
assert.ok(
  (terseChartStyle.height as number) >= 320,
  "left main chart area should be tall enough after reducing bottom padding",
);
assert.equal(terseConclusionStyle.height, 14);
assert.equal(terseConclusionStyle.fontSize, 14);
assert.equal(terseConclusionStyle.lineHeight, 1);
assert.ok(
  (terseConclusionStyle.top as number) + (terseConclusionStyle.height as number) <=
    (terseBottomLineStyle.top as number),
  "bottom conclusion should not overlap bottom structure line",
);
assert.ok(
  (terseChartStyle.top as number) + (terseChartStyle.height as number) + 12 <=
    (terseConclusionStyle.top as number),
  "chart and legend region should leave vertical space before conclusion",
);
assert.ok(
  (terseSideContainerStyle.top as number) + (terseSideContainerStyle.height as number) + 28 <=
    (terseConclusionStyle.top as number),
  "bottom conclusion should keep a safe gap from the side summary card",
);
assert.ok(
  Math.abs(
    ((terseBottomLineStyle.top as number) -
      ((terseConclusionStyle.top as number) + (terseConclusionStyle.height as number))) -
      12,
  ) <= 2,
  "bottom conclusion should sit close to the bottom structure line with a visible gap",
);
assert.equal(
  terseConclusionStyle.color,
  "#DFF8FF",
  "bottom conclusion should use normal text color instead of full-line accent highlight",
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
  (item) => item.props.name === "风险总数说明",
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
const terseBackground = terseUserPanelSchemas.find(
  (item) => item.businessElementId.includes("background"),
);
assert.ok(terseBackground, "terse input should get a default background");
assert.equal(terseBackground.props.svgSource, "custom");
assert.deepEqual(terseChart.props.entryAnimiation, {
  isShow: true,
  type: "animate__zoomIn",
});

const customerSourcePanelInput = {
  moduleName: "ChartPanel",
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
  customerSourceTexts.includes("线上广告 86  43% 主要获客"),
  "customer source panel should keep fitting source summaries on one line",
);
assert.ok(
  customerSourceTexts.includes("老客户推荐 54  27% 口碑转化"),
  "customer source panel should use customer-source semantics",
);
assert.ok(
  customerSourceTexts.includes("门店自然到访 37  18.5% 自然流量"),
  "customer source panel should preserve original category names",
);
assert.ok(
  customerSourceTexts.includes("线上广告贡献最高，活动引流仍有提升空间"),
  "customer source panel should use business-like conclusion wording",
);
assert.equal(
  customerSourceTexts.some((text) => typeof text === "string" && text.includes("门店到访")),
  false,
  "customer source panel should not rewrite source category names",
);
const customerSideText = customerSourceSchemas.find(
  (item) => item.props.name === "侧边摘要1",
);
const customerSideContainer = customerSourceSchemas.find(
  (item) => item.props.name === "侧边摘要容器",
);
const customerChart = customerSourceSchemas.find(
  (item) => item.componentName === "PieChart",
);
assert.ok(customerSideText, "customer source panel should include side summary text");
assert.ok(customerSideContainer, "customer source panel should include side container");
assert.ok(customerChart, "customer source panel should include chart");
const customerSideTextStyle = customerSideText.props.style as JsonObject;
const customerSideContainerStyle = customerSideContainer.props.style as JsonObject;
const customerChartOption = customerChart.props.option as JsonObject;
const customerChartSeries = customerChartOption.series as JsonObject[];
const customerChartLabel = customerChartSeries[0]?.label as JsonObject;
const customerChartLabelLine = customerChartSeries[0]?.labelLine as JsonObject;
assert.ok(
  !((customerSideText.props.textContent as string | undefined) ?? "").includes("\n"),
  "customer source side summary should not wrap when the single-line text fits",
);
assert.ok(
  (customerSideContainerStyle.width as number) >= 300,
  "customer source side container should reserve wider text space",
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
assert.equal(energyLegend.itemGap, 14);
assert.equal(energyLegend.itemWidth, 14);
assert.equal(energyLegend.itemHeight, 8);
assert.equal(energyLegendTextStyle.fontSize, 12);
assert.equal(energyLegend.offsetY, -10);
assert.deepEqual(energyFirstSeries.center, ["50%", "39%"]);
assert.deepEqual(energyFirstSeries.radius, ["34%", "50%"]);
assert.equal(energyLabel.fontSize, 10);
assert.equal(energyLabelLine.length, 6);
assert.equal(energyLabelLine.length2, 3);

const cleanEnergyPanel = generateScreenModuleFromPrompt({
  prompt: "做个新能源发电结构分析模块，光伏发电48，风力发电31，储能放电14，外购绿电7。偏绿色科技风。",
  style: {
    left: 24,
    top: 30,
    width: 1060,
    height: 600,
  },
});
const cleanEnergyChart = cleanEnergyPanel.children.find(
  (item) => item.componentName === "PieChart",
);
assert.ok(cleanEnergyChart, "clean energy prompt should generate a chart");
const cleanEnergySideContainer = cleanEnergyPanel.children.find(
  (item) => item.props.name === "侧边摘要容器",
);
const cleanEnergyConclusion = cleanEnergyPanel.children.find(
  (item) => item.props.name === "底部结论",
);
const cleanEnergySideSummary1 = cleanEnergyPanel.children.find(
  (item) => item.props.name === "侧边摘要1",
);
const cleanEnergySideSummary2 = cleanEnergyPanel.children.find(
  (item) => item.props.name === "侧边摘要2",
);
const cleanEnergySideSummary3 = cleanEnergyPanel.children.find(
  (item) => item.props.name === "侧边摘要3",
);
const cleanEnergyConnector = cleanEnergyPanel.children.find(
  (item) => item.props.name === "主图侧卡关联线",
);
const cleanEnergySideMarker1 = cleanEnergyPanel.children.find(
  (item) => item.props.name === "侧边摘要色标1",
);
assert.ok(cleanEnergySideContainer, "clean energy prompt should generate side summary card");
assert.ok(cleanEnergyConclusion, "clean energy prompt should generate bottom conclusion");
assert.ok(cleanEnergySideSummary1, "clean energy prompt should generate first side summary");
assert.ok(cleanEnergySideSummary2, "clean energy prompt should generate second side summary");
assert.ok(cleanEnergySideSummary3, "clean energy prompt should generate third side summary");
assert.ok(cleanEnergyConnector, "clean energy prompt should generate side-card connector");
assert.ok(cleanEnergySideMarker1, "clean energy prompt should keep side summary color anchors");
const cleanEnergySideStyle = cleanEnergySideContainer.props.style as JsonObject;
const cleanEnergyConclusionStyle = cleanEnergyConclusion.props.style as JsonObject;
const cleanEnergyConnectorStyle = cleanEnergyConnector.props.style as JsonObject;
const cleanEnergyChartStyle = cleanEnergyChart.props.style as JsonObject;
const cleanEnergySideMarker1Style = cleanEnergySideMarker1.props.style as JsonObject;
const cleanEnergySideSummary1Style = cleanEnergySideSummary1.props.style as JsonObject;
assert.ok(
  (cleanEnergySideStyle.height as number) <= 230,
  "clean energy side summary card should stay compact after restoring structure",
);
assert.ok(
  (cleanEnergySideStyle.top as number) + (cleanEnergySideStyle.height as number) + 28 <=
    (cleanEnergyConclusionStyle.top as number),
  "prompt-generated conclusion should not sit too close to the side summary artwork",
);
assert.equal(cleanEnergyConclusionStyle.height, 14);
assert.equal(cleanEnergyConclusionStyle.lineHeight, 1);
assert.ok(
  ((cleanEnergySideSummary1.props.textContent as string | undefined) ?? "").includes("主体供给"),
  "clean energy side summary should add business judgement beyond value repetition",
);
assert.ok(
  ((cleanEnergySideSummary2.props.textContent as string | undefined) ?? "").includes("主体供给"),
  "clean energy wind summary should identify supply role",
);
assert.ok(
  ((cleanEnergySideSummary3.props.textContent as string | undefined) ?? "").includes("调峰支撑"),
  "clean energy storage summary should identify peak-shaving support role",
);
assert.ok(
  Math.abs(
    ((cleanEnergyConnectorStyle.left as number) + (cleanEnergyConnectorStyle.width as number)) -
      ((cleanEnergySideStyle.left as number) + 22),
  ) <= 2,
  "clean energy connector should visually reach the side summary card",
);
assert.ok(
  (cleanEnergyConnectorStyle.left as number) >=
    (cleanEnergyChartStyle.left as number) + (cleanEnergyChartStyle.width as number) * 0.7,
  "clean energy connector should start from the chart outer-side region instead of crossing the donut center",
);
assert.equal(
  cleanEnergyConclusionStyle.color,
  "#E7FFF5",
  "clean energy conclusion should use the green theme text color, not a full-line accent color",
);
assert.ok(
  (cleanEnergySideMarker1Style.left as number) <
    (cleanEnergySideSummary1Style.left as number),
  "side summary color anchor should sit before the matching side summary text",
);
const cleanEnergyOption = cleanEnergyChart.props.option as JsonObject;
const cleanEnergySeries = cleanEnergyOption.series as JsonObject[];
const cleanEnergyLabel = cleanEnergySeries[0]?.label as JsonObject;
assert.equal(
  cleanEnergyLabel.show,
  true,
  "clean energy prompt should keep external pie labels visible but lightweight",
);
assert.deepEqual(
  cleanEnergySeries[0]?.radius,
  ["34%", "64%"],
  "single-line-safe legend should enlarge the pie body enough to keep main visual weight",
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
const redComplaintChart = redComplaintPanel.children.find(
  (item) => item.componentName === "PieChart",
);
const redComplaintChartIndex = redComplaintPanel.children.findIndex(
  (item) => item.componentName === "PieChart",
);
const redComplaintSideContainer = redComplaintPanel.children.find(
  (item) => item.props.name === "侧边摘要容器",
);
const redComplaintSideSummary1 = redComplaintPanel.children.find(
  (item) => item.props.name === "侧边摘要1",
);
const redComplaintTotal = redComplaintPanel.children.find(
  (item) => item.props.name === "总数",
);
const redComplaintTotalIndex = redComplaintPanel.children.findIndex(
  (item) => item.props.name === "总数",
);
assert.ok(redComplaintChart, "red complaint prompt should generate PieChart");
assert.ok(redComplaintSideContainer, "red complaint prompt should generate side summary card");
assert.ok(redComplaintSideSummary1, "red complaint prompt should generate side summary text");
assert.ok(redComplaintTotal, "red complaint prompt should generate center total text");
const redComplaintChartProps = redComplaintChart.props as JsonObject;
const redComplaintChartStyle = redComplaintChartProps.style as JsonObject;
const redComplaintOption = redComplaintChartProps.option as JsonObject;
const redComplaintLegend = redComplaintOption.legend as JsonObject;
const redComplaintSeries = redComplaintOption.series as JsonObject[];
const redComplaintFirstSeries = redComplaintSeries[0] as JsonObject;
const redComplaintSideStyle = redComplaintSideContainer.props.style as JsonObject;
const redComplaintSideSummary1Style = redComplaintSideSummary1.props.style as JsonObject;
const redComplaintTotalStyle = redComplaintTotal.props.style as JsonObject;
assert.equal((redComplaintOption.color as string[])[0], "#FF2D4F");
assert.equal((redComplaintLegend.textStyle as JsonObject).color, "#FFF3F3");
assert.ok(
  redComplaintTotalIndex < redComplaintChartIndex,
  "center total text should be emitted before PieChart so it stays above the chart layer",
);
assert.ok(
  (redComplaintChartStyle.left as number) +
    (redComplaintChartStyle.width as number) +
    12 <=
    (redComplaintSideStyle.left as number),
  "red complaint chart should stay inside the left main area instead of entering the side card",
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
assert.deepEqual(redComplaintCenter, ["50%", "42%"]);
assert.deepEqual(redComplaintFirstSeries.radius, ["34%", "54%"]);
assert.equal((redComplaintFirstSeries.label as JsonObject).show, true);
assert.equal((redComplaintFirstSeries.label as JsonObject).formatter, "{b}");
assert.equal(redComplaintSideSummary1Style.height, 14);
assert.equal(redComplaintSideSummary1Style.fontSize, 14);
assert.equal(redComplaintSideSummary1Style.lineHeight, 1);
assert.ok(
  !((redComplaintSideSummary1.props.textContent as string | undefined) ?? "").includes("\n"),
  "red complaint single-line side summary should not use a two-line 52px text box",
);

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
  mergedSummaryRawText,
  undefined,
  "MCP should remove merged side-summary paragraph text",
);
assert.ok(mergedSummaryHeader, "MCP should regenerate an independent side summary header");
assert.equal(
  mergedSummaryRows.length,
  3,
  "MCP should regenerate independent side summary rows from data",
);
for (const row of mergedSummaryRows) {
  const rowStyle = row.props.style as JsonObject;
  assert.ok(
    rowStyle.height === 14 || rowStyle.height === 40,
    "regenerated side summary rows should use controlled line boxes",
  );
}

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
assert.ok(
  customDecorationNames.includes("侧边摘要容器"),
  "MCP should supplement side-card decoration when custom decorations omit it",
);
assert.ok(
  customDecorationNames.includes("底部结构线"),
  "MCP should supplement bottom structure decoration when custom decorations omit it",
);

const alarmPanelInput = {
  moduleName: "ChartPanel",
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
assert.ok(alarmTexts.includes("告警总数"), "alarm panel should label center total correctly");
assert.ok(alarmTexts.includes("重点摘要"), "alarm panel should use summary heading");
assert.ok(
  alarmTexts.includes("严重告警 12  8.5%\n优先处理"),
  "alarm panel should use two-line severe alarm summary",
);
assert.ok(
  alarmTexts.includes("一般告警 46  32.6%\n持续跟进"),
  "alarm panel should use alarm-specific action text",
);
assert.ok(
  alarmTexts.includes("提示告警 83  58.9%\n常规关注"),
  "alarm panel should use alarm-specific prompt action text",
);
assert.ok(
  alarmTexts.includes("当前共 141 条告警，严重告警占 8.5%，建议优先处理"),
  "alarm panel should use concise alarm conclusion",
);
assert.equal(
  alarmTexts.some((text) => typeof text === "string" && /风险总数|限期整改|常规跟踪/.test(text)),
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
  (item) => item.props.name === "底部结论",
);
const alarmBottomLine = alarmPanelSchemas.find(
  (item) => item.props.name === "底部结构线",
);
assert.ok(alarmSideContainer, "alarm panel should include side summary container");
assert.ok(alarmSideFirstText, "alarm panel should include first side summary");
assert.ok(alarmSideLastText, "alarm panel should include last side summary");
assert.ok(alarmConclusion, "alarm panel should include bottom conclusion");
assert.ok(alarmBottomLine, "alarm panel should include bottom structure line");
const alarmSideContainerStyle = alarmSideContainer.props.style as JsonObject;
const alarmSideFirstStyle = alarmSideFirstText.props.style as JsonObject;
const alarmSideLastStyle = alarmSideLastText.props.style as JsonObject;
const alarmConclusionStyle = alarmConclusion.props.style as JsonObject;
const alarmBottomLineStyle = alarmBottomLine.props.style as JsonObject;
assert.ok(
  (alarmSideFirstStyle.height as number) >= 36 &&
    (alarmSideFirstStyle.height as number) <= 44,
  "alarm side rows should reserve compact two-line text height",
);
assert.ok(
  (alarmSideLastStyle.top as number) + (alarmSideLastStyle.height as number) <=
    (alarmSideContainerStyle.top as number) + (alarmSideContainerStyle.height as number),
  "alarm side summaries should fit inside side container",
);
assert.ok(
  alarmConclusionStyle.height === 14 && alarmConclusionStyle.lineHeight === 1,
  "alarm conclusion should use a single-line text box",
);
assert.ok(
  (alarmConclusionStyle.top as number) + (alarmConclusionStyle.height as number) <=
    (alarmBottomLineStyle.top as number),
  "alarm conclusion should not overlap bottom structure line",
);
assert.ok(
  (alarmSideContainerStyle.top as number) + (alarmSideContainerStyle.height as number) + 28 <=
    (alarmConclusionStyle.top as number),
  "alarm conclusion should keep distance from the side summary card",
);

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
  sideLegendTextContents.includes("处置建议"),
  "explicit side legend wording should be normalized to treatment advice",
);
assert.equal(
  [...sideLegendTextContents, ...sideLegendTextNames].some(
    (value) => typeof value === "string" && value.includes("图例"),
  ),
  false,
  "side-card text and names should not use legend wording",
);

const promptGeneratedTree = generateScreenModuleFromPrompt({
  prompt: "做个风险等级分析，数据：高风险18，中风险37，低风险71。深色科技风，简洁点。",
  style: {
    left: 120,
    top: 120,
    width: 840,
    height: 520,
  },
});
assert.equal(promptGeneratedTree.componentName, "__Group__");
assert.equal(promptGeneratedTree.title, "风险等级分析");
const promptGeneratedChart = promptGeneratedTree.children.find(
  (item) => item.componentName === "PieChart",
);
assert.ok(promptGeneratedChart, "prompt entry should generate a real PieChart");
const promptGeneratedOption = promptGeneratedChart.props.option as JsonObject;
const promptGeneratedLegend = promptGeneratedOption.legend as JsonObject;
const promptGeneratedSeries = promptGeneratedOption.series as JsonObject[];
const promptGeneratedLabel = promptGeneratedSeries[0]?.label as JsonObject;
assert.equal(promptGeneratedLegend.show, true);
assert.equal(promptGeneratedLegend.icon, "roundRect");
assert.equal(promptGeneratedLegend.backgroundColor, "rgba(0, 229, 255, 0.055)");
const promptGeneratedLegendTextStyle = promptGeneratedLegend.textStyle as JsonObject;
assert.equal(promptGeneratedLegendTextStyle.fontWeight, "normal");
assert.equal(promptGeneratedLabel.show, true);
assert.equal(promptGeneratedLabel.formatter, "{b}");
assert.equal(promptGeneratedLabel.fontWeight, "normal");
const promptGeneratedChartData = promptGeneratedChart.props.chartData as JsonObject;
const promptGeneratedConstant = promptGeneratedChartData.constant as JsonObject;
assert.deepEqual(promptGeneratedConstant.data, [
  { name: "高风险", type: "风险", value: 18 },
  { name: "中风险", type: "风险", value: 37 },
  { name: "低风险", type: "风险", value: 71 },
]);
const promptGeneratedTexts = promptGeneratedTree.children
  .filter((item) => item.componentName === "SingleText")
  .map((item) => item.props.textContent);
assert.ok(
  promptGeneratedTexts.includes("处置建议"),
  "prompt entry should include side treatment-advice heading",
);
assert.equal(
  promptGeneratedTexts.some((text) => typeof text === "string" && text.includes("图例")),
  false,
  "prompt entry should not call side summary a legend",
);

const moduleTreeSchema = generateModuleTreeSchema(chartPanelInput);
assertRandomizedId(
  moduleTreeSchema.id,
  "sales_channel_panel",
  "module tree group id",
);
assert.equal(moduleTreeSchema.componentName, "__Group__");
assert.equal(moduleTreeSchema.structVersion, "0.0.0");
assert.deepEqual(moduleTreeSchema.props, {});
assert.equal(moduleTreeSchema.title, "销售渠道占比");
assert.equal(moduleTreeSchema.isHidden, false);
assert.equal(moduleTreeSchema.isLocked, false);
assert.equal(moduleTreeSchema.isGroup, true);
assert.equal(moduleTreeSchema.children.length, 10);
assert.deepEqual(
  moduleTreeSchema.children.map((item) => item.componentName),
  [
    "SingleText",
    "SingleText",
    "SvgDecoration",
    "SvgDecoration",
    "SvgDecoration",
    "SvgDecoration",
    "SvgDecoration",
    "SvgDecoration",
    "PieChart",
    "SingleImage",
  ],
);
assertUniqueIds(
  [moduleTreeSchema.id, ...moduleTreeSchema.children.map((item) => item.id)],
  "module tree ids should be unique",
);
assert.ok(
  moduleTreeSchema.children.every(
    (item) => (item.props.parentLogicalId as string | undefined) === moduleTreeSchema.id,
  ),
  "module tree child parentLogicalId should reference randomized group id",
);
assertRandomizedId(moduleTreeSchema.children[8]?.id ?? "", "main_chart", "module tree chart id");
assertRandomizedId(moduleTreeSchema.children[0]?.id ?? "", "title", "module tree title id");
assert.equal(moduleTreeSchema.children[0]?.isGroup, false);
assert.equal(moduleTreeSchema.children[0]?.structVersion, "0.0.2");
assert.equal(
  (moduleTreeSchema.children[0]?.props as JsonObject).logicalId,
  moduleTreeSchema.children[0]?.id,
);

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

try {
  const tools = await client.listTools();
  assert.ok(
    tools.tools.some((tool) => tool.name === "get_server_diagnostics"),
    "MCP server should expose diagnostics",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "list_components"),
    "MCP server should expose list_components",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "get_component_capability"),
    "MCP server should expose get_component_capability",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "generate_components_schema"),
    "MCP server should expose generate_components_schema",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "generate_components_schemas"),
    "MCP server should expose generate_components_schemas",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "list_modules"),
    "MCP server should expose list_modules",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "get_module_capability"),
    "MCP server should expose get_module_capability",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "generate_module_schema"),
    "MCP server should expose generate_module_schema",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "generate_module_tree_schema"),
    "MCP server should expose generate_module_tree_schema",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "generate_screen_module_from_prompt"),
    "MCP server should expose natural-language screen module entry",
  );
  const serverInstructions = client.getInstructions();
  assert.ok(
    serverInstructions?.includes("instead of generating HTML"),
    "MCP server instructions should steer dashboard requests away from HTML generation",
  );
  assert.ok(
    serverInstructions?.includes("完整schema") &&
      serverInstructions.includes("complete JSON") &&
      serverInstructions.includes("fenced json code block"),
    "MCP server instructions should require complete schema output when requested",
  );
  const promptEntryTool = tools.tools.find(
    (tool) => tool.name === "generate_screen_module_from_prompt",
  );
  assert.ok(
    promptEntryTool?.description?.includes("做个风险等级分析"),
    "prompt entry tool should be discoverable for terse Chinese dashboard requests",
  );
  assert.ok(
    promptEntryTool?.description?.includes("完整schema") &&
      promptEntryTool.description.includes("complete schema") &&
      promptEntryTool.description.includes("complete returned JSON object"),
    "prompt entry tool should require full JSON output when user asks for complete schema",
  );
  const moduleTreeTool = tools.tools.find(
    (tool) => tool.name === "generate_module_tree_schema",
  );
  assert.ok(
    moduleTreeTool?.description?.includes("complete returned JSON object") &&
      moduleTreeTool.description.includes("not a summary"),
    "module tree tool should require complete JSON output when user asks for full schema",
  );

  const diagnosticsResult = await client.callTool({
    name: "get_server_diagnostics",
    arguments: {},
  });
  assert.equal(diagnosticsResult.isError, undefined);
  const diagnostics = readToolJson(diagnosticsResult);
  assert.equal(diagnostics.serverName, "screen-component-mcp");
  assert.equal(diagnostics.serverVersion, "0.1.0");
  assert.equal(
    diagnostics.rulesVersion,
    "2026-06-12.12-remove-demo-chart",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("complete-schema-response-contract"),
    "diagnostics should expose active rules fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("pie-legend-offset"),
    "diagnostics should expose pie legend offset rule fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("pie-center-radius-layout"),
    "diagnostics should expose pie center/radius layout rule fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("pie-legend-wrap-forecast"),
    "diagnostics should expose pie legend wrap forecast rule fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("side-summary-svg-row-rules"),
    "diagnostics should expose side summary svg row-rule fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("single-line-legend-pie-scale"),
    "diagnostics should expose single-line legend pie scale fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("bottom-conclusion-side-card-spacing"),
    "diagnostics should expose bottom conclusion side-card spacing fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("summary-sticker-conclusion-gap"),
    "diagnostics should expose summary sticker conclusion gap fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("semantic-side-summary"),
    "diagnostics should expose semantic side summary fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("side-card-connector-anchor"),
    "diagnostics should expose side-card connector anchor fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("side-summary-label-dedupe"),
    "diagnostics should expose side summary label dedupe fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("bottom-conclusion-muted-weight"),
    "diagnostics should expose bottom conclusion muted weight fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("light-structure-restore"),
    "diagnostics should expose lightweight structure restore fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("side-summary-color-anchors"),
    "diagnostics should expose side summary color anchor fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("default-svg-fallback-only"),
    "diagnostics should expose default SVG fallback-only fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("single-text-line-box"),
    "diagnostics should expose single text line-box fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("pie-main-area-alignment"),
    "diagnostics should expose pie main-area alignment fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("visible-pie-labels"),
    "diagnostics should expose visible pie labels fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("single-line-side-summary-height"),
    "diagnostics should expose single-line side summary height fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("structured-side-summary-texts"),
    "diagnostics should expose structured side summary texts fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("center-total-above-pie"),
    "diagnostics should expose center total above pie fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("bottom-conclusion-single-line-box"),
    "diagnostics should expose bottom conclusion single-line box fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("larger-main-chart-safe-area"),
    "diagnostics should expose larger main chart safe area fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("multi-panel-decoration-diversity"),
    "diagnostics should expose multi-panel decoration diversity fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("center-summary-text-spacing"),
    "diagnostics should expose center summary text spacing fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("component-id-max-50-randomized"),
    "diagnostics should expose randomized component id fingerprint",
  );
  assert.equal(
    typeof (diagnostics.process as JsonObject).pid,
    "number",
    "diagnostics should expose process pid",
  );
  assert.ok(
    ((diagnostics.process as JsonObject).cwd as string).endsWith("screen-mcp"),
    "diagnostics should expose server cwd",
  );
  assert.ok(
    ((diagnostics.source as JsonObject).entryFile as string).endsWith("src\\server.ts") ||
      ((diagnostics.source as JsonObject).entryFile as string).endsWith("src/server.ts"),
    "diagnostics should expose server entry file",
  );

  const listResult = await client.callTool({
    name: "list_components",
    arguments: {},
  });
  const listedComponents = readToolJson(listResult);
  assert.ok(
    listedComponents.some(
      (component: JsonObject) => component.componentName === "PieChart",
    ),
    "MCP list_components should include PieChart",
  );
  assert.ok(
    listedComponents.some(
      (component: JsonObject) => component.componentName === "SingleImage",
    ),
    "MCP list_components should include SingleImage",
  );
  assert.ok(
    listedComponents.some(
      (component: JsonObject) => component.componentName === "SingleText",
    ),
    "MCP list_components should include SingleText",
  );
  assert.ok(
    listedComponents.some(
      (component: JsonObject) => component.componentName === "SvgDecoration",
    ),
    "MCP list_components should include SvgDecoration",
  );

  const capabilityResult = await client.callTool({
    name: "get_component_capability",
    arguments: { componentName: "PieChart" },
  });
  const mcpCapability = readToolJson(capabilityResult);
  assert.ok(
    Array.isArray(mcpCapability.requiredProps),
    "MCP capability has requiredProps",
  );
  assert.ok(
    Array.isArray(mcpCapability.aiWritableProps),
    "MCP capability has aiWritableProps",
  );
  assert.ok(
    Array.isArray(mcpCapability.aiForbiddenProps),
    "MCP capability has aiForbiddenProps",
  );
  assert.ok(Array.isArray(mcpCapability.examples), "MCP capability has examples");
  const writableProps = mcpCapability.aiWritableProps as JsonObject[];
  const legendCapability = writableProps.find(
    (item) => item.path === "option.legend",
  ) as JsonObject | undefined;
  assert.ok(legendCapability, "MCP capability should describe option.legend");
  assert.ok(
    legendCapability.positionRules,
    "MCP capability should describe legend position rules",
  );

  const toolResult = await client.callTool({
    name: "generate_components_schema",
    arguments: aiProps,
  });
  assert.equal(toolResult.isError, undefined);
  const toolSchema = readToolJson(toolResult);
  assert.equal(toolSchema.props.chartData.sourceType, "constant");
  assert.equal("title" in toolSchema.props.option, false);
  assert.equal(toolSchema.props.option.series[0].type, "pie");
  assert.deepEqual(toolSchema.props.option.series[0].radius, inputFirstSeries.radius);

  const schemasResult = await client.callTool({
    name: "generate_components_schemas",
    arguments: {
      componentsProps: [imageSchema.props, textSchema.props, aiProps, svgSchema.props],
    },
  });
  assert.equal(schemasResult.isError, undefined);
  const toolSchemas = readToolJson(schemasResult);
  assert.equal(toolSchemas.length, 4);
  assert.deepEqual(
    toolSchemas.map((item: JsonObject) => item.componentName),
    ["SingleText", "PieChart", "SvgDecoration", "SingleImage"],
    "MCP batch component generation should place images below text, charts, and icons",
  );

  const moduleListResult = await client.callTool({
    name: "list_modules",
    arguments: {},
  });
  const listedModules = readToolJson(moduleListResult);
  assert.ok(
    listedModules.some(
      (moduleItem: JsonObject) => moduleItem.moduleName === "ChartPanel",
    ),
    "MCP list_modules should include ChartPanel",
  );

  const moduleCapabilityResult = await client.callTool({
    name: "get_module_capability",
    arguments: { moduleName: "ChartPanel" },
  });
  const mcpModuleCapability = readToolJson(moduleCapabilityResult);
  assert.ok(mcpModuleCapability.slots, "MCP module capability should include slots");
  assert.equal(
    (mcpModuleCapability.groupSchema as JsonObject).componentName,
    "__Group__",
  );

  const moduleSchemaResult = await client.callTool({
    name: "generate_module_schema",
    arguments: chartPanelInput,
  });
  assert.equal(moduleSchemaResult.isError, undefined);
  const toolModuleSchemas = readToolJson(moduleSchemaResult);
  assert.equal(toolModuleSchemas.length, 10);
  assert.equal(toolModuleSchemas[0].componentName, "SingleText");
  assert.equal(toolModuleSchemas[1].componentName, "SingleText");
  assert.equal(toolModuleSchemas[2].componentName, "SvgDecoration");
  assert.equal(toolModuleSchemas[3].componentName, "SvgDecoration");
  assert.equal(toolModuleSchemas[4].componentName, "SvgDecoration");
  assert.equal(toolModuleSchemas[5].componentName, "SvgDecoration");
  assert.equal(toolModuleSchemas[6].componentName, "SvgDecoration");
  assert.equal(toolModuleSchemas[7].componentName, "SvgDecoration");
  assert.equal(toolModuleSchemas[8].componentName, "PieChart");
  assert.equal(toolModuleSchemas[9].componentName, "SingleImage");
  assert.ok(
    toolModuleSchemas.some((item: JsonObject) => hasPropName(item, "侧边摘要容器")),
    "MCP tool should supplement side summary decoration",
  );
  assert.ok(
    toolModuleSchemas.some((item: JsonObject) => hasPropName(item, "侧边摘要分隔线")),
    "MCP tool should supplement side summary row-rule decoration",
  );
  assert.ok(
    toolModuleSchemas.some((item: JsonObject) => hasPropName(item, "主图侧卡关联线")),
    "MCP tool should supplement subtle chart-to-side-card connector",
  );
  assert.ok(
    toolModuleSchemas.some((item: JsonObject) => hasPropName(item, "底部结构线")),
    "MCP tool should supplement bottom structure decoration",
  );

  const moduleTreeSchemaResult = await client.callTool({
    name: "generate_module_tree_schema",
    arguments: chartPanelInput,
  });
  assert.equal(moduleTreeSchemaResult.isError, undefined);
  const toolModuleTreeSchema = readToolJson(moduleTreeSchemaResult);
  assert.equal(toolModuleTreeSchema.componentName, "__Group__");
  assert.equal(toolModuleTreeSchema.structVersion, "0.0.0");
  assert.deepEqual(toolModuleTreeSchema.props, {});
  assert.equal(toolModuleTreeSchema.children.length, 10);
  assert.equal(toolModuleTreeSchema.children[8].componentName, "PieChart");

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
  assert.equal(
    toolPromptModuleTree.children.filter(
      (item: JsonObject) => item.componentName === "SvgDecoration",
    ).length,
    8,
  );
  const toolPromptChart = toolPromptModuleTree.children.find(
    (item: JsonObject) => item.componentName === "PieChart",
  ) as JsonObject | undefined;
  assert.ok(toolPromptChart, "prompt MCP tool should generate PieChart child");
  const toolPromptChartProps = toolPromptChart.props as JsonObject;
  const toolPromptOption = toolPromptChartProps.option as JsonObject;
  const toolPromptLegend = toolPromptOption.legend as JsonObject;
  assert.equal(toolPromptLegend.icon, "roundRect");
  assert.equal(toolPromptLegend.backgroundColor, "rgba(0, 229, 255, 0.055)");
  assert.equal(toolPromptLegend.show, true);
  assert.equal(toolPromptLegend.offsetX, 0);
  assert.equal(toolPromptLegend.offsetY, -6);
  const toolPromptLegendTextStyle = toolPromptLegend.textStyle as JsonObject;
  assert.equal(toolPromptLegendTextStyle.fontWeight, "normal");
  const toolPromptSeries = toolPromptOption.series as JsonObject[];
  const toolPromptFirstSeries = toolPromptSeries[0] as JsonObject;
  assert.deepEqual(toolPromptFirstSeries.center, ["50%", "44%"]);
  assert.deepEqual(toolPromptFirstSeries.radius, ["34%", "64%"]);
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
  const toolPromptTexts = toolPromptModuleTree.children
    .filter((item: JsonObject) => item.componentName === "SingleText")
    .map((item: JsonObject) => (item.props as JsonObject).textContent);
  assert.ok(
    toolPromptTexts.includes("处置建议"),
    "prompt MCP tool should include side treatment-advice heading",
  );
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
  const toolPrompt3DChart = toolPrompt3DTree.children.find(
    (item: JsonObject) => item.componentName === "ThreeDPieChart",
  ) as JsonObject | undefined;
  assert.ok(toolPrompt3DChart, "3D prompt should generate ThreeDPieChart child");
  const toolPrompt3DOption = (toolPrompt3DChart.props as JsonObject).option as JsonObject;
  assert.ok(
    toolPrompt3DOption.threeDSettings !== null && typeof toolPrompt3DOption.threeDSettings === "object" && !Array.isArray(toolPrompt3DOption.threeDSettings),
    "3D prompt chart should have threeDSettings",
  );
  assert.equal(
    toolPrompt3DTree.children.filter((item: JsonObject) => item.componentName === "SvgDecoration").length,
    8,
    "3D prompt panel should include 8 SvgDecoration components",
  );
  const toolPrompt3DTexts = toolPrompt3DTree.children
    .filter((item: JsonObject) => item.componentName === "SingleText")
    .map((item: JsonObject) => (item.props as JsonObject).textContent);
  assert.ok(
    toolPrompt3DTexts.includes("处置建议"),
    "3D prompt should include side summary heading",
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
  const toolPromptLineChart = toolPromptLineTree.children.find(
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
    toolPromptLineTree.children.some(
      (item: JsonObject) => item.componentName === "SingleText" && ((item.props as JsonObject).name as string | undefined)?.includes("标题"),
    ),
    "line chart prompt MCP tool should include title text",
  );
} finally {
  await client.close();
}

// ChartPanel + ThreeDPieChart integration
const threeDPanelInput = {
  moduleName: "ChartPanel",
  logicalId: "risk_3d_panel",
  parentLogicalId: "root",
  title: "风险等级3D分析",
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
    mainChart: {
      componentName: "ThreeDPieChart",
      props: {
        chartData: {
          constant: {
            data: [
              { name: "重大风险", type: "风险", value: 12 },
              { name: "较大风险", type: "风险", value: 28 },
              { name: "一般风险", type: "风险", value: 56 },
            ],
          },
        },
        option: {
          threeDSettings: {
            depth: 24,
            topViewAngle: 55,
          },
        },
      },
    },
  },
} satisfies JsonObject;

const threeDModuleSchemas = generateModuleSchema(threeDPanelInput);
assert.ok(
  threeDModuleSchemas.some((item) => item.componentName === "ThreeDPieChart"),
  "ChartPanel should support ThreeDPieChart as main chart",
);
const threeDMainChart = threeDModuleSchemas.find((item) => item.componentName === "ThreeDPieChart");
const threeDMainChartOption = threeDMainChart?.props.option as JsonObject;
assert.equal(threeDMainChartOption.backgroundColor, "transparent");
assert.ok(
  threeDMainChartOption.threeDSettings !== null && typeof threeDMainChartOption.threeDSettings === "object" && !Array.isArray(threeDMainChartOption.threeDSettings),
  "ChartPanel ThreeDPieChart should have threeDSettings",
);
assert.equal((threeDMainChartOption.threeDSettings as JsonObject).depth, 24);
assert.equal((threeDMainChartOption.threeDSettings as JsonObject).topViewAngle, 55);
const threeDMainSeries = (threeDMainChartOption.series as JsonObject[])[0] as JsonObject;
assert.equal((threeDMainSeries.label as JsonObject | undefined)?.show, false, "ChartPanel ThreeDPieChart label should default to false");
assert.equal((threeDMainSeries.labelLine as JsonObject | undefined)?.show, false, "ChartPanel ThreeDPieChart labelLine should default to false");

const threeDModuleTree = generateModuleTreeSchema(threeDPanelInput);
assert.equal(threeDModuleTree.componentName, "__Group__");
assert.ok(
  threeDModuleTree.children.some((item) => item.componentName === "ThreeDPieChart"),
  "ChartPanel tree should include ThreeDPieChart",
);

// Verify 3D panel includes full decorations (not just the chart)
const threeDSvgDecorations = threeDModuleSchemas.filter((item) => item.componentName === "SvgDecoration");
assert.ok(
  threeDSvgDecorations.length >= 4,
  `ChartPanel ThreeDPieChart should include at least 4 SvgDecoration components, got ${threeDSvgDecorations.length}`,
);
assert.ok(
  threeDSvgDecorations.some((d) => (d.props.name as string | undefined)?.includes("侧边摘要容器")),
  "3D panel should include side summary container decoration",
);
assert.ok(
  threeDSvgDecorations.some((d) => (d.props.name as string | undefined)?.includes("底部结构线")),
  "3D panel should include bottom structure line decoration",
);
assert.ok(
  threeDModuleSchemas.some((item) => item.componentName === "SingleText" && (item.props.name as string | undefined)?.includes("标题")),
  "3D panel should include title text",
);
assert.ok(
  threeDModuleSchemas.some((item) => item.componentName === "SingleText" && (item.props.name as string | undefined)?.includes("底部结论")),
  "3D panel should include bottom conclusion text",
);

// ── LineChart panel assertions ───────────────────────────────
const lineChartPanelInput = {
  moduleName: "ChartPanel",
  logicalId: "sales_line_panel",
  parentLogicalId: "root",
  title: "季度销售趋势",
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
    mainChart: {
      componentName: "LineChart",
      props: {
        chartData: {
          constant: {
            data: [
              { name: "Q1", value: 120 },
              { name: "Q2", value: 200 },
              { name: "Q3", value: 150 },
              { name: "Q4", value: 280 },
            ],
          },
        },
        option: {
          grid: { left: 40, top: 50, bottom: 40, right: 30 },
          tooltip: { formatter: "{b}<br/>销售额：{c} 万" },
          xAxis: { type: "category", data: ["Q1", "Q2", "Q3", "Q4"] },
          yAxis: { type: "value", name: "销售额(万)", min: 0, max: 300, nameTextStyle: { color: "#BDEEFF" } },
          series: [
            {
              name: "2024",
              smooth: true,
              showSymbol: true,
              symbol: "circle",
              symbolSize: 6,
              areaStyle: { opacity: 0.2 },
              lineStyle: { width: 3, shadowBlur: 12, shadowColor: "rgba(34,211,238,0.72)" },
              itemStyle: { color: "#051024", borderColor: "#22D3EE", borderWidth: 3, shadowBlur: 8, shadowColor: "rgba(34,211,238,0.75)" },
              markPoint: { data: [{ type: "max" }, { type: "min" }] },
              markLine: { silent: true, data: [{ type: "average" }] },
            },
          ],
        },
      },
    },
  },
} satisfies JsonObject;

const lineModuleSchemas = generateModuleSchema(lineChartPanelInput);
assert.ok(
  lineModuleSchemas.some((item) => item.componentName === "LineChart"),
  "ChartPanel should support LineChart as main chart",
);
const lineMainChart = lineModuleSchemas.find((item) => item.componentName === "LineChart");
const lineMainChartOption = lineMainChart?.props.option as JsonObject;
assert.equal(lineMainChartOption.backgroundColor, "transparent");
assert.equal((lineMainChartOption.tooltip as JsonObject).trigger, "axis", "LineChart tooltip trigger should default to axis");
assert.equal((lineMainChartOption.legend as JsonObject).show, true, "LineChart legend should default to show");
const lineMainSeries = (lineMainChartOption.series as JsonObject[])[0] as JsonObject;
assert.equal(lineMainSeries.type, "line", "LineChart series type should be line");
assert.equal(lineMainSeries.smooth, true, "LineChart should preserve smooth from input");
assert.ok(
  lineMainSeries.areaStyle !== null && typeof lineMainSeries.areaStyle === "object" && !Array.isArray(lineMainSeries.areaStyle),
  "LineChart should preserve areaStyle from input",
);
assert.equal((lineMainSeries.lineStyle as JsonObject).width, 3, "LineChart should preserve lineStyle width");
assert.equal(lineMainSeries.symbol, "circle", "LineChart should preserve symbol from input");
assert.equal(lineMainSeries.symbolSize, 6, "LineChart should preserve symbolSize from input");
const lineXAxis = lineMainChartOption.xAxis as JsonObject;
assert.equal(lineXAxis.type, "category", "LineChart xAxis type should default to category");
const lineChartDataConstant = (lineMainChart?.props.chartData as JsonObject)?.constant as JsonObject | undefined;
assert.ok(Array.isArray(lineXAxis.data) || Array.isArray(lineChartDataConstant?.data), "LineChart should have xAxis data or chartData");
const lineYAxis = lineMainChartOption.yAxis as JsonObject;
assert.equal(lineYAxis.type, "value", "LineChart yAxis type should default to value");
assert.equal((lineYAxis.name as string | undefined), "销售额(万)", "LineChart yAxis name should be preserved");
assert.equal(lineYAxis.min, 0, "LineChart yAxis min should be preserved");
assert.equal(lineYAxis.max, 300, "LineChart yAxis max should be preserved");
assert.equal((lineYAxis.nameTextStyle as JsonObject)?.color, "#BDEEFF", "LineChart yAxis nameTextStyle should be preserved");
assert.equal(lineMainSeries.showSymbol, true, "LineChart showSymbol should be preserved as boolean");
assert.equal((lineMainSeries.itemStyle as JsonObject)?.color, "#051024", "LineChart itemStyle.color should be preserved");
assert.equal((lineMainSeries.itemStyle as JsonObject)?.borderColor, "#22D3EE", "LineChart itemStyle.borderColor should be preserved");
assert.equal((lineMainSeries.lineStyle as JsonObject)?.shadowBlur, 12, "LineChart lineStyle.shadowBlur should be preserved");
assert.equal((lineMainSeries.lineStyle as JsonObject)?.shadowColor, "rgba(34,211,238,0.72)", "LineChart lineStyle.shadowColor should be preserved");
assert.ok(
  lineMainSeries.markPoint !== null && typeof lineMainSeries.markPoint === "object" && !Array.isArray(lineMainSeries.markPoint),
  "LineChart markPoint should be preserved",
);
assert.ok(
  lineMainSeries.markLine !== null && typeof lineMainSeries.markLine === "object" && !Array.isArray(lineMainSeries.markLine),
  "LineChart markLine should be preserved",
);
assert.equal((lineMainChartOption.tooltip as JsonObject)?.formatter, "{b}<br/>销售额：{c} 万", "LineChart tooltip formatter should be preserved");
const lineModuleTree = generateModuleTreeSchema(lineChartPanelInput);
assert.equal(lineModuleTree.componentName, "__Group__");
assert.ok(
  lineModuleTree.children.some((item) => item.componentName === "LineChart"),
  "ChartPanel tree should include LineChart",
);

// Verify LineChart panel includes full decorations
const lineSvgDecorations = lineModuleSchemas.filter((item) => item.componentName === "SvgDecoration");
assert.ok(
  lineSvgDecorations.length >= 2,
  `ChartPanel LineChart should include at least 2 SvgDecoration components, got ${lineSvgDecorations.length}`,
);
assert.ok(
  lineModuleSchemas.some((item) => item.componentName === "SingleText" && (item.props.name as string | undefined)?.includes("标题")),
  "LineChart panel should include title text",
);

// Batch chart component prompt verification
function asChartObject(value: unknown): JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function findMainChart(panel: JsonObject): JsonObject {
  const children = Array.isArray(panel.children) ? (panel.children as unknown[]) : [];
  const chartNames = new Set([
    "PieChart",
    "ThreeDPieChart",
    "LineChart",
    "BarChart",
    "RingChart",
    "StackBarChart",
    "StackLineChart",
    "BarChart25D",
    "BarProgress",
    "LiquidFill",
    "RoseChart",
    "ScatterChart",
  ]);
  const found = children.find((item) => {
    const obj = asChartObject(item);
    return typeof obj.componentName === "string" && chartNames.has(obj.componentName);
  });
  return asChartObject(found);
}

function getBatchChartSeries(panel: JsonObject): JsonObject {
  const mainChart = findMainChart(panel);
  const option = asChartObject(asChartObject(mainChart.props).option);
  const series = Array.isArray(option.series) ? option.series : [];
  return asChartObject(series[0]);
}

function getBatchChartIndicatorName(panel: JsonObject): string | undefined {
  const mainChart = findMainChart(panel);
  const chartData = asChartObject(asChartObject(mainChart.props).chartData);
  const indicator = Array.isArray(chartData.indicator) ? chartData.indicator : [];
  const firstIndicator = asChartObject(indicator[0]);
  return asChartObject(firstIndicator.fieldDataConfig).chartDisplayName as string | undefined;
}

function hasBatchChartDimension(panel: JsonObject, fieldName: string): boolean {
  const mainChart = findMainChart(panel);
  const chartData = asChartObject(asChartObject(mainChart.props).chartData);
  const dimension = Array.isArray(chartData.dimension) ? chartData.dimension : [];
  return dimension.some((item) => asChartObject(item).fieldName === fieldName);
}

function hasSideSummaryContainer(panel: JsonObject): boolean {
  const children = Array.isArray(panel.children) ? (panel.children as unknown[]) : [];
  return children.some((item) => {
    const obj = asChartObject(item);
    const props = asChartObject(obj.props);
    const name = props.name;
    return typeof name === "string" && /侧边摘要|侧卡/.test(name);
  });
}

// RingChart prompt generation
const ringChartPromptPanel = generateScreenModuleFromPrompt({
  prompt: "用环形图展示各部门预算占比：研发部120，市场部80，运营部60。",
  style: { left: 0, top: 0, width: 800, height: 480 },
});
const ringChartPromptMain = findMainChart(ringChartPromptPanel as unknown as JsonObject);
assert.equal(ringChartPromptMain.componentName, "RingChart", "RingChart prompt should infer RingChart");
const ringChartPromptSeries = getBatchChartSeries(ringChartPromptPanel as unknown as JsonObject);
assert.ok(
  Array.isArray(ringChartPromptSeries.radius) && ringChartPromptSeries.radius.length === 2,
  "RingChart prompt should keep radius array",
);
assert.equal(asChartObject(ringChartPromptSeries.label).show, false, "RingChart prompt should hide labels by default");
assert.ok(
  typeof ringChartPromptSeries.name === "string" && ringChartPromptSeries.name !== "",
  `RingChart prompt series should have a semantic name, got ${ringChartPromptSeries.name}`,
);
const ringChartPromptIndicatorName = getBatchChartIndicatorName(ringChartPromptPanel as unknown as JsonObject);
assert.ok(
  ringChartPromptIndicatorName && ringChartPromptIndicatorName !== "value",
  `RingChart prompt indicator chartDisplayName should be business semantic, got ${ringChartPromptIndicatorName}`,
);

// StackBarChart prompt generation
const stackBarChartPromptPanel = generateScreenModuleFromPrompt({
  prompt: "用堆叠柱状图展示各季度线上线下销售额：Q1 线上120 线下80，Q2 线上150 线下90。",
  style: { left: 0, top: 0, width: 800, height: 480 },
});
const stackBarChartPromptMain = findMainChart(stackBarChartPromptPanel as unknown as JsonObject);
assert.equal(stackBarChartPromptMain.componentName, "StackBarChart", "StackBarChart prompt should infer StackBarChart");
const stackBarChartPromptSeries = getBatchChartSeries(stackBarChartPromptPanel as unknown as JsonObject);
assert.equal(stackBarChartPromptSeries.type, "bar", "StackBarChart prompt series type should be bar");
assert.equal(stackBarChartPromptSeries.stack, "__stackBar", "StackBarChart prompt should have fixed stack");
assert.ok(
  typeof stackBarChartPromptSeries.name === "string" && stackBarChartPromptSeries.name !== "",
  `StackBarChart prompt series should have a semantic name, got ${stackBarChartPromptSeries.name}`,
);
assert.ok(
  hasBatchChartDimension(stackBarChartPromptPanel as unknown as JsonObject, "name"),
  "StackBarChart prompt dimension should include name",
);
assert.ok(
  hasBatchChartDimension(stackBarChartPromptPanel as unknown as JsonObject, "type"),
  "StackBarChart prompt dimension should include type",
);
assert.equal(
  hasSideSummaryContainer(stackBarChartPromptPanel as unknown as JsonObject),
  false,
  "StackBarChart prompt should not include side summary container",
);
const stackBarChartPromptIndicatorName = getBatchChartIndicatorName(stackBarChartPromptPanel as unknown as JsonObject);
assert.ok(
  stackBarChartPromptIndicatorName && stackBarChartPromptIndicatorName !== "value",
  `StackBarChart prompt indicator chartDisplayName should be business semantic, got ${stackBarChartPromptIndicatorName}`,
);

// StackLineChart prompt generation
const stackLineChartPromptPanel = generateScreenModuleFromPrompt({
  prompt: "用堆叠折线图展示上半年各品类趋势：1月 A类100 B类80，2月 A类120 B类90。",
  style: { left: 0, top: 0, width: 800, height: 480 },
});
const stackLineChartPromptMain = findMainChart(stackLineChartPromptPanel as unknown as JsonObject);
assert.equal(stackLineChartPromptMain.componentName, "StackLineChart", "StackLineChart prompt should infer StackLineChart");
const stackLineChartPromptSeries = getBatchChartSeries(stackLineChartPromptPanel as unknown as JsonObject);
assert.equal(stackLineChartPromptSeries.type, "line", "StackLineChart prompt series type should be line");
assert.equal(stackLineChartPromptSeries.stack, "__stackLine", "StackLineChart prompt should have fixed stack");
assert.deepEqual(
  stackLineChartPromptSeries.showSymbol,
  { show: false },
  "StackLineChart prompt should hide symbols by default",
);
assert.ok(
  typeof stackLineChartPromptSeries.name === "string" && stackLineChartPromptSeries.name !== "",
  `StackLineChart prompt series should have a semantic name, got ${stackLineChartPromptSeries.name}`,
);
assert.ok(
  hasBatchChartDimension(stackLineChartPromptPanel as unknown as JsonObject, "name"),
  "StackLineChart prompt dimension should include name",
);
assert.ok(
  hasBatchChartDimension(stackLineChartPromptPanel as unknown as JsonObject, "type"),
  "StackLineChart prompt dimension should include type",
);
assert.equal(
  hasSideSummaryContainer(stackLineChartPromptPanel as unknown as JsonObject),
  false,
  "StackLineChart prompt should not include side summary container",
);
const stackLineChartPromptIndicatorName = getBatchChartIndicatorName(stackLineChartPromptPanel as unknown as JsonObject);
assert.ok(
  stackLineChartPromptIndicatorName && stackLineChartPromptIndicatorName !== "value",
  `StackLineChart prompt indicator chartDisplayName should be business semantic, got ${stackLineChartPromptIndicatorName}`,
);

// Batch chart component prompt verification - new components
function getBatchChartAxisType(panel: JsonObject, axis: "xAxis" | "yAxis"): string | undefined {
  const mainChart = findMainChart(panel);
  const option = asChartObject(asChartObject(mainChart.props).option);
  return asChartObject(option[axis]).type as string | undefined;
}

function hasBatchChartLegend(panel: JsonObject): boolean {
  const mainChart = findMainChart(panel);
  const option = asChartObject(asChartObject(mainChart.props).option);
  return option.legend !== undefined && option.legend !== null;
}

// BarChart25D prompt generation
const barChart25DPromptPanel = generateScreenModuleFromPrompt({
  prompt: "用2.5D柱状图展示各部门销售额：研发部120，市场部80，运营部60。",
  style: { left: 0, top: 0, width: 800, height: 480 },
});
const barChart25DPromptMain = findMainChart(barChart25DPromptPanel as unknown as JsonObject);
assert.equal(barChart25DPromptMain.componentName, "BarChart25D", "BarChart25D prompt should infer BarChart25D");
const barChart25DPromptSeries = getBatchChartSeries(barChart25DPromptPanel as unknown as JsonObject);
assert.equal(barChart25DPromptSeries.type, "custom", "BarChart25D prompt series type should be custom");
assert.equal(
  hasSideSummaryContainer(barChart25DPromptPanel as unknown as JsonObject),
  false,
  "BarChart25D prompt should not include side summary container",
);
const barChart25DPromptIndicatorName = getBatchChartIndicatorName(barChart25DPromptPanel as unknown as JsonObject);
assert.ok(
  barChart25DPromptIndicatorName && barChart25DPromptIndicatorName !== "value",
  `BarChart25D prompt indicator chartDisplayName should be business semantic, got ${barChart25DPromptIndicatorName}`,
);

// BarProgress prompt generation
const barProgressPromptPanel = generateScreenModuleFromPrompt({
  prompt: "用条形进度图展示各部门完成率：研发部78，市场部45，运营部92。",
  style: { left: 0, top: 0, width: 800, height: 480 },
});
const barProgressPromptMain = findMainChart(barProgressPromptPanel as unknown as JsonObject);
assert.equal(barProgressPromptMain.componentName, "BarProgress", "BarProgress prompt should infer BarProgress");
const barProgressPromptSeries = getBatchChartSeries(barProgressPromptPanel as unknown as JsonObject);
assert.equal(barProgressPromptSeries.type, "bar", "BarProgress prompt series type should be bar");
assert.equal(
  getBatchChartAxisType(barProgressPromptPanel as unknown as JsonObject, "xAxis"),
  "value",
  "BarProgress prompt xAxis type should be value",
);
assert.equal(
  getBatchChartAxisType(barProgressPromptPanel as unknown as JsonObject, "yAxis"),
  "category",
  "BarProgress prompt yAxis type should be category",
);
assert.equal(
  hasSideSummaryContainer(barProgressPromptPanel as unknown as JsonObject),
  false,
  "BarProgress prompt should not include side summary container",
);
const barProgressPromptIndicatorName = getBatchChartIndicatorName(barProgressPromptPanel as unknown as JsonObject);
assert.ok(
  barProgressPromptIndicatorName && barProgressPromptIndicatorName !== "value",
  `BarProgress prompt indicator chartDisplayName should be business semantic, got ${barProgressPromptIndicatorName}`,
);

// LiquidFill prompt generation
const liquidFillPromptPanel = generateScreenModuleFromPrompt({
  prompt: "用水球图展示整体完成率0.75。",
  style: { left: 0, top: 0, width: 800, height: 480 },
});
const liquidFillPromptMain = findMainChart(liquidFillPromptPanel as unknown as JsonObject);
assert.equal(liquidFillPromptMain.componentName, "LiquidFill", "LiquidFill prompt should infer LiquidFill");
const liquidFillPromptSeries = getBatchChartSeries(liquidFillPromptPanel as unknown as JsonObject);
assert.equal(liquidFillPromptSeries.type, "liquidFill", "LiquidFill prompt series type should be liquidFill");
assert.equal(
  hasSideSummaryContainer(liquidFillPromptPanel as unknown as JsonObject),
  false,
  "LiquidFill prompt should not include side summary container",
);
const liquidFillPromptIndicatorName = getBatchChartIndicatorName(liquidFillPromptPanel as unknown as JsonObject);
assert.ok(
  liquidFillPromptIndicatorName && liquidFillPromptIndicatorName !== "value",
  `LiquidFill prompt indicator chartDisplayName should be business semantic, got ${liquidFillPromptIndicatorName}`,
);

// RoseChart prompt generation
const roseChartPromptPanel = generateScreenModuleFromPrompt({
  prompt: "用玫瑰图展示各部门占比：研发部120，市场部80，运营部60。",
  style: { left: 0, top: 0, width: 800, height: 480 },
});
const roseChartPromptMain = findMainChart(roseChartPromptPanel as unknown as JsonObject);
assert.equal(roseChartPromptMain.componentName, "RoseChart", "RoseChart prompt should infer RoseChart");
const roseChartPromptSeries = getBatchChartSeries(roseChartPromptPanel as unknown as JsonObject);
assert.equal(roseChartPromptSeries.type, "pie", "RoseChart prompt series type should be pie");
assert.equal(roseChartPromptSeries.roseType, "area", "RoseChart prompt roseType should be area");
const roseChartPromptIndicatorName = getBatchChartIndicatorName(roseChartPromptPanel as unknown as JsonObject);
assert.ok(
  roseChartPromptIndicatorName && roseChartPromptIndicatorName !== "value",
  `RoseChart prompt indicator chartDisplayName should be business semantic, got ${roseChartPromptIndicatorName}`,
);

// ScatterChart prompt generation
const scatterChartPromptPanel = generateScreenModuleFromPrompt({
  prompt: "用散点图展示广告投入与销售额关系。",
  style: { left: 0, top: 0, width: 800, height: 480 },
});
const scatterChartPromptMain = findMainChart(scatterChartPromptPanel as unknown as JsonObject);
assert.equal(scatterChartPromptMain.componentName, "ScatterChart", "ScatterChart prompt should infer ScatterChart");
const scatterChartPromptSeries = getBatchChartSeries(scatterChartPromptPanel as unknown as JsonObject);
assert.equal(scatterChartPromptSeries.type, "scatter", "ScatterChart prompt series type should be scatter");
assert.equal(
  getBatchChartAxisType(scatterChartPromptPanel as unknown as JsonObject, "xAxis"),
  "value",
  "ScatterChart prompt xAxis type should be value",
);
assert.equal(
  getBatchChartAxisType(scatterChartPromptPanel as unknown as JsonObject, "yAxis"),
  "value",
  "ScatterChart prompt yAxis type should be value",
);
assert.equal(
  hasSideSummaryContainer(scatterChartPromptPanel as unknown as JsonObject),
  false,
  "ScatterChart prompt should not include side summary container",
);


console.log("test-flow passed");
