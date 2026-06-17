import type { JsonObject } from "../../types/component.js";

export const navMenuDefaultProps: JsonObject = {
  componentName: "NavMenu",
  name: "导航菜单",
  title: "导航菜单",
  style: {
    position: "absolute",
    left: 400,
    top: 400,
    width: 315,
    height: 750,
    rotate: 0,
    opacity: 1,
    zIndex: 1,
    backgroundColor: "rgba(17,61,110,0.68)",
  },
  rotate: 0,
  opacity: 1,
  menuData: {
    originalData: [
      {
        id: "1",
        name: "菜单1",
        icon: "group1/M00/03/FE/wKgBCWP8EeiAHj9rAAAGMWTcl1g322.svg",
        children: [
          {
            id: "2",
            name: "菜单1-1",
            icon: "group1/M00/03/FE/wKgBCWP8EeiAHj9rAAAGMWTcl1g322.svg",
            children: [
              {
                id: "3",
                name: "菜单1-1-1",
                icon: "group1/M00/03/FE/wKgBCWP8EeiAHj9rAAAGMWTcl1g322.svg",
              },
              {
                id: "4",
                name: "菜单1-1-2",
                icon: "group1/M00/03/FE/wKgBCWP8EeiAHj9rAAAGMWTcl1g322.svg",
              },
              {
                id: "5",
                name: "菜单1-1-3",
                icon: "group1/M00/03/FE/wKgBCWP8EeiAHj9rAAAGMWTcl1g322.svg",
              },
            ],
          },
        ],
      },
      {
        id: "6",
        name: "菜单2",
        icon: "group1/M00/03/FE/wKgBCWP8EeiAHj9rAAAGMWTcl1g322.svg",
      },
      {
        id: "7",
        name: "菜单3",
        icon: "group1/M00/03/FE/wKgBCWP8EeiAHj9rAAAGMWTcl1g322.svg",
      },
      {
        id: "8",
        name: "菜单4",
        icon: "group1/M00/03/FE/wKgBCWP8EeiAHj9rAAAGMWTcl1g322.svg",
      },
      {
        id: "9",
        name: "菜单5",
        icon: "group1/M00/03/FE/wKgBCWP8EeiAHj9rAAAGMWTcl1g322.svg",
      },
    ],
    tableMapData: {
      id: "id",
      name: "name",
      icon: "icon",
      children: "children",
    },
    originType: "static",
  },
  isExpand: false,
  expandIconColor: "rgba(227,240,255,1)",
  showIcon: true,
  iconSize: 16,
  expandIconSize: 12,
  iconSpace: 6,
  menuDefaultStyle: {
    iconColor: "rgba(222,232,255,1)",
    fontFamily:
      '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
    fontSize: 18,
    color: "rgba(222,232,255,1)",
    textAlign: "flex-start",
    backgroundColor: "rgba(17,61,110,0)",
    fontStyle: "normal",
    fontWeight: "normal",
    letterSpacing: 2,
    lineHeight: 2,
  },
  menuHoverStyle: {
    iconColor: "rgba(222,232,255,1)",
    fontFamily:
      '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
    fontSize: 18,
    color: "rgba(238,243,255,1)",
    textAlign: "flex-start",
    backgroundColor: "rgba(69,132,222,0.33)",
    fontStyle: "normal",
    fontWeight: "normal",
    letterSpacing: 2,
    lineHeight: 2,
  },
  menuSelectStyle: {
    iconColor: "rgba(255,255,255,1)",
    fontFamily:
      '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
    fontSize: 18,
    color: "rgba(255,255,255,1)",
    textAlign: "flex-start",
    backgroundColor: "rgba(86,155,255,0.5699)",
    fontStyle: "normal",
    fontWeight: "bold",
    letterSpacing: 2,
    lineHeight: 2,
  },
  eventConfigures: [],
  entryAnimiation: {
    isShow: false,
    type: "",
  },
};
