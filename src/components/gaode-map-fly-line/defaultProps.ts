import type { JsonObject } from "../../types/component.js";

export const flyLineDefaultProps: JsonObject = {
  componentName: "GaodeMap-FlyLine",
  name: "飞线",
  title: "飞线",
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
  datasource: {
    autoRefresh: false,
    sourceType: "constant",
    fieldMappings: [
      {
        mapFields: [
          {
            path: "fromLng",
            deleted: false,
            label: "fromLng",
          },
        ],
        key: "fromLng",
      },
      {
        mapFields: [
          {
            path: "fromLat",
            deleted: false,
            label: "fromLat",
          },
        ],
        key: "fromLat",
      },
      {
        mapFields: [
          {
            path: "toLng",
            deleted: false,
            label: "toLng",
          },
        ],
        key: "toLng",
      },
      {
        mapFields: [
          {
            path: "toLat",
            deleted: false,
            label: "toLat",
          },
        ],
        key: "toLat",
      },
    ],
    fieldMode: "multiple",
    constantData: [
      {
        toLat: 30.174266,
        fromLat: 30.2536,
        fromLng: 120.213336,
        toLng: 119.109556,
      },
      {
        toLat: 30.274644,
        fromLat: 30.253749,
        fromLng: 120.213284,
        toLng: 120.488783,
      },
      {
        toLat: 30.425683,
        fromLat: 30.253825,
        fromLng: 120.213266,
        toLng: 120.03141,
      },
      {
        toLat: 29.959214,
        fromLat: 30.253624,
        fromLng: 120.213358,
        toLng: 119.739837,
      },
      {
        toLat: 29.430857,
        fromLat: 30.256287,
        fromLng: 120.21395,
        toLng: 118.617522,
      },
    ],
  },
  pulseLink: {
    curve: 0.3,
    randomSpeed: true,
    flowLength: 50,
    headColor: "rgba(16,155,255,1)",
    lineColor: "rgba(53,178,255,0.16)",
    trailColor: "rgba(22,236,250,0.1)",
    lineWidth: 5,
    speed: 20,
    zIndex: 100,
  },
  scatter: {
    duration: 1500,
    random: true,
    visible: true,
    size: 4000,
    color: "rgba(22,236,250,0.8)",
  },
};
