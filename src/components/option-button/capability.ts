import type { JsonObject } from "../../types/component.js";

export const optionButtonCapability: JsonObject = {
  componentName: "optionButton",
  displayName: "操作按钮",
  description: "大屏操作按钮组件，支持普通触发/切换选中语义、禁用状态、长文本、四向图标与四种状态样式。",
  aiRole:
    "AI 负责按钮文字、交互模式、图标、四种状态样式和布局；MCP 负责校验范围并补齐默认 props。组件层级由最终 schema 数组顺序决定。",
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
      description: "按钮内容整体对齐方式。默认 center。",
    },
    {
      path: "textOverflow",
      type: "enum",
      values: ["ellipsis", "clip", "wrap"],
      description: "长文字处理：省略号、裁切或自动换行。默认 ellipsis。",
    },
    {
      path: "showTooltip",
      type: "boolean",
      description: "省略号模式下是否提供悬停全文提示。默认 true。",
    },
    {
      path: "selectMode",
      type: "enum",
      values: ["momentary", "toggle"],
      description: "按钮语义：momentary=每次点击只触发命令，toggle=点击切换选中态。默认 momentary。",
    },
    {
      path: "defaultSelect",
      type: "boolean",
      description: "切换选中模式下的初始选中状态。默认 false。",
    },
    {
      path: "disabled",
      type: "boolean",
      description: "是否禁用。禁用时不响应鼠标或键盘触发，并使用 btnDisabledStyle。默认 false。",
    },
    {
      path: "showIcon",
      type: "boolean",
      description: "是否显示图标。默认 true。",
    },
    {
      path: "iconSize",
      type: "number",
      range: [8, 64],
      description: "图标尺寸（px）。默认 18。",
    },
    {
      path: "iconSpace",
      type: "number",
      range: [0, 48],
      description: "图标与文字间距（px）。默认 8。",
    },
    {
      path: "arrange",
      type: "enum",
      values: ["row", "column"],
      description: "旧 schema 的排列方式；新建组件优先使用 iconPosition。",
    },
    {
      path: "iconPosition",
      type: "enum",
      values: ["left", "right", "top", "bottom"],
      description: "图标相对文字的位置。默认 left。",
    },
    {
      path: "padding",
      type: "object",
      description: "按钮内容内边距，四边单位均为 px。",
      children: [
        { path: "padding.top", type: "number", range: [0, 64], description: "上内边距。" },
        { path: "padding.right", type: "number", range: [0, 64], description: "右内边距。" },
        { path: "padding.bottom", type: "number", range: [0, 64], description: "下内边距。" },
        { path: "padding.left", type: "number", range: [0, 64], description: "左内边距。" },
      ],
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
    {
      path: "btnDisabledStyle",
      type: "object",
      description: "禁用状态样式，支持背景、边框、文字和图标颜色。",
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
    "btnTextAlign 只能为 flex-start/center/flex-end，非法值重置为 center。",
    "iconPosition 只能为 left/right/top/bottom；旧 schema 缺少该字段时前端继续使用 arrange。",
    "selectMode=momentary 时点击不会锁定选中态；selectMode=toggle 时点击在默认态和选中态之间切换。",
    "disabled=true 时禁止点击与键盘触发，且禁用态优先于悬停态和选中态。",
  ],
  visualRules: [
    "查询、刷新、导出等命令使用 momentary；筛选开关、模式切换等有持续状态的控制使用 toggle。",
    "默认、悬停、选中、禁用四种状态必须保持相同字号、边框宽度和内边距，避免状态切换时布局跳动。",
    "按钮文字较长时优先使用 ellipsis + showTooltip；只有容器高度足够时才使用 wrap。",
  ],
  examples: [
    {
      title: "操作按钮配置示例",
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
