import type { JsonObject } from "../../types/component.js";

export const scatterChartCapability: JsonObject = {
  componentName: "ScatterChart",
  displayName: "散点图",
  description:
    "用于展示两个连续变量相关性与分布的 ECharts 散点图组件，支持按系列分组、气泡大小映射、符号样式和标签配置。",
  aiRole:
    "AI 负责生成组件布局、视觉表达和可选的 chartData.constant.data 语义数据；MCP 会补齐完整 props、有效 chartData 以及 props.datasource。散点图强调 X/Y 两个数值维度的分布关系，series 字段用于分组着色，size 字段用于控制气泡大小。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "ScatterChart",
      description: "组件类型，必须固定为 ScatterChart。",
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
        "散点图常量数据数组。每条记录必须包含 { x, y, size?, series? }，其中 x 映射 X 轴数值，y 映射 Y 轴数值，size 控制气泡大小（可选，非法值会被移除），series 作为系列名用于分组（缺失时回退为“默认系列”）。",
    },
    {
      path: "chartData.indicator[0].fieldDataConfig.chartDisplayName",
      type: "string",
      description:
        "X 轴指标在图例/提示中的业务显示名。必须根据业务语义设置，如“维度X”“温度”，严禁保留默认值“x”。",
    },
    {
      path: "chartData.indicator[1].fieldDataConfig.chartDisplayName",
      type: "string",
      description:
        "Y 轴指标在图例/提示中的业务显示名。必须根据业务语义设置，如“维度Y”“湿度”，严禁保留默认值“y”。",
    },
    {
      path: "chartData.indicator[2].fieldDataConfig.chartDisplayName",
      type: "string",
      description:
        "气泡大小指标在图例/提示中的业务显示名。必须根据业务语义设置，如“规模”“数量”，严禁保留默认值“size”。",
    },
    {
      path: "option.grid",
      type: "object",
      description:
        "图表网格边距配置，控制散点区域与容器边界的距离。AI 可适当调整 left/top/right/bottom 以适配标题和图例位置。",
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
      path: "option.xAxis",
      type: "object",
      description:
        "X 轴配置。type 固定为 value，由 MCP 自动设置。AI 可调整 axisLabel 颜色、splitLine 样式、min/max 等。",
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
          path: "option.xAxis.min",
          type: "number",
          description: "X 轴最小值，用于固定刻度范围。",
        },
        {
          path: "option.xAxis.max",
          type: "number",
          description: "X 轴最大值，用于固定刻度范围。",
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
              path: "option.xAxis.axisLabel.formatter",
              type: "string",
              description: "标签格式化字符串，如 '{value} 万'。",
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
      ],
    },
    {
      path: "option.yAxis",
      type: "object",
      description:
        "Y 轴配置。type 固定为 value，由 MCP 自动设置。AI 可调整 axisLabel 颜色、splitLine 样式、min/max 等。",
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
              path: "option.yAxis.axisLabel.formatter",
              type: "string",
              description: "标签格式化字符串，如 '{value} 万'。",
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
      description: "图例配置。AI 可调整显示位置、朝向和文本样式。",
      children: [
        {
          path: "option.legend.show",
          type: "boolean",
          description: "是否显示图例。",
        },
        {
          path: "option.legend.left",
          type: "string|number",
          description: "图例水平位置，如 'center'、'left' 或具体数值。",
        },
        {
          path: "option.legend.top",
          type: "string|number",
          description: "图例垂直位置，如 'top'、'bottom' 或具体数值。",
        },
        {
          path: "option.legend.orient",
          type: "enum",
          values: ["horizontal", "vertical"],
          description: "图例朝向。",
        },
        {
          path: "option.legend.textStyle.color",
          type: "color",
          description: "图例文本颜色。",
        },
        {
          path: "option.legend.textStyle.fontSize",
          type: "number",
          description: "图例文本字号。",
        },
      ],
    },
    {
      path: "option.tooltip",
      type: "object",
      description: "提示框配置。AI 可调整背景色、边框和文本样式。",
      children: [
        {
          path: "option.tooltip.show",
          type: "boolean",
          description: "是否显示提示框。",
        },
        {
          path: "option.tooltip.formatter",
          type: "string",
          description: "提示框内容格式化字符串，支持 {a}（系列名）、{c}（数值数组）及 <br/> 换行。",
        },
        {
          path: "option.tooltip.backgroundColor",
          type: "color",
          description: "提示框背景色。",
        },
        {
          path: "option.tooltip.borderColor",
          type: "color",
          description: "提示框边框色。",
        },
        {
          path: "option.tooltip.textStyle.color",
          type: "color",
          description: "提示框文本颜色。",
        },
        {
          path: "option.tooltip.textStyle.fontSize",
          type: "number",
          description: "提示框文本字号。",
        },
      ],
    },
    {
      path: "option.color",
      type: "array<color>",
      description: "图表主题色数组，多系列时按顺序取色。",
    },
    {
      path: "option.series",
      type: "array<object>",
      description:
        "散点系列配置数组。AI 可调整符号形状、气泡大小、图形样式和标签；所有系列由 MCP 强制 type='scatter'。",
      children: [
        {
          path: "option.series[i].symbol",
          type: "enum",
          values: ["circle", "rect", "roundRect", "triangle", "diamond", "pin", "arrow"],
          description: "散点符号形状，默认 'circle'。",
        },
        {
          path: "option.series[i].itemStyle",
          type: "object",
          description: "散点图形样式。",
          children: [
            {
              path: "option.series[i].itemStyle.color",
              type: "color",
              description: "散点填充色。多系列时建议由 option.color 统一控制。",
            },
            {
              path: "option.series[i].itemStyle.opacity",
              type: "number",
              description: "散点透明度，0–1 之间。",
            },
            {
              path: "option.series[i].itemStyle.borderColor",
              type: "color",
              description: "散点边框色。",
            },
            {
              path: "option.series[i].itemStyle.borderWidth",
              type: "number",
              description: "散点边框宽。",
            },
            {
              path: "option.series[i].itemStyle.shadowBlur",
              type: "number",
              description: "散点阴影模糊半径。",
            },
            {
              path: "option.series[i].itemStyle.shadowColor",
              type: "color",
              description: "散点阴影颜色。",
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
              values: ["top", "left", "right", "bottom", "inside"],
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
              description: "标签格式化字符串。严禁使用 \n 等转义字符。",
            },
          ],
        },
        {
          path: "option.series[i].__fixedSize",
          type: "number",
          description: "固定散点大小，单位 px。当 __bubbleSize.enable 为 false 时生效。",
        },
        {
          path: "option.series[i].__bubbleSize",
          type: "object",
          description: "气泡大小映射配置。",
          children: [
            {
              path: "option.series[i].__bubbleSize.enable",
              type: "boolean",
              description: "是否启用按 size 字段映射气泡大小。",
            },
            {
              path: "option.series[i].__bubbleSize.minSize",
              type: "number",
              description: "气泡最小大小，单位 px。",
            },
            {
              path: "option.series[i].__bubbleSize.maxSize",
              type: "number",
              description: "气泡最大大小，单位 px。",
            },
          ],
        },
      ],
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData.sourceType",
      reason: "ScatterChart 当前只由 MCP 生成 constant 数据源，AI 不应切换 sourceType。",
    },
    {
      path: "chartData.constant.originalData",
      reason: "MCP 会根据 chartData.constant.data 自动同步 originalData。",
    },
    {
      path: "chartData.constant.fieldList",
      reason: "MCP 会补齐 x/y/size/series 四个字段列表。",
    },
    {
      path: "chartData.dimension",
      reason: "MCP 固定使用 series 作为维度字段，用于系列分组。",
    },
    {
      path: "chartData.indicator[0].fieldName",
      reason: "MCP 固定使用 x 作为第一个指标字段名（X 轴数值）。",
    },
    {
      path: "chartData.indicator[0].fieldDisplayName",
      reason: "MCP 固定使用 x 作为 X 轴指标显示名。",
    },
    {
      path: "chartData.indicator[0].fieldType",
      reason: "MCP 固定 X 轴指标字段类型为 DECIMAL。",
    },
    {
      path: "chartData.indicator[0].fieldDataConfig.calculateType",
      reason: "MCP 固定 X 轴指标计算类型为 SUM。",
    },
    {
      path: "chartData.indicator[0].fieldDataConfig.format",
      reason: "MCP 会统一处理 X 轴指标数值格式。",
    },
    {
      path: "chartData.indicator[1].fieldName",
      reason: "MCP 固定使用 y 作为第二个指标字段名（Y 轴数值）。",
    },
    {
      path: "chartData.indicator[1].fieldDisplayName",
      reason: "MCP 固定使用 y 作为 Y 轴指标显示名。",
    },
    {
      path: "chartData.indicator[1].fieldType",
      reason: "MCP 固定 Y 轴指标字段类型为 DECIMAL。",
    },
    {
      path: "chartData.indicator[1].fieldDataConfig.calculateType",
      reason: "MCP 固定 Y 轴指标计算类型为 SUM。",
    },
    {
      path: "chartData.indicator[1].fieldDataConfig.format",
      reason: "MCP 会统一处理 Y 轴指标数值格式。",
    },
    {
      path: "chartData.indicator[2].fieldName",
      reason: "MCP 固定使用 size 作为第三个指标字段名（气泡大小）。",
    },
    {
      path: "chartData.indicator[2].fieldDisplayName",
      reason: "MCP 固定使用 size 作为气泡大小指标显示名。",
    },
    {
      path: "chartData.indicator[2].fieldType",
      reason: "MCP 固定气泡大小指标字段类型为 DECIMAL。",
    },
    {
      path: "chartData.indicator[2].fieldDataConfig.calculateType",
      reason: "MCP 固定气泡大小指标计算类型为 SUM。",
    },
    {
      path: "chartData.indicator[2].fieldDataConfig.format",
      reason: "MCP 会统一处理气泡大小指标数值格式。",
    },
    {
      path: "option.series[i].type",
      reason: "ScatterChart 的 series type 固定为 'scatter'，MCP 会强制回写，AI 不应覆盖为其他图表类型。",
    },
    {
      path: "option.series[i].data",
      reason: "数据由 chartData 处理链生成并映射为 props.datasource，AI 不应直接写入 series data。",
    },
    {
      path: "option.dataset",
      reason: "当前渲染链路不使用 ECharts dataset 驱动 ScatterChart 数据，AI 写入 dataset 会被忽略并造成误导。",
    },
    {
      path: "option.title",
      reason: "当前 ScatterChart schema 不需要 title，MCP 会移除 AI 输入的 option.title。",
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
      reason: "Y 轴 type 固定为 value，由 MCP 自动设置。",
    },
  ],
  mergeRules: [
    "option.series[i].type 固定为 'scatter'，即使 AI 输入其他值也会被 MCP 归一化为 'scatter'。",
    "option.dataset 会被 MCP 移除；散点图数据由默认 chartData 或外部数据源替换链路提供。",
    "AI 可填写 chartData.constant.data；MCP 会归一化为完整有效的 constant chartData，并同步 originalData 与 props.datasource。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "option.xAxis.type 固定为 'value'，option.yAxis.type 固定为 'value'。",
    "option.legend.offsetX/offsetY 会被归一化为数字；未提供时默认为 0。",
  ],
  visualRules: [
    "chartData.dimension 必须包含一个维度：series（系列名），用于分组着色。",
    "chartData.indicator 必须包含三个指标：x（X 轴数值）、y（Y 轴数值）、size（气泡大小）。",
    "chartData.constant.data 每条记录必须包含 { x, y, size?, series? }，其中 x、y 缺失时回退为 0，series 缺失时回退为“默认系列”，非法 size 会被删除。",
    "AI 必须根据业务语义设置 chartData.indicator[0/1/2].fieldDataConfig.chartDisplayName（如“维度X”“维度Y”“规模”），禁止保留默认值“x”“y”“size”。",
    "散点图用于展示两个连续变量的分布与相关性，不要用于展示分类对比；分类对比需求应使用柱状图。",
    "多系列散点图应使用对比色区分不同系列，颜色要具备足够的可辨识性，避免色盲不友好的组合。",
    "图例默认放在顶部（top: 'top'），给散点主体留出足够的绘制空间。",
    "X/Y 轴网格线（splitLine）应使用低透明度虚线，保持背景干净，不要让网格线和散点同等视觉重量。",
    "气泡大小映射时，建议设置 __bubbleSize.minSize 与 __bubbleSize.maxSize 差距明显（如 10–50），确保大小差异可感知。",
    "当不需要气泡大小时，可关闭 __bubbleSize.enable 并设置 __fixedSize 统一散点大小。",
    "label formatter 中严禁使用 \n、\r、\t 等转义字符，MCP 会自动清理为单个空格；需要换行时应由前端默认处理。",
    "散点图没有侧边摘要卡，也不存在中心总数文本；数据解读通过 tooltip 和底部结论完成。",
    "禁止在散点图上添加饼图/柱状图才有的装饰（如中心文本、环形内径、柱体圆角堆叠等概念）。",
  ],
  examples: [
    {
      title: "散点图配置示例",
      props: {
        componentName: "ScatterChart",
        logicalId: "theme_scatter_chart",
        parentLogicalId: "screen_group",
        name: "双指标关系图",
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
                chartDisplayName: "series",
              },
              fieldName: "series",
              fieldDisplayName: "series",
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
                chartDisplayName: "维度X",
              },
              fieldName: "x",
              fieldDisplayName: "x",
              fieldType: "DECIMAL",
            },
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
                chartDisplayName: "维度Y",
              },
              fieldName: "y",
              fieldDisplayName: "y",
              fieldType: "DECIMAL",
            },
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
                chartDisplayName: "规模",
              },
              fieldName: "size",
              fieldDisplayName: "size",
              fieldType: "DECIMAL",
            },
          ],
          constant: {
            data: [
              { x: 12, y: 34, size: 18, series: "系列1" },
              { x: 28, y: 56, size: 24, series: "系列1" },
              { x: 45, y: 21, size: 14, series: "系列1" },
              { x: 63, y: 78, size: 32, series: "系列2" },
              { x: 80, y: 45, size: 20, series: "系列2" },
              { x: 55, y: 67, size: 28, series: "系列2" },
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
            offsetX: 0,
            offsetY: 0,
            orient: "horizontal",
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
            name: "维度X",
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
          yAxis: {
            name: "维度Y",
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
              symbol: "circle",
              itemStyle: {
                opacity: 0.8,
              },
              __fixedSize: 30,
              __bubbleSize: {
                enable: true,
                minSize: 10,
                maxSize: 50,
              },
            },
          ],
        },
      },
    },
  ],
};
