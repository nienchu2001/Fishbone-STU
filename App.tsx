
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { PortfolioGrid } from './components/PortfolioGrid';
import { ScheduleBoard } from './components/ScheduleBoard';
import { SettingsPanel } from './components/SettingsPanel';
import { ServicesList } from './components/ServicesList';
import { ViewState, UserProfile, BusinessCategory, PortfolioItem, CommissionSlot, CommissionStatus, AppData, ImportTemplate, ThemeSettings, PortfolioLayoutMode } from './types';
import { X, Copy, Check, FileCode, Zap, Info, Link as LinkIcon, Scissors, Loader2, Globe } from 'lucide-react';

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
const FONT_ORDER = ['sans', 'serif', 'artistic', 'handwriting'];

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

// --- ULTRA COMPRESSION HELPERS V3 (Base36 Dates & Aggressive Stripping) ---

const BASE_DATE = new Date('2023-01-01').getTime();
const DAY_MS = 86400000;

// Compress Date: 2024-05-20 -> Days from 2023-01-01 -> Base36
const compressDateBase36 = (dateStr: string) => {
    if (!dateStr || dateStr === 'TBD') return '';
    try {
        const d = new Date(dateStr).getTime();
        const diffDays = Math.floor((d - BASE_DATE) / DAY_MS);
        if (isNaN(diffDays)) return '';
        return Math.max(0, diffDays).toString(36);
    } catch (e) { return ''; }
};

// Decompress Date
const decompressDateBase36 = (base36: string) => {
    if (!base36) return 'TBD';
    try {
        const diffDays = parseInt(base36, 36);
        const targetDate = new Date(BASE_DATE + diffDays * DAY_MS);
        return targetDate.toISOString().split('T')[0];
    } catch (e) { return 'TBD'; }
};

// 1. URL Protocol Stripping (Saves 8 chars per URL)
// Replaces 'https://' with '$'
const compressUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('https://')) return '$' + url.slice(8);
    if (url.startsWith('http://')) return '~' + url.slice(7);
    return url;
};
const decompressUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('$')) return 'https://' + url.slice(1);
    if (url.startsWith('~')) return 'http://' + url.slice(1);
    return url;
};

// Map string status to integer 0-5
const mapStatusToInt = (s: string) => Math.max(0, STATUS_ORDER.indexOf(s as CommissionStatus));
const mapIntToStatus = (i: number) => STATUS_ORDER[i] || 'waiting';

// Pack Data into Ultra-Lite Array V3
const packData = (data: AppData): any[] => {
    // 1. User: [name, contact, avatar_url_only]
    // ALLOW Base64 Avatars now (removed stripping)
    const safeAvatar = compressUrl(data.user.avatar);
    
    const u = [
        data.user.name, 
        data.user.contact, 
        safeAvatar
    ];

    // 2. Theme: [bg_url_only, font_idx, opacity, custom_font_url]
    // ALLOW Base64 Backgrounds now (removed stripping)
    const safeBg = compressUrl(data.theme.backgroundImage);
    
    const fontIdx = Math.max(0, FONT_ORDER.indexOf(data.theme.font));
    const t = [
        safeBg,
        fontIdx,
        Math.round(data.theme.overlayOpacity * 100),
        compressUrl(data.theme.customFontUrl || '')
    ];

    // 3. Categories: [[name, price]]
    const c = data.categories.map(cat => [cat.name, cat.priceRange]);

    // 4. Slots: [[name, status_int, date_base36]]
    // Using Base36 Date compression
    const s = data.scheduleSlots.map(slot => [
        slot.clientName,
        mapStatusToInt(slot.status),
        compressDateBase36(slot.deadline)
    ]);

    // 5. Portfolio: [[title, cat_index, url_only, type_int]]
    const catIdToIndex = new Map(data.categories.map((c, i) => [c.id, i]));
    const p = data.portfolio.map(item => {
        // STILL STRIP Base64 images from portfolio to prevent massive link explosion
        // Portfolio items are too numerous to include base64
        if (item.imageUrl.startsWith('data:')) return null;
        
        const catIdx = catIdToIndex.get(item.category) ?? 0;
        return [
            item.title,
            catIdx,
            compressUrl(item.imageUrl),
            item.mediaType === 'video' ? 1 : 0
        ];
    }).filter(Boolean); // Remove nulls

    return [u, t, c, s, p];
};

