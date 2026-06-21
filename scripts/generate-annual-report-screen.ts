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

const screenBgSvg = `<svg viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#050D1F"/><stop offset="0.5" stop-color="#0B1A3A"/><stop offset="1" stop-color="#071125"/></linearGradient><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0v60" fill="none" stroke="#2563EB" stroke-width="0.5" opacity="0.08"/></pattern><radialGradient id="glow" cx="0.5" cy="0.25" r="0.85"><stop offset="0" stop-color="#2563EB" stop-opacity="0.14"/><stop offset="0.55" stop-color="#2563EB" stop-opacity="0.04"/><stop offset="1" stop-color="#2563EB" stop-opacity="0"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#bg)"/><rect width="1920" height="1080" fill="url(#grid)"/><rect width="1920" height="1080" fill="url(#glow)"/><path d="M0 80 H1920" stroke="#2563EB" stroke-width="1" opacity="0.35"/><path d="M0 82 H1920" stroke="#2563EB" stroke-width="0.5" opacity="0.18"/></svg>`;

const headerDecorationSvg = `<svg viewBox="0 0 800 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 12h280l20 8h200l20-8h280" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/><circle cx="300" cy="12" r="3" fill="#F59E0B" opacity="0.85"/><circle cx="500" cy="12" r="3" fill="#2563EB" opacity="0.85"/></svg>`;

const baseTextStyle = {
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  backgroundColor: "rgba(0,0,0,0)",
};

const ROOT_ID = "annual_report_root";

const theme = {
  primaryColor: "#2563EB",
  secondaryColor: "#0EA5E9",
  accentColor: "#F59E0B",
  textColor: "#E2E8F0",
};

