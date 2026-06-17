import type { JsonObject } from "../../types/component.js";

export const videoDefaultProps: JsonObject = {
  componentName: "Video",
  name: "视频",
  title: "视频",
  videoUrl: "",
  videoType: "hls",
  controls: false,
  loop: false,
  autoplay: false,
  muted: true,
  uploadVideoUrl: "",
  borderRadius: 0,
  backgroundColor: "#003552",
  style: {
    position: "absolute",
    left: 400,
    top: 400,
    width: 280,
    height: 180,
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
