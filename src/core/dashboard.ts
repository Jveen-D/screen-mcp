import {
  componentSchemaToEditorNode,
  generateComponentsSchema,
  hasDefaultDemoChartRows,
  sortEditorTreeChildren,
  toSchemaId,
  uniqueSchemaId,
} from "./schema.js";
import { getComponentDefinition } from "./registry.js";
import { generateModuleTreeSchema } from "./modules.js";
import {
  groupEditorTreeChildren,
  resolveSemanticGroupingOptions,
} from "./grouping.js";
import type { EditorGroupNode, EditorTreeNode, JsonObject, JsonValue } from "../types/component.js";

type Rect = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asFiniteNumber(value: JsonValue | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asArray(value: JsonValue | undefined): JsonObject[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isJsonObject);
}

function dashboardRootId(input: JsonObject): string {
  const logicalId = input.logicalId;
  if (typeof logicalId === "string" && logicalId.trim() !== "") {
    return toSchemaId(logicalId);
  }

  return uniqueSchemaId("dashboard_root", "fs");
}

function canvasSize(input: JsonObject): { width: number; height: number } {
  const canvas = isJsonObject(input.canvas) ? input.canvas : {};

  return {
    width: asFiniteNumber(canvas.width) ?? 1920,
    height: asFiniteNumber(canvas.height) ?? 1080,
  };
}

function dashboardTitle(input: JsonObject): string {
  return typeof input.title === "string" && input.title.trim() !== ""
    ? input.title.trim()
    : "大屏";
}

