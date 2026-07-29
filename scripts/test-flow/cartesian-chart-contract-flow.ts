import assert from "node:assert/strict";
import { generateComponentsSchema } from "../../src/core/schema.js";
import type { JsonObject } from "../../src/types/component.js";

function seriesOf(schema: { props: JsonObject }): JsonObject {
  return ((schema.props.option as JsonObject).series as JsonObject[])[0] as JsonObject;
}

function cartesianData(values: number[]): JsonObject {
  return {
    constant: {
      data: values.map((value, index) => ({ name: `分类${index + 1}`, type: "系列", value })),
    },
  };
}

export function runCartesianChartContractFlowTests(): void {
  const lineRows = [
    { name: "分类1", type: "系列", value: 12 },
    { name: "分类2", type: "系列", value: 8 },
  ];
  const lineSchema = generateComponentsSchema({
    componentName: "LineChart",
    logicalId: "line_contract_flow",
    parentLogicalId: "chart_group",
    chartData: { constant: { data: lineRows } },
    option: {
      tooltip: { formatter: "{a}\n{b}\\n{c}" },
      xAxis: { axisLabel: { width: 999, overflow: "invalid" } },
      series: [{ showSymbol: true, symbolSize: 99, connectNulls: false }],
    },
  } as JsonObject);
  const lineOption = lineSchema.props.option as JsonObject;
  const lineSeries = seriesOf(lineSchema);
  const lineConstant = ((lineSchema.props.chartData as JsonObject).constant as JsonObject).data;
  assert.deepEqual(lineOption.grid, { left: 16, top: 40, bottom: 16, right: 16, containLabel: true });
  assert.equal((lineOption.tooltip as JsonObject).formatter, "{a}<br/>{b}<br/>{c}");
  assert.equal(((lineOption.xAxis as JsonObject).axisLabel as JsonObject).width, 400);
  assert.equal(((lineOption.xAxis as JsonObject).axisLabel as JsonObject).overflow, "truncate");
  assert.equal(lineSeries.symbolSize, 32);
  assert.equal(lineSeries.connectNulls, false);
  assert.deepEqual(lineConstant, lineRows);

  const stackLineRows = [
    { name: "分类1", type: "系列", value: 4 },
    { name: "分类2", type: "系列", value: 6 },
  ];
  const stackLineSchema = generateComponentsSchema({
    componentName: "StackLineChart",
    logicalId: "stack_line_contract_flow",
    parentLogicalId: "chart_group",
    chartData: { constant: { data: stackLineRows } },
    option: {
      tooltip: { formatter: "{a}\r\n{b}\\r\\n{c}" },
      series: [{ areaStyle: { opacity: 9 }, sampling: "invalid", step: "invalid" }],
    },
  } as JsonObject);
  const stackLineOption = stackLineSchema.props.option as JsonObject;
  const stackLineSeries = seriesOf(stackLineSchema);
  const stackLineConstant = ((stackLineSchema.props.chartData as JsonObject).constant as JsonObject).data;
  assert.deepEqual(stackLineOption.grid, { left: 16, top: 40, bottom: 16, right: 16, containLabel: true });
  assert.equal((stackLineOption.tooltip as JsonObject).formatter, "{a}<br/>{b}<br/>{c}");
  assert.equal(stackLineSeries.type, "line");
  assert.equal((stackLineSeries.areaStyle as JsonObject).opacity, 1);
  assert.equal(stackLineSeries.sampling, "none");
  assert.equal(stackLineSeries.step, false);
  assert.deepEqual(stackLineConstant, stackLineRows);

  const barSchema = generateComponentsSchema({
    componentName: "BarChart",
    logicalId: "bar_contract_flow",
    parentLogicalId: "chart_group",
    chartData: cartesianData([10, 7]),
    option: {
      barStyle: { gradient: true, gradientDarken: 9 },
      series: [{ barWidth: 999, barMinWidth: 20, barMaxWidth: 5 }],
    },
  } as JsonObject);
  const barOption = barSchema.props.option as JsonObject;
  const barSeries = seriesOf(barSchema);
  assert.deepEqual(barOption.grid, { left: 16, top: 40, bottom: 16, right: 16, containLabel: true });
  assert.deepEqual(barOption.barStyle, { gradient: true, gradientDarken: 0.5 });
  assert.equal(barSeries.barWidth, 200);
  assert.equal(barSeries.barMinWidth, 20);
  assert.equal(barSeries.barMaxWidth, 20);

  const stackRows = [
    { name: "分类1", type: "收入", value: 8 },
    { name: "分类1", type: "支出", value: -3 },
    { name: "分类2", type: "收入", value: 6 },
  ];
  const stackBarSchema = generateComponentsSchema({
    componentName: "StackBarChart",
    logicalId: "stack_bar_contract_flow",
    parentLogicalId: "chart_group",
    chartData: { constant: { data: stackRows } },
    option: {
      series: [{ stackStrategy: "invalid", barMinHeight: -1 }],
    },
  } as JsonObject);
  const stackBarOption = stackBarSchema.props.option as JsonObject;
  const stackBarSeries = seriesOf(stackBarSchema);
  const stackBarConstant = ((stackBarSchema.props.chartData as JsonObject).constant as JsonObject).data;
  assert.deepEqual(stackBarOption.grid, { left: 16, top: 40, bottom: 16, right: 16, containLabel: true });
  assert.equal(stackBarSeries.type, "bar");
  assert.equal(stackBarSeries.stackStrategy, "samesign");
  assert.equal(stackBarSeries.barMinHeight, 0);
  assert.deepEqual(stackBarConstant, stackRows);

  for (const componentName of ["LineChart", "StackLineChart", "BarChart", "StackBarChart"]) {
    const explicitGridSchema = generateComponentsSchema({
      componentName,
      logicalId: `${componentName.toLowerCase()}_explicit_grid`,
      parentLogicalId: "chart_group",
      chartData: {
        constant: {
          data: [
            { name: "分类1", type: "系列1", value: 8 },
            { name: "分类2", type: "系列2", value: 5 },
          ],
        },
      },
      option: {
        grid: { left: 7, right: 10, top: 8, bottom: 9, containLabel: false },
      },
    } as JsonObject);
    assert.deepEqual((explicitGridSchema.props.option as JsonObject).grid, {
      left: 7,
      right: 10,
      top: 8,
      bottom: 9,
      containLabel: false,
    });
  }
}
