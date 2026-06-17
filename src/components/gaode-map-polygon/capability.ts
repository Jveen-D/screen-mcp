import type { JsonObject } from "../../types/component.js";

export const polygonCapability: JsonObject = {
  componentName: "GaodeMap-Polygon",
  displayName: "多边形",
  description:
    "高德地图子组件，用于在地图上绘制多边形区域。前端面板中隐藏，只能通过 GaodeMap 父组件添加。",
  aiRole:
    "AI 负责多边形数据（data 数组为 GeoJSON-like 坐标数组）与填充/边框样式；MCP 负责把 data 包装为 datasource.{\"0\": data}，并把 mapId 设置为父 GaodeMap 的 logicalId。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "GaodeMap-Polygon",
      description: "组件类型，必须固定为 GaodeMap-Polygon。",
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
      type: "array<array<number>>",
      description:
        "多边形坐标数组，格式为 [[lng, lat], [lng, lat], ...]。MCP 会包装为 datasource.{\"0\": [data]}。",
    },
    {
      path: "fillColor",
      type: "color",
      description: "填充颜色。默认 rgba(137,148,144,0.2)。",
    },
    {
      path: "borderColor",
      type: "color",
      description: "边框颜色。默认 rgba(22,236,250,1)。",
    },
    {
      path: "borderWidth",
      type: "number",
      description: "边框宽度。默认 1.5。",
    },
    {
      path: "borderType",
      type: "string",
      description: "边框线型，如 solid、dashed。默认 dashed。",
    },
    {
      path: "showBorder",
      type: "boolean",
      description: "是否显示边框。默认 true。",
    },
    { path: "style", type: "object", description: "位置、尺寸。" },
    { path: "rotate", type: "number", range: [-360, 360], description: "旋转角度。默认 0。" },
    { path: "opacity", type: "number", range: [0, 1], description: "不透明度。默认 1。" },
  ],
  aiForbiddenProps: [
    {
      path: "datasource",
      reason: "datasource 由 MCP 根据 data 自动包装，AI 不应直接写入。",
    },
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "AI 填写 data 后，MCP 会将其包装为 datasource.{\"0\": [data]}。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "style、eventConfigures、rotate、opacity、name、title 缺失时 MCP 会补全为默认值。",
    "mapId 由 AI 提供，MCP 仅做字符串兜底，不会修改其值。",
  ],
  visualRules: [
    "多边形填充应使用低不透明度，避免遮挡地图底图。",
    "边框颜色应服务于区域划分语义。",
    "每个 GaodeMap-Polygon 必须通过 mapId 关联到唯一的 GaodeMap 父组件。",
  ],
  examples: [
    {
      title: "高德地图多边形",
      props: {
        componentName: "GaodeMap-Polygon",
        logicalId: "gaode_polygon_demo",
        parentLogicalId: "theme_gaode_map",
        mapId: "theme_gaode_map",
        name: "多边形",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 5,
        },
        fillColor: "rgba(137,148,144,0.2)",
        borderColor: "rgba(22,236,250,1)",
        borderWidth: 1.5,
        showBorder: true,
        data: [
          [120.501036, 30.04866],
          [120.40393, 30.105801],
          [120.291287, 30.09572],
        ],
      },
    },
  ],
};
