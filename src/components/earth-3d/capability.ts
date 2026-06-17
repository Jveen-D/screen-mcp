import type { JsonObject } from "../../types/component.js";

export const earth3dCapability: JsonObject = {
  componentName: "Earth3D",
  displayName: "3D地球",
  description:
    "3D 地球场景组件，支持地球纹理、大气层、光照、星空背景、飞入动画等配置，用于构建地理数据可视化大屏。",
  aiRole:
    "AI 负责 Earth3D 整体布局、风格（纹理、大气、光照、背景）与入场动画；子组件（Pointer/Satellite/SpeedLight/TextAround）通过 children 数组嵌套在 Earth3D schema 下。MCP 会自动把子组件的 parentBusinessElementId 和 earth3DId 同步为父组件 businessElementId。组件层级由最终 schema 数组顺序决定。",

  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Earth3D",
      description: "组件类型，必须固定为 Earth3D。",
    },
    {
      path: "logicalId",
      type: "string",
      description:
        "组件唯一 ID，由 AI 生成；后端限制最长 50 个字符，必须包含短随机段以保证大屏内全局唯一。子组件会通过 earth3DId 引用该 ID。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "父级组件或分组 ID，由 AI 生成。",
    },
    {
      path: "style",
      type: "object",
      description: "组件在画布上的位置和尺寸。",
    },
  ],
  aiWritableProps: [
    { path: "name", type: "string", description: "图层名称。" },
    { path: "title", type: "string", description: "组件标题。" },
    {
      path: "texture",
      type: "object",
      description:
        "地球纹理配置，包括 type（light/dark/custom）、customUrl、cloudShow、cloudSpeed、cloudOpacity、cloudDirection。",
    },
    {
      path: "starBg",
      type: "object",
      description: "星空背景配置，包括 show、autoRotate、speed、direction。",
    },
    {
      path: "outAtmosphere",
      type: "object",
      description: "外层大气配置，包括 show、color、opacity、speed、direction。",
    },
    {
      path: "glow",
      type: "object",
      description: "地球辉光配置，包括 open、color、strength、opacity。",
    },
    {
      path: "backLight",
      type: "object",
      description: "背光配置，包括 open、color、opacity。",
    },
    {
      path: "stroke",
      type: "object",
      description: "轮廓线配置，包括 open、outline、outlineColor、lineColor、outlineSpeed。",
    },
    {
      path: "ambientLight",
      type: "object",
      description: "环境光配置，包括 show、color、intensity。",
    },
    {
      path: "shuttle",
      type: "object",
      description: "相机穿梭动画配置，包括 isShow、trigger、longitude、latitude、duration 等。",
    },
    {
      path: "backgroundImage",
      type: "object",
      description: "背景图片配置，包括 type。",
    },
    {
      path: "longitude",
      type: "number",
      description: "地球中心经度。默认 116.4074。",
    },
    {
      path: "latitude",
      type: "number",
      description: "地球中心纬度。默认 39.9042。",
    },
    {
      path: "cameraDistance",
      type: "number",
      description: "相机距离。默认 10。",
    },
    {
      path: "earthRadius",
      type: "number",
      description: "地球半径。默认 400。",
    },
    { path: "style", type: "object", description: "位置、尺寸、层级。" },
    { path: "rotate", type: "number", range: [-360, 360], description: "旋转角度。默认 0。" },
    { path: "opacity", type: "number", range: [0, 1], description: "不透明度。默认 1。" },
    {
      path: "entryAnimiation",
      type: "object",
      description: "入场动画配置。默认 isShow=false, type=''。",
    },
    {
      path: "children",
      type: "array",
      description:
        "子组件数组，可嵌套 Earth3D-Pointer、Earth3D-Satellite、Earth3D-SpeedLight、Earth3D-TextAround。每个子组件只需提供 componentName、logicalId、name、style 与业务数据。",
    },
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
    "style、entryAnimiation、eventConfigures、rotate、opacity、name、title 缺失时由 MCP 补齐默认值。",
    "texture、starBg、outAtmosphere、glow、backLight、stroke、ambientLight、shuttle、backgroundImage 等对象缺失字段由 MCP 补齐为默认值。",
  ],
  visualRules: [
    "Earth3D 通常作为大屏底图或核心视觉，尺寸应覆盖主要展示区域。",
    "纹理、大气、辉光等配置应服务于整体科技风主题，避免高饱和色冲突。",
    "子组件通过 children 数组嵌套在 Earth3D 下，MCP 会自动同步 earth3DId 与 parentBusinessElementId。",
    "如果单独生成 Earth3D 子组件，才需要手动填写 earth3DId 等于父组件 logicalId。",

  ],
  examples: [
    {
      title: "科技风 3D 地球",
      props: {
        componentName: "Earth3D",
        logicalId: "theme_earth_3d",
        parentLogicalId: "screen_group",
        name: "3D地球",
        title: "3D地球",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 1000,
          height: 800,
          zIndex: 1,
        },
        texture: {
          type: "light",
          cloudShow: true,
          cloudSpeed: 0.6,
          cloudOpacity: 0.49,
        },
        starBg: { show: true, autoRotate: true, speed: 1 },
        outAtmosphere: { show: true, color: "rgba(13,183,248,1)", opacity: 0.13 },
        glow: { open: true, color: "#d07a36", strength: 175, opacity: 100 },
        children: [
          {
            componentName: "Earth3D-Pointer",
            logicalId: "theme_earth_pointer",
            name: "标记点",
            style: { position: "absolute", left: 0, top: 0, width: 0, height: 0, zIndex: 509 },
            data: [
              { lng: 116.4074, lat: 39.9042, title: "北京" },
              { lng: 121.4737, lat: 31.2304, title: "上海" },
            ],
          },
        ],
      },
    },
  ],
};
