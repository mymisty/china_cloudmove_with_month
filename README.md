# 中国雨带的季节移动

一个用于课堂展示的动态地理教学网页，展示中国东部季风区雨带从华南前汛期、江南多雨过渡、江淮梅雨、华北东北雨季，到南撤和雨季结束的季节移动过程。

## 技术栈

- React
- Vite
- Tailwind CSS
- Framer Motion
- lucide-react

## 运行方式

请先安装 Node.js 18.18 或更高版本。

```bash
npm install
npm run dev
```

启动后访问终端输出的本地地址，通常为：

```text
http://localhost:5173
```

如果在 Windows PowerShell 5 中直接 `Get-Content` 读取中文文件出现乱码，请使用 `Get-Content -Encoding utf8`；项目源码和页面运行均按 UTF-8 处理，仓库也提供了 `.editorconfig`。

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
  VISUAL_REDESIGN_PROMPT.md
  OPTIMIZATION_NOTES.md
  REVIEW_LOG.md
harness/
  check-content.js
  check-sources.js
  check-ui.js
  run-all-checks.js
```

## 内容依据

阶段月份和区域来自中国气象局、中国天气网与公开气象论文资料，详细追溯见 `docs/DATA_SOURCES.md`。重要校正包括：

- 华南前汛期主节点采用“4月前后”，不是“3月”。
- 江淮梅雨采用“6月中旬-7月上旬”。
- 华北、东北雨季采用“7月中旬-8月下旬”。
- 南撤采用“8月下旬-9月”，东部季风雨季基本结束采用“10月前后”。

地图底图改用阿里云 DataV.GeoAtlas 中国省级行政区划 GeoJSON，并保存为本地静态资源 `public/data/china-admin-geo.json`；页面运行时不依赖外网加载地图。

视觉底图使用 NASA Blue Marble Next Generation July 2004 真实色影像，裁剪为本地静态资源 `public/images/nasa-china-july-crop.jpg`；三张阶段影像窗口也来自该 NASA 影像裁剪。

## GitHub 参考说明

Builder Agent 检索了 React 时间轴、天气 dashboard、Tailwind/Framer Motion 动效组件等 GitHub 项目，只借鉴信息层级、组件组织和时间轴交互思路，没有复制开源项目代码。参考条目记录在 `docs/DATA_SOURCES.md` 的“GitHub 与 UI 参考检索”部分。

## Harness 范围

当前 harness 是轻量静态核查：

- 内容核查：阶段字段完整性、顺序、北进与南撤覆盖。
- 月份核查：月份定位是否覆盖关键子时段，并能追到对应阶段。
- 资料核查：`DATA_SOURCES.md` 是否存在，来源名称、网址、采用内容、节点追溯是否记录。
- UI 核查：关键组件、月份定位、播放按钮、时间轴、当前阶段高亮和雨带动画标记是否存在。

后续可加入 Playwright 截图核查和浏览器端交互测试。
