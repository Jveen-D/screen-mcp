import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ComponentSchema, EditorComponentNode, EditorGroupNode, JsonObject } from "../src/types/component.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readToolJson(result: Awaited<ReturnType<Client["callTool"]>>): unknown {
  if (!Array.isArray(result.content)) {
    throw new Error("MCP tool should return content array");
  }
  const content = result.content[0];
  if (!content || content.type !== "text") {
    throw new Error("MCP tool should return text content");
  }
  return JSON.parse("text" in content ? content.text : "");
}

function componentSchemaToEditorNode(schema: ComponentSchema): EditorComponentNode {
  const node: EditorComponentNode = {
    id: schema.businessElementId,
    componentName: schema.componentName,
    structVersion: schema.structVersion,
    props: schema.props,
    title:
      typeof schema.props.name === "string" && schema.props.name.trim() !== ""
        ? schema.props.name
        : schema.displayName,
    isHidden: schema.hiddenFlag.value,
    isLocked: schema.lockedFlag,
    isGroup: false,
  };

  if (Array.isArray(schema.children)) {
    node.children = schema.children.map(componentSchemaToEditorNode) as EditorComponentNode[];
  }

  return node;
}

const screenBgSvg = `<svg viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#020A18"/><stop offset="0.5" stop-color="#061A2E"/><stop offset="1" stop-color="#020813"/></linearGradient><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0v60" fill="none" stroke="#00E5FF" stroke-width="0.5" opacity="0.08"/></pattern><radialGradient id="glow" cx="0.5" cy="0.3" r="0.8"><stop offset="0" stop-color="#00E5FF" stop-opacity="0.12"/><stop offset="0.5" stop-color="#00E5FF" stop-opacity="0.04"/><stop offset="1" stop-color="#00E5FF" stop-opacity="0"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#bg)"/><rect width="1920" height="1080" fill="url(#grid)"/><rect width="1920" height="1080" fill="url(#glow)"/><path d="M0 80 H1920" stroke="#00E5FF" stroke-width="1" opacity="0.3"/><path d="M0 82 H1920" stroke="#00E5FF" stroke-width="0.5" opacity="0.15"/><path d="M0 998 H1920" stroke="#00E5FF" stroke-width="0.5" opacity="0.15"/></svg>`;

const headerDecorationSvg = `<svg viewBox="0 0 800 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 12h280l20 8h200l20-8h280" fill="none" stroke="#00E5FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/><circle cx="300" cy="12" r="3" fill="#00E5FF" opacity="0.85"/><circle cx="500" cy="12" r="3" fill="#00E5FF" opacity="0.85"/></svg>`;

const baseTextStyle = {
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  backgroundColor: "rgba(0,0,0,0)",
};

const ROOT_ID = "hydro_root";

