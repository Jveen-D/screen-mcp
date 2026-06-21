import type { JsonObject } from "../../types/component.js";

export const gaugeCapability: JsonObject = {
  componentName: "Gauge",
  displayName: "仪表盘",
  description:
    "用于展示单个数值在仪表盘上的位置，支持自定义表盘样式、中心指标、量程与分段颜色。",
  aiRole:
    "AI 负责数值、量程、颜色、表盘样式；MCP 负责把 value 同步到 datasource 并补齐其余 props。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Gauge",
      description: "组件类型，必须固定为 Gauge。",
    },
    {
      path: "logicalId",
      type: "string",
      description: "组件唯一 ID。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "父级组件或分组 ID。",
    },
    {
      path: "style",
      type: "object",
      description: "组件在大屏画布上的位置和尺寸。",
      children: [
        { path: "style.left", type: "number", description: "画布左侧距离。" },
        { path: "style.top", type: "number", description: "画布顶部距离。" },
        { path: "style.width", type: "number", description: "组件宽度。" },
        { path: "style.height", type: "number", description: "组件高度。" },
        {
          path: "style.position",
          type: "string",
          value: "absolute",
          description: "固定使用 absolute。",
        },
      ],
    },
  ],
  aiWritableProps: [
    {
      path: "name",
      type: "string",
      description: "图层名称。",
    },
    {
      path: "value",
      type: "number",
      description:
        "仪表盘要展示的数值。MCP 会同步写入 datasource.constantData[0].value。",
    },
    {
      path: "style",
      type: "object",
      description: "组件位置、尺寸和背景。",
    },
    {
      path: "rotate",
      type: "number",
      range: [-360, 360],
      description: "旋转角度。",
    },
    {
      path: "opacity",
      type: "number",
      range: [0, 1],
      description: "不透明度。",
    },
    {
      path: "dialConfig",
      type: "object",
      description: "表盘外观配置。",
    },
    {
      path: "dialConfig.outRadius",
      type: "number",
      range: [0, 1],
      description: "外圆半径比例。",
    },
    {
      path: "dialConfig.innerRadius",
      type: "number",
      range: [0, 1],
      description: "内圆半径比例。",
    },
    {
      path: "dialConfig.graduationColor",
      type: "color",
      description: "刻度颜色。",
    },
    {
      path: "dialConfig.graduationCount",
      type: "number",
      description: "刻度分段数。",
    },
    {
      path: "dialConfig.graduationThickness",
      type: "number",
      description: "刻度粗细。",
    },
    {
      path: "dialConfig.graduationLength",
      type: "number",
      description: "刻度长度。",
    },
    {
      path: "dialConfig.labelColor",
      type: "color",
      description: "刻度标签颜色。",
    },
    {
      path: "dialConfig.labelFontSize",
      type: "number",
      description: "刻度标签字号。",
    },
    {
      path: "dialConfig.pointerColor",
      type: "color",
      description: "指针颜色。",
    },
    {
      path: "dialConfig.pointerLength",
      type: "number",
      range: [0, 1],
      description: "指针长度比例。",
    },
    {
      path: "dialConfig.pointerWidth",
      type: "number",
      description: "指针宽度。",
    },
    {
      path: "dialConfig.pointerDotColor",
      type: "color",
      description: "指针圆点颜色。",
    },
    {
      path: "dialConfig.pointerDotSize",
      type: "number",
      description: "指针圆点大小。",
    },
    {
      path: "indicatorConfig",
      type: "object",
      description: "中心数值指标配置。",
    },
    {
      path: "indicatorConfig.open",
      type: "boolean",
      description: "是否显示中心指标。",
    },
    {
      path: "indicatorConfig.minValue",
      type: "number",
      description: "量程最小值。",
    },
    {
      path: "indicatorConfig.maxValue",
      type: "number",
      description: "量程最大值。",
    },
    {
      path: "indicatorConfig.valueFontSize",
      type: "number",
      description: "指标数值字号。",
    },
    {
      path: "indicatorConfig.valueColor",
      type: "color",
      description: "指标数值颜色。",
    },
    {
      path: "indicatorConfig.valueOffsetY",
      type: "number",
      description: "指标数值垂直偏移。",
    },
    {
      path: "indicatorConfig.precision",
      type: "number",
      description: "指标数值保留小数位数。",
    },
    {
      path: "indicatorConfig.suffix",
      type: "string",
      description: "指标数值后缀，必须根据业务语义显式设置，例如 '%'、'km/h'、'kWh'；不要依赖默认值或留空。",
    },
    {
      path: "animation",
      type: "object",
      description: "动画配置。",
    },
    {
      path: "animation.open",
      type: "boolean",
      description: "是否开启动画。",
    },
    {
      path: "animation.duration",
      type: "number",
      description: "动画时长，单位毫秒。",
    },
    {
      path: "defaultRingColor",
      type: "color",
      description: "默认表盘环形颜色。",
    },
    {
      path: "ringRangeColor",
      type: "array<object>",
      description:
        "分段颜色区间数组，每项包含 { startValue, endValue, color }，startValue/endValue 为量程比例 0-1。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "datasource",
      reason:
        "仪表盘数据源结构由 MCP 根据 value 同步维护，AI 不应直接生成。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "对象按 key 深合并。",
    "datasource 永远使用默认结构，MCP 会把 value 同步到 datasource.constantData[0].value。",
    "ringRangeColor 数组按索引深合并，每项必须包含 startValue、endValue、color。",
  ],
  visualRules: [
    "value 应为数值，最终由前端渲染为仪表盘指针位置。",
    "ringRangeColor 中的 startValue/endValue 为 0-1 之间的比例，表示在量程中的位置。",
    "Gauge 组件内部已通过 indicatorConfig 显示数值和后缀，禁止再额外叠加 SingleText 来显示同一个数值。",
    "AI 必须显式设置 indicatorConfig.suffix，禁止依赖组件默认值；百分比类指标用 '%'，速度类用 'km/h'，能耗类用 'kWh'/'万kWh' 等，确保后缀与业务语义一致。",
    "当 Gauge 作为某个面板的一部分时，该面板应使用和周围 ChartPanel 模块一致的背景色、标题承托和边框语言，避免风格突兀。",
  ],
  examples: [
    {
      title: "CPU 使用率仪表盘",
      props: {
        componentName: "Gauge",
        logicalId: "cpu_gauge",
        parentLogicalId: "resource_group",
        name: "CPU 使用率",
        value: 68,
        style: {
          position: "absolute",
          left: 100,
          top: 100,
          width: 397,
          height: 365,
          backgroundColor: "transparent",
          zIndex: 91,
        },
        indicatorConfig: {
          open: true,
          minValue: 0,
          maxValue: 100,
          suffix: "%",
          precision: 0,
        },
        ringRangeColor: [
          {
            startValue: 0,
            endValue: 0.5,
            color: "#1e90ff",
          },
          {
            startValue: 0.5,
            endValue: 0.8,
            color: "#2fe0e0",
          },
          {
            startValue: 0.8,
            endValue: 1,
            color: "#ff4d4f",
          },
        ],
      },
    },
  ],
};
