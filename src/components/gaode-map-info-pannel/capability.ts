import type { JsonObject } from "../../types/component.js";

export const infoPannelCapability: JsonObject = {
  componentName: "GaodeMap-InfoPannel",
  displayName: "信息面板",
  description:
    "高德地图子组件，用于在地图标记点上展示信息面板。前端面板中隐藏，只能通过 GaodeMap 父组件添加。",
  aiRole:
    "AI 负责面板数据（data 数组，每项包含 lng/lat/value1/value2/value3/state）与面板样式；MCP 负责把 data 同步到 datasource.constantData 与 fieldMappings，并把 mapId 设置为父 GaodeMap 的 logicalId。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "GaodeMap-InfoPannel",
      description: "组件类型，必须固定为 GaodeMap-InfoPannel。",
    },
    {
      path: "logicalId",
      type: "string",
      description:
        "组件唯一 ID，由 AI 生成；后端限制最长 50 个字符，必须包含短随机段以保证大屏内全局唯一。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "父级 GaodeMap 组件的 logicalId，由 AI 生成。",
    },
    {
      path: "style",
      type: "object",
      description: "组件在画布上的位置和尺寸。",
    },
    {
      path: "mapId",
      type: "string",
      description:
        "必填。必须等于父 GaodeMap 组件的 logicalId。AI 必须将其设置为与 parentLogicalId 相同的值。",
    },
  ],
  aiWritableProps: [
    { path: "name", type: "string", description: "图层名称。" },
    {
      path: "data",
      type: "array<object>",
      description:
        "信息面板数据数组，每项包含 lng、lat、value1、value2、value3、state。MCP 会同步到 datasource.constantData。",
    },
    {
      path: "markerStyles",
      type: "array<object>",
      description: "标记样式数组，按 state 值匹配显示不同图标与背景。",
    },
    {
      path: "textContents",
      type: "array<object>",
      description: "文本内容配置数组，定义面板中各字段的显示样式与映射字段。",
    },
    {
      path: "interactionConf",
      type: "object",
      description: "交互配置，包括 trigger、duration、animation 等。",
    },
    { path: "style", type: "object", description: "位置、尺寸。" },
    { path: "rotate", type: "number", range: [-360, 360], description: "旋转角度。默认 0。" },
    { path: "opacity", type: "number", range: [0, 1], description: "不透明度。默认 1。" },
  ],
  aiForbiddenProps: [
    {
      path: "datasource",
      reason: "datasource 由 MCP 根据 data 自动生成，AI 不应直接写入。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "AI 填写 data 后，MCP 会重新生成 datasource，包括 sourceType、fieldMode、fieldMappings 与 constantData。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "style、eventConfigures、rotate、opacity、name、title 缺失时 MCP 会补全为默认值。",
    "mapId 由 AI 提供，MCP 仅做字符串兜底，不会修改其值。",
  ],
  visualRules: [
    "信息面板样式应与 GaodeMap 整体主题协调。",
    "state 字段用于匹配 markerStyles 中的状态样式。",
    "每个 GaodeMap-InfoPannel 必须通过 mapId 关联到唯一的 GaodeMap 父组件。",
  ],
  examples: [
    {
      title: "高德地图信息面板",
      props: {
        componentName: "GaodeMap-InfoPannel",
        logicalId: "gaode_info_pannel_demo",
        parentLogicalId: "theme_gaode_map",
        mapId: "theme_gaode_map",
        name: "信息面板",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 10,
        },
        data: [
          { lng: 118.870825, lat: 29.607539, value1: "监测点#02", value2: 173, value3: "优", state: "优" },
          { lng: 120.22345, lat: 30.434644, value1: "监测点#03", value2: 51, value3: "良", state: "良" },
        ],
      },
    },
  ],
};
