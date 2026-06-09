import type { ComponentDefinition, JsonObject, JsonValue } from "../types/component.js";

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneJsonObject(value: JsonObject): JsonObject {
  return JSON.parse(JSON.stringify(value)) as JsonObject;
}

function hasPath(items: JsonValue | undefined, path: string): boolean {
  return Array.isArray(items)
    ? items.some((item) => isJsonObject(item) && item.path === path)
    : false;
}

function withoutPath(items: JsonValue | undefined, path: string) {
  return Array.isArray(items)
    ? items.filter((item) => !isJsonObject(item) || item.path !== path)
    : [];
}

function appendUniqueByPath(items: JsonValue | undefined, additions: JsonObject[]) {
  const baseItems = Array.isArray(items) ? [...items] : [];
  const existingPaths = new Set(
    baseItems
      .filter(isJsonObject)
      .map((item) => item.path)
      .filter((path): path is string => typeof path === "string"),
  );

  for (const addition of additions) {
    const path = addition.path;
    if (typeof path === "string" && !existingPaths.has(path)) {
      baseItems.push(addition);
      existingPaths.add(path);
    }
  }

  return baseItems;
}

function ensureStyleChildren(items: JsonValue | undefined) {
  const baseItems = Array.isArray(items) ? [...items] : [];
  const styleItem = baseItems.find(
    (item) => isJsonObject(item) && item.path === "style",
  );

  if (isJsonObject(styleItem)) {
    styleItem.children = appendUniqueByPath(styleItem.children, [
      { path: "style.left", type: "number", description: "画布左侧距离。" },
      { path: "style.top", type: "number", description: "画布顶部距离。" },
      { path: "style.width", type: "number", description: "组件宽度。" },
      { path: "style.height", type: "number", description: "组件高度。" },
      {
        path: "style.position",
        type: "string",
        value: "absolute",
        description: "固定使用 absolute。",
      },
      {
        path: "style.position",
        type: "string",
        value: "absolute",
        description: "固定使用 absolute。",
      },
    ]);
  }

  return baseItems;
}

function baseStyleCapability(): JsonObject {
  return {
    path: "style",
    type: "object",
    description:
      "组件基础位置尺寸配置，对应 ChartPositionSetter。所有组件都必须包含 left、top、width、height、position。",
    children: [
      { path: "style.left", type: "number", description: "画布左侧距离。" },
      { path: "style.top", type: "number", description: "画布顶部距离。" },
      { path: "style.width", type: "number", description: "组件宽度。" },
      { path: "style.height", type: "number", description: "组件高度。" },
      {
        path: "style.position",
        type: "string",
        value: "absolute",
        description: "固定使用 absolute。",
      },
    ],
  };
}

function baseWritableProps(definition: ComponentDefinition): JsonObject[] {
  const backgroundPath =
    definition.componentType === "chart"
      ? "option.backgroundColor"
      : "style.backgroundColor";

  const backgroundDescription =
    definition.componentType === "chart"
      ? "图表类组件背景色，对应 ColorSetter，必须写入 option.backgroundColor。通常使用 transparent 或 rgba 透明底以便和面板协调。"
      : "非图表类组件背景色，对应 ColorSetter，必须写入 style.backgroundColor。";

  return [
    {
      path: "style",
      type: "object",
      description:
        "组件基础位置尺寸配置，对应 ChartPositionSetter；包含 left、top、width、height、position。style.zIndex 可保留默认值，层级由 ComponentSchema[] 输出顺序控制。",
    },
    {
      path: "rotate",
      type: "number",
      range: [-360, 360],
      description: "组件旋转角度，对应 NumberSetter。",
    },
    {
      path: "opacity",
      type: "number",
      range: [0, 1],
      description: "组件不透明度，对应 SliderSetter。",
    },
    {
      path: "entryAnimiation",
      type: "object",
      setter: "CollapsePanel",
      description:
        "组件入场动画配置，对应入场动画折叠面板。无明确动画要求时保持 isShow=false、type=''。",
      children: [
        {
          path: "entryAnimiation.isShow",
          type: "boolean",
          setter: "SwitchSetter",
          description: "是否启用入场动画。",
        },
        {
          path: "entryAnimiation.type",
          type: "enum",
          setter: "SelectSetter",
          values: [
            "animate__lightSpeedInRight",
            "animate__fadeInLeft",
            "animate__zoomIn",
            "animate__rollIn",
            "animate__jackInTheBox",
            "animate__heartBeat",
            "animate__bounceInDown",
            "animate__rubberBand",
            "animate__bounce",
          ],
          defaultValue: "",
          description:
            "动画样式。只有 entryAnimiation.isShow=true 时才选择具体动画。",
          options: [
            { label: "右光速", value: "animate__lightSpeedInRight" },
            { label: "向左淡入", value: "animate__fadeInLeft" },
            { label: "放大", value: "animate__zoomIn" },
            { label: "滚入", value: "animate__rollIn" },
            { label: "杰克盒子", value: "animate__jackInTheBox" },
            { label: "心跳", value: "animate__heartBeat" },
            { label: "向下弹跳", value: "animate__bounceInDown" },
            { label: "橡皮筋", value: "animate__rubberBand" },
            { label: "弹跳", value: "animate__bounce" },
          ],
        },
      ],
    },
    {
      path: backgroundPath,
      type: "color",
      description: backgroundDescription,
    },
  ];
}

