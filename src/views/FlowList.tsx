import React from 'react';
import { Flow } from '../types';
import { Plus, Workflow, ArrowRight } from 'lucide-react';

interface FlowListProps {
  flows: Record<string, Flow>;
  onNavigateToFlow: (flowId: string) => void;
  onCreateFlow: () => void;
}

export default function FlowList({ flows, onNavigateToFlow, onCreateFlow }: FlowListProps) {
  const flowList = Object.values(flows);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/20 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
            Workflows
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Manage process templates that can be applied to your items.</p>
        </div>
        <button
          onClick={onCreateFlow}
          className="flex items-center gap-2 glass-btn-primary px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Flow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {flowList.map(flow => (
          <button
            key={flow.id}
            onClick={() => onNavigateToFlow(flow.id)}
            className="flex flex-col text-left glass-card p-6 rounded-3xl hover:border-blue-400/50 group transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-start justify-between w-full mb-5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 transition-colors shadow-sm border border-white/50 dark:border-white/10">
                <Workflow className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/40 dark:bg-slate-800/40 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-slate-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors border border-white/20 dark:border-white/10 shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 relative z-10 tracking-tight">{flow.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 h-10 mb-5 relative z-10 leading-relaxed">{flow.description}</p>
            
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-auto relative z-10">
              <span className="bg-slate-200/50 dark:bg-slate-700/50 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                {flow.stereo}
              </span>
              <span>{flow.stages.length} Stages</span>
            </div>
          </button>
        ))}
      </div>
      {flowList.length === 0 && (
        <div className="text-center py-24 glass-panel border-white/20 dark:border-white/10 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
          <div className="w-16 h-16 bg-white/50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-5 shadow-sm border border-white/50 dark:border-white/10 transition-transform group-hover:scale-110 duration-300 relative">
            <Workflow className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2 relative tracking-tight">No flows created yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto relative px-4 leading-relaxed">Create your first workflow to standardize your processes.</p>
          <button
            onClick={onCreateFlow}
            className="glass-btn-primary px-8 py-3 rounded-xl font-semibold shadow-sm text-[15px] relative"
          >
            Create New Flow
          </button>
        </div>
      )}
    </div>
  );
}
