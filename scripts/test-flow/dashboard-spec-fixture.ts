import type { JsonObject } from "../../src/types/component.js";

export function createDashboardSpec(freeformModuleInput: JsonObject): JsonObject {
  const dashboardSpec = {
    logicalId: "ops_dashboard",
    title: "运营洞察大屏",
    canvas: {
      width: 1280,
      height: 720,
    },
    grouping: {
      mode: "semantic",
      singleChildGroup: true,
    },
    theme: {
      primaryColor: "#28E0B9",
      secondaryColor: "#2F80ED",
      accentColor: "#FFB020",
      textColor: "#EFFFFA",
    },
    components: [
      {
        componentName: "SingleText",
        logicalId: "dashboard_title",
        textContent: "运营洞察大屏",
        style: {
          position: "absolute",
          left: 40,
          top: 24,
          width: 360,
          height: 32,
          fontSize: 32,
          lineHeight: 1,
        },
      },
      {
        componentName: "SingleImage",
        logicalId: "dashboard_background",
        imageBase64: "data:image/png;base64,REALBACKGROUND",
        opacity: 0.92,
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 1280,
          height: 720,
        },
      },
    ],
    groups: [
      {
        logicalId: "dashboard_header_group",
        title: "顶部信息组",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 1280,
          height: 88,
        },
        components: [
          {
            componentName: "SvgDecoration",
            logicalId: "dashboard_header_decoration",
            name: "顶部结构线",
            svgSource: "custom",
            svgContent:
              '<svg viewBox="0 0 1280 88" xmlns="http://www.w3.org/2000/svg"><path d="M40 72H1240" stroke="#28E0B9" stroke-width="2"/></svg>',
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: 1280,
              height: 88,
            },
          },
          {
            componentName: "SingleImage",
            logicalId: "dashboard_header_background",
            name: "顶部背景",
            imageBase64: "data:image/png;base64,HEADERBACKGROUND",
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: 1280,
              height: 88,
            },
          },
        ],
      },
    ],
    modules: [
      {
        moduleName: "ChartPanel",
        logicalId: "risk_panel",
        title: "风险等级分析",
        style: {
          position: "absolute",
          left: 40,
          top: 100,
          width: 520,
          height: 360,
        },
        slots: {
          title: {
            componentName: "SingleText",
            props: {
              textContent: "风险等级分析",
            },
          },
          mainChart: {
            componentName: "PieChart",
            props: {
              chartData: {
                constant: {
                  data: [
                    { name: "高风险", type: "风险", value: 18 },
                    { name: "中风险", type: "风险", value: 37 },
                    { name: "低风险", type: "风险", value: 71 },
                  ],
                },
              },
              option: {
                legend: {
                  left: "center",
                  top: "bottom",
                },
              },
            },
          },
          decorations: [
            {
              componentName: "SvgDecoration",
              props: {
                name: "AI自定义标题线",
                svgContent:
                  '<svg viewBox="0 0 120 12" xmlns="http://www.w3.org/2000/svg"><path d="M0 6H120" stroke="#28E0B9" stroke-width="2"/></svg>',
                style: {
                  position: "absolute",
                  left: 64,
                  top: 150,
                  width: 180,
                  height: 18,
                },
              },
            },
          ],
          auxiliaryTexts: [
            {
              componentName: "SingleText",
              props: {
                name: "风险结论",
                textContent: "高风险占比 14.3%，优先跟进高风险区域",
              },
            },
          ],
        },
      },
      {
        ...freeformModuleInput,
        logicalId: "dashboard_kpi_panel",
        parentLogicalId: "ops_dashboard",
        grouping: undefined,
      },
    ],
  } as JsonObject;
  return dashboardSpec;
}
