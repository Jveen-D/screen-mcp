import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateChartPanelTreeSchema } from "../src/modules/chart-panel/index.js";
import {
  componentSchemaToEditorNode,
  generateComponentsSchema,
  uniqueSchemaId,
  sortEditorTreeChildren,
} from "../src/core/schema.js";
import type { EditorComponentNode, EditorGroupNode, EditorTreeNode, JsonObject } from "../src/types/component.js";
import type { ModuleInput } from "../src/types/module.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const THEME: JsonObject = {
  primaryColor: "#00E5FF",
  secondaryColor: "#1B5CFF",
  accentColor: "#00F0A0",
  textColor: "#DFF8FF",
  bgColor: "#030B1E",
};

const TECH_BACKGROUND_BASE64 =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzAyMEExOCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzA2MTkyRiIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdHRlcm4gaWQ9InAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTQwIDBIMFY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBFNUZGIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMDgiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9InVybCgjZykiLz48cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSJ1cmwoI3ApIi8+PC9zdmc+";

function svgToBase64(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function carbonPanelBackgroundSvg(width: number, height: number): string {
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#030B1E"/><stop offset="1" stop-color="#061F2A"/></linearGradient><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0v40" fill="none" stroke="#00E5FF" stroke-width="1" opacity="0.08"/></pattern><radialGradient id="glow" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#00E5FF" stop-opacity=".1"/><stop offset="1" stop-color="#00E5FF" stop-opacity="0"/></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#bg)"/><rect width="${width}" height="${height}" fill="url(#grid)"/><rect width="${width}" height="${height}" fill="url(#glow)"/><path d="M1 1H${width - 1}V${height - 1}H1Z" fill="none" stroke="#00E5FF" stroke-width="1.5" opacity="0.35"/></svg>`;
}

const SHARED_TITLE_BADGE_SVG =
  '<svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="18" width="4" height="26" fill="#00E5FF" opacity="0.9"/><circle cx="18" cy="14" r="5" fill="#00F0A0"/><path d="M32 40h120" fill="none" stroke="#00E5FF" stroke-width="2" stroke-linecap="round" opacity="0.7"/><path d="M32 46h72" fill="none" stroke="#00E5FF" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/></svg>';

const carbonBottomRuleSvg = (width: number): string =>
  `<svg viewBox="0 0 ${width} 56" xmlns="http://www.w3.org/2000/svg"><path d="M8 28h${width - 16}" fill="none" stroke="#00E5FF" stroke-width="2" stroke-linecap="round" opacity="0.6"/><circle cx="${Math.round(width * 0.3)}" cy="28" r="3" fill="#00F0A0"/><circle cx="${Math.round(width * 0.7)}" cy="28" r="3" fill="#00E5FF" opacity="0.8"/></svg>`;

const SHARED_CORNER_DECORATION_SVG =
  '<svg viewBox="0 0 180 72" xmlns="http://www.w3.org/2000/svg"><path d="M160 8h12v12" fill="none" stroke="#00E5FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 64h80" fill="none" stroke="#00E5FF" stroke-width="2" stroke-linecap="round" opacity="0.6"/><circle cx="150" cy="18" r="4" fill="#00F0A0"/></svg>';

function carbonSideCardSvg(width: number, height: number): string {
  const primary = "#00E5FF";
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><path d="M18 2H${width - 18}L${width - 2} 18V${height - 2}H18L2 ${height - 18}V18Z" fill="${primary}" fill-opacity="0.04" stroke="${primary}" stroke-width="1.5" opacity="0.65"/><path d="M2 ${height * 0.22}H16M${width - 16} ${height * 0.22}H${width - 2}M2 ${height * 0.78}H16M${width - 16} ${height * 0.78}H${width - 2}" fill="none" stroke="${primary}" stroke-width="2" opacity="0.35"/></svg>`;
}

type BoundingBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * 计算一组编辑器节点的联合包围盒。
 * 取所有节点 style.left/top/width/height 的 x/y 最小值和最大值。
 */
function computeNodesBoundingBox(
  nodes: EditorTreeNode[],
): BoundingBox | undefined {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let hasValid = false;

  for (const node of nodes) {
    if (node.isGroup) continue;
    const rawStyle = node.props?.style;
    if (!rawStyle || typeof rawStyle !== "object" || Array.isArray(rawStyle)) continue;
    const style = rawStyle as JsonObject;

    const left = Number(style.left);
    const top = Number(style.top);
    const width = Number(style.width);
    const height = Number(style.height);
    if (
      !Number.isFinite(left) ||
      !Number.isFinite(top) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height)
    ) {
      continue;
    }

    hasValid = true;
    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, left + width);
    maxY = Math.max(maxY, top + height);
  }

  if (!hasValid) return undefined;

  return {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function expandBoundingBox(
  box: BoundingBox,
  padding: number,
): BoundingBox {
  return {
    left: box.left - padding,
    top: box.top - padding,
    width: box.width + padding * 2,
    height: box.height + padding * 2,
  };
}

/**
 * 按“重点摘要”分组内真实组件的包围盒，重新调整侧边摘要背景容器。
 * 1. 找到“重点摘要”分组。
 * 2. 除“侧边摘要容器”本身外，对其余子节点求联合包围盒。
 * 3. 四边等距外扩 padding 后，作为背景容器的 left/top/width/height。
 * 4. 同步重新生成 svgContent，避免拉伸失真。
 */
function fitSideSummaryBackgrounds(
  node: EditorTreeNode,
  padding = 10,
): void {
  if (node.isGroup && node.title === "重点摘要" && node.children) {
    const containerIndex = node.children.findIndex(
      (child) =>
        !child.isGroup &&
        child.componentName === "SvgDecoration" &&
        child.title === "侧边摘要容器",
    );

    if (containerIndex >= 0) {
      const container = node.children[containerIndex] as EditorComponentNode;
      const contentNodes = node.children.filter((_, i) => i !== containerIndex);
      const contentBox = computeNodesBoundingBox(contentNodes);

      if (contentBox) {
        const bgBox = expandBoundingBox(contentBox, padding);
        // 顶部结论在分组上方，背景顶至少要比结论底部低 2px，避免边框贴住结论
        const minTop = contentBox.top - 8;
        const top = Math.max(bgBox.top, minTop);
        const width = Math.max(120, bgBox.width);
        const height = Math.max(90, bgBox.height + (top - bgBox.top));

        container.props.style = {
          ...(container.props.style as JsonObject),
          position: "absolute",
          left: bgBox.left,
          top,
          width,
          height,
          backgroundColor: "rgba(0,0,0,0)",
        };
        container.props.svgContent = carbonSideCardSvg(width, height);
      }
    }
  }

  if (node.isGroup && node.children) {
    node.children.forEach((child) => fitSideSummaryBackgrounds(child, padding));
  }
}

/**
 * 生成前的粗略占位尺寸，最终会在 tree 生成后被 fitSideSummaryBackgrounds 覆盖。
 */
function estimateSideSummaryBackgroundBox(
  sideLeft: number,
  sideTop: number,
  sideWidth: number,
  rowCount: number,
): BoundingBox {
  const rowStep = 48;
  const rowHeight = 14;
  const summaryStartTop = sideTop + 34;
  const padding = 10;

  const minX = sideLeft + 18;
  const minY = sideTop + 2;
  const maxX = sideLeft + 52 + Math.max(sideWidth - 68, 156);
  const maxY = summaryStartTop + Math.max(rowCount - 1, 0) * rowStep + rowHeight;

  return {
    left: minX - padding,
    top: minY - padding,
    width: Math.max(120, maxX - minX + padding * 2),
    height: Math.max(90, maxY - minY + padding * 2),
  };
}

function shortRandomId(): string {
  return randomBytes(4).toString("hex");
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
  const primaryColor = String(THEME.primaryColor);
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
        color: THEME.textColor,
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
      primaryColor,
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
        color: THEME.textColor,
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
        color: THEME.textColor,
        textAlign: "right",
        backgroundColor: "rgba(0,0,0,0)",
      },
      format: "YYYY-MM-DD HH:mm:ss",
    }),
  ];
}

function createIndicatorNodes(
  parentId: string,
  indicators: Array<{ name: string; value: number; suffix: string; decimal?: number }>,
): EditorTreeNode[] {
  const width = 320;
  const height = 90;
  const gap = 24;
  const totalWidth = indicators.length * width + (indicators.length - 1) * gap;
  const startLeft = (CANVAS_WIDTH - totalWidth) / 2;
  const primaryColor = String(THEME.primaryColor);

  return indicators.map((item, index) => {
    return createComponentNode("Indicator", parentId, {
      name: item.name,
      titleName: item.name,
      titleVisible: true,
      textValue: item.value,
      suffix: true,
      suffixTitle: item.suffix,
      decimal: typeof item.decimal === "number" ? item.decimal : 0,
      separation: true,
      animation: true,
      animateType: 1,
      duration: 2,
      globalConfig: {
        flexDirection: "column",
        alignItems: "center",
        space: 4,
      },
      titleStyle: {
        fontSize: 16,
        color: "rgba(223,248,255,0.85)",
        fontWeight: "normal",
        lineHeight: 1,
      },
      numberStyle: {
        fontSize: 44,
        color: primaryColor,
        fontWeight: "bold",
        letterSpacing: 1,
        lineHeight: 1,
      },
      suffixStyle: {
        fontSize: 16,
        color: "rgba(223,248,255,0.85)",
        alignSelf: "center",
      },
      isFollowSuffix: false,
      style: {
        position: "absolute",
        left: startLeft + index * (width + gap),
        top: 92,
        width,
        height,
        zIndex: 1,
        backgroundColor: `${primaryColor}0F`,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: `${primaryColor}38`,
      },
    });
  });
}

function createChartPanelModule(
  parentId: string,
  zone: { left: number; top: number; width: number; height: number },
  title: string,
  mainChartType: string,
  dataItems: JsonObject[],
  chartOption?: JsonObject,
): EditorGroupNode {
  const logicalId = uniqueSchemaId(`panel_${title}_${shortRandomId()}`, "fs");
  const mainChartSlot: JsonObject = { componentName: mainChartType };
  if (chartOption && Object.keys(chartOption).length > 0) {
    mainChartSlot.props = { option: chartOption };
  }

  const badgeWidth = Math.min(Math.max(zone.width * 0.3, 220), 300);
  const isPieLike = ["PieChart", "RingChart", "RoseChart"].includes(mainChartType);
  const sideWidth = Math.min(
    Math.max(zone.width * 0.36, 220),
    Math.min(330, Math.max(zone.width - 280, 220)),
  );
  const sideLeft = zone.left + zone.width - sideWidth - 24;
  const sideTop = zone.top + 114;
  // 侧边摘要卡高度必须按“重点摘要”分组内真实元素的联合包围盒 + padding 计算，禁止撑满模块。
  const sideRowCount = isPieLike ? Math.min(Math.max(dataItems.length, 0), 3) : 0;
  const sideBox = estimateSideSummaryBackgroundBox(
    sideLeft,
    sideTop,
    sideWidth,
    sideRowCount,
  );
  const sideCardSlot: JsonObject[] = isPieLike
    ? [
        {
          componentName: "SvgDecoration",
          props: {
            name: "侧边摘要容器",
            svgSource: "custom",
            svgContent: carbonSideCardSvg(sideBox.width, sideBox.height),
            svgFit: "fill",
            opacity: 0.5,
            primaryColor: String(THEME.primaryColor),
            style: {
              position: "absolute",
              left: sideBox.left,
              top: sideBox.top,
              width: sideBox.width,
              height: sideBox.height,
              backgroundColor: "rgba(0,0,0,0)",
            },
          },
        },
      ]
    : [];

  const input: JsonObject = {
    moduleName: "ChartPanel",
    logicalId,
    parentLogicalId: parentId,
    title,
    dataItems,
    theme: THEME,
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
          imageBase64: svgToBase64(carbonPanelBackgroundSvg(zone.width, zone.height)),
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
        ...sideCardSlot,
        {
          componentName: "SvgDecoration",
          props: {
            name: "标题承托",
            svgSource: "custom",
            svgContent: SHARED_TITLE_BADGE_SVG,
            svgFit: "fill",
            opacity: 0.72,
            primaryColor: String(THEME.primaryColor),
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
        {
          componentName: "SvgDecoration",
          props: {
            name: "底部结构线",
            svgSource: "custom",
            svgContent: carbonBottomRuleSvg(zone.width - 36),
            svgFit: "fill",
            opacity: 0.48,
            primaryColor: String(THEME.primaryColor),
            style: {
              position: "absolute",
              left: zone.left + 18,
              top: zone.top + zone.height - 28,
              width: zone.width - 36,
              height: 24,
              backgroundColor: "rgba(0,0,0,0)",
            },
          },
        },
        {
          componentName: "SvgDecoration",
          props: {
            name: "右上装饰",
            svgSource: "custom",
            svgContent: SHARED_CORNER_DECORATION_SVG,
            svgFit: "fill",
            opacity: 0.5,
            primaryColor: String(THEME.primaryColor),
            style: {
              position: "absolute",
              left: zone.left + zone.width - 196,
              top: zone.top + 20,
              width: 180,
              height: 72,
              backgroundColor: "rgba(0,0,0,0)",
            },
          },
        },
      ],
    },
  };

  const tree = generateChartPanelTreeSchema(input as unknown as ModuleInput);
  // 根据“重点摘要”分组内真实组件的包围盒，重新精确调整侧边摘要背景容器
  fitSideSummaryBackgrounds(tree, 10);
  return tree;
}

function createGaugePanel(parentId: string): EditorGroupNode {
  const zone = { left: 500, top: 710, width: 900, height: 330 };
  const primaryColor = String(THEME.primaryColor);
  const secondaryColor = String(THEME.secondaryColor);
  const accentColor = String(THEME.accentColor);
  const panelId = uniqueSchemaId(`gauge_panel_${shortRandomId()}`, "fs");

  const children: EditorTreeNode[] = [
    createComponentNode("SingleImage", panelId, {
      name: "碳中和完成度面板背景",
      style: {
        position: "absolute",
        left: zone.left,
        top: zone.top,
        width: zone.width,
        height: zone.height,
        backgroundColor: "rgba(4,16,32,0.96)",
        borderWidth: 0,
        zIndex: 9,
      },
      imageUseMode: "base64",
      imageBase64: svgToBase64(carbonPanelBackgroundSvg(zone.width, zone.height)),
      imageShowType: "noRepeat",
      opacity: 1,
    }),
    createComponentNode("SvgDecoration", panelId, {
      name: "碳中和完成度标题承托",
      style: {
        position: "absolute",
        left: zone.left + 8,
        top: zone.top + 4,
        width: Math.min(Math.max(zone.width * 0.3, 220), 300),
        height: 52,
        backgroundColor: "rgba(0,0,0,0)",
        zIndex: 10,
      },
      svgSource: "custom",
      svgContent: SHARED_TITLE_BADGE_SVG,
      svgFit: "fill",
      primaryColor,
      opacity: 0.72,
      glow: {
        isActive: true,
        color: `${primaryColor}33`,
        blur: 6,
      },
    }),
    createComponentNode("SingleText", panelId, {
      name: "碳中和完成度标题",
      textContent: "碳中和完成度",
      style: {
        position: "absolute",
        left: zone.left + 24,
        top: zone.top + 18,
        width: Math.max(zone.width - 48, 40),
        height: 22,
        fontSize: 18,
        color: THEME.textColor,
        textAlign: "left",
        fontWeight: "bold",
        backgroundColor: "rgba(0,0,0,0)",
        zIndex: 11,
      },
    }),
    createComponentNode("Gauge", panelId, {
      name: "碳中和完成度",
      value: 67,
      style: {
        position: "absolute",
        left: zone.left + 35,
        top: zone.top + 70,
        width: zone.width - 70,
        height: zone.height - 90,
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
        { startValue: 0, endValue: 0.5, color: secondaryColor },
        { startValue: 0.5, endValue: 0.8, color: primaryColor },
        { startValue: 0.8, endValue: 1, color: accentColor },
      ],
    }),
  ];

  return {
    id: panelId,
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {},
    title: "碳中和完成度",
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };
}

function createScrollListPanel(parentId: string): EditorGroupNode {
  const zone = { left: 1420, top: 710, width: 470, height: 330 };
  const primaryColor = String(THEME.primaryColor);
  const panelId = uniqueSchemaId(`scroll_panel_${shortRandomId()}`, "fs");

  const children: EditorTreeNode[] = [
    createComponentNode("SingleImage", panelId, {
      name: "重点企业排放面板背景",
      style: {
        position: "absolute",
        left: zone.left,
        top: zone.top,
        width: zone.width,
        height: zone.height,
        backgroundColor: "rgba(4,16,32,0.96)",
        borderWidth: 0,
        zIndex: 9,
      },
      imageUseMode: "base64",
      imageBase64: svgToBase64(carbonPanelBackgroundSvg(zone.width, zone.height)),
      imageShowType: "noRepeat",
      opacity: 1,
    }),
    createComponentNode("SvgDecoration", panelId, {
      name: "重点企业排放标题承托",
      style: {
        position: "absolute",
        left: zone.left + 8,
        top: zone.top + 4,
        width: Math.min(Math.max(zone.width * 0.3, 220), 300),
        height: 52,
        backgroundColor: "rgba(0,0,0,0)",
        zIndex: 10,
      },
      svgSource: "custom",
      svgContent: SHARED_TITLE_BADGE_SVG,
      svgFit: "fill",
      primaryColor,
      opacity: 0.72,
      glow: {
        isActive: true,
        color: `${primaryColor}33`,
        blur: 6,
      },
    }),
    createComponentNode("SingleText", panelId, {
      name: "重点企业排放标题",
      textContent: "重点企业碳排放TOP5",
      style: {
        position: "absolute",
        left: zone.left + 24,
        top: zone.top + 18,
        width: Math.max(zone.width - 48, 40),
        height: 22,
        fontSize: 18,
        color: THEME.textColor,
        textAlign: "left",
        fontWeight: "bold",
        backgroundColor: "rgba(0,0,0,0)",
        zIndex: 11,
      },
    }),
    createComponentNode("ScrollList", panelId, {
      name: "重点企业碳排放列表",
      title: "重点企业碳排放TOP5",
      style: {
        position: "absolute",
        left: zone.left + 20,
        top: zone.top + 70,
        width: zone.width - 40,
        height: zone.height - 90,
        zIndex: 10,
        backgroundColor: "transparent",
      },
      columns: [
        { field: "name", label: "企业" },
        { field: "emission", label: "排放量(吨)" },
        { field: "trend", label: "趋势" },
      ],
      data: [
        { name: "华能热电", emission: 12800, trend: "↓ 3.2%" },
        { name: "宝钢股份", emission: 11250, trend: "↓ 1.8%" },
        { name: "中石化炼化", emission: 9800, trend: "→ 0.0%" },
        { name: "海螺水泥", emission: 8600, trend: "↓ 2.5%" },
        { name: "玖龙纸业", emission: 7200, trend: "↓ 4.1%" },
        { name: "立邦涂料", emission: 6100, trend: "↓ 0.9%" },
      ],
      rowCount: 5,
      rowMargin: 8,
      animateProps: {
        animate: true,
        animationType: "rowScroll",
        direction: "bottom2Top",
        hoverPause: true,
        interval: 1,
        duration: 0.8,
        endBehavior: "continue",
        switchType: "flip",
      },
      rowHeader: {
        isShowHeader: true,
        headerHeight: 32,
        textOverflow: "ellipsis",
        headerAlign: "center",
        bgType: "color",
        headerBg: "#0a1a2f",
        color: "#BFEFFF",
        fontSize: 13,
        fontWeight: "bold",
        fontStyle: "normal",
        letterSpacing: 1,
      },
      customRowStyles: [
        {
          bgType: "color",
          bgColor: `${primaryColor}14`,
          borderColor: `${primaryColor}22`,
          borderWidth: 1,
          offsetX: 0,
          radius: 0,
        },
        {
          bgType: "color",
          bgColor: `${primaryColor}08`,
          borderColor: `${primaryColor}22`,
          borderWidth: 1,
          offsetX: 0,
          radius: 0,
        },
      ],
      colConfigs: [
        {
          __seriesType: "__default",
          colFieldName: "",
          widthType: "flex",
          colWidth: 1,
          colMargin: 0,
          showBorder: false,
          colAlign: "center",
          contentType: "text",
          textOverflow: "ellipsis",
          color: "#FFFFFF",
          fontSize: 12,
        },
        {
          colFieldName: "emission",
          widthType: "flex",
          colWidth: 1,
          colAlign: "right",
          contentType: "text",
          color: primaryColor,
          fontSize: 13,
          fontWeight: "bold",
        },
        {
          colFieldName: "trend",
          widthType: "flex",
          colWidth: 1,
          colAlign: "center",
          contentType: "text",
          color: THEME.accentColor,
          fontSize: 12,
        },
      ],
    }),
  ];

  return {
    id: panelId,
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {},
    title: "重点企业碳排放TOP5",
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };
}

function buildCarbonScreen(title: string, parentId: string): EditorGroupNode {
  const children: EditorTreeNode[] = [];

  children.push(...createHeaderNodes(parentId, title));
  children.push(
    ...createIndicatorNodes(parentId, [
      { name: "碳排放总量", value: 12580, suffix: "吨CO₂e" },
      { name: "同比降低", value: 8.6, suffix: "%", decimal: 1 },
      { name: "碳中和进度", value: 67, suffix: "%" },
      { name: "绿电覆盖率", value: 43, suffix: "%" },
    ]),
  );

  children.push(
    createChartPanelModule(
      parentId,
      { left: 30, top: 190, width: 450, height: 320 },
      "各行业碳排放占比",
      "RoseChart",
      [
        { name: "电力", value: 45 },
        { name: "工业", value: 30 },
        { name: "交通", value: 15 },
        { name: "建筑", value: 8 },
        { name: "其他", value: 2 },
      ],
    ),
  );

  children.push(
    createChartPanelModule(
      parentId,
      { left: 30, top: 530, width: 450, height: 510 },
      "区域碳排放TOP5",
      "BarChart",
      [
        { name: "华东", value: 3200 },
        { name: "华北", value: 2800 },
        { name: "华南", value: 2100 },
        { name: "西南", value: 1500 },
        { name: "西北", value: 900 },
      ],
      {
        yAxis: { name: "吨CO₂e" },
      },
    ),
  );

  children.push(
    createChartPanelModule(
      parentId,
      { left: 500, top: 190, width: 900, height: 500 },
      "年度碳排放趋势",
      "LineChart",
      [
        { name: "2019", value: 18500 },
        { name: "2020", value: 17200 },
        { name: "2021", value: 16800 },
        { name: "2022", value: 15500 },
        { name: "2023", value: 14800 },
        { name: "2024", value: 13500 },
        { name: "2025", value: 12800 },
        { name: "2026", value: 11500 },
      ],
      {
        yAxis: { name: "吨CO₂e" },
        series: [{ label: { show: false }, markPoint: { data: [] } }],
      },
    ),
  );

  children.push(createGaugePanel(parentId));

  children.push(
    createChartPanelModule(
      parentId,
      { left: 1420, top: 190, width: 470, height: 500 },
      "能源结构占比",
      "PieChart",
      [
        { name: "化石能源", value: 55 },
        { name: "水电", value: 18 },
        { name: "风电", value: 12 },
        { name: "光伏", value: 10 },
        { name: "核电", value: 5 },
      ],
    ),
  );

  children.push(createScrollListPanel(parentId));

  children.push(createBackgroundNode(parentId));

  const root: EditorGroupNode = {
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

  return sortEditorTreeChildren(root) as EditorGroupNode;
}

function main() {
  const title = "碳排放智慧监测大屏";
  const rootId = uniqueSchemaId("carbon_emission_screen_root", "fs");
  const screenTree = buildCarbonScreen(title, rootId);

  const outputDir = join(__dirname, "..", "dist");
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, "carbon-screen-schema.json");
  writeFileSync(outputPath, JSON.stringify(screenTree, null, 2), "utf-8");

  console.log(`大屏 schema 已保存至：${outputPath}`);
}

main();
