import type { JsonObject } from "../../types/component.js";

export const pieChartDefaultProps: JsonObject = {
  componentName: "PieChart",
  rotate: 0,
  chartData: {
    isPolling: false,
    indicator: [
      {
        fieldDataConfig: {
          calculateType: "SUM",
          format: {
            numberFormat: "numerical",
            Millimeter: false,
            accuracy: 2,
            dataFix: {
              preFix: "",
              auFix: "",
            },
          },
          chartDisplayName: "value",
        },
        fieldName: "value",
        fieldDisplayName: "value",
        fieldType: "DECIMAL",
      },
    ],
    constant: {
      data: [
        { name: "Category 1", type: "Series", value: 101 },
        { name: "Category 2", type: "Series", value: 71 },
        { name: "Category 3", type: "Series", value: 121 },
        { name: "Category 4", type: "Series", value: 95 },
        { name: "Category 5", type: "Series", value: 141 },
        { name: "Category 6", type: "Series", value: 96 },
      ],
      originalData: [
        { name: "Category 1", type: "Series", value: 101 },
        { name: "Category 2", type: "Series", value: 71 },
        { name: "Category 3", type: "Series", value: 121 },
        { name: "Category 4", type: "Series", value: 95 },
        { name: "Category 5", type: "Series", value: 141 },
        { name: "Category 6", type: "Series", value: 96 },
      ],
      fieldList: [
        {
          fieldName: "name",
          fieldDisplayName: "name",
          fieldType: "LONGTEXT",
        },
        {
          fieldName: "type",
          fieldDisplayName: "type",
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
    dimension: [
      {
        fieldDataConfig: {
          calculateType: "COUNT",
          chartDisplayName: "name",
        },
        fieldName: "name",
        fieldDisplayName: "name",
        fieldType: "LONGTEXT",
      },
    ],
  },
  eventConfigures: [],
  advanced: true,
  entryAnimiation: {
    type: "",
    isShow: false,
  },
  name: "Pie Chart",
  style: {
    top: 72,
    left: 669,
    width: 400,
    position: "absolute",
    height: 226,
    zIndex: 500,
  },
  opacity: 1,
  option: {
    backgroundColor: "#003552cf",
    color: [
      "#5470c6",
      "#fac858",
      "#ee6666",
      "#73c0de",
      "#3ba272",
      "#fc8452",
      "#9a60b4",
      "#ea7ccc",
    ],
    animiation: {
      show: false,
      type: "",
    },
    legend: {
      top: "top",
      orient: "horizontal",
      left: "center",
      itemHeight: 12,
      show: true,
      icon: "circle",
      itemWidth: 18,
      textStyle: {
        fontFamily: "serif",
        color: "#ffffff",
        fontSize: 11,
        fontStyle: "italic",
        fontWeight: "bold",
      },
    },
    series: [
      {
        hoverAnimation: false,
        left: 10,
        center: ["50%", "50%"],
        name: "",
        itemStyle: {
          borderType: "solid",
          borderColor: "#666666",
          shadowBlur: 0,
          borderWidth: 2,
          shadowColor: "#fff",
        },
        mapName: "",
        label: {
          formatter: "{b}:{c}",
          fontFamily: "serif",
          color: "#ffffff",
          show: true,
          fontSize: 14,
          position: "outside",
          fontStyle: "normal",
          fontWeight: "bold",
        },
        labelLine: {
          length2: 40,
          show: true,
          length: 22,
        },
        type: "pie",
        radius: ["0%", "60%"],
      },
    ],
    tooltip: {
      backgroundColor: "#333",
      show: true,
      axisPointer: {
        label: {
          show: false,
        },
        type: "shadow",
      },
      textStyle: {
        fontFamily: "serif",
        color: "#fff",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "normal",
      },
    },
  },
};
