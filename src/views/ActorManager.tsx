import React, { useState } from 'react';
import { Actor } from '../types';
import { Plus, Edit2, Archive, ArchiveRestore, X } from 'lucide-react';
import { cn } from '../utils';
import { TooltipLabel, Tooltip } from '../components/Tooltip';

interface ActorManagerProps {
  actors: Record<string, Actor>;
  onCreateActor: (actor: Partial<Actor>) => Promise<void>;
  onUpdateActor: (id: string, actor: Partial<Actor>) => Promise<void>;
  onDeactivateActor: (id: string) => Promise<void>;
  onActivateActor: (id: string) => Promise<void>;
}

export default function ActorManager({ actors, onCreateActor, onUpdateActor, onDeactivateActor, onActivateActor }: ActorManagerProps) {
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActorId, setEditingActorId] = useState<string | null>(null);

  const actorList = Object.values(actors)
    .filter(a => showInactive || a.isActive)
    .sort((a, b) => b.createdAt - a.createdAt); // newest first, or maybe sort by name

  const handleOpenCreate = () => {
    setEditingActorId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (id: string) => {
    setEditingActorId(id);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (actor: Actor) => {
    if (actor.isActive) {
      if (confirm(`'${actor.name}'을(를) 비활성화하시겠습니까?\n이미 할당된 작업은 유지됩니다.`)) {
        await onDeactivateActor(actor.id);
      }
    } else {
      await onActivateActor(actor.id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Team & Actors</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">작업을 할당할 수 있는 가상 담당자를 생성하고 관리합니다.</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400 font-medium">
            <input 
              type="checkbox" 
              checked={showInactive} 
              onChange={e => setShowInactive(e.target.checked)}
              className="rounded text-blue-500 bg-white/50 border-white/30 focus:ring-blue-500 dark:bg-slate-800/50 dark:border-slate-600"
            />
            비활성 담당자 보기
          </label>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 glass-btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            새 담당자 추가
          </button>
        </div>
      </div>

      {actorList.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
          <div className="w-16 h-16 bg-white/50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-sm border border-white/50 dark:border-slate-700">
            <Archive className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 relative">아직 담당자가 없습니다</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 relative">먼저 팀이나 담당자를 추가해보세요.</p>
          <button onClick={handleOpenCreate} className="mt-6 px-6 py-2.5 glass-btn-primary font-semibold rounded-xl relative">
            담당자 만들기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actorList.map(actor => (
            <div key={actor.id} className={cn("glass-card rounded-2xl p-5 transition-all group relative", !actor.isActive && "opacity-60 bg-slate-50/30 dark:bg-slate-900/30")}>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${actor.color}`} />
                  <Tooltip content={actor.name}>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[140px] block cursor-default">{actor.name}</h3>
                  </Tooltip>
                  {!actor.isActive && <span className="text-[10px] bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">비활성</span>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip content="수정">
                    <button onClick={() => handleOpenEdit(actor.id)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content={actor.isActive ? "비활성화" : "활성화"}>
                    <button onClick={() => handleToggleActive(actor)} className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                      {actor.isActive ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
                    </button>
                  </Tooltip>
                </div>
              </div>
              
              <div className="mb-4 relative z-10">
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  actor.stereo === 'team' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-300" :
                  actor.stereo === 'person' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300" :
                  "bg-slate-500/10 border-slate-500/20 text-slate-700 dark:text-slate-300"
                )}>
                  {actor.stereo}
                </span>
                {actor.memo && <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">{actor.memo}</p>}
              </div>
              
              {/* Note: Workload stats will be implemented in a follow-up or next edits using items data */}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <ActorModal 
          actor={editingActorId ? actors[editingActorId] : undefined}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data) => {
            if (editingActorId) await onUpdateActor(editingActorId, data);
            else await onCreateActor(data);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ActorModal({ actor, onClose, onSave }: { actor?: Actor, onClose: () => void, onSave: (data: Partial<Actor>) => Promise<void> }) {
  const isEditing = !!actor;
  const [name, setName] = useState(actor?.name || '');
  const [stereo, setStereo] = useState<'person' | 'team' | 'vendor'>(actor?.stereo || 'team');
  const [color, setColor] = useState(actor?.color || 'bg-[#7c3aed]');
  const [memo, setMemo] = useState(actor?.memo || '');
  const [saving, setSaving] = useState(false);

  const colors = [
    'bg-[#7c3aed]', 'bg-[#2563eb]', 'bg-[#10b981]', 'bg-[#db2777]', 'bg-[#ea580c]', 'bg-[#eab308]', 
    'bg-[#14b8a6]', 'bg-[#6366f1]', 'bg-[#8b5cf6]', 'bg-[#f43f5e]', 'bg-[#0ea5e9]', 'bg-[#64748b]'
  ];

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name, stereo, color, memo });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-0 right-0 p-8 -mt-10 -mr-10 bg-blue-500/10 blur-3xl rounded-full w-40 h-40" />
        </div>
        <div className="px-6 py-5 border-b border-white/20 dark:border-slate-800/50 bg-white/40 dark:bg-slate-800/40 flex justify-between items-center relative z-10 rounded-t-3xl">
          <h3 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 text-lg">{isEditing ? '담당자 수정' : '새 담당자 추가'}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5 relative z-10">
          <div>
            <TooltipLabel label="이름" required tooltip="가상 담당자 또는 팀의 이름입니다." />
            <input 
              type="text" 
              maxLength={100}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full glass-input px-4 py-2.5 text-sm transition-colors"
              placeholder="예: MD팀"
            />
          </div>

          <div>
            <TooltipLabel label="유형 (Stereo)" required tooltip="담당자의 종류입니다. 생성 후에는 변경할 수 없습니다." />
            <div className="flex gap-2">
              <label className={cn("flex-1 text-center py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all", stereo === 'team' ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 shadow-sm" : "bg-white/40 dark:bg-slate-800/40 border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700/60", isEditing && stereo !== 'team' && "opacity-50 cursor-not-allowed")}>
                <input type="radio" className="hidden" checked={stereo === 'team'} onChange={() => !isEditing && setStereo('team')} disabled={isEditing} /> Team
              </label>
              <label className={cn("flex-1 text-center py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all", stereo === 'person' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-sm" : "bg-white/40 dark:bg-slate-800/40 border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700/60", isEditing && stereo !== 'person' && "opacity-50 cursor-not-allowed")}>
                <input type="radio" className="hidden" checked={stereo === 'person'} onChange={() => !isEditing && setStereo('person')} disabled={isEditing} /> Person
              </label>
              <label className={cn("flex-1 text-center py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all", stereo === 'vendor' ? "bg-slate-500/20 border-slate-500/30 text-slate-700 dark:text-slate-300 shadow-sm" : "bg-white/40 dark:bg-slate-800/40 border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700/60", isEditing && stereo !== 'vendor' && "opacity-50 cursor-not-allowed")}>
                <input type="radio" className="hidden" checked={stereo === 'vendor'} onChange={() => !isEditing && setStereo('vendor')} disabled={isEditing} /> Vendor
              </label>
            </div>
            {isEditing && <p className="text-[10px] text-slate-500/80 mt-1.5 px-1">생성 후에는 유형을 변경할 수 없습니다.</p>}
          </div>

          <div>
            <TooltipLabel label="식별 컬러" required tooltip="이 담당자에게 할당된 작업을 시각적으로 구분할 색상입니다." />
            <div className="flex flex-wrap gap-2.5 p-1">
              {colors.map(c => (
                <button 
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn("w-8 h-8 rounded-full border-2 transition-transform shadow-sm", c, color === c ? "scale-110 border-white ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900" : "border-white/20 hover:scale-110 relative after:absolute after:inset-0 after:bg-white/10 after:rounded-full after:opacity-0 hover:after:opacity-100 after:transition-opacity")}
                />
              ))}
            </div>
          </div>

          <div>
            <TooltipLabel label="메모" tooltip="설명이나 참고사항을 입력하세요." />
            <textarea 
              value={memo}
              onChange={e => setMemo(e.target.value)}
              className="w-full glass-input px-4 py-3 text-sm transition-colors resize-none h-20"
              placeholder="설명이나 참고사항을 입력하세요."
            />
          </div>
        </div>

        <div className="px-6 py-5 border-t border-white/20 dark:border-slate-800/50 bg-white/40 dark:bg-slate-800/40 flex justify-end gap-3 relative z-10">
          <button onClick={onClose} disabled={saving} className="glass-btn px-5 py-2.5 text-sm font-semibold rounded-xl">
            취소
          </button>
          <button onClick={handleSave} disabled={saving || !name.trim()} className="glass-btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50">
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
