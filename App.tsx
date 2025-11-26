
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { PortfolioGrid } from './components/PortfolioGrid';
import { ScheduleBoard } from './components/ScheduleBoard';
import { SettingsPanel } from './components/SettingsPanel';
import { ServicesList } from './components/ServicesList';
import { ViewState, UserProfile, BusinessCategory, PortfolioItem, CommissionSlot, CommissionStatus, AppData, ImportTemplate, ThemeSettings, PortfolioLayoutMode } from './types';

const STORAGE_KEY = 'artflow_data_v1';

// Initial Mock Data (Used as fallback or for new users)
const INITIAL_USER: UserProfile = {
  name: "Clover Art",
  avatar: "https://picsum.photos/seed/artist2/200/200",
  contact: "QQ: 12345678 (工作日10-19点)",
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
  { id: 's1', clientName: 'User_8921', type: 'UI全套', status: 'color_fx', deadline: '2023-12-25', progress: 80, requirements: '古风，红黑色调，需要包含动态按钮。' },
  { id: 's2', clientName: 'Sakura', type: '封面设计', status: 'typography', deadline: '2023-12-30', progress: 30, requirements: '清新校园风，标题字要手写体。' },
  { id: 's3', clientName: 'Momo', type: '徽章x2', status: 'waiting', deadline: '2024-01-05', progress: 0 },
  { id: 's4', clientName: 'Ghost', type: '星动卡', status: 'motion', deadline: '2024-01-15', progress: 60, requirements: '赛博朋克风格，背景霓虹灯闪烁。' },
];

const INITIAL_TEMPLATES: ImportTemplate[] = [
  {
    id: 'default',
    name: '标准下单格式',
    content: `昵称：老板A
业务：UI定制
日期：2024-05-01
备注：这里写详细要求...
(支持换行)

昵称：老板B
业务：徽章
日期：2024-05-05`
  },
  {
    id: 'simple',
    name: '简易单行格式',
    content: `Name: Client1
Type: Logo
DDL: 2024-12-01
Note: Simple style`
  }
];

const INITIAL_THEME: ThemeSettings = {
  backgroundImage: '', // Default to CSS gradient
  backgroundSize: 'cover',
  font: 'sans',
  customFontUrl: '',
  overlayOpacity: 0.2
};

const STATUS_ORDER: CommissionStatus[] = ['waiting', 'typography', 'motion', 'color_fx', 'export', 'finished'];

