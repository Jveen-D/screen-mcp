import assert from "node:assert/strict";
import { getComponentCapability } from "../../src/core/registry.js";
import { generateComponentsSchema } from "../../src/core/schema.js";
import type { JsonObject } from "../../src/types/component.js";
import { asChartObject } from "./helpers.js";


export function runValueWidgetNormalizerTests(): void {
  // Gauge: value should sync to datasource.constantData[0].value
  const gaugeCapability = getComponentCapability("Gauge");
  assert.ok(Array.isArray(gaugeCapability.aiWritableProps), "Gauge capability has aiWritableProps");
  const gaugeRequiredProps = Array.isArray(gaugeCapability.requiredProps)
    ? gaugeCapability.requiredProps.map(asChartObject)
    : [];
  assert.ok(
    gaugeRequiredProps.some((item) => item.path === "value"),
    "Gauge capability should require value",
  );
  const gaugeWritableProps = Array.isArray(gaugeCapability.aiWritableProps)
    ? gaugeCapability.aiWritableProps.map(asChartObject)
    : [];
  assert.equal(
    gaugeWritableProps.some((item) => item.path === "chartData.constant.data"),
    false,
    "Gauge capability should not expose category chartData",
  );
  const gaugeForbiddenProps = Array.isArray(gaugeCapability.aiForbiddenProps)
    ? gaugeCapability.aiForbiddenProps.map(asChartObject)
    : [];
  assert.ok(
    gaugeForbiddenProps.some((item) => item.path === "chartData"),
    "Gauge capability should forbid chartData",
  );
  assert.throws(
    () =>
      generateComponentsSchema({
        componentName: "Gauge",
        logicalId: "gauge_chart_data_only",
        parentLogicalId: "sales_group",
        chartData: {
          constant: {
            data: [{ name: "完成率", value: 65 }],
          },
        },
        style: {
          position: "absolute",
          left: 100,
          top: 100,
          width: 400,
          height: 360,
        },
      }),
    /Gauge must include explicit numeric value/u,
    "Gauge direct generation should reject chartData without value",
  );
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
  assert.equal(
    percentageBarSchema.props.iconIsShow,
    false,
    "PercentageBar should not show icon by default",
  );

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
}
