import {
  componentSchemaToEditorNode,
  generateComponentsSchema,
} from "../../core/schema.js";
import type { EditorGroupNode, JsonObject, JsonValue } from "../../types/component.js";
import type {
  ModuleDefinition,
  ModuleInput,
  ModuleSlotInput,
  ModuleStyle,
} from "../../types/module.js";
import { chartPanelCapability } from "./capability.js";

const SUPPORTED_MAIN_COMPONENTS = ["PieChart"];
const DEFAULT_DECORATION_SVG =
  '<svg viewBox="0 0 180 72" xmlns="http://www.w3.org/2000/svg"><path d="M8 62H92l18-18h62" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 46h76" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".5"/><path d="M118 28h46" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".42"/><circle cx="94" cy="62" r="4" fill="currentColor"/><circle cx="172" cy="44" r="4" fill="currentColor"/></svg>';
const TITLE_BADGE_SVG =
  '<svg viewBox="0 0 220 46" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".16"/><stop offset=".72" stop-color="currentColor" stop-opacity=".035"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path d="M14 42V18C14 10.268 20.268 4 28 4h108l18 16h32" fill="rgba(4,18,36,.28)" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".82"/><path d="M28 38h152" stroke="currentColor" stroke-width="1" opacity=".26"/><rect x="0" y="0" width="220" height="46" fill="url(#g)"/><circle cx="7" cy="7" r="3.5" fill="#FFB300"/><circle cx="198" cy="20" r="3.5" fill="currentColor" opacity=".8"/></svg>';
const DEFAULT_BACKGROUND_SVG =
  '<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#061A2E"/><stop offset=".58" stop-color="#03101F"/><stop offset="1" stop-color="#020813"/></linearGradient><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0v48" fill="none" stroke="#0B6B8F" stroke-width="1" opacity=".22"/></pattern><radialGradient id="glow" cx=".5" cy=".42" r=".58"><stop offset="0" stop-color="#00E5FF" stop-opacity=".16"/><stop offset=".45" stop-color="#00E5FF" stop-opacity=".05"/><stop offset="1" stop-color="#00E5FF" stop-opacity="0"/></radialGradient></defs><rect width="800" height="480" fill="url(#bg)"/><rect width="800" height="480" fill="url(#grid)"/><rect width="800" height="480" fill="url(#glow)"/><path d="M1 1H799V479H1Z" fill="none" stroke="#00E5FF" stroke-width="1.5" opacity=".55"/></svg>';
