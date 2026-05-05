import { AnimatePresence, motion } from 'framer-motion';
import { Map, Sparkles, ThermometerSun } from 'lucide-react';

function StageCard({ stage, progress }) {
  return (
    <article className="stage-card flex h-[620px] min-h-[620px] flex-col overflow-hidden rounded-[20px] border border-cyan-900/10 bg-white/75 p-4 shadow-climate backdrop-blur-xl lg:h-[620px] lg:min-h-[620px]">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={stage.id}
          className="flex h-full min-h-0 flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        >
          <div className="mb-3 flex min-h-[82px] shrink-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase text-cyan-700">{stage.time}</p>
              <h2 className="mt-1 text-[clamp(1.35rem,2.15vw,2rem)] font-black leading-tight tracking-[0] text-slate-950">
                {stage.title}
              </h2>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-amber-100 text-cyan-800">
              <ThermometerSun className="h-6 w-6" />
            </div>
          </div>

          <div className="mb-3 min-h-[88px] shrink-0 rounded-lg border border-cyan-700/15 bg-gradient-to-r from-cyan-50 to-amber-50 p-3">
            <div className="text-xs font-black uppercase text-cyan-800">本阶段结论</div>
            <p className="mt-1.5 text-[17px] font-black leading-6 text-slate-900">{stage.keyPoint}</p>
          </div>

          <div className="stage-card-body grid min-h-0 flex-1 gap-2 overflow-y-auto pr-1">
            <section className="rounded-lg border border-cyan-900/10 bg-cyan-50/70 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-cyan-950">
                <Map className="h-4 w-4" />
                雨带位置
              </div>
              <p className="text-[15px] font-semibold leading-6 text-slate-700">{stage.region}</p>
            </section>

            <section className="rounded-lg border border-cyan-900/10 bg-white/70 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-cyan-950">
                <Sparkles className="h-4 w-4" />
                降水特征
              </div>
              <ul className="space-y-1.5 text-[14px] leading-5 text-slate-700">
                {stage.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-amber-300/40 bg-amber-50/75 p-3">
              <div className="text-sm font-black text-amber-900">课堂讲解点</div>
              <p className="mt-1.5 text-[14px] leading-5 text-slate-700">{stage.classroomCue}</p>
            </section>
          </div>

          <div className="mt-3 shrink-0">
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
