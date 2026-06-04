import type { JsonObject } from "../../types/component.js";

export const chartPanelCapability: JsonObject = {
  moduleName: "ChartPanel",
  displayName: "图表面板",
  description:
    "通用图表面板模块，用背景、标题、主图表和装饰元素组合出可插入画布的组件 schema 数组。",
  requiredProps: [
    {
      path: "moduleName",
      type: "string",
      value: "ChartPanel",
      description: "模块类型，必须固定为 ChartPanel。",
    },
    {
      path: "logicalId",
      type: "string",
      description: "模块 ID，用于派生子组件 logicalId。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "模块所属父级 ID。",
    },
    {
      path: "style",
      type: "object",
      description: "模块容器在画布上的绝对位置和尺寸。",
      children: [
        { path: "style.left", type: "number" },
        { path: "style.top", type: "number" },
        { path: "style.width", type: "number" },
        { path: "style.height", type: "number" },
        { path: "style.position", type: "string", value: "absolute" },
      ],
    },
    {
      path: "slots.mainChart",
      type: "object",
      description: "主图表 slot，当前可使用 PieChart，未来可扩展其他图表组件。",
    },
  ],
  optionalProps: [
    {
      path: "title",
      type: "string",
      description: "标题文本。也可通过 slots.title.props.textContent 覆盖。",
    },
    {
      path: "theme",
      type: "object",
      description: "模块主题色，用于映射标题、图表色板和 SVG 装饰。",
    },
  ],
  slots: {
    background: {
      supportedComponents: ["SingleImage"],
      required: false,
      multiple: false,
      description:
        "背景图，默认铺满整个模块。优先使用用户提供的 imageBase64；使用 imageBase64 时 imageUseMode 必须为 base64；不要生成不可访问的图片链接。",
    },
    title: {
      supportedComponents: ["SingleText"],
      required: false,
      multiple: false,
      description: "标题文本，默认位于模块顶部。",
    },
    mainChart: {
      supportedComponents: ["PieChart"],
      required: true,
      multiple: false,
      description: "主图表，默认位于标题下方主体区域。",
    },
    decorations: {
      supportedComponents: ["SvgDecoration"],
      required: false,
      multiple: true,
      description:
        "装饰元素，用于面板框架、标题承托、侧边信息卡外框、连接线、角标、分割线、纹理和图标。不得用 SvgDecoration 绘制主图表、信息卡正文、标题、数值、占比或结论文本。",
    },
    auxiliaryTexts: {
      supportedComponents: ["SingleText"],
      required: false,
      multiple: true,
      description:
        "辅助文本，可用于中心摘要、侧边信息卡文字、指标数值、占比和底部结论说明。所有业务文本必须用 SingleText，不要写入 SVG。",
    },
  },
  layoutRules: [
    "所有子组件都以 module.style 为容器基准计算绝对位置。",
    "渲染层级由 ComponentSchema[] 输出顺序控制：数组越靠前越在顶层，数组越靠后越在底层。",
    "ChartPanel 默认输出顺序为 title、titleBadge、decorations、mainChart、background，使标题最上层、标题承托装饰在标题下方、背景最底层。",
    "不要依赖 zIndex 控制模块内层级；zIndex 只是兼容旧 schema 的字段，可保留默认值。",
    "background 默认铺满模块区域，并作为数组最后一项输出。",
    "科技风背景必须使用深色系，例如 #020A18、#061A2E、#07182F 或 rgba(4,16,32,0.92)，禁止大面积高饱和纯色背景。",
    "禁止使用 green、lime、red、yellow、bright purple 等大面积高饱和纯色作为面板背景。",
    "background 优先使用真实 imageBase64。使用 imageBase64 时 imageUseMode 自动为 base64；占位 base64 或无可用图片时使用 MCP 内置深色网格背景。",
    "标题必须有视觉承托，但承托形式应按面板主题选择：可以是小型标题底板、横向顶部栏、短线框、微发光角标或图标点缀，不要所有模块都使用同一种标题栏。",
    "当使用横向顶部栏时，应把它当作面板结构的一部分：它可以承接标题、图例和边框语言，但不能机械套用固定宽度、固定颜色或固定图标。",
    "标题前可使用三角光标、短竖线、小圆点、斜切线框、微发光角标等点缀，但必须预留标题文字左边距，不能压住标题文字。",
    "mainChart 应根据标题、图例和装饰重新计算主体区域：避免图表过小或上方大面积留白；不要固定套用某一张设计稿的 top、height 参数。",
    "legend 的位置要服务结构：放在标题下方时用于承接标题和图表；放在底部时必须和底部装饰留出距离；放在侧边时要给主图留出足够空间。",
    "如果 mainChart 是 PieChart，应按语义选择实心饼图、环形图或细环；不要默认把所有饼图都做成同一种蓝色实心饼图。",
    "饼图色彩应按主题生成：风险、等级、状态类可使用同一色系明暗层级；销售、渠道、品类类可使用主色、辅色、强调色和低饱和补色组合。",
    "饼图标签应形成标注系统：外部 label、labelLine、字号、字重和颜色要统一；强标注适合分析类稿件，轻标注适合数据密集模块。",
    "同一组数据在主图、中心摘要、侧边信息卡和底部说明中要分工展示：主图 label 负责定位，中心摘要负责总量或核心指标，侧边卡负责占比和解释，底部说明负责结论；不要让多处文本以同等强度重复完整信息。",
    "模块必须使用真实组件表达真实内容：主图表必须使用 slots.mainChart 的 PieChart；业务文本必须使用 title 或 auxiliaryTexts 的 SingleText；SvgDecoration 只允许做装饰。",
    "禁止用 SvgDecoration 的 svgContent 手绘饼图、环形图、信息卡正文、标题、数值、占比或结论说明。",
    "不要因为禁止 SVG 承载真实内容而省略 SvgDecoration；合格的 ChartPanel 至少应包含标题承托、面板边框、侧边信息卡外框、分割线或连接线中的一种装饰结构。",
    "侧边信息卡如果出现风险等级、占比或说明文字，文字必须用 SingleText，信息卡外框、左侧色条、底纹和短连接线应使用 SvgDecoration 或背景组件表达。",
    "侧边信息卡连接主图时，连接线应短、少、淡，避免和饼图 labelLine 混成两套同样强的引线系统。",
    "底部结论文案要准确使用业务术语，例如风险场景优先使用“高等级风险”“高风险项”“处置优先级”，避免使用含混的“高级风险”。",
    "边框、角标、背景网格、中心光晕、扫描线等装饰必须低于标题、主图和关键数据的视觉层级；当画面已经有标题栏、侧卡和主图标注时，装饰透明度应主动降低。",
    "legend 与底部 decoration 主线至少保持 12px 到 20px 间距，避免图例贴线。",
    "mainChart 默认 option.backgroundColor = transparent，使图表与面板背景协调。",
    "decorations 默认不占用左上标题安全区，优先放右上、右下、左下等角落；如必须放左侧，应放在 title 安全区下方。",
    "底部 decorations 应优先生成一条连续的主横线，再配少量辅助细线，避免多个短线条随机散落。",
    "右上 decorations 应贴合面板右上边界，宽度约 180px，高度约 72px，和底部装饰形成统一边框语言，避免像独立贴片。",
    "装饰元素应像面板框架的一部分，而不是孤立图标；优先使用横线、折线、端点圆点、弱透明辅助线。",
    "装饰生成的最低目标是让模块看起来有承载结构：标题有托底或点缀，内容区有边界或分割，侧边说明有轻量容器；不要只输出裸文字和裸图表。",
    "可使用的设计思路：顶部整栏标题、小型标题底板、标题前图标点缀、标题栏底部高光、顶部弱分割线、底部连续结构线、角标折线、深色网格背景、中心弱光晕、低透明扫描线。",
    "decorations 默认生成安全 custom svgContent，可通过 props.style 覆盖具体位置，但仍必须保持与 title/mainChart 的安全距离。",
    "模块层只做布局编排和主题映射，组件细节仍由 component capability 和 generateComponentsSchema 处理。",
  ],
  supportedMainComponents: ["PieChart"],
  examples: [
    {
      title: "科技风饼图面板",
      props: {
        moduleName: "ChartPanel",
        logicalId: "sales_channel_panel",
        parentLogicalId: "root",
        title: "销售渠道占比",
        style: {
          left: 48,
          top: 96,
          width: 520,
          height: 360,
          position: "absolute",
        },
        theme: {
          primaryColor: "#00E5FF",
          secondaryColor: "#7C4DFF",
          accentColor: "#FFB300",
          textColor: "#DFF8FF",
        },
        slots: {
          background: {
            componentName: "SingleImage",
            props: {
              name: "销售面板背景",
              imageBase64: "data:image/png;base64,...",
              opacity: 0.95,
            },
          },
          title: {
            componentName: "SingleText",
            props: {
              textContent: "销售渠道占比",
            },
          },
          mainChart: {
            componentName: "PieChart",
            props: {
              option: {
                color: ["#00E5FF", "#7C4DFF", "#FFB300", "#00C853"],
                legend: {
                  left: "center",
                  top: "bottom",
                },
                series: [
                  {
                    radius: ["42%", "68%"],
                  },
                ],
              },
            },
          },
          decorations: [
            {
              componentName: "SvgDecoration",
              props: {
                name: "右上角科技装饰",
                svgSource: "custom",
                svgContent:
                  '<svg viewBox="0 0 120 64" xmlns="http://www.w3.org/2000/svg"><path d="M4 60V18C4 10.268 10.268 4 18 4h42" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
                primaryColor: "#00E5FF",
                glow: {
                  isActive: true,
                  color: "rgba(0,229,255,0.55)",
                  blur: 8,
                },
              },
            },
          ],
          auxiliaryTexts: [
            {
              componentName: "SingleText",
              props: {
                name: "模块结论",
                textContent: "高等级风险占比 29.0%，处置优先级：红 / 橙",
                style: {
                  position: "absolute",
                  left: 120,
                  top: 420,
                  width: 360,
                  height: 28,
                  fontSize: 14,
                  color: "#DFF8FF",
                  textAlign: "center",
                  backgroundColor: "rgba(0,0,0,0)",
                },
              },
            },
          ],
        },
      },
    },
  ],
};
