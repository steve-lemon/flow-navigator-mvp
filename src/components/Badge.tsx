import { Status } from '../types';
import { cn } from '../utils';
import { useLocale } from '../contexts/LocaleContext';

interface BadgeProps {
  status?: Status;
  text?: string;
  warning?: boolean;
}

const statusConfig: Record<Status, { labelKey: string; className: string }> = {
  todo: { labelKey: 'status.todo', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  doing: { labelKey: 'status.doing', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  done: { labelKey: 'status.done', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  hold: { labelKey: 'status.hold', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  skip: { labelKey: 'status.skip', className: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600' },
};

export default function Badge({ status, text, warning }: BadgeProps) {
  const { t } = useLocale();

  if (warning) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {text || 'Warning'}
      </span>
    );
  }

  if (status) {
    const config = statusConfig[status];
    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border shadow-sm', config.className)}>
        {text || t(config.labelKey)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
      {text}
    </span>
  );
}
