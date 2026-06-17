import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { componentSchemaToEditorNode } from "../src/core/schema.js";
import type { ComponentSchema, EditorComponentNode } from "../src/types/component.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCREEN_ROOT = "screen_root";
const THEME = {
  primary: "#00E5FF",
  secondary: "#7C4DFF",
  accent: "#FFB300",
  text: "#DFF8FF",
  textMuted: "#BFEFFF",
  bg: "#030B1E",
  panelBg: "rgba(6,22,46,0.72)",
};

function readToolJson(result: Awaited<ReturnType<Client["callTool"]>>) {
  if (!Array.isArray(result.content)) {
    throw new Error("MCP tool returned unexpected content");
  }
  const content = result.content[0];
  if (!content || content.type !== "text") {
    throw new Error("MCP tool did not return text content");
  }
  return JSON.parse(content.text);
}

const componentsProps: Record<string, unknown>[] = [
  // 1. 全屏科技风背景图
  {
    componentName: "SingleImage",
    logicalId: "bg_image",
    parentLogicalId: SCREEN_ROOT,
    name: "全屏科技风背景",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 1920,
      height: 1080,
      zIndex: 0,
      backgroundColor: THEME.bg,
    },
    imageUseMode: "upload",
    imageSrc: "screen/bg-tech-dark-1920x1080.jpg",
    imageShowType: "noRepeat",
    opacity: 1,
  },

  // 2. 顶部居中主标题
  {
    componentName: "SingleText",
    logicalId: "main_title",
    parentLogicalId: SCREEN_ROOT,
    name: "主标题",
    textContent: "XX 水电站智慧运行监测平台",
    style: {
      position: "absolute",
      left: 560,
      top: 22,
      width: 800,
      height: 44,
      fontSize: 36,
      color: THEME.text,
      textAlign: "center",
      fontWeight: "bold",
      fontStyle: "normal",
      letterSpacing: 4,
      lineHeight: 1.2,
      backgroundColor: "rgba(0,0,0,0)",
    },
    textShadow: {
      isActive: true,
      color: "rgba(0,229,255,0.75)",
      x: 0,
      y: 0,
      blur: 14,
    },
  },

  // 3. 右上角时间
  {
    componentName: "Date",
    logicalId: "header_date",
    parentLogicalId: SCREEN_ROOT,
    name: "当前时间",
    style: {
      position: "absolute",
      left: 1560,
      top: 28,
      width: 220,
      height: 24,
      color: THEME.textMuted,
      fontSize: 16,
      textAlign: "right",
      backgroundColor: "rgba(0,0,0,0)",
    },
    format: "YYYY-MM-DD HH:mm:ss",
    timezone: "beijing",
  },

  // 4. 右上角天气
  {
    componentName: "Weather",
    logicalId: "header_weather",
    parentLogicalId: SCREEN_ROOT,
    name: "库区天气",
    style: {
      position: "absolute",
      left: 1790,
      top: 28,
      width: 110,
      height: 24,
      color: THEME.textMuted,
      fontSize: 16,
      textAlign: "left",
      backgroundColor: "rgba(0,0,0,0)",
    },
    cityCode: ["11", "1101", "110101"],
  },

  // 左侧标题：今日发电
  {
    componentName: "SingleText",
    logicalId: "left_title_generation",
    parentLogicalId: SCREEN_ROOT,
    name: "左侧标题-今日发电",
    textContent: "今日发电量",
    style: {
      position: "absolute",
      left: 60,
      top: 118,
      width: 200,
      height: 22,
      fontSize: 18,
      color: THEME.text,
      textAlign: "left",
      fontWeight: "bold",
      letterSpacing: 2,
      lineHeight: 1.2,
      backgroundColor: "rgba(0,0,0,0)",
    },
  },

  // 5. 左侧：今日发电量翻牌器
  {
    componentName: "Indicator",
    logicalId: "indicator_today_generation",
    parentLogicalId: SCREEN_ROOT,
    name: "今日发电量翻牌器",
    textValue: 1245678,
    decimal: 0,
    separation: true,
    titleName: "今日发电量",
    titleVisible: true,
    suffix: true,
    suffixTitle: " kWh",
    isFollowSuffix: false,
    animation: true,
    animateType: 1,
    duration: 2,
    globalConfig: {
      flexDirection: "column",
      alignItems: "flex-start",
      space: 6,
    },
    titleStyle: {
      fontSize: 14,
      color: THEME.textMuted,
    },
    numberStyle: {
      fontSize: 40,
      color: THEME.primary,
      fontWeight: "bold",
    },
    suffixStyle: {
      fontSize: 16,
      color: THEME.textMuted,
    },
    style: {
      position: "absolute",
      left: 50,
      top: 150,
      width: 390,
      height: 100,
      zIndex: 2,
      backgroundColor: "rgba(0,0,0,0)",
    },
  },

  // 左侧标题：机组负荷率
  {
    componentName: "SingleText",
    logicalId: "left_title_load_rate",
    parentLogicalId: SCREEN_ROOT,
    name: "左侧标题-机组负荷率",
    textContent: "机组负荷率",
    style: {
      position: "absolute",
      left: 60,
      top: 280,
      width: 200,
      height: 22,
      fontSize: 18,
      color: THEME.text,
      textAlign: "left",
      fontWeight: "bold",
      letterSpacing: 2,
      lineHeight: 1.2,
      backgroundColor: "rgba(0,0,0,0)",
    },
  },

  // 6. 左侧：机组负荷率仪表盘
  {
    componentName: "Gauge",
    logicalId: "gauge_unit_load",
    parentLogicalId: SCREEN_ROOT,
    name: "机组负荷率仪表盘",
    value: 78,
    style: {
      position: "absolute",
      left: 45,
      top: 310,
      width: 400,
      height: 280,
      backgroundColor: "transparent",
      zIndex: 2,
    },
    indicatorConfig: {
      open: true,
      minValue: 0,
      maxValue: 100,
      suffix: "%",
      precision: 0,
      valueFontSize: 32,
      valueColor: THEME.text,
      valueOffsetY: 20,
    },
    dialConfig: {
      outRadius: 0.92,
      innerRadius: 0.72,
      graduationColor: "rgba(0,229,255,0.35)",
      graduationCount: 10,
      graduationThickness: 2,
      graduationLength: 10,
      labelColor: THEME.textMuted,
      labelFontSize: 12,
      pointerColor: THEME.primary,
      pointerLength: 0.75,
      pointerWidth: 6,
      pointerDotColor: THEME.primary,
      pointerDotSize: 8,
    },
    ringRangeColor: [
      { startValue: 0, endValue: 0.5, color: "#1B5CFF" },
      { startValue: 0.5, endValue: 0.8, color: "#00E5FF" },
      { startValue: 0.8, endValue: 1, color: "#FFB300" },
    ],
    animation: {
      open: true,
      duration: 1500,
    },
  },

  // 左侧标题：机组运行状态
  {
    componentName: "SingleText",
    logicalId: "left_title_unit_status",
    parentLogicalId: SCREEN_ROOT,
    name: "左侧标题-机组运行状态",
    textContent: "机组运行状态",
    style: {
      position: "absolute",
      left: 60,
      top: 610,
      width: 200,
      height: 22,
      fontSize: 18,
      color: THEME.text,
      textAlign: "left",
      fontWeight: "bold",
      letterSpacing: 2,
      lineHeight: 1.2,
      backgroundColor: "rgba(0,0,0,0)",
    },
  },

  // 7. 左侧：机组运行状态饼图
  {
    componentName: "PieChart",
    logicalId: "pie_unit_status",
    parentLogicalId: SCREEN_ROOT,
    name: "机组运行状态饼图",
    style: {
      position: "absolute",
      left: 45,
      top: 640,
      width: 400,
      height: 300,
      zIndex: 2,
    },
    chartData: {
      constant: {
        data: [
          { name: "运行中", type: "状态", value: 6 },
          { name: "停机", type: "状态", value: 1 },
          { name: "检修", type: "状态", value: 1 },
        ],
      },
    },
    option: {
      backgroundColor: "transparent",
      color: ["#00E5FF", "#7C4DFF", "#FFB300"],
      legend: {
        show: true,
        left: "center",
        top: "bottom",
        offsetX: 0,
        offsetY: -6,
        orient: "horizontal",
        icon: "roundRect",
        textStyle: {
          color: THEME.textMuted,
          fontSize: 12,
          fontWeight: "normal",
        },
      },
      tooltip: {
        show: true,
        backgroundColor: "rgba(8,18,38,0.92)",
        textStyle: { color: "#FFFFFF", fontSize: 14 },
      },
      series: [
        {
          radius: ["40%", "62%"],
          center: ["50%", "44%"],
          itemStyle: {
            borderWidth: 2,
            borderColor: "#07182F",
            shadowBlur: 10,
            shadowColor: "rgba(0,229,255,0.35)",
          },
          label: {
            show: true,
            formatter: "{b}: {c}台",
            position: "outside",
            color: THEME.text,
            fontSize: 13,
            fontWeight: "bold",
          },
          labelLine: {
            show: true,
            length: 16,
            length2: 28,
          },
        },
      ],
    },
  },

  // 中上部标题
  {
    componentName: "SingleText",
    logicalId: "center_title_charts",
    parentLogicalId: SCREEN_ROOT,
    name: "中上部标题",
    textContent: "发电·水情 趋势监测",
    style: {
      position: "absolute",
      left: 490,
      top: 112,
      width: 400,
      height: 24,
      fontSize: 18,
      color: THEME.text,
      textAlign: "left",
      fontWeight: "bold",
      letterSpacing: 2,
      lineHeight: 1.2,
      backgroundColor: "rgba(0,0,0,0)",
    },
  },

  // 8. 中上部：近 7 日发电量柱状图
  {
    componentName: "BarChart",
    logicalId: "bar_7day_generation",
    parentLogicalId: SCREEN_ROOT,
    name: "近7日发电量柱状图",
    style: {
      position: "absolute",
      left: 490,
      top: 140,
      width: 465,
      height: 300,
      zIndex: 2,
    },
    chartData: {
      constant: {
        data: [
          { name: "周一", type: "发电量", value: 980 },
          { name: "周二", type: "发电量", value: 1120 },
          { name: "周三", type: "发电量", value: 1050 },
          { name: "周四", type: "发电量", value: 1240 },
          { name: "周五", type: "发电量", value: 1180 },
          { name: "周六", type: "发电量", value: 1320 },
          { name: "周日", type: "发电量", value: 1280 },
        ],
      },
    },
    option: {
      backgroundColor: "transparent",
      color: ["#00E5FF"],
      legend: { show: false },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(3,16,31,0.92)",
        borderColor: "rgba(0,229,255,0.35)",
        borderWidth: 1,
        textStyle: { color: "#FFFFFF", fontSize: 13 },
        axisPointer: { type: "shadow" },
      },
      grid: { left: 48, top: 40, right: 24, bottom: 36 },
      xAxis: {
        axisLabel: { show: true, color: THEME.textMuted, fontSize: 11 },
        axisLine: { show: true, lineStyle: { color: "rgba(0,229,255,0.25)" } },
        splitLine: { show: false },
      },
      yAxis: {
        name: "万kWh",
        nameTextStyle: { color: THEME.textMuted, fontSize: 11 },
        axisLabel: { show: true, color: THEME.textMuted, fontSize: 11 },
        splitLine: { show: true, lineStyle: { color: "rgba(0,229,255,0.1)", type: "dashed" } },
      },
      series: [
        {
          barWidth: 14,
          itemStyle: {
            borderRadius: [3, 3, 0, 0],
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "#00E5FF" },
                { offset: 1, color: "rgba(0,229,255,0.2)" },
              ],
            },
          },
          label: { show: false },
        },
      ],
    },
  },

  // 9. 中上部：水位与入库流量折线图
  {
    componentName: "LineChart",
    logicalId: "line_water_inflow",
    parentLogicalId: SCREEN_ROOT,
    name: "水位与入库流量折线图",
    style: {
      position: "absolute",
      left: 975,
      top: 140,
      width: 465,
      height: 300,
      zIndex: 2,
    },
    chartData: {
      constant: {
        data: [
          { name: "周一", type: "水位", value: 285.2 },
          { name: "周一", type: "入库流量", value: 520 },
          { name: "周二", type: "水位", value: 285.5 },
          { name: "周二", type: "入库流量", value: 580 },
          { name: "周三", type: "水位", value: 285.3 },
          { name: "周三", type: "入库流量", value: 610 },
          { name: "周四", type: "水位", value: 285.8 },
          { name: "周四", type: "入库流量", value: 720 },
          { name: "周五", type: "水位", value: 286.1 },
          { name: "周五", type: "入库流量", value: 690 },
          { name: "周六", type: "水位", value: 286.0 },
          { name: "周六", type: "入库流量", value: 650 },
          { name: "周日", type: "水位", value: 285.9 },
          { name: "周日", type: "入库流量", value: 600 },
        ],
      },
    },
    option: {
      backgroundColor: "transparent",
      color: ["#00E5FF", "#FFB300"],
      legend: {
        show: true,
        left: "center",
        top: "top",
        offsetX: 0,
        offsetY: 0,
        orient: "horizontal",
        icon: "emptyCircle",
        textStyle: { color: THEME.textMuted, fontSize: 11 },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(3,16,31,0.92)",
        borderColor: "rgba(0,229,255,0.35)",
        borderWidth: 1,
        textStyle: { color: "#FFFFFF", fontSize: 13 },
      },
      grid: { left: 48, top: 48, right: 48, bottom: 36 },
      xAxis: {
        axisLabel: { show: true, color: THEME.textMuted, fontSize: 11 },
        axisLine: { show: true, lineStyle: { color: "rgba(0,229,255,0.25)" } },
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: "value",
          name: "水位(m)",
          nameTextStyle: { color: THEME.textMuted, fontSize: 11 },
          axisLabel: { show: true, color: THEME.textMuted, fontSize: 11 },
          splitLine: { show: true, lineStyle: { color: "rgba(0,229,255,0.1)", type: "dashed" } },
        },
        {
          type: "value",
          name: "流量(m³/s)",
          nameTextStyle: { color: THEME.textMuted, fontSize: 11 },
          axisLabel: { show: true, color: THEME.textMuted, fontSize: 11 },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "水位",
          type: "line",
          yAxisIndex: 0,
          smooth: true,
          lineStyle: { width: 3, shadowBlur: 10, shadowColor: "rgba(0,229,255,0.45)" },
          itemStyle: { color: "#00E5FF" },
          showSymbol: true,
          symbol: "circle",
          symbolSize: 6,
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(0,229,255,0.35)" },
                { offset: 1, color: "rgba(0,229,255,0.02)" },
              ],
            },
          },
        },
        {
          name: "入库流量",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          lineStyle: { width: 3, shadowBlur: 10, shadowColor: "rgba(255,179,0,0.45)" },
          itemStyle: { color: "#FFB300" },
          showSymbol: true,
          symbol: "circle",
          symbolSize: 6,
        },
      ],
    },
  },

  // 中下部标题
  {
    componentName: "SingleText",
    logicalId: "center_title_earth",
    parentLogicalId: SCREEN_ROOT,
    name: "中下部标题",
    textContent: "流域电站分布",
    style: {
      position: "absolute",
      left: 490,
      top: 472,
      width: 300,
      height: 24,
      fontSize: 18,
      color: THEME.text,
      textAlign: "left",
      fontWeight: "bold",
      letterSpacing: 2,
      lineHeight: 1.2,
      backgroundColor: "rgba(0,0,0,0)",
    },
  },

  // 10. 中下部：3D 地球
  {
    componentName: "Earth3D",
    logicalId: "earth_basin_stations",
    parentLogicalId: SCREEN_ROOT,
    name: "流域电站3D地球",
    title: "流域电站分布",
    style: {
      position: "absolute",
      left: 490,
      top: 500,
      width: 950,
      height: 540,
      zIndex: 1,
    },
    longitude: 103.5,
    latitude: 30.5,
    cameraDistance: 12,
    earthRadius: 360,
    texture: {
      type: "dark",
      cloudShow: true,
      cloudSpeed: 0.5,
      cloudOpacity: 0.45,
    },
    starBg: { show: true, autoRotate: true, speed: 0.8 },
    outAtmosphere: { show: true, color: "rgba(13,183,248,1)", opacity: 0.12 },
    glow: { open: true, color: "#00E5FF", strength: 160, opacity: 90 },
    backLight: { open: true, color: "#7C4DFF", opacity: 0.25 },
    stroke: { open: true, outline: true, outlineColor: "rgba(0,229,255,0.4)", lineColor: "rgba(0,229,255,0.25)" },
    ambientLight: { show: true, color: "#FFFFFF", intensity: 0.8 },
    children: [
      {
        componentName: "Earth3D-Pointer",
        logicalId: "earth_pointer_stations",
        parentLogicalId: "earth_basin_stations",
        name: "流域电站标记",
        style: { position: "absolute", left: 0, top: 0, width: 0, height: 0, zIndex: 509 },
        pointerColor: "#00E5FF",
        pointerOpacity: 1,
        data: [
          { lng: 103.6, lat: 31.0, title: "XX 水电站" },
          { lng: 102.9, lat: 30.8, title: "上游电站 A" },
          { lng: 104.2, lat: 30.5, title: "下游电站 B" },
          { lng: 103.0, lat: 29.6, title: "支流电站 C" },
          { lng: 104.8, lat: 29.4, title: "梯级电站 D" },
        ],
      },
      {
        componentName: "Earth3D-Satellite",
        logicalId: "earth_satellite",
        parentLogicalId: "earth_basin_stations",
        name: "卫星",
        style: { position: "absolute", left: 0, top: 0, width: 0, height: 0, zIndex: 508 },
        satelliteColor: "rgba(0,229,255,1)",
        satelliteOpacity: 0.8,
        orbitColor: "rgba(0,229,255,0.6)",
        orbitOpacity: 0.8,
        orbitRadius: 820,
        orbitXRotation: 35,
        orbitYRotation: 15,
      },
      {
        componentName: "Earth3D-SpeedLight",
        logicalId: "earth_speed_light",
        parentLogicalId: "earth_basin_stations",
        name: "扫描线",
        style: { position: "absolute", left: 0, top: 0, width: 0, height: 0, zIndex: 507 },
        lng: 103.6,
        lat: 31.0,
        speedLightColor: "rgba(0,229,255,0.9)",
      },
      {
        componentName: "Earth3D-TextAround",
        logicalId: "earth_text_around",
        parentLogicalId: "earth_basin_stations",
        name: "环绕文字",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 506,
          textContent: "BASIN POWER STATIONS • SMART MONITORING",
          color: "rgba(0,229,255,0.45)",
          fontSize: 420,
          fontWeight: "bold",
          letterSpacing: 4,
        },
        orbitRadius: 820,
        orbitColor: "rgba(0,229,255,0.2)",
      },
    ],
  },

  // 右下部标题
  {
    componentName: "SingleText",
    logicalId: "right_title_map",
    parentLogicalId: SCREEN_ROOT,
    name: "右下部标题",
    textContent: "库区大坝实时监测",
    style: {
      position: "absolute",
      left: 1470,
      top: 472,
      width: 300,
      height: 24,
      fontSize: 18,
      color: THEME.text,
      textAlign: "left",
      fontWeight: "bold",
      letterSpacing: 2,
      lineHeight: 1.2,
      backgroundColor: "rgba(0,0,0,0)",
    },
  },

  // 11. 右下部：2D 高德地图
  {
    componentName: "GaodeMap",
    logicalId: "gaode_reservoir_map",
    parentLogicalId: SCREEN_ROOT,
    name: "库区高德地图",
    title: "库区大坝实时监测",
    style: {
      position: "absolute",
      left: 1470,
      top: 500,
      width: 420,
      height: 540,
      zIndex: 1,
    },
    mapConf: {
      showRoad: true,
      styleType: "default",
      showBuilding: false,
      showPoint: false,
      draggable: false,
      defaultStyleId: "amap://styles/darkblue",
      customStyleId: "blue",
      latitude: 29.9,
      longitude: 119.520792,
      zoom: 9.5,
      toolbarPosition: "LB",
      showToolbar: false,
    },
    authConfig: {
      key: "YOUR_AMAP_KEY",
      jsCode: "YOUR_AMAP_JSCODE",
    },
    children: [
      {
        componentName: "GaodeMap-Marker",
        logicalId: "gaode_dam_marker",
        parentLogicalId: "gaode_reservoir_map",
        name: "大坝标牌",
        style: { position: "absolute", left: 0, top: 0, width: 0, height: 0, zIndex: 15 },
        data: [
          { lng: 119.520792, lat: 29.9, value: "XX大坝" },
          { lng: 119.65, lat: 29.85, value: "泄洪闸" },
          { lng: 119.4, lat: 29.95, value: "取水口" },
        ],
        textConf: {
          color: "#00E5FF",
          fontSize: 12,
          fontWeight: "bold",
          align: "center",
          offsetX: 0,
          offsetY: -24,
        },
        pointConf: {
          url: "",
          width: 12,
          height: 12,
          offsetX: -6,
          offsetY: -6,
        },
      },
      {
        componentName: "GaodeMap-FlyLine",
        logicalId: "gaode_transmission_line",
        parentLogicalId: "gaode_reservoir_map",
        name: "输电线路",
        style: { position: "absolute", left: 0, top: 0, width: 0, height: 0, zIndex: 12 },
        data: [
          { fromLng: 119.520792, fromLat: 29.9, toLng: 119.9, toLat: 30.1 },
          { fromLng: 119.520792, fromLat: 29.9, toLng: 119.2, toLat: 29.7 },
          { fromLng: 119.520792, fromLat: 29.9, toLng: 120.1, toLat: 29.6 },
        ],
        pulseLink: {
          curve: 0.3,
          lineWidth: 4,
          speed: 18,
          headColor: "rgba(0,229,255,1)",
          lineColor: "rgba(0,229,255,0.5)",
          trailColor: "rgba(0,229,255,0.15)",
        },
      },
      {
        componentName: "GaodeMap-Polygon",
        logicalId: "gaode_reservoir_polygon",
        parentLogicalId: "gaode_reservoir_map",
        name: "库区多边形",
        style: { position: "absolute", left: 0, top: 0, width: 0, height: 0, zIndex: 5 },
        fillColor: "rgba(0,229,255,0.12)",
        borderColor: "rgba(0,229,255,0.65)",
        borderWidth: 1.5,
        borderType: "dashed",
        showBorder: true,
        data: [
          [119.25, 29.98],
          [119.35, 30.08],
          [119.55, 30.12],
          [119.75, 30.05],
          [119.8, 29.92],
          [119.7, 29.82],
          [119.5, 29.78],
          [119.32, 29.84],
          [119.25, 29.98],
        ],
      },
    ],
  },

  // 装饰：顶部科技线
  {
    componentName: "SvgDecoration",
    logicalId: "header_line_svg",
    parentLogicalId: SCREEN_ROOT,
    name: "顶部科技线",
    style: {
      position: "absolute",
      left: 600,
      top: 72,
      width: 720,
      height: 16,
      zIndex: 3,
      backgroundColor: "rgba(0,0,0,0)",
    },
    svgSource: "custom",
    svgContent:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 16"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="rgba(0,229,255,0)"/><stop offset="50%" stop-color="rgba(0,229,255,0.8)"/><stop offset="100%" stop-color="rgba(0,229,255,0)"/></linearGradient></defs><rect x="0" y="7" width="720" height="2" fill="url(#g)"/><circle cx="360" cy="8" r="3" fill="#00E5FF"/></svg>',
    svgFit: "fill",
    primaryColor: THEME.primary,
    opacity: 0.9,
  },

  // 装饰：左侧栏底部角标
  {
    componentName: "SvgDecoration",
    logicalId: "left_corner_svg",
    parentLogicalId: SCREEN_ROOT,
    name: "左侧栏装饰",
    style: {
      position: "absolute",
      left: 30,
      top: 990,
      width: 120,
      height: 40,
      zIndex: 3,
      backgroundColor: "rgba(0,0,0,0)",
    },
    svgSource: "preset",
    svgPreset: "icon-Frame3",
    svgFit: "contain",
    primaryColor: THEME.primary,
    secondaryColor: "#1B5CFF",
    flipX: true,
    opacity: 0.7,
    glow: { isActive: true, color: "rgba(0,229,255,0.45)", blur: 8 },
  },
];

