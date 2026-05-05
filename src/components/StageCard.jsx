import { AnimatePresence, motion } from 'framer-motion';
import { Map, Sparkles, ThermometerSun } from 'lucide-react';

function StageCard({ stage, progress }) {
  return (
    <article className="stage-card flex-1 rounded-[20px] border border-cyan-900/10 bg-white/75 p-5 shadow-climate backdrop-blur-xl">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-cyan-700">{stage.time}</p>
              <h2 className="mt-1 text-[clamp(1.45rem,2.5vw,2.35rem)] font-black leading-tight tracking-[0] text-slate-950">
                {stage.title}
              </h2>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-amber-100 text-cyan-800">
              <ThermometerSun className="h-7 w-7" />
            </div>
          </div>

          <div className="mb-3 rounded-lg border border-cyan-700/15 bg-gradient-to-r from-cyan-50 to-amber-50 p-4">
            <div className="text-xs font-black uppercase text-cyan-800">本阶段结论</div>
            <p className="mt-2 text-lg font-black leading-7 text-slate-900">{stage.keyPoint}</p>
          </div>

          <div className="grid gap-3">
            <section className="rounded-lg border border-cyan-900/10 bg-cyan-50/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-cyan-950">
                <Map className="h-4 w-4" />
                雨带位置
              </div>
              <p className="text-base font-semibold leading-7 text-slate-700">{stage.region}</p>
            </section>

            <section className="rounded-lg border border-cyan-900/10 bg-white/70 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-cyan-950">
                <Sparkles className="h-4 w-4" />
                降水特征
              </div>
              <ul className="space-y-2 text-[15px] leading-6 text-slate-700">
                {stage.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-amber-300/40 bg-amber-50/75 p-4">
              <div className="text-sm font-black text-amber-900">课堂讲解点</div>
              <p className="mt-2 text-[15px] leading-6 text-slate-700">{stage.classroomCue}</p>
            </section>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
              <span>春季建立</span>
              <span>秋季退出</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-cyan-400 to-teal-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45 }}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </article>
  );
}

export default StageCard;
