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

function chartBaseWritableProps(): JsonObject[] {
  return [
    {
      path: "option.color",
      type: "array<string>",
      description: "扇区颜色数组，MCP 按下标与默认色板合并。",
    },
    {
      path: "chartData.constant.data",
      type: "array<{name:string,type?:string,value:number}>",
      description:
        "常量数据行。有分类/序列数据的图表必须提供真实业务 data 数组，每行使用 name、value，可选 type；MCP 会补齐 originalData、fieldList、dimension、indicator、sourceType 等完整 chartData 结构。禁止省略数据让组件回退到默认“类目N/系列”演示数据。",
      itemShape: {
        name: "分类名称，对应饼图扇区名称。",
        type: "系列名称，可省略，默认使用“系列”。",
        value: "分类数值，对应饼图扇区大小。",
      },
      example: [
        { name: "重大风险", type: "系列", value: 34 },
        { name: "较大风险", type: "系列", value: 78 },
        { name: "一般风险", type: "系列", value: 156 },
        { name: "低风险", type: "系列", value: 118 },
      ],
    },
    {
      path: "option.tooltip",
      type: "object",
      description: "提示框配置。",
      children: [
        {
          path: "option.tooltip.show",
          type: "boolean",
          description: "是否显示提示框。",
        },
        {
          path: "option.tooltip.backgroundColor",
          type: "color",
          description: "提示框背景色。",
        },
        {
          path: "option.tooltip.textStyle",
          type: "object",
          description: "提示框文字样式。",
          children: [
            {
              path: "option.tooltip.textStyle.color",
              type: "color",
              description: "文字颜色。",
            },
            {
              path: "option.tooltip.textStyle.fontSize",
              type: "number",
              description: "字号。",
            },
            {
              path: "option.tooltip.textStyle.fontWeight",
              type: "enum",
              values: ["normal", "bold", "bolder"],
              description: "字重。",
            },
            {
              path: "option.tooltip.textStyle.fontStyle",
              type: "enum",
              values: ["normal", "italic", "oblique"],
              description: "字体样式。",
            },
            {
              path: "option.tooltip.textStyle.fontFamily",
              type: "string",
              description: "字体。",
            },
          ],
        },
      ],
    },
    {
      path: "option.legend",
      type: "object",
      description:
        "图例配置。legend.left 与 legend.top 必须成对选择合法位置，分别保存为字符串。",
      positionRules: {
        fields: ["left", "top"],
        description:
          "每一项的第一个值写入 legend.left，第二个值写入 legend.top，表示图例在容器的八个方位。",
        options: [
          ["left", "top"],
          ["center", "top"],
          ["right", "top"],
          ["left", "center"],
          ["right", "center"],
          ["left", "bottom"],
          ["center", "bottom"],
          ["right", "bottom"],
        ],
      },
      children: [
        {
          path: "option.legend.show",
          type: "boolean",
          description: "是否显示图例。",
        },
        {
          path: "option.legend.left",
          type: "enum",
          values: ["left", "center", "right"],
          description:
            "图例水平位置，必须与 option.legend.top 组合成 positionRules.options 中的一项。",
        },
        {
          path: "option.legend.top",
          type: "enum",
          values: ["top", "center", "bottom"],
          description:
            "图例垂直位置，必须与 option.legend.left 组合成 positionRules.options 中的一项。",
        },
        {
          path: "option.legend.offsetX",
          type: "number",
          description:
            "图例水平偏移，单位 px。正数向右，负数向左。用于在保持 legend.left/legend.top 语义位置的基础上微调图例，不要用它替代正确的图例方位。",
        },
        {
          path: "option.legend.offsetY",
          type: "number",
          description:
            "图例垂直偏移，单位 px。正数向下，负数向上。底部 legend 与外部 label 或底部装饰挤压时，通常使用 -4 到 -14 让 legend 轻微上移。",
        },
        {
          path: "option.legend.textStyle",
          type: "object",
          description: "图例文字样式。",
          children: [
            {
              path: "option.legend.textStyle.color",
              type: "color",
              description: "文字颜色。",
            },
            {
              path: "option.legend.textStyle.fontSize",
              type: "number",
              description: "字号。",
            },
            {
              path: "option.legend.textStyle.fontWeight",
              type: "enum",
              values: ["normal", "bold", "bolder"],
              description: "字重。",
            },
            {
              path: "option.legend.textStyle.fontStyle",
              type: "enum",
              values: ["normal", "italic", "oblique"],
              description: "字体样式。",
            },
            {
              path: "option.legend.textStyle.fontFamily",
              type: "string",
              description: "字体。",
            },
          ],
        },
      ],
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

  if (definition.componentType === "chart") {
    capability.aiWritableProps = appendUniqueByPath(
      capability.aiWritableProps,
      chartBaseWritableProps(),
    );
  }

  return capability;
}
