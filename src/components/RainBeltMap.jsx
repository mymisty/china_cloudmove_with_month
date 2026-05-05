import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { geoPath, geoTransform } from 'd3-geo';
import { ArrowDown, ArrowUp, CircleDot, Waves } from 'lucide-react';
import { movementScore } from '../data/animationScore.js';

const regions = [
  { id: 'northeast', label: '东北', x: 91, y: 27 },
  { id: 'north', label: '华北', x: 75, y: 42 },
  { id: 'jianghuai', label: '江淮', x: 77, y: 61 },
  { id: 'jiangnan', label: '江南', x: 74, y: 69 },
  { id: 'south', label: '华南', x: 69, y: 81 },
];

const pathPoints = [
  { x: 69, y: 81 },
  { x: 74, y: 69 },
  { x: 77, y: 61 },
  { x: 85, y: 36 },
  { x: 77, y: 61 },
  { x: 69, y: 86 },
];

const nasaCropBounds = {
  west: 72,
  east: 136,
  north: 56,
  south: 10,
};

const routeSegments = [
  {
    id: 'south-start',
    stageId: 'sc-pre-flood',
    label: '华南起步',
    d: 'M69 86 C67 84 67 82 69 81',
    color: '#0284c7',
  },
  {
    id: 'jiangnan-push',
    stageId: 'jiangnan-rains',
    label: '江南北推',
    d: 'M69 81 C71 78 72 73 74 69',
    color: '#0284c7',
  },
  {
    id: 'meiyu-pause',
    stageId: 'jianghuai-meiyu',
    label: '江淮停滞',
    d: 'M74 69 C76 66 77 63 77 61',
    color: '#f59e0b',
  },
  {
    id: 'north-jump',
    stageId: 'north-northeast-rains',
    label: '北跳加强',
    d: 'M77 61 C79 52 82 43 85 36',
    color: '#0284c7',
  },
  {
    id: 'retreat-back',
    stageId: 'south-retreat',
    label: '南撤回落',
    d: 'M85 36 C83 47 80 55 77 61',
    color: '#0f766e',
  },
  {
    id: 'season-end',
    stageId: 'rainy-season-end',
    label: '退出收束',
    d: 'M77 61 C74 70 71 80 69 86',
    color: '#64748b',
  },
];

const imageWindows = [
  {
    id: 'south',
    title: '华南区域影像',
    src: '/images/nasa-window-south-china.jpg',
    stageIds: ['sc-pre-flood', 'rainy-season-end'],
  },
  {
    id: 'yangtze',
    title: '长江中下游区域影像',
    src: '/images/nasa-window-yangtze.jpg',
    stageIds: ['jiangnan-rains', 'jianghuai-meiyu', 'south-retreat'],
  },
  {
    id: 'north',
    title: '华北东北区域影像',
    src: '/images/nasa-window-north-east.jpg',
    stageIds: ['north-northeast-rains'],
  },
];

const highlightProvinceNames = {
  'sc-pre-flood': ['广东省', '广西壮族自治区', '福建省', '江西省', '海南省', '香港特别行政区', '澳门特别行政区'],
  'jiangnan-rains': ['浙江省', '江西省', '湖南省', '福建省', '上海市'],
  'jianghuai-meiyu': ['江苏省', '安徽省', '湖北省', '上海市', '浙江省'],
  'north-northeast-rains': ['北京市', '天津市', '河北省', '山东省', '辽宁省', '吉林省', '黑龙江省'],
  'south-retreat': ['河南省', '安徽省', '江苏省', '湖北省', '湖南省', '江西省'],
  'rainy-season-end': ['广东省', '广西壮族自治区', '海南省', '福建省', '台湾省'],
};

function activeWindowFor(stageId) {
  return imageWindows.find((window) => window.stageIds.includes(stageId)) ?? imageWindows[0];
}

function createNasaCropProjection() {
  const { west, east, north, south } = nasaCropBounds;

  return geoTransform({
    point(lon, lat) {
      const x = ((lon - west) / (east - west)) * 100;
      const y = ((north - lat) / (north - south)) * 100;
      this.stream.point(x, y);
    },
  });
}

function RainStreaks({ score }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[18px]" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, index) => (
        <motion.span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="rain-drop absolute h-8 w-px rounded-full"
          style={{
            left: `${7 + ((index * 13) % 86)}%`,
            top: `${(index * 19) % 100}%`,
            background: score.pathColor,
          }}
          animate={{ y: [0, 22, 0], opacity: [0.12, 0.42, 0.12] }}
          transition={{
            duration: 2.2 + (index % 5) * 0.24,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: (index % 7) * 0.12,
          }}
        />
      ))}
    </div>
  );
}

