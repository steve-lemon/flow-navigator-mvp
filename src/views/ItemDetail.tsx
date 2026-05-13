import { useState } from 'react';
import Badge from '../components/Badge';
import StageCard from '../components/StageCard';
import StageDetailPanel from '../components/StageDetailPanel';
import { Item, Stage, Status, Actor, Tool } from '../types';
import { cn, calculateProgress, formatDate, getNextAction, getStageUnresolvedNotesCount } from '../utils';
import { Edit2, Check, X } from 'lucide-react';
import { api } from '../services/api';

interface ItemDetailProps {
  item: Item;
  onUpdateItem: (item: Item) => void;
  onOpenEmbed: (url: string, title: string) => void;
  onNavigateToFlow: (id: string | null) => void;
  actors: Record<string, Actor>;
  tools: Record<string, Tool>;
}

export default function ItemDetail({ item, onUpdateItem, onOpenEmbed, onNavigateToFlow, actors, tools }: ItemDetailProps) {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoInput, setMemoInput] = useState(item.memo || '');

  const progress = calculateProgress(item);
  const nextData = getNextAction(item);

  const handleUpdateStageStatus = (stageId: string, status: Status) => {
    const updatedStages = item.stages.map(s => s.id === stageId ? { ...s, status } : s);
    onUpdateItem({ ...item, stages: updatedStages, updatedAt: Date.now() });
  };

  const handleUpdateStage = (updatedStage: Stage) => {
    const updatedStages = item.stages.map(s => s.id === updatedStage.id ? updatedStage : s);
    onUpdateItem({ ...item, stages: updatedStages, updatedAt: Date.now() });
  };

  const handleSaveMemo = async () => {
    try {
      const res = await api.items.update(item.id, { memo: memoInput });
      onUpdateItem(res.data);
      setIsEditingMemo(false);
    } catch (err) {
      console.error('Failed to update memo', err);
    }
  };

  const selectedStage = item.stages.find(s => s.id === selectedStageId);

  return (
    <div className="animate-in fade-in duration-500 ease-out flex flex-col h-full relative slide-in-from-right-4">
      <div className="glass-panel p-8 relative shrink-0 transition-all rounded-3xl overflow-hidden mb-6">
        <div className="absolute top-0 right-0 p-4 -mt-10 -mr-10 bg-orange-500/10 blur-3xl rounded-full w-40 h-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 p-4 -mb-10 -ml-10 bg-blue-500/10 blur-3xl rounded-full w-40 h-40 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-6">
              {item.thumbnailUrl ? (
                <img 
                  src={item.thumbnailUrl} 
                  alt={item.name} 
                  className="w-32 h-32 object-cover rounded-2xl shadow-sm border border-white/50 dark:border-white/10 flex-shrink-0"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/10 flex-shrink-0 flex items-center justify-center font-semibold text-xs text-slate-400 shadow-sm">NO IMG</div>
              )}
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">{item.name}</h2>
                <div className="flex items-center gap-4 mb-3">
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-[11px] tracking-wider uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Updated: {formatDate(item.updatedAt)}</p>
                  <Badge status={progress === 100 ? 'done' : 'doing'} />
                </div>
                
                {isEditingMemo ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      className="glass-input text-sm px-4 py-2 w-72"
                      value={memoInput}
                      onChange={(e) => setMemoInput(e.target.value)}
                      placeholder="메모를 입력하세요..."
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveMemo();
                        if (e.key === 'Escape') {
                          setIsEditingMemo(false);
                          setMemoInput(item.memo || '');
                        }
                      }}
                    />
                    <button onClick={handleSaveMemo} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setIsEditingMemo(false); setMemoInput(item.memo || ''); }} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="group flex items-center gap-3 mt-2 cursor-pointer glass-card px-4 py-2 w-max hover:shadow-md transition-all rounded-xl" onClick={() => setIsEditingMemo(true)}>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-lg truncate">
                      {item.memo ? item.memo : <span className="text-slate-400">ADD MEMO...</span>}
                    </p>
                    <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                )}
              </div>
            </div>
            <div className="glass-card px-6 py-4 rounded-2xl text-center hidden sm:flex flex-col items-center justify-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest mb-1">Overall Progress</p>
              <p className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">{progress}%</p>
            </div>
          </div>

          {nextData && (
            <div className="glass-card mt-6 p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-blue-200/50 dark:border-blue-800/30 bg-blue-50/30 dark:bg-blue-900/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 -mt-10 -mr-10 bg-blue-500/10 blur-2xl rounded-full w-32 h-32 pointer-events-none" />
              <div className="flex items-center gap-5 w-full md:w-auto relative z-10"> 
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-sm border border-white/50 dark:border-white/10", nextData.reason === 'unresolved_notes' ? "bg-rose-100 dark:bg-rose-900/30" : "bg-blue-100 dark:bg-blue-900/30")}>
                  {nextData.reason === 'unresolved_notes' ? '⚠️' : '🚀'}
                </div>
                <div>
                  <p className={cn("text-[11px] font-semibold uppercase tracking-widest mb-1", nextData.reason === 'unresolved_notes' ? "text-rose-600 dark:text-rose-400" : "text-blue-600 dark:text-blue-400")}>
                    {nextData.reason === 'unresolved_notes' ? 'Action Required: Resolve Requests' : 'Next Recommended Action'}
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {nextData.stage.actorId && actors[nextData.stage.actorId] ? actors[nextData.stage.actorId].name : ''} <span className="text-slate-300 dark:text-slate-600 mx-1">•</span> {nextData.stage.name}
                  </p>
                </div>
              </div>
              <button 
                className="w-full md:w-auto glass-btn-primary px-8 py-4 font-semibold tracking-wider text-sm rounded-xl shrink-0 relative z-10"
                onClick={() => setSelectedStageId(nextData.stage.id)}
              >
                {nextData.reason === 'unresolved_notes' ? 'View Requests' : nextData.stage.actionLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-6">
        {item.stages.sort((a,b) => a.order - b.order).map((stage, index) => {
          const isActive = nextData?.stage.id === stage.id;
          return (
            <div key={stage.id} onClick={() => setSelectedStageId(stage.id)} className="cursor-pointer">
              <StageCard 
                stage={stage} 
                isActive={isActive}
                onStatusChange={(status) => handleUpdateStageStatus(stage.id, status)}
                index={index}
                actors={actors}
                tool={stage.toolId ? tools[stage.toolId] : undefined}
              />
            </div>
          );
        })}
      </div>

      {selectedStage && (
        <StageDetailPanel
          item={item}
          stage={selectedStage}
          onClose={() => setSelectedStageId(null)}
          onUpdateStage={handleUpdateStage}
          onOpenEmbed={onOpenEmbed}
          onNavigateToFlow={onNavigateToFlow}
          actors={actors}
          tools={tools}
        />
      )}
    </div>
  );
}
