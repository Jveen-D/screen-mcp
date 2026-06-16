import type { JsonObject } from "../../types/component.js";

export const roseChartCapability: JsonObject = {
  componentName: "RoseChart",
  displayName: "玫瑰图",
  description:
    "用于展示分类占比的 ECharts 南丁格尔玫瑰图组件，通过扇区面积表达数据大小。",
  aiRole:
    "AI 负责生成组件布局、视觉表达和可选的 chartData.constant.data 语义数据；MCP 会补齐完整 props 与有效 chartData。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "RoseChart",
      description: "组件类型，必须固定为 RoseChart。",
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
      path: "chartData.constant.data",
      type: "array<object>",
      description:
        "玫瑰图常量数据数组。每条记录必须包含 { name, value }，其中 name 为分类名称，value 为数值。",
    },
    {
      path: "chartData.indicator[0].fieldDataConfig.chartDisplayName",
      type: "string",
      description:
        "指标在图例、提示框等处的业务语义显示名。AI 必须根据实际业务含义设置，如“销售额”“客户数”“完成量”，不能保留默认值“value”。",
    },
    {
      path: "option.series[0]",
      type: "object",
      description:
        "玫瑰图唯一系列配置。AI 不需要生成 type、roseType、data 或 dataset，MCP 会按下标深合并默认配置。",
      children: [
        {
          path: "option.series[0].radius",
          type: "[string,string]",
          description:
            "内外半径，格式为 [innerRadius, outerRadius]，通常使用百分比字符串。玫瑰图 innerRadius 通常为 '0%' 以形成完整扇区；外部 label、底部 legend 拥挤时，应适当减小 outerRadius，例如 ['0%', '60%']。",
        },
        {
          path: "option.series[0].center",
          type: "[string,string]",
          description:
            "圆心位置，格式为 [x, y]，通常使用相对图表容器的百分比字符串，例如 ['50%', '50%']。底部 legend 与外部 label 挤压时，可把 y 调整到 '42%' 到 '46%'，让玫瑰图主体上移。",
        },
        {
          path: "option.series[0].itemStyle",
          type: "object",
          description: "扇区描边、圆角和阴影样式。",
          children: [
            {
              path: "option.series[0].itemStyle.borderWidth",
              type: "number",
              description: "扇区描边宽度。",
            },
            {
              path: "option.series[0].itemStyle.borderColor",
              type: "color",
              description: "扇区描边颜色。",
            },
            {
              path: "option.series[0].itemStyle.shadowBlur",
              type: "number",
              description: "扇区阴影模糊半径。",
            },
            {
              path: "option.series[0].itemStyle.shadowColor",
              type: "color",
              description: "扇区阴影颜色。",
            },
          ],
        },
        {
          path: "option.series[0].label",
          type: "object",
          description: "扇区标签样式。标签宽度和截断由图表组件根据容器宽高自动处理。",
          formatterRules: {
            path: "option.series[0].label.formatter",
            setter: "StringSetter",
            defaultValue: "{b}: {d}%",
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
      ],
    },
    {
      path: "option.legend",
      type: "object",
      description: "图例配置。",
    },
    {
      path: "option.tooltip",
      type: "object",
      description: "提示框配置。",
    },
    {
      path: "option.color",
      type: "array<color>",
      description: "全局调色盘，控制各扇区颜色。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData.sourceType",
      reason: "RoseChart 当前只由 MCP 生成 constant 数据源，AI 不应切换 sourceType。",
    },
    {
      path: "chartData.dimension",
      reason: "MCP 固定使用 name 作为玫瑰图维度。",
    },
    {
      path: "chartData.indicator",
      reason:
        "MCP 固定使用 value 作为玫瑰图指标字段（fieldName/fieldType/format/calculateType），AI 不应修改；但 AI 必须根据业务语义设置 chartData.indicator[0].fieldDataConfig.chartDisplayName 用于图例和提示框展示，不能保留默认值“value”。",
    },
    {
      path: "option.series[i].type",
      reason:
        "RoseChart 的 series type 固定为 'pie'，MCP 会强制回写，AI 不应覆盖为其他图表类型。",
    },
    {
      path: "option.series[i].roseType",
      reason:
        "RoseChart 的 roseType 固定为 'area'，MCP 会强制回写，AI 不应修改。",
    },
    {
      path: "option.series[i].data",
      reason: "数据由 chartData 处理链生成，AI 不应直接写入 series data。",
    },
    {
      path: "option.dataset",
      reason:
        "当前渲染链路不使用 ECharts dataset 驱动 RoseChart 数据，AI 写入 dataset 会被忽略并造成误导。",
    },
    {
      path: "option.title",
      reason: "当前 RoseChart schema 不需要 title，MCP 会移除 AI 输入的 option.title。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "option.series[0].type 固定为 'pie'，即使 AI 输入其他值也会被 MCP 归一化为 'pie'。",
    "option.series[0].roseType 固定为 'area'，即使 AI 输入其他值也会被 MCP 归一化为 'area'。",
    "option.dataset 会被 MCP 移除；玫瑰图数据由默认 chartData 或外部数据源替换链路提供。",
    "AI 可填写 chartData.constant.data；MCP 会归一化为完整有效的 constant chartData，并同步 originalData。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "option.series[0] 只写 radius 时，会保留默认 type、roseType、label、itemStyle。",
    "option.legend.offsetX/offsetY 会被归一化为数字；未提供时默认为 0。",
    "option.series[0].center 与 option.series[0].radius 会被归一化为两个字符串值；未提供时默认圆心 ['50%', '50%']、半径 ['0%', '75%']。",
  ],
  visualRules: [
    "玫瑰图适合展示分类占比，扇区面积差异应能直观反映数值差异；类别过多会导致小扇区难以辨识，建议合理控制分类数量。",
    "色彩要服务主题：风险、等级、状态类可以使用同一色系的明暗层级；业务来源、渠道、品类类可以使用主色、辅色、强调色和低饱和补色组合；避免直接使用 ECharts 默认杂色感。",
    "扇区分割线要和视觉风格匹配：强科技面板可用更明显的发光或高亮分割；轻量信息面板应使用克制描边，避免边框抢占主体。",
    "外部 label 应形成统一标注系统：字号、字重、颜色、连接线长度要成组设计，而不是只把默认标签打开。",
    "当模块里已经有侧边信息卡、摘要卡或明细卡时，玫瑰图 label 应承担定位和识别功能，优先显示名称和值；占比、解释性文字交给信息卡，避免同一信息在主图和卡片中同等强度重复。",
    "label 文本被图表组件按容器宽高截断是可接受现象；MCP 重点避免 label、labelLine、legend 三者明显重叠，不应为未知长文本无限扩大标签区域。",
    "labelLine 应像标注系统的一部分：连接线角度、长度、颜色和标签位置应协调；不要让多条引线随机散开或穿过图形主体。",
    "legend 默认必须保留，除非用户明确要求隐藏。动态数据下 legend 承担完整分类展示和点击切换能力，右侧摘要卡不能替代 legend。",
    "legend 的位置要承担结构功能：放在标题下方时用于承接标题和图表；放在底部时必须和图表主体、外部 label、底部装饰留出足够距离；放在侧边时要给主图留出足够空间。",
    "处理玫瑰图挤压时优先联动三类能力：legend.offsetX/offsetY 微调图例、series[0].center 调整圆心、series[0].radius 调整内外半径。不要只依赖扩大组件、隐藏 legend、关闭 label 或限制数据项个数。",
    "AI 必须根据指标业务含义设置 chartData.indicator[0].fieldDataConfig.chartDisplayName，如“销售额”“客户数”“完成量”，不能保留默认值“value”；该名称会用于图例和提示框展示。",
  ],
  examples: [
    {
      title: "主题化玫瑰图配置示例",
      props: {
        componentName: "RoseChart",
        logicalId: "theme_rose_chart",
        parentLogicalId: "screen_group",
        name: "主题化玫瑰图",
        style: {
          left: 80,
          top: 160,
          width: 520,
          height: 360,
          position: "absolute",
        },
        chartData: {
          indicator: [
            {
              fieldDataConfig: {
                chartDisplayName: "工程量",
              },
            },
          ],
          constant: {
            data: [
              { name: "结构", value: 68 },
              { name: "机电", value: 55 },
              { name: "幕墙", value: 47 },
              { name: "装修", value: 39 },
              { name: "景观", value: 31 },
              { name: "消防", value: 24 },
            ],
          },
        },
        option: {
          backgroundColor: "transparent",
          color: ["#00E5FF", "#7C4DFF", "#FFB300", "#00C853", "#FF5252", "#448AFF"],
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
              radius: ["0%", "62%"],
              center: ["50%", "44%"],
              itemStyle: {
                borderWidth: 2,
                borderColor: "#07182F",
                borderType: "solid",
                borderRadius: 8,
                shadowBlur: 8,
                shadowColor: "rgba(0,229,255,0.35)",
              },
              label: {
                show: true,
                formatter: "{b}: {d}%",
                position: "outside",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: "bold",
                fontStyle: "normal",
                fontFamily: "serif",
              },
              labelLine: {
                show: true,
                length: 10,
                length2: 18,
              },
            },
          ],
        },
      },
    },
  ],
};
