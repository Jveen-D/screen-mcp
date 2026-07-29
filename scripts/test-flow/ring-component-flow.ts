import assert from "node:assert/strict";
import { getComponentCapability } from "../../src/core/registry.js";
import { generateComponentsSchema } from "../../src/core/schema.js";
import type { JsonObject } from "../../src/types/component.js";

export function runRingComponentFlowTests(): void {
  const capability = getComponentCapability("RingChart");
  const writableProps = capability.aiWritableProps as JsonObject[];
  assert.ok(writableProps.some((item) => item.path === "option.legend"));
  assert.ok(writableProps.some((item) => item.path === "option.title"));
  assert.ok(writableProps.some((item) => item.path === "rotatingAnimation"));

  const schema = generateComponentsSchema({
    componentName: "RingChart",
    logicalId: "ring_contract",
    parentLogicalId: "panel_group",
    chartData: {
      indicator: [
        {
          fieldDataConfig: {
            chartDisplayName: "数量",
          },
        },
      ],
      constant: {
        data: [
          { name: "类别A", type: "系列", value: 12 },
          { name: "类别B", type: "系列", value: 8 },
        ],
      },
    },
    option: {
      title: { show: true, text: "总计", left: "42%", top: 60 },
      legend: {
        left: "center",
        top: 8,
        type: "invalid",
        itemGap: 999,
        textStyle: {
          width: 999,
          overflow: "invalid",
        },
      },
      series: [
        {
          startAngle: 999,
          percentPrecision: 99,
          label: {
            content: "invalid",
            formatter: "{b}\n{d}%",
          },
          labelLine: {
            length: -1,
            length2: 999,
          },
        },
      ],
    },
    decorator: {
      innerRing: {
        isActive: true,
        innerRadius: 0.9,
        outerRadius: 0.2,
        animateDirection: "invalid",
      },
    },
    rotatingAnimation: {
      isActive: true,
      height: 99,
      duration: 0,
      selectMode: "invalid",
    },
  } as JsonObject);

  const props = schema.props as JsonObject;
  const option = props.option as JsonObject;
  const legend = option.legend as JsonObject;
  const series = (option.series as JsonObject[])[0] as JsonObject;
  const label = series.label as JsonObject;
  const labelLine = series.labelLine as JsonObject;
  const decorator = props.decorator as JsonObject;
  const innerRing = decorator.innerRing as JsonObject;
  const rotatingAnimation = props.rotatingAnimation as JsonObject;

  assert.equal(option.backgroundColor, "transparent");
  const title = option.title as JsonObject;
  assert.equal(title.show, true);
  assert.equal(title.text, "总计");
  assert.equal(title.left, "42%");
  assert.equal(title.top, 60);
  assert.equal(innerRing.isActive, true);
  assert.equal(legend.top, 8);
  assert.equal(legend.type, "scroll");
  assert.equal(legend.itemGap, 100);
  assert.equal((legend.textStyle as JsonObject).width, 500);
  assert.equal((legend.textStyle as JsonObject).overflow, "truncate");
  assert.deepEqual(series.radius, ["38%", "66%"]);
  assert.equal(series.startAngle, 360);
  assert.equal(series.percentPrecision, 10);
  assert.equal(label.content, "namePercent");
  assert.equal(label.formatter, "{b}\\n{d}%");
  assert.equal(labelLine.length, 0);
  assert.equal(labelLine.length2, 500);
  assert.equal(innerRing.innerRadius, 0.19);
  assert.equal(innerRing.animateDirection, "clockwise");
  assert.equal(rotatingAnimation.isActive, true);
  assert.equal(rotatingAnimation.height, 50);
  assert.equal(rotatingAnimation.duration, 0.5);
  assert.equal(rotatingAnimation.selectMode, "none");
}
