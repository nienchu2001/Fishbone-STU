
import React, { useState, useRef } from 'react';
import { UserProfile, BusinessCategory, PortfolioItem, MediaType, ThemeSettings, FontStyle } from '../types';
import { Save, Plus, Trash2, Image, Film, Sparkles, UploadCloud, Download, FileJson, Palette, Type, LayoutTemplate, Monitor, Smartphone, Minimize } from 'lucide-react';

interface SettingsPanelProps {
  user: UserProfile;
  categories: BusinessCategory[];
  portfolio: PortfolioItem[];
  theme: ThemeSettings;
  onUpdateUser: (user: UserProfile) => void;
  onUpdateCategories: (categories: BusinessCategory[]) => void;
  onUpdateTheme: (theme: ThemeSettings) => void;
  onAddPortfolioItem: (item: PortfolioItem) => void;
  onDeletePortfolioItem: (id: string) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  user, 
  categories, 
  portfolio,
  theme,
  onUpdateUser, 
  onUpdateCategories,
  onUpdateTheme,
  onAddPortfolioItem,
  onDeletePortfolioItem,
  onExportData,
  onImportData
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'services' | 'portfolio' | 'data'>('profile');
  const [userData, setUserData] = useState(user);
  const [localCategories, setLocalCategories] = useState(categories);
  const [localTheme, setLocalTheme] = useState(theme);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  
  const [newItem, setNewItem] = useState<{title: string; category: string; url: string; type: MediaType}>({
    title: '',
    category: categories[0]?.id || '',
    url: '',
    type: 'image'
  });

  const handleSaveProfile = () => {
    onUpdateUser(userData);
    alert('个人资料已保存！');
  };

  const handleSaveCategories = () => {
    onUpdateCategories(localCategories);
    alert('业务设置已保存！');
  };

  const handleSaveTheme = () => {
    onUpdateTheme(localTheme);
    alert('外观设置已保存并同步生效！\nAppearance settings saved and applied.');
  };

  const handleAddCategory = () => {
    const newCat: BusinessCategory = {
      id: Date.now().toString(),
      name: '新业务',
      priceRange: '¥??',
      description: '简短描述',
      details: '详细描述\n- 规格:\n- 工期:'
    };
    setLocalCategories([...localCategories, newCat]);
  };

