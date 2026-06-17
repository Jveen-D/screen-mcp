import type { JsonObject } from "../../types/component.js";

export const earth3dPointerDefaultProps: JsonObject = {
  componentName: "Earth3D-Pointer",
  name: "标记点",
  title: "标记点",
  earth3DId: "",
  pointerColor: "#109bff",
  pointerOpacity: 1,
  datasource: {
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
    ],
    constantData: [
      { lng: 116.4074, title: "北京", lat: 39.9042 },
      { lng: 121.4737, title: "上海", lat: 31.2304 },
      { lng: 113.2644, title: "广州", lat: 23.1291 },
    ],
  },
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    zIndex: 509,
  },
  rotate: 0,
  opacity: 1,
  entryAnimiation: { isShow: false, type: "" },
  eventConfigures: [],
};
