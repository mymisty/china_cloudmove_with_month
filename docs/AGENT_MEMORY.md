# AGENT_MEMORY

## 项目目标

构建一个可长期迭代的 React 前端小项目，用动态地理教学页面展示“中国雨带的季节移动”。核心是让课堂用户看清雨带何时出现、位于哪里、如何北进、如何南撤，以及各阶段典型降水特征。

## 当前资料来源

优先使用中国气象局、中国天气网和气象期刊资料。后续接手请先看 `docs/DATA_SOURCES.md`，不要凭常识修改月份。

关键取舍：

- 华南前汛期主节点采用“4月前后”，不是“3—4月”。
- 江南阶段写成“5月-6月上旬”的华南—江南多雨过渡，不写成稳定主雨带或稳定江淮梅雨。
- 江淮梅雨采用“6月中旬-7月上旬”。
- 华北、东北雨季采用“7月中旬-8月下旬”，视觉重心放在华北—东北通道，不要只偏向东北。
- 南撤采用“8月下旬-9月”，结束采用“10月前后”。

## 当前页面结构

- `src/App.jsx`：全局状态、自动播放、阶段切换、布局组合。
- `src/data/rainBeltStages.js`：唯一的阶段数据来源，包含时间、区域、特征、解释、雨带位置、来源标识。
- `src/data/animationScore.js`：动画节奏配置，集中管理北进、停滞、南撤、收束的颜色、速度和节拍。
- `src/data/monthMarkers.js`：月份/旬定位数据，点击后跳到对应阶段。
- `src/components/RainBeltMap.jsx`：真实省级行政区划底图、雨带动画、水汽箭头、区域高亮。
- `src/components/MonthNavigator.jsx`：4月到10月的月份/旬定位界面。
- `src/components/Timeline.jsx`：可点击时间轴和当前阶段高亮。
- `src/components/StageCard.jsx`：当前阶段说明卡片。
- `src/components/Controls.jsx`：播放、暂停、上一步、下一步、重新播放。
- `src/index.css`：背景、水汽、云雨、按钮等全局样式。

## 当前设计风格

清爽课堂展示风格，主色为蓝色、青绿色、浅黄色。主屏就是教学演示页，不做营销落地页。布局适合 16:9 大屏：地图为主体，右侧为阶段说明与控制，底部时间轴。

## 已完成内容

- Vite + React + Tailwind CSS + Framer Motion 项目骨架。
- 六阶段雨带数据和来源追溯。
- 抽象地图、半透明雨带、动态雨滴、水汽流、时间轴和播放控制。
- Agent 3 建议后的优化：增加上一阶段雨带残影、方向箭头、停滞环、时间轴节奏标签、阶段重点结论和可变播放时长。
- 用户反馈抽象底图难看后，已改用阿里云 DataV.GeoAtlas 中国省级行政区划 GeoJSON，文件在 `public/data/china-admin-geo.json`，由 `RainBeltMap.jsx` 运行时加载。
- 用户要求优化动画节奏并添加月份交互后，已新增 `src/data/animationScore.js`、`src/data/monthMarkers.js` 和 `src/components/MonthNavigator.jsx`；10 轮迭代记录见 `docs/ANIMATION_ITERATIONS.md`。
- 用户继续反馈界面廉价、箭头没有输送感后，已新增 NASA Blue Marble 真实底图和三张裁剪影像窗口，图片在 `public/images/`；雨带路径改成分段曲线流线，不再用统一拉直箭头。
- 用户反馈仍有虚线箭头和 NASA 图片放大后边框问题后，已移除 `RainBeltMap.jsx` 中显式 `strokeDasharray` 虚线样式，路径改成实线流光；三张 NASA 区域图重新从底图扩大范围裁剪为 960×570；地图和 NASA 区域图都支持全屏查看。
- harness：内容核查、资料核查、UI 核查和总检查命令。
- 新增 `npm run check:layout`：启动本机 Chrome/Edge，用 CDP 连续点击月份按钮，量化地图、阶段卡、NASA 小窗、控制区、月份条和时间轴的 bounding box 变化。
- docs：资料记录、长期记忆、评审日志、优化建议。

## 可继续优化内容

- 若后续需要更高精度，可引入真实省界 GeoJSON 或简化 SVG 轮廓。
- 可加入“北进—停滞—北跳—南撤”的速度曲线显示。
- 可补充课堂投屏模式，例如隐藏资料 badge、放大地图、显示讲解提词。
- 可加入 Playwright 截图核查，当前 harness 为静态核查。

## 重要决策记录

- 不使用复杂 GIS 地图库，保持轻量、可维护、适合教学演示。
- 底图使用真实省级行政区划 GeoJSON，但雨带和区域高亮仍是教学示意层，不能当业务级气象图。
- NASA 底图提供真实地表纹理；三张阶段图片来自同一 NASA 真实底图裁剪。它们只作为地理/气象意象窗口，不代表对应月份的实时云图。
- 当前 UI 不再使用显式虚线箭头；如果后续恢复粒子输送，也不要用长期保留的虚线轨迹。
- 不复制 GitHub 项目代码，只参考布局与组件组织方式。
- 阶段数据集中在 `rainBeltStages.js`，组件只消费数据。
- 页面文本保持短句，详细依据写入 `DATA_SOURCES.md`。
- 源码按 UTF-8 保存；PowerShell 5 若使用默认 `Get-Content` 可能出现读取乱码，需用 `-Encoding utf8`。

## 不要重复尝试的路线

- 不要把 3 月写成华南前汛期主节点，除非新增权威资料并说明“江南春雨/东亚副热带夏季风建立”的区别。
- 不要把中国地图做成高精 GIS 项目；当前目标是教学示意。
- 不要把华南后汛期简单写成“没有雨”，它仍可能受台风和热带系统影响。
- 不要把月份定位做成逐日预报；它只是根据常年雨带阶段进行课堂定位。
- 不要让阶段卡随内容高度自然撑开外部布局；右侧卡片已固定高度，长内容在卡内滚动，避免月份切换时整屏跳动。

## 下一轮接手建议

先读：

- `docs/DATA_SOURCES.md`
- `src/data/rainBeltStages.js`
- `docs/REVIEW_LOG.md`
- `docs/OPTIMIZATION_NOTES.md`
- `docs/ANIMATION_ITERATIONS.md`

然后运行：

```bash
npm install
npm run check
npm run build
```
