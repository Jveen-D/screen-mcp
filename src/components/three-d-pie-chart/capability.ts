import type { JsonObject } from "../../types/component.js";

export const threeDPieChartCapability: JsonObject = {
  componentName: "ThreeDPieChart",
  displayName: "3D饼图",
  description:
    "基于 Three.js 的 3D 饼图组件，支持立体厚度、俯视角度、扇区抬升、轮播动画和中心标签，用于展示分类占比和构成比例。",
  aiRole:
    "AI 负责生成组件布局、视觉表达和可选的 chartData.constant.data 语义数据；MCP 会补齐完整 props 与有效 chartData。3D 饼图的 label 默认关闭，信息展示依赖中心标签和侧边摘要。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "ThreeDPieChart",
      description: "组件类型，必须固定为 ThreeDPieChart。",
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
        "3D 饼图唯一系列配置。AI 不需要生成 type、data 或 dataset，MCP 会按下标深合并默认配置。",
      children: [
        {
          path: "option.series[0].radius",
          type: "[string,string]",
          description:
            "内外半径，格式为 [innerRadius, outerRadius]，通常使用百分比字符串。3D 饼图默认半径较大（如 ['72%', '96%']），组件较小时应适当减小 outerRadius，例如 ['56%', '78%']。",
        },
        {
          path: "option.series[0].center",
          type: "[string,string]",
          description:
            "圆心位置，格式为 [x, y]，通常使用相对图表容器的百分比字符串，例如 ['50%', '48%']。底部 legend 挤压时，可把 y 调整到 '42%' 到 '46%'，让饼图主体上移。",
        },
        {
          path: "option.series[0].itemStyle",
          type: "object",
          description: "扇区描边和阴影样式。",
        },
      ],
    },
    {
      path: "option.threeDSettings",
      type: "object",
      description:
        "3D 视图专属配置，控制立体厚度、视角、动画等效果。AI 只应修改以下子项，其余由 MCP 保留默认值。",
      children: [
        {
          path: "option.threeDSettings.depth",
          type: "number",
          range: [6, 180],
          description: "饼体厚度，单位 px。数值越大饼体越厚，科技感越强；轻量面板可使用较小值。",
        },
        {
          path: "option.threeDSettings.topViewAngle",
          type: "number",
          range: [0, 85],
          description:
            "俯视角度，单位度。0 为完全平视（侧面），85 接近顶视；大屏常用 50–70 之间，既能体现立体感又保证可读性。",
        },
        {
          path: "option.threeDSettings.animationEnabled",
          type: "boolean",
          description: "是否启用扇区轮播动画（高亮抬升效果）。默认 true。",
        },
        {
          path: "option.threeDSettings.centerLabelVisible",
          type: "boolean",
          description:
            "是否显示中心标签（当前激活扇区的名称和占比）。3D 饼图的主要信息展示方式，默认 true。",
        },
        {
          path: "option.threeDSettings.liftDistance",
          type: "number",
          range: [0, 160],
          description:
            "轮播时扇区抬升高度，单位 px。数值越大高亮扇区抬升越明显；保守面板可使用 8–14，强调动效可使用 20–40。",
        },
        {
          path: "option.threeDSettings.animationDuration",
          type: "number",
          range: [400, 12000],
          description:
            "轮播动画间隔，单位毫秒。默认 2200ms；数据项较多或面板强调稳重感时可适当增大到 3000–4000ms。",
        },
        {
          path: "option.threeDSettings.tilt",
          type: "number",
          range: [0, 90],
          description:
            "倾斜角度，与俯视角度联动控制 3D 观感。通常保持与 topViewAngle 接近即可，大屏默认约 63°。",
        },
      ],
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData.sourceType",
      reason: "ThreeDPieChart 当前只由 MCP 生成 constant 数据源，AI 不应切换 sourceType。",
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
        "ThreeDPieChart 的 series type 固定为 'pie'，MCP 会强制回写，AI 不应覆盖为其他图表类型。",
    },
    {
      path: "option.series[0].data",
      reason: "数据由 chartData 处理链生成，AI 不应直接写入 series data。",
    },
    {
      path: "option.dataset",
      reason:
        "当前渲染链路不使用 ECharts dataset 驱动 ThreeDPieChart 数据，AI 写入 dataset 会被忽略并造成误导。",
    },
    {
      path: "option.title",
      reason: "当前 ThreeDPieChart schema 不需要 title，MCP 会移除 AI 输入的 option.title。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
    {
      path: "option.threeDSettings.cameraPosition",
      reason: "相机位置由 MCP 根据 topViewAngle 和组件尺寸自动计算，AI 不应直接覆盖。",
    },
    {
      path: "option.threeDSettings.cameraRotation",
      reason: "相机旋转由 MCP 保留默认值，AI 不应直接覆盖。",
    },
    {
      path: "option.threeDSettings.projectionType",
      reason: "投影类型固定为 perspective，AI 不应切换。",
    },
    {
      path: "option.threeDSettings.pixelRatio",
      reason: "像素比由 MCP 保留默认值 1.5，AI 不应直接覆盖。",
    },
  ],
  mergeRules: [
    "option.series[0].type 固定为 'pie'，即使 AI 输入其他值也会被 MCP 归一化为 'pie'。",
    "option.dataset 会被 MCP 移除；饼图数据由默认 chartData 或外部数据源替换链路提供。",
    "AI 可填写 chartData.constant.data；MCP 会归一化为完整有效的 constant chartData，并同步 originalData。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "option.series[0] 只写 radius 时，会保留默认 type、label、itemStyle。",
    "option.legend.offsetX/offsetY 会被归一化为数字；未提供时默认为 0。",
    "option.series[0].center 与 option.series[0].radius 会被归一化为两个字符串值；未提供时使用默认圆心和半径。",
    "option.threeDSettings.depth 会被限制在 [6, 180] 范围内。",
    "option.threeDSettings.topViewAngle 会被限制在 [0, 85] 范围内。",
    "option.threeDSettings.liftDistance 会被限制在 [0, 160] 范围内。",
  ],
  visualRules: [
    "3D 饼图半径通常比 2D 饼图大，默认 ['72%', '96%']；组件较小时应主动缩小 outerRadius，避免扇区超出容器。",
    "3D 饼图的 label 默认关闭，信息展示依赖中心标签（centerLabelVisible）和侧边摘要；不要强行打开外部 label，以免与 3D 立体效果冲突。",
    "色彩要服务主题：风险、等级、状态类可以使用同一色系的明暗层级；业务来源、渠道、品类类可以使用主色、辅色、强调色和低饱和补色组合。",
    "俯视角度（topViewAngle）决定立体感强度：50°–60° 兼顾立体和可读；超过 70° 接近平面，3D 特征变弱；低于 40° 侧面透视过强，可能影响中心标签阅读。",
    "饼体厚度（depth）应与面板风格匹配：科技面板可用 20–40 体现体量感；轻量信息面板使用 10–18 保持清爽。",
    "当模块里已经有侧边信息卡或摘要卡时，中心标签承担主要信息展示；侧边卡片补充详细数值和占比，避免与中心标签重复同一信息。",
    "legend 默认必须保留，除非用户明确要求隐藏。3D 饼图的 legend 承担完整分类展示和点击切换能力。",
    "legend 放在底部时，要给 3D 饼图主体留出足够距离；3D 饼图底部有厚度投影，legend 不应与投影区域重叠。",
    "轮播动画（animationEnabled）默认开启，但不应过于频繁；轮播间隔（animationDuration）默认 2200ms，可根据数据量调整。",
    "扇区抬升高度（liftDistance）要与饼体厚度协调：厚度大时抬升也应适当增大，保持视觉比例平衡。",
    "3D 饼图不适合与 2D 饼图在同一面板内混用，避免视觉风格冲突。",
    "数据极度不均衡时（某一扇区占比 > 60%），建议适当降低 depth 或增大 innerRadius，避免大面积同色块造成视觉单调。",
    "中心标签如果文本过长或多行堆叠，建议精简内容或引导用户减少数据项数量；不要通过缩小字号到不可读来硬塞内容。",
    "图例放在右侧时，饼图 center 应适当左移（如从 '50%' 到 '42%'），避免主体与图例之间出现过大空隙。",
    "3D 饼图的阴影和发光效果应与面板整体风格统一：强科技风可用更明显的发光分割；简洁风应使用克制描边。",
    "3D 饼图不是 2D 饼图的极简替代，面板装饰（标题背景点缀、侧边摘要容器边框、主图侧卡关联线、底部结构线）必须完整保留，不应因为 3D 立体效果本身足够突出就省略装饰。",
    "当模块层生成 ThreeDPieChart 面板时，SvgDecoration 装饰组件的数量和类型应与 PieChart 面板保持一致，禁止以'3D 自带科技感'为由减少或删除装饰。",
  ],
  examples: [
    {
      title: "3D 饼图配置示例",
      props: {
        componentName: "ThreeDPieChart",
        logicalId: "theme_3d_pie_chart",
        parentLogicalId: "screen_group",
        name: "3D 占比图",
        style: {
          left: 80,
          top: 160,
          width: 420,
          height: 320,
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
            icon: "rect",
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
            backgroundColor: "#121821",
            textStyle: {
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: "normal",
              fontStyle: "normal",
              fontFamily: "serif",
            },
          },
          threeDSettings: {
            depth: 18,
            topViewAngle: 63,
            animationEnabled: true,
            centerLabelVisible: true,
            liftDistance: 14,
          },
          series: [
            {
              radius: ["72%", "96%"],
              center: ["50%", "48%"],
              itemStyle: {
                borderWidth: 0.8,
                borderColor: "#07182F",
                borderType: "solid",
                shadowBlur: 0,
                shadowColor: "#ffffff",
              },
            },
          ],
        },
      },
    },
  ],
};
