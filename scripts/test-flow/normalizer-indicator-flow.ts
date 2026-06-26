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
}
