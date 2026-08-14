import type { JsonObject } from "../../types/component.js";

export const layoutPlaceholderCapability: JsonObject = {
  moduleName: "LayoutPlaceholder",
  displayName: "布局确认占位",
  description:
    "仅用于从零搭建大屏时的内容布局确认阶段。调用方提供真实区块标题、表现形式、内容摘要和区域坐标，MCP 生成可导入编辑器的临时边框、标题和说明节点；用户确认后必须删除并替换为真实内容。",
  groupSchema: {
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {},
    description:
      "generate_module_tree_schema 可把同一区块的三个临时节点包装为一个 __Group__；常规布局确认流程使用 generate_module_schema 返回三个可独立替换的节点。",
    fields: [
      { path: "id", type: "string", description: "占位区块分组唯一标识。" },
      { path: "componentName", type: "string", value: "__Group__" },
      { path: "structVersion", type: "string", value: "0.0.0" },
      { path: "props", type: "object", description: "包含区块绝对位置和尺寸。" },
      { path: "title", type: "string", description: "布局占位区块标题。" },
      { path: "isHidden", type: "boolean", value: false },
      { path: "isLocked", type: "boolean", value: false },
      { path: "isGroup", type: "boolean", value: true },
      { path: "children", type: "array", description: "边框、标题和说明三个临时节点。" },
    ],
  },
  requiredProps: [
    {
      path: "moduleName",
      type: "string",
      value: "LayoutPlaceholder",
      description: "模块类型，必须固定为 LayoutPlaceholder。",
    },
    {
      path: "logicalId",
      type: "string",
      description: "当前占位区块的语义 ID，MCP 用它派生三个全局唯一节点 ID。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "三个占位节点所属的页面或父分组 ID。",
    },
    {
      path: "title",
      type: "string",
      description: "真实业务区块标题，例如项目概况；禁止面板1、待定等无意义名称。",
    },
    {
      path: "presentation",
      type: "string",
      description: "计划采用的表现形式，例如指标卡、环形图或指标加趋势图。",
    },
    {
      path: "contentSummary",
      type: "string",
      description: "该区块计划表达的真实内容摘要，例如在建项目数、完成率和投资进度。",
    },
    {
      path: "style",
      type: "object",
      description: "占位区块在画布上的绝对位置和尺寸，也是后续真实区块的替换区域。",
      children: [
        { path: "style.left", type: "number" },
        { path: "style.top", type: "number" },
        { path: "style.width", type: "number", minimum: 120 },
        { path: "style.height", type: "number", minimum: 96 },
        { path: "style.position", type: "string", value: "absolute" },
      ],
    },
    {
      path: "slots",
      type: "object",
      value: {},
      description:
        "固定传空对象。本模块的组件组合由 MCP 维护，调用方不得自行指定组件类型或字段。",
    },
  ],
  optionalProps: [
    {
      path: "theme",
      type: "object",
      description: "当前大屏主题，用于派生占位边框和文字颜色。",
      children: [
        { path: "theme.primaryColor", type: "color", description: "边框主色。" },
        { path: "theme.textColor", type: "color", description: "标题和说明文字颜色。" },
      ],
    },
  ],
  slots: {
    callerWritable: false,
    generatedComponents: ["SvgDecoration", "SingleText"],
    description:
      "这是固定的临时编辑器结构，不接受调用方组件 slot。MCP 始终生成一个安全非空边框节点和两个真实文本节点。",
  },
  layoutRules: [
    "LayoutPlaceholder 只用于从零搭建流程中用户确认内容布局之前，不得作为最终业务区块、生产大屏模板或 DashboardSpec 常规模块使用；DashboardSpec 校验会明确拒绝它。",
    "调用方决定区块数量、业务标题、表现形式、内容摘要和绝对区域；MCP 不根据行业关键词决定布局、颜色、模块数量或图表类型。",
    "每个区块固定生成一个覆盖 style 区域的透明细边框、一个标题和一个说明。标题与说明水平内缩 16px；标题位于顶部 16px，说明位于顶部 52px。",
    "说明文本由 presentation 和 contentSummary 组合为“表现形式 · 内容摘要”，不得使用面板1、待定、占位文本等无意义内容。",
    "边框使用非空 custom SVG，不使用空 SvgDecoration、空图片或 base64 素材，也不放宽正常 DashboardSpec 对空 SVG 和占位文案的拒绝规则。",
    "返回顺序遵循编辑器同级节点越靠前越在上层的规则：标题和说明在前，边框在后；所有节点带明确 layerRole 和 zIndex。",
    "调用方必须记录 MCP 返回的三个 businessElementId。用户确认布局后，删除这三个临时节点，并在同一 style 区域放入真实区块或组件。",
  ],
  examples: [
    {
      title: "项目概况布局确认",
      props: {
        moduleName: "LayoutPlaceholder",
        logicalId: "placeholder_project_overview",
        parentLogicalId: "current_page",
        title: "项目概况",
        presentation: "指标卡",
        contentSummary: "在建项目数、完成率和投资进度",
        theme: {
          primaryColor: "#3A84FF",
          textColor: "#DFF8FF",
        },
        style: {
          position: "absolute",
          left: 48,
          top: 120,
          width: 560,
          height: 320,
        },
        slots: {},
      },
    },
  ],
};
