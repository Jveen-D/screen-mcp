import type { JsonObject } from "../../types/component.js";

export const iframeCapability: JsonObject = {
  componentName: "IFrame",
  displayName: "iframe",
  description: "大屏 iframe 嵌入组件，支持嵌入外部页面并配置权限、缩放和滚动条。",
  aiRole:
    "AI 负责 iframe 地址、位置尺寸和基础权限；MCP 负责补齐默认 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "IFrame",
      description: "组件类型，必须固定为 IFrame。",
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
      description: "组件在画布上的位置、尺寸和背景色。",
    },
  ],
  aiWritableProps: [
    { path: "name", type: "string", description: "图层名称。" },
    {
      path: "url",
      type: "string",
      description: "嵌入页面地址。",
    },
    {
      path: "acceptEvent",
      type: "boolean",
      description: "是否接受事件。默认 true。",
    },
    {
      path: "authority.camera",
      type: "boolean",
      description: "是否允许摄像头权限。默认 false。",
    },
    {
      path: "authority.microphone",
      type: "boolean",
      description: "是否允许麦克风权限。默认 false。",
    },
    {
      path: "scroll",
      type: "enum",
      values: ["auto", "hide", "show"],
      description: "滚动条策略。默认 auto。",
    },
    {
      path: "scale",
      type: "number",
      description: "页面缩放比例。默认 1。",
    },
    {
      path: "publicDomain",
      type: "string",
      description: "域名配置，用于跨域场景。",
    },
    { path: "style", type: "object", description: "位置、尺寸、背景色。" },
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
    "scroll 只能为 auto/hide/show，非法值重置为 auto。",
  ],
  visualRules: [
    "iframe 适合嵌入第三方系统、地图或数据页面。",
    "注意跨域和权限问题。",
  ],
  examples: [
    {
      title: "嵌入外部系统",
      props: {
        componentName: "IFrame",
        logicalId: "theme_iframe",
        parentLogicalId: "content_group",
        name: "iframe",
        style: {
          position: "absolute",
          left: 100,
          top: 100,
          width: 800,
          height: 520,
        },
        url: "https://example.com/dashboard",
      },
    },
  ],
};
