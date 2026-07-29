import assert from "node:assert/strict";
import test from "node:test";
import { generateComponentsSchema } from "../../core/schema.js";
import type { JsonObject } from "../../types/component.js";
import { navMenuCapability } from "./capability.js";
import { navMenuDefaultProps } from "./defaultProps.js";
import { normalizeNavMenuProps } from "./normalize.js";

function writablePaths(items: JsonObject[]): string[] {
  return items.flatMap((item) => [String(item.path), ...writablePaths((item.children as JsonObject[]) ?? [])]);
}

test("NavMenu defaults provide a compact readable navigation hierarchy", () => {
  assert.deepEqual(
    {
      width: (navMenuDefaultProps.style as JsonObject).width,
      height: (navMenuDefaultProps.style as JsonObject).height,
      backgroundColor: (navMenuDefaultProps.style as JsonObject).backgroundColor,
      defaultSelectedId: navMenuDefaultProps.defaultSelectedId,
      indentSize: navMenuDefaultProps.indentSize,
      itemHeight: navMenuDefaultProps.itemHeight,
      itemGap: navMenuDefaultProps.itemGap,
      itemBorderRadius: navMenuDefaultProps.itemBorderRadius,
      textOverflow: navMenuDefaultProps.textOverflow,
      showTooltip: navMenuDefaultProps.showTooltip,
    },
    {
      width: 280,
      height: 420,
      backgroundColor: "rgba(9,18,32,0.92)",
      defaultSelectedId: "1",
      indentSize: 20,
      itemHeight: 40,
      itemGap: 4,
      itemBorderRadius: 4,
      textOverflow: "ellipsis",
      showTooltip: true,
    },
  );
  assert.equal((navMenuDefaultProps.menuDefaultStyle as JsonObject).fontSize, 14);
  assert.equal((navMenuDefaultProps.menuDefaultStyle as JsonObject).letterSpacing, 0);
  assert.equal((navMenuDefaultProps.menuSelectStyle as JsonObject).fontWeight, "bold");
});

test("NavMenu normalizer stabilizes ids and clamps the public layout contract", () => {
  const props = structuredClone(navMenuDefaultProps);
  props.menuData = {
    items: [
      { id: "same", name: "一级", children: [{ id: "same", name: "二级" }] },
      { id: "same", name: "另一项" },
    ],
  };
  props.defaultSelectedId = "missing";
  props.indentSize = -1;
  props.itemHeight = 999;
  props.itemGap = "6";
  props.itemBorderRadius = -2;
  props.textOverflow = "invalid";
  props.showTooltip = "yes";
  props.expandIconSize = 999;

  normalizeNavMenuProps(props);

  const menuData = props.menuData as JsonObject;
  const rows = menuData.originalData as JsonObject[];
  assert.deepEqual([rows[0].id, (rows[0].children as JsonObject[])[0].id, rows[1].id], ["same", "same_2", "same_3"]);
  assert.equal(props.defaultSelectedId, "same");
  assert.equal(props.indentSize, 0);
  assert.equal(props.itemHeight, 200);
  assert.equal(props.itemGap, 6);
  assert.equal(props.itemBorderRadius, 0);
  assert.equal(props.textOverflow, "ellipsis");
  assert.equal(props.showTooltip, true);
  assert.equal(props.expandIconSize, 200);
});

test("NavMenu capability exposes hierarchy, icon, selection, and overflow controls", () => {
  const paths = writablePaths(navMenuCapability.aiWritableProps as JsonObject[]);
  for (const path of [
    "defaultSelectedId",
    "isExpand",
    "indentSize",
    "itemHeight",
    "itemGap",
    "itemBorderRadius",
    "showIcon",
    "iconSize",
    "iconSpace",
    "expandIconSize",
    "expandIconColor",
    "textOverflow",
    "showTooltip",
  ]) {
    assert.ok(paths.includes(path), `missing capability path: ${path}`);
  }
});

test("NavMenu generation preserves explicit valid values in the final schema", () => {
  const schema = generateComponentsSchema({
    componentName: "NavMenu",
    logicalId: "nav_menu_contract",
    parentLogicalId: "menu_group",
    menuData: {
      items: [
        { id: "overview", name: "综合态势总览" },
        { id: "quality", name: "质量管理" },
      ],
    },
    defaultSelectedId: "quality",
    indentSize: 28,
    itemHeight: 48,
    itemGap: 8,
    itemBorderRadius: 6,
    textOverflow: "wrap",
    showTooltip: false,
  } as JsonObject);

  assert.deepEqual(
    {
      defaultSelectedId: schema.props.defaultSelectedId,
      indentSize: schema.props.indentSize,
      itemHeight: schema.props.itemHeight,
      itemGap: schema.props.itemGap,
      itemBorderRadius: schema.props.itemBorderRadius,
      textOverflow: schema.props.textOverflow,
      showTooltip: schema.props.showTooltip,
    },
    {
      defaultSelectedId: "quality",
      indentSize: 28,
      itemHeight: 48,
      itemGap: 8,
      itemBorderRadius: 6,
      textOverflow: "wrap",
      showTooltip: false,
    },
  );
});
