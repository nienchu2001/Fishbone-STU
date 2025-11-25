import React from 'react';
import { LayoutGrid, Calendar, Settings, Image as ImageIcon, Briefcase } from 'lucide-react';
import { ViewState, UserProfile } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  user: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, user }) => {
  const menuItems = [
    { id: 'portfolio', label: '作品集', icon: ImageIcon },
    { id: 'services', label: '业务类型', icon: Briefcase },
    { id: 'schedule', label: '排单档期', icon: Calendar },
    { id: 'settings', label: '控制台', icon: Settings },
  ] as const;

  return (
    <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 flex flex-col items-center lg:items-start z-50 transition-all duration-300 glass-panel border-r-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-6 w-full flex flex-col items-center lg:items-start gap-4">
        <div className="relative group cursor-pointer" onClick={() => onChangeView('settings')}>
          <div className="w-12 h-12 lg:w-20 lg:h-20 rounded-full overflow-hidden ring-4 ring-white/50 shadow-lg transition-transform transform group-hover:scale-105">
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white lg:hidden"></div>
        </div>
        
        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{user.name}</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium opacity-70">Visual Artist</p>
        </div>
      </div>

      <nav className="flex-1 w-full px-2 lg:px-4 py-4 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
                ${isActive 
                  ? 'bg-white/80 shadow-sm text-primary-600' 
                  : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'
                }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative z-10"/>
              <span className={`hidden lg:block font-medium text-sm tracking-wide relative z-10 ${isActive ? 'text-primary-700' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-400 rounded-r-full hidden lg:block" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 w-full hidden lg:block">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">CONTACT</p>
          <p className="text-xs text-slate-600 font-medium truncate opacity-80" title={user.email}>{user.email}</p>
        </div>
      </div>
    </aside>
  );
};