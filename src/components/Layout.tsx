import { LayoutDashboard, Layers, Menu, ArrowLeft, Workflow, Users, Wrench, Moon, Sun, Globe } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { cn } from '../utils';
import { useTheme } from '../contexts/ThemeContext';
import { useLocale } from '../contexts/LocaleContext';

interface LayoutProps {
  children: ReactNode;
  currentView: 'dashboard' | 'board' | 'detail' | 'flow-list' | 'flow-editor' | 'actor-manager' | 'tool-manager';
  setCurrentView: (view: 'dashboard' | 'board' | 'detail' | 'flow-list' | 'flow-editor' | 'actor-manager' | 'tool-manager') => void;
  onBack?: () => void;
  onNewItem?: () => void;
}

export default function Layout({ children, currentView, setCurrentView, onBack, onNewItem }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'board', label: t('nav.items'), icon: Layers },
    { id: 'flow-list', label: t('nav.flows'), icon: Workflow },
    { id: 'actor-manager', label: 'Team & Actors', icon: Users },
    { id: 'tool-manager', label: t('nav.tools'), icon: Wrench },
  ] as const;

  const today = new Intl.DateTimeFormat(locale === 'en' ? 'en-CA' : 'ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).replace(/-/g, '.');

  const getPageTitle = (view: string) => {
    switch(view) {
      case 'dashboard': return t('nav.dashboard');
      case 'board': return t('nav.items');
      case 'detail': return 'Item Detail';
      case 'flow-list': return t('nav.flows');
      case 'actor-manager': return 'Team & Actors';
      case 'tool-manager': return t('nav.tools');
      default: return 'Flow Navigator';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static top-0 left-0 h-full w-64 glass-panel rounded-r-3xl border-r-0 lg:border-r border-white/20 z-50 transform transition-all duration-300 ease-out flex flex-col p-6 text-slate-900 dark:text-slate-100 m-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
            F
          </div>
          <h1 className="text-xl font-semibold tracking-tight">{t('app.title')}</h1>
        </div>

        <nav className="space-y-3 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (currentView === 'detail' && item.id === 'board');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-2xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-white/80 dark:bg-slate-800/80 shadow-sm border border-white/30 dark:border-white/10 text-blue-600 dark:text-blue-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white border border-white/50 dark:border-white/10 dark:hover:bg-slate-700 shadow-sm transition-all flex-1 flex justify-center text-slate-600 dark:text-slate-300">
               {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </button>
             <button onClick={() => setLocale(locale === 'en' ? 'ko' : 'en')} className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white border border-white/50 dark:border-white/10 dark:hover:bg-slate-700 shadow-sm transition-all flex-1 flex justify-center text-slate-600 dark:text-slate-300 items-center gap-2 font-medium text-xs uppercase">
               <Globe className="w-4 h-4" />
               {locale}
             </button>
          </div>
          <div className="flex items-center gap-3 mt-2 p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/10 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center font-bold text-white shadow-md">
              JD
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">John Doe</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">Project Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent transition-colors duration-200">
        <header className="h-[72px] glass-panel border-x-0 border-t-0 rounded-none px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 lg:gap-0">
              {currentView === 'detail' && (
                <button onClick={onBack} className="lg:hidden p-2 -ml-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline font-light">/</span>
              <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-lg sm:ml-4 tracking-tight">
                {getPageTitle(currentView)}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mb-0.5">Today</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{today}</p>
            </div>
            <button 
              onClick={onNewItem}
              className="bg-black/90 dark:bg-white/90 text-white dark:text-slate-900 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-medium shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5 transition-all border border-white/20"
            >
              + {t('itemboard.newItem')}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 no-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
