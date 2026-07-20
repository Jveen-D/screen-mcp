import assert from "node:assert/strict";
import { generateComponentsSchemas, sortComponentSchemas } from "../../src/core/schema.js";
import type { JsonObject } from "../../src/types/component.js";

export interface ComponentBatchFlowFixtures {
  aiProps: JsonObject;
  imageProps: JsonObject;
  textProps: JsonObject;
  svgProps: JsonObject;
}

export function runComponentBatchFlowTests({
  aiProps,
  imageProps,
  textProps,
  svgProps,
}: ComponentBatchFlowFixtures): void {
  const panelSchemas = generateComponentsSchemas([
    imageProps,
    textProps,
    {
      ...imageProps,
      logicalId: "overview_content_image_a7k2",
      name: "项目鸟瞰图",
      imageLayerRole: "content",
    },
    aiProps,
    svgProps,
  ]);
  assert.equal(panelSchemas.length, 5);
  assert.deepEqual(
    panelSchemas.map((item) => item.indexNum),
    [1, 2, 3, 4, 5],
  );
  assert.deepEqual(
    panelSchemas.map((item) => item.componentName),
    ["SingleText", "SingleImage", "PieChart", "SvgDecoration", "SingleImage"],
    "batch component generation should only place background images below content",
  );
  assert.equal(
    panelSchemas[1].props.imageLayerRole,
    "content",
    "batch component generation should preserve content images in normal content order",
  );
  assert.equal(
    sortComponentSchemas(panelSchemas).at(-1)?.props.imageLayerRole,
    undefined,
    "schema sorting should keep the legacy background image at the bottom",
  );
}
