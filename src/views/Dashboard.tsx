import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import { Item, Actor } from '../types';
import { calculateProgress, getNextAction, getStageUnresolvedNotesCount, getUnresolvedCount, cn } from '../utils';
import { Tooltip } from '../components/Tooltip';
import { useLocale } from '../contexts/LocaleContext';

interface DashboardProps {
  items: Item[];
  onNavigateToItem: (id: string) => void;
  actors: Record<string, Actor>;
}

export default function Dashboard({ items, onNavigateToItem, actors }: DashboardProps) {
  const { t } = useLocale();
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);

  const filteredItems = items.filter(item => {
    if (!selectedActorId) return true;
    return item.stages.some(s => 
      s.actorId === selectedActorId || 
      s.tasks.some(t => t.actorId === selectedActorId) ||
      s.notes.some(n => n.targetActorId === selectedActorId && !n.isResolved)
    );
  });

  const ongoingItems = filteredItems.filter((item) => calculateProgress(item) < 100);
  const doneItems = filteredItems.filter((item) => calculateProgress(item) === 100);
  const unresolvedCount = filteredItems.reduce((sum, item) => sum + getUnresolvedCount(item), 0);

  const nextActions = ongoingItems
    .map((item) => ({ item, nextData: getNextAction(item) }))
    .filter((data) => data.nextData !== undefined);

  const actorWorkCounts = nextActions.reduce((acc, curr) => {
    if (curr.nextData && curr.nextData.stage.actorId) {
      const actorId = curr.nextData.stage.actorId;
      acc[actorId] = (acc[actorId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const activeActors = Object.values(actors).filter(a => a.isActive);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="flex flex-wrap gap-2 mb-2 p-2 glass-panel rounded-full w-max">
        <button
          onClick={() => setSelectedActorId(null)}
          className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all duration-300", !selectedActorId ? "bg-white/80 dark:bg-slate-800/80 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100")}
        >
          {t('common.all')}
        </button>
        {activeActors.map(actor => (
          <button
            key={actor.id}
            onClick={() => setSelectedActorId(actor.id)}
            className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2", selectedActorId === actor.id ? "bg-white/80 dark:bg-slate-800/80 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100")}
          >
            <span className={`w-2 h-2 rounded-full ${actor.color}`} />
            {actor.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Items</p>
          <p className="text-4xl font-semibold bg-gradient-to-br from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">{filteredItems.length}</p>
        </div>
        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 -mt-2 -mr-2 bg-blue-500/10 blur-2xl rounded-full w-20 h-20" />
          <p className="text-blue-500 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">{t('dashboard.doing')}</p>
          <p className="text-4xl font-semibold bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">{ongoingItems.length}</p>
        </div>
        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 -mt-2 -mr-2 bg-emerald-500/10 blur-2xl rounded-full w-20 h-20" />
          <p className="text-emerald-500 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">{t('dashboard.progress')}</p>
          <p className="text-4xl font-semibold bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">{doneItems.length}</p>
        </div>
        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 -mt-2 -mr-2 bg-rose-500/10 blur-2xl rounded-full w-20 h-20" />
          <p className="text-rose-500 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">{t('dashboard.requests')}</p>
          <p className="text-4xl font-semibold bg-gradient-to-br from-rose-500 to-orange-500 dark:from-rose-400 dark:to-orange-300 bg-clip-text text-transparent">{unresolvedCount}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Next Actions */}
        <div className="lg:col-span-8 glass-panel rounded-3xl flex flex-col relative z-10 overflow-hidden">
          <div className="p-6 border-b border-white/20 dark:border-white/5 flex justify-between items-center bg-white/30 dark:bg-slate-800/30 backdrop-blur-md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Active Action Needed</h3>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full uppercase tracking-widest">{nextActions.length} PENDING</span>
          </div>
          
          <div className="p-4 space-y-3 bg-transparent">
            {nextActions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-blue-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-slate-500 dark:text-slate-400 font-medium text-lg">You're all caught up!</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">No mandatory next actions.</p>
              </div>
            ) : (
              nextActions.map(({ item, nextData }) => {
                if (!nextData) return null;
                const { stage } = nextData;
                const progress = calculateProgress(item);
                const unresolved = getStageUnresolvedNotesCount(stage);
                const stageActor = stage.actorId ? actors[stage.actorId] : undefined;
                return (
                  <div 
                    key={item.id}
                    onClick={() => onNavigateToItem(item.id)}
                    className="p-5 glass-card cursor-pointer group relative"
                  >
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div className="flex-1 min-w-0 z-10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg tracking-tight text-slate-900 dark:text-slate-100 mb-1 truncate pr-2 group-hover:text-blue-500 transition-colors">{item.name}</h4>
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                {stageActor && <span className={`w-1.5 h-1.5 rounded-full ${stageActor.color}`} />}
                                {stage.name}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Stages Overview */}
                        <div className="mt-4">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Stages Overview</p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.stages.slice().sort((a,b) => a.order - b.order).map(s => {
                              const isDone = s.status === 'done';
                              const isDoing = s.status === 'doing';
                              const isSkip = s.status === 'skip';
                              const isHold = s.status === 'hold';
                              return (
                                <React.Fragment key={s.id}>
                                  <Tooltip content={s.name}>
                                    <div 
                                      className={cn(
                                        "w-8 h-2 rounded-full transition-all duration-300",
                                        isDone ? "bg-emerald-500/90 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : 
                                        isDoing ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] ring-2 ring-blue-500/20" :
                                        isHold ? "bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.4)]" :
                                        isSkip ? "bg-slate-400/50 dark:bg-slate-600/50" : "bg-slate-200 dark:bg-slate-700/50"
                                      )}
                                    />
                                  </Tooltip>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                      
                      <div className="flex flex-col items-end gap-3 shrink-0 z-10">
                        {item.thumbnailUrl ? (
                          <img 
                            src={item.thumbnailUrl} 
                            alt={item.name} 
                            className="w-32 h-32 object-cover rounded-2xl shadow-sm border border-white/50 dark:border-white/10" 
                          />
                        ) : (
                           <div className="w-32 h-32 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/10 flex items-center justify-center font-medium text-xs text-slate-400 pointer-events-none shadow-sm">NO IMG</div>
                        )}
                      </div>
                    </div>
                    <div className="z-10 relative pt-4 mt-2">
                       <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                          <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                       </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[10px] font-semibold text-slate-500">{progress}% DONE</span>
                        {unresolved > 0 ? (
                          <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">{unresolved} REQUESTS</span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500">NEXT: {stage.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Actor Summary */}
        <div className="lg:col-span-4 glass-panel rounded-3xl flex flex-col relative z-20 overflow-hidden">
          <div className="p-6 border-b border-white/20 dark:border-white/5 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Team Workload</h3>
          </div>
          <div className="p-4 space-y-3 h-full bg-transparent">
            {Object.values(actors).filter(a => a.isActive || actorWorkCounts[a.id]).map((actor) => {
              const count = actorWorkCounts[actor.id] || 0;
              return (
                <div key={actor.id} className="flex items-center justify-between p-4 glass-card shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full shadow-sm ${actor.color}`} />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{actor.name}</span>
                    {!actor.isActive && <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest">OFF</span>}
                  </div>
                  <span className="bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-white/40 dark:border-white/10 px-3 py-1 rounded-full text-xs font-medium">
                    {count} TASKS
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

