import type { JsonObject, JsonValue } from "../../types/component.js";
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
  zIndex: 5,
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

function normalizePolygonCoordinates(value: JsonValue | undefined): JsonValue[] | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined;
  }

  const result: JsonValue[] = [];
  for (const item of value) {
    if (!Array.isArray(item) || item.length < 2) {
      continue;
    }
    const first = item[0];
    if (Array.isArray(first)) {
      const ring: JsonValue[] = [];
      for (const point of item) {
        if (Array.isArray(point) && point.length >= 2) {
          ring.push([asNumber(point[0], 0), asNumber(point[1], 0)]);
        }
      }
      if (ring.length > 0) {
        result.push(ring);
      }
    } else {
      result.push([asNumber(item[0], 0), asNumber(item[1], 0)]);
    }
  }
  return result.length > 0 ? result : undefined;
}

function normalizeDatasource(props: JsonObject): void {
  const aiData = props.data;
  const coordinates = normalizePolygonCoordinates(aiData);

  if (coordinates) {
    props.datasource = { "0": coordinates };
    return;
  }

  let datasource = props.datasource;
  if (!isJsonObject(datasource)) {
    datasource = {};
    props.datasource = datasource;
  }

  if (!Array.isArray(datasource["0"])) {
    datasource["0"] = [
      [
        [120.501036, 30.04866],
        [120.40393, 30.105801],
        [120.291287, 30.09572],
      ],
    ];
  }
}

export function normalizePolygonProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);
  normalizeDatasource(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "多边形");
  props.title = asString(props.title, "多边形");
  props.mapId = asString(props.mapId, "");
  props.fillColor = asString(props.fillColor, "rgba(137,148,144,0.2)");
  props.borderColor = asString(props.borderColor, "rgba(22,236,250,1)");
  props.borderWidth = asNumber(props.borderWidth, 1.5);
  props.borderType = asString(props.borderType, "dashed");
  props.showBorder = typeof props.showBorder === "boolean" ? props.showBorder : true;

  return props;
}
