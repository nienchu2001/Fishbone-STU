import React, { useState } from 'react';
import { UserProfile, BusinessCategory, PortfolioItem, MediaType } from '../types';
import { Save, Plus, Trash2, Image, Film, Sparkles } from 'lucide-react';

interface SettingsPanelProps {
  user: UserProfile;
  categories: BusinessCategory[];
  portfolio: PortfolioItem[];
  onUpdateUser: (user: UserProfile) => void;
  onUpdateCategories: (categories: BusinessCategory[]) => void;
  onAddPortfolioItem: (item: PortfolioItem) => void;
  onDeletePortfolioItem: (id: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  user, 
  categories, 
  portfolio,
  onUpdateUser, 
  onUpdateCategories,
  onAddPortfolioItem,
  onDeletePortfolioItem
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'portfolio'>('profile');
  const [userData, setUserData] = useState(user);
  const [localCategories, setLocalCategories] = useState(categories);
  
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

  return (
    <div className="max-w-4xl animate-fade-in pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          Settings <Sparkles size={24} className="text-slate-300" />
        </h2>
        <p className="text-slate-500 mt-2 font-light">网站内容管理与个性化设置</p>
      </div>

      {/* Tabs */}
      <div className="glass-panel p-1.5 rounded-2xl flex gap-1 mb-8 inline-flex">
        {[
          { id: 'profile', label: '个人资料 Profile' },
          { id: 'services', label: '业务类型 Services' },
          { id: 'portfolio', label: '作品管理 Works' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">头像链接 (URL)</label>
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 shrink-0 border-4 border-white shadow-md">
                    <img src={userData.avatar} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <input 
                    value={userData.avatar}
                    onChange={e => setUserData({...userData, avatar: e.target.value})}
                    className="flex-1 p-4 rounded-xl border border-white/60 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary-100/50 outline-none transition-all text-sm backdrop-blur-sm"
                    placeholder="https://..."
                  />
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">联系邮箱</label>
                  <input 
                    value={userData.email}
                    onChange={e => setUserData({...userData, email: e.target.value})}
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
    </div>
  );
};