const componentsProps: JsonObject[] = [
  // 1. 全屏科技风背景
  {
    componentName: "SingleImage",
    logicalId: "annual_screen_bg",
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
    logicalId: "annual_main_title",
    parentLogicalId: ROOT_ID,
    name: "主标题",
    textContent: "2024 年度财报大屏",
    style: {
      position: "absolute",
      left: 560,
      top: 20,
      width: 800,
      height: 44,
      fontSize: 36,
      lineHeight: 44,
      color: "#E2E8F0",
      textAlign: "center",
      fontWeight: "bold",
      letterSpacing: 4,
      ...baseTextStyle,
    },
  },
  // 3. 顶部装饰线
  {
    componentName: "SvgDecoration",
    logicalId: "annual_header_deco",
    parentLogicalId: ROOT_ID,
    name: "顶部装饰线",
    svgSource: "custom",
    svgContent: headerDecorationSvg,
    primaryColor: "#F59E0B",
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
    logicalId: "annual_current_time",
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
      color: "#E2E8F0",
      textAlign: "right",
      ...baseTextStyle,
    },
  },
  // 5-8. 顶部 KPI 指标
  {
    componentName: "Indicator",
    logicalId: "annual_indicator_revenue",
    parentLogicalId: ROOT_ID,
    name: "营业收入",
    textValue: 128.5,
    titleName: "营业收入",
    suffix: true,
    suffixTitle: "亿元",
    decimal: 1,
    titleStyle: { ...baseTextStyle, fontSize: 14, color: "#94A3B8" },
    numberStyle: { ...baseTextStyle, fontSize: 32, color: "#2563EB", fontWeight: "bold" },
    suffixStyle: { ...baseTextStyle, fontSize: 14, color: "#94A3B8" },
    style: {
      position: "absolute",
      left: 60,
      top: 100,
      width: 320,
      height: 80,
      backgroundColor: "rgba(37,99,235,0.08)",
      border: "1px solid rgba(37,99,235,0.22)",
      borderRadius: 4,
      zIndex: 10,
    },
  },
  {
    componentName: "Indicator",
    logicalId: "annual_indicator_profit",
    parentLogicalId: ROOT_ID,
    name: "净利润",
    textValue: 18.6,
    titleName: "净利润",
    suffix: true,
    suffixTitle: "亿元",
    decimal: 1,
    titleStyle: { ...baseTextStyle, fontSize: 14, color: "#94A3B8" },
    numberStyle: { ...baseTextStyle, fontSize: 32, color: "#0EA5E9", fontWeight: "bold" },
    suffixStyle: { ...baseTextStyle, fontSize: 14, color: "#94A3B8" },
    style: {
      position: "absolute",
      left: 404,
      top: 100,
      width: 320,
      height: 80,
      backgroundColor: "rgba(37,99,235,0.08)",
      border: "1px solid rgba(37,99,235,0.22)",
      borderRadius: 4,
      zIndex: 10,
    },
  },
  {
    componentName: "Indicator",
    logicalId: "annual_indicator_assets",
    parentLogicalId: ROOT_ID,
    name: "总资产",
    textValue: 342.8,
    titleName: "总资产",
    suffix: true,
    suffixTitle: "亿元",
    decimal: 1,
    titleStyle: { ...baseTextStyle, fontSize: 14, color: "#94A3B8" },
    numberStyle: { ...baseTextStyle, fontSize: 32, color: "#F59E0B", fontWeight: "bold" },
    suffixStyle: { ...baseTextStyle, fontSize: 14, color: "#94A3B8" },
    style: {
      position: "absolute",
      left: 748,
      top: 100,
      width: 320,
      height: 80,
      backgroundColor: "rgba(37,99,235,0.08)",
      border: "1px solid rgba(37,99,235,0.22)",
      borderRadius: 4,
      zIndex: 10,
    },
  },
  {
    componentName: "Indicator",
    logicalId: "annual_indicator_roe",
    parentLogicalId: ROOT_ID,
    name: "净资产收益率",
    textValue: 15.2,
    titleName: "净资产收益率",
    suffix: true,
    suffixTitle: "%",
    decimal: 1,
    titleStyle: { ...baseTextStyle, fontSize: 14, color: "#94A3B8" },
    numberStyle: { ...baseTextStyle, fontSize: 32, color: "#10B981", fontWeight: "bold" },
    suffixStyle: { ...baseTextStyle, fontSize: 14, color: "#94A3B8" },
    style: {
      position: "absolute",
      left: 1092,
      top: 100,
      width: 320,
      height: 80,
      backgroundColor: "rgba(37,99,235,0.08)",
      border: "1px solid rgba(37,99,235,0.22)",
      borderRadius: 4,
      zIndex: 10,
    },
  },
  {
    componentName: "Indicator",
    logicalId: "annual_indicator_growth",
    parentLogicalId: ROOT_ID,
    name: "营收同比增长",
    textValue: 23.8,
    titleName: "营收同比增长",
    suffix: true,
    suffixTitle: "%",
    decimal: 1,
    titleStyle: { ...baseTextStyle, fontSize: 14, color: "#94A3B8" },
    numberStyle: { ...baseTextStyle, fontSize: 32, color: "#F59E0B", fontWeight: "bold" },
    suffixStyle: { ...baseTextStyle, fontSize: 14, color: "#94A3B8" },
    style: {
      position: "absolute",
      left: 1436,
      top: 100,
      width: 320,
      height: 80,
      backgroundColor: "rgba(37,99,235,0.08)",
      border: "1px solid rgba(37,99,235,0.22)",
      borderRadius: 4,
      zIndex: 10,
    },
  },
];

