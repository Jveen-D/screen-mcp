import type { JsonObject } from "../../types/component.js";

export const videoCapability: JsonObject = {
  componentName: "Video",
  displayName: "视频",
  description: "大屏视频组件，支持 HLS/H.265 等视频源、自动播放、循环、静音和控件显示。",
  aiRole:
    "AI 负责视频源、播放行为和样式；MCP 负责补齐默认 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Video",
      description: "组件类型，必须固定为 Video。",
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
      description: "组件在画布上的位置和尺寸。",
    },
  ],
  aiWritableProps: [
    { path: "name", type: "string", description: "图层名称。" },
    {
      path: "videoUrl",
      type: "string",
      description: "视频链接地址。",
    },
    {
      path: "uploadVideoUrl",
      type: "string",
      description: "上传后的视频地址。",
    },
    {
      path: "videoType",
      type: "enum",
      values: ["hls", "h265"],
      description: "视频协议。默认 hls。",
    },
    {
      path: "controls",
      type: "boolean",
      description: "是否显示播放控件。默认 false。",
    },
    {
      path: "loop",
      type: "boolean",
      description: "是否循环播放。默认 false。",
    },
    {
      path: "autoplay",
      type: "boolean",
      description: "是否自动播放。默认 false。",
    },
    {
      path: "muted",
      type: "boolean",
      description: "是否静音播放。默认 true。",
    },
    {
      path: "borderRadius",
      type: "number",
      description: "圆角。默认 0。",
    },
    {
      path: "backgroundColor",
      type: "color",
      description: "背景颜色。默认 #003552。",
    },
    { path: "style", type: "object", description: "位置、尺寸、背景。" },
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
    "videoType 只能为 hls/h265，非法值重置为 hls。",
  ],
  visualRules: [
    "视频组件通常用于监控、宣传或背景视频。",
    "注意自动播放策略，大屏场景建议配合 muted 使用。",
  ],
  examples: [
    {
      title: "科技风监控视频",
      props: {
        componentName: "Video",
        logicalId: "theme_video",
        parentLogicalId: "media_group",
        name: "监控视频",
        style: {
          position: "absolute",
          left: 100,
          top: 100,
          width: 400,
          height: 260,
        },
        videoType: "hls",
        controls: true,
        autoplay: true,
        muted: true,
      },
    },
  ],
};
