import type { JsonObject } from "../../types/component.js";

export const barChart25DCapability: JsonObject = {
  componentName: "BarChart25D",
  displayName: "2.5D 柱状图",
  description:
    "用于展示分类数据对比的 2.5D 立体柱状图组件，基于 ECharts custom series 绘制立体柱体，支持多系列分组与标签样式配置。",
  aiRole:
    "AI 负责生成组件布局、视觉表达和可选的 chartData.constant.data 语义数据；MCP 会补齐完整 props 与有效 chartData。2.5D 柱状图强调分类数据的立体对比，type 字段作为系列名。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "BarChart25D",
      description: "组件类型，必须固定为 BarChart25D。",
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
        "2.5D 柱状图常量数据数组。每条记录必须包含 { name, type, value }，其中 name 为 X 轴分类，type 作为系列名用于分组，value 为数值。",
    },
    {
      path: "chartData.indicator[0].fieldDataConfig.chartDisplayName",
      type: "string",
      description:
        "指标在图例/提示中的业务显示名。必须根据指标业务含义设置，如“销售额”“完成量”“订单数”，严禁保留默认值“value”。",
    },
    {
      path: "option.grid",
      type: "object",
      description:
        "图表网格边距配置，控制 2.5D 柱体区域与容器边界的距离。AI 可适当调整 left/top/right/bottom 以适配标题和图例位置。",
    },
    {
      path: "option.xAxis",
      type: "object",
      description:
        "X 轴配置。type 固定为 category，由 MCP 自动设置。AI 可调整 axisLabel 颜色、旋转角度和 show。",
    },
    {
      path: "option.yAxis",
      type: "object",
      description:
        "Y 轴配置。type 固定为 value，由 MCP 自动设置。AI 可调整 axisLabel 颜色、splitLine 样式。",
    },
    {
      path: "option.series",
      type: "array<object>",
      description:
        "2.5D 柱体系列配置数组。AI 可调整柱宽、标签样式等；所有系列由 MCP 强制 type='custom'。多系列时每个系列按 option.color 下标取色，type 字段作为系列名。",
      children: [
        {
          path: "option.series[i].barWidth",
          type: "number",
          description: "柱宽，单位 px。同时影响 2.5D 柱体深度。默认 18。",
        },
        {
          path: "option.series[i].itemStyle",
          type: "object",
          description: "柱子图形样式。",
          children: [
            {
              path: "option.series[i].itemStyle.color",
              type: "color",
              description: "柱子填充色。多系列时建议由 option.color 统一控制。",
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
              values: ["top", "left", "right", "bottom", "inside", "insideTop", "insideBottom"],
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
      reason: "BarChart25D 当前只由 MCP 生成 constant 数据源，AI 不应切换 sourceType。",
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
      reason: "MCP 固定使用 name 和 type 两个维度：name 作为 X 轴分类，type 作为系列名。",
    },
    {
      path: "chartData.indicator[0].fieldName",
      reason: "MCP 固定使用 value 作为指标字段名（Y 轴数值）。",
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
        "BarChart25D 的 series type 固定为 'custom'，由 MCP 在 normalize 中强制回写，AI 不应覆盖。",
    },
    {
      path: "option.series[i].stack",
      reason: "BarChart25D 当前不支持堆叠。",
    },
    {
      path: "option.series[i].barGap",
      reason: "BarChart25D 不支持 barGap。",
    },
    {
      path: "option.series[i].barCategoryGap",
      reason: "BarChart25D 不支持 barCategoryGap。",
    },
    {
      path: "option.series[i].showBackground",
      reason: "BarChart25D 不支持 showBackground。",
    },
    {
      path: "option.series[i].backgroundStyle",
      reason: "BarChart25D 不支持 backgroundStyle。",
    },
    {
      path: "option.series[i].data",
      reason: "数据由 chartData 处理链生成，AI 不应直接写入 series data。",
    },
    {
      path: "option.dataset",
      reason:
        "当前渲染链路不使用 ECharts dataset 驱动 BarChart25D 数据，AI 写入 dataset 会被忽略并造成误导。",
    },
    {
      path: "option.title",
      reason: "当前 BarChart25D schema 不需要 title，MCP 会移除 AI 输入的 option.title。",
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
      path: "option.tooltip.trigger",
      reason: "BarChart25D 使用 custom series，tooltip trigger 固定为 'item'。",
    },
  ],
  mergeRules: [
    "option.series[i].type 固定为 'custom'，即使 AI 输入其他值也会被 MCP 归一化为 'custom'。",
    "option.dataset 会被 MCP 移除；2.5D 柱状图数据由默认 chartData 或外部数据源替换链路提供。",
    "AI 可填写 chartData.constant.data；MCP 会归一化为完整有效的 constant chartData，并同步 originalData。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "option.xAxis.type 固定为 'category'，option.yAxis.type 固定为 'value'。",
    "option.tooltip.trigger 固定为 'item'，axisPointer.type 固定为 'none'。",
  ],
  visualRules: [
    "chartData.dimension 必须包含两个维度：name（X 轴分类）和 type（系列名），缺一不可。",
    "chartData.constant.data 每条记录必须包含 { name, type, value }，其中 name 对应 X 轴分类，type 作为系列名用于分组，value 为数值。",
    "AI 必须根据业务语义设置 chartData.indicator[0].fieldDataConfig.chartDisplayName（如“销售额”“完成量”“订单数”），禁止保留默认值“value”。",
    "2.5D 柱体视觉重量较大，barWidth 建议 12–24 px，不宜过细。",
    "多系列分组时，系列数建议 ≤3，与前端 ChartDataSetter.maxCount 对齐。",
    "图例默认放在顶部（top: 'top'），给柱体主体留出足够的纵向空间。",
    "当分类名较长或数量较多时，应设置 xAxis.axisLabel.rotate 为 30–45 度，避免标签重叠。",
    "Y 轴网格线（splitLine）应使用低透明度虚线，保持背景干净。",
    "2.5D 柱状图没有侧边摘要卡，也不存在中心总数文本；数据解读通过 tooltip 和底部结论完成。",
    "禁止在 2.5D 柱状图上添加饼图才有的装饰（如中心文本、环形内径、扇区抬升等概念）。",
    "label formatter 中严禁使用 \\n、\\r、\\t 等转义字符，MCP 会自动清理为单个空格。",
  ],
  examples: [
    {
      title: "科技风 2.5D 柱状图配置示例",
      props: {
        componentName: "BarChart25D",
        logicalId: "theme_25d_bar_chart",
        parentLogicalId: "screen_group",
        name: "销售对比图",
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
            {
              fieldDataConfig: {
                calculateType: "COUNT",
                chartDisplayName: "type",
              },
              fieldName: "type",
              fieldDisplayName: "type",
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
                chartDisplayName: "销售额",
              },
              fieldName: "value",
              fieldDisplayName: "value",
              fieldType: "DECIMAL",
            },
          ],
          constant: {
            data: [
              { name: "1月", type: "线上", value: 120 },
              { name: "1月", type: "线下", value: 80 },
              { name: "2月", type: "线上", value: 90 },
              { name: "2月", type: "线下", value: 110 },
              { name: "3月", type: "线上", value: 150 },
              { name: "3月", type: "线下", value: 70 },
            ],
          },
        },
        option: {
          backgroundColor: "transparent",
          color: ["#00E5FF", "#7C4DFF"],
          legend: {
            show: true,
            left: "center",
            top: "top",
            textStyle: {
              color: "#BFEFFF",
              fontSize: 12,
            },
          },
          tooltip: {
            show: true,
            backgroundColor: "rgba(3,16,31,0.92)",
            borderColor: "rgba(0,229,255,0.35)",
            borderWidth: 1,
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
              barWidth: 18,
              itemStyle: {
                borderRadius: 2,
              },
              label: {
                show: true,
              },
            },
          ],
        },
      },
    },
  ],
};
