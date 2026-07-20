import type { JsonObject } from "../../types/component.js";

export const singleImageCapability: JsonObject = {
  componentName: "SingleImage",
  displayName: "图片",
  description:
    "用于大屏面板背景、全屏背景、标题背景、纹理、光效 PNG/JPG/WebP 或 base64 图片点缀。imageSrc 只能使用用户明确提供的路径，AI 不要猜测或选择现有素材库资源；没有素材时可用 style/SvgDecoration 表达轻量背景，只有确实需要图片纹理时才生成短 base64。",

  aiRole:
    "AI 负责图片组件的位置、尺寸、图片来源和 imageLayerRole。MCP 负责补齐默认 props，并只把 background 图片强制置底。",

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
      description: "图片资源路径。只能在用户明确提供具体路径时填写；AI 不要自行编造或选择现有素材库路径。",
    },
    {
      path: "imageBase64",
      type: "string",
      description:
        "base64 图片内容。优先使用用户提供的 base64；AI 自行生成时必须保持短小，只用于确实需要图片纹理/光效的场景。填写后 imageUseMode 必须为 base64。",
    },
    {
      path: "imageShowType",
      type: "enum",
      values: ["noRepeat", "repeat", "repeatX", "repeatY"],
      description: "图片平铺方式。",
    },
    {
      path: "imageLayerRole",
      type: "enum",
      values: ["background", "content"],
      defaultValue: "background",
      description:
        "图片层级语义。background 用于全屏/面板底图并强制置底；content 用于照片、鸟瞰图、Logo、复杂插画等业务内容，进入主内容组并保持在面板背景之上。",
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
    "用户明确提供的 imageSrc/imageBase64 优先使用；无素材时优先考虑 style.backgroundColor 或 SvgDecoration，禁止自行选择现有素材库路径，只有确实需要图片纹理时才生成短 base64。",
    "禁止生成不可访问的外部图片链接或照片级真实图片；自行生成的 base64 内容应为短小的矢量风格渐变、网格、光效或纹理。",
    "需要真实图片素材、纹理或光效时使用 SingleImage；简单面板底色、边框和线性结构优先使用 style 或 SvgDecoration。",
    "当 imageBase64 非空时，imageUseMode 必须为 base64；当 imageSrc 非空且 imageBase64 为空时，imageUseMode 使用 upload。",
    "全屏或面板底图必须设置 imageLayerRole=background；照片、鸟瞰图、Logo、复杂插画等业务内容图片必须设置 imageLayerRole=content。",
    "只有 imageLayerRole=background 的 SingleImage 会被排到 SingleText、SvgDecoration、PieChart 等内容之后；content 图片参与普通主内容排序并应使用明确 zIndex。",
    "手动构建 __Group__ 的 children 数组时，只需把 imageLayerRole=background 的 SingleImage 放在 children 末尾；content 图片应按实际遮挡关系放入主内容层。",
  ],
  visualRules: [
    "AI 始终保有设计权：根据用户需求决定是否使用 SingleImage。不要为了默认科技感而生成长 base64。",
    "全屏背景图应覆盖整个画布（如 1920×1080），并位于 ComponentSchema[] 末尾作为最底层，避免遮挡内容。",
    "生成的 base64 背景图应使用短小矢量或简单纹理：深色渐变、科技网格、弱光晕、细边框，避免大尺寸照片级真实图片。",
    "照片、鸟瞰图、Logo、复杂插画等不可重画内容使用 imageLayerRole=content，必须位于面板背景之上；可通过 zIndex 和数组顺序与标题或标注建立局部遮挡关系。",
    "在任意 __Group__ 的 children 数组中，覆盖全屏或全面板且 imageLayerRole=background 的 SingleImage 必须是最后一个元素；decorative 光效/纹理如需置顶应使用 SvgDecoration，而不是把背景图片标记为 content。",
    "当 style.backgroundColor 或 SvgDecoration 足以表达背景结构时，不必额外生成 SingleImage。",
  ],
  examples: [
    {
      title: "用户提供的面板背景图",
      props: {
        componentName: "SingleImage",
        logicalId: "panel_bg_image",
        parentLogicalId: "sales_group",
        name: "用户提供背景",
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
        imageLayerRole: "background",
        imageSrc: "<user-provided-image-src>",
        imageShowType: "noRepeat",
        opacity: 1,
      },
    },
    {
      title: "全屏背景图配置示例",
      props: {
        componentName: "SingleImage",
        logicalId: "fullscreen_tech_bg",
        parentLogicalId: "root",
        name: "全屏背景",
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
        imageLayerRole: "background",
        imageBase64:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzAyMEExOCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzA2MTkyRiIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdHRlcm4gaWQ9InAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTQwIDBIMFY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBFNUZGIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMDgiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9InVybCgjZykiLz48cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSJ1cmwoI3ApIi8+PC9zdmc+",
        imageShowType: "noRepeat",
        opacity: 1,
      },
    },
  ],
};
