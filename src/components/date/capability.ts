import type { JsonObject } from "../../types/component.js";

export const dateCapability: JsonObject = {
  componentName: "Date",
  displayName: "时间",
  description: "大屏时间组件，支持按指定格式实时展示当前时间。",
  aiRole:
    "AI 负责位置、尺寸、时间格式和样式；MCP 负责补齐默认 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Date",
      description: "组件类型，必须固定为 Date。",
    },
    {
      path: "logicalId",
      type: "string",
      description:
        "组件唯一 ID，由 AI 生成；后端限制最长 50 个字符，必须包含短随机段以保证大屏内全局唯一。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "父级组件或分组 ID，由 AI 生成。",
    },
    {
      path: "style",
      type: "object",
      description: "组件在画布上的位置、尺寸和文本样式。",
    },
  ],
  aiWritableProps: [
    { path: "name", type: "string", description: "图层名称。" },
    {
      path: "format",
      type: "string",
      description: "日期时间格式，默认 \"YYYY年M月D日 HH:mm:ss\"。",
    },
    {
      path: "timezone",
      type: "enum",
      values: ["beijing"],
      description: "时区，当前仅支持北京时间。",
    },
    { path: "style", type: "object", description: "位置、尺寸、字体、颜色、对齐。" },
    { path: "rotate", type: "number", range: [-360, 360], description: "旋转角度。默认 0。" },
    { path: "opacity", type: "number", range: [0, 1], description: "不透明度。默认 1。" },
  ],
  aiForbiddenProps: [
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "format/timezone 缺失时由 MCP 补齐默认值。",
  ],
  visualRules: [
    "时间组件常用于标题栏、状态栏或角落。",
    "格式应与大屏整体时间展示风格一致。",
  ],
  examples: [
    {
      title: "科技风时间",
      props: {
        componentName: "Date",
        logicalId: "theme_date",
        parentLogicalId: "header_group",
        name: "时间",
        style: {
          position: "absolute",
          left: 1400,
          top: 32,
          width: 300,
          height: 32,
        },
        format: "YYYY-MM-DD HH:mm:ss",
      },
    },
  ],
};
