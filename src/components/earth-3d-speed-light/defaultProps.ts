import type { JsonObject } from "../../types/component.js";

export const earth3dSpeedLightDefaultProps: JsonObject = {
  componentName: "Earth3D-SpeedLight",
  name: "扫描线",
  title: "扫描线",
  earth3DId: "",
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    zIndex: 507,
  },
  rotate: 0,
  opacity: 1,
  entryAnimiation: { isShow: false, type: "" },
  lng: 116.4074,
  lat: 39.9042,
  speedLightColor: "rgba(144,166,255,1)",
  eventConfigures: [],
};
