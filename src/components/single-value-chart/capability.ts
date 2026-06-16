import type { JsonObject } from "../../types/component.js";

export const singleValueChartCapability: JsonObject = {
  componentName: "SingleValueChart",
  displayName: "单值占比图",
  description: "用于展示单个百分比数值的圆环占比图。",
  aiRole:
    "AI 负责百分比数值、圆环颜色、文本样式；MCP 负责把 percentValue 同步到 chartData 并补齐其余 props。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "SingleValueChart",
      description: "组件类型，必须固定为 SingleValueChart。",
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
      path: "percentValue",
      type: "number",
      range: [0, 100],
      description: "要展示的百分比数值，0–100。MCP 会同步写入 chartData.constant.data[0]['百分比']。",
    },
    {
      path: "style",
      type: "object",
      description: "位置、尺寸。",
    },
    {
      path: "TextStyle.fontFamily",
      type: "string",
      description: "中心文本字体族。",
    },
    {
      path: "TextStyle.color",
      type: "color",
      description: "中心文本颜色。",
    },
    {
      path: "TextStyle.fontSize",
      type: "number",
      description: "中心文本字号。",
    },
    {
      path: "TextStyle.fontWeight",
      type: "enum",
      values: ["normal", "bold", "bolder"],
      description: "中心文本字体粗细。",
    },
    {
      path: "TextStyle.fontStyle",
      type: "enum",
      values: ["normal", "italic", "oblique"],
      description: "中心文本字体样式。",
    },
    {
      path: "TextStyle.letterSpacing",
      type: "number",
      description: "中心文本字距。",
    },
    {
      path: "TextStyle.offsetX",
      type: "number",
      description: "中心文本 X 轴偏移。",
    },
    {
      path: "TextStyle.offsetY",
      type: "number",
      description: "中心文本 Y 轴偏移。",
    },
    {
      path: "TextStyle.fontSizeFraction",
      type: "number",
      description: "分数部分字号。",
    },
    {
      path: "TextStyle.fontSizeFractionDecimal",
      type: "number",
      description: "小数部分字号。",
    },
    {
      path: "TextStyle.suffix",
      type: "string",
      description: "后缀文本，例如“%”。",
    },
    {
      path: "TextStyle.suffixStyle",
      type: "string",
      description: "后缀文本样式。",
    },
    {
      path: "TextStyle.suffixfontFamily",
      type: "string",
      description: "后缀文本字体族。",
    },
    {
      path: "TextStyle.suffixfontWeight",
      type: "enum",
      values: ["normal", "bold", "bolder"],
      description: "后缀文本字体粗细。",
    },
    {
      path: "TextStyle.suffixfontStyle",
      type: "enum",
      values: ["normal", "italic", "oblique"],
      description: "后缀文本字体样式。",
    },
    {
      path: "TextStyle.suffixcolor",
      type: "color",
      description: "后缀文本颜色。",
    },
    {
      path: "TextStyle.suffixletterSpacing",
      type: "number",
      description: "后缀文本字距。",
    },
    {
      path: "TextStyle.suffixoffsetX",
      type: "number",
      description: "后缀文本 X 轴偏移。",
    },
    {
      path: "TextStyle.suffixoffsetY",
      type: "number",
      description: "后缀文本 Y 轴偏移。",
    },
    {
      path: "TextStyle.textShadowColor",
      type: "color",
      description: "文本阴影颜色。",
    },
    {
      path: "TextStyle.textShadowBlur",
      type: "number",
      description: "文本阴影模糊半径。",
    },
    {
      path: "TextStyle.textShadowOffsetX",
      type: "number",
      description: "文本阴影 X 轴偏移。",
    },
    {
      path: "TextStyle.textShadowOffsetY",
      type: "number",
      description: "文本阴影 Y 轴偏移。",
    },
    {
      path: "ringColor",
      type: "color",
      description: "圆环填充色，支持渐变字符串。",
    },
    {
      path: "ringbackgroundColor",
      type: "color",
      description: "圆环背景色，支持渐变字符串。",
    },
    {
      path: "ringStyle",
      type: "enum",
      values: ["roundedcorner", "square"],
      description: "圆环端点样式。",
    },
    {
      path: "innerRadius",
      type: "number",
      range: [0, 1],
      description: "内圆半径比例。",
    },
    {
      path: "direction",
      type: "enum",
      values: ["clockwise", "counterclockwise"],
      description: "圆环填充方向。",
    },
    {
      path: "fillShape",
      type: "enum",
      values: ["normal", "bold", "bar"],
      description: "填充形状。",
    },
    {
      path: "barWidth",
      type: "number",
      description: "圆环条带宽度比例。",
    },
    {
      path: "startAngle",
      type: "number",
      description: "起始角度。",
    },
    {
      path: "endAngle",
      type: "number",
      description: "结束角度。",
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
      path: "backgroundColor",
      type: "color",
      description: "组件背景色。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData",
      reason: "单值占比图数据源结构由 MCP 根据 percentValue 同步维护，AI 不应直接生成。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "对象按 key 深合并。",
    "chartData 永远使用默认结构，MCP 会把 percentValue 同步到 chartData.constant.data[0]['百分比']。",
    "indicator 固定使用“百分比”作为指标字段名。",
  ],
  visualRules: [
    "percentValue 取值范围为 0–100，超出范围会被 MCP 截断到该区间。",
    "chartData.constant.data[0] 必须包含 { 百分比: string }。",
  ],
  examples: [
    {
      title: "CPU 使用率",
      props: {
        componentName: "SingleValueChart",
        logicalId: "cpu_usage_ring",
        parentLogicalId: "resource_group",
        name: "CPU 使用率",
        percentValue: 78.5,
        style: {
          position: "absolute",
          left: 400,
          top: 400,
          width: 232,
          height: 196,
          zIndex: 1,
        },
        ringColor: "linear-gradient(180deg, rgba(22,212,254,1) 0%, rgba(82,232,254,1) 100%)",
        ringbackgroundColor: "rgba(255,255,255,1)",
        TextStyle: {
          color: "#00E5FF",
          fontSize: 48,
          fontWeight: "bold",
          suffix: "%",
        },
      },
    },
  ],
};
