import type { JsonObject } from "../../types/component.js";

export const dateRangePickerCapability: JsonObject = {
  componentName: "DateRangePicker",
  displayName: "日期范围选择",
  description:
    "大屏日期范围选择组件，支持起始/结束日期占位、分隔符、智能日期限制和下拉面板样式配置。",
  aiRole:
    "AI 负责日期格式、占位文本、分隔符和样式；MCP 负责补齐 dataConfig、selector、dropdown 等默认配置。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "DateRangePicker",
      description: "组件类型，必须固定为 DateRangePicker。",
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
      type: "array",
      itemType: "string",
      description: "默认日期范围数组 [start, end]，格式需与 dateFormat 一致。默认空数组。",
    },
    {
      path: "allowClear",
      type: "boolean",
      description: "是否允许清空。默认 true。",
    },
    {
      path: "selector.placeholder.content",
      type: "array",
      itemType: "string",
      description: "开始/结束占位文本数组，默认 [\"开始日期\", \"结束日期\"]。",
    },
    {
      path: "selector.separator",
      type: "string",
      description: "开始与结束日期之间的分隔符。默认 ~。",
    },
    {
      path: "selector",
      type: "object",
      description: "选项框配置，包含 placeholder、defaultValue.style、selected.style、backgroundType、backgroundColor、border、dropdownIcon、separator。",
    },
    {
      path: "dropdown",
      type: "object",
      description: "下拉面板配置，包含 backgroundColor、rangeOption、optionControl、defaultOption、selectedOption、intellDateLimitType。",
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
    "defaultValue 数组长度应为 0 或 2。",
    "日期范围选择适合作为大屏时间区间筛选条件。",
    "下拉面板背景色应与组件整体风格协调。",
  ],
  examples: [
    {
      title: "科技风日期范围选择",
      props: {
        componentName: "DateRangePicker",
        logicalId: "theme_date_range_picker",
        parentLogicalId: "form_group",
        name: "日期范围选择",
        style: {
          position: "absolute",
          left: 300,
          top: 100,
          width: 280,
          height: 40,
        },
        dateFormat: "YYYY-MM-DD",
        selector: {
          placeholder: {
            content: ["开始", "结束"],
          },
          separator: "至",
        },
      },
    },
  ],
};
