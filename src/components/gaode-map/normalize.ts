import type { JsonObject } from "../../types/component.js";
import {
  applyDefaults,
  asNumber,
  asString,
  DEFAULT_ENTRY_ANIMATION,
  isJsonObject,
} from "../form-utils.js";

const DEFAULT_STYLE: JsonObject = {
  backgroundColor: "transparent",
  top: 0,
  left: 0,
  width: 1920,
  position: "absolute",
  height: 1080,
  zIndex: 91,
};

const DEFAULT_MAP_CONF: JsonObject = {
  showRoad: true,
  styleType: "default",
  showBuilding: true,
  showPoint: true,
  draggable: false,
  defaultStyleId: "amap://styles/darkblue",
  customStyleId: "blue",
  latitude: 29.9,
  zoom: 8.5,
  longitude: 119.520792,
  toolbarPosition: "LT",
  showToolbar: true,
};

const DEFAULT_AUTH_CONFIG: JsonObject = {
  jsCode: "69aab09045ace310eb0443df41e14843",
  key: "054e1dedcbc8d653d2e2247c72288de1",
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

function normalizeNestedObjects(props: JsonObject): void {
  if (!isJsonObject(props.mapConf)) {
    props.mapConf = { ...DEFAULT_MAP_CONF };
  } else {
    applyDefaults(props.mapConf as JsonObject, DEFAULT_MAP_CONF);
  }

  if (!isJsonObject(props.authConfig)) {
    props.authConfig = { ...DEFAULT_AUTH_CONFIG };
  } else {
    applyDefaults(props.authConfig as JsonObject, DEFAULT_AUTH_CONFIG);
  }
}

export function normalizeGaodeMapProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);
  normalizeNestedObjects(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "2D高德地图");
  props.title = asString(props.title, "2D高德地图");

  return props;
}
