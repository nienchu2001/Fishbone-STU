
import React, { useState, useMemo } from 'react';
import { PortfolioItem, BusinessCategory, ReadOnlyProps, PortfolioLayoutMode } from '../types';
import { Filter, PlayCircle, Trash2, LayoutGrid, Grid, List, Film } from 'lucide-react';

interface PortfolioGridProps extends ReadOnlyProps {
  items: PortfolioItem[];
  categories: BusinessCategory[];
  layoutMode?: PortfolioLayoutMode;
  onLayoutChange?: (mode: PortfolioLayoutMode) => void;
  onDelete?: (id: string) => void;
}

export const PortfolioGrid = React.memo<PortfolioGridProps>(({ 
  items, 
  categories, 
  layoutMode = 'masonry',
  onLayoutChange,
  isReadOnly, 
  onDelete 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return items;
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Gallery</h2>
          <p className="text-slate-500 mt-2 font-light">精选作品展示 / Selected Works</p>
        </div>
        
        {!isReadOnly && onLayoutChange && (
          <div className="flex bg-white/30 p-1 rounded-xl backdrop-blur-md border border-white/50">
            <button 
              onClick={() => onLayoutChange('masonry')}
              className={`p-2 rounded-lg transition-all ${layoutMode === 'masonry' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              title="瀑布流 Masonry"
            >
              <LayoutGrid size={18}/>
            </button>
            <button 
              onClick={() => onLayoutChange('grid')}
              className={`p-2 rounded-lg transition-all ${layoutMode === 'grid' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              title="方块网格 Grid"
            >
              <Grid size={18}/>
            </button>
            <button 
              onClick={() => onLayoutChange('list')}
              className={`p-2 rounded-lg transition-all ${layoutMode === 'list' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              title="列表 List"
            >
              <List size={18}/>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
              ${selectedCategory === 'all' 
                ? 'bg-slate-800 text-white shadow-lg shadow-slate-200 transform scale-105' 
                : 'bg-white/40 backdrop-blur-md text-slate-600 hover:bg-white/70 border border-white/50'}`}
          >
            全部 All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
                ${selectedCategory === cat.id 
                  ? 'bg-slate-800 text-white shadow-lg shadow-slate-200 transform scale-105' 
                  : 'bg-white/40 backdrop-blur-md text-slate-600 hover:bg-white/70 border border-white/50'}`}
            >
              {cat.name}
            </button>
          ))}
      </div>

      <div className={`
        ${layoutMode === 'masonry' ? 'masonry-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max' : ''}
        ${layoutMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : ''}
        ${layoutMode === 'list' ? 'flex flex-col gap-4' : ''}
      `}>
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className={`group relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 bg-white/50 border border-white/60 backdrop-blur-sm
              ${layoutMode === 'masonry' ? 'rounded-3xl hover:-translate-y-1' : ''}
              ${layoutMode === 'grid' ? 'rounded-2xl aspect-square hover:scale-[1.02]' : ''}
              ${layoutMode === 'list' ? 'rounded-2xl flex flex-row h-32 md:h-40 hover:-translate-x-1' : ''}
            `}
          >
            <div className={`relative overflow-hidden
               ${layoutMode === 'list' ? 'w-32 md:w-48 h-full shrink-0' : 'w-full h-full'}
               ${layoutMode === 'masonry' ? 'aspect-auto' : ''}
            `}>
              {item.mediaType === 'video' ? (
                <video 
                  src={item.imageUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  loading="lazy"
                />
              )}
              
              {layoutMode !== 'list' && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest mb-2 border border-white/10 shadow-sm">
                          {categories.find(c => c.id === item.category)?.name || item.category}
                        </span>
                        <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">{item.title}</h3>
                      </div>
                      {item.mediaType === 'video' && (
                        <div className="bg-white/30 p-2.5 rounded-full backdrop-blur-md text-white border border-white/20">
                          <PlayCircle size={24} fill="rgba(255,255,255,0.2)" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {layoutMode === 'list' && (
              <div className="flex-1 p-6 flex flex-col justify-center">
                 <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                          {categories.find(c => c.id === item.category)?.name || item.category}
                      </span>
                      <h3 className="text-slate-800 font-bold text-xl">{item.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">{item.date}</p>
                    </div>
                    {item.mediaType === 'video' && <Film className="text-slate-300"/>}
                 </div>
              </div>
            )}

            {!isReadOnly && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if(confirm('确认删除此作品吗？')) onDelete(item.id);
                }}
                className={`absolute bg-white/20 backdrop-blur-md rounded-full text-white/70 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-20
                  ${layoutMode === 'list' ? 'top-1/2 -translate-y-1/2 right-6 p-3' : 'top-4 right-4 p-2'}
                `}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="glass-card rounded-3xl p-20 text-center text-slate-400">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>暂无相关作品</p>
        </div>
      )}
    </div>
  );
});
