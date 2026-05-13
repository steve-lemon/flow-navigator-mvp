import React, { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../utils';

interface TooltipProps {
  children?: ReactNode;
  content: ReactNode;
  icon?: boolean;
  align?: 'left' | 'center' | 'right';
}

export function Tooltip({ children, content, icon = false, align = 'center' }: TooltipProps) {
  return (
    <div className="group/tooltip relative inline-flex items-center">
      {children}
      {icon && <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-colors cursor-help outline-none ml-1.5" />}
      
      <div className={cn(
        "absolute bottom-full mb-2 w-max max-w-[260px] px-3 py-2 bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md text-white text-xs leading-relaxed font-medium rounded-xl z-[9999] opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-opacity duration-150 pointer-events-none text-left shadow-xl border border-white/10",
        align === 'center' && "left-1/2 -translate-x-1/2",
        align === 'left' && "left-0",
        align === 'right' && "right-0"
      )}>
        {content}
        <div className={cn(
          "absolute top-full border-[5px] border-transparent border-t-slate-900/90 dark:border-t-slate-800/95 drop-shadow-sm",
          align === 'center' && "left-1/2 -translate-x-1/2",
          align === 'left' && "left-3",
          align === 'right' && "right-3"
        )}></div>
      </div>
    </div>
  );
}

interface TooltipLabelProps {
  label: string;
  required?: boolean;
  tooltip?: string;
}

export function TooltipLabel({ label, required = false, tooltip }: TooltipLabelProps) {
  return (
    <div className="flex items-center mb-1.5">
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-1">
        {label} 
        {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
      </label>
      {tooltip && <Tooltip content={tooltip} icon={true} align="left" />}
    </div>
  );
}
