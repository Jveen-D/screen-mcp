import type { JsonObject } from "../../types/component.js";

export const flyLineCapability: JsonObject = {
  componentName: "GaodeMap-FlyLine",
  displayName: "飞线",
  description:
    "高德地图子组件，用于在地图上绘制两点之间的飞行动画线条。前端面板中隐藏，只能通过 GaodeMap 父组件添加。",
  aiRole:
    "AI 负责飞线数据（data 数组，每项包含 fromLng/fromLat/toLng/toLat）与脉冲线样式；MCP 负责把 data 同步到 datasource.constantData 与 fieldMappings，并把 mapId 设置为父 GaodeMap 的 logicalId。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "GaodeMap-FlyLine",
      description: "组件类型，必须固定为 GaodeMap-FlyLine。",
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
        "飞线数据数组，每项包含 fromLng（起点经度）、fromLat（起点纬度）、toLng（终点经度）、toLat（终点纬度）。MCP 会同步到 datasource.constantData。",
    },
    {
      path: "pulseLink",
      type: "object",
      description: "飞线脉冲线配置，包括 curve、lineWidth、speed、headColor、lineColor、trailColor 等。",
    },
    {
      path: "scatter",
      type: "object",
      description: "散点动画配置，包括 size、color、duration、visible 等。",
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
    "飞线颜色应服务于数据流向语义，如起点到终点使用渐变或对比色。",
    "data 中必须包含有效的 fromLng/fromLat/toLng/toLat 数值。",
    "每个 GaodeMap-FlyLine 必须通过 mapId 关联到唯一的 GaodeMap 父组件。",
  ],
  examples: [
    {
      title: "高德地图飞线",
      props: {
        componentName: "GaodeMap-FlyLine",
        logicalId: "gaode_fly_line_demo",
        parentLogicalId: "theme_gaode_map",
        mapId: "theme_gaode_map",
        name: "飞线",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 10,
        },
        data: [
          { fromLng: 120.213336, fromLat: 30.2536, toLng: 119.109556, toLat: 30.174266 },
          { fromLng: 120.213284, fromLat: 30.253749, toLng: 120.488783, toLat: 30.274644 },
        ],
        pulseLink: {
          curve: 0.3,
          lineWidth: 5,
          speed: 20,
          headColor: "rgba(16,155,255,1)",
        },
      },
    },
  ],
};
