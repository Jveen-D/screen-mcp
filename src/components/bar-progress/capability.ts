import type { JsonObject } from "../../types/component.js";

export const barProgressCapability: JsonObject = {
  componentName: "BarProgress",
  displayName: "条形进度图",
  description:
    "用于展示分类进度对比的横向条形进度图组件，基于 ECharts bar series 绘制，Y 轴为分类、X 轴为数值，支持背景条、圆角、标签和图例配置。",
  aiRole:
    "AI 负责生成组件布局、视觉表达和可选的 chartData.constant.data 语义数据；MCP 会补齐完整 props 与有效 chartData。条形进度图强调同一指标下不同分类的进度对比，type 字段通常作为单一系列名。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "BarProgress",
      description: "组件类型，必须固定为 BarProgress。",
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
      path: "chartData.constant.data",
      type: "array<object>",
      description:
        "条形进度图常量数据数组。每条记录必须包含 { name, type, value }，其中 name 为 Y 轴分类（类目），type 通常为单一系列名，value 为进度数值。",
    },
    {
      path: "chartData.indicator[0].fieldDataConfig.chartDisplayName",
      type: "string",
      description:
        "指标在图例/提示中的业务显示名。必须根据指标业务含义设置，如“完成率”“进度”“销售额”“完成量”，严禁保留默认值“value”。",
    },
    {
      path: "option.grid",
      type: "object",
      description:
        "图表网格边距配置，控制条形进度区域与容器边界的距离。AI 可适当调整 left/top/right/bottom 以适配 Y 轴分类名长度和右侧标签。",
      children: [
        {
          path: "option.grid.left",
          type: "number",
          description: "左侧边距，单位 px。分类名较长时应适当增大。",
        },
        {
          path: "option.grid.top",
          type: "number",
          description: "顶部边距，单位 px。",
        },
        {
          path: "option.grid.right",
          type: "number",
          description: "右侧边距，单位 px。开启右侧数据标签时应适当增大。",
        },
        {
          path: "option.grid.bottom",
          type: "number",
          description: "底部边距，单位 px。",
        },
      ],
    },
    {
      path: "option.xAxis",
      type: "object",
      description:
        "X 轴配置。type 固定为 value，由 MCP 自动设置；默认隐藏 axisLabel。AI 可调整 show、splitLine 等样式。",
      children: [
        {
          path: "option.xAxis.show",
          type: "boolean",
          description: "是否显示 X 轴。",
        },
        {
          path: "option.xAxis.name",
          type: "string",
          description: "X 轴名称。",
        },
        {
          path: "option.xAxis.splitLine",
          type: "object",
          description: "X 轴分割线样式。",
          children: [
            {
              path: "option.xAxis.splitLine.show",
              type: "boolean",
              description: "是否显示分割线。",
            },
            {
              path: "option.xAxis.splitLine.lineStyle.width",
              type: "number",
              description: "分割线宽度。",
            },
            {
              path: "option.xAxis.splitLine.lineStyle.type",
              type: "enum",
              values: ["solid", "dashed", "dotted"],
              description: "分割线类型。",
            },
            {
              path: "option.xAxis.splitLine.lineStyle.color",
              type: "color",
              description: "分割线颜色。",
            },
          ],
        },
        {
          path: "option.xAxis.axisLine",
          type: "object",
          description: "X 轴线样式。",
          children: [
            {
              path: "option.xAxis.axisLine.show",
              type: "boolean",
              description: "是否显示轴线。",
            },
            {
              path: "option.xAxis.axisLine.lineStyle.width",
              type: "number",
              description: "轴线宽度。",
            },
            {
              path: "option.xAxis.axisLine.lineStyle.type",
              type: "enum",
              values: ["solid", "dashed", "dotted"],
              description: "轴线类型。",
            },
            {
              path: "option.xAxis.axisLine.lineStyle.color",
              type: "color",
              description: "轴线颜色。",
            },
          ],
        },
      ],
    },
    {
      path: "option.yAxis",
      type: "object",
      description:
        "Y 轴配置。type 固定为 category 且 inverse 固定为 true，由 MCP 自动设置。AI 可调整 axisLabel 颜色、splitLine 样式。",
      children: [
        {
          path: "option.yAxis.show",
          type: "boolean",
          description: "是否显示 Y 轴。",
        },
        {
          path: "option.yAxis.name",
          type: "string",
          description: "Y 轴名称。",
        },
        {
          path: "option.yAxis.axisLabel",
          type: "object",
          description: "Y 轴分类标签样式。",
          children: [
            {
              path: "option.yAxis.axisLabel.show",
              type: "boolean",
              description: "是否显示 Y 轴分类标签。",
            },
            {
              path: "option.yAxis.axisLabel.color",
              type: "color",
              description: "标签颜色。",
            },
            {
              path: "option.yAxis.axisLabel.fontSize",
              type: "number",
              description: "标签字号。",
            },
            {
              path: "option.yAxis.axisLabel.fontWeight",
              type: "enum",
              values: ["normal", "bold", "bolder"],
              description: "标签字重。",
            },
            {
              path: "option.yAxis.axisLabel.fontStyle",
              type: "enum",
              values: ["normal", "italic", "oblique"],
              description: "标签字体样式。",
            },
            {
              path: "option.yAxis.axisLabel.fontFamily",
              type: "string",
              description: "标签字体。",
            },
            {
              path: "option.yAxis.axisLabel.margin",
              type: "number",
              description: "标签与轴线的间距。",
            },
          ],
        },
        {
          path: "option.yAxis.axisLine",
          type: "object",
          description: "Y 轴线样式。",
          children: [
            {
              path: "option.yAxis.axisLine.show",
              type: "boolean",
              description: "是否显示轴线。",
            },
            {
              path: "option.yAxis.axisLine.lineStyle.width",
              type: "number",
              description: "轴线宽度。",
            },
            {
              path: "option.yAxis.axisLine.lineStyle.type",
              type: "enum",
              values: ["solid", "dashed", "dotted"],
              description: "轴线类型。",
            },
            {
              path: "option.yAxis.axisLine.lineStyle.color",
              type: "color",
              description: "轴线颜色。",
            },
          ],
        },
        {
          path: "option.yAxis.splitLine",
          type: "object",
          description: "Y 轴分割线样式。",
          children: [
            {
              path: "option.yAxis.splitLine.show",
              type: "boolean",
              description: "是否显示分割线。",
            },
            {
              path: "option.yAxis.splitLine.lineStyle.width",
              type: "number",
              description: "分割线宽度。",
            },
            {
              path: "option.yAxis.splitLine.lineStyle.type",
              type: "enum",
              values: ["solid", "dashed", "dotted"],
              description: "分割线类型。",
            },
            {
              path: "option.yAxis.splitLine.lineStyle.color",
              type: "color",
              description: "分割线颜色。",
            },
          ],
        },
      ],
    },
    {
      path: "option.legend",
      type: "object",
      description:
        "图例配置。条形进度图默认位于右上角（right/top），AI 可按需调整位置、朝向和文本样式。",
      children: [
        {
          path: "option.legend.show",
          type: "boolean",
          description: "是否显示图例。",
        },
        {
          path: "option.legend.left",
          type: "string|number",
          description: "图例水平位置，如 'left'、'center'、'right' 或具体数值。",
        },
        {
          path: "option.legend.top",
          type: "string|number",
          description: "图例垂直位置，如 'top'、'middle'、'bottom' 或具体数值。",
        },
        {
          path: "option.legend.orient",
          type: "enum",
          values: ["horizontal", "vertical"],
          description: "图例朝向。",
        },
        {
          path: "option.legend.textStyle",
          type: "object",
          description: "图例文本样式。",
        },
      ],
    },
    {
      path: "option.series",
      type: "array<object>",
      description:
        "条形进度图系列配置数组。AI 可调整柱宽、填充色、圆角、边框、背景条、标签样式等；series[0].type 和 showBackground 由 MCP 强制固定。",
      children: [
        {
          path: "option.series[0].barWidth",
          type: "number",
          description: "进度条宽度，单位 px。默认 12。",
        },
        {
          path: "option.series[0].itemStyle",
          type: "object",
          description: "进度条图形样式。",
          children: [
            {
              path: "option.series[0].itemStyle.color",
              type: "color",
              description: "进度条填充色。",
            },
            {
              path: "option.series[0].itemStyle.borderWidth",
              type: "number",
              description: "进度条边框宽。",
            },
            {
              path: "option.series[0].itemStyle.borderRadius",
              type: "number|number[]",
              description: "进度条圆角半径，支持数字或 [左上, 右上, 右下, 左下] 数组。",
            },
          ],
        },
        {
          path: "option.series[0].backgroundStyle",
          type: "object",
          description: "进度条背景条样式。showBackground 固定为 true。",
          children: [
            {
              path: "option.series[0].backgroundStyle.color",
              type: "color",
              description: "背景条填充色。",
            },
            {
              path: "option.series[0].backgroundStyle.borderRadius",
              type: "number|number[]",
              description: "背景条圆角半径。",
            },
            {
              path: "option.series[0].backgroundStyle.opacity",
              type: "number",
              description: "背景条透明度，0~1。",
            },
          ],
        },
        {
          path: "option.series[0].label",
          type: "object",
          description: "数据标签，默认显示在进度条右侧。",
          children: [
            {
              path: "option.series[0].label.show",
              type: "boolean",
              description: "是否显示数据标签。",
            },
            {
              path: "option.series[0].label.position",
              type: "enum",
              values: ["right", "left", "top", "bottom", "inside", "insideRight", "insideLeft"],
              description: "标签位置。条形进度图默认右侧。",
            },
            {
              path: "option.series[0].label.color",
              type: "color",
              description: "标签颜色。",
            },
            {
              path: "option.series[0].label.fontSize",
              type: "number",
              description: "标签字号。",
            },
            {
              path: "option.series[0].label.formatter",
              type: "string",
              description: "标签格式化字符串，如 '{c}%'。严禁使用 \n 等转义字符。",
            },
          ],
        },
      ],
    },
    {
      path: "option.tooltip",
      type: "object",
      description: "提示框配置。trigger 默认为 axis。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData.sourceType",
      reason: "BarProgress 当前只由 MCP 生成 constant 数据源，AI 不应切换 sourceType。",
    },
    {
      path: "chartData.constant.originalData",
      reason: "MCP 会根据 chartData.constant.data 自动同步 originalData。",
    },
    {
      path: "chartData.constant.fieldList",
      reason: "MCP 会补齐 name/type/value 字段列表。",
    },
    {
      path: "chartData.dimension",
      reason: "MCP 固定使用 name 一个维度作为 Y 轴分类。",
    },
    {
      path: "chartData.indicator[0].fieldName",
      reason: "MCP 固定使用 value 作为指标字段名（X 轴数值）。",
    },
    {
      path: "chartData.indicator[0].fieldDisplayName",
      reason: "MCP 固定使用 value 作为指标显示名。",
    },
    {
      path: "chartData.indicator[0].fieldType",
      reason: "MCP 固定指标字段类型为 DECIMAL。",
    },
    {
      path: "chartData.indicator[0].fieldDataConfig.calculateType",
      reason: "MCP 固定指标计算类型为 SUM。",
    },
    {
      path: "chartData.indicator[0].fieldDataConfig.format",
      reason: "MCP 会统一处理指标数值格式。",
    },
    {
      path: "option.series[i].type",
      reason:
        "BarProgress 的 series type 固定为 'bar'，MCP 会强制回写，AI 不应覆盖为其他图表类型。",
    },
    {
      path: "option.series[i].showBackground",
      reason: "BarProgress 的 showBackground 固定为 true，MCP 会强制回写。",
    },
    {
      path: "option.series[i].stack",
      reason: "BarProgress 为单条横向进度图，不支持堆叠。",
    },
    {
      path: "option.series[i].barGap",
      reason: "BarProgress 不支持 barGap。",
    },
    {
      path: "option.series[i].barCategoryGap",
      reason: "BarProgress 不支持 barCategoryGap。",
    },
    {
      path: "option.series[i].data",
      reason: "数据由 chartData 处理链生成，AI 不应直接写入 series data。",
    },
    {
      path: "option.dataset",
      reason:
        "当前渲染链路不使用 ECharts dataset 驱动 BarProgress 数据，AI 写入 dataset 会被忽略并造成误导。",
    },
    {
      path: "option.title",
      reason: "当前 BarProgress schema 不需要 title，MCP 会移除 AI 输入的 option.title。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
    {
      path: "option.xAxis.type",
      reason: "X 轴 type 固定为 value，由 MCP 自动设置。",
    },
    {
      path: "option.yAxis.type",
      reason: "Y 轴 type 固定为 category，由 MCP 自动设置。",
    },
    {
      path: "option.yAxis.inverse",
      reason: "Y 轴 inverse 固定为 true，由 MCP 自动设置。",
    },
  ],
  mergeRules: [
    "option.series[i].type 固定为 'bar'，即使 AI 输入其他值也会被 MCP 归一化为 'bar'。",
    "option.series[i].showBackground 固定为 true，即使 AI 输入其他值也会被 MCP 归一化为 true。",
    "option.dataset 会被 MCP 移除；条形进度图数据由默认 chartData 或外部数据源替换链路提供。",
    "AI 可填写 chartData.constant.data；MCP 会归一化为完整有效的 constant chartData，并同步 originalData。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "option.xAxis.type 固定为 'value'，option.yAxis.type 固定为 'category' 且 inverse 固定为 true。",
    "option.legend.offsetX/offsetY 会被归一化为数字；未提供时默认为 0。",
    "若 AI 未提供 legend 位置，MCP 默认设置为 left='right'、top='top'。",
  ],
  visualRules: [
    "chartData.dimension 必须只包含一个维度 name，作为 Y 轴分类。",
    "chartData.indicator 必须只包含一个指标 value，作为 X 轴进度数值。",
    "chartData.constant.data 每条记录必须包含 { name, type, value }，其中 name 为 Y 轴分类，type 通常为单一系列名，value 为进度数值。",
    "AI 必须根据业务语义设置 chartData.indicator[0].fieldDataConfig.chartDisplayName（如“完成率”“进度”“销售额”），禁止保留默认值“value”。",
    "条形进度图用于展示同一指标下不同分类的进度大小对比，不要用于多指标对比或占比构成；占比需求应使用饼图或环形图。",
    "Y 轴分类（name）从上到下按数据顺序排列，inverse 固定为 true，确保第一条数据在最上方。",
    "X 轴默认隐藏 axisLabel，重点通过右侧数据标签和 tooltip 展示数值。",
    "进度条背景条（backgroundStyle）应保持低透明度，避免与主体进度条同等视觉重量。",
    "barWidth 建议 8–16px；分类数较多或模块高度较小时应使用较小值，避免条与条之间过于拥挤。",
    "进度条右侧标签（label.position='right'）默认开启，应确保 grid.right 足够大，避免标签被截断。",
    "label formatter 中严禁使用 \\n、\\r、\\t 等转义字符，MCP 会自动清理为单个空格。",
    "需要圆角时应同时设置 itemStyle.borderRadius 和 backgroundStyle.borderRadius，保持视觉一致性。",
    "图例默认位于右上角（right/top），给进度条主体留出左侧和纵向空间。",
    "分类名较长时应增大 grid.left，确保 Y 轴标签完整显示。",
    "进度条颜色应服务于主题：单个系列可由 option.color[0] 或 series[0].itemStyle.color 控制，确保与整体大屏配色协调。",
  ],
  examples: [
    {
      title: "科技风条形进度图配置示例",
      props: {
        componentName: "BarProgress",
        logicalId: "theme_bar_progress",
        parentLogicalId: "screen_group",
        name: "项目完成进度",
        style: {
          left: 80,
          top: 160,
          width: 520,
          height: 280,
          position: "absolute",
        },
        chartData: {
          sourceType: "constant",
          dimension: [
            {
              fieldDataConfig: {
                calculateType: "COUNT",
                chartDisplayName: "name",
              },
              fieldName: "name",
              fieldDisplayName: "name",
              fieldType: "LONGTEXT",
            },
          ],
          indicator: [
            {
              fieldDataConfig: {
                calculateType: "SUM",
                format: {
                  numberFormat: "numerical",
                  Millimeter: false,
                  accuracy: 2,
                  dataFix: {
                    preFix: "",
                    auFix: "",
                  },
                },
                chartDisplayName: "完成率",
              },
              fieldName: "value",
              fieldDisplayName: "value",
              fieldType: "DECIMAL",
            },
          ],
          constant: {
            data: [
              { name: "项目 A", type: "完成率", value: 92 },
              { name: "项目 B", type: "完成率", value: 78 },
              { name: "项目 C", type: "完成率", value: 65 },
              { name: "项目 D", type: "完成率", value: 45 },
              { name: "项目 E", type: "完成率", value: 88 },
            ],
          },
        },
        option: {
          backgroundColor: "transparent",
          color: ["#00E5FF"],
          legend: {
            show: true,
            left: "right",
            top: "top",
            offsetX: 0,
            offsetY: 0,
            orient: "horizontal",
            icon: "circle",
            textStyle: {
              color: "#BFEFFF",
              fontSize: 12,
              fontWeight: "normal",
              fontStyle: "normal",
              fontFamily: "serif",
            },
          },
          tooltip: {
            show: true,
            backgroundColor: "rgba(3,16,31,0.92)",
            borderColor: "rgba(0,229,255,0.35)",
            borderWidth: 1,
            textStyle: {
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: "normal",
              fontStyle: "normal",
              fontFamily: "serif",
            },
            axisPointer: {
              type: "shadow",
            },
          },
          grid: {
            left: 80,
            top: 48,
            right: 60,
            bottom: 32,
          },
          xAxis: {
            show: true,
            splitLine: {
              show: true,
              lineStyle: {
                color: "rgba(0,229,255,0.12)",
                type: "dashed",
              },
            },
          },
          yAxis: {
            axisLabel: {
              show: true,
              color: "#BFEFFF",
              fontSize: 12,
            },
            splitLine: {
              show: false,
            },
          },
          series: [
            {
              barWidth: 12,
              itemStyle: {
                color: "#00E5FF",
                borderRadius: 6,
              },
              backgroundStyle: {
                color: "rgba(0,229,255,0.12)",
                borderRadius: 6,
              },
              label: {
                show: true,
                position: "right",
                color: "#FFFFFF",
                fontSize: 12,
                formatter: "{c}%",
              },
            },
          ],
        },
      },
    },
  ],
};
