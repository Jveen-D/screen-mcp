import assert from "node:assert/strict";
import { generateComponentsSchemas } from "../../src/core/schema.js";
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
    aiProps,
    svgProps,
  ]);
  assert.equal(panelSchemas.length, 4);
  assert.deepEqual(
    panelSchemas.map((item) => item.indexNum),
    [1, 2, 3, 4],
  );
  assert.deepEqual(
    panelSchemas.map((item) => item.componentName),
    ["SingleText", "PieChart", "SvgDecoration", "SingleImage"],
    "batch component generation should place images below text, charts, and icons",
  );
}
