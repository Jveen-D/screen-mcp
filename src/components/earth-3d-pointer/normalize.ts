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
  zIndex: 509,
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
    const lng = asNumber(item.lng, 0);
    const lat = asNumber(item.lat, 0);
    const title = asString(item.title, "");
    result.push({ lng, lat, title });
  }
  return result;
}

function normalizeDatasource(props: JsonObject): void {
  const aiData = props.data;
  const rows = normalizeDataRows(aiData);

  if (rows.length > 0) {
    props.datasource = {
      sourceType: "constant",
      autoRefresh: false,
      fieldMode: "multiple",
      fieldMappings: [
        {
          key: "lng",
          mapFields: [{ path: "lng", label: "lng", deleted: false }],
        },
        {
          key: "lat",
          mapFields: [{ path: "lat", label: "lat", deleted: false }],
        },
        {
          key: "title",
          mapFields: [{ path: "title", label: "title", deleted: false }],
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

  datasource.sourceType = "constant";
  datasource.autoRefresh = false;
  datasource.fieldMode = "multiple";

  if (!Array.isArray(datasource.fieldMappings)) {
    datasource.fieldMappings = [
      {
        key: "lng",
        mapFields: [{ path: "lng", label: "lng", deleted: false }],
      },
      {
        key: "lat",
        mapFields: [{ path: "lat", label: "lat", deleted: false }],
      },
    ];
  }

  if (!Array.isArray(datasource.constantData)) {
    datasource.constantData = [
      { lng: 116.4074, title: "北京", lat: 39.9042 },
      { lng: 121.4737, title: "上海", lat: 31.2304 },
      { lng: 113.2644, title: "广州", lat: 23.1291 },
    ];
  }
}

export function normalizeEarth3dPointerProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);
  normalizeDatasource(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "标记点");
  props.title = asString(props.title, "标记点");
  props.earth3DId = asString(props.earth3DId, "");
  props.pointerColor = asString(props.pointerColor, "#109bff");
  props.pointerOpacity = asNumber(props.pointerOpacity, 1);

  return props;
}
