import assert from "node:assert/strict";
import { getComponentCapability } from "../../src/core/registry.js";
import { generateComponentsSchema } from "../../src/core/schema.js";
import type { JsonObject } from "../../src/types/component.js";
import { asChartObject } from "./helpers.js";


export function runDataDisplayNormalizerTests(): void {
  // BaseTable: columns/data should sync to chartData
  const baseTableCapability = getComponentCapability("BaseTable");
  assert.ok(Array.isArray(baseTableCapability.aiWritableProps), "BaseTable capability has aiWritableProps");
  const baseTableSchema = generateComponentsSchema({
    componentName: "BaseTable",
    logicalId: "base_table_test",
    parentLogicalId: "table_group",
    name: "测试基础表格",
    columns: [
      { field: "region", label: "区域" },
      { field: "metric", label: "指标值", type: "number" },
    ],
    data: [
      { region: "区域A", metric: 1200 },
      { region: "区域B", metric: 980 },
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
  assert.equal(asChartObject(baseTableConstantData[0]).region, "区域A", "BaseTable first row region should sync");
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
      { field: "region", label: "区域" },
      { field: "rate", label: "进度" },
    ],
    data: [
      { region: "区域A", rate: 87.2 },
      { region: "区域B", rate: 80.5 },
      { region: "区域C", rate: 72.3 },
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
  assert.equal(asChartObject(scrollListConstantData[1]).region, "区域B", "ScrollList second row region should sync");
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
      { name: "步骤A", value: 100 },
      { name: "步骤B", value: 80 },
      { name: "步骤C", value: 60 },
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
  assert.equal(asChartObject(funnelChartConstantData[0]).name, "步骤A", "FunnelChart first data name should sync");
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
}
