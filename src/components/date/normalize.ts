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
  width: 320,
  height: 34,
  zIndex: 1,
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontSize: 18,
  color: "#fff",
  textAlign: "center",
  fontStyle: "normal",
  fontWeight: "normal",
  letterSpacing: 1,
  lineHeight: 2,
};

const DEFAULT_FORMAT = "YYYY年M月D日 HH:mm:ss";

function normalizeStyle(props: JsonObject): void {
  const style = props.style;
  if (!isJsonObject(style)) {
    props.style = { ...DEFAULT_STYLE };
    return;
  }
  applyDefaults(style, DEFAULT_STYLE);
}

function normalizeDateFormat(props: JsonObject): void {
  if (typeof props.format !== "string" || props.format.trim() === "") {
    props.format = DEFAULT_FORMAT;
  }
  if (props.timezone !== "beijing") {
    props.timezone = "beijing";
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

export function normalizeDateProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeDateFormat(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "时间");
  props.title = asString(props.title, "时间");

  return props;
}
