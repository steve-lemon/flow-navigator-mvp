import { cn } from '../utils';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showText?: boolean;
}

export default function ProgressBar({ progress, className, showText = true }: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));
  let fillColor = 'bg-blue-500';
  if (safeProgress === 100) fillColor = 'bg-emerald-500';
  else if (safeProgress === 0) fillColor = 'bg-slate-400';
  
  return (
    <div className={cn("w-full", className)}>
      <div className="h-[6px] rounded-full bg-slate-200">
        <div 
          className={cn("h-[6px] rounded-full transition-all duration-500 ease-out", fillColor)}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      {showText && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-500">{safeProgress}% Complete</span>
        </div>
      )}
    </div>
  );
}
