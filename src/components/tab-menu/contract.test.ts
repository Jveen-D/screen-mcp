import assert from "node:assert/strict";
import test from "node:test";
import { generateComponentsSchema } from "../../core/schema.js";
import type { JsonObject } from "../../types/component.js";
import { tabMenuCapability } from "./capability.js";
import { tabMenuDefaultProps } from "./defaultProps.js";
import { normalizeTabMenuProps } from "./normalize.js";

function writablePaths(items: JsonObject[]): string[] {
  return items.flatMap((item) => [String(item.path), ...writablePaths((item.children as JsonObject[]) ?? [])]);
}

test("TabMenu defaults are compact and keep state geometry stable", () => {
  assert.deepEqual(tabMenuDefaultProps.style, {
    rotate: 0,
    top: 96,
    left: 320,
    width: 640,
    position: "absolute",
    opacity: 1,
    height: 48,
    zIndex: 10,
  });
  assert.equal(tabMenuDefaultProps.cardSpace, 8);
  assert.equal(tabMenuDefaultProps.itemAlign, "center");
  assert.equal(tabMenuDefaultProps.textOverflow, "ellipsis");

  const defaultStyle = tabMenuDefaultProps.menuDefaultStyle as JsonObject;
  const hoverStyle = tabMenuDefaultProps.menuHoverStyle as JsonObject;
  const selectStyle = tabMenuDefaultProps.menuSelectStyle as JsonObject;
  assert.deepEqual(
    [defaultStyle.fontSize, hoverStyle.fontSize, selectStyle.fontSize],
    [14, 14, 14],
  );
  assert.deepEqual(
    [defaultStyle.lineHeight, hoverStyle.lineHeight, selectStyle.lineHeight],
    [1.4, 1.4, 1.4],
  );

  const items = ((tabMenuDefaultProps.menuData as JsonObject).originalData as JsonObject[]);
  assert.deepEqual(items.map((item) => item.name), ["总览", "趋势", "分析", "明细"]);
  assert.ok(items.every((item) => item.icon === ""));
});

test("TabMenu normalizer clamps layout and style without reordering data", () => {
  const props = structuredClone(tabMenuDefaultProps);
  const originalData = [
    { id: "b", name: "后项", icon: "" },
    { id: "a", name: "前项", icon: "" },
  ];
  props.menuData = { items: originalData, selectTabId: "a" };
  props.rotate = 999;
  props.opacity = -1;
  props.cardSpace = 100;
  props.iconSize = 2;
  props.iconSpace = -1;
  props.itemAlign = "invalid";
  props.textOverflow = "invalid";
  (props.menuDefaultStyle as JsonObject).fontSize = 200;
  (props.menuDefaultStyle as JsonObject).lineHeight = 0;
  (props.menuDefaultStyle as JsonObject).borderRadius = 200;

  normalizeTabMenuProps(props);

  assert.equal(props.rotate, 360);
  assert.equal(props.opacity, 0);
  assert.equal(props.cardSpace, 64);
  assert.equal(props.iconSize, 8);
  assert.equal(props.iconSpace, 0);
  assert.equal(props.itemAlign, "center");
  assert.equal(props.textOverflow, "ellipsis");
  assert.equal((props.menuDefaultStyle as JsonObject).fontSize, 64);
  assert.equal((props.menuDefaultStyle as JsonObject).lineHeight, 0.8);
  assert.equal((props.menuDefaultStyle as JsonObject).borderRadius, 100);
  assert.deepEqual(
    ((props.menuData as JsonObject).originalData as JsonObject[]).map((item) => item.id),
    ["b", "a"],
  );
  assert.equal((props.menuData as JsonObject).selectTabId, "a");
});

test("TabMenu normalizer restores each state from its own defaults", () => {
  const props = structuredClone(tabMenuDefaultProps);
  props.menuDefaultStyle = null;
  props.menuHoverStyle = [];
  props.menuSelectStyle = "invalid";

  normalizeTabMenuProps(props);

  assert.deepEqual(props.menuDefaultStyle, tabMenuDefaultProps.menuDefaultStyle);
  assert.deepEqual(props.menuHoverStyle, tabMenuDefaultProps.menuHoverStyle);
  assert.deepEqual(props.menuSelectStyle, tabMenuDefaultProps.menuSelectStyle);
});

test("TabMenu capability exposes stable layout and state-style fields", () => {
  const writableProps = tabMenuCapability.aiWritableProps as JsonObject[];
  const paths = writablePaths(writableProps);

  for (const path of [
    "itemAlign",
    "textOverflow",
    "menuDefaultStyle.fontSize",
    "menuHoverStyle.backgroundFillType",
    "menuSelectStyle.borderRadius",
  ]) {
    assert.ok(paths.includes(path), `missing capability path: ${path}`);
  }

  assert.equal(writableProps.find((item) => item.path === "rotate")?.defaultValue, 0);
  const defaultStyle = writableProps.find((item) => item.path === "menuDefaultStyle");
  const backgroundImage = (defaultStyle?.children as JsonObject[]).find(
    (item) => item.path === "menuDefaultStyle.backgroundImage",
  );
  assert.equal(backgroundImage?.defaultValue, "");
});

test("TabMenu generation keeps the normalized contract in the final schema", () => {
  const schema = generateComponentsSchema({
    componentName: "TabMenu",
    logicalId: "tab_menu_contract_test",
    parentLogicalId: "navigation_group",
    menuData: {
      items: [
        { id: "overview", name: "总览" },
        { id: "details", name: "明细" },
      ],
      selectTabId: "details",
    },
    style: { position: "absolute", left: 0, top: 0, width: 480, height: 48 },
    itemAlign: "end",
    textOverflow: "wrap",
    cardSpace: 12,
    menuSelectStyle: { fontWeight: "bold", borderRadius: 6 },
  } as JsonObject);

  assert.equal(schema.props.itemAlign, "end");
  assert.equal(schema.props.textOverflow, "wrap");
  assert.equal(schema.props.cardSpace, 12);
  assert.equal((schema.props.menuSelectStyle as JsonObject).borderRadius, 6);
  assert.equal((schema.props.menuData as JsonObject).selectTabId, "details");
});
