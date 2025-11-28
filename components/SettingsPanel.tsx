
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, BusinessCategory, PortfolioItem, MediaType, ThemeSettings, FontStyle, CommissionSlot, ImportTemplate } from '../types';
import { Save, Plus, Trash2, Image, Film, Sparkles, UploadCloud, Download, FileJson, Palette, Type, LayoutTemplate, Monitor, Smartphone, Minimize, Loader2, X, Code, Copy, Info, Wrench, ExternalLink, FileCode, Scissors, Check } from 'lucide-react';

interface SettingsPanelProps {
  user: UserProfile;
  categories: BusinessCategory[];
  portfolio: PortfolioItem[];
  theme: ThemeSettings;
  scheduleSlots?: CommissionSlot[];
  templates?: ImportTemplate[];
  onUpdateUser: (user: UserProfile) => void;
  onUpdateCategories: (categories: BusinessCategory[]) => void;
  onUpdateTheme: (theme: ThemeSettings) => void;
  onAddPortfolioItem: (item: PortfolioItem) => void;
  onDeletePortfolioItem: (id: string) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

// Optimized Buffered Input Component
const BufferedInput = React.memo(({ value, onCommit, className, placeholder, ...props }: any) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <input 
      className={className}
      placeholder={placeholder}
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}
      onBlur={() => onCommit(localValue)}
      {...props}
    />
  );
});

const BufferedTextArea = React.memo(({ value, onCommit, className, placeholder, ...props }: any) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <textarea 
      className={className}
      placeholder={placeholder}
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}
      onBlur={() => onCommit(localValue)}
      {...props}
    />
  );
});

