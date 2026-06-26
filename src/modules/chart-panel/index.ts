import {
  componentSchemaToEditorNode,
  generateComponentsSchema,
  toSchemaId,
  uniqueSchemaId,
} from "../../core/schema.js";
import {
  groupEditorTreeChildren,
  resolveSemanticGroupingOptions,
} from "../../core/grouping.js";
import type { EditorGroupNode, JsonObject, JsonValue } from "../../types/component.js";
import type {
  ModuleDefinition,
  ModuleInput,
  ModuleSlotInput,
  ModuleStyle,
} from "../../types/module.js";
import { chartPanelCapability } from "./capability.js";

const SUPPORTED_MAIN_COMPONENTS = [
  "PieChart",
  "ThreeDPieChart",
  "LineChart",
  "BarChart",
  "RingChart",
  "StackBarChart",
  "StackLineChart",
  "BarChart25D",
  "BarProgress",
  "LiquidFill",
  "RoseChart",
  "ScatterChart",
];

const TITLE_SAFE_HEIGHT = 72;
const MAIN_CHART_TOP_OFFSET = 92;
const MAIN_CHART_CARTESIAN_TOP_OFFSET = 64;
const MAIN_CHART_PIE_TOP_OFFSET = 78;
const MAIN_CHART_SIDE_PADDING = 20;
const MAIN_CHART_BOTTOM_PADDING = 96;
const MAIN_CHART_CARTESIAN_BOTTOM_PADDING = 68;
const MAIN_CHART_PIE_BOTTOM_PADDING = 28;
const SIDE_SUMMARY_GAP = 18;
const SIDE_SUMMARY_MIN_WIDTH = 250;
const SIDE_SUMMARY_MAX_WIDTH = 330;
const SIDE_SUMMARY_HEADER_HEIGHT = 34;
const SIDE_SUMMARY_ROW_STEP = 48;
const SIDE_SUMMARY_TWO_LINE_ROW_STEP = 58;
const SIDE_SUMMARY_ROW_HEIGHT = 14;
const SIDE_SUMMARY_TWO_LINE_ROW_HEIGHT = 40;
const SIDE_SUMMARY_BOTTOM_PADDING = 12;
const BOTTOM_CONCLUSION_HEIGHT = 14;
const BOTTOM_CONCLUSION_BOTTOM_OFFSET = 70;
const BOTTOM_CONCLUSION_SIDE_GAP = 28;
const BOTTOM_CONCLUSION_STRUCTURE_GAP = 12;
const DEFAULT_MODULE_Z_INDEX = 10;
const BACKGROUND_Z_OFFSET = 0;
const MAIN_CHART_Z_OFFSET = 2;
const DECORATION_Z_OFFSET = 4;
const TITLE_BADGE_Z_OFFSET = 6;
const TEXT_Z_OFFSET = 8;
const TITLE_ENTRY_ANIMATION = "animate__fadeInLeft";
const DECORATION_ENTRY_ANIMATION = "animate__fadeInLeft";
const CHART_ENTRY_ANIMATION = "animate__zoomIn";
const TEXT_ENTRY_ANIMATION = "animate__fadeInLeft";
const PIE_BOTTOM_LEGEND_OFFSET_Y = -6;

function singleLineHeight(fontSize: number): number {
  return fontSize;
}

type PieLayoutProfile = {
  legendLineCount: number;
  legendFontSize: number;
  legendItemGap: number;
  legendItemWidth: number;
  legendItemHeight: number;
  legendOffsetY: number;
  center: [string, string];
  centerYRatio: number;
  radius: [string, string];
  labelFontSize: number;
  labelLineLength: number;
  labelLineLength2: number;
  centerValueFontSize: number;
  centerLabelFontSize: number;
};

type SideSummaryLayout = {
  sideWidth: number;
  sideLeft: number;
  sideTop: number;
  sideHeight: number;
  summaryStartTop: number;
  rowStep: number;
  rowHeight: number;
  rowCount: number;
  useTwoLineSummary: boolean;
};

function layoutMode(input: ModuleInput): "manual" | "assisted" {
  return input.layoutMode === "assisted" ? "assisted" : "manual";
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function inferIndicatorNameFromTitle(title: string): string {
  if (/销售额|销售金额|营收/.test(title)) return "销售额";
  if (/销售量|销量/.test(title)) return "销量";
  if (/客户数|客户量|用户数|用户量/.test(title)) return "客户数";
  if (/订单数|订单量/.test(title)) return "订单数";
  if (/完成量|完成额|完成值/.test(title)) return "完成量";
  if (/绩效|业绩|KPI/.test(title)) return "绩效";
  if (/投诉|告警|预警|异常/.test(title)) return "数量";
  if (/占比|构成|分布/.test(title)) return "占比";
  if (/趋势|走势|变化/.test(title)) return "数值";

  // 兜底：取标题中最后 2–4 个业务名词，或截取前 6 个字
  const cleanTitle = title.replace(/^(.*?[：:])/, "").trim();
  if (cleanTitle.length >= 2 && cleanTitle.length <= 6) {
    return cleanTitle;
  }

  return "";
}

function assertString(value: JsonValue | undefined, fieldName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`missing required module prop: ${fieldName}`);
  }

  return value;
}

function assertStyle(value: JsonValue | undefined): ModuleStyle {
  if (!isJsonObject(value)) {
    throw new Error("missing required module prop: style");
  }

  const requiredNumbers = ["left", "top", "width", "height"];
  for (const key of requiredNumbers) {
    if (typeof value[key] !== "number") {
      throw new Error(`missing required module style number: ${key}`);
    }
  }

  return {
    ...value,
    position: "absolute",
    zIndex:
      typeof value.zIndex === "number" ? value.zIndex : DEFAULT_MODULE_Z_INDEX,
  } as ModuleStyle;
}

function asSlot(value: JsonValue | undefined, slotName: string): ModuleSlotInput | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isJsonObject(value) || typeof value.componentName !== "string") {
    throw new Error(`invalid module slot: ${slotName}`);
  }

  return value as ModuleSlotInput;
}

function asSlotArray(value: JsonValue | undefined, slotName: string): ModuleSlotInput[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error(`invalid module slot array: ${slotName}`);
  }

  return value.map((item, index) => {
    if (!isJsonObject(item) || typeof item.componentName !== "string") {
      throw new Error(`invalid module slot: ${slotName}[${index}]`);
    }

    return item as ModuleSlotInput;
  });
}

function slotProps(slot: ModuleSlotInput | undefined): JsonObject {
  const props = slot?.props;
  return isJsonObject(props) ? props : {};
}

function textColor(theme: JsonObject): string {
  return typeof theme.textColor === "string" ? theme.textColor : "#DFF8FF";
}

function primaryColor(theme: JsonObject): string {
  return typeof theme.primaryColor === "string" ? theme.primaryColor : "#00E5FF";
}

function secondaryColor(theme: JsonObject): string {
  return typeof theme.secondaryColor === "string" ? theme.secondaryColor : "#7C4DFF";
}

function accentColor(theme: JsonObject): string {
  return typeof theme.accentColor === "string" ? theme.accentColor : "#FFB300";
}

function defaultPalette(theme: JsonObject): string[] {
  return [
    primaryColor(theme),
    secondaryColor(theme),
    accentColor(theme),
    "#00C853",
  ];
}

function estimateTextWidth(text: string, fontSize: number): number {
  return Array.from(text).reduce((width, char) => {
    if (/[\u4e00-\u9fff]/.test(char)) {
      return width + fontSize;
    }

    if (/\s/.test(char)) {
      return width + fontSize * 0.35;
    }

    return width + fontSize * 0.62;
  }, 0);
}

function estimateLegendLineCount(
  rows: JsonObject[] | undefined,
  chartWidth: number,
  fontSize: number,
  itemWidth: number,
  itemGap: number,
): number {
  const names =
    rows
      ?.map((row) => (typeof row.name === "string" ? row.name.trim() : ""))
      .filter(Boolean) ?? [];

  if (names.length === 0) {
    return 1;
  }

  const availableWidth = Math.max(chartWidth * 0.88 - 24, 96);
  let lineCount = 1;
  let lineWidth = 0;

  for (const name of names) {
    const itemTotalWidth =
      itemWidth + 8 + estimateTextWidth(name, fontSize) + itemGap;

    if (lineWidth > 0 && lineWidth + itemTotalWidth > availableWidth) {
      lineCount += 1;
      lineWidth = itemTotalWidth;
      continue;
    }

    lineWidth += itemTotalWidth;
  }

  return lineCount;
}

