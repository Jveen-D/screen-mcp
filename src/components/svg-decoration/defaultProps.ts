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
  svgSource: "preset",
  svgPreset: "icon-Frame3",
  svgContent:
    '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">\n  <path d="M160 512h176l80-192h192l80 192h176M160 680h724" fill="none" stroke="#22d3ff" stroke-linecap="round" stroke-linejoin="round" stroke-width="80" />\n</svg>',
  svgFit: "contain",
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
