import { randomBytes } from "node:crypto";
import { generateChartPanelTreeSchema } from "../modules/chart-panel/index.js";
import {
  componentSchemaToEditorNode,
  generateComponentsSchema,
  uniqueSchemaId,
} from "./schema.js";
import type { EditorGroupNode, EditorTreeNode, JsonObject } from "../types/component.js";
import type { ModuleInput } from "../types/module.js";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const TECH_BACKGROUND_BASE64 =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzAyMEExOCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzA2MTkyRiIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdHRlcm4gaWQ9InAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTQwIDBIMFY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBFNUZGIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMDgiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9InVybCgjZykiLz48cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSJ1cmwoI3ApIi8+PC9zdmc+";

function svgToBase64(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function panelBackgroundSvg(width: number, height: number, primaryColor: string): string {
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#020A18"/><stop offset="1" stop-color="#061A2E"/></linearGradient><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0v48" fill="none" stroke="${primaryColor}" stroke-width="1" opacity="0.12"/></pattern><radialGradient id="glow" cx=".5" cy=".42" r=".58"><stop offset="0" stop-color="${primaryColor}" stop-opacity=".12"/><stop offset="1" stop-color="${primaryColor}" stop-opacity="0"/></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#bg)"/><rect width="${width}" height="${height}" fill="url(#grid)"/><rect width="${width}" height="${height}" fill="url(#glow)"/><path d="M1 1H${width - 1}V${height - 1}H1Z" fill="none" stroke="${primaryColor}" stroke-width="1.5" opacity="0.42"/></svg>`;
}

const TITLE_BADGE_SVG =
  '<svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg"><path d="M14 40H108l16-14h54" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".68"/><path d="M2 10V42" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".68"/><circle cx="10" cy="8" r="3.5" fill="#FFB300" opacity=".85"/><circle cx="22" cy="44" r="2.5" fill="currentColor" opacity=".72"/></svg>';

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function shortRandomId(): string {
  return randomBytes(4).toString("hex");
}

function inferTitle(prompt: string, explicitTitle?: string): string {
  if (typeof explicitTitle === "string" && explicitTitle.trim() !== "") {
    return explicitTitle.trim();
  }
  const quoted = prompt.match(/[“"]([^""]+)["”]|“([^”]+)”/);
  if (quoted) {
    const candidate = quoted[1] ?? quoted[2] ?? "";
    if (candidate.trim().length > 0 && candidate.trim().length <= 30) {
      return candidate.trim();
    }
  }
  const cleaned = prompt
    .replace(/^(调用screen-mcp[，,]?\s*)?(请|帮我|给我|生成一个|做一个|设计一个|创建)?/, "")
    .replace(/[，,。；;].*$/, "")
    .trim();
  return cleaned.length > 0 && cleaned.length <= 30 ? cleaned : "智慧运行监测大屏";
}

function inferTheme(prompt: string): JsonObject {
  if (/红色|告警|预警|风险|消防|应急/.test(prompt)) {
    return {
      primaryColor: "#FF2D4F",
      secondaryColor: "#FF8A3D",
      accentColor: "#FFD166",
      textColor: "#FFF3F3",
    };
  }
  if (/绿色|新能源|光伏|风电|储能|环保/.test(prompt)) {
    return {
      primaryColor: "#25F28A",
      secondaryColor: "#20C8FF",
      accentColor: "#FFE35A",
      textColor: "#E7FFF5",
    };
  }
  return {
    primaryColor: "#00E5FF",
    secondaryColor: "#1B5CFF",
    accentColor: "#FFB300",
    textColor: "#DFF8FF",
  };
}

function createComponentNode(
  componentName: string,
  parentId: string,
  overrides: JsonObject,
): EditorTreeNode {
  const logicalId = uniqueSchemaId(`${componentName.toLowerCase()}_${shortRandomId()}`, "fs");
  const schema = generateComponentsSchema({
    componentName,
    logicalId,
    parentLogicalId: parentId,
    ...overrides,
  });
  return componentSchemaToEditorNode(schema);
}

function createBackgroundNode(parentId: string): EditorTreeNode {
  return createComponentNode("SingleImage", parentId, {
    name: "全屏科技风背景",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: "rgba(0,0,0,0)",
      borderWidth: 0,
    },
    imageUseMode: "base64",
    imageBase64: TECH_BACKGROUND_BASE64,
    imageShowType: "noRepeat",
    opacity: 1,
  });
}

