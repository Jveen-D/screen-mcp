import { runControlAndMediaNormalizerTests } from "./normalizer-controls-media-flow.js";
import { runDataDisplayNormalizerTests } from "./normalizer-data-displays-flow.js";
import { runIndicatorNormalizerTests } from "./normalizer-indicator-flow.js";
import { runOptionButtonNormalizerTests } from "./normalizer-option-button-flow.js";
import { runValueWidgetNormalizerTests } from "./normalizer-value-widgets-flow.js";

export function runComponentNormalizerTests(): void {
  runIndicatorNormalizerTests();
  runOptionButtonNormalizerTests();
  runValueWidgetNormalizerTests();
  runDataDisplayNormalizerTests();
  runControlAndMediaNormalizerTests();
}
