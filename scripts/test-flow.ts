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
import {
  generateDashboardSchema,
  validateDashboardSpec,
} from "../src/core/dashboard.js";
import { generateScreenModuleFromPrompt } from "../src/core/promptModule.js";
import { svgDecorationDefaultProps } from "../src/components/svg-decoration/defaultProps.js";
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

function nodeProps(item: JsonObject | undefined): JsonObject {
  const props = item?.props;
  assert.ok(
    typeof props === "object" && props !== null && !Array.isArray(props),
    "editor node should have object props",
  );
  return props;
}

function flattenEditorNodes(node: JsonObject): JsonObject[] {
  const children = Array.isArray(node.children)
    ? (node.children as JsonObject[])
    : [];

  return [node, ...children.flatMap(flattenEditorNodes)];
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
assert.ok(
  components.some((component) => component.componentName === "BaseTable"),
  "list_components should include BaseTable",
);
assert.ok(
  components.some((component) => component.componentName === "ScrollList"),
  "list_components should include ScrollList",
);
assert.ok(
  components.some((component) => component.componentName === "FunnelChart"),
  "list_components should include FunnelChart",
);
assert.ok(
  components.some((component) => component.componentName === "RadarChart"),
  "list_components should include RadarChart",
);
assert.ok(
  components.some((component) => component.componentName === "HeatMap"),
  "list_components should include HeatMap",
);
assert.ok(
  components.some((component) => component.componentName === "PictorialBarChart"),
  "list_components should include PictorialBarChart",
);
assert.ok(
  components.some((component) => component.componentName === "Select"),
  "list_components should include Select",
);
assert.ok(
  components.some((component) => component.componentName === "RadioGroup"),
  "list_components should include RadioGroup",
);
assert.ok(
  components.some((component) => component.componentName === "DatePicker"),
  "list_components should include DatePicker",
);
assert.ok(
  components.some((component) => component.componentName === "DateRangePicker"),
  "list_components should include DateRangePicker",
);
assert.ok(
  components.some((component) => component.componentName === "Weather"),
  "list_components should include Weather",
);
assert.ok(
  components.some((component) => component.componentName === "Date"),
  "list_components should include Date",
);
assert.ok(
  components.some((component) => component.componentName === "Video"),
  "list_components should include Video",
);
assert.ok(
  components.some((component) => component.componentName === "Audio"),
  "list_components should include Audio",
);
assert.ok(
  components.some((component) => component.componentName === "IFrame"),
  "list_components should include IFrame",
);
assert.ok(
  components.some((component) => component.componentName === "Swiper"),
  "list_components should include Swiper",
);
assert.ok(
  components.some((component) => component.componentName === "optionButton"),
  "list_components should include optionButton",
);
assert.ok(
  components.some((component) => component.componentName === "Earth3D"),
  "list_components should include Earth3D",
);
assert.ok(
  components.some((component) => component.componentName === "Earth3D-Pointer"),
  "list_components should include Earth3D-Pointer",
);
assert.ok(
  components.some((component) => component.componentName === "Earth3D-Satellite"),
  "list_components should include Earth3D-Satellite",
);
assert.ok(
  components.some((component) => component.componentName === "Earth3D-SpeedLight"),
  "list_components should include Earth3D-SpeedLight",
);
assert.ok(
  components.some((component) => component.componentName === "Earth3D-TextAround"),
  "list_components should include Earth3D-TextAround",
);
assert.ok(
  components.some((component) => component.componentName === "GaodeMap"),
  "list_components should include GaodeMap",
);
assert.ok(
  components.some((component) => component.componentName === "GaodeMap-FlyLine"),
  "list_components should include GaodeMap-FlyLine",
);
assert.ok(
  components.some((component) => component.componentName === "GaodeMap-HeatMap"),
  "list_components should include GaodeMap-HeatMap",
);
assert.ok(
  components.some((component) => component.componentName === "GaodeMap-InfoPannel"),
  "list_components should include GaodeMap-InfoPannel",
);
assert.ok(
  components.some((component) => component.componentName === "GaodeMap-Marker"),
  "list_components should include GaodeMap-Marker",
);
assert.ok(
  components.some((component) => component.componentName === "GaodeMap-Polygon"),
  "list_components should include GaodeMap-Polygon",
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
assert.equal(chartDataRows[0]?.name, "直销");
assert.equal(chartDataRows[0]?.type, "渠道");
assert.equal(chartDataRows[0]?.value, 128);
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

assert.throws(
  () =>
    generateComponentsSchema({
      componentName: "PieChart",
      logicalId: "missing_real_data_pie",
      parentLogicalId: "screen_group",
      style: {
        left: 0,
        top: 0,
        width: 320,
        height: 240,
        position: "absolute",
      },
    } satisfies JsonObject),
  /direct component generation will not fall back to default 类目\/系列 demo rows/,
  "direct chart component generation should reject missing real chartData when defaults are demo rows",
);

assert.throws(
  () =>
    generateComponentsSchema({
      componentName: "RingChart",
      logicalId: "default_demo_ring",
      parentLogicalId: "screen_group",
      chartData: {
        constant: {
          data: [
            { name: "类目1", type: "系列", value: 101 },
            { name: "类目2", type: "系列", value: 71 },
          ],
        },
      },
      style: {
        left: 0,
        top: 0,
        width: 320,
        height: 240,
        position: "absolute",
      },
    } satisfies JsonObject),
  /not default 类目\/系列 demo rows/,
  "direct chart component generation should reject explicit default demo chartData rows",
);

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

const indicatorWideSchema = generateComponentsSchema({
  componentName: "Indicator",
  logicalId: "indicator_wide_test",
  parentLogicalId: "sales_group",
  name: "测试长号翻牌器",
  titleVisible: true,
  textValue: 128642,
  separation: true,
  prefix: false,
  suffix: true,
  suffixTitle: "单",
  numberStyle: {
    fontSize: 42,
    letterSpacing: 1,
  },
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 320,
    height: 80,
  },
});
assert.equal(
  (indicatorWideSchema.props.style as JsonObject).width,
  360,
  "Indicator should widen dense KPI layouts to avoid digit wrapping",
);

const indicatorShortSchema = generateComponentsSchema({
  componentName: "Indicator",
  logicalId: "indicator_short_test",
  parentLogicalId: "sales_group",
  name: "测试短号翻牌器",
  textValue: 9876,
  prefix: false,
  suffix: false,
  separation: false,
  numberStyle: {
    fontSize: 42,
    letterSpacing: 1,
  },
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 320,
    height: 80,
  },
});
assert.equal(
  (indicatorShortSchema.props.style as JsonObject).width,
  320,
  "Indicator should not widen short simple layouts unnecessarily",
);

const compactRingSchema = generateComponentsSchema({
  componentName: "RingChart",
  logicalId: "compact_ring_test",
  parentLogicalId: "chart_group",
  name: "紧凑环图",
  chartData: {
    indicator: [
      {
        fieldDataConfig: {
          chartDisplayName: "收入",
        },
      },
    ],
    constant: {
      data: [
        { name: "直营门店", type: "渠道", value: 42 },
        { name: "电商平台", type: "渠道", value: 28 },
        { name: "经销伙伴", type: "渠道", value: 18 },
        { name: "企业客户", type: "渠道", value: 12 },
      ],
    },
  },
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 568,
    height: 142,
  },
  option: {
    legend: {
      show: true,
      top: "bottom",
      left: "center",
      offsetY: -8,
    },
    series: [
      {
        radius: ["36%", "64%"],
        center: ["50%", "44%"],
        label: {
          show: true,
          position: "outside",
        },
        labelLine: {
          show: true,
          length: 8,
          length2: 5,
        },
      },
    ],
  },
});
const compactRingOption = asChartObject(compactRingSchema.props.option);
const compactRingSeries = Array.isArray(compactRingOption.series)
  ? asChartObject(compactRingOption.series[0])
  : {};
assert.deepEqual(
  compactRingSeries.center,
  ["50%", "40%"],
  "RingChart should move compact outside-label layouts upward when bottom legend is enabled",
);
assert.deepEqual(
  compactRingSeries.radius,
  ["36%", "54%"],
  "RingChart should shrink compact outside-label layouts to leave room for legend and labels",
);
assert.equal(
  asChartObject(compactRingSeries.labelLine).length,
  6,
  "RingChart should cap compact labelLine length",
);
assert.equal(
  asChartObject(compactRingSeries.labelLine).length2,
  4,
  "RingChart should cap compact labelLine horizontal length",
);

const denseRingSchema = generateComponentsSchema({
  componentName: "RingChart",
  logicalId: "dense_ring_test",
  parentLogicalId: "chart_group",
  name: "窄面板多项环图",
  chartData: {
    indicator: [
      {
        fieldDataConfig: {
          chartDisplayName: "占比",
        },
      },
    ],
    constant: {
      data: [
        { name: "华东", type: "销售", value: 101 },
        { name: "华南", type: "销售", value: 71 },
        { name: "华北", type: "销售", value: 121 },
        { name: "西南", type: "销售", value: 95 },
        { name: "西北", type: "销售", value: 141 },
        { name: "东北", type: "销售", value: 96 },
      ],
    },
  },
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 384,
    height: 182,
  },
  option: {
    legend: {
      show: true,
      top: "bottom",
      left: "center",
      offsetY: -6,
      itemGap: 18,
      itemWidth: 16,
      itemHeight: 8,
      textStyle: {
        fontSize: 12,
      },
    },
    series: [
      {
        radius: ["36%", "64%"],
        center: ["50%", "44%"],
        label: {
          show: true,
          position: "outside",
          fontSize: 13,
          formatter: "{b}: {c}",
        },
        labelLine: {
          show: true,
          length: 14,
          length2: 10,
        },
      },
    ],
  },
});
const denseRingOption = asChartObject(denseRingSchema.props.option);
const denseRingLegend = asChartObject(denseRingOption.legend);
const denseRingSeries = Array.isArray(denseRingOption.series)
  ? asChartObject(denseRingOption.series[0])
  : {};
assert.deepEqual(
  denseRingSeries.center,
  ["50%", "38%"],
  "RingChart should move dense narrow outside-label layouts higher above bottom legend",
);
assert.deepEqual(
  denseRingSeries.radius,
  ["36%", "46%"],
  "RingChart should shrink dense narrow outside-label layouts more aggressively",
);
assert.equal(asChartObject(denseRingSeries.labelLine).length, 6);
assert.equal(asChartObject(denseRingSeries.labelLine).length2, 3);
assert.equal(asChartObject(denseRingSeries.label).fontSize, 11);
assert.equal(
  asChartObject(denseRingSeries.label).formatter,
  "{b}",
  "RingChart should remove values from dense outside labels so legend and labels do not collide",
);
assert.equal(denseRingLegend.offsetY, -2);
assert.equal(denseRingLegend.itemGap, 10);
assert.equal(denseRingLegend.itemWidth, 12);
assert.equal(denseRingLegend.itemHeight, 7);
assert.equal(asChartObject(denseRingLegend.textStyle).fontSize, 11);

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

