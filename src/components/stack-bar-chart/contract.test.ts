import assert from "node:assert/strict";
import test from "node:test";
import { generateComponentsSchema } from "../../core/schema.js";
import type { JsonObject } from "../../types/component.js";
import { stackBarChartCapability } from "./capability.js";
import { stackBarChartDefaultProps } from "./defaultProps.js";
import { normalizeStackBarChartProps } from "./normalize.js";

function optionOf(props: JsonObject): JsonObject {
  return props.option as JsonObject;
}

function writablePaths(items: JsonObject[]): string[] {
  return items.flatMap((item) => [String(item.path), ...writablePaths((item.children as JsonObject[]) ?? [])]);
}

test("StackBarChart defaults preserve mixed-sign semantics", () => {
  const option = optionOf(stackBarChartDefaultProps);
  const series = (option.series as JsonObject[])[0];

  assert.deepEqual(option.barStyle, { gradient: false, gradientDarken: 0.12 });
  assert.deepEqual(option.grid, { left: 16, top: 40, bottom: 16, right: 16, containLabel: true });
  assert.equal(series.barWidth, 18);
  assert.equal(series.stack, "__stackBar");
  assert.equal(series.stackStrategy, "samesign");
  assert.equal(series.barCategoryGap, "20%");
  assert.equal((series.label as JsonObject).show, false);
  assert.equal((series.label as JsonObject).position, "inside");
  assert.equal((series.labelLayout as JsonObject).hideOverlap, true);
});

test("StackBarChart normalizer clamps the public contract", () => {
  const props = structuredClone(stackBarChartDefaultProps);
  const option = optionOf(props);
  const series = (option.series as JsonObject[])[0];
  const axisLabel = (option.xAxis as JsonObject).axisLabel as JsonObject;
  const tooltip = option.tooltip as JsonObject;
  const legend = option.legend as JsonObject;

  (option.grid as JsonObject).containLabel = "yes";
  axisLabel.width = -5;
  axisLabel.overflow = "breakAll";
  tooltip.borderWidth = -2;
  (tooltip.axisPointer as JsonObject).type = "line";
  legend.itemWidth = 101;
  legend.itemHeight = 9;
  legend.itemGap = -1;
  series.barMinWidth = 24;
  series.barMaxWidth = 10;
  series.barMinHeight = -1;
  series.stackStrategy = "invalid";
  series.barCategoryGap = "bad";
  (series.itemStyle as JsonObject).borderRadius = [2, 4, 6, 8];
  (series.emphasis as JsonObject).focus = "self";

  normalizeStackBarChartProps(props);

  assert.deepEqual(option.grid, { left: 16, top: 40, bottom: 16, right: 16, containLabel: true });
  assert.equal(axisLabel.width, 0);
  assert.equal(axisLabel.overflow, "breakAll");
  assert.equal(tooltip.borderWidth, 0);
  assert.equal((tooltip.axisPointer as JsonObject).type, "line");
  assert.deepEqual(
    { itemWidth: legend.itemWidth, itemHeight: legend.itemHeight, itemGap: legend.itemGap },
    { itemWidth: 100, itemHeight: 9, itemGap: 0 },
  );
  assert.equal(series.barMinWidth, 24);
  assert.equal(series.barMaxWidth, 24);
  assert.equal(series.barMinHeight, 0);
  assert.equal(series.stackStrategy, "samesign");
  assert.equal(series.barCategoryGap, undefined);
  assert.equal(series.barWidth, 18);
  assert.deepEqual((series.itemStyle as JsonObject).borderRadius, [2, 4, 6, 8]);
  assert.equal((series.emphasis as JsonObject).focus, "self");
});

test("StackBarChart category gap uses automatic width only for valid values", () => {
  const numericStringProps = structuredClone(stackBarChartDefaultProps);
  const numericStringSeries = ((optionOf(numericStringProps).series as JsonObject[])[0]);
  numericStringSeries.barCategoryGap = "12";

  normalizeStackBarChartProps(numericStringProps);

  assert.equal(numericStringSeries.barCategoryGap, 12);
  assert.equal(numericStringSeries.barWidth, undefined);

  const invalidProps = structuredClone(stackBarChartDefaultProps);
  const invalidSeries = ((optionOf(invalidProps).series as JsonObject[])[0]);
  invalidSeries.barCategoryGap = "-5%";

  normalizeStackBarChartProps(invalidProps);

  assert.equal(invalidSeries.barCategoryGap, undefined);
  assert.equal(invalidSeries.barWidth, 18);
});

test("StackBarChart capability exposes gaps and stack strategy", () => {
  const paths = writablePaths(stackBarChartCapability.aiWritableProps as JsonObject[]);
  const forbidden = (stackBarChartCapability.aiForbiddenProps as JsonObject[]).map((item) => item.path);

  for (const path of [
    "option.grid.containLabel",
    "option.tooltip.axisPointer.type",
    "option.xAxis.axisLabel.hideOverlap",
    "option.legend.itemGap",
    "option.barStyle.gradient",
    "option.series[i].barMinWidth",
    "option.series[i].barMaxWidth",
    "option.series[i].barMinHeight",
    "option.series[i].stackStrategy",
    "option.series[i].barCategoryGap",
    "option.series[i].emphasis.focus",
    "option.series[i].labelLayout.hideOverlap",
  ]) {
    assert.ok(paths.includes(path), `missing capability path: ${path}`);
  }
  assert.ok(forbidden.includes("option.series[i].barGap"));
  assert.ok(!forbidden.includes("option.series[i].barCategoryGap"));
  assert.ok(
    (stackBarChartCapability.visualRules as string[]).some((rule) =>
      rule.includes("负值仍显示") && rule.includes("正值仍显示"),
    ),
  );
});

test("StackBarChart generation keeps stack semantics in the final schema", () => {
  const schema = generateComponentsSchema({
    componentName: "StackBarChart",
    logicalId: "stack_bar_contract_test",
    parentLogicalId: "chart_group",
    chartData: {
      constant: {
        data: [
          { name: "区域一", type: "收入", value: 12 },
          { name: "区域一", type: "支出", value: -4 },
          { name: "区域二", type: "收入", value: 8 },
          { name: "区域二", type: "支出", value: -2 },
        ],
      },
    },
    style: { position: "absolute", left: 0, top: 0, width: 400, height: 226 },
    option: {
      barStyle: { gradient: false, gradientDarken: 0.12 },
      series: [
        {
          stackStrategy: "samesign",
          barCategoryGap: "24%",
          labelLayout: { hideOverlap: true },
        },
      ],
    },
  } as JsonObject);
  const option = schema.props.option as JsonObject;
  const series = (option.series as JsonObject[])[0];

  assert.equal(series.type, "bar");
  assert.equal(series.stack, "__stackBar");
  assert.equal(series.stackStrategy, "samesign");
  assert.equal(series.barCategoryGap, "24%");
  assert.equal(series.barWidth, undefined);
  assert.equal((series.labelLayout as JsonObject).hideOverlap, true);
});
