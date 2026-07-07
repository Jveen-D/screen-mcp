import type { JsonObject } from "../../types/component.js";

export const barChartCapability: JsonObject = {
  componentName: "BarChart",
  displayName: "柱状图",
  description:
    "用于展示分类数据对比的 ECharts 柱状图组件，支持多系列并列、柱宽、圆角、间距和标签样式配置。",
  aiRole:
    "AI 负责生成组件布局、视觉表达和可选的 chartData.constant.data 语义数据；MCP 会补齐完整 props 与有效 chartData。柱状图的数据是分类对比，不是占比，不要混淆饼图的环形和占比概念。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "BarChart",
      description: "组件类型，必须固定为 BarChart。",
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
      path: "option.grid",
      type: "object",
      description:
        "图表网格边距配置，控制柱状区域与容器边界的距离。AI 可适当调整 left/top/right/bottom 以适配标题和图例位置。",
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
            {
              path: "option.xAxis.axisLabel.fontWeight",
              type: "enum",
              values: ["normal", "bold", "bolder"],
              description: "标签字重。",
            },
            {
              path: "option.xAxis.axisLabel.fontStyle",
              type: "enum",
              values: ["normal", "italic", "oblique"],
              description: "标签字体样式。",
            },
            {
              path: "option.xAxis.axisLabel.fontFamily",
              type: "string",
              description: "标签字体。",
            },
            {
              path: "option.xAxis.axisLabel.align",
              type: "enum",
              values: ["left", "center", "right"],
              description: "标签对齐方式。",
            },
            {
              path: "option.xAxis.axisLabel.margin",
              type: "number",
              description: "标签与轴线的间距。",
            },
            {
              path: "option.xAxis.axisLabel.inside",
              type: "boolean",
              description: "标签是否朝内显示。",
            },
          ],
        },
        {
          path: "option.xAxis.axisTick",
          type: "object",
          description: "X 轴刻度样式。",
          children: [
            {
              path: "option.xAxis.axisTick.show",
              type: "boolean",
              description: "是否显示刻度。",
            },
            {
              path: "option.xAxis.axisTick.inside",
              type: "boolean",
              description: "刻度是否朝内。",
            },
            {
              path: "option.xAxis.axisTick.length",
              type: "number",
              description: "刻度长度。",
            },
            {
              path: "option.xAxis.axisTick.lineStyle.width",
              type: "number",
              description: "刻度线宽度。",
            },
            {
              path: "option.xAxis.axisTick.lineStyle.type",
              type: "enum",
              values: ["solid", "dashed", "dotted"],
              description: "刻度线类型。",
            },
            {
              path: "option.xAxis.axisTick.lineStyle.color",
              type: "color",
              description: "刻度线颜色。",
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
              path: "option.yAxis.axisLabel.align",
              type: "enum",
              values: ["left", "center", "right"],
              description: "标签对齐方式。",
            },
            {
              path: "option.yAxis.axisLabel.margin",
              type: "number",
              description: "标签与轴线的间距。",
            },
            {
              path: "option.yAxis.axisLabel.inside",
              type: "boolean",
              description: "标签是否朝内显示。",
            },
            {
              path: "option.yAxis.axisLabel.formatter",
              type: "string",
              description: "标签格式化字符串，如 '{value} 万'。",
            },
          ],
        },
        {
          path: "option.yAxis.axisTick",
          type: "object",
          description: "Y 轴刻度样式。",
          children: [
            {
              path: "option.yAxis.axisTick.show",
              type: "boolean",
              description: "是否显示刻度。",
            },
            {
              path: "option.yAxis.axisTick.inside",
              type: "boolean",
              description: "刻度是否朝内。",
            },
            {
              path: "option.yAxis.axisTick.length",
              type: "number",
              description: "刻度长度。",
            },
            {
              path: "option.yAxis.axisTick.lineStyle.width",
              type: "number",
              description: "刻度线宽度。",
            },
            {
              path: "option.yAxis.axisTick.lineStyle.type",
              type: "enum",
              values: ["solid", "dashed", "dotted"],
              description: "刻度线类型。",
            },
            {
              path: "option.yAxis.axisTick.lineStyle.color",
              type: "color",
              description: "刻度线颜色。",
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
        "柱状系列配置数组。AI 可调整柱宽、间距、圆角、标签样式等。多系列时每个系列按 option.color 下标取色。",
      children: [
        {
          path: "option.series[i].barWidth",
          type: "number",
          description: "柱宽，单位 px。默认 12。",
        },
        {
          path: "option.series[i].barGap",
          type: "number|string",
          description: "系列间距，默认 0。",
        },
        {
          path: "option.series[i].barCategoryGap",
          type: "string",
          description: "柱间间距，默认 '20%'。与 barWidth 只有一个能生效。",
        },
        {
          path: "option.series[i].showBackground",
          type: "boolean",
          description: "是否显示柱体背景。开启后会在每个分类背后显示一根背景柱。",
        },
        {
          path: "option.series[i].backgroundStyle",
          type: "object",
          description: "柱体背景样式。showBackground 为 true 时生效。",
          children: [
            {
              path: "option.series[i].backgroundStyle.color",
              type: "color",
              description: "背景柱填充色。",
            },
            {
              path: "option.series[i].backgroundStyle.borderColor",
              type: "color",
              description: "背景柱边框色。",
            },
            {
              path: "option.series[i].backgroundStyle.borderWidth",
              type: "number",
              description: "背景柱边框宽。",
            },
            {
              path: "option.series[i].backgroundStyle.borderRadius",
              type: "number",
              description: "背景柱圆角半径。",
            },
            {
              path: "option.series[i].backgroundStyle.opacity",
              type: "number",
              description: "背景柱透明度，0–1 之间。",
            },
          ],
        },
        {
          path: "option.series[i].itemStyle",
          type: "object",
          description: "柱子图形样式。",
          children: [
            {
              path: "option.series[i].itemStyle.color",
              type: "color",
              description: "柱子填充色。多系列时建议由 option.color 统一控制，单个系列可独立覆盖。",
            },
            {
              path: "option.series[i].itemStyle.borderColor",
              type: "color",
              description: "柱子边框色。",
            },
            {
              path: "option.series[i].itemStyle.borderWidth",
              type: "number",
              description: "柱子边框宽。",
            },
            {
              path: "option.series[i].itemStyle.borderRadius",
              type: "number|number[]",
              description: "柱子圆角半径，支持数字或 [左上, 右上, 右下, 左下] 数组。",
            },
            {
              path: "option.series[i].itemStyle.shadowBlur",
              type: "number",
              description: "柱子阴影模糊半径。",
            },
            {
              path: "option.series[i].itemStyle.shadowColor",
              type: "color",
              description: "柱子阴影颜色。",
            },
          ],
        },
        {
          path: "option.series[i].label",
          type: "object",
          description: "数据标签。",
          children: [
            {
              path: "option.series[i].label.show",
              type: "boolean",
              description: "是否显示数据标签。",
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
                "insideLeft",
                "insideRight",
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
              description: "标签格式化字符串，如 '{c}万'。严禁使用 \n 等转义字符。",
            },
          ],
        },
      ],
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData.sourceType",
      reason: "BarChart 当前只由 MCP 生成 constant 数据源，AI 不应切换 sourceType。",
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
      reason: "MCP 固定使用 name 作为 X 轴分类；存在多个业务 type 时会自动补 type 作为系列维度。",
    },
    {
      path: "chartData.indicator",
      reason: "MCP 固定使用 value 作为指标（Y 轴数值）。",
    },
    {
      path: "option.series[i].type",
      reason:
        "BarChart 的 series type 固定为 'bar'，MCP 会强制回写，AI 不应覆盖为其他图表类型。",
    },
    {
      path: "option.series[i].data",
      reason: "数据由 chartData 处理链生成，AI 不应直接写入 series data。",
    },
    {
      path: "option.dataset",
      reason:
        "当前渲染链路不使用 ECharts dataset 驱动 BarChart 数据，AI 写入 dataset 会被忽略并造成误导。",
    },
    {
      path: "option.title",
      reason: "当前 BarChart schema 不需要 title，MCP 会移除 AI 输入的 option.title。",
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
  ],
  mergeRules: [
    "option.series[i].type 固定为 'bar'，即使 AI 输入其他值也会被 MCP 归一化为 'bar'。",
    "option.dataset 会被 MCP 移除；柱状图数据由默认 chartData 或外部数据源替换链路提供。",
    "AI 可填写 chartData.constant.data；每条记录使用 { name, type, value }，name 为 X 轴分类，type 为业务系列名，value 为数值。",
    "当 option.series[i].name 缺失或为“数值/指标值/系列”等通用名称时，MCP 会从 chartData.constant.data[].type 推导业务系列名，避免图例和分组语义丢失。",
    "MCP 会归一化为完整有效的 constant chartData，并同步 originalData；整数 value 会保留整数精度，不额外显示 .00。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "option.xAxis.type 固定为 'category'，option.yAxis.type 固定为 'value'。",
    "option.legend.offsetX/offsetY 会被归一化为数字；未提供时默认为 0。",
  ],
  visualRules: [
    "柱状图用于展示分类数据对比，不要用于展示占比或构成关系；占比需求应使用饼图或环形图。",
    "多系列柱状图必须让 chartData.constant.data[].type 体现真实业务系列，如“销售额”“订单数”“实际值”“目标值”；不要保留“数值”作为系列语义。",
    "多系列柱状图应使用对比色区分不同系列，颜色要具备足够的可辨识性，避免色盲不友好的组合。",
    "柱状图的 legend 默认放在顶部（top: 'top'），给柱体主体留出足够的纵向空间。",
    "当分类名较长或数量较多时，应设置 xAxis.axisLabel.rotate 为 30–45 度，避免标签重叠。",
    "Y 轴网格线（splitLine）应使用低透明度虚线，保持背景干净，不要让网格线和柱体同等视觉重量。",
    "柱宽和间距要协调：barWidth 建议 8–24px；过细会看不清，过粗会显笨重。",
    "AI 应根据分类数量和画布宽度自动选择 barWidth：分类数 ≤4 且画布较宽时建议 18–24px；分类数 ≥8 时建议 8–14px。",
    "柱状图的 tooltip trigger 固定为 'axis'，鼠标 hover 时展示该分类下所有系列的数值对比。",
    "数据标签（label）不建议全部打开，数据密集时标签会严重重叠；只在关键点或数据量较少时开启。",
    "柱状图没有侧边摘要卡，也不存在中心总数文本；数据解读通过 tooltip 和底部结论完成。",
    "禁止在柱状图上添加饼图才有的装饰（如中心文本、环形内径、扇区抬升等概念）。",
    "label formatter 中严禁使用 \n、\r、\t 等转义字符，MCP 会自动清理为单个空格；需要换行时应由前端默认处理。",
    "若开启数据标签（label.show: true），必须确保 grid 边距充足：top ≥ 56（防顶部截断），right ≥ 30（防右侧贴边），bottom ≥ 38。",
    "柱子圆角（itemStyle.borderRadius）适合需要强化视觉层次的大屏；建议 2–6px，过大会影响数据可读性。",
    "itemStyle 用于自定义柱子外观，可设置填充色、边框色、圆角和阴影；柱体较宽时视觉权重会明显提升，需与间距保持协调。",
    "模块高度较小时应压缩 grid 边距：高度 < 280 时建议 top 40、bottom 28；高度 ≥ 280 时建议 top 56、bottom 40，确保柱体有足够纵向空间。",
    "底部结论文字不应紧贴底部 SVG 装饰，MCP 会自动保持安全间距；AI 无需额外调整辅助文本位置。",
    "需要圆角柱头时必须使用 option.series[i].itemStyle.borderRadius，不要使用已移除的 roundCap。",
    "背景柱（showBackground）适合需要突出数据区间的场景，backgroundStyle 应使用低透明度（opacity 0.08–0.2），避免与主柱体竞争视觉焦点。",
  ],
  examples: [
    {
      title: "柱状图配置示例",
      props: {
        componentName: "BarChart",
        logicalId: "theme_bar_chart",
        parentLogicalId: "screen_group",
        name: "分类对比图",
        style: {
          left: 80,
          top: 160,
          width: 520,
          height: 280,
          position: "absolute",
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
            icon: "",
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
              barWidth: 12,
              itemStyle: {
                borderRadius: 2,
              },
              label: {
                show: false,
              },
            },
          ],
        },
      },
    },
  ],
};
