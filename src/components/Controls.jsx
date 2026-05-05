import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

function Controls({ isPlaying, activeIndex, total, onTogglePlay, onPrevious, onNext, onReplay }) {
  return (
    <div
      className="rounded-[20px] border border-cyan-900/10 bg-white/75 p-4 shadow-sm backdrop-blur-xl"
      data-ui-component="controls"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-black text-cyan-950">演示控制</p>
        <p className="text-sm font-bold text-slate-500">
          {activeIndex + 1}/{total}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={activeIndex === 0}
          title="上一步"
          aria-label="上一步"
          className="control-button"
        >
          <SkipBack className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          title={isPlaying ? '暂停' : '播放'}
          aria-label={isPlaying ? '暂停' : '播放'}
          data-play-button="true"
          className="control-button primary"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={activeIndex === total - 1}
          title="下一步"
          aria-label="下一步"
          className="control-button"
        >
          <SkipForward className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onReplay}
          title="重新播放"
          aria-label="重新播放"
          className="control-button"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default Controls;