// BaseTable: columns/data should sync to chartData
const baseTableCapability = getComponentCapability("BaseTable");
assert.ok(Array.isArray(baseTableCapability.aiWritableProps), "BaseTable capability has aiWritableProps");
const baseTableSchema = generateComponentsSchema({
  componentName: "BaseTable",
  logicalId: "base_table_test",
  parentLogicalId: "table_group",
  name: "测试基础表格",
  columns: [
    { field: "region", label: "地区" },
    { field: "sales", label: "销售额", type: "number" },
  ],
  data: [
    { region: "北京", sales: 1200 },
    { region: "上海", sales: 980 },
  ],
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 520,
    height: 280,
  },
});
assert.equal(baseTableSchema.componentName, "BaseTable");
const baseTableChartData = asChartObject(baseTableSchema.props.chartData);
const baseTableConstant = asChartObject(baseTableChartData.constant);
const baseTableConstantData = Array.isArray(baseTableConstant.data) ? baseTableConstant.data : [];
assert.equal(baseTableConstantData.length, 2, "BaseTable data should sync to chartData");
assert.equal(asChartObject(baseTableConstantData[0]).region, "北京", "BaseTable first row region should sync");
const baseTableIndicator = Array.isArray(baseTableChartData.indicator) ? baseTableChartData.indicator : [];
assert.equal(baseTableIndicator.length, 2, "BaseTable indicator should derive from columns");
assert.ok(Array.isArray(baseTableChartData.dimension) && baseTableChartData.dimension.length === 0, "BaseTable dimension should be empty");

// ScrollList: columns/data should sync to datasource
const scrollListCapability = getComponentCapability("ScrollList");
assert.ok(Array.isArray(scrollListCapability.aiWritableProps), "ScrollList capability has aiWritableProps");
const scrollListSchema = generateComponentsSchema({
  componentName: "ScrollList",
  logicalId: "scroll_list_test",
  parentLogicalId: "list_group",
  name: "测试滚动表格",
  columns: [
    { field: "region", label: "地区" },
    { field: "rate", label: "完成率" },
  ],
  data: [
    { region: "北京", rate: 87.2 },
    { region: "上海", rate: 80.5 },
    { region: "广州", rate: 72.3 },
  ],
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 397,
    height: 234,
  },
});
assert.equal(scrollListSchema.componentName, "ScrollList");
const scrollListDatasource = asChartObject(scrollListSchema.props.datasource);
const scrollListConstantData = Array.isArray(scrollListDatasource.constantData) ? scrollListDatasource.constantData : [];
assert.equal(scrollListConstantData.length, 3, "ScrollList data should sync to datasource");
assert.equal(asChartObject(scrollListConstantData[1]).region, "上海", "ScrollList second row region should sync");
const scrollListFieldMappings = Array.isArray(scrollListDatasource.fieldMappings) ? scrollListDatasource.fieldMappings : [];
const scrollListFirstMapping = asChartObject(scrollListFieldMappings[0]);
const scrollListMapFields = Array.isArray(scrollListFirstMapping.mapFields) ? scrollListFirstMapping.mapFields : [];
assert.equal(scrollListMapFields.length, 2, "ScrollList fieldMappings should derive from columns");
assert.equal(scrollListDatasource.sourceType, "constant", "ScrollList datasource sourceType should be constant");

// FunnelChart: data should sync to datasource.constantData
const funnelChartCapability = getComponentCapability("FunnelChart");
assert.ok(Array.isArray(funnelChartCapability.aiWritableProps), "FunnelChart capability has aiWritableProps");
const funnelChartSchema = generateComponentsSchema({
  componentName: "FunnelChart",
  logicalId: "funnel_chart_test",
  parentLogicalId: "chart_group",
  name: "测试漏斗图",
  data: [
    { name: "展现", value: 100 },
    { name: "点击", value: 80 },
    { name: "访问", value: 60 },
  ],
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 500,
    height: 300,
  },
});
assert.equal(funnelChartSchema.componentName, "FunnelChart");
const funnelChartDatasource = asChartObject(funnelChartSchema.props.datasource);
const funnelChartConstantData = Array.isArray(funnelChartDatasource.constantData) ? funnelChartDatasource.constantData : [];
assert.equal(funnelChartConstantData.length, 3, "FunnelChart data should sync to datasource");
assert.equal(asChartObject(funnelChartConstantData[0]).name, "展现", "FunnelChart first data name should sync");
assert.equal(asChartObject(funnelChartConstantData[0]).value, 100, "FunnelChart first data value should sync");

// RadarChart: data should sync to datasource.constantData with s/x/y mapping
const radarChartCapability = getComponentCapability("RadarChart");
assert.ok(Array.isArray(radarChartCapability.aiWritableProps), "RadarChart capability has aiWritableProps");
const radarChartSchema = generateComponentsSchema({
  componentName: "RadarChart",
  logicalId: "radar_chart_test",
  parentLogicalId: "chart_group",
  name: "测试雷达图",
  data: [
    { series: "系列一", dimension: "维度一", value: 12 },
    { series: "系列一", dimension: "维度二", value: 18 },
    { series: "系列二", dimension: "维度一", value: 8 },
  ],
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 520,
    height: 320,
  },
});
assert.equal(radarChartSchema.componentName, "RadarChart");
const radarChartDatasource = asChartObject(radarChartSchema.props.datasource);
const radarChartConstantData = Array.isArray(radarChartDatasource.constantData) ? radarChartDatasource.constantData : [];
assert.equal(radarChartConstantData.length, 3, "RadarChart data should sync to datasource");
assert.equal(asChartObject(radarChartConstantData[0]).s, "系列一", "RadarChart series should map to s");
assert.equal(asChartObject(radarChartConstantData[0]).x, "维度一", "RadarChart dimension should map to x");
assert.equal(asChartObject(radarChartConstantData[0]).y, 12, "RadarChart value should map to y");

// HeatMap: data should sync to datasource.constantData
const heatMapCapability = getComponentCapability("HeatMap");
assert.ok(Array.isArray(heatMapCapability.aiWritableProps), "HeatMap capability has aiWritableProps");
const heatMapSchema = generateComponentsSchema({
  componentName: "HeatMap",
  logicalId: "heat_map_test",
  parentLogicalId: "chart_group",
  name: "测试热力图",
  data: [
    { x: "A", y: "Sat", value: 5 },
    { x: "B", y: "Sat", value: 8 },
    { x: "A", y: "Sun", value: 3 },
  ],
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 450,
    height: 250,
  },
});
assert.equal(heatMapSchema.componentName, "HeatMap");
const heatMapDatasource = asChartObject(heatMapSchema.props.datasource);
const heatMapConstantData = Array.isArray(heatMapDatasource.constantData) ? heatMapDatasource.constantData : [];
assert.equal(heatMapConstantData.length, 3, "HeatMap data should sync to datasource");
assert.equal(asChartObject(heatMapConstantData[0]).x, "A", "HeatMap x should sync");
assert.equal(asChartObject(heatMapConstantData[1]).value, 8, "HeatMap value should sync");

// PictorialBarChart: data should sync to datasource.constantData with s/x/y mapping
const pictorialBarChartCapability = getComponentCapability("PictorialBarChart");
assert.ok(Array.isArray(pictorialBarChartCapability.aiWritableProps), "PictorialBarChart capability has aiWritableProps");
const pictorialBarChartSchema = generateComponentsSchema({
  componentName: "PictorialBarChart",
  logicalId: "pictorial_bar_chart_test",
  parentLogicalId: "chart_group",
  name: "测试象形柱图",
  data: [
    { series: "系列一", type: "A", value: 120 },
    { series: "系列一", type: "B", value: 195 },
    { series: "系列一", type: "C", value: 60 },
  ],
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 450,
    height: 250,
  },
});
assert.equal(pictorialBarChartSchema.componentName, "PictorialBarChart");
const pictorialBarChartDatasource = asChartObject(pictorialBarChartSchema.props.datasource);
const pictorialBarChartConstantData = Array.isArray(pictorialBarChartDatasource.constantData) ? pictorialBarChartDatasource.constantData : [];
assert.equal(pictorialBarChartConstantData.length, 3, "PictorialBarChart data should sync to datasource");
assert.equal(asChartObject(pictorialBarChartConstantData[0]).s, "系列一", "PictorialBarChart series should map to s");
assert.equal(asChartObject(pictorialBarChartConstantData[0]).x, "A", "PictorialBarChart type should map to x");
assert.equal(asChartObject(pictorialBarChartConstantData[0]).y, 120, "PictorialBarChart value should map to y");

// NavMenu: menuData.items should normalize to menuData.originalData
const navMenuCapability = getComponentCapability("NavMenu");
assert.ok(Array.isArray(navMenuCapability.aiWritableProps), "NavMenu capability has aiWritableProps");
const navMenuSchema = generateComponentsSchema({
  componentName: "NavMenu",
  logicalId: "nav_menu_test",
  parentLogicalId: "menu_group",
  name: "测试导航菜单",
  menuData: {
    items: [
      { id: "1", name: "菜单1" },
      { id: "2", name: "菜单2", children: [{ id: "3", name: "菜单2-1" }] },
    ],
  },
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 280,
    height: 600,
  },
});
assert.equal(navMenuSchema.componentName, "NavMenu");
const navMenuData = asChartObject(navMenuSchema.props.menuData);
const navMenuOriginalData = Array.isArray(navMenuData.originalData) ? navMenuData.originalData : [];
assert.equal(navMenuOriginalData.length, 2, "NavMenu items should sync to originalData");
assert.equal(asChartObject(navMenuOriginalData[0]).name, "菜单1", "NavMenu first item name should sync");
assert.equal(navMenuData.originType, "static", "NavMenu originType should be static");

// TabMenu: menuData.items should normalize to menuData.originalData with selectTabId
const tabMenuCapability = getComponentCapability("TabMenu");
assert.ok(Array.isArray(tabMenuCapability.aiWritableProps), "TabMenu capability has aiWritableProps");
const tabMenuSchema = generateComponentsSchema({
  componentName: "TabMenu",
  logicalId: "tab_menu_test",
  parentLogicalId: "menu_group",
  name: "测试Tab列表",
  menuData: {
    items: [
      { id: "1", name: "Tab1" },
      { id: "2", name: "Tab2" },
    ],
  },
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 600,
    height: 60,
  },
});
assert.equal(tabMenuSchema.componentName, "TabMenu");
const tabMenuData = asChartObject(tabMenuSchema.props.menuData);
const tabMenuOriginalData = Array.isArray(tabMenuData.originalData) ? tabMenuData.originalData : [];
assert.equal(tabMenuOriginalData.length, 2, "TabMenu items should sync to originalData");
assert.equal(tabMenuData.selectTabId, "1", "TabMenu selectTabId should default to first item");

