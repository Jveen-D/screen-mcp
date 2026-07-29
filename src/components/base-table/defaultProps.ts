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
    backgroundColor: "rgba(14,18,24,0.88)",
  },
  rotate: 0,
  opacity: 1,
  lineSpace: 0,
  columnSpace: 0,
  rowCount: 100,
  carousel: false,
  carouselSpeed: 1000,
  emptyText: "暂无数据",
  headerConfig: {
    isShowHeader: true,
    fontFamily: STANDARD_FONT_FAMILY,
    fontSize: 13,
    textAlign: "center",
    color: "#F8FAFC",
    backgroundColor: "rgba(37,99,92,0.55)",
    fontStyle: "normal",
    fontWeight: "bold",
    letterSpacing: 0,
    lineHeight: 38,
  },
  rowConfig: {
    backgroundColor: "rgba(255,255,255,0.025)",
    rowLineHeight: 36,
    stripe: {
      isShow: true,
      backgroundColor: "rgba(93,124,139,0.12)",
    },
    hover: {
      isShow: true,
      backgroundColor: "rgba(45,212,191,0.16)",
    },
    selectStyle: {
      selectHighLight: true,
      fontFamily: STANDARD_FONT_FAMILY,
      fontSize: 13,
      textAlign: "center",
      color: "rgba(255,255,255,1)",
      backgroundColor: "rgba(45,212,191,0.22)",
      fontStyle: "normal",
      fontWeight: "normal",
      letterSpacing: 0,
      lineHeight: 36,
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
      columnWidth: 132,
      TextOverflow: "ellipsis",
      cellPadding: 12,
      showTooltip: true,
      fontFamily: STANDARD_FONT_FAMILY,
      fontSize: 13,
      textAlign: "left",
      color: "#D6DEE8",
      fontStyle: "normal",
      fontWeight: "normal",
      letterSpacing: 0,
    },
  },
  baseBorder: {
    isShow: true,
    borderSize: 1,
    borderColor: "rgba(94,234,212,0.35)",
  },
  outLineBorder: {
    isShow: true,
    borderSize: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  entryAnimiation: {
    isShow: false,
    type: "",
  },
  eventConfigures: [],
};
