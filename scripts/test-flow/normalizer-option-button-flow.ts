import assert from "node:assert/strict";
import { getComponentCapability } from "../../src/core/registry.js";
import { generateComponentsSchema } from "../../src/core/schema.js";
import type { JsonObject } from "../../src/types/component.js";
import { asChartObject } from "./helpers.js";

export function runOptionButtonNormalizerTests(): void {
  const capability = getComponentCapability("optionButton");
  const writablePaths = (capability.aiWritableProps as JsonObject[]).map((item) => item.path);
  for (const path of ["selectMode", "disabled", "iconPosition", "padding", "textOverflow", "btnDisabledStyle"]) {
    assert.ok(writablePaths.includes(path), `optionButton capability should expose ${path}`);
  }

  const defaultSchema = generateComponentsSchema({
    componentName: "optionButton",
    logicalId: "option_button_default_test",
    parentLogicalId: "toolbar_group",
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 144,
      height: 44,
    },
  });
  assert.equal(defaultSchema.props.btnTextAlign, "center");
  assert.equal(defaultSchema.props.selectMode, "momentary");
  assert.equal(defaultSchema.props.disabled, false);
  assert.equal(defaultSchema.props.iconPosition, "left");
  assert.equal(defaultSchema.props.iconSize, 18);
  assert.equal(defaultSchema.props.iconSpace, 8);
  assert.equal(defaultSchema.props.textOverflow, "ellipsis");
  assert.deepEqual(defaultSchema.props.padding, { top: 8, right: 16, bottom: 8, left: 16 });
  assert.equal(asChartObject(defaultSchema.props.btnDefaultStyle).fontSize, 14);
  assert.equal(asChartObject(defaultSchema.props.btnDisabledStyle).borderRadius, 4);

  const configuredSchema = generateComponentsSchema({
    componentName: "optionButton",
    logicalId: "option_button_configured_test",
    parentLogicalId: "toolbar_group",
    btnText: "切换筛选状态",
    selectMode: "toggle",
    disabled: true,
    iconPosition: "right",
    iconSize: 24,
    iconSpace: 12,
    textOverflow: "wrap",
    padding: { top: 6, right: 12, bottom: 6, left: 12 },
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 180,
      height: 52,
    },
  });
  assert.equal(configuredSchema.props.selectMode, "toggle");
  assert.equal(configuredSchema.props.disabled, true);
  assert.equal(configuredSchema.props.iconPosition, "right");
  assert.equal(configuredSchema.props.textOverflow, "wrap");
  assert.deepEqual(configuredSchema.props.padding, { top: 6, right: 12, bottom: 6, left: 12 });

  const invalidSchema = generateComponentsSchema({
    componentName: "optionButton",
    logicalId: "option_button_invalid_test",
    parentLogicalId: "toolbar_group",
    btnTextAlign: "around",
    selectMode: "radio",
    iconPosition: "center",
    iconSize: 200,
    iconSpace: -4,
    rotate: 999,
    opacity: -1,
    textOverflow: "scroll",
    padding: { top: -1, right: 999, bottom: 4, left: 5 },
    btnDefaultStyle: {
      fontSize: 200,
      borderWidth: -2,
      borderRadius: 999,
      lineHeight: 8,
    },
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 144,
      height: 44,
    },
  });
  assert.equal(invalidSchema.props.btnTextAlign, "center");
  assert.equal(invalidSchema.props.selectMode, "momentary");
  assert.equal(invalidSchema.props.iconPosition, "left");
  assert.equal(invalidSchema.props.iconSize, 64);
  assert.equal(invalidSchema.props.iconSpace, 0);
  assert.equal(invalidSchema.props.rotate, 360);
  assert.equal(invalidSchema.props.opacity, 0);
  assert.equal(invalidSchema.props.textOverflow, "ellipsis");
  assert.deepEqual(invalidSchema.props.padding, { top: 0, right: 64, bottom: 4, left: 5 });
  const invalidDefaultStyle = asChartObject(invalidSchema.props.btnDefaultStyle);
  assert.equal(invalidDefaultStyle.fontSize, 96);
  assert.equal(invalidDefaultStyle.borderWidth, 0);
  assert.equal(invalidDefaultStyle.borderRadius, 100);
  assert.equal(invalidDefaultStyle.lineHeight, 4);
}
