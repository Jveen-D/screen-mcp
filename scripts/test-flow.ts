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
const pieRequiredProps = capability.requiredProps as JsonObject[];
const pieStyleRequiredProp = pieRequiredProps.find(
  (item) => item.path === "style",
) as JsonObject | undefined;
assert.ok(pieStyleRequiredProp, "capability should require style");
const pieSeriesCapability = pieWritableProps.find(
  (item) => item.path === "option.series[0]",
) as JsonObject | undefined;
const pieSeriesChildren = pieSeriesCapability?.children as JsonObject[] | undefined;
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
const pieForbiddenProps = capability.aiForbiddenProps as JsonObject[];
assert.ok(
  pieForbiddenProps.some((item) => item.path === "option.dataset"),
  "PieChart should forbid option.dataset",
);

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

assert.equal(schema.componentName, "PieChart");
assert.equal(chartData.sourceType, "constant");
assert.equal("title" in option, false);
assert.equal(legend.left, "center");
assert.equal(legend.top, "bottom");
assert.equal(firstSeries.type, "pie");
assert.deepEqual(firstSeries.radius, inputFirstSeries.radius);
assert.equal(schema.businessElementId, aiProps.logicalId);
assert.equal(schema.parentBusinessElementId, aiProps.parentLogicalId);