function componentNameFor(
  slot: ModuleSlotInput | undefined,
  fallback: string,
): string {
  return slot?.componentName ?? fallback;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function asFiniteNumber(value: JsonValue | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeDataRows(value: JsonValue | undefined): JsonObject[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const rows = value.flatMap((item) => {
    if (!isJsonObject(item) || typeof item.name !== "string" || item.name.trim() === "") {
      return [];
    }

    const value = asFiniteNumber(item.value);
    if (value === undefined) {
      return [];
    }

    return [
      {
        name: item.name.trim(),
        type: typeof item.type === "string" && item.type.trim() !== "" ? item.type : "系列",
        value,
      },
    ];
  });

  return rows.length > 0 ? rows : undefined;
}

function getChartDataRowsFromProps(props: JsonObject): JsonObject[] | undefined {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return undefined;
  }

  const constant = chartData.constant;
  if (!isJsonObject(constant)) {
    return undefined;
  }

  return normalizeDataRows(constant.data);
}

function getModuleDataRows(input: ModuleInput): JsonObject[] | undefined {
  const directRows = normalizeDataRows(input.dataItems);
  if (directRows) {
    return directRows;
  }

  const chartData = input.chartData;
  if (!isJsonObject(chartData)) {
    return undefined;
  }

  const constant = chartData.constant;
  if (!isJsonObject(constant)) {
    return undefined;
  }

  return normalizeDataRows(constant.data);
}

function parseDataRowFromText(text: string): JsonObject | undefined {
  const normalized = text.replace(/[\r\n]+/g, " ").trim();
  if (
    !normalized ||
    /总量|总数|合计|结论|优先级|占比|比例|说明标题|标题/.test(normalized)
  ) {
    return undefined;
  }

  const numberMatch = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!numberMatch || numberMatch.index === undefined) {
    return undefined;
  }

  const name = normalized
    .slice(0, numberMatch.index)
    .replace(/[：:，,、|｜\s]+$/g, "")
    .trim();
  const value = asFiniteNumber(numberMatch[0]);

  if (!name || value === undefined) {
    return undefined;
  }

  return {
    name,
    type: "系列",
    value,
  };
}

function deriveDataRowsFromAuxiliaryTexts(
  slots: ModuleSlotInput[],
): JsonObject[] | undefined {
  const rows: JsonObject[] = [];

  for (const slot of slots) {
    const props = slotProps(slot);
    const textContent = props.textContent;

    if (typeof textContent !== "string") {
      continue;
    }

    const row = parseDataRowFromText(textContent);
    if (row) {
      rows.push(row);
    }
  }

  return rows.length > 0 ? rows : undefined;
}

function createSlot(componentName: string, props: JsonObject = {}): ModuleSlotInput {
  return { componentName, props };
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));
}

function totalDataValue(rows: JsonObject[]): number {
  return rows.reduce((total, row) => {
    const value = asFiniteNumber(row.value);
    return value === undefined ? total : total + value;
  }, 0);
}

function formatPercent(value: number, total: number): string {
  if (total <= 0) {
    return "0%";
  }

  return `${Number(((value / total) * 100).toFixed(1))}%`;
}

function summaryRows(_input: ModuleInput, rows: JsonObject[]): JsonObject[] {
  if (rows.length <= 3) {
    return rows.slice(0, 3);
  }

  return [...rows]
    .sort((left, right) => (asFiniteNumber(right.value) ?? 0) - (asFiniteNumber(left.value) ?? 0))
    .slice(0, 3);
}

function sideSummaryWidth(input: ModuleInput): number {
  return clampNumber(
    input.style.width * 0.36,
    SIDE_SUMMARY_MIN_WIDTH,
    Math.min(SIDE_SUMMARY_MAX_WIDTH, Math.max(input.style.width - 280, SIDE_SUMMARY_MIN_WIDTH)),
  );
}

function createSideSummaryLayout(
  input: ModuleInput,
  dataRows: JsonObject[] | undefined,
  topOffset: number,
): SideSummaryLayout {
  const sideWidth = sideSummaryWidth(input);
  const sideLeft = input.style.left + input.style.width - sideWidth - 24;
  const sideTop = input.style.top + MAIN_CHART_TOP_OFFSET + topOffset;
  const rows = dataRows ? summaryRows(input, dataRows) : [];
  const useTwoLineSummary = dataRows
    ? shouldUseTwoLineSideSummary(input, dataRows, sideWidth)
    : false;
  const rowStep = useTwoLineSummary ? SIDE_SUMMARY_TWO_LINE_ROW_STEP : SIDE_SUMMARY_ROW_STEP;
  const rowHeight = useTwoLineSummary
    ? SIDE_SUMMARY_TWO_LINE_ROW_HEIGHT
    : SIDE_SUMMARY_ROW_HEIGHT;
  const sideHeight = dataRows
    ? clampNumber(
        SIDE_SUMMARY_HEADER_HEIGHT +
          Math.max(rows.length - 1, 0) * rowStep +
          rowHeight +
          SIDE_SUMMARY_BOTTOM_PADDING,
        150,
        Math.max(input.style.height - MAIN_CHART_TOP_OFFSET - 70, 170),
      )
    : 132;

  return {
    sideWidth,
    sideLeft,
    sideTop,
    sideHeight,
    summaryStartTop: sideTop + SIDE_SUMMARY_HEADER_HEIGHT,
    rowStep,
    rowHeight,
    rowCount: rows.length,
    useTwoLineSummary,
  };
}

function isMergedSideSummarySlot(
  input: ModuleInput,
  slot: ModuleSlotInput,
  rows: JsonObject[] | undefined,
): boolean {
  if (!rows || rows.length === 0 || slot.componentName !== "SingleText") {
    return false;
  }

  const props = slotProps(slot);
  const name = typeof props.name === "string" ? props.name : "";
  const textContent = typeof props.textContent === "string" ? props.textContent : "";
  const content = `${name} ${textContent}`;
  const headerText = sideSummaryHeaderText(input, rows);
  const matchedRows = summaryRows(input, rows).filter((row) => {
    const rowName = typeof row.name === "string" ? row.name : "";
    const rowValue = asFiniteNumber(row.value);

    return rowName !== "" && rowValue !== undefined && content.includes(rowName) && content.includes(formatNumber(rowValue));
  });

  return (
    /重点摘要|处置建议|侧边摘要|摘要/.test(content) &&
    content.includes(headerText) &&
    matchedRows.length >= 2
  );
}

function bottomStructureTop(input: ModuleInput): number {
  return input.style.top + input.style.height - 44;
}

function bottomConclusionTop(input: ModuleInput, sideLayout: SideSummaryLayout): number {
  const preferredTop = input.style.top + input.style.height - BOTTOM_CONCLUSION_BOTTOM_OFFSET;
  const minTop = sideLayout.sideTop + sideLayout.sideHeight + BOTTOM_CONCLUSION_SIDE_GAP;
  const maxTop =
    bottomStructureTop(input) -
    BOTTOM_CONCLUSION_HEIGHT -
    BOTTOM_CONCLUSION_STRUCTURE_GAP;

  return clampNumber(Math.max(preferredTop, minTop), input.style.top + TITLE_SAFE_HEIGHT, maxTop);
}

function mainChartDefaultStyle(
  input: ModuleInput,
  reserveSideSummary: boolean,
  isCartesianChart = false,
): JsonObject {
  const sideWidth = reserveSideSummary ? sideSummaryWidth(input) + SIDE_SUMMARY_GAP : 0;
  const topOffset = isCartesianChart
    ? MAIN_CHART_CARTESIAN_TOP_OFFSET
    : reserveSideSummary
      ? MAIN_CHART_PIE_TOP_OFFSET
      : MAIN_CHART_TOP_OFFSET;
  const bottomPadding = isCartesianChart
    ? MAIN_CHART_CARTESIAN_BOTTOM_PADDING
    : reserveSideSummary
      ? MAIN_CHART_PIE_BOTTOM_PADDING
      : MAIN_CHART_BOTTOM_PADDING;

  return {
    position: "absolute",
    left: input.style.left + MAIN_CHART_SIDE_PADDING,
    top: input.style.top + topOffset,
    width: Math.max(input.style.width - MAIN_CHART_SIDE_PADDING * 2 - sideWidth, 80),
    height: Math.max(input.style.height - topOffset - bottomPadding, 80),
    zIndex: layerZIndex(input, MAIN_CHART_Z_OFFSET),
  };
}

