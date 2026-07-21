import type { EditorLayerRole } from "./schema.js";
import {
  componentSchemaToEditorNode,
  editorNodeLayerRole,
  generateComponentsSchema,
  hasDefaultDemoChartRows,
  isContentSingleImageProps,
  isEditorLayerRole,
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
    layerRole: "background",
    style: {
      position: "absolute",
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      backgroundColor: "rgba(0,0,0,0)",
      zIndex: 0,
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
  if (editorNodeLayerRole(node) !== "background") {
    return false;
  }

  if (node.componentName === "SingleImage") {
    return hasSingleImageVisualSource(node);
  }

  if (node.componentName !== "SvgDecoration" || !hasSvgVisualSource(node)) {
    return false;
  }

  return true;
}

function treeHasCoveringBackgroundCarrier(children: EditorTreeNode[], container: Rect): boolean {
  return children.some((child) => {
    if (isBackgroundCarrier(child)) {
      const rect = nodeRect(child);
      if (
        rect &&
        rect.left <= container.left + 1 &&
        rect.top <= container.top + 1 &&
        rect.left + rect.width >= container.left + container.width - 1 &&
        rect.top + rect.height >= container.top + container.height - 1
      ) {
        return true;
      }
    }

    return Array.isArray(child.children) && treeHasCoveringBackgroundCarrier(child.children, container);
  });
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
    props: { layerRole: "background" },
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
  autoPanelBackgrounds: boolean,
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
  moduleTree.props.layerRole = isEditorLayerRole(item.layerRole) ? item.layerRole : "content";
  const rect = rectFromItem(moduleInput, moduleTree.id);
  if (rect) {
    absolutizeClearLocalStyles(moduleTree, rect);
    applyGroupLayoutGuards(moduleTree, rect);
  }

  if (autoPanelBackgrounds && rect && !treeHasCoveringBackgroundCarrier(moduleTree.children, rect)) {
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

const GENERIC_GROUP_TITLE_PATTERN =
  /^(?:(?:组件|内容|业务)?分组|组件组|group|component[ _-]*group)(?:[ _-]*\d+)?$/iu;

function groupTitle(item: JsonObject): string {
  const title = typeof item.title === "string" ? item.title.trim() : "";
  if (title === "" || GENERIC_GROUP_TITLE_PATTERN.test(title)) {
    throw new Error("dashboard group title must use a specific business or visual region name");
  }

  return title;
}

function groupComponents(item: JsonObject): JsonObject[] {
  const components = asArray(item.components);
  if (components.length > 0) {
    return components;
  }

  return asArray(item.children);
}

function markGroupTitleComponent(component: JsonObject, title: string): JsonObject {
  const textContent = textContentOf(component);
  if (
    componentNameOf(component) !== "SingleText" ||
    typeof textContent !== "string" ||
    textContent.trim() !== title.trim()
  ) {
    return component;
  }

  if (isJsonObject(component.props)) {
    return {
      ...component,
      props: {
        ...component.props,
        name: "模块标题",
      },
    };
  }

  return {
    ...component,
    name: "模块标题",
  };
}

function groupProps(item: JsonObject): JsonObject {
  const props: JsonObject = {
    layerRole: isEditorLayerRole(item.layerRole) ? item.layerRole : "content",
  };
  if (isJsonObject(item.style)) {
    props.style = item.style;
  }
  return props;
}

function isEditorGroupNode(node: EditorTreeNode): node is EditorGroupNode {
  return node.componentName === "__Group__" && node.isGroup === true;
}

function collectLeafNodes(node: EditorTreeNode, result: EditorTreeNode[] = []): EditorTreeNode[] {
  if (!isEditorGroupNode(node)) {
    result.push(node);
    return result;
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => collectLeafNodes(child, result));
  }
  return result;
}

function nodeOptionGrid(node: EditorTreeNode): JsonObject | undefined {
  const props = node.props;
  if (!isJsonObject(props)) {
    return undefined;
  }

  const option = props.option;
  if (!isJsonObject(option) || !isJsonObject(option.grid)) {
    return undefined;
  }

  return option.grid;
}

function nodeTextContent(node: EditorTreeNode): string {
  const props = node.props;
  return isJsonObject(props) && typeof props.textContent === "string"
    ? props.textContent.trim()
    : "";
}

function mutableNodeStyle(node: EditorTreeNode): JsonObject | undefined {
  const props = node.props;
  if (!isJsonObject(props)) {
    return undefined;
  }

  if (!isJsonObject(props.style)) {
    return undefined;
  }

  return props.style;
}

function fontSizeOf(style: JsonObject | undefined): number {
  return asFiniteNumber(style?.fontSize) ?? 14;
}

function estimateTextWidth(text: string, fontSize: number): number {
  let units = 0;
  for (const char of text) {
    if (/\s/u.test(char)) {
      units += 0.35;
    } else if (/[\dA-Za-z.,:%+\-/]/u.test(char)) {
      units += 0.62;
    } else {
      units += 1;
    }
  }

  return Math.ceil(units * fontSize + 6);
}

function meaningfulIndicatorTitle(node: EditorTreeNode): string {
  const props = node.props;
  if (!isJsonObject(props) || props.titleVisible !== true) {
    return "";
  }

  const titleName = typeof props.titleName === "string" ? props.titleName.trim() : "";
  const fallbackTitle = nodeTitle(node);
  const title = titleName !== "" ? titleName : fallbackTitle;
  return /^(?:翻牌器|指标|数值)$/u.test(title) ? "" : title;
}

function singleTextRectForExternalIndicatorTitle(
  candidates: Array<{ node: EditorTreeNode; rect: Rect; text: string }>,
  title: string,
  indicatorRect: Rect,
): Rect | undefined {
  return candidates.find(({ rect, text }) => {
    if (text !== title || !horizontallyOverlap(rect, indicatorRect)) {
      return false;
    }

    const minTop = indicatorRect.top - Math.max(12, indicatorRect.height * 0.25);
    const maxTop = indicatorRect.top + Math.max(28, indicatorRect.height * 0.45);
    return rect.top >= minTop && rect.top <= maxTop;
  })?.rect;
}

function indicatorTitleTextAlign(props: JsonObject): string {
  const titleStyle = isJsonObject(props.titleStyle) ? props.titleStyle : {};
  if (typeof titleStyle.textAlign === "string" && titleStyle.textAlign.trim() !== "") {
    return titleStyle.textAlign;
  }

  const globalConfig = isJsonObject(props.globalConfig) ? props.globalConfig : {};
  if (globalConfig.alignItems === "center") {
    return "center";
  }
  if (globalConfig.alignItems === "flex-end") {
    return "right";
  }
  return "left";
}

function indicatorTitleLineHeight(titleStyle: JsonObject, fontSize: number): number {
  const rawLineHeight = asFiniteNumber(titleStyle.lineHeight) ?? 1;
  if (rawLineHeight > 0 && rawLineHeight <= 4) {
    return rawLineHeight;
  }
  return 1;
}

function createIndicatorTitleTextNode(
  node: EditorTreeNode,
  parentId: string,
  title: string,
  indicatorRect: Rect,
): EditorTreeNode | undefined {
  const props = node.props;
  const style = mutableNodeStyle(node);
  if (!isJsonObject(props) || !style) {
    return undefined;
  }

  const titleStyle = isJsonObject(props.titleStyle) ? props.titleStyle : {};
  const fontSize = asFiniteNumber(titleStyle.fontSize) ?? 16;
  const lineHeight = indicatorTitleLineHeight(titleStyle, fontSize);
  const titleHeight = Math.max(14, Math.ceil(fontSize * lineHeight + 2));
  const zIndex = Math.max(asFiniteNumber(style.zIndex) ?? 20, 501);

  return compileComponent(
    {
      componentName: "SingleText",
      logicalId: `${node.id}_title`,
      parentLogicalId: parentId,
      name: `${title}标题`,
      textContent: title,
      style: {
        ...titleStyle,
        position: "absolute",
        left: indicatorRect.left,
        top: indicatorRect.top,
        width: indicatorRect.width,
        height: titleHeight,
        fontSize,
        lineHeight,
        textAlign: indicatorTitleTextAlign(props),
        backgroundColor: "rgba(0,0,0,0)",
        zIndex,
      },
      entryAnimiation: {
        isShow: false,
        type: "",
      },
    },
    parentId,
    undefined,
    true,
  );
}

function fitIndicatorValueBelowExternalTitle(
  node: EditorTreeNode,
  indicatorRect: Rect,
  titleRect: Rect | undefined,
  containerRect: Rect,
): void {
  const props = node.props;
  const style = mutableNodeStyle(node);
  if (!isJsonObject(props) || !style) {
    return;
  }

  props.titleVisible = false;

  const globalConfig = isJsonObject(props.globalConfig) ? props.globalConfig : {};
  globalConfig.space = 0;
  props.globalConfig = globalConfig;

  if (!titleRect) {
    return;
  }

  const titleGap = Math.max(4, Math.round(titleRect.height * 0.3));
  const targetTop = Math.max(indicatorRect.top, titleRect.top + titleRect.height + titleGap);
  const originalBottom = indicatorRect.top + indicatorRect.height;
  const safeBottom = Math.min(originalBottom, containerRect.top + containerRect.height - 4);
  const targetHeight = safeBottom - targetTop;
  if (targetHeight >= 24) {
    style.top = Math.round(targetTop);
    style.height = Math.round(targetHeight);
  }
}

function externalizeIndicatorTitlesInGroup(
  group: EditorGroupNode,
  containerRect: Rect,
  existingTitles: Array<{ node: EditorTreeNode; rect: Rect; text: string }>,
): void {
  const nextChildren: EditorTreeNode[] = [];

  for (const child of group.children) {
    if (isEditorGroupNode(child)) {
      externalizeIndicatorTitlesInGroup(child, containerRect, existingTitles);
      nextChildren.push(child);
      continue;
    }

    if (child.componentName !== "Indicator") {
      nextChildren.push(child);
      continue;
    }

    const indicatorRect = nodeRect(child);
    const title = meaningfulIndicatorTitle(child);
    if (!indicatorRect || title === "") {
      if (isJsonObject(child.props) && child.props.titleVisible === true) {
        fitIndicatorValueBelowExternalTitle(child, indicatorRect ?? containerRect, undefined, containerRect);
      }
      nextChildren.push(child);
      continue;
    }

    const existingTitleRect = singleTextRectForExternalIndicatorTitle(
      existingTitles,
      title,
      indicatorRect,
    );
    const titleNode = existingTitleRect
      ? undefined
      : createIndicatorTitleTextNode(child, group.id, title, indicatorRect);
    const titleRect = existingTitleRect ?? (titleNode ? nodeRect(titleNode) : undefined);

    if (titleNode) {
      nextChildren.push(titleNode);
    }
    fitIndicatorValueBelowExternalTitle(child, indicatorRect, titleRect, containerRect);
    nextChildren.push(child);
  }

  group.children = nextChildren;
  sortEditorTreeChildren(group);
}

function externalizeIndicatorTitles(root: EditorTreeNode, containerRect: Rect): void {
  if (!isEditorGroupNode(root)) {
    return;
  }

  const existingTitles = collectLeafNodes(root)
    .filter((node) => node.componentName === "SingleText")
    .map((node) => ({ node, rect: nodeRect(node), text: nodeTextContent(node) }))
    .filter((item): item is { node: EditorTreeNode; rect: Rect; text: string } =>
      Boolean(item.rect && item.text),
    );

  externalizeIndicatorTitlesInGroup(root, containerRect, existingTitles);
}

function isUnitOnlyText(text: string): boolean {
  return /^(?:万|万元|亿|亿元|%|单|件|台|个)$/u.test(text.trim());
}

function isTitleNode(node: EditorTreeNode): boolean {
  const title = nodeTitle(node);
  return title === "模块标题" || /标题|主标题/u.test(title);
}

function expandSingleLineTextBoxes(root: EditorTreeNode, containerRect: Rect): void {
  const rightLimit = containerRect.left + containerRect.width - 8;
  const leftLimit = containerRect.left + 8;

  for (const node of collectLeafNodes(root)) {
    if (node.componentName !== "SingleText") {
      continue;
    }

    const text = nodeTextContent(node);
    if (text === "" || text.includes("\n") || isUnitOnlyText(text)) {
      continue;
    }

    const style = mutableNodeStyle(node);
    const rect = nodeRect(node);
    const fontSize = fontSizeOf(style);
    if (!style || !rect || fontSize > 30) {
      continue;
    }

    const neededWidth = estimateTextWidth(text, fontSize);
    if (neededWidth <= rect.width) {
      continue;
    }

    const expandableWidth = rightLimit - rect.left;
    if (expandableWidth >= neededWidth) {
      style.width = neededWidth;
      continue;
    }

    if (rightLimit - neededWidth >= leftLimit) {
      style.left = rightLimit - neededWidth;
      style.width = neededWidth;
      continue;
    }

    const lineCount = Math.min(3, Math.ceil(neededWidth / Math.max(1, rect.width)));
    style.height = Math.max(rect.height, Math.ceil(fontSize * lineCount * 1.15));
  }
}

function verticallyOverlap(left: Rect, right: Rect): boolean {
  return Math.min(left.top + left.height, right.top + right.height) >
    Math.max(left.top, right.top);
}

function resolveSameColumnTextOverlaps(root: EditorTreeNode, containerRect: Rect): void {
  const textNodes = collectLeafNodes(root)
    .filter((node) => node.componentName === "SingleText")
    .map((node) => ({ node, rect: nodeRect(node) }))
    .filter((item): item is { node: EditorTreeNode; rect: Rect } => Boolean(item.rect))
    .sort((left, right) => left.rect.top - right.rect.top);

  for (let index = 1; index < textNodes.length; index += 1) {
    const current = textNodes[index];
    const style = mutableNodeStyle(current.node);
    if (!style || isTitleNode(current.node)) {
      continue;
    }

    for (let previousIndex = 0; previousIndex < index; previousIndex += 1) {
      const previous = textNodes[previousIndex];
      if (
        !horizontallyOverlap(previous.rect, current.rect) ||
        !verticallyOverlap(previous.rect, current.rect)
      ) {
        continue;
      }

      const nextTop = previous.rect.top + previous.rect.height + 6;
      if (nextTop + current.rect.height <= containerRect.top + containerRect.height - 8) {
        style.top = nextTop;
        current.rect.top = nextTop;
      }
    }
  }
}

function percentFromString(value: JsonValue | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value / 100;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number(value.trim().replace(/%$/u, ""));
  return Number.isFinite(parsed) ? parsed / 100 : fallback;
}

function percentStringFromRatio(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function circularChartCenter(node: EditorTreeNode, rect: Rect): { x: number; y: number } | undefined {
  if (!["PieChart", "RingChart", "RoseChart"].includes(node.componentName)) {
    return undefined;
  }

  const props = node.props;
  if (!isJsonObject(props) || !isJsonObject(props.option) || !Array.isArray(props.option.series)) {
    return undefined;
  }

  const firstSeries = props.option.series[0];
  if (!isJsonObject(firstSeries)) {
    return undefined;
  }

  const center = Array.isArray(firstSeries.center) ? firstSeries.center : [];
  return {
    x: rect.left + rect.width * percentFromString(center[0], 0.5),
    y: rect.top + rect.height * percentFromString(center[1], 0.5),
  };
}

function isCenterTextCandidate(node: EditorTreeNode): boolean {
  if (node.componentName !== "SingleText" || isTitleNode(node)) {
    return false;
  }

  const text = nodeTextContent(node);
  if (text === "" || isUnitOnlyText(text) || /[。；;，、]/u.test(text)) {
    return false;
  }

  return /\d/u.test(text) || text.length <= 10;
}

function isCenterTextCompanion(
  item: { node: EditorTreeNode; rect: Rect },
  primary: { node: EditorTreeNode; rect: Rect },
  center: { x: number; y: number },
  chartRect: Rect,
): boolean {
  if (item === primary || !isCenterTextCandidate(item.node)) {
    return false;
  }

  const textCenterX = item.rect.left + item.rect.width / 2;
  const textCenterY = item.rect.top + item.rect.height / 2;
  const primaryCenterY = primary.rect.top + primary.rect.height / 2;
  const horizontalLimit = Math.max(72, chartRect.width * 0.24);
  const verticalLimit = Math.max(64, chartRect.height * 0.3);

  return Math.abs(textCenterX - center.x) <= horizontalLimit &&
    Math.abs(textCenterY - center.y) <= verticalLimit &&
    Math.abs(textCenterY - primaryCenterY) <= verticalLimit;
}

function reserveRingCenterHoleForTextStack(
  chart: EditorTreeNode,
  chartRect: Rect,
  stack: Array<{ node: EditorTreeNode; rect: Rect }>,
  stackHeight: number,
): void {
  if (chart.componentName !== "RingChart" || stack.length === 0) {
    return;
  }

  const series = circularChartSeries(chart)[0];
  if (!series) {
    return;
  }

  series.radius = Array.isArray(series.radius) ? series.radius : ["30%", "45%"];
  const radius = series.radius as JsonValue[];
  const baseRadius = Math.min(chartRect.width, chartRect.height) / 2;
  if (baseRadius <= 0) {
    return;
  }

  const innerRatio = percentFromString(radius[0], 0.3);
  const outerRatio = percentFromString(radius[1], 0.45);
  const stackWidth = Math.max(...stack.map((item) => item.rect.width));
  const requiredInnerRatio = Math.max(
    (stackWidth / 2 + 10) / baseRadius,
    (stackHeight / 2 + 8) / baseRadius,
  );
  if (requiredInnerRatio <= innerRatio) {
    return;
  }

  const minBandRatio = Math.max(0.08, 10 / baseRadius);
  const maxOuterRatio = hasOutsideCircularLabel(chart) ? 0.48 : 0.58;
  const nextOuterRatio = Math.min(
    maxOuterRatio,
    Math.max(outerRatio, requiredInnerRatio + minBandRatio),
  );
  const nextInnerRatio = Math.min(requiredInnerRatio, nextOuterRatio - minBandRatio);
  if (nextInnerRatio <= innerRatio || nextInnerRatio <= 0) {
    return;
  }

  radius[0] = percentStringFromRatio(nextInnerRatio);
  radius[1] = percentStringFromRatio(Math.max(nextOuterRatio, outerRatio));
}

function alignCircularChartCenterTexts(root: EditorTreeNode): void {
  const leaves = collectLeafNodes(root);
  const textItems = leaves
    .filter(isCenterTextCandidate)
    .map((node) => ({ node, rect: nodeRect(node) }))
    .filter((item): item is { node: EditorTreeNode; rect: Rect } => Boolean(item.rect));

  for (const chart of leaves) {
    const chartRect = nodeRect(chart);
    if (!chartRect) {
      continue;
    }

    const center = circularChartCenter(chart, chartRect);
    if (!center) {
      continue;
    }

    const threshold = Math.min(chartRect.width, chartRect.height) * 0.26;
    const candidates = textItems.filter(({ rect }) => {
      const textCenterX = rect.left + rect.width / 2;
      const textCenterY = rect.top + rect.height / 2;
      const distance = Math.hypot(textCenterX - center.x, textCenterY - center.y);
      return distance <= threshold;
    });

    const primary = candidates
      .filter(({ node }) => /\d/u.test(nodeTextContent(node)))
      .sort((left, right) => {
        const leftDistance = Math.hypot(
          left.rect.left + left.rect.width / 2 - center.x,
          left.rect.top + left.rect.height / 2 - center.y,
        );
        const rightDistance = Math.hypot(
          right.rect.left + right.rect.width / 2 - center.x,
          right.rect.top + right.rect.height / 2 - center.y,
        );
        return leftDistance - rightDistance;
      })[0];

    if (!primary) {
      continue;
    }

    const companions = textItems
      .filter((item) => isCenterTextCompanion(item, primary, center, chartRect))
      .sort((left, right) => left.rect.top - right.rect.top);
    const stack = [primary, ...companions].sort((left, right) => left.rect.top - right.rect.top);
    const stackGap = Math.max(8, Math.round(fontSizeOf(mutableNodeStyle(primary.node)) * 0.28));
    const stackHeight = stack.reduce((sum, item) => sum + item.rect.height, 0) +
      Math.max(0, stack.length - 1) * stackGap;
    reserveRingCenterHoleForTextStack(chart, chartRect, stack, stackHeight);
    let nextTop = center.y - stackHeight / 2;

    for (const item of stack) {
      const style = mutableNodeStyle(item.node);
      if (!style) {
        continue;
      }

      style.left = Math.round(center.x - item.rect.width / 2);
      style.top = Math.round(nextTop);
      nextTop += item.rect.height + stackGap;
    }
  }
}

function circularChartLegend(node: EditorTreeNode): JsonObject | undefined {
  if (!["PieChart", "RingChart", "RoseChart"].includes(node.componentName)) {
    return undefined;
  }

  const props = node.props;
  if (!isJsonObject(props) || !isJsonObject(props.option) || !isJsonObject(props.option.legend)) {
    return undefined;
  }

  return props.option.legend;
}

function reserveCircularBottomLegendSpace(root: EditorTreeNode, containerRect: Rect): void {
  const leaves = collectLeafNodes(root);
  const bottomTexts = leaves
    .filter((node) => node.componentName === "SingleText" && !isTitleNode(node))
    .map((node) => nodeRect(node))
    .filter((rect): rect is Rect => Boolean(rect && isBottomTextRect(rect, containerRect)));
  if (bottomTexts.length === 0) {
    return;
  }

  for (const node of leaves) {
    const legend = circularChartLegend(node);
    if (!legend || legend.show === false || legend.top !== "bottom") {
      continue;
    }

    const chartRect = nodeRect(node);
    if (!chartRect) {
      continue;
    }

    const overlappingBottomTexts = bottomTexts.filter((rect) =>
      horizontallyOverlap(rect, chartRect),
    );
    if (overlappingBottomTexts.length === 0) {
      continue;
    }

    const firstBottomTextTop = Math.min(...overlappingBottomTexts.map((rect) => rect.top));
    const safeOffsetY = Math.floor(
      firstBottomTextTop - (chartRect.top + chartRect.height) - 8,
    );
    legend.offsetY = Math.min(asFiniteNumber(legend.offsetY) ?? 0, safeOffsetY);
  }
}

function circularChartSeries(node: EditorTreeNode): JsonObject[] {
  if (!["PieChart", "RingChart", "RoseChart"].includes(node.componentName)) {
    return [];
  }

  const props = node.props;
  if (!isJsonObject(props) || !isJsonObject(props.option) || !Array.isArray(props.option.series)) {
    return [];
  }

  return props.option.series.filter(isJsonObject);
}

function hasOutsideCircularLabel(node: EditorTreeNode): boolean {
  return circularChartSeries(node).some((series) => {
    const label = isJsonObject(series.label) ? series.label : {};
    return label.show === true && label.position === "outside";
  });
}

function disableOutsideCircularLabels(node: EditorTreeNode): void {
  for (const series of circularChartSeries(node)) {
    const label = isJsonObject(series.label) ? series.label : {};
    if (label.position !== "outside") {
      continue;
    }

    label.show = false;
    series.label = label;

    const labelLine = isJsonObject(series.labelLine) ? series.labelLine : {};
    labelLine.show = false;
    series.labelLine = labelLine;
  }
}

function isCircularSideAnnotationText(
  node: EditorTreeNode,
  textRect: Rect,
  chartRect: Rect,
  chartCenter: { x: number; y: number },
  containerRect: Rect,
): boolean {
  if (node.componentName !== "SingleText" || isTitleNode(node) || isBottomTextRect(textRect, containerRect)) {
    return false;
  }

  const text = nodeTextContent(node);
  if (text === "" || isUnitOnlyText(text)) {
    return false;
  }

  const textCenterX = textRect.left + textRect.width / 2;
  const textCenterY = textRect.top + textRect.height / 2;
  const nearChartBody = textCenterY >= chartRect.top + chartRect.height * 0.12 &&
    textCenterY <= chartRect.top + chartRect.height * 0.72;
  const outsideCenterStack = Math.abs(textCenterX - chartCenter.x) > chartRect.width * 0.14;
  const explanatoryText = text.length >= 8 || /[，,。；;]/u.test(text);

  return nearChartBody &&
    outsideCenterStack &&
    explanatoryText &&
    rectsOverlap(textRect, chartRect);
}

function avoidCircularOutsideLabelsNearSideText(root: EditorTreeNode, containerRect: Rect): void {
  const leaves = collectLeafNodes(root);
  const textItems = leaves
    .filter((node) => node.componentName === "SingleText")
    .map((node) => ({ node, rect: nodeRect(node) }))
    .filter((item): item is { node: EditorTreeNode; rect: Rect } => Boolean(item.rect));

  for (const chart of leaves) {
    if (!hasOutsideCircularLabel(chart)) {
      continue;
    }

    const chartRect = nodeRect(chart);
    if (!chartRect) {
      continue;
    }

    const center = circularChartCenter(chart, chartRect);
    if (!center) {
      continue;
    }

    const hasSideAnnotation = textItems.some(({ node, rect }) =>
      isCircularSideAnnotationText(node, rect, chartRect, center, containerRect),
    );
    if (hasSideAnnotation) {
      disableOutsideCircularLabels(chart);
    }
  }
}

function nodeOptionLegend(node: EditorTreeNode): JsonObject | undefined {
  const props = node.props;
  if (!isJsonObject(props) || !isJsonObject(props.option) || !isJsonObject(props.option.legend)) {
    return undefined;
  }

  return props.option.legend;
}

function approximateLegendTextWidth(text: string, fontSize: number): number {
  return estimateTextWidth(text, fontSize);
}

function legendSeriesNames(node: EditorTreeNode): string[] {
  const props = node.props;
  if (!isJsonObject(props) || !isJsonObject(props.option) || !Array.isArray(props.option.series)) {
    return [];
  }

  return props.option.series
    .filter(isJsonObject)
    .map((series) => (typeof series.name === "string" ? series.name.trim() : ""))
    .filter((name) => name !== "");
}

function approximateTopLegendRect(node: EditorTreeNode, chartRect: Rect, legend: JsonObject): Rect | undefined {
  if (legend.show === false || legend.top !== "top") {
    return undefined;
  }

  const names = legendSeriesNames(node);
  if (names.length === 0) {
    return undefined;
  }

  const textStyle = isJsonObject(legend.textStyle) ? legend.textStyle : {};
  const fontSize = asFiniteNumber(textStyle.fontSize) ?? 12;
  const itemWidth = asFiniteNumber(legend.itemWidth) ?? 18;
  const itemHeight = asFiniteNumber(legend.itemHeight) ?? 12;
  const itemGap = asFiniteNumber(legend.itemGap) ?? 12;
  const paddingX = Array.isArray(legend.padding) && typeof legend.padding[1] === "number"
    ? legend.padding[1] * 2
    : 24;
  const paddingY = Array.isArray(legend.padding) && typeof legend.padding[0] === "number"
    ? legend.padding[0] * 2
    : 10;
  const width = Math.ceil(
    names.reduce((sum, name) => sum + itemWidth + approximateLegendTextWidth(name, fontSize), 0) +
      Math.max(0, names.length - 1) * itemGap +
      paddingX,
  );
  const height = Math.ceil(Math.max(itemHeight, fontSize) + paddingY);
  const offsetX = asFiniteNumber(legend.offsetX) ?? 0;
  const offsetY = asFiniteNumber(legend.offsetY) ?? 0;

  let left: number;
  if (legend.left === "right") {
    left = chartRect.left + chartRect.width - width;
  } else if (legend.left === "center") {
    left = chartRect.left + chartRect.width / 2 - width / 2;
  } else {
    left = chartRect.left;
  }

  return {
    id: `${chartRect.id}:legend`,
    left: left + offsetX,
    top: chartRect.top + offsetY,
    width,
    height,
  };
}

function reserveTopTextLegendSpace(root: EditorTreeNode, containerRect: Rect): void {
  const leaves = collectLeafNodes(root);
  const topTexts = leaves
    .filter((node) => node.componentName === "SingleText")
    .map((node) => ({ node, rect: nodeRect(node) }))
    .filter((item): item is { node: EditorTreeNode; rect: Rect } =>
      Boolean(
        item.rect &&
        item.rect.top < containerRect.top + Math.max(72, containerRect.height * 0.22),
      ),
    );

  if (topTexts.length === 0) {
    return;
  }

  for (const chart of leaves) {
    const grid = nodeOptionGrid(chart);
    const chartRect = nodeRect(chart);
    if (!grid || !chartRect) {
      continue;
    }

    const chartTopTexts = topTexts.filter(({ rect }) =>
      horizontallyOverlap(rect, chartRect) &&
      rect.top + rect.height > chartRect.top &&
      rect.top < chartRect.top + Math.max(72, chartRect.height * 0.22),
    );
    if (chartTopTexts.length === 0) {
      continue;
    }

    const requiredTextOffsetY = Math.max(
      0,
      ...chartTopTexts.map(({ rect }) =>
        Math.ceil(rect.top + rect.height - chartRect.top + 8),
      ),
    );
    let requiredGridTop = requiredTextOffsetY;

    const legend = nodeOptionLegend(chart);
    const legendRect = legend
      ? approximateTopLegendRect(chart, chartRect, legend)
      : undefined;
    if (legend && legendRect) {
      const overlappingTopTexts = chartTopTexts.filter(({ rect }) =>
        rectsOverlap(rect, {
          ...legendRect,
          left: legendRect.left - 8,
          top: legendRect.top - 4,
          width: legendRect.width + 16,
          height: legendRect.height + 8,
        }),
      );
      if (overlappingTopTexts.length > 0) {
        const requiredLegendOffsetY = Math.max(
          0,
          ...overlappingTopTexts.map(({ rect }) =>
            Math.ceil(rect.top + rect.height - chartRect.top + 8),
          ),
        );
        legend.offsetY = Math.max(
          asFiniteNumber(legend.offsetY) ?? 0,
          requiredLegendOffsetY,
        );
      }

      requiredGridTop = Math.max(
        requiredGridTop,
        (asFiniteNumber(legend.offsetY) ?? 0) + legendRect.height + 12,
      );
    }

    grid.top = Math.max(asFiniteNumber(grid.top) ?? 0, requiredGridTop);
  }
}

function baseTableFieldCount(node: EditorTreeNode): number {
  const props = node.props;
  if (!isJsonObject(props) || !isJsonObject(props.chartData) || !Array.isArray(props.chartData.indicator)) {
    return 0;
  }

  return props.chartData.indicator.filter(isJsonObject).length;
}

function normalizeBaseTableColumnFit(node: EditorTreeNode): void {
  const props = node.props;
  const style = mutableNodeStyle(node);
  if (!isJsonObject(props) || !style) {
    return;
  }

  const tableWidth = asFiniteNumber(style.width) ?? 0;
  const fieldCount = baseTableFieldCount(node);
  if (tableWidth <= 0 || fieldCount === 0) {
    return;
  }

  const columnConfig = isJsonObject(props.columnConfig) ? props.columnConfig : {};
  const sequenceCol = isJsonObject(columnConfig.sequenceCol) ? columnConfig.sequenceCol : {};
  const ordinaryCol = isJsonObject(columnConfig.ordinaryCol) ? columnConfig.ordinaryCol : {};
  columnConfig.sequenceCol = sequenceCol;
  columnConfig.ordinaryCol = ordinaryCol;
  props.columnConfig = columnConfig;

  const sequenceVisible = sequenceCol.isShowCount === true;
  const sequenceWidth = sequenceVisible
    ? Math.max(28, Math.min(90, asFiniteNumber(sequenceCol.columnWidth) ?? 44))
    : 0;
  if (sequenceVisible) {
    sequenceCol.columnWidth = sequenceWidth;
  }

  const totalColumns = fieldCount + (sequenceVisible ? 1 : 0);
  if (totalColumns >= 5 || tableWidth < 520) {
    props.columnSpace = Math.min(asFiniteNumber(props.columnSpace) ?? 0, 4);
  }

  const columnSpace = asFiniteNumber(props.columnSpace) ?? 0;
  const availableWidth = tableWidth - sequenceWidth - columnSpace * Math.max(0, totalColumns - 1);
  if (availableWidth <= 0) {
    return;
  }

  const fittedWidth = Math.max(64, Math.floor(availableWidth / fieldCount));
  const currentWidth = asFiniteNumber(ordinaryCol.columnWidth) ?? fittedWidth;
  ordinaryCol.columnWidth = Math.max(currentWidth, fittedWidth);
}

function fitBaseTablesToContainer(root: EditorTreeNode, containerRect: Rect): void {
  for (const node of collectLeafNodes(root)) {
    if (node.componentName !== "BaseTable") {
      continue;
    }

    const style = mutableNodeStyle(node);
    const rect = nodeRect(node);
    if (!style || !rect) {
      continue;
    }

    const safeRight = containerRect.left + containerRect.width - 12;
    if (rect.left >= containerRect.left && rect.left < safeRight) {
      const expandedWidth = Math.max(rect.width, safeRight - rect.left);
      if (expandedWidth > rect.width) {
        style.width = Math.round(expandedWidth);
      }
    }

    normalizeBaseTableColumnFit(node);
  }
}

function clampLayerZIndex(node: EditorTreeNode, layerRole: EditorLayerRole): void {
  const style = mutableNodeStyle(node);
  if (!style) {
    return;
  }

  if (layerRole === "background") {
    style.zIndex = Math.min(asFiniteNumber(style.zIndex) ?? 0, 0);
    return;
  }

  if (layerRole === "decoration") {
    style.zIndex = Math.min(asFiniteNumber(style.zIndex) ?? 10, 10);
    return;
  }

  style.zIndex = Math.max(asFiniteNumber(style.zIndex) ?? 20, 20);
}

function enforceMainContentAboveDecorations(root: EditorTreeNode): void {
  if (!isEditorGroupNode(root) || !Array.isArray(root.children)) {
    return;
  }

  for (const child of root.children) {
    clampLayerZIndex(child, editorNodeLayerRole(child));
    if (isEditorGroupNode(child)) {
      enforceMainContentAboveDecorations(child);
    }
  }
}

function axisObjects(value: JsonValue | undefined): JsonObject[] {
  if (Array.isArray(value)) {
    return value.filter(isJsonObject);
  }

  return isJsonObject(value) ? [value] : [];
}

function normalizeShortAxisUnitNames(root: EditorTreeNode): void {
  for (const node of collectLeafNodes(root)) {
    const props = node.props;
    if (!isJsonObject(props) || !isJsonObject(props.option)) {
      continue;
    }

    for (const axis of [
      ...axisObjects(props.option.xAxis),
      ...axisObjects(props.option.yAxis),
    ]) {
      if (typeof axis.name === "string" && isUnitOnlyText(axis.name)) {
        axis.name = "";
      }
    }
  }
}

function separateOverlappingUnitTexts(root: EditorTreeNode, containerRect: Rect): void {
  const leaves = collectLeafNodes(root);
  const textItems = leaves
    .filter((node) => node.componentName === "SingleText")
    .map((node) => ({ node, rect: nodeRect(node), text: nodeTextContent(node) }))
    .filter((item): item is { node: EditorTreeNode; rect: Rect; text: string } => Boolean(item.rect));
  const chartItems = leaves
    .map((node) => ({ node, rect: nodeRect(node), grid: nodeOptionGrid(node) }))
    .filter((item): item is { node: EditorTreeNode; rect: Rect; grid: JsonObject } =>
      Boolean(item.rect && item.grid),
    );

  for (const unit of textItems.filter((item) => isUnitOnlyText(item.text))) {
    const overlapsCopy = textItems.some((item) =>
      item !== unit &&
      item.text.length > unit.text.length &&
      horizontallyOverlap(unit.rect, item.rect) &&
      verticallyOverlap(unit.rect, item.rect),
    );
    if (!overlapsCopy) {
      continue;
    }

    const chart = chartItems.find((item) => rectsOverlap(item.rect, containerRect));
    const style = mutableNodeStyle(unit.node);
    if (!chart || !style) {
      continue;
    }

    const gridLeft = asFiniteNumber(chart.grid.left) ?? 0;
    const gridTop = asFiniteNumber(chart.grid.top) ?? 0;
    style.left = Math.round(chart.rect.left + gridLeft);
    style.top = Math.max(
      containerRect.top + 42,
      Math.round(chart.rect.top + gridTop - unit.rect.height - 6),
    );
  }
}

function balanceFunnelChartLayout(root: EditorTreeNode, containerRect: Rect): void {
  const leaves = collectLeafNodes(root);
  const funnelItems = leaves
    .filter((node) => node.componentName === "FunnelChart")
    .map((node) => ({ node, rect: nodeRect(node) }))
    .filter((item): item is { node: EditorTreeNode; rect: Rect } => Boolean(item.rect));

  for (const item of funnelItems) {
    const style = mutableNodeStyle(item.node);
    if (!style) {
      continue;
    }

    const sideStart = containerRect.left + containerRect.width * 0.54;
    const sideRects = leaves
      .filter((node) => node !== item.node)
      .map((node) => nodeRect(node))
      .filter((rect): rect is Rect => Boolean(rect && rect.left >= sideStart));
    const sideLeft = sideRects.length > 0
      ? Math.min(...sideRects.map((rect) => rect.left))
      : containerRect.left + containerRect.width - 24;
    const leftZoneLeft = containerRect.left + 32;
    const leftZoneRight = Math.max(leftZoneLeft + item.rect.width, sideLeft - 28);
    const maxWidth = leftZoneRight - leftZoneLeft;
    const targetWidth = Math.min(maxWidth, Math.max(item.rect.width, containerRect.width * 0.38));
    const targetHeight = Math.min(
      containerRect.height - 88,
      Math.max(item.rect.height, containerRect.height * 0.48),
    );

    if (targetWidth > item.rect.width) {
      style.width = Math.round(targetWidth);
      style.left = Math.round(leftZoneLeft + (maxWidth - targetWidth) / 2);
    }

    if (targetHeight > item.rect.height) {
      style.height = Math.round(targetHeight);
      style.top = Math.round(containerRect.top + 64 + (containerRect.height - 96 - targetHeight) / 2);
    }
  }
}

function applyGroupLayoutGuards(root: EditorTreeNode, containerRect: Rect): void {
  externalizeIndicatorTitles(root, containerRect);
  expandSingleLineTextBoxes(root, containerRect);
  fitBaseTablesToContainer(root, containerRect);
  enforceMainContentAboveDecorations(root);
  normalizeShortAxisUnitNames(root);
  separateOverlappingUnitTexts(root, containerRect);
  balanceFunnelChartLayout(root, containerRect);
  alignCircularChartCenterTexts(root);
  avoidCircularOutsideLabelsNearSideText(root, containerRect);
  reserveCircularBottomLegendSpace(root, containerRect);
  resolveSameColumnTextOverlaps(root, containerRect);
  reserveTopTextLegendSpace(root, containerRect);
  reserveBottomTextGridSpace(root, containerRect);
}

function horizontallyOverlap(left: Rect, right: Rect): boolean {
  return Math.min(left.left + left.width, right.left + right.width) >
    Math.max(left.left, right.left);
}

function isBottomTextRect(textRect: Rect, containerRect: Rect): boolean {
  const bottomBandHeight = Math.max(56, Math.min(96, containerRect.height * 0.22));
  return textRect.top >= containerRect.top + containerRect.height - bottomBandHeight;
}

function overlapsChartBottomBand(textRect: Rect, chartRect: Rect): boolean {
  const chartBottomBandHeight = Math.max(72, chartRect.height * 0.25);
  return textRect.top < chartRect.top + chartRect.height &&
    textRect.top + textRect.height > chartRect.top + chartRect.height - chartBottomBandHeight;
}

function reserveBottomTextGridSpace(root: EditorTreeNode, containerRect: Rect): void {
  const leaves = collectLeafNodes(root);
  const bottomTexts = leaves
    .filter((node) => node.componentName === "SingleText")
    .map((node) => nodeRect(node))
    .filter((rect): rect is Rect => Boolean(rect && isBottomTextRect(rect, containerRect)));

  if (bottomTexts.length === 0) {
    return;
  }

  for (const node of leaves) {
    const grid = nodeOptionGrid(node);
    const chartRect = nodeRect(node);
    if (!grid || !chartRect || chartRect.height < 180) {
      continue;
    }

    const overlappingTexts = bottomTexts.filter((textRect) =>
      horizontallyOverlap(textRect, chartRect) &&
      overlapsChartBottomBand(textRect, chartRect),
    );
    if (overlappingTexts.length === 0) {
      continue;
    }

    const requiredBottom = Math.max(
      64,
      ...overlappingTexts.map((textRect) =>
        Math.ceil(chartRect.top + chartRect.height - textRect.top + textRect.height + 24),
      ),
    );
    const maxBottom = Math.max(64, Math.floor(chartRect.height * 0.36));
    const safeBottom = Math.min(requiredBottom, maxBottom);
    grid.bottom = Math.max(asFiniteNumber(grid.bottom) ?? 0, safeBottom);
  }
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
  autoPanelBackgrounds: boolean,
): EditorGroupNode {
  if (typeof item.logicalId !== "string" || item.logicalId.trim() === "") {
    throw new Error("dashboard group missing logicalId");
  }

  const groupId = uniqueSchemaId(item.logicalId);
  const title = groupTitle(item);
  const grouping = isJsonObject(item.grouping) ? item.grouping : inheritedGrouping;
  const children = groupChildren(
    groupComponents(item).map((component) =>
      compileComponent(markGroupTitleComponent(component, title), groupId, theme, true),
    ),
    groupId,
    grouping,
  );

  const group: EditorGroupNode = {
    id: groupId,
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: groupProps(item),
    title,
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };

  const sortedGroup = sortEditorTreeChildren(group) as EditorGroupNode;
  const rect = rectFromItem(item, groupId);
  if (rect) {
    absolutizeClearLocalStyles(sortedGroup, rect);
    applyGroupLayoutGuards(sortedGroup, rect);
  }

  if (autoPanelBackgrounds && rect && !treeHasCoveringBackgroundCarrier(sortedGroup.children, rect)) {
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

function normalizedStringField(item: JsonObject, key: string): string {
  const value = item[key];
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

function isBimModelReservedArea(item: JsonObject): boolean {
  return ["purpose", "type", "kind"].some((key) =>
    normalizedStringField(item, key) === "bim-model",
  );
}

function bimModelReservedAreas(input: JsonObject): JsonObject[] {
  return asArray(input.reservedAreas).filter(isBimModelReservedArea);
}

function hasBimModelReservedArea(input: JsonObject): boolean {
  return bimModelReservedAreas(input).length > 0;
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

type RgbaColor = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

function clampColorChannel(value: number): number {
  return Math.min(255, Math.max(0, value));
}

function parseCssColorChannel(value: string): number | undefined {
  const trimmed = value.trim();
  const parsed = Number(trimmed.endsWith("%") ? trimmed.slice(0, -1) : trimmed);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return clampColorChannel(trimmed.endsWith("%") ? parsed * 2.55 : parsed);
}

function parseCssAlpha(value: string): number | undefined {
  const trimmed = value.trim();
  const parsed = Number(trimmed.endsWith("%") ? trimmed.slice(0, -1) : trimmed);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return Math.min(1, Math.max(0, trimmed.endsWith("%") ? parsed / 100 : parsed));
}

function parseCssColor(value: JsonValue | undefined): RgbaColor | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const color = value.trim();
  const hexMatch = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/iu.exec(color);
  if (hexMatch) {
    const raw = hexMatch[1];
    const expanded = raw.length <= 4
      ? [...raw].map((character) => `${character}${character}`).join("")
      : raw;
    return {
      red: Number.parseInt(expanded.slice(0, 2), 16),
      green: Number.parseInt(expanded.slice(2, 4), 16),
      blue: Number.parseInt(expanded.slice(4, 6), 16),
      alpha: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgbMatch = /^rgba?\((.*)\)$/iu.exec(color);
  if (!rgbMatch) {
    return undefined;
  }

  const parts = rgbMatch[1].split(",").map((part) => part.trim());
  if (parts.length !== 3 && parts.length !== 4) {
    return undefined;
  }

  const red = parseCssColorChannel(parts[0]);
  const green = parseCssColorChannel(parts[1]);
  const blue = parseCssColorChannel(parts[2]);
  const alpha = parts.length === 4 ? parseCssAlpha(parts[3]) : 1;
  if (red === undefined || green === undefined || blue === undefined || alpha === undefined) {
    return undefined;
  }

  return { red, green, blue, alpha };
}

function compositeColor(foreground: RgbaColor, background: RgbaColor): RgbaColor | undefined {
  if (background.alpha < 0.999) {
    return undefined;
  }

  return {
    red: foreground.red * foreground.alpha + background.red * (1 - foreground.alpha),
    green: foreground.green * foreground.alpha + background.green * (1 - foreground.alpha),
    blue: foreground.blue * foreground.alpha + background.blue * (1 - foreground.alpha),
    alpha: 1,
  };
}

function relativeLuminance(color: RgbaColor): number {
  const linear = [color.red, color.green, color.blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function colorContrastRatio(foreground: RgbaColor, background: RgbaColor): number | undefined {
  const visibleForeground = compositeColor(foreground, background);
  if (!visibleForeground) {
    return undefined;
  }

  const foregroundLuminance = relativeLuminance(visibleForeground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function warnContrast(
  foreground: RgbaColor,
  background: RgbaColor,
  threshold: number,
  label: string,
  warnings: string[],
): void {
  const ratio = colorContrastRatio(foreground, background);
  if (ratio !== undefined && ratio + 0.001 < threshold) {
    warnings.push(
      `${label} contrast ${ratio.toFixed(2)}:1 is below ${threshold}:1; adjust the LLM-authored foreground or background color`,
    );
  }
}

function warnThemeContrast(theme: JsonObject | undefined, warnings: string[]): void {
  const textColor = parseCssColor(theme?.textColor);
  const background = parseCssColor(theme?.background);
  if (!textColor || !background || background.alpha < 0.999) {
    return;
  }

  warnContrast(textColor, background, 4.5, "theme.textColor against theme.background", warnings);

  const panelBackground = parseCssColor(theme?.panelBackground);
  const resolvedPanelBackground = panelBackground
    ? compositeColor(panelBackground, background)
    : undefined;
  if (resolvedPanelBackground) {
    warnContrast(
      textColor,
      resolvedPanelBackground,
      4.5,
      "theme.textColor against theme.panelBackground",
      warnings,
    );
  }
}

function isLargeText(style: JsonObject, fontSize: number): boolean {
  const fontWeight = style.fontWeight;
  const bold = fontWeight === "bold" || fontWeight === "bolder" ||
    (typeof fontWeight === "number" && fontWeight >= 700);
  return fontSize >= 18 || (bold && fontSize >= 14);
}

function warnSingleTextContrast(item: JsonObject, fieldName: string, warnings: string[]): void {
  if (componentNameOf(item) !== "SingleText") {
    return;
  }

  const style = componentStyleFromItem(item);
  const foreground = parseCssColor(style?.color);
  const background = parseCssColor(style?.backgroundColor);
  if (!style || !foreground || !background || background.alpha < 0.999) {
    return;
  }

  const declaredFontSize = asFiniteNumber(style.fontSize);
  const fontSize = declaredFontSize !== undefined && declaredFontSize > 0 ? declaredFontSize : 18;
  warnContrast(
    foreground,
    background,
    isLargeText(style, fontSize) ? 3 : 4.5,
    `${fieldName} SingleText`,
    warnings,
  );
}

function normalizedTextLineHeight(style: JsonObject, fontSize: number): number {
  const raw = asFiniteNumber(style.lineHeight) ?? 1;
  if (raw <= 0) {
    return 1;
  }
  if (raw <= 4) {
    return raw;
  }

  return Math.min(2, Math.max(1, raw / fontSize));
}

function estimatedTextLineWidth(text: string, fontSize: number, letterSpacing: number): number {
  return Math.max(0, estimateTextWidth(text, fontSize) + Math.max(0, text.length - 1) * letterSpacing);
}

function warnSingleTextFit(item: JsonObject, fieldName: string, warnings: string[]): void {
  if (componentNameOf(item) !== "SingleText") {
    return;
  }

  const style = componentStyleFromItem(item);
  const width = asFiniteNumber(style?.width);
  const height = asFiniteNumber(style?.height);
  const text = textContentOf(item)?.trim() ?? "";
  if (!style || width === undefined || height === undefined || width <= 0 || height <= 0 || text === "") {
    return;
  }

  const declaredFontSize = asFiniteNumber(style.fontSize);
  const fontSize = declaredFontSize !== undefined && declaredFontSize > 0 ? declaredFontSize : 18;
  const letterSpacing = asFiniteNumber(style.letterSpacing) ?? 0;
  const lineHeight = normalizedTextLineHeight(style, fontSize);
  const lineCount = text.split(/\r?\n/u).reduce((count, line) => {
    const lineWidth = estimatedTextLineWidth(line, fontSize, letterSpacing);
    return count + Math.max(1, Math.ceil(lineWidth / width));
  }, 0);
  const neededHeight = Math.ceil(lineCount * fontSize * lineHeight);
  if (neededHeight > height + 1) {
    warnings.push(
      `${fieldName} SingleText content needs about ${lineCount} line(s) and ${neededHeight}px height for its declared width, but style.height is ${height}px; text may overflow or be clipped`,
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

function baseTableColumns(item: JsonObject): JsonObject[] {
  const props = componentProps(item);
  if (Array.isArray(props.columns)) {
    return props.columns.filter(isJsonObject);
  }

  const chartData = props.chartData;
  return isJsonObject(chartData) && Array.isArray(chartData.indicator)
    ? chartData.indicator.filter(isJsonObject)
    : [];
}

function baseTableRows(item: JsonObject): JsonObject[] {
  const props = componentProps(item);
  if (Array.isArray(props.data)) {
    return props.data.filter(isJsonObject);
  }
  return chartDataRowsOf(item) ?? [];
}

function baseTableField(column: JsonObject): string {
  const value = column.field ?? column.fieldName;
  return typeof value === "string" ? value.trim() : "";
}

function isPlaceholderTableValue(value: JsonValue | undefined): boolean {
  return value === undefined ||
    value === null ||
    (typeof value === "string" && /^(?:\s*|-{1,3}|—|暂无|无数据|placeholder)$/iu.test(value));
}

function validateBaseTableData(item: JsonObject, fieldName: string, errors: string[]): void {
  if (componentNameOf(item) !== "BaseTable") {
    return;
  }

  const columns = baseTableColumns(item);
  const rows = baseTableRows(item);
  const fields = columns.map(baseTableField).filter((field) => field !== "");
  if (fields.length === 0) {
    errors.push(`${fieldName} BaseTable must include explicit columns with non-empty field names`);
    return;
  }
  if (rows.length === 0) {
    errors.push(`${fieldName} BaseTable must include explicit non-empty data rows`);
    return;
  }

  const missingFields = fields.filter((field) => rows.every((row) => !(field in row)));
  if (missingFields.length > 0) {
    errors.push(`${fieldName} BaseTable data is missing column fields: ${missingFields.join(", ")}`);
  }
  if (rows.every((row) => fields.every((field) => isPlaceholderTableValue(row[field])))) {
    errors.push(`${fieldName} BaseTable data must contain real cell values, not empty or placeholder rows`);
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
  validateBaseTableData(item, fieldName, errors);
}

function asNumeric(value: JsonValue | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function textPercentages(item: JsonObject): number[] {
  if (componentNameOf(item) !== "SingleText") {
    return [];
  }

  const text = textContentOf(item) ?? "";
  return [...text.matchAll(/(\d+(?:\.\d+)?)\s*%/gu)]
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value));
}

function gaugePercentValue(item: JsonObject): number | undefined {
  if (componentNameOf(item) !== "Gauge") {
    return undefined;
  }

  const props = componentProps(item);
  const indicatorConfig = isJsonObject(props.indicatorConfig) ? props.indicatorConfig : {};
  const suffix = typeof indicatorConfig.suffix === "string" ? indicatorConfig.suffix.trim() : "";
  const maxValue = asNumeric(indicatorConfig.maxValue);
  if (suffix !== "%" && (maxValue === undefined || maxValue > 150)) {
    return undefined;
  }

  return asNumeric(props.value);
}

function warnGaugePercentTextMismatch(
  components: JsonObject[],
  fieldName: string,
  warnings: string[],
): void {
  const gaugeValues = components
    .map(gaugePercentValue)
    .filter((value): value is number => value !== undefined);
  if (gaugeValues.length === 0) {
    return;
  }

  const textValues = components.flatMap(textPercentages);
  for (const gaugeValue of gaugeValues) {
    for (const textValue of textValues) {
      if (Math.abs(gaugeValue - textValue) > 3) {
        warnings.push(
          `${fieldName} Gauge value ${gaugeValue}% differs from nearby SingleText percentage ${textValue}%; ensure the module text labels a distinct forecast/target metric or aligns with the gauge value`,
        );
        return;
      }
    }
  }
}

function uniqueChartTypes(rows: JsonObject[] | undefined): string[] {
  const result: string[] = [];
  for (const row of rows ?? []) {
    const type = typeof row.type === "string" ? row.type.trim() : "";
    if (type !== "" && !/^(?:系列|指标值|数值|value)$/iu.test(type) && !result.includes(type)) {
      result.push(type);
    }
  }
  return result;
}

function optionSeries(item: JsonObject): JsonObject[] {
  const props = componentProps(item);
  const option = isJsonObject(props.option) ? props.option : {};
  return Array.isArray(option.series) ? option.series.filter(isJsonObject) : [];
}

function componentStyleFromItem(item: JsonObject): JsonObject | undefined {
  if (isJsonObject(item.style)) {
    return item.style;
  }

  const props = componentProps(item);
  return isJsonObject(props.style) ? props.style : undefined;
}

function componentRectFromItem(item: JsonObject, fallbackId: string): Rect | undefined {
  const style = componentStyleFromItem(item);
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

  const id =
    typeof item.logicalId === "string" && item.logicalId.trim() !== ""
      ? item.logicalId
      : fallbackId;
  return { id, left, top, width, height };
}

function seriesRadiusRatios(item: JsonObject): { inner: number; outer: number } | undefined {
  const series = optionSeries(item)[0];
  if (!series) {
    return undefined;
  }

  const radius = Array.isArray(series.radius) ? series.radius : [];
  return {
    inner: percentFromString(radius[0], componentNameOf(item) === "RingChart" ? 0.3 : 0),
    outer: percentFromString(radius[1], componentNameOf(item) === "RingChart" ? 0.45 : 0.6),
  };
}

function seriesCenterPoint(item: JsonObject, rect: Rect): { x: number; y: number } | undefined {
  if (!["PieChart", "RingChart", "RoseChart"].includes(componentNameOf(item))) {
    return undefined;
  }

  const series = optionSeries(item)[0];
  if (!series) {
    return undefined;
  }

  const center = Array.isArray(series.center) ? series.center : [];
  return {
    x: rect.left + rect.width * percentFromString(center[0], 0.5),
    y: rect.top + rect.height * percentFromString(center[1], 0.5),
  };
}

function legendOf(item: JsonObject): JsonObject | undefined {
  const props = componentProps(item);
  const option = isJsonObject(props.option) ? props.option : {};
  return isJsonObject(option.legend) ? option.legend : undefined;
}

function hasBottomLegend(item: JsonObject): boolean {
  const legend = legendOf(item);
  return Boolean(legend && legend.show !== false && legend.top === "bottom");
}

function isSpecTitleText(item: JsonObject): boolean {
  const title = typeof item.title === "string" ? item.title : "";
  const props = componentProps(item);
  const name = typeof props.name === "string" ? props.name : "";
  return /标题|主标题|模块标题/u.test(`${title} ${name}`);
}

function isSpecCenterTextCandidate(item: JsonObject): boolean {
  if (componentNameOf(item) !== "SingleText" || isSpecTitleText(item)) {
    return false;
  }

  const text = textContentOf(item) ?? "";
  if (text === "" || isUnitOnlyText(text) || /[。；;，、]/u.test(text)) {
    return false;
  }

  return /\d/u.test(text) || text.length <= 10;
}

function fontSizeOfComponent(item: JsonObject): number {
  const style = componentStyleFromItem(item);
  return asFiniteNumber(style?.fontSize) ?? 14;
}

function warnRingChartGeometry(
  item: JsonObject,
  fieldName: string,
  warnings: string[],
): void {
  if (componentNameOf(item) !== "RingChart") {
    return;
  }

  const rect = componentRectFromItem(item, fieldName);
  const radius = seriesRadiusRatios(item);
  if (!rect || !radius) {
    return;
  }

  const minSide = Math.min(rect.width, rect.height);
  const dataCount = chartDataRowsOf(item)?.length ?? 0;
  if (minSide >= 220 && hasBottomLegend(item) && dataCount >= 5 && radius.outer < 0.38) {
    warnings.push(
      `${fieldName} RingChart outer radius is too small for a multi-item bottom legend; increase series[0].radius[1] or reserve more chart body space`,
    );
  }

  const props = componentProps(item);
  const decorator = isJsonObject(props.decorator) ? props.decorator : {};
  const innerRing = isJsonObject(decorator.innerRing) ? decorator.innerRing : {};
  const outerRing = isJsonObject(decorator.outerRing) ? decorator.outerRing : {};
  if (
    minSide >= 220 &&
    radius.outer < 0.34 &&
    (innerRing.isActive === true || outerRing.isActive === true)
  ) {
    warnings.push(
      `${fieldName} RingChart uses ring decorations while the chart body is very small; keep decorations secondary or increase the readable ring radius`,
    );
  }
}

function warnCircularCenterTextFits(
  components: JsonObject[],
  fieldName: string,
  warnings: string[],
): void {
  const textItems = components
    .filter(isSpecCenterTextCandidate)
    .map((item, index) => ({
      item,
      rect: componentRectFromItem(item, `${fieldName}[${index}]`),
    }))
    .filter((entry): entry is { item: JsonObject; rect: Rect } => Boolean(entry.rect));

  for (const [chartIndex, chart] of components.entries()) {
    if (componentNameOf(chart) !== "RingChart") {
      continue;
    }

    const chartRect = componentRectFromItem(chart, `${fieldName}[${chartIndex}]`);
    const radius = seriesRadiusRatios(chart);
    if (!chartRect || !radius) {
      continue;
    }

    const center = seriesCenterPoint(chart, chartRect);
    if (!center) {
      continue;
    }

    const threshold = Math.min(chartRect.width, chartRect.height) * 0.3;
    const nearbyTexts = textItems.filter(({ rect }) => {
      const textCenterX = rect.left + rect.width / 2;
      const textCenterY = rect.top + rect.height / 2;
      return Math.hypot(textCenterX - center.x, textCenterY - center.y) <= threshold;
    });
    const primary = nearbyTexts.find(({ item }) => /\d/u.test(textContentOf(item) ?? ""));
    if (!primary) {
      continue;
    }

    const companionTexts = textItems.filter(({ item, rect }) => {
      if (item === primary.item) {
        return false;
      }
      const textCenterX = rect.left + rect.width / 2;
      const textCenterY = rect.top + rect.height / 2;
      const primaryCenterY = primary.rect.top + primary.rect.height / 2;
      return Math.abs(textCenterX - center.x) <= Math.max(72, chartRect.width * 0.24) &&
        Math.abs(textCenterY - center.y) <= Math.max(64, chartRect.height * 0.3) &&
        Math.abs(textCenterY - primaryCenterY) <= Math.max(64, chartRect.height * 0.3);
    });
    const stack = [primary, ...companionTexts];
    const stackWidth = Math.max(...stack.map(({ rect }) => rect.width));
    const gap = Math.max(8, Math.round(fontSizeOfComponent(primary.item) * 0.28));
    const stackHeight = stack.reduce((sum, { rect }) => sum + rect.height, 0) +
      Math.max(0, stack.length - 1) * gap;
    const innerDiameter = Math.min(chartRect.width, chartRect.height) * radius.inner;
    if (stackWidth + 20 > innerDiameter || stackHeight + 16 > innerDiameter) {
      warnings.push(
        `${fieldName}[${chartIndex}] RingChart center text is larger than the donut hole; increase inner radius/outer radius or reduce the center text stack`,
      );
    }
  }
}

function warnCircularBottomLegendTextCrowding(
  components: JsonObject[],
  fieldName: string,
  warnings: string[],
): void {
  const textRects = components
    .filter((item) =>
      componentNameOf(item) === "SingleText" &&
      !isSpecTitleText(item) &&
      !isUnitOnlyText(textContentOf(item) ?? ""),
    )
    .map((item, index) => componentRectFromItem(item, `${fieldName}[${index}]`))
    .filter((rect): rect is Rect => Boolean(rect));

  for (const [chartIndex, chart] of components.entries()) {
    if (!["PieChart", "RingChart", "RoseChart"].includes(componentNameOf(chart)) || !hasBottomLegend(chart)) {
      continue;
    }

    const chartRect = componentRectFromItem(chart, `${fieldName}[${chartIndex}]`);
    if (!chartRect) {
      continue;
    }

    const crowded = textRects.some((textRect) =>
      horizontallyOverlap(textRect, chartRect) &&
      textRect.top >= chartRect.top + chartRect.height * 0.78,
    );
    if (crowded) {
      warnings.push(
        `${fieldName}[${chartIndex}] ${componentNameOf(chart)} has a bottom legend and bottom text in the same panel; reserve vertical space so legend and conclusion do not overlap`,
      );
    }
  }
}

function hasGenericSeriesName(item: JsonObject): boolean {
  const series = optionSeries(item);
  if (series.length === 0) {
    return false;
  }

  return series.some((seriesItem) => {
    if (typeof seriesItem.name !== "string") {
      return true;
    }
    return /^(?:\s*|数值|指标值|value|series|系列\d*)$/iu.test(seriesItem.name.trim());
  });
}

function validateComponentWarnings(
  item: JsonObject,
  fieldName: string,
  warnings: string[],
): void {
  warnSingleTextContrast(item, fieldName, warnings);
  warnSingleTextFit(item, fieldName, warnings);

  if (!isChartComponent(item)) {
    return;
  }

  const types = uniqueChartTypes(chartDataRowsOf(item));
  if (types.length > 0 && hasGenericSeriesName(item)) {
    warnings.push(
      `${fieldName} ${componentNameOf(item)} has business chartData.type values but generic series names; series names should match the data types so legends and grouped categories remain readable`,
    );
  }

  warnRingChartGeometry(item, fieldName, warnings);
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

function componentLabelOf(item: JsonObject): string {
  const props = componentProps(item);
  return [
    typeof item.title === "string" ? item.title : "",
    typeof item.name === "string" ? item.name : "",
    typeof props.name === "string" ? props.name : "",
  ].join(" ");
}

function isBackgroundLikeSpecComponent(item: JsonObject): boolean {
  return /背景|底板|底图|底色|background|backdrop|panel[-_ ]?(?:bg|background)/iu
    .test(componentLabelOf(item));
}

function isEdgePaddingDecoration(item: JsonObject): boolean {
  return componentNameOf(item) === "SvgDecoration" &&
    hasVisibleSvgSource(item) &&
    !isBackgroundLikeSpecComponent(item);
}

function dashboardComponentItems(
  components: JsonObject[],
  groups: JsonObject[],
  modules: JsonObject[],
): JsonObject[] {
  return [
    ...components,
    ...groups.flatMap(groupComponents),
    ...modules.flatMap((module, moduleIndex) => {
      const slots = isJsonObject(module.slots) ? module.slots : {};
      return Object.entries(slots).flatMap(([slotName, slotValue]) =>
        collectSlotComponents(slotValue, `modules[${moduleIndex}].slots.${slotName}`)
          .map((component) => component.item),
      );
    }),
  ];
}

function dashboardContentRects(
  components: JsonObject[],
  groups: JsonObject[],
  modules: JsonObject[],
): Rect[] {
  const componentRects = components
    .filter((component) =>
      !isEdgePaddingDecoration(component) &&
      !isBackgroundLikeSpecComponent(component) &&
      (componentNameOf(component) !== "SingleImage" || isContentSingleImageProps(component)),
    )
    .map((component, index) => rectFromItem(component, `components[${index}]`))
    .filter((rect): rect is Rect => Boolean(rect));

  const groupRects = groups
    .map((group, index) => rectFromItem(group, `groups[${index}]`))
    .filter((rect): rect is Rect => Boolean(rect));

  const moduleRects = modules
    .map((module, index) => rectFromItem(module, `modules[${index}]`))
    .filter((rect): rect is Rect => Boolean(rect));

  return [...componentRects, ...groupRects, ...moduleRects];
}

function edgePaddingThreshold(canvas: { width: number; height: number }): number {
  return Math.max(24, Math.min(48, Math.round(Math.min(canvas.width, canvas.height) * 0.025)));
}

function edgePaddingBands(
  contentRects: Rect[],
  canvas: { width: number; height: number },
): Array<{ label: string; rect: Rect }> {
  if (contentRects.length === 0) {
    return [];
  }

  const threshold = edgePaddingThreshold(canvas);
  const minLeft = Math.max(0, Math.min(...contentRects.map((rect) => rect.left)));
  const maxRight = Math.min(
    canvas.width,
    Math.max(...contentRects.map((rect) => rect.left + rect.width)),
  );
  const maxBottom = Math.min(
    canvas.height,
    Math.max(...contentRects.map((rect) => rect.top + rect.height)),
  );

  const bands: Array<{ label: string; rect: Rect }> = [];
  if (minLeft >= threshold) {
    bands.push({
      label: "left",
      rect: { id: "left-edge-padding", left: 0, top: 0, width: minLeft, height: canvas.height },
    });
  }

  const rightPadding = canvas.width - maxRight;
  if (rightPadding >= threshold) {
    bands.push({
      label: "right",
      rect: {
        id: "right-edge-padding",
        left: maxRight,
        top: 0,
        width: rightPadding,
        height: canvas.height,
      },
    });
  }

  const bottomPadding = canvas.height - maxBottom;
  if (bottomPadding >= threshold) {
    bands.push({
      label: "bottom",
      rect: {
        id: "bottom-edge-padding",
        left: 0,
        top: maxBottom,
        width: canvas.width,
        height: bottomPadding,
      },
    });
  }

  return bands;
}

function warnEmptyEdgePadding(
  components: JsonObject[],
  groups: JsonObject[],
  modules: JsonObject[],
  canvas: { width: number; height: number },
  warnings: string[],
): void {
  const bands = edgePaddingBands(dashboardContentRects(components, groups, modules), canvas);
  if (bands.length === 0) {
    return;
  }

  const decorations = dashboardComponentItems(components, groups, modules)
    .filter(isEdgePaddingDecoration)
    .map((item, index) => componentRectFromItem(item, `edgeDecoration[${index}]`))
    .filter((rect): rect is Rect => Boolean(rect));

  const emptyBands = bands.filter((band) =>
    !decorations.some((decoration) => rectsOverlap(decoration, band.rect)),
  );
  if (emptyBands.length === 0) {
    return;
  }

  warnings.push(
    `dashboard canvas has empty ${emptyBands.map((band) => band.label).join("/")} edge padding; add LLM-authored SvgDecoration edge ornaments such as side rails, tick marks, scan lines, signal ticks, or bottom corner structures while keeping main content above decorations`,
  );
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
  return Array.isArray(auxiliaryTexts) && auxiliaryTexts.some((item) => {
    if (!isJsonObject(item) || componentNameOf(item) !== "SingleText") {
      return false;
    }

    const textContent = textContentOf(item);
    return typeof textContent === "string" && !isPlaceholderText(textContent);
  });
}

export function validateDashboardSpec(input: JsonObject): JsonObject {
  const errors: string[] = [];
  const warnings: string[] = [];
  const canvas = canvasSize(input);
  const components = asArray(input.components);
  const groups = asArray(input.groups);
  const modules = asArray(input.modules);
  const reservedAreas = asArray(input.reservedAreas);
  const theme = isJsonObject(input.theme) ? input.theme : undefined;
  const grouping = isJsonObject(input.grouping) ? input.grouping : undefined;
  const rects: Rect[] = [];
  const reservedRects: Rect[] = [];

  if (components.length === 0 && groups.length === 0 && modules.length === 0) {
    errors.push("dashboard spec must include at least one component, group, or module");
  }

  if (canvas.width <= 0 || canvas.height <= 0) {
    errors.push("canvas width and height must be positive numbers");
  }

  validateGroupingMode(grouping, "grouping", errors);
  warnThemeContrast(theme, warnings);

  reservedAreas.forEach((reservedArea, index) => {
    if (!isBimModelReservedArea(reservedArea)) {
      return;
    }

    if (typeof reservedArea.logicalId !== "string" || reservedArea.logicalId.trim() === "") {
      errors.push(`reservedAreas[${index}] missing logicalId`);
    }

    const rect = rectFromItem(reservedArea, `reservedAreas[${index}]`);
    if (rect) {
      reservedRects.push(rect);
      validateCanvasBounds(rect, canvas, warnings);
    } else {
      errors.push(`reservedAreas[${index}] missing complete style left/top/width/height`);
    }
  });

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
    validateComponentWarnings(component, `components[${index}]`, warnings);

    const rect = rectFromItem(component, `components[${index}]`);
    if (rect) {
      rects.push(rect);
      validateCanvasBounds(rect, canvas, warnings);
    } else {
      warnings.push(`components[${index}] has no complete absolute style`);
    }
  });
  warnGaugePercentTextMismatch(components, "components", warnings);
  warnCircularCenterTextFits(components, "components", warnings);
  warnCircularBottomLegendTextCrowding(components, "components", warnings);

  groups.forEach((group, groupIndex) => {
    if (typeof group.logicalId !== "string" || group.logicalId.trim() === "") {
      errors.push(`groups[${groupIndex}] missing logicalId`);
    }
    const title = typeof group.title === "string" ? group.title.trim() : "";
    if (title === "") {
      errors.push(`groups[${groupIndex}] missing descriptive title`);
    } else if (GENERIC_GROUP_TITLE_PATTERN.test(title)) {
      errors.push(`groups[${groupIndex}].title must use a specific business or visual region name`);
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
    warnGaugePercentTextMismatch(children, `groups[${groupIndex}]`, warnings);
    warnCircularCenterTextFits(children, `groups[${groupIndex}].components`, warnings);
    warnCircularBottomLegendTextCrowding(children, `groups[${groupIndex}].components`, warnings);

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
      validateComponentWarnings(
        component,
        `groups[${groupIndex}].components[${componentIndex}]`,
        warnings,
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
    const slotComponents = Object.entries(slots).flatMap(([slotName, slotValue]) =>
      collectSlotComponents(slotValue, `modules[${index}].slots.${slotName}`),
    );
    const slotComponentItems = slotComponents.map((component) => component.item);
    warnGaugePercentTextMismatch(
      slotComponentItems,
      `modules[${index}]`,
      warnings,
    );
    warnCircularCenterTextFits(slotComponentItems, `modules[${index}].slots`, warnings);
    warnCircularBottomLegendTextCrowding(slotComponentItems, `modules[${index}].slots`, warnings);
    for (const [slotName, slotValue] of Object.entries(slots)) {
      for (const component of collectSlotComponents(slotValue, `modules[${index}].slots.${slotName}`)) {
        validateComponentQuality(
          component.item,
          component.fieldName,
          errors,
          inheritedChartRowsAvailable,
        );
        validateComponentWarnings(component.item, component.fieldName, warnings);
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

  for (const reservedRect of reservedRects) {
    for (const rect of rects) {
      if (rectsOverlap(rect, reservedRect)) {
        warnings.push(`${rect.id} overlaps reserved BIM model area ${reservedRect.id}`);
      }
    }
  }

  warnEmptyEdgePadding(components, groups, modules, canvas, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export type DashboardSchemaGenerationOptions = {
  suppressRootBackground?: boolean;
};

export function generateDashboardSchema(
  input: JsonObject,
  options: DashboardSchemaGenerationOptions = {},
): EditorGroupNode {
  const validation = validateDashboardSpec(input);
  const errors = validation.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  const rootId = dashboardRootId(input);
  const canvas = canvasSize(input);
  const theme = isJsonObject(input.theme) ? input.theme : undefined;
  const grouping = isJsonObject(input.grouping) ? input.grouping : undefined;
  const autoPanelBackgrounds = input.autoPanelBackgrounds !== false;
  const components = asArray(input.components);
  const groups = asArray(input.groups);
  const modules = asArray(input.modules);
  let children: EditorTreeNode[] = [
    ...compileRootComponents(components, rootId, theme, grouping),
    ...groups.map((group) => compileComponentGroup(group, rootId, theme, grouping, autoPanelBackgrounds)),
    ...modules.map((module) => compileModule(module, rootId, theme, grouping, autoPanelBackgrounds)),
  ];

  if (
    !options.suppressRootBackground &&
    !hasBimModelReservedArea(input) &&
    !treeHasCanvasBackground(children, canvas)
  ) {
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
      layerRole: "content",
    },
    title: dashboardTitle(input),
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };

  return sortEditorTreeChildren(root) as EditorGroupNode;
}
