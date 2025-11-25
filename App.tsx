import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { PortfolioGrid } from './components/PortfolioGrid';
import { ScheduleBoard } from './components/ScheduleBoard';
import { SettingsPanel } from './components/SettingsPanel';
import { ServicesList } from './components/ServicesList';
import { ViewState, UserProfile, BusinessCategory, PortfolioItem, CommissionSlot, CommissionStatus } from './types';

// Initial Mock Data
const INITIAL_USER: UserProfile = {
  name: "Clover Art",
  avatar: "https://picsum.photos/seed/artist2/200/200",
  email: "commission@cloverart.com",
  bio: "专注橙光/易次元美术定制。擅长日系厚涂、UI设计。\n工作日10:00-19:00在线，周末不定时掉落。",
  tags: ["UI设计", "徽章", "封面", "星动卡"]
};

const INITIAL_CATEGORIES: BusinessCategory[] = [
  { 
    id: 'ui', 
    name: 'UI 界面定制', 
    priceRange: '¥500 - ¥2000', 
    description: '包含全套游戏UI界面设计，系统界面、对话框、按钮等组件。风格可定制。',
    details: '【业务详情】\n1. 包含：封面、通道、设置、存读档、回放、好感界面\n2. 尺寸：1920x1080px (或指定尺寸)\n3. 工期：排单后15-20个工作日\n4. 格式：PSD源文件 + PNG切图'
  },
  { 
    id: 'badge', 
    name: '徽章 / Badge', 
    priceRange: '¥100 - ¥300', 
    description: '高精度Q版或特写徽章，含动效拆分。',
    details: '【业务详情】\n1. 尺寸：500x500px 300dpi\n2. 包含：静帧绘制 + 简单拆分\n3. 动效：可加购Spine动效制作\n4. 修改：草稿阶段可大改3次'
  },
  { 
    id: 'star', 
    name: '星动卡 (Visual Card)', 
    priceRange: '¥800+', 
    description: '动态卡面设计，含静帧绘制与后期动效制作。',
    details: '【业务详情】\n1. 流程：草稿->线稿->色草->细化->拆分->动效\n2. 风格：日系厚涂/伪厚涂\n3. 交付：MP4格式 (可循环)'
  },
  { 
    id: 'motion', 
    name: 'PV/动效制作', 
    priceRange: '¥300起', 
    description: '宣传PV，OP/ED视频制作，UI动态效果。',
    details: '【需提供】\n1. 剧本/分镜\n2. 相应的立绘、CG素材\n3. 指定BGM'
  }
];

const INITIAL_PORTFOLIO: PortfolioItem[] = [
  { id: '1', title: '古风言情UI界面', category: 'ui', imageUrl: 'https://picsum.photos/seed/ui1/600/800', mediaType: 'image', date: '2023.10' },
  { id: '2', title: '男主生日徽章', category: 'badge', imageUrl: 'https://picsum.photos/seed/badge1/400/400', mediaType: 'image', date: '2023.11' },
  { id: '4', title: '女主星动卡-流光', category: 'star', imageUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', mediaType: 'video', date: '2023.12' },
  { id: '3', title: '现代悬疑封面', category: 'ui', imageUrl: 'https://picsum.photos/seed/cover1/600/800', mediaType: 'image', date: '2023.09' },
  { id: '5', title: '系统设置界面', category: 'ui', imageUrl: 'https://picsum.photos/seed/ui2/600/800', mediaType: 'image', date: '2023.10' },
  { id: '6', title: '节日限定动效', category: 'motion', imageUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', mediaType: 'video', date: '2023.11' },
];

const INITIAL_SLOTS: CommissionSlot[] = [
  { id: 's1', clientName: 'User_8921', type: 'UI全套', status: 'color_fx', deadline: '2023-12-25', progress: 80 },
  { id: 's2', clientName: 'Sakura', type: '封面设计', status: 'typography', deadline: '2023-12-30', progress: 30 },
  { id: 's3', clientName: 'Momo', type: '徽章x2', status: 'waiting', deadline: '2024-01-05', progress: 0 },
  { id: 's4', clientName: 'Ghost', type: '星动卡', status: 'motion', deadline: '2024-01-15', progress: 60 },
];

// Defined order of stages for VN workflow
const STATUS_ORDER: CommissionStatus[] = ['waiting', 'typography', 'motion', 'color_fx', 'export', 'finished'];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('portfolio');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [categories, setCategories] = useState<BusinessCategory[]>(INITIAL_CATEGORIES);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(INITIAL_PORTFOLIO);
  const [scheduleSlots, setScheduleSlots] = useState<CommissionSlot[]>(INITIAL_SLOTS);
  
  // Handlers for updates
  const handleUpdateUser = (updatedUser: UserProfile) => setUser(updatedUser);
  const handleUpdateCategories = (updatedCategories: BusinessCategory[]) => setCategories(updatedCategories);
  
  const handleAddPortfolioItem = (item: PortfolioItem) => {
    setPortfolio([item, ...portfolio]);
  };

  const handleDeletePortfolioItem = (id: string) => {
    setPortfolio(portfolio.filter(item => item.id !== id));
  };

  const handleImportSchedule = (newSlots: CommissionSlot[]) => {
    setScheduleSlots([...scheduleSlots, ...newSlots]);
  };

  const handleAdvanceStatus = (id: string) => {
    setScheduleSlots(prevSlots => prevSlots.map(slot => {
      if (slot.id !== id) return slot;
      
      const currentIndex = STATUS_ORDER.indexOf(slot.status);
      if (currentIndex < STATUS_ORDER.length - 1) {
        const nextStatus = STATUS_ORDER[currentIndex + 1];
        // Auto-calculate rough progress percentage based on stage index
        const newProgress = Math.round(((currentIndex + 1) / (STATUS_ORDER.length - 1)) * 100);
        return { 
          ...slot, 
          status: nextStatus,
          progress: newProgress
        };
      }
      return slot;
    }));
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 flex">
      <Sidebar currentView={view} onChangeView={setView} user={user} />
      
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header Mobile Only */}
          <div className="lg:hidden flex items-center gap-4 mb-8">
             <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img src={user.avatar} className="w-full h-full object-cover"/>
             </div>
             <h1 className="text-xl font-bold text-slate-800">{user.name}</h1>
          </div>

          <div className="min-h-[80vh]">
            {view === 'portfolio' && (
              <PortfolioGrid items={portfolio} categories={categories} />
            )}
            
            {view === 'schedule' && (
              <ScheduleBoard 
                slots={scheduleSlots} 
                onImportSlots={handleImportSchedule}
                onAdvanceStatus={handleAdvanceStatus}
              />
            )}

            {view === 'services' && (
               <ServicesList categories={categories} />
            )}
            
            {view === 'settings' && (
              <SettingsPanel 
                user={user} 
                categories={categories}
                portfolio={portfolio}
                onUpdateUser={handleUpdateUser}
                onUpdateCategories={handleUpdateCategories}
                onAddPortfolioItem={handleAddPortfolioItem}
                onDeletePortfolioItem={handleDeletePortfolioItem}
              />
            )}
          </div>

          <footer className="mt-20 pt-8 border-t border-slate-200/30 text-center text-slate-400 text-sm">
            <p className="font-medium opacity-70">&copy; {new Date().getFullYear()} {user.name}. All rights reserved.</p>
            <p className="mt-1 text-xs opacity-50 uppercase tracking-widest">Orange Light / Visual Novel Artist Portfolio</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;