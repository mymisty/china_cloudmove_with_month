import { pathToFileURL } from 'node:url';
import { monthMarkers } from '../src/data/monthMarkers.js';
import { rainBeltStages } from '../src/data/rainBeltStages.js';

const requiredStringFields = [
  'id',
  'time',
  'title',
  'shortTitle',
  'region',
  'movement',
  'direction',
  'rhythmLabel',
  'explanation',
  'keyPoint',
  'classroomCue',
];

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

export function checkContent() {
  const errors = [];

  assert(Array.isArray(rainBeltStages), 'rainBeltStages 必须是数组。', errors);
  assert(rainBeltStages.length >= 6, '至少需要 6 个阶段。', errors);

  rainBeltStages.forEach((stage, index) => {
    requiredStringFields.forEach((field) => {
      assert(typeof stage[field] === 'string' && stage[field].trim().length > 0, `${stage.id || index} 缺少 ${field}。`, errors);
    });

    assert(Number.isInteger(stage.order), `${stage.id} 缺少整数 order。`, errors);
    assert(stage.order === index + 1, `${stage.id} 阶段 order 必须等于顺序位置。`, errors);
    assert(typeof stage.duration === 'number' && stage.duration >= 3000, `${stage.id} duration 必须是不小于 3000 的数字。`, errors);
    assert(Array.isArray(stage.features) && stage.features.length >= 3, `${stage.id} 至少需要 3 条降水特征。`, errors);
    assert(stage.features.every((item) => typeof item === 'string' && item.trim()), `${stage.id} features 不能有空项。`, errors);
    assert(stage.belt && typeof stage.belt === 'object', `${stage.id} 缺少雨带位置 belt。`, errors);
    ['top', 'left', 'width', 'height'].forEach((field) => {
      assert(typeof stage.belt?.[field] === 'string' && stage.belt[field].includes('%'), `${stage.id} belt.${field} 必须是百分比字符串。`, errors);
    });
    assert(typeof stage.belt?.rotate === 'number', `${stage.id} belt.rotate 必须是数字。`, errors);
    assert(stage.hotspot && typeof stage.hotspot.x === 'number' && typeof stage.hotspot.y === 'number', `${stage.id} 缺少 hotspot 坐标。`, errors);
    assert(Array.isArray(stage.sourceRefs) && stage.sourceRefs.length > 0, `${stage.id} 缺少 sourceRefs。`, errors);
  });

  const directions = new Set(rainBeltStages.map((stage) => stage.direction));
  assert(directions.has('north'), '页面必须覆盖雨带北进。', errors);
  assert(directions.has('south'), '页面必须覆盖雨带南撤。', errors);
  assert(directions.has('pause'), '页面应包含江淮梅雨停滞阶段。', errors);

  const joined = rainBeltStages.map((stage) => `${stage.title}${stage.region}${stage.explanation}`).join('');
  ['华南', '江南', '江淮', '华北', '东北', '南撤', '结束'].forEach((keyword) => {
    assert(joined.includes(keyword), `内容缺少关键节点：${keyword}。`, errors);
  });

  assert(Array.isArray(monthMarkers) && monthMarkers.length >= 9, '月份交互至少需要覆盖 4月到10月的关键子时段。', errors);
  const stageIds = new Set(rainBeltStages.map((stage) => stage.id));
  monthMarkers.forEach((month) => {
    assert(typeof month.label === 'string' && month.label.trim(), `${month.id} 缺少月份标签。`, errors);
    assert(stageIds.has(month.stageId), `${month.id} 指向了不存在的 stageId：${month.stageId}`, errors);
    assert(typeof month.phase === 'string' && month.phase.trim(), `${month.id} 缺少 phase。`, errors);
    assert(typeof month.cue === 'string' && month.cue.trim(), `${month.id} 缺少 cue。`, errors);
  });

  if (errors.length) {
    return { ok: false, name: 'content', errors };
  }
  return { ok: true, name: 'content', errors: [] };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = checkContent();
  if (!result.ok) {
    console.error('内容核查未通过：');
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
  console.log('内容核查通过。');
}
