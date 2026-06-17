import type { JsonObject } from "../../types/component.js";

export const radioGroupCapability: JsonObject = {
  componentName: "RadioGroup",
  displayName: "单选组",
  description:
    "大屏单选组组件，支持水平/垂直排列、默认选中、选项间距与选中/未选中样式配置。",
  aiRole:
    "AI 负责选项数据、排列方向、默认选中和样式；MCP 负责把简化 options 转换为完整 dataConfig 并补齐其余 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "RadioGroup",
      description: "组件类型，必须固定为 RadioGroup。",
    },
    {
      path: "logicalId",
      type: "string",
      description:
        "组件唯一 ID，由 AI 生成，用于编辑器大纲树和 schema businessElementId；后端限制最长 50 个字符，必须包含短随机段以保证大屏内全局唯一。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "父级组件或分组 ID，由 AI 生成，用于编辑器大纲树分组关系。",
    },
    {
      path: "style",
      type: "object",
      description: "组件在画布上的位置、尺寸和文本样式。",
    },
  ],
  aiWritableProps: [
    {
      path: "name",
      type: "string",
      description: "图层名称，建议和用户语义一致。",
    },
    {
      path: "options",
      type: "array<object>",
      description:
        "单选选项数组，每项包含 { label, value }。MCP 会转换为 dataConfig.constant.data。",
    },
    {
      path: "direction",
      type: "enum",
      values: ["horizontal", "vertical"],
      description: "排列方向。默认 horizontal。",
    },
    {
      path: "optionSpacing",
      type: "number",
      description: "选项间距。默认 16。",
    },
    {
      path: "defaultSelectedType",
      type: "enum",
      values: ["index", "value", "none"],
      description: "默认选中方式。默认 index。",
    },
    {
      path: "defaultSelectedIndex",
      type: "number",
      description: "默认选中序号，从 1 开始。默认 1。",
    },
    {
      path: "defaultSelectedValue",
      type: "string",
      description: "默认选中值，defaultSelectedType 为 value 时生效。",
    },
    {
      path: "dotSize",
      type: "number",
      description: "圆点大小。默认 8。",
    },
    {
      path: "radioSize",
      type: "number",
      description: "单选框大小。默认 16。",
    },
    {
      path: "colorPrimary",
      type: "color",
      description: "主题色。默认 rgba(230,245,255,0.2862)。",
    },
    {
      path: "buttonStyle",
      type: "enum",
      values: ["outline", "solid"],
      description: "按钮样式。默认 outline。",
    },
    {
      path: "optionStyle",
      type: "object",
      description: "未选中选项样式。包含 color、fontSize、dotColor、colorPrimary、fontFamily、fontWeight、fontStyle、letterSpacing、lineHeight。",
    },
    {
      path: "selectedStyle",
      type: "object",
      description: "选中选项样式。字段同 optionStyle。",
    },
    {
      path: "style",
      type: "object",
      description: "位置、尺寸、字体、颜色、对齐。",
    },
    {
      path: "rotate",
      type: "number",
      range: [-360, 360],
      description: "旋转角度。默认 0。",
    },
    {
      path: "opacity",
      type: "number",
      range: [0, 1],
      description: "不透明度。默认 1。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "dataConfig",
      reason: "dataConfig 由 MCP 根据 options 自动生成，AI 不应直接写入。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "AI 填写 options 后，MCP 会生成完整 dataConfig。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "optionStyle/selectedStyle 缺失字段由 MCP 补齐为默认值。",
    "direction 只能为 horizontal 或 vertical，非法值会被重置为 horizontal。",
  ],
  visualRules: [
    "options 每项必须包含 label 和 value。",
    "单选组适合作为大屏状态切换或枚举选择。",
    "选项较多时建议使用 Select 组件。",
  ],
  examples: [
    {
      title: "科技风单选组",
      props: {
        componentName: "RadioGroup",
        logicalId: "theme_radio_group",
        parentLogicalId: "form_group",
        name: "时间维度",
        style: {
          position: "absolute",
          left: 100,
          top: 100,
          width: 300,
          height: 40,
        },
        options: [
          { label: "日", value: "day" },
          { label: "周", value: "week" },
          { label: "月", value: "month" },
        ],
        direction: "horizontal",
        optionSpacing: 20,
        selectedStyle: {
          color: "#00E5FF",
        },
      },
    },
  ],
};
