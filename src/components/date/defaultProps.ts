import type { JsonObject } from "../../types/component.js";

export const dateDefaultProps: JsonObject = {
  componentName: "Date",
  name: "时间",
  title: "时间",
  timezone: "beijing",
  format: "YYYY年M月D日 HH:mm:ss",
  style: {
    position: "absolute",
    left: 400,
    top: 400,
    width: 320,
    height: 34,
    zIndex: 1,
    fontFamily:
      '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    fontStyle: "normal",
    fontWeight: "normal",
    letterSpacing: 1,
    lineHeight: 2,
  },
  rotate: 0,
  opacity: 1,
  entryAnimiation: {
    isShow: false,
    type: "",
  },
  eventConfigures: [],
};
