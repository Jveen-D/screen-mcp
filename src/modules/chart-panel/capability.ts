import type { JsonObject } from "../../types/component.js";

export const chartPanelCapability: JsonObject = {
  moduleName: "ChartPanel",
  displayName: "图表面板",
  description:
    "通用图表面板模块，用背景、标题、主图表和装饰元素组合出可插入画布的组件 schema 数组。",
  requiredProps: [
    {
      path: "moduleName",
      type: "string",
      value: "ChartPanel",
      description: "模块类型，必须固定为 ChartPanel。",
    },
    {
      path: "logicalId",
      type: "string",
      description: "模块 ID，用于派生子组件 logicalId。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "模块所属父级 ID。",
    },
    {
      path: "style",
      type: "object",
      description: "模块容器在画布上的绝对位置和尺寸。",
      children: [
        { path: "style.left", type: "number" },
        { path: "style.top", type: "number" },
        { path: "style.width", type: "number" },
        { path: "style.height", type: "number" },
        { path: "style.position", type: "string", value: "absolute" },
        { path: "style.zIndex", type: "number" },
      ],
    },
    {
      path: "slots.mainChart",
      type: "object",
      description: "主图表 slot，当前可使用 PieChart，未来可扩展其他图表组件。",
    },
  ],
  optionalProps: [
    {
      path: "title",
      type: "string",
      description: "标题文本。也可通过 slots.title.props.textContent 覆盖。",
    },
    {
      path: "theme",
      type: "object",
      description: "模块主题色，用于映射标题、图表色板和 SVG 装饰。",
    },
  ],
  slots: {
    background: {
      supportedComponents: ["SingleImage"],
      required: false,
      multiple: false,
      description:
        "背景图，默认铺满整个模块。优先使用用户提供的 imageBase64；不要生成不可访问的图片链接。",
    },
    title: {
      supportedComponents: ["SingleText"],
      required: false,
      multiple: false,
      description: "标题文本，默认位于模块顶部。",
    },
    mainChart: {
      supportedComponents: ["PieChart"],
      required: true,
      multiple: false,
      description: "主图表，默认位于标题下方主体区域。",
    },
    decorations: {
      supportedComponents: ["SvgDecoration"],
      required: false,
      multiple: true,
      description:
        "装饰元素，默认使用 custom svgContent。不要依赖 svgPreset 图标库，除非用户明确提供可用 preset。",
    },
  },
  layoutRules: [
    "所有子组件都以 module.style 为容器基准计算绝对位置。",
    "background 默认铺满模块区域，zIndex = module.zIndex。",
    "background 优先使用 imageBase64。没有可用图片资源时不要伪造 imageSrc。",
    "title 默认位于顶部，left = module.left + 24，top = module.top + 18，zIndex = module.zIndex + 3。",
    "mainChart 默认位于标题下方主体区域，left = module.left + 32，top = module.top + 72，zIndex = module.zIndex + 2。",
    "mainChart 默认 option.backgroundColor = transparent，使图表与面板背景协调。",
    "decorations 默认 zIndex = module.zIndex + 4，并默认生成安全 custom svgContent，可通过 props.style 覆盖具体位置。",
    "模块层只做布局编排和主题映射，组件细节仍由 component capability 和 generateComponentsSchema 处理。",
  ],
  supportedMainComponents: ["PieChart"],
  examples: [
    {
      title: "科技风饼图面板",
      props: {
        moduleName: "ChartPanel",
        logicalId: "sales_channel_panel",
        parentLogicalId: "root",
        title: "销售渠道占比",
        style: {
          left: 48,
          top: 96,
          width: 520,
          height: 360,
          position: "absolute",
          zIndex: 10,
        },
        theme: {
          primaryColor: "#00E5FF",
          secondaryColor: "#7C4DFF",
          accentColor: "#FFB300",
          textColor: "#DFF8FF",
        },
        slots: {
          background: {
            componentName: "SingleImage",
            props: {
              name: "销售面板背景",
              imageBase64: "data:image/png;base64,...",
              opacity: 0.95,
            },
          },
          title: {
            componentName: "SingleText",
            props: {
              textContent: "销售渠道占比",
            },
          },
          mainChart: {
            componentName: "PieChart",
            props: {
              option: {
                color: ["#00E5FF", "#7C4DFF", "#FFB300", "#00C853"],
                legend: {
                  left: "center",
                  top: "bottom",
                },
                series: [
                  {
                    radius: ["42%", "68%"],
                  },
                ],
              },
            },
          },
          decorations: [
            {
              componentName: "SvgDecoration",
              props: {
                name: "右上角科技装饰",
                svgSource: "custom",
                svgContent:
                  '<svg viewBox="0 0 120 64" xmlns="http://www.w3.org/2000/svg"><path d="M4 60V18C4 10.268 10.268 4 18 4h42" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
                primaryColor: "#00E5FF",
                glow: {
                  isActive: true,
                  color: "rgba(0,229,255,0.55)",
                  blur: 8,
                },
              },
            },
          ],
        },
      },
    },
  ],
};
