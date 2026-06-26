import type { JsonObject } from "../../types/component.js";

export const svgDecorationCapability: JsonObject = {
  componentName: "SvgDecoration",
  displayName: "SVG装饰",
  description:
    "只用于大屏角标、线条、边框、科技纹理、图标和发光装饰的 SVG 组件，不能承载真实图表或业务文本。AI 始终拥有设计权，可主动生成装饰性 SVG；仅当用户明确禁止装饰时才可省略。",

  aiRole:
    "AI 负责自主设计安全的装饰性 svgContent，并设置位置、尺寸、颜色、翻转和发光。只要有助于大屏视觉，就应主动用 custom svgContent 生成边框、角标、结构线、网格、扫描线或光效装饰；除非用户明确禁止装饰，否则不应留白底。MCP 负责补齐默认 props，并会清空不安全或非装饰性 svgContent，不会回退固定 preset 图标。",

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
      description: "组件唯一 ID，由 AI 生成；后端限制最长 50 个字符，必须包含短随机段以保证大屏内全局唯一。",
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
      description: "SVG 来源。AI 主动设计时优先使用 custom；preset 仅在明确选择已知小尺寸图标且 svgPreset 非空时使用。",
    },
    {
      path: "svgPreset",
      type: "string",
      description: "预设 SVG 图标 ID，例如 icon-Frame3。没有明确图标 ID 时不要填写 preset；MCP 不提供默认 preset 图标。",
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
    "svgSource 为 custom 时必须提供安全静态 svgContent；空内容会保留为 custom 空装饰，不会回退 preset。",
    "MCP 会清空包含脚本、事件属性、foreignObject 或外链资源的 svgContent。",
    "MCP 会清空包含 <text> 或明显图表弧线的 custom svgContent；这类内容必须改用文本组件或图表组件。",
    "svgSource 为 preset 时必须显式提供非空 svgPreset；否则会转为空 custom 装饰，避免出现默认图标。",
    "在 DashboardSpec 中，空 SvgDecoration 会被视为结构错误；需要装饰时必须提供非空 svgContent 或显式非空 svgPreset。",
    "SvgDecoration 只能作为装饰层，不得作为承载完整模块内容的画布。",
    "AI 始终保有装饰设计权：只要设计需要，就可以添加 SvgDecoration；只有当用户明确说'不要装饰'、'极简'、'无装饰'时才可省略。",
  ],
  visualRules: [
    "SvgDecoration 是科技感和模块承载结构的主要来源，适用于边框、角标、标题承托、结构线、分割线、网格纹理、扫描线和发光点缀。",
    "深色主题下，应主动生成可见的装饰元素：使用主题色描边、低透明填充、弱发光和连续结构线，不能只改背景色或完全省略装饰。",
    "装饰必须肉眼可见但不抢主信息：标题、主图表和关键数据必须始终在最上层可读。",
    "优先使用 custom svgContent 设计贴合模块主题的装饰；preset 仅用于小尺寸图标点缀。",
    "禁止依赖空 SvgDecoration 或默认 preset 图标作为模块装饰；需要装饰时必须由 AI 写出具体 custom svgContent。",
    "避免使用完全透明或依赖继承色的 SVG；应显式设置 primaryColor/secondaryColor 和适当 opacity。",
    "同一模块内的装饰语言应统一：角标、底边线、标题承托使用相似的描边粗细、圆角/切角风格和色值。",
    "除非用户明确禁止，否则每个面板/模块至少应包含一种可见装饰：标题承托、面板边框、角标、结构线或网格纹理中的一种。",
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
        svgSource: "custom",
        svgContent:
          '<svg viewBox="0 0 120 64" xmlns="http://www.w3.org/2000/svg"><path d="M8 56V18L24 4h88" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/><path d="M72 4h28l12 12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".9"/><circle cx="18" cy="46" r="3" fill="currentColor" opacity=".85"/></svg>',
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
    {
      title: "面板底部结构线",
      props: {
        componentName: "SvgDecoration",
        logicalId: "panel_bottom_line",
        parentLogicalId: "sales_group",
        name: "底部结构线",
        style: {
          width: 480,
          height: 24,
          position: "absolute",
          left: 20,
          top: 320,
          backgroundColor: "rgba(0,0,0,0)",
        },
        rotate: 0,
        opacity: 0.85,
        svgSource: "custom",
        svgContent:
          '<svg viewBox="0 0 480 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 12h472" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".72"/><circle cx="4" cy="12" r="3" fill="currentColor" opacity=".9"/><circle cx="476" cy="12" r="3" fill="currentColor" opacity=".9"/><path d="M160 12v6M320 12v-6" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".5"/></svg>',
        svgFit: "fill",
        primaryColor: "#00E5FF",
        secondaryColor: "#1B5CFF",
        strokeWidth: 2,
        glow: {
          isActive: true,
          color: "rgba(0,229,255,0.35)",
          blur: 6,
        },
      },
    },
    {
      title: "科技切角边框",
      props: {
        componentName: "SvgDecoration",
        logicalId: "panel_frame_corner",
        parentLogicalId: "sales_group",
        name: "切角边框",
        style: {
          width: 520,
          height: 360,
          position: "absolute",
          left: 48,
          top: 96,
          backgroundColor: "rgba(0,0,0,0)",
        },
        rotate: 0,
        opacity: 0.75,
        svgSource: "custom",
        svgContent:
          '<svg viewBox="0 0 520 360" xmlns="http://www.w3.org/2000/svg"><path d="M20 2h480l18 18v320l-18 18H20L2 340V20L20 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" opacity=".65"/><path d="M2 20V56M2 304V340M518 20V56M518 304V340M20 2H56M464 2H500M20 358H56M464 358H500" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".85"/></svg>',
        svgFit: "fill",
        primaryColor: "#00E5FF",
        secondaryColor: "#1B5CFF",
        strokeWidth: 2,
        glow: {
          isActive: true,
          color: "rgba(0,229,255,0.25)",
          blur: 10,
        },
      },
    },
  ],
};