function themeString(theme: JsonObject | undefined, key: string, fallback: string): string {
  const value = theme?.[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
}

function svgAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function backgroundSvg(
  width: number,
  height: number,
  fill: string,
  stroke: string,
  strokeOpacity: number,
): string {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const insetWidth = Math.max(1, safeWidth - 2);
  const insetHeight = Math.max(1, safeHeight - 2);

  return `<svg viewBox="0 0 ${safeWidth} ${safeHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="${safeWidth}" height="${safeHeight}" fill="${svgAttr(fill)}"/><rect x="1" y="1" width="${insetWidth}" height="${insetHeight}" fill="none" stroke="${svgAttr(stroke)}" stroke-width="1.5" opacity="${strokeOpacity}"/></svg>`;
}

function backgroundCarrierComponent(
  logicalId: string,
  parentId: string,
  name: string,
  rect: Rect,
  theme: JsonObject | undefined,
  fullScreen: boolean,
): JsonObject {
  const fill = fullScreen
    ? themeString(theme, "background", "#04111F")
    : themeString(theme, "panelBackground", "rgba(8,30,50,0.74)");
  const stroke = themeString(theme, "primaryColor", "#16D9FF");

  return {
    componentName: "SvgDecoration",
    logicalId,
    parentLogicalId: parentId,
    name,
    svgSource: "custom",
    svgContent: backgroundSvg(
      rect.width,
      rect.height,
      fill,
      stroke,
      fullScreen ? 0 : 0.42,
    ),
    svgFit: "fill",
    primaryColor: stroke,
    opacity: 1,
    style: {
      position: "absolute",
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      backgroundColor: "rgba(0,0,0,0)",
      zIndex: fullScreen ? 0 : 10,
    },
  };
}

function withParentAndTheme(
  item: JsonObject,
  parentId: string,
  theme: JsonObject | undefined,
  forceParent = false,
): JsonObject {
  const next: JsonObject = {
    ...item,
    parentLogicalId:
      !forceParent &&
      typeof item.parentLogicalId === "string" &&
      item.parentLogicalId.trim() !== ""
        ? item.parentLogicalId
        : parentId,
  };

  if (theme && !isJsonObject(next.theme)) {
    next.theme = theme;
  }

  return next;
}

function compileComponent(
  item: JsonObject,
  parentId: string,
  theme: JsonObject | undefined,
  forceParent = false,
): EditorTreeNode {
  if (typeof item.componentName !== "string" || item.componentName.trim() === "") {
    throw new Error("dashboard component missing componentName");
  }

  if (typeof item.logicalId !== "string" || item.logicalId.trim() === "") {
    throw new Error(`dashboard component ${item.componentName} missing logicalId`);
  }

  const schema = generateComponentsSchema(
    withParentAndTheme(item, parentId, theme, forceParent),
  );
  return componentSchemaToEditorNode(schema);
}

function nodeStyle(node: EditorTreeNode): JsonObject | undefined {
  const props = node.props;
  if (isJsonObject(props) && isJsonObject(props.style)) {
    return props.style;
  }

  return undefined;
}

function nodeRect(node: EditorTreeNode): Rect | undefined {
  const style = nodeStyle(node);
  if (!style) {
    return undefined;
  }

  const left = asFiniteNumber(style.left);
  const top = asFiniteNumber(style.top);
  const width = asFiniteNumber(style.width);
  const height = asFiniteNumber(style.height);
  if (left === undefined || top === undefined || width === undefined || height === undefined) {
    return undefined;
  }

  return { id: node.id, left, top, width, height };
}

function shouldOffsetAsClearLocalStyle(style: JsonObject, rect: Rect): boolean {
  const left = asFiniteNumber(style.left);
  const top = asFiniteNumber(style.top);
  if (left === undefined || top === undefined) {
    return false;
  }

  return (rect.left !== 0 && left < rect.left) ||
    (rect.top !== 0 && top < rect.top);
}

function offsetStyle(style: JsonObject, rect: Rect): void {
  const left = asFiniteNumber(style.left);
  const top = asFiniteNumber(style.top);
  if (left === undefined || top === undefined) {
    return;
  }

  style.left = left + rect.left;
  style.top = top + rect.top;
}

function absolutizeClearLocalStyles(node: EditorTreeNode, rect: Rect): void {
  if (node.componentName !== "__Group__") {
    const style = nodeStyle(node);
    if (style && shouldOffsetAsClearLocalStyle(style, rect)) {
      offsetStyle(style, rect);
    }
    return;
  }

  if (!Array.isArray(node.children)) {
    return;
  }

  node.children.forEach((child) => {
    absolutizeClearLocalStyles(child, rect);
  });
}

function nodeTitle(node: EditorTreeNode): string {
  if (typeof node.title === "string" && node.title.trim() !== "") {
    return node.title.trim();
  }

  const props = node.props;
  if (isJsonObject(props) && typeof props.name === "string") {
    return props.name.trim();
  }

  return "";
}

function hasSvgVisualSource(node: EditorTreeNode): boolean {
  const props = node.props;
  if (!isJsonObject(props)) {
    return false;
  }

  const svgContent = typeof props.svgContent === "string" ? props.svgContent.trim() : "";
  const svgPreset = typeof props.svgPreset === "string" ? props.svgPreset.trim() : "";

  return svgContent !== "" || svgPreset !== "";
}

function isTransparentColor(value: JsonValue | undefined): boolean {
  if (typeof value !== "string" || value.trim() === "") {
    return true;
  }

  const color = value.trim().toLowerCase().replace(/\s+/g, "");
  return color === "transparent" ||
    color === "rgba(0,0,0,0)" ||
    color === "rgba(255,255,255,0)";
}

function hasSingleImageVisualSource(node: EditorTreeNode): boolean {
  const props = node.props;
  if (!isJsonObject(props)) {
    return false;
  }

  const imageSrc = typeof props.imageSrc === "string" ? props.imageSrc.trim() : "";
  const imageBase64 = typeof props.imageBase64 === "string" ? props.imageBase64.trim() : "";
  const style = nodeStyle(node);

  return imageSrc !== "" ||
    imageBase64 !== "" ||
    Boolean(style && !isTransparentColor(style.backgroundColor));
}

function isBackgroundCarrier(node: EditorTreeNode): boolean {
  if (node.componentName === "SingleImage") {
    return hasSingleImageVisualSource(node);
  }

  if (node.componentName !== "SvgDecoration" || !hasSvgVisualSource(node)) {
    return false;
  }

  return /背景|底板|底座|底图|面板边框|模块边框|卡组边框|边框|background|backdrop|panel[-_ ]?(?:bg|frame)/i
    .test(nodeTitle(node));
}

function treeHasBackgroundCarrier(children: EditorTreeNode[]): boolean {
  return children.some((child) =>
    isBackgroundCarrier(child) ||
    (Array.isArray(child.children) && treeHasBackgroundCarrier(child.children)),
  );
}

function treeHasCanvasBackground(children: EditorTreeNode[], canvas: { width: number; height: number }): boolean {
  return children.some((child) => {
    if (isBackgroundCarrier(child)) {
      const rect = nodeRect(child);
      return Boolean(
        rect &&
        rect.left <= 0 &&
        rect.top <= 0 &&
        rect.left + rect.width >= canvas.width &&
        rect.top + rect.height >= canvas.height,
      );
    }

    return Array.isArray(child.children) && treeHasCanvasBackground(child.children, canvas);
  });
}

function createBackgroundGroup(parentId: string, child: EditorTreeNode): EditorGroupNode {
  return {
    id: uniqueSchemaId(`${parentId}_grp_background`, "fs"),
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {},
    title: "背景",
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children: [child],
  };
}

function appendBackgroundCarrier(group: EditorGroupNode, child: EditorTreeNode): EditorGroupNode {
  const existingBackgroundGroup = group.children.find(
    (item): item is EditorGroupNode =>
      item.componentName === "__Group__" && item.title === "背景",
  );

  if (existingBackgroundGroup) {
    existingBackgroundGroup.children.push(child);
  } else {
    group.children.push(createBackgroundGroup(group.id, child));
  }

  return sortEditorTreeChildren(group) as EditorGroupNode;
}

function compileBackgroundCarrier(
  logicalId: string,
  parentId: string,
  name: string,
  rect: Rect,
  theme: JsonObject | undefined,
  fullScreen: boolean,
): EditorTreeNode {
  return compileComponent(
    backgroundCarrierComponent(logicalId, parentId, name, rect, theme, fullScreen),
    parentId,
    theme,
    true,
  );
}

function compileModule(
  item: JsonObject,
  parentId: string,
  theme: JsonObject | undefined,
  grouping: JsonObject | undefined,
): EditorTreeNode {
  if (typeof item.moduleName !== "string" || item.moduleName.trim() === "") {
    throw new Error("dashboard module missing moduleName");
  }

  if (typeof item.logicalId !== "string" || item.logicalId.trim() === "") {
    throw new Error(`dashboard module ${item.moduleName} missing logicalId`);
  }

  const moduleInput = withParentAndTheme(item, parentId, theme);
  if (grouping && !isJsonObject(moduleInput.grouping)) {
    moduleInput.grouping = grouping;
  }

  const moduleTree = generateModuleTreeSchema(moduleInput);
  const rect = rectFromItem(moduleInput, moduleTree.id);
  if (rect) {
    absolutizeClearLocalStyles(moduleTree, rect);
  }

  if (rect && !treeHasBackgroundCarrier(moduleTree.children)) {
    const background = compileBackgroundCarrier(
      `${moduleTree.id}_background`,
      moduleTree.id,
      "模块背景",
      rect,
      theme,
      false,
    );
    return appendBackgroundCarrier(moduleTree, background);
  }

  return moduleTree;
}

function groupTitle(item: JsonObject): string {
  return typeof item.title === "string" && item.title.trim() !== ""
    ? item.title.trim()
    : "组件分组";
}

function groupComponents(item: JsonObject): JsonObject[] {
  const components = asArray(item.components);
  if (components.length > 0) {
    return components;
  }

  return asArray(item.children);
}

function groupProps(item: JsonObject): JsonObject {
  const props: JsonObject = {};
  if (isJsonObject(item.style)) {
    props.style = item.style;
  }
  return props;
}

function groupChildren(
  children: EditorTreeNode[],
  parentId: string,
  grouping: JsonObject | undefined,
): EditorTreeNode[] {
  if (!grouping) {
    const wrapper: EditorGroupNode = {
      id: parentId,
      componentName: "__Group__",
      structVersion: "0.0.0",
      props: {},
      title: "",
      isHidden: false,
      isLocked: false,
      isGroup: true,
      children,
    };
    return (sortEditorTreeChildren(wrapper) as EditorGroupNode).children;
  }

  return groupEditorTreeChildren(
    children,
    resolveSemanticGroupingOptions({ grouping }, parentId),
  );
}

function compileComponentGroup(
  item: JsonObject,
  parentId: string,
  theme: JsonObject | undefined,
  inheritedGrouping: JsonObject | undefined,
): EditorGroupNode {
  if (typeof item.logicalId !== "string" || item.logicalId.trim() === "") {
    throw new Error("dashboard group missing logicalId");
  }

  const groupId = uniqueSchemaId(item.logicalId);
  const grouping = isJsonObject(item.grouping) ? item.grouping : inheritedGrouping;
  const children = groupChildren(
    groupComponents(item).map((component) =>
      compileComponent(component, groupId, theme, true),
    ),
    groupId,
    grouping,
  );

  const group: EditorGroupNode = {
    id: groupId,
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: groupProps(item),
    title: groupTitle(item),
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };

  const sortedGroup = sortEditorTreeChildren(group) as EditorGroupNode;
  const rect = rectFromItem(item, groupId);
  if (rect) {
    absolutizeClearLocalStyles(sortedGroup, rect);
  }

  if (rect && !treeHasBackgroundCarrier(sortedGroup.children)) {
    const background = compileBackgroundCarrier(
      `${groupId}_background`,
      groupId,
      "分组背景",
      rect,
      theme,
      false,
    );
    return appendBackgroundCarrier(sortedGroup, background);
  }

  return sortedGroup;
}

function compileRootComponents(
  components: JsonObject[],
  rootId: string,
  theme: JsonObject | undefined,
  grouping: JsonObject | undefined,
): EditorTreeNode[] {
  const children = components.map((component) =>
    compileComponent(component, rootId, theme, true),
  );

  return groupChildren(children, rootId, grouping);
}

function rectFromItem(item: JsonObject, fallbackId: string): Rect | undefined {
  const style = isJsonObject(item.style) ? item.style : undefined;
  if (!style) {
    return undefined;
  }

  const left = asFiniteNumber(style.left);
  const top = asFiniteNumber(style.top);
  const width = asFiniteNumber(style.width);
  const height = asFiniteNumber(style.height);

  if (
    left === undefined ||
    top === undefined ||
    width === undefined ||
    height === undefined
  ) {
    return undefined;
  }

  const id =
    typeof item.logicalId === "string" && item.logicalId.trim() !== ""
      ? item.logicalId
      : fallbackId;

  return { id, left, top, width, height };
}

function rectsOverlap(left: Rect, right: Rect): boolean {
  return (
    left.left < right.left + right.width &&
    left.left + left.width > right.left &&
    left.top < right.top + right.height &&
    left.top + left.height > right.top
  );
}

function validateCanvasBounds(rect: Rect, canvas: { width: number; height: number }, warnings: string[]): void {
  if (
    rect.left < 0 ||
    rect.top < 0 ||
    rect.left + rect.width > canvas.width ||
    rect.top + rect.height > canvas.height
  ) {
    warnings.push(`${rect.id} extends outside canvas bounds`);
  }
}

function componentProps(item: JsonObject): JsonObject {
  return isJsonObject(item.props) ? item.props : item;
}

function componentNameOf(item: JsonObject): string {
  const props = componentProps(item);
  if (typeof item.componentName === "string" && item.componentName.trim() !== "") {
    return item.componentName.trim();
  }

  return typeof props.componentName === "string" ? props.componentName.trim() : "";
}

function hasVisibleSvgSource(item: JsonObject): boolean {
  const props = componentProps(item);
  const svgContent = typeof props.svgContent === "string" ? props.svgContent.trim() : "";
  const svgPreset = typeof props.svgPreset === "string" ? props.svgPreset.trim() : "";

  return svgContent !== "" || svgPreset !== "";
}

function validateSvgDecoration(item: JsonObject, fieldName: string, errors: string[]): void {
  if (componentNameOf(item) !== "SvgDecoration") {
    return;
  }

  if (!hasVisibleSvgSource(item)) {
    errors.push(
      `${fieldName} SvgDecoration must include non-empty svgContent or svgPreset; empty decorations are invisible and cannot be used as default decoration placeholders`,
    );
  }
}

function isPlaceholderText(value: string): boolean {
  const text = value.trim();
  return text === "" ||
    /^(辅助信息|单行文本|默认文本|占位(?:文本|内容)?|placeholder)$/iu.test(text);
}

function textContentOf(item: JsonObject): string | undefined {
  const props = componentProps(item);
  return typeof props.textContent === "string" ? props.textContent : undefined;
}

function validateSingleTextContent(item: JsonObject, fieldName: string, errors: string[]): void {
  if (componentNameOf(item) !== "SingleText") {
    return;
  }

  const textContent = textContentOf(item);
  if (typeof textContent !== "string" || textContent.trim() === "") {
    errors.push(
      `${fieldName} SingleText must include non-empty textContent; do not rely on default text placeholders`,
    );
    return;
  }

  if (isPlaceholderText(textContent)) {
    errors.push(
      `${fieldName} SingleText textContent must be real business copy, not placeholder text`,
    );
  }
}

function chartDataRowsFromValue(value: JsonValue | undefined): JsonObject[] | undefined {
  if (!isJsonObject(value)) {
    return undefined;
  }

  const constant = value.constant;
  if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
    return undefined;
  }

  return constant.data.filter(isJsonObject);
}

