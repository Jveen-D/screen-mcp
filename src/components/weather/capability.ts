import type { JsonObject } from "../../types/component.js";

export const weatherCapability: JsonObject = {
  componentName: "Weather",
  displayName: "天气",
  description: "大屏天气组件，支持按城市编码自动获取并展示天气信息。",
  aiRole:
    "AI 负责位置、尺寸、城市和样式；MCP 负责补齐默认 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Weather",
      description: "组件类型，必须固定为 Weather。",
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
      path: "cityCode",
      type: "array<string>",
      description: "城市编码数组，缺失时使用组件内置默认编码；需要具体城市时应由用户或上层设计明确提供。",
    },
    { path: "style", type: "object", description: "位置、尺寸、字体、颜色、对齐、图标大小。" },
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
    "cityCode 长度应为 3，缺失时由 MCP 补齐默认值。",
  ],
  visualRules: [
    "天气组件适合展示在面板标题、角标或状态栏区域。",
    "天气组件宽度至少为 184px，否则会导致内部换行；在 1920×1080 大屏顶部与日期并排时，建议宽度 280~300px，确保天气图标、温度、风向风力在一行显示。",
    "图标大小可通过 style.iconSize 调整。",
  ],
  examples: [
    {
      title: "天气配置示例",
      props: {
        componentName: "Weather",
        logicalId: "theme_weather",
        parentLogicalId: "header_group",
        name: "天气",
        style: {
          position: "absolute",
          left: 1360,
          top: 32,
          width: 300,
          height: 34,
        },
      },
    },
  ],
};
