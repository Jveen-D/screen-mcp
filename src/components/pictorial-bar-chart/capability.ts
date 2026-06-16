import type { JsonObject } from "../../types/component.js";

export const pictorialBarChartCapability: JsonObject = {
  componentName: "PictorialBarChart",
  displayName: "象形柱图",
  description:
    "基于 ECharts pictorialBar 的象形柱图组件，使用自定义 SVG 符号作为柱体，支持多系列、坐标轴、图例、参考线与数据标签配置，适用于大屏分类数据对比场景。",
  aiRole:
    "AI 负责象形柱数据、SVG 图标、坐标轴、系列颜色；MCP 负责把 data 同步到 datasource。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "PictorialBarChart",
      description: "组件类型，必须固定为 PictorialBarChart。",
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
      description: "图层名称，建议和用户语义一致。",
    },
    {
      path: "data",
      type: "array<object>",
      description:
        "象形柱图数据数组，每条记录包含 { series, type, value }，series 为系列标识，type 为 X 轴类目，value 为数值。MCP 会把它同步到 datasource.constantData，字段映射为 s/x/y。",
    },
    {
      path: "globalConf",
      type: "object",
      description: "全局配置，包含字体、动画、边距、柱体 SVG 路径与标签样式。",
      children: [
        {
          path: "globalConf.fontFamily",
          type: "string",
          description: "全局字体。",
        },
        {
          path: "globalConf.animation",
          type: "boolean",
          description: "是否开启动画。",
        },
        {
          path: "globalConf.animationDuration",
          type: "number",
          description: "动画时长，单位 ms。默认 800。",
        },
        {
          path: "globalConf.margin",
          type: "object",
          description: "图表边距，包含 top/bottom/left/right。",
        },
        {
          path: "globalConf.barConf.svgPath",
          type: "string",
          description: "象形柱 SVG path 字符串，用于定义柱体形状。",
        },
        {
          path: "globalConf.barConf.svgWidth",
          type: "number",
          description: "SVG 宽度比例。默认 1。",
        },
        {
          path: "globalConf.barConf.svgHeight",
          type: "number",
          description: "SVG 高度比例。默认 1。",
        },
        {
          path: "globalConf.barConf.innerMargin",
          type: "number",
          description: "柱间间距比例，可设置为负数使柱体重叠。默认 -0.5。",
        },
        {
          path: "globalConf.barConf.outerMargin",
          type: "number",
          description: "左右外侧留白比例。默认 0。",
        },
        {
          path: "globalConf.barConf.overlap",
          type: "number",
          description: "多系列重叠比例。默认 1。",
        },
        {
          path: "globalConf.barConf.repeat",
          type: "boolean",
          description: "是否重复 SVG 符号以填充柱体高度。默认 true。",
        },
        {
          path: "globalConf.barConf.barBackgroundColor",
          type: "color",
          description: "柱体背景色。",
        },
        {
          path: "globalConf.labelConf.show",
          type: "boolean",
          description: "是否显示数据标签。",
        },
        {
          path: "globalConf.labelConf.fontSize",
          type: "number",
          description: "标签字号。",
        },
        {
          path: "globalConf.labelConf.fontColor",
          type: "color",
          description: "标签颜色。",
        },
        {
          path: "globalConf.labelConf.offsetY",
          type: "number",
          description: "标签垂直偏移。",
        },
        {
          path: "globalConf.labelConf.precision",
          type: "number",
          description: "标签数值保留小数位数。",
        },
      ],
    },
    {
      path: "XAxisConf",
      type: "object",
      description: "X 轴配置。type 固定为 category，由 MCP 自动设置。",
      children: [
        { path: "XAxisConf.show", type: "boolean", description: "是否显示 X 轴。" },
        { path: "XAxisConf.name", type: "string", description: "X 轴名称。" },
        { path: "XAxisConf.nameColor", type: "color", description: "轴名称颜色。" },
        { path: "XAxisConf.nameFontSize", type: "number", description: "轴名称字号。" },
        { path: "XAxisConf.nameOffset", type: "number", description: "轴名称偏移。" },
        { path: "XAxisConf.axisLabelConf.show", type: "boolean", description: "是否显示轴标签。" },
        { path: "XAxisConf.axisLabelConf.fontColor", type: "color", description: "轴标签颜色。" },
        { path: "XAxisConf.axisLabelConf.fontSize", type: "number", description: "轴标签字号。" },
        { path: "XAxisConf.axisLabelConf.rotate", type: "number", description: "轴标签旋转角度。" },
        { path: "XAxisConf.axisLineConf.show", type: "boolean", description: "是否显示轴线。" },
        { path: "XAxisConf.axisLineConf.color", type: "color", description: "轴线颜色。" },
        { path: "XAxisConf.splitLineConf.show", type: "boolean", description: "是否显示分割线。" },
      ],
    },
    {
      path: "YAxisConf",
      type: "object",
      description: "Y 轴配置。type 固定为 value，由 MCP 自动设置。",
      children: [
        { path: "YAxisConf.show", type: "boolean", description: "是否显示 Y 轴。" },
        { path: "YAxisConf.name", type: "string", description: "Y 轴名称。" },
        { path: "YAxisConf.nameColor", type: "color", description: "轴名称颜色。" },
        { path: "YAxisConf.nameFontSize", type: "number", description: "轴名称字号。" },
        { path: "YAxisConf.axisLabelConf.show", type: "boolean", description: "是否显示轴标签。" },
        { path: "YAxisConf.axisLabelConf.fontColor", type: "color", description: "轴标签颜色。" },
        { path: "YAxisConf.splitLineConf.show", type: "boolean", description: "是否显示分割线。" },
        { path: "YAxisConf.splitLineConf.color", type: "color", description: "分割线颜色。" },
      ],
    },
    {
      path: "legendConf",
      type: "object",
      description: "图例配置。",
      children: [
        { path: "legendConf.show", type: "boolean", description: "是否显示图例。" },
        { path: "legendConf.orient", type: "enum", values: ["horizontal", "vertical"], description: "图例朝向。" },
        { path: "legendConf.icon", type: "string", description: "图例图标。" },
        { path: "legendConf.fontColor", type: "color", description: "图例文字颜色。" },
        { path: "legendConf.fontSize", type: "number", description: "图例字号。" },
        { path: "legendConf.position.top", type: "string|number", description: "图例垂直位置。" },
        { path: "legendConf.position.left", type: "string|number", description: "图例水平位置。" },
      ],
    },
    {
      path: "guideLineConf",
      type: "object",
      description: "参考线配置。",
      children: [
        { path: "guideLineConf.show", type: "boolean", description: "是否显示参考线。" },
        { path: "guideLineConf.valueType", type: "enum", values: ["max", "custom"], description: "参考线取值类型。" },
        { path: "guideLineConf.customValue", type: "number", description: "自定义参考线值。" },
        { path: "guideLineConf.lineColor", type: "color", description: "参考线颜色。" },
        { path: "guideLineConf.lineType", type: "enum", values: ["solid", "dashed"], description: "参考线线型。" },
        { path: "guideLineConf.showText", type: "boolean", description: "是否显示参考线文本。" },
        { path: "guideLineConf.textName", type: "string", description: "参考线文本。" },
      ],
    },
    {
      path: "seriesConfs",
      type: "array<object>",
      description:
        "系列样式配置数组。必须包含一条 __seriesType 为 __default 的默认配置；可通过 matchName 对特定系列单独设置颜色、后缀、图标等。",
      children: [
        { path: "seriesConfs[i].__seriesType", type: "string", description: "系列类型，默认配置必须为 __default。" },
        { path: "seriesConfs[i].matchName", type: "string", description: "要匹配的系列名。" },
        { path: "seriesConfs[i].fillColor", type: "color", description: "柱体填充色，支持渐变字符串。" },
        { path: "seriesConfs[i].borderColor", type: "color", description: "柱体边框色。" },
        { path: "seriesConfs[i].borderWidth", type: "number", description: "柱体边框宽。" },
        { path: "seriesConfs[i].suffix", type: "string", description: "数据后缀。" },
        { path: "seriesConfs[i].suffixColor", type: "color", description: "后缀颜色。" },
        { path: "seriesConfs[i].suffixSize", type: "number", description: "后缀字号。" },
        { path: "seriesConfs[i].iconImg", type: "string", description: "标签内图标地址。" },
      ],
    },
    {
      path: "style",
      type: "object",
      description: "组件位置尺寸样式，包含 left/top/width/height/backgroundColor/zIndex 等。",
    },
    {
      path: "rotate",
      type: "number",
      range: [-360, 360],
      description: "组件整体旋转角度。默认 0。",
    },
    {
      path: "opacity",
      type: "number",
      range: [0, 1],
      description: "组件整体不透明度。默认 1。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "datasource",
      reason: "datasource 由 MCP 根据 data 自动同步 constantData 与 fieldMappings，AI 不应直接写入。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "AI 填写 data 后，MCP 会把它同步到 datasource.constantData，字段映射为 s（series）、x（type）、y（value），并补齐 fieldMappings。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "globalConf、XAxisConf、YAxisConf、legendConf、guideLineConf、seriesConfs 中未提供的字段会由 MCP 补齐为默认值。",
    "seriesConfs 为空或缺少 __seriesType 为 __default 的项时，MCP 会自动追加默认系列配置。",
  ],
  visualRules: [
    "data 每条记录应包含 { series, type, value }，series 为系列标识，type 为 X 轴类目，value 为数值。",
    "象形柱图适合展示分类数据的数量对比，SVG 符号会沿柱高重复或拉伸显示。",
    "SVG path 应设计为垂直方向，底部对齐 X 轴，顶部表示数值大小。",
    "多系列时应通过 seriesConfs 为不同系列设置对比明显的填充色。",
    "图例默认隐藏，如需展示多系列请设置 legendConf.show 为 true 并调整位置避免遮挡柱体。",
    "X 轴标签较长或分类较多时，可适当设置旋转角度避免重叠。",
  ],
  examples: [
    {
      title: "科技风象形柱图配置示例",
      props: {
        componentName: "PictorialBarChart",
        logicalId: "theme_pictorial_bar_chart",
        parentLogicalId: "screen_group",
        name: "销售额象形柱图",
        style: {
          position: "absolute",
          left: 100,
          top: 120,
          width: 520,
          height: 300,
          zIndex: 91,
          backgroundColor: "transparent",
        },
        data: [
          { series: 1, type: "Q1", value: 120 },
          { series: 1, type: "Q2", value: 195 },
          { series: 1, type: "Q3", value: 60 },
          { series: 1, type: "Q4", value: 163 },
        ],
        globalConf: {
          animation: true,
          animationDuration: 1000,
          margin: {
            top: 40,
            bottom: 50,
            left: 60,
            right: 20,
          },
          barConf: {
            svgPath: "M66,0 C66,85.625 88,135.625 132,150 L0,150 C45.3894737,135 67.3894737,85 66,0 Z",
            innerMargin: -0.5,
            outerMargin: 0,
            overlap: 1,
            repeat: true,
          },
          labelConf: {
            show: true,
            fontSize: 12,
            fontColor: "#BFEFFF",
            offsetY: -10,
            precision: 0,
          },
        },
        XAxisConf: {
          axisLabelConf: {
            fontColor: "#BFEFFF",
            fontSize: 12,
          },
          axisLineConf: {
            color: "rgba(0,229,255,0.3)",
          },
        },
        YAxisConf: {
          name: "销售额",
          splitLineConf: {
            show: true,
            color: "rgba(0,229,255,0.12)",
            lineType: "dashed",
          },
        },
        seriesConfs: [
          {
            __seriesType: "__default",
            fillColor: "linear-gradient(90deg, rgba(0,229,255,0.7) 0%, rgba(0,102,255,0.9) 100%)",
            borderColor: "#00E5FF",
            borderWidth: 1,
          },
        ],
      },
    },
  ],
};
