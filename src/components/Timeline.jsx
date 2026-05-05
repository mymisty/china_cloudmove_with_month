import { motion } from 'framer-motion';

const rhythmClasses = {
  north: 'border-sky-400 bg-sky-50 text-sky-800',
  pause: 'border-amber-400 bg-amber-50 text-amber-900',
  south: 'border-emerald-400 bg-emerald-50 text-emerald-800',
  end: 'border-slate-300 bg-slate-50 text-slate-700',
};

function Timeline({ stages, activeIndex, onSelect }) {
  return (
    <nav
      className="relative rounded-[18px] border border-cyan-900/10 bg-white/70 p-3 shadow-sm backdrop-blur-xl"
      aria-label="中国雨带季节移动时间轴"
      data-ui-component="timeline"
    >
      <div className="absolute left-7 right-7 top-[38px] h-1 rounded-full bg-slate-200" aria-hidden="true">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-amber-300 to-emerald-400"
          animate={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>

      <ol className="grid grid-cols-2 gap-2 md:grid-cols-6">
        {stages.map((stage, index) => {
          const active = index === activeIndex;
          const completed = index < activeIndex;
          const rhythmClass = rhythmClasses[stage.direction] ?? rhythmClasses.north;

          return (
            <li key={stage.id} className="relative z-10">
              <button
                type="button"
                onClick={() => onSelect(index)}
                className={`timeline-stage group flex h-full min-h-[106px] w-full flex-col items-start justify-between rounded-lg border p-3 text-left transition ${
                  active
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-950 shadow-[0_12px_30px_rgba(14,165,233,0.18)]'
                    : 'border-transparent bg-white/55 text-slate-600 hover:border-cyan-200 hover:bg-white'
                }`}
                aria-selected={active}
                data-current-stage={active ? 'true' : 'false'}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-black ${
                    active || completed
                      ? 'border-cyan-500 bg-cyan-500 text-white'
                      : 'border-slate-300 bg-white text-slate-500'
                  }`}
                >
                  {index + 1}
                </span>
                <span>
                  <span className="block text-xs font-bold text-slate-500">{stage.time}</span>
                  <span className="mt-1 block text-sm font-black leading-5">{stage.shortTitle}</span>
                  <span
                    className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-black ${rhythmClass}`}
                  >
                    {stage.rhythmLabel}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Timeline;
