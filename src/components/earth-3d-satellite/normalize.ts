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
  zIndex: 508,
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

export function normalizeEarth3dSatelliteProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "卫星");
  props.title = asString(props.title, "卫星");
  props.earth3DId = asString(props.earth3DId, "");
  props.satelliteColor = asString(props.satelliteColor, "rgba(61,183,248,1)");
  props.satelliteOpacity = asNumber(props.satelliteOpacity, 0.5);
  props.satelliteXRotation = asNumber(props.satelliteXRotation, 90);
  props.satelliteYRotation = asNumber(props.satelliteYRotation, 0);
  props.satelliteZRotation = asNumber(props.satelliteZRotation, 0);
  props.orbitColor = asString(props.orbitColor, "rgba(61,183,248,1)");
  props.orbitOpacity = asNumber(props.orbitOpacity, 1);
  props.orbitRadius = asNumber(props.orbitRadius, 950);
  props.orbitXRotation = asNumber(props.orbitXRotation, 30);
  props.orbitYRotation = asNumber(props.orbitYRotation, 10);
  props.orbitZRotation = asNumber(props.orbitZRotation, 0);

  return props;
}
