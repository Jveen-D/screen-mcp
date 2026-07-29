import type { JsonObject } from "../../types/component.js";

export const multiTextCapability: JsonObject = {
  componentName: "MultiText",
  displayName: "多行文本",
  description:
    "用于大屏模块说明、底部结论、长文本段落和换行文本展示的多行文本组件。",
  aiRole:
    "AI 负责文本内容、位置、尺寸、字体和视觉样式。MCP 负责补齐默认 props 并规范化行高与高度。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "MultiText",
      description: "组件类型，必须固定为 MultiText。",
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
      description: "多行文本内容，支持使用 \\n 换行。",
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
        "行高是 React/CSS 无单位倍率，不是 px。多行文本默认使用 1.6；如果 AI 误传大于 4 的像素式值，MCP 会按 lineHeight / fontSize 转成 1 到 2 之间的倍率。",
    },
    {
      path: "textOverflow",
      type: "enum",
      values: ["hidden", "auto", "visible"],
      description: "内容超过固定高度时选择裁剪、滚动或继续显示。",
    },
    {
      path: "wordBreak",
      type: "enum",
      values: ["break-word", "break-all", "normal"],
      description: "长单词和连续字符的换行策略。",
    },
    { path: "rotate", type: "number", range: [-360, 360], description: "旋转角度。" },
    { path: "opacity", type: "number", range: [0, 1], description: "不透明度。" },
    { path: "textShadow", type: "object", description: "文字阴影配置。" },
  ],
  aiForbiddenProps: [
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
    "多行文本默认 style.lineHeight = 1.6、按词换行并裁剪容器溢出；需要浏览长内容时可显式启用滚动。",
    "style.lineHeight 使用无单位倍率；如果 AI 误传大于 4 的像素式值，MCP 会按 lineHeight / fontSize 转成 1 到 2 之间的倍率。",
  ],
  examples: [
    {
      title: "模块底部结论",
      props: {
        componentName: "MultiText",
        logicalId: "sales_panel_conclusion",
        parentLogicalId: "sales_group",
        name: "底部结论",
        textContent: "重点关注：分类A占比持续提升，\n建议继续跟踪变化趋势。",
        style: {
          position: "absolute",
          left: 80,
          top: 420,
          width: 360,
          height: 48,
          fontSize: 14,
          color: "#DFF8FF",
          textAlign: "left",
          backgroundColor: "rgba(0,0,0,0)",
          fontWeight: "normal",
          fontStyle: "normal",
          letterSpacing: 0,
          lineHeight: 1.5,
        },
      },
    },
  ],
};