// Input: defaultValue should be preserved
const inputCapability = getComponentCapability("Input");
assert.ok(Array.isArray(inputCapability.aiWritableProps), "Input capability has aiWritableProps");
const inputSchema = generateComponentsSchema({
  componentName: "Input",
  logicalId: "input_test",
  parentLogicalId: "form_group",
  name: "测试输入框",
  placeholder: "请输入名称",
  defaultValue: "示例",
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 200,
    height: 40,
  },
});
assert.equal(inputSchema.componentName, "Input");
assert.equal(inputSchema.props.placeholder, "请输入名称", "Input placeholder should sync");
assert.equal(inputSchema.props.defaultValue, "示例", "Input defaultValue should sync");

// Select: options should normalize to dataConfig.constant.data
const selectCapability = getComponentCapability("Select");
assert.ok(Array.isArray(selectCapability.aiWritableProps), "Select capability has aiWritableProps");
const selectSchema = generateComponentsSchema({
  componentName: "Select",
  logicalId: "select_test",
  parentLogicalId: "form_group",
  name: "测试下拉选择",
  options: [
    { label: "全部", value: "all" },
    { label: "运行中", value: "running" },
  ],
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 200,
    height: 40,
  },
});
assert.equal(selectSchema.componentName, "Select");
const selectDataConfig = asChartObject(selectSchema.props.dataConfig);
const selectConstant = asChartObject(selectDataConfig.constant);
const selectConstantData = Array.isArray(selectConstant.data) ? selectConstant.data : [];
assert.equal(selectConstantData.length, 2, "Select options should sync to dataConfig");
assert.equal(asChartObject(selectConstantData[0]).name, "全部", "Select first option label should sync");
assert.equal(asChartObject(selectConstantData[0]).value, "all", "Select first option value should sync");
const selectDimension = Array.isArray(selectDataConfig.dimension) ? selectDataConfig.dimension : [];
const selectIndicator = Array.isArray(selectDataConfig.indicator) ? selectDataConfig.indicator : [];
assert.equal(asChartObject(selectDimension[0]).fieldName, "name", "Select dimension should be name");
assert.equal(asChartObject(selectIndicator[0]).fieldName, "value", "Select indicator should be value");

// RadioGroup: options should normalize to dataConfig.constant.data
const radioGroupCapability = getComponentCapability("RadioGroup");
assert.ok(Array.isArray(radioGroupCapability.aiWritableProps), "RadioGroup capability has aiWritableProps");
const radioGroupSchema = generateComponentsSchema({
  componentName: "RadioGroup",
  logicalId: "radio_group_test",
  parentLogicalId: "form_group",
  name: "测试单选组",
  options: [
    { label: "日", value: "day" },
    { label: "周", value: "week" },
  ],
  direction: "horizontal",
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 300,
    height: 40,
  },
});
assert.equal(radioGroupSchema.componentName, "RadioGroup");
const radioGroupDataConfig = asChartObject(radioGroupSchema.props.dataConfig);
const radioGroupConstant = asChartObject(radioGroupDataConfig.constant);
const radioGroupConstantData = Array.isArray(radioGroupConstant.data) ? radioGroupConstant.data : [];
assert.equal(radioGroupConstantData.length, 2, "RadioGroup options should sync to dataConfig");
assert.equal(asChartObject(radioGroupConstantData[1]).name, "周", "RadioGroup second option label should sync");
assert.equal(radioGroupSchema.props.direction, "horizontal", "RadioGroup direction should sync");

// DatePicker: dateFormat and selector placeholder should normalize
const datePickerCapability = getComponentCapability("DatePicker");
assert.ok(Array.isArray(datePickerCapability.aiWritableProps), "DatePicker capability has aiWritableProps");
const datePickerSchema = generateComponentsSchema({
  componentName: "DatePicker",
  logicalId: "date_picker_test",
  parentLogicalId: "form_group",
  name: "测试日期选择",
  dateFormat: "YYYY-MM-DD",
  selector: {
    placeholder: {
      content: "请选择日期",
    },
  },
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 180,
    height: 40,
  },
});
assert.equal(datePickerSchema.componentName, "DatePicker");
assert.equal(datePickerSchema.props.dateFormat, "YYYY-MM-DD", "DatePicker dateFormat should sync");
const datePickerDataConfig = asChartObject(datePickerSchema.props.dataConfig);
const datePickerIndicator = Array.isArray(datePickerDataConfig.indicator) ? datePickerDataConfig.indicator : [];
assert.equal(asChartObject(datePickerIndicator[0]).fieldName, "测试日期选择", "DatePicker indicator should use name");
const datePickerSelector = asChartObject(datePickerSchema.props.selector);
const datePickerPlaceholder = asChartObject(datePickerSelector.placeholder);
assert.equal(datePickerPlaceholder.content, "请选择日期", "DatePicker placeholder should sync");

// DateRangePicker: selector placeholder array and separator should normalize
const dateRangePickerCapability = getComponentCapability("DateRangePicker");
assert.ok(Array.isArray(dateRangePickerCapability.aiWritableProps), "DateRangePicker capability has aiWritableProps");
const dateRangePickerSchema = generateComponentsSchema({
  componentName: "DateRangePicker",
  logicalId: "date_range_picker_test",
  parentLogicalId: "form_group",
  name: "测试日期范围选择",
  dateFormat: "YYYY-MM-DD",
  selector: {
    placeholder: {
      content: ["开始", "结束"],
    },
    separator: "至",
  },
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 280,
    height: 40,
  },
});
assert.equal(dateRangePickerSchema.componentName, "DateRangePicker");
assert.equal(dateRangePickerSchema.props.dateFormat, "YYYY-MM-DD", "DateRangePicker dateFormat should sync");
const dateRangePickerDataConfig = asChartObject(dateRangePickerSchema.props.dataConfig);
const dateRangePickerConstant = asChartObject(dateRangePickerDataConfig.constant);
const dateRangePickerConstantData = Array.isArray(dateRangePickerConstant.data) ? dateRangePickerConstant.data : [];
assert.equal(dateRangePickerConstantData.length, 0, "DateRangePicker dataConfig should be empty");
const dateRangePickerSelector = asChartObject(dateRangePickerSchema.props.selector);
const dateRangePickerPlaceholder = asChartObject(dateRangePickerSelector.placeholder);
assert.deepEqual(dateRangePickerPlaceholder.content, ["开始", "结束"], "DateRangePicker placeholder array should sync");
assert.equal(dateRangePickerSelector.separator, "至", "DateRangePicker separator should sync");

// Weather: cityCode should normalize to default array
const weatherCapability = getComponentCapability("Weather");
assert.ok(Array.isArray(weatherCapability.aiWritableProps), "Weather capability has aiWritableProps");
const weatherSchema = generateComponentsSchema({
  componentName: "Weather",
  logicalId: "weather_test",
  parentLogicalId: "header_group",
  name: "测试天气",
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 240,
    height: 34,
  },
});
assert.equal(weatherSchema.componentName, "Weather");
assert.deepEqual(weatherSchema.props.cityCode, ["11", "1101", "110101"], "Weather cityCode should normalize");

// Date: format/timezone should normalize
const dateCapability = getComponentCapability("Date");
assert.ok(Array.isArray(dateCapability.aiWritableProps), "Date capability has aiWritableProps");
const dateSchema = generateComponentsSchema({
  componentName: "Date",
  logicalId: "date_test",
  parentLogicalId: "header_group",
  name: "测试时间",
  format: "YYYY-MM-DD HH:mm:ss",
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 320,
    height: 34,
  },
});
assert.equal(dateSchema.componentName, "Date");
assert.equal(dateSchema.props.format, "YYYY-MM-DD HH:mm:ss", "Date format should sync");
assert.equal(dateSchema.props.timezone, "beijing", "Date timezone should default to beijing");

// Video: videoType and booleans should normalize
const videoCapability = getComponentCapability("Video");
assert.ok(Array.isArray(videoCapability.aiWritableProps), "Video capability has aiWritableProps");
const videoSchema = generateComponentsSchema({
  componentName: "Video",
  logicalId: "video_test",
  parentLogicalId: "media_group",
  name: "测试视频",
  videoType: "hls",
  autoplay: true,
  muted: false,
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 400,
    height: 260,
  },
});
assert.equal(videoSchema.componentName, "Video");
assert.equal(videoSchema.props.videoType, "hls", "Video videoType should sync");
assert.equal(videoSchema.props.autoplay, true, "Video autoplay should sync");
assert.equal(videoSchema.props.muted, false, "Video muted should sync");

// Audio: controlBar and loopPlay should normalize
const audioCapability = getComponentCapability("Audio");
assert.ok(Array.isArray(audioCapability.aiWritableProps), "Audio capability has aiWritableProps");
const audioSchema = generateComponentsSchema({
  componentName: "Audio",
  logicalId: "audio_test",
  parentLogicalId: "media_group",
  name: "测试音频",
  controlBar: false,
  loopPlay: true,
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 400,
    height: 55,
  },
});
assert.equal(audioSchema.componentName, "Audio");
assert.equal(audioSchema.props.controlBar, false, "Audio controlBar should sync");
assert.equal(audioSchema.props.loopPlay, true, "Audio loopPlay should sync");

// IFrame: url and scroll should normalize
const iframeCapability = getComponentCapability("IFrame");
assert.ok(Array.isArray(iframeCapability.aiWritableProps), "IFrame capability has aiWritableProps");
const iframeSchema = generateComponentsSchema({
  componentName: "IFrame",
  logicalId: "iframe_test",
  parentLogicalId: "content_group",
  name: "测试iframe",
  url: "https://example.com",
  scroll: "hide",
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 600,
    height: 400,
  },
});
assert.equal(iframeSchema.componentName, "IFrame");
assert.equal(iframeSchema.props.url, "https://example.com", "IFrame url should sync");
assert.equal(iframeSchema.props.scroll, "hide", "IFrame scroll should sync");

// Swiper: imageSrcList and direction should normalize
const swiperCapability = getComponentCapability("Swiper");
assert.ok(Array.isArray(swiperCapability.aiWritableProps), "Swiper capability has aiWritableProps");
const swiperSchema = generateComponentsSchema({
  componentName: "Swiper",
  logicalId: "swiper_test",
  parentLogicalId: "media_group",
  name: "测试轮播图",
  imageSrcList: ["group1/banner1.png", "group1/banner2.png"],
  direction: "vertical",
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 800,
    height: 240,
  },
});
assert.equal(swiperSchema.componentName, "Swiper");
assert.deepEqual(swiperSchema.props.imageSrcList, ["group1/banner1.png", "group1/banner2.png"], "Swiper imageSrcList should sync");
assert.equal(swiperSchema.props.direction, "vertical", "Swiper direction should sync");

