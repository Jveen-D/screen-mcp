import type { JsonObject } from "../../types/component.js";

export const earth3dSatelliteCapability: JsonObject = {
  componentName: "Earth3D-Satellite",
  displayName: "卫星",
  description:
    "3D 地球子组件，用于在地球周围绘制卫星轨道与卫星模型。前端面板中隐藏，只能通过 Earth3D 父组件添加。",
  aiRole:
    "AI 负责卫星颜色、轨道颜色、半径与旋转角度；MCP 负责补齐默认 props。earth3DId 必须设置为父 Earth3D 的 logicalId。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Earth3D-Satellite",
      description: "组件类型，必须固定为 Earth3D-Satellite。",
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
      path: "satelliteColor",
      type: "color",
      description: "卫星颜色。默认 rgba(61,183,248,1)。",
    },
    {
      path: "satelliteOpacity",
      type: "number",
      range: [0, 1],
      description: "卫星不透明度。默认 0.5。",
    },
    {
      path: "satelliteXRotation",
      type: "number",
      description: "卫星 X 轴旋转。默认 90。",
    },
    {
      path: "satelliteYRotation",
      type: "number",
      description: "卫星 Y 轴旋转。默认 0。",
    },
    {
      path: "satelliteZRotation",
      type: "number",
      description: "卫星 Z 轴旋转。默认 0。",
    },
    {
      path: "orbitColor",
      type: "color",
      description: "轨道颜色。默认 rgba(61,183,248,1)。",
    },
    {
      path: "orbitOpacity",
      type: "number",
      range: [0, 1],
      description: "轨道不透明度。默认 1。",
    },
    {
      path: "orbitRadius",
      type: "number",
      description: "轨道半径。默认 950。",
    },
    {
      path: "orbitXRotation",
      type: "number",
      description: "轨道 X 轴旋转。默认 30。",
    },
    {
      path: "orbitYRotation",
      type: "number",
      description: "轨道 Y 轴旋转。默认 10。",
    },
    {
      path: "orbitZRotation",
      type: "number",
      description: "轨道 Z 轴旋转。默认 0。",
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
    "卫星与轨道颜色应与 Earth3D 整体主题协调。",
    "轨道半径应适配父组件尺寸，避免过度超出画布。",
    "每个 Earth3D-Satellite 必须通过 earth3DId 关联到唯一的 Earth3D 父组件。",
  ],
  examples: [
    {
      title: "Earth3D 卫星轨道",
      props: {
        componentName: "Earth3D-Satellite",
        logicalId: "earth_satellite_demo",
        parentLogicalId: "theme_earth_3d",
        earth3DId: "theme_earth_3d",
        name: "卫星",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 508,
        },
        satelliteColor: "rgba(61,183,248,1)",
        orbitColor: "rgba(61,183,248,1)",
        orbitRadius: 950,
      },
    },
  ],
};
