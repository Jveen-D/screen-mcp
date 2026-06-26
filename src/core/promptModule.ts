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

function inferTheme(_prompt: string): JsonObject {
  return {
    primaryColor: "#00E5FF",
    secondaryColor: "#FFB300",
    accentColor: "#FF4D4F",
    textColor: "#DFF8FF",
  };
}

function inferMainChartType(
  prompt: string,
):
  | "PieChart"
  | "ThreeDPieChart"
  | "LineChart"
  | "BarChart"
  | "RingChart"
  | "StackBarChart"
  | "StackLineChart"
  | "BarChart25D"
  | "BarProgress"
  | "LiquidFill"
  | "RoseChart"
  | "ScatterChart" {
  if (/3D|三维|立体|3d|3维/.test(prompt) && !/2\.5D|25D|2\.5维|2\.5维/.test(prompt)) {
    return "ThreeDPieChart";
  }

  if (/堆叠折线|堆积折线|堆叠趋势|堆积趋势/.test(prompt)) {
    return "StackLineChart";
  }

  if (/堆叠柱状|堆积柱状|堆叠条形|堆积条形/.test(prompt)) {
    return "StackBarChart";
  }

  if (/2\.5D|25D|2\.5维|2\.5维|立体柱状|立体柱图|立体条形/.test(prompt)) {
    return "BarChart25D";
  }

  if (/散点|气泡|scatter|bubble/.test(prompt)) {
    return "ScatterChart";
  }

  if (/玫瑰|南丁格尔|rose chart|rose/.test(prompt)) {
    return "RoseChart";
  }

  if (/水球|水波|液体填充|liquid fill|liquidFill/.test(prompt)) {
    return "LiquidFill";
  }

  if (/进度条|条形进度|进度图|完成率/.test(prompt)) {
    return "BarProgress";
  }

  if (/折线|趋势|时间序列|走势|曲线|line|线图/.test(prompt)) {
    return "LineChart";
  }

  if (/柱状|条形|柱图|bar|bar chart/.test(prompt)) {
    return "BarChart";
  }

  if (/环形| donut |甜甜圈|圈图/.test(prompt)) {
    return "RingChart";
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
  const isRingChart = mainChartType === "RingChart";
  const isLineChart = mainChartType === "LineChart";
  const isBarChart = mainChartType === "BarChart";
  const isStackBarChart = mainChartType === "StackBarChart";
  const isStackLineChart = mainChartType === "StackLineChart";
  const isBarChart25D = mainChartType === "BarChart25D";
  const isBarProgress = mainChartType === "BarProgress";
  const isLiquidFill = mainChartType === "LiquidFill";
  const isRoseChart = mainChartType === "RoseChart";
  const isScatterChart = mainChartType === "ScatterChart";
  const isCartesianChart =
    isLineChart ||
    isBarChart ||
    isStackBarChart ||
    isStackLineChart ||
    isBarChart25D ||
    isBarProgress ||
    isScatterChart;
  const isStackChart = isStackBarChart || isStackLineChart;
  const isPieLikeChart =
    mainChartType === "PieChart" || isThreeDPie || isRingChart || isRoseChart;

  const cartesianBaseOption = {
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
  };

  let chartSpecificOption: JsonObject;

  if (isThreeDPie) {
    chartSpecificOption = {
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
    };
  } else if (isStackLineChart) {
    chartSpecificOption = {
      ...cartesianBaseOption,
      series: [
        {
          type: "line",
          stack: "__stackLine",
          smooth: false,
          symbol: "emptyCircle",
          showSymbol: { show: false },
          areaStyle: false,
        },
      ],
    };
  } else if (isLineChart) {
    chartSpecificOption = {
      ...cartesianBaseOption,
      series: [
        {
          type: "line",
          smooth: false,
          symbol: "emptyCircle",
          symbolSize: 0,
        },
      ],
    };
  } else if (isStackBarChart) {
    chartSpecificOption = {
      ...cartesianBaseOption,
      series: [
        {
          type: "bar",
          stack: "__stackBar",
          barWidth: 12,
        },
      ],
    };
  } else if (isBarChart) {
    chartSpecificOption = {
      ...cartesianBaseOption,
      series: [
        {
          type: "bar",
          barWidth: 12,
        },
      ],
    };
  } else if (isBarChart25D) {
    chartSpecificOption = {
      ...cartesianBaseOption,
      tooltip: {
        trigger: "item",
        axisPointer: {
          type: "none",
        },
      },
      series: [
        {
          type: "custom",
          barWidth: 18,
        },
      ],
    };
  } else if (isScatterChart) {
    chartSpecificOption = {
      ...cartesianBaseOption,
      tooltip: {
        trigger: "item",
      },
      xAxis: {
        type: "value",
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          type: "scatter",
          symbolSize: 15,
        },
      ],
    };
  } else if (isBarProgress) {
    chartSpecificOption = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: 30,
        top: 24,
        bottom: 16,
        right: 40,
      },
      xAxis: {
        type: "value",
        axisLabel: {
          show: false,
        },
      },
      yAxis: {
        type: "category",
        inverse: true,
      },
      series: [
        {
          type: "bar",
          barWidth: 12,
          showBackground: true,
          label: {
            show: true,
            position: "right",
          },
        },
      ],
    };
  } else if (isRoseChart) {
    chartSpecificOption = {
      series: [
        {
          type: "pie",
          roseType: "area",
          radius: ["0%", "70%"],
          label: {
            show: true,
            position: "outside",
            formatter: "{b}: {d}%",
          },
          labelLine: {
            show: true,
          },
        },
      ],
    };
  } else if (isLiquidFill) {
    chartSpecificOption = {
      series: [
        {
          type: "liquidFill",
          radius: "90%",
          label: {
            show: true,
            position: "inside",
            formatter: "{c}",
          },
        },
      ],
    };
  } else if (isRingChart) {
    chartSpecificOption = {
      series: [
        {
          radius: ["30%", "45%"],
          label: {
            show: false,
            position: "center",
          },
          labelLine: {
            show: false,
          },
        },
      ],
    };
  } else {
    chartSpecificOption = {
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
    };
  }

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
        ...chartSpecificOption,
      },
    },
  };

  return {
    moduleName: "ChartPanel",
    layoutMode: "assisted",
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
