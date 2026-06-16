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

function ensureEntryAnimation(props: JsonObject): void {
  const entryAnimiation = props.entryAnimiation;
  if (!isJsonObject(entryAnimiation)) {
    props.entryAnimiation = {
      isShow: false,
      type: "",
    };
    return;
  }

  if (typeof entryAnimiation.isShow !== "boolean") {
    entryAnimiation.isShow = false;
  }

  if (typeof entryAnimiation.type !== "string") {
    entryAnimiation.type = "";
  }
}

function createDefaultDatasource(
  value: number,
  max: number,
  min: number,
): JsonObject {
  return {
    sourceType: "constant",
    fieldMode: "single",
    constantDataType: "table",
    constantTableColumns: [
      { type: "number", key: "value" },
      { type: "number", key: "max" },
      { type: "number", key: "min" },
    ],
    constantData: [
      {
        _id: "default",
        value,
        max,
        min,
      },
    ],
    fieldMappings: [
      {
        key: "value",
        mapFields: [{ path: "value", deleted: false, label: "value" }],
      },
      {
        key: "max",
        mapFields: [{ path: "max", deleted: false, label: "max" }],
      },
      {
        key: "min",
        mapFields: [{ path: "min", deleted: false, label: "min" }],
      },
    ],
  };
}

function normalizeDatasource(props: JsonObject): void {
  const aiValue = asNumber(props.value, 65);
  const aiMax = asNumber(props.max, 100);
  const aiMin = asNumber(props.min, 0);

  let datasource = props.datasource;
  if (!isJsonObject(datasource)) {
    datasource = createDefaultDatasource(aiValue, aiMax, aiMin);
    props.datasource = datasource;
    return;
  }

  datasource.sourceType = "constant";
  datasource.fieldMode = "single";
  datasource.constantDataType = "table";

  if (!Array.isArray(datasource.constantTableColumns)) {
    datasource.constantTableColumns = [
      { type: "number", key: "value" },
      { type: "number", key: "max" },
      { type: "number", key: "min" },
    ];
  }

  if (!Array.isArray(datasource.fieldMappings)) {
    datasource.fieldMappings = [
      {
        key: "value",
        mapFields: [{ path: "value", deleted: false, label: "value" }],
      },
      {
        key: "max",
        mapFields: [{ path: "max", deleted: false, label: "max" }],
      },
      {
        key: "min",
        mapFields: [{ path: "min", deleted: false, label: "min" }],
      },
    ];
  }

  const constantData = datasource.constantData;
  let firstRow: JsonObject;
  if (Array.isArray(constantData) && constantData.length > 0) {
    const existingRow = constantData[0];
    firstRow = isJsonObject(existingRow) ? existingRow : {};
  } else {
    firstRow = {};
    datasource.constantData = [firstRow];
  }

  firstRow._id = typeof firstRow._id === "string" ? firstRow._id : "default";
  firstRow.value = aiValue;
  firstRow.max = aiMax;
  firstRow.min = aiMin;
}

function normalizeIconStyle(props: JsonObject): void {
  const rawIconStyle = isJsonObject(props.iconStyle) ? props.iconStyle : {};
  const iconStyle: JsonObject = {};

  iconStyle.iconWidth = asNumber(rawIconStyle.iconWidth, asNumber(rawIconStyle.width, 48));
  iconStyle.iconHeight = asNumber(rawIconStyle.iconHeight, asNumber(rawIconStyle.height, 48));
  iconStyle.X = asNumber(rawIconStyle.X, asNumber(rawIconStyle.offsetX, 0));
  iconStyle.Y = asNumber(rawIconStyle.Y, asNumber(rawIconStyle.offsetY, -8));
  iconStyle.color = typeof rawIconStyle.color === "string" ? rawIconStyle.color : "#18D5FF";
  iconStyle.backgroundColor = typeof rawIconStyle.backgroundColor === "string" ? rawIconStyle.backgroundColor : "rgba(0,0,0,0)";
  iconStyle.borderRadius = asNumber(rawIconStyle.borderRadius, 0);
  iconStyle.rotate = asNumber(rawIconStyle.rotate, 0);

  props.iconStyle = iconStyle;
}

function normalizeHeight(props: JsonObject): void {
  const style = isJsonObject(props.style) ? props.style : {};

  const iconIsShow = props.iconIsShow === true;
  const globalConfig = isJsonObject(props.globalConfig) ? props.globalConfig : {};
  const barHeight = asNumber(globalConfig.barHeight, 56);
  const tickOffset = 24;
  const bodyHeight = barHeight + tickOffset;

  let minHeight = bodyHeight + 40;

  if (iconIsShow) {
    const iconStyle = isJsonObject(props.iconStyle) ? props.iconStyle : {};
    const iconHeight = asNumber(iconStyle.iconHeight, 48);
    const iconY = asNumber(iconStyle.Y, -8);
    // 图标位于进度条上方且主体组件保持垂直居中；
    // Y 为负时图标向上偏移，需要为顶部预留 iconHeight + |Y| 的空间。
    const upwardOffset = Math.max(0, -iconY);
    const iconRequiredSpace = iconHeight + upwardOffset;
    minHeight = Math.max(minHeight, bodyHeight + iconRequiredSpace * 2);
  }

  const currentHeight = asNumber(style.height, 0);
  if (currentHeight < minHeight) {
    style.height = Math.round(minHeight);
    props.style = style;
  }
}

export function normalizePercentageBarProps(props: JsonObject): JsonObject {
  normalizeDatasource(props);
  normalizeIconStyle(props);
  normalizeHeight(props);
  ensureEntryAnimation(props);
  return props;
}
