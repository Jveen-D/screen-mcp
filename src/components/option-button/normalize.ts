import type { JsonObject } from "../../types/component.js";
import {
  applyDefaults,
  asNumber,
  asString,
  DEFAULT_ENTRY_ANIMATION,
  isJsonObject,
} from "../form-utils.js";

const DEFAULT_STYLE: JsonObject = {
  position: "absolute",
  left: 400,
  top: 400,
  width: 144,
  height: 44,
  zIndex: 1,
};

const DEFAULT_BTN_STYLE: JsonObject = {
  iconColor: "rgba(234,251,255,0.92)",
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontSize: 14,
  color: "rgba(244,252,255,0.94)",
  textAlign: "center",
  backgroundColor: "rgba(24,93,133,0.82)",
  fontStyle: "normal",
  fontWeight: "normal",
  letterSpacing: 0,
  lineHeight: 1.4,
  borderWidth: 1,
  borderColor: "rgba(79,209,197,0.48)",
  borderRadius: 4,
  borderStyle: "solid",
};

const DEFAULT_HOVER_STYLE: JsonObject = {
  iconColor: "rgba(255,255,255,1)",
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontSize: 14,
  color: "rgba(255,255,255,1)",
  textAlign: "center",
  backgroundColor: "rgba(31,119,153,0.94)",
  fontStyle: "normal",
  fontWeight: "normal",
  letterSpacing: 0,
  lineHeight: 1.4,
  borderWidth: 1,
  borderColor: "rgba(91,226,204,0.72)",
  borderRadius: 4,
  borderStyle: "solid",
};

const DEFAULT_SELECT_STYLE: JsonObject = {
  iconColor: "rgba(255,255,255,1)",
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontSize: 14,
  color: "rgba(255,255,255,1)",
  textAlign: "center",
  backgroundColor: "rgba(23,122,120,0.96)",
  fontStyle: "normal",
  fontWeight: "normal",
  letterSpacing: 0,
  lineHeight: 1.4,
  borderWidth: 1,
  borderColor: "rgba(99,230,205,0.92)",
  borderRadius: 4,
  borderStyle: "solid",
};

const DEFAULT_DISABLED_STYLE: JsonObject = {
  iconColor: "rgba(203,216,222,0.4)",
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontSize: 14,
  color: "rgba(203,216,222,0.46)",
  textAlign: "center",
  backgroundColor: "rgba(45,60,69,0.58)",
  fontStyle: "normal",
  fontWeight: "normal",
  letterSpacing: 0,
  lineHeight: 1.4,
  borderWidth: 1,
  borderColor: "rgba(148,163,171,0.24)",
  borderRadius: 4,
  borderStyle: "solid",
};

const ARRANGES = new Set(["row", "column"]);
const TEXT_ALIGNS = new Set(["flex-start", "center", "flex-end"]);
const ICON_POSITIONS = new Set(["left", "right", "top", "bottom"]);
const TEXT_OVERFLOWS = new Set(["ellipsis", "clip", "wrap"]);
const SELECT_MODES = new Set(["momentary", "toggle"]);

function clampNumber(value: JsonObject[string], min: number, max: number, fallback: number): number {
  return Math.min(Math.max(asNumber(value, fallback), min), max);
}

function normalizeStyle(props: JsonObject): void {
  const style = props.style;
  if (!isJsonObject(style)) {
    props.style = { ...DEFAULT_STYLE };
    return;
  }
  applyDefaults(style, DEFAULT_STYLE);
}

function normalizeButtonStyles(props: JsonObject): void {
  for (const [key, defaults] of [
    ["btnDefaultStyle", DEFAULT_BTN_STYLE],
    ["btnHoverStyle", DEFAULT_HOVER_STYLE],
    ["btnSelectStyle", DEFAULT_SELECT_STYLE],
    ["btnDisabledStyle", DEFAULT_DISABLED_STYLE],
  ] as const) {
    const target = props[key];
    if (!isJsonObject(target)) {
      props[key] = { ...defaults };
    } else {
      applyDefaults(target, defaults);
      target.fontSize = clampNumber(target.fontSize, 8, 96, 14);
      target.letterSpacing = clampNumber(target.letterSpacing, 0, 32, 0);
      target.lineHeight = clampNumber(target.lineHeight, 0.5, 4, 1.4);
      target.borderWidth = clampNumber(target.borderWidth, 0, 20, 1);
      target.borderRadius = clampNumber(target.borderRadius, 0, 100, 4);
      target.borderStyle = ["none", "solid", "dotted", "dashed"].includes(String(target.borderStyle))
        ? target.borderStyle
        : "solid";
    }
  }
}

function normalizeButtonConfig(props: JsonObject): void {
  const arrange = String(props.arrange ?? "row");
  props.arrange = ARRANGES.has(arrange) ? arrange : "row";
  const btnTextAlign = String(props.btnTextAlign ?? "center");
  props.btnTextAlign = TEXT_ALIGNS.has(btnTextAlign) ? btnTextAlign : "center";
  const iconPosition = String(props.iconPosition ?? "left");
  props.iconPosition = ICON_POSITIONS.has(iconPosition) ? iconPosition : "left";
  const textOverflow = String(props.textOverflow ?? "ellipsis");
  props.textOverflow = TEXT_OVERFLOWS.has(textOverflow) ? textOverflow : "ellipsis";
  const selectMode = String(props.selectMode ?? "momentary");
  props.selectMode = SELECT_MODES.has(selectMode) ? selectMode : "momentary";
  props.btnText = asString(props.btnText, "操作按钮");
  props.showIcon = typeof props.showIcon === "boolean" ? props.showIcon : true;
  props.iconSize = clampNumber(props.iconSize, 8, 64, 18);
  props.iconSpace = clampNumber(props.iconSpace, 0, 48, 8);
  props.showTooltip = typeof props.showTooltip === "boolean" ? props.showTooltip : true;
  props.defaultSelect = typeof props.defaultSelect === "boolean" ? props.defaultSelect : false;
  props.disabled = typeof props.disabled === "boolean" ? props.disabled : false;

  const padding = isJsonObject(props.padding) ? props.padding : {};
  props.padding = {
    top: clampNumber(padding.top, 0, 64, 8),
    right: clampNumber(padding.right, 0, 64, 16),
    bottom: clampNumber(padding.bottom, 0, 64, 8),
    left: clampNumber(padding.left, 0, 64, 16),
  };

  const btnIcon = props.btnIcon;
  if (!isJsonObject(btnIcon)) {
    props.btnIcon = {
      iconSrc: "group1/M00/03/FE/wKgBCWP8EzGALm14AAAE_uQ--qo915.svg",
      iconType: "systemIcon",
    };
  } else {
    btnIcon.iconSrc = asString(btnIcon.iconSrc, "group1/M00/03/FE/wKgBCWP8EzGALm14AAAE_uQ--qo915.svg");
    btnIcon.iconType = asString(btnIcon.iconType, "systemIcon");
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

export function normalizeOptionButtonProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeButtonStyles(props);
  normalizeButtonConfig(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.rotate = clampNumber(props.rotate, -360, 360, 0);
  props.opacity = clampNumber(props.opacity, 0, 1, 1);
  props.name = asString(props.name, "操作按钮");
  props.title = asString(props.title, "操作按钮");

  return props;
}
