import type { JsonObject } from "../../types/component.js";

export const svgDecorationCapability: JsonObject = {
  componentName: "SvgDecoration",
  displayName: "SVG装饰",
  description:
    "只用于大屏角标、线条、边框、科技纹理、图标和发光装饰的 SVG 组件，不能承载真实图表或业务文本。",
  aiRole:
    "AI 负责选择 preset 或填写安全的装饰性 svgContent，并设置位置、尺寸、颜色、翻转和发光。MCP 负责补齐默认 props，并会拒绝非装饰性 SVG。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "SvgDecoration",
      description: "组件类型，必须固定为 SvgDecoration。",
    },
    {
      path: "logicalId",
      type: "string",
      description: "组件唯一 ID，由 AI 生成。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "父级组件或分组 ID，由 AI 生成。",
    },
    {
      path: "style",
      type: "object",
      description: "SVG 在画布上的位置和尺寸。",
    },
  ],
  aiWritableProps: [
    { path: "name", type: "string", description: "图层名称。" },
    { path: "style", type: "object", description: "位置、尺寸和背景。" },
    { path: "rotate", type: "number", range: [-360, 360], description: "旋转角度。" },
    { path: "opacity", type: "number", range: [0, 1], description: "不透明度。" },
    {
      path: "svgSource",
      type: "enum",
      values: ["preset", "custom"],
      description: "SVG 来源。优先使用 preset；只有用户明确要求自定义时使用 custom。",
    },
    {
      path: "svgPreset",
      type: "string",
      description: "预设 SVG 图标 ID，例如 icon-Frame3。",
    },
    {
      path: "svgContent",
      type: "string",
      description:
        "完整 <svg>...</svg> 字符串。只能用于装饰线条、边框、角标、纹理或图标；不允许绘制饼图、柱图、折线图、信息卡、业务文本、数值、占比、标题或结论说明。",
    },
    {
      path: "svgFit",
      type: "enum",
      values: ["contain", "cover", "fill"],
      description: "SVG 适配方式。",
    },
    { path: "primaryColor", type: "color", description: "主色。" },
    { path: "secondaryColor", type: "color", description: "辅助色。" },
    { path: "accentColor", type: "color", description: "强调色。" },
    { path: "strokeWidth", type: "number", description: "线条粗细。" },
    { path: "flipX", type: "boolean", description: "是否水平翻转。" },
    { path: "flipY", type: "boolean", description: "是否垂直翻转。" },
    { path: "glow", type: "object", description: "发光配置。" },
  ],
  aiForbiddenProps: [
    {
      path: "svgContent.script",
      reason: "SVG 不允许包含 <script>。",
    },
    {
      path: "svgContent.foreignObject",
      reason: "SVG 不允许包含 foreignObject。",
    },
    {
      path: "svgContent.eventHandlers",
      reason: "SVG 不允许包含 onclick/onload 等事件属性。",
    },
    {
      path: "svgContent.externalResource",
      reason: "SVG 不允许包含 http、https、javascript:、data:text/html 等外链或脚本资源。",
    },
    {
      path: "svgContent.chart",
      reason:
        "真实图表必须使用 PieChart 等图表组件生成，不能用 SvgDecoration 手绘饼图、环形图、柱图或折线图。",
    },
    {
      path: "svgContent.text",
      reason:
        "业务文本、标题、数值、占比、摘要和结论必须使用 SingleText 等文本组件生成，不能写进 SVG。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
    {
      path: "targetUrl",
      reason: "超链接涉及跳转行为，默认不由 AI 生成。",
    },
    {
      path: "openBrowser",
      reason: "打开新窗口涉及跳转行为，默认不由 AI 生成。",
    },
  ],
  mergeRules: [
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "svgSource 为 custom 时必须提供安全静态 svgContent。",
    "MCP 会拒绝包含脚本、事件属性、foreignObject 或外链资源的 svgContent。",
    "MCP 会拒绝包含 <text> 或明显图表弧线的 custom svgContent；这类内容必须改用文本组件或图表组件。",
    "SvgDecoration 只能作为装饰层，不得作为承载完整模块内容的画布。",
  ],
  examples: [
    {
      title: "面板右上角发光装饰",
      props: {
        componentName: "SvgDecoration",
        logicalId: "panel_corner_svg",
        parentLogicalId: "sales_group",
        name: "右上角科技装饰",
        style: {
          width: 120,
          height: 64,
          position: "absolute",
          left: 448,
          top: 96,
          backgroundColor: "rgba(0,0,0,0)",
        },
        rotate: 0,
        opacity: 0.9,
        svgSource: "preset",
        svgPreset: "icon-Frame3",
        svgFit: "contain",
        primaryColor: "#00E5FF",
        secondaryColor: "#1B5CFF",
        accentColor: "#FFFFFF",
        strokeWidth: 2,
        flipX: false,
        flipY: false,
        glow: {
          isActive: true,
          color: "rgba(0,229,255,0.55)",
          blur: 8,
        },
      },
    },
  ],
};
