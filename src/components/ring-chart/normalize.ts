import type { JsonObject, JsonValue } from "../../types/component.js";

export const legendPositionOptions = [
  ["left", "top"],
  ["center", "top"],
  ["right", "top"],
  ["left", "center"],
  ["right", "center"],
  ["left", "bottom"],
  ["center", "bottom"],
  ["right", "bottom"],
] as const;

const DEFAULT_INNER_RADIUS = "38%";
const DEFAULT_OUTER_RADIUS = "66%";

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: JsonValue | undefined, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
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

function asBoolean(value: JsonValue | undefined, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function clampNumber(
  value: JsonValue | undefined,
  min: number,
  max: number,
  fallback: number,
): number {
  return Math.min(Math.max(asNumber(value, fallback), min), max);
}

function normalizeEnum(
  value: JsonValue | undefined,
  allowed: string[],
  fallback: string,
): string {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

function asPercentString(value: JsonValue | undefined, fallback: string): string {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}%`;
  }

  return fallback;
}

function normalizeStringPair(
  value: JsonValue | undefined,
  fallback: [string, string],
): [string, string] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return [
    asPercentString(value[0], fallback[0]),
    asPercentString(value[1], fallback[1]),
  ];
}

function percentNumber(value: string): number | undefined {
  const normalized = value.trim().replace(/%$/u, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function cappedPercent(value: string, max: number): string {
  const parsed = percentNumber(value);
  if (parsed === undefined || parsed <= max) {
    return value;
  }
  return `${max}%`;
}

function atLeastPercent(value: string, min: number): string {
  const parsed = percentNumber(value);
  if (parsed === undefined || parsed >= min) {
    return value;
  }
  return `${min}%`;
}

function cappedNumber(value: JsonValue | undefined, fallback: number, max: number): number {
  return Math.min(asNumber(value, fallback), max);
}

function chartDataRowCount(props: JsonObject): number {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return 0;
  }

  const constant = chartData.constant;
  if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
    return 0;
  }

  return constant.data.length;
}

function isZeroRadius(value: string): boolean {
  return value === "0%" || value === "0";
}

function isValidLegendPosition(left: JsonValue, top: JsonValue): boolean {
  if (typeof left !== "string" || typeof top !== "string") {
    return false;
  }

  return legendPositionOptions.some(
    ([allowedLeft, allowedTop]) => left === allowedLeft && top === allowedTop,
  );
}

function isValidLegendCoordinate(
  value: JsonValue,
  allowedKeywords: string[],
): boolean {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.trim();
  return allowedKeywords.includes(normalized) || /^-?\d+(?:\.\d+)?%?$/u.test(normalized);
}

function normalizeLegendCenterOverlap(legend: JsonObject): void {
  if (legend.top !== "center") {
    return;
  }

  const orient = typeof legend.orient === "string" ? legend.orient : "horizontal";
  if (orient === "vertical" && (legend.left === "left" || legend.left === "right")) {
    return;
  }

  legend.left = "center";
  legend.top = "bottom";
  legend.orient = "horizontal";
}

function normalizeSideLegendRingLayout(option: JsonObject, style: JsonObject): void {
  const legend = isJsonObject(option.legend) ? option.legend : {};
  if (legend.show === false) {
    return;
  }

  const orient = typeof legend.orient === "string" ? legend.orient : "horizontal";
  const isSideLegend =
    legend.top === "center" &&
    orient === "vertical" &&
    (legend.left === "left" || legend.left === "right");
  if (!isSideLegend) {
    return;
  }

  const width = asNumber(style.width, 0);
  const height = asNumber(style.height, 0);
  const denseSideLegend = width > 0 && height > 0 && (width < 420 || height < 240);
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  const minOuterRadius = denseSideLegend ? 64 : 60;
  for (const item of series) {
    if (!isJsonObject(item)) {
      continue;
    }

    item.center = normalizeStringPair(item.center, ["50%", "58%"]);
    item.radius = normalizeStringPair(item.radius, [DEFAULT_INNER_RADIUS, DEFAULT_OUTER_RADIUS]);

    const center = item.center as [string, string];
    const radius = item.radius as [string, string];
    if (legend.left === "right") {
      const parsedCenterX = percentNumber(center[0]);
      center[0] = parsedCenterX === undefined ? "40%" : `${Math.min(parsedCenterX, 40)}%`;
    } else {
      const parsedCenterX = percentNumber(center[0]);
      center[0] = parsedCenterX === undefined ? "60%" : `${Math.max(parsedCenterX, 60)}%`;
    }
    radius[1] = `${Math.max(percentNumber(radius[1]) ?? 0, minOuterRadius)}%`;

    const innerRadius = percentNumber(radius[0]);
    const outerRadius = percentNumber(radius[1]);
    if (
      innerRadius !== undefined &&
      outerRadius !== undefined &&
      innerRadius >= outerRadius
    ) {
      radius[0] = `${Math.max(0, outerRadius - 14)}%`;
    }
  }
}

function cleanFormatter(value: unknown): JsonValue {
  if (typeof value !== "string") {
    return value as JsonValue;
  }

  return value.replace(/\r\n|\r|\n/gu, "\\n").replace(/\t/gu, " ");
}

function normalizeLabelFormatters(option: JsonObject): void {
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  for (const item of series) {
    if (!isJsonObject(item)) {
      continue;
    }

    const label = item.label;
    if (isJsonObject(label)) {
      label.formatter = cleanFormatter(label.formatter);
    }
  }
}

function normalizeRingSeries(option: JsonObject): void {
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  for (const item of series) {
    if (isJsonObject(item)) {
      item.type = "pie";
      item.left = 0;
      item.top = 0;
      item.right = 0;
      item.bottom = 0;
      item.center = normalizeStringPair(item.center, ["50%", "58%"]);
      item.radius = normalizeStringPair(item.radius, [
        DEFAULT_INNER_RADIUS,
        DEFAULT_OUTER_RADIUS,
      ]);

      const radius = item.radius as [string, string];
      if (isZeroRadius(radius[0])) {
        radius[0] = DEFAULT_INNER_RADIUS;
      }
      if (isZeroRadius(radius[1])) {
        radius[1] = DEFAULT_OUTER_RADIUS;
      }

      item.startAngle = clampNumber(item.startAngle, 0, 360, 90);
      item.clockwise = asBoolean(item.clockwise, true);
      item.minShowLabelAngle = clampNumber(item.minShowLabelAngle, 0, 360, 4);
      item.percentPrecision = Math.round(clampNumber(item.percentPrecision, 0, 10, 1));
      item.stillShowZeroSum = asBoolean(item.stillShowZeroSum, false);
      item.showEmptyCircle = asBoolean(item.showEmptyCircle, true);

      const emptyCircleStyle = isJsonObject(item.emptyCircleStyle) ? item.emptyCircleStyle : {};
      emptyCircleStyle.borderWidth = clampNumber(emptyCircleStyle.borderWidth, 0, 20, 1);
      item.emptyCircleStyle = emptyCircleStyle;

      const emphasis = isJsonObject(item.emphasis) ? item.emphasis : {};
      emphasis.scale = asBoolean(emphasis.scale, true);
      emphasis.scaleSize = clampNumber(emphasis.scaleSize, 0, 50, 6);
      item.emphasis = emphasis;

      const itemStyle = isJsonObject(item.itemStyle) ? item.itemStyle : {};
      itemStyle.borderWidth = clampNumber(itemStyle.borderWidth, 0, 20, 2);
      itemStyle.borderRadius = clampNumber(itemStyle.borderRadius, 0, 100, 4);
      itemStyle.shadowBlur = clampNumber(itemStyle.shadowBlur, 0, 100, 0);
      item.itemStyle = itemStyle;

      const label = isJsonObject(item.label) ? item.label : {};
      label.content = normalizeEnum(
        label.content,
        ["name", "value", "percent", "nameValue", "namePercent", "custom"],
        "namePercent",
      );
      label.fontSize = clampNumber(label.fontSize, 8, 100, 14);
      item.label = label;

      const labelLine = isJsonObject(item.labelLine) ? item.labelLine : {};
      labelLine.length = clampNumber(labelLine.length, 0, 500, 10);
      labelLine.length2 = clampNumber(labelLine.length2, 0, 500, 14);
      labelLine.smooth = asBoolean(labelLine.smooth, true);
      item.labelLine = labelLine;
    }
  }
}

function normalizeRingRuntimeConfig(props: JsonObject): void {
  props.borderGap = clampNumber(props.borderGap, 0, 1, 0);

  const decorator = isJsonObject(props.decorator) ? props.decorator : {};
  const innerRing = isJsonObject(decorator.innerRing) ? decorator.innerRing : {};
  const outerRing = isJsonObject(decorator.outerRing) ? decorator.outerRing : {};
  let innerRadius = clampNumber(innerRing.innerRadius, 0, 0.99, 0.2);
  const outerRadius = clampNumber(innerRing.outerRadius, 0.01, 1, 0.23);
  if (innerRadius >= outerRadius) {
    innerRadius = Math.max(0, outerRadius - 0.01);
  }
  innerRing.isActive = asBoolean(innerRing.isActive, false);
  innerRing.innerRadius = innerRadius;
  innerRing.outerRadius = outerRadius;
  innerRing.opacity = clampNumber(innerRing.opacity, 0, 1, 0.5);
  innerRing.animateSpeed = clampNumber(innerRing.animateSpeed, 0, 1, 0.8);
  innerRing.animateDirection = normalizeEnum(
    innerRing.animateDirection,
    ["clockwise", "anticlockwise"],
    "clockwise",
  );
  outerRing.isActive = asBoolean(outerRing.isActive, false);
  outerRing.arcWidth = clampNumber(outerRing.arcWidth, 0.01, 0.5, 0.15);
  outerRing.opacity = clampNumber(outerRing.opacity, 0, 1, 0.2);
  decorator.innerRing = innerRing;
  decorator.outerRing = outerRing;
  props.decorator = decorator;

  const rotatingAnimation = isJsonObject(props.rotatingAnimation) ? props.rotatingAnimation : {};
  rotatingAnimation.isActive = asBoolean(rotatingAnimation.isActive, false);
  rotatingAnimation.height = clampNumber(rotatingAnimation.height, 0, 50, 6);
  rotatingAnimation.opacity = clampNumber(rotatingAnimation.opacity, 0, 1, 1);
  rotatingAnimation.duration = clampNumber(rotatingAnimation.duration, 0.5, 60, 5);
  rotatingAnimation.selectMode = normalizeEnum(rotatingAnimation.selectMode, ["none", "click"], "none");
  rotatingAnimation.isHover = asBoolean(rotatingAnimation.isHover, false);
  props.rotatingAnimation = rotatingAnimation;

  const ringText = isJsonObject(props.ringText) ? props.ringText : {};
  ringText.isActive = asBoolean(ringText.isActive, false);
  ringText.fontSize = clampNumber(ringText.fontSize, 8, 100, 14);
  ringText.fontFamily = asString(ringText.fontFamily, "Microsoft YaHei");
  ringText.fontWeight = normalizeEnum(ringText.fontWeight, ["normal", "bold", "bolder"], "normal");
  ringText.color = asString(ringText.color, "#F8FAFC");
  ringText.distance = clampNumber(ringText.distance, 0, 100, 10);
  props.ringText = ringText;
}

function normalizeRingVisualOption(option: JsonObject): void {
  const title = isJsonObject(option.title) ? option.title : {};
  title.show = asBoolean(title.show, false);
  title.text = typeof title.text === "string" ? title.text : "";
  title.left = isValidLegendCoordinate(title.left, ["left", "center", "right"])
    ? title.left
    : "center";
  title.top = isValidLegendCoordinate(title.top, ["top", "center", "bottom"])
    ? title.top
    : "center";
  const titleTextStyle = isJsonObject(title.textStyle) ? title.textStyle : {};
  titleTextStyle.fontFamily = asString(titleTextStyle.fontFamily, "Microsoft YaHei");
  titleTextStyle.fontSize = clampNumber(titleTextStyle.fontSize, 8, 100, 18);
  titleTextStyle.fontWeight = normalizeEnum(titleTextStyle.fontWeight, ["normal", "bold"], "normal");
  titleTextStyle.color = asString(titleTextStyle.color, "#F8FAFC");
  title.textStyle = titleTextStyle;
  option.title = title;

  const tooltip = isJsonObject(option.tooltip) ? option.tooltip : {};
  tooltip.confine = asBoolean(tooltip.confine, true);
  tooltip.borderWidth = clampNumber(tooltip.borderWidth, 0, 20, 1);
  option.tooltip = tooltip;

  const legend = isJsonObject(option.legend) ? option.legend : {};
  legend.type = normalizeEnum(legend.type, ["plain", "scroll"], "scroll");
  legend.orient = normalizeEnum(legend.orient, ["horizontal", "vertical"], "horizontal");
  legend.itemWidth = clampNumber(legend.itemWidth, 0, 100, 10);
  legend.itemHeight = clampNumber(legend.itemHeight, 0, 100, 10);
  legend.itemGap = clampNumber(legend.itemGap, 0, 100, 16);
  if (legend.selectedMode !== true && legend.selectedMode !== false && legend.selectedMode !== "single") {
    legend.selectedMode = false;
  }
  const textStyle = isJsonObject(legend.textStyle) ? legend.textStyle : {};
  textStyle.width = clampNumber(textStyle.width, 0, 500, 72);
  textStyle.overflow = normalizeEnum(textStyle.overflow, ["truncate", "break", "breakAll"], "truncate");
  legend.textStyle = textStyle;
  option.legend = legend;
}

function normalizeCompactLegendLabelLayout(props: JsonObject): void {
  const style = isJsonObject(props.style) ? props.style : {};
  const height = asNumber(style.height, 0);
  const width = asNumber(style.width, 0);
  if (height <= 0 || width <= 0) {
    return;
  }

  const option = props.option;
  if (!isJsonObject(option)) {
    return;
  }

  const legend = isJsonObject(option.legend) ? option.legend : {};
  if (legend.show === false || legend.top !== "bottom") {
    return;
  }

  const dataCount = chartDataRowCount(props);
  const denseBottomLegend = height < 220 || width < 420 || dataCount >= 5;
  if (!denseBottomLegend) {
    return;
  }
  const multiItemNarrowLegend = dataCount >= 5 || width < 420;

  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  if (multiItemNarrowLegend) {
    legend.offsetY = -2;
    legend.itemGap = cappedNumber(legend.itemGap, 10, 10);
    legend.itemWidth = cappedNumber(legend.itemWidth, 12, 12);
    legend.itemHeight = cappedNumber(legend.itemHeight, 7, 7);
    const textStyle = isJsonObject(legend.textStyle) ? legend.textStyle : {};
    textStyle.fontSize = cappedNumber(textStyle.fontSize, 11, 11);
    legend.textStyle = textStyle;
  }

  const readableMediumLayout = width >= 420 && height >= 280;
  for (const item of series) {
    if (!isJsonObject(item)) {
      continue;
    }

      item.center = normalizeStringPair(item.center, ["50%", "58%"]);
    item.radius = normalizeStringPair(item.radius, [
      DEFAULT_INNER_RADIUS,
      DEFAULT_OUTER_RADIUS,
    ]);

    if (readableMediumLayout && multiItemNarrowLegend) {
      const radius = item.radius as [string, string];
      radius[1] = atLeastPercent(radius[1], 42);

      const innerRadius = percentNumber(radius[0]);
      const outerRadius = percentNumber(radius[1]);
      if (
        innerRadius !== undefined &&
        outerRadius !== undefined &&
        innerRadius >= outerRadius
      ) {
        radius[0] = `${Math.max(0, outerRadius - 14)}%`;
      }
    }

    const label = isJsonObject(item.label) ? item.label : {};
    if (label.show !== true || label.position !== "outside") {
      continue;
    }

    const center = item.center as [string, string];
    const radius = item.radius as [string, string];
    center[1] = cappedPercent(center[1], multiItemNarrowLegend ? 38 : 40);
    radius[1] = cappedPercent(radius[1], multiItemNarrowLegend ? 46 : 54);
    if (readableMediumLayout && multiItemNarrowLegend) {
      radius[1] = atLeastPercent(radius[1], 42);
    }

    const innerRadius = percentNumber(radius[0]);
    const outerRadius = percentNumber(radius[1]);
    if (
      innerRadius !== undefined &&
      outerRadius !== undefined &&
      innerRadius >= outerRadius
    ) {
      radius[0] = `${Math.max(0, outerRadius - 14)}%`;
    }

    const labelLine = isJsonObject(item.labelLine) ? item.labelLine : {};
    labelLine.show = typeof labelLine.show === "boolean" ? labelLine.show : true;
    labelLine.length = Math.min(asNumber(labelLine.length, 6), 6);
    labelLine.length2 = Math.min(asNumber(labelLine.length2, 4), multiItemNarrowLegend ? 3 : 4);
    item.labelLine = labelLine;

    if (multiItemNarrowLegend) {
      label.fontSize = cappedNumber(label.fontSize, 11, 11);
      if (typeof label.formatter === "string" && /(?:^|[^@])\{c\}/u.test(label.formatter)) {
        label.formatter = "{b}";
      }
      item.label = label;
    }
  }
}

function normalizeBottomLegendOffset(legend: JsonObject): void {
  if (legend.show === false || legend.top !== "bottom") {
    return;
  }

  legend.offsetY = Math.min(asNumber(legend.offsetY, 0), 0);
}

function normalizeRingChartData(props: JsonObject): void {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return;
  }

  const constant = chartData.constant;
  if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
    chartData.sourceType = "constant";
    return;
  }

  const normalizedData = constant.data
    .filter(isJsonObject)
    .map((item, index) => ({
      name: asString(item.name, `类目${index + 1}`),
      type: asString(item.type, "系列"),
      value: asNumber(item.value, 0),
    }));

  if (normalizedData.length === 0) {
    chartData.sourceType = "constant";
    return;
  }

  chartData.sourceType = "constant";
  chartData.constant = {
    ...constant,
    data: normalizedData,
    originalData: normalizedData.map((item) => ({ ...item })),
    fieldList: [
      {
        fieldName: "name",
        fieldDisplayName: "name",
        fieldType: "LONGTEXT",
      },
      {
        fieldName: "type",
        fieldDisplayName: "type",
        fieldType: "LONGTEXT",
      },
      {
        fieldName: "value",
        fieldDisplayName: "value",
        fieldType: "DECIMAL",
      },
    ],
  };
}

export function normalizeRingChartProps(props: JsonObject): JsonObject {
  normalizeRingChartData(props);
  normalizeRingRuntimeConfig(props);

  const option = props.option;
  if (!isJsonObject(option)) {
    return props;
  }

  normalizeRingVisualOption(option);
  normalizeRingSeries(option);
  normalizeLabelFormatters(option);

  const legend = option.legend;
  if (!isJsonObject(legend)) {
    return props;
  }

  normalizeLegendCenterOverlap(legend);
  normalizeSideLegendRingLayout(option, isJsonObject(props.style) ? props.style : {});
  normalizeCompactLegendLabelLayout(props);
  normalizeBottomLegendOffset(legend);

  const hasNativeLegendPosition =
    isValidLegendCoordinate(legend.left, ["left", "center", "right"]) &&
    isValidLegendCoordinate(legend.top, ["top", "center", "bottom"]);
  if (isValidLegendPosition(legend.left, legend.top) || hasNativeLegendPosition) {
    legend.offsetX = asNumber(legend.offsetX, 0);
    legend.offsetY = asNumber(legend.offsetY, 0);
    return props;
  }

  legend.left = "center";
  legend.top = "top";
  legend.offsetX = asNumber(legend.offsetX, 0);
  legend.offsetY = asNumber(legend.offsetY, 0);

  return props;
}
