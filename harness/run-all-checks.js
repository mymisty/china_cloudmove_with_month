import { checkContent } from './check-content.js';
import { checkSources } from './check-sources.js';
import { checkUi } from './check-ui.js';

const checks = [checkContent, checkSources, checkUi];
const results = checks.map((check) => check());
const failed = results.filter((result) => !result.ok);

results.forEach((result) => {
  if (result.ok) {
    console.log(`✓ ${result.name} 核查通过`);
  } else {
    console.error(`✗ ${result.name} 核查失败`);
    result.errors.forEach((error) => console.error(`  - ${error}`));
  }
});

if (failed.length) {
  process.exit(1);
}

console.log('全部 harness 核查通过。');
