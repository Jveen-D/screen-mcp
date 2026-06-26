import type { JsonObject } from "../../types/component.js";

export const earth3dSpeedLightCapability: JsonObject = {
  componentName: "Earth3D-SpeedLight",
  displayName: "扫描线",
  description:
    "3D 地球子组件，用于在地球表面指定经纬度位置展示扫描光效。前端面板中隐藏，只能通过 Earth3D 父组件添加。",
  aiRole:
    "AI 负责扫描线中心经纬度与颜色；MCP 负责补齐默认 props。earth3DId 必须设置为父 Earth3D 的 logicalId。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Earth3D-SpeedLight",
      description: "组件类型，必须固定为 Earth3D-SpeedLight。",
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
      description: "父级 Earth3D 组件的 logicalId，由 AI 生成。",
    },
    {
      path: "style",
      type: "object",
      description: "组件在画布上的位置和尺寸。",
    },
    {
      path: "earth3DId",
      type: "string",
      description:
        "必填。必须等于父 Earth3D 组件的 logicalId。AI 必须将其设置为与 parentLogicalId 相同的值。",
    },
  ],
  aiWritableProps: [
    { path: "name", type: "string", description: "图层名称。" },
    {
      path: "lng",
      type: "number",
      description: "扫描线中心经度。默认 116.4074。",
    },
    {
      path: "lat",
      type: "number",
      description: "扫描线中心纬度。默认 39.9042。",
    },
    {
      path: "speedLightColor",
      type: "color",
      description: "扫描线颜色。默认 rgba(144,166,255,1)。",
    },
    { path: "style", type: "object", description: "位置、尺寸。" },
    { path: "rotate", type: "number", range: [-360, 360], description: "旋转角度。默认 0。" },
    { path: "opacity", type: "number", range: [0, 1], description: "不透明度。默认 1。" },
  ],
  aiForbiddenProps: [
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "style、eventConfigures、rotate、opacity、name、title 缺失时 MCP 会补全为默认值。",
    "earth3DId 由 AI 提供，MCP 仅做字符串兜底，不会修改其值。",
  ],
  visualRules: [
    "扫描线位置应落在 Earth3D 可见区域内。",
    "扫描线颜色应服务于异常状态或高亮语义。",
    "每个 Earth3D-SpeedLight 必须通过 earth3DId 关联到唯一的 Earth3D 父组件。",
  ],
  examples: [
    {
      title: "Earth3D 扫描线",
      props: {
        componentName: "Earth3D-SpeedLight",
        logicalId: "earth_speed_light_demo",
        parentLogicalId: "theme_earth_3d",
        earth3DId: "theme_earth_3d",
        name: "扫描线",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 507,
        },
        lng: 116.4074,
        lat: 39.9042,
        speedLightColor: "rgba(144,166,255,1)",
      },
    },
  ],
};