function DirectionBadge({ direction, score }) {
  const isSouth = direction === 'south' || direction === 'end';
  const Icon = direction === 'pause' ? CircleDot : isSouth ? ArrowDown : ArrowUp;
  const text = direction === 'pause' ? '停滞蓄积' : isSouth ? '南撤' : '北进';

  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute left-5 top-5 z-30 inline-flex items-center gap-2 rounded-full border border-cyan-800/15 bg-white/80 px-3 py-2 text-sm font-bold text-cyan-950 shadow-sm backdrop-blur"
      style={{ boxShadow: `0 12px 30px ${score.glowColor}` }}
    >
      <Icon className="h-4 w-4" />
      {text}
    </motion.div>
  );
}

function MotionScore({ stage, score }) {
  return (
    <div className="absolute bottom-5 right-5 z-20 rounded-md border border-cyan-800/10 bg-white/72 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span>动画节拍</span>
        <span className="text-cyan-800">{stage.rhythmLabel}</span>
      </div>
      <div className="flex items-end gap-1.5">
        {score.beatPattern.map((height, index) => (
          <motion.span
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="block w-2 rounded-full"
            style={{ background: score.pathColor }}
            animate={{ height: [`${height * 16 + 4}px`, `${height * 26 + 8}px`, `${height * 16 + 4}px`] }}
            transition={{
              duration: 0.82 + index * 0.1,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.08,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function WeatherImageWindow({ stage }) {
  const activeWindow = activeWindowFor(stage.id);

  return (
    <div className="absolute left-5 top-16 z-30 w-48 rounded-lg border border-white/45 bg-slate-950/20 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.22)] backdrop-blur">
      <div className="mb-2 text-xs font-black text-white drop-shadow">NASA 区域影像参考</div>
      <AnimatePresence mode="wait">
        <motion.figure
          key={activeWindow.id}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
          className="overflow-hidden rounded-md border border-white/35 bg-slate-900"
        >
          <img src={activeWindow.src} alt={activeWindow.title} className="h-28 w-full object-cover" />
          <figcaption className="bg-slate-950/70 px-2 py-1.5 text-xs font-bold text-white">
            {activeWindow.title}
          </figcaption>
        </motion.figure>
      </AnimatePresence>

      <div className="mt-2 grid grid-cols-3 gap-1">
        {imageWindows.map((window) => {
          const active = window.id === activeWindow.id;
          return (
            <span
              key={window.id}
              className={`h-1.5 rounded-full transition ${active ? 'bg-cyan-300' : 'bg-white/35'}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function RainBeltMap({ stage, stages, activeIndex }) {
  const [chinaAdminGeo, setChinaAdminGeo] = useState(null);
  const score = movementScore[stage.direction] ?? movementScore.north;

  useEffect(() => {
    let active = true;

    fetch('/data/china-admin-geo.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load map data: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (active) setChinaAdminGeo(data);
      })
      .catch(() => {
        if (active) setChinaAdminGeo({ type: 'FeatureCollection', features: [] });
      });

    return () => {
      active = false;
    };
  }, []);

  const provincePaths = useMemo(() => {
    if (!chinaAdminGeo?.features?.length) return [];

    const path = geoPath(createNasaCropProjection());

    return chinaAdminGeo.features.map((feature, index) => ({
      id: feature.properties.adcode ?? feature.properties.name ?? index,
      name: feature.properties.name,
      path: path(feature),
    }));
  }, [chinaAdminGeo]);

  const previousStage = stages[Math.max(activeIndex - 1, 0)];
  const isPause = stage.direction === 'pause';
  const activeProvinceSet = new Set(highlightProvinceNames[stage.id] ?? []);
  const activeSegmentIndex = Math.max(
    0,
    routeSegments.findIndex((segment) => segment.stageId === stage.id),
  );
  const completedSegmentIds = new Set(routeSegments.slice(0, activeSegmentIndex).map((segment) => segment.id));
  return (
    <section className="relative min-h-[480px] overflow-hidden rounded-[20px] border border-cyan-900/10 bg-slate-900 shadow-climate backdrop-blur-xl lg:min-h-0">
      <RainStreaks score={score} />
      <DirectionBadge direction={stage.direction} score={score} />
      <MotionScore stage={stage} score={score} />
      <WeatherImageWindow stage={stage} />

      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/75 to-transparent" />
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2 rounded-md border border-cyan-800/10 bg-white/65 px-3 py-2 text-sm font-semibold text-slate-600 backdrop-blur">
        <Waves className="h-4 w-4 text-cyan-700" />
        东南水汽输送
      </div>

      <motion.div
        className="rain-belt-ghost pointer-events-none absolute z-[18] rounded-full"
        animate={{
          top: previousStage.belt.top,
          left: previousStage.belt.left,
          width: previousStage.belt.width,
          height: previousStage.belt.height,
          rotate: previousStage.belt.rotate,
          opacity: activeIndex === 0 ? 0 : score.ghostOpacity,
        }}
        transition={{ type: 'spring', stiffness: 80, damping: 20, mass: 0.9 }}
      >
        <div className="absolute inset-0 rounded-full border border-cyan-200/45 bg-cyan-300/10 blur-md" />
        <div className="absolute inset-[14%] rounded-full border border-white/35 bg-sky-200/12" />
      </motion.div>

      <motion.div
        className="rain-belt pointer-events-none absolute z-20 rounded-full"
        data-rain-belt-animation="position"
        animate={{
          top: stage.belt.top,
          left: stage.belt.left,
          width: stage.belt.width,
          height: stage.belt.height,
          rotate: stage.belt.rotate,
        }}
        transition={score.beltTransition}
      >
        <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: score.glowColor }} />
        <motion.div
          className="absolute inset-[10%] rounded-full border border-white/55 shadow-[0_0_42px_rgba(34,211,238,0.45)]"
          style={{ background: score.coreGradient }}
          animate={{ scale: [0.96, 1.045, 0.99], opacity: [0.72, 0.98, 0.78] }}
          transition={{ duration: 1.65, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-[22%] rounded-full bg-white/30 blur-md"
          animate={{ x: ['-8%', '8%', '-5%'], opacity: [0.2, 0.48, 0.24] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {Array.from({ length: 11 }).map((_, index) => (
          <motion.span
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="absolute top-1/2 h-9 w-px rounded-full bg-white/70"
            style={{ left: `${10 + index * 8}%` }}
            animate={{ y: [-10, 14, -10], opacity: [0.2, 0.9, 0.2] }}
            transition={{
              duration: 1.25 + (index % 3) * 0.18,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.04,
            }}
          />
        ))}
      </motion.div>

      <svg
        className="absolute inset-0 z-10 h-full w-full"
        viewBox="0 0 100 100"
        role="img"
        aria-label="中国东部季风区雨带季节移动示意图"
        preserveAspectRatio="xMidYMid meet"
      >
        <image
          href="/images/nasa-china-july-crop.jpg"
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="none"
          opacity="0.96"
        />
        <rect x="0" y="0" width="100" height="100" fill="url(#mapShade)" opacity="0.58" />
        <defs>
          <linearGradient id="mapShade" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.18" />
            <stop offset="52%" stopColor="#083344" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="provinceFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#e8f4d8" />
            <stop offset="58%" stopColor="#f6f0c5" />
            <stop offset="100%" stopColor="#d8f0e7" />
          </linearGradient>
          <linearGradient id="activeProvinceFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="55%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0e7490" floodOpacity="0.16" />
          </filter>
          <marker id="arrowNorth" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" fill="#0284c7" />
          </marker>
          <marker id="arrowSouth" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" fill="#0f766e" />
          </marker>
        </defs>

        <g filter="url(#softShadow)">
          {provincePaths.map((province) => {
            const active = activeProvinceSet.has(province.name);
            return (
              <motion.path
                key={province.id}
                d={province.path}
                fill={active ? 'url(#activeProvinceFill)' : 'url(#provinceFill)'}
                stroke={active ? '#0284c7' : '#64748b'}
                strokeWidth={active ? 0.28 : 0.18}
                opacity={active ? 0.82 : 0.34}
                animate={{ opacity: active ? 0.82 : 0.34 }}
                transition={{ duration: 0.35 }}
              />
            );
          })}
        </g>

        <path
          d="M55 63 C62 62 69 62 79 62"
          fill="none"
          stroke="#475569"
          strokeWidth="0.45"
          strokeDasharray="1.4 1.2"
          opacity="0.58"
        />
        <text x="55.5" y="61.2" className="fill-slate-600 text-[2.5px] font-bold">
          秦岭-淮河
        </text>
        <path
          d="M63 71 C69 69 76 70 84 68"
          fill="none"
          stroke="#0891b2"
          strokeWidth="0.42"
          strokeDasharray="1.4 1.2"
          opacity="0.55"
        />
        <text x="63.5" y="73.5" className="fill-cyan-800 text-[2.5px] font-bold">
          长江中下游
        </text>

        {routeSegments.map((segment, index) => {
          const active = segment.stageId === stage.id;
          const completed = completedSegmentIds.has(segment.id);
          const dimmed = index > activeSegmentIndex;

          return (
            <motion.path
              key={segment.id}
              d={segment.d}
              fill="none"
              stroke={active ? score.pathColor : segment.color}
              strokeWidth={active ? score.segmentWidth : 0.85}
              strokeLinecap="round"
              strokeDasharray={active ? '5 3' : '2 4'}
              initial={false}
              animate={{
                pathLength: active ? 1 : completed ? 1 : 0.18,
                opacity: active ? 0.9 : completed ? 0.36 : dimmed ? 0.16 : 0.28,
              }}
              transition={{ duration: active ? score.segmentDuration : 0.5, ease: 'easeInOut' }}
            />
          );
        })}

        {routeSegments.map((segment, index) => {
          const active = segment.stageId === stage.id;
          if (!active || isPause) return null;

          return (
            <motion.path
              key={`flow-${segment.id}`}
              d={segment.d}
              fill="none"
              stroke={score.pathColor}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeDasharray="0.1 7"
              markerEnd={score.marker}
              initial={{ strokeDashoffset: 10, opacity: 0 }}
              animate={{ strokeDashoffset: [12, 0], opacity: [0.18, 0.9, 0.28] }}
              transition={{ duration: 1.35, repeat: Infinity, ease: 'linear' }}
            />
          );
        })}

        {isPause && (
          <motion.g key={`pause-${stage.id}`}>
            <motion.circle
              cx={stage.hotspot.x}
              cy={stage.hotspot.y}
              r="10"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="0.75"
              strokeDasharray="1.8 1.4"
              animate={{ rotate: 360, opacity: [0.25, 0.75, 0.25] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: `${stage.hotspot.x}px ${stage.hotspot.y}px` }}
            />
            <motion.circle
              cx={stage.hotspot.x}
              cy={stage.hotspot.y}
              r="5"
              fill="#fef3c7"
              opacity="0.45"
              animate={{ r: [4.5, 7, 4.5], opacity: [0.22, 0.55, 0.22] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.g>
        )}

        {pathPoints.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={index <= activeIndex ? 1.2 : 0.72}
            fill={index <= activeIndex ? '#0ea5e9' : '#94a3b8'}
            opacity={index <= activeIndex ? 0.92 : 0.42}
          />
        ))}

        {regions.map((region) => {
          const active =
            Math.abs(region.x - stage.hotspot.x) < 10 && Math.abs(region.y - stage.hotspot.y) < 11;
          return (
            <g key={region.id} data-region-active={active ? 'true' : 'false'}>
              <motion.circle
                cx={region.x}
                cy={region.y}
                r={active ? 5.4 : 3.7}
                fill={active ? '#fef3c7' : '#ffffff'}
                stroke={active ? '#0284c7' : '#94a3b8'}
                strokeWidth={active ? 0.8 : 0.45}
                animate={{ scale: active ? [1, 1.08, 1] : 1 }}
                transition={{ duration: 1.6, repeat: active ? Infinity : 0 }}
              />
              <text
                x={region.x}
                y={region.y + 0.6}
                textAnchor="middle"
                className="fill-slate-700 text-[3.2px] font-bold"
              >
                {region.label}
              </text>
            </g>
          );
        })}

        <motion.circle
          cx={stage.hotspot.x}
          cy={stage.hotspot.y}
          r="7"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="0.7"
          initial={false}
          animate={{ cx: stage.hotspot.x, cy: stage.hotspot.y, r: [5.5, 8, 5.5], opacity: [0.55, 0.15, 0.55] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <path
          d="M76 82 C67 75 64 70 60 63"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="3 2"
          opacity="0.72"
        />
        <path d="M60 63 L63 64 L61 67" fill="none" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" />
      </svg>

      <div className="absolute right-5 top-5 z-20 w-44 rounded-md border border-cyan-800/10 bg-white/75 p-3 text-sm text-slate-700 shadow-sm backdrop-blur">
        <div className="font-bold text-cyan-950">{stage.time}</div>
        <div className="mt-1 leading-5">{stage.region}</div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-300"
            animate={{ width: `${stage.rainfallLevel}%` }}
            transition={{ duration: 0.65 }}
          />
        </div>
      </div>
    </section>
  );
}

export default RainBeltMap;