function createPieLayoutProfile(
  input: ModuleInput,
  rows: JsonObject[] | undefined,
  reserveSideSummary: boolean,
  chartStyleOverride?: JsonObject,
): PieLayoutProfile {
  const chartStyle =
    chartStyleOverride ?? mainChartDefaultStyle(input, reserveSideSummary, false);
  const chartWidth = asFiniteNumber(chartStyle.width) ?? input.style.width;
  const chartHeight = asFiniteNumber(chartStyle.height) ?? input.style.height;
  const dataCount = rows?.length ?? 0;
  const compactLegend = chartWidth < 300 || dataCount >= 5;
  const denseLegend = chartWidth < 240 || dataCount >= 7;
  const legendFontSize = denseLegend ? 11 : 12;
  const legendItemGap = denseLegend ? 10 : compactLegend ? 14 : 18;
  const legendItemWidth = denseLegend ? 12 : compactLegend ? 14 : 16;
  const legendItemHeight = denseLegend ? 7 : 8;
  const legendLineCount = estimateLegendLineCount(
    rows,
    chartWidth,
    legendFontSize,
    legendItemWidth,
    legendItemGap,
  );
  const wrapsLegend = legendLineCount > 1;
  const veryTightChart = chartWidth < 240 || chartHeight < 180;
  const singleLineSafeLegend = !wrapsLegend && dataCount <= 4 && chartWidth >= 300;
  const centerYRatio = wrapsLegend
    ? veryTightChart
      ? 0.36
      : 0.39
    : singleLineSafeLegend
      ? 0.44
    : reserveSideSummary
      ? 0.42
      : 0.44;
  const outerRadius = wrapsLegend
    ? veryTightChart
      ? "46%"
      : "50%"
    : singleLineSafeLegend
      ? "64%"
    : reserveSideSummary
      ? "54%"
      : "58%";
  const innerRadius = reserveSideSummary ? "34%" : "36%";

  return {
    legendLineCount,
    legendFontSize,
    legendItemGap,
    legendItemWidth,
    legendItemHeight,
    legendOffsetY: wrapsLegend ? -10 : PIE_BOTTOM_LEGEND_OFFSET_Y,
    center: ["50%", `${Math.round(centerYRatio * 100)}%`],
    centerYRatio,
    radius: [innerRadius, outerRadius],
    labelFontSize: wrapsLegend ? 10 : reserveSideSummary ? 11 : 13,
    labelLineLength: wrapsLegend ? 6 : reserveSideSummary ? 8 : 14,
    labelLineLength2: wrapsLegend ? 3 : reserveSideSummary ? 4 : 10,
    centerValueFontSize: wrapsLegend ? 24 : 28,
    centerLabelFontSize: wrapsLegend ? 12 : 13,
  };
}

function genericActionText(rows: JsonObject[], name: string): string {
  const sortedRows = [...rows].sort(
    (left, right) => (asFiniteNumber(right.value) ?? 0) - (asFiniteNumber(left.value) ?? 0),
  );
  const index = sortedRows.findIndex((row) => row.name === name);

  if (index === 0) {
    return "主要构成";
  }

  if (index === 1) {
    return "稳定支撑";
  }

  return "补充观察";
}

function summaryActionText(rows: JsonObject[], name: string): string {
  return genericActionText(rows, name);
}

function sideSummaryHeaderText(_input: ModuleInput, _rows: JsonObject[]): string {
  return "重点摘要";
}

function defaultConclusionText(input: ModuleInput, rows: JsonObject[]): string {
  const total = totalDataValue(rows);
  const firstRow = summaryRows(input, rows)[0];
  const firstName = typeof firstRow?.name === "string" ? firstRow.name : "重点项";
  const firstValue = asFiniteNumber(firstRow?.value) ?? 0;

  return `重点关注：${firstName}占比 ${formatPercent(firstValue, total)}，持续跟踪变化`;
}

function centerSummaryLabel(_input: ModuleInput, _rows: JsonObject[]): string {
  return "总数";
}

function shouldUseTwoLineSideSummary(
  input: ModuleInput,
  rows: JsonObject[],
  sideWidth: number,
): boolean {
  const textWidth = Math.max(sideWidth - 68, 156);
  return summaryRows(input, rows).some((row) => {
    const name = typeof row.name === "string" ? row.name : "分类";
    const value = asFiniteNumber(row.value) ?? 0;
    const total = totalDataValue(rows);
    const actionText = summaryActionText(rows, name);
    const singleLineText = `${name} ${formatNumber(value)}  ${formatPercent(value, total)} ${actionText}`;

    return estimateTextWidth(singleLineText, 14) > textWidth;
  });
}

function sideSummaryTextContent(
  input: ModuleInput,
  rows: JsonObject[],
  name: string,
  value: number,
  total: number,
  useTwoLine: boolean,
): string {
  const mainText = `${name} ${formatNumber(value)}  ${formatPercent(value, total)}`;
  const actionText = summaryActionText(rows, name);

  return useTwoLine ? `${mainText}\n${actionText}` : `${mainText} ${actionText}`;
}

