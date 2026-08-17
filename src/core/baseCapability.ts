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

function asString(value: JsonValue | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function dataBindingCapability(definition: ComponentDefinition): JsonObject {
  const datasource = definition.defaultProps.datasource;
  if (isJsonObject(datasource) && typeof datasource.sourceType === "string") {
    const sourceType = asString(datasource.sourceType) ?? "unknown";
    const fieldMappings = Array.isArray(datasource.fieldMappings)
      ? datasource.fieldMappings.filter(isJsonObject)
      : [];
    const fieldKeys = fieldMappings
      .map((item) => asString(item.key))
      .filter((key): key is string => Boolean(key));

    return {
      mode: "datasource",
      editingOnly: true,
      inspectPath: "props.datasource",
      defaultSourceType: sourceType,
      sourceTypes: ["externalConstant", "constant", "api", "dataSet"],
      unsupportedSourceTypes: ["dataSet"],
      sourceTypeSemantics: {
        externalConstant: {
          dataPath: "props",
          alsoWhenSourceTypeMissing: true,
          description: "不走数据源，组件读取自身 aiWritableProps。修改 constantData 不会更新画面。",
        },
        constant: {
          dataPath: "props.datasource.constantData",
          description: "读取组件节点内的静态数据。",
        },
        api: {
          referencePath: "props.datasource.apiId",
          description: "引用项目级 datasource.apiList 中已经存在的接口。",
        },
        dataSet: {
          supported: false,
          description: "编辑器的数据集选项已禁用，不要使用。",
        },
      },
      staticDataPath: "props.datasource.constantData",
      staticColumnsPath: "props.datasource.constantTableColumns",
      apiReferencePath: "props.datasource.apiId",
      fetchOnMountPath: "props.datasource.fetchOnMount",
      fieldMappingsPath: "props.datasource.fieldMappings",
      fieldModePath: "props.datasource.fieldMode",
      dataFieldPathPath: "props.datasource.dataFieldPath",
      pollingPaths: ["props.datasource.autoRefresh", "props.datasource.refreshInterval"],
      ...(fieldKeys.length ? { fieldMappingKeys: fieldKeys } : {}),
      staticDataContract: {
        dataTypePath: "props.datasource.constantDataType",
        dataTypes: {
          table: "constantData 是行数组，列定义在 constantTableColumns。",
          json: "constantData 可以是任意 JSON 结构。",
        },
        tableColumnTypes: ["string", "number"],
        keyAlignmentPaths: [
          "props.datasource.constantTableColumns[].key",
          "props.datasource.constantData[].<key>",
          "props.datasource.fieldMappings[].mapFields[].path",
        ],
        mappingTargetPath: "props.datasource.fieldMappings[].key",
        mappingTargetRule: "fieldMappingKeys 存在时，只能使用其中当前组件声明的字段。",
        mapFieldsCardinality: 1,
        mapFieldsCardinalityRule: "每个 mapFields 必须正好有一个元素才会生效。",
        leadingArrayIndexIsIgnored: true,
        leadingArrayIndexExamples: ["0.value -> value", "[0].name -> name"],
        fieldModes: {
          single: "只取第一行并返回对象。",
          multiple: "返回完整行数组。",
        },
        constantIgnoresDataFieldPath: true,
      },
      apiContract: {
        projectApiListPath: "datasource.apiList[].id",
        mustReferenceExistingId: true,
        missingApiAction: "项目接口清单没有目标接口时，要求用户先在编辑器数据源面板创建，禁止编造 id 或地址。",
        responseDataPath: "props.datasource.dataFieldPath",
        responseDataPathResolver: "lodash.get",
        wrapsNonArrayResult: true,
        fetchOnMountPath: "props.datasource.fetchOnMount",
        designMode: {
          sendsRequests: false,
          dataSource: "接口面板测试数据 designData",
          canRefresh: false,
        },
        previewMode: {
          sendsRequests: true,
          supportsPolling: true,
        },
      },
      pollingContract: {
        enabledPath: "props.datasource.autoRefresh",
        intervalPath: "props.datasource.refreshInterval",
        intervalUnit: "seconds",
        requiresSourceType: "api",
        runtimeCondition: "preview mode",
      },
      rules: [
        "编辑已导出节点时先检查实际 props 数据结构和 sourceType，不要按组件名称猜协议。",
        "禁止写入 $bind；页面级 state 属于在线代码，不是组件数据绑定语法。",
        ...(sourceType === "externalConstant"
          ? ["当前默认 sourceType=externalConstant：修改组件自身 aiWritableProps，不能修改 constantData 代替。"]
          : []),
        "切换到 constant 时，列定义、数据行和字段映射三处 key 必须一致，每个 mapFields 必须正好一项。",
        "sourceType=api 时只能引用项目 datasource.apiList 已有 id；真实请求和轮询必须在预览态验证。",
      ],
    };
  }

  const chartData = definition.defaultProps.chartData;
  if (isJsonObject(chartData)) {
    return {
      mode: "chartData",
      editingOnly: true,
      inspectPath: "props.chartData",
      defaultSourceType: asString(chartData.sourceType) ?? "unknown",
      sourceTypes: ["constant", "api", "dataSet", "form"],
      sourceTypeSemantics: {
        constant: {
          dataPath: "props.chartData.constant.data",
          description: "读取行数组，并由 dimension 和 indicator 声明维度、指标与聚合方式。",
        },
        api: {
          referencePath: "props.chartData.api.apiUuid",
          description: "引用平台已有接口，并使用 chartData.api 中的请求和响应处理配置。",
        },
        dataSet: { description: "使用平台数据集配置。" },
        form: { description: "使用平台表单配置。" },
      },
      staticDataPath: "props.chartData.constant.data",
      apiReferencePath: "props.chartData.api.apiUuid",
      apiRequestPath: "props.chartData.api",
      fieldListPath: "props.chartData.constant.fieldList",
      dimensionPath: "props.chartData.dimension",
      indicatorPath: "props.chartData.indicator",
      pollingPaths: ["props.chartData.isPolling", "props.chartData.polling"],
      staticDataContract: {
        dataShape: "rowArray",
        originalDataPath: "props.chartData.constant.originalData",
        fieldListPath: "props.chartData.constant.fieldList",
        fieldNamePaths: [
          "props.chartData.dimension[].fieldName",
          "props.chartData.indicator[].fieldName",
        ],
        fieldNameMustMatchDataKeys: true,
        calculateTypePaths: [
          "props.chartData.dimension[].fieldDataConfig.calculateType",
          "props.chartData.indicator[].fieldDataConfig.calculateType",
        ],
        calculateTypeExamples: ["SUM", "COUNT"],
        accuracyPath: "props.chartData.indicator[].fieldDataConfig.format.accuracy",
        displayNamePaths: [
          "props.chartData.dimension[].fieldDataConfig.chartDisplayName",
          "props.chartData.indicator[].fieldDataConfig.chartDisplayName",
        ],
        consistencyPaths: [
          "props.chartData.constant.data",
          "props.chartData.constant.originalData",
          "props.chartData.constant.fieldList",
          "props.chartData.dimension",
          "props.chartData.indicator",
        ],
      },
      apiContract: {
        referencePath: "props.chartData.api.apiUuid",
        mustReferenceExistingId: true,
        requestConfigurationPaths: [
          "props.chartData.api.requestParam",
          "props.chartData.api.requestBody",
          "props.chartData.api.headers",
          "props.chartData.api.fieldList",
          "props.chartData.api.processFunction",
        ],
        missingApiAction: "禁止编造 apiUuid；没有目标接口时先要求用户在平台创建。",
      },
      pollingContract: {
        enabledPath: "props.chartData.isPolling",
        intervalPath: "props.chartData.polling",
        intervalUnit: "seconds",
        fallbackIntervalSeconds: 10,
        ...(typeof chartData.polling === "number"
          ? { defaultIntervalSeconds: chartData.polling }
          : {}),
        runtimeCondition: "designMode === 'live'",
      },
      rules: [
        "编辑已导出节点时先检查实际 props.chartData，不要按组件名称猜协议；禁止写入 $bind。",
        "静态数据写入 constant.data；dimension、indicator、originalData 和 fieldList 必须与当前数据链一致。",
        "dimension/indicator 的 fieldName 必须匹配数据行 key；calculateType 决定聚合，format.accuracy 控制小数位，chartDisplayName 控制显示名。",
        "sourceType=api 时 api.apiUuid 必须引用已有平台接口，请求参数、响应字段和 processFunction 必须与接口契约一致。",
        "isPolling 与 polling 只在运行/预览态生效，polling 单位为秒；设计态不能证明请求或轮询有效。",
        "screen-mcp 生成节点时优先使用该组件 capability 声明的语义数据字段，MCP 会同步完整 chartData；不要把运行时编辑规则误当成生成输入。",
        "直接编辑已导出节点必须修改当前真实数据链；只改生成输入的语义字段不会自动触发 MCP 编译。",
      ],
    };
  }

  return {
    mode: "componentProps",
    editingOnly: true,
    inspectPath: "props",
    rules: [
      "该组件默认没有 datasource 或 chartData；编辑已导出节点时只修改 capability.aiWritableProps 中声明的组件字段。",
      "不要为此组件凭空新增通用 datasource、chartData 或 $bind 结构；页面级 state 属于在线代码。",
    ],
  };
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
  capability.runtimeDataBinding = dataBindingCapability(definition);
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

  if (
    definition.componentType === "chart" &&
    !hasPath(capability.aiForbiddenProps, "chartData")
  ) {
    capability.aiWritableProps = appendUniqueByPath(
      capability.aiWritableProps,
      chartBaseWritableProps(),
    );
  }

  return capability;
}
