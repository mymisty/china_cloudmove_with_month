# 中国雨带的季节移动

一个面向课堂投屏的动态地理教学网页，用真实底图和交互动画展示中国东部季风区雨带从春季到秋季的季节移动过程。

页面重点帮助学生看清：

- 雨带什么时候出现；
- 雨带大致位于哪里；
- 雨带如何由南向北推进；
- 雨带如何在江淮附近停滞形成梅雨；
- 雨带如何北跳到华北、东北；
- 夏末秋初雨带如何南撤并逐步结束。

## 功能特性

- 六阶段雨带演示：华南前汛期、江南多雨、江淮梅雨、华北东北雨季、雨带南撤、雨季结束。
- 月份交互：可点击 `4月`、`5月`、`6月上旬`、`6月中下`、`7月上旬`、`7月中下`、`8月`、`9月`、`10月` 快速定位阶段。
- 播放控制：支持播放、暂停、上一步、下一步、重新播放。
- 真实地图底图：使用 NASA Blue Marble Next Generation July 2004 裁剪影像作为底图。
- 行政区划定位：叠加中国省级行政区划 GeoJSON，辅助定位华南、江南、江淮、华北、东北。
- 分段水汽路径：以曲线流线表达华南起步、江南北推、江淮停滞、北跳、南撤和收束。
- 资料追溯：页面关键时段、区域和表达均记录在 `docs/DATA_SOURCES.md`。
- 轻量 harness：提供内容、资料和 UI 静态核查脚本，方便长期迭代。

## 技术栈

- React
- Vite
- Tailwind CSS
- Framer Motion
- D3 Geo
- lucide-react

## 快速开始

请先安装 Node.js 18.18 或更高版本。

```bash
npm install
npm run dev
```

启动后访问：

```text
http://localhost:5173
```

如果在 Windows PowerShell 5 中直接 `Get-Content` 读取中文文件出现乱码，请使用：

```powershell
Get-Content README.md -Encoding utf8
```

项目源码和页面运行均按 UTF-8 处理，仓库提供了 `.editorconfig`。

## 构建与核查

```bash
npm run check
npm run build
```

也可以分别运行：

```bash
npm run check:content
npm run check:sources
npm run check:ui
```

当前 harness 覆盖：

- 阶段字段完整性、顺序、北进与南撤覆盖；
- 月份定位是否能追到对应阶段；
- `docs/DATA_SOURCES.md` 是否记录来源名称、网址、采用内容和节点追溯；
- 关键组件、月份定位、播放按钮、时间轴、当前阶段高亮和雨带动画标记。

## 页面阶段

| 阶段 | 时间 | 重点区域 | 课堂表达 |
| --- | --- | --- | --- |
| 华南前汛期 | 4月前后 | 华南沿海、两广、福建、江西南部 | 雨带先在华南建立 |
| 江南多雨 | 5月-6月上旬 | 江南、华南北部、长江中下游南侧 | 雨带缓慢北推并摆动 |
| 江淮梅雨 | 6月中旬-7月上旬 | 长江中下游、江淮地区 | 雨带稳定停滞，形成梅雨 |
| 华北东北雨季 | 7月中旬-8月下旬 | 华北、东北南部及东北地区 | 主雨带北跳，北方降水集中 |
| 雨带南撤 | 8月下旬-9月 | 黄淮、江淮及南方回撤路径 | 夏季风减弱，雨带方向反转 |
| 雨季结束 | 10月前后 | 东部大部退出主雨季 | 主雨带退出，华南沿海仍可能受热带系统影响 |

## 资料与底图

气象阶段依据来自中国气象局、中国天气网和公开气象论文资料。重要校正包括：

- 华南前汛期主节点采用“4月前后”，不把 3 月作为主雨带阶段；
- 江淮梅雨采用“6月中旬-7月上旬”；
- 华北、东北雨季采用“7月中旬-8月下旬”；
- 南撤采用“8月下旬-9月”，东部季风雨季基本结束采用“10月前后”。

底图与地图数据：

- NASA Blue Marble Next Generation July 2004 真实色影像，裁剪为 `public/images/nasa-china-july-crop.jpg`。
- 三张 NASA 区域影像参考窗口来自同一底图裁剪。
- 中国省级行政区划来自 DataV.GeoAtlas，保存为 `public/data/china-admin-geo.json`。

详细来源见：

- `docs/DATA_SOURCES.md`
- `docs/VISUAL_REDESIGN_PROMPT.md`
- `docs/ANIMATION_ITERATIONS.md`

## 项目结构

```text
src/
  components/
    Controls.jsx
    MonthNavigator.jsx
    RainBeltMap.jsx
    StageCard.jsx
    Timeline.jsx
  data/
    animationScore.js
    monthMarkers.js
    rainBeltStages.js
  App.jsx
  index.css
  main.jsx
public/
  data/
    china-admin-geo.json
  images/
    nasa-china-july-crop.jpg
    nasa-window-north-east.jpg
    nasa-window-south-china.jpg
    nasa-window-yangtze.jpg
docs/
  AGENT_MEMORY.md
  ANIMATION_ITERATIONS.md
  DATA_SOURCES.md
  OPTIMIZATION_NOTES.md
  REVIEW_LOG.md
  VISUAL_REDESIGN_PROMPT.md
harness/
  check-content.js
  check-sources.js
  check-ui.js
  run-all-checks.js
```

## 发布说明

当前版本是课堂演示型网页，不是业务级气象产品。雨带位置、云雨范围和水汽路径均为基于资料的教学概括表达，不应作为精确天气诊断、预报或 GIS 边界使用。

建议发布前运行：

```bash
npm run check
npm run build
```
