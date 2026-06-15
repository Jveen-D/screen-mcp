import { chartPanelDefinition } from "../modules/chart-panel/index.js";
const modules = [chartPanelDefinition];
export function listModules() {
    return modules.map((definition) => ({
        moduleName: definition.moduleName,
        displayName: definition.displayName,
        description: definition.description,
    }));
}
export function getModuleDefinition(moduleName) {
    const definition = modules.find((item) => item.moduleName === moduleName);
    if (!definition) {
        throw new Error(`unknown moduleName: ${moduleName}`);
    }
    return definition;
}
export function getModuleCapability(moduleName) {
    return getModuleDefinition(moduleName).capability;
}
export function generateModuleSchema(input) {
    const moduleName = input.moduleName;
    if (typeof moduleName !== "string" || moduleName.trim() === "") {
        throw new Error("missing required module prop: moduleName");
    }
    return getModuleDefinition(moduleName).generateSchemas(input);
}
export function generateModuleTreeSchema(input) {
    const moduleName = input.moduleName;
    if (typeof moduleName !== "string" || moduleName.trim() === "") {
        throw new Error("missing required module prop: moduleName");
    }
    return getModuleDefinition(moduleName).generateTreeSchema(input);
}
