import type { JsonObject } from "../../types/component.js";

export const svgDecorationDefaultProps: JsonObject = {
  componentName: "SvgDecoration",
  style: {
    width: 240,
    height: 120,
    position: "absolute",
    left: 1337.2813349345804,
    top: 301.63049111939824,
    backgroundColor: "rgba(0,0,0,0)",
    zIndex: 503,
  },
  rotate: 0,
  opacity: 1,
  entryAnimiation: {
    isShow: false,
    type: "",
  },
  targetUrl: "",
  openBrowser: false,
  svgSource: "custom",
  svgPreset: "",
  svgContent: "",
  svgFit: "contain",
  layerRole: "decoration",
  primaryColor: "",
  secondaryColor: "",
  accentColor: "",
  strokeWidth: 2,
  flipX: false,
  flipY: false,
  glow: {
    isActive: false,
    color: "",
    blur: 8,
  },
  name: "SVG装饰",
};
