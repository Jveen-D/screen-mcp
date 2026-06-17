import type { JsonObject } from "../../types/component.js";

export const markerDefaultProps: JsonObject = {
  componentName: "GaodeMap-Marker",
  name: "标牌",
  title: "标牌",
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
  opacity: 1,
  entryAnimiation: { isShow: false, type: "" },
  eventConfigures: [],
  zooms: {
    min: 2,
    max: 22,
  },
  bgConf: {
    offsetX: 0,
    offsetY: 0,
    width: 90,
    url: "group1/M00/05/4C/wKgBCWly6aWERg0nAAAAALA88RE192.png",
    height: 56,
  },
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
        key: "value",
      },
    ],
    fieldMode: "multiple",
    constantData: [
      {
        lng: 118.791836,
        value: 20,
        lat: 29.649407,
      },
      {
        lng: 119.278406,
        value: 47,
        lat: 29.69998,
      },
      {
        lng: 119.712066,
        value: 10,
        lat: 30.238858,
      },
    ],
  },
  interactionConf: {
    duration: 5,
    offsetX: 0,
    offsetY: -3,
    camDuration: 2,
    activePicUrl: "group1/M00/05/4D/wKgBCWly8H-EcqZhAAAAAOIYNm0331.png",
    width: 32,
    camAnimation: false,
    trigger: "click",
    animation: true,
    height: 53,
  },
  pointConf: {
    offsetX: 0,
    offsetY: 0,
    width: 32,
    url: "group1/M00/05/4C/wKgBCWly6aOEUxWXAAAAAOIYNm0491.png",
    height: 53,
  },
  textConf: {
    offsetX: 0,
    fontFamily: "Microsoft YaHei",
    offsetY: -3.5,
    color: "rgba(14,217,130,1)",
    fontSize: 18,
    fontStyle: "normal",
    align: "center",
    fontWeight: "bolder",
  },
  zIndex: 10,
};
