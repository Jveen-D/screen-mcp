import type { JsonObject } from "../../types/component.js";

export const datePickerCapability: JsonObject = {
  componentName: "DatePicker",
  displayName: "日期选择",
  description:
    "大屏日期选择组件，支持多种日期格式、默认值、占位文本和下拉面板样式配置。",
  aiRole:
    "AI 负责日期格式、默认值、占位文本和样式；MCP 负责补齐 dataConfig、selector、dropdown 等默认配置。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "DatePicker",
      description: "组件类型，必须固定为 DatePicker。",
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
      path: "dateFormat",
      type: "enum",
      values: ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD", "YYYY-MM", "YYYY-Q", "YYYY-WW", "YYYY"],
      description: "日期格式。默认 YYYY-MM-DD。",
    },
    {
      path: "defaultValue",
      type: "string",
      description: "默认值，格式需与 dateFormat 一致。默认空字符串。",
    },
    {
      path: "allowClear",
      type: "boolean",
      description: "是否允许清空。默认 true。",
    },
    {
      path: "selector.placeholder.content",
      type: "string",
      description: "占位文本。默认 请选择。",
    },
    {
      path: "selector",
      type: "object",
      description: "选项框配置，包含 placeholder、defaultValue.style、selected.style、backgroundType、backgroundColor、border、dropdownIcon。",
    },
    {
      path: "dropdown",
      type: "object",
      description: "下拉面板配置，包含 backgroundColor、optionControl、defaultOption、selectedOption。",
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
      reason: "dataConfig 由 MCP 自动生成，AI 不应直接写入。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "selector/dropdown 缺失字段由 MCP 补齐为默认值。",
    "dateFormat 只能为预设枚举值，非法值会被重置为 YYYY-MM-DD。",
  ],
  visualRules: [
    "defaultValue 格式必须与 dateFormat 一致。",
    "日期选择适合作为大屏时间筛选条件。",
    "下拉面板背景色应与组件整体风格协调。",
  ],
  examples: [
    {
      title: "日期选择配置示例",
      props: {
        componentName: "DatePicker",
        logicalId: "theme_date_picker",
        parentLogicalId: "form_group",
        name: "日期选择",
        style: {
          position: "absolute",
          left: 100,
          top: 100,
          width: 180,
          height: 40,
        },
        dateFormat: "YYYY-MM-DD",
        selector: {
          placeholder: {
            content: "请选择日期",
          },
        },
      },
    },
  ],
};
