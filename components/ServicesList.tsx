
import React, { useState } from 'react';
import { BusinessCategory, UserProfile } from '../types';
import { ChevronDown, ChevronUp, Sparkles, Check, ArrowRight, X, MessageCircle, Copy } from 'lucide-react';

interface ServicesListProps {
  categories: BusinessCategory[];
  user: UserProfile;
}

export const ServicesList = React.memo<ServicesListProps>(({ categories, user }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopyContact = () => {
    navigator.clipboard.writeText(user.contact);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
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

              <div 
                className={`bg-white/40 backdrop-blur-md border-t border-white/50 transition-all duration-500 ease-in-out
                  ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-8 text-sm text-slate-600 leading-relaxed font-mono whitespace-pre-wrap">
                  {cat.details || "暂无详细说明，请联系咨询。"}
                </div>
                <div className="px-8 pb-8">
                    <button 
                        onClick={() => setShowContactModal(true)}
                        className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        立即咨询 / 预约 <ArrowRight size={18} />
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-sm border border-white/60 p-6 relative animate-in zoom-in-95 duration-200">
            <button 
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X size={20}/>
            </button>

            <div className="flex flex-col items-center text-center mt-4">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-primary-200 to-blue-200 shadow-lg mb-4">
                    <img src={user.avatar} className="w-full h-full rounded-full object-cover border-4 border-white"/>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-1">{user.name}</h3>
                <p className="text-xs font-bold text-primary-500 bg-primary-50 px-3 py-1 rounded-full mb-6">欢迎咨询 / Welcome</p>

                <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">联系方式 Contact</p>
                    <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                <MessageCircle size={18}/>
                            </div>
                            <span className="text-sm font-bold text-slate-700 truncate">{user.contact}</span>
                        </div>
                        <button 
                            onClick={handleCopyContact}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary-600 transition-colors"
                            title="复制 Copy"
                        >
                            {copied ? <Check size={18} className="text-green-500"/> : <Copy size={18}/>}
                        </button>
                    </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed px-4">
                    * 请注明来意 (例如：咨询UI定制)<br/>
                    Please mention your purpose when adding.
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
