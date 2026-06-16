import type { JsonObject } from "../../types/component.js";

const STANDARD_FONT_FAMILY =
  '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif';

const DEFAULT_DATA = [
  { name: "设备1", value: 101 },
  { name: "设备2", value: 72 },
  { name: "设备3", value: 135 },
];

export const baseTableDefaultProps: JsonObject = {
  componentName: "BaseTable",
  name: "基础表格",
  chartData: {
    isPolling: false,
    indicator: [
      {
        fieldDataConfig: {
          calculateType: "COUNT",
          chartDisplayName: "名称",
        },
        fieldName: "name",
        fieldDisplayName: "name",
        fieldType: "LONGTEXT",
      },
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
      data: DEFAULT_DATA,
      originalData: DEFAULT_DATA.map((item) => ({ ...item })),
      fieldList: [
        {
          fieldName: "name",
          fieldDisplayName: "name",
          fieldType: "LONGTEXT",
        },
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
    dimension: [],
  },
  style: {
    position: "absolute",
    left: 80,
    top: 160,
    width: 520,
    height: 280,
    zIndex: 1,
    backgroundColor: "#324e6b",
  },
  rotate: 0,
  opacity: 1,
  lineSpace: 0,
  columnSpace: 0,
  rowCount: 100,
  carousel: false,
  carouselSpeed: 1000,
  headerConfig: {
    isShowHeader: true,
    fontFamily: STANDARD_FONT_FAMILY,
    fontSize: 12,
    textAlign: "center",
    color: "rgba(235, 245, 255, 1)",
    backgroundColor: "rgba(80,166,220,0.4)",
    fontStyle: "normal",
    fontWeight: "bold",
    letterSpacing: 1,
    lineHeight: 32,
  },
  rowConfig: {
    backgroundColor: "rgba(80,166,220,0.1)",
    rowLineHeight: 34,
    selectStyle: {
      selectHighLight: true,
      fontFamily: STANDARD_FONT_FAMILY,
      fontSize: 12,
      textAlign: "center",
      color: "rgba(255,255,255,1)",
      backgroundColor: "rgba(68,177,253,0.1686)",
      fontStyle: "normal",
      fontWeight: "normal",
      letterSpacing: 1,
      lineHeight: 34,
    },
  },
  columnConfig: {
    sequenceCol: {
      isShowCount: false,
      title: "序号",
      startNum: 1,
      columnWidth: 50,
      textAlign: "center",
    },
    ordinaryCol: {
      columnWidth: 129,
      TextOverflow: "ellipsis",
      fontFamily: STANDARD_FONT_FAMILY,
      fontSize: 12,
      textAlign: "center",
      color: "rgba(159, 192, 222, 1)",
      fontStyle: "normal",
      fontWeight: "normal",
      letterSpacing: 1,
    },
  },
  baseBorder: {
    isShow: true,
    borderSize: 1,
    borderColor: "rgba(76,117,141,1)",
  },
  outLineBorder: {
    isShow: true,
    borderSize: 1,
    borderColor: "rgba(76,117,141,0.247)",
  },
  entryAnimiation: {
    isShow: false,
    type: "",
  },
  eventConfigures: [],
};
