import type { JsonObject } from "../../types/component.js";

export const dynamicTextCapability: JsonObject = {
  componentName: "DynamicText",
  displayName: "动态文本",
  description:
    "用于大屏动态指标展示，可绑定单个数值并显示前后缀，例如“今日访问量：12,345”、“CPU 使用率：78%”。",
  aiRole:
    "AI 负责数值、前后缀文案、位置、尺寸、字体和视觉样式。MCP 负责把 textValue 同步到 chartData 并补齐其余 props。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "DynamicText",
      description: "组件类型，必须固定为 DynamicText。",
    },
    {
      path: "logicalId",
      type: "string",
      description: "组件唯一 ID，由 AI 生成；后端限制最长 50 个字符，必须包含短随机段以保证大屏内全局唯一。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "父级组件或分组 ID，由 AI 生成。",
    },
    {
      path: "style",
      type: "object",
      description: "文本在画布上的位置、尺寸和字体样式。",
    },
  ],
  aiWritableProps: [
    { path: "name", type: "string", description: "图层名称。" },
    {
      path: "textValue",
      type: "number",
      description: "要展示的动态数值。MCP 会同步写入 chartData.constant.data[0].value。",
    },
    {
      path: "prefixTitle",
      type: "string",
      description: "数值前缀文案，例如“今日访问量：”。",
    },
    {
      path: "affixTitle",
      type: "string",
      description: "数值后缀文案，例如“%”。",
    },
    { path: "style", type: "object", description: "位置、尺寸、字体、颜色、对齐和背景。" },
    { path: "style.fontFamily", type: "string", description: "字体族。" },
    { path: "style.fontSize", type: "number", description: "字号。" },
    { path: "style.color", type: "color", description: "字体颜色。" },
    {
      path: "style.textAlign",
      type: "enum",
      values: ["left", "center", "right"],
      description: "文本对齐方式。",
    },
    {
      path: "style.fontWeight",
      type: "enum",
      values: ["normal", "bold", "bolder"],
      description: "字体粗细。",
    },
    {
      path: "style.fontStyle",
      type: "enum",
      values: ["normal", "italic", "oblique"],
      description: "字体样式。",
    },
    { path: "style.letterSpacing", type: "number", description: "字距。" },
    {
      path: "style.lineHeight",
      type: "number",
      range: [1, 2],
      description:
        "行高是 React/CSS 无单位倍率，不是 px。单行文本默认使用 1；如果 AI 误传大于 4 的像素式值，MCP 会按 lineHeight / fontSize 转成 1 到 2 之间的倍率。",
    },
    { path: "rotate", type: "number", range: [-360, 360], description: "旋转角度。" },
    { path: "opacity", type: "number", range: [0, 1], description: "不透明度。" },
    { path: "textShadow", type: "object", description: "文字阴影配置。" },
  ],
  aiForbiddenProps: [
    {
      path: "chartData",
      reason: "动态文本数据源结构由 MCP 根据 textValue 同步维护，AI 不应直接生成。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
    {
      path: "targetUrl",
      reason: "超链接涉及跳转行为，默认不由 AI 生成。",
    },
    {
      path: "openBrowser",
      reason: "打开新窗口涉及跳转行为，默认不由 AI 生成。",
    },
  ],
  mergeRules: [
    "对象按 key 深合并。",
    "chartData 永远使用默认结构，MCP 会把 textValue 同步到 chartData.constant.data[0].value。",
    "动态文本默认 style.lineHeight = 1，且 style.height 与 style.fontSize 保持一致。",
    "style.lineHeight 使用无单位倍率；如果 AI 误传大于 4 的像素式值，MCP 会按 lineHeight / fontSize 转成 1 到 2 之间的倍率。",
  ],
  examples: [
    {
      title: "今日访问量指标",
      props: {
        componentName: "DynamicText",
        logicalId: "today_visit_count",
        parentLogicalId: "visit_group",
        name: "今日访问量",
        prefixTitle: "今日访问量：",
        affixTitle: "",
        textValue: 12345,
        style: {
          position: "absolute",
          left: 80,
          top: 120,
          width: 260,
          height: 32,
          fontSize: 24,
          color: "#00E5FF",
          textAlign: "left",
          backgroundColor: "rgba(0,0,0,0)",
          fontWeight: "bold",
          fontStyle: "normal",
          letterSpacing: 1,
          lineHeight: 1,
        },
      },
    },
  ],
};
