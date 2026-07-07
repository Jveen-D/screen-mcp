<!-- AUTO GENERATED DO NOT EDIT - run npm run docs:generate -->

# Screen MCP Component Reference

组件能力来自 `src/core/registry.ts`。新增组件必须补 capability、defaultProps/normalizer 以及对应测试。

| Component | Type | Description |
| --- | --- | --- |
| `PieChart` | chart | 用于展示分类占比、构成比例和环形占比关系的 ECharts 饼图组件。 |
| `ThreeDPieChart` | chart | 基于 Three.js 的 3D 饼图组件，支持立体厚度、俯视角度、扇区抬升、轮播动画和中心标签，用于展示分类占比和构成比例。 |
| `LineChart` | chart | 用于展示数据随分类或时间变化趋势的 ECharts 折线图组件，支持平滑曲线、面积图、多系列对比。 |
| `BarChart` | chart | 用于展示分类数据对比的 ECharts 柱状图组件，支持多系列并列、柱宽、圆角、间距和标签样式配置。 |
| `RingChart` | chart | 用于展示分类占比、构成比例的 ECharts 环形图组件，支持内环、外环装饰与环形文字。 |
| `StackBarChart` | chart | 用于展示分类数据构成与累计对比的 ECharts 堆叠柱状图组件，所有系列强制堆叠，支持柱宽、圆角和标签样式配置。 |
| `StackLineChart` | chart | 用于展示多系列累计趋势变化的 ECharts 堆叠折线图组件，所有系列强制堆叠，支持平滑曲线、面积图、标签样式配置。 |
| `BarChart25D` | chart | 用于展示分类数据对比的 2.5D 立体柱状图组件，基于 ECharts custom series 绘制立体柱体，支持多系列分组与标签样式配置。 |
| `BarProgress` | chart | 用于展示分类进度对比的横向条形进度图组件，基于 ECharts bar series 绘制，Y 轴为分类、X 轴为数值，支持背景条、圆角、标签和图例配置。 |
| `LiquidFill` | chart | 用于展示单个百分比数值的 ECharts 水球图组件。 |
| `RoseChart` | chart | 用于展示分类占比的 ECharts 南丁格尔玫瑰图组件，通过扇区面积表达数据大小。 |
| `ScatterChart` | chart | 用于展示两个连续变量相关性与分布的 ECharts 散点图组件，支持按系列分组、气泡大小映射、符号样式和标签配置。 |
| `SingleImage` | base | 用于大屏面板背景、全屏背景、标题背景、纹理、光效 PNG/JPG/WebP 或 base64 图片点缀。imageSrc 只能使用用户明确提供的路径，AI 不要猜测或选择现有素材库资源；没有素 |
| `SingleText` | base | 用于大屏标题、面板标题、指标名、单位、标签和短文本点缀的单行文本组件。 |
| `MultiText` | base | 用于大屏模块说明、底部结论、长文本段落和换行文本展示的多行文本组件。 |
| `DynamicText` | base | 用于大屏动态指标展示，可绑定单个数值并显示前后缀，例如“当前指标：12,345”、“CPU 使用率：78%”。 |
| `SvgDecoration` | base | 只用于大屏角标、线条、边框、科技纹理、图标和发光装饰的 SVG 组件，不能承载真实图表或业务文本。AI 始终拥有设计权，可主动生成装饰性 SVG；仅当用户明确禁止装饰时才可省略。 |
| `Indicator` | base | 用于大屏关键指标翻牌动画展示，支持标题、前后缀、千分位、小数位数与数字背景配置。 |
| `Gauge` | chart | 用于展示单个数值在仪表盘上的位置，支持自定义表盘样式、中心指标、量程与分段颜色。 |
| `CircularProgress` | chart | 用于展示多个系列的环形进度对比，基于 ECharts gauge/pie 环形能力绘制多个同心或并列圆环，支持自定义最大值、轨道色、填充色、图例与提示框。 |
| `PercentageBar` | chart | 用于展示单个数值在进度条上百分比位置的指标组件，支持刻度、比值文本、图标和进度条动画。 |
| `SingleValueChart` | chart | 用于展示单个百分比数值的圆环占比图。 |
| `BaseTable` | base | 用于大屏数据展示的基础表格组件，支持表头、行样式、列宽、序号列、外边框、行下划线、轮播与入场动画配置。 |
| `ScrollList` | base | 用于展示多列数据的滚动表格组件，支持表头、行样式、高亮、序号列、匹配高亮与滚动动画，适用于大屏数据列表场景。 |
| `FunnelChart` | base | 用于展示数据在多层级之间的流转与转化关系，以梯形漏斗块面积表示各层级数值大小，支持排序、图例、标签、提示框与自定义系列颜色。 |
| `RadarChart` | base | 用于展示多维度、多系列数据分布的雷达图组件，支持自定义雷达轴范围、维度标签、系列样式、图例与提示框。 |
| `HeatMap` | base | 用于展示两个分类维度交叉分布强度的 ECharts 热力图组件，通过颜色深浅映射数值大小，支持 X/Y 轴、视觉映射、高亮和标签配置。 |
| `PictorialBarChart` | base | 基于 ECharts pictorialBar 的象形柱图组件，使用自定义 SVG 符号作为柱体，支持多系列、坐标轴、图例、参考线与数据标签配置，适用于大屏分类数据对比场景。 |
| `NavMenu` | base | 基于 Ant Design Tree 的垂直导航菜单组件，支持多级嵌套、默认/悬停/选中三种状态样式、图标与展开行为。 |
| `TabMenu` | base | 横向或纵向的 Tab 标签菜单组件，支持默认/悬停/选中三种状态样式、图标、对齐与间距配置，用于大屏模块切换。 |
| `Input` | base | 大屏输入框组件，支持字符串和数字两种输入类型、占位文本、默认值、背景、边框与输入样式。 |
| `Select` | base | 大屏下拉选择组件，支持常量数据源、默认选中、占位文本、下拉框样式与选项样式配置。 |
| `RadioGroup` | base | 大屏单选组组件，支持水平/垂直排列、默认选中、选项间距与选中/未选中样式配置。 |
| `DatePicker` | base | 大屏日期选择组件，支持多种日期格式、默认值、占位文本和下拉面板样式配置。 |
| `DateRangePicker` | base | 大屏日期范围选择组件，支持起始/结束日期占位、分隔符、智能日期限制和下拉面板样式配置。 |
| `Weather` | base | 大屏天气组件，支持按城市编码自动获取并展示天气信息。 |
| `Date` | base | 大屏时间组件，支持按指定格式实时展示当前时间。 |
| `Video` | base | 大屏视频组件，支持 HLS/H.265 等视频源、自动播放、循环、静音和控件显示。 |
| `Audio` | base | 大屏音频组件，支持上传音频文件、控制条、自动播放和循环播放。 |
| `IFrame` | base | 大屏 iframe 嵌入组件，支持嵌入外部页面并配置权限、缩放和滚动条。 |
| `Swiper` | base | 大屏轮播图组件，支持图片列表、切换方向、切换按钮、动画效果和 3D 变换。 |
| `optionButton` | base | 大屏操作按钮组件，支持默认、悬停、选中三种状态样式和图标配置。 |
| `Earth3D` | base | 3D 地球场景组件，支持地球纹理、大气层、光照、星空背景、飞入动画等配置，用于构建地理数据可视化大屏。 |
| `Earth3D-Pointer` | base | 3D 地球子组件，用于在地球表面标记经纬度点位。前端面板中隐藏，只能通过 Earth3D 父组件添加。 |
| `Earth3D-Satellite` | base | 3D 地球子组件，用于在地球周围绘制卫星轨道与卫星模型。前端面板中隐藏，只能通过 Earth3D 父组件添加。 |
| `Earth3D-SpeedLight` | base | 3D 地球子组件，用于在地球表面指定经纬度位置展示扫描光效。前端面板中隐藏，只能通过 Earth3D 父组件添加。 |
| `Earth3D-TextAround` | base | 3D 地球子组件，用于在地球周围环绕展示文字。前端面板中隐藏，只能通过 Earth3D 父组件添加。 |
| `GaodeMap` | base | 2D 高德地图底图组件，支持自定义样式、缩放级别、中心经纬度、工具条与建筑/道路/POI 显示控制。 |
| `GaodeMap-FlyLine` | base | 高德地图子组件，用于在地图上绘制两点之间的飞行动画线条。前端面板中隐藏，只能通过 GaodeMap 父组件添加。 |
| `GaodeMap-HeatMap` | base | 高德地图子组件，用于在地图上展示热力聚合效果。前端面板中隐藏，只能通过 GaodeMap 父组件添加。 |
| `GaodeMap-InfoPannel` | base | 高德地图子组件，用于在地图标记点上展示信息面板。前端面板中隐藏，只能通过 GaodeMap 父组件添加。 |
| `GaodeMap-Marker` | base | 高德地图子组件，用于在地图上展示标牌标记。前端面板中隐藏，只能通过 GaodeMap 父组件添加。 |
| `GaodeMap-Polygon` | base | 高德地图子组件，用于在地图上绘制多边形区域。前端面板中隐藏，只能通过 GaodeMap 父组件添加。 |
