# Release v0.1.0

## 概要

首个可运行版本，完成“中国雨带的季节移动”动态地理教学网页。

## 主要内容

- React + Vite + Tailwind CSS + Framer Motion 前端页面。
- NASA Blue Marble 真实色底图与 DataV.GeoAtlas 中国省级行政区划定位层。
- 六阶段雨带移动：华南前汛期、华南—江南多雨过渡、江淮梅雨、华北东北雨季、雨带南撤、雨季结束。
- 月份定位：支持 4月到10月关键月份/旬的交互切换。
- 分段水汽路径与雨带动画：北进、停滞、北跳、南撤、收束。
- 三张 NASA 区域影像参考窗口随阶段淡入淡出。
- 资料追溯文档、长期记忆文档、优化记录和轻量 harness。

## 验证

- `npm run check`：通过。
- `npm run build`：通过。
- `npm audit --omit=dev`：0 vulnerabilities。

## 注意

本项目用于课堂演示。雨带位置、云雨范围和路径均为教学概括表达，不是业务级气象产品或精确 GIS 数据。
