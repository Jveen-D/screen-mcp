import type { JsonObject } from "../../types/component.js";
import {
  applyDefaults,
  asNumber,
  asString,
  buildSelectDataConfig,
  DEFAULT_ENTRY_ANIMATION,
  DEFAULT_STYLE,
  isJsonObject,
} from "../form-utils.js";

const DEFAULT_OPTION_STYLE: JsonObject = {
  color: "rgba(255,255,255,0.8)",
  fontSize: 16,
  dotColor: "#ffffff",
  colorPrimary: "#ffffff",
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontWeight: "normal",
  fontStyle: "normal",
  letterSpacing: 0,
  lineHeight: 1.5,
};

const DEFAULT_SELECTED_STYLE: JsonObject = {
  color: "rgba(255,255,255,1)",
  fontSize: 16,
  dotColor: "#ffffff",
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontWeight: "normal",
  fontStyle: "normal",
  letterSpacing: 0,
  lineHeight: 1.5,
};

function normalizeDataConfig(props: JsonObject): void {
  const options = props.options;
  props.dataConfig = buildSelectDataConfig(options);
  delete props.options;
}

function normalizeStyle(props: JsonObject): void {
  const style = props.style;
  if (!isJsonObject(style)) {
    props.style = { ...DEFAULT_STYLE };
    return;
  }
  applyDefaults(style, DEFAULT_STYLE);
}

function normalizeOptionStyles(props: JsonObject): void {
  const optionStyle = props.optionStyle;
  if (!isJsonObject(optionStyle)) {
    props.optionStyle = { ...DEFAULT_OPTION_STYLE };
  } else {
    applyDefaults(optionStyle, DEFAULT_OPTION_STYLE);
  }

  const selectedStyle = props.selectedStyle;
  if (!isJsonObject(selectedStyle)) {
    props.selectedStyle = { ...DEFAULT_SELECTED_STYLE };
  } else {
    applyDefaults(selectedStyle, DEFAULT_SELECTED_STYLE);
  }
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

export function normalizeRadioGroupProps(props: JsonObject): JsonObject {
  normalizeDataConfig(props);
  normalizeStyle(props);
  normalizeOptionStyles(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.direction = props.direction === "vertical" ? "vertical" : "horizontal";
  props.optionSpacing = asNumber(props.optionSpacing, 16);
  props.defaultSelectedType = ["index", "value", "none"].includes(props.defaultSelectedType as string)
    ? props.defaultSelectedType
    : "index";
  props.defaultSelectedIndex = asNumber(props.defaultSelectedIndex, 1);
  props.dotSize = asNumber(props.dotSize, 8);
  props.radioSize = asNumber(props.radioSize, 16);
  props.colorPrimary = asString(props.colorPrimary, "rgba(230,245,255,0.2862)");
  props.buttonStyle = props.buttonStyle === "solid" ? "solid" : "outline";
  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "单选组");
  props.title = asString(props.title, "单选组");

  return props;
}