function createHeaderNodes(parentId: string, title: string): EditorTreeNode[] {
  return [
    createComponentNode("SingleText", parentId, {
      name: "主标题",
      textContent: title,
      style: {
        position: "absolute",
        left: 560,
        top: 18,
        width: 800,
        height: 44,
        fontSize: 36,
        color: "#DFF8FF",
        textAlign: "center",
        fontWeight: "bold",
        letterSpacing: 4,
        backgroundColor: "rgba(0,0,0,0)",
      },
    }),
    createComponentNode("SvgDecoration", parentId, {
      name: "顶部装饰线",
      style: {
        position: "absolute",
        left: 300,
        top: 70,
        width: 1320,
        height: 6,
        backgroundColor: "rgba(0,0,0,0)",
      },
      svgSource: "custom",
      svgContent:
        '<svg viewBox="0 0 1320 6" xmlns="http://www.w3.org/2000/svg"><path d="M0 3h1320" fill="none" stroke="currentColor" stroke-width="2" opacity=".55"/><circle cx="660" cy="3" r="3" fill="currentColor" opacity=".9"/></svg>',
      svgFit: "fill",
      primaryColor: "#00E5FF",
      opacity: 0.8,
    }),
    createComponentNode("Weather", parentId, {
      name: "天气",
      style: {
        position: "absolute",
        left: 1360,
        top: 22,
        width: 300,
        height: 34,
        fontSize: 16,
        color: "#DFF8FF",
        textAlign: "right",
        backgroundColor: "rgba(0,0,0,0)",
      },
    }),
    createComponentNode("Date", parentId, {
      name: "时间",
      style: {
        position: "absolute",
        left: 1680,
        top: 22,
        width: 220,
        height: 34,
        fontSize: 16,
        color: "#DFF8FF",
        textAlign: "right",
        backgroundColor: "rgba(0,0,0,0)",
      },
    }),
  ];
}

function createIndicatorNodes(
  parentId: string,
  indicators: Array<{ name: string; value: number; suffix?: string }>,
): EditorTreeNode[] {
  const width = 280;
  const height = 80;
  const gap = 24;
  const totalWidth = indicators.length * width + (indicators.length - 1) * gap;
  const startLeft = (CANVAS_WIDTH - totalWidth) / 2;

  return indicators.map((item, index) => {
    return createComponentNode("Indicator", parentId, {
      name: item.name,
      titleName: item.name,
      titleVisible: true,
      textValue: item.value,
      suffix: typeof item.suffix === "string" && item.suffix.trim() !== "",
      suffixTitle: item.suffix ?? "",
      decimal: 0,
      separation: true,
      animation: true,
      animateType: 1,
      duration: 2,
      globalConfig: {
        flexDirection: "column",
        alignItems: "center",
        space: 4,
      },
      style: {
        position: "absolute",
        left: startLeft + index * (width + gap),
        top: 92,
        width,
        height,
        zIndex: 1,
        backgroundColor: "rgba(0,229,255,0.06)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "rgba(0,229,255,0.22)",
      },
    });
  });
}