  const updateCategory = (id: string, field: keyof BusinessCategory, value: string) => {
    setLocalCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const submitNewItem = () => {
    if(!newItem.title || !newItem.url) return alert("请填写标题和链接");
    
    onAddPortfolioItem({
      id: Date.now().toString(),
      title: newItem.title,
      category: newItem.category,
      imageUrl: newItem.url,
      mediaType: newItem.type,
      date: new Date().toISOString().slice(0, 7).replace('-', '.')
    });
    
    setNewItem({ ...newItem, title: '', url: '' });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({...userData, avatar: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalTheme({...localTheme, backgroundImage: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl animate-fade-in pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          Settings <Sparkles size={24} className="text-slate-300" />
        </h2>
        <p className="text-slate-500 mt-2 font-light">网站内容管理与个性化设置</p>
      </div>

      {/* Tabs */}
      <div className="glass-panel p-1.5 rounded-2xl flex gap-1 mb-8 inline-flex flex-wrap">
        {[
          { id: 'profile', label: '个人资料 Profile' },
          { id: 'appearance', label: '外观 Appearance' },
          { id: 'services', label: '业务类型 Services' },
          { id: 'portfolio', label: '作品管理 Works' },
          { id: 'data', label: '数据备份 Data' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white shadow-sm text-slate-800' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="glass-card p-8 rounded-3xl">
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">头像 / Avatar</label>
                <div className="flex gap-6 items-center">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 shrink-0 border-4 border-white shadow-md relative group cursor-pointer"
                  >
                    <img src={userData.avatar} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <UploadCloud className="text-slate-700" size={24} />
                    </div>
                  </div>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-bold text-slate-700">点击头像上传新图片</p>
                    <p className="text-xs text-slate-400">支持 JPG, PNG, GIF</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">显示昵称</label>
                  <input 
                    value={userData.name}
                    onChange={e => setUserData({...userData, name: e.target.value})}
                    className="p-4 rounded-xl border border-white/60 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary-100/50 outline-none transition-all text-sm backdrop-blur-sm"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">联系方式 (微信/QQ/邮箱)</label>
                  <input 
                    value={userData.contact}
                    onChange={e => setUserData({...userData, contact: e.target.value})}
                    className="p-4 rounded-xl border border-white/60 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary-100/50 outline-none transition-all text-sm backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">个性签名 / 简介</label>
                <textarea 
                  value={userData.bio}
                  onChange={e => setUserData({...userData, bio: e.target.value})}
                  rows={3}
                  className="p-4 rounded-xl border border-white/60 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary-100/50 outline-none transition-all text-sm resize-none backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSaveProfile} className="flex items-center gap-2 px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 shadow-xl hover:-translate-y-0.5 transition-all">
              <Save size={18} /> 保存资料
            </button>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
           <div className="glass-card p-8 rounded-3xl">
              <div className="grid grid-cols-1 gap-8">
                  
                  {/* Background */}
                  <div>
                      <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                          <Palette size={18} /> 背景设置 / Background
                      </h3>
                      <div className="flex flex-col gap-6">
                          <input 
                             type="file" 
                             ref={bgInputRef}
                             onChange={handleBgUpload}
                             accept="image/*"
                             className="hidden"
                          />
                          <div className="flex flex-col md:flex-row gap-6 items-start">
                              <div className="flex flex-col gap-3 items-center">
                                {localTheme.backgroundImage ? (
                                    <div className="w-48 h-28 rounded-xl overflow-hidden border-2 border-slate-200 shadow-md relative group">
                                        <img src={localTheme.backgroundImage} className="w-full h-full object-cover"/>
                                        <button 
                                          onClick={() => setLocalTheme({...localTheme, backgroundImage: ''})}
                                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Trash2 size={12}/>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-48 h-28 rounded-xl bg-gradient-to-r from-pink-100 to-blue-100 border-2 border-slate-200 border-dashed shadow-inner flex items-center justify-center text-xs text-slate-400 font-bold">
                                        默认背景 Default
                                    </div>
                                )}
                                <button onClick={() => bgInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                                  <UploadCloud size={14}/> 上传新图片
                                </button>
                              </div>

                              <div className="flex-1 w-full space-y-4">
                                  {/* Background Size Control */}
                                  <div className="bg-white/50 p-4 rounded-xl border border-white/60">
                                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">图片填充方式 (Size)</label>
                                      <div className="flex gap-2">
                                          {[
                                              { val: 'cover', label: '铺满 Cover', icon: Monitor },
                                              { val: 'contain', label: '适应 Contain', icon: Smartphone },
                                              { val: 'auto', label: '原始 Auto', icon: Minimize },
                                          ].map(opt => (
                                              <button
                                                  key={opt.val}
                                                  onClick={() => setLocalTheme({...localTheme, backgroundSize: opt.val as any})}
                                                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${localTheme.backgroundSize === opt.val ? 'bg-slate-800 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
                                              >
                                                  <opt.icon size={12} /> {opt.label}
                                              </button>
                                          ))}
                                      </div>
                                  </div>

                                  {/* Overlay Opacity */}
                                  <div className="bg-white/50 p-4 rounded-xl border border-white/60">
                                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">背景白膜浓度 (Overlay Opacity)</label>
                                      <div className="flex items-center gap-4">
                                          <input 
                                            type="range" 
                                            min="0" 
                                            max="1" 
                                            step="0.05" 
                                            value={localTheme.overlayOpacity}
                                            onChange={(e) => setLocalTheme({...localTheme, overlayOpacity: parseFloat(e.target.value)})}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                          />
                                          <span className="text-sm font-bold w-12 text-right">{(localTheme.overlayOpacity * 100).toFixed(0)}%</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <hr className="border-slate-200/50" />

                  {/* Fonts */}
                  <div>
                      <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                          <Type size={18} /> 字体设置 / Typography
                      </h3>
                      
                      <div className="bg-white/50 p-6 rounded-2xl border border-white/60 space-y-4">
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">自定义字体文件链接 (Custom Font URL)</label>
                              <div className="flex gap-2">
                                  <input 
                                    value={localTheme.customFontUrl || ''}
                                    onChange={(e) => setLocalTheme({...localTheme, customFontUrl: e.target.value})}
                                    placeholder="https://example.com/font.woff2"
                                    className="flex-1 p-3 rounded-xl border border-white/60 bg-white/50 text-sm focus:bg-white focus:ring-4 focus:ring-primary-100/50 outline-none transition-all font-mono text-slate-600"
                                  />
                              </div>
                              <p className="text-[10px] text-slate-400 mt-2">
                                  * 请输入字体文件 (WOFF2/TTF) 的直链 URL。保存后系统会自动加载并应用该字体。<br/>
                                  * Enter a direct URL to a font file. It will be applied automatically after saving.
                              </p>
                          </div>
                          
                          {!localTheme.customFontUrl && (
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">或选择预设字体 (Or Select Preset)</label>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      {[
                                          { id: 'sans', name: '标准黑体' },
                                          { id: 'serif', name: '优雅宋体' },
                                          { id: 'artistic', name: '古风楷体' },
                                          { id: 'handwriting', name: '手写草书' }
                                      ].map((f) => (
                                          <button
                                              key={f.id}
                                              onClick={() => setLocalTheme({...localTheme, font: f.id as FontStyle})}
                                              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${localTheme.font === f.id ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                          >
                                              {f.name}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>

              </div>
           </div>

           <div className="flex justify-end sticky bottom-6 pt-4">
             <button onClick={handleSaveTheme} className="flex items-center gap-2 px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 shadow-xl hover:-translate-y-0.5 transition-all">
                <Save size={18} /> 保存并同步设置 (Save & Sync)
             </button>
           </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 gap-6">
            {localCategories.map((cat, idx) => (
              <div key={cat.id} className="glass-card p-6 rounded-3xl relative group transition-all hover:bg-white/60">
                <button 
                  onClick={() => setLocalCategories(prev => prev.filter(c => c.id !== cat.id))}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
                
                <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest ml-1">Service #{idx + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block ml-1">业务名称</label>
                    <input 
                      value={cat.name}
                      onChange={e => updateCategory(cat.id, 'name', e.target.value)}
                      className="w-full p-3 rounded-xl border border-white/60 bg-white/50 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary-100/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block ml-1">价格范围</label>
                    <input 
                      value={cat.priceRange}
                      onChange={e => updateCategory(cat.id, 'priceRange', e.target.value)}
                      className="w-full p-3 rounded-xl border border-white/60 bg-white/50 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary-100/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-500 mb-2 block ml-1">卡片简述 (首页显示)</label>
                  <input 
                    value={cat.description}
                    onChange={e => updateCategory(cat.id, 'description', e.target.value)}
                    className="w-full p-3 rounded-xl border border-white/60 bg-white/50 text-sm focus:bg-white focus:ring-4 focus:ring-primary-100/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block ml-1">详情页内容 (支持 Markdown 风格换行)</label>
                  <textarea 
                    value={cat.details || ''}
                    onChange={e => updateCategory(cat.id, 'details', e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl border border-white/60 bg-white/50 text-sm focus:bg-white focus:ring-4 focus:ring-primary-100/50 outline-none resize-none font-mono transition-all"
                    placeholder="在此输入详细的业务介绍、工期说明等..."
                  />
                </div>
              </div>
            ))}
            
            <button 
              onClick={handleAddCategory}
              className="w-full py-6 border-2 border-dashed border-slate-300/50 rounded-3xl text-slate-400 font-bold hover:border-primary-300 hover:text-primary-500 hover:bg-white/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} /> 添加新业务类型
            </button>
          </div>
          
          <div className="flex justify-end sticky bottom-6 pt-4">
            <button onClick={handleSaveCategories} className="flex items-center gap-2 px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 shadow-xl transition-all hover:-translate-y-0.5">
              <Save size={18} /> 保存业务设置
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
              <span className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-500"><Plus size={18} strokeWidth={3}/></span> 
              添加新作品
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                placeholder="作品标题 Title"
                value={newItem.title}
                onChange={e => setNewItem({...newItem, title: e.target.value})}
                className="p-4 rounded-xl border border-white/60 bg-white/50 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-primary-100/50 transition-all"
              />
              <select 
                value={newItem.category}
                onChange={e => setNewItem({...newItem, category: e.target.value})}
                className="p-4 rounded-xl border border-white/60 bg-white/50 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-primary-100/50 transition-all"
              >
                {localCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
               <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-xl border border-white/60 shrink-0">
                  <button 
                    onClick={() => setNewItem({...newItem, type: 'image'})}
                    className={`px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-all font-bold ${newItem.type === 'image' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:bg-white/30'}`}
                  >
                    <Image size={16} /> 图片
                  </button>
                  <button 
                    onClick={() => setNewItem({...newItem, type: 'video'})}
                    className={`px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-all font-bold ${newItem.type === 'video' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:bg-white/30'}`}
                  >
                    <Film size={16} /> 视频(MP4)
                  </button>
               </div>
               <input 
                  placeholder={newItem.type === 'image' ? "图片 URL (JPG, PNG, GIF)" : "视频 URL (MP4)"}
                  value={newItem.url}
                  onChange={e => setNewItem({...newItem, url: e.target.value})}
                  className="flex-1 p-4 rounded-xl border border-white/60 bg-white/50 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-primary-100/50 transition-all"
                />
            </div>
            
            <button 
              onClick={submitNewItem}
              className="w-full py-3.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              确认发布作品
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portfolio.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 glass-card rounded-2xl hover:bg-white/60 transition-colors">
                 <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-white/50 shadow-sm">
                    {item.mediaType === 'video' ? (
                       <video src={item.imageUrl} className="w-full h-full object-cover opacity-80" />
                    ) : (
                       <img src={item.imageUrl} className="w-full h-full object-cover" />
                    )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate mb-1">{item.title}</h4>
                    <div className="flex gap-2">
                       <span className="text-[10px] text-slate-500 bg-white/50 px-2 py-0.5 rounded border border-white/50 uppercase">{item.mediaType}</span>
                       <span className="text-[10px] text-slate-400 px-2 py-0.5">{item.date}</span>
                    </div>
                 </div>
                 <button 
                   onClick={() => onDeletePortfolioItem(item.id)}
                   className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                 >
                   <Trash2 size={18} />
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Management Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="glass-card p-8 rounded-3xl border-l-4 border-l-blue-400">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Download size={24} className="text-blue-500"/>
              数据备份与恢复 / Data Backup
            </h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              您的网站数据（个人资料、作品、排单）目前保存在此浏览器的本地缓存中。
              <br/>
              为了防止数据丢失或迁移到新设备，请定期<b>导出数据备份</b>。
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onExportData}
                className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <FileJson size={20} />
                导出数据 (JSON)
              </button>
              
              <div className="flex-1">
                <input 
                  type="file" 
                  ref={importInputRef}
                  onChange={(e) => e.target.files?.[0] && onImportData(e.target.files[0])}
                  className="hidden" 
                  accept=".json"
                />
                <button 
                   onClick={() => importInputRef.current?.click()}
                   className="w-full py-4 bg-white/50 border border-slate-300 text-slate-700 rounded-2xl font-bold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <UploadCloud size={20} />
                  导入备份 (Restore)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
