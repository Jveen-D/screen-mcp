import type { JsonObject, JsonValue } from "../../types/component.js";

const DEFAULT_STYLE: JsonObject = {
  rotate: 0,
  top: 136.14285714285717,
  left: 356.2857142857142,
  width: 782.2857142857142,
  position: "absolute",
  opacity: 1,
  height: 46.57142857142857,
  zIndex: 501,
};

const DEFAULT_MENU_STYLE: JsonObject = {
  borderType: "solid",
  backgroundColor: "rgba(181,210,252,1)",
  borderColor: "rgba(0,0,0,0)",
  color: "#fff",
  textAlign: "flex-start",
  letterSpacing: 2,
  fontStyle: "italic",
  fontFamily: "优设标题圆",
  borderRadius: 4,
  borderWidth: 0,
  iconColor: "rgba(222,232,255,1)",
  fontSize: 23,
  lineHeight: 2,
  fontWeight: "normal",
  backgroundFillType: "color",
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
  props.rotate = asNumber(props.rotate, style.rotate as number ?? 0);
  props.opacity = asNumber(props.opacity, style.opacity as number ?? 1);
}

function normalizeMenuStyles(props: JsonObject): void {
  for (const key of ["menuDefaultStyle", "menuHoverStyle", "menuSelectStyle"]) {
    const styleObj = props[key];
    if (!isJsonObject(styleObj)) {
      props[key] = { ...DEFAULT_MENU_STYLE };
    } else {
      applyDefaults(styleObj, DEFAULT_MENU_STYLE);
    }
  }
}

function normalizeNumericProps(props: JsonObject): void {
  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
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
  props.cardSpace = asNumber(props.cardSpace, 6);
  props.fillContainer = typeof props.fillContainer === "boolean" ? props.fillContainer : true;
  props.showIcon = typeof props.showIcon === "boolean" ? props.showIcon : false;
  props.iconSize = asNumber(props.iconSize, 16);
  props.iconSpace = asNumber(props.iconSpace, 6);
  props.expandIconSize = asNumber(props.expandIconSize, 12);
  props.expandIconColor = asString(props.expandIconColor, "rgba(227,240,255,1)");
  props.name = asString(props.name, "Tab列表");
  props.title = asString(props.title, "Tab列表");

  return props;
}
