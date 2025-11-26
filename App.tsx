
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { PortfolioGrid } from './components/PortfolioGrid';
import { ScheduleBoard } from './components/ScheduleBoard';
import { SettingsPanel } from './components/SettingsPanel';
import { ServicesList } from './components/ServicesList';
import { ViewState, UserProfile, BusinessCategory, PortfolioItem, CommissionSlot, CommissionStatus, AppData, ImportTemplate, ThemeSettings, PortfolioLayoutMode } from './types';
import { X, Copy, Check, FileCode, Zap, Info } from 'lucide-react';

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
备注：这里写详细要求...`
  }
];

const INITIAL_THEME: ThemeSettings = {
  backgroundImage: '', 
  backgroundSize: 'cover',
  font: 'sans',
  customFontUrl: '',
  overlayOpacity: 0.2
};

const STATUS_ORDER: CommissionStatus[] = ['waiting', 'typography', 'motion', 'color_fx', 'export', 'finished'];

// Default Empty State
const DEFAULT_STATE: AppData = {
    user: INITIAL_USER,
    categories: INITIAL_CATEGORIES,
    portfolio: INITIAL_PORTFOLIO,
    scheduleSlots: INITIAL_SLOTS,
    importTemplates: INITIAL_TEMPLATES,
    theme: INITIAL_THEME,
    portfolioLayout: 'masonry',
    lastUpdated: new Date().toISOString()
};

const loadInitialState = (): AppData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (e) {
    console.warn("Could not load local storage data.", e);
  }
  return DEFAULT_STATE;
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('portfolio');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isVisitor, setIsVisitor] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [data, setData] = useState<AppData>(loadInitialState);

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Destructure
  const { user, categories, portfolio, scheduleSlots, importTemplates, theme, portfolioLayout } = data;

  // --- 1. Hydrate from URL Param (Snapshot Sharing) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const encodedData = params.get('data');

    if (mode === 'visitor') {
      setIsReadOnly(true);
      setIsVisitor(true);
      
      // If data param is present, attempt to hydrate state from it
      if (encodedData && window.LZString) {
          try {
              const decompressed = window.LZString.decompressFromEncodedURIComponent(encodedData);
              if (decompressed) {
                  const sharedData = JSON.parse(decompressed);
                  // Merge with defaults to ensure structure safety
                  setData({ ...DEFAULT_STATE, ...sharedData });
                  console.log("Hydrated from snapshot URL");
              }
          } catch (e) {
              console.error("Failed to decompress shared data", e);
              alert("链接数据损坏或过期 / Link data invalid");
          }
      } else {
        // Fallback to default state if no data param
        // This handles the case where user just manually typed ?mode=visitor
        setData(DEFAULT_STATE);
      }
    }
  }, []);

  // --- 2. Auto-Save Logic (Optimized) ---
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isVisitor) {
        const save = async () => {
          setSaveStatus('saving');
          try {
            // Delay save execution to let UI breathe
            await new Promise(resolve => setTimeout(resolve, 0));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            setSaveStatus('saved');
          } catch (e) {
            console.error("Save failed", e);
          }
        };
        // Increase debounce to 2000ms to reduce frequency of heavy saves
        const timer = setTimeout(save, 2000);
        return () => clearTimeout(timer);
    }
  }, [data, isVisitor]);

  // --- 3. Dynamic Font Injection ---
  useEffect(() => {
    const styleId = 'custom-font-style';
    let styleTag = document.getElementById(styleId);
    if (theme.customFontUrl) {
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = `@font-face { font-family: 'CustomUserFont'; src: url('${theme.customFontUrl}'); font-display: swap; }`;
    } else {
        if (styleTag) styleTag.remove();
    }
  }, [theme.customFontUrl]);

  // --- 4. Share Logic (Pruning & Compression) ---
  const handleShare = useCallback(() => {
      const isBase64 = (str: string) => str && str.startsWith('data:');

      const safePortfolio = portfolio.map(item => ({
          ...item,
          imageUrl: isBase64(item.imageUrl) ? 'https://via.placeholder.com/800x600?text=Image+Too+Large+For+Link' : item.imageUrl
      }));

      const safeUser = {
          ...user,
          avatar: isBase64(user.avatar) ? 'https://ui-avatars.com/api/?name=' + user.name : user.avatar
      };

      const safeTheme = {
          ...theme,
          backgroundImage: isBase64(theme.backgroundImage) ? '' : theme.backgroundImage
      };

      // DATA PRUNING: Remove heavy/private fields for shorter URL
      // Remove 'requirements' from schedule to save space and protect details
      const prunedSlots = scheduleSlots.map(slot => ({
        id: slot.id,
        clientName: slot.clientName,
        type: slot.type,
        status: slot.status,
        deadline: slot.deadline,
        progress: slot.progress
        // requirements: REMOVED
      }));

      // Remove 'details' from categories if it's too long, or keep it if essential. 
      // For maximum shrinking, we remove templates.
      const prunedPayload: Partial<AppData> = {
          user: safeUser,
          categories,
          portfolio: safePortfolio,
          scheduleSlots: prunedSlots, // Use pruned slots
          theme: safeTheme,
          portfolioLayout,
          lastUpdated: new Date().toISOString()
          // importTemplates: REMOVED
      };

      if (window.LZString) {
          try {
              const json = JSON.stringify(prunedPayload);
              const compressed = window.LZString.compressToEncodedURIComponent(json);
              
              const url = new URL(window.location.href);
              url.searchParams.set('mode', 'visitor');
              if (user.name) url.searchParams.set('artist', user.name);
              url.searchParams.set('data', compressed);
              
              setShareUrl(url.toString());
              setShowShareModal(true);

              const hasStrippedImages = portfolio.some(p => isBase64(p.imageUrl)) || isBase64(user.avatar) || isBase64(theme.backgroundImage);
              if (hasStrippedImages) {
                  // Optional: You could show a warning in the modal instead of alert
              } 

          } catch (e) {
              console.error("Compression failed", e);
              alert("生成链接失败：数据量过大。请尝试减少排单数量或使用外部图片链接。");
          }
      } else {
          alert("组件未加载，请刷新页面重试。");
      }
  }, [portfolio, user, theme, categories, scheduleSlots, portfolioLayout]);

  // Update Handlers - Memoized to prevent re-renders of child components
  const updateData = useCallback((updates: Partial<AppData>) => {
    setData(prev => ({ ...prev, ...updates, lastUpdated: new Date().toISOString() }));
  }, []);

  const handleUpdateUser = useCallback((u: UserProfile) => updateData({ user: u }), [updateData]);
  const handleUpdateCategories = useCallback((c: BusinessCategory[]) => updateData({ categories: c }), [updateData]);
  const handleUpdateTheme = useCallback((t: ThemeSettings) => updateData({ theme: t }), [updateData]);
  const handleUpdateLayout = useCallback((l: PortfolioLayoutMode) => updateData({ portfolioLayout: l }), [updateData]);
  const handleAddPortfolioItem = useCallback((i: PortfolioItem) => updateData({ portfolio: [i, ...portfolio] }), [updateData, portfolio]); 
  const handleDeletePortfolioItem = useCallback((id: string) => updateData({ portfolio: portfolio.filter(i => i.id !== id) }), [updateData, portfolio]);
  const handleImportSchedule = useCallback((s: CommissionSlot[]) => updateData({ scheduleSlots: [...scheduleSlots, ...s] }), [updateData, scheduleSlots]);
  const handleUpdateSlot = useCallback((id: string, u: Partial<CommissionSlot>) => updateData({ scheduleSlots: scheduleSlots.map(s => s.id === id ? { ...s, ...u } : s) }), [updateData, scheduleSlots]);
  const handleDeleteSlot = useCallback((id: string) => updateData({ scheduleSlots: scheduleSlots.filter(s => s.id !== id) }), [updateData, scheduleSlots]);
  const handleAdvanceStatus = useCallback((id: string) => updateData({
    scheduleSlots: scheduleSlots.map(slot => {
        if (slot.id !== id) return slot;
        const idx = STATUS_ORDER.indexOf(slot.status);
        if (idx < STATUS_ORDER.length - 1) {
          const next = STATUS_ORDER[idx + 1];
          const prog = Math.round(((idx + 1) / (STATUS_ORDER.length - 1)) * 100);
          return { ...slot, status: next, progress: prog };
        }
        return slot;
    })
  }), [updateData, scheduleSlots]);
  const handleUpdateTemplates = useCallback((t: ImportTemplate[]) => updateData({ importTemplates: t }), [updateData]);

  const handleExportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `artflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);

  const handleImportData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.user) {
          setData({ ...DEFAULT_STATE, ...parsed });
          alert("数据导入成功！Backup restored.");
        }
      } catch (err) { alert("文件错误 File Error"); }
    };
    reader.readAsText(file);
  }, []);

  const handleToggleReadOnly = useCallback(() => {
    if (isVisitor) return; 
    setIsReadOnly(prev => !prev);
    if (!isReadOnly) setView('portfolio');
  }, [isVisitor, isReadOnly]);

  const getFontFamily = () => {
      if (theme.customFontUrl) return 'CustomUserFont, sans-serif';
      switch (theme.font) {
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
          onShare={handleShare}
        />
        
        <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-12 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Header */}
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
                  scheduleSlots={scheduleSlots}
                  templates={importTemplates}
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

      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2"><Zap size={20} className="text-amber-500"/> 分享主页 Share Profile</h3>
                   <button onClick={() => setShowShareModal(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
               </div>
               
               <div className="p-6 space-y-6 overflow-y-auto">
                   <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                       <Info className="text-blue-500 shrink-0 mt-0.5" size={18}/>
                       <div className="text-sm text-blue-800 space-y-1">
                           <p className="font-bold">快照链接已生成 (Snapshot Generated)</p>
                           <p>此链接已进行“瘦身”处理，移除了排单详情和隐私备注，方便顾客快速查看档期和作品。</p>
                       </div>
                   </div>

                   <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase">Snapshot Link (Shortened)</label>
                       <div className="flex gap-2">
                           <input 
                             readOnly 
                             value={shareUrl} 
                             className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-primary-100"
                           />
                           <button 
                             onClick={() => {
                                 navigator.clipboard.writeText(shareUrl);
                                 setLinkCopied(true);
                                 setTimeout(() => setLinkCopied(false), 2000);
                             }}
                             className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shrink-0"
                           >
                               {linkCopied ? <Check size={16}/> : <Copy size={16}/>}
                               {linkCopied ? 'Copied' : 'Copy'}
                           </button>
                       </div>
                       <p className="text-[10px] text-slate-400">
                           * 如果链接依然过长导致无法发送，请使用下方的“部署代码”方案。
                       </p>
                   </div>

                   <div className="border-t border-slate-100 pt-6">
                       <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><FileCode size={18}/> 终极短链方案 (Deployment)</h4>
                       <p className="text-sm text-slate-500 mb-4">
                           如果你希望获得最短、永久的链接 (如 <code>mysite.vercel.app</code>)，请将你的数据生成为代码，并更新到项目中进行部署。
                       </p>
                       <button 
                         onClick={() => {
                             setShowShareModal(false);
                             setView('settings');
                         }}
                         className="w-full py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                       >
                           前往控制台生成部署代码 (Go to Console)
                       </button>
                   </div>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
