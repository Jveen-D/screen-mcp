import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { JsonObject } from "../src/types/component.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_SERVER_CWD = join(__dirname, "..");
const MCP_SERVER_CWD = process.env.MCP_SERVER_CWD || DEFAULT_SERVER_CWD;
const NODE_PATH = process.execPath;

const BASE_PROPS: JsonObject[] = [
  {
    componentName: "NavMenu",
    logicalId: "nav_menu_demo",
    parentLogicalId: "menu_group",
    name: "侧边导航",
    menuData: {
      items: [
        { id: "1", name: "总览" },
        { id: "2", name: "安全" },
        { id: "3", name: "质量" },
        { id: "4", name: "进度" },
      ],
    },
    style: {
      position: "absolute",
      left: 80,
      top: 120,
      width: 280,
      height: 600,
      zIndex: 10,
    },
  },
  {
    componentName: "TabMenu",
    logicalId: "tab_menu_demo",
    parentLogicalId: "menu_group",
    name: "顶部 Tab",
    menuData: {
      items: [
        { id: "1", name: "驾驶舱" },
        { id: "2", name: "安全看板" },
        { id: "3", name: "质量看板" },
      ],
    },
    flexDirection: "row",
    alignType: "center",
    style: {
      position: "absolute",
      left: 300,
      top: 80,
      width: 600,
      height: 60,
      zIndex: 10,
    },
  },
  {
    componentName: "Input",
    logicalId: "input_demo",
    parentLogicalId: "form_group",
    name: "搜索输入框",
    placeholder: "请输入关键词",
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 240,
      height: 40,
      zIndex: 10,
    },
  },
  {
    componentName: "Select",
    logicalId: "select_demo",
    parentLogicalId: "form_group",
    name: "状态下拉",
    options: [
      { label: "全部", value: "all" },
      { label: "运行中", value: "running" },
      { label: "已停止", value: "stopped" },
    ],
    defaultSelectedType: "index",
    defaultSelectedIndex: 1,
    style: {
      position: "absolute",
      left: 100,
      top: 160,
      width: 200,
      height: 40,
      zIndex: 10,
    },
  },
  {
    componentName: "RadioGroup",
    logicalId: "radio_group_demo",
    parentLogicalId: "form_group",
    name: "时间维度",
    options: [
      { label: "日", value: "day" },
      { label: "周", value: "week" },
      { label: "月", value: "month" },
    ],
    direction: "horizontal",
    optionSpacing: 20,
    style: {
      position: "absolute",
      left: 320,
      top: 160,
      width: 300,
      height: 40,
      zIndex: 10,
    },
  },
  {
    componentName: "DatePicker",
    logicalId: "date_picker_demo",
    parentLogicalId: "form_group",
    name: "日期选择",
    dateFormat: "YYYY-MM-DD",
    selector: {
      placeholder: {
        content: "请选择日期",
      },
    },
    style: {
      position: "absolute",
      left: 100,
      top: 220,
      width: 180,
      height: 40,
      zIndex: 10,
    },
  },
  {
    componentName: "DateRangePicker",
    logicalId: "date_range_picker_demo",
    parentLogicalId: "form_group",
    name: "日期范围选择",
    dateFormat: "YYYY-MM-DD",
    selector: {
      placeholder: {
        content: ["开始", "结束"],
      },
      separator: "至",
    },
    style: {
      position: "absolute",
      left: 320,
      top: 220,
      width: 280,
      height: 40,
      zIndex: 10,
    },
  },
  {
    componentName: "Weather",
    logicalId: "weather_demo",
    parentLogicalId: "header_group",
    name: "天气",
    cityCode: ["11", "1101", "110101"],
    style: {
      position: "absolute",
      left: 100,
      top: 280,
      width: 240,
      height: 34,
      zIndex: 10,
    },
  },
  {
    componentName: "Date",
    logicalId: "date_demo",
    parentLogicalId: "header_group",
    name: "时间",
    format: "YYYY-MM-DD HH:mm:ss",
    style: {
      position: "absolute",
      left: 360,
      top: 280,
      width: 320,
      height: 34,
      zIndex: 10,
    },
  },
  {
    componentName: "Video",
    logicalId: "video_demo",
    parentLogicalId: "media_group",
    name: "监控视频",
    videoType: "hls",
    controls: true,
    autoplay: true,
    muted: true,
    style: {
      position: "absolute",
      left: 100,
      top: 340,
      width: 400,
      height: 260,
      zIndex: 10,
    },
  },
  {
    componentName: "Audio",
    logicalId: "audio_demo",
    parentLogicalId: "media_group",
    name: "背景音乐",
    controlBar: false,
    autoPlay: true,
    loopPlay: true,
    style: {
      position: "absolute",
      left: 520,
      top: 340,
      width: 400,
      height: 55,
      zIndex: 10,
    },
  },
  {
    componentName: "IFrame",
    logicalId: "iframe_demo",
    parentLogicalId: "content_group",
    name: "iframe嵌入",
    url: "https://example.com",
    scroll: "hide",
    style: {
      position: "absolute",
      left: 100,
      top: 620,
      width: 600,
      height: 400,
      zIndex: 10,
    },
  },
  {
    componentName: "Swiper",
    logicalId: "swiper_demo",
    parentLogicalId: "media_group",
    name: "轮播图",
    imageSrcList: ["group1/banner1.png", "group1/banner2.png"],
    direction: "horizontal",
    style: {
      position: "absolute",
      left: 100,
      top: 1040,
      width: 800,
      height: 240,
      zIndex: 10,
    },
  },
  {
    componentName: "optionButton",
    logicalId: "option_button_demo",
    parentLogicalId: "form_group",
    name: "查询按钮",
    btnText: "查询",
    arrange: "row",
    style: {
      position: "absolute",
      left: 100,
      top: 1300,
      width: 160,
      height: 48,
      zIndex: 10,
    },
  },
  {
    componentName: "Earth3D",
    logicalId: "earth_3d_demo",
    parentLogicalId: "earth_group",
    name: "3D地球",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 1000,
      height: 800,
      zIndex: 1,
    },
    children: [
      {
        componentName: "Earth3D-Pointer",
        logicalId: "earth_pointer_demo",
        name: "标记点",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 509,
        },
        data: [
          { lng: 116.4074, lat: 39.9042, title: "北京" },
          { lng: 121.4737, lat: 31.2304, title: "上海" },
        ],
      },
      {
        componentName: "Earth3D-Satellite",
        logicalId: "earth_satellite_demo",
        name: "卫星",
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
        logicalId: "earth_speed_light_demo",
        name: "扫描线",
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
        logicalId: "earth_text_around_demo",
        name: "文字环绕",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 506,
        },
      },
    ],
  },
  {
    componentName: "GaodeMap",
    logicalId: "gaode_map_demo",
    parentLogicalId: "map_group",
    name: "2D高德地图",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 1920,
      height: 1080,
      zIndex: 91,
    },
    children: [
      {
        componentName: "GaodeMap-FlyLine",
        logicalId: "gaode_fly_line_demo",
        name: "飞线",
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
        componentName: "GaodeMap-HeatMap",
        logicalId: "gaode_heat_map_demo",
        name: "热力聚合",
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
        componentName: "GaodeMap-InfoPannel",
        logicalId: "gaode_info_pannel_demo",
        name: "信息面板",
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
        componentName: "GaodeMap-Marker",
        logicalId: "gaode_marker_demo",
        name: "标牌",
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
        logicalId: "gaode_polygon_demo",
        name: "多边形",
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

function readToolJson(result: Awaited<ReturnType<Client["callTool"]>>): JsonObject {
  if (!Array.isArray(result.content)) {
    throw new Error("MCP tool should return content array");
  }
  const content = result.content[0];
  if (!content || content.type !== "text") {
    throw new Error("MCP tool should return text content");
  }
  const text = "text" in content ? content.text : "";
  return JSON.parse(text) as JsonObject;
}

const client = new Client({
  name: "screen-component-mcp-base-client",
  version: "0.1.0",
});

const transport = new StdioClientTransport({
  command: NODE_PATH,
  args: ["node_modules/tsx/dist/cli.mjs", "src/server.ts"],
  cwd: MCP_SERVER_CWD,
});

await client.connect(transport);

try {
  const result = await client.callTool({
    name: "generate_components_schemas",
    arguments: {
      componentsProps: BASE_PROPS,
    },
  });

  const schemas = readToolJson(result);
  if (!Array.isArray(schemas)) {
    throw new Error("generate_components_schemas should return an array");
  }

  const outputDir = join(__dirname, "output");
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, "base-schemas.json");
  writeFileSync(outputPath, JSON.stringify(schemas, null, 2), "utf-8");

  console.log(`Generated ${schemas.length} schemas, saved to ${outputPath}`);
  for (const schema of schemas) {
    const schemaObj = schema as JsonObject;
    console.log(`  - ${schemaObj.componentName}: ${schemaObj.businessElementId}`);
  }
} finally {
  await client.close();
}
