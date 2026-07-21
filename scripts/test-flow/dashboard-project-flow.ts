import assert from "node:assert/strict";
import {
  generateDashboardProjectSchema,
  validateDashboardProjectSpec,
} from "../../src/core/dashboardProject.js";
import type { JsonObject } from "../../src/types/component.js";
import { flattenEditorNodes, nodeProps } from "./helpers.js";

function rootProps(document: JsonObject): JsonObject {
  return nodeProps(document.rootNode as JsonObject);
}

export function createDashboardProjectSpec(): JsonObject {
  return {
    logicalId: "operations_project",
    title: "运营多页面大屏",
    canvas: {
      width: 1280,
      height: 720,
    },
    grouping: {
      mode: "semantic",
      singleChildGroup: true,
    },
    theme: {
      background: "#071522",
      primaryColor: "#23D5E8",
      textColor: "#EAFBFF",
    },
    masters: [
      {
        logicalId: "shared_chrome",
        title: "共用头部母版",
        components: [
          {
            componentName: "SingleText",
            logicalId: "shared_title",
            textContent: "运营指挥中心",
            style: {
              position: "absolute",
              left: 40,
              top: 24,
              width: 360,
              height: 32,
              fontSize: 32,
              lineHeight: 1,
            },
          },
        ],
      },
    ],
    pages: [
      {
        logicalId: "overview_page",
        title: "运营总览",
        masterLogicalIds: ["shared_chrome"],
        components: [
          {
            componentName: "SingleText",
            logicalId: "overview_metric",
            textContent: "今日处理 128 项",
            style: {
              position: "absolute",
              left: 48,
              top: 128,
              width: 240,
              height: 24,
              fontSize: 24,
              lineHeight: 1,
            },
          },
        ],
      },
      {
        logicalId: "detail_page",
        title: "运营明细",
        masterLogicalIds: ["shared_chrome"],
      },
      {
        logicalId: "standalone_page",
        title: "独立页面",
        components: [
          {
            componentName: "SingleText",
            logicalId: "standalone_title",
            textContent: "独立页面内容",
            style: {
              position: "absolute",
              left: 48,
              top: 48,
              width: 240,
              height: 24,
              fontSize: 24,
              lineHeight: 1,
            },
          },
        ],
      },
    ],
  } as JsonObject;
}