// optionButton: btnText and arrange should normalize
const optionButtonCapability = getComponentCapability("optionButton");
assert.ok(Array.isArray(optionButtonCapability.aiWritableProps), "optionButton capability has aiWritableProps");
const optionButtonSchema = generateComponentsSchema({
  componentName: "optionButton",
  logicalId: "option_button_test",
  parentLogicalId: "form_group",
  name: "测试操作按钮",
  btnText: "查询",
  arrange: "column",
  style: {
    position: "absolute",
    left: 100,
    top: 100,
    width: 160,
    height: 48,
  },
});
assert.equal(optionButtonSchema.componentName, "optionButton");
assert.equal(optionButtonSchema.props.btnText, "查询", "optionButton btnText should sync");
assert.equal(optionButtonSchema.props.arrange, "column", "optionButton arrange should sync");

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

const themedTextSchema = generateComponentsSchema({
  componentName: "SingleText",
  logicalId: "themed_text",
  parentLogicalId: "sales_group",
  textContent: "主题输入不会进入输出",
  theme: {
    name: "test-theme",
    colors: {
      background: "#000000",
    },
  },
  style: {
    position: "absolute",
    left: 80,
    top: 190,
    width: 220,
    height: 18,
    fontSize: 18,
  },
});
assert.equal(
  themedTextSchema.props.theme,
  undefined,
  "compiler-only theme should not be emitted in final component props",
);

const svgCapability = getComponentCapability("SvgDecoration");
assert.ok(Array.isArray(svgCapability.aiWritableProps));
const svgDefaultProps = svgDecorationDefaultProps as JsonObject;
assert.equal(svgDefaultProps.svgSource, "custom");
assert.equal(svgDefaultProps.svgPreset, "");
assert.equal(svgDefaultProps.svgContent, "");
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
assert.equal(unsafeSvgSchema.props.svgSource, "custom");
assert.equal(unsafeSvgSchema.props.svgPreset, "");
assert.equal(unsafeSvgSchema.props.svgContent, "");

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
assert.equal(svgChartSchema.props.svgSource, "custom");
assert.equal(svgChartSchema.props.svgPreset, "");
assert.equal(svgChartSchema.props.svgContent, "");

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
assert.equal(svgTextSchema.props.svgSource, "custom");
assert.equal(svgTextSchema.props.svgPreset, "");
assert.equal(svgTextSchema.props.svgContent, "");

const emptySvgSchema = generateComponentsSchema({
  componentName: "SvgDecoration",
  logicalId: "empty_svg",
  parentLogicalId: "sales_group",
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 120,
    height: 64,
  },
  svgSource: "custom",
  svgContent: "",
});
assert.equal(emptySvgSchema.props.svgSource, "custom");
assert.equal(emptySvgSchema.props.svgPreset, "");
assert.equal(emptySvgSchema.props.svgContent, "");

const explicitPresetSvgSchema = generateComponentsSchema({
  componentName: "SvgDecoration",
  logicalId: "explicit_preset_svg",
  parentLogicalId: "sales_group",
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 120,
    height: 64,
  },
  svgSource: "preset",
  svgPreset: "icon-Frame3",
});
assert.equal(explicitPresetSvgSchema.props.svgSource, "preset");
assert.equal(explicitPresetSvgSchema.props.svgPreset, "icon-Frame3");

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
assert.ok(
  modules.some((moduleItem) => moduleItem.moduleName === "FreeformModule"),
  "list_modules should include FreeformModule",
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
  moduleLayoutRules.some((rule) => rule.includes("MCP 不再自动生成标题承托")),
  "ChartPanel should document that structure decoration is LLM-authored",
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
  moduleLayoutRules.some((rule) => rule.includes("不应只输出裸标题")),
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
  moduleLayoutRules.some((rule) => rule.includes("至少应显式提供 1 条辅助文本")),
  "ChartPanel should require an explicit business auxiliary text layer",
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
  moduleLayoutRules.some((rule) => rule.includes("正文区域宽度不低于 180px")),
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
  moduleLayoutRules.some((rule) => rule.includes("AI 必须提供至少标题承托")),
  "ChartPanel should require LLM-authored lightweight structure",
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
  moduleLayoutRules.some((rule) => rule.includes("装饰必须由 AI 设计")),
  "ChartPanel should require visible LLM-authored SVG decorations",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("MCP 不再为缺少 svgContent")),
  "ChartPanel should not silently replace missing SVG design with built-in templates",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("不同大屏之间应通过 AI 自主设计产生差异")),
  "ChartPanel should avoid MCP-owned fixed decoration templates across dashboards",
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
const freeformModuleCapability = getModuleCapability("FreeformModule");
assert.ok(freeformModuleCapability.slots, "FreeformModule capability should include slots");
assert.equal(
  (freeformModuleCapability.groupSchema as JsonObject).componentName,
  "__Group__",
);
const freeformLayoutRules = freeformModuleCapability.layoutRules as string[];
assert.ok(
  freeformLayoutRules.some((rule) => rule.includes("不提供任何固定布局")),
  "FreeformModule should not introduce templates",
);
assert.ok(
  freeformLayoutRules.some((rule) => rule.includes("grouping.singleChildGroup=true")),
  "FreeformModule should document single-child semantic grouping",
);

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
} satisfies JsonObject;
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
assert.equal(cleanEnergyConclusionStyle.height, 12);
assert.equal(cleanEnergyConclusionStyle.lineHeight, 1);
assert.ok(
  ((cleanEnergySideSummary1Props.textContent as string | undefined) ?? "").includes("主体供给"),
  "clean energy side summary should add business judgement beyond value repetition",
);
assert.ok(
  ((cleanEnergySideSummary2Props.textContent as string | undefined) ?? "").includes("主体供给"),
  "clean energy wind summary should identify supply role",
);
assert.ok(
  ((cleanEnergySideSummary3Props.textContent as string | undefined) ?? "").includes("调峰支撑"),
  "clean energy storage summary should identify peak-shaving support role",
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
const cleanEnergyOption = nodeProps(cleanEnergyChart).option as JsonObject;
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
const redComplaintLegend = redComplaintOption.legend as JsonObject;
const redComplaintSeries = redComplaintOption.series as JsonObject[];
const redComplaintFirstSeries = redComplaintSeries[0] as JsonObject;
const redComplaintSideSummary1Props = nodeProps(redComplaintSideSummary1);
const redComplaintTotalProps = nodeProps(redComplaintTotal);
const redComplaintSideSummary1Style = redComplaintSideSummary1Props.style as JsonObject;
const redComplaintTotalStyle = redComplaintTotalProps.style as JsonObject;
assert.equal((redComplaintOption.color as string[])[0], "#FF2D4F");
assert.equal((redComplaintLegend.textStyle as JsonObject).color, "#FFF3F3");
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
assert.deepEqual(redComplaintCenter, ["50%", "42%"]);
assert.deepEqual(redComplaintFirstSeries.radius, ["34%", "54%"]);
assert.equal((redComplaintFirstSeries.label as JsonObject).show, true);
assert.equal((redComplaintFirstSeries.label as JsonObject).formatter, "{b}");
assert.equal(redComplaintSideSummary1Style.height, 14);
assert.equal(redComplaintSideSummary1Style.fontSize, 14);
assert.equal(redComplaintSideSummary1Style.lineHeight, 1);
assert.ok(
  !((redComplaintSideSummary1Props.textContent as string | undefined) ?? "").includes("\n"),
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
  (alarmSideFirstStyle.height as number) >= 36 &&
    (alarmSideFirstStyle.height as number) <= 44,
  "alarm side rows should reserve compact two-line text height",
);
assert.ok(
  (alarmSideLastStyle.top as number) > (alarmSideFirstStyle.top as number),
  "alarm side summaries should keep ordered row positions",
);
assert.ok(
  alarmConclusionStyle.height === 12 && alarmConclusionStyle.lineHeight === 1,
  "alarm conclusion should use a single-line text box",
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
const promptGeneratedNodes = flattenEditorNodes(promptGeneratedTree as unknown as JsonObject);
const promptGeneratedChart = promptGeneratedNodes.find(
  (item) => item.componentName === "PieChart",
);
assert.ok(promptGeneratedChart, "prompt entry should generate a real PieChart");
const promptGeneratedOption = nodeProps(promptGeneratedChart).option as JsonObject;
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
const promptGeneratedChartData = nodeProps(promptGeneratedChart).chartData as JsonObject;
const promptGeneratedConstant = promptGeneratedChartData.constant as JsonObject;
assert.deepEqual(promptGeneratedConstant.data, [
  { name: "高风险", type: "风险", value: 18 },
  { name: "中风险", type: "风险", value: 37 },
  { name: "低风险", type: "风险", value: 71 },
]);
const promptGeneratedTexts = promptGeneratedNodes
  .filter((item) => item.componentName === "SingleText")
  .map((item) => nodeProps(item).textContent);
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
assert.equal((moduleTreeSchema.props.style as JsonObject).left, 48);
assert.equal((moduleTreeSchema.props.style as JsonObject).top, 96);
assert.equal((moduleTreeSchema.props.style as JsonObject).width, 520);
assert.equal((moduleTreeSchema.props.style as JsonObject).height, 360);
assert.equal(moduleTreeSchema.title, "销售渠道占比");
assert.equal(moduleTreeSchema.isHidden, false);
assert.equal(moduleTreeSchema.isLocked, false);
assert.equal(moduleTreeSchema.isGroup, true);
assert.equal(moduleTreeSchema.children.length, 5);
assert.deepEqual(
  moduleTreeSchema.children.map((item) => item.componentName),
  [
    "SingleText",
    "SingleText",
    "PieChart",
    "SvgDecoration",
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
assertRandomizedId(moduleTreeSchema.children[2]?.id ?? "", "main_chart", "module tree chart id");
assertRandomizedId(moduleTreeSchema.children[0]?.id ?? "", "title", "module tree title id");
assert.equal(moduleTreeSchema.children[0]?.isGroup, false);
assert.equal(moduleTreeSchema.children[0]?.structVersion, "0.0.2");
assert.equal(
  (moduleTreeSchema.children[0]?.props as JsonObject).logicalId,
  moduleTreeSchema.children[0]?.id,
);

const groupedChartPanelTree = generateModuleTreeSchema({
  ...chartPanelInput,
  logicalId: "grouped_sales_channel_panel",
  grouping: {
    mode: "semantic",
    singleChildGroup: true,
  },
} satisfies JsonObject);
assert.ok(
  groupedChartPanelTree.children.every((item) => item.componentName === "__Group__"),
  "ChartPanel should group single semantic children when requested",
);
assert.deepEqual(
  groupedChartPanelTree.children.map((item) => item.title),
  ["标题", "辅助文本", "主内容", "装饰", "背景"],
);
const groupedChartPanelNodes = flattenEditorNodes(groupedChartPanelTree as unknown as JsonObject);
assert.ok(
  groupedChartPanelNodes.some((item) => item.componentName === "PieChart"),
  "grouped ChartPanel tree should preserve the chart component",
);
assert.equal(
  groupedChartPanelTree.children.at(-1)?.title,
  "背景",
  "grouped ChartPanel tree should keep the background group last",
);
assert.equal(
  groupedChartPanelTree.children.find((item) => item.title === "主内容")?.isGroup,
  true,
  "grouped ChartPanel tree should keep main content grouped above decorations",
);
assert.equal(
  groupedChartPanelTree.children.find((item) => item.title === "装饰")?.isGroup,
  true,
  "grouped ChartPanel tree should keep decorations grouped below main content",
);

const freeformModuleInput: JsonObject = {
  moduleName: "FreeformModule",
  logicalId: "kpi_panel",
  parentLogicalId: "root",
  title: "核心指标",
  grouping: {
    mode: "semantic",
    singleChildGroup: true,
  },
  style: {
    position: "absolute",
    left: 600,
    top: 100,
    width: 360,
    height: 180,
  },
  slots: {
    children: [
      {
        componentName: "SingleText",
        logicalId: "kpi_title",
        name: "模块标题",
        textContent: "核心指标",
        style: {
          position: "absolute",
          left: 620,
          top: 118,
          width: 160,
          height: 22,
          fontSize: 22,
          lineHeight: 1,
        },
      },
      {
        componentName: "Indicator",
        logicalId: "revenue_indicator",
        name: "销售额",
        textValue: 128760,
        titleName: "销售额",
        suffix: true,
        suffixTitle: "元",
        titleStyle: {
          lineHeight: 1,
        },
        numberStyle: {
          lineHeight: 1,
        },
        style: {
          position: "absolute",
          left: 620,
          top: 150,
          width: 300,
          height: 92,
        },
      },
      {
        componentName: "SvgDecoration",
        logicalId: "kpi_border",
        props: {
          name: "指标面板边框",
          svgSource: "custom",
          svgContent:
            '<svg viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg"><path d="M1 24V1h80M359 156v23h-80" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
          style: {
            position: "absolute",
            left: 600,
            top: 100,
            width: 360,
            height: 180,
          },
        },
      },
      {
        componentName: "SingleImage",
        logicalId: "kpi_background",
        name: "指标背景",
        imageBase64: "data:image/png;base64,KPIBACKGROUND",
        opacity: 0.9,
        style: {
          position: "absolute",
          left: 600,
          top: 100,
          width: 360,
          height: 180,
        },
      },
    ],
  },
};

const freeformSchemas = generateModuleSchema(freeformModuleInput);
assert.deepEqual(
  freeformSchemas.map((item) => item.componentName),
  ["SingleText", "Indicator", "SvgDecoration", "SingleImage"],
  "FreeformModule should compile explicit children and keep background last",
);
const freeformTree = generateModuleTreeSchema(freeformModuleInput);
assert.equal(freeformTree.componentName, "__Group__");
assert.equal(freeformTree.title, "核心指标");
assert.equal((freeformTree.props.style as JsonObject).left, 600);
assert.equal((freeformTree.props.style as JsonObject).top, 100);
assert.equal((freeformTree.props.style as JsonObject).width, 360);
assert.equal((freeformTree.props.style as JsonObject).height, 180);
assert.deepEqual(
  freeformTree.children.map((item) => item.title),
  ["标题", "主内容", "装饰", "背景"],
  "FreeformModule should apply common semantic grouping",
);
assert.ok(
  freeformTree.children.every((item) => item.componentName === "__Group__"),
  "FreeformModule should group single semantic children when requested",
);
assert.equal(
  freeformTree.children.at(-1)?.title,
  "背景",
  "FreeformModule should keep the background group last",
);
assert.equal(
  freeformTree.children.find((item) => item.title === "主内容")?.isGroup,
  true,
  "FreeformModule should keep main content above decorations",
);
const freeformNodes = flattenEditorNodes(freeformTree as unknown as JsonObject);
assert.ok(
  freeformNodes.some((item) => item.componentName === "Indicator"),
  "FreeformModule should preserve non-chart business components",
);
assert.ok(
  freeformNodes
    .filter((item) => item.componentName !== "__Group__")
    .every((item) => (nodeProps(item).parentLogicalId as string | undefined) === freeformTree.id),
  "FreeformModule child parentLogicalId should reference randomized module group id",
);

const titleBackdropTree = generateDashboardSchema({
  logicalId: "title_backdrop_dashboard",
  title: "标题承托大屏",
  canvas: {
    width: 800,
    height: 240,
  },
  grouping: {
    mode: "semantic",
    singleChildGroup: true,
  },
  groups: [
    {
      logicalId: "header_group",
      title: "顶部标题区",
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: 800,
        height: 96,
      },
      components: [
        {
          componentName: "SvgDecoration",
          logicalId: "header_title_backdrop",
          name: "标题背景框",
          svgSource: "custom",
          svgContent:
            '<svg viewBox="0 0 800 96" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="798" height="94" fill="rgba(0,0,0,.24)" stroke="currentColor"/></svg>',
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            width: 800,
            height: 96,
            zIndex: 503,
          },
        },
        {
          componentName: "SvgDecoration",
          logicalId: "header_panel_frame",
          name: "面板边框",
          svgSource: "custom",
          svgContent:
            '<svg viewBox="0 0 800 96" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="796" height="92" fill="rgba(0,0,0,.12)" stroke="currentColor"/></svg>',
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            width: 800,
            height: 96,
            zIndex: 502,
          },
        },
        {
          componentName: "SvgDecoration",
          logicalId: "filled_panel_frame",
          name: "重点商机面板边框",
          svgSource: "custom",
          svgContent:
            '<svg viewBox="0 0 800 96" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="796" height="92" fill="rgba(8,33,58,.78)" stroke="currentColor"/></svg>',
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            width: 800,
            height: 96,
            zIndex: 504,
          },
        },
        {
          componentName: "SingleText",
          logicalId: "header_title_text",
          name: "主标题",
          textContent: "销售经营态势大屏",
          style: {
            position: "absolute",
            left: 180,
            top: 24,
            width: 440,
            height: 36,
            fontSize: 36,
            lineHeight: 1,
            zIndex: 501,
          },
        },
      ],
    },
  ],
} as JsonObject);
const titleBackdropHeader = titleBackdropTree.children.find(
  (item) => item.title === "顶部标题区",
) as JsonObject | undefined;
assert.ok(titleBackdropHeader, "DashboardSpec should compile the explicit header group");
const titleBackdropHeaderChildren = Array.isArray(titleBackdropHeader.children)
  ? titleBackdropHeader.children as JsonObject[]
  : [];
