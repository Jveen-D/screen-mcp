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
  width: 185,
  height: 60,
  zIndex: 1,
};

const DEFAULT_BTN_STYLE: JsonObject = {
  iconColor: "rgba(198,228,255,1)",
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontSize: 22,
  color: "rgba(198,228,255,1)",
  textAlign: "flex-start",
  backgroundColor: "rgba(47,125,220,0.6899)",
  fontStyle: "normal",
  fontWeight: "bold",
  letterSpacing: 2,
  lineHeight: 2,
  borderWidth: 2,
  borderColor: "rgba(109,174,255,0.77)",
  borderRadius: 10,
  borderStyle: "solid",
};

const DEFAULT_HOVER_STYLE: JsonObject = {
  iconColor: "rgba(212,233,252,1)",
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontSize: 22,
  color: "rgba(212,233,252,1)",
  textAlign: "flex-start",
  backgroundColor: "rgba(47,125,220,0.85)",
  fontStyle: "normal",
  fontWeight: "bold",
  letterSpacing: 2,
  lineHeight: 2,
  borderWidth: 2,
  borderColor: "rgba(97,163,245,0.77)",
  borderRadius: 10,
  borderStyle: "solid",
};

const DEFAULT_SELECT_STYLE: JsonObject = {
  iconColor: "rgba(254,254,254,1)",
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontSize: 22,
  color: "rgba(255,255,255,1)",
  textAlign: "flex-start",
  backgroundColor: "rgba(32,111,211,0.88)",
  fontStyle: "normal",
  fontWeight: "bold",
  letterSpacing: 2,
  lineHeight: 2,
  borderWidth: 2,
  borderColor: "rgba(111,175,254,1)",
  borderRadius: 10,
  borderStyle: "solid",
};

const ARRANGES = new Set(["row", "column"]);
const TEXT_ALIGNS = new Set(["flex-start", "center", "flex-end"]);

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
  ] as const) {
    const target = props[key];
    if (!isJsonObject(target)) {
      props[key] = { ...defaults };
    } else {
      applyDefaults(target, defaults);
    }
  }
}

function normalizeButtonConfig(props: JsonObject): void {
  const arrange = String(props.arrange ?? "row");
  props.arrange = ARRANGES.has(arrange) ? arrange : "row";
  const btnTextAlign = String(props.btnTextAlign ?? "flex-start");
  props.btnTextAlign = TEXT_ALIGNS.has(btnTextAlign) ? btnTextAlign : "flex-start";
  props.btnText = asString(props.btnText, "操作按钮");
  props.showIcon = typeof props.showIcon === "boolean" ? props.showIcon : true;
  props.iconSize = asNumber(props.iconSize, 36);
  props.iconSpace = asNumber(props.iconSpace, 20);
  props.defaultSelect = typeof props.defaultSelect === "boolean" ? props.defaultSelect : false;

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

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "操作按钮");
  props.title = asString(props.title, "操作按钮");

  return props;
}
