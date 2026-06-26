
import assert from "node:assert/strict";
import { generateModuleSchema, generateModuleTreeSchema } from "../../src/core/modules.js";
import type { JsonObject } from "../../src/types/component.js";
import { flattenEditorNodes, nodeProps } from "./helpers.js";

export interface FreeformModuleFlowFixtures {
  freeformModuleInput: JsonObject;
}

export function runFreeformModuleFlowTests(): FreeformModuleFlowFixtures {
  const freeformModuleInput: JsonObject = {
    moduleName: "FreeformModule",
    logicalId: "kpi_panel",
    parentLogicalId: "root",
    title: "核心指标",
    grouping: {
      mode: "semantic",
      singleChildGroup: true,
    },
    style: {
      position: "absolute",
      left: 600,
      top: 100,
      width: 360,
      height: 180,
    },
    slots: {
      children: [
        {
          componentName: "SingleText",
          logicalId: "kpi_title",
          name: "模块标题",
          textContent: "核心指标",
          style: {
            position: "absolute",
            left: 620,
            top: 118,
            width: 160,
            height: 22,
            fontSize: 22,
            lineHeight: 1,
          },
        },
        {
          componentName: "Indicator",
          logicalId: "revenue_indicator",
          name: "销售额",
          textValue: 128760,
          titleName: "销售额",
          suffix: true,
          suffixTitle: "元",
          titleStyle: {
            lineHeight: 1,
          },
          numberStyle: {
            lineHeight: 1,
          },
          style: {
            position: "absolute",
            left: 620,
            top: 150,
            width: 300,
            height: 92,
          },
        },
        {
          componentName: "SvgDecoration",
          logicalId: "kpi_border",
          props: {
            name: "指标面板边框",
            svgSource: "custom",
            svgContent:
              '<svg viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg"><path d="M1 24V1h80M359 156v23h-80" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
            style: {
              position: "absolute",
              left: 600,
              top: 100,
              width: 360,
              height: 180,
            },
          },
        },
        {
          componentName: "SingleImage",
          logicalId: "kpi_background",
          name: "指标背景",
          imageBase64: "data:image/png;base64,KPIBACKGROUND",
          opacity: 0.9,
          style: {
            position: "absolute",
            left: 600,
            top: 100,
            width: 360,
            height: 180,
          },
        },
      ],
    },
  };

  const freeformSchemas = generateModuleSchema(freeformModuleInput);
  assert.deepEqual(
    freeformSchemas.map((item) => item.componentName),
    ["SingleText", "Indicator", "SvgDecoration", "SingleImage"],
    "FreeformModule should compile explicit children and keep background last",
  );
  const freeformTree = generateModuleTreeSchema(freeformModuleInput);
  assert.equal(freeformTree.componentName, "__Group__");
  assert.equal(freeformTree.title, "核心指标");
  assert.equal((freeformTree.props.style as JsonObject).left, 600);
  assert.equal((freeformTree.props.style as JsonObject).top, 100);
  assert.equal((freeformTree.props.style as JsonObject).width, 360);
  assert.equal((freeformTree.props.style as JsonObject).height, 180);
  assert.deepEqual(
    freeformTree.children.map((item) => item.title),
    ["标题", "主内容", "装饰", "背景"],
    "FreeformModule should apply common semantic grouping",
  );
  assert.ok(
    freeformTree.children.every((item) => item.componentName === "__Group__"),
    "FreeformModule should group single semantic children when requested",
  );
  assert.equal(
    freeformTree.children.at(-1)?.title,
    "背景",
    "FreeformModule should keep the background group last",
  );
  assert.equal(
    freeformTree.children.find((item) => item.title === "主内容")?.isGroup,
    true,
    "FreeformModule should keep main content above decorations",
  );
  const freeformNodes = flattenEditorNodes(freeformTree as unknown as JsonObject);
  assert.ok(
    freeformNodes.some((item) => item.componentName === "Indicator"),
    "FreeformModule should preserve non-chart business components",
  );
  assert.ok(
    freeformNodes
      .filter((item) => item.componentName !== "__Group__")
      .every((item) => (nodeProps(item).parentLogicalId as string | undefined) === freeformTree.id),
    "FreeformModule child parentLogicalId should reference randomized module group id",
  );
  return { freeformModuleInput };
}
