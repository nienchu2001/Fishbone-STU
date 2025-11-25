import React, { useState } from 'react';
import { CommissionSlot, CommissionStatus } from '../types';
import { Clock, CheckCircle2, FileSpreadsheet, Palette, Layers, Film, Download, Upload, X, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface ScheduleBoardProps {
  slots: CommissionSlot[];
  onImportSlots: (newSlots: CommissionSlot[]) => void;
  onAdvanceStatus: (id: string) => void;
}

const StatusBadge = ({ status }: { status: CommissionStatus }) => {
  const config = {
    waiting: { color: 'bg-slate-100/80 text-slate-600', icon: Clock, label: '排单中 Waiting' },
    typography: { color: 'bg-blue-100/80 text-blue-700', icon: Layers, label: '排版 Typos' },
    motion: { color: 'bg-pink-100/80 text-pink-700', icon: Film, label: '动效 Motion' },
    color_fx: { color: 'bg-purple-100/80 text-purple-700', icon: Palette, label: '特效 FX' },
    export: { color: 'bg-orange-100/80 text-orange-700', icon: Download, label: '导出 Export' },
    finished: { color: 'bg-emerald-100/80 text-emerald-700', icon: CheckCircle2, label: '完成 Done' },
  };

  const { color, icon: Icon, label } = config[status] || config.waiting;

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${color} backdrop-blur-sm shadow-sm`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

export const ScheduleBoard: React.FC<ScheduleBoardProps> = ({ slots, onImportSlots, onAdvanceStatus }) => {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const activeSlots = slots.filter(s => s.status !== 'finished');
  const isFull = activeSlots.length >= 5;

  const handleParseImport = () => {
    try {
      const rows = importText.trim().split('\n');
      const newSlots: CommissionSlot[] = rows.map((row, index) => {
        const cols = row.split(/[\t,]/).map(c => c.trim());
        if (cols.length < 2) return null;

        return {
          id: `imported-${Date.now()}-${index}`,
          clientName: cols[0] || 'Unknown',
          type: cols[1] || 'Commission',
          status: 'waiting',
          deadline: cols[2] || 'TBD',
          progress: 0
        };
      }).filter(Boolean) as CommissionSlot[];

      if (newSlots.length > 0) {
        onImportSlots(newSlots);
        setShowImport(false);
        setImportText('');
      }
    } catch (e) {
      alert('格式解析错误');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Schedule <Sparkles size={20} className="text-yellow-400 fill-yellow-400" />
          </h2>
          <p className="text-slate-500 mt-1 font-light">实时更新排单进度 / Current Status</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/50 hover:bg-white border border-white/60 text-slate-600 rounded-xl transition-all text-sm font-bold shadow-sm"
          >
            <FileSpreadsheet size={16} />
            导入表格
          </button>
          
          <div className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 backdrop-blur-md shadow-sm ${isFull ? 'bg-red-50/50 border-red-100 text-red-600' : 'bg-emerald-50/50 border-emerald-100 text-emerald-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isFull ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="font-bold text-sm tracking-wide">{isFull ? '暂无档期 FULL' : '接单中 OPEN'}</span>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 gap-5">
        {slots.map((slot) => (
          <div key={slot.id} className="glass-card p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center gap-6 transition-all duration-300 group hover:scale-[1.01]">
            <div className="flex items-center gap-4 min-w-[180px]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg shadow-inner border border-white">
                {slot.clientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">{slot.clientName}</h4>
                <span className="inline-block bg-slate-100/50 px-2 py-0.5 rounded text-xs text-slate-500 mt-1">{slot.type}</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
               <div className="flex justify-between items-center mb-1">
                 <StatusBadge status={slot.status} />
                 <span className="text-xs text-slate-400 font-mono font-medium">DEADLINE: {slot.deadline}</span>
               </div>
               
               <div className="relative h-3 w-full bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/50">
                 <div 
                   className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-300 to-primary-500 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                   style={{ width: `${slot.progress}%` }}
                 >
                   <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                 </div>
               </div>
               
               <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Progress</span>
                  <span className="font-bold">{slot.progress}%</span>
               </div>
            </div>
            
            <div className="flex items-center gap-3 lg:border-l lg:border-slate-200/50 lg:pl-6 pt-4 lg:pt-0 border-t border-slate-100 lg:border-t-0">
               {slot.status !== 'finished' && (
                 <button 
                  onClick={() => onAdvanceStatus(slot.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 hover:shadow-lg hover:shadow-slate-300/50 transition-all active:scale-95 ml-auto lg:ml-0"
                 >
                   下一阶段 <ArrowRight size={14} />
                 </button>
               )}
               {slot.status === 'finished' && (
                 <div className="px-4 py-2 text-emerald-500 font-bold text-sm flex items-center gap-2">
                   <CheckCircle2 size={18} /> 已交付
                 </div>
               )}
            </div>
          </div>
        ))}
        
        {slots.length === 0 && (
          <div className="glass-card rounded-3xl p-16 text-center text-slate-400 border-dashed border-2 border-slate-200/50">
             <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
             <p>暂无排单记录，请点击右上角导入</p>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-3xl p-8 border-l-4 border-l-indigo-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="text-indigo-900 font-bold mb-2 text-lg">⚠️ 预约须知 Notice</h3>
          <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
            1. 请提前准备好设定资料，排单按定金支付顺序为准。<br/>
            2. 动效修改：关键帧阶段可调整，后期仅支持微调特效。<br/>
            3. 不接急单，请预留充足制作时间。
          </p>
        </div>
        <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap">
          联系我 Contact
        </button>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-xl shadow-2xl p-8 animate-scale-in border border-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">批量导入档期</h3>
              <button onClick={() => setShowImport(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="mb-6 text-sm text-slate-600 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <p className="font-bold mb-2 text-blue-800">📋 使用说明</p>
              <p className="mb-1">请直接复制 Excel 或 腾讯文档 中的内容粘贴到下方。</p>
              <p>列格式：<span className="font-mono bg-white px-1 py-0.5 rounded border border-blue-100 text-blue-600">ID/昵称, 业务类型, 截止日期</span></p>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`User_001  UI定制  2023-12-31\nUser_002  徽章x2  2024-01-15`}
              className="w-full h-48 p-4 bg-white border border-slate-200 rounded-2xl text-sm font-mono focus:ring-4 focus:ring-primary-100 focus:border-primary-400 outline-none resize-none mb-6 shadow-inner"
            />

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowImport(false)}
                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleParseImport}
                className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Upload size={18} />
                识别并导入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};