function createDefaultAuxiliaryTextSlots(
  input: ModuleInput,
  dataRows: JsonObject[] | undefined,
  chartStyleOverride?: JsonObject,
  isThreeDPie = false,
  isCartesianChart = false,
): ModuleSlotInput[] {
  if (!dataRows || dataRows.length === 0) {
    return [];
  }

  if (isCartesianChart) {
    const theme = isJsonObject(input.theme) ? input.theme : {};
    return [
      createSlot("SingleText", {
        name: "底部结论",
        textContent: defaultConclusionText(input, dataRows),
        opacity: 0.88,
        style: {
          position: "absolute",
          left: input.style.left + 30,
          top:
            bottomStructureTop(input) -
            BOTTOM_CONCLUSION_HEIGHT -
            BOTTOM_CONCLUSION_STRUCTURE_GAP,
          width: Math.max(input.style.width - 60, 120),
          height: BOTTOM_CONCLUSION_HEIGHT,
          fontSize: 14,
          color: textColor(theme),
          textAlign: "center",
          backgroundColor: "rgba(0,0,0,0)",
          fontWeight: "normal",
          lineHeight: 1,
        },
      }),
    ];
  }

  const theme = isJsonObject(input.theme) ? input.theme : {};
  const chartStyle = chartStyleOverride ?? mainChartDefaultStyle(input, true, isCartesianChart);
  const layoutProfile = createPieLayoutProfile(input, dataRows, true, chartStyle);
  const chartLeft = asFiniteNumber(chartStyle.left) ?? input.style.left;
  const chartTop = asFiniteNumber(chartStyle.top) ?? input.style.top;
  const chartWidth = asFiniteNumber(chartStyle.width) ?? input.style.width;
  const chartHeight = asFiniteNumber(chartStyle.height) ?? input.style.height;
  const chartCenterX = chartLeft + chartWidth / 2;
  const chartCenterY = chartTop + chartHeight * layoutProfile.centerYRatio;
  const total = totalDataValue(dataRows);
  const sideLayout = createSideSummaryLayout(input, dataRows, 22);
  const palette = defaultPalette(theme);
  const rowFontSize = sideLayout.useTwoLineSummary ? 13 : 14;
  const markerWidth = Math.round(rowFontSize * 1.8);
  const sideMarkers = summaryRows(input, dataRows).map((row, index) =>
    createSlot("SvgDecoration", {
      name: `侧边摘要色标${index + 1}`,
      svgContent: `<svg viewBox="0 0 42 18" xmlns="http://www.w3.org/2000/svg"><path d="M4 9H34" fill="none" stroke="${palette[index % palette.length]}" stroke-width="2.5" stroke-linecap="round" opacity=".85"/><circle cx="8" cy="9" r="5" fill="${palette[index % palette.length]}"/><circle cx="36" cy="9" r="2.5" fill="${palette[index % palette.length]}" opacity=".55"/></svg>`,
      svgFit: "fill",
      opacity: 0.86,
      style: {
        position: "absolute",
        left: sideLayout.sideLeft + 18,
        top: sideLayout.summaryStartTop + index * sideLayout.rowStep,
        width: markerWidth,
        height: rowFontSize,
        backgroundColor: "rgba(0,0,0,0)",
      },
      glow: {
        isActive: true,
        color: `${palette[index % palette.length]}66`,
        blur: 5,
      },
    }),
  );
  const sideTexts = summaryRows(input, dataRows).map((row, index) => {
    const name = typeof row.name === "string" ? row.name : "分类";
    const value = asFiniteNumber(row.value) ?? 0;

    return createSlot("SingleText", {
      name: `侧边摘要${index + 1}`,
      textContent: sideSummaryTextContent(
        input,
        dataRows,
        name,
        value,
        total,
        sideLayout.useTwoLineSummary,
      ),
      style: {
        position: "absolute",
        left: sideLayout.sideLeft + 52,
        top: sideLayout.summaryStartTop + index * sideLayout.rowStep,
        width: Math.max(sideLayout.sideWidth - 68, 156),
        height: sideLayout.rowHeight,
        fontSize: sideLayout.useTwoLineSummary ? 13 : 14,
        color: textColor(theme),
        textAlign: "left",
        backgroundColor: "rgba(0,0,0,0)",
        fontWeight: "normal",
        lineHeight: sideLayout.useTwoLineSummary ? 1.42 : 1,
      },
    });
  });
  const sideHeader = createSlot("SingleText", {
    name: "侧边摘要标题",
    textContent: sideSummaryHeaderText(input, dataRows),
    opacity: 0.9,
    style: {
      position: "absolute",
      left: sideLayout.sideLeft + 52,
      top: sideLayout.sideTop + 2,
      width: Math.max(sideLayout.sideWidth - 68, 156),
      height: 14,
      fontSize: 14,
      color: textColor(theme),
      textAlign: "left",
      backgroundColor: "rgba(0,0,0,0)",
      fontWeight: "bold",
      lineHeight: 1,
    },
  });

  const centerTexts: ModuleSlotInput[] = isThreeDPie
    ? []
    : [
        createSlot("SingleText", {
          name: centerSummaryLabel(input, dataRows),
          textContent: formatNumber(total),
          style: {
            position: "absolute",
            left: chartCenterX - 70,
            top: chartCenterY - 26,
            width: 140,
            height: singleLineHeight(layoutProfile.centerValueFontSize),
            fontSize: layoutProfile.centerValueFontSize,
            color: "#FFFFFF",
            textAlign: "center",
            backgroundColor: "rgba(0,0,0,0)",
            fontWeight: "bold",
            lineHeight: 1,
          },
        }),
        createSlot("SingleText", {
          name: "中心指标说明",
          textContent: centerSummaryLabel(input, dataRows),
          opacity: 0.82,
          style: {
            position: "absolute",
            left: chartCenterX - 70,
            top: chartCenterY + 18,
            width: 140,
            height: singleLineHeight(layoutProfile.centerLabelFontSize),
            fontSize: layoutProfile.centerLabelFontSize,
            color: textColor(theme),
            textAlign: "center",
            backgroundColor: "rgba(0,0,0,0)",
            fontWeight: "normal",
            lineHeight: 1,
          },
        }),
      ];

  const topConclusion = createSlot("SingleText", {
    name: "顶部结论",
    textContent: defaultConclusionText(input, dataRows),
    opacity: 0.88,
    style: {
      position: "absolute",
      left: sideLayout.sideLeft + 8,
      top: sideLayout.sideTop - 22,
      width: Math.max(sideLayout.sideWidth - 16, 120),
      height: 14,
      fontSize: 12,
      color: textColor(theme),
      textAlign: "left",
      backgroundColor: "rgba(0,0,0,0)",
      fontWeight: "normal",
      lineHeight: 1,
    },
  });

  return [
    ...centerTexts,
    topConclusion,
    sideHeader,
    ...sideMarkers,
    ...sideTexts,
  ];
}

function normalizeAuxiliaryTextSlot(
  input: ModuleInput,
  slot: ModuleSlotInput,
  dataRows: JsonObject[] | undefined,
): ModuleSlotInput {
  const rows = dataRows ?? [];
  const props = slotProps(slot);
  const name = typeof props.name === "string" ? props.name : "";
  const textContent = typeof props.textContent === "string" ? props.textContent : "";

  if (!/图例/.test(`${name} ${textContent}`)) {
    return slot;
  }

  const headerText = sideSummaryHeaderText(input, rows);

  return {
    ...slot,
    props: {
      ...props,
      name: name.replace(/等级图例|风险图例|图例/g, "摘要") || "侧边摘要",
      textContent:
        textContent.trim() === ""
          ? headerText
          : textContent.replace(/等级图例|风险图例|图例/g, headerText),
    },
  };
}

function normalizeAuxiliaryTextSlots(
  input: ModuleInput,
  slots: ModuleSlotInput[],
  dataRows: JsonObject[] | undefined,
): ModuleSlotInput[] {
  const normalizedSlots = slots
    .filter((slot) => !isMergedSideSummarySlot(input, slot, dataRows))
    .map((slot) => normalizeAuxiliaryTextSlot(input, slot, dataRows));

  if (normalizedSlots.length === slots.length || !dataRows || dataRows.length === 0) {
    return normalizedSlots;
  }

  const hasSideSummary = normalizedSlots.some((slot) => {
    const props = slotProps(slot);
    return typeof props.name === "string" && /^侧边(摘要|处置建议)/.test(props.name);
  });

  return hasSideSummary
    ? normalizedSlots
    : [...normalizedSlots, ...createDefaultAuxiliaryTextSlots(input, dataRows).slice(2, -1)];
}

function isPlaceholderText(value: string): boolean {
  const text = value.trim();
  return text === "" ||
    /^(辅助信息|单行文本|默认文本|占位(?:文本|内容)?|placeholder)$/iu.test(text);
}

function hasUsableAuxiliaryText(slot: ModuleSlotInput): boolean {
  if (slot.componentName !== "SingleText") {
    return true;
  }

  const props = slotProps(slot);
  return typeof props.textContent === "string" && !isPlaceholderText(props.textContent);
}

function hasDecorationVisualSource(slot: ModuleSlotInput): boolean {
  if (slot.componentName !== "SvgDecoration") {
    return true;
  }

  const props = slotProps(slot);
  const svgContent = typeof props.svgContent === "string" ? props.svgContent.trim() : "";
  const svgPreset = typeof props.svgPreset === "string" ? props.svgPreset.trim() : "";
  return svgContent !== "" || svgPreset !== "";
}

function mergeStyle(base: JsonObject, override: JsonValue | undefined): JsonObject {
  return isJsonObject(override) ? { ...base, ...override } : base;
}

function entryAnimation(props: JsonObject, defaultType: string): JsonObject {
  const entryAnimiation = props.entryAnimiation;
  if (isJsonObject(entryAnimiation)) {
    return entryAnimiation;
  }

  return {
    isShow: true,
    type: defaultType,
  };
}

function layerZIndex(input: ModuleInput, offset: number): number {
  return input.style.zIndex + offset;
}

function isPlaceholderBase64(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === "" || trimmed === "data:image/png;base64,..." || trimmed.endsWith(",AAAA") || trimmed.endsWith(",BBBB");
}

function childLogicalId(input: ModuleInput, suffix: string): string {
  return uniqueSchemaId(input.logicalId, suffix);
}

