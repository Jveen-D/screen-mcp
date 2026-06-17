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
  width: 1000,
  height: 800,
  zIndex: 1,
};

const DEFAULT_TEXTURE: JsonObject = {
  type: "light",
  customUrl: "",
  cloudShow: true,
  cloudSpeed: 0.6,
  cloudOpacity: 0.49,
  cloudDirection: "ccw",
};

const DEFAULT_STAR_BG: JsonObject = {
  show: true,
  autoRotate: true,
  speed: 1,
  direction: "clockwise",
};

const DEFAULT_OUT_ATMOSPHERE: JsonObject = {
  show: true,
  color: "rgba(13,183,248,1)",
  opacity: 0.13,
  speed: 1,
  direction: "clockwise",
};

const DEFAULT_GLOW: JsonObject = {
  open: true,
  color: "#d07a36",
  strength: 175,
  opacity: 100,
};

const DEFAULT_BACK_LIGHT: JsonObject = {
  open: true,
  color: "rgba(61,183,248,1)",
  opacity: 0.64,
};

const DEFAULT_STROKE: JsonObject = {
  open: true,
  outline: true,
  outlineColor: "#DDE9EE",
  lineColor: "#DDE9EE",
  outlineSpeed: 50,
};

const DEFAULT_AMBIENT_LIGHT: JsonObject = {
  show: true,
  color: "#ffffff",
  intensity: 2,
};

const DEFAULT_SHUTTLE: JsonObject = {
  isShow: true,
  destroyAnimation: false,
  trigger: ["code"],
  longitude: 116.4074,
  latitude: 39.9042,
  startZoom: 1600,
  endZoom: 800,
  duration: 1000,
};

const DEFAULT_BACKGROUND_IMAGE: JsonObject = {
  type: "custom",
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
  if (!isJsonObject(props.texture)) {
    props.texture = { ...DEFAULT_TEXTURE };
  } else {
    applyDefaults(props.texture as JsonObject, DEFAULT_TEXTURE);
  }

  if (!isJsonObject(props.starBg)) {
    props.starBg = { ...DEFAULT_STAR_BG };
  } else {
    applyDefaults(props.starBg as JsonObject, DEFAULT_STAR_BG);
  }

  if (!isJsonObject(props.outAtmosphere)) {
    props.outAtmosphere = { ...DEFAULT_OUT_ATMOSPHERE };
  } else {
    applyDefaults(props.outAtmosphere as JsonObject, DEFAULT_OUT_ATMOSPHERE);
  }

  if (!isJsonObject(props.glow)) {
    props.glow = { ...DEFAULT_GLOW };
  } else {
    applyDefaults(props.glow as JsonObject, DEFAULT_GLOW);
  }

  if (!isJsonObject(props.backLight)) {
    props.backLight = { ...DEFAULT_BACK_LIGHT };
  } else {
    applyDefaults(props.backLight as JsonObject, DEFAULT_BACK_LIGHT);
  }

  if (!isJsonObject(props.stroke)) {
    props.stroke = { ...DEFAULT_STROKE };
  } else {
    applyDefaults(props.stroke as JsonObject, DEFAULT_STROKE);
  }

  if (!isJsonObject(props.ambientLight)) {
    props.ambientLight = { ...DEFAULT_AMBIENT_LIGHT };
  } else {
    applyDefaults(props.ambientLight as JsonObject, DEFAULT_AMBIENT_LIGHT);
  }

  if (!isJsonObject(props.shuttle)) {
    props.shuttle = { ...DEFAULT_SHUTTLE };
  } else {
    applyDefaults(props.shuttle as JsonObject, DEFAULT_SHUTTLE);
  }

  if (!isJsonObject(props.backgroundImage)) {
    props.backgroundImage = { ...DEFAULT_BACKGROUND_IMAGE };
  } else {
    applyDefaults(props.backgroundImage as JsonObject, DEFAULT_BACKGROUND_IMAGE);
  }
}

export function normalizeEarth3dProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);
  normalizeNestedObjects(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "3D地球");
  props.title = asString(props.title, "3D地球");
  props.longitude = asNumber(props.longitude, 116.4074);
  props.latitude = asNumber(props.latitude, 39.9042);
  props.cameraDistance = asNumber(props.cameraDistance, 10);
  props.earthRadius = asNumber(props.earthRadius, 400);

  return props;
}
