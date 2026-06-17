import type { JsonObject } from "../../types/component.js";

export const earth3dPointerCapability: JsonObject = {
  componentName: "Earth3D-Pointer",
  displayName: "标记点",
  description:
    "3D 地球子组件，用于在地球表面标记经纬度点位。前端面板中隐藏，只能通过 Earth3D 父组件添加。",
  aiRole:
    "AI 负责标记点数据（data 数组，每项包含 lng/lat/title）与样式；MCP 负责把 data 同步到 datasource.constantData 与 fieldMappings，并把 earth3DId 设置为父 Earth3D 的 logicalId。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Earth3D-Pointer",
      description: "组件类型，必须固定为 Earth3D-Pointer。",
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
        "必填。必须等于父 Earth3D 组件的 logicalId，用于建立父子关联。AI 必须将其设置为与 parentLogicalId 相同的值。",
    },
  ],
  aiWritableProps: [
    { path: "name", type: "string", description: "图层名称。" },
    {
      path: "data",
      type: "array<object>",
      description:
        "标记点数据数组，每项包含 lng（经度）、lat（纬度）、title（标题）。MCP 会同步到 datasource.constantData。",
    },
    {
      path: "pointerColor",
      type: "color",
      description: "标记点颜色。默认 #109bff。",
    },
    {
      path: "pointerOpacity",
      type: "number",
      range: [0, 1],
      description: "标记点不透明度。默认 1。",
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
    "earth3DId 由 AI 提供，MCP 仅做字符串兜底，不会修改其值。",
  ],
  visualRules: [
    "标记点颜色应与 Earth3D 整体科技风主题协调。",
    "data 中必须包含有效的 lng 与 lat 数值。",
    "每个 Earth3D-Pointer 必须通过 earth3DId 关联到唯一的 Earth3D 父组件。",
  ],
  examples: [
    {
      title: "Earth3D 标记点",
      props: {
        componentName: "Earth3D-Pointer",
        logicalId: "earth_pointer_demo",
        parentLogicalId: "theme_earth_3d",
        earth3DId: "theme_earth_3d",
        name: "标记点",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          zIndex: 509,
        },
        pointerColor: "#109bff",
        pointerOpacity: 1,
        data: [
          { lng: 116.4074, lat: 39.9042, title: "北京" },
          { lng: 121.4737, lat: 31.2304, title: "上海" },
        ],
      },
    },
  ],
};
