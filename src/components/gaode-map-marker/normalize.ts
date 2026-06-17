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
  zIndex: 10,
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

function normalizeDataRows(value: JsonValue | undefined): JsonObject[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [];
  }

  const result: JsonObject[] = [];
  for (const item of value) {
    if (!isJsonObject(item)) {
      continue;
    }
    result.push({
      lng: asNumber(item.lng, 0),
      lat: asNumber(item.lat, 0),
      value: asNumber(item.value, 0),
    });
  }
  return result;
}

function normalizeDatasource(props: JsonObject): void {
  const aiData = props.data;
  const rows = normalizeDataRows(aiData);

  if (rows.length > 0) {
    props.datasource = {
      autoRefresh: false,
      sourceType: "constant",
      fieldMode: "multiple",
      fieldMappings: [
        {
          key: "lng",
          mapFields: [{ path: "lng", deleted: false, label: "lng" }],
        },
        {
          key: "lat",
          mapFields: [{ path: "lat", deleted: false, label: "lat" }],
        },
        {
          key: "value",
          mapFields: [{ path: "value", deleted: false, label: "value" }],
        },
      ],
      constantData: rows,
    };
    delete props.data;
    return;
  }

  let datasource = props.datasource;
  if (!isJsonObject(datasource)) {
    datasource = {};
    props.datasource = datasource;
  }

  datasource.autoRefresh = false;
  datasource.sourceType = "constant";
  datasource.fieldMode = "multiple";

  if (!Array.isArray(datasource.fieldMappings)) {
    datasource.fieldMappings = [
      {
        key: "lng",
        mapFields: [{ path: "lng", deleted: false, label: "lng" }],
      },
      {
        key: "lat",
        mapFields: [{ path: "lat", deleted: false, label: "lat" }],
      },
      {
        key: "value",
        mapFields: [{ path: "value", deleted: false, label: "value" }],
      },
    ];
  }

  if (!Array.isArray(datasource.constantData)) {
    datasource.constantData = [
      { lng: 118.791836, value: 20, lat: 29.649407 },
      { lng: 119.278406, value: 47, lat: 29.69998 },
    ];
  }
}

export function normalizeMarkerProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);
  normalizeDatasource(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "标牌");
  props.title = asString(props.title, "标牌");
  props.mapId = asString(props.mapId, "");

  return props;
}
