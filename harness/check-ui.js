import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

export function checkUi() {
  const errors = [];
  const requiredFiles = [
    'src/components/RainBeltMap.jsx',
    'src/components/MonthNavigator.jsx',
    'src/components/Timeline.jsx',
    'src/components/StageCard.jsx',
    'src/components/Controls.jsx',
    'src/App.jsx',
    'src/index.css',
  ];

  requiredFiles.forEach((file) => {
    assert(fs.existsSync(path.join(root, file)), `缺少关键组件文件：${file}`, errors);
  });

  if (errors.length) return { ok: false, name: 'ui', errors };

  const rainMap = read('src/components/RainBeltMap.jsx');
  const timeline = read('src/components/Timeline.jsx');
  const monthNavigator = read('src/components/MonthNavigator.jsx');
  const controls = read('src/components/Controls.jsx');
  const stageCard = read('src/components/StageCard.jsx');
  const app = read('src/App.jsx');
  const css = read('src/index.css');

  assert(app.includes('RainBeltMap') && app.includes('Timeline') && app.includes('StageCard') && app.includes('Controls') && app.includes('MonthNavigator'), 'App 必须装配地图、月份定位、时间轴、说明卡和控制器。', errors);
  assert(controls.includes('data-play-button="true"'), 'Controls 必须包含播放按钮标记。', errors);
  assert(controls.includes('Pause') && controls.includes('RotateCcw'), 'Controls 必须支持暂停和重新播放。', errors);
  assert(timeline.includes('data-ui-component="timeline"'), 'Timeline 必须包含时间轴标记。', errors);
  assert(monthNavigator.includes('data-ui-component="month-navigator"'), 'MonthNavigator 必须包含月份交互标记。', errors);
  assert(monthNavigator.includes('data-current-month-stage'), 'MonthNavigator 必须提供当前月份阶段高亮标记。', errors);
  assert(timeline.includes('data-current-stage'), 'Timeline 必须提供当前阶段高亮标记。', errors);
  assert(timeline.includes('rhythmLabel'), 'Timeline 必须展示北进、停滞、北跳、南撤等节奏标签。', errors);
  assert(rainMap.includes('data-rain-belt-animation="position"'), 'RainBeltMap 必须标记雨带移动动画。', errors);
  assert(rainMap.includes('rain-belt-ghost') && rainMap.includes('markerEnd'), 'RainBeltMap 必须包含雨带残影和方向箭头。', errors);
  assert(rainMap.includes('nasa-china-july-crop.jpg') && rainMap.includes('WeatherImageWindow'), 'RainBeltMap 必须使用 NASA 真实底图和阶段影像窗口。', errors);
  assert(rainMap.includes('routeSegments') && rainMap.includes('strokeDashoffset'), 'RainBeltMap 必须包含分段曲线路径和流动输送粒子。', errors);
  assert(rainMap.includes('motion.div') && rainMap.includes('animate={{'), '雨带需要使用 Framer Motion 动画。', errors);
  assert(stageCard.includes('本阶段结论') && stageCard.includes('降水特征') && stageCard.includes('课堂讲解点'), 'StageCard 必须展示重点结论、降水特征和课堂讲解点。', errors);
  assert(css.includes('@tailwind') && css.includes('cloudDrift') && css.includes('currentMove'), '样式必须包含 Tailwind 和云雨/水汽动画。', errors);

  if (errors.length) {
    return { ok: false, name: 'ui', errors };
  }
  return { ok: true, name: 'ui', errors: [] };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = checkUi();
  if (!result.ok) {
    console.error('UI 核查未通过：');
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
  console.log('UI 核查通过。');
}