// Utility to compress images to avoid freezing localStorage
const compressImage = (file: File, maxWidth: number, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const outputType = file.type === 'image/png' && maxWidth < 500 ? 'image/png' : 'image/jpeg';
            resolve(canvas.toDataURL(outputType, quality));
        } else {
            reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  user, 
  categories, 
  portfolio, 
  theme, 
  scheduleSlots,
  templates,
  onUpdateUser, 
  onUpdateCategories, 
  onUpdateTheme, 
  onAddPortfolioItem, 
  onDeletePortfolioItem,
  onExportData,
  onImportData
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for explicit URL inputs
  const [avatarUrlInput, setAvatarUrlInput] = useState(user.avatar);
  const [bgUrlInput, setBgUrlInput] = useState(theme.backgroundImage);

  // Sync when props change (e.g. after upload)
  useEffect(() => { setAvatarUrlInput(user.avatar); }, [user.avatar]);
  useEffect(() => { setBgUrlInput(theme.backgroundImage); }, [theme.backgroundImage]);

  // Deployment Code Gen State
  const [showDeployCode, setShowDeployCode] = useState(false);
  const [deployCode, setDeployCode] = useState('');

  // Tool State
  const [toolOutput, setToolOutput] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  // Forms State
  const [newPortfolioItem, setNewPortfolioItem] = useState<Partial<PortfolioItem>>({ category: 'ui', mediaType: 'image' });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 5 * 1024 * 1024) {
          alert("图片过大，请选择小于 5MB 的图片。\nImage too large.");
          return;
      }
      setIsUploading(true);
      try {
          const compressed = await compressImage(file, 300, 0.8);
          onUpdateUser({ ...user, avatar: compressed });
      } catch (err) {
          console.error(err);
          alert("图片处理失败");
      } finally {
          setIsUploading(false);
      }
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if(file.size > 10 * 1024 * 1024) {
            alert("背景图过大，建议小于 10MB。\nFile too large.");
            return;
        }
        setIsUploading(true);
        try {
            const compressed = await compressImage(file, 1920, 0.6);
            onUpdateTheme({ ...theme, backgroundImage: compressed });
        } catch (err) {
            console.error(err);
            alert("图片处理失败");
        } finally {
            setIsUploading(false);
        }
      }
  };

  const handlePortfolioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const isVideo = file.type.startsWith('video');
      
      if (isVideo) {
          if (file.size > 10 * 1024 * 1024) {
              alert("视频文件过大(>10MB)，请使用外部链接(URL)或在工具箱转换。\nVideo too large, please use URL.");
              return;
          }
      } else {
          if (file.size > 8 * 1024 * 1024) {
              alert("图片过大，请使用压缩工具或上传小于8MB的图片。");
              return;
          }
      }

      setIsUploading(true);
      try {
          let result = '';
          if (isVideo) {
             const reader = new FileReader();
             reader.readAsDataURL(file);
             result = await new Promise<string>((resolve) => {
                 reader.onload = (ev) => resolve(ev.target?.result as string);
             });
             setNewPortfolioItem({ ...newPortfolioItem, imageUrl: result, mediaType: 'video' });
          } else {
             result = await compressImage(file, 1000, 0.75);
             setNewPortfolioItem({ ...newPortfolioItem, imageUrl: result, mediaType: 'image' });
          }
      } catch (err) {
          alert("文件读取失败");
      } finally {
          setIsUploading(false);
      }
  };

  const handleAddPortfolio = () => {
    if (newPortfolioItem.title && newPortfolioItem.imageUrl) {
      onAddPortfolioItem({
        id: Date.now().toString(),
        title: newPortfolioItem.title,
        category: newPortfolioItem.category || 'ui',
        imageUrl: newPortfolioItem.imageUrl,
        mediaType: newPortfolioItem.mediaType || 'image',
        date: new Date().toLocaleDateString()
      });
      setNewPortfolioItem({ category: 'ui', mediaType: 'image', title: '', imageUrl: '' });
      const fileInput = document.getElementById('portfolio-file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleGenerateDeployCode = () => {
      const code = `
// 将此代码复制到 App.tsx 顶部的初始数据区域
// Copy this to the top of App.tsx to replace INITIAL constants

const INITIAL_USER: UserProfile = ${JSON.stringify(user, null, 2)};

const INITIAL_CATEGORIES: BusinessCategory[] = ${JSON.stringify(categories, null, 2)};

const INITIAL_PORTFOLIO: PortfolioItem[] = ${JSON.stringify(portfolio, null, 2)};

const INITIAL_THEME: ThemeSettings = ${JSON.stringify(theme, null, 2)};

// 如果需要同步排单数据:
const INITIAL_SLOTS: CommissionSlot[] = ${JSON.stringify(scheduleSlots || [], null, 2)};

const INITIAL_TEMPLATES: ImportTemplate[] = ${JSON.stringify(templates || [], null, 2)};
      `;
      setDeployCode(code);
      setShowDeployCode(true);
  };

  const handleToolFileConvert = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsConverting(true);
      if (file.size > 15 * 1024 * 1024) {
          alert("警告：文件超过15MB，转换可能会导致浏览器卡顿。\nWarning: File > 15MB.");
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
          const res = evt.target?.result as string;
          setToolOutput(res);
          setIsConverting(false);
      };
      reader.onerror = () => {
          alert("转换失败");
          setIsConverting(false);
      };
      reader.readAsDataURL(file);
  };

  const updateCategory = (idx: number, field: keyof BusinessCategory, val: string) => {
     const newCats = [...categories];
     newCats[idx] = { ...newCats[idx], [field]: val };
     onUpdateCategories(newCats);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in pb-20">
      <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
        <h2 className="text-2xl font-bold text-slate-800 px-4 mb-4">控制台 Console</h2>
        {[
          { id: 'profile', label: '个人资料 Profile', icon: <Sparkles size={18} /> },
          { id: 'business', label: '业务设置 Services', icon: <FileJson size={18} /> },
          { id: 'portfolio', label: '作品管理 Portfolio', icon: <Image size={18} /> },
          { id: 'theme', label: '外观装修 Theme', icon: <Palette size={18} /> },
          { id: 'backup', label: '数据备份 Backup', icon: <UploadCloud size={18} /> },
          { id: 'tools', label: '工具箱 Tools', icon: <Wrench size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm
              ${activeTab === tab.id 
                ? 'bg-slate-800 text-white shadow-lg shadow-slate-300' 
                : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 glass-card rounded-3xl p-6 lg:p-8 min-h-[500px] border border-white/60 bg-white/40 backdrop-blur-xl">
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Avatar / 头像</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 ring-4 ring-white shadow-lg relative group">
                  <img src={user.avatar} className="w-full h-full object-cover" />
                  {isUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white"/></div>}
                </div>
                <div className="flex-1">
                   <div className="flex gap-2 mb-2">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-700 transition-all flex items-center gap-2"
                        >
                            <UploadCloud size={16}/> 上传图片 Upload
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
                   </div>
                   <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                       <Info size={12}/> 推荐尺寸 300x300px, 小于 2MB
                   </p>
                   
                   <div className="flex gap-2 mt-3 items-center">
                        <input 
                            value={avatarUrlInput} 
                            onChange={(e) => setAvatarUrlInput(e.target.value)}
                            placeholder="或输入图片 URL (https://...)"
                            className="flex-1 bg-white/50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-800 focus:bg-white transition-colors"
                        />
                        <button 
                            onClick={() => onUpdateUser({...user, avatar: avatarUrlInput})}
                            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                            <Check size={14}/> 应用 Apply
                        </button>
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                <BufferedInput 
                  value={user.name}
                  onCommit={(val: string) => onUpdateUser({ ...user, name: val })}
                  className="w-full p-3 bg-white/60 rounded-xl border border-white focus:ring-2 focus:ring-primary-200 outline-none font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contact Method</label>
                <BufferedInput 
                  value={user.contact}
                  onCommit={(val: string) => onUpdateUser({ ...user, contact: val })}
                  className="w-full p-3 bg-white/60 rounded-xl border border-white focus:ring-2 focus:ring-primary-200 outline-none font-medium text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Bio / 简介</label>
              <BufferedTextArea 
                value={user.bio}
                onCommit={(val: string) => onUpdateUser({ ...user, bio: val })}
                className="w-full p-3 h-32 bg-white/60 rounded-xl border border-white focus:ring-2 focus:ring-primary-200 outline-none resize-none text-slate-600"
              />
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-4">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="bg-white/50 p-4 rounded-2xl border border-white/60 flex flex-col md:flex-row gap-4 group hover:bg-white/80 transition-colors">
                  <div className="flex-1 space-y-2">
                    <BufferedInput 
                      value={cat.name}
                      onCommit={(val: string) => updateCategory(idx, 'name', val)}
                      className="font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-800 outline-none w-full"
                    />
                    <BufferedInput 
                      value={cat.priceRange}
                      onCommit={(val: string) => updateCategory(idx, 'priceRange', val)}
                      className="text-sm text-primary-600 font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-500 outline-none w-full"
                    />
                    <BufferedTextArea 
                      value={cat.description}
                      onCommit={(val: string) => updateCategory(idx, 'description', val)}
                      className="text-xs text-slate-500 bg-transparent w-full resize-none outline-none h-12"
                      placeholder="简短描述..."
                    />
                     <BufferedTextArea 
                      value={cat.details || ''}
                      onCommit={(val: string) => updateCategory(idx, 'details', val)}
                      className="text-xs text-slate-500 bg-black/5 w-full resize-y outline-none h-20 p-2 rounded-lg"
                      placeholder="详细业务说明 (展开后可见)..."
                    />
                  </div>
                  <button 
                    onClick={() => {
                        if(confirm('确认删除此业务类型？')) {
                            onUpdateCategories(categories.filter(c => c.id !== cat.id));
                        }
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl self-start"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onUpdateCategories([...categories, { id: Date.now().toString(), name: '新业务 New Service', priceRange: '¥?', description: '描述 Description', details: '详情 Details' }])}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} /> 添加业务 Add Service
            </button>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            <div className="bg-white/60 p-6 rounded-2xl border border-white shadow-sm">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Plus size={18}/> 添加新作品 Add Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input 
                  placeholder="标题 Title"
                  value={newPortfolioItem.title}
                  onChange={e => setNewPortfolioItem({...newPortfolioItem, title: e.target.value})}
                  className="p-3 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-slate-200"
                />
                <select 
                  value={newPortfolioItem.category}
                  onChange={e => setNewPortfolioItem({...newPortfolioItem, category: e.target.value})}
                  className="p-3 rounded-xl bg-white border border-slate-200 outline-none"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="mb-4 space-y-3">
                 <div className="flex gap-2 text-sm">
                     <span className="font-bold text-slate-500">媒体源 Media Source:</span>
                 </div>
                 
                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 hover:bg-slate-50 transition-colors relative group">
                     {isUploading ? (
                         <div className="flex items-center justify-center py-2 text-slate-500 gap-2"><Loader2 className="animate-spin"/> 处理中 Processing...</div>
                     ) : (
                         <div className="flex flex-col items-center justify-center py-2 cursor-pointer">
                             <input 
                               id="portfolio-file-upload"
                               type="file" 
                               accept="image/*,video/mp4" 
                               onChange={handlePortfolioFileUpload}
                               className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                             />
                             <UploadCloud className="text-slate-400 mb-2"/>
                             <span className="text-xs font-bold text-slate-500">点击上传文件 (Click to Upload)</span>
                             <span className="text-[10px] text-slate-400">支持 JPG/PNG/MP4 (视频限10MB)</span>
                         </div>
                     )}
                 </div>

                 <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">OR URL</span></div>
                 </div>

                 <input 
                  placeholder="输入图片/视频 URL (Enter URL)..."
                  value={newPortfolioItem.imageUrl}
                  onChange={e => setNewPortfolioItem({...newPortfolioItem, imageUrl: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-slate-200 text-sm font-mono"
                />
                <div className="bg-blue-50 p-2 rounded-lg flex gap-2 items-start">
                    <Info size={14} className="text-blue-500 mt-0.5 shrink-0"/>
                    <p className="text-xs text-blue-600 leading-tight">
                        <strong>推荐 (Recommended):</strong> 使用外部链接(URL)可以大幅缩短分享链接的长度。
                        <br/>上传本地文件会生成超长代码，在"快照分享"时可能会被系统自动剔除。
                    </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                 <div className="flex items-center gap-2 mr-auto">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input 
                            type="radio" 
                            name="mediaType" 
                            checked={newPortfolioItem.mediaType === 'image'} 
                            onChange={() => setNewPortfolioItem({...newPortfolioItem, mediaType: 'image'})}
                        /> 图片 Image
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input 
                            type="radio" 
                            name="mediaType" 
                            checked={newPortfolioItem.mediaType === 'video'} 
                            onChange={() => setNewPortfolioItem({...newPortfolioItem, mediaType: 'video'})}
                        /> 视频 Video
                    </label>
                 </div>
                 <button 
                  onClick={handleAddPortfolio}
                  disabled={!newPortfolioItem.imageUrl}
                  className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                  确认添加 Confirm
                 </button>
              </div>
            </div>

            <div className="space-y-2">
                <h4 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Current Items ({portfolio.length})</h4>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                    {portfolio.map(item => (
                        <div key={item.id} className="flex items-center gap-4 bg-white/40 p-2 rounded-xl border border-white/50">
                            <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                                {item.mediaType === 'video' ? (
                                    <video src={item.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <img src={item.imageUrl} className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-700 truncate">{item.title}</p>
                                <p className="text-xs text-slate-500">{categories.find(c => c.id === item.category)?.name}</p>
                            </div>
                            <button 
                                onClick={() => onDeletePortfolioItem(item.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-8 max-w-2xl">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Wallpaper / 背景图</label>
                <div className="flex gap-2 mb-2">
                     <div className="relative overflow-hidden group">
                        <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-700 transition-all flex items-center gap-2">
                            <UploadCloud size={16}/> 上传背景 Upload
                        </button>
                        <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                            onChange={handleBackgroundUpload}
                        />
                     </div>
                     <p className="text-xs text-blue-500 flex items-center font-medium self-center"><Info size={12} className="mr-1"/> 建议 1920x1080, 小于 2MB</p>
                </div>
                
                <div className="flex gap-2 mb-4 items-center">
                    <input 
                        value={bgUrlInput} 
                        onChange={(e) => setBgUrlInput(e.target.value)}
                        placeholder="或输入图片 URL (https://...)"
                        className="flex-1 bg-white/50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-800 focus:bg-white transition-colors"
                    />
                    <button 
                        onClick={() => onUpdateTheme({...theme, backgroundImage: bgUrlInput})}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                        <Check size={14}/> 应用 Apply
                    </button>
                </div>

                <div className="flex gap-4 mb-4">
                    <label className="text-xs font-bold text-slate-500 uppercase">尺寸 Mode:</label>
                    <div className="flex gap-2">
                        {(['cover', 'contain', 'auto'] as const).map(mode => (
                             <button 
                                key={mode}
                                onClick={() => onUpdateTheme({...theme, backgroundSize: mode})}
                                className={`px-2 py-0.5 rounded text-xs font-bold border ${theme.backgroundSize === mode ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-500 border-slate-200'}`}
                             >
                                 {mode.toUpperCase()}
                             </button>
                        ))}
                    </div>
                </div>
             </div>
             
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Font Style / 字体</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {[
                        { id: 'sans', name: '标准 Sans', family: 'Noto Sans SC' },
                        { id: 'serif', name: '衬线 Serif', family: 'Noto Serif SC' },
                        { id: 'artistic', name: '文艺 Artistic', family: 'ZCOOL XiaoWei' },
                        { id: 'handwriting', name: '手写 Script', family: 'Long Cang' },
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => onUpdateTheme({ ...theme, font: f.id as FontStyle, customFontUrl: '' })}
                            className={`p-2 rounded-xl border text-sm transition-all
                                ${theme.font === f.id && !theme.customFontUrl 
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                                    : 'bg-white/40 border-white/60 hover:bg-white text-slate-600'}`}
                            style={{ fontFamily: f.family }}
                        >
                            {f.name}
                        </button>
                    ))}
                </div>
                
                <div className="bg-white/40 p-3 rounded-xl border border-white/50">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">自定义字体 URL (Custom Font .woff2/.ttf)</label>
                    <BufferedInput 
                      value={theme.customFontUrl || ''}
                      onCommit={(val: string) => onUpdateTheme({ ...theme, customFontUrl: val })}
                      placeholder="https://example.com/font.woff2"
                      className="w-full bg-white/80 border-b border-slate-300 px-2 py-1 text-xs outline-none focus:border-slate-800"
                    />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    White Overlay / 遮罩浓度: {Math.round(theme.overlayOpacity * 100)}%
                </label>
                <input 
                  type="range" 
                  min="0" max="0.95" step="0.05"
                  value={theme.overlayOpacity}
                  onChange={(e) => onUpdateTheme({ ...theme, overlayOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-slate-800"
                />
             </div>
          </div>
        )}

        {activeTab === 'backup' && (
             <div className="space-y-8 max-w-2xl">
                 <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                     <Info className="text-amber-500 shrink-0" />
                     <p className="text-sm text-amber-800">
                         提示：本网站数据仅存储在您的浏览器中(Local Storage)。
                         为了防止更换设备或清除缓存导致数据丢失，请定期下载备份文件 (.json)。
                     </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button 
                         onClick={onExportData}
                         className="flex items-center justify-center gap-3 p-6 bg-white/60 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-lg transition-all group"
                     >
                         <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                             <Download size={24}/>
                         </div>
                         <div className="text-left">
                             <h4 className="font-bold text-slate-700">导出数据 Export</h4>
                             <p className="text-xs text-slate-500">下载 .json 备份文件</p>
                         </div>
                     </button>

                     <div className="relative flex items-center justify-center gap-3 p-6 bg-white/60 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-lg transition-all group cursor-pointer">
                         <input 
                             type="file" 
                             accept=".json" 
                             onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if(file) onImportData(file);
                             }}
                             className="absolute inset-0 opacity-0 cursor-pointer z-10"
                         />
                         <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                             <UploadCloud size={24}/>
                         </div>
                         <div className="text-left">
                             <h4 className="font-bold text-slate-700">导入备份 Import</h4>
                             <p className="text-xs text-slate-500">恢复 .json 数据文件</p>
                         </div>
                     </div>
                 </div>

                 <div className="pt-8 border-t border-slate-200">
                     <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Code size={18}/> 开发者选项 / Developer</h3>
                     <button 
                       onClick={handleGenerateDeployCode}
                       className="px-5 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors shadow-lg flex items-center gap-2"
                     >
                         <FileCode size={18}/> 生成部署配置代码 (Generate Config)
                     </button>
                     <p className="text-xs text-slate-400 mt-2">
                         将当前配置生成为代码，用于 Vercel 部署时的默认数据。
                     </p>
                 </div>
             </div>
        )}

        {activeTab === 'tools' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3 items-start">
                    <Wrench className="text-indigo-500 shrink-0 mt-1" size={20}/>
                    <div>
                        <h4 className="font-bold text-indigo-800 text-sm">实用工具箱 Utilities</h4>
                        <p className="text-xs text-indigo-600 mt-1">
                            此处提供一些辅助工具，帮助您更好地装修网页或处理文件。<br/>
                            Here are some tools to help you manage assets.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <FileCode size={20} className="text-primary-500"/> 
                        文件转链接工具 (File to Link Converter)
                    </h3>
                    <div className="bg-white/60 p-6 rounded-2xl border border-white/80 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
                                    <input 
                                        type="file" 
                                        onChange={handleToolFileConvert}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <Scissors className="mx-auto text-slate-400 mb-3 group-hover:scale-110 transition-transform" size={32}/>
                                    <span className="block font-bold text-slate-600">点击选择文件</span>
                                    <span className="text-xs text-slate-400">支持 JPG, PNG, GIF, MP4 (建议 &lt; 5MB)</span>
                                </label>
                                
                                {isConverting && (
                                    <div className="text-center text-sm font-bold text-slate-500 animate-pulse">
                                        正在转换中 Converting...
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase">输出结果 Output (Data URL)</span>
                                    <button 
                                      onClick={() => {
                                          if(!toolOutput) return;
                                          navigator.clipboard.writeText(toolOutput);
                                          alert("已复制到剪贴板 Copied!");
                                      }}
                                      disabled={!toolOutput}
                                      className="text-xs flex items-center gap-1 bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded disabled:opacity-50"
                                    >
                                        <Copy size={12}/> 复制 Copy
                                    </button>
                                </div>
                                <textarea 
                                    readOnly
                                    value={toolOutput}
                                    className="w-full h-32 p-3 text-[10px] font-mono bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none text-slate-500"
                                    placeholder="转换后的代码将显示在这里..."
                                />
                                <p className="text-[10px] text-slate-400">
                                    * 此代码可直接填入"上传图片URL"的输入框中。<br/>
                                    * This code works as a URL for images/videos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200/50">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                        <UploadCloud size={20} className="text-blue-500"/> 
                        推荐图床导航 (Free Image Hosting)
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 bg-yellow-50 p-2 rounded border border-yellow-100">
                        <Info size={12} className="inline mr-1 mb-0.5 text-yellow-600"/>
                        <strong>重要提示 (Important):</strong> 为了获得最短的“快照分享”链接，强烈建议将您的背景图、作品集图片上传到图床，并使用 https:// 开头的链接，而不是使用本地上传功能。
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: 'ImgTP', url: 'https://imgtp.com/', desc: '免费且稳定' },
                            { name: 'SM.MS', url: 'https://sm.ms/', desc: '老牌图床' },
                            { name: '路过图床', url: 'https://imgse.com/', desc: 'ImgSE' },
                            { name: 'HelloImg', url: 'https://www.helloimg.com/', desc: '界面简洁' },
                        ].map(host => (
                            <a 
                                key={host.name}
                                href={host.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-4 bg-white/60 hover:bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all group"
                            >
                                <ExternalLink className="mb-2 text-slate-400 group-hover:text-blue-500 transition-colors" size={20}/>
                                <span className="font-bold text-slate-700">{host.name}</span>
                                <span className="text-[10px] text-slate-400">{host.desc}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        )}

      </div>

      {showDeployCode && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
              <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col max-h-[80vh] shadow-2xl">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">部署配置代码 Deployment Config</h3>
                      <button onClick={() => setShowDeployCode(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  <div className="flex-1 p-0 overflow-hidden relative">
                       <textarea 
                          readOnly 
                          value={deployCode} 
                          className="w-full h-full p-4 bg-slate-800 text-green-400 font-mono text-xs resize-none outline-none"
                       />
                       <button 
                          onClick={() => { navigator.clipboard.writeText(deployCode); alert('已复制 Copied'); }}
                          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-bold backdrop-blur-md flex items-center gap-2"
                       >
                           <Copy size={14}/> 复制代码 Copy
                       </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
