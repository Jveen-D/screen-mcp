import type { JsonObject, JsonValue } from "../../types/component.js";

const DEFAULT_STYLE: JsonObject = {
  top: 338.2530120481928,
  color: "rgba(255,255,255,1)",
  left: 590.1204819277109,
  textAlign: "left",
  width: 120,
  fontSize: 16,
  position: "absolute",
  height: 48,
  zIndex: 53,
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontStyle: "normal",
  fontWeight: "normal",
  letterSpacing: 0,
  lineHeight: 1,
  backgroundColor: "transparent",
};

const DEFAULT_BORDER: JsonObject = {
  color: "rgba(230,245,255,1)",
  show: true,
  width: 0.5,
  radius: 8,
};

const DEFAULT_PLACEHOLDER_STYLE: JsonObject = {
  color: "rgba(170,175,183,1)",
  textAlign: "left",
  fontSize: 16,
};

const DEFAULT_ENTRY_ANIMATION: JsonObject = {
  type: "",
  isShow: false,
};

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: JsonValue | undefined, fallback: string): string {
  return typeof value === "string" ? value : fallback;
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

function normalizeStyle(props: JsonObject): void {
  const style = props.style;
  if (!isJsonObject(style)) {
    props.style = { ...DEFAULT_STYLE };
    return;
  }

  applyDefaults(style, DEFAULT_STYLE);
}

function normalizeBorder(props: JsonObject): void {
  const border = props.border;
  if (!isJsonObject(border)) {
    props.border = { ...DEFAULT_BORDER };
    return;
  }

  applyDefaults(border, DEFAULT_BORDER);
}

function normalizePlaceholderStyle(props: JsonObject): void {
  const placeholderStyle = props.placeholderStyle;
  if (!isJsonObject(placeholderStyle)) {
    props.placeholderStyle = { ...DEFAULT_PLACEHOLDER_STYLE };
    return;
  }

  applyDefaults(placeholderStyle, DEFAULT_PLACEHOLDER_STYLE);
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

export function normalizeInputProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeBorder(props);
  normalizePlaceholderStyle(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.inputType = props.inputType === "number" ? "number" : "string";
  props.defaultValue = props.inputType === "number" ? asNumber(props.defaultValue, 0) : asString(props.defaultValue, "");
  props.placeholder = asString(props.placeholder, "请输入");
  props.debounceTime = asNumber(props.debounceTime, 300);
  props.min = asNumber(props.min, 0);
  props.max = asNumber(props.max, 100);
  props.precision = asNumber(props.precision, 0);
  props.step = asNumber(props.step, 1);
  props.backgroundType = props.backgroundType === "image" ? "image" : "color";
  props.backgroundColor = asString(props.backgroundColor, "rgba(224,242,253,0.09411764705882353)");
  props.backgroundImage = asString(props.backgroundImage, "");
  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "输入框");
  props.title = asString(props.title, "输入框");

  return props;
}
