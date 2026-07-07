import type { JsonObject, JsonValue } from "../../types/component.js";

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: JsonValue | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function asString(value: JsonValue | undefined, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function asIntegerInRange(value: JsonValue | undefined, min: number, max: number, fallback: number): number {
  const num = asNumber(value, fallback);
  return Math.min(Math.max(Math.round(num), min), max);
}

function cloneRows(rows: JsonValue[]): JsonObject[] {
  return rows
    .filter(isJsonObject)
    .map((item) => ({ ...item }));
}

function ensureEntryAnimation(props: JsonObject): void {
  const entryAnimiation = props.entryAnimiation;
  if (!isJsonObject(entryAnimiation)) {
    props.entryAnimiation = {
      isShow: false,
      type: "",
    };
    return;
  }

  entryAnimiation.isShow = typeof entryAnimiation.isShow === "boolean" ? entryAnimiation.isShow : false;
  entryAnimiation.type = asString(entryAnimiation.type, "");
}

function normalizeTitleName(props: JsonObject): void {
  const titleVisible = props.titleVisible === true;
  if (!titleVisible) {
    return;
  }

  const titleName = asString(props.titleName, "");
  if (titleName !== "") {
    return;
  }

  const name = asString(props.name, "");
  props.titleName = name !== "" ? name : "指标";
}

function normalizeNumBackground(props: JsonObject): void {
  if (props.hasBackground !== true) {
    return;
  }

  const numBackground = isJsonObject(props.numBackground) ? props.numBackground : {};
  numBackground.width = asNumber(numBackground.width, 36);
  numBackground.height = asNumber(numBackground.height, 54);
  numBackground.isBgColor = typeof numBackground.isBgColor === "boolean" ? numBackground.isBgColor : true;
  numBackground.bgColor = asString(numBackground.bgColor, "rgba(0,229,255,0.15)");
  numBackground.bgImg = asString(numBackground.bgImg, "");
  props.numBackground = numBackground;
}

function normalizeCompactTypography(props: JsonObject): void {
  const style = isJsonObject(props.style) ? props.style : {};
  const height = asNumber(style.height, 0);
  if (height <= 0 || height > 72 || props.titleVisible !== true) {
    return;
  }

  const titleStyle = isJsonObject(props.titleStyle) ? props.titleStyle : {};
  const numberStyle = isJsonObject(props.numberStyle) ? props.numberStyle : {};
  const suffixStyle = isJsonObject(props.suffixStyle) ? props.suffixStyle : {};
  const prefixStyle = isJsonObject(props.prefixStyle) ? props.prefixStyle : {};
  const globalConfig = isJsonObject(props.globalConfig) ? props.globalConfig : {};

  const titleFontSize = asNumber(titleStyle.fontSize, 18);
  const currentSpace = asNumber(globalConfig.space, 4);
  globalConfig.space = Math.min(currentSpace, 2);

  const availableNumberHeight = height - titleFontSize - asNumber(globalConfig.space, 2) - 8;
  if (availableNumberHeight <= 0) {
    return;
  }

  const currentNumberFontSize = asNumber(numberStyle.fontSize, 48);
  const compactNumberFontSize = Math.max(28, Math.floor(availableNumberHeight));
  if (currentNumberFontSize > compactNumberFontSize) {
    numberStyle.fontSize = compactNumberFontSize;
  }

  const companionFontSize = Math.max(12, Math.floor(asNumber(numberStyle.fontSize, compactNumberFontSize) * 0.45));
  if (props.suffix === true && asNumber(suffixStyle.fontSize, 18) > companionFontSize) {
    suffixStyle.fontSize = companionFontSize;
  }
  if (props.prefix === true && asNumber(prefixStyle.fontSize, 18) > companionFontSize) {
    prefixStyle.fontSize = companionFontSize;
  }

  props.globalConfig = globalConfig;
  props.numberStyle = numberStyle;
  props.suffixStyle = suffixStyle;
  props.prefixStyle = prefixStyle;
}

function formatWithSeparation(value: number, decimal: number): string {
  const fixed = value.toFixed(decimal);
  if (decimal > 0) {
    const [integerPart, decimalPart] = fixed.split(".");
    const separatedInteger = integerPart.replace(/\B(?=(\d{3})+$)/g, ",");
    return `${separatedInteger}.${decimalPart}`;
  }
  return fixed.replace(/\B(?=(\d{3})+$)/g, ",");
}

function estimateTextWidth(text: string, fontSize: number): number {
  // 中文字符约 1em，数字/英文字符约 0.6em
  let width = 0;
  for (const char of text) {
    width += /[\u4e00-\u9fa5]/.test(char) ? fontSize : fontSize * 0.6;
  }
  return width;
}

function shouldApplyWideFloor(props: JsonObject, numberText: string): boolean {
  const numberStyle = isJsonObject(props.numberStyle) ? props.numberStyle : {};
  const fontSize = asNumber(numberStyle.fontSize, 48);
  const hasDenseKpiLayout =
    props.prefix === true ||
    props.suffix === true ||
    props.separation === true ||
    props.hasBackground === true;

  return hasDenseKpiLayout && fontSize >= 40 && numberText.length >= 6;
}

function estimateIndicatorMinWidth(props: JsonObject): number {
  const decimal = asIntegerInRange(props.decimal, 0, 4, 0);
  const textValue = asNumber(props.textValue, 1234);
  const separation = props.separation === true;
  const hasBackground = props.hasBackground === true;

  const numberStyle = isJsonObject(props.numberStyle) ? props.numberStyle : {};
  const numBackground = isJsonObject(props.numBackground) ? props.numBackground : {};

  const numberText = separation ? formatWithSeparation(textValue, decimal) : textValue.toFixed(decimal);

  let numberWidth: number;
  if (hasBackground) {
    const bgWidth = asNumber(numBackground.width, 36);
    const letterSpacing = asNumber(numberStyle.letterSpacing, 1);
    numberWidth = numberText.length * (bgWidth + letterSpacing * 2);
  } else {
    const fontSize = asNumber(numberStyle.fontSize, 48);
    const letterSpacing = asNumber(numberStyle.letterSpacing, 1);
    numberWidth = estimateTextWidth(numberText, fontSize) + numberText.length * letterSpacing * 2;
  }

  let prefixWidth = 0;
  if (props.prefix === true) {
    const prefixStyle = isJsonObject(props.prefixStyle) ? props.prefixStyle : {};
    const prefixFontSize = asNumber(prefixStyle.fontSize, 18);
    const prefixTitle = asString(props.prefixTitle, "");
    prefixWidth = estimateTextWidth(prefixTitle, prefixFontSize) + prefixFontSize * 0.8;
  }

  let suffixWidth = 0;
  if (props.suffix === true) {
    const suffixStyle = isJsonObject(props.suffixStyle) ? props.suffixStyle : {};
    const suffixFontSize = asNumber(suffixStyle.fontSize, 18);
    const suffixTitle = asString(props.suffixTitle, "");
    suffixWidth = estimateTextWidth(suffixTitle, suffixFontSize) + suffixFontSize * 0.8;
  }

  // 额外余量：容器内边距、ant-row gutter 等
  const buffer = hasBackground ? 48 : 32;
  const contentWidth = Math.ceil(numberWidth + prefixWidth + suffixWidth + buffer);

  if (shouldApplyWideFloor(props, numberText)) {
    return Math.max(contentWidth, 360);
  }

  return contentWidth;
}

function normalizeStyleWidth(props: JsonObject): void {
  const style = isJsonObject(props.style) ? props.style : {};
  const currentWidth = asNumber(style.width, 0);
  if (currentWidth <= 0) {
    return;
  }

  const minWidth = estimateIndicatorMinWidth(props);
  if (currentWidth < minWidth) {
    style.width = minWidth;
    props.style = style;
  }
}

function normalizeReadableSeparation(props: JsonObject): void {
  if (props.separation !== true || props.hasBackground === true) {
    return;
  }

  const decimal = asIntegerInRange(props.decimal, 0, 4, 0);
  const textValue = Math.abs(asNumber(props.textValue, 0));
  const numberStyle = isJsonObject(props.numberStyle) ? props.numberStyle : {};
  const fontSize = asNumber(numberStyle.fontSize, 48);
  if (decimal > 0 || (fontSize >= 40 && textValue < 1000000)) {
    props.separation = false;
  }
}

function normalizeIndicatorData(props: JsonObject): void {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return;
  }

  const decimal = asIntegerInRange(props.decimal, 0, 4, 0);
  const textValue = props.textValue;
  const normalizedValue = asNumber(textValue, 1234);

  const constant = chartData.constant;
  if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
    chartData.sourceType = "constant";
    return;
  }

  const normalizedData = constant.data
    .filter(isJsonObject)
    .map((item, index) => ({
      value: index === 0 ? normalizedValue : asNumber(item.value, 0),
    }));

  if (normalizedData.length === 0) {
    normalizedData.push({ value: normalizedValue });
  }

  const fieldList = [
    {
      fieldName: "value",
      fieldDisplayName: "value",
      fieldType: "DECIMAL",
    },
  ];

  chartData.sourceType = "constant";
  chartData.constant = {
    ...constant,
    data: normalizedData,
    originalData: cloneRows(normalizedData as JsonValue[]),
    fieldList,
  };

  chartData.indicator = [
    {
      fieldDataConfig: {
        calculateType: "SUM",
        format: {
          numberFormat: "numerical",
          Millimeter: false,
          accuracy: decimal,
          dataFix: {
            preFix: "",
            auFix: "",
          },
        },
        chartDisplayName: "数值",
      },
      fieldName: "value",
      fieldDisplayName: "value",
      fieldType: "DECIMAL",
    },
  ];
}

export function normalizeIndicatorProps(props: JsonObject): JsonObject {
  normalizeTitleName(props);
  normalizeNumBackground(props);
  normalizeCompactTypography(props);
  normalizeStyleWidth(props);
  normalizeReadableSeparation(props);
  normalizeIndicatorData(props);
  ensureEntryAnimation(props);
  return props;
}
