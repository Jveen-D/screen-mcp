import { generateModuleTreeSchema } from "./modules.js";
import type { EditorGroupNode, JsonObject, JsonValue } from "../types/component.js";

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asFiniteNumber(value: JsonValue | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeDataRows(value: JsonValue | undefined): JsonObject[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const rows = value.flatMap((item) => {
    if (!isJsonObject(item) || typeof item.name !== "string" || item.name.trim() === "") {
      return [];
    }

    const itemValue = asFiniteNumber(item.value);
    if (itemValue === undefined) {
      return [];
    }

    return [
      {
        name: item.name.trim(),
        type: typeof item.type === "string" && item.type.trim() !== "" ? item.type : "系列",
        value: itemValue,
      },
    ];
  });

  return rows.length > 0 ? rows : undefined;
}

function extractDataRowsFromPrompt(prompt: string): JsonObject[] | undefined {
  const rows: JsonObject[] = [];
  const dataPattern =
    /([\p{Script=Han}A-Za-z][\p{Script=Han}A-Za-z0-9_\-（）()]{0,24}?)[：:\s]*(-?\d+(?:\.\d+)?)/gu;

  for (const match of prompt.matchAll(dataPattern)) {
    const name = match[1]
      ?.replace(/^(数据|其中|分别|包含|包括)/, "")
      .replace(/[，,、。；;：:\s]+$/g, "")
      .trim();
    const value = asFiniteNumber(match[2]);

    if (!name || value === undefined || /^[xX]?$/.test(name)) {
      continue;
    }

    rows.push({
      name,
      type: /风险|隐患|告警|等级/.test(name) ? "风险" : "系列",
      value,
    });
  }

  return rows.length > 0 ? rows : undefined;
}

function inferTitle(prompt: string, explicitTitle: JsonValue | undefined): string {
  if (typeof explicitTitle === "string" && explicitTitle.trim() !== "") {
    return explicitTitle.trim();
  }

  if (/风险/.test(prompt) && /等级|分析|占比|统计/.test(prompt)) {
    return "风险等级分析";
  }

  if (/销售/.test(prompt) && /渠道|占比/.test(prompt)) {
    return "销售渠道占比";
  }

  if (/销售/.test(prompt)) {
    return "销售分析";
  }

  if (/告警|预警/.test(prompt)) {
    return "告警分析";
  }

  const firstSentence = prompt
    .split(/[，,。；;\n]/)[0]
    ?.replace(/^(帮我|给我|请|做个|做一个|生成一个|生成|设计一个|设计)/, "")
    .replace(/(模块|大屏|面板|看板)$/g, "")
    .trim();

  return firstSentence && firstSentence.length <= 12 ? firstSentence : "数据分析";
}

function inferLogicalId(prompt: string, explicitId: JsonValue | undefined): string {
  if (typeof explicitId === "string" && explicitId.trim() !== "") {
    return explicitId.trim();
  }

  if (/风险/.test(prompt)) {
    return "risk_level_panel";
  }

  if (/销售/.test(prompt)) {
    return "sales_analysis_panel";
  }

  if (/告警|预警/.test(prompt)) {
    return "alarm_analysis_panel";
  }

  return "screen_chart_panel";
}

function normalizeStyle(value: JsonValue | undefined): JsonObject {
  const style = isJsonObject(value) ? value : {};

  return {
    left: asFiniteNumber(style.left) ?? 120,
    top: asFiniteNumber(style.top) ?? 120,
    width: asFiniteNumber(style.width) ?? 840,
    height: asFiniteNumber(style.height) ?? 520,
    position: "absolute",
    ...(typeof style.zIndex === "number" ? { zIndex: style.zIndex } : {}),
  };
}

function inferTheme(prompt: string): JsonObject {
  if (/红色|红|投诉|告警|预警|报警/.test(prompt)) {
    return {
      primaryColor: "#FF2D4F",
      secondaryColor: "#FF8A3D",
      accentColor: "#FFD166",
      textColor: "#FFF3F3",
    };
  }

  if (/绿色|绿|新能源|光伏|风力|风电|储能|绿电/.test(prompt)) {
    return {
      primaryColor: "#25F28A",
      secondaryColor: "#20C8FF",
      accentColor: "#FFE35A",
      textColor: "#E7FFF5",
    };
  }

  if (/销售/.test(prompt)) {
    return {
      primaryColor: "#00E5FF",
      secondaryColor: "#7C4DFF",
      accentColor: "#FFB300",
      textColor: "#DFF8FF",
    };
  }

  return {
    primaryColor: "#00E5FF",
    secondaryColor: "#FFB300",
    accentColor: "#FF4D4F",
    textColor: "#DFF8FF",
  };
}

function inferMainChartType(prompt: string): "PieChart" | "ThreeDPieChart" | "LineChart" | "BarChart" {
  if (/3D|三维|立体|3d|3维/.test(prompt)) {
    return "ThreeDPieChart";
  }

  if (/折线|趋势|时间序列|走势|曲线|line|线图/.test(prompt)) {
    return "LineChart";
  }

  if (/柱状|条形|柱图|bar|bar chart/.test(prompt)) {
    return "BarChart";
  }

  return "PieChart";
}

function inferThreeDSettings(prompt: string): JsonObject {
  const base: JsonObject = {
    animationEnabled: true,
    centerLabelVisible: true,
    interactionTrigger: "hover",
    projectionType: "perspective",
    pixelRatio: 1.5,
  };

  if (/厚|厚重|体量|大块|强立体/.test(prompt)) {
    base.depth = 32;
    base.liftDistance = 24;
    base.topViewAngle = 58;
  } else if (/轻|简洁|薄|清爽/.test(prompt)) {
    base.depth = 12;
    base.liftDistance = 10;
    base.topViewAngle = 68;
  } else {
    base.depth = 18;
    base.liftDistance = 14;
    base.topViewAngle = 63;
  }

  if (/俯视|顶视|平面/.test(prompt)) {
    base.topViewAngle = 72;
  }

  if (/平视|侧面/.test(prompt)) {
    base.topViewAngle = 45;
  }

  return base;
}

export function buildScreenModuleInputFromPrompt(input: JsonObject): JsonObject {
  const promptValue = input.prompt;
  if (typeof promptValue !== "string" || promptValue.trim() === "") {
    throw new Error("missing required prompt");
  }

  const prompt = promptValue.trim();
  const dataItems = normalizeDataRows(input.dataItems) ?? extractDataRowsFromPrompt(prompt);
  const mainChartType = inferMainChartType(prompt);
  const isThreeDPie = mainChartType === "ThreeDPieChart";

  const isLineChart = mainChartType === "LineChart";
  const isBarChart = mainChartType === "BarChart";
  const isCartesianChart = isLineChart || isBarChart;

  const mainChartSlot: JsonObject = {
    componentName: mainChartType,
    props: {
      option: {
        backgroundColor: "transparent",
        legend: {
          left: "center",
          top: isCartesianChart ? "top" : "bottom",
          offsetX: 0,
          offsetY: isCartesianChart ? 0 : -6,
        },
        ...(isThreeDPie
          ? {
              threeDSettings: inferThreeDSettings(prompt),
              series: [
                {
                  label: {
                    show: false,
                  },
                  labelLine: {
                    show: false,
                  },
                },
              ],
            }
          : isLineChart
            ? {
                tooltip: {
                  trigger: "axis",
                },
                grid: {
                  left: 30,
                  top: 60,
                  bottom: 42,
                  right: 40,
                },
                xAxis: {
                  type: "category",
                },
                yAxis: {
                  type: "value",
                },
                series: [
                  {
                    type: "line",
                    smooth: false,
                    symbol: "emptyCircle",
                    symbolSize: 0,
                  },
                ],
              }
            : isBarChart
              ? {
                  tooltip: {
                    trigger: "axis",
                    axisPointer: {
                      type: "shadow",
                    },
                  },
                  grid: {
                    left: 30,
                    top: 60,
                    bottom: 42,
                    right: 40,
                  },
                  xAxis: {
                    type: "category",
                  },
                  yAxis: {
                    type: "value",
                  },
                  series: [
                    {
                      type: "bar",
                      barWidth: 12,
                    },
                  ],
                }
              : {
                  series: [
                    {
                      label: {
                        show: true,
                        position: "outside",
                        formatter: "{b}",
                        fontWeight: "normal",
                      },
                      labelLine: {
                        show: true,
                      },
                    },
                  ],
                }),
      },
    },
  };

  return {
    moduleName: "ChartPanel",
    logicalId: inferLogicalId(prompt, input.logicalId),
    parentLogicalId:
      typeof input.parentLogicalId === "string" && input.parentLogicalId.trim() !== ""
        ? input.parentLogicalId.trim()
        : "root",
    title: inferTitle(prompt, input.title),
    ...(dataItems ? { dataItems } : {}),
    style: normalizeStyle(input.style),
    theme: isJsonObject(input.theme) ? input.theme : inferTheme(prompt),
    slots: {
      mainChart: mainChartSlot,
    },
  };
}

export function generateScreenModuleFromPrompt(input: JsonObject): EditorGroupNode {
  return generateModuleTreeSchema(buildScreenModuleInputFromPrompt(input));
}