function createBackgroundProps(input: ModuleInput, slot: ModuleSlotInput): JsonObject {
  const props = slotProps(slot);
  const imageBase64 = typeof props.imageBase64 === "string" ? props.imageBase64 : "";
  const imageSrc = typeof props.imageSrc === "string" ? props.imageSrc : "";
  const hasImageBase64 = imageBase64.trim() !== "" && !isPlaceholderBase64(imageBase64);
  const hasImageSrc = imageSrc.trim() !== "";
  const hasImageResource = hasImageBase64 || hasImageSrc;

  return {
    ...props,
    componentName: componentNameFor(slot, "SingleImage"),
    logicalId: childLogicalId(input, "background"),
    parentLogicalId: input.logicalId,
    name: typeof props.name === "string" ? props.name : "模块背景",
    imageUseMode: hasImageBase64 ? "base64" : "upload",
    imageSrc,
    imageBase64: hasImageBase64 ? imageBase64 : "",
    imageShowType: typeof props.imageShowType === "string" ? props.imageShowType : "noRepeat",
    opacity: typeof props.opacity === "number" ? props.opacity : hasImageResource ? 0.95 : 1,
    style: mergeStyle(
      {
        position: "absolute",
        left: input.style.left,
        top: input.style.top,
        width: input.style.width,
        height: input.style.height,
        backgroundColor: "rgba(0,0,0,0)",
        borderStyle: "solid",
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "rgba(0,0,0,0)",
        zIndex: layerZIndex(input, BACKGROUND_Z_OFFSET),
      },
      props.style,
    ),
    svgSource: typeof props.svgSource === "string" ? props.svgSource : "",
    svgContent: typeof props.svgContent === "string" ? props.svgContent : "",
  };
}

function createTitleProps(input: ModuleInput, slot: ModuleSlotInput | undefined): JsonObject {
  const props = slotProps(slot);
  const theme = isJsonObject(input.theme) ? input.theme : {};
  const textContent =
    typeof props.textContent === "string"
      ? props.textContent
      : typeof input.title === "string"
        ? input.title
        : "图表标题";

  return {
    ...props,
    componentName: componentNameFor(slot, "SingleText"),
    logicalId: childLogicalId(input, "title"),
    parentLogicalId: input.logicalId,
    name: typeof props.name === "string" ? props.name : "模块标题",
    textContent,
    entryAnimiation: entryAnimation(props, TITLE_ENTRY_ANIMATION),
    style: mergeStyle(
      {
        position: "absolute",
        left: input.style.left + 24,
        top: input.style.top + 18,
        width: Math.max(input.style.width - 48, 40),
        height: 22,
        fontSize: 22,
        color: textColor(theme),
        textAlign: "left",
        backgroundColor: "rgba(0,0,0,0)",
        fontWeight: "bold",
        fontStyle: "normal",
        letterSpacing: 2,
        lineHeight: 1,
        zIndex: layerZIndex(input, TEXT_Z_OFFSET),
      },
      props.style,
    ),
  };
}

function lightweightChartLabel(
  inputLabel: JsonObject,
  reserveSideSummary: boolean,
  theme: JsonObject,
  layoutProfile: PieLayoutProfile,
): JsonObject {
  const formatter = typeof inputLabel.formatter === "string" ? inputLabel.formatter : "";
  const shouldLighten =
    reserveSideSummary &&
    (formatter === "" || /\\n|\{c\}|\{d\}/.test(formatter));

  const shouldShow =
    typeof inputLabel.show === "boolean" ? inputLabel.show : true;

  return {
    position: "outside",
    formatter: reserveSideSummary ? "{b}" : "{b}: {c}",
    fontSize: layoutProfile.labelFontSize,
    fontWeight: reserveSideSummary ? "normal" : "bold",
    color: textColor(theme),
    ...inputLabel,
    ...(shouldLighten
      ? {
          formatter: "{b}",
          fontSize: layoutProfile.labelFontSize,
          fontWeight: "normal",
        }
      : {}),
    show: shouldShow,
  };
}

function lightweightChartLabelLine(
  inputLabelLine: JsonObject,
  layoutProfile: PieLayoutProfile,
): JsonObject {
  return {
    show: true,
    length: layoutProfile.labelLineLength,
    length2: layoutProfile.labelLineLength2,
    ...inputLabelLine,
  };
}

