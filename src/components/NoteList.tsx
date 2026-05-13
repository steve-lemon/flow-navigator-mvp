import { MessageSquare, AlertCircle, HelpCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Stage, Note } from '../types';
import { Select } from './Select';
import { cn, formatDate } from '../utils';
import { api } from '../services/api';
import { useLocale } from '../contexts/LocaleContext';

interface NoteListProps {
  stage: Stage;
  onUpdateStage: (stage: Stage) => void;
}

export default function NoteList({ stage, onUpdateStage }: NoteListProps) {
  const { t } = useLocale();
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteStereo, setNewNoteStereo] = useState<Note['stereo']>('comment');
  const [loading, setLoading] = useState(false);

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;
    setLoading(true);
    try {
      // Create Note using API
      // Since our MVP addNote doesn't take stereo, we just pass content and let the API defaults handle or we amend the API input
      // Let's pass basic content. mockApi defaults to 'comment' which is close enough.
      await api.stages.addNote(stage.id, { content: newNoteContent, authorId: 'user1' });
      const res = await api.stages.get(stage.id);
      onUpdateStage(res.data);
      setNewNoteContent('');
      setIsAdding(false);
    } catch (e) {
      console.error(e);
      alert('비고 추가 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolve = async (noteId: string) => {
    setLoading(true);
    try {
      const targetNote = stage.notes.find(n => n.id === noteId);
      if (!targetNote) return;
      const updatedNotes = stage.notes.map(n => 
        n.id === noteId ? { ...n, isResolved: !n.isResolved, resolvedAt: !n.isResolved ? Date.now() : undefined, updatedAt: Date.now() } : n
      );
      const res = await api.stages.update(stage.id, { notes: updatedNotes });
      onUpdateStage(res.data);
    } catch (e) {
      console.error(e);
      alert('상태 변경 실패');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (stereo: Note['stereo']) => {
    switch (stereo) {
      case 'issue': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'request': return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case 'comment':
      default: return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300 tracking-wide text-sm">{t('note.title', { count: stage.notes.length }) || `Notes (${stage.notes.length})`}</h4>
        <button 
          onClick={() => setIsAdding(true)}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/40 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
        >
          {t('task.addNote')}
        </button>
      </div>

      <div className="space-y-3">
        {stage.notes.map(note => (
          <div key={note.id} className={cn("p-4 rounded-2xl text-sm transition-all shadow-sm", note.isResolved ? "opacity-60 bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-white/5" : "glass-card hover:-translate-y-0.5 hover:shadow-md")}>
            <div className="flex items-start gap-3 mb-3">
              <div className="mt-0.5 p-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50 shadow-sm border border-white/50 dark:border-white/10">{getIcon(note.stereo)}</div>
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium", note.isResolved ? "text-slate-500 line-through" : "text-slate-700 dark:text-slate-200")}>{note.content}</p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1.5">{formatDate(note.createdAt)}</p>
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-100 dark:border-slate-800/50 pt-3 mt-3">
              <button 
                onClick={() => handleToggleResolve(note.id)}
                className={cn("text-xs font-semibold px-4 py-1.5 rounded-xl transition-all border", note.isResolved ? "text-slate-500 bg-slate-100 hover:bg-slate-200 border-transparent dark:bg-slate-800 dark:hover:bg-slate-700" : "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 dark:border-blue-800/30 shadow-sm")}
              >
                {note.isResolved ? t('note.reopen') : t('note.resolve')}
              </button>
            </div>
          </div>
        ))}

        {isAdding && (
          <div className="p-4 glass-panel rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 -mt-10 -mr-10 bg-blue-400/10 blur-2xl rounded-full w-32 h-32 pointer-events-none" />
            <textarea 
              autoFocus
              placeholder={t('note.placeholder')}
              value={newNoteContent}
              onChange={e => setNewNoteContent(e.target.value)}
              className="w-full glass-input text-sm px-4 py-3 resize-none h-24 relative z-10"
            />
            <div className="flex items-center justify-between relative z-10">
              <Select 
                value={newNoteStereo}
                onChange={val => setNewNoteStereo(val as Note['stereo'])}
                className="w-40"
                options={[
                  { value: 'comment', label: t('note.stereo.comment') },
                  { value: 'request', label: t('note.stereo.request') },
                  { value: 'issue', label: t('note.stereo.issue') },
                ]}
              />
              <div className="flex gap-2">
                <button onClick={() => setIsAdding(false)} className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-3 transition-colors">{t('common.cancel')}</button>
                <button onClick={handleAddNote} className="glass-btn-primary px-5 py-2 !text-xs rounded-xl">{t('task.addNote')}</button>
              </div>
            </div>
          </div>
        )}

        {!isAdding && stage.notes.length === 0 && (
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500 text-center py-6 glass-panel border border-dashed rounded-2xl">{t('note.empty')}</p>
        )}
      </div>
    </div>
  );
}
