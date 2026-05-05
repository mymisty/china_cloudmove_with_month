import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { rainBeltStages, sourceCatalog } from '../src/data/rainBeltStages.js';

const root = process.cwd();
const sourceFile = path.join(root, 'docs/DATA_SOURCES.md');

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

export function checkSources() {
  const errors = [];
  assert(fs.existsSync(sourceFile), 'docs/DATA_SOURCES.md 不存在。', errors);
  if (errors.length) return { ok: false, name: 'sources', errors };

  const content = fs.readFileSync(sourceFile, 'utf8');
  ['资料来源名称', '网址', '采用内容', '对应页面节点'].forEach((keyword) => {
    assert(content.includes(keyword), `DATA_SOURCES.md 缺少字段：${keyword}`, errors);
  });
  assert(/https?:\/\//.test(content), 'DATA_SOURCES.md 必须包含来源网址。', errors);

  Object.entries(sourceCatalog).forEach(([key, name]) => {
    assert(content.includes(key), `DATA_SOURCES.md 缺少来源标识：${key}`, errors);
    assert(content.includes(name), `DATA_SOURCES.md 缺少来源名称：${name}`, errors);
  });

  rainBeltStages.forEach((stage) => {
    assert(content.includes(stage.id), `DATA_SOURCES.md 缺少阶段追溯：${stage.id}`, errors);
    stage.sourceRefs.forEach((ref) => {
      assert(content.includes(ref), `${stage.id} 引用的 ${ref} 未写入 DATA_SOURCES.md。`, errors);
    });
  });

  if (errors.length) {
    return { ok: false, name: 'sources', errors };
  }
  return { ok: true, name: 'sources', errors: [] };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = checkSources();
  if (!result.ok) {
    console.error('资料核查未通过：');
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
  console.log('资料核查通过。');
}
