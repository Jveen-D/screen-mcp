import { generateComponentsSchema } from "../../core/schema.js";
import type { JsonObject, JsonValue } from "../../types/component.js";
import type {
  ModuleDefinition,
  ModuleInput,
  ModuleSlotInput,
  ModuleStyle,
} from "../../types/module.js";
import { chartPanelCapability } from "./capability.js";

const SUPPORTED_MAIN_COMPONENTS = ["PieChart"];
const DEFAULT_DECORATION_SVG =
  '<svg viewBox="0 0 120 64" xmlns="http://www.w3.org/2000/svg"><path d="M4 60V18C4 10.268 10.268 4 18 4h42" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M76 4h40v16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M18 52h84" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".55"/><circle cx="108" cy="52" r="4" fill="currentColor"/></svg>';

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertString(value: JsonValue | undefined, fieldName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`missing required module prop: ${fieldName}`);
  }

  return value;
}

function assertStyle(value: JsonValue | undefined): ModuleStyle {
  if (!isJsonObject(value)) {
    throw new Error("missing required module prop: style");
  }

  const requiredNumbers = ["left", "top", "width", "height", "zIndex"];
  for (const key of requiredNumbers) {
    if (typeof value[key] !== "number") {
      throw new Error(`missing required module style number: ${key}`);
    }
  }

  return {
    ...value,
    position: "absolute",
  } as ModuleStyle;
}

function asSlot(value: JsonValue | undefined, slotName: string): ModuleSlotInput | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isJsonObject(value) || typeof value.componentName !== "string") {
    throw new Error(`invalid module slot: ${slotName}`);
  }

  return value as ModuleSlotInput;
}

function asSlotArray(value: JsonValue | undefined, slotName: string): ModuleSlotInput[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error(`invalid module slot array: ${slotName}`);
  }

  return value.map((item, index) => {
    if (!isJsonObject(item) || typeof item.componentName !== "string") {
      throw new Error(`invalid module slot: ${slotName}[${index}]`);
    }

    return item as ModuleSlotInput;
  });
}

function slotProps(slot: ModuleSlotInput | undefined): JsonObject {
  const props = slot?.props;
  return isJsonObject(props) ? props : {};
}

function textColor(theme: JsonObject): string {
  return typeof theme.textColor === "string" ? theme.textColor : "#DFF8FF";
}

function primaryColor(theme: JsonObject): string {
  return typeof theme.primaryColor === "string" ? theme.primaryColor : "#00E5FF";
}

function componentNameFor(
  slot: ModuleSlotInput | undefined,
  fallback: string,
): string {
  return slot?.componentName ?? fallback;
}

function mergeStyle(base: JsonObject, override: JsonValue | undefined): JsonObject {
  return isJsonObject(override) ? { ...base, ...override } : base;
}

function createBackgroundProps(input: ModuleInput, slot: ModuleSlotInput): JsonObject {
  const props = slotProps(slot);
  const hasImageResource =
    typeof props.imageBase64 === "string" && props.imageBase64.trim() !== "" ||
    typeof props.imageSrc === "string" && props.imageSrc.trim() !== "";

  return {
    ...props,
    componentName: componentNameFor(slot, "SingleImage"),
    logicalId: `${input.logicalId}_background`,
    parentLogicalId: input.logicalId,
    name: typeof props.name === "string" ? props.name : "模块背景",
    imageUseMode: "upload",
    imageSrc: typeof props.imageSrc === "string" ? props.imageSrc : "",
    imageBase64: typeof props.imageBase64 === "string" ? props.imageBase64 : "",
    imageShowType: typeof props.imageShowType === "string" ? props.imageShowType : "noRepeat",
    opacity: typeof props.opacity === "number" ? props.opacity : hasImageResource ? 0.95 : 0,
    style: mergeStyle(
      {
        position: "absolute",
        left: input.style.left,
        top: input.style.top,
        width: input.style.width,
        height: input.style.height,
        backgroundColor: "rgba(0,0,0,0)",
        borderStyle: "solid",
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "rgba(0,0,0,0)",
        zIndex: input.style.zIndex,
      },
      props.style,
    ),
  };
}

function createTitleProps(input: ModuleInput, slot: ModuleSlotInput | undefined): JsonObject {
  const props = slotProps(slot);
  const theme = isJsonObject(input.theme) ? input.theme : {};
  const textContent =
    typeof props.textContent === "string"
      ? props.textContent
      : typeof input.title === "string"
        ? input.title
        : "图表标题";

  return {
    ...props,
    componentName: componentNameFor(slot, "SingleText"),
    logicalId: `${input.logicalId}_title`,
    parentLogicalId: input.logicalId,
    name: typeof props.name === "string" ? props.name : "模块标题",
    textContent,
    style: mergeStyle(
      {
        position: "absolute",
        left: input.style.left + 24,
        top: input.style.top + 18,
        width: Math.max(input.style.width - 48, 40),
        height: 36,
        fontSize: 22,
        color: textColor(theme),
        textAlign: "left",
        backgroundColor: "rgba(0,0,0,0)",
        fontWeight: "bold",
        fontStyle: "normal",
        letterSpacing: 2,
        lineHeight: 1.4,
        zIndex: input.style.zIndex + 3,
      },
      props.style,
    ),
  };
}

