import { X, ExternalLink, AlertTriangle, Presentation } from 'lucide-react';
import React, { useState } from 'react';
import Badge from './Badge';
import NoteList from './NoteList';
import TaskList from './TaskList';
import { Item, Stage, Status, Actor, Tool } from '../types';
import { Select } from './Select';
import { cn, generateToolUrl } from '../utils';
import { api } from '../services/api';
import { useLocale } from '../contexts/LocaleContext';

interface StageDetailPanelProps {
  item: Item;
  stage: Stage;
  onClose: () => void;
  onUpdateStage: (stage: Stage) => void;
  onOpenEmbed: (url: string, title: string) => void;
  onNavigateToFlow: (id: string | null) => void;
  actors: Record<string, Actor>;
  tools: Record<string, Tool>;
}

export default function StageDetailPanel({ item, stage, onClose, onUpdateStage, onOpenEmbed, onNavigateToFlow, actors, tools }: StageDetailPanelProps) {
  const { t } = useLocale();
  const actor = stage.actorId ? actors[stage.actorId] : undefined;
  const tool = stage.toolId ? tools[stage.toolId] : undefined;
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Status;
    setIsUpdating(true);
    setError(null);
    try {
      const res = await api.stages.changeStatus(stage.id, { status: newStatus });
      if (res.warnings && res.warnings.length > 0) {
        alert('Warnings:\n' + res.warnings.join('\n'));
      }
      onUpdateStage(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActorChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newActorId = e.target.value;
    setIsUpdating(true);
    setError(null);
    try {
      const res = await api.stages.update(stage.id, { actorId: newActorId });
      onUpdateStage(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to update actor');
    } finally {
      setIsUpdating(false);
    }
  };

  const hasUnresolvedDeps = stage.dependencyStageIds.some(depId => {
    const depStage = item.stages.find(s => s.id === depId);
    return depStage && depStage.status !== 'done' && depStage.status !== 'skip';
  });

  const handleToolClick = (e: React.MouseEvent) => {
    if (tool && tool.stereo === 'embed') {
      e.preventDefault();
      onOpenEmbed(generateToolUrl(tool.urlTemplate || '', item.id, item.name, stage.id, stage.name), tool.name);
    }
  };

  const activeActors = Object.values(actors).filter(a => a.isActive || a.id === stage.actorId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 transition-opacity" 
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl h-full border-l border-white/20 dark:border-white/10 flex flex-col animate-in slide-in-from-right-full duration-500 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/20 dark:border-slate-800/50 bg-white/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 tracking-tight">{stage.name}</h3>
            <Badge status={stage.status} />
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar relative z-10">
          {hasUnresolvedDeps && (
            <div className="glass-panel p-4 flex gap-3 text-sm shadow-sm border border-amber-200/50 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800/30">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">선행 작업 미완료</p>
                <p className="font-medium text-amber-600/80 dark:text-amber-500/80 relative mt-1">선행 작업이 완료되지 않았습니다. 그래도 진행할 수 있습니다.</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">{t('common.status')}</label>
              <Select 
                value={stage.status}
                onChange={(val) => handleStatusChange({ target: { value: val } } as any)}
                options={[
                  { value: 'todo', label: t('status.todo') },
                  { value: 'doing', label: t('status.doing') },
                  { value: 'done', label: t('status.done') },
                  { value: 'hold', label: t('status.hold') },
                  { value: 'skip', label: t('status.skip') },
                ]}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">{t('common.assignee')}</label>
              <Select 
                value={stage.actorId || ''}
                onChange={(val) => handleActorChange({ target: { value: val } } as any)}
                options={[
                  { value: '', label: t('status.unassigned') },
                  ...activeActors.map(act => ({
                    value: act.id,
                    label: `${act.name} (${act.stereo})${!act.isActive ? ` - ${t('status.inactive')}` : ''}`
                  }))
                ]}
              />
            </div>
          </div>

          <div className="glass-panel p-4 text-sm font-medium text-blue-800 dark:text-blue-200 border border-blue-200/50 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-900/10">
            {stage.guideText}
          </div>

          {tool && tool.stereo !== 'flow' && (
            <div>
              <a 
                href={generateToolUrl(tool.urlTemplate || '', item.id, item.name, stage.id, stage.name)}
                target="_blank"
                rel="noreferrer"
                onClick={handleToolClick}
                className="w-full flex items-center justify-center gap-2 glass-btn-primary px-4 py-4 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold"
              >
                {stage.actionLabel || tool.actionLabel}
                {tool.stereo === 'embed' ? (
                  <Presentation className="w-5 h-5 opacity-80" />
                ) : (
                  <ExternalLink className="w-5 h-5 opacity-80" />
                )}
              </a>
            </div>
          )}

          {tool && tool.stereo === 'flow' && (!stage.tasks || stage.tasks.length === 0) && (
            <div>
              <button 
                onClick={async () => {
                  if (!tool.taskTemplates) return;
                  const newTasks = tool.taskTemplates.map((tt, index) => ({
                    id: `task-${Date.now()}-${index}`,
                    stageId: stage.id,
                    title: tt.title,
                    stereo: 'normal' as const,
                    status: 'todo' as const,
                    guideText: tt.guideText,
                    actionLabel: tt.actionLabel,
                    toolId: tt.toolId,
                    notes: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  }));
                  try {
                    // Update tasks first
                    const res = await api.stages.update(stage.id, { 
                      tasks: [...(stage.tasks || []), ...newTasks]
                    });
                    
                    if (stage.status === 'todo') {
                      const statusRes = await api.stages.changeStatus(stage.id, { status: 'doing' });
                      onUpdateStage(statusRes.data);
                    } else {
                      onUpdateStage(res.data);
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 outline-none text-white px-4 py-3 font-semibold rounded-xl transition-all shadow-sm shadow-indigo-500/20"
              >
                {stage.actionLabel || tool.actionLabel}
              </button>
              {stage.stereo !== 'flow' && (
                <p className="text-[10px] text-amber-500 dark:text-amber-400 mt-3 text-center flex items-center justify-center gap-1 font-medium">
                  <AlertTriangle className="w-3 h-3" /> 이 Stage는 flow Tool을 사용하지만 Stage stereo가 flow가 아닙니다.
                </p>
              )}
            </div>
          )}

          {(stage.stereo === 'iterative' || (tool && tool.stereo === 'flow' && stage.tasks && stage.tasks.length > 0)) && (
            <TaskList item={item} stage={stage} tools={tools} onUpdateStage={onUpdateStage} onOpenEmbed={onOpenEmbed} onNavigateToFlow={onNavigateToFlow} />
          )}

          <NoteList stage={stage} onUpdateStage={onUpdateStage} />

        </div>
        
        <div className="p-6 border-t border-white/20 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 relative z-10 backdrop-blur-md">
           <button 
            onClick={() => onUpdateStage({ ...stage, status: 'done', updatedAt: Date.now() })}
            className="w-full bg-emerald-500 hover:bg-emerald-600 outline-none text-white px-4 py-3 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all shadow-emerald-500/20"
           >
             {t('task.markAsDone')}
           </button>
        </div>
      </div>
    </div>
  );
}
