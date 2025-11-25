import React, { useState, useMemo } from 'react';
import { PortfolioItem, BusinessCategory } from '../types';
import { Filter, PlayCircle } from 'lucide-react';

interface PortfolioGridProps {
  items: PortfolioItem[];
  categories: BusinessCategory[];
}

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({ items, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return items;
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Gallery</h2>
          <p className="text-slate-500 mt-2 font-light">精选作品展示 / Selected Works</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
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
      </div>

      <div className="masonry-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="group relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 bg-white/50 border border-white/60 backdrop-blur-sm"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
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
              
              {/* Modern Overlay */}
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
            </div>
            
            {/* Minimal Info Bar for mobile/always visible context if needed, currently hidden for clean look */}
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
};