const componentsProps: JsonObject[] = [
  // 1. 全屏科技风背景
  {
    componentName: "SingleImage",
    logicalId: "hydro_screen_bg",
    parentLogicalId: ROOT_ID,
    name: "大屏背景",
    imageBase64: `data:image/svg+xml;base64,${Buffer.from(screenBgSvg).toString("base64")}`,
    imageUseMode: "base64",
    opacity: 1,
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 1920,
      height: 1080,
      zIndex: 1,
    },
  },
  // 2. 主标题
  {
    componentName: "SingleText",
    logicalId: "hydro_main_title",
    parentLogicalId: ROOT_ID,
    name: "主标题",
    textContent: "水电站智慧运行监测大屏",
    style: {
      position: "absolute",
      left: 560,
      top: 20,
      width: 800,
      height: 44,
      fontSize: 36,
      lineHeight: 44,
      color: "#DFF8FF",
      textAlign: "center",
      fontWeight: "bold",
      letterSpacing: 4,
      ...baseTextStyle,
    },
  },
  // 3. 顶部装饰线
  {
    componentName: "SvgDecoration",
    logicalId: "hydro_header_deco",
    parentLogicalId: ROOT_ID,
    name: "顶部装饰线",
    svgSource: "custom",
    svgContent: headerDecorationSvg,
    primaryColor: "#00E5FF",
    opacity: 0.85,
    style: {
      position: "absolute",
      left: 560,
      top: 68,
      width: 800,
      height: 24,
      backgroundColor: "rgba(0,0,0,0)",
      zIndex: 5,
    },
  },
  // 4. 当前时间
  {
    componentName: "Date",
    logicalId: "hydro_current_time",
    parentLogicalId: ROOT_ID,
    name: "当前时间",
    format: "YYYY-MM-DD HH:mm:ss",
    timezone: "beijing",
    style: {
      position: "absolute",
      left: 1640,
      top: 28,
      width: 240,
      height: 26,
      fontSize: 18,
      color: "#00E5FF",
      textAlign: "right",
      ...baseTextStyle,
    },
  },
  // 5. 天气
  {
    componentName: "Weather",
    logicalId: "hydro_weather",
    parentLogicalId: ROOT_ID,
    name: "天气",
    cityCode: ["33", "3301", "330102"],
    style: {
      position: "absolute",
      left: 1380,
      top: 28,
      width: 240,
      height: 26,
      fontSize: 18,
      color: "#DFF8FF",
      textAlign: "right",
      ...baseTextStyle,
    },
  },
  // 6-9. 顶部 KPI 指标
  {
    componentName: "Indicator",
    logicalId: "hydro_indicator_power_today",
    parentLogicalId: ROOT_ID,
    name: "今日发电量",
    textValue: 128.5,
    titleName: "今日发电量",
    suffix: true,
    suffixTitle: "万kWh",
    titleStyle: { ...baseTextStyle, fontSize: 14, color: "#A8D8E8" },
    numberStyle: { ...baseTextStyle, fontSize: 32, color: "#00E5FF", fontWeight: "bold" },
    suffixStyle: { ...baseTextStyle, fontSize: 14, color: "#A8D8E8" },
    style: {
      position: "absolute",
      left: 60,
      top: 100,
      width: 200,
      height: 80,
      backgroundColor: "rgba(0,229,255,0.06)",
      border: "1px solid rgba(0,229,255,0.18)",
      borderRadius: 4,
      zIndex: 10,
    },
  },
  {
    componentName: "Indicator",
    logicalId: "hydro_indicator_power_total",
    parentLogicalId: ROOT_ID,
    name: "累计发电量",
    textValue: 2456.8,
    titleName: "累计发电量",
    suffix: true,
    suffixTitle: "万kWh",
    titleStyle: { ...baseTextStyle, fontSize: 14, color: "#A8D8E8" },
    numberStyle: { ...baseTextStyle, fontSize: 32, color: "#00E5FF", fontWeight: "bold" },
    suffixStyle: { ...baseTextStyle, fontSize: 14, color: "#A8D8E8" },
    style: {
      position: "absolute",
      left: 300,
      top: 100,
      width: 200,
      height: 80,
      backgroundColor: "rgba(0,229,255,0.06)",
      border: "1px solid rgba(0,229,255,0.18)",
      borderRadius: 4,
      zIndex: 10,
    },
  },
  {
    componentName: "Indicator",
    logicalId: "hydro_indicator_load",
    parentLogicalId: ROOT_ID,
    name: "当前负荷",
    textValue: 86.4,
    titleName: "当前负荷",
    suffix: true,
    suffixTitle: "MW",
    titleStyle: { ...baseTextStyle, fontSize: 14, color: "#A8D8E8" },
    numberStyle: { ...baseTextStyle, fontSize: 32, color: "#FFB300", fontWeight: "bold" },
    suffixStyle: { ...baseTextStyle, fontSize: 14, color: "#A8D8E8" },
    style: {
      position: "absolute",
      left: 1420,
      top: 100,
      width: 200,
      height: 80,
      backgroundColor: "rgba(0,229,255,0.06)",
      border: "1px solid rgba(0,229,255,0.18)",
      borderRadius: 4,
      zIndex: 10,
    },
  },
  {
    componentName: "Indicator",
    logicalId: "hydro_indicator_water_level",
    parentLogicalId: ROOT_ID,
    name: "水库水位",
    textValue: 342.6,
    titleName: "水库水位",
    suffix: true,
    suffixTitle: "m",
    titleStyle: { ...baseTextStyle, fontSize: 14, color: "#A8D8E8" },
    numberStyle: { ...baseTextStyle, fontSize: 32, color: "#25F28A", fontWeight: "bold" },
    suffixStyle: { ...baseTextStyle, fontSize: 14, color: "#A8D8E8" },
    style: {
      position: "absolute",
      left: 1660,
      top: 100,
      width: 200,
      height: 80,
      backgroundColor: "rgba(0,229,255,0.06)",
      border: "1px solid rgba(0,229,255,0.18)",
      borderRadius: 4,
      zIndex: 10,
    },
  },
  // 10. 左侧机组运行效率仪表盘
  {
    componentName: "Gauge",
    logicalId: "hydro_gauge_efficiency",
    parentLogicalId: ROOT_ID,
    name: "机组运行效率",
    value: 92.5,
    style: {
      position: "absolute",
      left: 55,
      top: 240,
      width: 410,
      height: 320,
      backgroundColor: "rgba(0,0,0,0)",
      zIndex: 10,
    },
  },
  // 11. 右侧环境气象雷达图
  {
    componentName: "RadarChart",
    logicalId: "hydro_radar_env",
    parentLogicalId: ROOT_ID,
    name: "环境气象监测",
    data: [
      { series: "当前", dimension: "温度", value: 24 },
      { series: "当前", dimension: "湿度", value: 68 },
      { series: "当前", dimension: "风速", value: 12 },
      { series: "当前", dimension: "雨量", value: 5 },
      { series: "当前", dimension: "气压", value: 88 },
      { series: "当前", dimension: "光照", value: 72 },
    ],
    style: {
      position: "absolute",
      left: 1450,
      top: 610,
      width: 420,
      height: 340,
      backgroundColor: "rgba(0,0,0,0)",
      zIndex: 10,
    },
  },
  // 12. 底部告警滚动列表
  {
    componentName: "ScrollList",
    logicalId: "hydro_alarm_list",
    parentLogicalId: ROOT_ID,
    name: "告警事件",
    columns: [
      { field: "time", label: "时间" },
      { field: "device", label: "设备" },
      { field: "level", label: "级别" },
      { field: "desc", label: "描述" },
    ],
    data: [
      { time: "17:02:34", device: "#1机组", level: "一般", desc: "振动幅值偏高" },
      { time: "16:58:12", device: "#3机组", level: "提示", desc: "冷却水温度略高" },
      { time: "16:45:09", device: "闸门A", level: "严重", desc: "开度反馈异常" },
      { time: "16:32:51", device: "#2机组", level: "提示", desc: "油位正常偏低" },
      { time: "16:18:27", device: "升压站", level: "一般", desc: "负荷波动告警" },
      { time: "15:55:03", device: "#4机组", level: "提示", desc: "巡检任务待确认" },
    ],
    style: {
      position: "absolute",
      left: 30,
      top: 1000,
      width: 1860,
      height: 60,
      backgroundColor: "rgba(255,45,79,0.05)",
      border: "1px solid rgba(255,45,79,0.18)",
      borderRadius: 4,
      zIndex: 10,
    },
  },
  // 13. 底部状态栏文本
  {
    componentName: "SingleText",
    logicalId: "hydro_footer_status",
    parentLogicalId: ROOT_ID,
    name: "底部状态",
    textContent: "系统运行正常  |  数据采集周期：实时  |  已接入机组：4台  |  在线率：100%",
    style: {
      position: "absolute",
      left: 30,
      top: 970,
      width: 1860,
      height: 20,
      fontSize: 14,
      lineHeight: 20,
      color: "rgba(168,216,232,0.7)",
      textAlign: "center",
      ...baseTextStyle,
    },
  },
  // 14-15. 中间流域水库地图及标记
  {
    componentName: "GaodeMap",
    logicalId: "hydro_reservoir_map",
    parentLogicalId: ROOT_ID,
    name: "流域水库监测",
    mapConf: {
      showRoad: false,
      styleType: "default",
      showBuilding: false,
      showPoint: false,
      draggable: false,
      defaultStyleId: "amap://styles/darkblue",
      customStyleId: "blue",
      latitude: 29.9,
      zoom: 10,
      longitude: 119.52,
      toolbarPosition: "LT",
      showToolbar: false,
    },
    style: {
      position: "absolute",
      left: 510,
      top: 220,
      width: 900,
      height: 500,
      backgroundColor: "rgba(2,10,24,0.72)",
      border: "1px solid rgba(0,229,255,0.18)",
      borderRadius: 4,
      zIndex: 10,
    },
    children: [
      {
        componentName: "GaodeMap-Marker",
        logicalId: "hydro_map_marker",
        name: "水库标记",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
        },
      },
    ],
  },
];

