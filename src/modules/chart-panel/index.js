import { componentSchemaToEditorNode, generateComponentsSchema, uniqueSchemaId, } from "../../core/schema.js";
import { chartPanelCapability } from "./capability.js";
const SUPPORTED_MAIN_COMPONENTS = ["PieChart", "ThreeDPieChart"];
const DEFAULT_DECORATION_SVG = '<svg viewBox="0 0 180 72" xmlns="http://www.w3.org/2000/svg"><path d="M8 62H92l18-18h62" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 46h76" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".5"/><path d="M118 28h46" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".42"/><circle cx="94" cy="62" r="4" fill="currentColor"/><circle cx="172" cy="44" r="4" fill="currentColor"/></svg>';
const TITLE_BADGE_SVG = '<svg viewBox="0 0 220 52" xmlns="http://www.w3.org/2000/svg"><path d="M14 40H108l16-14h54" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".68"/><path d="M2 10V42" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".68"/><circle cx="10" cy="8" r="3.5" fill="#FFB300" opacity=".85"/><circle cx="22" cy="44" r="2.5" fill="currentColor" opacity=".72"/></svg>';
const DEFAULT_BACKGROUND_SVG = '<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#061A2E"/><stop offset=".58" stop-color="#03101F"/><stop offset="1" stop-color="#020813"/></linearGradient><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0v48" fill="none" stroke="currentColor" stroke-width="1" opacity=".16"/></pattern><radialGradient id="glow" cx=".5" cy=".42" r=".58"><stop offset="0" stop-color="currentColor" stop-opacity=".12"/><stop offset=".45" stop-color="currentColor" stop-opacity=".04"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient></defs><rect width="800" height="480" fill="url(#bg)"/><rect width="800" height="480" fill="url(#grid)"/><rect width="800" height="480" fill="url(#glow)"/><path d="M1 1H799V479H1Z" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".42"/></svg>';
const DEFAULT_SIDE_CARD_SVG = '<svg viewBox="0 0 280 220" xmlns="http://www.w3.org/2000/svg"><path d="M18 2H262L278 18V202L262 218H18L2 202V18Z" fill="rgba(0,229,255,.04)"/><path d="M18 2H42M136 2H262L278 18V202L262 218H18L2 202V18L18 2" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".76"/><path d="M2 44H16M264 44H278M2 176H16M264 176H278" fill="none" stroke="currentColor" stroke-width="2" opacity=".42"/></svg>';
const DEFAULT_BOTTOM_RULE_SVG = '<svg viewBox="0 0 720 56" xmlns="http://www.w3.org/2000/svg"><path d="M8 24H270l20 14h140l20-14h262" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".72"/><path d="M86 38H244M476 38H634" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".32"/><circle cx="290" cy="38" r="3.5" fill="currentColor" opacity=".75"/><circle cx="430" cy="38" r="3.5" fill="currentColor" opacity=".75"/></svg>';
const DEFAULT_SIDE_MARKER_SVG = '<svg viewBox="0 0 42 18" xmlns="http://www.w3.org/2000/svg"><path d="M4 9H34" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".85"/><circle cx="8" cy="9" r="5" fill="currentColor"/><circle cx="36" cy="9" r="2.5" fill="currentColor" opacity=".55"/></svg>';
const DEFAULT_SIDE_LINK_SVG = '<svg viewBox="0 0 120 26" xmlns="http://www.w3.org/2000/svg"><path d="M4 13H44l12-7h28l10 7h22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".58"/><circle cx="56" cy="6" r="2.5" fill="currentColor" opacity=".7"/><circle cx="94" cy="13" r="2" fill="currentColor" opacity=".56"/></svg>';
const TITLE_SAFE_HEIGHT = 72;
const MAIN_CHART_TOP_OFFSET = 92;
const MAIN_CHART_SIDE_PADDING = 20;
const MAIN_CHART_BOTTOM_PADDING = 96;
const SIDE_SUMMARY_GAP = 18;
const SIDE_SUMMARY_MIN_WIDTH = 220;
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
function singleLineHeight(fontSize) {
    return fontSize;
}
function isJsonObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function assertString(value, fieldName) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`missing required module prop: ${fieldName}`);
    }
    return value;
}
function assertStyle(value) {
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
        zIndex: typeof value.zIndex === "number" ? value.zIndex : DEFAULT_MODULE_Z_INDEX,
    };
}
function asSlot(value, slotName) {
    if (value === undefined) {
        return undefined;
    }
    if (!isJsonObject(value) || typeof value.componentName !== "string") {
        throw new Error(`invalid module slot: ${slotName}`);
    }
    return value;
}
function asSlotArray(value, slotName) {
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
        return item;
    });
}
function slotProps(slot) {
    const props = slot?.props;
    return isJsonObject(props) ? props : {};
}
function textColor(theme) {
    return typeof theme.textColor === "string" ? theme.textColor : "#DFF8FF";
}
function primaryColor(theme) {
    return typeof theme.primaryColor === "string" ? theme.primaryColor : "#00E5FF";
}
function secondaryColor(theme) {
    return typeof theme.secondaryColor === "string" ? theme.secondaryColor : "#7C4DFF";
}
function accentColor(theme) {
    return typeof theme.accentColor === "string" ? theme.accentColor : "#FFB300";
}
function defaultPalette(theme) {
    return [
        primaryColor(theme),
        secondaryColor(theme),
        accentColor(theme),
        "#00C853",
    ];
}
function estimateTextWidth(text, fontSize) {
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
function estimateLegendLineCount(rows, chartWidth, fontSize, itemWidth, itemGap) {
    const names = rows
        ?.map((row) => (typeof row.name === "string" ? row.name.trim() : ""))
        .filter(Boolean) ?? [];
    if (names.length === 0) {
        return 1;
    }
    const availableWidth = Math.max(chartWidth * 0.88 - 24, 96);
    let lineCount = 1;
    let lineWidth = 0;
    for (const name of names) {
        const itemTotalWidth = itemWidth + 8 + estimateTextWidth(name, fontSize) + itemGap;
        if (lineWidth > 0 && lineWidth + itemTotalWidth > availableWidth) {
            lineCount += 1;
            lineWidth = itemTotalWidth;
            continue;
        }
        lineWidth += itemTotalWidth;
    }
    return lineCount;
}
function componentNameFor(slot, fallback) {
    return slot?.componentName ?? fallback;
}
function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function asFiniteNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}
function normalizeDataRows(value) {
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
function getChartDataRowsFromProps(props) {
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
function getModuleDataRows(input) {
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
function parseDataRowFromText(text) {
    const normalized = text.replace(/[\r\n]+/g, " ").trim();
    if (!normalized ||
        /总量|总数|合计|结论|优先级|占比|比例|说明标题|标题/.test(normalized)) {
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
function deriveDataRowsFromAuxiliaryTexts(slots) {
    const rows = [];
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
function createSlot(componentName, props = {}) {
    return { componentName, props };
}
function formatNumber(value) {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));
}
function totalDataValue(rows) {
    return rows.reduce((total, row) => {
        const value = asFiniteNumber(row.value);
        return value === undefined ? total : total + value;
    }, 0);
}
function formatPercent(value, total) {
    if (total <= 0) {
        return "0%";
    }
    return `${Number(((value / total) * 100).toFixed(1))}%`;
}
function isRiskLikePanel(input, rows = []) {
    const content = [
        input.logicalId,
        typeof input.title === "string" ? input.title : "",
        ...rows.map((row) => (typeof row.name === "string" ? row.name : "")),
    ].join(" ");
    return /风险|隐患|等级|处置/.test(content) && !isAlarmLikePanel(input, rows);
}
function isAlarmLikePanel(input, rows = []) {
    const content = [
        input.logicalId,
        typeof input.title === "string" ? input.title : "",
        ...rows.map((row) => (typeof row.name === "string" ? row.name : "")),
    ].join(" ");
    return /告警|预警|报警|警情/.test(content);
}
function isSourceLikePanel(input, rows = []) {
    const content = [
        input.logicalId,
        typeof input.title === "string" ? input.title : "",
        ...rows.map((row) => (typeof row.name === "string" ? row.name : "")),
    ].join(" ");
    return /客户|客源|获客|来源|引流|到访|推荐|广告|渠道/.test(content);
}
function isEnergyLikePanel(input, rows = []) {
    const content = [
        input.logicalId,
        typeof input.title === "string" ? input.title : "",
        ...rows.map((row) => (typeof row.name === "string" ? row.name : "")),
    ].join(" ");
    return /新能源|能源|能耗|发电|电力|光伏|风力|风电|储能|绿电|用能|负荷/.test(content);
}
function summaryRows(input, rows) {
    if (rows.length <= 3 || isRiskLikePanel(input, rows)) {
        return rows.slice(0, 3);
    }
    return [...rows]
        .sort((left, right) => (asFiniteNumber(right.value) ?? 0) - (asFiniteNumber(left.value) ?? 0))
        .slice(0, 3);
}
function sideSummaryWidth(input) {
    return clampNumber(input.style.width * 0.36, SIDE_SUMMARY_MIN_WIDTH, Math.min(SIDE_SUMMARY_MAX_WIDTH, Math.max(input.style.width - 280, SIDE_SUMMARY_MIN_WIDTH)));
}
function createSideSummaryLayout(input, dataRows, topOffset) {
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
        ? clampNumber(SIDE_SUMMARY_HEADER_HEIGHT +
            Math.max(rows.length - 1, 0) * rowStep +
            rowHeight +
            SIDE_SUMMARY_BOTTOM_PADDING, 150, Math.max(input.style.height - MAIN_CHART_TOP_OFFSET - 70, 170))
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
function isMergedSideSummarySlot(input, slot, rows) {
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
    return (/重点摘要|处置建议|侧边摘要|摘要/.test(content) &&
        content.includes(headerText) &&
        matchedRows.length >= 2);
}
function bottomStructureTop(input) {
    return input.style.top + input.style.height - 44;
}
function bottomConclusionTop(input, sideLayout) {
    const preferredTop = input.style.top + input.style.height - BOTTOM_CONCLUSION_BOTTOM_OFFSET;
    const minTop = sideLayout.sideTop + sideLayout.sideHeight + BOTTOM_CONCLUSION_SIDE_GAP;
    const maxTop = bottomStructureTop(input) -
        BOTTOM_CONCLUSION_HEIGHT -
        BOTTOM_CONCLUSION_STRUCTURE_GAP;
    return clampNumber(Math.max(preferredTop, minTop), input.style.top + TITLE_SAFE_HEIGHT, maxTop);
}
function mainChartDefaultStyle(input, reserveSideSummary) {
    const sideWidth = reserveSideSummary ? sideSummaryWidth(input) + SIDE_SUMMARY_GAP : 0;
    return {
        position: "absolute",
        left: input.style.left + MAIN_CHART_SIDE_PADDING,
        top: input.style.top + MAIN_CHART_TOP_OFFSET,
        width: Math.max(input.style.width - MAIN_CHART_SIDE_PADDING * 2 - sideWidth, 80),
        height: Math.max(input.style.height - MAIN_CHART_TOP_OFFSET - MAIN_CHART_BOTTOM_PADDING, 80),
        zIndex: layerZIndex(input, MAIN_CHART_Z_OFFSET),
    };
}
function createPieLayoutProfile(input, rows, reserveSideSummary, chartStyleOverride) {
    const chartStyle = chartStyleOverride ?? mainChartDefaultStyle(input, reserveSideSummary);
    const chartWidth = asFiniteNumber(chartStyle.width) ?? input.style.width;
    const chartHeight = asFiniteNumber(chartStyle.height) ?? input.style.height;
    const dataCount = rows?.length ?? 0;
    const compactLegend = chartWidth < 300 || dataCount >= 5;
    const denseLegend = chartWidth < 240 || dataCount >= 7;
    const legendFontSize = denseLegend ? 11 : 12;
    const legendItemGap = denseLegend ? 10 : compactLegend ? 14 : 18;
    const legendItemWidth = denseLegend ? 12 : compactLegend ? 14 : 16;
    const legendItemHeight = denseLegend ? 7 : 8;
    const legendLineCount = estimateLegendLineCount(rows, chartWidth, legendFontSize, legendItemWidth, legendItemGap);
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
function riskActionText(name) {
    if (/高|重大|严重|红/.test(name)) {
        return "优先处置";
    }
    if (/中|较大|橙|黄/.test(name)) {
        return "限期整改";
    }
    if (/低|一般|蓝|绿/.test(name)) {
        return "常规跟踪";
    }
    return "重点关注";
}
function alarmActionText(name) {
    if (/严重|重大|高|红/.test(name)) {
        return "优先处理";
    }
    if (/一般|普通|中|黄|橙/.test(name)) {
        return "持续跟进";
    }
    if (/提示|提醒|低|蓝|绿/.test(name)) {
        return "常规关注";
    }
    return "重点关注";
}
function sourceActionText(name) {
    if (/广告|线上|投放|搜索|信息流/.test(name)) {
        return "主要获客";
    }
    if (/推荐|老客户|口碑|转介绍/.test(name)) {
        return "口碑转化";
    }
    if (/门店|到访|自然|线下/.test(name)) {
        return "自然流量";
    }
    if (/活动|引流|展会|直播/.test(name)) {
        return "活动引流";
    }
    return "来源贡献";
}
function energyActionText(name) {
    if (/光伏|风力|风电|水电|发电/.test(name)) {
        return "主体供给";
    }
    if (/储能|电池|调峰/.test(name)) {
        return "调峰支撑";
    }
    if (/外购|绿电|购电/.test(name)) {
        return "补充供给";
    }
    if (/空调|制冷|供暖/.test(name)) {
        return "主要负荷";
    }
    if (/照明/.test(name)) {
        return "基础能耗";
    }
    if (/动力|设备|生产/.test(name)) {
        return "设备负荷";
    }
    return "结构支撑";
}
function genericActionText(rows, name) {
    const sortedRows = [...rows].sort((left, right) => (asFiniteNumber(right.value) ?? 0) - (asFiniteNumber(left.value) ?? 0));
    const index = sortedRows.findIndex((row) => row.name === name);
    if (index === 0) {
        return "主要构成";
    }
    if (index === 1) {
        return "稳定支撑";
    }
    return "补充观察";
}
function summaryActionText(input, rows, name) {
    if (isAlarmLikePanel(input, rows)) {
        return alarmActionText(name);
    }
    if (isRiskLikePanel(input, rows)) {
        return riskActionText(name);
    }
    if (isSourceLikePanel(input, rows)) {
        return sourceActionText(name);
    }
    if (isEnergyLikePanel(input, rows)) {
        return energyActionText(name);
    }
    return genericActionText(rows, name);
}
function sideSummaryHeaderText(input, rows) {
    if (isAlarmLikePanel(input, rows)) {
        return "重点摘要";
    }
    if (isRiskLikePanel(input, rows)) {
        return "处置建议";
    }
    return "重点摘要";
}
function defaultConclusionText(input, rows) {
    if (isAlarmLikePanel(input, rows)) {
        const total = totalDataValue(rows);
        const severeRow = rows.find((row) => {
            const name = typeof row.name === "string" ? row.name : "";
            return /严重|重大|高|红/.test(name);
        });
        const severeName = typeof severeRow?.name === "string" ? severeRow.name : "严重告警";
        const severeValue = asFiniteNumber(severeRow?.value) ?? 0;
        return `当前共 ${formatNumber(total)} 条告警，${severeName}占 ${formatPercent(severeValue, total)}，建议优先处理`;
    }
    if (isRiskLikePanel(input, rows)) {
        return "处置优先级：高风险项优先闭环，中风险项限期整改，低风险项常规跟踪";
    }
    const total = totalDataValue(rows);
    const sortedRows = [...rows].sort((left, right) => (asFiniteNumber(right.value) ?? 0) - (asFiniteNumber(left.value) ?? 0));
    const topRow = sortedRows[0];
    const bottomRow = sortedRows[sortedRows.length - 1];
    const topName = typeof topRow?.name === "string" ? topRow.name : "重点项";
    const bottomName = typeof bottomRow?.name === "string" ? bottomRow.name : "低占比项";
    if (isSourceLikePanel(input, rows) && rows.length > 1) {
        return `${topName}贡献最高，${bottomName}仍有提升空间`;
    }
    const firstRow = summaryRows(input, rows)[0];
    const firstName = typeof firstRow?.name === "string" ? firstRow.name : "重点项";
    const firstValue = asFiniteNumber(firstRow?.value) ?? 0;
    return `重点关注：${firstName}占比 ${formatPercent(firstValue, total)}，持续跟踪变化`;
}
function centerSummaryLabel(input, rows) {
    if (isAlarmLikePanel(input, rows)) {
        return "告警总数";
    }
    if (isRiskLikePanel(input, rows)) {
        return "风险总数";
    }
    return "总数";
}
function shouldUseTwoLineSideSummary(input, rows, sideWidth) {
    if (isAlarmLikePanel(input, rows) || sideWidth < 250) {
        return true;
    }
    const textWidth = Math.max(sideWidth - 68, 156);
    return summaryRows(input, rows).some((row) => {
        const name = typeof row.name === "string" ? row.name : "分类";
        const value = asFiniteNumber(row.value) ?? 0;
        const total = totalDataValue(rows);
        const actionText = summaryActionText(input, rows, name);
        const singleLineText = `${name} ${formatNumber(value)}  ${formatPercent(value, total)} ${actionText}`;
        return estimateTextWidth(singleLineText, 14) > textWidth;
    });
}
function sideSummaryTextContent(input, rows, name, value, total, useTwoLine) {
    const mainText = `${name} ${formatNumber(value)}  ${formatPercent(value, total)}`;
    const actionText = summaryActionText(input, rows, name);
    return useTwoLine ? `${mainText}\n${actionText}` : `${mainText} ${actionText}`;
}
function createDefaultBackgroundSlot() {
    return createSlot("SingleImage", {
        name: "模块背景",
    });
}
function themedSvgContent(svgContent, theme) {
    return svgContent
        .replaceAll("currentColor", primaryColor(theme))
        .replaceAll("#FFB300", accentColor(theme))
        .replaceAll("__SVG_SECONDARY__", secondaryColor(theme));
}
function decorationSlotName(slot) {
    const props = slotProps(slot);
    return typeof props.name === "string" ? props.name : "";
}
function ensureDefaultDecorationSlots(input, slots, dataRows, chartStyleOverride) {
    const defaults = createDefaultDecorationSlots(input, dataRows, chartStyleOverride);
    const hasSideStructure = slots.some((slot) => /侧边|信息卡|摘要|容器|卡片|分割/.test(decorationSlotName(slot)));
    const hasSideConnector = slots.some((slot) => /关联|连接/.test(decorationSlotName(slot)));
    const hasBottomStructure = slots.some((slot) => /底部|横线|结构线|承托|边界/.test(decorationSlotName(slot)));
    const missingDefaults = defaults.filter((slot) => {
        const name = decorationSlotName(slot);
        if (/侧边|摘要|容器/.test(name)) {
            return !hasSideStructure;
        }
        if (/关联|连接/.test(name)) {
            return !hasSideConnector;
        }
        if (/底部|结构线/.test(name)) {
            return !hasBottomStructure;
        }
        return true;
    });
    return [...slots, ...missingDefaults];
}
function createDefaultDecorationSlots(input, dataRows, chartStyleOverride) {
    const theme = isJsonObject(input.theme) ? input.theme : {};
    const sideLayout = createSideSummaryLayout(input, dataRows, 22);
    const chartStyle = chartStyleOverride ?? mainChartDefaultStyle(input, Boolean(dataRows));
    const chartLeft = asFiniteNumber(chartStyle.left) ?? input.style.left;
    const chartWidth = asFiniteNumber(chartStyle.width) ?? input.style.width;
    const chartLinkLeft = Math.max(chartLeft + chartWidth * 0.72, sideLayout.sideLeft - 112);
    const rowRuleHeight = dataRows
        ? Math.max((sideLayout.rowCount - 1) * sideLayout.rowStep + 8, 8)
        : 8;
    const rowRuleSvg = dataRows && sideLayout.rowCount > 1
        ? Array.from({ length: sideLayout.rowCount - 1 }, (_, index) => {
            const y = 4 + index * sideLayout.rowStep;
            return `<path d="M4 ${y}H256" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".24"/>`;
        }).join("")
        : '<path d="M4 4H256" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".2"/>';
    return [
        createSlot("SvgDecoration", {
            name: "侧边摘要容器",
            svgContent: themedSvgContent(DEFAULT_SIDE_CARD_SVG, theme),
            svgFit: "fill",
            opacity: dataRows ? 0.7 : 0.48,
            style: {
                position: "absolute",
                left: sideLayout.sideLeft,
                top: sideLayout.sideTop,
                width: sideLayout.sideWidth,
                height: sideLayout.sideHeight,
                backgroundColor: "rgba(0,0,0,0)",
            },
            glow: {
                isActive: true,
                color: "rgba(0,229,255,0.22)",
                blur: 7,
            },
        }),
        createSlot("SvgDecoration", {
            name: "侧边摘要分隔线",
            svgContent: themedSvgContent(`<svg viewBox="0 0 260 ${rowRuleHeight}" xmlns="http://www.w3.org/2000/svg">${rowRuleSvg}</svg>`, theme),
            svgFit: "fill",
            opacity: dataRows ? 0.84 : 0.38,
            style: {
                position: "absolute",
                left: sideLayout.sideLeft + 24,
                top: sideLayout.summaryStartTop +
                    sideLayout.rowHeight +
                    Math.max((sideLayout.rowStep - sideLayout.rowHeight) / 2 - 4, 0),
                width: Math.max(sideLayout.sideWidth - 48, 120),
                height: rowRuleHeight,
                backgroundColor: "rgba(0,0,0,0)",
            },
            glow: {
                isActive: true,
                color: "rgba(0,229,255,0.1)",
                blur: 3,
            },
        }),
        createSlot("SvgDecoration", {
            name: "主图侧卡关联线",
            svgContent: themedSvgContent(DEFAULT_SIDE_LINK_SVG, theme),
            svgFit: "fill",
            opacity: dataRows ? 0.54 : 0.32,
            style: {
                position: "absolute",
                left: chartLinkLeft,
                top: sideLayout.summaryStartTop + 20,
                width: Math.max(sideLayout.sideLeft - chartLinkLeft + 22, 88),
                height: 26,
                backgroundColor: "rgba(0,0,0,0)",
            },
            glow: {
                isActive: true,
                color: "rgba(0,229,255,0.12)",
                blur: 4,
            },
        }),
        createSlot("SvgDecoration", {
            name: "底部结构线",
            svgContent: themedSvgContent(DEFAULT_BOTTOM_RULE_SVG, theme),
            svgFit: "fill",
            opacity: 0.48,
            style: {
                position: "absolute",
                left: input.style.left + 18,
                top: bottomStructureTop(input),
                width: Math.max(input.style.width - 36, 160),
                height: 30,
                backgroundColor: "rgba(0,0,0,0)",
            },
            glow: {
                isActive: true,
                color: "rgba(0,229,255,0.18)",
                blur: 5,
            },
        }),
    ];
}
function createDefaultAuxiliaryTextSlots(input, dataRows, chartStyleOverride, isThreeDPie = false) {
    if (!dataRows || dataRows.length === 0) {
        return [];
    }
    const theme = isJsonObject(input.theme) ? input.theme : {};
    const chartStyle = chartStyleOverride ?? mainChartDefaultStyle(input, true);
    const layoutProfile = createPieLayoutProfile(input, dataRows, true, chartStyle);
    const chartLeft = asFiniteNumber(chartStyle.left) ?? input.style.left;
    const chartTop = asFiniteNumber(chartStyle.top) ?? input.style.top;
    const chartWidth = asFiniteNumber(chartStyle.width) ?? input.style.width;
    const chartHeight = asFiniteNumber(chartStyle.height) ?? input.style.height;
    const chartCenterX = chartLeft + chartWidth / 2;
    const chartCenterY = chartTop + chartHeight * layoutProfile.centerYRatio;
    const total = totalDataValue(dataRows);
    const sideLayout = createSideSummaryLayout(input, dataRows, 22);
    const riskLike = isRiskLikePanel(input, dataRows);
    const palette = defaultPalette(theme);
    const sideMarkers = summaryRows(input, dataRows).map((row, index) => createSlot("SvgDecoration", {
        name: `侧边摘要色标${index + 1}`,
        svgContent: themedSvgContent(DEFAULT_SIDE_MARKER_SVG, {
            ...theme,
            primaryColor: palette[index % palette.length],
        }),
        svgFit: "fill",
        opacity: 0.86,
        style: {
            position: "absolute",
            left: sideLayout.sideLeft + 18,
            top: sideLayout.summaryStartTop + 8 + index * sideLayout.rowStep,
            width: 24,
            height: 12,
            backgroundColor: "rgba(0,0,0,0)",
        },
        glow: {
            isActive: true,
            color: `${palette[index % palette.length]}66`,
            blur: 5,
        },
    }));
    const sideTexts = summaryRows(input, dataRows).map((row, index) => {
        const name = typeof row.name === "string" ? row.name : "分类";
        const value = asFiniteNumber(row.value) ?? 0;
        return createSlot("SingleText", {
            name: `侧边摘要${index + 1}`,
            textContent: sideSummaryTextContent(input, dataRows, name, value, total, sideLayout.useTwoLineSummary),
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
        name: riskLike ? "侧边处置建议标题" : "侧边摘要标题",
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
    const centerTexts = isThreeDPie
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
                name: riskLike ? `${centerSummaryLabel(input, dataRows)}说明` : "中心指标说明",
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
    return [
        ...centerTexts,
        sideHeader,
        ...sideMarkers,
        ...sideTexts,
        createSlot("SingleText", {
            name: "底部结论",
            textContent: defaultConclusionText(input, dataRows),
            opacity: 0.88,
            style: {
                position: "absolute",
                left: input.style.left + 30,
                top: bottomConclusionTop(input, sideLayout),
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
function normalizeAuxiliaryTextSlot(input, slot, dataRows) {
    const rows = dataRows ?? [];
    if (!isRiskLikePanel(input, rows)) {
        return slot;
    }
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
            name: name.replace(/等级图例|风险图例|图例/g, "摘要") || "侧边处置建议",
            textContent: textContent.trim() === ""
                ? headerText
                : textContent.replace(/等级图例|风险图例|图例/g, headerText),
        },
    };
}
function normalizeAuxiliaryTextSlots(input, slots, dataRows) {
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
function mergeStyle(base, override) {
    return isJsonObject(override) ? { ...base, ...override } : base;
}
function entryAnimation(props, defaultType) {
    const entryAnimiation = props.entryAnimiation;
    if (isJsonObject(entryAnimiation)) {
        return entryAnimiation;
    }
    return {
        isShow: true,
        type: defaultType,
    };
}
function layerZIndex(input, offset) {
    return input.style.zIndex + offset;
}
function isPlaceholderBase64(value) {
    const trimmed = value.trim();
    return trimmed === "" || trimmed === "data:image/png;base64,..." || trimmed.endsWith(",AAAA") || trimmed.endsWith(",BBBB");
}
function childLogicalId(input, suffix) {
    return uniqueSchemaId(input.logicalId, suffix);
}
function createBackgroundProps(input, slot) {
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
        style: mergeStyle({
            position: "absolute",
            left: input.style.left,
            top: input.style.top,
            width: input.style.width,
            height: input.style.height,
            backgroundColor: "rgba(4,16,32,0.96)",
            borderStyle: "solid",
            borderRadius: 0,
            borderWidth: 0,
            borderColor: "rgba(0,0,0,0)",
            zIndex: layerZIndex(input, BACKGROUND_Z_OFFSET),
        }, props.style),
        svgSource: hasImageResource ? props.svgSource : "custom",
        svgContent: hasImageResource ? props.svgContent : DEFAULT_BACKGROUND_SVG,
    };
}
function createTitleBadgeProps(input) {
    const theme = isJsonObject(input.theme) ? input.theme : {};
    return {
        componentName: "SvgDecoration",
        logicalId: childLogicalId(input, "title_badge"),
        parentLogicalId: input.logicalId,
        name: "标题背景点缀",
        style: {
            position: "absolute",
            left: input.style.left + 8,
            top: input.style.top + 4,
            width: Math.min(Math.max(input.style.width * 0.3, 220), 300),
            height: 52,
            backgroundColor: "rgba(0,0,0,0)",
            zIndex: layerZIndex(input, TITLE_BADGE_Z_OFFSET),
        },
        svgSource: "custom",
        svgContent: themedSvgContent(TITLE_BADGE_SVG, theme),
        svgFit: "fill",
        primaryColor: primaryColor(theme),
        opacity: 0.72,
        glow: {
            isActive: true,
            color: "rgba(0,229,255,0.2)",
            blur: 6,
        },
        entryAnimiation: {
            isShow: true,
            type: TITLE_ENTRY_ANIMATION,
        },
    };
}
function createTitleProps(input, slot) {
    const props = slotProps(slot);
    const theme = isJsonObject(input.theme) ? input.theme : {};
    const textContent = typeof props.textContent === "string"
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
        style: mergeStyle({
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
        }, props.style),
    };
}
function lightweightChartLabel(inputLabel, reserveSideSummary, theme, layoutProfile) {
    const formatter = typeof inputLabel.formatter === "string" ? inputLabel.formatter : "";
    const shouldLighten = reserveSideSummary &&
        (formatter === "" || /\\n|\{c\}|\{d\}/.test(formatter));
    return {
        position: "outside",
        formatter: reserveSideSummary ? "{b}" : "{b}: {c}",
        fontSize: layoutProfile.labelFontSize,
        fontWeight: reserveSideSummary ? "normal" : "bold",
        color: textColor(theme),
        show: true,
        ...inputLabel,
        ...(shouldLighten
            ? {
                formatter: "{b}",
                fontSize: layoutProfile.labelFontSize,
                fontWeight: "normal",
            }
            : {}),
        ...(reserveSideSummary ? { show: true } : {}),
    };
}
function lightweightChartLabelLine(inputLabelLine, layoutProfile) {
    return {
        show: true,
        length: layoutProfile.labelLineLength,
        length2: layoutProfile.labelLineLength2,
        ...inputLabelLine,
    };
}
function createMainChartProps(input, slot, fallbackDataRows, reserveSideSummary = false) {
    if (!SUPPORTED_MAIN_COMPONENTS.includes(slot.componentName)) {
        throw new Error(`unsupported mainChart componentName: ${slot.componentName}`);
    }
    const isThreeDPie = slot.componentName === "ThreeDPieChart";
    const props = slotProps(slot);
    const inputOption = isJsonObject(props.option) ? props.option : {};
    const inputLegend = isJsonObject(inputOption.legend) ? inputOption.legend : {};
    const legendIsRight = inputLegend.left === "right" || (inputLegend.left === "center" && inputLegend.top === "center");
    const theme = isJsonObject(input.theme) ? input.theme : {};
    const defaultColors = defaultPalette(theme);
    const hasExplicitChartData = Boolean(getChartDataRowsFromProps(props));
    const layoutRows = getChartDataRowsFromProps(props) ?? fallbackDataRows;
    const defaultChartStyle = mainChartDefaultStyle(input, reserveSideSummary);
    const chartStyle = mergeStyle(defaultChartStyle, props.style);
    const layoutProfile = createPieLayoutProfile(input, layoutRows, reserveSideSummary, chartStyle);
    const option = isJsonObject(props.option) ? props.option : {};
    const legend = isJsonObject(option.legend) ? option.legend : {};
    const tooltip = isJsonObject(option.tooltip) ? option.tooltip : {};
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
        ? firstInputSeries.center ?? ["50%", "48%"]
        : layoutProfile.center;
    const chartRadius = isThreeDPie
        ? firstInputSeries.radius ?? ["72%", "96%"]
        : layoutProfile.radius;
    const chartCenter = (() => {
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
    const baseOption = {
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
            {
                ...firstInputSeries,
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
        ...(!hasExplicitChartData && fallbackDataRows
            ? {
                chartData: {
                    constant: {
                        data: fallbackDataRows,
                    },
                },
            }
            : {}),
        componentName: slot.componentName,
        logicalId: childLogicalId(input, "main_chart"),
        parentLogicalId: input.logicalId,
        name: typeof props.name === "string" ? props.name : "主图表",
        entryAnimiation: entryAnimation(props, CHART_ENTRY_ANIMATION),
        style: chartStyle,
        option: baseOption,
    };
}
function createDecorationProps(input, slot, index) {
    const props = slotProps(slot);
    const theme = isJsonObject(input.theme) ? input.theme : {};
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
        style: mergeStyle({
            position: "absolute",
            ...position,
            backgroundColor: "rgba(0,0,0,0)",
            zIndex: layerZIndex(input, DECORATION_Z_OFFSET),
        }, props.style),
        svgSource: "custom",
        svgPreset: typeof props.svgPreset === "string" ? props.svgPreset : "",
        svgContent: typeof props.svgContent === "string" && props.svgContent.trim() !== ""
            ? props.svgContent
            : themedSvgContent(DEFAULT_DECORATION_SVG, theme),
        svgFit: typeof props.svgFit === "string" ? props.svgFit : "contain",
        primaryColor: typeof props.primaryColor === "string" ? props.primaryColor : primaryColor(theme),
    };
}
function createAuxiliaryTextProps(input, slot, index) {
    const props = slotProps(slot);
    const theme = isJsonObject(input.theme) ? input.theme : {};
    return {
        ...props,
        componentName: componentNameFor(slot, "SingleText"),
        logicalId: childLogicalId(input, `aux_text_${index + 1}`),
        parentLogicalId: input.logicalId,
        name: typeof props.name === "string" ? props.name : `辅助文本${index + 1}`,
        textContent: typeof props.textContent === "string" ? props.textContent : "辅助信息",
        entryAnimiation: entryAnimation(props, TEXT_ENTRY_ANIMATION),
        style: mergeStyle({
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
        }, props.style),
    };
}
function normalizeModuleInput(rawInput) {
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
function generateChartPanelSchemasForInput(input) {
    const slots = input.slots;
    if (!isJsonObject(slots)) {
        throw new Error("missing required module prop: slots");
    }
    const backgroundSlot = asSlot(slots.background, "background");
    const titleSlot = asSlot(slots.title, "title");
    const mainChartSlot = asSlot(slots.mainChart, "mainChart");
    const decorationSlots = asSlotArray(slots.decorations, "decorations");
    const auxiliaryTextSlots = asSlotArray(slots.auxiliaryTexts, "auxiliaryTexts");
    if (!mainChartSlot) {
        throw new Error("missing required module slot: mainChart");
    }
    const isThreeDPie = mainChartSlot.componentName === "ThreeDPieChart";
    const fallbackDataRows = getModuleDataRows(input) ??
        getChartDataRowsFromProps(slotProps(mainChartSlot)) ??
        deriveDataRowsFromAuxiliaryTexts(auxiliaryTextSlots);
    const reserveDefaultSideSummary = auxiliaryTextSlots.length === 0 && Boolean(fallbackDataRows);
    const mainChartProps = createMainChartProps(input, mainChartSlot, fallbackDataRows, reserveDefaultSideSummary);
    const mainChartStyle = isJsonObject(mainChartProps.style) ? mainChartProps.style : undefined;
    const effectiveBackgroundSlot = backgroundSlot ?? createDefaultBackgroundSlot();
    const effectiveDecorationSlots = decorationSlots.length > 0
        ? ensureDefaultDecorationSlots(input, decorationSlots, fallbackDataRows, mainChartStyle)
        : createDefaultDecorationSlots(input, fallbackDataRows, mainChartStyle);
    const effectiveAuxiliaryTextSlots = auxiliaryTextSlots.length > 0
        ? normalizeAuxiliaryTextSlots(input, auxiliaryTextSlots, fallbackDataRows)
        : createDefaultAuxiliaryTextSlots(input, fallbackDataRows, mainChartStyle, isThreeDPie);
    const componentProps = [];
    if (titleSlot || typeof input.title === "string") {
        componentProps.push(createTitleProps(input, titleSlot));
    }
    for (const [index, slot] of effectiveAuxiliaryTextSlots.entries()) {
        componentProps.push(createAuxiliaryTextProps(input, slot, index));
    }
    if (titleSlot || typeof input.title === "string") {
        componentProps.push(createTitleBadgeProps(input));
    }
    for (const [index, slot] of effectiveDecorationSlots.entries()) {
        componentProps.push(createDecorationProps(input, slot, index));
    }
    componentProps.push(mainChartProps);
    componentProps.push(createBackgroundProps(input, effectiveBackgroundSlot));
    return componentProps.map((props, index) => ({
        ...generateComponentsSchema(props),
        indexNum: index + 1,
    }));
}
export function generateChartPanelSchemas(rawInput) {
    return generateChartPanelSchemasForInput(normalizeModuleInput(rawInput));
}
export function generateChartPanelTreeSchema(rawInput) {
    const input = normalizeModuleInput(rawInput);
    const children = generateChartPanelSchemasForInput(input).map(componentSchemaToEditorNode);
    return {
        id: input.logicalId,
        componentName: "__Group__",
        structVersion: "0.0.0",
        props: {},
        title: typeof input.title === "string" && input.title.trim() !== ""
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
    description: "通用图表面板模块，用 slot 编排背景、标题、主图表和装饰组件。",
    capability: chartPanelCapability,
    generateSchemas: generateChartPanelSchemas,
    generateTreeSchema: generateChartPanelTreeSchema,
};
