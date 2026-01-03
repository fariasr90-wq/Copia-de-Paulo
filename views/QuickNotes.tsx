
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuickNote } from '../types';
import { 
  Plus, 
  Trash2, 
  Copy, 
  StickyNote, 
  X, 
  Check, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Palette, 
  Highlighter,
  Type,
  Maximize2,
  Minimize2,
  GripHorizontal,
  ExternalLink
} from 'lucide-react';

const QuickNotes: React.FC = () => {
  const [notes, setNotes] = useState<QuickNote[]>(() => {
    const saved = localStorage.getItem('kerygma_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [expandedNote, setExpandedNote] = useState<QuickNote | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: 'emerald' });
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 150, left: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  
  const contentInputRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400' },
    { name: 'green', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-600 dark:text-green-400' },
    { name: 'rose', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-600 dark:text-rose-400' },
    { name: 'amber', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400' },
  ];

  useEffect(() => {
    localStorage.setItem('kerygma_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (expandedNote || isAdding) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [expandedNote, isAdding]);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      if (!showFloatingMenu) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        let top = rect.top + window.scrollY - 320;
        if (top < 10) top = rect.bottom + window.scrollY + 20;

        setMenuPosition({
          top: top,
          left: rect.left + window.scrollX + (rect.width / 2)
        });
        setShowFloatingMenu(true);
      }
    }
  }, [showFloatingMenu]);

  const startDragging = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - menuPosition.left,
      y: e.clientY - menuPosition.top
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setMenuPosition({
        top: e.clientY - dragOffset.current.y,
        left: e.clientX - dragOffset.current.x
      });
    };
    const onMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  const format = (e: React.MouseEvent, command: string, value: any = undefined) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand(command, false, value);
  };

  const handleAddNote = () => {
    const content = contentInputRef.current?.innerHTML || '';
    if (!content.trim()) return;
    const note: QuickNote = {
      id: Date.now().toString(),
      title: newNote.title || 'Insight Ministerial',
      content: content,
      color: newNote.color,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };
    setNotes([note, ...notes]);
    setNewNote({ title: '', content: '', color: 'emerald' });
    setIsAdding(false);
  };

  const deleteNote = (id: string) => {
    if (window.confirm('Excluir esta nota permanentemente?')) {
      setNotes(notes.filter(n => n.id !== id));
      if (expandedNote?.id === id) setExpandedNote(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20" onMouseUp={handleSelection}>
      {showFloatingMenu && (
        <div 
          className={`fixed z-[300] flex flex-col p-0 bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-200 min-w-[340px] overflow-hidden ${isDragging ? 'scale-105 opacity-90' : ''}`}
          style={{ 
            top: `${menuPosition.top}px`, 
            left: `${menuPosition.left}px`, 
            transform: isDragging ? 'none' : 'translateX(-50%)' 
          }}
        >
          <div 
            className="bg-emerald-600 dark:bg-emerald-700 p-4 flex items-center justify-between cursor-grab active:cursor-grabbing text-white"
            onMouseDown={startDragging}
          >
            <div className="flex items-center gap-3 pointer-events-none">
              <GripHorizontal size={22} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Formatação Rápida</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowFloatingMenu(false); }} 
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20}/>
            </button>
          </div>

          <div className="p-6 space-y-6 bg-white dark:bg-slate-900 overflow-y-auto max-h-[300px] custom-scrollbar">
            <div className="flex gap-2">
              <button onMouseDown={(e) => format(e, 'bold')} className="flex-1 py-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"><Bold size={20}/> </button>
              <button onMouseDown={(e) => format(e, 'italic')} className="flex-1 py-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"><Italic size={20}/> </button>
              <button onMouseDown={(e) => format(e, 'underline')} className="flex-1 py-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"><UnderlineIcon size={20}/> </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
               <StickyNote size={28} />
            </div>
            Insights & Notas Rápidas
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Capture pensamentos e revelações instantâneas.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.95]">
          <Plus size={20} /> Adicionar Insight
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 transform animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl tracking-tight text-emerald-600">Novo Pensamento</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título da Nota</label>
                <input type="text" placeholder="Título..." value={newNote.title} onChange={(e) => setNewNote({...newNote, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conteúdo do Insight</label>
                <div 
                  ref={contentInputRef}
                  contentEditable
                  onMouseUp={handleSelection}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 min-h-[150px] outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium prose prose-sm dark:prose-invert transition-all text-sm overflow-y-auto max-h-[300px] custom-scrollbar"
                  data-placeholder="No que você está pensando agora?"
                />
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cor de Identificação</label>
                <div className="flex gap-3">
                  {colors.map(c => (
                    <button key={c.name} onClick={() => setNewNote({...newNote, color: c.name})} className={`w-10 h-10 rounded-full border-4 transition-all flex items-center justify-center ${c.bg} ${newNote.color === c.name ? 'border-emerald-600 dark:border-emerald-400 scale-110 shadow-lg' : 'border-transparent'}`}>
                      {newNote.color === c.name && <Check size={18} className={c.text} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={handleAddNote} className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/30 transition-all active:scale-95">SALVAR INSIGHT</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {notes.length > 0 ? notes.map((note) => {
          const colorSet = colors.find(c => c.name === note.color) || colors[0];
          return (
            <div 
              key={note.id} 
              className={`${colorSet.bg} ${colorSet.border} border-2 rounded-[3rem] p-8 shadow-sm hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden`}
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg">{note.createdAt}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => setExpandedNote(note)} className="p-2.5 bg-white/90 dark:bg-slate-800 rounded-xl text-emerald-600 shadow-md border border-slate-100 dark:border-slate-700"><Maximize2 size={16}/></button>
                  <button onClick={() => deleteNote(note.id)} className="p-2.5 bg-white/90 dark:bg-slate-800 rounded-xl text-rose-500 shadow-md border border-slate-100 dark:border-slate-700"><Trash2 size={16}/></button>
                </div>
              </div>
              <h4 className="text-xl font-black mb-4 text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">{note.title}</h4>
              <div 
                className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none line-clamp-[6] mb-8" 
                dangerouslySetInnerHTML={{ __html: note.content }} 
              />
              <button 
                onClick={() => setExpandedNote(note)}
                className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 group-hover:gap-4 transition-all"
              >
                Ler Nota Completa <ExternalLink size={14} />
              </button>
            </div>
          );
        }) : (
           <div className="col-span-full py-28 text-center bg-white dark:bg-slate-900/40 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800/50">
              <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-full w-fit mx-auto mb-8">
                 <StickyNote size={64} className="text-emerald-500/30" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-black text-xl mb-2">Sem Anotações Ativas</p>
              <p className="text-slate-400 text-sm">Suas notas rápidas e revelações serão arquivadas aqui.</p>
           </div>
        )}
      </div>

      {expandedNote && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-[3.5rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
                <div className="flex items-center gap-4">
                   <div className={`w-3 h-10 rounded-full ${colors.find(c => c.name === expandedNote.color)?.bg || 'bg-emerald-500'}`}></div>
                   <div>
                      <h3 className="text-2xl font-black tracking-tight">{expandedNote.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{expandedNote.createdAt}</p>
                   </div>
                </div>
                <button onClick={() => setExpandedNote(null)} className="p-3 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all text-slate-400"><X size={28} /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div 
                  className="prose prose-emerald dark:prose-invert max-w-none text-xl leading-relaxed font-serif" 
                  dangerouslySetInnerHTML={{ __html: expandedNote.content }} 
                />
             </div>
             <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 bg-slate-50/40">
                <button onClick={() => setExpandedNote(null)} className="px-10 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl text-xs uppercase tracking-widest">Fechar</button>
                <button 
                   onClick={() => {
                      const temp = document.createElement('div');
                      temp.innerHTML = expandedNote.content;
                      navigator.clipboard.writeText(temp.innerText);
                      alert('Insight copiado!');
                   }}
                   className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl flex items-center gap-3 text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/30 active:scale-95"
                >
                   <Copy size={18}/> Copiar Insight
                </button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        [contentEditable]:empty:before { content: attr(data-placeholder); color: #94a3b8; cursor: text; font-style: italic; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default QuickNotes;
