import type { JsonObject } from "../../types/component.js";

export const circularProgressCapability: JsonObject = {
  componentName: "CircularProgress",
  displayName: "环形进度图",
  description:
    "用于展示多个系列的环形进度对比，基于 ECharts gauge/pie 环形能力绘制多个同心或并列圆环，支持自定义最大值、轨道色、填充色、图例与提示框。",
  aiRole:
    "AI 负责生成组件布局、数据系列、baseSeriesConfig 中的最大值/半径/颜色/标签、legendConfig、tooltipConfig、animationConfig；MCP 负责把 data 同步到 datasource.constantData 并补齐 fieldMappings 与其余 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "CircularProgress",
      description: "组件类型，必须固定为 CircularProgress。",
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
        "环形进度图数据数组，每条记录包含 { name, value }，name 为系列名，value 为进度数值。MCP 会把它同步到 datasource.constantData。",
    },
    {
      path: "baseSeriesConfig",
      type: "object",
      description: "环形进度图基础系列配置，控制所有系列的默认视觉与标签行为。",
      children: [
        {
          path: "baseSeriesConfig.maxValue",
          type: "number",
          description: "进度最大值，用于计算百分比。默认 100。",
        },
        {
          path: "baseSeriesConfig.minRadius",
          type: "number|string",
          description: "最内侧圆环半径，可传百分比字符串或数值。默认 50。",
        },
        {
          path: "baseSeriesConfig.gap",
          type: "number",
          description: "相邻圆环之间的间距，单位 px。默认 10。",
        },
        {
          path: "baseSeriesConfig.roundCap",
          type: "boolean",
          description: "是否开启圆环端点圆角。默认 true。",
        },
        {
          path: "baseSeriesConfig.clockwise",
          type: "boolean",
          description: "是否顺时针显示进度。默认 true。",
        },
        {
          path: "baseSeriesConfig.trackColor",
          type: "color",
          description: "轨道背景色。默认 rgba(255,255,255,0.12)。",
        },
        {
          path: "baseSeriesConfig.showLabel",
          type: "boolean",
          description: "是否显示数据标签。默认 true。",
        },
        {
          path: "baseSeriesConfig.labelColor",
          type: "color",
          description: "标签颜色。默认 #ffffff。",
        },
        {
          path: "baseSeriesConfig.labelFontSize",
          type: "number",
          description: "标签字号。默认 14。",
        },
        {
          path: "baseSeriesConfig.labelFontFamily",
          type: "string",
          description: "标签字体。默认 Microsoft YaHei。",
        },
        {
          path: "baseSeriesConfig.labelFontWeight",
          type: "string",
          description: "标签字重，如 normal、bold。默认 normal。",
        },
        {
          path: "baseSeriesConfig.labelFontStyle",
          type: "string",
          description: "标签字体样式，如 normal、italic。默认 normal。",
        },
        {
          path: "baseSeriesConfig.labelShowSeriesName",
          type: "boolean",
          description: "标签是否显示系列名。默认 true。",
        },
        {
          path: "baseSeriesConfig.precision",
          type: "number",
          description: "数值保留小数位数。默认 0。",
        },
        {
          path: "baseSeriesConfig.suffix",
          type: "string",
          description: "数值后缀，如 %。默认 %。",
        },
        {
          path: "baseSeriesConfig.labelHelpLineColor",
          type: "color",
          description: "标签引导线颜色。默认 rgba(255,255,255,0.3)。",
        },
        {
          path: "baseSeriesConfig.labelHelpLineWidth",
          type: "number",
          description: "标签引导线宽度。默认 1。",
        },
        {
          path: "baseSeriesConfig.shadowColor",
          type: "color",
          description: "圆环阴影颜色。默认 transparent。",
        },
        {
          path: "baseSeriesConfig.shadowOffsetX",
          type: "number",
          description: "阴影水平偏移。默认 0。",
        },
        {
          path: "baseSeriesConfig.shadowOffsetY",
          type: "number",
          description: "阴影垂直偏移。默认 0。",
        },
        {
          path: "baseSeriesConfig.shadowBlur",
          type: "number",
          description: "阴影模糊半径。默认 0。",
        },
      ],
    },
    {
      path: "customSeriesConfigs",
      type: "array<object>",
      description:
        "按系列名覆盖视觉配置，每条包含 { matchSeriesName, customFillColor, customTrackColor }，用于对特定系列单独设置颜色。",
      children: [
        {
          path: "customSeriesConfigs[i].matchSeriesName",
          type: "string",
          description: "要匹配的系列名，对应 data 中 name 字段。",
        },
        {
          path: "customSeriesConfigs[i].customFillColor",
          type: "color",
          description: "该系列的填充色。",
        },
        {
          path: "customSeriesConfigs[i].customTrackColor",
          type: "color",
          description: "该系列的轨道色。",
        },
      ],
    },
    {
      path: "legendConfig",
      type: "object",
      description: "图例配置。",
      children: [
        {
          path: "legendConfig.show",
          type: "boolean",
          description: "是否显示图例。默认 true。",
        },
        {
          path: "legendConfig.position",
          type: "object",
          description: "图例位置。",
          children: [
            {
              path: "legendConfig.position.top",
              type: "string|number",
              description: "垂直位置，如 top、bottom、center 或具体数值。",
            },
            {
              path: "legendConfig.position.left",
              type: "string|number",
              description: "水平位置，如 left、center、right 或具体数值。",
            },
          ],
        },
        {
          path: "legendConfig.orient",
          type: "enum",
          values: ["horizontal", "vertical"],
          description: "图例朝向。默认 horizontal。",
        },
        {
          path: "legendConfig.icon",
          type: "string",
          description: "图例图标，如 circle、rect、roundRect。默认 circle。",
        },
        {
          path: "legendConfig.fontFamily",
          type: "string",
          description: "图例字体。",
        },
        {
          path: "legendConfig.fontSize",
          type: "number",
          description: "图例字号。",
        },
        {
          path: "legendConfig.color",
          type: "color",
          description: "图例文字颜色。",
        },
        {
          path: "legendConfig.fontWeight",
          type: "string",
          description: "图例字重。",
        },
        {
          path: "legendConfig.fontStyle",
          type: "string",
          description: "图例字体样式。",
        },
      ],
    },
    {
      path: "tooltipConfig",
      type: "object",
      description: "提示框配置。",
      children: [
        {
          path: "tooltipConfig.show",
          type: "boolean",
          description: "是否显示提示框。默认 true。",
        },
        {
          path: "tooltipConfig.backgroundColor",
          type: "color",
          description: "提示框背景色。",
        },
        {
          path: "tooltipConfig.fontFamily",
          type: "string",
          description: "提示框字体。",
        },
        {
          path: "tooltipConfig.fontSize",
          type: "number",
          description: "提示框字号。",
        },
        {
          path: "tooltipConfig.color",
          type: "color",
          description: "提示框文字颜色。",
        },
        {
          path: "tooltipConfig.fontWeight",
          type: "string",
          description: "提示框字重。",
        },
        {
          path: "tooltipConfig.fontStyle",
          type: "string",
          description: "提示框字体样式。",
        },
      ],
    },
    {
      path: "animationConfig",
      type: "object",
      description: "动画配置。",
      children: [
        {
          path: "animationConfig.show",
          type: "boolean",
          description: "是否开启动画。默认 true。",
        },
        {
          path: "animationConfig.duration",
          type: "number",
          description: "动画时长，单位 ms。默认 1000。",
        },
        {
          path: "animationConfig.closeAnimationOnDesignMode",
          type: "boolean",
          description: "设计模式下是否关闭动画。默认 true。",
        },
      ],
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
    "AI 填写 data 后，MCP 会把它同步到 datasource.constantData，并补齐 seriesName→name、value→value 的 fieldMappings。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "baseSeriesConfig 中未提供的字段会由 MCP 补齐为默认值。",
    "legendConfig.position 缺少 top/left 时，MCP 会重置为默认 bottom/center。",
    "customSeriesConfigs 为空数组时，所有系列使用 baseSeriesConfig 的默认视觉。",
  ],
  visualRules: [
    "data 每条记录必须包含 { name, value }，name 为系列名，value 为进度数值。",
    "环形进度图适合展示多个系列在同一指标下的完成度或占比对比。",
    "maxValue 应根据实际业务语义设置，如 100 表示百分比，或具体目标值。",
    "minRadius 与 gap 需要联动调整：系列较多时应减小 gap 或增大组件尺寸，避免圆环拥挤。",
    "建议为不同系列配置对比明显的填充色，可使用主色、辅色、强调色组合；轨道色应保持低透明度。",
    "标签较多或系列名较长时，可关闭 labelShowSeriesName 或调整 labelFontSize，避免标签重叠。",
    "图例默认位于底部居中，给圆环主体留出中心区域。",
    "需要突出某个系列时，可通过 customSeriesConfigs 单独设置其填充色或轨道色。",
  ],
  examples: [
    {
      title: "科技风环形进度图配置示例",
      props: {
        componentName: "CircularProgress",
        logicalId: "theme_circular_progress",
        parentLogicalId: "screen_group",
        name: "任务完成进度",
        style: {
          left: 100,
          top: 120,
          width: 525,
          height: 293,
          position: "absolute",
        },
        data: [
          { name: "研发", value: 88 },
          { name: "测试", value: 72 },
          { name: "运维", value: 95 },
          { name: "产品", value: 60 },
        ],
        baseSeriesConfig: {
          maxValue: 100,
          minRadius: 55,
          gap: 8,
          roundCap: true,
          clockwise: true,
          trackColor: "rgba(0,229,255,0.12)",
          showLabel: true,
          labelColor: "#BFEFFF",
          labelFontSize: 13,
          labelFontFamily: "Microsoft YaHei",
          labelFontWeight: "normal",
          labelFontStyle: "normal",
          labelShowSeriesName: true,
          precision: 0,
          suffix: "%",
          labelHelpLineColor: "rgba(0,229,255,0.3)",
          labelHelpLineWidth: 1,
          shadowColor: "rgba(0,229,255,0.35)",
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowBlur: 10,
        },
        customSeriesConfigs: [
          {
            matchSeriesName: "运维",
            customFillColor: "#00E5FF",
            customTrackColor: "rgba(0,229,255,0.2)",
          },
          {
            matchSeriesName: "产品",
            customFillColor: "#FFB300",
            customTrackColor: "rgba(255,179,0,0.2)",
          },
        ],
        legendConfig: {
          show: true,
          position: {
            top: "bottom",
            left: "center",
          },
          orient: "horizontal",
          icon: "circle",
          fontFamily: "Microsoft YaHei",
          fontSize: 12,
          color: "#BFEFFF",
          fontWeight: "normal",
          fontStyle: "normal",
        },
        tooltipConfig: {
          show: true,
          backgroundColor: "rgba(3,16,31,0.92)",
          fontFamily: "Microsoft YaHei",
          fontSize: 14,
          color: "#FFFFFF",
          fontWeight: "normal",
          fontStyle: "normal",
        },
        animationConfig: {
          show: true,
          duration: 1200,
          closeAnimationOnDesignMode: true,
        },
      },
    },
  ],
};