const panelPrompts = [
  {
    prompt: "水电站月度发电量趋势，用折线图展示，深色科技风。",
    dataItems: [
      { name: "1月", value: 98 },
      { name: "2月", value: 105 },
      { name: "3月", value: 118 },
      { name: "4月", value: 128 },
      { name: "5月", value: 135 },
      { name: "6月", value: 142 },
    ],
    title: "发电量趋势",
    logicalId: "hydro_panel_power_trend",
    parentLogicalId: ROOT_ID,
    style: {
      left: 30,
      top: 590,
      width: 460,
      height: 370,
      position: "absolute",
    },
    theme: {
      primaryColor: "#00E5FF",
      secondaryColor: "#7C4DFF",
      accentColor: "#FFB300",
      textColor: "#DFF8FF",
    },
  },
  {
    prompt: "水电站实时流量监测，用柱状图展示，深色科技风。",
    dataItems: [
      { name: "入库流量", value: 1260 },
      { name: "出库流量", value: 1180 },
      { name: "生态流量", value: 80 },
    ],
    title: "实时流量监测",
    logicalId: "hydro_panel_flow",
    parentLogicalId: ROOT_ID,
    style: {
      left: 510,
      top: 740,
      width: 900,
      height: 220,
      position: "absolute",
    },
    theme: {
      primaryColor: "#00E5FF",
      secondaryColor: "#25F28A",
      accentColor: "#FFB300",
      textColor: "#DFF8FF",
    },
  },
  {
    prompt: "水电站设备健康度分析，用环形图展示，深色科技风。",
    dataItems: [
      { name: "健康", value: 78 },
      { name: "亚健康", value: 15 },
      { name: "故障", value: 7 },
    ],
    title: "设备健康度",
    logicalId: "hydro_panel_health",
    parentLogicalId: ROOT_ID,
    style: {
      left: 1430,
      top: 220,
      width: 460,
      height: 360,
      position: "absolute",
    },
    theme: {
      primaryColor: "#25F28A",
      secondaryColor: "#FFB300",
      accentColor: "#FF4D4F",
      textColor: "#DFF8FF",
    },
  },
];

