import assert from "node:assert/strict";
import { getComponentCapability } from "../../src/core/registry.js";
import { generateComponentsSchema } from "../../src/core/schema.js";
import type { JsonObject } from "../../src/types/component.js";
import { asChartObject } from "./helpers.js";


export function runControlAndMediaNormalizerTests(): void {
  // NavMenu: menuData.items should normalize to menuData.originalData
  const navMenuCapability = getComponentCapability("NavMenu");
  assert.ok(Array.isArray(navMenuCapability.aiWritableProps), "NavMenu capability has aiWritableProps");
  const navMenuSchema = generateComponentsSchema({
    componentName: "NavMenu",
    logicalId: "nav_menu_test",
    parentLogicalId: "menu_group",
    name: "测试导航菜单",
    menuData: {
      items: [
        { id: "1", name: "菜单1" },
        { id: "2", name: "菜单2", children: [{ id: "3", name: "菜单2-1" }] },
      ],
    },
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 280,
      height: 600,
    },
  });
  assert.equal(navMenuSchema.componentName, "NavMenu");
  const navMenuData = asChartObject(navMenuSchema.props.menuData);
  const navMenuOriginalData = Array.isArray(navMenuData.originalData) ? navMenuData.originalData : [];
  assert.equal(navMenuOriginalData.length, 2, "NavMenu items should sync to originalData");
  assert.equal(asChartObject(navMenuOriginalData[0]).name, "菜单1", "NavMenu first item name should sync");
  assert.equal(navMenuData.originType, "static", "NavMenu originType should be static");

  // TabMenu: menuData.items should normalize to menuData.originalData with selectTabId
  const tabMenuCapability = getComponentCapability("TabMenu");
  assert.ok(Array.isArray(tabMenuCapability.aiWritableProps), "TabMenu capability has aiWritableProps");
  const tabMenuSchema = generateComponentsSchema({
    componentName: "TabMenu",
    logicalId: "tab_menu_test",
    parentLogicalId: "menu_group",
    name: "测试Tab列表",
    menuData: {
      items: [
        { id: "1", name: "Tab1" },
        { id: "2", name: "Tab2" },
      ],
    },
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 600,
      height: 60,
    },
  });
  assert.equal(tabMenuSchema.componentName, "TabMenu");
  const tabMenuData = asChartObject(tabMenuSchema.props.menuData);
  const tabMenuOriginalData = Array.isArray(tabMenuData.originalData) ? tabMenuData.originalData : [];
  assert.equal(tabMenuOriginalData.length, 2, "TabMenu items should sync to originalData");
  assert.equal(tabMenuData.selectTabId, "1", "TabMenu selectTabId should default to first item");

  // Input: defaultValue should be preserved
  const inputCapability = getComponentCapability("Input");
  assert.ok(Array.isArray(inputCapability.aiWritableProps), "Input capability has aiWritableProps");
  const inputSchema = generateComponentsSchema({
    componentName: "Input",
    logicalId: "input_test",
    parentLogicalId: "form_group",
    name: "测试输入框",
    placeholder: "请输入名称",
    defaultValue: "示例",
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 200,
      height: 40,
    },
  });
  assert.equal(inputSchema.componentName, "Input");
  assert.equal(inputSchema.props.placeholder, "请输入名称", "Input placeholder should sync");
  assert.equal(inputSchema.props.defaultValue, "示例", "Input defaultValue should sync");

  // Select: options should normalize to dataConfig.constant.data
  const selectCapability = getComponentCapability("Select");
  assert.ok(Array.isArray(selectCapability.aiWritableProps), "Select capability has aiWritableProps");
  const selectSchema = generateComponentsSchema({
    componentName: "Select",
    logicalId: "select_test",
    parentLogicalId: "form_group",
    name: "测试下拉选择",
    options: [
      { label: "全部", value: "all" },
      { label: "运行中", value: "running" },
    ],
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 200,
      height: 40,
    },
  });
  assert.equal(selectSchema.componentName, "Select");
  const selectDataConfig = asChartObject(selectSchema.props.dataConfig);
  const selectConstant = asChartObject(selectDataConfig.constant);
  const selectConstantData = Array.isArray(selectConstant.data) ? selectConstant.data : [];
  assert.equal(selectConstantData.length, 2, "Select options should sync to dataConfig");
  assert.equal(asChartObject(selectConstantData[0]).name, "全部", "Select first option label should sync");
  assert.equal(asChartObject(selectConstantData[0]).value, "all", "Select first option value should sync");
  const selectDimension = Array.isArray(selectDataConfig.dimension) ? selectDataConfig.dimension : [];
  const selectIndicator = Array.isArray(selectDataConfig.indicator) ? selectDataConfig.indicator : [];
  assert.equal(asChartObject(selectDimension[0]).fieldName, "name", "Select dimension should be name");
  assert.equal(asChartObject(selectIndicator[0]).fieldName, "value", "Select indicator should be value");

  // RadioGroup: options should normalize to dataConfig.constant.data
  const radioGroupCapability = getComponentCapability("RadioGroup");
  assert.ok(Array.isArray(radioGroupCapability.aiWritableProps), "RadioGroup capability has aiWritableProps");
  const radioGroupSchema = generateComponentsSchema({
    componentName: "RadioGroup",
    logicalId: "radio_group_test",
    parentLogicalId: "form_group",
    name: "测试单选组",
    options: [
      { label: "日", value: "day" },
      { label: "周", value: "week" },
    ],
    direction: "horizontal",
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 300,
      height: 40,
    },
  });
  assert.equal(radioGroupSchema.componentName, "RadioGroup");
  const radioGroupDataConfig = asChartObject(radioGroupSchema.props.dataConfig);
  const radioGroupConstant = asChartObject(radioGroupDataConfig.constant);
  const radioGroupConstantData = Array.isArray(radioGroupConstant.data) ? radioGroupConstant.data : [];
  assert.equal(radioGroupConstantData.length, 2, "RadioGroup options should sync to dataConfig");
  assert.equal(asChartObject(radioGroupConstantData[1]).name, "周", "RadioGroup second option label should sync");
  assert.equal(radioGroupSchema.props.direction, "horizontal", "RadioGroup direction should sync");

  // DatePicker: dateFormat and selector placeholder should normalize
  const datePickerCapability = getComponentCapability("DatePicker");
  assert.ok(Array.isArray(datePickerCapability.aiWritableProps), "DatePicker capability has aiWritableProps");
  const datePickerSchema = generateComponentsSchema({
    componentName: "DatePicker",
    logicalId: "date_picker_test",
    parentLogicalId: "form_group",
    name: "测试日期选择",
    dateFormat: "YYYY-MM-DD",
    selector: {
      placeholder: {
        content: "请选择日期",
      },
    },
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 180,
      height: 40,
    },
  });
  assert.equal(datePickerSchema.componentName, "DatePicker");
  assert.equal(datePickerSchema.props.dateFormat, "YYYY-MM-DD", "DatePicker dateFormat should sync");
  const datePickerDataConfig = asChartObject(datePickerSchema.props.dataConfig);
  const datePickerIndicator = Array.isArray(datePickerDataConfig.indicator) ? datePickerDataConfig.indicator : [];
  assert.equal(asChartObject(datePickerIndicator[0]).fieldName, "测试日期选择", "DatePicker indicator should use name");
  const datePickerSelector = asChartObject(datePickerSchema.props.selector);
  const datePickerPlaceholder = asChartObject(datePickerSelector.placeholder);
  assert.equal(datePickerPlaceholder.content, "请选择日期", "DatePicker placeholder should sync");

  // DateRangePicker: selector placeholder array and separator should normalize
  const dateRangePickerCapability = getComponentCapability("DateRangePicker");
  assert.ok(Array.isArray(dateRangePickerCapability.aiWritableProps), "DateRangePicker capability has aiWritableProps");
  const dateRangePickerSchema = generateComponentsSchema({
    componentName: "DateRangePicker",
    logicalId: "date_range_picker_test",
    parentLogicalId: "form_group",
    name: "测试日期范围选择",
    dateFormat: "YYYY-MM-DD",
    selector: {
      placeholder: {
        content: ["开始", "结束"],
      },
      separator: "至",
    },
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 280,
      height: 40,
    },
  });
  assert.equal(dateRangePickerSchema.componentName, "DateRangePicker");
  assert.equal(dateRangePickerSchema.props.dateFormat, "YYYY-MM-DD", "DateRangePicker dateFormat should sync");
  const dateRangePickerDataConfig = asChartObject(dateRangePickerSchema.props.dataConfig);
  const dateRangePickerConstant = asChartObject(dateRangePickerDataConfig.constant);
  const dateRangePickerConstantData = Array.isArray(dateRangePickerConstant.data) ? dateRangePickerConstant.data : [];
  assert.equal(dateRangePickerConstantData.length, 0, "DateRangePicker dataConfig should be empty");
  const dateRangePickerSelector = asChartObject(dateRangePickerSchema.props.selector);
  const dateRangePickerPlaceholder = asChartObject(dateRangePickerSelector.placeholder);
  assert.deepEqual(dateRangePickerPlaceholder.content, ["开始", "结束"], "DateRangePicker placeholder array should sync");
  assert.equal(dateRangePickerSelector.separator, "至", "DateRangePicker separator should sync");

  // Weather: cityCode should normalize to default array
  const weatherCapability = getComponentCapability("Weather");
  assert.ok(Array.isArray(weatherCapability.aiWritableProps), "Weather capability has aiWritableProps");
  const weatherSchema = generateComponentsSchema({
    componentName: "Weather",
    logicalId: "weather_test",
    parentLogicalId: "header_group",
    name: "测试天气",
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 240,
      height: 34,
    },
  });
  assert.equal(weatherSchema.componentName, "Weather");
  assert.deepEqual(weatherSchema.props.cityCode, ["11", "1101", "110101"], "Weather cityCode should normalize");

  // Date: format/timezone should normalize
  const dateCapability = getComponentCapability("Date");
  assert.ok(Array.isArray(dateCapability.aiWritableProps), "Date capability has aiWritableProps");
  const dateSchema = generateComponentsSchema({
    componentName: "Date",
    logicalId: "date_test",
    parentLogicalId: "header_group",
    name: "测试时间",
    format: "YYYY-MM-DD HH:mm:ss",
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 320,
      height: 34,
    },
  });
  assert.equal(dateSchema.componentName, "Date");
  assert.equal(dateSchema.props.format, "YYYY-MM-DD HH:mm:ss", "Date format should sync");
  assert.equal(dateSchema.props.timezone, "beijing", "Date timezone should default to beijing");

  // Video: videoType and booleans should normalize
  const videoCapability = getComponentCapability("Video");
  assert.ok(Array.isArray(videoCapability.aiWritableProps), "Video capability has aiWritableProps");
  const videoSchema = generateComponentsSchema({
    componentName: "Video",
    logicalId: "video_test",
    parentLogicalId: "media_group",
    name: "测试视频",
    videoType: "hls",
    autoplay: true,
    muted: false,
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 400,
      height: 260,
    },
  });
  assert.equal(videoSchema.componentName, "Video");
  assert.equal(videoSchema.props.videoType, "hls", "Video videoType should sync");
  assert.equal(videoSchema.props.autoplay, true, "Video autoplay should sync");
  assert.equal(videoSchema.props.muted, false, "Video muted should sync");

  // Audio: controlBar and loopPlay should normalize
  const audioCapability = getComponentCapability("Audio");
  assert.ok(Array.isArray(audioCapability.aiWritableProps), "Audio capability has aiWritableProps");
  const audioSchema = generateComponentsSchema({
    componentName: "Audio",
    logicalId: "audio_test",
    parentLogicalId: "media_group",
    name: "测试音频",
    controlBar: false,
    loopPlay: true,
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 400,
      height: 55,
    },
  });
  assert.equal(audioSchema.componentName, "Audio");
  assert.equal(audioSchema.props.controlBar, false, "Audio controlBar should sync");
  assert.equal(audioSchema.props.loopPlay, true, "Audio loopPlay should sync");

  // IFrame: url and scroll should normalize
  const iframeCapability = getComponentCapability("IFrame");
  assert.ok(Array.isArray(iframeCapability.aiWritableProps), "IFrame capability has aiWritableProps");
  const iframeSchema = generateComponentsSchema({
    componentName: "IFrame",
    logicalId: "iframe_test",
    parentLogicalId: "content_group",
    name: "测试iframe",
    url: "https://example.com",
    scroll: "hide",
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 600,
      height: 400,
    },
  });
  assert.equal(iframeSchema.componentName, "IFrame");
  assert.equal(iframeSchema.props.url, "https://example.com", "IFrame url should sync");
  assert.equal(iframeSchema.props.scroll, "hide", "IFrame scroll should sync");

  // Swiper: imageSrcList and direction should normalize
  const swiperCapability = getComponentCapability("Swiper");
  assert.ok(Array.isArray(swiperCapability.aiWritableProps), "Swiper capability has aiWritableProps");
  const swiperSchema = generateComponentsSchema({
    componentName: "Swiper",
    logicalId: "swiper_test",
    parentLogicalId: "media_group",
    name: "测试轮播图",
    imageSrcList: ["group1/banner1.png", "group1/banner2.png"],
    direction: "vertical",
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 800,
      height: 240,
    },
  });
  assert.equal(swiperSchema.componentName, "Swiper");
  assert.deepEqual(swiperSchema.props.imageSrcList, ["group1/banner1.png", "group1/banner2.png"], "Swiper imageSrcList should sync");
  assert.equal(swiperSchema.props.direction, "vertical", "Swiper direction should sync");

  // optionButton: btnText and arrange should normalize
  const optionButtonCapability = getComponentCapability("optionButton");
  assert.ok(Array.isArray(optionButtonCapability.aiWritableProps), "optionButton capability has aiWritableProps");
  const optionButtonSchema = generateComponentsSchema({
    componentName: "optionButton",
    logicalId: "option_button_test",
    parentLogicalId: "form_group",
    name: "测试操作按钮",
    btnText: "查询",
    arrange: "column",
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 160,
      height: 48,
    },
  });
  assert.equal(optionButtonSchema.componentName, "optionButton");
  assert.equal(optionButtonSchema.props.btnText, "查询", "optionButton btnText should sync");
  assert.equal(optionButtonSchema.props.arrange, "column", "optionButton arrange should sync");
}
