import { chartPanelDefinition } from "../modules/chart-panel/index.js";
import { freeformModuleDefinition } from "../modules/freeform-module/index.js";
import type { JsonObject } from "../types/component.js";
import type { ModuleDefinition, ModuleInput } from "../types/module.js";

const modules = [chartPanelDefinition, freeformModuleDefinition] satisfies ModuleDefinition[];

export function listModules() {
  return modules.map((definition) => ({
    moduleName: definition.moduleName,
    displayName: definition.displayName,
    description: definition.description,
  }));
}

export function getModuleDefinition(moduleName: string): ModuleDefinition {
  const definition = modules.find((item) => item.moduleName === moduleName);

  if (!definition) {
    throw new Error(`unknown moduleName: ${moduleName}`);
  }

  return definition;
}

export function getModuleCapability(moduleName: string): JsonObject {
  return getModuleDefinition(moduleName).capability;
}

export function generateModuleSchema(input: JsonObject) {
  const moduleName = input.moduleName;
  if (typeof moduleName !== "string" || moduleName.trim() === "") {
    throw new Error("missing required module prop: moduleName");
  }

  return getModuleDefinition(moduleName).generateSchemas(input as ModuleInput);
}

export function generateModuleTreeSchema(input: JsonObject) {
  const moduleName = input.moduleName;
  if (typeof moduleName !== "string" || moduleName.trim() === "") {
    throw new Error("missing required module prop: moduleName");
  }

  return getModuleDefinition(moduleName).generateTreeSchema(input as ModuleInput);
}
