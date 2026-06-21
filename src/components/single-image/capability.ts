import type { JsonObject } from "../../types/component.js";

export const singleImageCapability: JsonObject = {
  componentName: "SingleImage",
  displayName: "图片",
  description:
    "用于大屏面板背景、全屏背景、标题背景、纹理、光效 PNG/JPG/WebP 或 base64 图片点缀。AI 始终拥有设计权，可以主动生成轻量 base64 科技风背景/纹理；只有当用户明确禁止背景图或图片装饰时才放弃使用。",

  aiRole:
    "AI 负责图片组件的位置、尺寸和图片来源，并始终保有主动设计权：只要有助于大屏视觉效果，就可以生成 base64 科技风背景/纹理/光效。MCP 负责补齐默认 props。组件层级由最终 schema 数组顺序决定。",

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
      description: "组件唯一 ID，由 AI 生成；后端限制最长 50 个字符，必须包含短随机段以保证大屏内全局唯一。",
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
        "base64 图片内容。AI 可主动生成轻量 base64 科技风渐变、网格、光效或纹理图作为设计的一部分；用户提供的素材优先，但没有素材时不必留白底。填写后 imageUseMode 必须为 base64。",
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
    "AI 可以主动生成轻量 base64 背景/纹理/光效作为设计的一部分，不必等待用户明确请求；只有当用户明确禁止图片、背景图或装饰时才不得生成。",
    "用户提供的 imageSrc/imageBase64 优先使用；无素材时，AI 应自行设计并生成 base64，而不是回退到纯色 backgroundColor。",
    "禁止生成不可访问的外部图片链接或照片级真实图片；base64 内容应为轻量矢量风格渐变、网格、光效或纹理。",
    "只要设计需要背景/纹理/光效，就应使用 SingleImage 组件承载，而不是仅调整某个组件的 style.backgroundColor。除非用户明确要求极简/无图背景。",
    "当 imageBase64 非空时，imageUseMode 必须为 base64；当 imageSrc 非空且 imageBase64 为空时，imageUseMode 使用 upload。",
    "图片组件通常用于背景、纹理或光效；最终 ComponentSchema[] 中必须排在 SingleText、SvgDecoration、PieChart 等真实内容和图标装饰之后，避免图片处于顶层遮盖内容。",
    "当手动构建 __Group__ 的 children 数组时，必须把 SingleImage 背景图放在 children 末尾；generate_components_schemas 会自动把 SingleImage 排到最后，但手写 children 时需要显式保证。",
  ],
  visualRules: [
    "AI 始终保有设计权：只要有助于大屏视觉，就应主动生成覆盖全屏或面板的 SingleImage 背景/纹理/光效，而不是只修改 style.backgroundColor。",
    "全屏背景图应覆盖整个画布（如 1920×1080），并位于 ComponentSchema[] 末尾作为最底层，避免遮挡内容。",
    "生成的 base64 背景图应使用轻量矢量或简单纹理：深色渐变、科技网格、弱光晕、细边框，避免大尺寸照片级真实图片。",
    "图片组件通常用于背景、纹理或光效；最终 ComponentSchema[] 中必须排在 SingleText、SvgDecoration、PieChart 等真实内容和图标装饰之后，避免图片处于顶层遮盖内容。",
    "在任意 __Group__ 的 children 数组中，覆盖全屏或全面板的 SingleImage 背景图必须是最后一个元素； decorative 光效/纹理如需置顶应使用 SvgDecoration 或提高 zIndex，而不是依靠数组顺序把 SingleImage 提前。",
    "当用户明确说'不要背景图'、'不要图片'、'纯色背景'、'极简'时，才允许只用 style.backgroundColor；否则应使用 SingleImage。",
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
    {
      title: "全屏科技风背景图",
      props: {
        componentName: "SingleImage",
        logicalId: "fullscreen_tech_bg",
        parentLogicalId: "root",
        name: "全屏科技风背景",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          backgroundColor: "rgba(0,0,0,0)",
          borderStyle: "solid",
          borderRadius: 0,
          borderWidth: 0,
          borderColor: "rgba(0,0,0,0)",
        },
        imageUseMode: "base64",
        imageBase64:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzAyMEExOCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzA2MTkyRiIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdHRlcm4gaWQ9InAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTQwIDBIMFY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBFNUZGIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMDgiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9InVybCgjZykiLz48cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSJ1cmwoI3ApIi8+PC9zdmc+",
        imageShowType: "noRepeat",
        opacity: 1,
      },
    },
  ],
};
