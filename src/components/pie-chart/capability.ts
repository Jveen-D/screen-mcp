import type { JsonObject } from "../../types/component.js";

export const pieChartCapability: JsonObject = {
  componentName: "PieChart",
  displayName: "饼图",
  description:
    "用于展示分类占比、构成比例和环形占比关系的 ECharts 饼图组件。",
  aiRole:
    "AI 负责生成组件布局、视觉表达和真实 chartData.constant.data 语义数据；MCP 会补齐完整 props 与有效 chartData，但不会回退到默认“类目N/系列”演示数据。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "PieChart",
      description: "组件类型，必须固定为 PieChart。",
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
      path: "option.series[0]",
      type: "object",
      description:
        "饼图唯一系列配置。AI 不需要生成 type、data 或 dataset，MCP 会按下标深合并默认配置。",
      children: [
        {
          path: "option.series[0].radius",
          type: "[string,string]",
          description:
            "内外半径，格式为 [innerRadius, outerRadius]，通常使用百分比字符串。innerRadius 为 '0%' 时是实心饼图，非 0 时是环形图；外部 label、底部 legend 或侧边摘要拥挤时，应适当减小 outerRadius，例如 ['36%', '54%']。",
        },
        {
          path: "option.series[0].center",
          type: "[string,string]",
          description:
            "圆心位置，格式为 [x, y]，通常使用相对图表容器的百分比字符串，例如 ['50%', '50%']。底部 legend 与外部 label 挤压时，可把 y 调整到 '42%' 到 '46%'，让饼图主体上移。",
        },
        {
          path: "option.series[0].itemStyle",
          type: "object",
          description: "扇区描边和阴影样式。",
        },
        {
          path: "option.series[0].label",
          type: "object",
          description: "扇区标签样式。标签宽度和截断由图表组件根据容器宽高自动处理。",
          formatterRules: {
            path: "option.series[0].label.formatter",
            setter: "StringSetter",
            defaultValue: "{c}",
            description: "标签显示模板，只能使用图表支持的字符串模板 token。",
            tokens: [
              {
                token: "{a}",
                meaning: "系列名",
              },
              {
                token: "{b}",
                meaning: "数据名",
              },
              {
                token: "{c}",
                meaning: "数据值",
              },
              {
                token: "{@xxx}",
                meaning:
                  "数据中名为 xxx 的维度的值，例如 {@product} 表示名为 product 的维度值。",
              },
              {
                token: "{@[n]}",
                meaning:
                  "数据中第 n 个维度的值，例如 {@[3]} 表示维度 3 的值，从 0 开始计数。",
              },
              {
                token: "\\n",
                meaning:
                  "换行符，用于把标签拆成多行显示，例如 {b}\\n{c}。",
              },
            ],
            examples: ["{c}", "{b}: {c}", "{b}\\n{c}", "{b}: {@value}"],
          },
        },
        {
          path: "option.series[0].labelLine",
          type: "object",
          description: "标签引导线样式。",
        },
      ],
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData.sourceType",
      reason: "PieChart 当前只由 MCP 生成 constant 数据源，AI 不应切换 sourceType。",
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
      reason: "MCP 固定使用 name 作为饼图维度。",
    },
    {
      path: "chartData.indicator",
      reason: "MCP 固定使用 value 作为饼图指标。",
    },
    {
      path: "option.series[0].type",
      reason:
        "PieChart 的 series type 固定为 'pie'，MCP 会强制回写，AI 不应覆盖为其他图表类型。",
    },
    {
      path: "option.series[0].data",
      reason: "数据由 chartData 处理链生成，AI 不应直接写入 series data。",
    },
    {
      path: "option.dataset",
      reason:
        "当前渲染链路不使用 ECharts dataset 驱动 PieChart 数据，AI 写入 dataset 会被忽略并造成误导。",
    },
    {
      path: "option.title",
      reason: "当前 PieChart schema 不需要 title，MCP 会移除 AI 输入的 option.title。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "option.series[0].type 固定为 'pie'，即使 AI 输入其他值也会被 MCP 归一化为 'pie'。",
    "option.dataset 会被 MCP 移除；饼图数据由 AI 提供的 chartData.constant.data 或外部数据源替换链路提供。",
    "AI 必须填写真实 chartData.constant.data；MCP 会归一化为完整有效的 constant chartData，并同步 originalData。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "option.series[0] 只写 radius 时，会保留默认 type、label、itemStyle。",
    "option.legend.offsetX/offsetY 会被归一化为数字；未提供时默认为 0。",
    "option.series[0].center 与 option.series[0].radius 会被归一化为两个字符串值；未提供时使用默认圆心和半径。",
  ],
  visualRules: [
    "根据语义选择饼图形态：等级、状态分布这类强调分类块面的主题可用实心饼图；分类占比、构成分析这类适合中心摘要的主题可用环形图；不要所有主题都套用同一种形态。",
    "色彩要服务主题：等级、状态类可以使用同一色系的明暗层级；类别、分类、品类类可以使用主色、辅色、强调色和低饱和补色组合；避免直接使用 ECharts 默认杂色感。",
    "扇区分割线要和视觉风格匹配：强科技面板可用更明显的发光或高亮分割；轻量信息面板应使用克制描边，避免边框抢占主体。",
    "外部 label 应形成统一标注系统：字号、字重、颜色、连接线长度要成组设计，而不是只把默认标签打开。",
    "当模块里已经有侧边信息卡、摘要卡或明细卡时，饼图 label 应承担定位和识别功能，优先显示名称和值；占比、解释性文字和优先级说明交给信息卡，避免同一信息在主图和卡片中同等强度重复。",
    "label 文本被图表组件按容器宽高截断是可接受现象；MCP 重点避免 label、labelLine、legend 三者明显重叠，不应为未知长文本无限扩大标签区域。",
    "labelLine 应像标注系统的一部分：连接线角度、长度、颜色和标签位置应协调；不要让多条引线随机散开或穿过图形主体。",
    "legend 默认必须保留，除非用户明确要求隐藏。动态数据下 legend 承担完整分类展示和点击切换能力，右侧摘要卡不能替代 legend。",
    "legend 的位置要承担结构功能：放在标题下方时用于承接标题和图表；放在底部时必须和图表主体、外部 label、底部装饰留出足够距离；放在侧边时要给主图留出足够空间。",
    "legend 不得以横向布局放在图表中心高度；top: 'center' 只适合 left/right 侧边纵向 legend。若 legend 是 horizontal 或未显式 orient，应放在 top/bottom 安全区。",
    "处理饼图挤压时优先联动三类能力：legend.offsetX/offsetY 微调图例、series[0].center 调整圆心、series[0].radius 调整内外半径。不要只依赖扩大组件、隐藏 legend、关闭 label 或限制数据项个数。",
    "底部 legend + 外部 label 的典型策略：先按组件 width、数据项数量、分类名长度、legend.itemGap 估算 legend 是否会换行；如果会换行，应降低 itemGap 和字号、让 legend.offsetY 更负、把 series[0].centerY 上移到约 '36%' 到 '42%'，并把 outerRadius 收到约 '46%' 到 '54%'。",
    "环形图如果中心空洞明显，应考虑由模块层放置中心摘要、总数或核心指标；如果没有中心信息，避免空洞成为无意义留白。",
  ],
  examples: [
    {
      title: "主题化饼图配置示例",
      props: {
        componentName: "PieChart",
        logicalId: "theme_pie_chart",
        parentLogicalId: "screen_group",
        name: "主题化占比图",
        chartData: {
          constant: {
            data: [
              { name: "分类A", type: "分类", value: 128 },
              { name: "分类B", type: "分类", value: 96 },
              { name: "分类C", type: "分类", value: 76 },
              { name: "分类D", type: "分类", value: 54 },
            ],
          },
        },
        style: {
          left: 80,
          top: 160,
          width: 420,
          height: 280,
          position: "absolute",
        },
        option: {
          backgroundColor: "transparent",
          color: ["#00E5FF", "#7C4DFF", "#FFB300", "#00C853"],
          legend: {
            show: true,
            left: "center",
            top: "bottom",
            offsetX: 0,
            offsetY: -6,
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
            backgroundColor: "rgba(8,18,38,0.92)",
            textStyle: {
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: "normal",
              fontStyle: "normal",
              fontFamily: "serif",
            },
          },
          series: [
            {
              radius: ["36%", "56%"],
              center: ["50%", "43%"],
              itemStyle: {
                borderWidth: 2,
                borderColor: "#07182F",
                borderType: "solid",
                shadowBlur: 8,
                shadowColor: "rgba(0,229,255,0.35)",
              },
              label: {
                show: true,
                formatter: "{b}: {c}",
                position: "outside",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: "bold",
                fontStyle: "normal",
                fontFamily: "serif",
              },
              labelLine: {
                show: true,
                length: 18,
                length2: 32,
              },
            },
          ],
        },
      },
    },
  ],
};
