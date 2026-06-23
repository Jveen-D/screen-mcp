import type { JsonObject } from "../../types/component.js";

export const freeformModuleCapability: JsonObject = {
  moduleName: "FreeformModule",
  displayName: "自由模块",
  description:
    "自由模块只负责把 LLM 明确提供的任意大屏组件编译成一个 __Group__ 模块树，不推断主题、不补齐布局、不生成背景或装饰模板。",
  groupSchema: {
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {},
    description:
      "模块根节点固定为 __Group__，children 来自 slots.children 中的组件。可通过 grouping 控制是否按语义生成标题、装饰、主内容、背景等子分组。",
    fields: [
      { path: "id", type: "string", description: "模块分组唯一标识。" },
      { path: "componentName", type: "string", value: "__Group__" },
      { path: "structVersion", type: "string", value: "0.0.0" },
      { path: "props", type: "object", value: {} },
      { path: "title", type: "string", description: "模块标题。" },
      { path: "isHidden", type: "boolean", value: false },
      { path: "isLocked", type: "boolean", value: false },
      { path: "isGroup", type: "boolean", value: true },
      { path: "children", type: "array", description: "模块内组件或语义子分组。" },
    ],
  },
  requiredProps: [
    {
      path: "moduleName",
      type: "string",
      value: "FreeformModule",
      description: "模块类型，必须固定为 FreeformModule。",
    },
    {
      path: "logicalId",
      type: "string",
      description: "模块 ID，用于生成模块根分组 ID。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "模块所属父级 ID。",
    },
    {
      path: "style",
      type: "object",
      description: "模块容器在画布上的绝对位置和尺寸，用于校验和空间规划。",
      children: [
        { path: "style.left", type: "number" },
        { path: "style.top", type: "number" },
        { path: "style.width", type: "number" },
        { path: "style.height", type: "number" },
        { path: "style.position", type: "string", value: "absolute" },
      ],
    },
    {
      path: "slots.children",
      type: "array",
      description:
        "LLM 明确设计的组件数组。每个子组件必须提供 componentName、logicalId 和 style；parentLogicalId 会被模块自动设置为模块根 ID。",
    },
  ],
  optionalProps: [
    {
      path: "title",
      type: "string",
      description: "模块树标题，仅用于编辑器图层树。",
    },
    {
      path: "grouping",
      type: "object",
      description:
        "模块内分组策略。默认按语义分桶，但单组件桶保持扁平；若希望标题、主内容、背景等即使只有一个组件也显示为分组，设置 singleChildGroup: true。",
      children: [
        {
          path: "grouping.mode",
          type: "enum",
          values: ["semantic", "none"],
          description: "semantic=按语义分组；none=不创建语义分组，仅保证 SingleImage 背景在最后。",
        },
        {
          path: "grouping.singleChildGroup",
          type: "boolean",
          description: "true 时单个组件也会包成语义 __Group__。",
        },
      ],
    },
  ],
  slots: {
    children: {
      supportedComponents: ["*"],
      required: true,
      multiple: true,
      description:
        "可使用 list_components 返回的任意组件，例如 SingleText、Indicator、Gauge、BaseTable、ScrollList、地图组件、图表组件、SvgDecoration、SingleImage 等。",
    },
  },
  layoutRules: [
    "FreeformModule 不提供任何固定布局、默认背景、默认装饰或业务文本；LLM 必须先根据用户需求决定组件列表、主题颜色、坐标、尺寸、层级和视觉语言。",
    "slots.children 中的每个组件使用画布绝对坐标，并应落在 module.style 定义的模块区域内；MCP 只编译，不重新排版。",
    "同一模块内需要可编辑的结构层级时，设置 grouping.singleChildGroup=true；否则只有同语义桶包含多个组件时才自动生成子分组。",
    "语义分组是通用规则：SingleImage 进入背景组，SvgDecoration 进入装饰组，标题类 SingleText/SvgDecoration 进入标题组，其余业务组件进入主内容组。",
    "SingleImage 背景必须排在同级数组最后；当启用语义分组时，背景组也会排在模块子分组最后，避免遮挡真实内容。",
    "FreeformModule 适合 KPI 指标区、表格区、地图区、视频区、控制区、混合信息卡等非标准图表面板；图表分析面板仍优先使用 ChartPanel。",
  ],
  examples: [
    {
      title: "KPI 指标自由模块",
      props: {
        moduleName: "FreeformModule",
        logicalId: "kpi_panel",
        parentLogicalId: "root",
        title: "核心指标",
        grouping: {
          mode: "semantic",
          singleChildGroup: true,
        },
        style: {
          position: "absolute",
          left: 48,
          top: 96,
          width: 720,
          height: 180,
        },
        slots: {
          children: [
            {
              componentName: "SingleText",
              logicalId: "kpi_title",
              name: "模块标题",
              textContent: "核心指标",
              style: {
                position: "absolute",
                left: 72,
                top: 112,
                width: 220,
                height: 22,
                fontSize: 22,
                lineHeight: 1,
              },
            },
            {
              componentName: "Indicator",
              logicalId: "revenue_indicator",
              name: "销售额",
              textValue: 128760,
              titleName: "销售额",
              suffix: true,
              suffixTitle: "元",
              style: {
                position: "absolute",
                left: 72,
                top: 146,
                width: 300,
                height: 92,
              },
            },
            {
              componentName: "SvgDecoration",
              logicalId: "kpi_border",
              name: "指标面板边框",
              svgSource: "custom",
              svgContent:
                '<svg viewBox="0 0 720 180" xmlns="http://www.w3.org/2000/svg"><path d="M1 24V1h80M719 156v23h-80" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
              style: {
                position: "absolute",
                left: 48,
                top: 96,
                width: 720,
                height: 180,
              },
            },
            {
              componentName: "SingleImage",
              logicalId: "kpi_background",
              name: "指标背景",
              imageBase64: "data:image/png;base64,...",
              opacity: 0.92,
              style: {
                position: "absolute",
                left: 48,
                top: 96,
                width: 720,
                height: 180,
              },
            },
          ],
        },
      },
    },
  ],
};
