import type { JsonObject } from "../../types/component.js";

export const singleTextCapability: JsonObject = {
  componentName: "SingleText",
  displayName: "单行文本",
  description:
    "用于大屏标题、面板标题、指标名、单位、标签和短文本点缀的单行文本组件。",
  aiRole:
    "AI 负责文本内容、位置、尺寸、字体和视觉样式。MCP 负责补齐默认 datasource 与其余 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "SingleText",
      description: "组件类型，必须固定为 SingleText。",
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
      path: "textContent",
      type: "string",
      description: "单行文本内容。MCP 会同步写入 datasource.constantData[0].text。",
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
        "行高是 React/CSS 无单位倍率，不是 px。单行文本默认使用 1；如果需要多行承载，才显式提高行高和高度。不要填写 24、30 这类像素值。",
    },
    { path: "rotate", type: "number", range: [-360, 360], description: "旋转角度。" },
    { path: "opacity", type: "number", range: [0, 1], description: "不透明度。" },
    { path: "textShadow", type: "object", description: "文字阴影配置。" },
  ],
  aiForbiddenProps: [
    {
      path: "datasource",
      reason: "文本数据源结构由 MCP 根据 textContent 同步维护，AI 不应直接生成。",
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
    "数组按下标深合并。",
    "datasource 永远使用默认结构，MCP 会把 textContent 同步到 datasource.constantData[0].text。",
    "单行文本默认 style.lineHeight = 1，且 style.height 与 style.fontSize 保持一致，便于 AI 精确计算文字盒位置。",
    "style.lineHeight 使用无单位倍率；如果 AI 误传大于 4 的像素式值，MCP 会按 lineHeight / fontSize 转成 1 到 2 之间的倍率。",
  ],
  examples: [
    {
      title: "饼图面板标题",
      props: {
        componentName: "SingleText",
        logicalId: "sales_panel_title",
        parentLogicalId: "sales_group",
        name: "销售面板标题",
        textContent: "销售渠道占比",
        style: {
          position: "absolute",
          left: 80,
          top: 112,
          width: 260,
          height: 22,
          fontSize: 22,
          color: "#DFF8FF",
          textAlign: "left",
          backgroundColor: "rgba(0,0,0,0)",
          fontWeight: "bold",
          fontStyle: "normal",
          letterSpacing: 2,
          lineHeight: 1,
        },
        textShadow: {
          isActive: true,
          color: "rgba(0,229,255,0.8)",
          x: 0,
          y: 0,
          blur: 10,
        },
      },
    },
  ],
};
