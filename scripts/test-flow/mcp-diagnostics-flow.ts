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
    "2026-06-29.03-bim-reserved-area",
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
