import type { JsonObject } from "../../types/component.js";

export const heatMapCapability: JsonObject = {
  componentName: "GaodeMap-HeatMap",
  displayName: "热力聚合",
  description:
    "高德地图子组件，用于在地图上展示热力聚合效果。前端面板中隐藏，只能通过 GaodeMap 父组件添加。",
  aiRole:
    "AI 负责热力数据（data 数组，每项包含 lng/lat/value）与热力半径、渐变、不透明度；MCP 负责把 data 同步到 datasource.constantData（value 字段映射为 count）与 fieldMappings，并把 mapId 设置为父 GaodeMap 的 logicalId。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "GaodeMap-HeatMap",
      description: "组件类型，必须固定为 GaodeMap-HeatMap。",
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
        "热力数据数组，每项包含 lng（经度）、lat（纬度）、value（权重）。MCP 会同步到 datasource.constantData，value 字段映射为 count。",
    },
    {
      path: "radius",
      type: "number",
      description: "热力点半径。默认 33。",
    },
    {
      path: "gradient",
      type: "string",
      description: "热力渐变字符串。",
    },
    {
      path: "opacity",
      type: "number",
      range: [0, 1],
      description: "热力图层不透明度。默认 0.2。",
    },
    { path: "style", type: "object", description: "位置、尺寸。" },
    { path: "rotate", type: "number", range: [-360, 360], description: "旋转角度。默认 0。" },
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
    "AI 填写 data 后，MCP 会重新生成 datasource，sourceType 为 constant，fieldMode 为 multiple，value 字段映射为 count。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "style、eventConfigures、rotate、opacity、name、title 缺失时 MCP 会补全为默认值。",
    "mapId 由 AI 提供，MCP 仅做字符串兜底，不会修改其值。",
  ],
  visualRules: [
    "热力半径应结合地图缩放级别设置，避免过度重叠。",
    "渐变颜色应服务于数据密度语义。",
    "每个 GaodeMap-HeatMap 必须通过 mapId 关联到唯一的 GaodeMap 父组件。",
  ],
  examples: [
    {
      title: "高德地图热力聚合",
      props: {
        componentName: "GaodeMap-HeatMap",
        logicalId: "gaode_heat_map_demo",
        parentLogicalId: "theme_gaode_map",
        mapId: "theme_gaode_map",
        name: "热力聚合",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 10,
        },
        radius: 33,
        opacity: 0.2,
        data: [
          { lng: 120.074011, lat: 30.00457, value: 74 },
          { lng: 119.516684, lat: 29.696415, value: 52 },
          { lng: 119.474051, lat: 29.711463, value: 73 },
        ],
      },
    },
  ],
};
