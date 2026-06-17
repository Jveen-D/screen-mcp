import type { JsonObject, JsonValue } from "../../types/component.js";

const DEFAULT_STYLE: JsonObject = {
  position: "absolute",
  left: 400,
  top: 400,
  width: 315,
  height: 750,
  rotate: 0,
  opacity: 1,
  zIndex: 1,
  backgroundColor: "rgba(17,61,110,0.68)",
};

const DEFAULT_MENU_STYLE: JsonObject = {
  iconColor: "rgba(222,232,255,1)",
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontSize: 18,
  color: "rgba(222,232,255,1)",
  textAlign: "flex-start",
  backgroundColor: "rgba(17,61,110,0)",
  fontStyle: "normal",
  fontWeight: "normal",
  letterSpacing: 2,
  lineHeight: 2,
};

const DEFAULT_TABLE_MAP_DATA: JsonObject = {
  id: "id",
  name: "name",
  icon: "icon",
  children: "children",
};

const DEFAULT_ENTRY_ANIMATION: JsonObject = {
  isShow: false,
  type: "",
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

function normalizeMenuItem(item: JsonValue, index: number): JsonObject {
  if (!isJsonObject(item)) {
    return { id: `menu_${index + 1}`, name: `菜单${index + 1}`, icon: "" };
  }

  const id = asString(item.id, `menu_${index + 1}`);
  const name = asString(item.name, `菜单${index + 1}`);
  const icon = asString(item.icon, "");
  const normalized: JsonObject = { id, name, icon };

  const children = item.children;
  if (Array.isArray(children) && children.length > 0) {
    normalized.children = children.map(normalizeMenuItem) as JsonValue;
  }

  return normalized;
}

function normalizeMenuData(props: JsonObject): void {
  const menuData = props.menuData;
  if (!isJsonObject(menuData)) {
    props.menuData = {
      originalData: [],
      tableMapData: { ...DEFAULT_TABLE_MAP_DATA },
      originType: "static",
    };
    return;
  }

  const items = menuData.items;
  const originalData = menuData.originalData;

  if (Array.isArray(items)) {
    menuData.originalData = items.map(normalizeMenuItem) as JsonValue;
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

export function normalizeNavMenuProps(props: JsonObject): JsonObject {
  normalizeMenuData(props);
  normalizeStyle(props);
  normalizeMenuStyles(props);
  normalizeNumericProps(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.isExpand = typeof props.isExpand === "boolean" ? props.isExpand : false;
  props.showIcon = typeof props.showIcon === "boolean" ? props.showIcon : true;
  props.iconSize = asNumber(props.iconSize, 16);
  props.expandIconSize = asNumber(props.expandIconSize, 12);
  props.iconSpace = asNumber(props.iconSpace, 6);
  props.expandIconColor = asString(props.expandIconColor, "rgba(227,240,255,1)");
  props.name = asString(props.name, "导航菜单");
  props.title = asString(props.title, "导航菜单");

  return props;
}
