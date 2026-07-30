export type BlackHoleApiKind = "api" | "event";
export type BlackHoleUsageForm = "call" | "assignment";

export interface BlackHoleFieldDefinition {
  name: string;
  description: string;
  position?: number;
}

export interface BlackHoleModelDefinition {
  name: string;
  fields: BlackHoleFieldDefinition[];
}

export interface BlackHoleApiSource {
  document: string;
  section: string;
  group?: string;
  blockIndex: number;
}

export interface BlackHoleApiDefinition {
  id: string;
  name: string;
  namespace: string;
  module: string;
  group?: string;
  kind: BlackHoleApiKind;
  callPath: string;
  description: string;
  notes: string[];
  parameters: BlackHoleFieldDefinition[];
  models: BlackHoleModelDefinition[];
  returns: string[];
  examples: string[];
  usageForms: BlackHoleUsageForm[];
  source: BlackHoleApiSource;
}

export interface BlackHoleModuleDefinition {
  id: string;
  name: string;
  namespace: string;
  kind: "module" | "events";
  apiCount: number;
}

export interface BlackHoleCatalog {
  sdkVersion: string;
  sourceDocument: string;
  sourceSha256: string;
  sourceModifiedAt?: string;
  apiCount: number;
  modules: BlackHoleModuleDefinition[];
  apis: BlackHoleApiDefinition[];
}
