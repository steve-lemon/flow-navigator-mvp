import { Item, Stage, Task, Tool } from './types';

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export const getStageUnresolvedNotesCount = (stage: Stage): number => {
  const stageNotesCount = stage.notes.filter(n => !n.isResolved).length;
  const taskNotesCount = stage.tasks.reduce((sum, task) => sum + task.notes.filter(n => !n.isResolved).length, 0);
  return stageNotesCount + taskNotesCount;
};

export const getNextAction = (item: Item): { stage: Stage; reason: string } | undefined => {
  const sortedStages = [...item.stages].sort((a, b) => a.order - b.order);
  
  // 1. Stage with unresolved notes
  const stageWithNotes = sortedStages.find(s => getStageUnresolvedNotesCount(s) > 0);
  if (stageWithNotes) return { stage: stageWithNotes, reason: 'unresolved_notes' };

  // 2. Doing stage
  const doingStage = sortedStages.find(s => s.status === 'doing');
  if (doingStage) return { stage: doingStage, reason: 'doing' };

  // 3. Todo stage where dependency is done (loose check: just next todo)
  const todoStage = sortedStages.find(s => s.status === 'todo' && s.isRequired);
  if (todoStage) return { stage: todoStage, reason: 'next_todo' };

  return undefined;
};

export const calculateProgress = (item: Item): number => {
  const required = item.stages.filter((s) => s.isRequired && s.status !== 'skip');
  if (required.length === 0) return 0;
  const done = required.filter((s) => s.status === 'done');
  return Math.round((done.length / required.length) * 100);
};

export const getUnresolvedCount = (item: Item): number => {
  return item.stages.reduce((sum, stage) => sum + getStageUnresolvedNotesCount(stage), 0);
};

export const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
};

export const generateToolUrl = (urlTemplate: string, itemId: string, itemName: string, stageId: string, stageName: string, taskId?: string, taskTitle?: string): string => {
  let url = urlTemplate
    .replace(/\{itemId\}/g, itemId || '')
    .replace(/\{itemName\}/g, encodeURIComponent(itemName || ''))
    .replace(/\{stageId\}/g, stageId || '')
    .replace(/\{stageName\}/g, encodeURIComponent(stageName || ''));
  
  if (taskId) {
    url = url.replace(/\{taskId\}/g, taskId);
  }
  if (taskTitle) {
    url = url.replace(/\{taskTitle\}/g, encodeURIComponent(taskTitle));
  }
  return url;
};