async function main() {
  const client = new Client({
    name: "hydropower-screen-generator",
    version: "0.1.0",
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["node_modules/tsx/dist/cli.mjs", "src/server.ts"],
    cwd: join(__dirname, ".."),
  });

  await client.connect(transport);

  try {
    const result = await client.callTool({
      name: "generate_components_schemas",
      arguments: { componentsProps },
    });

    const schemas = readToolJson(result) as ComponentSchema[];

    // 使用 MCP 返回的 ComponentSchema 统一转换为编辑器节点，并包装为 __Group__ 根节点
    const screenTree: EditorComponentNode = {
      id: SCREEN_ROOT,
      componentName: "__Group__",
      structVersion: "0.0.0",
      title: "水电站智慧运行监测大屏",
      isGroup: true,
      isHidden: false,
      isLocked: false,
      props: {
        logicalId: SCREEN_ROOT,
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
        },
      },
      children: schemas.map(componentSchemaToEditorNode),
    };

    const outputPath = join(__dirname, "..", "dist", "hydropower-screen-schema.json");
    writeFileSync(outputPath, JSON.stringify(screenTree, null, 2), "utf-8");

    console.log(`Generated screen schema: ${outputPath}`);
    console.log(`Total components: ${schemas.length}`);
    console.log(
      `Component names: ${schemas.map((s) => s.componentName).join(", ")}`,
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