export function withBaseCapability(
  definition: ComponentDefinition,
): JsonObject {
  const capability = cloneJsonObject(definition.capability);
  capability.requiredProps = withoutPath(capability.requiredProps, "style.zIndex");
  capability.aiWritableProps = withoutPath(capability.aiWritableProps, "style.zIndex");
  capability.componentType = definition.componentType;
  capability.layerRules = {
    description:
      "渲染层级由 ComponentSchema[] 输出顺序控制：数组越靠前越在顶层，数组越靠后越在底层。AI 不需要通过 style.zIndex 控制层级。",
  };
  capability.baseConfig = {
    description:
      "所有组件共享基础配置：位置尺寸、旋转角度、不透明度和背景颜色。渲染层级由 ComponentSchema[] 输出顺序控制。",
    setters: [
      {
        path: "style",
        setter: "ChartPositionSetter",
        description:
          "位置尺寸配置。style 必须包含 left、top、width、height、position；zIndex 仅作为兼容字段保留默认值。",
      },
      {
        path: "rotate",
        setter: "NumberSetter",
        range: [-360, 360],
        description: "旋转角度。",
      },
      {
        path: "opacity",
        setter: "SliderSetter",
        range: [0, 1],
        description: "不透明度。",
      },
      {
        path:
          definition.componentType === "chart"
            ? "option.backgroundColor"
            : "style.backgroundColor",
        setter: "ColorSetter",
        description:
          definition.componentType === "chart"
            ? "图表类背景色写入 option.backgroundColor。"
            : "非图表类背景色写入 style.backgroundColor。",
      },
      {
        path: "entryAnimiation",
        setter: "CollapsePanel",
        description:
          "入场动画配置。entryAnimiation.isShow 使用 SwitchSetter，entryAnimiation.type 使用 SelectSetter；无明确要求时保持关闭。",
        defaultValue: {
          isShow: false,
          type: "",
        },
        options: [
          { label: "右光速", value: "animate__lightSpeedInRight" },
          { label: "向左淡入", value: "animate__fadeInLeft" },
          { label: "放大", value: "animate__zoomIn" },
          { label: "滚入", value: "animate__rollIn" },
          { label: "杰克盒子", value: "animate__jackInTheBox" },
          { label: "心跳", value: "animate__heartBeat" },
          { label: "向下弹跳", value: "animate__bounceInDown" },
          { label: "橡皮筋", value: "animate__rubberBand" },
          { label: "弹跳", value: "animate__bounce" },
        ],
      },
    ],
  };

  if (!hasPath(capability.requiredProps, "style")) {
    capability.requiredProps = appendUniqueByPath(capability.requiredProps, [
      baseStyleCapability(),
    ]);
  } else {
    capability.requiredProps = ensureStyleChildren(capability.requiredProps);
  }

  capability.aiWritableProps = appendUniqueByPath(
    capability.aiWritableProps,
    baseWritableProps(definition),
  );

  return capability;
}
