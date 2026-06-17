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
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  zIndex: 507,
};

function normalizeStyle(props: JsonObject): void {
  const style = props.style;
  if (!isJsonObject(style)) {
    props.style = { ...DEFAULT_STYLE };
    return;
  }
  applyDefaults(style, DEFAULT_STYLE);
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

export function normalizeEarth3dSpeedLightProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "扫描线");
  props.title = asString(props.title, "扫描线");
  props.earth3DId = asString(props.earth3DId, "");
  props.lng = asNumber(props.lng, 116.4074);
  props.lat = asNumber(props.lat, 39.9042);
  props.speedLightColor = asString(props.speedLightColor, "rgba(144,166,255,1)");

  return props;
}
