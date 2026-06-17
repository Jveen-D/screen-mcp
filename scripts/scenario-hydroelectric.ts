import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateComponentsSchemas } from "../src/core/schema.js";
import type { JsonObject } from "../src/types/component.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const componentsProps: JsonObject[] = [
  {
    componentName: "SingleImage",
    logicalId: "hydro_bg",
    parentLogicalId: "screen_root",
    name: "科技风背景",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 1920,
      height: 1080,
      zIndex: 0,
    },
    imageUseMode: "upload",
    backgroundColor: "transparent",
  },
  {
    componentName: "SingleText",
    logicalId: "hydro_title",
    parentLogicalId: "screen_root",
    name: "大屏标题",
    textContent: "XX 水电站智慧运行监测平台",
    style: {
      position: "absolute",
      left: 560,
      top: 24,
      width: 800,
      height: 64,
      fontSize: 36,
      color: "#DFF8FF",
      textAlign: "center",
      fontWeight: "bold",
      zIndex: 10,
    },
  },
  {
    componentName: "Date",
    logicalId: "hydro_date",
    parentLogicalId: "screen_root",
    name: "当前时间",
    format: "YYYY-MM-DD HH:mm:ss",
    style: {
      position: "absolute",
      left: 1620,
      top: 24,
      width: 260,
      height: 30,
      fontSize: 16,
      color: "#DFF8FF",
      textAlign: "right",
      zIndex: 10,
    },
  },
  {
    componentName: "Weather",
    logicalId: "hydro_weather",
    parentLogicalId: "screen_root",
    name: "库区天气",
    cityCode: ["33", "3301", "330102"],
    style: {
      position: "absolute",
      left: 1620,
      top: 64,
      width: 260,
      height: 34,
      fontSize: 16,
      color: "#DFF8FF",
      textAlign: "right",
      zIndex: 10,
    },
  },
  {
    componentName: "Indicator",
    logicalId: "hydro_today_energy",
    parentLogicalId: "screen_root",
    name: "今日发电量",
    textValue: 12850,
    suffix: "MWh",
    style: {
      position: "absolute",
      left: 40,
      top: 120,
      width: 320,
      height: 120,
      zIndex: 10,
    },
  },
  {
    componentName: "Gauge",
    logicalId: "hydro_load_rate",
    parentLogicalId: "screen_root",
    name: "机组负荷率",
    value: 78.5,
    min: 0,
    max: 100,
    style: {
      position: "absolute",
      left: 40,
      top: 280,
      width: 320,
      height: 280,
      zIndex: 10,
    },
  },
  {
    componentName: "BarChart",
    logicalId: "hydro_week_energy",
    parentLogicalId: "screen_root",
    name: "近7日发电量",
    data: [
      { name: "周一", value: 11200 },
      { name: "周二", value: 12500 },
      { name: "周三", value: 10800 },
      { name: "周四", value: 13100 },
      { name: "周五", value: 12850 },
      { name: "周六", value: 11900 },
      { name: "周日", value: 12400 },
    ],
    style: {
      position: "absolute",
      left: 400,
      top: 120,
      width: 520,
      height: 320,
      zIndex: 10,
    },
  },
  {
    componentName: "LineChart",
    logicalId: "hydro_water_flow",
    parentLogicalId: "screen_root",
    name: "水位与入库流量趋势",
    data: [
      { name: "00:00", value: 245 },
      { name: "04:00", value: 260 },
      { name: "08:00", value: 310 },
      { name: "12:00", value: 350 },
      { name: "16:00", value: 330 },
      { name: "20:00", value: 290 },
    ],
    style: {
      position: "absolute",
      left: 960,
      top: 120,
      width: 600,
      height: 320,
      zIndex: 10,
    },
  },
  {
    componentName: "PieChart",
    logicalId: "hydro_unit_status",
    parentLogicalId: "screen_root",
    name: "机组运行状态",
    data: [
      { name: "满发运行", value: 3 },
      { name: "部分负荷", value: 2 },
      { name: "停机备用", value: 1 },
    ],
    style: {
      position: "absolute",
      left: 40,
      top: 600,
      width: 360,
      height: 280,
      zIndex: 10,
    },
  },
  {
    componentName: "Earth3D",
    logicalId: "hydro_earth",
    parentLogicalId: "screen_root",
    name: "流域 3D 地球",
    style: {
      position: "absolute",
      left: 440,
      top: 480,
      width: 780,
      height: 580,
      zIndex: 5,
    },
    children: [
      {
        componentName: "Earth3D-Pointer",
        logicalId: "hydro_earth_pointer",
        name: "电站分布",
        data: [
          { lng: 116.4074, lat: 39.9042, title: "北京调度中心" },
          { lng: 103.8, lat: 28.9, title: "溪洛渡水电站" },
          { lng: 101.5, lat: 29.0, title: "二滩水电站" },
        ],
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 509,
        },
      },
      {
        componentName: "Earth3D-Satellite",
        logicalId: "hydro_earth_satellite",
        name: "卫星轨道",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 508,
        },
      },
      {
        componentName: "Earth3D-SpeedLight",
        logicalId: "hydro_earth_speedlight",
        name: "扫描线",
        lng: 103.8,
        lat: 28.9,
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 507,
        },
      },
      {
        componentName: "Earth3D-TextAround",
        logicalId: "hydro_earth_textaround",
        name: "环绕文字",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 506,
          textContent: "HYDRO • POWER • MONITOR",
        },
      },
    ],
  },
  {
    componentName: "GaodeMap",
    logicalId: "hydro_gaode_map",
    parentLogicalId: "screen_root",
    name: "库区 2D 地图",
    style: {
      position: "absolute",
      left: 1260,
      top: 480,
      width: 620,
      height: 580,
      zIndex: 5,
    },
    children: [
      {
        componentName: "GaodeMap-Marker",
        logicalId: "hydro_gaode_marker",
        name: "大坝标牌",
        data: [
          { lng: 103.8, lat: 28.9, value: 12600 },
          { lng: 101.5, lat: 29.0, value: 5400 },
        ],
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 10,
        },
      },
      {
        componentName: "GaodeMap-FlyLine",
        logicalId: "hydro_gaode_flyline",
        name: "输电线路",
        data: [
          { fromLng: 103.8, fromLat: 28.9, toLng: 116.4074, toLat: 39.9042 },
          { fromLng: 101.5, fromLat: 29.0, toLng: 116.4074, toLat: 39.9042 },
        ],
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 10,
        },
      },
      {
        componentName: "GaodeMap-Polygon",
        logicalId: "hydro_gaode_polygon",
        name: "库区的多边形示意",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 5,
        },
      },
    ],
  },
];

const schemas = generateComponentsSchemas(componentsProps);

const outputDir = join(__dirname, "output");
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, "hydroelectric-scenario.json");
writeFileSync(outputPath, JSON.stringify(schemas, null, 2), "utf-8");

console.log(`Generated ${schemas.length} top-level schemas, saved to ${outputPath}`);
for (const schema of schemas) {
  const childCount = Array.isArray(schema.children) ? schema.children.length : 0;
  console.log(
    `  - ${schema.componentName}: ${schema.businessElementId}` +
      (childCount > 0 ? ` (${childCount} children)` : ""),
  );
}
