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
      count: asNumber(item.value, 0),
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
          key: "count",
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
        key: "count",
        mapFields: [{ path: "value", deleted: false, label: "value" }],
      },
    ];
  }

  if (!Array.isArray(datasource.constantData)) {
    datasource.constantData = [
      { lng: 120.074011, lat: 30.00457, count: 74 },
      { lng: 119.516684, lat: 29.696415, count: 52 },
    ];
  }
}

export function normalizeHeatMapProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);
  normalizeDatasource(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 0.2);
  props.name = asString(props.name, "热力聚合");
  props.title = asString(props.title, "热力聚合");
  props.mapId = asString(props.mapId, "");
  props.radius = asNumber(props.radius, 33);
  props.gradient = asString(
    props.gradient,
    "linear-gradient(90deg, rgb(222,245,255) 0%, rgb(52,226,167) 25%, rgb(255,212,38) 62%, rgb(255,94,17) 100%)",
  );

  return props;
}