function createMainChartProps(
  input: ModuleInput,
  slot: ModuleSlotInput,
  fallbackDataRows: JsonObject[] | undefined,
  reserveSideSummary = false,
): JsonObject {
  if (!SUPPORTED_MAIN_COMPONENTS.includes(slot.componentName)) {
    throw new Error(`unsupported mainChart componentName: ${slot.componentName}`);
  }

  const isThreeDPie = slot.componentName === "ThreeDPieChart";
  const isLineChart = slot.componentName === "LineChart";
  const isBarChart = slot.componentName === "BarChart";
  const isRingChart = slot.componentName === "RingChart";
  const isStackBarChart = slot.componentName === "StackBarChart";
  const isStackLineChart = slot.componentName === "StackLineChart";
  const isBarChart25D = slot.componentName === "BarChart25D";
  const isBarProgress = slot.componentName === "BarProgress";
  const isLiquidFill = slot.componentName === "LiquidFill";
  const isRoseChart = slot.componentName === "RoseChart";
  const isScatterChart = slot.componentName === "ScatterChart";
  const isCartesianChart =
    isLineChart ||
    isBarChart ||
    isStackBarChart ||
    isStackLineChart ||
    isBarChart25D ||
    isBarProgress ||
    isScatterChart;
  const isStackChart = isStackBarChart || isStackLineChart;
  const isPieLikeChart =
    slot.componentName === "PieChart" ||
    isThreeDPie ||
    isRingChart ||
    isRoseChart;
  const props = slotProps(slot);
  const theme = isJsonObject(input.theme) ? input.theme : {};
  const defaultColors = defaultPalette(theme);
  const hasExplicitChartData = Boolean(getChartDataRowsFromProps(props));
  const layoutRows = getChartDataRowsFromProps(props) ?? fallbackDataRows;
  const defaultChartStyle = mainChartDefaultStyle(input, reserveSideSummary, isCartesianChart);
  const chartStyle = mergeStyle(defaultChartStyle, props.style);
  const chartHeight = asFiniteNumber(chartStyle.height) ?? input.style.height;
  const option = isJsonObject(props.option) ? props.option : {};
  const legend = isJsonObject(option.legend) ? option.legend : {};
  const tooltip = isJsonObject(option.tooltip) ? option.tooltip : {};

  const chartData = isJsonObject(props.chartData) ? props.chartData : {};
  const indicator = Array.isArray(chartData.indicator) ? chartData.indicator : [];
  const firstIndicator = isJsonObject(indicator[0]) ? indicator[0] : {};
  const indicatorFieldDataConfig = isJsonObject(firstIndicator.fieldDataConfig)
    ? firstIndicator.fieldDataConfig
    : {};
  const rawIndicatorDisplayName =
    typeof indicatorFieldDataConfig.chartDisplayName === "string" &&
    indicatorFieldDataConfig.chartDisplayName.trim() !== ""
      ? indicatorFieldDataConfig.chartDisplayName
      : typeof firstIndicator.fieldDisplayName === "string" &&
          firstIndicator.fieldDisplayName.trim() !== ""
        ? firstIndicator.fieldDisplayName
        : typeof firstIndicator.fieldName === "string"
          ? firstIndicator.fieldName
          : "";

  const moduleTitle = typeof input.title === "string" ? input.title.trim() : "";
  const indicatorDisplayName =
    rawIndicatorDisplayName && rawIndicatorDisplayName !== "value"
      ? rawIndicatorDisplayName
      : inferIndicatorNameFromTitle(moduleTitle) || "数值";

  const outputChartData: JsonObject = isJsonObject(props.chartData)
    ? { ...props.chartData }
    : {};
  const outputIndicator: JsonObject[] = Array.isArray(outputChartData.indicator)
    ? outputChartData.indicator.filter(isJsonObject)
    : [];
  if (outputIndicator.length === 0) {
    outputIndicator.push({});
  }
  const outputFirstIndicator: JsonObject = isJsonObject(outputIndicator[0])
    ? { ...outputIndicator[0] }
    : {};
  const outputFieldDataConfig: JsonObject = isJsonObject(outputFirstIndicator.fieldDataConfig)
    ? { ...outputFirstIndicator.fieldDataConfig }
    : {};
  outputFieldDataConfig.chartDisplayName = indicatorDisplayName;
  outputFirstIndicator.fieldDataConfig = outputFieldDataConfig;
  if (
    typeof outputFirstIndicator.fieldDisplayName !== "string" ||
    outputFirstIndicator.fieldDisplayName.trim() === "" ||
    outputFirstIndicator.fieldDisplayName === "value"
  ) {
    outputFirstIndicator.fieldDisplayName = indicatorDisplayName;
  }
  if (
    typeof outputFirstIndicator.fieldName !== "string" ||
    outputFirstIndicator.fieldName.trim() === ""
  ) {
    outputFirstIndicator.fieldName = "value";
  }
  outputIndicator[0] = outputFirstIndicator;
  outputChartData.indicator = outputIndicator;

  if (isStackChart) {
    const outputDimension: JsonObject[] = Array.isArray(outputChartData.dimension)
      ? outputChartData.dimension.filter(isJsonObject)
      : [];
    const hasName = outputDimension.some((d) => d.fieldName === "name");
    const hasType = outputDimension.some((d) => d.fieldName === "type");
    if (!hasName) {
      outputDimension.push({
        fieldDataConfig: { calculateType: "COUNT", chartDisplayName: "name" },
        fieldName: "name",
        fieldDisplayName: "name",
        fieldType: "LONGTEXT",
      });
    }
    if (!hasType) {
      outputDimension.push({
        fieldDataConfig: { calculateType: "COUNT", chartDisplayName: "type" },
        fieldName: "type",
        fieldDisplayName: "type",
        fieldType: "LONGTEXT",
      });
    }
    outputChartData.dimension = outputDimension;
  }

  if (isCartesianChart) {
    const inputXAxis = isJsonObject(option.xAxis) ? option.xAxis : {};
    const inputYAxis = isJsonObject(option.yAxis) ? option.yAxis : {};
    const inputGrid = isJsonObject(option.grid) ? option.grid : {};
    const inputSeries = Array.isArray(option.series) ? option.series : [];
    const defaultSeriesType = isScatterChart
      ? "scatter"
      : isBarChart25D
        ? "custom"
        : isLineChart || isStackLineChart
          ? "line"
          : "bar";
    const defaultStackName = isStackBarChart
      ? "__stackBar"
      : isStackLineChart
        ? "__stackLine"
        : undefined;

    const chartWidth = asFiniteNumber(chartStyle.width) ?? input.style.width;
    const dataCount = layoutRows?.length ?? 1;
    const plotWidth = Math.max(chartWidth - 30 - 40, 100);
    const idealBarWidth = Math.min(Math.max(Math.round((plotWidth / dataCount) * 0.25), 12), 24);

    const normalizedSeries = inputSeries.map((s) => {
      if (!isJsonObject(s)) {
        return s;
      }
      const inputName = typeof s.name === "string" && s.name.trim() !== "" ? s.name : indicatorDisplayName;
      const normalized: JsonObject = {
        ...s,
        name: inputName,
        type: defaultSeriesType,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      };
      if (defaultStackName) {
        normalized.stack = defaultStackName;
      }
      return normalized;
    });

    const baseBarSeries = {
      name: indicatorDisplayName,
      mapName: "",
      type: "bar",
      barWidth: idealBarWidth,
      barGap: 0,
      barCategoryGap: 0,
      itemStyle: {
        borderWidth: 0,
        borderColor: "#666666",
        borderType: "solid",
        shadowBlur: 0,
        shadowColor: "#fff",
        color: "",
        borderRadius: 0,
      },
      label: {
        show: false,
        position: "top",
        fontWeight: "bold",
        color: "#ffffff",
        fontSize: 12,
        fontStyle: "normal",
        fontFamily: "serif",
        rotate: 0,
        formatter: "{c}",
      },
    };

    const baseLineSeries = {
      symbolSize: 0,
      symbol: "emptyCircle",
      showSymbol: false,
      name: indicatorDisplayName,
      mapName: "",
      type: "line",
      itemStyle: {
        color: "",
        borderWidth: 2,
        borderColor: "#666666",
        borderType: "solid",
        shadowBlur: 0,
        shadowColor: "#fff",
      },
      label: {
        show: false,
        position: "top",
        fontWeight: "bold",
        color: "#ffffff",
        fontSize: 12,
        fontStyle: "normal",
        fontFamily: "serif",
        rotate: 0,
      },
      lineStyle: {
        width: 3,
      },
    };

    const defaultSeries = isStackBarChart
      ? [{ ...baseBarSeries, stack: "__stackBar", label: { ...baseBarSeries.label, show: true } }]
      : isStackLineChart
        ? [
            {
              ...baseLineSeries,
              stack: "__stackLine",
              showSymbol: { show: false },
              areaStyle: false,
            },
          ]
        : isLineChart
          ? [baseLineSeries]
          : isScatterChart
            ? [
                {
                  name: indicatorDisplayName,
                  type: "scatter",
                  symbolSize: 15,
                  itemStyle: {
                    opacity: 0.8,
                  },
                },
              ]
            : isBarChart25D
              ? [{ ...baseBarSeries, type: "custom", barWidth: 18 }]
              : [baseBarSeries];

    const effectiveFallbackRows =
      !hasExplicitChartData && fallbackDataRows
        ? isScatterChart
          ? fallbackDataRows.every(
              (row) =>
                isJsonObject(row) &&
                (typeof row.x === "number" || typeof row.y === "number"),
            )
            ? fallbackDataRows
            : undefined
          : fallbackDataRows
        : undefined;

    return {
      ...props,
      chartData: effectiveFallbackRows
        ? { ...outputChartData, constant: { data: effectiveFallbackRows } }
        : outputChartData,
      componentName: slot.componentName,
      logicalId: childLogicalId(input, "main_chart"),
      parentLogicalId: input.logicalId,
      name: typeof props.name === "string" ? props.name : "主图表",
      entryAnimiation: entryAnimation(props, CHART_ENTRY_ANIMATION),
      style: chartStyle,
      option: {
        backgroundColor: "transparent",
        color: defaultColors,
        ...option,
        grid: {
          left: 30,
          top: isBarProgress ? 24 : (chartHeight < 280 ? 40 : 56),
          bottom: isBarProgress ? 16 : (chartHeight < 280 ? 28 : 40),
          right: 40,
          ...inputGrid,
        },
        legend: {
          show: true,
          left: "center",
          top: "top",
          offsetX: 0,
          offsetY: 0,
          orient: "horizontal",
          icon: "emptyCircle",
          itemWidth: 18,
          itemHeight: 12,
          padding: [5, 12],
          borderRadius: 12,
          backgroundColor: "rgba(0, 229, 255, 0.055)",
          borderColor: "rgba(0, 229, 255, 0.2)",
          borderWidth: 1,
          ...legend,
          textStyle: {
            color: textColor(theme),
            fontSize: 12,
            fontWeight: "normal",
            fontStyle: "normal",
            fontFamily: "serif",
            ...(isJsonObject(legend.textStyle) ? legend.textStyle : {}),
          },
        },
        tooltip: {
          trigger: isBarChart25D || isScatterChart ? "item" : "axis",
          show: true,
          backgroundColor: "rgba(3,16,31,0.92)",
          borderColor: "rgba(0,229,255,0.35)",
          borderWidth: 1,
          ...tooltip,
          textStyle: {
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: "normal",
            fontStyle: "normal",
            fontFamily: "serif",
            ...(isJsonObject(tooltip.textStyle) ? tooltip.textStyle : {}),
          },
        },
        xAxis: {
          type: isBarProgress ? "value" : "category",
          show: true,
          name: "",
          nameLocation: "center",
          axisTick: {
            show: true,
            inside: true,
            length: 2,
            lineStyle: {
              width: 2,
              type: "dotted",
              color: "#fff",
            },
          },
          axisLine: {
            show: true,
            inside: false,
            lineStyle: {
              color: "#fff",
              width: 1,
              type: "solid",
            },
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: "#0696f9",
              width: 3,
              type: "solid",
            },
          },
          axisLabel: {
            show: true,
            inside: false,
            rotate: 0,
            color: "#e6f7ff",
            fontWeight: "normal",
            fontFamily: "serif",
            fontSize: 12,
            fontStyle: "normal",
            align: "center",
            margin: 8,
          },
          ...inputXAxis,
        },
        yAxis: {
          type: isBarProgress ? "category" : "value",
          show: true,
          name: "",
          ...(isBarProgress ? { inverse: true } : {}),
          axisTick: {
            show: false,
            inside: true,
            length: 10,
            lineStyle: {
              width: 3,
              type: "solid",
              color: "#fff",
            },
          },
          axisLine: {
            show: false,
            inside: false,
            lineStyle: {
              color: "#0696f9",
              width: 3,
              type: "solid",
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
              type: "dashed",
              color: "#878C93",
            },
          },
          axisLabel: {
            show: true,
            inside: false,
            rotate: 0,
            color: "#e6f7ff",
            fontWeight: "normal",
            fontFamily: "serif",
            fontStyle: "normal",
            align: "center",
            formatter: "{value}",
            fontSize: 14,
            margin: 8,
          },
          ...inputYAxis,
        },
        series: normalizedSeries.length > 0 ? normalizedSeries : defaultSeries,
      },
    };
  }

  const inputOption = isJsonObject(props.option) ? props.option : {};
  const inputLegend = isJsonObject(inputOption.legend) ? inputOption.legend : {};
  const legendIsRight = inputLegend.left === "right" || (inputLegend.left === "center" && inputLegend.top === "center");
  const layoutProfile = createPieLayoutProfile(
    input,
    layoutRows,
    reserveSideSummary,
    chartStyle,
  );
  const inputSeries = Array.isArray(option.series) ? option.series : [];
  const firstInputSeries = isJsonObject(inputSeries[0]) ? inputSeries[0] : {};
  const inputItemStyle = isJsonObject(firstInputSeries.itemStyle)
    ? firstInputSeries.itemStyle
    : {};
  const inputEmphasis = isJsonObject(firstInputSeries.emphasis)
    ? firstInputSeries.emphasis
    : {};
  const inputSelect = isJsonObject(firstInputSeries.select)
    ? firstInputSeries.select
    : {};
  const inputLabel = isJsonObject(firstInputSeries.label)
    ? firstInputSeries.label
    : {};
  const inputLabelLine = isJsonObject(firstInputSeries.labelLine)
    ? firstInputSeries.labelLine
    : {};

  const baseCenter = isThreeDPie
    ? (firstInputSeries.center as JsonValue | undefined) ?? ["50%", "48%"]
    : isLiquidFill
      ? (firstInputSeries.center as JsonValue | undefined) ?? ["50%", "50%"]
      : layoutProfile.center;
  const chartRadius = isThreeDPie
    ? (firstInputSeries.radius as JsonValue | undefined) ?? ["72%", "96%"]
    : isLiquidFill
      ? (firstInputSeries.radius as JsonValue | undefined) ?? "90%"
      : layoutProfile.radius;

  const chartCenter = ((): [string, string] => {
    if (!isThreeDPie || !Array.isArray(baseCenter) || baseCenter.length < 2) {
      return Array.isArray(baseCenter) && baseCenter.length >= 2
        ? [String(baseCenter[0]), String(baseCenter[1])]
        : ["50%", "48%"];
    }
    const cx = String(baseCenter[0]);
    const cy = String(baseCenter[1]);
    if (legendIsRight && cx === "50%") {
      return ["42%", cy];
    }
    return [cx, cy];
  })();

  const baseOption: JsonObject = {
    backgroundColor: "transparent",
    color: defaultColors,
    ...option,
    legend: {
      show: true,
      left: "center",
      top: "bottom",
      offsetX: 0,
      offsetY: layoutProfile.legendOffsetY,
      orient: "horizontal",
      icon: "roundRect",
      itemWidth: layoutProfile.legendItemWidth,
      itemHeight: layoutProfile.legendItemHeight,
      itemGap: layoutProfile.legendItemGap,
      padding: [5, 12],
      borderRadius: 12,
      backgroundColor: "rgba(0, 229, 255, 0.055)",
      borderColor: "rgba(0, 229, 255, 0.2)",
      borderWidth: 1,
      ...legend,
      textStyle: {
        color: textColor(theme),
        fontSize: layoutProfile.legendFontSize,
        fontWeight: "normal",
        fontStyle: "normal",
        fontFamily: "serif",
        ...(isJsonObject(legend.textStyle) ? legend.textStyle : {}),
      },
    },
    tooltip: {
      show: true,
      backgroundColor: "rgba(3,16,31,0.92)",
      borderColor: "rgba(0,229,255,0.35)",
      borderWidth: 1,
      ...tooltip,
      textStyle: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        fontFamily: "serif",
        ...(isJsonObject(tooltip.textStyle) ? tooltip.textStyle : {}),
      },
    },
    series: [
      isLiquidFill
        ? {
            ...firstInputSeries,
            name:
              typeof firstInputSeries.name === "string" && firstInputSeries.name.trim() !== ""
                ? firstInputSeries.name
                : indicatorDisplayName,
            center: chartCenter,
            radius: chartRadius,
          }
        : {
            ...firstInputSeries,
            name:
              typeof firstInputSeries.name === "string" && firstInputSeries.name.trim() !== ""
                ? firstInputSeries.name
                : indicatorDisplayName,
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            center: chartCenter,
            radius: chartRadius,
            avoidLabelOverlap: true,
            minShowLabelAngle: 4,
            selectedMode: false,
            selectOffset: 0,
            itemStyle: {
              borderWidth: 2,
              borderColor: "rgba(2, 10, 24, 0.95)",
              borderType: "solid",
              shadowBlur: 10,
              shadowColor: "rgba(0,229,255,0.28)",
              borderRadius: 0,
              ...inputItemStyle,
            },
            emphasis: {
              scale: false,
              scaleSize: 0,
              disabled: true,
              ...inputEmphasis,
            },
            select: {
              disabled: true,
              ...inputSelect,
            },
            label: isThreeDPie
              ? { show: false, ...inputLabel }
              : lightweightChartLabel(inputLabel, reserveSideSummary, theme, layoutProfile),
            labelLine: isThreeDPie
              ? { show: false, ...inputLabelLine }
              : lightweightChartLabelLine(inputLabelLine, layoutProfile),
          },
    ],
  };

  if (isThreeDPie) {
    const inputThreeD = isJsonObject(option.threeDSettings) ? option.threeDSettings : {};
    baseOption.threeDSettings = {
      depth: 18,
      topViewAngle: 63,
      animationEnabled: true,
      centerLabelVisible: true,
      liftDistance: 14,
      interactionTrigger: "hover",
      projectionType: "perspective",
      pixelRatio: 1.5,
      cameraPosition: { x: 0, y: -2, z: 220 },
      cameraRotation: { x: -4, y: 0, z: 0 },
      outerRadiusScale: 0.82,
      innerRadiusScale: 0.74,
      centerYRatio: 0.48,
      centerYOffset: 4,
      ...inputThreeD,
    };
  }

  return {
    ...props,
    chartData: !hasExplicitChartData && fallbackDataRows
      ? { ...outputChartData, constant: { data: fallbackDataRows } }
      : outputChartData,
    componentName: slot.componentName,
    logicalId: childLogicalId(input, "main_chart"),
    parentLogicalId: input.logicalId,
    name: typeof props.name === "string" ? props.name : "主图表",
    entryAnimiation: entryAnimation(props, CHART_ENTRY_ANIMATION),
    style: chartStyle,
    option: baseOption,
  };
}

