import { ArrowLeft, ExternalLink, RotateCw, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Tooltip } from './Tooltip';

interface EmbedBrowserProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function EmbedBrowser({ url, title, onClose }: EmbedBrowserProps) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      // eslint-disable-next-line no-self-assign
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 animate-in slide-in-from-bottom-5 duration-300">
      {/* Browser Header */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-slate-300 mx-1" />
          <button 
            onClick={handleRefresh}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 max-w-2xl mx-4">
          <div className="bg-slate-100 rounded-lg h-9 px-4 flex items-center justify-center border border-slate-200 truncate">
            <span className="text-xs font-semibold text-slate-500 truncate">
              {title} <span className="opacity-50 mx-2">|</span> {url}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip content="새 탭에서 열기">
            <a 
              href={url}
              target="_blank"
              rel="noreferrer"
              className="p-2 flex hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </Tooltip>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-none"
          title={title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