function chartDataRowsOf(item: JsonObject): JsonObject[] | undefined {
  return chartDataRowsFromValue(componentProps(item).chartData);
}

function hasChartDataRows(value: JsonValue | undefined): boolean {
  return Array.isArray(value) && value.some(isJsonObject);
}

function moduleHasChartDataRows(module: JsonObject): boolean {
  return hasChartDataRows(module.dataItems) ||
    ((chartDataRowsFromValue(module.chartData)?.length ?? 0) > 0);
}

function isChartComponent(item: JsonObject): boolean {
  const componentName = componentNameOf(item);
  if (componentName === "") {
    return false;
  }

  try {
    return getComponentDefinition(componentName).componentType === "chart";
  } catch {
    return false;
  }
}

function validateChartData(
  item: JsonObject,
  fieldName: string,
  errors: string[],
  inheritedChartRowsAvailable = false,
): void {
  if (!isChartComponent(item)) {
    return;
  }

  const rows = chartDataRowsOf(item);
  if (!rows || rows.length === 0) {
    if (!inheritedChartRowsAvailable) {
      errors.push(
        `${fieldName} ${componentNameOf(item)} must include explicit chartData.constant.data or supported module dataItems; otherwise generated schemas fall back to demo categories`,
      );
    }
    return;
  }

  if (hasDefaultDemoChartRows(rows)) {
    errors.push(
      `${fieldName} ${componentNameOf(item)} chartData must use real business categories, not default 类目/系列 demo rows`,
    );
  }
}

