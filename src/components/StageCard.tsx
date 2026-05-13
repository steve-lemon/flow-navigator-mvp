import { CheckCircle2 } from 'lucide-react';
import React from 'react';
import { Stage, Status, Actor, Tool } from '../types';
import { cn, getStageUnresolvedNotesCount } from '../utils';
import Badge from './Badge';
import { Tooltip } from './Tooltip';
import { useLocale } from '../contexts/LocaleContext';

interface StageCardProps {
  key?: React.Key;
  stage: Stage;
  onStatusChange: (status: Status) => void;
  isActive: boolean;
  index: number;
  actors: Record<string, Actor>;
  tool?: Tool;
}

export default function StageCard({ stage, onStatusChange, isActive, index, actors, tool }: StageCardProps) {
  const { t } = useLocale();
  const actor = stage.actorId ? actors[stage.actorId] : null;
  const unresolvedCount = getStageUnresolvedNotesCount(stage);
  
  const completedTasks = stage.tasks?.filter(t => t.status === 'done').length || 0;
  const totalTasks = stage.tasks?.length || 0;
  
  const hasFlowTasks = tool?.stereo === 'flow' && totalTasks > 0;
  const showTaskProgress = stage.stereo === 'iterative' || hasFlowTasks;

  const getNextTask = () => {
    if (!hasFlowTasks) return null;
    return stage.tasks?.find(t => t.status !== 'done' && t.status !== 'skip');
  };
  const nextTask = getNextTask();

  return (
    <div className={cn(
      "p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all duration-300 rounded-3xl group relative",
      isActive ? "ring-2 ring-blue-500/50 bg-blue-50/30 dark:bg-blue-900/10 shadow-md ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900" : 
      (stage.status === 'done' ? "opacity-75 glass-panel" : "glass-card hover:shadow-md hover:-translate-y-0.5")
    )}>
      {isActive && <div className="absolute top-0 right-0 p-4 -mt-6 -mr-6 bg-blue-500/10 blur-xl rounded-full w-24 h-24 pointer-events-none" />}
      <div className="flex items-center md:flex-col md:w-12 shrink-0 gap-3 md:gap-0 relative z-10">
        <span className={cn("text-[10px] font-semibold uppercase tracking-widest mb-2", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400")}>Step {index + 1}</span>
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors",
          stage.status === 'done' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : 
          isActive ? "bg-blue-500 text-white shadow-blue-500/30" : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-white/50 dark:border-white/10"
        )}>
           {stage.status === 'done' ? <CheckCircle2 className="w-6 h-6"/> : index + 1}
        </div>
      </div>

      <div className="flex-1 relative z-10">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h4 className={cn("font-semibold tracking-tight text-xl", isActive ? "text-blue-900 dark:text-blue-100" : "text-slate-900 dark:text-slate-100")}>{stage.name}</h4>
          <Badge status={stage.status} />
          {unresolvedCount > 0 && (
            <span className="flex items-center gap-1 text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              {unresolvedCount} Requests
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <p className={cn("text-sm", isActive ? "text-blue-700/80 dark:text-blue-300/80" : "text-slate-600 dark:text-slate-400")}>{stage.guideText}</p>
          {showTaskProgress && totalTasks > 0 && (
            <div className="flex items-center gap-4 mt-3">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                작업 {completedTasks}/{totalTasks} 완료
              </span>
              {nextTask && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                  <span className="text-blue-500">→</span> 다음 작업: {nextTask.title}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 items-center flex-wrap shrink-0 mt-2 md:mt-0 pt-4 border-t border-slate-200 dark:border-slate-700/50 md:pt-0 md:border-0 w-full md:w-auto relative z-10" onClick={(e) => e.stopPropagation()}>
        {actor ? (
          <Tooltip content={actor.name}>
            <div className={cn("px-4 py-2 h-10 rounded-xl flex items-center justify-center text-xs font-semibold shadow-sm border border-white/50 dark:border-white/10", actor.color)}>
               {actor.name}
            </div>
          </Tooltip>
        ) : (
          <Tooltip content="담당자 없음">
            <div className="px-4 py-2 h-10 rounded-xl flex items-center justify-center text-[10px] text-slate-400 bg-white/50 dark:bg-slate-800/50 font-semibold tracking-widest border border-white/50 dark:border-white/10 shadow-sm">
               담당자 없음
            </div>
          </Tooltip>
        )}
        <div className="flex gap-2 ml-auto md:ml-0">
          {isActive ? (
            <button onClick={() => onStatusChange('done')} className="glass-btn-primary px-5 py-2 text-xs font-semibold tracking-wider rounded-xl">Complete</button>
          ) : stage.status !== 'done' ? (
            <button onClick={() => onStatusChange('done')} className="glass-btn px-5 py-2 text-xs font-semibold tracking-wider rounded-xl !bg-white/80 dark:!bg-slate-800/80 hover:!bg-emerald-50 dark:hover:!bg-emerald-900/30 hover:!text-emerald-600 dark:hover:!text-emerald-400 border border-white/50 dark:border-white/10 text-slate-600 dark:text-slate-300">Complete</button>
          ) : null}
          {stage.status !== 'done' && (
            <button 
              onClick={() => onStatusChange(stage.status === 'hold' ? 'doing' : 'hold')}
              className={cn("glass-btn px-5 py-2 text-xs font-semibold tracking-wider rounded-xl border border-white/50 dark:border-white/10 text-slate-600 dark:text-slate-300", stage.status === 'hold' ? "!bg-orange-50 dark:!bg-orange-900/30 !text-orange-600 dark:!text-orange-400" : "!bg-white/80 dark:!bg-slate-800/80 hover:!bg-slate-100 dark:hover:!bg-slate-700")}
            >
              {stage.status === 'hold' ? t('status.resume') : t('status.hold')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
