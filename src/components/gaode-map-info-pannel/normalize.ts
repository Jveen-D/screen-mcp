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
      value1: asString(item.value1, ""),
      value2: asNumber(item.value2, 0),
      value3: asString(item.value3, ""),
      state: asString(item.state, ""),
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
          mapFields: [
            { path: "value1", deleted: false, label: "value1" },
            { path: "value2", deleted: false, label: "value2" },
            { path: "value3", deleted: false, label: "value3" },
          ],
        },
        {
          key: "state",
          mapFields: [{ path: "state", deleted: false, label: "state" }],
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
        mapFields: [
          { path: "value1", deleted: false, label: "value1" },
          { path: "value2", deleted: false, label: "value2" },
          { path: "value3", deleted: false, label: "value3" },
        ],
      },
      {
        key: "state",
        mapFields: [{ path: "state", deleted: false, label: "state" }],
      },
    ];
  }

  if (!Array.isArray(datasource.constantData)) {
    datasource.constantData = [
      { value2: 173, lng: 118.870825, value1: "监测点#02", value3: "优", state: "优", lat: 29.607539 },
      { value2: 51, lng: 120.22345, value1: "监测点#03", value3: "良", state: "良", lat: 30.434644 },
    ];
  }
}

export function normalizeInfoPannelProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);
  normalizeDatasource(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "信息面板");
  props.title = asString(props.title, "信息面板");
  props.mapId = asString(props.mapId, "");

  return props;
}
