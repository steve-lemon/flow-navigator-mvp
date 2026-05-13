import React, { useState } from 'react';
import { Flow, Stage, Actor, Tool } from '../types';
import { ArrowLeft, Plus, ChevronUp, ChevronDown, ChevronRight, Trash2, Settings, Workflow } from 'lucide-react';
import StageEditorPanel from '../components/StageEditorPanel';
import { Tooltip } from '../components/Tooltip';

interface FlowEditorProps {
  flow: Flow;
  onUpdateFlow: (flow: Flow) => void;
  onBack: () => void;
  onTestApply?: () => void;
  actors: Record<string, Actor>;
  tools: Record<string, Tool>;
}

export default function FlowEditor({ flow, onUpdateFlow, onBack, onTestApply, actors, tools }: FlowEditorProps) {
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  const handleFlowChange = (updates: Partial<Flow>) => {
    onUpdateFlow({ ...flow, ...updates });
  };

  const toggleStageExpand = (e: React.MouseEvent, stageId: string) => {
    e.stopPropagation();
    setExpandedStages(prev => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  };

  const handleAddStage = (stereo: 'simple' | 'iterative' | 'flow') => {
    const newStage: Stage = {
      id: `ts-${Date.now()}`,
      itemId: '',
      flowId: flow.id,
      name: '새로운 단계',
      stereo,
      status: 'todo',
      guideText: '안내문을 입력하세요.',
      actionLabel: '작업 열기',
      dependencyStageIds: [],
      isRequired: true,
      order: flow.stages.length + 1,
      tasks: [],
      notes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    handleFlowChange({ stages: [...flow.stages, newStage] });
    setEditingStageId(newStage.id);
  };

  const handleUpdateStage = (updatedStage: Stage) => {
    const newStages = flow.stages.map(s => s.id === updatedStage.id ? updatedStage : s);
    handleFlowChange({ stages: newStages });
  };

  const handleDeleteStage = (stageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStages = flow.stages.filter(s => s.id !== stageId);
    newStages.forEach((s, i) => s.order = i + 1); // Re-order
    // Remove deleted dependency from others
    newStages.forEach(s => {
      s.dependencyStageIds = s.dependencyStageIds.filter(id => id !== stageId);
    });
    handleFlowChange({ stages: newStages });
    if (editingStageId === stageId) setEditingStageId(null);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === flow.stages.length - 1) return;

    const newStages = [...flow.stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newStages[index];
    newStages[index] = newStages[targetIndex];
    newStages[targetIndex] = temp;

    // Update order
    newStages.forEach((s, i) => s.order = i + 1);
    handleFlowChange({ stages: newStages });
  };

  const editingStage = flow.stages.find(s => s.id === editingStageId);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Main Flow Editor Area */}
      <div className="flex-1 max-w-3xl flex flex-col min-h-0 glass-panel rounded-3xl shadow-sm relative">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-0 right-0 p-8 -mt-10 -mr-10 bg-blue-500/5 blur-3xl rounded-full w-40 h-40" />
        </div>
        <div className="p-6 border-b border-white/20 dark:border-slate-800/50 flex items-center justify-between shrink-0 bg-white/40 dark:bg-slate-800/40 relative z-10 backdrop-blur-sm rounded-t-3xl">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-full text-slate-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Edit Flow</h2>
          </div>
          {onTestApply && (
            <button 
              onClick={onTestApply}
              className="px-4 py-2 glass-btn text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold text-sm transition-colors"
            >
              샘플 상품에 적용해보기
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar relative z-10">
          {/* Flow Settings */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Basic Info</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Flow Name</label>
                <input 
                  type="text" 
                  value={flow.name}
                  onChange={e => handleFlowChange({ name: e.target.value })}
                  placeholder="e.g., 의류 상품 기본 등록"
                  className="w-full glass-input px-4 py-3 outline-none transition-all font-semibold text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea 
                  value={flow.description}
                  onChange={e => handleFlowChange({ description: e.target.value })}
                  placeholder="어떤 작업들을 포함하는지 간단히 설명해주세요."
                  className="w-full glass-input px-4 py-3 outline-none transition-all text-sm text-slate-700 resize-none min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Stereo (Type)</label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-500/10 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold border border-slate-500/20">
                    <Workflow className="w-4 h-4" />
                    {flow.stereo}
                  </span>
                  <span className="text-xs text-slate-400 self-center px-1">* 생성 후 변경 불가</span>
                </div>
              </div>
            </div>
          </section>

          {/* Stages List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stages</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAddStage('simple')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 px-3 py-2 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Simple
                </button>
                <button 
                  onClick={() => handleAddStage('iterative')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 px-3 py-2 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Iterative
                </button>
                <button 
                  onClick={() => handleAddStage('flow')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 px-3 py-2 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Flow
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {flow.stages.map((stage, index) => {
                const isSelected = stage.id === editingStageId;
                const isExpanded = expandedStages.has(stage.id);
                const actor = stage.actorId ? actors[stage.actorId] : null;
                return (
                  <div 
                    key={stage.id}
                    onClick={() => setEditingStageId(stage.id)}
                    className={`flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'glass-card border-blue-500/40 dark:border-blue-500/30 ring-2 ring-blue-500/20' 
                        : 'glass-panel border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex flex-col gap-1 items-center justify-center shrink-0 w-8 pt-0.5">
                      <button onClick={e => handleMoveStage(index, 'up', e)} className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-300" disabled={index === 0}>
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <span className="text-xs font-bold text-slate-400 w-full text-center py-1">{stage.order}</span>
                      <button onClick={e => handleMoveStage(index, 'down', e)} className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-300" disabled={index === flow.stages.length - 1}>
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <button 
                          onClick={(e) => toggleStageExpand(e, stage.id)}
                          className="p-1 -ml-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate text-[15px]">
                          {stage.name || '이름 없음'}
                        </h4>
                        {!stage.isRequired && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">Optional</span>
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                          stage.stereo === 'simple' ? 'text-blue-600 bg-blue-500/10 border-blue-500/20' :
                          stage.stereo === 'iterative' ? 'text-purple-600 bg-purple-500/10 border-purple-500/20' :
                          'text-orange-600 bg-orange-500/10 border-orange-500/20'
                        }`}>
                          {stage.stereo}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs pl-7 pb-1">
                        {actor ? (
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium bg-white/40 dark:bg-slate-800/40 px-2 py-0.5 rounded-md border border-white/20 dark:border-white/5">
                            <span className={`w-1.5 h-1.5 rounded-full ${actor.color}`} />
                            {actor.name}
                          </span>
                        ) : (
                          <span className="text-rose-500 font-medium flex items-center gap-1.5 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">담당자 미지정</span>
                        )}
                        
                        {!stage.guideText && (
                          <span className="text-amber-500 font-medium tracking-tight">• 안내문 없음</span>
                        )}
                        {(stage.stereo === 'flow' || stage.stereo === 'iterative') && !stage.toolId && (
                          <span className="text-amber-500 font-medium tracking-tight">• 도구 미연결</span>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pl-7 space-y-2.5 border-t pt-3 border-white/20 dark:border-slate-800/50">
                          {stage.guideText && (
                            <div className="text-[13px] text-slate-600 dark:text-slate-300 bg-white/30 dark:bg-slate-800/30 p-2.5 rounded-lg border border-white/20 dark:border-white/5">
                              <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">안내문</span> {stage.guideText}
                            </div>
                          )}
                          {stage.toolId && (
                            <div className="text-[13px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                              <span className="font-semibold text-slate-500 dark:text-slate-400">연결된 도구:</span> 
                              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md text-xs font-semibold">{tools[stage.toolId]?.name || stage.toolId}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2 pt-0.5">
                       <Tooltip content="이 단계를 삭제합니다">
                         <button 
                          onClick={e => handleDeleteStage(stage.id, e)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                         </button>
                       </Tooltip>
                    </div>
                  </div>
                );
              })}
              
              {flow.stages.length === 0 && (
                <div className="text-center py-12 glass-panel border-dashed rounded-3xl text-slate-500 text-sm">
                  첫 단계를 추가하여 워크플로우를 구성하세요.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Side Panel for Stage Editing / Preview */}
      <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0 h-[600px] lg:h-auto">
        {editingStage ? (
          <StageEditorPanel 
            flow={flow}
            stage={editingStage} 
            onChange={handleUpdateStage}
            onClose={() => setEditingStageId(null)}
            actors={actors}
            tools={tools}
          />
        ) : (
          <div className="flex-1 glass-panel rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 relative overflow-hidden h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent dark:from-slate-800/50 pointer-events-none" />
            <Settings className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-5 relative" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2 relative text-lg">Stage Editor</h3>
            <p className="text-sm relative leading-relaxed max-w-[200px]">단계를 선택하여 속성을 편집하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