const forbiddenOverrideSchema = generateComponentsSchema({
  ...aiProps,
  chartData: {
    sourceType: "api",
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
assert.equal(forbiddenOverrideChartData.sourceType, "constant");
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
assert.equal(textDatasource.sourceType, "externalConstant");
assert.equal(textConstantData[0]?.text, "销售渠道占比");
const textStyle = textSchema.props.style as JsonObject;
assert.equal(textStyle.lineHeight, 1.09);

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

const modules = listModules();
assert.ok(
  modules.some((moduleItem) => moduleItem.moduleName === "ChartPanel"),
  "list_modules should include ChartPanel",
);

const moduleCapability = getModuleCapability("ChartPanel");
assert.ok(moduleCapability.slots, "ChartPanel capability should include slots");
const moduleLayoutRules = moduleCapability.layoutRules as string[];
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("连续的主横线")),
  "ChartPanel should guide bottom decorations as one continuous structure line",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("面板框架的一部分")),
  "ChartPanel should guide decorations as panel frame elements",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("不要所有模块都使用同一种标题栏")),
  "ChartPanel should guide title structure without fixed title bar defaults",
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
  moduleLayoutRules.some((rule) => rule.includes("分工展示")),
  "ChartPanel should guide information role separation",
);
assert.ok(
  moduleLayoutRules.some((rule) => rule.includes("连接线应短、少、淡")),
  "ChartPanel should reduce connector line noise",
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
assert.equal(moduleSchemas.length, 6);
assert.deepEqual(
  moduleSchemas.map((item) => item.componentName),
  [
    "SingleText",
    "SvgDecoration",
    "SvgDecoration",
    "SingleText",
    "PieChart",
    "SingleImage",
  ],
);
assert.deepEqual(
  moduleSchemas.map((item) => item.indexNum),
  [1, 2, 3, 4, 5, 6],
);
assert.equal(moduleSchemas[0]?.businessElementId, "sales_channel_panel_title");
assert.equal(moduleSchemas[1]?.businessElementId, "sales_channel_panel_title_badge");
assert.equal(moduleSchemas[2]?.businessElementId, "sales_channel_panel_decoration_1");
assert.equal(moduleSchemas[3]?.businessElementId, "sales_channel_panel_aux_text_1");
assert.equal(moduleSchemas[4]?.businessElementId, "sales_channel_panel_main_chart");
assert.equal(moduleSchemas[5]?.businessElementId, "sales_channel_panel_background");
const moduleTextDatasource = moduleSchemas[0]?.props.datasource as JsonObject;
const moduleTextConstantData = moduleTextDatasource.constantData as JsonObject[];
assert.equal(moduleTextConstantData[0]?.text, "销售渠道占比");
assert.equal(moduleSchemas[1]?.props.svgSource, "custom");
assert.equal(moduleSchemas[1]?.props.name, "标题背景点缀");
assert.equal(moduleSchemas[1]?.props.opacity, 0.7);
const moduleTitleStyle = moduleSchemas[0]?.props.style as JsonObject;
assert.equal(moduleTitleStyle.left, 72);
assert.equal(moduleTitleStyle.top, 114);
assert.equal(moduleTitleStyle.width, 472);
assert.equal(moduleTitleStyle.fontSize, 22);
assert.equal(moduleTitleStyle.lineHeight, 1.4);
const moduleTitleBadgeStyle = moduleSchemas[1]?.props.style as JsonObject;
assert.equal(moduleTitleBadgeStyle.left, 56);
assert.equal(moduleTitleBadgeStyle.top, 100);
assert.equal(moduleTitleBadgeStyle.width, 200);
assert.equal(moduleTitleBadgeStyle.height, 50);
assert.equal(moduleTitleBadgeStyle.zIndex, 16);
const moduleAuxTextDatasource = moduleSchemas[3]?.props.datasource as JsonObject;
const moduleAuxTextConstantData =
  moduleAuxTextDatasource.constantData as JsonObject[];
assert.equal(
  moduleAuxTextConstantData[0]?.text,
  "高等级风险占比 29.0%，处置优先级：红 / 橙",
);
const moduleAuxTextStyle = moduleSchemas[3]?.props.style as JsonObject;
assert.equal(moduleAuxTextStyle.lineHeight, 1.4);
assert.equal(moduleSchemas[5]?.props.imageBase64, "");
assert.equal(moduleSchemas[5]?.props.imageUseMode, "upload");
assert.equal(moduleSchemas[5]?.props.svgSource, "custom");
const moduleBackgroundStyle = moduleSchemas[5]?.props.style as JsonObject;
assert.equal(moduleBackgroundStyle.backgroundColor, "rgba(4,16,32,0.96)");
assert.equal(moduleBackgroundStyle.zIndex, 10);
const moduleChartOption = moduleSchemas[4]?.props.option as JsonObject;
const moduleChartSeries = moduleChartOption.series as JsonObject[];
assert.equal(moduleChartOption.backgroundColor, "transparent");
assert.deepEqual(moduleChartSeries[0]?.radius, ["42%", "68%"]);
assert.equal(moduleChartSeries[0]?.type, "pie");
const moduleChartLegend = moduleChartOption.legend as JsonObject;
assert.equal(moduleChartLegend.top, "bottom");
assert.equal(moduleChartLegend.left, "center");
assert.equal(moduleSchemas[2]?.props.svgSource, "custom");
assert.equal(typeof moduleSchemas[2]?.props.svgContent, "string");
const moduleDecorationStyle = moduleSchemas[2]?.props.style as JsonObject;
const moduleChartStyle = moduleSchemas[4]?.props.style as JsonObject;
assert.equal(moduleTitleStyle.zIndex, 18);
assert.equal(moduleChartStyle.zIndex, 12);
assert.equal(moduleDecorationStyle.zIndex, 14);
assert.equal(moduleChartStyle.left, 68);
assert.equal(moduleChartStyle.top, 188);
assert.equal(moduleChartStyle.width, 480);
assert.equal(moduleChartStyle.height, 200);
assert.equal(moduleDecorationStyle.left, 372);
assert.equal(moduleDecorationStyle.top, 116);
assert.equal(moduleDecorationStyle.width, 180);
assert.equal(moduleDecorationStyle.height, 72);

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
const noResourceBackground = noResourceSchemas[5];
assert.equal(noResourceBackground?.props.imageSrc, "");
assert.equal(noResourceBackground?.props.imageBase64, "");
assert.equal(noResourceBackground?.props.imageUseMode, "upload");
assert.equal(noResourceBackground?.props.opacity, 1);
assert.equal(noResourceBackground?.props.svgSource, "custom");

const moduleTreeSchema = generateModuleTreeSchema(chartPanelInput);
assert.equal(moduleTreeSchema.id, "sales_channel_panel");
assert.equal(moduleTreeSchema.componentName, "__Group__");
assert.equal(moduleTreeSchema.structVersion, "0.0.0");
assert.deepEqual(moduleTreeSchema.props, {});
assert.equal(moduleTreeSchema.title, "销售渠道占比");
assert.equal(moduleTreeSchema.isHidden, false);
assert.equal(moduleTreeSchema.isLocked, false);
assert.equal(moduleTreeSchema.isGroup, true);
assert.equal(moduleTreeSchema.children.length, 6);
assert.deepEqual(
  moduleTreeSchema.children.map((item) => item.componentName),
  [
    "SingleText",
    "SvgDecoration",
    "SvgDecoration",
    "SingleText",
    "PieChart",
    "SingleImage",
  ],
);
assert.equal(moduleTreeSchema.children[0]?.id, "sales_channel_panel_title");
assert.equal(moduleTreeSchema.children[0]?.isGroup, false);
assert.equal(moduleTreeSchema.children[0]?.structVersion, "0.0.2");
assert.equal(
  (moduleTreeSchema.children[0]?.props as JsonObject).logicalId,
  "sales_channel_panel_title",
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
  assert.equal(toolSchemas[0].componentName, "SingleImage");
  assert.equal(toolSchemas[1].componentName, "SingleText");
  assert.equal(toolSchemas[2].componentName, "PieChart");
  assert.equal(toolSchemas[3].componentName, "SvgDecoration");

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
  assert.equal(toolModuleSchemas.length, 6);
  assert.equal(toolModuleSchemas[0].componentName, "SingleText");
  assert.equal(toolModuleSchemas[1].componentName, "SvgDecoration");
  assert.equal(toolModuleSchemas[2].componentName, "SvgDecoration");
  assert.equal(toolModuleSchemas[3].componentName, "SingleText");
  assert.equal(toolModuleSchemas[4].componentName, "PieChart");
  assert.equal(toolModuleSchemas[5].componentName, "SingleImage");

  const moduleTreeSchemaResult = await client.callTool({
    name: "generate_module_tree_schema",
    arguments: chartPanelInput,
  });
  assert.equal(moduleTreeSchemaResult.isError, undefined);
  const toolModuleTreeSchema = readToolJson(moduleTreeSchemaResult);
  assert.equal(toolModuleTreeSchema.componentName, "__Group__");
  assert.equal(toolModuleTreeSchema.structVersion, "0.0.0");
  assert.deepEqual(toolModuleTreeSchema.props, {});
  assert.equal(toolModuleTreeSchema.children.length, 6);
  assert.equal(toolModuleTreeSchema.children[4].componentName, "PieChart");
} finally {
  await client.close();
}

console.log("test-flow passed");
