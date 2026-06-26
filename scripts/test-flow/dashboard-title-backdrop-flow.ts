import assert from "node:assert/strict";
import { generateDashboardSchema } from "../../src/core/dashboard.js";
import type { JsonObject } from "../../src/types/component.js";
import { nodeProps } from "./helpers.js";

export function runDashboardTitleBackdropTests(): void {
  const titleBackdropTree = generateDashboardSchema({
    logicalId: "title_backdrop_dashboard",
    title: "标题承托大屏",
    canvas: {
      width: 800,
      height: 240,
    },
    grouping: {
      mode: "semantic",
      singleChildGroup: true,
    },
    groups: [
      {
        logicalId: "header_group",
        title: "顶部标题区",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 800,
          height: 96,
        },
        components: [
          {
            componentName: "SvgDecoration",
            logicalId: "header_title_backdrop",
            name: "标题背景框",
            svgSource: "custom",
            svgContent:
              '<svg viewBox="0 0 800 96" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="798" height="94" fill="rgba(0,0,0,.24)" stroke="currentColor"/></svg>',
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: 800,
              height: 96,
              zIndex: 503,
            },
          },
          {
            componentName: "SvgDecoration",
            logicalId: "header_panel_frame",
            name: "面板边框",
            svgSource: "custom",
            svgContent:
              '<svg viewBox="0 0 800 96" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="796" height="92" fill="rgba(0,0,0,.12)" stroke="currentColor"/></svg>',
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: 800,
              height: 96,
              zIndex: 502,
            },
          },
          {
            componentName: "SvgDecoration",
            logicalId: "filled_panel_frame",
            name: "重点商机面板边框",
            svgSource: "custom",
            svgContent:
              '<svg viewBox="0 0 800 96" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="796" height="92" fill="rgba(8,33,58,.78)" stroke="currentColor"/></svg>',
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: 800,
              height: 96,
              zIndex: 504,
            },
          },
          {
            componentName: "SingleText",
            logicalId: "header_title_text",
            name: "主标题",
            textContent: "销售经营态势大屏",
            style: {
              position: "absolute",
              left: 180,
              top: 24,
              width: 440,
              height: 36,
              fontSize: 36,
              lineHeight: 1,
              zIndex: 501,
            },
          },
        ],
      },
    ],
  } as JsonObject);
  const titleBackdropHeader = titleBackdropTree.children.find(
    (item) => item.title === "顶部标题区",
  ) as JsonObject | undefined;
  assert.ok(titleBackdropHeader, "DashboardSpec should compile the explicit header group");
  const titleBackdropHeaderChildren = Array.isArray(titleBackdropHeader.children)
    ? titleBackdropHeader.children as JsonObject[]
    : [];
  assert.deepEqual(
    titleBackdropHeaderChildren.map((item) => item.title),
    ["标题", "背景"],
    "Title backdrops should be grouped below title text instead of covering it",
  );
  assert.equal(
    titleBackdropHeaderChildren.at(-1)?.title,
    "背景",
    "Title backdrop group should stay on the bottom layer",
  );
  const titleBackdropBackgroundGroup = titleBackdropHeaderChildren.at(-1) as JsonObject;
  const titleBackdropBackgroundChildren = Array.isArray(titleBackdropBackgroundGroup.children)
    ? titleBackdropBackgroundGroup.children as JsonObject[]
    : [];
  assert.deepEqual(
    titleBackdropBackgroundChildren.map((item) => nodeProps(item).name),
    ["标题背景框", "面板边框", "重点商机面板边框"],
    "Title backdrop and filled panel frame decorations should be treated as background carriers",
  );
  assert.ok(
    titleBackdropBackgroundChildren.every((item) => {
      const style = nodeProps(item).style as JsonObject;
      return style.zIndex === 0;
    }),
    "Semantic background carriers should not keep high zIndex values that can cover text or charts",
  );
}
