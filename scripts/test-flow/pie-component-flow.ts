import assert from "node:assert/strict";
import { getComponentCapability } from "../../src/core/registry.js";
import { generateComponentsSchema } from "../../src/core/schema.js";
import type { JsonObject } from "../../src/types/component.js";
import { assertRandomizedId } from "./helpers.js";

export interface PieComponentFlowFixtures {
  aiProps: JsonObject;
  inputFirstSeries: JsonObject;
}

export function runPieComponentFlowTests(): PieComponentFlowFixtures {
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
  return { aiProps, inputFirstSeries };
}
