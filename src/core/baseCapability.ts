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
