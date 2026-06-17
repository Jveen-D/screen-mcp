import type { JsonObject } from "../../types/component.js";

export const optionButtonCapability: JsonObject = {
  componentName: "optionButton",
  displayName: "操作按钮",
  description: "大屏操作按钮组件，支持默认、悬停、选中三种状态样式和图标配置。",
  aiRole:
    "AI 负责按钮文字、图标、三种状态样式和布局；MCP 负责补齐默认 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "optionButton",
      description: "组件类型，必须固定为 optionButton。",
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
      description: "组件在画布上的位置、尺寸。",
    },
  ],
  aiWritableProps: [
    { path: "name", type: "string", description: "图层名称。" },
    {
      path: "btnText",
      type: "string",
      description: "按钮文字。默认 操作按钮。",
    },
    {
      path: "btnTextAlign",
      type: "enum",
      values: ["flex-start", "center", "flex-end"],
      description: "文字对齐方式。默认 flex-start。",
    },
    {
      path: "defaultSelect",
      type: "boolean",
      description: "默认是否选中。默认 false。",
    },
    {
      path: "showIcon",
      type: "boolean",
      description: "是否显示图标。默认 true。",
    },
    {
      path: "iconSize",
      type: "number",
      description: "图标尺寸。默认 36。",
    },
    {
      path: "iconSpace",
      type: "number",
      description: "图标与文字间距。默认 20。",
    },
    {
      path: "arrange",
      type: "enum",
      values: ["row", "column"],
      description: "排列方式。默认 row。",
    },
    {
      path: "btnIcon",
      type: "object",
      description: "图标配置，包含 iconSrc、iconType。",
    },
    {
      path: "btnDefaultStyle",
      type: "object",
      description: "默认状态样式。",
    },
    {
      path: "btnHoverStyle",
      type: "object",
      description: "悬停状态样式。",
    },
    {
      path: "btnSelectStyle",
      type: "object",
      description: "选中状态样式。",
    },
    { path: "style", type: "object", description: "位置、尺寸。" },
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
    "arrange 只能为 row/column，非法值重置为 row。",
    "btnTextAlign 只能为 flex-start/center/flex-end，非法值重置为 flex-start。",
  ],
  visualRules: [
    "操作按钮适合作为大屏交互入口或筛选触发器。",
    "三种状态样式应保持一致的风格。",
  ],
  examples: [
    {
      title: "科技风操作按钮",
      props: {
        componentName: "optionButton",
        logicalId: "theme_option_button",
        parentLogicalId: "form_group",
        name: "查询按钮",
        style: {
          position: "absolute",
          left: 100,
          top: 100,
          width: 160,
          height: 48,
        },
        btnText: "查询",
        arrange: "row",
        btnDefaultStyle: {
          color: "#C6E4FF",
          backgroundColor: "rgba(47,125,220,0.69)",
        },
      },
    },
  ],
};