function createDecorationProps(
  input: ModuleInput,
  slot: ModuleSlotInput,
  index: number,
): JsonObject {
  const props = slotProps(slot);
  const theme = isJsonObject(input.theme) ? input.theme : {};
  const svgSource =
    typeof props.svgSource === "string"
      ? props.svgSource
      : typeof props.svgPreset === "string" && props.svgPreset.trim() !== ""
        ? "preset"
        : "custom";
  const offset = 16;
  const defaultPositions = [
    {
      left: input.style.left + input.style.width - 196,
      top: input.style.top + 20,
      width: 180,
      height: 72,
    },
    {
      left: input.style.left + offset,
      top: input.style.top + input.style.height - 76,
      width: Math.max(input.style.width - offset * 2, 160),
      height: 56,
    },
    {
      left: input.style.left + input.style.width - 196,
      top: input.style.top + input.style.height - 76,
      width: 180,
      height: 56,
    },
    {
      left: input.style.left + offset,
      top: input.style.top + TITLE_SAFE_HEIGHT,
      width: 180,
      height: 72,
    },
  ];
  const position = defaultPositions[index % defaultPositions.length];

  return {
    ...props,
    componentName: slot.componentName,
    logicalId: childLogicalId(input, `decoration_${index + 1}`),
    parentLogicalId: input.logicalId,
    name: typeof props.name === "string" ? props.name : `模块装饰${index + 1}`,
    entryAnimiation: entryAnimation(props, DECORATION_ENTRY_ANIMATION),
    style: mergeStyle(
      {
        position: "absolute",
        ...position,
        backgroundColor: "rgba(0,0,0,0)",
        zIndex: layerZIndex(input, DECORATION_Z_OFFSET),
      },
      props.style,
    ),
    svgSource,
    svgPreset: typeof props.svgPreset === "string" ? props.svgPreset : "",
    svgContent:
      typeof props.svgContent === "string" && props.svgContent.trim() !== ""
        ? props.svgContent
        : "",
    svgFit: typeof props.svgFit === "string" ? props.svgFit : "contain",
    primaryColor:
      typeof props.primaryColor === "string" ? props.primaryColor : primaryColor(theme),
  };
}

