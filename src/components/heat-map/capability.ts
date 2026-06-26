import type { JsonObject } from "../../types/component.js";

export const heatMapCapability: JsonObject = {
  componentName: "HeatMap",
  displayName: "热力图",
  description:
    "用于展示两个分类维度交叉分布强度的 ECharts 热力图组件，通过颜色深浅映射数值大小，支持 X/Y 轴、视觉映射、高亮和标签配置。",
  aiRole:
    "AI 负责热力图数据、X/Y 轴、视觉映射颜色、标签；MCP 负责把 data 同步到 datasource。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "HeatMap",
      description: "组件类型，必须固定为 HeatMap。",
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
        "热力图数据数组。每条记录必须包含 { x, y, value }，其中 x 映射 X 轴分类，y 映射 Y 轴分类，value 为数值或 \"-\" 表示缺失；MCP 会将其同步到 datasource.constantData。",
    },
    {
      path: "marginConf",
      type: "object",
      description: "图表绘图区与容器边界的边距配置。",
      children: [
        { path: "marginConf.top", type: "number", description: "顶部边距，单位 px。" },
        { path: "marginConf.bottom", type: "number", description: "底部边距，单位 px。" },
        { path: "marginConf.left", type: "number", description: "左侧边距，单位 px。" },
        { path: "marginConf.right", type: "number", description: "右侧边距，单位 px。" },
      ],
    },
    {
      path: "XAxisConf",
      type: "object",
      description: "X 轴配置。",
      children: [
        { path: "XAxisConf.show", type: "boolean", description: "是否显示 X 轴。" },
        { path: "XAxisConf.position", type: "enum", values: ["top", "bottom"], description: "X 轴位置。" },
        { path: "XAxisConf.name", type: "string", description: "X 轴名称。" },
        {
          path: "XAxisConf.nameTextStyle",
          type: "object",
          description: "X 轴名称样式，包含 color、fontSize 等。",
        },
        {
          path: "XAxisConf.axisLabel",
          type: "object",
          description: "X 轴标签样式。",
          children: [
            { path: "XAxisConf.axisLabel.show", type: "boolean", description: "是否显示标签。" },
            { path: "XAxisConf.axisLabel.color", type: "color", description: "标签颜色。" },
            { path: "XAxisConf.axisLabel.fontSize", type: "number", description: "标签字号。" },
            { path: "XAxisConf.axisLabel.rotate", type: "number", description: "标签旋转角度。" },
            { path: "XAxisConf.axisLabel.fontWeight", type: "enum", values: ["normal", "bold", "bolder"], description: "标签字重。" },
            { path: "XAxisConf.axisLabel.fontStyle", type: "enum", values: ["normal", "italic", "oblique"], description: "标签字体样式。" },
          ],
        },
        {
          path: "XAxisConf.splitLine",
          type: "object",
          description: "X 轴分割线样式。",
          children: [
            { path: "XAxisConf.splitLine.show", type: "boolean", description: "是否显示分割线。" },
            { path: "XAxisConf.splitLine.lineStyle.color", type: "color", description: "分割线颜色。" },
            { path: "XAxisConf.splitLine.lineStyle.width", type: "number", description: "分割线宽度。" },
            { path: "XAxisConf.splitLine.lineStyle.type", type: "enum", values: ["solid", "dashed", "dotted"], description: "分割线类型。" },
          ],
        },
      ],
    },
    {
      path: "YAxisConf",
      type: "object",
      description: "Y 轴配置。",
      children: [
        { path: "YAxisConf.show", type: "boolean", description: "是否显示 Y 轴。" },
        { path: "YAxisConf.position", type: "enum", values: ["left", "right"], description: "Y 轴位置。" },
        { path: "YAxisConf.name", type: "string", description: "Y 轴名称。" },
        {
          path: "YAxisConf.nameTextStyle",
          type: "object",
          description: "Y 轴名称样式，包含 color、fontSize 等。",
        },
        {
          path: "YAxisConf.axisLabel",
          type: "object",
          description: "Y 轴标签样式。",
          children: [
            { path: "YAxisConf.axisLabel.show", type: "boolean", description: "是否显示标签。" },
            { path: "YAxisConf.axisLabel.color", type: "color", description: "标签颜色。" },
            { path: "YAxisConf.axisLabel.fontSize", type: "number", description: "标签字号。" },
            { path: "YAxisConf.axisLabel.fontWeight", type: "enum", values: ["normal", "bold", "bolder"], description: "标签字重。" },
            { path: "YAxisConf.axisLabel.fontStyle", type: "enum", values: ["normal", "italic", "oblique"], description: "标签字体样式。" },
          ],
        },
        {
          path: "YAxisConf.splitLine",
          type: "object",
          description: "Y 轴分割线样式。",
          children: [
            { path: "YAxisConf.splitLine.show", type: "boolean", description: "是否显示分割线。" },
            { path: "YAxisConf.splitLine.lineStyle.color", type: "color", description: "分割线颜色。" },
            { path: "YAxisConf.splitLine.lineStyle.width", type: "number", description: "分割线宽度。" },
            { path: "YAxisConf.splitLine.lineStyle.type", type: "enum", values: ["solid", "dashed", "dotted"], description: "分割线类型。" },
          ],
        },
      ],
    },
    {
      path: "tooltipConf",
      type: "object",
      description: "提示框配置。",
      children: [
        { path: "tooltipConf.show", type: "boolean", description: "是否显示提示框。默认 true。" },
        { path: "tooltipConf.backgroundColor", type: "color", description: "提示框背景色。默认 rgba(3,16,31,0.92)。" },
        { path: "tooltipConf.color", type: "color", description: "提示框文字颜色。默认 #ffffff。" },
        { path: "tooltipConf.fontSize", type: "number", description: "提示框字号。默认 14。" },
        { path: "tooltipConf.padding", type: "number", description: "提示框内边距。默认 10。" },
        { path: "tooltipConf.fontFamily", type: "string", description: "提示框字体。默认 Microsoft YaHei。" },
        { path: "tooltipConf.fontWeight", type: "string", description: "提示框字重。默认 normal。" },
        { path: "tooltipConf.fontStyle", type: "string", description: "提示框字体样式。默认 normal。" },
      ],
    },
    {
      path: "visualMappingConf",
      type: "object",
      description: "视觉映射配置，控制颜色与数值的映射关系。",
      children: [
        { path: "visualMappingConf.show", type: "boolean", description: "是否显示视觉映射组件。" },
        { path: "visualMappingConf.min", type: "number", description: "映射最小值。" },
        { path: "visualMappingConf.max", type: "number", description: "映射最大值。" },
        { path: "visualMappingConf.orient", type: "enum", values: ["vertical", "horizontal"], description: "视觉映射朝向。" },
        { path: "visualMappingConf.left", type: "string|number", description: "水平位置。" },
        { path: "visualMappingConf.top", type: "string|number", description: "垂直位置。" },
        { path: "visualMappingConf.calculable", type: "boolean", description: "是否显示拖拽手柄。" },
        {
          path: "visualMappingConf.inRange.color",
          type: "array<color>",
          description: "颜色映射数组，从低到高渐变。",
        },
        {
          path: "visualMappingConf.textStyle",
          type: "object",
          description: "视觉映射文本样式。",
        },
      ],
    },
    {
      path: "highlightConf",
      type: "object",
      description: "高亮样式配置。",
      children: [
        { path: "highlightConf.itemStyle.shadowBlur", type: "number", description: "高亮阴影模糊半径。" },
        { path: "highlightConf.itemStyle.shadowColor", type: "color", description: "高亮阴影颜色。" },
        { path: "highlightConf.itemStyle.borderColor", type: "color", description: "高亮边框颜色。" },
        { path: "highlightConf.itemStyle.borderWidth", type: "number", description: "高亮边框宽度。" },
      ],
    },
    {
      path: "labelConf",
      type: "object",
      description: "热力块标签配置。",
      children: [
        { path: "labelConf.show", type: "boolean", description: "是否显示标签。" },
        { path: "labelConf.color", type: "color", description: "标签颜色。" },
        { path: "labelConf.fontSize", type: "number", description: "标签字号。" },
        { path: "labelConf.fontWeight", type: "enum", values: ["normal", "bold", "bolder"], description: "标签字重。" },
        { path: "labelConf.formatter", type: "string", description: "标签格式化字符串，如 '{c}'。" },
      ],
    },
  ],
  aiForbiddenProps: [
    {
      path: "datasource.sourceType",
      reason: "HeatMap 当前只由 MCP 生成 constant 数据源，AI 不应切换 sourceType。",
    },
    {
      path: "datasource.constantDataType",
      reason: "MCP 固定使用 table 类型承载热力图数据。",
    },
    {
      path: "datasource.fieldMode",
      reason: "MCP 固定使用 multiple 字段模式。",
    },
    {
      path: "datasource.constantTableColumns",
      reason: "MCP 会补齐 x/y/value 三列结构。",
    },
    {
      path: "datasource.fieldMappings",
      reason: "MCP 会补齐 x/y/value 三个字段映射。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "AI 可填写 data 数组；MCP 会归一化并同步到 datasource.constantData，同时补齐 datasource.fieldMappings 与 datasource.constantTableColumns。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
  ],
  visualRules: [
    "data 每条记录必须包含 { x, y, value }，其中 x、y 为分类字符串，value 为数值或 \"-\" 表示缺失。",
    "热力图用于展示两个分类维度的交叉强度，不要把饼图/柱状图概念混用。",
    "视觉映射颜色应从低到高形成连续渐变，建议使用冷暖对比色（如蓝到红），确保色盲用户可辨识。",
    "当数值范围较大时，应合理设置 visualMappingConf.min 与 max，避免颜色过于集中。",
    "标签（labelConf.show）默认关闭，数据密集时开启会导致重叠；仅在网格稀疏时开启。",
    "X/Y 轴标签较长时可设置旋转角度，避免重叠。",
    "tooltip 内容应清晰展示 x、y 分类与对应数值。",
  ],
  examples: [
    {
      title: "热力图配置示例",
      props: {
        componentName: "HeatMap",
        logicalId: "theme_heat_map",
        parentLogicalId: "screen_group",
        name: "时段热度分布图",
        style: {
          left: 80,
          top: 160,
          width: 520,
          height: 320,
          position: "absolute",
        },
        data: [
          { x: "00:00", y: "周一", value: 5 },
          { x: "04:00", y: "周一", value: 1 },
          { x: "08:00", y: "周一", value: 8 },
          { x: "12:00", y: "周一", value: 9 },
          { x: "16:00", y: "周一", value: 7 },
          { x: "20:00", y: "周一", value: 4 },
          { x: "00:00", y: "周二", value: 3 },
          { x: "04:00", y: "周二", value: 0 },
          { x: "08:00", y: "周二", value: 6 },
          { x: "12:00", y: "周二", value: 10 },
          { x: "16:00", y: "周二", value: 8 },
          { x: "20:00", y: "周二", value: 5 },
        ],
        marginConf: {
          top: 24,
          left: 56,
          bottom: 32,
          right: 96,
        },
        XAxisConf: {
          show: true,
          name: "时间",
          axisLabel: {
            color: "#BFEFFF",
            fontSize: 12,
            rotate: 0,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "rgba(0,229,255,0.12)",
              type: "dashed",
            },
          },
        },
        YAxisConf: {
          show: true,
          name: "星期",
          axisLabel: {
            color: "#BFEFFF",
            fontSize: 12,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "rgba(0,229,255,0.12)",
              type: "dashed",
            },
          },
        },
        tooltipConf: {
          show: true,
          backgroundColor: "rgba(3,16,31,0.92)",
          color: "#FFFFFF",
          fontSize: 14,
          padding: 10,
          fontFamily: "Microsoft YaHei",
          fontWeight: "normal",
          fontStyle: "normal",
        },
        visualMappingConf: {
          show: true,
          min: 0,
          max: 10,
          calculable: true,
          orient: "vertical",
          left: "right",
          top: "center",
          inRange: {
            color: ["#0d47a1", "#42a5f5", "#80deea", "#fff176", "#ff7043", "#d32f2f"],
          },
          textStyle: {
            color: "#BFEFFF",
          },
        },
        labelConf: {
          show: false,
        },
        highlightConf: {
          itemStyle: {
            shadowBlur: 12,
            shadowColor: "rgba(0,229,255,0.6)",
            borderColor: "#00E5FF",
            borderWidth: 1,
          },
        },
      },
    },
  ],
};
