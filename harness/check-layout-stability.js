import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const APP_URL = process.env.APP_URL ?? 'http://localhost:5173/';
const REMOTE_PORT = Number(process.env.CDP_PORT ?? 9339);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate));
}

async function fetchJson(url, retries = 40) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(150);
  }
  throw lastError;
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
  }

  async open() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
      this.ws.addEventListener('message', (event) => this.onMessage(event));
    });
  }

  onMessage(event) {
    const message = JSON.parse(event.data);
    if (!message.id || !this.pending.has(message.id)) return;

    const { resolve, reject } = this.pending.get(message.id);
    this.pending.delete(message.id);

    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  close() {
    this.ws.close();
  }
}

const probeExpression = String.raw`
(async () => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const selectors = {
    map: '[data-ui-component="rain-belt-map"]',
    weather: '.weather-image-window',
    stageCard: '.stage-card',
    controls: '[data-ui-component="controls"]',
    monthNavigator: '[data-ui-component="month-navigator"]',
    timeline: '[data-ui-component="timeline"]',
  };

  const boxOf = (selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.x * 100) / 100,
      y: Math.round(rect.y * 100) / 100,
      width: Math.round(rect.width * 100) / 100,
      height: Math.round(rect.height * 100) / 100,
      top: Math.round(rect.top * 100) / 100,
      bottom: Math.round(rect.bottom * 100) / 100,
    };
  };

  const weatherState = () => {
    const figures = Array.from(document.querySelectorAll('.weather-image-window figure'));
    const opacities = figures.map((figure) => Number(window.getComputedStyle(figure).opacity));
    const images = Array.from(document.querySelectorAll('.weather-image-window img'));
    return {
      opacitySum: Math.round(opacities.reduce((sum, value) => sum + value, 0) * 1000) / 1000,
      maxOpacity: Math.max(...opacities),
      imagesReady: images.every((image) => image.complete && image.naturalWidth > 0),
    };
  };

  const ghostState = () => {
    const ghost = document.querySelector('.rain-belt-ghost');
    if (!ghost) return { opacity: 0 };
    return {
      opacity: Number(window.getComputedStyle(ghost).opacity),
    };
  };

  const snapshot = (label) => ({
    label,
    scrollY: window.scrollY,
    boxes: Object.fromEntries(Object.entries(selectors).map(([key, selector]) => [key, boxOf(selector)])),
    weatherState: weatherState(),
    ghostState: ghostState(),
  });

  await Promise.all(
    Array.from(document.images).map((image) => {
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    }),
  );

  const samples = [snapshot('initial')];
  const buttons = Array.from(document.querySelectorAll('.month-button'));

  for (const button of buttons) {
    const monthLabel = button.innerText.split('\n')[0];
    button.click();
    await sleep(70);
    samples.push(snapshot(monthLabel + ' +70ms'));
    await sleep(260);
    samples.push(snapshot(monthLabel + ' +330ms'));
    await sleep(360);
    samples.push(snapshot(monthLabel + ' +690ms'));
  }

  return samples;
})()
`;

function range(values) {
  return Math.max(...values) - Math.min(...values);
}

function summarize(samples) {
  const keys = Object.keys(samples[0].boxes);
  return Object.fromEntries(
    keys.map((key) => {
      const boxes = samples.map((sample) => sample.boxes[key]).filter(Boolean);
      return [
        key,
        {
          minHeight: Math.round(Math.min(...boxes.map((box) => box.height)) * 100) / 100,
          maxHeight: Math.round(Math.max(...boxes.map((box) => box.height)) * 100) / 100,
          minTop: Math.round(Math.min(...boxes.map((box) => box.top)) * 100) / 100,
          maxTop: Math.round(Math.max(...boxes.map((box) => box.top)) * 100) / 100,
          heightRange: Math.round(range(boxes.map((box) => box.height)) * 100) / 100,
          topRange: Math.round(range(boxes.map((box) => box.top)) * 100) / 100,
          widthRange: Math.round(range(boxes.map((box) => box.width)) * 100) / 100,
        },
      ];
    }),
  );
}

function assertStable(samples) {
  const metrics = summarize(samples);
  const thresholds = {
    map: { heightRange: 2, topRange: 2, widthRange: 1 },
    weather: { heightRange: 1, topRange: 1, widthRange: 1 },
    stageCard: { heightRange: 2, topRange: 2, widthRange: 1 },
    controls: { heightRange: 1, topRange: 2, widthRange: 1 },
    monthNavigator: { heightRange: 2, topRange: 2, widthRange: 1 },
    timeline: { heightRange: 2, topRange: 2, widthRange: 1 },
  };

  const failures = [];
  Object.entries(thresholds).forEach(([key, limit]) => {
    Object.entries(limit).forEach(([field, max]) => {
      if (metrics[key][field] > max) failures.push(`${key}.${field}=${metrics[key][field]}px > ${max}px`);
    });
  });

  const opacityFailures = samples
    .filter((sample) => sample.weatherState.opacitySum < 0.94 || sample.weatherState.maxOpacity < 0.72)
    .map((sample) => `${sample.label}: opacitySum=${sample.weatherState.opacitySum}, max=${sample.weatherState.maxOpacity}`);

  const imageFailures = samples.filter((sample) => !sample.weatherState.imagesReady).map((sample) => sample.label);
  const ghostFailures = samples
    .filter((sample) => sample.label.endsWith('+690ms') && sample.ghostState.opacity > 0.05)
    .map((sample) => `${sample.label}: ghostOpacity=${sample.ghostState.opacity}`);

  return { metrics, failures, opacityFailures, imageFailures, ghostFailures };
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) throw new Error('未找到 Chrome 或 Edge，无法执行布局稳定性核查。');

  const userDataDir = mkdtempSync(path.join(tmpdir(), 'china-rain-layout-'));
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${REMOTE_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1440,900',
    'about:blank',
  ]);

  chrome.on('error', (error) => {
    throw error;
  });

  let client;
  try {
    const targets = await fetchJson(`http://127.0.0.1:${REMOTE_PORT}/json/list`);
    const pageTarget = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
    if (!pageTarget) throw new Error('未找到可调试的 Chrome 页面目标。');

    client = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await client.open();
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await client.send('Page.navigate', { url: APP_URL });
    await sleep(1800);

    const result = await client.send('Runtime.evaluate', {
      expression: probeExpression,
      awaitPromise: true,
      returnByValue: true,
      timeout: 15000,
    });

    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text ?? '页面布局探针执行失败');
    }

    const samples = result.result.value;
    const { metrics, failures, opacityFailures, imageFailures, ghostFailures } = assertStable(samples);
    console.log(JSON.stringify(metrics, null, 2));

    if (failures.length || opacityFailures.length || imageFailures.length || ghostFailures.length) {
      if (failures.length) console.error(`布局跳动: ${failures.join('; ')}`);
      if (opacityFailures.length) console.error(`小窗闪动风险: ${opacityFailures.join('; ')}`);
      if (imageFailures.length) console.error(`小窗图片未就绪: ${imageFailures.join('; ')}`);
      if (ghostFailures.length) console.error(`雨带残影未消失: ${ghostFailures.join('; ')}`);
      process.exitCode = 1;
      return;
    }

    console.log('✓ layout 稳定性核查通过');
  } finally {
    client?.close();
    chrome.kill();
    await sleep(400);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        rmSync(userDataDir, { force: true, recursive: true });
        break;
      } catch {
        await sleep(250);
      }
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
