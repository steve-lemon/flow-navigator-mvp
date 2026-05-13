import { Plus, CheckCircle2, Circle, ExternalLink, Presentation } from 'lucide-react';
import React, { useState } from 'react';
import Badge from './Badge';
import { Stage, Task, Status, Tool, Item } from '../types';
import { Select } from './Select';
import { cn, generateToolUrl } from '../utils';
import { api } from '../services/api';
import { useLocale } from '../contexts/LocaleContext';

interface TaskListProps {
  item: Item;
  stage: Stage;
  tools: Record<string, Tool>;
  onUpdateStage: (stage: Stage) => void;
  onOpenEmbed: (url: string, title: string) => void;
  onNavigateToFlow: (id: string | null) => void;
}

export default function TaskList({ item, stage, tools, onUpdateStage, onOpenEmbed, onNavigateToFlow }: TaskListProps) {
  const { t } = useLocale();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStereo, setNewTaskStereo] = useState<Task['stereo']>('normal');
  const [loading, setLoading] = useState(false);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setLoading(true);
    try {
      await api.stages.addTask(stage.id, { title: newTaskTitle, authorId: 'user1' });
      // In MVP addTask doesn't support stereo formally, but we persist by fetching back
      const res = await api.stages.get(stage.id);
      onUpdateStage(res.data);
      setNewTaskTitle('');
      setIsAdding(false);
    } catch (e) {
      console.error(e);
      alert('작업 추가 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: string) => {
    setLoading(true);
    try {
      const targetTask = stage.tasks.find(t => t.id === taskId);
      if (!targetTask) return;
      const newStatus: Status = targetTask.status === 'done' ? 'todo' : 'done';
      const updatedTasks = stage.tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus, updatedAt: Date.now() } : t
      );
      const res = await api.stages.update(stage.id, { tasks: updatedTasks });
      onUpdateStage(res.data);
    } catch (e) {
      console.error(e);
      alert('상태 변경 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskTool = async (taskId: string, toolId: string) => {
    setLoading(true);
    try {
      const updatedTasks = stage.tasks.map(t => 
        t.id === taskId ? { ...t, toolId, updatedAt: Date.now() } : t
      );
      const res = await api.stages.update(stage.id, { tasks: updatedTasks });
      onUpdateStage(res.data);
    } catch (e) {
      console.error(e);
      alert('도구 변경 실패');
    } finally {
      setLoading(false);
    }
  };

  const completedCount = stage.tasks.filter(t => t.status === 'done').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300 tracking-wide text-sm">{t('stage.tasksCompleted', { completed: completedCount, total: stage.tasks.length })}</h4>
        <button 
          onClick={() => setIsAdding(true)}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/40 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
        >
          {t('task.addTask')}
        </button>
      </div>

      <div className="space-y-3">
        {stage.tasks.map(task => {
          const taskTool = task.toolId ? tools[task.toolId] : undefined;
          return (
            <div key={task.id} className="group flex flex-col p-5 glass-card transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => handleToggleTaskStatus(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-500 hover:scale-110 transition-all"
                >
                  {task.status === 'done' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className={cn("text-base font-semibold", task.status === 'done' ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200")}>
                      {task.title}
                    </p>
                    <div className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{t(`task.stereo.${task.stereo}`)}</div>
                  </div>
                  {task.guideText && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{task.guideText}</p>
                  )}
                </div>
              </div>
              <div className="ml-10 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                <Select 
                  value={task.toolId || ''}
                  onChange={val => handleUpdateTaskTool(task.id, val)}
                  className="w-[180px]"
                  options={[
                    { value: '', label: t('task.noConnectedTool') },
                    ...Object.values(tools).filter(t => t.isActive || t.id === task.toolId).map(t => ({
                      value: t.id,
                      label: `${t.name}${!t.isActive ? ` - ${t('status.inactive')}` : ''}`
                    }))
                  ]}
                />
                {taskTool ? (
                  <button
                    className="flex shrink-0 items-center gap-2 px-4 py-2 glass-btn-primary !text-xs !py-1.5 rounded-xl"
                    onClick={(e) => {
                      e.preventDefault();
                      const url = generateToolUrl(taskTool.urlTemplate || '', item.id, item.name, stage.id, stage.name, task.id, task.title);
                      if (taskTool.stereo === 'embed') {
                        onOpenEmbed(url, task.actionLabel || taskTool.actionLabel);
                      } else {
                        window.open(url, '_blank');
                      }
                    }}
                  >
                    {taskTool.stereo === 'embed' ? <Presentation className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    {task.actionLabel || taskTool.actionLabel}
                  </button>
                ) : task.actionLabel ? (
                  <button
                    className="flex shrink-0 items-center gap-2 px-4 py-2 glass-btn !text-xs !py-1.5 rounded-xl"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("실행할 도구가 연결되지 않았습니다.");
                    }}
                  >
                    {task.actionLabel}
                  </button>
                ) : (
                  <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-full flex-1 text-right">도구 미연결</span>
                )}
              </div>
            </div>
          );
        })}

        {isAdding && (
          <div className="p-5 glass-panel rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 -mt-10 -mr-10 bg-blue-400/10 blur-2xl rounded-full w-32 h-32 pointer-events-none" />
            <input 
              autoFocus
              type="text"
              placeholder="작업 내용 입력..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="w-full glass-input text-sm px-4 py-3 relative z-10"
            />
            <div className="flex items-center justify-between relative z-10">
              <Select 
                value={newTaskStereo}
                onChange={val => setNewTaskStereo(val as Task['stereo'])}
                className="w-40"
                options={[
                  { value: 'normal', label: t('task.stereo.normal') },
                  { value: 'revision', label: t('task.stereo.revision') },
                  { value: 'review', label: t('task.stereo.review') },
                ]}
              />
              <div className="flex gap-2">
                <button onClick={() => setIsAdding(false)} className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-3 transition-colors">{t('common.cancel')}</button>
                <button onClick={handleAddTask} className="glass-btn-primary px-5 py-2 !text-xs rounded-xl">{t('task.addTask')}</button>
              </div>
            </div>
          </div>
        )}
        
        {!isAdding && stage.tasks.length === 0 && (
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500 text-center py-6 glass-panel border border-dashed rounded-2xl">{t('task.noTasks')}</p>
        )}
        {stage.tasks.length > 0 && completedCount === stage.tasks.length && stage.status !== 'done' && (
          <div className="mt-6 p-6 glass-panel rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in duration-500 shadow-sm border border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/10">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
              <span className="text-base font-semibold">모든 작업이 완료되었습니다.</span>
            </div>
            <button 
              onClick={async () => {
                const res = await api.stages.changeStatus(stage.id, { status: 'done' });
                onUpdateStage(res.data);
              }}
              className="px-6 py-3 w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 outline-none text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all shadow-emerald-500/20"
            >
              {t('task.finishStage')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
