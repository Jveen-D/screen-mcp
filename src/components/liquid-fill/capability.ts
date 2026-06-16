import type { JsonObject } from "../../types/component.js";

export const liquidFillCapability: JsonObject = {
  componentName: "LiquidFill",
  displayName: "水球图",
  description: "用于展示单个百分比数值的 ECharts 水球图组件。",
  aiRole: "AI 负责生成组件布局和视觉表达；MCP 会补齐完整 props 与有效 chartData。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "LiquidFill",
      description: "组件类型，必须固定为 LiquidFill。",
    },
    {
      path: "logicalId",
      type: "string",
      description: "组件唯一 ID。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "父级组件或分组 ID。",
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
      ],
    },
  ],
  aiWritableProps: [
    {
      path: "name",
      type: "string",
      description: "图层名称。",
    },
    {
      path: "chartData.constant.data",
      type: "array<object>",
      description: "水球图常量数据数组，每条记录包含 { name, value }，value 为 0–1 之间的百分比。",
    },
    {
      path: "option.series[0].radius",
      type: "string|number",
      description: "水球半径。",
    },
    {
      path: "option.series[0].amplitude",
      type: "number",
      description: "波浪振幅。",
    },
    {
      path: "option.series[0].direction",
      type: "enum",
      values: ["left", "right"],
      description: "波浪流动方向。",
    },
    {
      path: "option.series[0].itemStyle",
      type: "object",
      description: "水波图形样式。",
    },
    {
      path: "option.series[0].label",
      type: "object",
      description: "中心文本标签样式。",
    },
    {
      path: "option.series[0].backgroundStyle",
      type: "object",
      description: "水球背景样式。",
    },
    {
      path: "option.series[0].outline",
      type: "object",
      description: "水球外轮廓样式。",
    },
    {
      path: "option.color",
      type: "array<color>",
      description: "水波主题色数组。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData.sourceType",
      reason: "LiquidFill 当前只由 MCP 生成 constant 数据源。",
    },
    {
      path: "chartData.constant.originalData",
      reason: "MCP 会根据 chartData.constant.data 自动同步 originalData。",
    },
    {
      path: "chartData.constant.fieldList",
      reason: "MCP 会补齐 name/value 字段列表。",
    },
    {
      path: "chartData.dimension",
      reason: "MCP 固定使用 name 作为维度字段。",
    },
    {
      path: "chartData.indicator[0].fieldName",
      reason: "MCP 固定使用 value 作为指标字段名。",
    },
    {
      path: "option.series[i].type",
      reason: "LiquidFill 的 series type 固定为 'liquidFill'。",
    },
    {
      path: "option.title",
      reason: "当前 LiquidFill schema 不需要 title，MCP 会移除。",
    },
    {
      path: "option.legend",
      reason: "当前 LiquidFill schema 不需要 legend，MCP 会移除。",
    },
    {
      path: "option.dataset",
      reason: "当前 LiquidFill schema 不需要 dataset，MCP 会移除。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "option.series[i].type 固定为 'liquidFill'。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
  ],
  visualRules: [
    "chartData.constant.data 每条记录必须包含 { name, value }，value 为 0–1 之间的百分比。",
  ],
  examples: [],
};