function validateComponentQuality(
  item: JsonObject,
  fieldName: string,
  errors: string[],
  inheritedChartRowsAvailable = false,
): void {
  validateSvgDecoration(item, fieldName, errors);
  validateSingleTextContent(item, fieldName, errors);
  validateChartData(item, fieldName, errors, inheritedChartRowsAvailable);
}

function collectSlotComponents(value: JsonValue | undefined, fieldName: string): Array<{ item: JsonObject; fieldName: string }> {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectSlotComponents(item, `${fieldName}[${index}]`),
    );
  }

  if (!isJsonObject(value)) {
    return [];
  }

  const items: Array<{ item: JsonObject; fieldName: string }> = [];
  if (componentNameOf(value) !== "") {
    items.push({ item: value, fieldName });
  }

  if (Array.isArray(value.children)) {
    items.push(...collectSlotComponents(value.children, `${fieldName}.children`));
  }

  if (Array.isArray(value.components)) {
    items.push(...collectSlotComponents(value.components, `${fieldName}.components`));
  }

  if (isJsonObject(value.slots)) {
    for (const [key, slotValue] of Object.entries(value.slots)) {
      items.push(...collectSlotComponents(slotValue, `${fieldName}.slots.${key}`));
    }
  }

  return items;
}

function validateGroupingMode(
  value: JsonObject | undefined,
  fieldName: string,
  errors: string[],
): void {
  if (
    value &&
    value.mode !== undefined &&
    value.mode !== "semantic" &&
    value.mode !== "none"
  ) {
    errors.push(`${fieldName}.mode must be semantic or none`);
  }
}

