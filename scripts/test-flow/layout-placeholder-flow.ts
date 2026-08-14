import assert from "node:assert/strict";
import { generateModuleSchema, generateModuleTreeSchema } from "../../src/core/modules.js";
import type { JsonObject } from "../../src/types/component.js";
import { assertRandomizedId, assertUniqueIds, nodeProps } from "./helpers.js";

export interface LayoutPlaceholderFlowFixtures {
  layoutPlaceholderInput: JsonObject;
}

export function runLayoutPlaceholderFlowTests(): LayoutPlaceholderFlowFixtures {
  const layoutPlaceholderInput: JsonObject = {
    moduleName: "LayoutPlaceholder",
    logicalId: "placeholder_project_overview",
    parentLogicalId: "current_page",
    title: "项目概况",
    presentation: "指标卡",
    contentSummary: "在建项目数、完成率和投资进度",
    theme: {
      primaryColor: "#3A84FF",
      textColor: "#DFF8FF",
    },
    style: {
      position: "absolute",
      left: 48,
      top: 120,
      width: 560,
      height: 320,
    },
    slots: {},
  };

  const schemas = generateModuleSchema(layoutPlaceholderInput);
  assert.deepEqual(
    schemas.map((item) => item.componentName),
    ["SingleText", "SingleText", "SvgDecoration"],
    "LayoutPlaceholder should return title and description above its border",
  );
  assert.equal(schemas.length, 3, "LayoutPlaceholder should create exactly three nodes");
  assertUniqueIds(
    schemas.map((item) => item.businessElementId),
    "LayoutPlaceholder node IDs should be unique",
  );
  assert.ok(
    schemas.every((item) => item.parentBusinessElementId === "current_page"),
    "flat LayoutPlaceholder nodes should target the caller parent",
  );
  assertRandomizedId(
    schemas[0]?.businessElementId ?? "",
    "placeholder_project_overview",
    "LayoutPlaceholder title ID",
  );

  const titleProps = schemas[0]?.props;
  const descriptionProps = schemas[1]?.props;
  const borderProps = schemas[2]?.props;
  assert.equal(titleProps?.textContent, "项目概况");
  assert.equal(descriptionProps?.textContent, "指标卡 · 在建项目数、完成率和投资进度");
  assert.equal((titleProps?.style as JsonObject).left, 64);
  assert.equal((titleProps?.style as JsonObject).top, 136);
  assert.equal((descriptionProps?.style as JsonObject).top, 172);
  assert.equal(borderProps?.svgSource, "custom");
  assert.match(borderProps?.svgContent as string, /<rect\b/u);
  assert.equal(borderProps?.primaryColor, "#3A84FF");
  assert.equal(borderProps?.layerRole, "decoration");

  const tree = generateModuleTreeSchema(layoutPlaceholderInput);
  assert.equal(tree.componentName, "__Group__");
  assert.equal(tree.title, "布局占位-项目概况");
  assert.deepEqual(
    tree.children.map((item) => item.componentName),
    ["SingleText", "SingleText", "SvgDecoration"],
    "LayoutPlaceholder tree should preserve visible-content layering",
  );
  assert.ok(
    tree.children.every(
      (item) => (nodeProps(item as unknown as JsonObject).parentLogicalId as string) === tree.id,
    ),
    "LayoutPlaceholder tree children should reference their generated group",
  );

  assert.throws(
    () =>
      generateModuleSchema({
        ...layoutPlaceholderInput,
        title: "面板1",
      }),
    /real planned content/u,
    "LayoutPlaceholder should reject generic block titles",
  );
  assert.throws(
    () =>
      generateModuleSchema({
        ...layoutPlaceholderInput,
        slots: { title: "手写节点" },
      }),
    /slots must be an empty object/u,
    "LayoutPlaceholder should keep its component composition MCP-owned",
  );

  return { layoutPlaceholderInput };
}
