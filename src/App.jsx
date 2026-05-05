import { useEffect, useMemo, useState } from 'react';
import { CloudRain, Database, MapPinned } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Controls from './components/Controls.jsx';
import MonthNavigator from './components/MonthNavigator.jsx';
import RainBeltMap from './components/RainBeltMap.jsx';
import StageCard from './components/StageCard.jsx';
import Timeline from './components/Timeline.jsx';
import { monthMarkers } from './data/monthMarkers.js';
import { rainBeltStages } from './data/rainBeltStages.js';

const DEFAULT_AUTO_DELAY = 4200;

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMonthId, setSelectedMonthId] = useState(monthMarkers[0].id);
  const activeStage = rainBeltStages[activeIndex];
  const progress = useMemo(
    () => Math.round(((activeIndex + 1) / rainBeltStages.length) * 100),
    [activeIndex],
  );

  useEffect(() => {
    if (!isPlaying) return undefined;

    const delay = activeStage.duration ?? DEFAULT_AUTO_DELAY;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => {
        if (current >= rainBeltStages.length - 1) {
          setIsPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [activeIndex, activeStage.duration, isPlaying]);

  useEffect(() => {
    setSelectedMonthId((currentMonthId) => {
      const currentMonth = monthMarkers.find((month) => month.id === currentMonthId);
      if (currentMonth?.stageId === activeStage.id) return currentMonthId;

      return monthMarkers.find((month) => month.stageId === activeStage.id)?.id ?? currentMonthId;
    });
  }, [activeStage.id]);

  const goToStage = (index) => {
    setActiveIndex(index);
    setIsPlaying(false);
  };

  const goToMonth = (month) => {
    const index = rainBeltStages.findIndex((stage) => stage.id === month.stageId);
    if (index >= 0) {
      setSelectedMonthId(month.id);
      setActiveIndex(index);
      setIsPlaying(false);
    }
  };

  const goPrevious = () => {
    setActiveIndex((current) => Math.max(0, current - 1));
    setIsPlaying(false);
  };

  const goNext = () => {
    setActiveIndex((current) => Math.min(rainBeltStages.length - 1, current + 1));
    setIsPlaying(false);
  };

  const replay = () => {
    setActiveIndex(0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (activeIndex === rainBeltStages.length - 1 && !isPlaying) {
      replay();
      return;
    }
    setIsPlaying((value) => !value);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef9fb] text-slate-900">
      <div className="sky-flow pointer-events-none absolute inset-0" />
      <div className="monsoon-current pointer-events-none absolute inset-x-0 bottom-0 h-56" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-cyan-900/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-900/10 bg-white/70 px-3 py-1 text-sm font-medium text-cyan-900 shadow-sm backdrop-blur"
            >
              <CloudRain className="h-4 w-4" />
              动态地理教学演示
            </motion.div>
            <h1 className="text-[clamp(2.15rem,4vw,4.9rem)] font-black leading-none tracking-[0] text-slate-950">
              中国雨带的季节移动
            </h1>
            <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-slate-700 md:text-lg">
              从华南前汛期到江淮梅雨，再到华北、东北雨季
            </p>
          </div>

          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:w-[360px]">
            <div className="rounded-md border border-cyan-900/10 bg-white/65 p-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 font-semibold text-cyan-950">
                <MapPinned className="h-4 w-4" />
                当前节奏
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeStage.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-1 text-slate-600"
                >
                  {activeStage.movement}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="rounded-md border border-cyan-900/10 bg-white/65 p-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 font-semibold text-cyan-950">
                <Database className="h-4 w-4" />
                资料追溯
              </div>
              <p className="mt-1 text-slate-600">{activeStage.sourceRefs.length} 条来源支撑</p>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-5 py-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
          <RainBeltMap stage={activeStage} stages={rainBeltStages} activeIndex={activeIndex} />

          <aside className="flex min-h-0 flex-col gap-4">
            <StageCard stage={activeStage} progress={progress} />
            <Controls
              isPlaying={isPlaying}
              activeIndex={activeIndex}
              total={rainBeltStages.length}
              onTogglePlay={togglePlay}
              onPrevious={goPrevious}
              onNext={goNext}
              onReplay={replay}
            />
          </aside>
        </div>

        <div className="space-y-4">
          <MonthNavigator
            months={monthMarkers}
            activeMonthId={selectedMonthId}
            activeStageId={activeStage.id}
            onSelect={goToMonth}
          />
          <Timeline stages={rainBeltStages} activeIndex={activeIndex} onSelect={goToStage} />
        </div>
      </section>
    </main>
  );
}

export default App;