function createAuxiliaryTextProps(
  input: ModuleInput,
  slot: ModuleSlotInput,
  index: number,
): JsonObject {
  const props = slotProps(slot);
  const theme = isJsonObject(input.theme) ? input.theme : {};

  return {
    ...props,
    componentName: componentNameFor(slot, "SingleText"),
    logicalId: childLogicalId(input, `aux_text_${index + 1}`),
    parentLogicalId: input.logicalId,
    name: typeof props.name === "string" ? props.name : `辅助文本${index + 1}`,
    textContent:
      typeof props.textContent === "string" ? props.textContent : "辅助信息",
    entryAnimiation: entryAnimation(props, TEXT_ENTRY_ANIMATION),
    style: mergeStyle(
      {
        position: "absolute",
        left: input.style.left + 24,
        top: input.style.top + input.style.height - 48 - index * 34,
        width: Math.max(input.style.width - 48, 40),
        height: 14,
        fontSize: 14,
        color: textColor(theme),
        textAlign: "center",
        backgroundColor: "rgba(0,0,0,0)",
        fontWeight: "normal",
        fontStyle: "normal",
        letterSpacing: 0,
        lineHeight: 1,
        zIndex: layerZIndex(input, TEXT_Z_OFFSET),
      },
      props.style,
    ),
  };
}

function normalizeModuleInput(rawInput: ModuleInput): ModuleInput {
  const moduleName = assertString(rawInput.moduleName, "moduleName");
  if (moduleName !== "ChartPanel") {
    throw new Error(`unknown moduleName: ${moduleName}`);
  }

  return {
    ...rawInput,
    moduleName,
    logicalId: uniqueSchemaId(assertString(rawInput.logicalId, "logicalId")),
    parentLogicalId: assertString(rawInput.parentLogicalId, "parentLogicalId"),
    style: assertStyle(rawInput.style),
  };
}

function generateChartPanelSchemasForInput(input: ModuleInput) {
  const slots = input.slots;
  if (!isJsonObject(slots)) {
    throw new Error("missing required module prop: slots");
  }

  const backgroundSlot = asSlot(slots.background, "background");
  const titleSlot = asSlot(slots.title, "title");
  const mainChartSlot = asSlot(slots.mainChart, "mainChart");
  const decorationSlots = asSlotArray(slots.decorations, "decorations")
    .filter(hasDecorationVisualSource);
  const auxiliaryTextSlots = asSlotArray(slots.auxiliaryTexts, "auxiliaryTexts")
    .filter(hasUsableAuxiliaryText);

  if (!mainChartSlot) {
    throw new Error("missing required module slot: mainChart");
  }

  const isAssistedLayout = layoutMode(input) === "assisted";
  if (!isAssistedLayout && auxiliaryTextSlots.length === 0) {
    throw new Error(
      "manual ChartPanel must include slots.auxiliaryTexts with at least one real SingleText insight, side summary, center metric, or conclusion",
    );
  }

  const isThreeDPie = mainChartSlot.componentName === "ThreeDPieChart";
  const isLineChart = mainChartSlot.componentName === "LineChart";
  const isBarChart = mainChartSlot.componentName === "BarChart";
  const isStackBarChart = mainChartSlot.componentName === "StackBarChart";
  const isStackLineChart = mainChartSlot.componentName === "StackLineChart";
  const isBarChart25D = mainChartSlot.componentName === "BarChart25D";
  const isBarProgress = mainChartSlot.componentName === "BarProgress";
  const isLiquidFill = mainChartSlot.componentName === "LiquidFill";
  const isRoseChart = mainChartSlot.componentName === "RoseChart";
  const isScatterChart = mainChartSlot.componentName === "ScatterChart";
  const isCartesianChart =
    isLineChart ||
    isBarChart ||
    isStackBarChart ||
    isStackLineChart ||
    isBarChart25D ||
    isBarProgress ||
    isScatterChart;
  const fallbackDataRows =
    getModuleDataRows(input) ??
    getChartDataRowsFromProps(slotProps(mainChartSlot)) ??
    deriveDataRowsFromAuxiliaryTexts(auxiliaryTextSlots);
  const reserveDefaultSideSummary =
    isAssistedLayout &&
    !isCartesianChart &&
    !isLiquidFill &&
    auxiliaryTextSlots.length === 0 &&
    Boolean(fallbackDataRows);
  const mainChartProps = createMainChartProps(
    input,
    mainChartSlot,
    fallbackDataRows,
    reserveDefaultSideSummary,
  );
  const mainChartStyle = isJsonObject(mainChartProps.style) ? mainChartProps.style : undefined;
  const effectiveBackgroundSlot = backgroundSlot;
  const effectiveDecorationSlots = decorationSlots;
  const effectiveAuxiliaryTextSlots =
    auxiliaryTextSlots.length > 0
      ? isAssistedLayout
        ? normalizeAuxiliaryTextSlots(input, auxiliaryTextSlots, fallbackDataRows)
        : auxiliaryTextSlots
      : isAssistedLayout
        ? createDefaultAuxiliaryTextSlots(
          input,
          fallbackDataRows,
          mainChartStyle,
          isThreeDPie,
          isCartesianChart || isLiquidFill,
        )
        : [];

  const componentProps: JsonObject[] = [];

  if (titleSlot || typeof input.title === "string") {
    componentProps.push(createTitleProps(input, titleSlot));
  }

  for (const [index, slot] of effectiveAuxiliaryTextSlots.entries()) {
    componentProps.push(createAuxiliaryTextProps(input, slot, index));
  }

  componentProps.push(mainChartProps);

  for (const [index, slot] of effectiveDecorationSlots.entries()) {
    componentProps.push(createDecorationProps(input, slot, index));
  }

  if (effectiveBackgroundSlot) {
    componentProps.push(createBackgroundProps(input, effectiveBackgroundSlot));
  }

  return componentProps.map((props, index) => ({
    ...generateComponentsSchema(props),
    indexNum: index + 1,
  }));
}

export function generateChartPanelSchemas(rawInput: ModuleInput) {
  return generateChartPanelSchemasForInput(normalizeModuleInput(rawInput));
}

export function generateChartPanelTreeSchema(rawInput: ModuleInput): EditorGroupNode {
  const input = normalizeModuleInput(rawInput);
  const flatChildren = generateChartPanelSchemasForInput(input).map(componentSchemaToEditorNode);
  const children = groupEditorTreeChildren(
    flatChildren,
    resolveSemanticGroupingOptions(input, input.logicalId),
  );

  return {
    id: input.logicalId,
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {
      style: input.style,
    },
    title:
      typeof input.title === "string" && input.title.trim() !== ""
        ? input.title
        : "图表面板",
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };
}

export const chartPanelDefinition = {
  moduleName: "ChartPanel",
  displayName: "图表面板",
  description:
    "通用图表面板模块，用 slot 编排背景、标题、主图表和装饰组件。",
  capability: chartPanelCapability,
  generateSchemas: generateChartPanelSchemas,
  generateTreeSchema: generateChartPanelTreeSchema,
} satisfies ModuleDefinition;
