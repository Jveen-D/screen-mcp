<!-- AUTO GENERATED DO NOT EDIT - run npm run docs:generate -->

# BlackHole Engine WebSDK Reference

LLM 负责理解用户意图并设计 `BlackHoleScriptSpec`；MCP 负责从官方 SDK 能力中检索、校验并编译代码，不根据自然语言套用固定代码模板。

- SDK version: `3.2.0.3808`
- API count: 1004
- Source document: [docs/BlackHole Engine API_Web-v3.2.0.3808.docx](BlackHole%20Engine%20API_Web-v3.2.0.3808.docx)
- Source SHA-256: `0f710deccf732697aab3803a4f501a1efcd995a32e18b8f43c5a0ca6a25217d2`

## Tool Flow

1. `list_blackhole_sdk_modules` discovers namespaces.
2. `search_blackhole_sdk` locates candidate APIs by name or description.
3. `get_blackhole_api_capability` reads the exact qualified API contract.
4. The LLM authors `BlackHoleScriptSpec` with explicit inputs and operations.
5. `validate_blackhole_script_spec` reports errors and uncertain optional-parameter warnings.
6. `generate_blackhole_code` compiles JavaScript without executing it.

## Host Integration Workflow

1. The host freezes the selected editor nodes and supplies a redacted inventory of variables, methods, data sources, node capabilities, and the existing `componentDidMount` body.
2. The LLM classifies the request as already implemented, a partial update of a verified Screen MCP managed block, or a new implementation, then identifies the real lifecycle, SDK-event, component-event, or manual trigger.
3. The LLM discovers exact SDK capabilities and authors a complete `BlackHoleScriptSpec`; MCP validates SDK arguments, effect semantics, execution placement, safe input bindings, and lifecycle comments.
4. `generate_blackhole_code` returns JavaScript plus a deterministic `hostPatch`. Equivalent executable semantics share an `integrationId`; a verified partial update carries the old marker id in `replaceIntegrationId`.
5. The host verifies selected-node references, component events, replacement markers, and duplicate listeners, then computes a read-only diff preview before transactionally writing methods, states, and component bindings.
6. MCP never executes generated code or edits the host project. The host rejects missing or malformed replacement markers and keeps no partial mutations when application fails.

## Script Value References

- `{ "$input": "dataSetList" }` references a declared runtime input.
- `{ "$ref": "selectedIds" }` references an earlier operation's `assignTo` value.
- `{ "$constructor": "REColor", "args": [0, 229, 255, 255] }` creates a documented SDK value object.
- Plain JSON values compile as literals. Arbitrary raw code expressions are not supported.

## Element Effect Semantics

The LLM must declare `effectTarget` when using the following easily-confused BIM APIs. MCP validates the declaration against the selected API; it does not choose an API from natural-language keywords.

- `elementValidity` + `BIM.setElemsValidState`: controls whole-element validity. `false` hides the element and prevents later SDK operations from affecting it. Use this for ordinary element show/hide when that participation behavior is intended.
- `elementAppearance` + `BIM.setElemAttr`: controls appearance while the element remains valid. Transparency can visually hide it; `BIM.getElemHideState` only recognizes hiding performed through `setElemAttr`.
- `elementUv` + `BIM.setElemUVVisible`: controls UV display only. Use it only when the user explicitly requests UV or texture-coordinate visibility, never as a substitute for ordinary element show/hide.

## Generated Code Contracts

