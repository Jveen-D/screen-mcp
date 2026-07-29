import type { JsonObject } from "../../types/component.js";

export const baseTableCapability: JsonObject = {
  componentName: "BaseTable",
  displayName: "基础表格",
  description:
    "用于大屏数据展示的基础表格组件，支持表头、行样式、列宽、序号列、外边框、行下划线、轮播与入场动画配置。",
  aiRole:
    "AI 负责表格列定义（columns）、数据（data）、表头样式、行样式、列配置、边框、间距、轮播、位置尺寸与入场动画；MCP 负责把 columns/data 同步到 chartData 并补齐其余 props。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "BaseTable",
      description: "组件类型，必须固定为 BaseTable。",
    },
    {
      path: "logicalId",
      type: "string",
      description: "组件唯一 ID，由 AI 生成；后端限制最长 50 个字符，必须包含短随机段以保证大屏内全局唯一。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "父级组件或分组 ID，由 AI 生成。",
    },
    {
      path: "style",
      type: "object",
      description: "组件在大屏画布上的位置、尺寸和背景。",
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
    { path: "name", type: "string", description: "图层名称。" },
    {
      path: "columns",
      type: "array<object>",
      description:
        "表格列定义数组。每项包含 field（字段名）、label（表头显示名），数值列可设置 type: 'number'。MCP 会据此生成 chartData.indicator。",
      children: [
        {
          path: "columns[i].field",
          type: "string",
          description: "列字段名，对应 chartData.constant.data 中的 key。",
        },
        {
          path: "columns[i].label",
          type: "string",
          description: "表头显示文本。",
        },
        {
          path: "columns[i].type",
          type: "enum",
          values: ["string", "number"],
          description: "列数据类型。number 会生成 DECIMAL 指标并保留数值。",
        },
      ],
    },
    {
      path: "data",
      type: "array<object>",
      description: "表格数据数组。每项对象的 key 与 columns 中的 field 对应。MCP 会同步到 chartData.constant.data。",
    },
    {
      path: "headerConfig",
      type: "object",
      description: "表头样式配置。",
      children: [
        {
          path: "headerConfig.isShowHeader",
          type: "boolean",
          description: "是否显示表头。",
        },
        {
          path: "headerConfig.backgroundColor",
          type: "color",
          description: "表头背景色。",
        },
        {
          path: "headerConfig.fontFamily",
          type: "string",
          description: "表头字体。",
        },
        {
          path: "headerConfig.fontSize",
          type: "number",
          description: "表头字号。",
        },
        {
          path: "headerConfig.color",
          type: "color",
          description: "表头文字颜色。",
        },
        {
          path: "headerConfig.textAlign",
          type: "enum",
          values: ["left", "center", "right"],
          description: "表头对齐方式。",
        },
        {
          path: "headerConfig.fontStyle",
          type: "enum",
          values: ["normal", "italic", "oblique"],
          description: "表头字体样式。",
        },
        {
          path: "headerConfig.fontWeight",
          type: "enum",
          values: ["normal", "bold", "bolder"],
          description: "表头字重。",
        },
        {
          path: "headerConfig.letterSpacing",
          type: "number",
          description: "表头字距。",
        },
        {
          path: "headerConfig.lineHeight",
          type: "number",
          description:
            "表头行高，按像素理解，不是倍率。不要写 1 这类文本行高；建议至少与字号同级，或直接使用 24~40 之间的可见高度。",
        },
      ],
    },
    {
      path: "rowConfig",
      type: "object",
      description: "行样式配置。",
      children: [
        {
          path: "rowConfig.backgroundColor",
          type: "color",
          description: "行背景色。",
        },
        {
          path: "rowConfig.stripe",
          type: "object",
          description: "斑马纹配置，帮助横向追踪数据行。",
          children: [
            { path: "rowConfig.stripe.isShow", type: "boolean", description: "是否显示斑马纹。" },
            {
              path: "rowConfig.stripe.backgroundColor",
              type: "color",
              description: "间隔行背景色。",
            },
          ],
        },
        {
          path: "rowConfig.hover",
          type: "object",
          description: "鼠标悬停行的反馈样式。",
          children: [
            { path: "rowConfig.hover.isShow", type: "boolean", description: "是否启用悬停高亮。" },
            {
              path: "rowConfig.hover.backgroundColor",
              type: "color",
              description: "悬停行背景色。",
            },
          ],
        },
            {
              path: "rowConfig.rowLineHeight",
              type: "number",
              description:
                "行高，按像素理解，不是倍率。建议保持在 28~40 之间，并与字体大小匹配。",
            },
        {
          path: "rowConfig.selectStyle",
          type: "object",
          description: "行选中高亮样式。",
          children: [
            {
              path: "rowConfig.selectStyle.selectHighLight",
              type: "boolean",
              description: "是否开启选中高亮。",
            },
            {
              path: "rowConfig.selectStyle.backgroundColor",
              type: "color",
              description: "选中行背景色。",
            },
            {
              path: "rowConfig.selectStyle.color",
              type: "color",
              description: "选中行文字颜色。",
            },
            {
              path: "rowConfig.selectStyle.fontSize",
              type: "number",
              description: "选中行字号。",
            },
            {
              path: "rowConfig.selectStyle.textAlign",
              type: "enum",
              values: ["left", "center", "right"],
              description: "选中行对齐方式。",
            },
            {
              path: "rowConfig.selectStyle.fontStyle",
              type: "enum",
              values: ["normal", "italic", "oblique"],
              description: "选中行字体样式。",
            },
            {
              path: "rowConfig.selectStyle.fontWeight",
              type: "enum",
              values: ["normal", "bold", "bolder"],
              description: "选中行字重。",
            },
            {
              path: "rowConfig.selectStyle.letterSpacing",
              type: "number",
              description: "选中行字距。",
            },
            {
              path: "rowConfig.selectStyle.lineHeight",
              type: "number",
              description:
                "选中行行高，按像素理解，不是倍率。建议保持在 28~40 之间，并与字体大小匹配。",
            },
          ],
        },
      ],
    },
    {
      path: "columnConfig",
      type: "object",
      description: "列配置，包括序号列与普通列。",
      children: [
        {
          path: "columnConfig.sequenceCol",
          type: "object",
          description: "序号列配置。",
          children: [
            {
              path: "columnConfig.sequenceCol.isShowCount",
              type: "boolean",
              description: "是否显示序号列。",
            },
            {
              path: "columnConfig.sequenceCol.title",
              type: "string",
              description: "序号列表头文本。",
            },
            {
              path: "columnConfig.sequenceCol.startNum",
              type: "number",
              description: "序号起始值。",
            },
            {
              path: "columnConfig.sequenceCol.columnWidth",
              type: "number",
              description: "序号列宽度。",
            },
            {
              path: "columnConfig.sequenceCol.textAlign",
              type: "enum",
              values: ["left", "center", "right"],
              description: "序号列对齐方式。",
            },
          ],
        },
        {
          path: "columnConfig.ordinaryCol",
          type: "object",
          description: "普通列配置。",
          children: [
            {
              path: "columnConfig.ordinaryCol.columnWidth",
              type: "number",
              description: "普通列最小宽度，组件会根据容器宽度自适应缩放。",
            },
            {
              path: "columnConfig.ordinaryCol.textAlign",
              type: "enum",
              values: ["left", "center", "right"],
              description: "普通列对齐方式。",
            },
            {
              path: "columnConfig.ordinaryCol.TextOverflow",
              type: "enum",
              values: ["ellipsis", "wrap"],
              description: "文字溢出处理方式。",
            },
            {
              path: "columnConfig.ordinaryCol.cellPadding",
              type: "number",
              range: [0, 32],
              description: "单元格左右内边距，单位 px。",
            },
            {
              path: "columnConfig.ordinaryCol.showTooltip",
              type: "boolean",
              description: "是否在悬停单元格时展示完整内容。",
            },
            {
              path: "columnConfig.ordinaryCol.fontFamily",
              type: "string",
              description: "普通列字体。",
            },
            {
              path: "columnConfig.ordinaryCol.fontSize",
              type: "number",
              description: "普通列字号。",
            },
            {
              path: "columnConfig.ordinaryCol.color",
              type: "color",
              description: "普通列文字颜色。",
            },
            {
              path: "columnConfig.ordinaryCol.fontStyle",
              type: "enum",
              values: ["normal", "italic", "oblique"],
              description: "普通列字体样式。",
            },
            {
              path: "columnConfig.ordinaryCol.fontWeight",
              type: "enum",
              values: ["normal", "bold", "bolder"],
              description: "普通列字重。",
            },
            {
              path: "columnConfig.ordinaryCol.letterSpacing",
              type: "number",
              description: "普通列字距。",
            },
          ],
        },
      ],
    },
    {
      path: "baseBorder",
      type: "object",
      description: "外边框配置。",
      children: [
        {
          path: "baseBorder.isShow",
          type: "boolean",
          description: "是否显示外边框。",
        },
        {
          path: "baseBorder.borderSize",
          type: "number",
          description: "外边框宽度。",
        },
        {
          path: "baseBorder.borderColor",
          type: "color",
          description: "外边框颜色。",
        },
      ],
    },
    {
      path: "outLineBorder",
      type: "object",
      description: "行下划线配置。",
      children: [
        {
          path: "outLineBorder.isShow",
          type: "boolean",
          description: "是否显示行下划线。",
        },
        {
          path: "outLineBorder.borderSize",
          type: "number",
          description: "行下划线宽度。",
        },
        {
          path: "outLineBorder.borderColor",
          type: "color",
          description: "行下划线颜色。",
        },
      ],
    },
    {
      path: "lineSpace",
      type: "number",
      description: "行间距。",
    },
    {
      path: "columnSpace",
      type: "number",
      description: "列间距。",
    },
    {
      path: "carousel",
      type: "boolean",
      description: "是否开启轮播。",
    },
    {
      path: "carouselSpeed",
      type: "number",
      description: "轮播速度，单位毫秒。",
    },
    {
      path: "emptyText",
      type: "string",
      description:
        "无有效数据时独立空状态显示的文案，此时不显示表头和表体；缺失或仅包含空白字符时统一回退为“暂无数据”。",
    },
    {
      path: "style",
      type: "object",
      description: "位置、尺寸、层级与背景色。",
    },
    {
      path: "rotate",
      type: "number",
      range: [-360, 360],
      description: "旋转角度。",
    },
    {
      path: "opacity",
      type: "number",
      range: [0, 1],
      description: "不透明度。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "chartData",
      reason: "基础表格数据源结构由 MCP 根据 columns/data 同步维护，AI 不应直接生成。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "对象按 key 深合并。",
    "AI 可填写 columns 与 data；MCP 会归一化为完整有效的 chartData，并同步 originalData、fieldList、indicator 与 dimension。",
    "columns/data 在归一化后会被删除，仅保留 chartData 作为最终数据源。",
    "chartData.dimension 固定为空数组。",
    "chartData.sourceType 固定为 'constant'。",
    "headerConfig.lineHeight、rowConfig.rowLineHeight 和 rowConfig.selectStyle.lineHeight 都按像素处理；如果 AI 误传 1 这类过小值，MCP 会抬升到可见高度。",
    "cellPadding 会限制在 0~32；斑马纹、悬停态和 Tooltip 都由显式配置控制。",
    "无有效数据时前端只渲染独立空状态，不渲染表头和表体；emptyText 缺失或仅含空白字符时由 MCP 归一化为“暂无数据”。",
  ],
  examples: [
    {
      title: "设备状态基础表格",
      props: {
        componentName: "BaseTable",
        logicalId: "base_table_devices",
        parentLogicalId: "screen_group",
        name: "设备状态",
        columns: [
          { field: "name", label: "设备名称" },
          { field: "status", label: "状态" },
          { field: "value", label: "数值", type: "number" },
        ],
        data: [
          { name: "设备1", status: "运行中", value: 101 },
          { name: "设备2", status: "待机", value: 72 },
          { name: "设备3", status: "运行中", value: 135 },
        ],
        headerConfig: {
          isShowHeader: true,
          backgroundColor: "rgba(80,166,220,0.4)",
          color: "rgba(235, 245, 255, 1)",
          fontSize: 12,
          fontWeight: "bold",
          textAlign: "center",
          lineHeight: 32,
        },
        rowConfig: {
          backgroundColor: "rgba(80,166,220,0.1)",
          rowLineHeight: 34,
        },
        columnConfig: {
          sequenceCol: {
            isShowCount: false,
          },
          ordinaryCol: {
            columnWidth: 129,
            color: "rgba(159, 192, 222, 1)",
            textAlign: "center",
          },
        },
        baseBorder: {
          isShow: true,
          borderColor: "rgba(76,117,141,1)",
          borderSize: 1,
        },
        outLineBorder: {
          isShow: true,
          borderColor: "rgba(76,117,141,0.247)",
          borderSize: 1,
        },
        style: {
          position: "absolute",
          left: 80,
          top: 160,
          width: 520,
          height: 280,
          zIndex: 1,
          backgroundColor: "#324e6b",
        },
      },
    },
  ],
};
