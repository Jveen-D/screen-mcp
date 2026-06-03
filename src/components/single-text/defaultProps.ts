import type { JsonObject } from "../../types/component.js";

export const singleTextDefaultProps: JsonObject = {
  componentName: "SingleText",
  datasource: {
    sourceType: "externalConstant",
    constantDataType: "table",
    dataFieldPath: "0",
    constantTableColumns: [
      {
        key: "text",
        type: "string",
      },
    ],
    fieldMappings: [
      {
        key: "text",
        mapFields: [],
      },
    ],
    autoRefresh: false,
    fieldMode: "single",
    constantData: [
      {
        text: "单行文本",
      },
    ],
  },
  style: {
    width: 320,
    height: 40,
    position: "absolute",
    left: 992,
    top: 228.923582580115,
    fontFamily:
      '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    backgroundColor: "#003552",
    fontStyle: "normal",
    fontWeight: "normal",
    letterSpacing: 1,
    lineHeight: 2,
    zIndex: 501,
  },
  rotate: 0,
  opacity: 1,
  targetUrl: "",
  openBrowser: false,
  textContent: "单行文本",
  name: "单行文本",
  eventConfigures: [],
  textShadow: {
    isActive: false,
    color: "rgba(7,95,240,1)",
    x: 0,
    y: 0,
    blur: 8,
  },
  entryAnimiation: {
    isShow: false,
    type: "",
  },
};
