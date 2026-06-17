import type { JsonObject } from "../../types/component.js";

export const audioCapability: JsonObject = {
  componentName: "Audio",
  displayName: "音频",
  description: "大屏音频组件，支持上传音频文件、控制条、自动播放和循环播放。",
  aiRole:
    "AI 负责音频文件、播放控制和样式；MCP 负责补齐默认 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "Audio",
      description: "组件类型，必须固定为 Audio。",
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
      path: "assetsUploadFile",
      type: "string",
      description: "上传音频文件路径。",
    },
    {
      path: "controlBar",
      type: "boolean",
      description: "是否显示控制条。默认 true。",
    },
    {
      path: "autoPlay",
      type: "boolean",
      description: "是否自动播放。默认 false。",
    },
    {
      path: "loopPlay",
      type: "boolean",
      description: "是否循环播放。默认 false。",
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
    "controlBar/autoPlay/loopPlay 缺失时由 MCP 补齐默认值。",
  ],
  visualRules: [
    "音频组件适合用于大屏背景音乐、提示音或语音播报。",
    "自动播放需配合浏览器自动播放策略。",
  ],
  examples: [
    {
      title: "背景音乐",
      props: {
        componentName: "Audio",
        logicalId: "theme_audio",
        parentLogicalId: "media_group",
        name: "背景音乐",
        style: {
          position: "absolute",
          left: 100,
          top: 100,
          width: 400,
          height: 55,
        },
        controlBar: false,
        autoPlay: true,
        loopPlay: true,
      },
    },
  ],
};
