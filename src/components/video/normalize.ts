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
  width: 280,
  height: 180,
  zIndex: 1,
};

const VIDEO_TYPES = new Set(["hls", "h265"]);

function normalizeStyle(props: JsonObject): void {
  const style = props.style;
  if (!isJsonObject(style)) {
    props.style = { ...DEFAULT_STYLE };
    return;
  }
  applyDefaults(style, DEFAULT_STYLE);
}

function normalizeVideoConfig(props: JsonObject): void {
  const videoType = String(props.videoType ?? "hls");
  props.videoType = VIDEO_TYPES.has(videoType) ? videoType : "hls";
  props.controls = typeof props.controls === "boolean" ? props.controls : false;
  props.loop = typeof props.loop === "boolean" ? props.loop : false;
  props.autoplay = typeof props.autoplay === "boolean" ? props.autoplay : false;
  props.muted = typeof props.muted === "boolean" ? props.muted : true;
  props.borderRadius = asNumber(props.borderRadius, 0);
  props.backgroundColor = asString(props.backgroundColor, "#003552");
  props.videoUrl = asString(props.videoUrl, "");
  props.uploadVideoUrl = asString(props.uploadVideoUrl, "");
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

export function normalizeVideoProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeVideoConfig(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "视频");
  props.title = asString(props.title, "视频");

  return props;
}
