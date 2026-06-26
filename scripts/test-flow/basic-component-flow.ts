import assert from "node:assert/strict";
import { svgDecorationDefaultProps } from "../../src/components/svg-decoration/defaultProps.js";
import { getComponentCapability } from "../../src/core/registry.js";
import { generateComponentsSchema } from "../../src/core/schema.js";
import type { JsonObject } from "../../src/types/component.js";
import { runComponentNormalizerTests } from "./component-normalizers.js";

export interface BasicComponentFlowFixtures {
  imageProps: JsonObject;
  textProps: JsonObject;
  svgProps: JsonObject;
}

export function runBasicComponentFlowTests(): BasicComponentFlowFixtures {
  const imageCapability = getComponentCapability("SingleImage");
  assert.ok(Array.isArray(imageCapability.aiWritableProps));
  assert.equal(imageCapability.componentType, "base");
  assert.ok(imageCapability.baseConfig, "base component capability has baseConfig");
  const imageWritableProps = imageCapability.aiWritableProps as JsonObject[];
  const imageUseModeCapability = imageWritableProps.find(
    (item) => item.path === "imageUseMode",
  ) as JsonObject | undefined;
  assert.deepEqual(
    imageUseModeCapability?.values,
    ["upload", "base64"],
    "imageUseMode should support upload and base64",
  );
  assert.ok(
    imageWritableProps.some((item) => item.path === "style.backgroundColor"),
    "base component background color should use style.backgroundColor",
  );
  assert.equal(
    imageWritableProps.some((item) => item.path === "option.backgroundColor"),
    false,
    "base component capability should not expose option.backgroundColor as base background",
  );
  const imageSchema = generateComponentsSchema({
    componentName: "SingleImage",
    logicalId: "panel_bg_image",
    parentLogicalId: "panel_group",
    name: "分类面板背景",
    style: {
      position: "absolute",
      left: 48,
      top: 96,
      width: 520,
      height: 360,
      backgroundColor: "rgba(0,0,0,0)",
      borderRadius: 0,
    },
    imageBase64: "data:image/png;base64,AAAA",
    targetUrl: "https://example.com",
    openBrowser: true,
  });
  assert.equal(imageSchema.componentName, "SingleImage");
  assert.equal(imageSchema.props.imageBase64, "data:image/png;base64,AAAA");
  assert.equal(imageSchema.props.imageUseMode, "base64");
  assert.deepEqual(imageSchema.props.entryAnimiation, { isShow: false, type: "" });
  assert.equal(imageSchema.props.targetUrl, "");
  assert.equal(imageSchema.props.openBrowser, false);

  const textCapability = getComponentCapability("SingleText");
  assert.ok(Array.isArray(textCapability.aiForbiddenProps));
  const textSchema = generateComponentsSchema({
    componentName: "SingleText",
    logicalId: "category_panel_title",
    parentLogicalId: "panel_group",
    name: "分类面板标题",
    textContent: "分类占比",
    datasource: {
      sourceType: "api",
    },
    style: {
      position: "absolute",
      left: 80,
      top: 112,
      width: 260,
      height: 36,
      fontSize: 22,
      lineHeight: 24,
      color: "#DFF8FF",
      textAlign: "left",
      backgroundColor: "rgba(0,0,0,0)",
      fontWeight: "bold",
    },
  });
  const textDatasource = textSchema.props.datasource as JsonObject;
  const textConstantData = textDatasource.constantData as JsonObject[];
  assert.equal(textSchema.componentName, "SingleText");
  assert.equal(textSchema.props.textContent, "分类占比");
  assert.deepEqual(textSchema.props.entryAnimiation, { isShow: false, type: "" });
  assert.equal(textDatasource.sourceType, "externalConstant");
  assert.equal(textConstantData[0]?.text, "分类占比");
  const textStyle = textSchema.props.style as JsonObject;
  assert.equal(textStyle.lineHeight, 1.09);

  runComponentNormalizerTests();

  const defaultLineBoxTextSchema = generateComponentsSchema({
    componentName: "SingleText",
    logicalId: "single_line_label",
    parentLogicalId: "panel_group",
    textContent: "单行标签",
    style: {
      position: "absolute",
      left: 80,
      top: 150,
      width: 120,
      fontSize: 20,
      backgroundColor: "rgba(0,0,0,0)",
    },
  });
  const defaultLineBoxTextStyle = defaultLineBoxTextSchema.props.style as JsonObject;
  assert.equal(defaultLineBoxTextStyle.height, 20);
  assert.equal(defaultLineBoxTextStyle.lineHeight, 1);

  const themedTextSchema = generateComponentsSchema({
    componentName: "SingleText",
    logicalId: "themed_text",
    parentLogicalId: "panel_group",
    textContent: "主题输入不会进入输出",
    theme: {
      name: "test-theme",
      colors: {
        background: "#000000",
      },
    },
    style: {
      position: "absolute",
      left: 80,
      top: 190,
      width: 220,
      height: 18,
      fontSize: 18,
    },
  });
  assert.equal(
    themedTextSchema.props.theme,
    undefined,
    "compiler-only theme should not be emitted in final component props",
  );

  const svgCapability = getComponentCapability("SvgDecoration");
  assert.ok(Array.isArray(svgCapability.aiWritableProps));
  const svgDefaultProps = svgDecorationDefaultProps as JsonObject;
  assert.equal(svgDefaultProps.svgSource, "custom");
  assert.equal(svgDefaultProps.svgPreset, "");
  assert.equal(svgDefaultProps.svgContent, "");
  const safeSvg =
    '<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><path d="M0 50 L100 0" stroke="#00E5FF" fill="none"/></svg>';
  const svgSchema = generateComponentsSchema({
    componentName: "SvgDecoration",
    logicalId: "panel_corner_svg",
    parentLogicalId: "panel_group",
    name: "右上角科技装饰",
    style: {
      width: 120,
      height: 64,
      position: "absolute",
      left: 448,
      top: 96,
      backgroundColor: "rgba(0,0,0,0)",
    },
    svgSource: "custom",
    svgContent: safeSvg,
    primaryColor: "#00E5FF",
    glow: {
      isActive: true,
      color: "rgba(0,229,255,0.55)",
      blur: 8,
    },
  });
  assert.equal(svgSchema.componentName, "SvgDecoration");
  assert.equal(svgSchema.props.svgSource, "custom");
  assert.equal(svgSchema.props.svgContent, safeSvg);
  assert.deepEqual(svgSchema.props.entryAnimiation, { isShow: false, type: "" });

  const unsafeSvgSchema = generateComponentsSchema({
    componentName: "SvgDecoration",
    logicalId: "unsafe_svg",
    parentLogicalId: "panel_group",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    },
    svgSource: "custom",
    svgContent: "<svg><script>alert(1)</script></svg>",
  });
  assert.equal(unsafeSvgSchema.props.svgSource, "custom");
  assert.equal(unsafeSvgSchema.props.svgPreset, "");
  assert.equal(unsafeSvgSchema.props.svgContent, "");

  const svgChartSchema = generateComponentsSchema({
    componentName: "SvgDecoration",
    logicalId: "svg_chart_misuse",
    parentLogicalId: "panel_group",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 320,
      height: 240,
    },
    svgSource: "custom",
    svgContent:
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 A40 40 0 0 1 90 50" fill="none"/><path d="M90 50 A40 40 0 0 1 50 90" fill="none"/></svg>',
  });
  assert.equal(svgChartSchema.props.svgSource, "custom");
  assert.equal(svgChartSchema.props.svgPreset, "");
  assert.equal(svgChartSchema.props.svgContent, "");

  const svgTextSchema = generateComponentsSchema({
    componentName: "SvgDecoration",
    logicalId: "svg_text_misuse",
    parentLogicalId: "panel_group",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 320,
      height: 120,
    },
    svgSource: "custom",
    svgContent:
      '<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg"><text x="20" y="60">指标总量 386</text></svg>',
  });
  assert.equal(svgTextSchema.props.svgSource, "custom");
  assert.equal(svgTextSchema.props.svgPreset, "");
  assert.equal(svgTextSchema.props.svgContent, "");

  const emptySvgSchema = generateComponentsSchema({
    componentName: "SvgDecoration",
    logicalId: "empty_svg",
    parentLogicalId: "panel_group",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 120,
      height: 64,
    },
    svgSource: "custom",
    svgContent: "",
  });
  assert.equal(emptySvgSchema.props.svgSource, "custom");
  assert.equal(emptySvgSchema.props.svgPreset, "");
  assert.equal(emptySvgSchema.props.svgContent, "");

  const explicitPresetSvgSchema = generateComponentsSchema({
    componentName: "SvgDecoration",
    logicalId: "explicit_preset_svg",
    parentLogicalId: "panel_group",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 120,
      height: 64,
    },
    svgSource: "preset",
    svgPreset: "icon-Frame3",
  });
  assert.equal(explicitPresetSvgSchema.props.svgSource, "preset");
  assert.equal(explicitPresetSvgSchema.props.svgPreset, "icon-Frame3");
  return {
    imageProps: imageSchema.props,
    textProps: textSchema.props,
    svgProps: svgSchema.props,
  };
}