assert.deepEqual(
  titleBackdropHeaderChildren.map((item) => item.title),
  ["标题", "背景"],
  "Title backdrops should be grouped below title text instead of covering it",
);
assert.equal(
  titleBackdropHeaderChildren.at(-1)?.title,
  "背景",
  "Title backdrop group should stay on the bottom layer",
);
const titleBackdropBackgroundGroup = titleBackdropHeaderChildren.at(-1) as JsonObject;
const titleBackdropBackgroundChildren = Array.isArray(titleBackdropBackgroundGroup.children)
  ? titleBackdropBackgroundGroup.children as JsonObject[]
  : [];
assert.deepEqual(
  titleBackdropBackgroundChildren.map((item) => nodeProps(item).name),
  ["标题背景框", "面板边框", "重点商机面板边框"],
  "Title backdrop and filled panel frame decorations should be treated as background carriers",
);
assert.ok(
  titleBackdropBackgroundChildren.every((item) => {
    const style = nodeProps(item).style as JsonObject;
    return style.zIndex === 0;
  }),
  "Semantic background carriers should not keep high zIndex values that can cover text or charts",
);

const dashboardSpec = {
  logicalId: "ops_dashboard",
  title: "运营洞察大屏",
  canvas: {
    width: 1280,
    height: 720,
  },
  grouping: {
    mode: "semantic",
    singleChildGroup: true,
  },
  theme: {
    primaryColor: "#28E0B9",
    secondaryColor: "#2F80ED",
    accentColor: "#FFB020",
    textColor: "#EFFFFA",
  },
  components: [
    {
      componentName: "SingleText",
      logicalId: "dashboard_title",
      textContent: "运营洞察大屏",
      style: {
        position: "absolute",
        left: 40,
        top: 24,
        width: 360,
        height: 32,
        fontSize: 32,
        lineHeight: 1,
      },
    },
    {
      componentName: "SingleImage",
      logicalId: "dashboard_background",
      imageBase64: "data:image/png;base64,REALBACKGROUND",
      opacity: 0.92,
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: 1280,
        height: 720,
      },
    },
  ],
  groups: [
    {
      logicalId: "dashboard_header_group",
      title: "顶部信息组",
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: 1280,
        height: 88,
      },
      components: [
        {
          componentName: "SvgDecoration",
          logicalId: "dashboard_header_decoration",
          name: "顶部结构线",
          svgSource: "custom",
          svgContent:
            '<svg viewBox="0 0 1280 88" xmlns="http://www.w3.org/2000/svg"><path d="M40 72H1240" stroke="#28E0B9" stroke-width="2"/></svg>',
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            width: 1280,
            height: 88,
          },
        },
        {
          componentName: "SingleImage",
          logicalId: "dashboard_header_background",
          name: "顶部背景",
          imageBase64: "data:image/png;base64,HEADERBACKGROUND",
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            width: 1280,
            height: 88,
          },
        },
      ],
    },
  ],
  modules: [
    {
      moduleName: "ChartPanel",
      logicalId: "risk_panel",
      title: "风险等级分析",
      style: {
        position: "absolute",
        left: 40,
        top: 100,
        width: 520,
        height: 360,
      },
      slots: {
        title: {
          componentName: "SingleText",
          props: {
            textContent: "风险等级分析",
          },
        },
        mainChart: {
          componentName: "PieChart",
          props: {
            chartData: {
              constant: {
                data: [
                  { name: "高风险", type: "风险", value: 18 },
                  { name: "中风险", type: "风险", value: 37 },
                  { name: "低风险", type: "风险", value: 71 },
                ],
              },
            },
            option: {
              legend: {
                left: "center",
                top: "bottom",
              },
            },
          },
        },
        decorations: [
          {
            componentName: "SvgDecoration",
            props: {
              name: "AI自定义标题线",
              svgContent:
                '<svg viewBox="0 0 120 12" xmlns="http://www.w3.org/2000/svg"><path d="M0 6H120" stroke="#28E0B9" stroke-width="2"/></svg>',
              style: {
                position: "absolute",
                left: 64,
                top: 150,
                width: 180,
                height: 18,
              },
            },
          },
        ],
        auxiliaryTexts: [
          {
            componentName: "SingleText",
            props: {
              name: "风险结论",
              textContent: "高风险占比 14.3%，优先跟进高风险区域",
            },
          },
        ],
      },
    },
    {
      ...freeformModuleInput,
      logicalId: "dashboard_kpi_panel",
      parentLogicalId: "ops_dashboard",
      grouping: undefined,
    },
  ],
} as JsonObject;

