import type { JsonObject } from "../../types/component.js";

export const iframeDefaultProps: JsonObject = {
  componentName: "IFrame",
  name: "iframe",
  title: "iframe",
  url: "",
  acceptEvent: true,
  authority: {
    camera: false,
    microphone: false,
  },
  scroll: "auto",
  publicDomain: "",
  scale: 1,
  style: {
    position: "absolute",
    left: 400,
    top: 400,
    width: 600,
    height: 400,
    backgroundColor: "#003552",
    zIndex: 1,
  },
  rotate: 0,
  opacity: 1,
  eventConfigures: [],
  entryAnimiation: {
    isShow: false,
    type: "",
  },
};