async function main() {
  const nodePath = process.execPath;
  const client = new Client({
    name: "hydro-screen-generator",
    version: "0.1.0",
  });
  const transport = new StdioClientTransport({
    command: nodePath,
    args: ["node_modules/tsx/dist/cli.mjs", "src/server.ts"],
  });

  await client.connect(transport);

  try {
    const listResult = await client.callTool({ name: "list_components", arguments: {} });
    const components = readToolJson(listResult) as JsonObject[];
    console.log(
      `已连接 screen-mcp，共 ${components.length} 个组件可用`,
    );

    // 1. 批量生成独立组件 schema
    const componentsResult = await client.callTool({
      name: "generate_components_schemas",
      arguments: { componentsProps: componentsProps },
    });
    const componentSchemas = readToolJson(componentsResult) as ComponentSchema[];
    console.log(`生成独立组件 ${componentSchemas.length} 个`);

    // 2. 通过自然语言生成 3 个 ChartPanel 模块
    const panels: EditorGroupNode[] = [];
    for (const panelInput of panelPrompts) {
      const result = await client.callTool({
        name: "generate_screen_module_from_prompt",
        arguments: panelInput,
      });
      const panelTree = readToolJson(result) as EditorGroupNode;
      panels.push(panelTree);
      console.log(`生成图表面板：${panelTree.title}（${panelTree.children.length} 个子节点）`);
    }

    // 3. 组合成完整大屏 __Group__
    const root: EditorGroupNode = {
      id: ROOT_ID,
      componentName: "__Group__",
      structVersion: "0.0.0",
      props: {},
      title: "水电站智慧运行监测大屏",
      isHidden: false,
      isLocked: false,
      isGroup: true,
      children: [
        ...componentSchemas.map(componentSchemaToEditorNode),
        ...panels.map((panel) => ({
          ...panel,
          parentLogicalId: ROOT_ID,
        })) as EditorGroupNode[],
      ],
    };

    const outputDir = join(__dirname, "output");
    mkdirSync(outputDir, { recursive: true });
    const outputPath = join(outputDir, "hydro-screen-schema.json");
    writeFileSync(outputPath, JSON.stringify(root, null, 2));
    console.log(`大屏 schema 已保存至：${outputPath}`);
    console.log(`根节点子节点数：${root.children.length}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
