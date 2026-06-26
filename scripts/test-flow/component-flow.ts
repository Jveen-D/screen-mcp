import type { JsonObject } from "../../src/types/component.js";
import { runBasicComponentFlowTests } from "./basic-component-flow.js";
import { runComponentBatchFlowTests } from "./component-batch-flow.js";
import { runComponentCatalogFlowTests } from "./component-catalog-flow.js";
import { runPieComponentFlowTests } from "./pie-component-flow.js";

export interface ComponentFlowFixtures {
  aiProps: JsonObject;
  inputFirstSeries: JsonObject;
  imageProps: JsonObject;
  textProps: JsonObject;
  svgProps: JsonObject;
}

export function runComponentFlowTests(): ComponentFlowFixtures {
  runComponentCatalogFlowTests();
  const pieFixtures = runPieComponentFlowTests();
  const basicFixtures = runBasicComponentFlowTests();

  runComponentBatchFlowTests({
    aiProps: pieFixtures.aiProps,
    imageProps: basicFixtures.imageProps,
    textProps: basicFixtures.textProps,
    svgProps: basicFixtures.svgProps,
  });

  return {
    aiProps: pieFixtures.aiProps,
    inputFirstSeries: pieFixtures.inputFirstSeries,
    imageProps: basicFixtures.imageProps,
    textProps: basicFixtures.textProps,
    svgProps: basicFixtures.svgProps,
  };
}