const TITLE_SAFE_HEIGHT = 72;
const MAIN_CHART_TOP_OFFSET = 92;
const MAIN_CHART_SIDE_PADDING = 20;
const MAIN_CHART_BOTTOM_PADDING = 68;
const DEFAULT_MODULE_Z_INDEX = 10;
const BACKGROUND_Z_OFFSET = 0;
const MAIN_CHART_Z_OFFSET = 2;
const DECORATION_Z_OFFSET = 4;
const TITLE_BADGE_Z_OFFSET = 6;
const TEXT_Z_OFFSET = 8;

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

  const requiredNumbers = ["left", "top", "width", "height"];
  for (const key of requiredNumbers) {
    if (typeof value[key] !== "number") {
      throw new Error(`missing required module style number: ${key}`);
    }
  }

  return {
    ...value,
    position: "absolute",
    zIndex:
      typeof value.zIndex === "number" ? value.zIndex : DEFAULT_MODULE_Z_INDEX,
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

function layerZIndex(input: ModuleInput, offset: number): number {
  return input.style.zIndex + offset;
}

function isPlaceholderBase64(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === "" || trimmed === "data:image/png;base64,..." || trimmed.endsWith(",AAAA") || trimmed.endsWith(",BBBB");
}

function createBackgroundProps(input: ModuleInput, slot: ModuleSlotInput): JsonObject {
  const props = slotProps(slot);
  const imageBase64 = typeof props.imageBase64 === "string" ? props.imageBase64 : "";
  const imageSrc = typeof props.imageSrc === "string" ? props.imageSrc : "";
  const hasImageBase64 = imageBase64.trim() !== "" && !isPlaceholderBase64(imageBase64);
  const hasImageSrc = imageSrc.trim() !== "";
  const hasImageResource = hasImageBase64 || hasImageSrc;

  return {
    ...props,
    componentName: componentNameFor(slot, "SingleImage"),
    logicalId: `${input.logicalId}_background`,
    parentLogicalId: input.logicalId,
    name: typeof props.name === "string" ? props.name : "模块背景",
    imageUseMode: hasImageBase64 ? "base64" : "upload",
    imageSrc,
    imageBase64: hasImageBase64 ? imageBase64 : "",
    imageShowType: typeof props.imageShowType === "string" ? props.imageShowType : "noRepeat",
    opacity: typeof props.opacity === "number" ? props.opacity : hasImageResource ? 0.95 : 1,
    style: mergeStyle(
      {
        position: "absolute",
        left: input.style.left,
        top: input.style.top,
        width: input.style.width,
        height: input.style.height,
        backgroundColor: "rgba(4,16,32,0.96)",
        borderStyle: "solid",
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "rgba(0,0,0,0)",
        zIndex: layerZIndex(input, BACKGROUND_Z_OFFSET),
      },
      props.style,
    ),
    svgSource: hasImageResource ? props.svgSource : "custom",
    svgContent: hasImageResource ? props.svgContent : DEFAULT_BACKGROUND_SVG,
  };
}

function createTitleBadgeProps(input: ModuleInput): JsonObject {
  const theme = isJsonObject(input.theme) ? input.theme : {};

  return {
    componentName: "SvgDecoration",
    logicalId: `${input.logicalId}_title_badge`,
    parentLogicalId: input.logicalId,
    name: "标题背景点缀",
    style: {
      position: "absolute",
      left: input.style.left + 8,
      top: input.style.top + 4,
      width: Math.min(Math.max(input.style.width * 0.28, 200), 260),
      height: 50,
      backgroundColor: "rgba(0,0,0,0)",
      zIndex: layerZIndex(input, TITLE_BADGE_Z_OFFSET),
    },
    svgSource: "custom",
    svgContent: TITLE_BADGE_SVG,
    svgFit: "fill",
    primaryColor: primaryColor(theme),
    opacity: 0.7,
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
        zIndex: layerZIndex(input, TEXT_Z_OFFSET),
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
        left: input.style.left + MAIN_CHART_SIDE_PADDING,
        top: input.style.top + MAIN_CHART_TOP_OFFSET,
        width: Math.max(input.style.width - MAIN_CHART_SIDE_PADDING * 2, 80),
        height: Math.max(input.style.height - MAIN_CHART_TOP_OFFSET - MAIN_CHART_BOTTOM_PADDING, 80),
        zIndex: layerZIndex(input, MAIN_CHART_Z_OFFSET),
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
      left: input.style.left + input.style.width - 196,
      top: input.style.top + 20,
      width: 180,
      height: 72,
    },
    {
      left: input.style.left + offset,
      top: input.style.top + input.style.height - 76,
      width: Math.max(input.style.width - offset * 2, 160),
      height: 56,
    },
    {
      left: input.style.left + input.style.width - 196,
      top: input.style.top + input.style.height - 76,
      width: 180,
      height: 56,
    },
    {
      left: input.style.left + offset,
      top: input.style.top + TITLE_SAFE_HEIGHT,
      width: 180,
      height: 72,
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
        zIndex: layerZIndex(input, DECORATION_Z_OFFSET),
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

function createAuxiliaryTextProps(
  input: ModuleInput,
  slot: ModuleSlotInput,
  index: number,
): JsonObject {
  const props = slotProps(slot);
  const theme = isJsonObject(input.theme) ? input.theme : {};

  return {
    ...props,
    componentName: componentNameFor(slot, "SingleText"),
    logicalId: `${input.logicalId}_aux_text_${index + 1}`,
    parentLogicalId: input.logicalId,
    name: typeof props.name === "string" ? props.name : `辅助文本${index + 1}`,
    textContent:
      typeof props.textContent === "string" ? props.textContent : "辅助信息",
    style: mergeStyle(
      {
        position: "absolute",
        left: input.style.left + 24,
        top: input.style.top + input.style.height - 48 - index * 34,
        width: Math.max(input.style.width - 48, 40),
        height: 28,
        fontSize: 14,
        color: textColor(theme),
        textAlign: "center",
        backgroundColor: "rgba(0,0,0,0)",
        fontWeight: "normal",
        fontStyle: "normal",
        letterSpacing: 0,
        lineHeight: 1.4,
        zIndex: layerZIndex(input, TEXT_Z_OFFSET),
      },
      props.style,
    ),
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
  const auxiliaryTextSlots = asSlotArray(slots.auxiliaryTexts, "auxiliaryTexts");

  if (!mainChartSlot) {
    throw new Error("missing required module slot: mainChart");
  }

  const componentProps: JsonObject[] = [];

  if (titleSlot || typeof input.title === "string") {
    componentProps.push(createTitleProps(input, titleSlot));
    componentProps.push(createTitleBadgeProps(input));
  }

  for (const [index, slot] of decorationSlots.entries()) {
    componentProps.push(createDecorationProps(input, slot, index));
  }

  for (const [index, slot] of auxiliaryTextSlots.entries()) {
    componentProps.push(createAuxiliaryTextProps(input, slot, index));
  }

  componentProps.push(createMainChartProps(input, mainChartSlot));

  if (backgroundSlot) {
    componentProps.push(createBackgroundProps(input, backgroundSlot));
  }

  return componentProps.map((props, index) => ({
    ...generateComponentsSchema(props),
    indexNum: index + 1,
  }));
}

export function generateChartPanelTreeSchema(rawInput: ModuleInput): EditorGroupNode {
  const input = normalizeModuleInput(rawInput);
  const children = generateChartPanelSchemas(input).map(componentSchemaToEditorNode);

  return {
    id: input.logicalId,
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {},
    title:
      typeof input.title === "string" && input.title.trim() !== ""
        ? input.title
        : "图表面板",
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };
}

export const chartPanelDefinition = {
  moduleName: "ChartPanel",
  displayName: "图表面板",
  description:
    "通用图表面板模块，用 slot 编排背景、标题、主图表和装饰组件。",
  capability: chartPanelCapability,
  generateSchemas: generateChartPanelSchemas,
  generateTreeSchema: generateChartPanelTreeSchema,
} satisfies ModuleDefinition;
