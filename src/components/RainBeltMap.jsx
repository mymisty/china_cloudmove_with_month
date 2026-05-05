import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { geoPath, geoTransform } from 'd3-geo';
import { ArrowDown, ArrowUp, CircleDot, Maximize2, Minimize2, Waves, X } from 'lucide-react';
import { movementScore } from '../data/animationScore.js';

const regions = [
  { id: 'northeast', label: '东北', x: 85, y: 22 },
  { id: 'north', label: '华北', x: 69, y: 35 },
  { id: 'jianghuai', label: '江淮', x: 72, y: 52 },
  { id: 'jiangnan', label: '江南', x: 70, y: 59 },
  { id: 'south', label: '华南', x: 65, y: 72 },
];

const pathPoints = [
  { x: 65, y: 72 },
  { x: 70, y: 59 },
  { x: 72, y: 52 },
  { x: 75, y: 34 },
  { x: 72, y: 52 },
  { x: 65, y: 74 },
];

const nasaCropBounds = {
  west: 72,
  east: 136,
  north: 56,
  south: 10,
};

const stageShiftTransition = {
  duration: 0.78,
  ease: [0.22, 1, 0.36, 1],
};

const routeSegments = [
  {
    id: 'south-start',
    stageId: 'sc-pre-flood',
    label: '华南起步',
    d: 'M62 75 C63 74 64 73 65 72',
    color: '#0284c7',
  },
  {
    id: 'jiangnan-push',
    stageId: 'jiangnan-rains',
    label: '江南北推',
    d: 'M65 72 C66 68 68 62 70 59',
    color: '#0284c7',
  },
  {
    id: 'meiyu-pause',
    stageId: 'jianghuai-meiyu',
    label: '江淮停滞',
    d: 'M70 59 C71 57 72 54 72 52',
    color: '#f59e0b',
  },
  {
    id: 'north-jump',
    stageId: 'north-northeast-rains',
    label: '北跳加强',
    d: 'M72 52 C72.5 46 73 40 75 34',
    color: '#0284c7',
  },
  {
    id: 'retreat-back',
    stageId: 'south-retreat',
    label: '南撤回落',
    d: 'M75 34 C74 42 73 48 72 52',
    color: '#0f766e',
  },
  {
    id: 'season-end',
    stageId: 'rainy-season-end',
    label: '退出收束',
    d: 'M72 52 C70 61 67 69 65 74',
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

const activeRegionIdsByStage = {
  'north-northeast-rains': ['north', 'northeast'],
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

function WeatherImageWindow({ stage, onOpenImage }) {
  const activeWindow = activeWindowFor(stage.id);

  return (
    <div className="weather-image-window absolute left-5 top-16 z-30 h-[224px] w-56 overflow-visible rounded-lg bg-slate-950/25 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.22)] ring-1 ring-inset ring-white/45 backdrop-blur">
      <div className="flex h-6 items-center justify-between gap-2">
        <div className="truncate text-xs font-black leading-6 text-white drop-shadow">NASA 区域影像参考</div>
        <button
          type="button"
          onClick={() => onOpenImage(activeWindow)}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/18 text-white ring-1 ring-white/35 transition hover:bg-white/28"
          aria-label="全屏查看 NASA 区域影像"
          title="全屏查看"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="relative mt-2 h-[160px] overflow-hidden rounded-md bg-slate-900 ring-1 ring-inset ring-white/40">
        {imageWindows.map((window) => {
          const active = window.id === activeWindow.id;

          return (
            <motion.figure
              key={window.id}
              className="absolute inset-0 m-0"
              initial={false}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: 0.22, ease: 'linear' }}
              style={{ pointerEvents: active ? 'auto' : 'none', willChange: 'opacity', zIndex: active ? 2 : 1 }}
            >
              <img
                src={window.src}
                alt={window.title}
                loading="eager"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 h-7 truncate bg-slate-950/72 px-2 text-xs font-bold leading-7 text-white">
                {window.title}
              </figcaption>
            </motion.figure>
          );
        })}
      </div>

      <div className="mt-2 grid h-1.5 grid-cols-3 gap-1">
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
  const [imageViewer, setImageViewer] = useState(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const mapRef = useRef(null);
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

  useEffect(() => {
    const syncFullscreen = () => {
      setIsMapFullscreen(document.fullscreenElement === mapRef.current);
    };

    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const toggleMapFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await mapRef.current?.requestFullscreen?.();
  };

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
  const activeRegionIdSet = new Set(activeRegionIdsByStage[stage.id] ?? []);
  const activeSegmentIndex = Math.max(
    0,
    routeSegments.findIndex((segment) => segment.stageId === stage.id),
  );
  const completedSegmentIds = new Set(routeSegments.slice(0, activeSegmentIndex).map((segment) => segment.id));
  return (
    <section
      ref={mapRef}
      className="relative min-h-[480px] overflow-hidden rounded-[20px] border border-cyan-900/10 bg-slate-900 shadow-climate backdrop-blur-xl lg:min-h-0"
      data-ui-component="rain-belt-map"
    >
      <RainStreaks score={score} />
      <DirectionBadge direction={stage.direction} score={score} />
      <MotionScore stage={stage} score={score} />
      <WeatherImageWindow stage={stage} onOpenImage={setImageViewer} />

      <button
        type="button"
        onClick={toggleMapFullscreen}
        className="absolute right-5 top-5 z-30 inline-flex items-center gap-2 rounded-md bg-white/80 px-3 py-2 text-sm font-black text-cyan-950 shadow-sm ring-1 ring-cyan-900/10 backdrop-blur transition hover:bg-cyan-50"
        data-fullscreen-button="true"
        aria-label={isMapFullscreen ? '退出全屏地图' : '全屏查看地图'}
      >
        {isMapFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        {isMapFullscreen ? '退出全屏' : '全屏地图'}
      </button>

      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/75 to-transparent" />
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2 rounded-md border border-cyan-800/10 bg-white/65 px-3 py-2 text-sm font-semibold text-slate-600 backdrop-blur">
        <Waves className="h-4 w-4 text-cyan-700" />
        东南水汽输送
      </div>

      <motion.div
        key={`ghost-${stage.id}`}
        className="rain-belt-ghost pointer-events-none absolute z-[18] rounded-full"
        initial={{
          top: previousStage.belt.top,
          left: previousStage.belt.left,
          width: previousStage.belt.width,
          height: previousStage.belt.height,
          rotate: previousStage.belt.rotate,
          opacity: activeIndex === 0 ? 0 : score.ghostOpacity,
        }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.42, ease: 'easeOut' }}
        style={{ willChange: 'top, left, width, height, transform, opacity' }}
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
        transition={stageShiftTransition}
        style={{ willChange: 'top, left, width, height, transform' }}
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
          <marker id="arrowNorth" markerWidth="4.2" markerHeight="4.2" refX="3.8" refY="2.1" orient="auto">
            <path d="M0 0 L4.2 2.1 L0 4.2 Z" fill="#0284c7" />
          </marker>
          <marker id="arrowSouth" markerWidth="4.2" markerHeight="4.2" refX="3.8" refY="2.1" orient="auto">
            <path d="M0 0 L4.2 2.1 L0 4.2 Z" fill="#0f766e" />
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
          d="M55 50 C62 50 69 51 78 50"
          fill="none"
          stroke="#475569"
          strokeWidth="0.45"
          opacity="0.58"
        />
        <text x="55.5" y="48.6" className="fill-slate-600 text-[2.5px] font-bold">
          秦岭-淮河
        </text>
        <path
          d="M63 57 C69 56 76 57 84 55"
          fill="none"
          stroke="#0891b2"
          strokeWidth="0.42"
          opacity="0.55"
        />
        <text x="63.5" y="59.5" className="fill-cyan-800 text-[2.5px] font-bold">
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
              strokeWidth={active ? score.segmentWidth : 0.62}
              strokeLinecap="round"
              initial={false}
              animate={{
                pathLength: active ? 1 : completed ? 1 : 0.18,
                opacity: active ? 0.9 : completed ? 0.36 : dimmed ? 0.16 : 0.28,
              }}
              transition={{ duration: active ? 0.52 : 0.32, ease: 'easeOut' }}
            />
          );
        })}

        {routeSegments.map((segment, index) => {
          const active = segment.stageId === stage.id;
          if (!active || isPause) return null;

          return (
            <motion.path
              key={`flow-${segment.id}`}
              data-flow-path="true"
              d={segment.d}
              fill="none"
              stroke={score.pathColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              markerEnd={score.marker}
              initial={{ pathLength: 0.06, opacity: 0 }}
              animate={{ pathLength: [0.06, 1, 1], opacity: [0, 0.86, 0] }}
              transition={{ duration: 1.65, repeat: Infinity, ease: 'easeInOut' }}
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
            r={index <= activeIndex ? 0.95 : 0.58}
            fill={index <= activeIndex ? '#0ea5e9' : '#94a3b8'}
            opacity={index <= activeIndex ? 0.92 : 0.42}
          />
        ))}

        {regions.map((region) => {
          const active =
            activeRegionIdSet.has(region.id) ||
            (Math.abs(region.x - stage.hotspot.x) < 10 && Math.abs(region.y - stage.hotspot.y) < 11);
          return (
            <g key={region.id} data-region-active={active ? 'true' : 'false'}>
              <motion.circle
                cx={region.x}
                cy={region.y}
                r={active ? 4.5 : 3.2}
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
          r="6"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="0.7"
          initial={false}
          animate={{ cx: stage.hotspot.x, cy: stage.hotspot.y, r: [4.8, 7, 4.8], opacity: [0.5, 0.12, 0.5] }}
          transition={{
            cx: stageShiftTransition,
            cy: stageShiftTransition,
            r: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        <motion.path
          d="M86 80 C80 75 74 66 70 59"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1"
          strokeLinecap="round"
          markerEnd="url(#arrowNorth)"
          initial={false}
          animate={{ pathLength: [0.2, 1, 1], opacity: [0.32, 0.78, 0.42] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      <div className="absolute right-5 top-16 z-20 w-44 rounded-md border border-cyan-800/10 bg-white/75 p-3 text-sm text-slate-700 shadow-sm backdrop-blur">
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

      {imageViewer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/92 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="NASA 区域影像全屏查看"
        >
          <button
            type="button"
            onClick={() => setImageViewer(null)}
            className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/25 transition hover:bg-white/20"
            aria-label="关闭全屏影像"
          >
            <X className="h-6 w-6" />
          </button>
          <figure className="m-0 w-full max-w-6xl">
            <img
              src={imageViewer.src}
              alt={imageViewer.title}
              className="max-h-[calc(100vh-112px)] w-full rounded-xl object-contain shadow-[0_24px_80px_rgba(0,0,0,0.42)] ring-1 ring-white/25"
            />
            <figcaption className="mt-4 text-center text-sm font-bold text-white/80">
              {imageViewer.title} · NASA Blue Marble 区域影像参考
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

export default RainBeltMap;