function hasAuxiliaryTextSlots(slots: JsonObject): boolean {
  const auxiliaryTexts = slots.auxiliaryTexts;
  return Array.isArray(auxiliaryTexts) && auxiliaryTexts.some(isJsonObject);
}

export function validateDashboardSpec(input: JsonObject): JsonObject {
  const errors: string[] = [];
  const warnings: string[] = [];
  const canvas = canvasSize(input);
  const components = asArray(input.components);
  const groups = asArray(input.groups);
  const modules = asArray(input.modules);
  const grouping = isJsonObject(input.grouping) ? input.grouping : undefined;
  const rects: Rect[] = [];

  if (components.length === 0 && groups.length === 0 && modules.length === 0) {
    errors.push("dashboard spec must include at least one component, group, or module");
  }

  if (canvas.width <= 0 || canvas.height <= 0) {
    errors.push("canvas width and height must be positive numbers");
  }

  validateGroupingMode(grouping, "grouping", errors);

  if (components.length > 8 && groups.length === 0 && modules.length === 0) {
    warnings.push(
      "dashboard spec has many top-level components; use DashboardSpec.groups or modules to keep related elements editable together",
    );
  }

  components.forEach((component, index) => {
    if (typeof component.componentName !== "string" || component.componentName.trim() === "") {
      errors.push(`components[${index}] missing componentName`);
    }
    if (typeof component.logicalId !== "string" || component.logicalId.trim() === "") {
      errors.push(`components[${index}] missing logicalId`);
    }
    validateComponentQuality(component, `components[${index}]`, errors);

    const rect = rectFromItem(component, `components[${index}]`);
    if (rect) {
      rects.push(rect);
      validateCanvasBounds(rect, canvas, warnings);
    } else {
      warnings.push(`components[${index}] has no complete absolute style`);
    }
  });

  groups.forEach((group, groupIndex) => {
    if (typeof group.logicalId !== "string" || group.logicalId.trim() === "") {
      errors.push(`groups[${groupIndex}] missing logicalId`);
    }

    validateGroupingMode(
      isJsonObject(group.grouping) ? group.grouping : undefined,
      `groups[${groupIndex}].grouping`,
      errors,
    );

    const children = groupComponents(group);
    if (children.length === 0) {
      warnings.push(`groups[${groupIndex}] has no components`);
    }

    const rect = rectFromItem(group, `groups[${groupIndex}]`);
    if (rect) {
      rects.push(rect);
      validateCanvasBounds(rect, canvas, warnings);
    } else {
      errors.push(`groups[${groupIndex}] missing complete style left/top/width/height`);
    }

    children.forEach((component, componentIndex) => {
      if (typeof component.componentName !== "string" || component.componentName.trim() === "") {
        errors.push(`groups[${groupIndex}].components[${componentIndex}] missing componentName`);
      }
      if (typeof component.logicalId !== "string" || component.logicalId.trim() === "") {
        errors.push(`groups[${groupIndex}].components[${componentIndex}] missing logicalId`);
      }
      validateComponentQuality(
        component,
        `groups[${groupIndex}].components[${componentIndex}]`,
        errors,
      );
      if (!rectFromItem(component, `groups[${groupIndex}].components[${componentIndex}]`)) {
        warnings.push(
          `groups[${groupIndex}].components[${componentIndex}] has no complete absolute style`,
        );
      }
    });
  });

  modules.forEach((module, index) => {
    if (typeof module.moduleName !== "string" || module.moduleName.trim() === "") {
      errors.push(`modules[${index}] missing moduleName`);
    }
    if (typeof module.logicalId !== "string" || module.logicalId.trim() === "") {
      errors.push(`modules[${index}] missing logicalId`);
    }

    const rect = rectFromItem(module, `modules[${index}]`);
    if (rect) {
      rects.push(rect);
      validateCanvasBounds(rect, canvas, warnings);
    } else {
      errors.push(`modules[${index}] missing complete style left/top/width/height`);
    }

    const slots = isJsonObject(module.slots) ? module.slots : {};
    if (
      module.moduleName === "ChartPanel" &&
      module.layoutMode !== "assisted" &&
      !hasAuxiliaryTextSlots(slots)
    ) {
      errors.push(
        `modules[${index}] ChartPanel must include slots.auxiliaryTexts with at least one SingleText for a key insight, side summary, center metric, or conclusion; manual ChartPanel will not generate auxiliary business summaries automatically`,
      );
    }

    const inheritedChartRowsAvailable =
      module.moduleName === "ChartPanel" && moduleHasChartDataRows(module);
    for (const [slotName, slotValue] of Object.entries(slots)) {
      for (const component of collectSlotComponents(slotValue, `modules[${index}].slots.${slotName}`)) {
        validateComponentQuality(
          component.item,
          component.fieldName,
          errors,
          inheritedChartRowsAvailable,
        );
      }
    }
  });

  for (let leftIndex = 0; leftIndex < rects.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < rects.length; rightIndex += 1) {
      const left = rects[leftIndex];
      const right = rects[rightIndex];
      if (rectsOverlap(left, right)) {
        warnings.push(`${left.id} overlaps ${right.id}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function generateDashboardSchema(input: JsonObject): EditorGroupNode {
  const validation = validateDashboardSpec(input);
  const errors = validation.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  const rootId = dashboardRootId(input);
  const canvas = canvasSize(input);
  const theme = isJsonObject(input.theme) ? input.theme : undefined;
  const grouping = isJsonObject(input.grouping) ? input.grouping : undefined;
  const components = asArray(input.components);
  const groups = asArray(input.groups);
  const modules = asArray(input.modules);
  let children: EditorTreeNode[] = [
    ...compileRootComponents(components, rootId, theme, grouping),
    ...groups.map((group) => compileComponentGroup(group, rootId, theme, grouping)),
    ...modules.map((module) => compileModule(module, rootId, theme, grouping)),
  ];

  if (!treeHasCanvasBackground(children, canvas)) {
    const background = compileBackgroundCarrier(
      `${rootId}_background`,
      rootId,
      "全屏背景",
      {
        id: `${rootId}_background`,
        left: 0,
        top: 0,
        width: canvas.width,
        height: canvas.height,
      },
      theme,
      true,
    );
    children = [...children, createBackgroundGroup(rootId, background)];
  }

  const root: EditorGroupNode = {
    id: rootId,
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: canvas.width,
        height: canvas.height,
        zIndex: 1,
      },
    },
    title: dashboardTitle(input),
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };

  return sortEditorTreeChildren(root) as EditorGroupNode;
}
