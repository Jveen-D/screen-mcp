import type { JsonObject } from "../../types/component.js";

export const lineChartCapability: JsonObject = {
  componentName: "LineChart",
  displayName: "折线图",
  description:
    "用于展示数据随分类或时间变化趋势的 ECharts 折线图组件，支持平滑曲线、面积图、多系列对比。",
  aiRole:
    "AI 负责生成组件布局、视觉表达和可选的 chartData.constant.data 语义数据；MCP 会补齐完整 props 与有效 chartData。折线图的数据是分类/时间序列，不是占比，不要混淆饼图的环形和占比概念。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "LineChart",
      description: "组件类型，必须固定为 LineChart。",
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
        "图表网格边距配置，控制折线区域与容器边界的距离。AI 可适当调整 left/top/right/bottom 以适配标题和图例位置。",
      children: [
        {
          path: "option.grid.left",
          type: "number",
          defaultValue: 16,
          description: "左侧内边距，单位 px，默认 16。",
        },
        {
          path: "option.grid.top",
          type: "number",
          defaultValue: 40,
          description: "顶部内边距，单位 px，默认 40。",
        },
        {
          path: "option.grid.right",
          type: "number",
          defaultValue: 16,
          description: "右侧内边距，单位 px，默认 16。",
        },
        {
          path: "option.grid.bottom",
          type: "number",
          defaultValue: 16,
          description: "底部内边距，单位 px，默认 16。",
        },
        {
          path: "option.grid.containLabel",
          type: "boolean",
          defaultValue: true,
          description: "是否把坐标轴标签包含在网格区域内，默认开启以避免长标签被裁切。",
        },
      ],
    },
    {
      path: "option.tooltip",
      type: "object",
      description: "提示框与坐标轴指示器配置。",
      children: [
        {
          path: "option.tooltip.trigger",
          type: "enum",
          values: ["axis", "item", "none"],
          defaultValue: "axis",
          description: "提示框触发方式。趋势对比通常使用 axis。",
        },
        {
          path: "option.tooltip.axisPointer.type",
          type: "enum",
          values: ["line", "shadow", "cross", "none"],
          defaultValue: "line",
          description: "坐标轴指示器类型。",
        },
        {
          path: "option.tooltip.axisPointer.snap",
          type: "boolean",
          defaultValue: true,
          description: "指示器是否吸附到最近的数据点。",
        },
        {
          path: "option.tooltip.confine",
          type: "boolean",
          defaultValue: true,
          description: "是否把提示框限制在图表容器内。",
        },
        {
          path: "option.tooltip.formatter",
          type: "string",
          description:
            "tooltip 内容格式化字符串，支持 {b}（类目名）、{c}（数值）、{a}（系列名）和 <br/> 换行；真实换行及字面量 \\n 会统一规范化为 <br/>。",
        },
      ],
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
          path: "option.xAxis.boundaryGap",
          type: "boolean",
          defaultValue: false,
          description: "分类轴两侧是否留白。默认关闭，使折线从首个分类位置开始。",
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
              path: "option.xAxis.axisLabel.hideOverlap",
              type: "boolean",
              defaultValue: true,
              description: "是否自动隐藏重叠标签。",
            },
            {
              path: "option.xAxis.axisLabel.overflow",
              type: "enum",
              values: ["truncate", "break", "breakAll", "none"],
              defaultValue: "truncate",
              description: "标签超出最大宽度时的处理方式。",
            },
            {
              path: "option.xAxis.axisLabel.width",
              type: "number",
              min: 16,
              max: 400,
              defaultValue: 72,
              description: "标签最大宽度，单位 px。",
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
          path: "option.yAxis.scale",
          type: "boolean",
          defaultValue: false,
          description: "是否允许数值轴不强制包含零。默认关闭以保留基线语义。",
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
      path: "option.legend",
      type: "object",
      description: "图例排列与项目间距配置。",
      children: [
        {
          path: "option.legend.type",
          type: "enum",
          values: ["scroll", "plain"],
          defaultValue: "scroll",
          description: "图例较多时使用滚动翻页，默认 scroll。",
        },
        {
          path: "option.legend.itemGap",
          type: "number",
          min: 0,
          max: 64,
          defaultValue: 16,
          description: "图例项目间距，单位 px。",
        },
      ],
    },
    {
      path: "option.series",
      type: "array<object>",
      description:
        "折线系列配置数组。AI 可调整线宽、是否平滑、是否面积图、标签样式等。多系列时每个系列按 option.color 下标取色。",
      children: [
        {
          path: "option.series[i].lineStyle",
          type: "object",
          description: "折线样式。",
          children: [
            {
              path: "option.series[i].lineStyle.width",
              type: "number",
              description: "线宽，单位 px。默认 2。",
            },
            {
              path: "option.series[i].lineStyle.type",
              type: "enum",
              values: ["solid", "dashed", "dotted"],
              defaultValue: "solid",
              description: "折线线型。",
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
          type: "object",
          description: "面积图样式配置。传入空对象 {} 开启默认填充，或传入 { color: 渐变对象 } 自定义渐变。",
          children: [
            {
              path: "option.series[i].areaStyle.color",
              type: "object|string",
              description: "填充颜色，支持纯色字符串或 ECharts 渐变对象（如 linear gradient）。",
            },
            {
              path: "option.series[i].areaStyle.opacity",
              type: "number",
              min: 0,
              max: 1,
              defaultValue: 1,
              description: "面积填充透明度。",
            },
          ],
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
          path: "option.series[i].showSymbol",
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
        {
          path: "option.series[i].symbolSize",
          type: "number",
          min: 1,
          max: 32,
          defaultValue: 8,
          description: "标记大小，单位 px。关闭 showSymbol 时运行时隐藏标记。",
        },
        {
          path: "option.series[i].markPoint",
          type: "object",
          description: "标记点配置，用于标注最大值、最小值等特殊数据点。支持 symbol、symbolSize、label、itemStyle、data 等子属性。",
        },
        {
          path: "option.series[i].markLine",
          type: "object",
          description: "标记线配置，用于标注平均值、阈值线等。支持 silent、lineStyle、label、data 等子属性。",
        },
        {
          path: "option.series[i].connectNulls",
          type: "boolean",
          defaultValue: false,
          description:
            "跨空值连线：仅控制是否跨过 null、undefined、NaN 数据缺口绘制连续折线；不删除、填补、排序或修改源数据。默认关闭。",
        },
        {
          path: "option.series[i].sampling",
          type: "enum",
          values: ["none", "lttb", "average", "min", "max", "minmax", "sum"],
          defaultValue: "none",
          description:
            "大数据采样：仅影响数据量较大时的显示抽样，不修改源数据数组或点击事件返回的原始值。none 不采样；lttb 保留整体趋势和关键转折；average、min、max、sum 分别取分桶平均、最小、最大、求和；minmax 保留分桶最小值和最大值。",
        },
        {
          path: "option.series[i].step",
          type: "enum|boolean",
          values: [false, "start", "middle", "end"],
          defaultValue: false,
          description: "阶梯线模式；false 为普通折线。",
        },
      ],
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData.sourceType",
      reason: "LineChart 当前只由 MCP 生成 constant 数据源，AI 不应切换 sourceType。",
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
        "LineChart 的 series type 固定为 'line'，MCP 会强制回写，AI 不应覆盖为其他图表类型。",
    },
    {
      path: "option.series[i].data",
      reason: "数据由 chartData 处理链生成，AI 不应直接写入 series data。",
    },
    {
      path: "option.dataset",
      reason:
        "当前渲染链路不使用 ECharts dataset 驱动 LineChart 数据，AI 写入 dataset 会被忽略并造成误导。",
    },
    {
      path: "option.title",
      reason: "当前 LineChart schema 不需要 title，MCP 会移除 AI 输入的 option.title。",
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
    "option.series[i].type 固定为 'line'，即使 AI 输入其他值也会被 MCP 归一化为 'line'。",
    "option.dataset 会被 MCP 移除；折线图数据由默认 chartData 或外部数据源替换链路提供。",
    "AI 可填写 chartData.constant.data；每条记录使用 { name, type, value }，name 为 X 轴分类，type 为业务系列名，value 为数值。",
    "当 option.series[i].name 缺失或为“数值/指标值/系列”等通用名称时，MCP 会从 chartData.constant.data[].type 推导业务系列名，避免图例和分组语义丢失。",
    "MCP 会归一化为完整有效的 constant chartData，并同步 originalData；整数 value 会保留整数精度，不额外显示 .00。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "option.xAxis.type 固定为 'category'，option.yAxis.type 固定为 'value'。",
    "新增布局、标签密度、提示框、图例和系列行为字段会按 capability 声明的枚举与范围归一化。",
    "若提供 option.legend.offsetX/offsetY，MCP 会将其归一化为数字；未提供时不写入额外内部字段。",
  ],
  visualRules: [
    "折线图用于展示趋势变化，不要用于展示占比或构成关系；占比需求应使用饼图或环形图。",
    "多系列折线图必须让 chartData.constant.data[].type 体现真实业务系列，如“销售额”“目标额”“实际值”“预测值”；不要保留“数值”作为系列语义。",
    "多系列折线图应使用对比色区分不同系列，颜色要具备足够的可辨识性，避免色盲不友好的组合。",
    "折线图的 legend 默认放在顶部（top: 'top'），给折线主体留出足够的纵向空间。",
    "当分类名较长或数量较多时，应设置 xAxis.axisLabel.rotate 为 30–45 度，避免标签重叠。",
    "Y 轴网格线（splitLine）应使用低透明度虚线，保持背景干净，不要让网格线和折线同等视觉重量。",
    "折线宽度和数据点大小要协调：线宽 2–4px，symbolSize 4–8px；过细会看不清，过粗会显笨重。",
    "平滑曲线（smooth: true）适合展示宏观趋势，折线（smooth: false）适合展示精确拐点。根据数据语义选择。",
    "面积图（areaStyle）适合强调累积量或总量趋势，但不要所有系列都开面积图，多系列时只开主系列即可。",
    "趋势对比通常使用 tooltip trigger='axis'；只有明确需要单点提示或关闭提示时再使用 item/none。",
    "数据点标签（label）不建议全部打开，数据密集时标签会严重重叠；只在关键点或数据量较少时开启。",
    "折线图没有侧边摘要卡，也不存在中心总数文本；数据解读通过 tooltip 和底部结论完成。",
    "禁止在折线图上添加饼图才有的装饰（如中心文本、环形内径、扇区抬升等概念）。",
    "label formatter、markPoint label formatter 中严禁使用 \\n、\\r、\\t 等转义字符，MCP 会自动清理为单个空格；需要换行时应由前端默认处理。",
    "若开启数据点标签（label.show: true），必须确保 grid 边距充足：top ≥ 56（防顶部截断），right ≥ 30（防右侧贴边），bottom ≥ 38。",
    "markPoint 用于标记极值时，label 应保持极简，避免复杂 formatter；优先使用默认样式或仅设置 color/fontSize。",
    "markLine 适合标注平均值或阈值参考线，使用低对比度虚线（如 rgba(250,204,21,0.38)），避免与主折线视觉冲突。",
    "发光效果（lineStyle.shadowBlur + shadowColor）适合需要强化视觉层次的大屏；shadowBlur 建议 8–16，shadowColor 使用线条同色半透明。",
    "itemStyle 用于自定义数据点外观，可设置填充色、边框色和阴影；当 symbolSize 较大时，itemStyle 的视觉权重会明显提升，需与线宽保持协调。",
    "areaStyle.color 支持线性渐变对象（type: 'linear', colorStops），用于创造从上到下渐隐的面积填充效果，增强趋势感知。",
  ],
  examples: [
    {
      title: "折线图配置示例",
      props: {
        componentName: "LineChart",
        logicalId: "theme_line_chart",
        parentLogicalId: "screen_group",
        name: "指标趋势图",
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
              showSymbol: false,
            },
          ],
        },
      },
    },
  ],
};
