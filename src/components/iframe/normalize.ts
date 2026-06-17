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
  width: 600,
  height: 400,
  backgroundColor: "#003552",
  zIndex: 1,
};

const SCROLL_VALUES = new Set(["auto", "hide", "show"]);

function normalizeStyle(props: JsonObject): void {
  const style = props.style;
  if (!isJsonObject(style)) {
    props.style = { ...DEFAULT_STYLE };
    return;
  }
  applyDefaults(style, DEFAULT_STYLE);
}

function normalizeAuthority(props: JsonObject): void {
  const authority = props.authority;
  if (!isJsonObject(authority)) {
    props.authority = { camera: false, microphone: false };
    return;
  }
  authority.camera = typeof authority.camera === "boolean" ? authority.camera : false;
  authority.microphone = typeof authority.microphone === "boolean" ? authority.microphone : false;
}

function normalizeIframeConfig(props: JsonObject): void {
  props.url = asString(props.url, "");
  props.acceptEvent = typeof props.acceptEvent === "boolean" ? props.acceptEvent : true;
  const scroll = String(props.scroll ?? "auto");
  props.scroll = SCROLL_VALUES.has(scroll) ? scroll : "auto";
  props.publicDomain = asString(props.publicDomain, "");
  props.scale = asNumber(props.scale, 1);
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

export function normalizeIframeProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeAuthority(props);
  normalizeIframeConfig(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "iframe");
  props.title = asString(props.title, "iframe");

  return props;
}
