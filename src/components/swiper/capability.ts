import type { JsonObject } from "../../types/component.js";

export const swiperCapability: JsonObject = {
  componentName: "Swiper",
  displayName: "轮播图",
  description: "大屏轮播图组件，支持图片列表、切换方向、切换按钮、动画效果和 3D 变换。",
  aiRole:
    "AI 负责图片列表、切换方向、动画和样式；MCP 负责补齐默认 props。组件层级由最终 schema 数组顺序决定。图片路径只能使用用户明确提供的资源。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Swiper",
      description: "组件类型，必须固定为 Swiper。",
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
      description: "父级组件或分组 ID，由 AI 生成。",
    },
    {
      path: "style",
      type: "object",
      description: "组件在画布上的位置、尺寸和文本样式。",
    },
  ],
  aiWritableProps: [
    { path: "name", type: "string", description: "图层名称。" },
    {
      path: "imageSrcList",
      type: "array<string>",
      description: "轮播图片地址数组。只能使用用户明确提供的图片路径，不要编造或选择项目现有素材库路径。",
    },
    {
      path: "imageShowType",
      type: "enum",
      values: ["noRepeat", "repeat", "xRepeat", "yRepeat"],
      description: "图片适配方式。默认 noRepeat。",
    },
    {
      path: "direction",
      type: "enum",
      values: ["horizontal", "vertical"],
      description: "切换方向。默认 horizontal。",
    },
    {
      path: "navigation",
      type: "object",
      description: "切换按钮配置。",
    },
    {
      path: "swiperAnimation",
      type: "object",
      description: "轮播动画配置，包含 animationType、loop、delayTime。",
    },
    {
      path: "animation",
      type: "object",
      description: "自定义动画配置。",
    },
    {
      path: "transform3D",
      type: "object",
      description: "3D 变换配置。",
    },
    {
      path: "targetUrl",
      type: "string",
      description: "点击跳转地址。",
    },
    {
      path: "openBrowser",
      type: "boolean",
      description: "是否新窗口打开。默认 false。",
    },
    { path: "style", type: "object", description: "位置、尺寸、字体、颜色。" },
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
    "imageShowType 只能为 noRepeat/repeat/xRepeat/yRepeat，非法值重置为 noRepeat。",
    "direction 只能为 horizontal/vertical，非法值重置为 horizontal。",
    "imageSrcList 只接收用户明确提供的图片路径；没有图片素材时不要生成轮播图占位资源。",
  ],
  visualRules: [
    "轮播图适合用于图片展示、广告位或面板背景。",
    "图片数量较多时建议启用 loop 和自动切换。",
  ],
  examples: [
    {
      title: "轮播图配置示例",
      props: {
        componentName: "Swiper",
        logicalId: "theme_swiper",
        parentLogicalId: "media_group",
        name: "轮播图",
        style: {
          position: "absolute",
          left: 100,
          top: 100,
          width: 800,
          height: 240,
        },
        imageSrcList: [
          "<user-provided-banner-1>",
          "<user-provided-banner-2>",
        ],
        direction: "horizontal",
        swiperAnimation: {
          loop: true,
          delayTime: 4,
        },
      },
    },
  ],
};
