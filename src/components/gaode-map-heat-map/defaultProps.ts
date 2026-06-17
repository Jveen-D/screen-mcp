import type { JsonObject } from "../../types/component.js";

export const heatMapDefaultProps: JsonObject = {
  componentName: "GaodeMap-HeatMap",
  name: "热力聚合",
  title: "热力聚合",
  mapId: "",
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    zIndex: 10,
  },
  rotate: 0,
  opacity: 0.2,
  entryAnimiation: { isShow: false, type: "" },
  eventConfigures: [],
  zooms: {
    min: 2,
    max: 22,
  },
  gradient: "linear-gradient(90deg, rgb(222,245,255) 0%, rgb(52,226,167) 25%, rgb(255,212,38) 62%, rgb(255,94,17) 100%)",
  zIndex: 10,
  radius: 33,
  datasource: {
    autoRefresh: false,
    sourceType: "constant",
    fieldMappings: [
      {
        mapFields: [
          {
            path: "lng",
            deleted: false,
            label: "lng",
          },
        ],
        key: "lng",
      },
      {
        mapFields: [
          {
            path: "lat",
            deleted: false,
            label: "lat",
          },
        ],
        key: "lat",
      },
      {
        mapFields: [
          {
            path: "value",
            deleted: false,
            label: "value",
          },
        ],
        key: "count",
      },
    ],
    fieldMode: "multiple",
    constantData: [
      {
        lng: 120.074011,
        adcode: 330111,
        district: "富阳区",
        value: 74,
        lat: 30.00457,
      },
      {
        lng: 119.516684,
        adcode: 330122,
        district: "桐庐县",
        value: 52,
        lat: 29.696415,
      },
      {
        lng: 119.474051,
        adcode: 330182,
        district: "建德市",
        value: 73,
        lat: 29.711463,
      },
      {
        lng: 120.564791,
        adcode: 330109,
        district: "萧山区",
        value: 22,
        lat: 30.194206,
      },
      {
        lng: 120.03415,
        adcode: 330111,
        district: "富阳区",
        value: 95,
        lat: 29.930934,
      },
    ],
  },
};