// Robust Data Loading
const loadInitialState = (): AppData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Data Merging Strategy:
      // If saved data exists, we prefer it.
      // However, if the schema updated (new fields added), we use defaults for missing fields to prevent crashes.
      return {
        user: { ...INITIAL_USER, ...parsed.user },
        categories: Array.isArray(parsed.categories) ? parsed.categories : INITIAL_CATEGORIES,
        portfolio: Array.isArray(parsed.portfolio) ? parsed.portfolio : INITIAL_PORTFOLIO,
        scheduleSlots: Array.isArray(parsed.scheduleSlots) ? parsed.scheduleSlots : INITIAL_SLOTS,
        importTemplates: Array.isArray(parsed.importTemplates) ? parsed.importTemplates : INITIAL_TEMPLATES,
        theme: { ...INITIAL_THEME, ...parsed.theme },
        portfolioLayout: parsed.portfolioLayout || 'masonry',
        lastUpdated: parsed.lastUpdated || new Date().toISOString()
      };
    }
  } catch (e) {
    console.warn("Could not load local storage data, reverting to defaults.", e);
  }
  return {
    user: INITIAL_USER,
    categories: INITIAL_CATEGORIES,
    portfolio: INITIAL_PORTFOLIO,
    scheduleSlots: INITIAL_SLOTS,
    importTemplates: INITIAL_TEMPLATES,
    theme: INITIAL_THEME,
    portfolioLayout: 'masonry',
    lastUpdated: new Date().toISOString()
  };
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('portfolio');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isVisitor, setIsVisitor] = useState(false); // True if via ?mode=visitor
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  
  // Initialize State
  const [data, setData] = useState<AppData>(loadInitialState);

  // Destructure for easier access
  const { user, categories, portfolio, scheduleSlots, importTemplates, theme, portfolioLayout } = data;

  // Persistence Effect with Auto-Save Indicator
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const save = async () => {
      setSaveStatus('saving');
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        // Add a small delay to show "saving" state for UX
        setTimeout(() => setSaveStatus('saved'), 600);
      } catch (e) {
        console.error("Save failed", e);
      }
    };
    
    // Debounce save slightly to prevent thrashing on text inputs
    const timer = setTimeout(save, 500);
    return () => clearTimeout(timer);
  }, [data]);

  // Dynamic Font Injection Effect
  useEffect(() => {
    const styleId = 'custom-font-style';
    let styleTag = document.getElementById(styleId);
    
    if (theme.customFontUrl) {
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = `
            @font-face {
                font-family: 'CustomUserFont';
                src: url('${theme.customFontUrl}');
                font-display: swap;
            }
        `;
    } else {
        if (styleTag) styleTag.remove();
    }
  }, [theme.customFontUrl]);

  // Check URL param for visitor mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'visitor') {
      setIsReadOnly(true);
      setIsVisitor(true);
    }
  }, []);

  // --- Handlers ---

  const updateData = (updates: Partial<AppData>) => {
    setData(prev => ({ ...prev, ...updates, lastUpdated: new Date().toISOString() }));
  };

  const handleUpdateUser = (updatedUser: UserProfile) => updateData({ user: updatedUser });
  const handleUpdateCategories = (updatedCategories: BusinessCategory[]) => updateData({ categories: updatedCategories });
  const handleUpdateTheme = (updatedTheme: ThemeSettings) => updateData({ theme: updatedTheme });
  const handleUpdateLayout = (layout: PortfolioLayoutMode) => updateData({ portfolioLayout: layout });
  
  const handleAddPortfolioItem = (item: PortfolioItem) => {
    updateData({ portfolio: [item, ...portfolio] });
  };

  const handleDeletePortfolioItem = (id: string) => {
    updateData({ portfolio: portfolio.filter(item => item.id !== id) });
  };

  const handleImportSchedule = (newSlots: CommissionSlot[]) => {
    updateData({ scheduleSlots: [...scheduleSlots, ...newSlots] });
  };

  const handleUpdateSlot = (id: string, updates: Partial<CommissionSlot>) => {
    updateData({
      scheduleSlots: scheduleSlots.map(slot => 
        slot.id === id ? { ...slot, ...updates } : slot
      )
    });
  };

  const handleDeleteSlot = (id: string) => {
    updateData({ scheduleSlots: scheduleSlots.filter(slot => slot.id !== id) });
  };

  const handleAdvanceStatus = (id: string) => {
    updateData({
      scheduleSlots: scheduleSlots.map(slot => {
        if (slot.id !== id) return slot;
        const currentIndex = STATUS_ORDER.indexOf(slot.status);
        if (currentIndex < STATUS_ORDER.length - 1) {
          const nextStatus = STATUS_ORDER[currentIndex + 1];
          const newProgress = Math.round(((currentIndex + 1) / (STATUS_ORDER.length - 1)) * 100);
          return { ...slot, status: nextStatus, progress: newProgress };
        }
        return slot;
      })
    });
  };

  const handleUpdateTemplates = (templates: ImportTemplate[]) => {
    updateData({ importTemplates: templates });
  };

  // --- Global Export / Import ---

  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `artflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const parsed = JSON.parse(json);
        if (parsed.user && Array.isArray(parsed.portfolio)) {
          // Robust merge during import as well
          const safeData: AppData = {
              user: { ...INITIAL_USER, ...parsed.user },
              categories: parsed.categories || INITIAL_CATEGORIES,
              portfolio: parsed.portfolio || INITIAL_PORTFOLIO,
              scheduleSlots: parsed.scheduleSlots || INITIAL_SLOTS,
              importTemplates: parsed.importTemplates || INITIAL_TEMPLATES,
              theme: { ...INITIAL_THEME, ...parsed.theme },
              portfolioLayout: parsed.portfolioLayout || 'masonry',
              lastUpdated: new Date().toISOString()
          };
          setData(safeData);
          alert("数据导入成功！Backup restored successfully.");
        } else {
          alert("无效的备份文件 Invalid backup file.");
        }
      } catch (err) {
        alert("文件解析错误 Failed to parse file.");
      }
    };
    reader.readAsText(file);
  };

  const handleToggleReadOnly = () => {
    // If in strict visitor mode, user cannot toggle read-only off.
    if (isVisitor) return;
    
    setIsReadOnly(!isReadOnly);
    if (!isReadOnly) setView('portfolio');
  };

  // Dynamic Theme Styles Logic
  const getFontFamily = () => {
      if (theme.customFontUrl) return 'CustomUserFont, sans-serif';
      
      switch (theme.font) {
          case 'sans': return '"Noto Sans SC", sans-serif';
          case 'serif': return '"Noto Serif SC", serif';
          case 'artistic': return '"ZCOOL XiaoWei", serif';
          case 'handwriting': return '"Long Cang", cursive';
          default: return '"Noto Sans SC", sans-serif';
      }
  };

  const backgroundStyle = theme.backgroundImage ? {
    backgroundImage: `url(${theme.backgroundImage})`,
    backgroundSize: theme.backgroundSize || 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  } : {}; 

  return (
    <div className="min-h-screen text-slate-800 flex transition-all duration-500" 
         style={{ ...backgroundStyle, fontFamily: getFontFamily() }}>
      {/* Background Overlay */}
      {theme.backgroundImage && (
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundColor: `rgba(255,255,255,${theme.overlayOpacity})` }}></div>
      )}

      <div className="relative z-10 flex w-full">
        <Sidebar 
          currentView={view} 
          onChangeView={setView} 
          user={user} 
          isReadOnly={isReadOnly}
          isVisitor={isVisitor}
          saveStatus={saveStatus}
          onToggleReadOnly={handleToggleReadOnly}
        />
        
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
                <PortfolioGrid 
                  items={portfolio} 
                  categories={categories} 
                  layoutMode={portfolioLayout}
                  onLayoutChange={handleUpdateLayout}
                  isReadOnly={isReadOnly}
                  onDelete={handleDeletePortfolioItem}
                />
              )}
              
              {view === 'schedule' && (
                <ScheduleBoard 
                  slots={scheduleSlots} 
                  templates={importTemplates}
                  onImportSlots={handleImportSchedule}
                  onAdvanceStatus={handleAdvanceStatus}
                  onUpdateSlot={handleUpdateSlot}
                  onDeleteSlot={handleDeleteSlot}
                  onUpdateTemplates={handleUpdateTemplates}
                  isReadOnly={isReadOnly}
                />
              )}

              {view === 'services' && (
                 <ServicesList categories={categories} user={user} />
              )}
              
              {view === 'settings' && !isReadOnly && (
                <SettingsPanel 
                  user={user} 
                  categories={categories}
                  portfolio={portfolio}
                  theme={theme}
                  onUpdateUser={handleUpdateUser}
                  onUpdateCategories={handleUpdateCategories}
                  onUpdateTheme={handleUpdateTheme}
                  onAddPortfolioItem={handleAddPortfolioItem}
                  onDeletePortfolioItem={handleDeletePortfolioItem}
                  onExportData={handleExportData}
                  onImportData={handleImportData}
                />
              )}
            </div>

            <footer className="mt-20 pt-8 border-t border-slate-200/30 text-center text-slate-400 text-sm backdrop-blur-sm rounded-t-xl">
              <p className="font-medium opacity-70">&copy; {new Date().getFullYear()} {user.name}. All rights reserved.</p>
              <p className="mt-1 text-xs opacity-50 uppercase tracking-widest">Orange Light / Visual Novel Artist Portfolio</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
