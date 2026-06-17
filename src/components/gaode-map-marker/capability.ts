import type { JsonObject } from "../../types/component.js";

export const markerCapability: JsonObject = {
  componentName: "GaodeMap-Marker",
  displayName: "标牌",
  description:
    "高德地图子组件，用于在地图上展示标牌标记。前端面板中隐藏，只能通过 GaodeMap 父组件添加。",
  aiRole:
    "AI 负责标牌数据（data 数组，每项包含 lng/lat/value）与点位、背景、文字、交互配置；MCP 负责把 data 同步到 datasource.constantData 与 fieldMappings，并把 mapId 设置为父 GaodeMap 的 logicalId。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "GaodeMap-Marker",
      description: "组件类型，必须固定为 GaodeMap-Marker。",
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
        "标牌数据数组，每项包含 lng（经度）、lat（纬度）、value（显示值）。MCP 会同步到 datasource.constantData。",
    },
    {
      path: "pointConf",
      type: "object",
      description: "点位图标配置，包括 url、width、height、offsetX、offsetY。",
    },
    {
      path: "bgConf",
      type: "object",
      description: "背景图配置，包括 url、width、height、offsetX、offsetY。",
    },
    {
      path: "textConf",
      type: "object",
      description: "文字样式配置，包括 color、fontSize、fontWeight、align、offsetX、offsetY。",
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
    "标牌颜色应与 GaodeMap 整体主题协调。",
    "value 字段用于标牌的数值展示。",
    "每个 GaodeMap-Marker 必须通过 mapId 关联到唯一的 GaodeMap 父组件。",
  ],
  examples: [
    {
      title: "高德地图标牌",
      props: {
        componentName: "GaodeMap-Marker",
        logicalId: "gaode_marker_demo",
        parentLogicalId: "theme_gaode_map",
        mapId: "theme_gaode_map",
        name: "标牌",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 10,
        },
        data: [
          { lng: 118.791836, lat: 29.649407, value: 20 },
          { lng: 119.278406, lat: 29.69998, value: 47 },
        ],
      },
    },
  ],
};
