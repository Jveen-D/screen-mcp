import type { JsonObject } from "../../types/component.js";

export const radarChartCapability: JsonObject = {
  componentName: "RadarChart",
  displayName: "雷达图",
  description:
    "用于展示多维度、多系列数据分布的雷达图组件，支持自定义雷达轴范围、维度标签、系列样式、图例与提示框。",
  aiRole:
    "AI 负责雷达维度、系列、数值、轴范围、系列样式；MCP 负责把 data 同步到 datasource。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "RadarChart",
      description: "组件类型，必须固定为 RadarChart。",
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
        "雷达图数据数组，每条记录包含 { series, dimension, value }。MCP 会把它同步到 datasource.constantData，字段名转换为 s/x/y。",
    },
    {
      path: "min",
      type: "number",
      description: "雷达轴最小值。默认 0。",
    },
    {
      path: "max",
      type: "number",
      description: "雷达轴最大值。默认 20。",
    },
    {
      path: "margin",
      type: "object",
      description: "雷达图主体与容器边界的边距。",
      children: [
        { path: "margin.top", type: "number", description: "顶部边距。" },
        { path: "margin.left", type: "number", description: "左侧边距。" },
        { path: "margin.bottom", type: "number", description: "底部边距。" },
        { path: "margin.right", type: "number", description: "右侧边距。" },
      ],
    },
    {
      path: "legendConf",
      type: "object",
      description: "图例配置。",
      children: [
        {
          path: "legendConf.show",
          type: "boolean",
          description: "是否显示图例。默认 true。",
        },
        {
          path: "legendConf.position",
          type: "object",
          description: "图例位置。",
          children: [
            {
              path: "legendConf.position.top",
              type: "string|number",
              description: "垂直位置。",
            },
            {
              path: "legendConf.position.left",
              type: "string|number",
              description: "水平位置。",
            },
          ],
        },
        {
          path: "legendConf.orient",
          type: "enum",
          values: ["horizontal", "vertical"],
          description: "图例朝向。默认 vertical。",
        },
        {
          path: "legendConf.icon",
          type: "string",
          description: "图例图标。默认 circle。",
        },
        {
          path: "legendConf.font",
          type: "object",
          description: "图例文字样式。",
          children: [
            {
              path: "legendConf.font.fontFamily",
              type: "string",
              description: "图例字体。默认 Microsoft YaHei。",
            },
            {
              path: "legendConf.font.fontSize",
              type: "number",
              description: "图例字号。默认 12。",
            },
            {
              path: "legendConf.font.color",
              type: "color",
              description: "图例文字颜色。默认 #ffffff。",
            },
            {
              path: "legendConf.font.fontWeight",
              type: "string",
              description: "图例字重。默认 normal。",
            },
            {
              path: "legendConf.font.fontStyle",
              type: "string",
              description: "图例字体样式。默认 normal。",
            },
          ],
        },
      ],
    },
    {
      path: "axisConf",
      type: "object",
      description: "雷达坐标轴配置。",
      children: [
        {
          path: "axisConf.show",
          type: "boolean",
          description: "是否显示雷达轴。默认 true。",
        },
        {
          path: "axisConf.centerX",
          type: "number",
          description: "雷达中心相对容器宽度的比例。默认 0.5。",
        },
        {
          path: "axisConf.centerY",
          type: "number",
          description: "雷达中心相对容器高度的比例。默认 0.5。",
        },
        {
          path: "axisConf.radius",
          type: "number",
          description: "雷达半径相对容器短边的比例。默认 0.35。",
        },
        {
          path: "axisConf.shape",
          type: "enum",
          values: ["polygon", "circle"],
          description: "雷达网形状。默认 polygon。",
        },
        {
          path: "axisConf.axisLineColor",
          type: "color",
          description: "轴线条颜色。",
        },
        {
          path: "axisConf.axisLineWidth",
          type: "number",
          description: "轴线宽度。",
        },
        {
          path: "axisConf.splitLineShow",
          type: "boolean",
          description: "是否显示网格分割线。",
        },
        {
          path: "axisConf.splitLineColor",
          type: "color",
          description: "网格线颜色。",
        },
        {
          path: "axisConf.splitLineWidth",
          type: "number",
          description: "网格线宽度。",
        },
        {
          path: "axisConf.splitLineType",
          type: "string",
          description: "网格线类型，如 solid、dashed。",
        },
        {
          path: "axisConf.splitAreaShow",
          type: "boolean",
          description: "是否显示网格填充区域。",
        },
        {
          path: "axisConf.splitAreaColor",
          type: "array<color>",
          description: "网格区域交替填充色。",
        },
      ],
    },
    {
      path: "labelConf",
      type: "object",
      description: "维度标签配置。",
      children: [
        {
          path: "labelConf.show",
          type: "boolean",
          description: "是否显示维度标签。默认 true。",
        },
        {
          path: "labelConf.color",
          type: "color",
          description: "标签颜色。",
        },
        {
          path: "labelConf.fontSize",
          type: "number",
          description: "标签字号。",
        },
        {
          path: "labelConf.fontFamily",
          type: "string",
          description: "标签字体。",
        },
        {
          path: "labelConf.fontWeight",
          type: "string",
          description: "标签字重。",
        },
        {
          path: "labelConf.fontStyle",
          type: "string",
          description: "标签字体样式。",
        },
        {
          path: "labelConf.distance",
          type: "number",
          description: "标签与雷达网边缘的距离。",
        },
      ],
    },
    {
      path: "tickConf",
      type: "object",
      description: "刻度配置。",
      children: [
        {
          path: "tickConf.show",
          type: "boolean",
          description: "是否显示刻度标签。默认 true。",
        },
        {
          path: "tickConf.count",
          type: "number",
          description: "刻度分段数。默认 5。",
        },
        {
          path: "tickConf.color",
          type: "color",
          description: "刻度文字颜色。",
        },
        {
          path: "tickConf.fontSize",
          type: "number",
          description: "刻度字号。",
        },
        {
          path: "tickConf.fontFamily",
          type: "string",
          description: "刻度字体。",
        },
        {
          path: "tickConf.fontWeight",
          type: "string",
          description: "刻度字重。",
        },
        {
          path: "tickConf.fontStyle",
          type: "string",
          description: "刻度字体样式。",
        },
      ],
    },
    {
      path: "seriesConf",
      type: "array<object>",
      description:
        "系列样式配置数组，按 matchName 匹配数据中的系列名。未匹配系列使用第一项兜底。",
      children: [
        {
          path: "seriesConf[i].matchName",
          type: "string",
          description: "要匹配的系列名，对应 data 中 series 字段。",
        },
        {
          path: "seriesConf[i].lineColor",
          type: "color",
          description: "该系列线条颜色。",
        },
        {
          path: "seriesConf[i].fillColor",
          type: "color",
          description: "该系列区域填充色。",
        },
        {
          path: "seriesConf[i].lineWidth",
          type: "number",
          description: "线条宽度。",
        },
        {
          path: "seriesConf[i].symbol",
          type: "string",
          description: "数据点标记样式。",
        },
        {
          path: "seriesConf[i].symbolSize",
          type: "number",
          description: "数据点大小。",
        },
        {
          path: "seriesConf[i].areaFill",
          type: "boolean",
          description: "是否填充区域。",
        },
      ],
    },
    {
      path: "tooltipConf",
      type: "object",
      description: "提示框配置。",
      children: [
        {
          path: "tooltipConf.show",
          type: "boolean",
          description: "是否显示提示框。默认 true。",
        },
        {
          path: "tooltipConf.backgroundColor",
          type: "color",
          description: "提示框背景色。",
        },
        {
          path: "tooltipConf.fontFamily",
          type: "string",
          description: "提示框字体。",
        },
        {
          path: "tooltipConf.fontSize",
          type: "number",
          description: "提示框字号。",
        },
        {
          path: "tooltipConf.color",
          type: "color",
          description: "提示框文字颜色。",
        },
        {
          path: "tooltipConf.fontWeight",
          type: "string",
          description: "提示框字重。",
        },
        {
          path: "tooltipConf.fontStyle",
          type: "string",
          description: "提示框字体样式。",
        },
      ],
    },
    {
      path: "valueLabelConf",
      type: "object",
      description: "数值标签配置。",
      children: [
        {
          path: "valueLabelConf.show",
          type: "boolean",
          description: "是否显示数值标签。默认 true。",
        },
        {
          path: "valueLabelConf.color",
          type: "color",
          description: "数值标签颜色。",
        },
        {
          path: "valueLabelConf.fontSize",
          type: "number",
          description: "数值标签字号。",
        },
        {
          path: "valueLabelConf.fontFamily",
          type: "string",
          description: "数值标签字体。",
        },
        {
          path: "valueLabelConf.fontWeight",
          type: "string",
          description: "数值标签字重。",
        },
        {
          path: "valueLabelConf.fontStyle",
          type: "string",
          description: "数值标签字体样式。",
        },
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
      reason:
        "datasource 由 MCP 根据 data 自动同步 constantData 与 fieldMappings，AI 不应直接写入。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "AI 填写 data 后，MCP 会把它同步到 datasource.constantData，字段名归一化为 s/x/y，并补齐 fieldMappings。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "min、max、margin、legendConf、axisConf、labelConf、tickConf、seriesConf、tooltipConf、valueLabelConf 缺失字段由 MCP 补齐为默认值。",
    "seriesConf 为空数组时，MCP 会重置为默认两套系列样式。",
  ],
  visualRules: [
    "data 每条记录必须包含 { series, dimension, value }，分别表示系列名、维度名、数值。",
    "雷达图适合展示多维度能力对比或评分分布，维度数建议 3–8 个，过多会导致图形拥挤。",
    "min 与 max 应根据实际数据范围设置，确保所有数据点落在雷达网内。",
    "建议为不同系列配置对比明显的线条颜色与半透明填充色，避免系列重叠时难以区分。",
    "图例默认位于右侧竖排，给雷达主体留出中心区域。",
    "维度标签较多或名称较长时，可适当调大 axisConf.radius 或减小 labelConf.fontSize。",
    "需要突出某个系列时，可通过 seriesConf 单独设置其 lineColor、fillColor 与 areaFill。",
  ],
  examples: [
    {
      title: "科技风雷达图配置示例",
      props: {
        componentName: "RadarChart",
        logicalId: "theme_radar_chart",
        parentLogicalId: "screen_group",
        name: "能力评估雷达图",
        style: {
          left: 80,
          top: 160,
          width: 520,
          height: 320,
          position: "absolute",
        },
        data: [
          { series: "本月", dimension: "响应速度", value: 14 },
          { series: "本月", dimension: "稳定性", value: 18 },
          { series: "本月", dimension: "吞吐量", value: 12 },
          { series: "上月", dimension: "响应速度", value: 10 },
          { series: "上月", dimension: "稳定性", value: 15 },
          { series: "上月", dimension: "吞吐量", value: 16 },
        ],
        min: 0,
        max: 20,
        margin: {
          top: 50,
          left: 50,
          bottom: 50,
          right: 120,
        },
        axisConf: {
          axisLineColor: "rgba(0,229,255,0.3)",
          splitLineColor: "rgba(0,229,255,0.12)",
          splitAreaColor: ["rgba(0,0,0,0)", "rgba(0,229,255,0.05)"],
        },
        labelConf: {
          color: "#BFEFFF",
          fontSize: 12,
        },
        seriesConf: [
          {
            matchName: "本月",
            lineColor: "#00E5FF",
            fillColor: "rgba(0,229,255,0.2)",
          },
          {
            matchName: "上月",
            lineColor: "#FFB300",
            fillColor: "rgba(255,179,0,0.2)",
          },
        ],
      },
    },
  ],
};