const dashboardValidation = validateDashboardSpec(dashboardSpec);
assert.equal(dashboardValidation.valid, true, "DashboardSpec should validate");
assert.deepEqual(dashboardValidation.errors, []);
const missingAuxiliaryTextValidation = validateDashboardSpec({
  logicalId: "missing_auxiliary_text_dashboard",
  modules: [
    {
      moduleName: "ChartPanel",
      logicalId: "missing_auxiliary_panel",
      title: "缺少辅助文本面板",
      style: {
        position: "absolute",
        left: 24,
        top: 80,
        width: 420,
        height: 280,
      },
      slots: {
        mainChart: {
          componentName: "LineChart",
          props: {
            chartData: {
              constant: {
                data: [
                  { name: "一月", type: "销售额", value: 42 },
                  { name: "二月", type: "销售额", value: 58 },
                ],
              },
            },
          },
        },
      },
    },
  ],
} as JsonObject);
assert.equal(missingAuxiliaryTextValidation.valid, false);
assert.ok(
  (missingAuxiliaryTextValidation.errors as string[]).some((error) =>
    error.includes("slots.auxiliaryTexts"),
  ),
  "DashboardSpec validation should reject manual ChartPanel modules without auxiliary business text",
);
const invalidGroupingValidation = validateDashboardSpec({
  ...dashboardSpec,
  grouping: { mode: "template" },
} as JsonObject);
assert.equal(invalidGroupingValidation.valid, false);
assert.ok(
  (invalidGroupingValidation.errors as string[]).includes("grouping.mode must be semantic or none"),
  "DashboardSpec validation should reject unknown grouping modes",
);
const flatComponentValidation = validateDashboardSpec({
  logicalId: "flat_component_dashboard",
  components: Array.from({ length: 9 }, (_, index) => ({
    componentName: "SingleText",
    logicalId: `flat_text_${index + 1}`,
    textContent: `散装组件${index + 1}`,
    style: {
      position: "absolute",
      left: index * 10,
      top: index * 10,
      width: 100,
      height: 20,
    },
  })),
} as JsonObject);
assert.equal(flatComponentValidation.valid, true);
assert.ok(
  (flatComponentValidation.warnings as string[]).some((warning) =>
    warning.includes("DashboardSpec.groups or modules"),
  ),
  "DashboardSpec validation should warn when many top-level components are not grouped",
);
const missingGroupStyleSpec = {
  logicalId: "missing_group_style_dashboard",
  groups: [
    {
      logicalId: "floating_group",
      title: "未定位组件组",
      components: [
        {
          componentName: "SingleText",
          logicalId: "floating_group_title",
          textContent: "未定位组件组",
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            width: 180,
            height: 24,
          },
        },
      ],
    },
  ],
} as JsonObject;
const missingGroupStyleValidation = validateDashboardSpec(missingGroupStyleSpec);
assert.equal(missingGroupStyleValidation.valid, false);
assert.ok(
  (missingGroupStyleValidation.errors as string[]).includes(
    "groups[0] missing complete style left/top/width/height",
  ),
  "DashboardSpec validation should reject explicit groups without complete style",
);
assert.throws(
  () => generateDashboardSchema(missingGroupStyleSpec),
  /groups\[0\] missing complete style left\/top\/width\/height/u,
  "DashboardSpec compiler should reject unpositioned explicit groups",
);
const emptyGroupSvgValidation = validateDashboardSpec({
  logicalId: "empty_group_svg_dashboard",
  groups: [
    {
      logicalId: "decorated_group",
      title: "空装饰组件组",
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: 320,
        height: 120,
      },
      components: [
        {
          componentName: "SvgDecoration",
          logicalId: "empty_group_decoration",
          name: "空装饰",
          svgSource: "custom",
          svgContent: "",
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            width: 320,
            height: 120,
          },
        },
      ],
    },
  ],
} as JsonObject);
assert.equal(emptyGroupSvgValidation.valid, false);
assert.ok(
  (emptyGroupSvgValidation.errors as string[]).some((error) =>
    error.includes("groups[0].components[0] SvgDecoration must include non-empty svgContent or svgPreset"),
  ),
  "DashboardSpec validation should reject empty SvgDecoration components",
);
const emptyModuleSvgValidation = validateDashboardSpec({
  logicalId: "empty_module_svg_dashboard",
  modules: [
    {
      moduleName: "ChartPanel",
      logicalId: "empty_svg_chart_panel",
      title: "空装饰模块",
      style: {
        position: "absolute",
        left: 24,
        top: 80,
        width: 420,
        height: 280,
      },
      slots: {
        mainChart: {
          componentName: "PieChart",
          props: {
            chartData: {
              constant: {
                data: [{ name: "A", type: "分类", value: 1 }],
              },
            },
          },
        },
        decorations: [
          {
            componentName: "SvgDecoration",
            props: {
              name: "空模块装饰",
              svgSource: "custom",
              svgContent: "",
            },
          },
        ],
      },
    },
  ],
} as JsonObject);
assert.equal(emptyModuleSvgValidation.valid, false);
assert.ok(
  (emptyModuleSvgValidation.errors as string[]).some((error) =>
    error.includes("modules[0].slots.decorations[0] SvgDecoration must include non-empty svgContent or svgPreset"),
  ),
  "DashboardSpec validation should reject empty module decoration slots",
);
const placeholderTextValidation = validateDashboardSpec({
  logicalId: "placeholder_text_dashboard",
  components: [
    {
      componentName: "SingleText",
      logicalId: "placeholder_text",
      textContent: "辅助信息",
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: 180,
        height: 18,
      },
    },
  ],
} as JsonObject);
assert.equal(placeholderTextValidation.valid, false);
assert.ok(
  (placeholderTextValidation.errors as string[]).some((error) =>
    error.includes("SingleText textContent must be real business copy"),
  ),
  "DashboardSpec validation should reject visible placeholder text",
);
const missingChartDataValidation = validateDashboardSpec({
  logicalId: "missing_chart_data_dashboard",
  modules: [
    {
      moduleName: "ChartPanel",
      logicalId: "missing_chart_data_panel",
      title: "缺少数据图表",
      style: {
        position: "absolute",
        left: 24,
        top: 80,
        width: 420,
        height: 280,
      },
      slots: {
        mainChart: {
          componentName: "PieChart",
          props: {},
        },
      },
    },
  ],
} as JsonObject);
assert.equal(missingChartDataValidation.valid, false);
assert.ok(
  (missingChartDataValidation.errors as string[]).some((error) =>
    error.includes("must include explicit chartData.constant.data"),
  ),
  "DashboardSpec validation should reject chart slots that would fall back to demo data",
);
const defaultDemoChartDataValidation = validateDashboardSpec({
  logicalId: "default_demo_chart_data_dashboard",
  components: [
    {
      componentName: "PieChart",
      logicalId: "default_demo_pie",
      chartData: {
        constant: {
          data: [
            { name: "类目1", type: "系列", value: 101 },
            { name: "类目2", type: "系列", value: 71 },
          ],
        },
      },
      style: {
        position: "absolute",
        left: 24,
        top: 80,
        width: 320,
        height: 240,
      },
    },
  ],
} as JsonObject);
assert.equal(defaultDemoChartDataValidation.valid, false);
assert.ok(
  (defaultDemoChartDataValidation.errors as string[]).some((error) =>
    error.includes("not default 类目/系列 demo rows"),
  ),
  "DashboardSpec validation should reject default demo chart rows",
);
const fallbackBackgroundDashboardSpec = {
  logicalId: "fallback_background_dashboard",
  title: "背景补齐大屏",
  canvas: { width: 1280, height: 720 },
  grouping: {
    mode: "semantic",
    singleChildGroup: true,
  },
  theme: {
    background: "#04111F",
    panelBackground: "rgba(8,30,50,0.74)",
    primaryColor: "#16D9FF",
    textColor: "#EAF7FF",
  },
  groups: [
    {
      logicalId: "bare_header_group",
      title: "顶部区域",
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: 1280,
        height: 88,
      },
      components: [
        {
          componentName: "SingleText",
          logicalId: "bare_header_title",
          name: "主标题",
          textContent: "背景补齐大屏",
          style: {
            position: "absolute",
            left: 420,
            top: 24,
            width: 440,
            height: 32,
            fontSize: 32,
            lineHeight: 1,
          },
        },
      ],
    },
  ],
  modules: [
    {
      moduleName: "ChartPanel",
      logicalId: "bare_chart_panel",
      title: "无显式背景面板",
      style: {
        position: "absolute",
        left: 40,
        top: 120,
        width: 520,
        height: 320,
      },
      slots: {
        title: {
          componentName: "SingleText",
          props: {
            textContent: "无显式背景面板",
          },
        },
        mainChart: {
          componentName: "LineChart",
          props: {
            chartData: {
              constant: {
                data: [
                  { name: "一月", type: "销售额", value: 42 },
                  { name: "二月", type: "销售额", value: 58 },
                ],
              },
            },
          },
        },
        auxiliaryTexts: [
          {
            componentName: "SingleText",
            props: {
              name: "面板结论",
              textContent: "二月销售额较一月提升 38.1%",
            },
          },
        ],
      },
    },
  ],
} as JsonObject;
const fallbackBackgroundTree = generateDashboardSchema(fallbackBackgroundDashboardSpec);
const fallbackBackgroundNodes = flattenEditorNodes(fallbackBackgroundTree as unknown as JsonObject);
assert.ok(
  fallbackBackgroundNodes.some((item) => hasPropName(item, "全屏背景")),
  "DashboardSpec compiler should add a real full-screen background component when none is provided",
);
assert.ok(
  fallbackBackgroundNodes.some((item) => hasPropName(item, "分组背景")),
  "DashboardSpec compiler should add a real background carrier for bare explicit groups",
);
assert.ok(
  fallbackBackgroundNodes.some((item) => hasPropName(item, "模块背景")),
  "DashboardSpec compiler should add a real background carrier for bare modules",
);
const fallbackRootBackgroundGroup = fallbackBackgroundTree.children.at(-1);
assert.equal(
  fallbackRootBackgroundGroup?.title,
  "背景",
  "DashboardSpec fallback full-screen background should be in the bottom background group",
);
const fallbackBareModule = fallbackBackgroundTree.children.find(
  (item) => item.componentName === "__Group__" && item.title === "无显式背景面板",
);
assert.ok(fallbackBareModule, "DashboardSpec should include bare module group");
assert.ok(Array.isArray(fallbackBareModule.children), "bare module group should include children");
assert.equal(
  fallbackBareModule.children.at(-1)?.title,
  "背景",
  "DashboardSpec fallback module background should be in the module background group",
);
const dashboardTree = generateDashboardSchema(dashboardSpec);
assert.equal(dashboardTree.componentName, "__Group__");
assert.equal(dashboardTree.title, "运营洞察大屏");
assert.equal((dashboardTree.props.style as JsonObject).width, 1280);
assert.equal((dashboardTree.props.style as JsonObject).height, 720);
assert.equal(
  dashboardTree.props.theme,
  undefined,
  "DashboardSpec root props should not carry compiler-only theme",
);
assert.equal(
  dashboardTree.children.at(-1)?.title,
  "背景",
  "DashboardSpec root semantic background group should be last",
);
const dashboardNodes = flattenEditorNodes(dashboardTree as unknown as JsonObject);
assert.ok(
  dashboardNodes.some((item) => item.componentName === "PieChart"),
  "DashboardSpec compiler should include module chart nodes",
);
assert.ok(
  dashboardNodes.some((item) => hasPropName(item, "AI自定义标题线")),
  "DashboardSpec compiler should preserve LLM-authored decorations",
);
assert.equal(
  dashboardNodes.some((item) => {
    const props = item.props;
    return typeof props === "object" &&
      props !== null &&
      !Array.isArray(props) &&
      (props as JsonObject).theme !== undefined;
  }),
  false,
  "DashboardSpec compiler should strip repeated theme objects from all output nodes",
);
const dashboardHeaderGroup = dashboardTree.children.find(
  (item) => item.componentName === "__Group__" && item.title === "顶部信息组",
);
assert.ok(dashboardHeaderGroup, "DashboardSpec should compile explicit component groups");
assert.ok(
  Array.isArray(dashboardHeaderGroup.children),
  "DashboardSpec explicit component group should include children",
);
assert.ok(
  dashboardHeaderGroup.children.every((item) => item.componentName === "__Group__"),
  "DashboardSpec explicit component groups should inherit semantic grouping",
);
assert.equal(
  dashboardHeaderGroup.children.at(-1)?.title,
  "背景",
  "DashboardSpec explicit component group should keep background subgroup last",
);
assert.ok(
  flattenEditorNodes(dashboardHeaderGroup as unknown as JsonObject)
    .filter((item) => item.componentName !== "__Group__")
    .every((item) => (nodeProps(item).parentLogicalId as string | undefined) === dashboardHeaderGroup.id),
  "DashboardSpec explicit component group children should reference group id",
);
const dashboardRiskModule = dashboardTree.children.find(
  (item) => item.componentName === "__Group__" && item.title === "风险等级分析",
);
assert.ok(dashboardRiskModule, "DashboardSpec should include the ChartPanel module group");
assert.ok(
  Array.isArray(dashboardRiskModule.children),
  "DashboardSpec ChartPanel module should include children",
);
assert.ok(
  dashboardRiskModule.children.every((item) => item.componentName === "__Group__"),
  "DashboardSpec grouping should be inherited by ChartPanel modules",
);
assert.ok(
  flattenEditorNodes(dashboardRiskModule as unknown as JsonObject).some((item) =>
    hasPropName(item, "模块背景"),
  ),
  "DashboardSpec should add a module background when ChartPanel has no explicit background carrier",
);
const dashboardKpiModule = dashboardTree.children.find(
  (item) => item.componentName === "__Group__" && item.title === "核心指标",
);
assert.ok(dashboardKpiModule, "DashboardSpec should include the FreeformModule group");
assert.ok(
  Array.isArray(dashboardKpiModule.children),
  "DashboardSpec FreeformModule should include children",
);
assert.ok(
  dashboardKpiModule.children.every((item) => item.componentName === "__Group__"),
  "DashboardSpec grouping should be inherited by FreeformModule modules",
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
  assert.ok(
    tools.tools.some((tool) => tool.name === "validate_dashboard_spec"),
    "MCP server should expose DashboardSpec validation",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "generate_dashboard_schema"),
    "MCP server should expose DashboardSpec compiler",
  );
  const serverInstructions = client.getInstructions();
  assert.ok(
    serverInstructions?.includes("LLM owns design decisions") &&
      serverInstructions.includes("DashboardSpec") &&
      serverInstructions.includes("generate_dashboard_schema") &&
      serverInstructions.includes("FreeformModule") &&
      serverInstructions.includes("grouping.singleChildGroup"),
    "MCP server instructions should steer full dashboards through LLM-authored DashboardSpec",
  );
  assert.ok(
    serverInstructions?.includes("完整schema") &&
      serverInstructions.includes("complete JSON") &&
      serverInstructions.includes("complete JSON returned by the tool"),
    "MCP server instructions should require complete schema output when requested",
  );
  const promptEntryTool = tools.tools.find(
    (tool) => tool.name === "generate_screen_module_from_prompt",
  );
  assert.ok(
    promptEntryTool?.description?.includes("Legacy single-module prompt helper") &&
      promptEntryTool.description.includes("Prefer DashboardSpec"),
    "prompt entry tool should be discoverable as a legacy helper while steering production use to DashboardSpec",
  );
  assert.ok(
    promptEntryTool?.description &&
      promptEntryTool.description.length < 260,
    "prompt entry tool description should stay compact for faster model routing",
  );
  const moduleTreeTool = tools.tools.find(
    (tool) => tool.name === "generate_module_tree_schema",
  );
  assert.ok(
    moduleTreeTool?.description?.includes("__Group__") &&
      moduleTreeTool.description.includes("grouping.singleChildGroup"),
    "module tree tool should document grouped module tree generation compactly",
  );
  assert.ok(
    moduleTreeTool?.description &&
      moduleTreeTool.description.length < 360,
    "module tree tool description should stay compact for faster model routing",
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
    "2026-06-24.06-no-demo-chart-data-direct-tools",
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
    (diagnostics.rulesFingerprint as string[]).includes("no-svg-preset-fallback"),
    "diagnostics should expose no SVG preset fallback fingerprint",
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
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("freeform-module-explicit-children"),
    "diagnostics should expose FreeformModule fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("common-semantic-module-grouping"),
    "diagnostics should expose common semantic grouping fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-grouping-inheritance"),
    "diagnostics should expose DashboardSpec grouping inheritance fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-group-style-required"),
    "diagnostics should expose DashboardSpec group style requirement fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("no-empty-svg-decoration"),
    "diagnostics should expose empty SVG decoration rejection fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-root-background-component"),
    "diagnostics should expose root background carrier fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("module-background-carrier-fallback"),
    "diagnostics should expose module background carrier fallback fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("svg-background-grouping"),
    "diagnostics should expose SVG background grouping fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("compiler-theme-stripped"),
    "diagnostics should expose compiler-only theme stripping fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("module-group-style-props"),
    "diagnostics should expose module group style fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-placeholder-text-rejected"),
    "diagnostics should expose placeholder text rejection fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-chart-data-required"),
    "diagnostics should expose dashboard chart data requirement fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("chartpanel-auxiliary-text-required"),
    "diagnostics should expose ChartPanel auxiliary text requirement fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("direct-chart-demo-data-rejected"),
    "diagnostics should expose direct chart demo data rejection fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("module-chartpanel-auxiliary-text-required"),
    "diagnostics should expose direct module ChartPanel auxiliary text requirement fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("ringchart-dense-legend-label-layout"),
    "diagnostics should expose dense RingChart legend and label layout fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("filled-panel-frame-background"),
    "diagnostics should expose filled panel frame background grouping fingerprint",
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
  assert.equal(mcpCapability.compact, true, "MCP capability should default to compact mode");
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
  assert.equal(
    Array.isArray(mcpCapability.examples),
    false,
    "compact MCP capability should omit examples for speed",
  );
  assert.ok(
    typeof mcpCapability.exampleCount === "number" && mcpCapability.exampleCount > 0,
    "compact MCP capability should expose omitted example count",
  );
  const writableProps = mcpCapability.aiWritableProps as JsonObject[];
  const legendCapability = writableProps.find(
    (item) => item.path === "option.legend",
  ) as JsonObject | undefined;
  assert.ok(legendCapability, "MCP capability should describe option.legend");
  assert.ok(
    legendCapability.positionRules,
    "MCP capability should describe legend position rules",
  );
  const fullCapabilityResult = await client.callTool({
    name: "get_component_capability",
    arguments: { componentName: "PieChart", detail: "full" },
  });
  const fullMcpCapability = readToolJson(fullCapabilityResult);
  assert.ok(
    Array.isArray(fullMcpCapability.examples),
    "MCP full capability should include examples when requested",
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
  assert.ok(
    listedModules.some(
      (moduleItem: JsonObject) => moduleItem.moduleName === "FreeformModule",
    ),
    "MCP list_modules should include FreeformModule",
  );

  const moduleCapabilityResult = await client.callTool({
    name: "get_module_capability",
    arguments: { moduleName: "ChartPanel" },
  });
  const mcpModuleCapability = readToolJson(moduleCapabilityResult);
  assert.equal(
    mcpModuleCapability.compact,
    true,
    "MCP module capability should default to compact mode",
  );
  assert.ok(mcpModuleCapability.slots, "MCP module capability should include slots");
  assert.equal(
    (mcpModuleCapability.groupSchema as JsonObject).componentName,
    "__Group__",
  );
  assert.equal(
    Array.isArray(mcpModuleCapability.layoutRules),
    false,
    "compact MCP module capability should omit full layoutRules for speed",
  );
  assert.ok(
    Array.isArray(mcpModuleCapability.layoutRuleGroups),
    "compact MCP module capability should retain layout rule group summaries",
  );
  const fullModuleCapabilityResult = await client.callTool({
    name: "get_module_capability",
    arguments: { moduleName: "ChartPanel", detail: "full" },
  });
  const fullMcpModuleCapability = readToolJson(fullModuleCapabilityResult);
  assert.ok(
    Array.isArray(fullMcpModuleCapability.layoutRules),
    "MCP full module capability should include full layoutRules when requested",
  );
  const freeformCapabilityResult = await client.callTool({
    name: "get_module_capability",
    arguments: { moduleName: "FreeformModule" },
  });
  const mcpFreeformCapability = readToolJson(freeformCapabilityResult);
  assert.ok(mcpFreeformCapability.slots, "MCP FreeformModule capability should include slots");
  assert.equal(
    (mcpFreeformCapability.groupSchema as JsonObject).componentName,
    "__Group__",
  );

  const moduleSchemaResult = await client.callTool({
    name: "generate_module_schema",
    arguments: chartPanelInput,
  });
  assert.equal(moduleSchemaResult.isError, undefined);
  const toolModuleSchemas = readToolJson(moduleSchemaResult);
  assert.equal(toolModuleSchemas.length, 5);
  assert.equal(toolModuleSchemas[0].componentName, "SingleText");
  assert.equal(toolModuleSchemas[1].componentName, "SingleText");
  assert.equal(toolModuleSchemas[2].componentName, "PieChart");
  assert.equal(toolModuleSchemas[3].componentName, "SvgDecoration");
  assert.equal(toolModuleSchemas[4].componentName, "SingleImage");
  assert.equal(
    toolModuleSchemas.some((item: JsonObject) => hasPropName(item, "侧边摘要容器")),
    false,
    "MCP tool should not synthesize side summary decoration templates",
  );
  assert.equal(
    toolModuleSchemas.some((item: JsonObject) => hasPropName(item, "侧边摘要分隔线")),
    false,
    "MCP tool should not synthesize side summary row-rule decoration templates",
  );
  assert.equal(
    toolModuleSchemas.some((item: JsonObject) => hasPropName(item, "主图侧卡关联线")),
    false,
    "MCP tool should not synthesize chart-to-side-card connector templates",
  );
  assert.equal(
    toolModuleSchemas.some((item: JsonObject) => hasPropName(item, "底部结构线")),
    false,
    "MCP tool should not synthesize bottom structure decoration templates",
  );

  const moduleTreeSchemaResult = await client.callTool({
    name: "generate_module_tree_schema",
    arguments: chartPanelInput,
  });
  assert.equal(moduleTreeSchemaResult.isError, undefined);
  const toolModuleTreeSchema = readToolJson(moduleTreeSchemaResult);
  assert.equal(toolModuleTreeSchema.componentName, "__Group__");
  assert.equal(toolModuleTreeSchema.structVersion, "0.0.0");
  assert.equal((toolModuleTreeSchema.props.style as JsonObject).left, 48);
  assert.equal((toolModuleTreeSchema.props.style as JsonObject).top, 96);
  assert.equal((toolModuleTreeSchema.props.style as JsonObject).width, 520);
  assert.equal((toolModuleTreeSchema.props.style as JsonObject).height, 360);
  assert.equal(toolModuleTreeSchema.children.length, 5);
  assert.equal(toolModuleTreeSchema.children[2].componentName, "PieChart");
  assert.equal(toolModuleTreeSchema.children[3].componentName, "SvgDecoration");

  const freeformModuleTreeResult = await client.callTool({
    name: "generate_module_tree_schema",
    arguments: freeformModuleInput,
  });
  assert.equal(freeformModuleTreeResult.isError, undefined);
  const toolFreeformTree = readToolJson(freeformModuleTreeResult);
  assert.equal(toolFreeformTree.componentName, "__Group__");
  assert.equal(toolFreeformTree.title, "核心指标");
  assert.deepEqual(
    toolFreeformTree.children.map((item: JsonObject) => item.title),
    ["标题", "主内容", "装饰", "背景"],
    "MCP FreeformModule tree should apply common semantic grouping",
  );

  const dashboardValidationResult = await client.callTool({
    name: "validate_dashboard_spec",
    arguments: dashboardSpec,
  });
  assert.equal(dashboardValidationResult.isError, undefined);
  const toolDashboardValidation = readToolJson(dashboardValidationResult);
  assert.equal(toolDashboardValidation.valid, true);
  assert.deepEqual(toolDashboardValidation.errors, []);

  const dashboardSchemaResult = await client.callTool({
    name: "generate_dashboard_schema",
    arguments: dashboardSpec,
  });
  assert.equal(dashboardSchemaResult.isError, undefined);
  const toolDashboardTree = readToolJson(dashboardSchemaResult);
  const toolDashboardNodes = flattenEditorNodes(toolDashboardTree as JsonObject);
  assert.equal(toolDashboardTree.componentName, "__Group__");
  assert.equal(toolDashboardTree.title, "运营洞察大屏");
  assert.equal(
    toolDashboardTree.children.at(-1)?.title,
    "背景",
    "DashboardSpec MCP compiler should keep root background group last",
  );
  const toolDashboardHeaderGroup = toolDashboardTree.children.find(
    (item: JsonObject) => item.componentName === "__Group__" && item.title === "顶部信息组",
  ) as JsonObject | undefined;
  assert.ok(
    toolDashboardHeaderGroup,
    "DashboardSpec MCP compiler should compile explicit component groups",
  );
  assert.equal(
    (toolDashboardHeaderGroup.children as JsonObject[]).at(-1)?.title,
    "背景",
    "DashboardSpec MCP compiler should keep explicit group background last",
  );
  assert.ok(
    toolDashboardNodes.some((item) => item.componentName === "PieChart"),
    "DashboardSpec MCP compiler should include module chart nodes",
  );
  assert.ok(
    toolDashboardNodes.some((item) => hasPropName(item, "AI自定义标题线")),
    "DashboardSpec MCP compiler should preserve LLM-authored decorations",
  );

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
  const toolPromptTexts = toolPromptModuleNodes
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
} finally {
  await client.close();
}