export function runDashboardProjectTests(projectSpec: JsonObject): void {
  const validation = validateDashboardProjectSpec(projectSpec);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);

  const projectSchema = generateDashboardProjectSchema(projectSpec);
  assert.equal(projectSchema.name, "运营多页面大屏");
  assert.equal(projectSchema.version, "0.0.2");
  assert.equal(projectSchema.structVersion, "0.0.2");
  assert.equal(projectSchema.documents.length, 4);

  const documents = projectSchema.documents as unknown as JsonObject[];
  const pageDocuments = documents.filter((document) => rootProps(document).pageType === "page");
  const masterDocuments = documents.filter((document) => rootProps(document).pageType === "master");
  assert.equal(pageDocuments.length, 3);
  assert.equal(masterDocuments.length, 1);
  assert.ok(
    documents.slice(0, 3).every((document) => rootProps(document).pageType === "page"),
    "normal pages should precede masters so the editor opens a normal page first",
  );

  const documentIds = documents.map((document) => document.id as string);
  assert.equal(new Set(documentIds).size, documentIds.length, "project document ids should be unique");
  assert.ok(
    documentIds.every((id) => /_doc_[0-9a-f]{8}$/u.test(id) && id.length <= 50),
    "project document ids should be randomized and backend-safe",
  );
  documents.forEach((document) => {
    assert.equal(
      rootProps(document).docId,
      document.id,
      "root props.docId should preserve the document id through backend tree/list conversion",
    );
  });

  const masterDocument = masterDocuments[0];
  const masterNodes = flattenEditorNodes(masterDocument.rootNode as JsonObject);
  assert.ok(
    masterNodes.some(
      (node) => node.componentName === "SingleText" && nodeProps(node).textContent === "运营指挥中心",
    ),
    "master document should contain the compiled master design",
  );
  assert.equal(
    masterNodes.some((node) => node.title === "全屏背景"),
    false,
    "masters should not receive automatic full-canvas backgrounds that could cover other masters",
  );

  const overviewDocument = pageDocuments.find((document) => rootProps(document).pageTitle === "运营总览");
  assert.ok(overviewDocument);
  const overviewRoot = overviewDocument.rootNode as JsonObject;
  const overviewChildren = overviewRoot.children as JsonObject[];
  const overviewMaster = overviewChildren.find((node) => node.componentName === "Master");
  assert.ok(overviewMaster, "normal page should include a Master reference node");
  assert.equal(overviewMaster.id, masterDocument.id);
  assert.equal(overviewMaster.title, "共用头部母版");
  assert.equal(
    overviewChildren.at(-1)?.componentName,
    "Master",
    "page-specific content should render above inherited master content",
  );
  assert.equal(
    flattenEditorNodes(overviewRoot).some((node) => node.title === "全屏背景"),
    false,
    "a page using a master should not receive an automatic full-canvas background that hides the master",
  );

  const detailDocument = pageDocuments.find((document) => rootProps(document).pageTitle === "运营明细");
  assert.ok(detailDocument);
  assert.deepEqual(
    (detailDocument.rootNode as JsonObject).children,
    [
      {
        id: masterDocument.id,
        componentName: "Master",
        structVersion: "0.0.0",
        props: { layerRole: "content" },
        title: "共用头部母版",
        isHidden: false,
        isLocked: false,
      },
    ],
    "a normal page may contain only inherited master content",
  );

  const standaloneDocument = pageDocuments.find((document) => rootProps(document).pageTitle === "独立页面");
  assert.ok(standaloneDocument);
  assert.ok(
    flattenEditorNodes(standaloneDocument.rootNode as JsonObject).some((node) => node.title === "全屏背景"),
    "a page without a master should retain the existing automatic canvas background",
  );

  const missingMasterValidation = validateDashboardProjectSpec({
    pages: [
      {
        logicalId: "missing_master_page",
        masterLogicalIds: ["missing_master"],
      },
    ],
  } as JsonObject);
  assert.equal(missingMasterValidation.valid, false);
  assert.ok(
    (missingMasterValidation.errors as string[]).some((error) =>
      error.includes("unknown masterLogicalId missing_master"),
    ),
  );

  const duplicateDocumentValidation = validateDashboardProjectSpec({
    masters: [
      {
        logicalId: "duplicate_document",
        components: [
          {
            componentName: "SingleText",
            logicalId: "master_text",
            textContent: "母版内容",
            style: { position: "absolute", left: 0, top: 0, width: 120, height: 16 },
          },
        ],
      },
    ],
    pages: [
      {
        logicalId: "duplicate_document",
        masterLogicalIds: ["duplicate_document"],
      },
    ],
  } as JsonObject);
  assert.equal(duplicateDocumentValidation.valid, false);
  assert.ok(
    (duplicateDocumentValidation.errors as string[]).some((error) =>
      error.includes("duplicate document logicalId duplicate_document"),
    ),
  );

  const duplicateReferenceValidation = validateDashboardProjectSpec({
    masters: (projectSpec.masters as JsonObject[]),
    pages: [
      {
        logicalId: "duplicate_reference_page",
        masterLogicalIds: ["shared_chrome", "shared_chrome"],
      },
    ],
  } as JsonObject);
  assert.equal(duplicateReferenceValidation.valid, false);
  assert.ok(
    (duplicateReferenceValidation.errors as string[]).some((error) =>
      error.includes("duplicate masterLogicalId shared_chrome"),
    ),
  );

  const missingPageValidation = validateDashboardProjectSpec({
    masters: projectSpec.masters,
  } as JsonObject);
  assert.equal(missingPageValidation.valid, false);
  assert.ok(
    (missingPageValidation.errors as string[]).some((error) =>
      error.includes("at least one page"),
    ),
  );
}
