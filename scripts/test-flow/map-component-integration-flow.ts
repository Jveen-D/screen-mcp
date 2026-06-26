import assert from "node:assert/strict";
import { generateComponentsSchema } from "../../src/core/schema.js";
import { asChartObject, isJsonObject } from "./chart-prompt-helpers.js";

export function runMapComponentIntegrationTests(): void {
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
}
