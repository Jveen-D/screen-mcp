import type { JsonObject } from "../../types/component.js";

export const singleImageCapability: JsonObject = {
  componentName: "SingleImage",
  displayName: "图片",
  description:
    "用于大屏面板背景、标题背景、纹理、光效 PNG/JPG/WebP 或 base64 图片点缀。",
  aiRole:
    "AI 负责图片组件的位置、尺寸和图片来源。MCP 负责补齐默认 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "SingleImage",
      description: "组件类型，必须固定为 SingleImage。",
    },
    {
      path: "logicalId",
      type: "string",
      description: "组件唯一 ID，由 AI 生成。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "父级组件或分组 ID，由 AI 生成。",
    },
    {
      path: "style",
      type: "object",
      description: "图片在画布上的位置和尺寸。",
    },
  ],
  aiWritableProps: [
    { path: "name", type: "string", description: "图层名称。" },
    { path: "style", type: "object", description: "位置、尺寸、背景、边框和圆角。" },
    { path: "rotate", type: "number", range: [-360, 360], description: "旋转角度。" },
    { path: "opacity", type: "number", range: [0, 1], description: "不透明度。" },
    {
      path: "imageUseMode",
      type: "enum",
      values: ["upload", "base64"],
      setter: "SegmentedSetter",
      defaultValue: "upload",
      description:
        "图片使用模式。使用 imageSrc 时为 upload；使用 imageBase64 时必须为 base64，MCP 会自动修正。",
    },
    {
      path: "imageSrc",
      type: "string",
      description: "图片资源路径。用于素材库或服务端已存在图片。",
    },
    {
      path: "imageBase64",
      type: "string",
      description:
        "base64 图片内容。只有用户明确提供图片内容时才填写；填写后 imageUseMode 必须为 base64。",
    },
    {
      path: "imageShowType",
      type: "enum",
      values: ["noRepeat", "repeat", "repeatX", "repeatY"],
      description: "图片平铺方式。",
    },
    {
      path: "animation",
      type: "object",
      description: "图片动画配置，无明确要求时保持默认关闭。",
    },
    {
      path: "transform3D",
      type: "object",
      description: "3D 旋转配置，无明确要求时保持默认关闭。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
    {
      path: "targetUrl",
      reason: "超链接涉及跳转行为，默认不由 AI 生成。",
    },
    {
      path: "openBrowser",
      reason: "打开新窗口涉及跳转行为，默认不由 AI 生成。",
    },
  ],
  mergeRules: [
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "AI 不应凭空生成 base64，只能使用用户提供的 base64 或素材路径。",
    "当 imageBase64 非空时，imageUseMode 必须为 base64；当 imageSrc 非空且 imageBase64 为空时，imageUseMode 使用 upload。",
    "图片组件通常用于背景、纹理或光效；最终 ComponentSchema[] 中必须排在 SingleText、SvgDecoration、PieChart 等真实内容和图标装饰之后，避免图片处于顶层遮盖内容。",
  ],
  examples: [
    {
      title: "科技面板背景图",
      props: {
        componentName: "SingleImage",
        logicalId: "panel_bg_image",
        parentLogicalId: "sales_group",
        name: "销售面板背景",
        style: {
          position: "absolute",
          left: 48,
          top: 96,
          width: 520,
          height: 360,
          backgroundColor: "rgba(0,0,0,0)",
          borderStyle: "solid",
          borderRadius: 0,
          borderWidth: 0,
          borderColor: "rgba(0,0,0,0)",
        },
        imageUseMode: "upload",
        imageSrc: "group1/M00/panel-bg-tech.png",
        imageShowType: "noRepeat",
        opacity: 1,
      },
    },
  ],
};
