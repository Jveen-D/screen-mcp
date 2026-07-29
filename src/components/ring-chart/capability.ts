import type { JsonObject } from "../../types/component.js";

export const ringChartCapability: JsonObject = {
  componentName: "RingChart",
  displayName: "环形图",
  description:
    "用于展示分类占比、构成比例的 ECharts 环形图组件，支持内环、外环装饰与环形文字。",
  aiRole:
    "AI 负责生成组件布局、视觉表达和可选的 chartData.constant.data 语义数据；MCP 会补齐完整 props 与有效 chartData。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "RingChart",
      description: "组件类型，必须固定为 RingChart。",
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
      path: "option.title",
      type: "object",
      description:
        "主图环形图的中心文字及其位置。开启外部标签时可移动中心文字，避免文字互相遮挡；开启 decorator.innerRing 时仍由主图单独渲染，装饰内环不会复制该文字。",
      children: [
        { path: "option.title.show", type: "boolean", description: "是否显示中心文字。" },
        { path: "option.title.text", type: "string", description: "中心文字内容。" },
        {
          path: "option.title.left",
          type: "string|number",
          description: "水平位置，支持 left、center、right、像素数字或百分比字符串。",
        },
        {
          path: "option.title.top",
          type: "string|number",
          description: "垂直位置，支持 top、center、bottom、像素数字或百分比字符串。",
        },
        { path: "option.title.textStyle.fontFamily", type: "string", description: "中心文字字体。" },
        { path: "option.title.textStyle.fontSize", type: "number", range: [8, 100], description: "中心文字字号。" },
        {
          path: "option.title.textStyle.fontWeight",
          type: "enum",
          values: ["normal", "bold"],
          description: "中心文字字重。",
        },
        { path: "option.title.textStyle.color", type: "color", description: "中心文字颜色。" },
      ],
    },
    {
      path: "option.tooltip",
      type: "object",
      description: "悬停提示框的显示、边框和文字样式。",
      children: [
        { path: "option.tooltip.show", type: "boolean", description: "是否显示提示框。" },
        { path: "option.tooltip.confine", type: "boolean", description: "是否把提示框限制在组件容器内。" },
        { path: "option.tooltip.backgroundColor", type: "color", description: "提示框背景色。" },
        { path: "option.tooltip.borderColor", type: "color", description: "提示框边框颜色。" },
        { path: "option.tooltip.borderWidth", type: "number", range: [0, 20], description: "提示框边框宽度。" },
        { path: "option.tooltip.textStyle", type: "object", description: "提示框文字样式。" },
      ],
    },
    {
      path: "option.legend",
      type: "object",
      description: "图例布局与文字溢出配置。",
      children: [
        { path: "option.legend.show", type: "boolean", description: "是否显示图例。" },
        { path: "option.legend.type", type: "enum", values: ["plain", "scroll"], description: "直接展示或滚动翻页。" },
        { path: "option.legend.orient", type: "enum", values: ["horizontal", "vertical"], description: "图例排列方向。" },
        { path: "option.legend.width", type: "string", description: "图例最大宽度，例如 96%。" },
        { path: "option.legend.itemWidth", type: "number", range: [0, 100], description: "图例标记宽度。" },
        { path: "option.legend.itemHeight", type: "number", range: [0, 100], description: "图例标记高度。" },
        { path: "option.legend.itemGap", type: "number", range: [0, 100], description: "图例项目间距。" },
        { path: "option.legend.selectedMode", type: "enum", values: [false, true, "single"], description: "禁用、多选或单选图例筛选。" },
        { path: "option.legend.icon", type: "string", description: "图例标记形状。" },
        { path: "option.legend.textStyle.width", type: "number", range: [0, 500], description: "图例文字最大宽度。" },
        { path: "option.legend.textStyle.overflow", type: "enum", values: ["truncate", "break", "breakAll"], description: "图例长文本处理方式。" },
      ],
    },
    {
      path: "option.series[0]",
      type: "object",
      description:
        "环形图唯一系列配置。AI 不需要生成 type、data 或 dataset，MCP 会按下标深合并默认配置。",
      children: [
        {
          path: "option.series[0].radius",
          type: "[string,string]",
          description:
            "内外半径，格式为 [innerRadius, outerRadius]，通常使用百分比字符串。环形图 innerRadius 不能为 0 或 '0%'，否则会被 MCP 修正为默认值 '30%'；外部 label、底部 legend 或装饰环拥挤时，应适当减小 outerRadius，例如 ['28%', '42%']，但不能把 outerRadius 压到让环图主体变成小圆点。",
        },
        {
          path: "option.series[0].center",
          type: "[string,string]",
          description:
            "圆心位置，格式为 [x, y]，通常使用相对图表容器的百分比字符串，例如 ['50%', '50%']。底部 legend 与外部 label 挤压时，可把 y 调整到 '42%' 到 '46%'，让环图主体上移。",
        },
        {
          path: "option.series[0].itemStyle",
          type: "object",
          description: "扇区描边和阴影样式。",
        },
        { path: "option.series[0].startAngle", type: "number", range: [0, 360], description: "起始角度。" },
        { path: "option.series[0].clockwise", type: "boolean", description: "是否顺时针排列。" },
        { path: "option.series[0].minShowLabelAngle", type: "number", range: [0, 360], description: "显示标签的最小扇区角度。" },
        { path: "option.series[0].percentPrecision", type: "number", range: [0, 10], description: "百分比小数精度。" },
        { path: "option.series[0].stillShowZeroSum", type: "boolean", description: "总和为零时是否平均展示扇区。" },
        { path: "option.series[0].showEmptyCircle", type: "boolean", description: "无有效数据时是否显示空环。" },
        { path: "option.series[0].emptyCircleStyle", type: "object", description: "空环颜色和边框样式。" },
        { path: "option.series[0].emphasis.scale", type: "boolean", description: "悬停时是否放大扇区。" },
        { path: "option.series[0].emphasis.scaleSize", type: "number", range: [0, 50], description: "悬停放大尺寸。" },
        {
          path: "option.series[0].label",
          type: "object",
          description:
            "扇区标签样式。默认隐藏并置于中心，AI 可按需开启。标签宽度和截断由图表组件根据容器宽高自动处理。",
          formatterRules: {
            path: "option.series[0].label.formatter",
            setter: "StringSetter",
            defaultValue: "{b}\n{d}%",
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
                token: "{d}",
                meaning: "占比百分比",
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
                  "换行符，用于把标签拆成多行显示，例如 {b}\\n{d}%。",
              },
            ],
            examples: ["{c}", "{b}: {c}", "{b}\\n{d}%", "{b}: {@value}"],
          },
        },
        {
          path: "option.series[0].labelLine",
          type: "object",
          description: "标签引导线样式。",
        },
        {
          path: "option.series[0].label.content",
          type: "enum",
          values: ["name", "value", "percent", "nameValue", "namePercent", "custom"],
          description: "标签内容预设；custom 时使用 formatter。",
        },
      ],
    },
    {
      path: "chartData.indicator[0].fieldDataConfig.chartDisplayName",
      type: "string",
      description:
        "指标在图例、提示框等处的业务语义显示名。AI 必须根据实际业务含义设置，如“指标值”“数量”“完成量”，不能保留默认值“value”。",
    },
    {
      path: "borderGap",
      type: "number",
      description:
        "扇区之间的间隙系数，0 表示无间隙，0.1~0.5 可产生明显分隔，数值越大间隙越宽。",
    },
    {
      path: "decorator.innerRing",
      type: "object",
      description:
        "纯装饰性的旋转内环，开启后叠加在环形图中心；它不承载或复制 option.title，中心文字始终属于主图。",
      children: [
        {
          path: "decorator.innerRing.isActive",
          type: "boolean",
          description: "是否启用内环装饰。",
        },
        {
          path: "decorator.innerRing.innerRadius",
          type: "number",
          range: [0, 0.99],
          description: "内环内半径，相对于组件的系数，例如 0.2。",
        },
        {
          path: "decorator.innerRing.outerRadius",
          type: "number",
          range: [0.01, 1],
          description: "内环外半径，相对于组件的系数，例如 0.23。",
        },
        {
          path: "decorator.innerRing.opacity",
          type: "number",
          range: [0, 1],
          description: "内环透明度，0~1。",
        },
        {
          path: "decorator.innerRing.animateSpeed",
          type: "number",
          range: [0, 1],
          description: "内环旋转速度，0~1。",
        },
        {
          path: "decorator.innerRing.animateDirection",
          type: "enum",
          values: ["clockwise", "anticlockwise"],
          description: "内环旋转方向。",
        },
      ],
    },
    {
      path: "decorator.outerRing",
      type: "object",
      description: "外环装饰，开启后会在环形图外侧叠加半透明外环。",
      children: [
        {
          path: "decorator.outerRing.isActive",
          type: "boolean",
          description: "是否启用外环装饰。",
        },
        {
          path: "decorator.outerRing.arcWidth",
          type: "number",
          range: [0.01, 0.5],
          description: "外环宽度，相对于组件的系数，例如 0.15。",
        },
        {
          path: "decorator.outerRing.opacity",
          type: "number",
          range: [0, 1],
          description: "外环透明度，0~1。",
        },
      ],
    },
    {
      path: "ringText",
      type: "object",
      description: "环形文字装饰，开启后会在环形外侧沿切向显示文字。",
      children: [
        {
          path: "ringText.isActive",
          type: "boolean",
          description: "是否启用环形文字。",
        },
        {
          path: "ringText.fontSize",
          type: "number",
          range: [8, 100],
          description: "环形文字字号。",
        },
        {
          path: "ringText.fontFamily",
          type: "string",
          description: "环形文字字体。",
        },
        {
          path: "ringText.fontWeight",
          type: "enum",
          values: ["normal", "bold", "bolder"],
          description: "环形文字字重。",
        },
        {
          path: "ringText.color",
          type: "string",
          description: "环形文字颜色。",
        },
        {
          path: "ringText.distance",
          type: "number",
          range: [0, 100],
          description: "环形文字与环图的间距。",
        },
      ],
    },
    {
      path: "rotatingAnimation",
      type: "object",
      description: "轮播强调配置，默认关闭；开启后会按系列和数据项轮播高亮。",
      children: [
        { path: "rotatingAnimation.isActive", type: "boolean", description: "是否开启轮播强调。" },
        { path: "rotatingAnimation.height", type: "number", range: [0, 50], description: "高亮扇区放大尺寸。" },
        { path: "rotatingAnimation.opacity", type: "number", range: [0, 1], description: "非高亮扇区透明度。" },
        { path: "rotatingAnimation.duration", type: "number", range: [0.5, 60], description: "轮播间隔，单位秒。" },
        { path: "rotatingAnimation.selectMode", type: "enum", values: ["none", "click"], description: "是否允许点击锁定高亮。" },
        { path: "rotatingAnimation.isHover", type: "boolean", description: "悬停时是否暂停轮播。" },
      ],
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData.sourceType",
      reason: "RingChart 当前只由 MCP 生成 constant 数据源，AI 不应切换 sourceType。",
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
      reason: "MCP 固定使用 name 作为环形图维度。",
    },
    {
      path: "chartData.indicator",
      reason:
        "MCP 固定使用 value 作为环形图指标字段（fieldName/fieldType/format/calculateType），AI 不应修改；但 AI 必须根据业务语义设置 chartData.indicator[0].fieldDataConfig.chartDisplayName 用于图例和提示框展示，不能保留默认值“value”。",
    },
    {
      path: "option.series[0].type",
      reason:
        "RingChart 的 series type 固定为 'pie'，MCP 会强制回写，AI 不应覆盖为其他图表类型。",
    },
    {
      path: "option.series[0].data",
      reason: "数据由 chartData 处理链生成，AI 不应直接写入 series data。",
    },
    {
      path: "option.dataset",
      reason:
        "当前渲染链路不使用 ECharts dataset 驱动 RingChart 数据，AI 写入 dataset 会被忽略并造成误导。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "option.series[0].type 固定为 'pie'，即使 AI 输入其他值也会被 MCP 归一化为 'pie'。",
    "option.dataset 会被 MCP 移除；环形图数据由默认 chartData 或外部数据源替换链路提供。",
    "AI 可填写 chartData.constant.data；MCP 会归一化为完整有效的 constant chartData，并同步 originalData。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "option.series[0] 只写 radius 时，会保留默认 type、label、itemStyle。",
    "option.legend.offsetX/offsetY 会被归一化为数字；未提供时默认为 0。",
    "option.series[0].center 与 option.series[0].radius 会被归一化为两个字符串值；未提供时默认圆心 ['50%', '58%']、半径 ['38%', '66%']。",
    "option.series[0].radius[0] 不允许为 '0%' 或 '0'，否则会被修正为默认内半径 '38%'。",
    "rotatingAnimation 默认关闭；开启属于交互语义变化，AI 必须根据用户意图显式配置。",
    "label.content 是前端运行时预设字段，会在生成 ECharts option 前转换为 formatter 并剥离。",
  ],
  visualRules: [
    "环形图适合展示占比、构成关系；中心空洞明显时，应放置总数、核心指标或摘要，避免无意义留白。",
    "色彩要服务主题：等级、状态类可以使用同一色系的明暗层级；类别、分类、品类类可以使用主色、辅色、强调色和低饱和补色组合；避免直接使用 ECharts 默认杂色感。",
    "扇区分割线要和视觉风格匹配：强科技面板可用更明显的发光或高亮分割；轻量信息面板应使用克制描边，避免边框抢占主体。",
    "外部 label 应形成统一标注系统：字号、字重、颜色、连接线长度要成组设计，而不是只把默认标签打开。",
    "当模块里已经有侧边信息卡、摘要卡或明细卡时，环形图 label 应承担定位和识别功能，优先显示名称和值；占比、解释性文字和优先级说明交给信息卡，避免同一信息在主图和卡片中同等强度重复。",
    "label 文本被图表组件按容器宽高截断是可接受现象；MCP 重点避免 label、labelLine、legend 三者明显重叠，不应为未知长文本无限扩大标签区域。",
    "labelLine 应像标注系统的一部分：连接线角度、长度、颜色和标签位置应协调；不要让多条引线随机散开或穿过图形主体。",
    "legend 默认必须保留，除非用户明确要求隐藏。动态数据下 legend 承担完整分类展示和点击切换能力，右侧摘要卡不能替代 legend。",
    "legend 的位置要承担结构功能：放在标题下方时用于承接标题和图表；放在底部时必须和图表主体、外部 label、底部装饰留出足够距离；放在侧边时要给主图留出足够空间。",
    "legend 不得以横向布局放在环图中心高度；top: 'center' 只适合 left/right 侧边纵向 legend。若 legend 是 horizontal 或未显式 orient，应放在 top/bottom 安全区。",
    "处理环形图挤压时优先联动三类能力：legend.offsetX/offsetY 微调图例、series[0].center 调整圆心、series[0].radius 调整内外半径。不要只依赖扩大组件、隐藏 legend、关闭 label 或限制数据项个数。",
    "当 legend 放在右侧或左侧并且使用纵向排列时，圆环本体不能过小；应保留足够的 outerRadius 和可读的中心空洞，避免图表主体被 legend 挤成一个小点。",
    "当 RingChart 宽度小于 420px、高度小于 220px 或数据项不少于 5 项，且同时使用底部 legend 与外部 label 时，应主动缩小 outerRadius、上移 centerY、压缩 legend itemGap 和 labelLine，避免 label 与 legend 重叠；但中等以上面板仍要保留可读的图表主体，不能低于可识别的外径。",
    "当中心空洞里放置 SingleText 数值和说明时，应先估算中心文本栈宽高，再设置足够的 innerRadius；如果 innerRadius 不足，应同步增大 outerRadius 或缩减中心文本，而不是让文字压住环形主体。",
    "底部 legend、底部结论和外部 label 不能占用同一条底部阅读带；底部结论存在时应上移 legend、上移 centerY 或收敛 labelLine，让 legend 与结论分层。",
    "启用内环、外环或环形文字装饰前，应确保环图主体已经足够大；小半径环图不应叠加装饰环，以免主体变成不可读的装饰点。",
    "AI 必须根据指标业务含义设置 chartData.indicator[0].fieldDataConfig.chartDisplayName，如“指标值”“数量”“完成量”，不能保留默认值“value”；该名称会用于图例和提示框展示。",
    "标签较多或分类名较长时，应适当设置 option.series[0].labelLine.length（建议 8-16），避免引出线过短导致标签与图形主体重叠。",
    "内环、外环装饰与环形文字属于增强表达，应与整体视觉风格统一；不需要装饰时保持关闭，避免过度堆砌。",
  ],
  examples: [
    {
      title: "主题化环形图配置示例",
      props: {
        componentName: "RingChart",
        logicalId: "theme_ring_chart",
        parentLogicalId: "screen_group",
        name: "主题化环形图",
        style: {
          left: 80,
          top: 160,
          width: 420,
          height: 280,
          position: "absolute",
        },
        borderGap: 0.2,
        decorator: {
          innerRing: {
            isActive: true,
            innerRadius: 0.19,
            outerRadius: 0.22,
            opacity: 0.5,
            animateSpeed: 0.8,
            animateDirection: "clockwise",
          },
          outerRing: {
            isActive: false,
            arcWidth: 0.15,
            opacity: 0.2,
          },
        },
        ringText: {
          isActive: true,
          fontSize: 12,
          fontFamily: "Microsoft YaHei",
          fontWeight: "normal",
          color: "#BFEFFF",
          distance: 10,
        },
        chartData: {
          indicator: [
            {
              fieldDataConfig: {
                chartDisplayName: "部门绩效",
              },
            },
          ],
          constant: {
            data: [
              { name: "研发部", type: "系列", value: 120 },
              { name: "市场部", type: "系列", value: 95 },
              { name: "产品部", type: "系列", value: 88 },
              { name: "运营部", type: "系列", value: 76 },
              { name: "客服部", type: "系列", value: 62 },
            ],
          },
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
              radius: ["30%", "45%"],
              center: ["50%", "43%"],
              itemStyle: {
                borderWidth: 0,
                borderColor: "#07182F",
                borderType: "solid",
                borderRadius: 4,
                shadowBlur: 8,
                shadowColor: "rgba(0,229,255,0.35)",
              },
              label: {
                show: false,
                position: "center",
                formatter: "{b}\\n{d}%",
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