function createChartPanelModule(
  parentId: string,
  zone: {
    left: number;
    top: number;
    width: number;
    height: number;
  },
  title: string,
  mainChartType: string,
  dataItems: JsonObject[],
  theme: JsonObject,
  chartOption?: JsonObject,
): EditorGroupNode {
  const logicalId = uniqueSchemaId(`panel_${title}_${shortRandomId()}`, "fs");
  const mainChartSlot: JsonObject = {
    componentName: mainChartType,
  };
  if (chartOption && Object.keys(chartOption).length > 0) {
    mainChartSlot.props = {
      option: chartOption,
    };
  }

  const primaryColor =
    typeof theme.primaryColor === "string" ? theme.primaryColor : "#00E5FF";
  const badgeWidth = Math.min(Math.max(zone.width * 0.3, 220), 300);

  const input: JsonObject = {
    moduleName: "ChartPanel",
    logicalId,
    parentLogicalId: parentId,
    title,
    dataItems,
    theme,
    style: {
      position: "absolute",
      left: zone.left,
      top: zone.top,
      width: zone.width,
      height: zone.height,
      zIndex: 10,
    },
    slots: {
      mainChart: mainChartSlot,
      background: {
        componentName: "SingleImage",
        props: {
          name: "面板背景",
          imageUseMode: "base64",
          imageBase64: svgToBase64(panelBackgroundSvg(zone.width, zone.height, primaryColor)),
          imageShowType: "noRepeat",
          opacity: 0.96,
          style: {
            position: "absolute",
            left: zone.left,
            top: zone.top,
            width: zone.width,
            height: zone.height,
            backgroundColor: "rgba(0,0,0,0)",
          },
        },
      },
      decorations: [
        {
          componentName: "SvgDecoration",
          props: {
            name: "标题承托",
            svgSource: "custom",
            svgContent: TITLE_BADGE_SVG,
            svgFit: "fill",
            opacity: 0.72,
            primaryColor,
            style: {
              position: "absolute",
              left: zone.left + 8,
              top: zone.top + 4,
              width: badgeWidth,
              height: 52,
              backgroundColor: "rgba(0,0,0,0)",
            },
          },
        },
      ],
    },
  };

  return generateChartPanelTreeSchema(input as unknown as ModuleInput);
}

