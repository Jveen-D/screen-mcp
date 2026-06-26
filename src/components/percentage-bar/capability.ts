import type { JsonObject } from "../../types/component.js";

export const percentageBarCapability: JsonObject = {
  componentName: "PercentageBar",
  displayName: "百分比条",
  description:
    "用于展示单个数值在进度条上百分比位置的指标组件，支持刻度、比值文本、图标和进度条动画。",
  aiRole:
    "AI 负责数值（value/max/min）、进度条颜色、刻度、比值文本与布局；MCP 负责把 value/max/min 同步到 datasource.constantData[0] 并补齐其余 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "PercentageBar",
      description: "组件类型，必须固定为 PercentageBar。",
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
      path: "value",
      type: "number",
      description: "当前数值。MCP 会同步写入 datasource.constantData[0].value。",
    },
    {
      path: "max",
      type: "number",
      description: "最大值。MCP 会同步写入 datasource.constantData[0].max。",
    },
    {
      path: "min",
      type: "number",
      description: "最小值。MCP 会同步写入 datasource.constantData[0].min。",
    },
    {
      path: "globalConfig",
      type: "object",
      description: "进度条全局配置。",
      children: [
        {
          path: "globalConfig.barHeight",
          type: "number",
          description: "进度条高度，单位 px。",
        },
        {
          path: "globalConfig.radius",
          type: "number",
          description: "进度条圆角半径，单位 px。",
        },
        {
          path: "globalConfig.progressBarColor",
          type: "color",
          description:
            "进度条填充色，支持纯色或 CSS 渐变字符串，如 linear-gradient(...)。",
        },
        {
          path: "globalConfig.progressBarBackgroundColor",
          type: "color",
          description: "进度条背景色。",
        },
      ],
    },
    {
      path: "animationSettings",
      type: "object",
      description: "进度条动画配置。",
      children: [
        {
          path: "animationSettings.isOpenAnimation",
          type: "boolean",
          description: "是否开启动画。",
        },
        {
          path: "animationSettings.duration",
          type: "number",
          description: "动画时长，单位 ms。",
        },
        {
          path: "animationSettings.isReverse",
          type: "boolean",
          description: "是否反向播放动画。",
        },
      ],
    },
    {
      path: "tickStyle",
      type: "object",
      description: "刻度线与刻度文本样式。",
      children: [
        {
          path: "tickStyle.segmentCount",
          type: "number",
          description: "刻度分段数。",
        },
        {
          path: "tickStyle.extremeMin",
          type: "boolean",
          description: "是否显示最小值刻度。",
        },
        {
          path: "tickStyle.extremeMax",
          type: "boolean",
          description: "是否显示最大值刻度。",
        },
        {
          path: "tickStyle.dividerColor",
          type: "color",
          description: "刻度线颜色。",
        },
        {
          path: "tickStyle.dividerSize",
          type: "number",
          description: "刻度线宽度，单位 px。",
        },
        {
          path: "tickStyle.offsetX",
          type: "number",
          description: "刻度整体水平偏移，单位 px。",
        },
        {
          path: "tickStyle.offsetY",
          type: "number",
          description: "刻度整体垂直偏移，单位 px。",
        },
        {
          path: "tickStyle.textStyle",
          type: "object",
          description: "刻度文本默认样式。",
          children: [
            { path: "tickStyle.textStyle.fontFamily", type: "string", description: "字体。" },
            {
              path: "tickStyle.textStyle.fontWeight",
              type: "enum",
              values: ["normal", "bold", "bolder"],
              description: "字重。",
            },
            { path: "tickStyle.textStyle.fontSize", type: "number", description: "字号。" },
            { path: "tickStyle.textStyle.color", type: "color", description: "颜色。" },
          ],
        },
        {
          path: "tickStyle.suffix",
          type: "object",
          description: "刻度后缀配置。",
          children: [
            { path: "tickStyle.suffix.enable", type: "boolean", description: "是否启用后缀。" },
            { path: "tickStyle.suffix.text", type: "string", description: "后缀文本。" },
            { path: "tickStyle.suffix.offsetX", type: "number", description: "后缀水平偏移。" },
            { path: "tickStyle.suffix.offsetY", type: "number", description: "后缀垂直偏移。" },
            {
              path: "tickStyle.suffix.useCustomStyle",
              type: "boolean",
              description: "是否使用独立样式。",
            },
            {
              path: "tickStyle.suffix.textStyle",
              type: "object",
              description: "后缀自定义样式。",
            },
          ],
        },
      ],
    },
    {
      path: "ratio",
      type: "object",
      description: "比值文本配置，支持百分比或真实值展示。",
      children: [
        {
          path: "ratio.displayMode",
          type: "enum",
          values: [0, 1],
          description: "展示模式：0 为百分比，1 为真实值。",
        },
        {
          path: "ratio.percentPrecision",
          type: "number",
          description: "百分比精度，即保留小数位数。",
        },
        {
          path: "ratio.valuePrecision",
          type: "number",
          description: "真实值精度，即保留小数位数。",
        },
        {
          path: "ratio.offsetX",
          type: "number",
          description: "比值文本水平偏移，单位 px。",
        },
        {
          path: "ratio.offsetY",
          type: "number",
          description: "比值文本垂直偏移，单位 px。",
        },
        {
          path: "ratio.textStyle",
          type: "object",
          description: "比值文本默认样式。",
          children: [
            { path: "ratio.textStyle.fontFamily", type: "string", description: "字体。" },
            {
              path: "ratio.textStyle.fontWeight",
              type: "enum",
              values: ["normal", "bold", "bolder"],
              description: "字重。",
            },
            { path: "ratio.textStyle.fontSize", type: "number", description: "字号。" },
            { path: "ratio.textStyle.color", type: "color", description: "颜色。" },
          ],
        },
        {
          path: "ratio.prefix",
          type: "object",
          description: "比值前缀配置。",
          children: [
            { path: "ratio.prefix.enable", type: "boolean", description: "是否启用前缀。" },
            { path: "ratio.prefix.text", type: "string", description: "前缀文本。" },
            { path: "ratio.prefix.offsetX", type: "number", description: "前缀水平偏移。" },
            { path: "ratio.prefix.offsetY", type: "number", description: "前缀垂直偏移。" },
            {
              path: "ratio.prefix.useCustomStyle",
              type: "boolean",
              description: "是否使用独立样式。",
            },
            {
              path: "ratio.prefix.textStyle",
              type: "object",
              description: "前缀自定义样式。",
            },
          ],
        },
        {
          path: "ratio.suffix",
          type: "object",
          description: "比值后缀配置。",
          children: [
            { path: "ratio.suffix.enable", type: "boolean", description: "是否启用后缀。" },
            { path: "ratio.suffix.text", type: "string", description: "后缀文本。" },
            { path: "ratio.suffix.offsetX", type: "number", description: "后缀水平偏移。" },
            { path: "ratio.suffix.offsetY", type: "number", description: "后缀垂直偏移。" },
            {
              path: "ratio.suffix.useCustomStyle",
              type: "boolean",
              description: "是否使用独立样式。",
            },
            {
              path: "ratio.suffix.textStyle",
              type: "object",
              description: "后缀自定义样式。",
            },
          ],
        },
      ],
    },
    {
      path: "iconIsShow",
      type: "boolean",
      description: "是否显示图标。",
    },
    {
      path: "iconStyle",
      type: "object",
      description: "图标样式。",
      children: [
        { path: "iconStyle.width", type: "number", description: "图标宽度。" },
        { path: "iconStyle.height", type: "number", description: "图标高度。" },
        { path: "iconStyle.offsetX", type: "number", description: "图标水平偏移。" },
        { path: "iconStyle.offsetY", type: "number", description: "图标垂直偏移。" },
        { path: "iconStyle.color", type: "color", description: "图标颜色。" },
        { path: "iconStyle.backgroundColor", type: "color", description: "图标背景色。" },
        { path: "iconStyle.borderRadius", type: "number", description: "图标圆角。" },
        { path: "iconStyle.rotate", type: "number", description: "图标旋转角度。" },
      ],
    },
    {
      path: "rotate",
      type: "number",
      range: [-360, 360],
      description: "组件整体旋转角度。",
    },
    {
      path: "opacity",
      type: "number",
      range: [0, 1],
      description: "组件整体不透明度。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "datasource",
      reason:
        "百分比条数据源结构由 MCP 根据 value/max/min 同步维护，AI 不应直接生成。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "AI 可填写 value/max/min；MCP 会归一化为完整有效的 datasource 并同步 constantData[0]。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "entryAnimiation 缺失时 MCP 会补全默认值。",
  ],
  visualRules: [
    "value 必须在 min 与 max 之间，否则百分比计算会越界。",
    "刻度 suffix 默认为 '%'，仅在 displayMode 为百分比时启用更自然。",
    "ratio.displayMode 为 0 时展示 (value - min) / (max - min) 的百分比；为 1 时展示 value 的真实值。",
    "progressBarColor 支持渐变字符串，建议与整体大屏主题色协调。",
  ],
  examples: [
    {
      title: "百分比条配置示例",
      props: {
        componentName: "PercentageBar",
        logicalId: "theme_percentage_bar",
        parentLogicalId: "screen_group",
        name: "设备在线率",
        value: 78.5,
        max: 100,
        min: 0,
        style: {
          position: "absolute",
          left: 80,
          top: 160,
          width: 600,
          height: 160,
          zIndex: 1,
          backgroundColor: "rgba(0,0,0,0)",
        },
        globalConfig: {
          barHeight: 24,
          radius: 12,
          progressBarColor:
            "linear-gradient(90deg, rgba(0,229,255,1) 0%, rgba(0,102,255,1) 100%)",
          progressBarBackgroundColor: "rgba(0,229,255,0.12)",
        },
        animationSettings: {
          isOpenAnimation: true,
          duration: 1200,
          isReverse: false,
        },
        tickStyle: {
          segmentCount: 10,
          extremeMin: true,
          extremeMax: true,
          dividerColor: "rgba(0,229,255,0.3)",
          dividerSize: 2,
          offsetX: 0,
          offsetY: 8,
          textStyle: {
            fontFamily: "serif",
            fontWeight: "normal",
            fontSize: 12,
            color: "#BFEFFF",
          },
          suffix: {
            enable: true,
            text: "%",
            offsetX: 2,
            offsetY: 0,
            useCustomStyle: false,
            textStyle: {
              fontFamily: "serif",
              fontWeight: "normal",
              fontSize: 12,
              color: "#BFEFFF",
            },
          },
        },
        ratio: {
          displayMode: 0,
          percentPrecision: 1,
          valuePrecision: 1,
          offsetX: 0,
          offsetY: -4,
          textStyle: {
            fontFamily: "serif",
            fontWeight: "bold",
            fontSize: 36,
            color: "#FFFFFF",
          },
          prefix: {
            enable: false,
            text: "",
            offsetX: 0,
            offsetY: 0,
            useCustomStyle: false,
            textStyle: {
              fontFamily: "serif",
              fontWeight: "normal",
              fontSize: 14,
              color: "#FFFFFF",
            },
          },
          suffix: {
            enable: true,
            text: "%",
            offsetX: 4,
            offsetY: 0,
            useCustomStyle: false,
            textStyle: {
              fontFamily: "serif",
              fontWeight: "normal",
              fontSize: 18,
              color: "#FFFFFF",
            },
          },
        },
        iconIsShow: false,
        iconStyle: {
          width: 48,
          height: 48,
          offsetX: 0,
          offsetY: 0,
          color: "#00E5FF",
          backgroundColor: "rgba(0,0,0,0)",
          borderRadius: 0,
          rotate: 0,
        },
      },
    },
  ],
};
