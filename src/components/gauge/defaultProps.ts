import type { JsonObject } from "../../types/component.js";

export const gaugeDefaultProps: JsonObject = {
  componentName: "Gauge",
  name: "仪表盘",
  value: 78,
  style: {
    position: "absolute",
    top: 100,
    left: 100,
    width: 397,
    height: 365,
    backgroundColor: "transparent",
    zIndex: 91,
  },
  rotate: 0,
  opacity: 1,
  entryAnimiation: {
    isShow: false,
    type: "",
  },
  datasource: {
    sourceType: "constant",
    constantDataType: "table",
    autoRefresh: false,
    constantTableColumns: [
      {
        type: "number",
        key: "value",
      },
    ],
    fieldMappings: [
      {
        key: "value",
        mapFields: [
          {
            path: "value",
          },
        ],
      },
    ],
    constantData: [
      {
        value: 78,
      },
    ],
  },
  dialConfig: {
    outRadius: 0.76,
    innerRadius: 0.64,
    graduationColor: "rgba(230, 247, 255, 0.5)",
    graduationCount: 5,
    graduationThickness: 1,
    graduationLength: 22,
    labelColor: "rgba(230, 247, 255, 0.7)",
    labelFontSize: 12,
    labelFontWeight: "normal",
    labelFontStyle: "normal",
    labelFontFamily:
      '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
    labelRadialOffset: 0,
    pointerColor: "rgb(230, 247, 255)",
    pointerLength: 0.9,
    pointerWidth: 6,
    pointerDotColor: "rgba(230, 247, 255, 0.3)",
    pointerDotSize: 25,
  },
  indicatorConfig: {
    open: true,
    minValue: 0,
    maxValue: 100,
    valueFontSize: 32,
    valueColor: "rgb(230, 247, 255)",
    valueFontWeight: "normal",
    valueFontStyle: "normal",
    valueFontFamily:
      '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
    valueOffsetX: 0,
    valueOffsetY: 50,
    precision: 0,
    suffix: "km/h",
    suffixOffsetX: 0,
    suffixOffsetY: 0,
    useCustomSuffixStyle: true,
    suffixFontSize: 16,
    suffixColor: "rgb(255, 255, 255)",
    suffixFontWeight: "normal",
    suffixFontStyle: "normal",
    suffixFontFamily:
      '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  },
  animation: {
    open: true,
    duration: 800,
  },
  defaultRingColor: "#1e90ff",
  ringRangeColor: [
    {
      startValue: 0,
      endValue: 0.33,
      color: "#1e90ff",
    },
    {
      startValue: 0.33,
      endValue: 0.66,
      color: "#2fe0e0",
    },
    {
      startValue: 0.66,
      endValue: 1,
      color: "#ff4d4f",
    },
  ],
  eventConfigures: [],
};