const panelPrompts = [
  {
    prompt: "公司年度营业收入月度趋势，用折线图展示，科技蓝金商务风。",
    dataItems: [
      { name: "1月", value: 8.2 },
      { name: "2月", value: 7.8 },
      { name: "3月", value: 9.5 },
      { name: "4月", value: 10.1 },
      { name: "5月", value: 11.3 },
      { name: "6月", value: 12.0 },
      { name: "7月", value: 11.8 },
      { name: "8月", value: 12.5 },
      { name: "9月", value: 13.2 },
      { name: "10月", value: 12.8 },
      { name: "11月", value: 14.5 },
      { name: "12月", value: 15.3 },
    ],
    title: "月度营收趋势",
    logicalId: "annual_panel_revenue_trend",
    parentLogicalId: ROOT_ID,
    style: {
      left: 30,
      top: 200,
      width: 600,
      height: 400,
      position: "absolute",
    },
    theme,
  },
  {
    prompt: "公司年度各业务板块收入占比，用环形图展示，科技蓝金商务风。",
    dataItems: [
      { name: "智能硬件", value: 45 },
      { name: "软件服务", value: 28 },
      { name: "平台运营", value: 18 },
      { name: "其他业务", value: 9 },
    ],
    title: "业务板块收入占比",
    logicalId: "annual_panel_business_share",
    parentLogicalId: ROOT_ID,
    style: {
      left: 660,
      top: 200,
      width: 600,
      height: 400,
      position: "absolute",
    },
    theme,
  },
  {
    prompt: "公司年度各区域销售收入分布，用柱状图展示，科技蓝金商务风。",
    dataItems: [
      { name: "华东", value: 38.5 },
      { name: "华南", value: 26.3 },
      { name: "华北", value: 18.7 },
      { name: "西南", value: 12.4 },
      { name: "其他", value: 8.1 },
    ],
    title: "区域销售分布",
    logicalId: "annual_panel_region_sales",
    parentLogicalId: ROOT_ID,
    style: {
      left: 1290,
      top: 200,
      width: 600,
      height: 400,
      position: "absolute",
    },
    theme,
  },
  {
    prompt: "公司年度季度净利润与毛利率对比，用堆叠柱状图展示，科技蓝金商务风。",
    dataItems: [
      { name: "Q1", value: 3.2 },
      { name: "Q2", value: 4.1 },
      { name: "Q3", value: 4.8 },
      { name: "Q4", value: 6.5 },
    ],
    title: "季度利润分析",
    logicalId: "annual_panel_quarter_profit",
    parentLogicalId: ROOT_ID,
    style: {
      left: 30,
      top: 620,
      width: 600,
      height: 420,
      position: "absolute",
    },
    theme,
  },
  {
    prompt: "公司年度关键财务指标雷达图，包括盈利能力、偿债能力、运营效率、成长能力、现金流，科技蓝金商务风。",
    dataItems: [
      { name: "盈利能力", value: 88 },
      { name: "偿债能力", value: 76 },
      { name: "运营效率", value: 82 },
      { name: "成长能力", value: 91 },
      { name: "现金流", value: 85 },
    ],
    title: "财务健康度雷达",
    logicalId: "annual_panel_radar",
    parentLogicalId: ROOT_ID,
    style: {
      left: 660,
      top: 620,
      width: 600,
      height: 420,
      position: "absolute",
    },
    theme,
  },
  {
    prompt: "公司年度主要产品收入排名，用横向柱状图展示，科技蓝金商务风。",
    dataItems: [
      { name: "旗舰手机", value: 42.0 },
      { name: "智能手表", value: 18.5 },
      { name: "无线耳机", value: 15.2 },
      { name: "平板电脑", value: 12.8 },
      { name: "智能家居", value: 8.6 },
    ],
    title: "产品收入排名",
    logicalId: "annual_panel_product_rank",
    parentLogicalId: ROOT_ID,
    style: {
      left: 1290,
      top: 620,
      width: 600,
      height: 420,
      position: "absolute",
    },
    theme,
  },
];

async function main() {
  const nodePath = process.execPath;
  const client = new Client({
    name: "annual-report-screen-generator",
    version: "0.1.0",
  });
  const transport = new StdioClientTransport({
    command: nodePath,
    args: ["node_modules/tsx/dist/cli.mjs", "src/server.ts"],
    cwd: join(__dirname, ".."),
  });

  await client.connect(transport);

  try {
    const listResult = await client.callTool({ name: "list_components", arguments: {} });
    const components = readToolJson(listResult) as JsonObject[];
    console.log(`已连接 screen-mcp，共 ${components.length} 个组件可用`);

    // 1. 批量生成独立组件 schema
    const componentsResult = await client.callTool({
      name: "generate_components_schemas",
      arguments: { componentsProps },
    });
    const componentSchemas = readToolJson(componentsResult) as ComponentSchema[];
    console.log(`生成独立组件 ${componentSchemas.length} 个`);

    // 2. 通过自然语言生成 ChartPanel 模块
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
      props: {
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          zIndex: 1,
        },
      },
      title: "2024 年度财报大屏",
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
    const outputPath = join(outputDir, "annual-report-screen-schema.json");
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
