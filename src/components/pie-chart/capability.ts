import type { JsonObject } from "../../types/component.js";

export const pieChartCapability: JsonObject = {
  componentName: "PieChart",
  displayName: "饼图",
  description:
    "用于展示分类占比、构成比例和环形占比关系的 ECharts 饼图组件。",
  aiRole:
    "AI 负责生成组件层级、布局和视觉表达；MCP 会补齐默认 props，并固定使用默认 chartData。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "PieChart",
      description: "组件类型，必须固定为 PieChart。",
    },
    {
      path: "logicalId",
      type: "string",
      description:
        "组件唯一 ID，由 AI 生成，用于编辑器大纲树和 schema businessElementId。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description:
        "父级组件或分组 ID，由 AI 生成，用于编辑器大纲树分组关系。",
    },
    {
      path: "style",
      type: "object",
      description: "组件在大屏画布上的位置和尺寸。",
      children: [
        { path: "style.left", type: "number", description: "画布左侧距离。" },
        { path: "style.top", type: "number", description: "画布顶部距离。" },
        { path: "style.width", type: "number", description: "组件宽度。" },
        { path: "style.height", type: "number", description: "组件高度。" },
        {
          path: "style.position",
          type: "string",
          value: "absolute",
          description: "固定使用 absolute。",
        },
        { path: "style.zIndex", type: "number", description: "层级顺序。" },
      ],
    },
  ],
  aiWritableProps: [
    {
      path: "name",
      type: "string",
      description: "图层名称，建议和用户语义一致。",
    },
    {
      path: "rotate",
      type: "number",
      range: [-360, 360],
      description: "组件旋转角度。",
    },
    {
      path: "opacity",
      type: "number",
      range: [0, 1],
      description: "组件不透明度。",
    },
    {
      path: "entryAnimiation",
      type: "object",
      description: "入场动画配置，无明确要求时保持默认关闭。",
    },
    {
      path: "option.backgroundColor",
      type: "color",
      description: "图表背景色，通常使用 transparent 或 rgba 透明底。",
    },
    {
      path: "option.color",
      type: "array<string>",
      description: "饼图扇区颜色数组，MCP 按下标与默认色板合并。",
    },
    {
      path: "option.tooltip",
      type: "object",
      description: "提示框配置。",
    },
    {
      path: "option.legend",
      type: "object",
      description:
        "图例配置。legend.left 与 legend.top 必须成对选择合法位置，分别保存为字符串。",
      positionRules: {
        fields: ["left", "top"],
        description:
          "每一项的第一个值写入 legend.left，第二个值写入 legend.top，表示图例在容器的八个方位。",
        options: [
          ["left", "top"],
          ["center", "top"],
          ["right", "top"],
          ["left", "center"],
          ["right", "center"],
          ["left", "bottom"],
          ["center", "bottom"],
          ["right", "bottom"],
        ],
      },
      children: [
        {
          path: "option.legend.left",
          type: "enum",
          values: ["left", "center", "right"],
          description:
            "图例水平位置，必须与 option.legend.top 组合成 positionRules.options 中的一项。",
        },
        {
          path: "option.legend.top",
          type: "enum",
          values: ["top", "center", "bottom"],
          description:
            "图例垂直位置，必须与 option.legend.left 组合成 positionRules.options 中的一项。",
        },
      ],
    },
    {
      path: "option.series[0]",
      type: "object",
      description:
        "饼图唯一系列配置。AI 不需要生成 type、data，MCP 会按下标深合并默认配置。",
      children: [
        {
          path: "option.series[0].radius",
          type: "[string,string]",
          description: "内外半径，例如 ['42%', '68%']。",
        },
        {
          path: "option.series[0].center",
          type: "[string,string]",
          description: "圆心位置，例如 ['50%', '50%']。",
        },
        {
          path: "option.series[0].itemStyle",
          type: "object",
          description: "扇区描边和阴影样式。",
        },
        {
          path: "option.series[0].label",
          type: "object",
          description: "扇区标签样式。",
        },
        {
          path: "option.series[0].labelLine",
          type: "object",
          description: "标签引导线样式。",
        },
      ],
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData",
      reason: "MCP 永远使用默认 chartData，AI 不应生成或覆盖。",
    },
    {
      path: "option.series[0].data",
      reason: "数据由 chartData 处理链生成，AI 不应直接写入 series data。",
    },
    {
      path: "option.title",
      reason: "当前 PieChart schema 不需要 title，MCP 会移除 AI 输入的 option.title。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "option.series[0] 只写 radius 时，会保留默认 type、label、itemStyle。",
    "chartData 永远使用默认值。",
  ],
  examples: [
    {
      title: "科技风环形饼图",
      props: {
        componentName: "PieChart",
        logicalId: "sales_pie_chart",
        parentLogicalId: "sales_group",
        name: "销售占比",
        style: {
          left: 80,
          top: 160,
          width: 420,
          height: 280,
          position: "absolute",
          zIndex: 12,
        },
        option: {
          backgroundColor: "transparent",
          color: ["#00E5FF", "#7C4DFF", "#FFB300", "#00C853"],
          legend: {
            show: true,
            left: "center",
            top: "bottom",
            orient: "horizontal",
            icon: "circle",
            textStyle: {
              color: "#BFEFFF",
              fontSize: 12,
              fontWeight: "normal",
              fontStyle: "normal",
              fontFamily: "serif",
            },
          },
          tooltip: {
            show: true,
            backgroundColor: "rgba(8,18,38,0.92)",
            textStyle: {
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: "normal",
              fontStyle: "normal",
              fontFamily: "serif",
            },
          },
          series: [
            {
              radius: ["42%", "68%"],
              center: ["50%", "48%"],
              itemStyle: {
                borderWidth: 2,
                borderColor: "#07182F",
                borderType: "solid",
                shadowBlur: 8,
                shadowColor: "rgba(0,229,255,0.35)",
              },
              label: {
                show: true,
                formatter: "{b}: {c}",
                position: "outside",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: "bold",
                fontStyle: "normal",
                fontFamily: "serif",
              },
              labelLine: {
                show: true,
                length: 18,
                length2: 32,
              },
            },
          ],
        },
      },
    },
  ],
};
