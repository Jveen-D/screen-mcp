import type { JsonObject } from "../../types/component.js";

export const inputCapability: JsonObject = {
  componentName: "Input",
  displayName: "输入框",
  description:
    "大屏输入框组件，支持字符串和数字两种输入类型、占位文本、默认值、背景、边框与输入样式。",
  aiRole:
    "AI 负责输入框类型、占位文本、默认值、位置尺寸和视觉样式；MCP 负责补齐其余 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Input",
      description: "组件类型，必须固定为 Input。",
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
      description: "输入框在画布上的位置、尺寸和文本样式。",
    },
  ],
  aiWritableProps: [
    {
      path: "name",
      type: "string",
      description: "图层名称，建议和用户语义一致。",
    },
    {
      path: "inputType",
      type: "enum",
      values: ["string", "number"],
      description: "输入类型。默认 string。",
    },
    {
      path: "defaultValue",
      type: "string|number",
      description: "默认值。默认空字符串。",
    },
    {
      path: "placeholder",
      type: "string",
      description: "占位文本。默认 请输入。",
    },
    {
      path: "debounceTime",
      type: "number",
      description: "防抖时间，单位 ms。默认 300。",
    },
    {
      path: "min",
      type: "number",
      description: "数字输入最小值。默认 0。",
    },
    {
      path: "max",
      type: "number",
      description: "数字输入最大值。默认 100。",
    },
    {
      path: "precision",
      type: "number",
      description: "数字输入小数位数。默认 0。",
    },
    {
      path: "backgroundType",
      type: "enum",
      values: ["color", "image"],
      description: "背景填充方式。默认 color。",
    },
    {
      path: "backgroundColor",
      type: "color",
      description: "背景颜色。默认 rgba(224,242,253,0.094)。",
    },
    {
      path: "backgroundImage",
      type: "string",
      description: "背景图片地址。",
    },
    {
      path: "border",
      type: "object",
      description: "边框配置。包含 show、width、color、radius。",
    },
    {
      path: "placeholderStyle",
      type: "object",
      description: "占位文本样式。包含 color、textAlign、fontSize。",
    },
    {
      path: "style",
      type: "object",
      description: "位置、尺寸、字体、颜色、对齐和背景。",
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
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "inputType 只能为 string 或 number，非法值会被重置为 string。",
    "border/placeholderStyle/style 中缺失字段由 MCP 补齐为默认值。",
  ],
  visualRules: [
    "输入框适合作为大屏筛选条件、参数录入或搜索入口。",
    "数字类型输入框应合理设置 min/max/precision，避免用户输入超出业务范围。",
    "占位文本颜色应与输入文本颜色形成明显对比。",
  ],
  examples: [
    {
      title: "科技风搜索输入框",
      props: {
        componentName: "Input",
        logicalId: "theme_search_input",
        parentLogicalId: "screen_group",
        name: "搜索输入框",
        style: {
          position: "absolute",
          left: 100,
          top: 100,
          width: 240,
          height: 40,
          color: "#ffffff",
          fontSize: 14,
          textAlign: "left",
        },
        placeholder: "请输入关键词",
        backgroundColor: "rgba(0,229,255,0.1)",
        border: {
          show: true,
          width: 1,
          color: "rgba(0,229,255,0.5)",
          radius: 4,
        },
      },
    },
  ],
};
