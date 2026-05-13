import React, { useState, useEffect } from 'react';
import { Flow, Stage, Actor, Tool } from '../types';
import { Select } from './Select';
import { X, ExternalLink, AlertCircle, Save } from 'lucide-react';
import { TooltipLabel } from './Tooltip';
import { cn } from '../utils';

interface StageEditorPanelProps {
  flow: Flow;
  stage: Stage;
  onChange: (updated: Stage) => void;
  onClose: () => void;
  actors: Record<string, Actor>;
  tools: Record<string, Tool>;
}

export default function StageEditorPanel({ flow, stage, onChange, onClose, actors, tools }: StageEditorPanelProps) {
  const [editedStage, setEditedStage] = useState<Stage>(stage);

  useEffect(() => {
    setEditedStage(stage);
  }, [stage]);

  const handleChange = (field: keyof Stage, value: any) => {
    setEditedStage({ ...editedStage, [field]: value });
  };

  const handleSave = () => {
    onChange(editedStage);
  };

  const currentActor = editedStage.actorId ? actors[editedStage.actorId] : null;

  const isNameEmpty = !editedStage.name.trim();
  const isActorEmpty = !editedStage.actorId;

  return (
    <div className="flex-1 flex flex-col glass-panel rounded-3xl relative shadow-2xl h-full">
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute top-0 right-0 p-8 -mt-10 -mr-10 bg-indigo-500/10 blur-3xl rounded-full w-40 h-40" />
      </div>
      <div className="p-5 border-b border-white/20 dark:border-slate-800/50 flex items-center justify-between bg-white/40 dark:bg-slate-800/40 shrink-0 relative z-10 backdrop-blur-sm rounded-t-3xl">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Edit Stage</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-24 relative z-10">
        {/* Properties Form */}
        <div className="space-y-4">
          <div>
            <TooltipLabel label="이름" required tooltip="단계의 이름을 입력합니다. (예: 촬영 준비)" />
            <input 
              type="text" 
              value={editedStage.name}
              onChange={e => handleChange('name', e.target.value)}
              className={`w-full glass-input px-4 py-2.5 outline-none transition-all font-semibold ${isNameEmpty ? 'border-rose-300 dark:border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 border-l-4 border-l-rose-500' : 'focus:border-blue-500 border-l-4 border-l-blue-500'}`}
              placeholder="예: 촬영 준비"
            />
            {isNameEmpty && <p className="text-[10px] text-rose-500 mt-1.5 font-medium px-1">이름은 필수입니다.</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <TooltipLabel label="유형 (Stereo)" tooltip="이 단계의 동작 방식을 결정합니다. 생성 후 변경할 수 없습니다." />
              <div className="w-full bg-white/20 dark:bg-slate-800/20 border border-white/10 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed flex items-center justify-between">
                <span>{editedStage.stereo}</span>
              </div>
            </div>
            <div className="flex flex-col h-full">
              <TooltipLabel label="필수 여부" tooltip="이 단계를 건너뛸 수 있는지(Optional) 여부를 설정합니다." />
              <label className="flex-1 flex flex-col justify-center gap-1.5 p-3.5 border border-white/10 dark:border-slate-700/50 rounded-xl bg-white/20 dark:bg-slate-800/20 cursor-pointer hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {editedStage.isRequired ? '필수 단계' : '선택적 단계'}
                  </span>
                  <div className={cn(
                    "w-10 h-6 rounded-full p-1 transition-colors relative",
                    editedStage.isRequired ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
                  )}>
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                      editedStage.isRequired ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={editedStage.isRequired} 
                  onChange={e => handleChange('isRequired', e.target.checked)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div>
            <TooltipLabel label="담당자 (Actor)" required tooltip="이 작업을 수행할 역할을 선택합니다." />
            <Select 
              value={editedStage.actorId || ''}
              onChange={val => handleChange('actorId', val)}
              placeholder="담당자 선택"
              className={isActorEmpty ? '!border-rose-300 dark:!border-rose-500/50 !ring-1 !ring-rose-500 !border-l-4 !border-l-rose-500' : '!border-l-4 !border-l-blue-500'}
              options={Object.values(actors).filter(a => a.isActive || a.id === editedStage.actorId).map(actor => ({
                value: actor.id,
                label: `${actor.name}${!actor.isActive ? ' (비활성)' : ''}`
              }))}
            />
            {isActorEmpty && <p className="text-[10px] text-rose-500 mt-1.5 font-medium px-1">담당자를 선택해주세요.</p>}
          </div>

          <div>
            <TooltipLabel label="안내문 (Guide Text)" tooltip="실무자가 작업을 수행할 때 참고할 가이드 라인을 작성합니다." />
            <textarea 
              value={editedStage.guideText || ''}
              onChange={e => handleChange('guideText', e.target.value)}
              className="w-full glass-input px-4 py-3 outline-none transition-all text-sm resize-none h-24"
              placeholder="담당자가 수행해야 할 작업을 설명합니다."
            />
            {!editedStage.guideText && <p className="text-[10px] text-amber-500 mt-1.5 font-medium px-1">안내문을 작성하면 담당자가 작업하기 수월합니다.</p>}
          </div>

          <div>
            <TooltipLabel label="액션 버튼 (Action Label)" tooltip="담당자가 작업을 시작하기 위해 누르는 버튼의 라벨입니다." />
            <input 
              type="text" 
              value={editedStage.actionLabel || ''}
              onChange={e => handleChange('actionLabel', e.target.value)}
              className="w-full glass-input px-4 py-2.5 outline-none transition-all font-semibold"
              placeholder="안 누르면 '작업 열기'가 표시됩니다."
            />
          </div>

          <div>
            <TooltipLabel label="도구 (Tool)" tooltip="이 단계를 수행할 때 연결될 외부 도구(예: 이메일 템플릿, 폼 링크 등)를 설정합니다." />
            <Select 
              value={editedStage.toolId || ''}
              onChange={val => handleChange('toolId', val)}
              options={[
                { value: '', label: '도구 없음 (선택 안함)' },
                ...Object.values(tools).filter(t => t.isActive || t.id === editedStage.toolId).map(tool => ({
                  value: tool.id,
                  label: `${tool.name}${!tool.isActive ? ' (비활성)' : ''}`
                }))
              ]}
            />
          </div>

          <div>
            <TooltipLabel label="선행 단계 (Dependencies)" tooltip="이 단계를 시작하기 전에 반드시 끝나야 하는 단계를 지정합니다." />
            <div className="flex flex-wrap gap-2 pt-1">
              {flow.stages.map(s => {
                const isSelected = editedStage.dependencyStageIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (s.id === editedStage.id) {
                        alert('자기 자신을 선행 단계로 지정할 수 없습니다.');
                        return;
                      }
                      const newDeps = isSelected 
                        ? editedStage.dependencyStageIds.filter(id => id !== s.id)
                        : [...editedStage.dependencyStageIds, s.id];
                      handleChange('dependencyStageIds', newDeps);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-sm ${
                      isSelected 
                        ? 'bg-blue-500 text-white border border-blue-600 shadow-blue-500/20' 
                        : 'bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    {s.order}. {s.name}
                  </button>
                )
              })}
              {flow.stages.length <= 1 && (
                <p className="text-xs text-slate-400/80 italic">다른 단계가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* Preview Container */}
        <div className="pt-8 border-t border-white/20 dark:border-slate-800/50">
           <h3 className="text-xs font-bold text-slate-500/80 uppercase tracking-wider mb-4 px-1">미리보기 (Preview)</h3>
           {/* Mock Item Board Card Preview */}
           <div className="glass-card rounded-3xl p-6 relative pointer-events-none opacity-80 backdrop-blur-md">
             <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1.5 text-lg">{editedStage.name || '이름 없음'}</h4>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-white/40 dark:border-white/5 shadow-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${currentActor?.color || 'bg-slate-300'}`} />
                    {currentActor?.name || '담당자 미지정'}
                  </span>
                  {!editedStage.isRequired && (
                    <span className="ml-2 text-[10px] text-slate-400 font-bold uppercase">Optional</span>
                  )}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editedStage.stereo}</div>
             </div>

             {editedStage.guideText && (
               <div className="bg-white/30 dark:bg-slate-800/30 p-3.5 rounded-xl mb-4 border border-white/20 dark:border-white/5 text-[13px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                 {editedStage.guideText}
               </div>
             )}

             {editedStage.dependencyStageIds.length > 0 && (
               <div className="flex items-start gap-2 mb-5 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm">
                 <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                 <p className="text-xs font-medium text-orange-700 dark:text-orange-300">
                   먼저 완료해야 할 단계가 있습니다: 
                   {editedStage.dependencyStageIds.map(depId => flow.stages.find(s => s.id === depId)?.name).join(', ')}
                 </p>
               </div>
             )}

             <button className="w-full flex items-center justify-center gap-2 glass-btn text-slate-900 dark:text-slate-100 px-4 py-3 rounded-xl font-bold shadow-sm">
                {editedStage.actionLabel || '작업 열기'}
                <ExternalLink className="w-4 h-4 opacity-50" />
             </button>

             {editedStage.stereo === 'iterative' && (
               <div className="mt-4 text-center">
                 <span className="text-xs text-slate-400/80 font-medium border border-dashed border-slate-300/50 dark:border-slate-600/50 rounded-lg px-3 py-1.5">+ 추가 작업 생성 가능</span>
               </div>
             )}
           </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/40 dark:bg-slate-800/40 border-t border-white/20 dark:border-slate-800/50 flex justify-end backdrop-blur-md rounded-b-3xl">
        <button
          onClick={handleSave}
          disabled={isNameEmpty || isActorEmpty}
          className="flex items-center gap-2 px-6 py-2.5 glass-btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-xl transition-all shadow-sm"
        >
          <Save className="w-4 h-4" />
          저장하기
        </button>
      </div>
    </div>
  );
}

