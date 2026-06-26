import type { JsonObject } from "../../types/component.js";

export const funnelChartCapability: JsonObject = {
  componentName: "FunnelChart",
  displayName: "漏斗图",
  description:
    "用于展示数据在多层级之间的流转与转化关系，以梯形漏斗块面积表示各层级数值大小，支持排序、图例、标签、提示框与自定义系列颜色。",
  aiRole:
    "AI 负责生成漏斗数据、排序方式、图例配置、漏斗标签、中央标签、边框、提示框以及自定义系列颜色匹配；MCP 负责把 data 同步到 datasource.constantData，并补齐 fieldMappings、constantTableColumns 与其余 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "FunnelChart",
      description: "组件类型，必须固定为 FunnelChart。",
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
        "漏斗图数据数组，每条记录包含 { name, value }，name 为漏斗层级名称，value 为对应数值。MCP 会把它同步到 datasource.constantData。",
    },
    {
      path: "sort",
      type: "enum",
      values: ["descending", "ascending"],
      description:
        "漏斗块排序方式。descending 按数值从大到小排列（顶部大、底部小），ascending 相反。默认 descending。",
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
          path: "legendConfig.titleFontStyle",
          type: "object",
          description: "图例名称文字样式。",
          children: [
            {
              path: "legendConfig.titleFontStyle.fontFamily",
              type: "string",
              description: "图例名称字体。默认 Microsoft YaHei。",
            },
            {
              path: "legendConfig.titleFontStyle.fontSize",
              type: "number",
              description: "图例名称字号。默认 12。",
            },
            {
              path: "legendConfig.titleFontStyle.color",
              type: "color",
              description: "图例名称颜色。默认 #ffffff。",
            },
            {
              path: "legendConfig.titleFontStyle.fontWeight",
              type: "string",
              description: "图例名称字重。默认 normal。",
            },
            {
              path: "legendConfig.titleFontStyle.fontStyle",
              type: "string",
              description: "图例名称字体样式。默认 normal。",
            },
          ],
        },
        {
          path: "legendConfig.valueFontStyle",
          type: "object",
          description: "图例数值文字样式。",
          children: [
            {
              path: "legendConfig.valueFontStyle.fontFamily",
              type: "string",
              description: "图例数值字体。默认 Microsoft YaHei。",
            },
            {
              path: "legendConfig.valueFontStyle.fontSize",
              type: "number",
              description: "图例数值字号。默认 10。",
            },
            {
              path: "legendConfig.valueFontStyle.color",
              type: "color",
              description: "图例数值颜色。默认 rgba(255,255,255,0.75)。",
            },
            {
              path: "legendConfig.valueFontStyle.fontWeight",
              type: "string",
              description: "图例数值字重。默认 normal。",
            },
            {
              path: "legendConfig.valueFontStyle.fontStyle",
              type: "string",
              description: "图例数值字体样式。默认 normal。",
            },
          ],
        },
      ],
    },
    {
      path: "labelConfig",
      type: "object",
      description: "漏斗块标签配置。",
      children: [
        {
          path: "labelConfig.show",
          type: "boolean",
          description: "是否显示标签。默认 true。",
        },
        {
          path: "labelConfig.position",
          type: "enum",
          values: ["inside", "outside", "left", "right"],
          description: "标签位置。默认 inside。",
        },
        {
          path: "labelConfig.formatter",
          type: "string",
          description: "标签格式化字符串，支持 {b} 名称、{c} 数值。默认 {b}: {c}。",
        },
        {
          path: "labelConfig.fontFamily",
          type: "string",
          description: "标签字体。默认 Microsoft YaHei。",
        },
        {
          path: "labelConfig.fontSize",
          type: "number",
          description: "标签字号。默认 12。",
        },
        {
          path: "labelConfig.color",
          type: "color",
          description: "标签颜色。默认 #ffffff。",
        },
        {
          path: "labelConfig.fontWeight",
          type: "string",
          description: "标签字重。默认 normal。",
        },
        {
          path: "labelConfig.fontStyle",
          type: "string",
          description: "标签字体样式。默认 normal。",
        },
      ],
    },
    {
      path: "centralLabelConfig",
      type: "object",
      description: "漏斗中央标签配置，通常用于展示合计或中心标题。",
      children: [
        {
          path: "centralLabelConfig.show",
          type: "boolean",
          description: "是否显示中央标签。默认 false。",
        },
        {
          path: "centralLabelConfig.formatter",
          type: "string",
          description: "中央标签格式化字符串，支持 {c} 合计数值。默认 合计\\n{c}。",
        },
        {
          path: "centralLabelConfig.fontFamily",
          type: "string",
          description: "中央标签字体。默认 Microsoft YaHei。",
        },
        {
          path: "centralLabelConfig.fontSize",
          type: "number",
          description: "中央标签字号。默认 16。",
        },
        {
          path: "centralLabelConfig.color",
          type: "color",
          description: "中央标签颜色。默认 #ffffff。",
        },
        {
          path: "centralLabelConfig.fontWeight",
          type: "string",
          description: "中央标签字重。默认 bold。",
        },
        {
          path: "centralLabelConfig.fontStyle",
          type: "string",
          description: "中央标签字体样式。默认 normal。",
        },
      ],
    },
    {
      path: "borderConfig",
      type: "object",
      description: "漏斗块边框配置。",
      children: [
        {
          path: "borderConfig.show",
          type: "boolean",
          description: "是否显示边框。默认 true。",
        },
        {
          path: "borderConfig.borderColor",
          type: "color",
          description: "边框颜色。默认 rgba(255,255,255,0.3)。",
        },
        {
          path: "borderConfig.borderWidth",
          type: "number",
          description: "边框宽度。默认 1。",
        },
        {
          path: "borderConfig.borderType",
          type: "enum",
          values: ["solid", "dashed", "dotted"],
          description: "边框线型。默认 solid。",
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
          description: "提示框背景色。默认 rgba(3,16,31,0.92)。",
        },
        {
          path: "tooltipConfig.fontFamily",
          type: "string",
          description: "提示框字体。默认 Microsoft YaHei。",
        },
        {
          path: "tooltipConfig.fontSize",
          type: "number",
          description: "提示框字号。默认 14。",
        },
        {
          path: "tooltipConfig.color",
          type: "color",
          description: "提示框文字颜色。默认 #ffffff。",
        },
        {
          path: "tooltipConfig.fontWeight",
          type: "string",
          description: "提示框字重。默认 normal。",
        },
        {
          path: "tooltipConfig.fontStyle",
          type: "string",
          description: "提示框字体样式。默认 normal。",
        },
      ],
    },
    {
      path: "customSeriesConfigs",
      type: "array<object>",
      description:
        "按系列名覆盖颜色配置，每条包含 { matchSeriesName, customColor }，用于对特定漏斗层级单独设置颜色。",
      children: [
        {
          path: "customSeriesConfigs[i].matchSeriesName",
          type: "string",
          description: "要匹配的系列名，对应 data 中 name 字段。",
        },
        {
          path: "customSeriesConfigs[i].customColor",
          type: "color",
          description: "该层级的填充色。",
        },
      ],
    },
    {
      path: "rotate",
      type: "number",
      range: [-360, 360],
      description: "组件整体旋转角度。",
    },
    {
      path: "opacity",
      type: "number",
      range: [0, 1],
      description: "组件整体不透明度。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "datasource",
      reason:
        "datasource 由 MCP 根据 data 自动同步 constantData、fieldMappings 与 constantTableColumns，AI 不应直接写入。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "AI 填写 data 后，MCP 会把它同步到 datasource.constantData，并补齐 name→name、value→value 的 fieldMappings 与 constantTableColumns。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "legendConfig/labelConfig/centralLabelConfig/borderConfig/tooltipConfig 中未提供的字段会由 MCP 补齐为默认值。",
    "legendConfig.position 缺少 top/left 时，MCP 会重置为默认 bottom/center。",
    "sort 只能为 descending 或 ascending，非法值会被重置为 descending。",
    "customSeriesConfigs 为空数组时，所有层级使用默认主题色。",
  ],
  visualRules: [
    "data 每条记录必须包含 { name, value }，name 为漏斗层级名称，value 为对应数值。",
    "漏斗图适合展示多阶段转化、层级递减或递增的数据，如步骤A→步骤B→步骤C→步骤D。",
    "sort 为 descending 时数值最大的层级位于漏斗顶部，适合展示漏斗流失；ascending 则相反。",
    "建议为相邻层级配置对比明显但不刺眼的颜色，可使用同色系渐变或主题色组合。",
    "标签内容较多或层级名较长时，可调整 labelConfig.position 为 outside 或减小 fontSize，避免标签重叠。",
    "图例默认位于底部居中，给漏斗主体留出中心区域；如需突出中央标签，可将图例移至左侧或右侧。",
    "需要突出某个关键层级时，可通过 customSeriesConfigs 单独设置其填充色。",
  ],
  examples: [
    {
      title: "漏斗图配置示例",
      props: {
        componentName: "FunnelChart",
        logicalId: "theme_funnel_chart",
        parentLogicalId: "screen_group",
        name: "转化漏斗",
        style: {
          position: "absolute",
          left: 300,
          top: 300,
          width: 500,
          height: 300,
          zIndex: 100,
          backgroundColor: "transparent",
        },
        data: [
          { name: "步骤A", value: 100 },
          { name: "步骤B", value: 80 },
          { name: "步骤C", value: 60 },
          { name: "步骤D", value: 40 },
          { name: "步骤E", value: 20 },
        ],
        sort: "descending",
        legendConfig: {
          show: true,
          position: {
            top: "bottom",
            left: "center",
          },
          orient: "horizontal",
          icon: "circle",
          titleFontStyle: {
            fontFamily: "Microsoft YaHei",
            fontSize: 12,
            color: "#BFEFFF",
            fontWeight: "normal",
            fontStyle: "normal",
          },
          valueFontStyle: {
            fontFamily: "Microsoft YaHei",
            fontSize: 10,
            color: "rgba(191,239,255,0.75)",
            fontWeight: "normal",
            fontStyle: "normal",
          },
        },
        labelConfig: {
          show: true,
          position: "inside",
          formatter: "{b}: {c}",
          fontFamily: "Microsoft YaHei",
          fontSize: 12,
          color: "#FFFFFF",
          fontWeight: "normal",
          fontStyle: "normal",
        },
        centralLabelConfig: {
          show: true,
          formatter: "总转化\n{c}",
          fontFamily: "Microsoft YaHei",
          fontSize: 14,
          color: "#00E5FF",
          fontWeight: "bold",
          fontStyle: "normal",
        },
        borderConfig: {
          show: true,
          borderColor: "rgba(0,229,255,0.3)",
          borderWidth: 1,
          borderType: "solid",
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
        customSeriesConfigs: [
          {
            matchSeriesName: "步骤E",
            customColor: "#00E5FF",
          },
          {
            matchSeriesName: "步骤A",
            customColor: "#0066FF",
          },
        ],
      },
    },
  ],
};
