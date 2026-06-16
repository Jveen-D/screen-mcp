import type { JsonObject } from "../../types/component.js";

export const indicatorCapability: JsonObject = {
  componentName: "Indicator",
  displayName: "翻牌器",
  description: "用于大屏关键指标翻牌动画展示，支持标题、前后缀、千分位、小数位数与数字背景配置。",
  aiRole:
    "AI 负责数值、标题、前后缀、位置、尺寸、字体样式与动画开关；MCP 负责把 textValue 同步到 chartData 并补齐其余 props。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Indicator",
      description: "组件类型，必须固定为 Indicator。",
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
      description: "组件在大屏画布上的位置、尺寸和背景。",
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
    { path: "name", type: "string", description: "图层名称。" },
    {
      path: "textValue",
      type: "number",
      description: "要展示的翻牌数值。MCP 会同步写入 chartData.constant.data[0].value。",
    },
    {
      path: "titleName",
      type: "string",
      description: "标题文案，为空时默认显示指标字段名。",
    },
    {
      path: "titleVisible",
      type: "boolean",
      description: "是否显示标题。",
    },
    {
      path: "globalConfig",
      type: "object",
      description: "标题与数字的整体布局配置。",
    },
    {
      path: "globalConfig.flexDirection",
      type: "enum",
      values: ["column", "column-reverse", "inherit", "row-reverse"],
      description: "标题与数字的排列方向。",
    },
    {
      path: "globalConfig.alignItems",
      type: "enum",
      values: ["flex-start", "center", "flex-end", "baseline", "stretch"],
      description: "交叉轴对齐方式。",
    },
    {
      path: "globalConfig.space",
      type: "number",
      description: "标题与数字之间的间距（px）。",
    },
    {
      path: "titleStyle",
      type: "object",
      description: "标题字体样式，包括 fontFamily、fontSize、color、fontWeight、letterSpacing 等。",
    },
    {
      path: "numberStyle",
      type: "object",
      description: "数字字体样式。",
    },
    {
      path: "prefix",
      type: "boolean",
      description: "是否显示前缀。",
    },
    {
      path: "prefixTitle",
      type: "string",
      description: "前缀文案，例如“¥”。",
    },
    {
      path: "prefixStyle",
      type: "object",
      description: "前缀样式。",
    },
    {
      path: "isFollowPrefix",
      type: "boolean",
      description: "前缀是否跟随数字样式。",
    },
    {
      path: "suffix",
      type: "boolean",
      description: "是否显示后缀。",
    },
    {
      path: "suffixTitle",
      type: "string",
      description: "后缀文案，例如“%”。",
    },
    {
      path: "suffixStyle",
      type: "object",
      description: "后缀样式。",
    },
    {
      path: "isFollowSuffix",
      type: "boolean",
      description: "后缀是否跟随数字样式。",
    },
    {
      path: "decimal",
      type: "number",
      range: [0, 4],
      description: "小数位数，取值 0 到 4。",
    },
    {
      path: "separation",
      type: "boolean",
      description: "是否开启千分位分隔。",
    },
    {
      path: "animation",
      type: "boolean",
      description: "是否开启动画。",
    },
    {
      path: "animateType",
      type: "enum",
      values: [0, 1],
      description: "动画类型：0 为 CountUp，1 为逐位翻牌。",
    },
    {
      path: "duration",
      type: "number",
      description: "动画持续时间（秒）。",
    },
    {
      path: "hasBackground",
      type: "boolean",
      description: "是否为每位数字添加背景。",
    },
    {
      path: "numBackground",
      type: "object",
      description: "数字背景配置：width、height、isBgColor、bgColor、bgImg。",
    },
    { path: "style", type: "object", description: "位置、尺寸、层级与背景色。" },
    { path: "rotate", type: "number", range: [-360, 360], description: "旋转角度。" },
    { path: "opacity", type: "number", range: [0, 1], description: "不透明度。" },
  ],
  aiForbiddenProps: [
    {
      path: "chartData",
      reason: "翻牌器数据源结构由 MCP 根据 textValue 同步维护，AI 不应直接生成。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "对象按 key 深合并。",
    "chartData 永远使用默认结构，MCP 会把 textValue 同步到 chartData.constant.data[0].value。",
    "decimal 会同步到 chartData.indicator[0].fieldDataConfig.format.accuracy。",
  ],
  examples: [
    {
      title: "关键指标翻牌器",
      props: {
        componentName: "Indicator",
        logicalId: "indicator_sales",
        parentLogicalId: "kpi_group",
        name: "销售额",
        textValue: 1234567.89,
        decimal: 2,
        separation: true,
        titleName: "销售额",
        titleVisible: true,
        prefix: true,
        prefixTitle: "¥",
        animation: true,
        animateType: 1,
        duration: 2,
        globalConfig: {
          flexDirection: "column",
          alignItems: "center",
          space: 4,
        },
        style: {
          position: "absolute",
          left: 400,
          top: 400,
          width: 360,
          height: 100,
          zIndex: 1,
          backgroundColor: "rgba(17,61,110,0.68)",
        },
      },
    },
  ],
};
