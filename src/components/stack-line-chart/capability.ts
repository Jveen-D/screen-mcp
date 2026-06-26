import type { JsonObject } from "../../types/component.js";

export const stackLineChartCapability: JsonObject = {
  componentName: "StackLineChart",
  displayName: "堆叠折线图",
  description:
    "用于展示多系列累计趋势变化的 ECharts 堆叠折线图组件，所有系列强制堆叠，支持平滑曲线、面积图、标签样式配置。",
  aiRole:
    "AI 负责生成组件布局、视觉表达和可选的 chartData.constant.data 语义数据；MCP 会补齐完整 props 与有效 chartData。堆叠折线图的数据是分类/时间序列，type 字段作为系列名，强调多系列在同一分类下的累计趋势，不要混淆饼图的环形和占比概念。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "StackLineChart",
      description: "组件类型，必须固定为 StackLineChart。",
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
      description:
        "父级组件或分组 ID，由 AI 生成，用于编辑器大纲树分组关系。",
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
      path: "chartData.indicator[0].fieldDataConfig.chartDisplayName",
      type: "string",
      description:
        "指标在图例、tooltip 中显示的名称，必须根据业务语义设置（如“数量”“指标值”），不能保留默认值“value”。",
    },
    {
      path: "option.grid",
      type: "object",
      description:
        "图表网格边距配置，控制堆叠折线区域与容器边界的距离。AI 可适当调整 left/top/right/bottom 以适配标题和图例位置。",
      children: [
        {
          path: "option.grid.left",
          type: "number",
          description: "左侧边距，单位 px。",
        },
        {
          path: "option.grid.top",
          type: "number",
          description: "顶部边距，单位 px。",
        },
        {
          path: "option.grid.right",
          type: "number",
          description: "右侧边距，单位 px。",
        },
        {
          path: "option.grid.bottom",
          type: "number",
          description: "底部边距，单位 px。",
        },
      ],
    },
    {
      path: "option.tooltip.formatter",
      type: "string",
      description: "tooltip 内容格式化字符串，支持 {b}（类目名）、{c}（数值）、{a}（系列名）及 <br/> 换行。",
    },
    {
      path: "option.xAxis",
      type: "object",
      description:
        "X 轴配置。type 固定为 category，由 MCP 自动设置。AI 可调整 axisLabel 颜色、旋转角度和 show。",
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
          path: "option.xAxis.axisLabel",
          type: "object",
          description: "X 轴标签样式。",
          children: [
            {
              path: "option.xAxis.axisLabel.show",
              type: "boolean",
              description: "是否显示 X 轴标签。",
            },
            {
              path: "option.xAxis.axisLabel.rotate",
              type: "number",
              description: "标签旋转角度。分类名较长时可设置 30–45 度避免重叠。",
            },
            {
              path: "option.xAxis.axisLabel.color",
              type: "color",
              description: "标签颜色。",
            },
            {
              path: "option.xAxis.axisLabel.fontSize",
              type: "number",
              description: "标签字号。",
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
              description: "是否显示 X 轴线。",
            },
            {
              path: "option.xAxis.axisLine.lineStyle.color",
              type: "color",
              description: "轴线颜色。",
            },
          ],
        },
        {
          path: "option.xAxis.splitLine",
          type: "object",
          description: "X 轴分割线。",
          children: [
            {
              path: "option.xAxis.splitLine.show",
              type: "boolean",
              description: "是否显示 X 轴分割线。通常保持 false。",
            },
          ],
        },
        {
          path: "option.xAxis.data",
          type: "array<string>",
          description: "X 轴分类数据数组。若未提供，默认从 chartData.constant.data 的 name 字段提取。",
        },
      ],
    },
    {
      path: "option.yAxis",
      type: "object",
      description:
        "Y 轴配置。type 固定为 value，由 MCP 自动设置。AI 可调整 axisLabel 颜色、splitLine 样式。",
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
          description: "Y 轴标签样式。",
          children: [
            {
              path: "option.yAxis.axisLabel.show",
              type: "boolean",
              description: "是否显示 Y 轴标签。",
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
          ],
        },
        {
          path: "option.yAxis.splitLine",
          type: "object",
          description: "Y 轴网格分割线。",
          children: [
            {
              path: "option.yAxis.splitLine.show",
              type: "boolean",
              description: "是否显示 Y 轴网格线。",
            },
            {
              path: "option.yAxis.splitLine.lineStyle.color",
              type: "color",
              description: "网格线颜色。",
            },
            {
              path: "option.yAxis.splitLine.lineStyle.type",
              type: "enum",
              values: ["solid", "dashed", "dotted"],
              description: "网格线类型。",
            },
          ],
        },
        {
          path: "option.yAxis.min",
          type: "number",
          description: "Y 轴最小值，用于固定刻度范围。",
        },
        {
          path: "option.yAxis.max",
          type: "number",
          description: "Y 轴最大值，用于固定刻度范围。",
        },
        {
          path: "option.yAxis.nameTextStyle",
          type: "object",
          description: "Y 轴名称样式，包含 color、fontSize、padding 等。",
        },
      ],
    },
    {
      path: "option.series",
      type: "array<object>",
      description:
        "堆叠折线系列配置数组。AI 可调整线宽、是否平滑、是否面积图、标签样式等；所有系列由 MCP 强制堆叠。多系列时每个系列按 option.color 下标取色，type 字段作为系列名。",
      children: [
        {
          path: "option.series[i].lineStyle",
          type: "object",
          description: "折线样式。",
          children: [
            {
              path: "option.series[i].lineStyle.width",
              type: "number",
              description: "线宽，单位 px。默认 3。",
            },
            {
              path: "option.series[i].lineStyle.color",
              type: "color",
              description: "线条颜色。多系列时建议由 option.color 统一控制，单个系列可独立覆盖。",
            },
            {
              path: "option.series[i].lineStyle.shadowBlur",
              type: "number",
              description: "折线阴影模糊半径，用于发光效果。",
            },
            {
              path: "option.series[i].lineStyle.shadowColor",
              type: "color",
              description: "折线阴影颜色，用于发光效果。",
            },
          ],
        },
        {
          path: "option.series[i].smooth",
          type: "boolean",
          description: "是否使用平滑曲线。true 为平滑曲线，false 为折线。",
        },
        {
          path: "option.series[i].areaStyle",
          type: "boolean",
          description: "是否开启面积图填充。true 时前端会自动转换为渐变面积样式，false 时关闭填充。",
        },
        {
          path: "option.series[i].itemStyle",
          type: "object",
          description: "数据点图形样式。",
          children: [
            {
              path: "option.series[i].itemStyle.color",
              type: "color",
              description: "数据点填充色。",
            },
            {
              path: "option.series[i].itemStyle.borderColor",
              type: "color",
              description: "数据点边框色。",
            },
            {
              path: "option.series[i].itemStyle.borderWidth",
              type: "number",
              description: "数据点边框宽。",
            },
            {
              path: "option.series[i].itemStyle.shadowBlur",
              type: "number",
              description: "数据点阴影模糊半径。",
            },
            {
              path: "option.series[i].itemStyle.shadowColor",
              type: "color",
              description: "数据点阴影颜色。",
            },
          ],
        },
        {
          path: "option.series[i].label",
          type: "object",
          description: "数据点标签。",
          children: [
            {
              path: "option.series[i].label.show",
              type: "boolean",
              description: "是否显示数据点标签。",
            },
            {
              path: "option.series[i].label.position",
              type: "enum",
              values: [
                "top",
                "left",
                "right",
                "bottom",
                "inside",
                "insideTop",
                "insideBottom",
              ],
              description: "标签位置。",
            },
            {
              path: "option.series[i].label.color",
              type: "color",
              description: "标签颜色。",
            },
            {
              path: "option.series[i].label.fontSize",
              type: "number",
              description: "标签字号。",
            },
            {
              path: "option.series[i].label.formatter",
              type: "string",
              description: "标签格式化字符串，如 '{c}万'。严禁使用 \\n 等转义字符。",
            },
          ],
        },
        {
          path: "option.series[i].showSymbol.show",
          type: "boolean",
          description: "是否显示数据点标记。false 时隐藏所有 symbol。",
        },
        {
          path: "option.series[i].symbol",
          type: "enum",
          values: [
            "emptyCircle",
            "circle",
            "rect",
            "roundRect",
            "triangle",
            "diamond",
            "arrow",
          ],
          description: "标记样式。",
        },
      ],
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData.sourceType",
      reason: "StackLineChart 当前只由 MCP 生成 constant 数据源，AI 不应切换 sourceType。",
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
      reason: "MCP 固定使用 name 和 type 作为维度（name 为 X 轴分类，type 为系列名）。",
    },
    {
      path: "option.series[i].type",
      reason:
        "StackLineChart 的 series type 固定为 'line'，MCP 会强制回写，AI 不应覆盖为其他图表类型。",
    },
    {
      path: "option.series[i].stack",
      reason:
        "StackLineChart 的 series stack 固定为 '__stackLine'，MCP 会强制回写以保证所有系列堆叠。",
    },
    {
      path: "option.series[i].symbolSize",
      reason: "StackLineChart 当前不支持 symbolSize setter，AI 不应写入。",
    },
    {
      path: "option.series[i].markPoint",
      reason: "StackLineChart 当前不支持 markPoint setter，AI 不应写入。",
    },
    {
      path: "option.series[i].markLine",
      reason: "StackLineChart 当前不支持 markLine setter，AI 不应写入。",
    },
    {
      path: "option.series[i].data",
      reason: "数据由 chartData 处理链生成，AI 不应直接写入 series data。",
    },
    {
      path: "option.dataset",
      reason:
        "当前渲染链路不使用 ECharts dataset 驱动 StackLineChart 数据，AI 写入 dataset 会被忽略并造成误导。",
    },
    {
      path: "option.title",
      reason: "当前 StackLineChart schema 不需要 title，MCP 会移除 AI 输入的 option.title。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
    {
      path: "option.xAxis.type",
      reason: "X 轴 type 固定为 category，由 MCP 自动设置。",
    },
    {
      path: "option.yAxis.type",
      reason: "Y 轴 type 固定为 value，由 MCP 自动设置。",
    },
    {
      path: "option.dataZoom",
      reason: "StackLineChart 当前不支持 dataZoom，AI 不应写入。",
    },
    {
      path: "option.brush",
      reason: "StackLineChart 当前不支持 brush，AI 不应写入。",
    },
  ],
  mergeRules: [
    "option.series[i].type 固定为 'line'，即使 AI 输入其他值也会被 MCP 归一化为 'line'。",
    "option.series[i].stack 固定为 '__stackLine'，即使 AI 输入其他值也会被 MCP 归一化为 '__stackLine'。",
    "option.dataset 会被 MCP 移除；堆叠折线图数据由默认 chartData 或外部数据源替换链路提供。",
    "AI 可填写 chartData.constant.data；MCP 会归一化为完整有效的 constant chartData，并同步 originalData。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "option.xAxis.type 固定为 'category'，option.yAxis.type 固定为 'value'。",
    "option.legend.offsetX/offsetY 会被归一化为数字；未提供时默认为 0。",
  ],
  visualRules: [
    "堆叠折线图用于展示多系列累计趋势变化，不要用于展示占比或构成关系；占比需求应使用饼图或环形图。",
    "chartData.dimension 必须包含 name 和 type 两个维度：name 作为 X 轴分类，type 作为系列名。",
    "chartData.constant.data 每条记录必须包含 { name, type, value }，其中 type 字段作为系列名，用于将多条折线分组堆叠。",
    "时间维度 name 应使用具体月份/季度（如“1月”“2月”“Q1”），禁止生成“最近六个月”“年”等无法作为分类轴的聚合字段。",
    "AI 必须根据指标业务含义设置 chartData.indicator[0].fieldDataConfig.chartDisplayName（如“数量”“指标值”），不能保留默认值“value”；该名称会显示在图例中。",
    "多系列堆叠折线图应使用对比色区分不同系列，颜色要具备足够的可辨识性，避免色盲不友好的组合。",
    "堆叠折线图的 legend 默认放在顶部（top: 'top'），给折线主体留出足够的纵向空间。",
    "当分类名较长或数量较多时，应设置 xAxis.axisLabel.rotate 为 30–45 度，避免标签重叠。",
    "Y 轴网格线（splitLine）应使用低透明度虚线，保持背景干净，不要让网格线和折线同等视觉重量。",
    "折线宽度要协调：线宽 2–4px；过细会看不清，过粗会显笨重。",
    "平滑曲线（smooth: true）适合展示宏观趋势，折线（smooth: false）适合展示精确拐点。根据数据语义选择。",
    "面积图（areaStyle: true）适合强调累积量或总量趋势，但不要所有系列都开面积图，多系列时只开主系列即可。",
    "堆叠折线图的 tooltip trigger 固定为 'axis'，鼠标 hover 时展示该分类下所有系列的累计数值对比。",
    "数据点标签（label）不建议全部打开，数据密集时标签会严重重叠；只在关键点或数据量较少时开启。",
    "堆叠折线图没有侧边摘要卡，也不存在中心总数文本；数据解读通过 tooltip 和底部结论完成。",
    "禁止在堆叠折线图上添加饼图才有的装饰（如中心文本、环形内径、扇区抬升等概念）。",
    "label formatter 中严禁使用 \\n、\\r、\\t 等转义字符，MCP 会自动清理为单个空格；需要换行时应由前端默认处理。",
    "若开启数据点标签（label.show: true），必须确保 grid 边距充足：top ≥ 56（防顶部截断），right ≥ 30（防右侧贴边），bottom ≥ 38。",
    "发光效果（lineStyle.shadowBlur + shadowColor）适合需要强化视觉层次的大屏；shadowBlur 建议 8–16，shadowColor 使用线条同色半透明。",
    "itemStyle 用于自定义数据点外观，可设置填充色、边框色和阴影；需与线宽保持协调。",
  ],
  examples: [
    {
      title: "堆叠折线图配置示例",
      props: {
        componentName: "StackLineChart",
        logicalId: "theme_stack_line_chart",
        parentLogicalId: "screen_group",
        name: "累计趋势图",
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
                chartDisplayName: "月份",
              },
              fieldName: "name",
              fieldDisplayName: "月份",
              fieldType: "LONGTEXT",
            },
            {
              fieldDataConfig: {
                calculateType: "COUNT",
                chartDisplayName: "分类",
              },
              fieldName: "type",
              fieldDisplayName: "分类",
              fieldType: "LONGTEXT",
            },
          ],
          indicator: [
            {
              fieldDataConfig: {
                calculateType: "SUM",
                chartDisplayName: "数量",
              },
              fieldName: "value",
              fieldDisplayName: "数量",
              fieldType: "DECIMAL",
            },
          ],
          constant: {
            data: [
              { name: "1月", type: "分类A", value: 120 },
              { name: "1月", type: "分类B", value: 80 },
              { name: "2月", type: "分类A", value: 132 },
              { name: "2月", type: "分类B", value: 98 },
              { name: "3月", type: "分类A", value: 101 },
              { name: "3月", type: "分类B", value: 142 },
              { name: "4月", type: "分类A", value: 134 },
              { name: "4月", type: "分类B", value: 90 },
            ],
            originalData: [
              { name: "1月", type: "分类A", value: 120 },
              { name: "1月", type: "分类B", value: 80 },
              { name: "2月", type: "分类A", value: 132 },
              { name: "2月", type: "分类B", value: 98 },
              { name: "3月", type: "分类A", value: 101 },
              { name: "3月", type: "分类B", value: 142 },
              { name: "4月", type: "分类A", value: 134 },
              { name: "4月", type: "分类B", value: 90 },
            ],
            fieldList: [
              { fieldName: "name", fieldDisplayName: "月份", fieldType: "LONGTEXT" },
              { fieldName: "type", fieldDisplayName: "分类", fieldType: "LONGTEXT" },
              { fieldName: "value", fieldDisplayName: "数量", fieldType: "DECIMAL" },
            ],
          },
        },
        option: {
          backgroundColor: "transparent",
          color: ["#00E5FF", "#7C4DFF", "#FFB300"],
          legend: {
            show: true,
            left: "center",
            top: "top",
            offsetX: 0,
            offsetY: 0,
            orient: "horizontal",
            icon: "emptyCircle",
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
          },
          grid: {
            left: 40,
            top: 56,
            right: 30,
            bottom: 42,
          },
          xAxis: {
            axisLabel: {
              show: true,
              color: "#BFEFFF",
              fontSize: 12,
              rotate: 0,
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: "rgba(0,229,255,0.3)",
              },
            },
            splitLine: {
              show: false,
            },
          },
          yAxis: {
            axisLabel: {
              show: true,
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
          series: [
            {
              smooth: true,
              lineStyle: {
                width: 3,
              },
              label: {
                show: false,
              },
              showSymbol: {
                show: false,
              },
            },
          ],
        },
      },
    },
  ],
};
