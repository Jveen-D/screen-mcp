import type { JsonObject } from "../../types/component.js";

export const liquidFillDefaultProps: JsonObject = {
  componentName: "LiquidFill",
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
      data: [{ name: "占比", value: 0.43 }],
      originalData: [{ name: "占比", value: 0.43 }],
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
  name: "水球图",
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
    backgroundColor: "rgba(0,0,0,0)",
    color: [
      "#88E9FE",
      "#16d4fe",
      "#16d4fe",
      "#f5a623",
      "#b8e986",
      "#f8e71c",
      "#ee6666",
      "#9013fe",
    ],
    tooltip: {
      show: true,
      backgroundColor: "#0000007f",
      borderColor: "rgba(0,0,0,0)",
      borderWidth: 2,
      textStyle: {
        color: "#fff",
        fontStyle: "normal",
        fontSize: 20,
        fontWeight: "normal",
        fontFamily: "serif",
      },
    },
    series: [
      {
        __seriesType: "__default",
        type: "liquidFill",
        name: "",
        mapName: "",
        data: [],
        radius: "90%",
        direction: "left",
        amplitude: 50,
        waveAnimation: true,
        animationDuration: 0,
        animationDurationUpdate: 0,
        itemStyle: {
          borderWidth: 0,
          borderColor: "#16d4fed2",
          borderType: "solid",
          shadowBlur: 0,
          shadowColor: "#e7ebed",
          borderRadius: 0,
        },
        label: {
          show: true,
          position: "inside",
          fontSize: 35,
          fontFamily: "serif",
          color: "#ffffff",
          insideColor: "#16ecfa",
          fontWeight: "normal",
          fontStyle: "normal",
          formatter: "{c}",
        },
        backgroundStyle: {
          show: true,
          borderWidth: 0,
          borderColor: "#16d4fed2",
          color: "#e0f2fd18",
          opacity: 1,
        },
        outline: {
          show: true,
          borderDistance: 8,
          itemStyle: {
            borderWidth: 4,
            borderColor: "#83a4ca",
            opacity: 0.4,
          },
        },
      },
    ],
  },
};
