import assert from "node:assert/strict";
import { getComponentCapability } from "../../src/core/registry.js";
import { generateComponentsSchema } from "../../src/core/schema.js";
import type { JsonObject } from "../../src/types/component.js";
import { asChartObject } from "./helpers.js";


export function runIndicatorNormalizerTests(): void {
  // Indicator: textValue should sync to chartData.constant.data[0].value
  const indicatorCapability = getComponentCapability("Indicator");
  assert.ok(Array.isArray(indicatorCapability.aiWritableProps), "Indicator capability has aiWritableProps");
  const indicatorSchema = generateComponentsSchema({
    componentName: "Indicator",
    logicalId: "indicator_test",
    parentLogicalId: "indicator_group",
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
    parentLogicalId: "indicator_group",
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
    parentLogicalId: "indicator_group",
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

  const compactKpiSchema = generateComponentsSchema({
    componentName: "Indicator",
    logicalId: "indicator_compact_kpi_test",
    parentLogicalId: "indicator_group",
    name: "紧凑KPI",
    titleVisible: true,
    titleName: "订单数",
    textValue: 9420,
    suffix: true,
    suffixTitle: "单",
    titleStyle: {
      fontSize: 18,
      lineHeight: 1,
    },
    numberStyle: {
      fontSize: 48,
      letterSpacing: 1,
      lineHeight: 1,
    },
    suffixStyle: {
      fontSize: 18,
      lineHeight: 1,
    },
    globalConfig: {
      space: 4,
    },
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 312,
      height: 64,
    },
  });
  const compactKpiNumberStyle = compactKpiSchema.props.numberStyle as JsonObject;
  const compactKpiSuffixStyle = compactKpiSchema.props.suffixStyle as JsonObject;
  const compactKpiGlobalConfig = compactKpiSchema.props.globalConfig as JsonObject;
  assert.equal(
    compactKpiNumberStyle.fontSize,
    36,
    "Indicator should reduce number font size when title + value + suffix cannot fit in compact height",
  );
  assert.equal(
    compactKpiSuffixStyle.fontSize,
    16,
    "Indicator should reduce suffix font size with compact KPI number typography",
  );
  assert.equal(
    compactKpiGlobalConfig.space,
    2,
    "Indicator should reduce vertical gap in compact KPI cards",
  );

  const decimalKpiSchema = generateComponentsSchema({
    componentName: "Indicator",
    logicalId: "indicator_decimal_kpi_test",
    parentLogicalId: "indicator_group",
    name: "小数KPI",
    textValue: 91.2,
    decimal: 1,
    separation: true,
    suffix: true,
    suffixTitle: "%",
    numberStyle: {
      fontSize: 44,
      letterSpacing: 1,
    },
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 360,
      height: 82,
    },
  });
  assert.equal(
    decimalKpiSchema.props.separation,
    false,
    "Indicator should disable separation for ordinary decimal KPIs without digit backgrounds",
  );

  const backgroundDigitKpiSchema = generateComponentsSchema({
    componentName: "Indicator",
    logicalId: "indicator_background_digit_test",
    parentLogicalId: "indicator_group",
    name: "数字背景KPI",
    textValue: 128760,
    separation: true,
    hasBackground: true,
    numBackground: {
      width: 36,
      height: 54,
    },
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 480,
      height: 96,
    },
  });
  assert.equal(
    backgroundDigitKpiSchema.props.separation,
    true,
    "Indicator should preserve separation for explicit digit-background flip layouts",
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
            chartDisplayName: "指标值",
          },
        },
      ],
      constant: {
        data: [
          { name: "分类A", type: "分类", value: 42 },
          { name: "分类B", type: "分类", value: 28 },
          { name: "分类C", type: "分类", value: 18 },
          { name: "分类D", type: "分类", value: 12 },
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
          { name: "分类A", type: "分类", value: 101 },
          { name: "分类B", type: "分类", value: 71 },
          { name: "分类C", type: "分类", value: 121 },
          { name: "分类D", type: "分类", value: 95 },
          { name: "分类E", type: "分类", value: 141 },
          { name: "分类F", type: "分类", value: 96 },
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

  const readableBottomLegendRingSchema = generateComponentsSchema({
    componentName: "RingChart",
    logicalId: "readable_bottom_legend_ring_test",
    parentLogicalId: "chart_group",
    name: "中等面板多项环图",
    chartData: {
      constant: {
        data: [
          { name: "渠道A", type: "分类", value: 42 },
          { name: "渠道B", type: "分类", value: 28 },
          { name: "渠道C", type: "分类", value: 18 },
          { name: "渠道D", type: "分类", value: 12 },
          { name: "渠道E", type: "分类", value: 8 },
        ],
      },
    },
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 560,
      height: 382,
    },
    option: {
      legend: {
        show: true,
        top: "bottom",
        left: "center",
        offsetY: 12,
        itemGap: 16,
      },
      series: [
        {
          radius: ["18%", "29%"],
          center: ["50%", "38%"],
        },
      ],
    },
  });
  const readableBottomLegendRingOption = asChartObject(readableBottomLegendRingSchema.props.option);
  const readableBottomLegend = asChartObject(readableBottomLegendRingOption.legend);
  const readableBottomLegendSeries = Array.isArray(readableBottomLegendRingOption.series)
    ? asChartObject(readableBottomLegendRingOption.series[0])
    : {};
  assert.equal(
    readableBottomLegend.offsetY,
    -2,
    "RingChart should pull dense bottom legends back inside the component",
  );
  assert.deepEqual(
    readableBottomLegendSeries.radius,
    ["18%", "42%"],
    "RingChart should not allow medium bottom-legend layouts to collapse to a tiny ring",
  );

  const readableMediumRingSchema = generateComponentsSchema({
    componentName: "RingChart",
    logicalId: "readable_medium_ring_test",
    parentLogicalId: "chart_group",
    name: "中等面板中心摘要环图",
    chartData: {
      constant: {
        data: [
          { name: "分类A", type: "分类", value: 42 },
          { name: "分类B", type: "分类", value: 28 },
          { name: "分类C", type: "分类", value: 18 },
          { name: "分类D", type: "分类", value: 12 },
          { name: "分类E", type: "分类", value: 8 },
        ],
      },
    },
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 446,
      height: 328,
    },
    option: {
      legend: {
        show: true,
        top: "bottom",
        left: "center",
      },
      series: [
        {
          radius: ["15%", "20%"],
          center: ["50%", "43%"],
          label: {
            show: false,
            position: "outside",
          },
        },
      ],
    },
  });
  const readableMediumRingOption = asChartObject(readableMediumRingSchema.props.option);
  const readableMediumRingSeries = Array.isArray(readableMediumRingOption.series)
    ? asChartObject(readableMediumRingOption.series[0])
    : {};
  assert.deepEqual(
    readableMediumRingSeries.radius,
    ["15%", "42%"],
    "RingChart should protect medium multi-item bottom-legend layouts from unreadably tiny outer radius even when outside labels are hidden",
  );

  const centerBandLegendRingSchema = generateComponentsSchema({
    componentName: "RingChart",
    logicalId: "center_band_legend_ring_test",
    parentLogicalId: "chart_group",
    name: "中心横向图例环图",
    chartData: {
      constant: {
        data: [
          { name: "分类A", type: "分类", value: 42 },
          { name: "分类B", type: "分类", value: 28 },
          { name: "分类C", type: "分类", value: 18 },
        ],
      },
    },
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 360,
      height: 220,
    },
    option: {
      legend: {
        show: true,
        left: "right",
        top: "center",
        orient: "horizontal",
      },
      series: [
        {
          radius: ["36%", "64%"],
          center: ["50%", "50%"],
        },
      ],
    },
  });
  const centerBandLegendRingOption = asChartObject(centerBandLegendRingSchema.props.option);
  const centerBandLegend = asChartObject(centerBandLegendRingOption.legend);
  assert.equal(
    centerBandLegend.left,
    "center",
    "RingChart should move horizontal center-band legends to a safe bottom slot",
  );
  assert.equal(centerBandLegend.top, "bottom");
  assert.equal(centerBandLegend.orient, "horizontal");

  const sideLegendRingSchema = generateComponentsSchema({
    componentName: "RingChart",
    logicalId: "side_legend_ring_test",
    parentLogicalId: "chart_group",
    name: "右侧图例环图",
    chartData: {
      constant: {
        data: [
          { name: "分类A", type: "分类", value: 42 },
          { name: "分类B", type: "分类", value: 28 },
          { name: "分类C", type: "分类", value: 18 },
          { name: "分类D", type: "分类", value: 12 },
          { name: "分类E", type: "分类", value: 8 },
        ],
      },
    },
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 416,
      height: 220,
    },
    option: {
      legend: {
        show: true,
        left: "right",
        top: "center",
        orient: "vertical",
      },
      series: [
        {
          radius: ["42%", "62%"],
          center: ["40%", "50%"],
        },
      ],
    },
  });
  const sideLegendRingOption = asChartObject(sideLegendRingSchema.props.option);
  const sideLegendRingSeries = Array.isArray(sideLegendRingOption.series)
    ? asChartObject(sideLegendRingOption.series[0])
    : {};
  assert.deepEqual(
    sideLegendRingSeries.center,
    ["40%", "50%"],
    "RingChart should keep side legend center stable",
  );
  assert.deepEqual(
    sideLegendRingSeries.radius,
    ["42%", "64%"],
    "RingChart should keep enough outer radius for side legend layouts",
  );
}
