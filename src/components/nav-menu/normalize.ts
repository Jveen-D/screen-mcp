import type { JsonObject, JsonValue } from "../../types/component.js";

const DEFAULT_STYLE: JsonObject = {
  position: "absolute",
  left: 400,
  top: 400,
  width: 280,
  height: 420,
  rotate: 0,
  opacity: 1,
  zIndex: 1,
  backgroundColor: "rgba(9,18,32,0.92)",
};

const DEFAULT_FONT_FAMILY =
  '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif';

const DEFAULT_MENU_STYLE: JsonObject = {
  iconColor: "#94A3B8",
  fontFamily: DEFAULT_FONT_FAMILY,
  fontSize: 14,
  color: "#CBD5E1",
  textAlign: "flex-start",
  backgroundColor: "transparent",
  fontStyle: "normal",
  fontWeight: "normal",
  letterSpacing: 0,
  lineHeight: 1.5,
};

const HOVER_MENU_STYLE: JsonObject = {
  ...DEFAULT_MENU_STYLE,
  iconColor: "#E2E8F0",
  color: "#F8FAFC",
  backgroundColor: "rgba(148,163,184,0.12)",
};

const SELECTED_MENU_STYLE: JsonObject = {
  ...DEFAULT_MENU_STYLE,
  iconColor: "#FFFFFF",
  color: "#FFFFFF",
  backgroundColor: "rgba(37,99,235,0.32)",
  fontWeight: "bold",
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

function asId(value: JsonValue | undefined, fallback: string): string {
  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
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

function clampNumber(value: JsonValue | undefined, fallback: number, min: number, max: number): number {
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

function uniqueId(candidate: string, usedIds: Set<string>): string {
  if (!usedIds.has(candidate)) {
    usedIds.add(candidate);
    return candidate;
  }

  let suffix = 2;
  while (usedIds.has(`${candidate}_${suffix}`)) {
    suffix += 1;
  }
  const id = `${candidate}_${suffix}`;
  usedIds.add(id);
  return id;
}

function normalizeMenuItem(item: JsonValue, index: number, path: number[], usedIds: Set<string>): JsonObject {
  const itemPath = [...path, index + 1];
  if (!isJsonObject(item)) {
    return {
      id: uniqueId(`menu_${itemPath.join("_")}`, usedIds),
      name: `菜单${itemPath.join("-")}`,
      icon: "",
    };
  }

  const id = uniqueId(asId(item.id, `menu_${itemPath.join("_")}`), usedIds);
  const name = asString(item.name, `菜单${itemPath.join("-")}`);
  const icon = asString(item.icon, "");
  const normalized: JsonObject = { ...item, id, name, icon };

  if (Array.isArray(item.children) && item.children.length > 0) {
    normalized.children = item.children.map((child, childIndex) =>
      normalizeMenuItem(child, childIndex, itemPath, usedIds),
    ) as JsonValue;
  } else {
    delete normalized.children;
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
    const usedIds = new Set<string>();
    menuData.originalData = items.map((item, index) => normalizeMenuItem(item, index, [], usedIds)) as JsonValue;
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
  props.rotate = asNumber(props.rotate, (style.rotate as number) ?? 0);
  props.opacity = asNumber(props.opacity, (style.opacity as number) ?? 1);
}

function normalizeMenuStyles(props: JsonObject): void {
  const defaultsByKey: Array<[string, JsonObject]> = [
    ["menuDefaultStyle", DEFAULT_MENU_STYLE],
    ["menuHoverStyle", HOVER_MENU_STYLE],
    ["menuSelectStyle", SELECTED_MENU_STYLE],
  ];

  for (const [key, defaults] of defaultsByKey) {
    const styleObj = props[key];
    if (!isJsonObject(styleObj)) {
      props[key] = { ...defaults };
    } else {
      applyDefaults(styleObj, defaults);
    }
  }
}

function normalizeNumericProps(props: JsonObject): void {
  props.rotate = clampNumber(props.rotate, 0, -360, 360);
  props.opacity = clampNumber(props.opacity, 1, 0, 1);
  props.iconSize = clampNumber(props.iconSize, 16, 0, 200);
  props.expandIconSize = clampNumber(props.expandIconSize, 12, 0, 200);
  props.iconSpace = clampNumber(props.iconSpace, 10, 0, 200);
  props.indentSize = clampNumber(props.indentSize, 20, 0, 200);
  props.itemHeight = clampNumber(props.itemHeight, 40, 0, 200);
  props.itemGap = clampNumber(props.itemGap, 4, 0, 200);
  props.itemBorderRadius = clampNumber(props.itemBorderRadius, 4, 0, 200);
}

function collectMenuIds(props: JsonObject): string[] {
  const menuData = props.menuData;
  if (!isJsonObject(menuData) || !Array.isArray(menuData.originalData)) {
    return [];
  }

  const tableMapData = isJsonObject(menuData.tableMapData) ? menuData.tableMapData : DEFAULT_TABLE_MAP_DATA;
  const idField = asString(tableMapData.id, "id");
  const childrenField = asString(tableMapData.children, "children");
  const ids: string[] = [];

  const visit = (items: JsonValue[]): void => {
    for (const item of items) {
      if (!isJsonObject(item)) {
        continue;
      }
      const id = asId(item[idField] ?? item.id, "");
      if (id !== "") {
        ids.push(id);
      }
      const children = item[childrenField] ?? item.children;
      if (Array.isArray(children)) {
        visit(children);
      }
    }
  };

  visit(menuData.originalData);
  return ids;
}

function normalizeDefaultSelection(props: JsonObject): void {
  const ids = collectMenuIds(props);
  const selectedId = asId(props.defaultSelectedId, "");
  props.defaultSelectedId = ids.includes(selectedId) ? selectedId : (ids[0] ?? "");
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
  normalizeDefaultSelection(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.isExpand = typeof props.isExpand === "boolean" ? props.isExpand : false;
  props.showIcon = typeof props.showIcon === "boolean" ? props.showIcon : true;
  props.showTooltip = typeof props.showTooltip === "boolean" ? props.showTooltip : true;
  props.textOverflow = props.textOverflow === "wrap" ? "wrap" : "ellipsis";
  props.expandIconColor = asString(props.expandIconColor, "#94A3B8");
  props.name = asString(props.name, "导航菜单");
  props.title = asString(props.title, "导航菜单");

  return props;
}
