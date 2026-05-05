import { CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

function MonthNavigator({ months, activeMonthId, activeStageId, onSelect }) {
  return (
    <section
      className="rounded-[18px] border border-cyan-900/10 bg-white/70 p-3 shadow-sm backdrop-blur-xl"
      aria-label="按月份定位雨带阶段"
      data-ui-component="month-navigator"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black text-cyan-950">
          <CalendarDays className="h-4 w-4" />
          月份定位
        </div>
        <div className="text-xs font-semibold text-slate-500">点击月份查看对应雨带位置</div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:grid-cols-9">
        {months.map((month) => {
          const exact = month.id === activeMonthId;
          const related = month.stageId === activeStageId;

          return (
            <button
              key={month.id}
              type="button"
              onClick={() => onSelect(month)}
              className={`month-button relative min-h-[74px] overflow-hidden rounded-lg border p-2 text-left transition ${
                exact
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-950 shadow-[0_12px_26px_rgba(14,165,233,0.16)]'
                  : related
                    ? 'border-cyan-200 bg-white/80 text-cyan-900'
                  : 'border-cyan-900/10 bg-white/60 text-slate-600 hover:border-cyan-300 hover:bg-white'
              }`}
              aria-pressed={exact}
              data-current-month-stage={related ? 'true' : 'false'}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-br from-cyan-100/90 via-white/30 to-amber-100/80"
                initial={false}
                animate={{ opacity: exact ? 1 : 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              />
              <span className="relative z-10 block text-sm font-black">{month.label}</span>
              <span className="relative z-10 mt-1 block text-xs font-bold">{month.phase}</span>
              <span className="relative z-10 mt-1 block text-[11px] font-semibold text-slate-500">{month.cue}</span>
              <span className="relative z-10 mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-200">
                <motion.span
                  className="block h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-300 to-amber-300"
                  animate={{ width: `${month.level}%` }}
                  transition={{ duration: 0.45 }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default MonthNavigator;
