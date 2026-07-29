import type { JsonObject } from "../../types/component.js";

export const dynamicTextDefaultProps: JsonObject = {
  componentName: "DynamicText",
  textValue: 1234,
  prefixTitle: "",
  affixTitle: "",
  textOverflow: "ellipsis",
  verticalAlign: "center",
  valueFormat: {
    precision: 0,
    useGrouping: true,
    nullText: "--",
  },
  chartData: {
    isPolling: false,
    indicator: [
      {
        fieldDataConfig: {
          calculateType: "SUM",
          format: {
            numberFormat: "numerical",
            Millimeter: false,
            accuracy: 0,
            dataFix: {
              preFix: "",
              auFix: "",
            },
          },
          chartDisplayName: "数值",
        },
        fieldName: "value",
        fieldDisplayName: "value",
        fieldType: "DECIMAL",
      },
    ],
    constant: {
      data: [{ value: 1234 }],
      originalData: [{ value: 1234 }],
      fieldList: [
        {
          fieldName: "value",
          fieldDisplayName: "value",
          fieldType: "DECIMAL",
        },
      ],
    },
    form: {
      formPermType: "All",
      formUuid: "",
      formName: "",
    },
    sourceType: "constant",
    api: {
      headers: [],
      processFunction: "function handleResponse (response) { return response }",
      requestBody: "",
      requestParam: [],
      fieldList: [],
      apiUuid: "",
    },
    polling: 3,
  },
  style: {
    width: 220,
    height: 40,
    position: "absolute",
    left: 992,
    top: 228.923582580115,
    fontFamily:
      '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
    fontSize: 24,
    color: "#F4FBFF",
    textAlign: "left",
    backgroundColor: "rgba(0,0,0,0)",
    fontStyle: "normal",
    fontWeight: "bold",
    letterSpacing: 0,
    lineHeight: 1.2,
    zIndex: 501,
  },
  rotate: 0,
  opacity: 1,
  targetUrl: "",
  openBrowser: false,
  name: "动态文本",
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
