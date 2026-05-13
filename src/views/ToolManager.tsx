import React, { useState } from 'react';
import { Tool, Flow, Item, TaskTemplate } from '../types';
import { Plus, Edit2, Archive, ArchiveRestore, Wrench, ExternalLink, AlertCircle, X, GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../utils';
import { Select } from '../components/Select';
import { Tooltip, TooltipLabel } from '../components/Tooltip';

interface ToolManagerProps {
  tools: Record<string, Tool>;
  flows: Flow[];
  items: Item[];
  onCreateTool: (tool: Partial<Tool>) => void;
  onUpdateTool: (id: string, tool: Partial<Tool>) => void;
  onDeactivateTool: (id: string) => void;
  onActivateTool: (id: string) => void;
}

export default function ToolManager({ tools, flows, items, onCreateTool, onUpdateTool, onDeactivateTool, onActivateTool }: ToolManagerProps) {
  const [showInactive, setShowInactive] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [stereo, setStereo] = useState<'link' | 'embed' | 'flow'>('link');
  const [urlTemplate, setUrlTemplate] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [memo, setMemo] = useState('');
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);

  const toolList = Object.values(tools)
    .filter(t => showInactive || t.isActive)
    .sort((a, b) => b.createdAt - a.createdAt);

  const resetForm = () => {
    setName('');
    setStereo('link');
    setUrlTemplate('');
    setActionLabel('');
    setMemo('');
    setTaskTemplates([]);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAdding(true);
    setEditingToolId(null);
  };

  const handleOpenEdit = (id: string) => {
    const t = tools[id];
    if (!t) return;
    setName(t.name);
    setStereo(t.stereo);
    setUrlTemplate(t.urlTemplate || '');
    setActionLabel(t.actionLabel);
    setMemo(t.memo || '');
    setTaskTemplates(t.taskTemplates ? [...t.taskTemplates] : []);
    setIsAdding(false);
    setEditingToolId(t.id);
  };

  const handleCloseForm = () => {
    setIsAdding(false);
    setEditingToolId(null);
    resetForm();
  };

  const validateUrl = (url: string, currentStereo: string) => {
    if (currentStereo === 'flow') return true;
    if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
    try {
      // Replace placeholders with dummy values to validate the base URL structure
      const testUrl = url.replace(/\{[a-zA-Z0-9_]+\}/g, 'dummy');
      new URL(testUrl);
      return true;
    } catch {
      return false;
    }
  };

  const addTaskTemplate = () => {
    const newOrder = taskTemplates.length > 0 ? Math.max(...taskTemplates.map(t => t.order)) + 1 : 1;
    setTaskTemplates([...taskTemplates, {
      id: `tt_${Date.now()}`,
      title: '',
      order: newOrder
    }]);
  };

  const updateTaskTemplate = (id: string, updates: Partial<TaskTemplate>) => {
    setTaskTemplates(taskTemplates.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTaskTemplate = (id: string) => {
    setTaskTemplates(taskTemplates.filter(t => t.id !== id));
  };

  const moveTaskTemplate = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === taskTemplates.length - 1) return;

    const newTemplates = [...taskTemplates];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap items
    const temp = newTemplates[index];
    newTemplates[index] = newTemplates[targetIndex];
    newTemplates[targetIndex] = temp;
    
    // Reassign order
    newTemplates.forEach((t, i) => {
      t.order = i + 1;
    });
    
    setTaskTemplates(newTemplates);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !actionLabel.trim()) return;
    if (stereo !== 'flow' && !urlTemplate.trim()) return;
    if (stereo !== 'flow' && !validateUrl(urlTemplate, stereo)) {
      alert("올바른 URL 형식을 입력해주세요. ('http://' 또는 'https://' 로 시작해야 합니다)");
      return;
    }

    const payload: Partial<Tool> = {
      name: name.trim(),
      stereo,
      actionLabel: actionLabel.trim(),
      memo: memo.trim()
    };
    if (stereo === 'flow') {
      payload.taskTemplates = taskTemplates;
    } else {
      payload.urlTemplate = urlTemplate.trim();
    }

    if (isAdding) {
      onCreateTool(payload);
    } else if (editingToolId) {
      onUpdateTool(editingToolId, payload);
    }
    handleCloseForm();
  };

  const handleToggleActive = (tool: Tool) => {
    if (tool.isActive) {
      if (window.confirm(`'${tool.name}' 도구를 비활성화하시겠습니까? 연결된 Stage나 Task에서는 계속 사용할 수 있지만, 새로운 연결 목록에서는 숨겨집니다.`)) {
        onDeactivateTool(tool.id);
      }
    } else {
      onActivateTool(tool.id);
    }
  };

  const getPreviewUrl = (tpl: string) => {
    if (!tpl) return '';
    return tpl
      .replace(/\{itemId\}/g, 'item_sample')
      .replace(/\{itemName\}/g, encodeURIComponent('크롭 니트'))
      .replace(/\{stageId\}/g, 'stage_sample')
      .replace(/\{stageName\}/g, encodeURIComponent('상세페이지 제작'))
      .replace(/\{taskId\}/g, 'task_sample')
      .replace(/\{taskTitle\}/g, encodeURIComponent('모바일 최적화 수정'));
  };

  const openPreview = (tpl: string) => {
    const url = getPreviewUrl(tpl);
    if (!url) return;
    if (!validateUrl(url, stereo)) {
      alert("URL 형식이 올바르지 않습니다.");
      return;
    }
    window.open(url, '_blank');
  };

  // Usage counting
  const getUsageCount = (toolId: string) => {
    let stageCount = 0;
    let taskCount = 0;

    flows.forEach(flow => {
      flow.stages.forEach(stage => {
        if (stage.toolId === toolId) stageCount++;
        stage.tasks?.forEach(task => {
          if (task.toolId === toolId) taskCount++;
        });
      });
    });

    items.forEach(item => {
      item.stages?.forEach(stage => {
        if (stage.toolId === toolId) stageCount++;
        stage.tasks?.forEach(task => { // assuming items also duplicate tasks if we edit them, wait items copy everything
          // the usage count might be slightly overlapping if we count both flow definition and instanced items.
          // Let's just say "in definitions and active items"
          if (task.toolId === toolId) taskCount++;
        });
      });
    });

    return { stageCount, taskCount };
  };

  // Validating placeholders
  const invalidPlaceholders = urlTemplate.match(/\{(?!(itemId|itemName|stageId|stageName|taskId|taskTitle))\w+\}/g);

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2 tracking-tight">
            <Wrench className="w-8 h-8 text-indigo-500/80 drop-shadow-sm" /> Tool Manager
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Stage나 Task에서 사용할 외부 도구를 관리합니다.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowInactive(!showInactive)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 glass-btn rounded-xl transition-colors"
          >
            {showInactive ? "비활성 도구 숨기기" : "비활성 도구 보기"}
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 glass-btn-primary rounded-xl font-semibold text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> 도구 추가
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div className="md:col-span-2 space-y-4">
          {toolList.length === 0 ? (
            <div className="glass-panel text-center rounded-3xl p-12 text-slate-500 dark:text-slate-400 relative overflow-hidden border border-white/20 dark:border-white/10 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
              <Wrench className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4 opacity-50 relative" />
              <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1 relative">아직 등록된 도구가 없습니다.</p>
              <p className="text-sm relative">외부 작업 도구를 추가하여 Flow에 연결해보세요.</p>
            </div>
          ) : (
            toolList.map(tool => {
              const { stageCount, taskCount } = getUsageCount(tool.id);
              return (
                <div key={tool.id} className={cn("glass-card rounded-2xl p-5 transition-all group relative", !tool.isActive && "opacity-60 bg-slate-50/30 dark:bg-slate-900/30")}>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">{tool.name}</h3>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                          tool.stereo === 'link' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                          tool.stereo === 'embed' ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" : "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                        )}>
                          {tool.stereo}
                        </span>
                        {!tool.isActive && <span className="text-[10px] bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">비활성</span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500/80 dark:text-slate-400/80">
                        <span>연결된 Stage <strong className="text-slate-700 dark:text-slate-300 ml-1">{stageCount}</strong></span>
                        <span>연결된 Task <strong className="text-slate-700 dark:text-slate-300 ml-1">{taskCount}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {tool.stereo !== 'flow' && (
                        <Tooltip content="테스트 실행">
                          <button onClick={() => openPreview(tool.urlTemplate)} className="p-1.5 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip content="수정">
                        <button onClick={() => handleOpenEdit(tool.id)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content={tool.isActive ? "비활성화" : "활성화"}>
                        <button onClick={() => handleToggleActive(tool)} className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                          {tool.isActive ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-4 border border-white/20 dark:border-white/5 space-y-3 relative z-10 backdrop-blur-sm">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Action Button</div>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors">
                        {tool.stereo === 'flow' ? <Wrench className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                        {tool.actionLabel}
                      </button>
                    </div>
                    {tool.stereo === 'flow' ? (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">작업 목록 (Task Templates)</div>
                        {tool.taskTemplates && tool.taskTemplates.length > 0 ? (
                          <div className="space-y-2">
                            {tool.taskTemplates.sort((a,b)=>a.order-b.order).map(tt => (
                              <div key={tt.id} className="bg-white p-3 rounded-lg border border-slate-200">
                                <div className="font-bold text-sm text-slate-800">{tt.title}</div>
                                {tt.guideText && <div className="text-xs text-slate-500 mt-1">{tt.guideText}</div>}
                                {tt.actionLabel && (
                                  <div className="mt-2 text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded inline-block">
                                    {tt.actionLabel}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400">등록된 작업이 없습니다.</div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">URL Template</div>
                        <div className="text-xs text-slate-600 font-mono break-all">{tool.urlTemplate}</div>
                      </div>
                    )}
                    {tool.memo && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Memo</div>
                        <div className="text-xs text-slate-600">{tool.memo}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="md:col-span-1">
          {(isAdding || editingToolId) && (
            <div className="glass-panel border-white/20 dark:border-white/10 shadow-2xl rounded-3xl sticky top-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="absolute top-0 right-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute top-0 right-0 p-8 -mt-10 -mr-10 bg-indigo-500/10 blur-3xl rounded-full w-40 h-40" />
              </div>
              <div className="flex items-center justify-between p-5 border-b border-white/20 dark:border-slate-800/50 bg-white/40 dark:bg-slate-800/40 relative z-10 rounded-t-3xl">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{isAdding ? '도구 추가' : '도구 수정'}</h3>
                <button onClick={handleCloseForm} className="p-1.5 hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5 relative z-10">
                <div>
                  <TooltipLabel label="이름" required tooltip="도구의 고유 이름입니다." />
                  <input
                    type="text"
                    maxLength={100}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 text-sm transition-colors"
                    placeholder="예: 촬영 폴더, 사방넷"
                    required
                  />
                </div>

                <div>
                  <TooltipLabel label="유형 (Stereo)" required tooltip="도구를 여는 방식입니다. 생성 후에는 변경할 수 없습니다." />
                  <div className="flex gap-2">
                    <label className={cn("flex-1 text-center py-2.5 rounded-xl border text-sm font-semibold transition-all", stereo === 'link' ? "bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-sm" : "bg-white/40 dark:bg-slate-800/40 border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-white/60 dark:hover:bg-slate-700/60", !!editingToolId && stereo !== 'link' && "opacity-50 cursor-not-allowed")}>
                      <input type="radio" className="hidden" checked={stereo === 'link'} onChange={() => { if (!editingToolId) { setStereo('link'); setUrlTemplate(''); } }} disabled={!!editingToolId} /> Link
                    </label>
                    <label className={cn("flex-1 text-center py-2.5 rounded-xl border text-sm font-semibold transition-all", stereo === 'embed' ? "bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300 shadow-sm" : "bg-white/40 dark:bg-slate-800/40 border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-white/60 dark:hover:bg-slate-700/60", !!editingToolId && stereo !== 'embed' && "opacity-50 cursor-not-allowed")}>
                      <input type="radio" className="hidden" checked={stereo === 'embed'} onChange={() => { if (!editingToolId) { setStereo('embed'); setUrlTemplate(''); } }} disabled={!!editingToolId} /> Embed
                    </label>
                    <label className={cn("flex-1 text-center py-2.5 rounded-xl border text-sm font-semibold transition-all", stereo === 'flow' ? "bg-purple-500/20 border-purple-500/30 text-purple-700 dark:text-purple-300 shadow-sm" : "bg-white/40 dark:bg-slate-800/40 border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-white/60 dark:hover:bg-slate-700/60", !!editingToolId && stereo !== 'flow' && "opacity-50 cursor-not-allowed")}>
                      <input type="radio" className="hidden" checked={stereo === 'flow'} onChange={() => { if (!editingToolId) { setStereo('flow'); setUrlTemplate(''); } }} disabled={!!editingToolId} /> Flow
                    </label>
                  </div>
                </div>

                <div>
                  <TooltipLabel label="액션 버튼 라벨" required tooltip="사용자가 클릭할 버튼에 표시될 텍스트입니다." />
                  <input
                    type="text"
                    maxLength={50}
                    value={actionLabel}
                    onChange={e => setActionLabel(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 text-sm transition-colors"
                    placeholder="예: 촬영 폴더 열기"
                    required
                  />
                </div>

                {stereo === 'flow' ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <TooltipLabel label="Task Templates" required={false} tooltip="이 도구를 실행할 때 생성될 하위 작업 목록입니다." />
                      <button type="button" onClick={addTaskTemplate} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1">
                        <Plus className="w-3 h-3" /> 작업 추가
                      </button>
                    </div>
                    
                    <div className="space-y-3 mt-1">
                      {taskTemplates.map((tt, index) => (
                        <div key={tt.id} className="p-3 border border-white/20 dark:border-slate-700/50 rounded-xl bg-white/40 dark:bg-slate-800/40 relative group shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                          
                          <div className="flex items-start justify-between gap-2 mb-2.5">
                            <input
                              type="text"
                              value={tt.title}
                              onChange={e => updateTaskTemplate(tt.id, { title: e.target.value })}
                              className="w-full glass-input px-3 py-1.5 text-sm font-semibold h-9"
                              placeholder={`작업명 ${index + 1}`}
                              required
                            />
                            
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                              <button type="button" onClick={() => moveTaskTemplate(index, 'up')} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button type="button" onClick={() => moveTaskTemplate(index, 'down')} disabled={index === taskTemplates.length - 1} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button type="button" onClick={() => removeTaskTemplate(tt.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg ml-0.5 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2.5">
                            <div>
                              <input
                                type="text"
                                value={tt.guideText || ''}
                                onChange={e => updateTaskTemplate(tt.id, { guideText: e.target.value })}
                                className="w-full glass-input px-3 py-1 text-xs h-9 placeholder:text-slate-400/70 truncate"
                                placeholder="가이드 텍스트 (선택사항)"
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2.5">
                              <input
                                type="text"
                                value={tt.actionLabel || ''}
                                onChange={e => updateTaskTemplate(tt.id, { actionLabel: e.target.value })}
                                className="w-full glass-input px-3 py-1 text-xs h-9 placeholder:text-slate-400/70 truncate sm:flex-1"
                                placeholder="액션 라벨 (선택사항)"
                              />
                              <div className="relative sm:w-48 shrink-0">
                                <Select
                                  value={tt.toolId || ''}
                                  onChange={val => updateTaskTemplate(tt.id, { toolId: val })}
                                  className="!min-h-[36px] !rounded-xl !text-xs w-full"
                                  options={[
                                    { value: '', label: '+ 도구 연결 안됨' },
                                    ...Object.values(tools).filter(t => t.isActive && t.stereo !== 'flow').map(t => ({
                                      value: t.id,
                                      label: t.name
                                    }))
                                  ]}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {taskTemplates.length === 0 && (
                        <div className="text-xs text-slate-400/80 font-medium text-center py-8 bg-white/20 dark:bg-slate-800/20 rounded-xl border border-dashed border-white/30 dark:border-slate-600/50">
                          작업 템플릿을 추가해주세요.<br/>(비워두면 작업 없이 시작됩니다)
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <TooltipLabel label="URL Template" required tooltip="{itemId}, {stageId} 등의 변수를 사용할 수 있습니다." />
                    <textarea
                      value={urlTemplate}
                      onChange={e => setUrlTemplate(e.target.value)}
                      className="w-full h-24 glass-input px-4 py-3 text-xs font-mono resize-none break-all"
                      placeholder="https://example.com/editor?itemId={itemId}"
                      required
                    />
                    {invalidPlaceholders && (
                      <div className="flex items-start gap-1.5 mt-1.5 text-[10px] text-amber-600 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>지원하지 않는 변수: {invalidPlaceholders.join(', ')}</span>
                      </div>
                    )}
                    {urlTemplate && (
                      <div className="mt-3 p-3 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-white/20 dark:border-white/10 shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 mb-1.5 tracking-wider">PREVIEW</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono break-all line-clamp-3 leading-relaxed">
                          {getPreviewUrl(urlTemplate)}
                        </div>
                        <button 
                          type="button" 
                          onClick={() => openPreview(urlTemplate)}
                          className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> 테스트 열기
                        </button>
                      </div>
                    )}
                    <div className="mt-2 text-[10px] text-slate-500/80 px-1">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">지원 변수:</span> {`{itemId}, {itemName}, {stageId}, {stageName}, {taskId}, {taskTitle}`}
                    </div>
                  </div>
                )}

                <div>
                  <TooltipLabel label="메모" tooltip="설명이나 참고사항을 입력하세요." />
                  <textarea
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                    className="w-full glass-input px-4 py-3 text-sm resize-none min-h-[80px]"
                    placeholder="메모를 입력하세요"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/20 dark:border-slate-800/50">
                  <button type="button" onClick={handleCloseForm} className="px-5 py-2.5 text-sm font-semibold glass-btn rounded-xl">
                    취소
                  </button>
                  <button type="submit" disabled={!name.trim() || !actionLabel.trim() || (stereo !== 'flow' && !urlTemplate.trim()) || (stereo !== 'flow' && !validateUrl(urlTemplate, stereo)) || (stereo === 'flow' && taskTemplates.some(t => !t.title.trim()))} className="px-6 py-2.5 text-sm font-semibold glass-btn-primary disabled:opacity-50 rounded-xl">
                    저장
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
