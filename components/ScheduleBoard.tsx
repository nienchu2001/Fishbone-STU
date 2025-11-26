
import React, { useState, useRef, useEffect } from 'react';
import { CommissionSlot, CommissionStatus, ReadOnlyProps, ImportTemplate } from '../types';
import { 
  Clock, CheckCircle2, FileSpreadsheet, Palette, Layers, Film, Download, 
  Upload, X, ArrowRight, Sparkles, Trash2,
  Calendar as CalendarIcon, List as ListIcon, ChevronLeft, ChevronRight, CalendarDays, Edit3, ClipboardList, Copy, Plus, Save,
  Image as ImageIcon, ExternalLink, TrendingUp, PieChart, Activity, Hourglass
} from 'lucide-react';

// Declaration for XLSX attached to window via CDN
declare global {
  interface Window {
    XLSX: any;
  }
}

interface ScheduleBoardProps extends ReadOnlyProps {
  slots: CommissionSlot[];
  templates?: ImportTemplate[]; 
  onImportSlots: (newSlots: CommissionSlot[]) => void;
  onAdvanceStatus: (id: string) => void;
  onUpdateSlot?: (id: string, updates: Partial<CommissionSlot>) => void;
  onDeleteSlot?: (id: string) => void;
  onUpdateTemplates?: (templates: ImportTemplate[]) => void;
  isReadOnly?: boolean;
}