function createMainChartProps(input: ModuleInput, slot: ModuleSlotInput): JsonObject {
  if (!SUPPORTED_MAIN_COMPONENTS.includes(slot.componentName)) {
    throw new Error(`unsupported mainChart componentName: ${slot.componentName}`);
  }

  const props = slotProps(slot);
  const theme = isJsonObject(input.theme) ? input.theme : {};
  const defaultColors = [
    primaryColor(theme),
    typeof theme.secondaryColor === "string" ? theme.secondaryColor : "#7C4DFF",
    typeof theme.accentColor === "string" ? theme.accentColor : "#FFB300",
    "#00C853",
  ];

  return {
    ...props,
    componentName: slot.componentName,
    logicalId: `${input.logicalId}_main_chart`,
    parentLogicalId: input.logicalId,
    name: typeof props.name === "string" ? props.name : "主图表",
    style: mergeStyle(
      {
        position: "absolute",
        left: input.style.left + 32,
        top: input.style.top + 72,
        width: Math.max(input.style.width - 64, 80),
        height: Math.max(input.style.height - 96, 80),
        zIndex: input.style.zIndex + 2,
      },
      props.style,
    ),
    option: {
      backgroundColor: "transparent",
      color: defaultColors,
      ...(isJsonObject(props.option) ? props.option : {}),
    },
  };
}

function createDecorationProps(
  input: ModuleInput,
  slot: ModuleSlotInput,
  index: number,
): JsonObject {
  const props = slotProps(slot);
  const theme = isJsonObject(input.theme) ? input.theme : {};
  const offset = 16;
  const defaultPositions = [
    {
      left: input.style.left + input.style.width - 136,
      top: input.style.top + offset,
      width: 120,
      height: 64,
    },
    {
      left: input.style.left + offset,
      top: input.style.top + offset,
      width: 120,
      height: 64,
    },
    {
      left: input.style.left + input.style.width - 136,
      top: input.style.top + input.style.height - 80,
      width: 120,
      height: 64,
    },
    {
      left: input.style.left + offset,
      top: input.style.top + input.style.height - 80,
      width: 120,
      height: 64,
    },
  ];
  const position = defaultPositions[index % defaultPositions.length];

  return {
    ...props,
    componentName: slot.componentName,
    logicalId: `${input.logicalId}_decoration_${index + 1}`,
    parentLogicalId: input.logicalId,
    name: typeof props.name === "string" ? props.name : `模块装饰${index + 1}`,
    style: mergeStyle(
      {
        position: "absolute",
        ...position,
        backgroundColor: "rgba(0,0,0,0)",
        zIndex: input.style.zIndex + 4,
      },
      props.style,
    ),
    svgSource: "custom",
    svgPreset: typeof props.svgPreset === "string" ? props.svgPreset : "",
    svgContent:
      typeof props.svgContent === "string" && props.svgContent.trim() !== ""
        ? props.svgContent
        : DEFAULT_DECORATION_SVG,
    svgFit: typeof props.svgFit === "string" ? props.svgFit : "contain",
    primaryColor:
      typeof props.primaryColor === "string" ? props.primaryColor : primaryColor(theme),
  };
}

function normalizeModuleInput(rawInput: ModuleInput): ModuleInput {
  const moduleName = assertString(rawInput.moduleName, "moduleName");
  if (moduleName !== "ChartPanel") {
    throw new Error(`unknown moduleName: ${moduleName}`);
  }

  return {
    ...rawInput,
    moduleName,
    logicalId: assertString(rawInput.logicalId, "logicalId"),
    parentLogicalId: assertString(rawInput.parentLogicalId, "parentLogicalId"),
    style: assertStyle(rawInput.style),
  };
}

export function generateChartPanelSchemas(rawInput: ModuleInput) {
  const input = normalizeModuleInput(rawInput);
  const slots = input.slots;
  if (!isJsonObject(slots)) {
    throw new Error("missing required module prop: slots");
  }

  const backgroundSlot = asSlot(slots.background, "background");
  const titleSlot = asSlot(slots.title, "title");
  const mainChartSlot = asSlot(slots.mainChart, "mainChart");
  const decorationSlots = asSlotArray(slots.decorations, "decorations");

  if (!mainChartSlot) {
    throw new Error("missing required module slot: mainChart");
  }

  const componentProps: JsonObject[] = [];

  if (backgroundSlot) {
    componentProps.push(createBackgroundProps(input, backgroundSlot));
  }

  if (titleSlot || typeof input.title === "string") {
    componentProps.push(createTitleProps(input, titleSlot));
  }

  componentProps.push(createMainChartProps(input, mainChartSlot));

  for (const [index, slot] of decorationSlots.entries()) {
    componentProps.push(createDecorationProps(input, slot, index));
  }

  return componentProps.map((props, index) => ({
    ...generateComponentsSchema(props),
    indexNum: index + 1,
  }));
}

export const chartPanelDefinition = {
  moduleName: "ChartPanel",
  displayName: "图表面板",
  description:
    "通用图表面板模块，用 slot 编排背景、标题、主图表和装饰组件。",
  capability: chartPanelCapability,
  generateSchemas: generateChartPanelSchemas,
} satisfies ModuleDefinition;
