import type { JsonObject } from "../../types/component.js";

export const selectCapability: JsonObject = {
  componentName: "Select",
  displayName: "下拉选择",
  description:
    "大屏下拉选择组件，支持常量数据源、默认选中、占位文本、下拉框样式与选项样式配置。",
  aiRole:
    "AI 负责选项数据、默认选中方式、占位文本和样式；MCP 负责把简化 options 转换为完整 dataConfig 并补齐 selector/dropdown 等默认配置。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Select",
      description: "组件类型，必须固定为 Select。",
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
        "下拉选项数组，每项包含 { label, value }。MCP 会转换为 dataConfig.constant.data，维度字段为 name，指标字段为 value。",
    },
    {
      path: "defaultSelectedType",
      type: "enum",
      values: ["index", "value", "none"],
      description: "默认选中方式。index 按序号、value 按固定值、none 不选中。默认 index。",
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
      path: "allowClear",
      type: "boolean",
      description: "是否允许清空选择。默认 true。",
    },
    {
      path: "selector.placeholder.content",
      type: "string",
      description: "占位文本。默认 请选择。",
    },
    {
      path: "selector",
      type: "object",
      description: "选项框配置，包含 paddingLeft、selected.style、placeholder、backgroundType、backgroundColor、border、dropdownIcon、selectedIcon。",
    },
    {
      path: "dropdown",
      type: "object",
      description: "下拉框配置，包含 direction、height、optionHeight、defaultOption、selectedOption、hoverOption、backgroundColor 等。",
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
    "AI 填写 options 后，MCP 会生成完整 dataConfig（constant/data/originalData/fieldList/dimension/indicator）。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "selector/dropdown 缺失字段由 MCP 补齐为默认值。",
    "defaultSelectedType 只能为 index/value/none，非法值会被重置为 index。",
  ],
  visualRules: [
    "options 每项必须包含 label 和 value。",
    "下拉选择适合作为大屏筛选条件、状态切换或枚举选择。",
    "选项数量较多时，应调整 dropdown.height 和 optionHeight 避免滚动条过短。",
  ],
  examples: [
    {
      title: "科技风状态下拉",
      props: {
        componentName: "Select",
        logicalId: "theme_select",
        parentLogicalId: "form_group",
        name: "状态下拉",
        style: {
          position: "absolute",
          left: 100,
          top: 100,
          width: 180,
          height: 40,
        },
        options: [
          { label: "全部", value: "all" },
          { label: "运行中", value: "running" },
          { label: "已停止", value: "stopped" },
        ],
        defaultSelectedType: "index",
        defaultSelectedIndex: 1,
        selector: {
          placeholder: {
            content: "请选择状态",
          },
        },
      },
    },
  ],
};