const getStatusColor = (status: CommissionStatus) => {
    switch(status) {
        case 'waiting': return 'bg-slate-300';
        case 'typography': return 'bg-blue-400';
        case 'motion': return 'bg-pink-400';
        case 'color_fx': return 'bg-purple-400';
        case 'export': return 'bg-orange-400';
        case 'finished': return 'bg-emerald-400';
        default: return 'bg-slate-300';
    }
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
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${color} backdrop-blur-sm shadow-sm border border-white/20`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

// Helper to extract images and links from text
const parseAttachments = (text: string = '') => {
  const urlRegex = /(https?:\/\/[^\s\n]+)|(data:image\/[a-zA-Z]*;base64,[^\s"']+)/g;
  const matches = text.match(urlRegex) || [];
  
  const images: string[] = [];
  const links: string[] = [];

  matches.forEach(url => {
    // Basic image extension check or base64 data uri
    if (url.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)($|\?)/i) || url.startsWith('data:image')) {
      images.push(url);
    } else {
      links.push(url);
    }
  });

  return { images, links };
};

export const ScheduleBoard: React.FC<ScheduleBoardProps> = ({ 
  slots, 
  templates = [],
  onImportSlots, 
  onAdvanceStatus, 
  onUpdateSlot, 
  onDeleteSlot, 
  onUpdateTemplates,
  isReadOnly 
}) => {
  // Force calendar view if read-only, otherwise default to list
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>(isReadOnly ? 'calendar' : 'list');
  const [showImport, setShowImport] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pasteContent, setPasteContent] = useState('');
  
  // Template Management State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: '', content: '' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const slotImageInputRef = useRef<HTMLInputElement>(null);
  
  // Stats Calculation
  const totalSlots = slots.length;
  const finishedSlots = slots.filter(s => s.status === 'finished').length;
  const pendingSlots = totalSlots - finishedSlots;
  const completionRate = totalSlots > 0 ? Math.round((finishedSlots / totalSlots) * 100) : 0;
  
  // Effect to enforce calendar view when switching to read-only mode
  useEffect(() => {
    if (isReadOnly) {
      setViewMode('calendar');
    }
  }, [isReadOnly]);

  // Select first template by default if available
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  // Pagination Logic
  const totalPages = Math.ceil(slots.length / ITEMS_PER_PAGE);
  const paginatedSlots = slots.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1));

  // Reset pagination if out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [slots.length, totalPages, currentPage]);


  // --- Template Handlers ---
  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("格式模板已复制到剪贴板！Template copied.");
  };

  const handleApplyTemplate = (content: string) => {
    setPasteContent(content);
  };

  const startEditTemplate = (template?: ImportTemplate) => {
    if (template) {
      setTemplateForm({ name: template.name, content: template.content });
    } else {
      setTemplateForm({ name: '新模板 New Template', content: '昵称：\n业务：\n日期：\n备注：' });
    }
    setIsEditingTemplate(true);
  };

  const saveTemplate = () => {
    if (!onUpdateTemplates) return;
    
    if (templates.some(t => t.id === selectedTemplateId && isEditingTemplate && t.name === templateForm.name)) {
        const updated = templates.map(t => t.id === selectedTemplateId ? { ...t, ...templateForm } : t);
        onUpdateTemplates(updated);
    } else {
        const existingIndex = templates.findIndex(t => t.id === selectedTemplateId);
        if (isEditingTemplate && existingIndex >= 0) {
             const updated = templates.map(t => t.id === selectedTemplateId ? { ...t, ...templateForm } : t);
             onUpdateTemplates(updated);
        } else {
            const newTpl = { id: Date.now().toString(), ...templateForm };
            onUpdateTemplates([...templates, newTpl]);
            setSelectedTemplateId(newTpl.id);
        }
    }
    setIsEditingTemplate(false);
  };

  const deleteTemplate = (id: string) => {
    if (!onUpdateTemplates || !confirm("确认删除此模板？")) return;
    const updated = templates.filter(t => t.id !== id);
    onUpdateTemplates(updated);
    if (updated.length > 0) setSelectedTemplateId(updated[0].id);
    else setSelectedTemplateId('');
  };


  // --- Import Logic ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (window.XLSX) {
          const workbook = window.XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // Use header:1 to get raw 2D array
          const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, 
            defval: '',
            raw: false, // Try to format dates as strings if possible
          });
          
          processExcelRows(jsonData);
        } else {
          alert('Excel 解析组件未加载，请检查网络或刷新页面。\nLibrary not loaded.');
        }
      } catch (err) {
        console.error(err);
        alert('文件读取失败，请检查格式。\nFailed to read file.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const handleTextImport = () => {
    if (!pasteContent.trim()) {
      alert("请先粘贴内容或选择文件！\nPlease paste content first.");
      return;
    }
    processBlockText(pasteContent.trim());
  };

  const processExcelRows = (rows: any[][]) => {
    if (!rows || rows.length === 0) return;

    // 1. Identify Header Row
    // Scan first 5 rows for standard keywords
    let headerRowIndex = -1;
    
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const rowStr = rows[i].map(c => String(c).toLowerCase()).join(' ');
        if (rowStr.includes('昵称') || rowStr.includes('name') || rowStr.includes('单主') || rowStr.includes('id') || rowStr.includes('业务') || rowStr.includes('约稿')) {
            headerRowIndex = i;
            break;
        }
    }

    const newSlots: CommissionSlot[] = [];
    const startIndex = headerRowIndex + 1; // Start processing AFTER the header row

    // 2. Identify Column Indices
    let nameIdx = -1, typeIdx = -1, dateIdx = -1;
    let standardIndices: number[] = []; // Indices of columns we found as standard (Name/Type/Date)
    let headers: string[] = [];

    if (headerRowIndex !== -1) {
        headers = rows[headerRowIndex].map(h => String(h).trim());
        
        headers.forEach((h, idx) => {
            const lowerH = h.toLowerCase();
            if (lowerH.includes('昵称') || lowerH.includes('name') || lowerH.includes('单主') || lowerH.includes('id') || lowerH.includes('客户')) {
                nameIdx = idx;
                standardIndices.push(idx);
            } else if (lowerH.includes('业务') || lowerH.includes('类型') || lowerH.includes('type') || lowerH.includes('项目') || lowerH.includes('稿件')) {
                typeIdx = idx;
                standardIndices.push(idx);
            } else if (lowerH.includes('日期') || lowerH.includes('时间') || lowerH.includes('date') || lowerH.includes('ddl') || lowerH.includes('截止')) {
                dateIdx = idx;
                standardIndices.push(idx);
            } else if (lowerH.includes('状态') || lowerH.includes('status') || lowerH.includes('进度') || lowerH.includes('progress')) {
                 // We don't import status directly usually, but mark it as standard so it doesn't clutter details
                 standardIndices.push(idx);
            }
        });
    } else {
        // Fallback if no header found: Assume Col A=Name, Col B=Type, Col C=Date
        nameIdx = 0; standardIndices.push(0);
        typeIdx = 1; standardIndices.push(1);
        dateIdx = 2; standardIndices.push(2);
    }

    // 3. Process Rows
    for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        let name = (nameIdx !== -1 && row[nameIdx]) ? String(row[nameIdx]).trim() : '';
        let type = (typeIdx !== -1 && row[typeIdx]) ? String(row[typeIdx]).trim() : '默认业务';
        let date = (dateIdx !== -1 && row[dateIdx]) ? String(row[dateIdx]).trim() : '';
        
        // Orphan row check: if name is empty
        if (!name) {
             const hasData = row.some(c => String(c).trim().length > 0);
             if (hasData) {
                 name = "未命名单主";
             } else {
                 continue; 
             }
        }

        // Handle Excel Date Numbers (e.g., 45321)
        if (!isNaN(Number(date)) && Number(date) > 40000) {
            const dateObj = new Date(Math.round((Number(date) - 25569) * 86400 * 1000));
            date = dateObj.toISOString().split('T')[0];
        }

        // Clean up date string if it has text around it
        const dateMatch = date.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
        if (dateMatch) {
            date = `${dateMatch[1]}-${dateMatch[2].padStart(2,'0')}-${dateMatch[3].padStart(2,'0')}`;
        }

        // 4. Aggregate Details (Requirements)
        // Collect ALL columns that are NOT standard columns into the Requirements field
        let detailsArr: string[] = [];
        row.forEach((cell, idx) => {
            if (!standardIndices.includes(idx)) {
                const val = String(cell).trim();
                if (val) {
                    // Use header name if available, otherwise "Column X"
                    const label = (headers[idx] && headers[idx] !== 'undefined') ? headers[idx] : `列${idx+1}`;
                    // Special Handling for potential image URLs in text cells
                    detailsArr.push(`【${label}】: ${val}`);
                }
            }
        });

        newSlots.push({
            id: `import_${Date.now()}_${i}`,
            clientName: name,
            type: type,
            status: 'waiting',
            deadline: date || 'TBD',
            progress: 0,
            requirements: detailsArr.join('\n')
        });
    }

    if (newSlots.length > 0) {
        onImportSlots(newSlots);
        setShowImport(false);
        setPasteContent('');
        alert(`成功导入 ${newSlots.length} 个排单！\nSuccessfully imported ${newSlots.length} orders.`);
    } else {
        alert('未能识别有效数据，请检查表格格式。\nNo valid data found.');
    }
  };


  /**
   * Smart Text Block Processor
   * Supports: Key-Value Blocks AND Paragraph lists
   */
  const processBlockText = (text: string) => {
    const newSlots: CommissionSlot[] = [];
    
    // Normalize text
    const cleanText = text.replace(/\r\n/g, '\n');

    // Strategy 1: Detect Blocks by keywords (Name:, Type:, etc)
    const blockRegex = /(?:昵称|单主|Name|ID|约稿人|客户)[：:]\s*(.*?)(?=\n(?:昵称|单主|Name|ID|约稿人|客户)[：:]|$)/gis;
    let match;
    let strategy1Count = 0;

    while ((match = blockRegex.exec(cleanText)) !== null) {
      const block = match[0];
      
      const nameMatch = block.match(/(?:昵称|单主|Name|ID|约稿人|客户)[：:]\s*(.*?)(?=\n|$)/i);
      const typeMatch = block.match(/(?:业务|类型|Type|项目|稿件)[：:]\s*(.*?)(?=\n|$)/i);
      const dateMatch = block.match(/(?:日期|时间|Date|DDL|截止)[：:]\s*(.*?)(?=\n|$)/i);
      const noteMatch = block.match(/(?:备注|要求|Note|Desc|详情|设定)[：:]\s*([\s\S]*?)(?=$)/i);

      if (nameMatch) {
        newSlots.push({
          id: `import_text_${Date.now()}_${strategy1Count}`,
          clientName: nameMatch[1].trim(),
          type: typeMatch ? typeMatch[1].trim() : '默认业务',
          status: 'waiting',
          deadline: dateMatch ? dateMatch[1].trim() : 'TBD',
          progress: 0,
          requirements: noteMatch ? noteMatch[1].trim() : ''
        });
        strategy1Count++;
      }
    }

    // Strategy 2: Fallback (Paragraph Mode) - If Strategy 1 found nothing
    // Splits by double newline. First line = Name, Second line = Type (optional), Rest = Note
    if (strategy1Count === 0) {
       const blocks = cleanText.split(/\n\s*\n/).filter(b => b.trim());
       blocks.forEach((block, idx) => {
           const lines = block.split('\n').map(l => l.trim()).filter(l => l);
           if (lines.length > 0) {
               newSlots.push({
                   id: `import_para_${Date.now()}_${idx}`,
                   clientName: lines[0], // First line is Name
                   type: lines.length > 1 ? lines[1] : '默认业务', // Second line Type
                   status: 'waiting',
                   deadline: 'TBD',
                   progress: 0,
                   requirements: lines.slice(2).join('\n') // Rest is Note
               });
           }
       });
    }

    if (newSlots.length > 0) {
      onImportSlots(newSlots);
      setShowImport(false);
      setPasteContent('');
      // Non-blocking success toast could go here, using alert for now
      setTimeout(() => alert(`成功识别并导入 ${newSlots.length} 个排单！`), 100);
    } else {
      alert("无法识别内容，请尝试使用标准格式：\n昵称：XXX\n业务：XXX\n日期：XXX");
    }
  };


  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Get slots for this month
    const monthSlots = slots.filter(s => {
      const d = new Date(s.deadline);
      return !isNaN(d.getTime()) && 
             d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear();
    });

    return (
      <div className="animate-fade-in glass-card p-6 md:p-8 rounded-3xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 font-serif">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Monthly Planner</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white rounded-full text-slate-500 shadow-sm transition-all"><ChevronLeft/></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-xs font-bold bg-slate-800 text-white rounded-full shadow-lg hover:-translate-y-0.5 transition-all">Today</button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white rounded-full text-slate-500 shadow-sm transition-all"><ChevronRight/></button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-4 mb-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
        </div>
        
        <div className="grid grid-cols-7 gap-2 md:gap-4 auto-rows-fr">
          {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} className="min-h-[100px] bg-transparent"/>)}
          {days.map(day => {
             const daySlots = monthSlots.filter(s => new Date(s.deadline).getDate() === day);
             const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth();
             
             return (
               <div key={day} className={`min-h-[100px] rounded-2xl p-3 flex flex-col gap-2 transition-all relative group
                  ${isToday ? 'bg-white/80 ring-2 ring-primary-300 shadow-lg' : 'bg-white/30 hover:bg-white/60 border border-white/40'}`}>
                 <span className={`text-sm font-bold flex items-center justify-center w-8 h-8 rounded-full 
                    ${isToday ? 'bg-primary-500 text-white' : 'text-slate-600 group-hover:bg-white/80'}`}>
                    {day}
                 </span>
                 
                 <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar max-h-[120px]">
                   {daySlots.map(s => (
                     <div key={s.id} 
                        className="text-[10px] bg-white/90 px-2 py-1.5 rounded-lg border border-slate-100 shadow-sm hover:scale-105 transition-transform cursor-default flex items-center gap-1.5" 
                        title={`${s.clientName} - ${s.type}`}
                     >
                       <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusColor(s.status)}`}></div>
                       <span className="truncate font-medium text-slate-700">{s.clientName}</span>
                     </div>
                   ))}
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    );
  };

  const handleAddImageToSlot = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateSlot) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const slot = slots.find(s => s.id === slotId);
        if (slot) {
           // Append image markdown or url to requirements
           const currentReq = slot.requirements || '';
           const newReq = currentReq + `\n\n【附件图片 Attachment】: ${base64}`;
           onUpdateSlot(slotId, { requirements: newReq });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Schedule</h2>
          <p className="text-slate-500 mt-2 font-light">当前排单进度与档期 / Project Timeline</p>
        </div>
        
        <div className="flex gap-3">
          {/* Only show view toggles if NOT read-only */}
          {!isReadOnly && (
            <div className="bg-white/40 p-1 rounded-xl flex border border-white/50 backdrop-blur-md">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ListIcon size={20} />
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <CalendarDays size={20} />
              </button>
            </div>
          )}

          {!isReadOnly && (
            <button 
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <Upload size={18} />
              导入排单 Import
            </button>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
         {/* Total */}
         <div className="glass-card p-5 rounded-2xl flex items-center justify-between bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-white/60 hover:-translate-y-1 transition-transform duration-300">
             <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">总单量 Total</p>
                <h4 className="text-2xl md:text-3xl font-bold text-slate-700">{totalSlots}</h4>
             </div>
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/60 flex items-center justify-center text-indigo-400 shadow-sm">
                 <Layers size={20} />
             </div>
         </div>
         
         {/* Pending */}
         <div className="glass-card p-5 rounded-2xl flex items-center justify-between bg-gradient-to-br from-orange-50/50 to-amber-50/50 border border-white/60 hover:-translate-y-1 transition-transform duration-300">
             <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">待还 Pending</p>
                <h4 className="text-2xl md:text-3xl font-bold text-slate-700">{pendingSlots}</h4>
             </div>
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/60 flex items-center justify-center text-orange-400 shadow-sm">
                 <Hourglass size={20} />
             </div>
         </div>

         {/* Finished */}
         <div className="glass-card p-5 rounded-2xl flex items-center justify-between bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-white/60 hover:-translate-y-1 transition-transform duration-300">
             <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">已完成 Done</p>
                <h4 className="text-2xl md:text-3xl font-bold text-slate-700">{finishedSlots}</h4>
             </div>
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/60 flex items-center justify-center text-emerald-400 shadow-sm">
                 <CheckCircle2 size={20} />
             </div>
         </div>

         {/* Rate */}
         <div className="glass-card p-5 rounded-2xl flex items-center justify-between bg-gradient-to-br from-blue-50/50 to-cyan-50/50 border border-white/60 hover:-translate-y-1 transition-transform duration-300">
             <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">完成率 Rate</p>
                <h4 className="text-2xl md:text-3xl font-bold text-slate-700">{completionRate}%</h4>
             </div>
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/60 flex items-center justify-center text-blue-400 shadow-sm">
                 <Activity size={20} />
             </div>
         </div>
      </div>

      {viewMode === 'calendar' ? renderCalendar() : (
        <>
        <div className="space-y-4">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-3">Client / Project</div>
            <div className="col-span-2">Deadline</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {paginatedSlots.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400 rounded-3xl bg-white/30 backdrop-blur-xl border border-white/50">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>当前暂无排单 / No Active Commissions</p>
            </div>
          ) : (
            paginatedSlots.map((slot) => {
              const { images, links } = parseAttachments(slot.requirements);

              return (
              <div 
                key={slot.id}
                className="glass-card rounded-2xl p-6 md:p-4 hover:bg-white/60 transition-all duration-300 group border-l-4 border-l-transparent hover:border-l-primary-400 bg-white/40 backdrop-blur-xl border border-white/50"
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                  {/* Client Info */}
                  <div className="w-full md:col-span-3 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg shrink-0 border-2 border-white
                      ${slot.status === 'finished' ? 'bg-gradient-to-br from-emerald-400 to-emerald-500' : 'bg-gradient-to-br from-slate-700 to-slate-800'}`}>
                      {slot.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      {!isReadOnly && onUpdateSlot ? (
                        <input 
                          value={slot.clientName}
                          onChange={(e) => onUpdateSlot(slot.id, { clientName: e.target.value })}
                          className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-300 focus:outline-none w-full truncate transition-colors mb-1"
                          placeholder="客户/项目名称"
                        />
                      ) : (
                        <h4 className="font-bold text-slate-800 truncate" title={slot.clientName}>{slot.clientName}</h4>
                      )}
                      
                      {!isReadOnly && onUpdateSlot ? (
                        <input 
                          value={slot.type}
                          onChange={(e) => onUpdateSlot(slot.id, { type: e.target.value })}
                          className="text-xs text-slate-500 font-medium bg-white/50 hover:bg-white px-2 py-0.5 rounded inline-block border border-transparent hover:border-slate-300 focus:border-primary-300 focus:outline-none transition-colors w-full max-w-[150px]"
                          placeholder="业务类型"
                        />
                      ) : (
                        <p className="text-xs text-slate-500 font-medium bg-white/50 px-2 py-0.5 rounded inline-block mt-1">
                          {slot.type}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Deadline - Editable */}
                  <div className="w-full md:col-span-2 flex md:block items-center justify-between">
                     <span className="md:hidden text-xs font-bold text-slate-400">DDL:</span>
                     {!isReadOnly && onUpdateSlot ? (
                       <input 
                         type="date"
                         value={slot.deadline === 'TBD' ? '' : slot.deadline}
                         onChange={(e) => onUpdateSlot(slot.id, { deadline: e.target.value })}
                         className="bg-transparent text-sm font-bold text-slate-600 hover:bg-white/50 px-2 py-1 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-200"
                       />
                     ) : (
                       <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                         <CalendarIcon size={14} className="text-slate-400"/>
                         {slot.deadline}
                       </div>
                     )}
                  </div>

                  {/* Status Badge */}
                  <div className="w-full md:col-span-3 flex md:block items-center justify-between">
                    <span className="md:hidden text-xs font-bold text-slate-400">Status:</span>
                    <StatusBadge status={slot.status} />
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full md:col-span-2 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Progress</span>
                      <span>{slot.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/50 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out
                          ${slot.status === 'finished' ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' : 'bg-gradient-to-r from-slate-700 to-slate-800'}`}
                        style={{ width: `${slot.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full md:col-span-2 flex items-center justify-end gap-2 mt-4 md:mt-0">
                    {!isReadOnly && (
                      <>
                        <button 
                           onClick={() => setExpandedId(expandedId === slot.id ? null : slot.id)}
                           className={`p-2 rounded-lg transition-colors relative ${expandedId === slot.id ? 'bg-primary-100 text-primary-600' : 'hover:bg-white/50 text-slate-400 hover:text-slate-600'}`}
                           title="详情 Details"
                        >
                          <Edit3 size={18} />
                          {images.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white shadow-sm"></span>}
                        </button>
                        
                        {slot.status !== 'finished' && (
                          <button 
                            onClick={() => onAdvanceStatus(slot.id)}
                            className="p-2 bg-white/50 hover:bg-primary-500 hover:text-white rounded-lg transition-all text-slate-600 shadow-sm"
                            title="下一阶段 Next Stage"
                          >
                            <ArrowRight size={18} />
                          </button>
                        )}
                        
                        {/* Always show delete for easier management */}
                        <button 
                          onClick={() => {
                            if(confirm(`确认删除 ${slot.clientName} 的排单吗？`)) {
                                if(onDeleteSlot) onDeleteSlot(slot.id);
                            }
                          }}
                          className="p-2 hover:bg-red-100 hover:text-red-500 rounded-lg transition-colors text-slate-300"
                          title="删除 Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {expandedId === slot.id && !isReadOnly && (
                  <div className="mt-6 pt-6 border-t border-slate-200/50 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <ClipboardList size={14}/> 订单详情 / Requirements
                          </label>
                          <div className="relative">
                            <button 
                              onClick={() => slotImageInputRef.current?.click()}
                              className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 font-bold px-3 py-1.5 bg-blue-50/50 hover:bg-blue-100/50 rounded-lg transition-colors backdrop-blur-md"
                            >
                                <ImageIcon size={12}/> 添加图片
                            </button>
                            <input 
                                type="file" 
                                ref={slotImageInputRef} 
                                onChange={(e) => handleAddImageToSlot(slot.id, e)} 
                                className="hidden" 
                                accept="image/*"
                            />
                          </div>
                      </div>
                      <textarea 
                        className="w-full h-48 p-3 rounded-xl border border-white/60 bg-white/40 text-sm focus:bg-white focus:ring-2 focus:ring-primary-200 outline-none resize-none shadow-inner"
                        placeholder="在此输入详细要求..."
                        value={slot.requirements || ''}
                        onChange={(e) => onUpdateSlot && onUpdateSlot(slot.id, { requirements: e.target.value })}
                      />
                      
                      {/* Attachments Visualization */}
                      {(images.length > 0 || links.length > 0) && (
                          <div className="bg-white/50 rounded-xl p-3 border border-white/60 shadow-sm backdrop-blur-md">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Sparkles size={10}/> 附件 / Attachments</p>
                              
                              {/* Image Gallery */}
                              {images.length > 0 && (
                                  <div className="grid grid-cols-4 gap-2 mb-3">
                                      {images.map((img, idx) => (
                                          <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg overflow-hidden border border-slate-200 relative group cursor-zoom-in shadow-sm">
                                              <img src={img} alt="attachment" className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
                                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"/>
                                          </a>
                                      ))}
                                  </div>
                              )}

                              {/* Link List */}
                              {links.length > 0 && (
                                  <div className="flex flex-col gap-1">
                                      {links.map((link, idx) => (
                                          <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:underline truncate bg-white/60 px-2 py-1.5 rounded transition-colors hover:bg-white">
                                              <ExternalLink size={10}/> <span className="truncate">{link}</span>
                                          </a>
                                      ))}
                                  </div>
                              )}
                          </div>
                      )}
                    </div>

                    <div className="space-y-4">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">快捷操作 / Actions</label>
                          <div className="flex gap-2 flex-wrap">
                              <button 
                                onClick={() => onUpdateSlot && onUpdateSlot(slot.id, { status: 'waiting', progress: 0 })}
                                className="px-3 py-2 bg-white/50 rounded-lg text-xs font-bold hover:bg-white text-slate-600 border border-white/60 transition-colors"
                              >
                                重置状态 Reset
                              </button>
                              <button 
                                onClick={() => onUpdateSlot && onUpdateSlot(slot.id, { status: 'finished', progress: 100 })}
                                className="px-3 py-2 bg-emerald-100/50 rounded-lg text-xs font-bold hover:bg-emerald-100 text-emerald-600 border border-emerald-200/50 transition-colors"
                              >
                                一键完成 Finish
                              </button>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )})
          )}
        </div>
        
        {/* Pagination Controls */}
        {slots.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-4 pt-4">
                <button 
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-white/40 hover:bg-white disabled:opacity-30 transition-all text-slate-600 shadow-sm"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-slate-500">
                    Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full bg-white/40 hover:bg-white disabled:opacity-30 transition-all text-slate-600 shadow-sm"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}
        </>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-white/90 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col border border-white/50">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Upload className="text-primary-500"/> 导入排单 Import
              </h3>
              <button onClick={() => setShowImport(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Option 1: File Upload - Highlighted */}
              <div className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center hover:bg-blue-50 transition-colors group cursor-pointer relative">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls, .csv"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-sm">
                        <FileSpreadsheet size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-700">点击上传 Excel / CSV 表格</h4>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        支持 .xlsx 格式。系统会自动识别首行表头（昵称、业务、日期）。<br/>
                        Supports dynamic headers. One row per order.
                    </p>
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">OR PASTE TEXT</span>
                  <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Option 2: Text Import */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Template Sidebar */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col h-[400px]">
                   <div className="flex justify-between items-center mb-4">
                       <h4 className="font-bold text-slate-700 text-sm">常用模板 Templates</h4>
                       <button onClick={() => startEditTemplate()} className="p-1.5 hover:bg-white rounded-lg text-primary-600"><Plus size={16}/></button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                       {templates.map(tpl => (
                           <div 
                             key={tpl.id}
                             className={`p-3 rounded-xl border text-sm cursor-pointer transition-all group relative
                               ${selectedTemplateId === tpl.id ? 'bg-white border-primary-400 shadow-md' : 'bg-white/50 border-transparent hover:border-slate-300'}`}
                             onClick={() => setSelectedTemplateId(tpl.id)}
                           >
                               <div className="flex justify-between items-start">
                                  <span className="font-bold text-slate-700">{tpl.name}</span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={(e) => { e.stopPropagation(); startEditTemplate(tpl); }} className="p-1 hover:bg-blue-50 text-blue-500 rounded"><Edit3 size={12}/></button>
                                      <button onClick={(e) => { e.stopPropagation(); deleteTemplate(tpl.id); }} className="p-1 hover:bg-red-50 text-red-500 rounded"><Trash2 size={12}/></button>
                                  </div>
                               </div>
                               <div className="mt-2 flex gap-2">
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); handleApplyTemplate(tpl.content); }}
                                     className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold text-slate-600 flex items-center justify-center gap-1"
                                   >
                                     <ArrowRight size={12}/> 使用 Apply
                                   </button>
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); handleCopyTemplate(tpl.content); }}
                                     className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-500"
                                     title="复制 Copy"
                                   >
                                     <Copy size={12}/>
                                   </button>
                               </div>
                           </div>
                       ))}
                   </div>
                </div>

                {/* Editor / Paste Area */}
                <div className="md:col-span-2 flex flex-col h-[400px]">
                   {isEditingTemplate ? (
                       <div className="flex flex-col h-full bg-white rounded-2xl border-2 border-primary-100 overflow-hidden">
                           <div className="p-3 bg-primary-50 border-b border-primary-100 flex gap-2">
                               <input 
                                 value={templateForm.name}
                                 onChange={e => setTemplateForm({...templateForm, name: e.target.value})}
                                 className="flex-1 bg-white px-3 py-1.5 rounded-lg text-sm font-bold outline-none border border-primary-200 focus:border-primary-400"
                                 placeholder="模板名称 Template Name"
                               />
                           </div>
                           <textarea 
                             value={templateForm.content}
                             onChange={e => setTemplateForm({...templateForm, content: e.target.value})}
                             className="flex-1 p-4 resize-none outline-none text-sm font-mono text-slate-600"
                             placeholder="输入模板内容..."
                           />
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                               <button onClick={() => setIsEditingTemplate(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-lg">取消 Cancel</button>
                               <button onClick={saveTemplate} className="px-4 py-2 text-sm font-bold bg-primary-500 text-white hover:bg-primary-600 rounded-lg flex items-center gap-2"><Save size={16}/> 保存 Save</button>
                           </div>
                       </div>
                   ) : (
                       <div className="flex flex-col h-full relative">
                           <textarea 
                             value={pasteContent}
                             onChange={(e) => setPasteContent(e.target.value)}
                             placeholder={`在此粘贴排单信息... \n\n支持格式:\n昵称：XXX\n业务：XXX\n日期：XXX\n\n或直接粘贴 Excel 单元格内容`}
                             className="flex-1 w-full p-4 rounded-2xl border border-slate-300 bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-400 outline-none resize-none font-mono text-sm leading-relaxed"
                           />
                           <div className="absolute bottom-4 right-4 flex gap-2">
                              <button 
                                onClick={() => setPasteContent('')}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-bold text-xs"
                              >
                                清空 Clear
                              </button>
                              <button 
                                onClick={handleTextImport}
                                className="px-6 py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                              >
                                <Sparkles size={16}/> 智能识别 Identify & Import
                              </button>
                           </div>
                       </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