// ChartPanel + ThreeDPieChart integration
const threeDPanelInput = {
  moduleName: "ChartPanel",
  layoutMode: "assisted",
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

// Assisted mode keeps semantic helper texts/color anchors, but no fixed structure templates.
const threeDSvgDecorations = threeDModuleSchemas.filter((item) => item.componentName === "SvgDecoration");
assert.equal(
  threeDSvgDecorations.length,
  3,
  "ChartPanel ThreeDPieChart should include side summary color anchors only",
);
assert.equal(
  threeDSvgDecorations.some((d) => (d.props.name as string | undefined)?.includes("侧边摘要容器")),
  false,
  "3D panel should not synthesize side summary container decoration",
);
assert.equal(
  threeDSvgDecorations.some((d) => (d.props.name as string | undefined)?.includes("底部结构线")),
  false,
  "3D panel should not synthesize bottom structure line decoration",
);
assert.ok(
  threeDModuleSchemas.some((item) => item.componentName === "SingleText" && (item.props.name as string | undefined)?.includes("标题")),
  "3D panel should include title text",
);
assert.ok(
  threeDModuleSchemas.some((item) => item.componentName === "SingleText" && (item.props.name as string | undefined)?.includes("顶部结论")),
  "3D panel should include assisted conclusion text",
);

// ── LineChart panel assertions ───────────────────────────────
const lineChartPanelInput = {
  moduleName: "ChartPanel",
  layoutMode: "assisted",
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

// LineChart assisted mode should not invent structural SVG decorations.
const lineSvgDecorations = lineModuleSchemas.filter((item) => item.componentName === "SvgDecoration");
assert.equal(
  lineSvgDecorations.some((item) => (item.props.name as string | undefined)?.includes("侧边摘要容器")),
  false,
  "LineChart panel should not synthesize side summary container decoration",
);
assert.equal(
  lineSvgDecorations.some((item) => (item.props.name as string | undefined)?.includes("底部结构线")),
  false,
  "LineChart panel should not synthesize bottom structure line decoration",
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

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

// Earth3D parent + nested children schema generation
const earth3dSchema = generateComponentsSchema({
  componentName: "Earth3D",
  logicalId: "earth_3d_test",
  parentLogicalId: "earth_group",
  name: "测试3D地球",
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 1000,
    height: 800,
  },
  children: [
    {
      componentName: "Earth3D-Pointer",
      logicalId: "earth_pointer_test",
      name: "测试标记点",
      data: [
        { lng: 116.4074, lat: 39.9042, title: "北京" },
        { lng: 121.4737, lat: 31.2304, title: "上海" },
      ],
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      },
    },
  ],
});
assert.equal(earth3dSchema.componentName, "Earth3D", "Earth3D schema should have correct componentName");
assert.equal(earth3dSchema.parentBusinessElementId, "earth_group", "Earth3D schema should have correct parentBusinessElementId");
assert.equal(earth3dSchema.props.name, "测试3D地球", "Earth3D schema should preserve name");
assert.ok(isJsonObject(earth3dSchema.props.texture), "Earth3D schema should include texture defaults");
assert.ok(Array.isArray(earth3dSchema.children), "Earth3D schema should include children array");
const earthPointerSchema = earth3dSchema.children?.[0];
assert.ok(earthPointerSchema, "Earth3D-Pointer should be nested in Earth3D children");
assert.equal(earthPointerSchema.componentName, "Earth3D-Pointer", "Earth3D-Pointer schema should have correct componentName");
assert.equal(earthPointerSchema.parentBusinessElementId, earth3dSchema.businessElementId, "Earth3D-Pointer should reference parent businessElementId");
assert.equal(earthPointerSchema.props.earth3DId, earth3dSchema.businessElementId, "Earth3D-Pointer earth3DId should be auto-synced to parent businessElementId");
const earthPointerDatasource = asChartObject(earthPointerSchema.props.datasource);
const earthPointerConstantData = Array.isArray(earthPointerDatasource.constantData)
  ? earthPointerDatasource.constantData
  : [];
assert.equal(earthPointerConstantData.length, 2, "Earth3D-Pointer data should sync to datasource");
assert.equal(asChartObject(earthPointerConstantData[0]).title, "北京", "Earth3D-Pointer first row title should sync");
assert.equal(earthPointerDatasource.sourceType, "constant", "Earth3D-Pointer datasource sourceType should be constant");

// GaodeMap parent + nested children schema generation
const gaodeMapSchema = generateComponentsSchema({
  componentName: "GaodeMap",
  logicalId: "gaode_map_test",
  parentLogicalId: "map_group",
  name: "测试2D高德地图",
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 1920,
    height: 1080,
  },
  children: [
    {
      componentName: "GaodeMap-FlyLine",
      logicalId: "gaode_fly_line_test",
      name: "测试飞线",
      data: [
        { fromLng: 120.213336, fromLat: 30.2536, toLng: 119.109556, toLat: 30.174266 },
      ],
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      },
    },
  ],
});
assert.equal(gaodeMapSchema.componentName, "GaodeMap", "GaodeMap schema should have correct componentName");
assert.equal(gaodeMapSchema.parentBusinessElementId, "map_group", "GaodeMap schema should have correct parentBusinessElementId");
assert.equal(gaodeMapSchema.props.name, "测试2D高德地图", "GaodeMap schema should preserve name");
assert.ok(isJsonObject(gaodeMapSchema.props.mapConf), "GaodeMap schema should include mapConf defaults");
assert.ok(Array.isArray(gaodeMapSchema.children), "GaodeMap schema should include children array");
const gaodeFlyLineSchema = gaodeMapSchema.children?.[0];
assert.ok(gaodeFlyLineSchema, "GaodeMap-FlyLine should be nested in GaodeMap children");
assert.equal(gaodeFlyLineSchema.componentName, "GaodeMap-FlyLine", "GaodeMap-FlyLine schema should have correct componentName");
assert.equal(gaodeFlyLineSchema.parentBusinessElementId, gaodeMapSchema.businessElementId, "GaodeMap-FlyLine should reference parent businessElementId");
assert.equal(gaodeFlyLineSchema.props.mapId, gaodeMapSchema.businessElementId, "GaodeMap-FlyLine mapId should be auto-synced to parent businessElementId");
const gaodeFlyLineDatasource = asChartObject(gaodeFlyLineSchema.props.datasource);
const gaodeFlyLineConstantData = Array.isArray(gaodeFlyLineDatasource.constantData)
  ? gaodeFlyLineDatasource.constantData
  : [];
assert.equal(gaodeFlyLineConstantData.length, 1, "GaodeMap-FlyLine data should sync to datasource");
assert.equal(asChartObject(gaodeFlyLineConstantData[0]).toLng, 119.109556, "GaodeMap-FlyLine first row toLng should sync");
assert.equal(gaodeFlyLineDatasource.sourceType, "constant", "GaodeMap-FlyLine datasource sourceType should be constant");

console.log("test-flow passed");
