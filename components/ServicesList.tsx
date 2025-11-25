import React, { useState } from 'react';
import { BusinessCategory } from '../types';
import { ChevronDown, ChevronUp, Sparkles, Check, ArrowRight } from 'lucide-react';

interface ServicesListProps {
  categories: BusinessCategory[];
}

export const ServicesList: React.FC<ServicesListProps> = ({ categories }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Services</h2>
        <p className="text-slate-500 mt-2 font-light">橙光/易次元/AVG游戏美术定制</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const isExpanded = expandedId === cat.id;
          
          return (
            <div 
              key={cat.id} 
              className={`glass-card rounded-3xl transition-all duration-500 overflow-hidden
                ${isExpanded ? 'ring-2 ring-primary-200 shadow-xl' : 'hover:shadow-lg hover:-translate-y-1'}`}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner border border-white/50 ${isExpanded ? 'bg-primary-500 text-white' : 'bg-gradient-to-br from-white to-primary-50 text-primary-500'}`}>
                    <Sparkles size={26} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/60 shadow-sm">
                    {cat.priceRange}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
                  {cat.name}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium opacity-80">
                  {cat.description}
                </p>
                
                <div className="pt-6 border-t border-slate-100/50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" /> Available Now
                  </span>
                  <button 
                    onClick={() => toggleExpand(cat.id)}
                    className="flex items-center gap-1.5 text-slate-700 text-sm font-bold hover:text-primary-600 transition-colors bg-white/40 px-3 py-1.5 rounded-lg hover:bg-white/80"
                  >
                    {isExpanded ? '收起 Close' : '详情 Details'} 
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expanded Details Section */}
              <div 
                className={`bg-white/40 backdrop-blur-md border-t border-white/50 transition-all duration-500 ease-in-out
                  ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-8 text-sm text-slate-600 leading-relaxed font-mono whitespace-pre-wrap">
                  {cat.details || "暂无详细说明，请联系咨询。"}
                </div>
                <div className="px-8 pb-8">
                    <button className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        立即咨询 / 预约 <ArrowRight size={18} />
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};