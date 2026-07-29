import type { JsonObject, JsonValue } from "../../types/component.js";
import { tabMenuDefaultProps } from "./defaultProps.js";

const DEFAULT_STYLE = tabMenuDefaultProps.style as JsonObject;
const DEFAULT_MENU_STYLES: Record<string, JsonObject> = {
  menuDefaultStyle: tabMenuDefaultProps.menuDefaultStyle as JsonObject,
  menuHoverStyle: tabMenuDefaultProps.menuHoverStyle as JsonObject,
  menuSelectStyle: tabMenuDefaultProps.menuSelectStyle as JsonObject,
};

const DEFAULT_TABLE_MAP_DATA: JsonObject = {
  id: "id",
  name: "name",
  icon: "icon",
};

const DEFAULT_ENTRY_ANIMATION: JsonObject = {
  type: "",
  isShow: false,
};

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

function clampNumber(value: JsonValue | undefined, min: number, max: number, fallback: number): number {
  return Math.min(max, Math.max(min, asNumber(value, fallback)));
}

function applyDefaults(target: JsonObject, defaults: JsonObject): void {
  for (const key of Object.keys(defaults)) {
    if (!(key in target)) {
      target[key] = defaults[key] as JsonValue;
    } else if (isJsonObject(target[key]) && isJsonObject(defaults[key])) {
      applyDefaults(target[key] as JsonObject, defaults[key] as JsonObject);
    }
  }
}

function normalizeTabItem(item: JsonValue, index: number): JsonObject {
  if (!isJsonObject(item)) {
    return { id: `tab_${index + 1}`, name: `标签${index + 1}`, icon: "" };
  }

  const id = asString(item.id, `tab_${index + 1}`);
  const name = asString(item.name, `标签${index + 1}`);
  const icon = asString(item.icon, "");
  return { id, name, icon };
}

function normalizeMenuData(props: JsonObject): void {
  const menuData = props.menuData;
  if (!isJsonObject(menuData)) {
    props.menuData = {
      originalData: [],
      tableMapData: { ...DEFAULT_TABLE_MAP_DATA },
      originType: "static",
      selectTabId: "",
    };
    return;
  }

  const items = menuData.items;
  const originalData = menuData.originalData;

  if (Array.isArray(items)) {
    menuData.originalData = items.map(normalizeTabItem) as JsonValue;
    delete menuData.items;
  } else if (!Array.isArray(originalData)) {
    menuData.originalData = [];
  }

  const tableMapData = menuData.tableMapData;
  if (!isJsonObject(tableMapData)) {
    menuData.tableMapData = { ...DEFAULT_TABLE_MAP_DATA };
  } else {
    applyDefaults(tableMapData, DEFAULT_TABLE_MAP_DATA);
  }

  menuData.originType = "static";

  const normalizedData = menuData.originalData as JsonValue[];
  const firstItem = normalizedData.find((item): item is JsonObject => isJsonObject(item));
  menuData.selectTabId = asString(menuData.selectTabId, firstItem ? asString(firstItem.id, "") : "");
}

function normalizeStyle(props: JsonObject): void {
  const style = props.style;
  if (!isJsonObject(style)) {
    props.style = { ...DEFAULT_STYLE };
    return;
  }

  applyDefaults(style, DEFAULT_STYLE);
}

function normalizeMenuStyles(props: JsonObject): void {
  for (const key of ["menuDefaultStyle", "menuHoverStyle", "menuSelectStyle"]) {
    const defaults = DEFAULT_MENU_STYLES[key];
    const styleObj = props[key];
    if (!isJsonObject(styleObj)) {
      props[key] = { ...defaults };
    } else {
      applyDefaults(styleObj, defaults);
      styleObj.borderWidth = clampNumber(styleObj.borderWidth, 0, 20, defaults.borderWidth as number);
      styleObj.borderRadius = clampNumber(styleObj.borderRadius, 0, 100, defaults.borderRadius as number);
      styleObj.fontSize = clampNumber(styleObj.fontSize, 8, 64, defaults.fontSize as number);
      styleObj.letterSpacing = clampNumber(styleObj.letterSpacing, 0, 20, defaults.letterSpacing as number);
      styleObj.lineHeight = clampNumber(styleObj.lineHeight, 0.8, 3, defaults.lineHeight as number);
      styleObj.borderType = ["solid", "dashed"].includes(styleObj.borderType as string)
        ? styleObj.borderType
        : defaults.borderType;
      styleObj.backgroundFillType = ["color", "image"].includes(styleObj.backgroundFillType as string)
        ? styleObj.backgroundFillType
        : defaults.backgroundFillType;
      styleObj.fontStyle = ["normal", "italic", "oblique"].includes(styleObj.fontStyle as string)
        ? styleObj.fontStyle
        : defaults.fontStyle;
      styleObj.fontWeight = ["normal", "bold", "bolder"].includes(styleObj.fontWeight as string)
        ? styleObj.fontWeight
        : defaults.fontWeight;
    }
  }
}

function normalizeNumericProps(props: JsonObject): void {
  props.rotate = clampNumber(props.rotate, -360, 360, 0);
  props.opacity = clampNumber(props.opacity, 0, 1, 1);
}

function normalizeEntryAnimation(props: JsonObject): void {
  const entryAnimiation = props.entryAnimiation;
  if (!isJsonObject(entryAnimiation)) {
    props.entryAnimiation = { ...DEFAULT_ENTRY_ANIMATION };
    return;
  }

  if (typeof entryAnimiation.isShow !== "boolean") {
    entryAnimiation.isShow = DEFAULT_ENTRY_ANIMATION.isShow;
  }
  if (typeof entryAnimiation.type !== "string") {
    entryAnimiation.type = DEFAULT_ENTRY_ANIMATION.type;
  }
}

function normalizeEventConfigures(props: JsonObject): void {
  const eventConfigures = props.eventConfigures;
  if (!Array.isArray(eventConfigures)) {
    props.eventConfigures = [];
  }
}

export function normalizeTabMenuProps(props: JsonObject): JsonObject {
  normalizeMenuData(props);
  normalizeStyle(props);
  normalizeMenuStyles(props);
  normalizeNumericProps(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.flexDirection = props.flexDirection === "column" ? "column" : "row";
  props.alignType = ["start", "center", "end"].includes(props.alignType as string)
    ? props.alignType
    : "center";
  props.itemAlign = ["start", "center", "end"].includes(props.itemAlign as string)
    ? props.itemAlign
    : "center";
  props.textOverflow = ["ellipsis", "wrap", "visible"].includes(props.textOverflow as string)
    ? props.textOverflow
    : "ellipsis";
  props.cardSpace = clampNumber(props.cardSpace, 0, 64, 8);
  props.fillContainer = typeof props.fillContainer === "boolean" ? props.fillContainer : true;
  props.showIcon = typeof props.showIcon === "boolean" ? props.showIcon : false;
  props.iconSize = clampNumber(props.iconSize, 8, 64, 16);
  props.iconSpace = clampNumber(props.iconSpace, 0, 64, 6);
  props.expandIconSize = clampNumber(props.expandIconSize, 8, 64, 12);
  props.expandIconColor = asString(props.expandIconColor, "#94a3b8");
  props.name = asString(props.name, "Tab列表");
  props.title = asString(props.title, "Tab列表");

  return props;
}