function buildHydroScreen(title: string, theme: JsonObject, parentId: string): EditorGroupNode {
  const children: EditorTreeNode[] = [];

  children.push(createBackgroundNode(parentId));
  children.push(...createHeaderNodes(parentId, title));
  children.push(
    ...createIndicatorNodes(parentId, [
      { name: "今日发电量", value: 129, suffix: "万kWh" },
      { name: "累计发电量", value: 2457, suffix: "万kWh" },
      { name: "当前负荷", value: 86, suffix: "MW" },
      { name: "水库水位", value: 343, suffix: "m" },
    ]),
  );

  const panels: Array<{
    zone: { left: number; top: number; width: number; height: number };
    title: string;
    chartType: string;
    dataItems: JsonObject[];
    option?: JsonObject;
  }> = [
    {
      zone: { left: 30, top: 190, width: 450, height: 500 },
      title: "近7日发电量",
      chartType: "BarChart",
      dataItems: [
        { name: "周一", value: 920 },
        { name: "周二", value: 1100 },
        { name: "周三", value: 1050 },
        { name: "周四", value: 1250 },
        { name: "周五", value: 1180 },
        { name: "周六", value: 1320 },
        { name: "周日", value: 1290 },
      ],
    },
    {
      zone: { left: 500, top: 190, width: 900, height: 500 },
      title: "水位与入库流量趋势",
      chartType: "LineChart",
      dataItems: [
        { name: "周一", value: 312 },
        { name: "周二", value: 298 },
        { name: "周三", value: 325 },
        { name: "周四", value: 340 },
        { name: "周五", value: 318 },
        { name: "周六", value: 335 },
        { name: "周日", value: 343 },
      ],
      option: {
        yAxis: { name: "m / m³/s" },
        series: [{ label: { show: false }, markPoint: { data: [] } }],
      },
    },
    {
      zone: { left: 1420, top: 190, width: 470, height: 500 },
      title: "机组运行状态",
      chartType: "PieChart",
      dataItems: [
        { name: "运行中", value: 6 },
        { name: "停机", value: 1 },
        { name: "检修", value: 1 },
      ],
    },
    {
      zone: { left: 30, top: 710, width: 450, height: 330 },
      title: "告警等级统计",
      chartType: "BarChart25D",
      dataItems: [
        { name: "紧急", value: 3 },
        { name: "重要", value: 7 },
        { name: "一般", value: 12 },
        { name: "提示", value: 24 },
      ],
    },
    {
      zone: { left: 500, top: 710, width: 900, height: 330 },
      title: "设备健康度",
      chartType: "RingChart",
      dataItems: [
        { name: "健康", value: 78 },
        { name: "亚健康", value: 15 },
        { name: "异常", value: 7 },
      ],
    },
  ];

  for (const panel of panels) {
    children.push(
      createChartPanelModule(
        parentId,
        panel.zone,
        panel.title,
        panel.chartType,
        panel.dataItems,
        theme,
        panel.option,
      ),
    );
  }

  // Gauge is not supported by ChartPanel; emulate a ChartPanel module with direct absolute-coordinate children.
  const gaugeZone = { left: 1420, top: 710, width: 470, height: 330 };
  const gaugePrimary = typeof theme.primaryColor === "string" ? theme.primaryColor : "#00E5FF";
  const gaugeSecondary = typeof theme.secondaryColor === "string" ? theme.secondaryColor : "#1B5CFF";
  const gaugeAccent = typeof theme.accentColor === "string" ? theme.accentColor : "#FFB300";

  children.push(
    createComponentNode("SingleImage", parentId, {
      name: "机组负荷率面板背景",
      style: {
        position: "absolute",
        left: gaugeZone.left,
        top: gaugeZone.top,
        width: gaugeZone.width,
        height: gaugeZone.height,
        backgroundColor: "rgba(4,16,32,0.96)",
        borderWidth: 0,
        zIndex: 9,
      },
      imageUseMode: "base64",
      imageBase64: svgToBase64(panelBackgroundSvg(gaugeZone.width, gaugeZone.height, gaugePrimary)),
      imageShowType: "noRepeat",
      opacity: 1,
    }),
    createComponentNode("SvgDecoration", parentId, {
      name: "机组负荷率标题承托",
      style: {
        position: "absolute",
        left: gaugeZone.left + 8,
        top: gaugeZone.top + 4,
        width: Math.min(Math.max(gaugeZone.width * 0.3, 220), 300),
        height: 52,
        backgroundColor: "rgba(0,0,0,0)",
        zIndex: 10,
      },
      svgSource: "custom",
      svgContent: TITLE_BADGE_SVG,
      svgFit: "fill",
      primaryColor: gaugePrimary,
      opacity: 0.72,
      glow: {
        isActive: true,
        color: `${gaugePrimary}33`,
        blur: 6,
      },
    }),
    createComponentNode("SingleText", parentId, {
      name: "机组负荷率标题",
      textContent: "机组负荷率",
      style: {
        position: "absolute",
        left: gaugeZone.left + 24,
        top: gaugeZone.top + 18,
        width: Math.max(gaugeZone.width - 48, 40),
        height: 22,
        fontSize: 18,
        color: "#DFF8FF",
        textAlign: "left",
        fontWeight: "bold",
        backgroundColor: "rgba(0,0,0,0)",
        zIndex: 11,
      },
    }),
    createComponentNode("Gauge", parentId, {
      name: "机组负荷率",
      value: 86,
      style: {
        position: "absolute",
        left: gaugeZone.left + 35,
        top: gaugeZone.top + 70,
        width: gaugeZone.width - 70,
        height: gaugeZone.height - 90,
        zIndex: 10,
      },
      dialConfig: {
        outRadius: 0.76,
        innerRadius: 0.64,
        graduationColor: "rgba(230, 247, 255, 0.5)",
        pointerColor: "rgb(230, 247, 255)",
      },
      indicatorConfig: {
        open: true,
        minValue: 0,
        maxValue: 100,
        valueFontSize: 32,
        valueColor: "#FFFFFF",
        valueOffsetY: 40,
        precision: 0,
        suffix: "%",
        suffixFontSize: 16,
        suffixColor: "#FFFFFF",
      },
      ringRangeColor: [
        { startValue: 0, endValue: 0.5, color: gaugeSecondary },
        { startValue: 0.5, endValue: 0.8, color: gaugePrimary },
        { startValue: 0.8, endValue: 1, color: gaugeAccent },
      ],
    }),
  );

  return {
    id: parentId,
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        zIndex: 1,
      },
    },
    title,
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };
}

export function generateFullScreenFromPrompt(input: JsonObject): EditorGroupNode {
  const promptValue = input.prompt;
  if (typeof promptValue !== "string" || promptValue.trim() === "") {
    throw new Error("missing required prompt");
  }

  throw new Error(
    "generate_full_screen_from_prompt is disabled for production generation because it creates template-like screens. Ask the LLM to design a complete DashboardSpec first, then call generate_dashboard_schema.",
  );
}
