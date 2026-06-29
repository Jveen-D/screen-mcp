import type { JsonObject } from "../../types/component.js";

export const scrollListCapability: JsonObject = {
  componentName: "ScrollList",
  displayName: "滚动表格",
  description:
    "用于展示多列数据的滚动表格组件，支持表头、行样式、高亮、序号列、匹配高亮与滚动动画，适用于大屏数据列表场景。",
  aiRole:
    "AI 负责列定义（columns）、数据（data）、行数、行间距、滚动动画、表头/行/列样式与组件布局；MCP 负责把 columns/data 同步到 datasource.constantTableColumns、fieldMappings 与 constantData。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "ScrollList",
      description: "组件类型，必须固定为 ScrollList。",
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
      path: "title",
      type: "string",
      description: "组件标题，与 name 语义一致时可复用。",
    },
    {
      path: "columns",
      type: "array<object>",
      description:
        "表格列定义，每项包含 { field, label }。field 对应数据字段名，label 对应表头显示文本。MCP 会同步到 datasource.fieldMappings[0].mapFields。",
      children: [
        {
          path: "columns[i].field",
          type: "string",
          description: "数据字段名，如 region、rate、status。",
        },
        {
          path: "columns[i].label",
          type: "string",
          description: "表头显示文本，如 地区、完成率、完成情况。",
        },
      ],
    },
    {
      path: "data",
      type: "array<object>",
      description:
        "表格数据数组，每行一个对象，字段名需与 columns 中的 field 对应。MCP 会同步到 datasource.constantData。",
    },
    {
      path: "rowCount",
      type: "number",
      description: "可视区域显示的行数。默认 5。",
    },
    {
      path: "rowMargin",
      type: "number",
      description: "行与行之间的间距，单位 px。默认 10。",
    },
    {
      path: "animateProps",
      type: "object",
      description: "滚动动画配置。",
      children: [
        {
          path: "animateProps.animate",
          type: "boolean",
          description: "是否开启动画。默认 false。",
        },
        {
          path: "animateProps.animationType",
          type: "enum",
          values: ["pageSwitch", "rowScroll"],
          description: "动画形式：整页切换或逐条滚动。默认 rowScroll。",
        },
        {
          path: "animateProps.direction",
          type: "enum",
          values: ["top2Bottom", "bottom2Top"],
          description: "轮播方向。默认 bottom2Top。",
        },
        {
          path: "animateProps.hoverPause",
          type: "boolean",
          description: "鼠标悬停是否暂停轮播。默认 false。",
        },
        {
          path: "animateProps.interval",
          type: "number",
          description: "动画间隔时长，单位秒。默认 1。",
        },
        {
          path: "animateProps.duration",
          type: "number",
          description: "动画持续时长，单位秒。默认 2。",
        },
        {
          path: "animateProps.endBehavior",
          type: "enum",
          values: ["continue", "restart"],
          description: "逐条滚动到末尾后的衔接方式。默认 continue。",
        },
        {
          path: "animateProps.switchType",
          type: "enum",
          values: ["page", "flip"],
          description: "整页切换时的切换效果。默认 flip。",
        },
      ],
    },
    {
      path: "rowHeader",
      type: "object",
      description: "表头配置。",
      children: [
        {
          path: "rowHeader.isShowHeader",
          type: "boolean",
          description: "是否显示表头。默认 true。",
        },
        {
          path: "rowHeader.headerHeight",
          type: "number",
          description: "表头高度，单位 px。默认 35。",
        },
        {
          path: "rowHeader.textOverflow",
          type: "enum",
          values: ["ellipsis", "wrap", "marquee"],
          description: "表头文本溢出处理。默认 ellipsis。",
        },
        {
          path: "rowHeader.headerAlign",
          type: "enum",
          values: ["left", "center", "right"],
          description: "表头文本对齐方式。默认 center。",
        },
        {
          path: "rowHeader.bgType",
          type: "enum",
          values: ["color", "image"],
          description: "表头背景类型。默认 color。",
        },
        {
          path: "rowHeader.headerBg",
          type: "color",
          description: "表头背景颜色。默认 #232630；表头必须使用不透明颜色，避免滚动行透出。",
        },
        {
          path: "rowHeader.headerBgImg",
          type: "string",
          description: "表头背景图片地址。",
        },
        {
          path: "rowHeader.fontFamily",
          type: "string",
          description: "表头字体。",
        },
        {
          path: "rowHeader.color",
          type: "color",
          description: "表头文字颜色。",
        },
        {
          path: "rowHeader.letterSpacing",
          type: "number",
          description: "表头字间距。",
        },
        {
          path: "rowHeader.fontSize",
          type: "number",
          description: "表头字号。",
        },
        {
          path: "rowHeader.fontStyle",
          type: "string",
          description: "表头字体样式，如 normal、italic。",
        },
        {
          path: "rowHeader.fontWeight",
          type: "string",
          description: "表头字重，如 normal、bold。",
        },
      ],
    },
    {
      path: "customRowStyles",
      type: "array<object>",
      description:
        "行样式数组，按索引循环作用于每一行。常用于设置斑马纹背景。默认包含两套交替样式。",
      children: [
        {
          path: "customRowStyles[i].bgType",
          type: "enum",
          values: ["color", "image"],
          description: "行背景类型。",
        },
        {
          path: "customRowStyles[i].bgColor",
          type: "color",
          description: "行背景颜色。",
        },
        {
          path: "customRowStyles[i].bgImg",
          type: "string",
          description: "行背景图片地址。",
        },
        {
          path: "customRowStyles[i].offsetX",
          type: "number",
          description: "行水平偏移量，单位 px。",
        },
        {
          path: "customRowStyles[i].borderColor",
          type: "color",
          description: "行边框颜色。",
        },
        {
          path: "customRowStyles[i].borderWidth",
          type: "number",
          description: "行边框宽度，单位 px。",
        },
        {
          path: "customRowStyles[i].radius",
          type: "number",
          description: "行圆角半径。",
        },
      ],
    },
    {
      path: "highlight",
      type: "object",
      description: "行高亮配置，控制点击或默认选中行的视觉样式。",
      children: [
        {
          path: "highlight.open",
          type: "boolean",
          description: "是否开启选中高亮。默认 false。",
        },
        {
          path: "highlight.selectCount",
          type: "number",
          description: "可同时高亮的行数。默认 1。",
        },
        {
          path: "highlight.bgType",
          type: "enum",
          values: ["color", "image"],
          description: "高亮背景类型。默认 color。",
        },
        {
          path: "highlight.bgColor",
          type: "color",
          description: "高亮背景颜色。默认 rgba(255, 146, 95, 0.96)。",
        },
        {
          path: "highlight.shadowVisible",
          type: "boolean",
          description: "是否显示阴影。默认 false。",
        },
        {
          path: "highlight.shadowColor",
          type: "color",
          description: "阴影颜色。",
        },
        {
          path: "highlight.offsetX",
          type: "number",
          description: "阴影水平偏移。",
        },
        {
          path: "highlight.offsetY",
          type: "number",
          description: "阴影垂直偏移。",
        },
        {
          path: "highlight.blur",
          type: "number",
          description: "阴影模糊半径。",
        },
        {
          path: "highlight.spread",
          type: "number",
          description: "阴影扩展半径。",
        },
      ],
    },
    {
      path: "matchStyles",
      type: "array<object>",
      description:
        "值匹配高亮数组，当单元格值等于 matchValue 时应用对应样式。可覆盖背景色、字体等。",
      children: [
        {
          path: "matchStyles[i].matchValue",
          type: "string",
          description: "要匹配的单元格值。",
        },
        {
          path: "matchStyles[i].bgType",
          type: "enum",
          values: ["color", "image"],
          description: "匹配项背景类型。",
        },
        {
          path: "matchStyles[i].bgColor",
          type: "color",
          description: "匹配项背景颜色。",
        },
      ],
    },
    {
      path: "orderColumnCfg",
      type: "object",
      description: "序号列配置。",
      children: [
        {
          path: "orderColumnCfg.show",
          type: "boolean",
          description: "是否显示序号列。默认 false。",
        },
        {
          path: "orderColumnCfg.startOrder",
          type: "number",
          description: "序号起始值。默认 1。",
        },
        {
          path: "orderColumnCfg.columnTitle",
          type: "string",
          description: "序号列表头文本。默认 #。",
        },
        {
          path: "orderColumnCfg.widthType",
          type: "enum",
          values: ["fixed", "adaptive", "flex"],
          description: "序号列宽度类型。默认 fixed。",
        },
        {
          path: "orderColumnCfg.orderAlign",
          type: "enum",
          values: ["left", "center", "right"],
          description: "序号列对齐方式。默认 center。",
        },
        {
          path: "orderColumnCfg.orderColWidth",
          type: "number",
          description: "序号列宽度。默认 60。",
        },
        {
          path: "orderColumnCfg.colMargin",
          type: "number",
          description: "序号列边距。默认 0。",
        },
      ],
    },
    {
      path: "orderStyles",
      type: "array<object>",
      description: "序号列样式数组，按 orderValue 匹配特定序号行。",
    },
    {
      path: "colConfigs",
      type: "array<object>",
      description:
        "列样式配置数组，按 colFieldName 匹配具体列；未命中的列使用 __seriesType 为 __default 的默认配置补齐。",
      children: [
        {
          path: "colConfigs[i].colFieldName",
          type: "string",
          description: "要匹配的字段名，空字符串表示默认配置。",
        },
        {
          path: "colConfigs[i].widthType",
          type: "enum",
          values: ["fixed", "adaptive", "flex"],
          description: "列宽度类型。默认 flex。",
        },
        {
          path: "colConfigs[i].colWidth",
          type: "number",
          description: "列宽度值。默认 1。",
        },
        {
          path: "colConfigs[i].colMargin",
          type: "number",
          description: "列边距。默认 0。",
        },
        {
          path: "colConfigs[i].colAlign",
          type: "enum",
          values: ["left", "center", "right"],
          description: "列内容对齐方式。默认 center。",
        },
        {
          path: "colConfigs[i].contentType",
          type: "enum",
          values: ["text", "image"],
          description: "列内容类型。默认 text。",
        },
        {
          path: "colConfigs[i].textOverflow",
          type: "enum",
          values: ["ellipsis", "wrap", "marquee"],
          description: "列文本溢出处理。默认 ellipsis。",
        },
        {
          path: "colConfigs[i].showBorder",
          type: "boolean",
          description: "是否显示列边框。默认 false。",
        },
        {
          path: "colConfigs[i].borderColor",
          type: "color",
          description: "列边框颜色。",
        },
        {
          path: "colConfigs[i].borderWidth",
          type: "number",
          description: "列边框宽度。",
        },
        {
          path: "colConfigs[i].borderRadius",
          type: "number",
          description: "列圆角半径。",
        },
        {
          path: "colConfigs[i].bgType",
          type: "enum",
          values: ["color", "image"],
          description: "列背景类型。默认 color。",
        },
        {
          path: "colConfigs[i].bgColor",
          type: "color",
          description: "列背景颜色。",
        },
        {
          path: "colConfigs[i].color",
          type: "color",
          description: "列文字颜色。",
        },
        {
          path: "colConfigs[i].fontSize",
          type: "number",
          description: "列字号。",
        },
        {
          path: "colConfigs[i].fontFamily",
          type: "string",
          description: "列字体。",
        },
        {
          path: "colConfigs[i].fontWeight",
          type: "string",
          description: "列字重。",
        },
        {
          path: "colConfigs[i].fontStyle",
          type: "string",
          description: "列字体样式。",
        },
        {
          path: "colConfigs[i].letterSpacing",
          type: "number",
          description: "列字间距。",
        },
      ],
    },
    {
      path: "vScrollbarProps",
      type: "object",
      description: "垂直滚动条样式配置。",
      children: [
        { path: "vScrollbarProps.show", type: "boolean", description: "是否显示垂直滚动条。默认 false。" },
        { path: "vScrollbarProps.railThick", type: "number", description: "滚动条轨道粗细。默认 4。" },
        { path: "vScrollbarProps.railColor", type: "color", description: "滚动条轨道颜色。" },
        { path: "vScrollbarProps.railRadius", type: "number", description: "滚动条轨道圆角。默认 0。" },
        { path: "vScrollbarProps.sliderColor", type: "color", description: "滚动条滑块颜色。" },
        { path: "vScrollbarProps.sliderRadius", type: "number", description: "滚动条滑块圆角。默认 0。" },
      ],
    },
    {
      path: "hScrollbarProps",
      type: "object",
      description: "水平滚动条样式配置。",
      children: [
        { path: "hScrollbarProps.show", type: "boolean", description: "是否显示水平滚动条。默认 false。" },
        { path: "hScrollbarProps.railThick", type: "number", description: "滚动条轨道粗细。默认 4。" },
        { path: "hScrollbarProps.railColor", type: "color", description: "滚动条轨道颜色。" },
        { path: "hScrollbarProps.railRadius", type: "number", description: "滚动条轨道圆角。默认 0。" },
        { path: "hScrollbarProps.sliderColor", type: "color", description: "滚动条滑块颜色。" },
        { path: "hScrollbarProps.sliderRadius", type: "number", description: "滚动条滑块圆角。默认 0。" },
      ],
    },
    {
      path: "style",
      type: "object",
      description: "组件位置尺寸样式，包含 left/top/width/height/backgroundColor/zIndex 等。",
    },
    {
      path: "rotate",
      type: "number",
      range: [-360, 360],
      description: "组件整体旋转角度。默认 0。",
    },
    {
      path: "opacity",
      type: "number",
      range: [0, 1],
      description: "组件整体不透明度。默认 1。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "datasource",
      reason:
        "datasource 由 MCP 根据 columns/data 自动同步 constantTableColumns、fieldMappings 与 constantData，AI 不应直接写入。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "AI 填写 columns/data 后，MCP 会重新生成完整 datasource，包括 constantTableColumns、fieldMappings[0].mapFields 与 constantData。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "rowCount、rowMargin、rotate、opacity 缺失时 MCP 会补全为默认值。",
    "animateProps、rowHeader、colConfigs、customRowStyles、highlight、orderColumnCfg 等对象缺失字段由 MCP 补齐为默认值。",
    "rowHeader.headerBg 必须是不透明颜色；若传 transparent、半透明 rgba 或带 alpha 的透明 8 位 hex，MCP 会回退到默认不透明表头色。",
    "customRowStyles 为空数组时，MCP 会重置为默认两套斑马纹样式。",
  ],
  visualRules: [
    "columns 的 field 必须与 data 中对象字段名保持一致，否则对应列会显示为空。",
    "rowCount 应结合 data 总量与组件高度设置，保证行高合理、不出现过度挤压。",
    "animateProps.animate 为 true 时，数据量需大于 rowCount 才会产生滚动效果。",
    "customRowStyles 会按行索引循环应用，建议配置 2 组样式实现斑马纹。",
    "colConfigs 中 __seriesType 为 __default 且 colFieldName 为空的配置用于兜底未单独配置的列。",
    "matchStyles 按单元格原始值精确匹配，适合对状态文本等离散值做高亮。",
  ],
  examples: [
    {
      title: "滚动表格配置示例",
      props: {
        componentName: "ScrollList",
        logicalId: "theme_scroll_list",
        parentLogicalId: "screen_group",
        name: "区域完成率排行",
        title: "区域完成率排行",
        style: {
          position: "absolute",
          left: 100,
          top: 120,
          width: 520,
          height: 280,
          zIndex: 1,
          backgroundColor: "#0a1a2f",
        },
        columns: [
          { field: "region", label: "地区" },
          { field: "rate", label: "完成率" },
          { field: "status", label: "完成情况" },
        ],
        data: [
          { region: "区域A", rate: 92.5, status: "超预期" },
          { region: "区域B", rate: 85.3, status: "达标" },
          { region: "杭州", rate: 78.6, status: "达标" },
          { region: "深圳", rate: 65.2, status: "未达标" },
          { region: "成都", rate: 54.8, status: "未达标" },
          { region: "武汉", rate: 48.1, status: "未达标" },
        ],
        rowCount: 5,
        rowMargin: 8,
        animateProps: {
          animate: true,
          animationType: "rowScroll",
          direction: "bottom2Top",
          hoverPause: true,
          interval: 1,
          duration: 0.8,
          endBehavior: "continue",
          switchType: "flip",
        },
        rowHeader: {
          isShowHeader: true,
          headerHeight: 36,
          textOverflow: "ellipsis",
          headerAlign: "center",
          bgType: "color",
          headerBg: "#0a1a2f",
          headerBgImg: "",
          color: "#BFEFFF",
          fontSize: 13,
          fontWeight: "bold",
          fontStyle: "normal",
          letterSpacing: 1,
        },
        customRowStyles: [
          {
            bgType: "color",
            bgColor: "rgba(0, 229, 255, 0.08)",
            borderColor: "#00E5FF22",
            borderWidth: 1,
            offsetX: 0,
            radius: 0,
          },
          {
            bgType: "color",
            bgColor: "rgba(0, 229, 255, 0.03)",
            borderColor: "#00E5FF22",
            borderWidth: 1,
            offsetX: 0,
            radius: 0,
          },
        ],
        colConfigs: [
          {
            __seriesType: "__default",
            colFieldName: "",
            widthType: "flex",
            colWidth: 1,
            colMargin: 0,
            showBorder: false,
            colAlign: "center",
            contentType: "text",
            textOverflow: "ellipsis",
            color: "#FFFFFF",
            fontSize: 12,
          },
          {
            colFieldName: "rate",
            widthType: "flex",
            colWidth: 1,
            colAlign: "right",
            contentType: "text",
            color: "#00E5FF",
            fontSize: 13,
            fontWeight: "bold",
          },
        ],
      },
    },
  ],
};
