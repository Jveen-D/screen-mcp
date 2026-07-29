import assert from "node:assert/strict";
import test from "node:test";
import { generateComponentsSchema } from "../../core/schema.js";
import type { JsonObject } from "../../types/component.js";
import { barChartCapability } from "./capability.js";
import { barChartDefaultProps } from "./defaultProps.js";
import { normalizeBarChartProps } from "./normalize.js";

function optionOf(props: JsonObject): JsonObject {
  return props.option as JsonObject;
}

function writablePaths(items: JsonObject[]): string[] {
  return items.flatMap((item) => [String(item.path), ...writablePaths((item.children as JsonObject[]) ?? [])]);
}

test("BarChart defaults match the frontend contract", () => {
  const option = optionOf(barChartDefaultProps);
  const series = (option.series as JsonObject[])[0];

  assert.deepEqual(option.color, [
    "#5B8FF9",
    "#5AD8A6",
    "#F6BD16",
    "#E8684A",
    "#6DC8EC",
    "#9270CA",
    "#FF9D4D",
    "#5D7092",
  ]);
  assert.deepEqual(option.barStyle, { gradient: false, gradientDarken: 0.12 });
  assert.deepEqual(option.grid, { left: 16, right: 16, top: 40, bottom: 16, containLabel: true });
  assert.deepEqual(
    {
      hideOverlap: ((option.xAxis as JsonObject).axisLabel as JsonObject).hideOverlap,
      width: ((option.xAxis as JsonObject).axisLabel as JsonObject).width,
      overflow: ((option.xAxis as JsonObject).axisLabel as JsonObject).overflow,
    },
    { hideOverlap: true, width: 72, overflow: "truncate" },
  );
  assert.equal(series.barWidth, 18);
  assert.equal(series.barMinWidth, 6);
  assert.equal(series.barMaxWidth, 32);
  assert.equal((series.label as JsonObject).show, false);
  assert.equal((series.labelLayout as JsonObject).hideOverlap, true);
  assert.equal((series.emphasis as JsonObject).focus, "series");
});

test("BarChart normalizer clamps geometry without changing data order", () => {
  const props = structuredClone(barChartDefaultProps);
  const option = optionOf(props);
  const data = (props.chartData as JsonObject).constant as JsonObject;
  const originalRows = data.data;
  const series = (option.series as JsonObject[])[0];

  (option.grid as JsonObject).containLabel = "yes";
  const axisLabel = (option.xAxis as JsonObject).axisLabel as JsonObject;
  axisLabel.hideOverlap = "yes";
  axisLabel.width = 2000;
  axisLabel.overflow = "invalid";
  const tooltip = option.tooltip as JsonObject;
  tooltip.borderWidth = 30;
  (tooltip.axisPointer as JsonObject).type = "invalid";
  const legend = option.legend as JsonObject;
  legend.itemWidth = -1;
  legend.itemHeight = 150;
  legend.itemGap = 300;
  const barStyle = option.barStyle as JsonObject;
  barStyle.gradient = "yes";
  barStyle.gradientDarken = 2;
  series.barWidth = 300;
  series.barMinWidth = 20;
  series.barMaxWidth = 5;
  series.barMinHeight = -1;
  series.barGap = " 12% ";
  series.barCategoryGap = "-5%";
  series.showBackground = "yes";
  (series.itemStyle as JsonObject).borderRadius = [120, -1, 8, 6];

  normalizeBarChartProps(props);

  assert.deepEqual(option.grid, { left: 16, right: 16, top: 40, bottom: 16, containLabel: true });
  assert.deepEqual(
    { hideOverlap: axisLabel.hideOverlap, width: axisLabel.width, overflow: axisLabel.overflow },
    { hideOverlap: undefined, width: 1000, overflow: "truncate" },
  );
  assert.equal(tooltip.borderWidth, 20);
  assert.equal((tooltip.axisPointer as JsonObject).type, "shadow");
  assert.deepEqual(
    { itemWidth: legend.itemWidth, itemHeight: legend.itemHeight, itemGap: legend.itemGap },
    { itemWidth: 0, itemHeight: 100, itemGap: 200 },
  );
  assert.deepEqual(barStyle, { gradient: false, gradientDarken: 0.5 });
  assert.equal(series.barWidth, 200);
  assert.equal(series.barMinWidth, 20);
  assert.equal(series.barMaxWidth, 20);
  assert.equal(series.barMinHeight, 0);
  assert.equal(series.barGap, "12%");
  assert.equal(series.barCategoryGap, undefined);
  assert.equal(series.showBackground, undefined);
  assert.deepEqual((series.itemStyle as JsonObject).borderRadius, [100, 0, 8, 6]);
  assert.deepEqual(((props.chartData as JsonObject).constant as JsonObject).data, originalRows);
});

test("BarChart capability exposes every new public field", () => {
  const paths = writablePaths(barChartCapability.aiWritableProps as JsonObject[]);

  for (const path of [
    "option.grid.containLabel",
    "option.tooltip.borderWidth",
    "option.xAxis.axisLabel.hideOverlap",
    "option.xAxis.axisLabel.width",
    "option.xAxis.axisLabel.overflow",
    "option.legend.itemGap",
    "option.barStyle.gradient",
    "option.barStyle.gradientDarken",
    "option.series[i].barMinWidth",
    "option.series[i].barMaxWidth",
    "option.series[i].barMinHeight",
    "option.series[i].emphasis.focus",
    "option.series[i].labelLayout.hideOverlap",
  ]) {
    assert.ok(paths.includes(path), `missing capability path: ${path}`);
  }
});

test("BarChart generation keeps the normalized contract in the final schema", () => {
  const schema = generateComponentsSchema({
    componentName: "BarChart",
    logicalId: "bar_contract_test",
    parentLogicalId: "chart_group",
    chartData: {
      constant: {
        data: [
          { name: "超长分类名称一", type: "实际值", value: 12 },
          { name: "超长分类名称二", type: "实际值", value: 8 },
        ],
      },
    },
    style: { position: "absolute", left: 0, top: 0, width: 400, height: 226 },
    option: {
      grid: { containLabel: true },
      xAxis: { axisLabel: { hideOverlap: true, width: 96, overflow: "truncate" } },
      legend: { itemWidth: 14, itemHeight: 8, itemGap: 20 },
      barStyle: { gradient: true, gradientDarken: 0.18 },
      series: [
        {
          barMinWidth: 8,
          barMaxWidth: 28,
          emphasis: { focus: "self" },
          labelLayout: { hideOverlap: true },
        },
      ],
    },
  } as JsonObject);
  const option = schema.props.option as JsonObject;
  const series = (option.series as JsonObject[])[0];

  assert.deepEqual(option.barStyle, { gradient: true, gradientDarken: 0.18 });
  assert.equal(((option.xAxis as JsonObject).axisLabel as JsonObject).width, 96);
  assert.equal((option.legend as JsonObject).itemGap, 20);
  assert.equal(series.type, "bar");
  assert.equal(series.barMinWidth, 8);
  assert.equal(series.barMaxWidth, 28);
  assert.equal((series.emphasis as JsonObject).focus, "self");
});
