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
      fromLng: asNumber(item.fromLng, 0),
      fromLat: asNumber(item.fromLat, 0),
      toLng: asNumber(item.toLng, 0),
      toLat: asNumber(item.toLat, 0),
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
          key: "fromLng",
          mapFields: [{ path: "fromLng", deleted: false, label: "fromLng" }],
        },
        {
          key: "fromLat",
          mapFields: [{ path: "fromLat", deleted: false, label: "fromLat" }],
        },
        {
          key: "toLng",
          mapFields: [{ path: "toLng", deleted: false, label: "toLng" }],
        },
        {
          key: "toLat",
          mapFields: [{ path: "toLat", deleted: false, label: "toLat" }],
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
        key: "fromLng",
        mapFields: [{ path: "fromLng", deleted: false, label: "fromLng" }],
      },
      {
        key: "fromLat",
        mapFields: [{ path: "fromLat", deleted: false, label: "fromLat" }],
      },
      {
        key: "toLng",
        mapFields: [{ path: "toLng", deleted: false, label: "toLng" }],
      },
      {
        key: "toLat",
        mapFields: [{ path: "toLat", deleted: false, label: "toLat" }],
      },
    ];
  }

  if (!Array.isArray(datasource.constantData)) {
    datasource.constantData = [
      { toLat: 30.174266, fromLat: 30.2536, fromLng: 120.213336, toLng: 119.109556 },
      { toLat: 30.274644, fromLat: 30.253749, fromLng: 120.213284, toLng: 120.488783 },
    ];
  }
}

export function normalizeFlyLineProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);
  normalizeDatasource(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "飞线");
  props.title = asString(props.title, "飞线");
  props.mapId = asString(props.mapId, "");

  return props;
}
