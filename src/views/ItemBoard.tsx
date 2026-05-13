import React, { useState } from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import { Item, Actor } from '../types';
import { calculateProgress, formatDate, getNextAction, getUnresolvedCount } from '../utils';
import { cn } from '../utils';
import { Tooltip } from '../components/Tooltip';
import { useLocale } from '../contexts/LocaleContext';

interface ItemBoardProps {
  items: Item[];
  onNavigateToItem: (id: string) => void;
  actors: Record<string, Actor>;
}

export default function ItemBoard({ items, onNavigateToItem, actors }: ItemBoardProps) {
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

  const activeActors = Object.values(actors).filter(a => a.isActive);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('itemboard.title')}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">모든 상품의 진행 과정을 한눈에 확인하세요.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 p-2 glass-panel rounded-full w-max">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const progress = calculateProgress(item);
          const nextData = getNextAction(item);
          const unresolvedCount = getUnresolvedCount(item);
          const status = progress === 0 ? 'todo' : progress === 100 ? 'done' : 'doing';
          
          return (
            <div 
              key={item.id}
              onClick={() => onNavigateToItem(item.id)}
              className={cn(
                "p-6 glass-card cursor-pointer group flex flex-col relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                status === 'doing' ? "ring-2 ring-blue-400/50 dark:ring-blue-500/30 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900" : ""
              )}
            >
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex-1 min-w-0 z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg tracking-tight text-slate-900 dark:text-slate-100 truncate pr-2 max-w-[200px] sm:max-w-xs group-hover:text-blue-500 transition-colors">{item.name}</h4>
                        {item.memo && (
                          <Tooltip content={item.memo}>
                            <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 bg-white/50 dark:bg-slate-800/50 rounded-md shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                              <FileText className="w-4 h-4" />
                            </div>
                          </Tooltip>
                        )}
                      </div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {formatDate(item.updatedAt)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Stages Overview */}
                  <div className="mb-4">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Stages Overview</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.stages.slice().sort((a,b) => a.order - b.order).map(stage => {
                        const isDone = stage.status === 'done';
                        const isDoing = stage.status === 'doing';
                        const isSkip = stage.status === 'skip';
                        const isHold = stage.status === 'hold';
                        return (
                          <React.Fragment key={stage.id}>
                                <Tooltip content={stage.name}>
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

                  {nextData ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-100 dark:border-blue-800">
                      {nextData.stage.actorId && actors[nextData.stage.actorId] && (
                        <span className={`w-1.5 h-1.5 rounded-full ${actors[nextData.stage.actorId].color}`} />
                      )}
                      {nextData.stage.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shadow-sm">
                      모든 작업 완료
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0 z-10">
                  <Badge status={status} />
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
              
              <div className="mt-auto pt-4 z-10">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                   <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">{progress}% Complete</span>
                  {unresolvedCount > 0 && <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">{unresolvedCount} Requests</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