The standalone generated setup function receives a ready BlackHole3D-compatible SDK instance as its first argument. A generated `hostPatch` instead emits direct readable lifecycle/custom-method statements, resolves `window.BlackHole3D` only when an SDK operation runs, and declares event handlers as local functions. Generated event handlers are not written to `ctx` and are not automatically removed; `eventHandlers` alone therefore use `cleanupTarget: "none"`. Only explicit `cleanup` SDK operations are compiled into `componentWillUnMount`. Before changing `componentDidMount`, the caller must provide and inspect its existing method body and skip generation when the requested trigger, target, scope, and effect are already implemented. A host-verified partially implemented Screen MCP block may be replaced by passing its exact marker id as `hostIntegration.replaceIntegrationId`; unverified or handwritten code must not use this field. New `componentDidMount` patches require `hostIntegration.chineseComment`; MCP validates it as a concise single-line Chinese explanation and emits the `//` prefix. Generated integration ids are stable for the same executable semantics and ignore comments, local handler names, display labels, and explanatory prose.

Resource URLs, credentials, component IDs, dataset IDs, element IDs, and other project-specific values must come from the user through `inputs`; the MCP must not invent them.

## Modules

| ID | SDK namespace | Type | APIs | Name |
| --- | --- | --- | ---: | --- |
| `Engine` | `BlackHole3D` | module | 37 | 引擎模块 |
| `Event` | `Event` | events | 68 | 监听事件 |
| `Common` | `Common` | module | 50 | 公共模块（Common） |
| `Light` | `Light` | module | 5 | 灯光（Light） |
| `Model` | `Model` | module | 7 | 模型加载（Model） |
| `Camera` | `Camera` | module | 59 | 相机（Camera） |
| `SkyBox` | `SkyBox` | module | 19 | 天空盒（SkyBox） |
| `Coordinate` | `Coordinate` | module | 17 | 坐标（Coordinate） |
| `Probe` | `Probe` | module | 12 | 鼠标探测（Probe） |
| `Graphics` | `Graphics` | module | 31 | 图形显示（Graphics） |
| `Tag` | `Tag` | module | 13 | 标签（Tag） |
| `Mark` | `Mark` | module | 5 | 标注（Mark） |
| `Anchor` | `Anchor` | module | 23 | 锚点（Anchor） |
| `Geometry` | `Geometry` | module | 28 | 几何图形（Geometry） |
| `Earthwork` | `Earthwork` | module | 4 | 填挖方（Earthwork） |
| `BIM` | `BIM` | module | 55 | BIM（BIM） |
| `CAD` | `CAD` | module | 64 | CAD（CAD） |
| `Grid` | `Grid` | module | 17 | 瓦片（Grid） |
| `Terrain` | `Terrain` | module | 52 | 地形（Terrain） |
| `Panorama` | `Panorama` | module | 16 | 360全景（Panorama） |
| `Edit` | `Edit` | module | 7 | 模型编辑（Edit） |
| `Measure` | `Measure` | module | 30 | 测量（Measure） |
| `FEM` | `FEM` | module | 5 | 有限元（FEM） |
| `AxisGrid` | `AxisGrid` | module | 10 | 轴网（AxisGrid） |
| `Elevation` | `Elevation` | module | 11 | 标高（Elevation） |
| `Fence` | `Fence` | module | 9 | 电子围栏（Fence） |
| `Clip` | `Clip` | module | 28 | 剖切（Clip） |
| `Animation` | `Animation` | module | 9 | 动画（Animation） |
| `MiniMap` | `MiniMap` | module | 29 | 小地图（MiniMap） |
| `Pipe` | `Pipe` | module | 23 | 管道（Pipe） |
| `Entity` | `Entity` | module | 52 | 单构件（Entity） |
| `Analysis3D` | `Analysis3D` | module | 21 | 三维分析（Analysis3D） |
| `Particle` | `Particle` | module | 16 | 粒子效果（Particle） |
| `Water` | `Water` | module | 26 | 水面（Water） |
| `Extrude` | `Extrude` | module | 25 | 挤出（Extrude） |
| `Monomer` | `Monomer` | module | 40 | 单体化（Monomer） |
| `ShpEdit` | `ShpEdit` | module | 20 | 矢量编辑（ShpEdit） |
| `Projection` | `Projection` | module | 48 | 投射（Projection） |
| `Math` | `Math` | module | 13 | 数学计算（Math） |
