import assert from "node:assert/strict";
import type { JsonObject } from "../../src/types/component.js";
import { readToolJson } from "./helpers.js";
import type { McpToolContext } from "./mcp-tool-context.js";

export async function runMcpDiagnosticsTests({ client }: McpToolContext): Promise<void> {
  const diagnosticsResult = await client.callTool({
    name: "get_server_diagnostics",
    arguments: {},
  });
  assert.equal(diagnosticsResult.isError, undefined);
  const diagnostics = readToolJson(diagnosticsResult);
  assert.equal(diagnostics.serverName, "screen-component-mcp");
  assert.equal(diagnostics.serverVersion, "0.1.0");
  assert.equal(
    diagnostics.rulesVersion,
    "2026-07-12.03-chartpanel-slot-contract",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("chartpanel-flat-slot-props-compatibility"),
    "diagnostics should expose ChartPanel flat slot props compatibility fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("complete-schema-response-contract"),
    "diagnostics should expose active rules fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("pie-legend-offset"),
    "diagnostics should expose pie legend offset rule fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("pie-center-radius-layout"),
    "diagnostics should expose pie center/radius layout rule fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("pie-legend-wrap-forecast"),
    "diagnostics should expose pie legend wrap forecast rule fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("side-summary-svg-row-rules"),
    "diagnostics should expose side summary svg row-rule fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("single-line-legend-pie-scale"),
    "diagnostics should expose single-line legend pie scale fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("bottom-conclusion-side-card-spacing"),
    "diagnostics should expose bottom conclusion side-card spacing fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("summary-sticker-conclusion-gap"),
    "diagnostics should expose summary sticker conclusion gap fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("semantic-side-summary"),
    "diagnostics should expose semantic side summary fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("side-card-connector-anchor"),
    "diagnostics should expose side-card connector anchor fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("side-summary-label-dedupe"),
    "diagnostics should expose side summary label dedupe fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("bottom-conclusion-muted-weight"),
    "diagnostics should expose bottom conclusion muted weight fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("light-structure-restore"),
    "diagnostics should expose lightweight structure restore fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("side-summary-color-anchors"),
    "diagnostics should expose side summary color anchor fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("no-svg-preset-fallback"),
    "diagnostics should expose no SVG preset fallback fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("single-text-line-box"),
    "diagnostics should expose single text line-box fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("pie-main-area-alignment"),
    "diagnostics should expose pie main-area alignment fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("visible-pie-labels"),
    "diagnostics should expose visible pie labels fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("single-line-side-summary-height"),
    "diagnostics should expose single-line side summary height fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("structured-side-summary-texts"),
    "diagnostics should expose structured side summary texts fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("center-total-above-pie"),
    "diagnostics should expose center total above pie fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("bottom-conclusion-single-line-box"),
    "diagnostics should expose bottom conclusion single-line box fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("larger-main-chart-safe-area"),
    "diagnostics should expose larger main chart safe area fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("multi-panel-decoration-diversity"),
    "diagnostics should expose multi-panel decoration diversity fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("center-summary-text-spacing"),
    "diagnostics should expose center summary text spacing fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("component-id-max-50-randomized"),
    "diagnostics should expose randomized component id fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("freeform-module-explicit-children"),
    "diagnostics should expose FreeformModule fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("common-semantic-module-grouping"),
    "diagnostics should expose common semantic grouping fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-grouping-inheritance"),
    "diagnostics should expose DashboardSpec grouping inheritance fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-group-style-required"),
    "diagnostics should expose DashboardSpec group style requirement fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("no-empty-svg-decoration"),
    "diagnostics should expose empty SVG decoration rejection fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-root-background-component"),
    "diagnostics should expose root background carrier fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("module-background-carrier-fallback"),
    "diagnostics should expose module background carrier fallback fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("svg-background-grouping"),
    "diagnostics should expose SVG background grouping fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("compiler-theme-stripped"),
    "diagnostics should expose compiler-only theme stripping fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("module-group-style-props"),
    "diagnostics should expose module group style fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-placeholder-text-rejected"),
    "diagnostics should expose placeholder text rejection fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-chart-data-required"),
    "diagnostics should expose dashboard chart data requirement fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("chartpanel-auxiliary-text-required"),
    "diagnostics should expose ChartPanel auxiliary text requirement fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("direct-chart-demo-data-rejected"),
    "diagnostics should expose direct chart demo data rejection fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("module-chartpanel-auxiliary-text-required"),
    "diagnostics should expose direct module ChartPanel auxiliary text requirement fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("ringchart-dense-legend-label-layout"),
    "diagnostics should expose dense RingChart legend and label layout fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("filled-panel-frame-background"),
    "diagnostics should expose filled panel frame background grouping fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("component-capability-neutral-examples"),
    "diagnostics should expose component capability cleanup fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("pie-legend-center-overlap-guard"),
    "diagnostics should expose pie legend center-overlap guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("single-text-transparent-background"),
    "diagnostics should expose single text transparent background fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("base-table-line-height-guard"),
    "diagnostics should expose base table line-height guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("ringchart-side-legend-radius-balance"),
    "diagnostics should expose ring chart side-legend radius balance fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-local-coordinate-guard"),
    "diagnostics should expose DashboardSpec local coordinate guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("percentage-bar-icon-hidden-default"),
    "diagnostics should expose PercentageBar hidden icon default fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("overlong-hex-color-trim"),
    "diagnostics should expose overlong hex color trim fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("scroll-list-opaque-header-background"),
    "diagnostics should expose ScrollList opaque header background fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("chartpanel-full-module-main-chart"),
    "diagnostics should expose ChartPanel full-module main chart fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("chartpanel-grid-safe-area-layout"),
    "diagnostics should expose ChartPanel grid safe area layout fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("chartpanel-pie-center-radius-safe-area"),
    "diagnostics should expose ChartPanel pie center/radius safe area fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-bim-reserved-area"),
    "diagnostics should expose BIM reserved area fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-bim-skip-root-background"),
    "diagnostics should expose BIM root background skip fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-reserved-area-overlap-warning"),
    "diagnostics should expose reserved area overlap warning fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("bottom-auxiliary-chart-grid-guard"),
    "diagnostics should expose bottom auxiliary chart grid guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("ringchart-bottom-legend-radius-guard"),
    "diagnostics should expose RingChart bottom legend radius guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("explicit-group-title-text-bucket"),
    "diagnostics should expose explicit group title text bucket fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("circular-chart-center-text-alignment"),
    "diagnostics should expose circular chart center text alignment fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-single-text-fit-guard"),
    "diagnostics should expose DashboardSpec single text fit guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("overlapping-unit-label-guard"),
    "diagnostics should expose overlapping unit label guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("cartesian-axis-unit-name-guard"),
    "diagnostics should expose cartesian axis unit name guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("funnel-module-balance-guard"),
    "diagnostics should expose funnel module balance guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("cartesian-series-name-data-type-guard"),
    "diagnostics should expose cartesian series name data type guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("cartesian-business-type-dimension-guard"),
    "diagnostics should expose cartesian business type dimension guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("integer-chart-value-precision"),
    "diagnostics should expose integer chart value precision fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("circular-center-text-stack-spacing"),
    "diagnostics should expose circular center text stack spacing fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("circular-bottom-legend-safe-area"),
    "diagnostics should expose circular bottom legend safe area fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("gauge-percent-text-consistency-warning"),
    "diagnostics should expose gauge percent text consistency warning fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("circular-outside-label-side-text-guard"),
    "diagnostics should expose circular outside label side text guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("cartesian-top-legend-text-safe-area"),
    "diagnostics should expose cartesian top legend text safe area fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("base-table-column-fit-guard"),
    "diagnostics should expose base table column fit guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("indicator-compact-height-typography"),
    "diagnostics should expose indicator compact height typography fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-decoration-below-content-zindex"),
    "diagnostics should expose dashboard decoration below content z-index fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("ringchart-readable-medium-radius"),
    "diagnostics should expose RingChart readable medium radius fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("circular-center-hole-fit-guard"),
    "diagnostics should expose circular center hole fit guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("circular-center-companion-alignment"),
    "diagnostics should expose circular center companion alignment fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("circular-bottom-legend-text-warning"),
    "diagnostics should expose circular bottom legend text warning fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("cartesian-offset-top-legend-text-safe-area"),
    "diagnostics should expose offset top legend text safe area fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("scroll-list-short-ordered-static-first-screen"),
    "diagnostics should expose short ordered ScrollList first-screen fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("indicator-readable-separation-guard"),
    "diagnostics should expose readable Indicator separation guard fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("indicator-title-external-single-text"),
    "diagnostics should expose Indicator title externalization fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-indicator-value-title-split"),
    "diagnostics should expose Indicator value/title split fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-edge-padding-decoration-warning"),
    "diagnostics should expose dashboard edge padding decoration warning fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("svg-decoration-edge-padding-guidance"),
    "diagnostics should expose SvgDecoration edge padding guidance fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-theme-contrast-warning"),
    "diagnostics should expose dashboard theme contrast warning fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-single-text-contrast-warning"),
    "diagnostics should expose SingleText contrast warning fingerprint",
  );
  assert.ok(
    (diagnostics.rulesFingerprint as string[]).includes("dashboard-single-text-overflow-warning"),
    "diagnostics should expose SingleText overflow warning fingerprint",
  );
  assert.equal(
    typeof (diagnostics.process as JsonObject).pid,
    "number",
    "diagnostics should expose process pid",
  );
  assert.ok(
    ((diagnostics.process as JsonObject).cwd as string).endsWith("screen-mcp"),
    "diagnostics should expose server cwd",
  );
  assert.ok(
    ((diagnostics.source as JsonObject).entryFile as string).endsWith("src\\server.ts") ||
      ((diagnostics.source as JsonObject).entryFile as string).endsWith("src/server.ts"),
    "diagnostics should expose server entry file",
  );
}
