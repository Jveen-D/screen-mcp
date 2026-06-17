import type { JsonObject } from "../../types/component.js";

export const audioDefaultProps: JsonObject = {
  componentName: "Audio",
  name: "音频",
  title: "音频",
  assetsUploadFile: "",
  controlBar: true,
  autoPlay: false,
  loopPlay: false,
  style: {
    position: "absolute",
    left: 400,
    top: 400,
    width: 400,
    height: 55,
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
