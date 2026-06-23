import { sortEditorTreeChildren, uniqueSchemaId } from "./schema.js";
import type { EditorGroupNode, EditorTreeNode, JsonObject, JsonValue } from "../types/component.js";

export type SemanticGroupMode = "none" | "semantic";

export interface SemanticGroupingOptions {
  parentId: string;
  mode?: SemanticGroupMode;
  singleChildGroup?: boolean;
}

type GroupBucketKey =
  | "title"
  | "auxiliary"
  | "centerSummary"
  | "conclusion"
  | "sideSummary"
  | "decorations"
  | "mainContent"
  | "background";

const GROUP_ORDER: { key: GroupBucketKey; suffix: string; title: string }[] = [
  { key: "title", suffix: "title", title: "标题" },
  { key: "auxiliary", suffix: "auxiliary", title: "辅助文本" },
  { key: "centerSummary", suffix: "center_summary", title: "中心摘要" },
  { key: "conclusion", suffix: "conclusion", title: "结论" },
  { key: "sideSummary", suffix: "side_summary", title: "重点摘要" },
  { key: "mainContent", suffix: "main_content", title: "主内容" },
  { key: "decorations", suffix: "decorations", title: "装饰" },
  { key: "background", suffix: "background", title: "背景" },
];

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function resolveSemanticGroupingOptions(
  input: { [key: string]: JsonValue | undefined },
  parentId: string,
): SemanticGroupingOptions {
  const grouping = isJsonObject(input.grouping) ? input.grouping : {};
  const mode = grouping.mode === "none" ? "none" : "semantic";
  const singleChildGroup =
    grouping.singleChildGroup === true || grouping.alwaysGroupChildren === true;

  return {
    parentId,
    mode,
    singleChildGroup,
  };
}

function sortChildren(parentId: string, children: EditorTreeNode[]): EditorTreeNode[] {
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

function nodeTitle(child: EditorTreeNode): string {
  if (typeof child.title === "string" && child.title.trim() !== "") {
    return child.title;
  }

  const props = child.props;
  if (isJsonObject(props) && typeof props.name === "string") {
    return props.name;
  }

  return "";
}

function createEditorGroup(
  parentId: string,
  suffix: string,
  title: string,
  children: EditorTreeNode[],
): EditorGroupNode {
  return {
    id: uniqueSchemaId(`${parentId}_grp_${suffix}`, "fs"),
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {},
    title,
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };
}

function bucketForChild(child: EditorTreeNode): GroupBucketKey {
  const title = nodeTitle(child);
  const componentName = child.componentName;

  if (componentName === "SingleImage") {
    return "background";
  }

  if (componentName === "SvgDecoration") {
    if (/标题承托|标题装饰|title[-_ ]?badge|标题背景/.test(title)) {
      return "title";
    }

    return "decorations";
  }

  if (componentName === "SingleText") {
    if (title === "模块标题" || /标题文本|主标题/.test(title)) {
      return "title";
    }

    if (/^(总数|中心指标说明|中心摘要数值|中心摘要说明)$/.test(title)) {
      return "centerSummary";
    }

    if (/^(顶部结论|底部结论)$/.test(title)) {
      return "conclusion";
    }

    if (/^侧边摘要/.test(title)) {
      return "sideSummary";
    }

    return "auxiliary";
  }

  return "mainContent";
}

export function groupEditorTreeChildren(
  children: EditorTreeNode[],
  options: SemanticGroupingOptions,
): EditorTreeNode[] {
  if (options.mode === "none") {
    return sortChildren(options.parentId, children);
  }

  const buckets = GROUP_ORDER.reduce(
    (result, item) => {
      result[item.key] = [];
      return result;
    },
    {} as Record<GroupBucketKey, EditorTreeNode[]>,
  );

  for (const child of children) {
    buckets[bucketForChild(child)].push(child);
  }

  const groupedChildren: EditorTreeNode[] = [];
  for (const { key, suffix, title } of GROUP_ORDER) {
    const items = buckets[key];
    if (items.length === 0) {
      continue;
    }

    if (items.length === 1 && options.singleChildGroup !== true) {
      groupedChildren.push(items[0]);
      continue;
    }

    groupedChildren.push(createEditorGroup(options.parentId, suffix, title, items));
  }

  return sortChildren(options.parentId, groupedChildren);
}
