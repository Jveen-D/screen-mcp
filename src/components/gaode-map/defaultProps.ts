import type { JsonObject } from "../../types/component.js";

export const gaodeMapDefaultProps: JsonObject = {
  componentName: "GaodeMap",
  name: "2D高德地图",
  title: "2D高德地图",
  style: {
    backgroundColor: "transparent",
    top: 0,
    left: 0,
    width: 1920,
    position: "absolute",
    height: 1080,
    zIndex: 91,
  },
  rotate: 0,
  opacity: 1,
  entryAnimiation: { isShow: false, type: "" },
  mapConf: {
    showRoad: true,
    styleType: "default",
    showBuilding: true,
    showPoint: true,
    draggable: false,
    defaultStyleId: "amap://styles/darkblue",
    customStyleId: "blue",
    latitude: 29.9,
    zoom: 8.5,
    longitude: 119.520792,
    toolbarPosition: "LT",
    showToolbar: true,
  },
  authConfig: {
    jsCode: "69aab09045ace310eb0443df41e14843",
    key: "054e1dedcbc8d653d2e2247c72288de1",
  },
  eventConfigures: [],
};
