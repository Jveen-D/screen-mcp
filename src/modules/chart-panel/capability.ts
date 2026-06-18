import type { JsonObject } from "../../types/component.js";

type LayoutRuleGroup = JsonObject & {
  category: string;
  priority: "must" | "should" | "niceToHave";
  description: string;
  rules: string[];
};

export const chartPanelCapability: JsonObject = {
  moduleName: "ChartPanel",
  displayName: "图表面板",
  description:
    "通用图表面板模块，用 __Group__ 分组承载背景、标题、主图表和装饰元素，生成可直接放入大屏编辑器的模块树 schema。",
  groupSchema: {
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {},
    description:
      "大屏由多个模块组成，每个模块必须是一个 __Group__ 分组；分组 id 使用模块 logicalId，title 使用模块标题，children 存放 PieChart、SingleText、SvgDecoration、SingleImage 等子组件或嵌套分组。",
    fields: [
      { path: "id", type: "string", description: "分组唯一标识。" },
      { path: "componentName", type: "string", value: "__Group__" },
      { path: "structVersion", type: "string", value: "0.0.0" },
      { path: "props", type: "object", value: {} },
      { path: "title", type: "string", description: "分组标题。" },
      { path: "isHidden", type: "boolean", value: false },
      { path: "isLocked", type: "boolean", value: false },
      { path: "isGroup", type: "boolean", value: true },
      { path: "children", type: "array", description: "分组内子组件或子分组。" },
    ],
  },
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
      description: "主图表 slot，当前可使用 PieChart、ThreeDPieChart、LineChart、BarChart、RingChart、StackBarChart、StackLineChart、BarChart25D、BarProgress、LiquidFill、RoseChart、ScatterChart。",
    },
  ],
  optionalProps: [
    {
      path: "title",
      type: "string",
      description: "标题文本。也可通过 slots.title.props.textContent 覆盖。",
    },
    {
      path: "dataItems",
      type: "array<{name:string,type?:string,value:number}>",
      description:
        "模块主数据。用于驱动 PieChart 的 chartData.constant.data，也可作为中心摘要和侧边信息卡的数据来源。若 mainChart 未显式提供 chartData，MCP 会优先使用 dataItems 生成完整饼图 chartData。",
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
        "背景图，默认铺满整个模块。AI 应主动设计并生成轻量 base64 科技风背景图；用户未提供素材时也应自行生成，而不是回退到纯色背景。只有当用户明确禁止图片背景时才可省略 imageBase64。",
    },
    title: {
      supportedComponents: ["SingleText"],
      required: false,
      multiple: false,
      description: "标题文本，默认位于模块顶部。",
    },
    mainChart: {
      supportedComponents: ["PieChart", "ThreeDPieChart", "LineChart", "BarChart", "RingChart", "StackBarChart", "StackLineChart", "BarChart25D", "BarProgress", "LiquidFill", "RoseChart", "ScatterChart"],
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
    "最终用户通常只会说“生成风险大屏”“做一个销售模块”这类简短需求；MCP 必须自动补齐合理布局、数据同源、标题承托、图例空间、侧边摘要和装饰层级，不要等待用户逐项说明设计细节。",
    "当用户没有显式提供 slots.background、slots.decorations 或 slots.auxiliaryTexts 时，ChartPanel 仍会自动生成深色背景、结构装饰、中心总数、侧边 Top 项和底部结论；不要因为用户没说细节就只输出标题加主图。",
    "最终用户通常不会主动提入场动画；MCP 应默认设计克制的入场动画，让模块出现更有层次，但不能为了炫技让所有元素使用强动效。",
    "ChartPanel 默认动画策略：背景默认不启用入场动画；标题、标题承托和结构装饰使用 animate__fadeInLeft；主图表使用 animate__zoomIn；侧边信息和底部结论使用 animate__fadeInLeft。",
    "入场动画只使用 entryAnimiation.isShow 和 entryAnimiation.type；可选 type 包括 animate__lightSpeedInRight、animate__fadeInLeft、animate__zoomIn、animate__rollIn、animate__jackInTheBox、animate__heartBeat、animate__bounceInDown、animate__rubberBand、animate__bounce。",
    "默认大屏模块应优先使用 fadeInLeft、zoomIn、lightSpeedInRight 这类方向明确但克制的动画；heartBeat、rubberBand、bounce、jackInTheBox 只适合用户明确要求活泼、强调或告警时使用。",
    "即使用户说“不要太花”“简洁一点”，也不能取消基础结构和入场动画；应理解为降低装饰密度、透明度和动画强度，仍保留标题承托、面板边界、侧边信息卡容器、底部结论承托和克制入场动画。",
    "所有子组件都以 module.style 为容器基准计算绝对位置。",
    "渲染层级由 ComponentSchema[] 输出顺序控制：数组越靠前越在顶层，数组越靠后越在底层。",
    "ChartPanel 默认输出顺序为 title、auxiliaryTexts、titleBadge、decorations、mainChart、background，使标题和业务文本在上层、标题承托和结构装饰在其下方、背景最底层。",
    "图片组件 SingleImage 默认只能作为背景、纹理或光效使用，必须排在 SingleText、SvgDecoration、PieChart 等真实内容和图标装饰之后；否则图片会成为最高层并遮盖文字、图标或图表。",
    "不要依赖 zIndex 控制模块内层级；模块内层级只由 ComponentSchema[] 输出顺序决定，zIndex 只是兼容旧 schema 的字段，可保留默认值。",
    "组件 id 后端限制最长 50 个字符，且大屏内所有 id 必须全局唯一；生成 logicalId、派生子组件 logicalId 和 __Group__ id 时必须加入短随机段防止重复，同时保留语义后缀，禁止把长标题、长中文文案或完整业务描述拼进 id。",
    "background 默认铺满模块区域，并作为数组最后一项输出。",
    "科技风背景必须使用深色系，例如 #020A18、#061A2E、#07182F 或 rgba(4,16,32,0.92)，禁止大面积高饱和纯色背景。",
    "禁止使用 green、lime、red、yellow、bright purple 等大面积高饱和纯色作为面板背景。",
    "background 必须由 AI 主动设计：优先使用 AI 生成的 imageBase64 科技风背景；无素材时也应生成 base64 渐变/网格/光效背景。只有当用户明确禁止图片背景时才允许使用 MCP 内置深色网格背景。",
    "禁止在无用户禁止的情况下，把 background 留空或仅使用 style.backgroundColor 填充；每个模块都应有一个经过设计的 SingleImage 背景或明显的 SVG 结构装饰。",
    "每个 ChartPanel 模块必须有可见的标题（title slot 或 input.title），除非用户明确说'不要标题'。标题不能省略或隐藏。",
    "每个 ChartPanel 模块必须至少包含一种可见的 SVG 装饰：标题承托、面板边框、角标、结构线或网格纹理中的一种；禁止输出裸标题加裸图表。",
    "模块应填满其分配到的画布区域，主图和文字应根据区域宽高重新计算，避免在巨大空框中显得过小或漂浮。",
    "当多个 ChartPanel 共同组成一张大屏时，模块之间应保持统一间距（默认 20~30px），并对齐形成清晰网格；禁止模块重叠或大小差异过大导致画布混乱。",
    "同一张大屏内的所有模块（包括非 ChartPanel 直接生成的面板）必须共享一致的背景色、标题承托样式和边框/角标装饰语言；禁止某个模块使用完全不同的边框或背景风格。",


    "标题必须有视觉承托，但默认应使用轻量线性承托：短横线、折线、角标、局部光点、弱透明下划线或细描边。避免大面积高亮实色标题底板。",
    "标题承托应与模块整体边框语言一致，不能像单独贴上去的亮色牌子；标题背景不应比主图、右侧信息卡或关键指标更抢视觉重心。",
    "当使用横向顶部栏时，应把它当作面板结构的一部分：它可以承接标题、图例和边框语言，但透明度必须克制，主题色只用于描边、短线、点缀和局部高光，避免整块青色或高饱和色填充。",
    "默认科技风标题承托的填充透明度应低于 0.18；如果无法确保协调，优先不用填充，只用线条和光点。",
    "标题前可使用三角光标、短竖线、小圆点、斜切线框、微发光角标等点缀，但必须预留标题文字左边距，不能压住标题文字。",
    "mainChart 应根据标题、图例和装饰重新计算主体区域：避免图表过小或上方大面积留白；不要固定套用某一张设计稿的 top、height 参数。",
    "当模块存在右侧摘要卡时，mainChart 必须只占用左侧主图安全区，不能按整个模块居中；PieChart 的 style.left/top/width/height、中心总数文本、连接线起点必须共用同一个最终 chartStyle 计算，禁止出现饼图和中心总数分离。",
    "ChartPanel 的 schema 顺序必须服务真实遮挡关系：背景最底，PieChart 必须排在中心总数和中心说明之后，中心总数、中心说明、右侧摘要等 SingleText 必须排在 PieChart 之前，避免饼图 canvas 遮住中心文字。",
    "PieChart 在 ChartPanel 中必须清理默认 series 布局偏移：series[0].left/top/right/bottom 应由 MCP 归零，圆心只由 series[0].center 控制，避免默认 left 偏移或 AI 覆盖让饼图实际环心漂移。",
    "legend 的位置要服务结构：放在标题下方时用于承接标题和图表；放在底部时必须和底部装饰留出距离；放在侧边时要给主图留出足够空间。",
    "右侧摘要存在时，底部 legend 只能在 mainChart 容器宽度内排布，不能横穿到右侧摘要卡区域；若分类较多导致 legend 单行超宽，应缩小 itemGap/itemWidth/fontSize、上移 legend 或收缩饼图半径，而不是扩大 legend 到摘要区域。",
    "PieChart 的 legend 默认必须保留，除非用户明确要求隐藏。右侧信息卡只能展示 Top N、异常项、重点项或用户关心项，不能替代 legend 的完整分类展示和点击切换能力。",
    "legend 不能停留在朴素原生小圆点列表；默认应设计成大屏状态胶囊或分组标签：更清晰的图标尺寸、合理 itemGap、科技色文字、弱透明底、细描边或轻量承托，但仍必须保留 ECharts legend 的点击切换能力。",
    "legend 的视觉重量必须低于主图和结论文案：默认使用弱透明底和细边框即可，避免高亮实底、过粗边框或过重字重让 legend 抢占阅读焦点。",
    "右侧信息卡不是 legend，不要把右侧卡片标题、图层名称或正文写成“图例”“等级图例”或“风险图例”；风险场景优先命名为“处置建议”，通用场景可命名为“重点摘要”。",
    "右侧信息卡标题不能压在边框线上；若使用切角边框或顶部线条，应给标题留出断口、内缩或上方安全距离，让标题像卡片结构的一部分而不是浮在边框上。",
    "legend 与侧边摘要应共享颜色语义：侧边摘要每行可用小色点、短色条或弱发光标记锚定对应分类，帮助用户把右侧解释与饼图扇区、legend 关联起来。",
    "右侧摘要卡如果使用横线承托每条摘要，横线必须用独立 SvgDecoration 按摘要文本行的 top、height、rowStep 生成，不能把横线画死在背景图或 imageBase64 里，否则动态行高、两行文本和不同条数会难以对齐。",
    "右侧摘要卡高度应跟随摘要条数和行高收敛，不要把少量单行摘要撑成过高空框；同时底部结论文案必须与右侧摘要卡、摘要背景图或摘要 SVG 贴图、底部结构线保持安全距离，禁止贴住侧边卡边框、贴住摘要贴图或被底部装饰压住。",
    "底部结论位置不能只用固定 bottom 偏移，应按侧边摘要卡 bottom、安全间距和底部结构线 top 联合计算；默认与侧边摘要卡至少保持 28px 左右的垂直间隔，与底部结构线保持约 12px 的可见间隔，避免离底部结构线过远。",
    "当 PieChart 使用底部 legend 且开启外部 label 时，必须先按图表宽高、数据项数量、分类名长度和 legend itemGap 预判 legend 是否会换行；一旦预估会换行，就要给 legend 预留多行安全区，并同步压缩图例间距、缩小饼图外半径、上移圆心和收短 labelLine。",
    "当 PieChart 使用底部 legend 时，MCP 应同时调整 option.legend.offsetY、option.series[0].center 和 option.series[0].radius；这些值不是固定模板，应根据可用宽高和 legend 预估行数生成。窄图表或 5 项以上数据通常需要更小 itemGap、更小 outerRadius 和更靠上的 centerY。",
    "当 legend 预估单行安全、数据项较少且主图宽高足够时，不要过度收缩饼图；应适当增大 outerRadius、让圆心更接近视觉中心，并缩短 legend 与饼图之间的距离，让饼图成为模块主视觉。",
    "如果 mainChart 是 PieChart，应按语义选择实心饼图、环形图或细环；不要默认把所有饼图都做成同一种蓝色实心饼图。",
    "饼图色彩应按主题生成：风险、等级、状态类可使用同一色系明暗层级；销售、渠道、品类类可使用主色、辅色、强调色和低饱和补色组合。",
    "饼图标签应形成标注系统：外部 label、labelLine、字号、字重和颜色要统一；强标注适合分析类稿件，轻标注适合数据密集模块。",
    "当模块已经有中心摘要、右侧处置建议/重点摘要和底部结论时，PieChart label 仍应保留作为扇区定位识别，但必须轻量化：默认 show=true、formatter: \"{b}\"、字号和 labelLine 随安全区收缩；右侧摘要负责数值、占比和业务判断，避免 label 重复展示完整数据。",
    "同一组数据在主图、中心摘要、侧边信息卡和底部说明中要分工展示：legend 负责完整分类与点击切换，中心摘要负责总量或核心指标，侧边卡负责占比和解释，底部说明负责结论；不要让多处文本以同等强度重复完整信息。",
    "右侧重点摘要不能只是 legend 或饼图 label 的数据复读；每条摘要除了保留分类名、数值和占比，还应补充一句业务判断，例如新能源场景使用“主体供给”“调峰支撑”“补充供给”，客户来源场景使用“主要获客”“口碑转化”“自然流量”。",
    "右侧重点摘要必须结构化为多个 SingleText：标题单独一个组件，每条摘要单独一个组件；禁止把“重点摘要 + 产品问题 38 38% + 物流延迟 27 27% + 服务态度 19 19%”拼成一个大字符串放进同一个 SingleText，否则真实渲染会失去行级对齐控制。",
    "饼图中心大数字和中心说明必须保留清晰垂直间距；中心说明字号应低于主数值，避免贴住数字或削弱扇区主体。",
    "主图数据必须和中心摘要、右侧信息卡保持同源：若右侧卡片展示了高风险 18、中风险 37、低风险 71 这类数据，则 PieChart 的 chartData.constant.data 必须包含相同 name/value，不允许回退到默认类目数据。",
    "右侧信息卡必须保留原始分类名，不要把“门店自然到访”改写成“门店到访”；如果需要解释，只能在第二行补充短语，不能替换或截断主分类。",
    "右侧信息卡两行排版时，第一行只放“分类名 + 数值 + 占比”，第二行放不超过 6 个汉字的短解释，例如“主要获客”“口碑转化”“自然流量”“活动引流”；禁止把解释词拆成“重 / 点来源”这类断裂换行。",
    "右侧信息卡两行摘要必须给正文预留足够宽度：默认卡片宽度应接近模块宽度的 36%，正文区域宽度不低于 156px，字号可降到 13px，避免“主要获客”“18.5%”这类短词和百分比被拆行。",
    "客户来源、获客、引流、渠道类场景要使用业务语义摘要：线上广告可解释为主要获客，老客户推荐可解释为口碑转化，门店自然到访可解释为自然流量，活动引流可解释为活动引流。",
    "模块必须使用真实组件表达真实内容：主图表必须使用 slots.mainChart 的 PieChart；业务文本必须使用 title 或 auxiliaryTexts 的 SingleText；SvgDecoration 只允许做装饰。",
    "当需要直接复制到编辑器时，优先调用 generate_module_tree_schema；它会返回 __Group__ 根节点，children 内放完整子组件节点。",
    "禁止用 SvgDecoration 的 svgContent 手绘饼图、环形图、信息卡正文、标题、数值、占比或结论说明。",
    "不要因为禁止 SVG 承载真实内容而省略 SvgDecoration；合格的 ChartPanel 至少应包含标题承托、面板边框、侧边信息卡外框、分割线或连接线中的一种装饰结构。",
    "SvgDecoration 是科技感和模块承载结构的主要来源，禁止把“不能用 SVG 画业务内容”理解成“不使用 SVG 装饰”；即使用户没有明确说装饰，也必须保留可见的标题承托、侧边容器和底部结构线。",
    "默认装饰必须肉眼可见但不抢主信息：优先使用主题色描边、低透明填充、弱发光和连续结构线；不要只生成透明度过低或依赖不可见继承色的 SVG。",
    "内置 DEFAULT_* SVG 只能作为最低保底结构，不是固定设计模板；当用户、AI 或上层编排已经提供标题承托、侧边卡、底部结构、连接线或背景纹理时，应优先使用已有设计，禁止为了套默认风格强行替换或重复追加。",
    "同一张大屏内如果包含多个 ChartPanel 模块，不能让所有模块都使用同一套 DEFAULT_* SVG 形态；MCP 应鼓励 AI 按业务主题、模块大小和信息层级生成差异化的线性承托、角标、卡片边界、底部收束和背景纹理，默认 SVG 只在缺失关键结构时弱兜底。",
    "需要沉淀的是结构原则而不是固定图形：标题要有承托、摘要要有容器和色标、底部要有收束、背景要有弱边界，但具体 SVG 形态、路径长度、角标样式和线条组合应允许 AI 自主变化。",
    "在完成去重和降权之后，不能把结构感削没：默认仍要保留弱背景网格、面板边界、标题线性承托、侧边摘要色标、侧边分割线和底部结构线；这些结构应使用主题色低透明表达，不能回退成普通深色空卡片。",
    "侧边摘要卡行距要收敛，三条两行摘要不应撑成过高空框；色标只承担颜色锚点，不承载文字，必须贴近对应摘要行帮助关联饼图、legend 和右侧解释。",
    "ChartPanel 不允许只输出裸标题、裸图表、裸说明文字。即使用户要求简洁，也必须保留至少三类结构装饰：标题承托、内容或面板边界、侧边信息卡容器或分割线。",
    "侧边信息卡如果出现风险等级、占比或说明文字，文字必须用 SingleText，信息卡外框、左侧色条、底纹和短连接线应使用 SvgDecoration 或背景组件表达。",
    "告警、预警、设备异常这类场景不要套用风险处置文案；严重告警优先使用“优先处理”，一般告警使用“持续跟进”，提示告警使用“常规关注”。",
    "右侧重点摘要默认按单行文本生成：如果某条摘要没有换行，SingleText 必须 height = fontSize 且 lineHeight = 1；只有当卡片宽度不足、告警类场景或摘要文案预估单行放不下时，才主动切换为两行排版，并同步增加行高、卡片高度和底部结论安全空间。",
    "当 PieChart 下方有 legend 且右侧有摘要卡时，外部 label 应进一步轻量化：字号、labelLine 长度和饼图外半径要随 legend 预估行数收缩，避免底部方向 label 压住 legend。",
    "不要只靠隐藏 legend、扩大组件、关闭 label 或限制侧边摘要个数解决挤压；legend 偏移用于微调，圆心和半径用于重新分配主图安全区，legend 换行风险必须通过尺寸和数据项预估提前处理。",
    "侧边信息卡适合展示 Top N、异常项、重点项或用户关心项，这是信息分工策略，不是解决 legend 拥挤的手段；完整分类仍交给 legend，并通过安全区计算保证 legend 可读。",
    "侧边信息卡连接主图时，连接线应短、少、淡，只表达区域关联，不承载业务数据；连接线应从饼图外缘或图表区域右侧出发，末端落到侧边信息卡左边缘或标题分隔线附近，避免穿过环形图中心或悬在主图和侧卡之间；同时避免和饼图 labelLine 混成两套同样强的引线系统。",
    "底部结论默认使用主文本色，不能整句使用高亮色抢走标题和主图焦点；若需要强调，只强调关键数字或关键词，不要把整句结论都做成黄色、红色等强提示色。",
    "底部结论默认是单行 SingleText：如果文案没有换行，必须 height = fontSize 且 lineHeight = 1；不要再使用 height 42、lineHeight 1.35 这类多行文本盒。",
    "底部结论文案要准确使用业务术语，例如风险场景优先使用“高等级风险”“高风险项”“处置优先级”，避免使用含混的“高级风险”。",
    "边框、角标、背景网格、中心光晕、扫描线等装饰必须低于标题、主图和关键数据的视觉层级；当画面已经有标题栏、侧卡和主图标注时，装饰透明度应主动降低。",
    "legend 与底部 decoration 主线至少保持 12px 到 20px 间距，避免图例贴线。",
    "mainChart 默认 option.backgroundColor = transparent，使图表与面板背景协调。",
    "decorations 默认不占用左上标题安全区，优先放右上、右下、左下等角落；如必须放左侧，应放在 title 安全区下方。",
    "底部 decorations 应优先生成一条连续的主横线，再配少量辅助细线，避免多个短线条随机散落。",
    "右上 decorations 应贴合面板右上边界，宽度约 180px，高度约 72px，和底部装饰形成统一边框语言，避免像独立贴片。",
    "装饰元素应像面板框架的一部分，而不是孤立图标；优先使用横线、折线、端点圆点、弱透明辅助线。",
    "装饰生成的最低目标是让模块看起来有承载结构：标题有托底或点缀，内容区有边界或分割，侧边说明有轻量容器；不要只输出裸文字和裸图表。",
    "可使用的设计思路：标题前图标点缀、标题下方短线承托、顶部弱分割线、底部连续结构线、角标折线、深色网格背景、中心弱光晕、低透明扫描线。谨慎使用标题底板，禁止默认生成大面积亮色标题底板。",
    "decorations 默认生成安全 custom svgContent，可通过 props.style 覆盖具体位置，但仍必须保持与 title/mainChart 的安全距离。",
    "模块层只做布局编排和主题映射，组件细节仍由 component capability 和 generateComponentsSchema 处理。",
  ],
  supportedMainComponents: ["PieChart", "ThreeDPieChart", "LineChart", "BarChart", "RingChart", "StackBarChart", "StackLineChart", "BarChart25D", "BarProgress", "LiquidFill", "RoseChart", "ScatterChart"],
  examples: [
    {
      title: "科技风饼图面板",
      props: {
        moduleName: "ChartPanel",
        logicalId: "sales_channel_panel",
        parentLogicalId: "root",
        title: "销售渠道占比",
        dataItems: [
          { name: "直销", type: "渠道", value: 128 },
          { name: "代理", type: "渠道", value: 96 },
          { name: "线上", type: "渠道", value: 76 },
        ],
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
                  offsetX: 0,
                  offsetY: -6,
                },
                series: [
                  {
                    center: ["50%", "42%"],
                    radius: ["36%", "54%"],
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

const chartPanelLayoutRules = chartPanelCapability.layoutRules as string[];

const chartPanelLayoutRuleGroups: LayoutRuleGroup[] = [
  {
    category: "prompt-autonomy",
    priority: "must",
    description: "Autonomous completion for terse dashboard/module prompts.",
    rules: chartPanelLayoutRules.slice(0, 2),
  },
  {
    category: "entry-animation",
    priority: "should",
    description: "Default and allowed entry animation behavior for generated modules.",
    rules: chartPanelLayoutRules.slice(2, 7),
  },
  {
    category: "schema-output-layering",
    priority: "must",
    description: "Schema output order, grouping contract, component layering, and compatibility fields.",
    rules: chartPanelLayoutRules.slice(7, 14),
  },
  {
    category: "background",
    priority: "must",
    description: "Background image, fallback, and large-area color constraints.",
    rules: chartPanelLayoutRules.slice(14, 17),
  },
  {
    category: "title-support",
    priority: "should",
    description: "Title bearing structure and visual weight constraints.",
    rules: chartPanelLayoutRules.slice(17, 22),
  },
  {
    category: "main-chart-pie-layout",
    priority: "must",
    description: "Main PieChart safe area, chart sizing, schema order, and center text alignment.",
    rules: chartPanelLayoutRules.slice(22, 26),
  },
  {
    category: "legend",
    priority: "must",
    description: "Legend retention, positioning, visual weight, side-summary separation, and wrapping strategy.",
    rules: chartPanelLayoutRules.slice(26, 40),
  },
  {
    category: "pie-labels",
    priority: "should",
    description: "Pie label visibility, formatter, label line, and visual annotation constraints.",
    rules: chartPanelLayoutRules.slice(40, 45),
  },
  {
    category: "side-summary-and-data-semantics",
    priority: "must",
    description: "Side summary semantics, data consistency, and business wording.",
    rules: chartPanelLayoutRules.slice(45, 53),
  },
  {
    category: "svg-decoration-content-boundary",
    priority: "must",
    description: "Real component boundaries, SVG misuse prevention, and visible structural decoration requirements.",
    rules: chartPanelLayoutRules.slice(53, 66),
  },
  {
    category: "side-summary-layout-and-connectors",
    priority: "must",
    description: "Side summary row height, alarm wording, label compression, and connector-line placement.",
    rules: chartPanelLayoutRules.slice(66, 72),
  },
  {
    category: "bottom-conclusion",
    priority: "must",
    description: "Bottom conclusion spacing, line box, visual weight, and wording.",
    rules: chartPanelLayoutRules.slice(72, 77),
  },
  {
    category: "svg-decoration-structure",
    priority: "must",
    description: "Chart background transparency and structural decoration design details.",
    rules: chartPanelLayoutRules.slice(77, 86),
  },
];

chartPanelCapability.layoutRuleGroups = chartPanelLayoutRuleGroups;
