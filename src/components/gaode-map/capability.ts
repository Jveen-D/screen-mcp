import type { JsonObject } from "../../types/component.js";

export const gaodeMapCapability: JsonObject = {
  componentName: "GaodeMap",
  displayName: "2D高德地图",
  description:
    "2D 高德地图底图组件，支持自定义样式、缩放级别、中心经纬度、工具条与建筑/道路/POI 显示控制。",
  aiRole:
    "AI 负责 GaodeMap 整体布局、地图样式、中心经纬度、缩放级别与认证配置；子组件（FlyLine/HeatMap/InfoPannel/Marker/Polygon）通过 children 数组嵌套在 GaodeMap schema 下。MCP 会自动把子组件的 parentBusinessElementId 和 mapId 同步为父组件 businessElementId。组件层级由最终 schema 数组顺序决定。",

  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "GaodeMap",
      description: "组件类型，必须固定为 GaodeMap。",
    },
    {
      path: "logicalId",
      type: "string",
      description:
        "组件唯一 ID，由 AI 生成；后端限制最长 50 个字符，必须包含短随机段以保证大屏内全局唯一。子组件会通过 mapId 引用该 ID。",
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
      path: "mapConf",
      type: "object",
      description:
        "地图配置，包括 showRoad、styleType、showBuilding、showPoint、draggable、defaultStyleId、customStyleId、latitude、longitude、zoom、toolbarPosition、showToolbar。",
    },
    {
      path: "authConfig",
      type: "object",
      description: "高德地图认证配置，包括 key 与 jsCode。",
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
        "子组件数组，可嵌套 GaodeMap-FlyLine、GaodeMap-HeatMap、GaodeMap-InfoPannel、GaodeMap-Marker、GaodeMap-Polygon。每个子组件只需提供 componentName、logicalId、name、style 与业务数据。",
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
    "mapConf、authConfig 等对象缺失字段由 MCP 补齐为默认值。",
  ],
  visualRules: [
    "GaodeMap 通常作为大屏地理底图，尺寸建议覆盖主要展示区域。",
    "地图风格（defaultStyleId/customStyleId）应服务于整体主题，如 darkblue 适合科技风。",
    "子组件通过 children 数组嵌套在 GaodeMap 下，MCP 会自动同步 mapId 与 parentBusinessElementId。",
    "如果单独生成 GaodeMap 子组件，才需要手动填写 mapId 等于父组件 logicalId。",

  ],
  examples: [
    {
      title: "科技风 2D 高德地图",
      props: {
        componentName: "GaodeMap",
        logicalId: "theme_gaode_map",
        parentLogicalId: "screen_group",
        name: "2D高德地图",
        title: "2D高德地图",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          zIndex: 91,
        },
        mapConf: {
          showRoad: true,
          styleType: "default",
          showBuilding: true,
          showPoint: true,
          draggable: false,
          defaultStyleId: "amap://styles/darkblue",
          customStyleId: "blue",
          latitude: 29.9,
          longitude: 119.520792,
          zoom: 8.5,
          toolbarPosition: "LT",
          showToolbar: true,
        },
        children: [
          {
            componentName: "GaodeMap-FlyLine",
            logicalId: "theme_gaode_fly_line",
            name: "飞线",
            style: { position: "absolute", left: 0, top: 0, width: 0, height: 0, zIndex: 10 },
            data: [
              { fromLng: 120.213336, fromLat: 30.2536, toLng: 119.109556, toLat: 30.174266 },
            ],
          },
        ],
      },
    },
  ],
};
