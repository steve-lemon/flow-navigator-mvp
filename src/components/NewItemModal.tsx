import { X, ImagePlus } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Select } from './Select';
import { Flow } from '../types';
import { useLocale } from '../contexts/LocaleContext';

interface NewItemModalProps {
  flows: Record<string, Flow>;
  onClose: () => void;
  onSubmit: (name: string, thumbnailUrl: string, flowId: string) => void;
}

export default function NewItemModal({ flows, onClose, onSubmit }: NewItemModalProps) {
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [flowId, setFlowId] = useState(Object.keys(flows)[0] || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, size, size);

        const aspect = img.width / img.height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        
        if (aspect > 1) {
          sw = img.height;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width;
          sy = (img.height - sh) / 2;
        }
        
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
        setThumbnailUrl(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' && (document.activeElement as HTMLInputElement).type === 'url') {
        const urlPasted = e.clipboardData?.getData('text');
        if (urlPasted && (urlPasted.startsWith('http://') || urlPasted.startsWith('https://') || urlPasted.startsWith('data:'))) {
          // If in URL input and pasting text URL, let the default behavior happen
          return;
        }
      }
      
      const file = e.clipboardData?.files[0];
      if (file) {
        e.preventDefault();
        processImageFile(file);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !flowId) return;
    onSubmit(name, thumbnailUrl, flowId);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden ${isDragging ? 'ring-2 ring-blue-500/50' : ''}`}>
        <div className="absolute top-0 right-0 p-8 -mt-10 -mr-10 bg-blue-400/20 blur-3xl rounded-full w-40 h-40 pointer-events-none" />
        
        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl border-2 border-dashed border-blue-400">
            <div className="text-center">
              <ImagePlus className="w-12 h-12 text-blue-500 mx-auto mb-2 drop-shadow-md" />
              <p className="font-bold text-blue-600 bg-white/80 dark:bg-slate-900/80 rounded-full px-4 py-1 shadow-sm">{t('item.thumbnail.drop')}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/20 dark:border-slate-800/50 bg-white/40 dark:bg-slate-800/40 relative z-10">
          <h3 className="font-semibold text-xl text-slate-800 dark:text-slate-100 tracking-tight">{t('item.create')}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 relative z-10">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 px-1">{t('item.name')}</label>
            <input 
              type="text"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('item.namePlace')}
              className="w-full glass-input text-sm px-4 py-3 placeholder:text-slate-400/70"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 px-1">{t('item.thumbnail')}</label>
            <div className="flex gap-4 items-start">
              <div 
                className="w-20 h-20 shrink-0 border border-dashed border-slate-300 dark:border-slate-600 rounded-2xl flex items-center justify-center bg-white/50 dark:bg-slate-800/50 relative overflow-hidden group cursor-pointer hover:border-slate-400 hover:bg-white/80 transition-all shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {thumbnailUrl ? (
                  <>
                    <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] hidden group-hover:flex items-center justify-center transition-all">
                      <span className="text-white text-[10px] font-semibold uppercase tracking-wider">{t('item.thumbnail.change')}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    <ImagePlus className="w-6 h-6 mx-auto mb-1 opacity-70" />
                    <span className="text-[9px] font-semibold uppercase tracking-wider">{t('item.thumbnail.upload')}</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) processImageFile(file);
                  }}
                />
              </div>
              <div className="flex-1 space-y-3">
                <input 
                  type="url"
                  value={thumbnailUrl}
                  onChange={e => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full glass-input text-xs px-4 py-2.5 placeholder:text-slate-400/70"
                />
                <p className="text-[10px] font-medium text-slate-400/80 px-1">
                  {t('item.thumbnail.help')}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 px-1">{t('item.selectFlow')}</label>
            <Select
              value={flowId}
              onChange={val => setFlowId(val)}
              options={Object.values(flows).map(flow => ({ value: flow.id, label: flow.name }))}
            />
          </div>

          <div className="pt-6 border-t border-white/20 dark:border-slate-800/50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass-btn py-3 font-semibold text-sm rounded-xl"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 glass-btn-primary py-3 font-semibold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