const unpackData = (packed: any[]): Partial<AppData> => {
    try {
        const [u, t, c, s, p] = packed;
        
        // Unpack User
        const user: UserProfile = {
            ...INITIAL_USER,
            name: u[0] || INITIAL_USER.name,
            contact: u[1] || INITIAL_USER.contact,
            avatar: decompressUrl(u[2]) || `https://ui-avatars.com/api/?name=${encodeURIComponent(u[0] || 'A')}&background=random`, 
            bio: "" 
        };

        // Unpack Theme
        const theme: ThemeSettings = {
            ...INITIAL_THEME,
            backgroundImage: decompressUrl(t[0]),
            font: FONT_ORDER[t[1]] as any || 'sans',
            overlayOpacity: (t[2] || 20) / 100,
            customFontUrl: decompressUrl(t[3])
        };

        const categories: BusinessCategory[] = c.map((cat: any[], i: number) => ({
            id: `cat_${i}`,
            name: cat[0],
            priceRange: cat[1],
            description: "",
            details: ""
        }));

        const scheduleSlots: CommissionSlot[] = s.map((slot: any[], idx: number) => {
            const statusStr = mapIntToStatus(slot[1]);
            // Calculate approximate progress based on status
            const progress = (slot[1] / 5) * 100;
            return {
                id: `snap_s_${idx}`,
                clientName: slot[0],
                type: 'Commission', // Generic type
                status: statusStr,
                deadline: decompressDateBase36(slot[2]), // Decompress Base36
                progress: progress,
                requirements: ""
            };
        });

        const portfolio: PortfolioItem[] = p.map((item: any[], idx: number) => {
            const catIdx = item[1] as number;
            const catId = categories[catIdx] ? categories[catIdx].id : categories[0]?.id || 'ui';
            return {
                id: `snap_p_${idx}`,
                title: item[0],
                category: catId,
                imageUrl: decompressUrl(item[2]),
                mediaType: item[3] === 1 ? 'video' : 'image',
                date: ''
            };
        });

        return { user, theme, categories, scheduleSlots, portfolio };
    } catch (e) {
        console.error("Unpacking failed", e);
        return {};
    }
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
  const [urlLength, setUrlLength] = useState(0);
  
  // NEW: Short Link State
  const [isShortening, setIsShortening] = useState(false);
  const [shortLinkError, setShortLinkError] = useState(false);

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
      
      if (encodedData && window.LZString) {
          try {
              const decompressed = window.LZString.decompressFromEncodedURIComponent(encodedData);
              if (decompressed) {
                  const parsed = JSON.parse(decompressed);
                  
                  // Check if it's the new Array format (Ultra Mini) or old Object format
                  let hydratedData: Partial<AppData> = {};
                  if (Array.isArray(parsed)) {
                      hydratedData = unpackData(parsed);
                  } else {
                      hydratedData = parsed; // Legacy support
                  }
                  
                  // Merge
                  setData({ ...DEFAULT_STATE, ...hydratedData });
              }
          } catch (e) {
              console.error("Failed to decompress shared data", e);
              alert("链接数据损坏或过期 / Link data invalid");
          }
      } else {
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
            await new Promise(resolve => setTimeout(resolve, 0));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            setSaveStatus('saved');
          } catch (e) {
            console.error("Save failed", e);
          }
        };
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

  // --- 4. Share Logic (Ultra Compression V3) ---
  const handleShare = useCallback(() => {
      if (window.LZString) {
          try {
              // Use the new V3 PACK function
              const miniData = packData(data);
              
              const json = JSON.stringify(miniData);
              const compressed = window.LZString.compressToEncodedURIComponent(json);
              
              const url = new URL(window.location.href);
              url.searchParams.set('mode', 'visitor');
              url.searchParams.set('data', compressed);
              
              const finalUrl = url.toString();
              setShareUrl(finalUrl);
              setUrlLength(finalUrl.length);
              setShowShareModal(true);
              setShortLinkError(false);

          } catch (e) {
              console.error("Compression failed", e);
              alert("生成链接失败。");
          }
      } else {
          alert("组件未加载，请刷新页面重试。");
      }
  }, [data]);

  const generateShortLink = async () => {
      setIsShortening(true);
      setShortLinkError(false);
      try {
          // Using TinyURL's public API to create a short link
          // Note: In some strict browser environments, this might face CORS issues.
          // We use a simple fetch here.
          const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(shareUrl)}`);
          if (response.ok) {
              const shortUrl = await response.text();
              setShareUrl(shortUrl);
              setUrlLength(shortUrl.length);
              navigator.clipboard.writeText(shortUrl);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 2000);
          } else {
              throw new Error("Shortening failed");
          }
      } catch (e) {
          console.error(e);
          setShortLinkError(true);
      } finally {
          setIsShortening(false);
      }
  };

  // Update Handlers (Wrapped in useCallback)
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
                   <h3 className="font-bold text-slate-800 flex items-center gap-2"><Zap size={20} className="text-amber-500"/> 分享中心 Share Center</h3>
                   <button onClick={() => setShowShareModal(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
               </div>
               
               <div className="p-6 space-y-6 overflow-y-auto">
                   
                   {/* Status Banner */}
                   <div className={`border rounded-xl p-4 flex gap-3 transition-colors ${urlLength < 100 ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                       {urlLength < 100 ? <Check className="text-emerald-500 shrink-0 mt-0.5" size={18}/> : <Scissors className="text-blue-500 shrink-0 mt-0.5" size={18}/>}
                       <div className="text-sm space-y-1">
                           <p className={`font-bold ${urlLength < 100 ? 'text-emerald-800' : 'text-blue-800'}`}>
                               {urlLength < 100 ? '完美！终极短链生成成功 (Perfect!)' : '标准压缩链接生成的 (Standard Compressed)'}
                           </p>
                           <p className={urlLength < 100 ? 'text-emerald-700' : 'text-blue-700'}>
                               当前长度: <strong>{urlLength}</strong> 字符。
                               {urlLength < 100 ? ' 极简链接，适合任何平台分享。' : ' 点击下方按钮可压缩至 30 字符以内。'}
                           </p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                           <span>Share Link</span>
                           {urlLength > 100 && <span className="text-amber-500">建议生成短链</span>}
                       </label>
                       
                       <div className="flex flex-col md:flex-row gap-2">
                           <input 
                             readOnly 
                             value={shareUrl} 
                             className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-primary-100"
                           />
                           <div className="flex gap-2 shrink-0">
                               {/* Shorten Button */}
                               {urlLength > 100 && (
                                   <button 
                                     onClick={generateShortLink}
                                     disabled={isShortening}
                                     className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-70"
                                   >
                                     {isShortening ? <Loader2 size={16} className="animate-spin"/> : <Globe size={16}/>}
                                     {isShortening ? '生成中...' : '转为短链'}
                                   </button>
                               )}

                               <button 
                                 onClick={() => {
                                     navigator.clipboard.writeText(shareUrl);
                                     setLinkCopied(true);
                                     setTimeout(() => setLinkCopied(false), 2000);
                                 }}
                                 className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-md"
                               >
                                   {linkCopied ? <Check size={16}/> : <Copy size={16}/>}
                                   {linkCopied ? '已复制' : '复制'}
                               </button>
                           </div>
                       </div>
                       
                       {shortLinkError && (
                           <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100">
                               ⚠ 生成失败：您的本地头像/背景图太大，导致链接过长。<br/>
                               Shortening failed: Images too large.<br/>
                               <span className="font-normal text-slate-600">请使用长链接(Snapshot Link)分享，或在设置中使用外部图床链接替换本地图片。</span>
                           </p>
                       )}
                       
                       <p className="text-[10px] text-slate-400 leading-tight pl-1">
                           * 长链接已包含您的头像和背景图（Base64）。<br/>
                           * 若“转为短链”失败，通常是因为您使用了本地上传的大图。请改用图床链接。
                       </p>
                   </div>

                   <div className="border-t border-slate-100 pt-6">
                       <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><FileCode size={18}/> 备选方案：部署代码</h4>
                       <button 
                         onClick={() => {
                             setShowShareModal(false);
                             setView('settings');
                         }}
                         className="w-full py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm"
                       >
                           如果短链服务不稳定，请使用【部署代码】方案
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
