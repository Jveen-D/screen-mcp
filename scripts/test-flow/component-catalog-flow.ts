import assert from "node:assert/strict";
import { listComponents } from "../../src/core/registry.js";

export function runComponentCatalogFlowTests(): void {
  const components = listComponents();
  assert.ok(
    components.some((component) => component.componentName === "PieChart"),
    "list_components should include PieChart",
  );
  assert.ok(
    components.some((component) => component.componentName === "SingleImage"),
    "list_components should include SingleImage",
  );
  assert.ok(
    components.some((component) => component.componentName === "SingleText"),
    "list_components should include SingleText",
  );
  assert.ok(
    components.some((component) => component.componentName === "SvgDecoration"),
    "list_components should include SvgDecoration",
  );
  assert.ok(
    components.some((component) => component.componentName === "ThreeDPieChart"),
    "list_components should include ThreeDPieChart",
  );
  assert.ok(
    components.some((component) => component.componentName === "Indicator"),
    "list_components should include Indicator",
  );
  assert.ok(
    components.some((component) => component.componentName === "Gauge"),
    "list_components should include Gauge",
  );
  assert.ok(
    components.some((component) => component.componentName === "CircularProgress"),
    "list_components should include CircularProgress",
  );
  assert.ok(
    components.some((component) => component.componentName === "PercentageBar"),
    "list_components should include PercentageBar",
  );
  assert.ok(
    components.some((component) => component.componentName === "SingleValueChart"),
    "list_components should include SingleValueChart",
  );
  assert.ok(
    components.some((component) => component.componentName === "BaseTable"),
    "list_components should include BaseTable",
  );
  assert.ok(
    components.some((component) => component.componentName === "ScrollList"),
    "list_components should include ScrollList",
  );
  assert.ok(
    components.some((component) => component.componentName === "FunnelChart"),
    "list_components should include FunnelChart",
  );
  assert.ok(
    components.some((component) => component.componentName === "RadarChart"),
    "list_components should include RadarChart",
  );
  assert.ok(
    components.some((component) => component.componentName === "HeatMap"),
    "list_components should include HeatMap",
  );
  assert.ok(
    components.some((component) => component.componentName === "PictorialBarChart"),
    "list_components should include PictorialBarChart",
  );
  assert.ok(
    components.some((component) => component.componentName === "Select"),
    "list_components should include Select",
  );
  assert.ok(
    components.some((component) => component.componentName === "RadioGroup"),
    "list_components should include RadioGroup",
  );
  assert.ok(
    components.some((component) => component.componentName === "DatePicker"),
    "list_components should include DatePicker",
  );
  assert.ok(
    components.some((component) => component.componentName === "DateRangePicker"),
    "list_components should include DateRangePicker",
  );
  assert.ok(
    components.some((component) => component.componentName === "Weather"),
    "list_components should include Weather",
  );
  assert.ok(
    components.some((component) => component.componentName === "Date"),
    "list_components should include Date",
  );
  assert.ok(
    components.some((component) => component.componentName === "Video"),
    "list_components should include Video",
  );
  assert.ok(
    components.some((component) => component.componentName === "Audio"),
    "list_components should include Audio",
  );
  assert.ok(
    components.some((component) => component.componentName === "IFrame"),
    "list_components should include IFrame",
  );
  assert.ok(
    components.some((component) => component.componentName === "Swiper"),
    "list_components should include Swiper",
  );
  assert.ok(
    components.some((component) => component.componentName === "optionButton"),
    "list_components should include optionButton",
  );
  assert.ok(
    components.some((component) => component.componentName === "Earth3D"),
    "list_components should include Earth3D",
  );
  assert.ok(
    components.some((component) => component.componentName === "Earth3D-Pointer"),
    "list_components should include Earth3D-Pointer",
  );
  assert.ok(
    components.some((component) => component.componentName === "Earth3D-Satellite"),
    "list_components should include Earth3D-Satellite",
  );
  assert.ok(
    components.some((component) => component.componentName === "Earth3D-SpeedLight"),
    "list_components should include Earth3D-SpeedLight",
  );
  assert.ok(
    components.some((component) => component.componentName === "Earth3D-TextAround"),
    "list_components should include Earth3D-TextAround",
  );
  assert.ok(
    components.some((component) => component.componentName === "GaodeMap"),
    "list_components should include GaodeMap",
  );
  assert.ok(
    components.some((component) => component.componentName === "GaodeMap-FlyLine"),
    "list_components should include GaodeMap-FlyLine",
  );
  assert.ok(
    components.some((component) => component.componentName === "GaodeMap-HeatMap"),
    "list_components should include GaodeMap-HeatMap",
  );
  assert.ok(
    components.some((component) => component.componentName === "GaodeMap-InfoPannel"),
    "list_components should include GaodeMap-InfoPannel",
  );
  assert.ok(
    components.some((component) => component.componentName === "GaodeMap-Marker"),
    "list_components should include GaodeMap-Marker",
  );
  assert.ok(
    components.some((component) => component.componentName === "GaodeMap-Polygon"),
    "list_components should include GaodeMap-Polygon",
  );
}
