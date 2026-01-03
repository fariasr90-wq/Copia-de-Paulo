
import React, { useState, useEffect } from 'react';
import { Theme as SermonTheme, Sermon } from '../types';
import { 
  Search, 
  Calendar, 
  ChevronRight, 
  X, 
  Trash2, 
  Printer, 
  Share2, 
  Library, 
  Edit2, 
  Maximize, 
  Minimize, 
  Type, 
  Sun, 
  Moon,
  ChevronLeft
} from 'lucide-react';

interface GalleryProps {
  theme: SermonTheme;
  sermons: Sermon[];
  onDelete: (id: string) => void;
  onEdit: (sermon: Sermon) => void;
}

const Gallery: React.FC<GalleryProps> = ({ theme, sermons, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [readingTheme, setReadingTheme] = useState<'light' | 'dark' | 'sepia'>('dark');

  const filteredSermons = sermons
    .filter(s => (theme === 'Geral' || s.theme === theme))
    .filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handlePrint = () => {
    window.print();
  };

  const handleCardClick = (sermon: Sermon) => {
    setSelectedSermon(sermon);
  };

  const confirmDelete = () => {
    if (selectedSermon) {
      onDelete(selectedSermon.id);
      setSelectedSermon(null);
      setShowConfirm(false);
    }
  };

  const handleEditClick = () => {
    if (selectedSermon) {
      const sermonToEdit = { ...selectedSermon };
      setSelectedSermon(null);
      setIsReadingMode(false);
      document.body.style.overflow = 'unset';
      onEdit(sermonToEdit);
    }
  };

  useEffect(() => {
    if (selectedSermon || isReadingMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedSermon, isReadingMode]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          <input 
            type="text" 
            placeholder="Pesquisar no seu acervo ministerial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] pl-16 pr-8 py-5 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-slate-700 dark:text-slate-200 transition-all font-bold text-lg shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredSermons.length > 0 ? filteredSermons.map((sermon) => (
          <div 
            key={sermon.id} 
            onClick={() => handleCardClick(sermon)}
            className="group bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-2 border-transparent hover:border-emerald-500/30 dark:hover:border-emerald-500/20 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all cursor-pointer overflow-hidden relative"
          >
            <div className="flex justify-between items-start mb-8">
              <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                sermon.theme === 'Ofertório' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300' :
                sermon.theme === 'Doutrina' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300' :
                sermon.theme === 'Sexta Profética' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300' :
                'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
              }`}>
                {sermon.theme}
              </span>
            </div>
            
            <h3 className="text-2xl font-black mb-6 group-hover:text-emerald-600 transition-colors text-slate-800 dark:text-slate-100 leading-tight">{sermon.title}</h3>
            
            <div className="flex flex-wrap gap-3 mb-10">
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-black bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <Calendar size={14} />
                {sermon.date}
              </div>
            </div>

            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-black text-xs pt-6 border-t border-slate-100 dark:border-slate-800/50 group-hover:gap-4 transition-all">
              <span className="tracking-[0.1em]">ESTUDAR ESBOÇO</span>
              <ChevronRight size={22} className="transform group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800/50">
            <div className="max-w-md mx-auto">
              <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-full w-fit mx-auto mb-8">
                <Library className="text-emerald-500/30 dark:text-emerald-500/20" size={100} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-black text-2xl mb-3 tracking-tight">Biblioteca Homilética Vazia</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm">Seus sermões aparecerão aqui após serem salvos.</p>
            </div>
          </div>
        )}
      </div>

      {selectedSermon && !isReadingMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[94vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border border-white/10 animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/30">
              <div className="flex items-center gap-8">
                <button onClick={() => setSelectedSermon(null)} className="p-4 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all text-slate-400 shadow-sm border border-transparent hover:border-slate-200">
                  <ChevronLeft size={32} />
                </button>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{selectedSermon.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-xl uppercase tracking-widest">{selectedSermon.theme}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{selectedSermon.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsReadingMode(true)}
                  className="p-5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-[1.5rem] transition-all flex items-center gap-3 font-black text-sm shadow-xl shadow-emerald-600/30"
                >
                  <Maximize size={24} /> <span className="hidden sm:inline">PULPITO</span>
                </button>
                <button onClick={handleEditClick} className="p-5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 transition-all flex items-center gap-3 font-bold text-sm">
                  <Edit2 size={24} /> <span className="hidden sm:inline">EDITAR</span>
                </button>
                <button 
                  onClick={() => setShowConfirm(true)} 
                  className="p-5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-[1.5rem] transition-all border-2 border-transparent hover:border-rose-200"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 md:p-24 custom-scrollbar">
              <div className="rich-content font-serif text-2xl leading-relaxed dark:text-slate-200" dangerouslySetInnerHTML={{ __html: selectedSermon.content }} />
            </div>

            <div className="p-10 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-6 bg-slate-50/60 dark:bg-slate-800/20">
              <button onClick={() => setSelectedSermon(null)} className="px-12 py-5 font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-sm uppercase tracking-widest transition-all">Fechar</button>
              <button 
                onClick={() => {
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = selectedSermon.content;
                  navigator.clipboard.writeText(tempDiv.innerText);
                  alert('Sermão copiado com sucesso!');
                }}
                className="px-12 py-5 bg-slate-900 dark:bg-emerald-700 text-white font-black rounded-2xl flex items-center gap-4 text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95"
              >
                <Share2 size={22} /> Copiar Texto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODO DE LEITURA (TELA CHEIA) */}
      {isReadingMode && selectedSermon && (
        <div className={`fixed inset-0 z-[200] flex flex-col transition-colors duration-500 ${
          readingTheme === 'dark' ? 'bg-slate-950 text-slate-100' : 
          readingTheme === 'sepia' ? 'bg-[#f8f4e9] text-[#433422]' : 
          'bg-white text-slate-900'
        }`}>
          <div className={`p-8 flex items-center justify-between border-b ${
            readingTheme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 
            readingTheme === 'sepia' ? 'border-[#e2d6b3] bg-[#f1e9d2]' : 
            'border-slate-100 bg-slate-50'
          } backdrop-blur-md sticky top-0 z-10`}>
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setIsReadingMode(false)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  readingTheme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-black/5 text-slate-500'
                }`}
              >
                <Minimize size={24} /> Sair do Púlpito
              </button>
              <div className="h-10 w-px bg-slate-700/20"></div>
              <h2 className="text-sm font-black uppercase tracking-widest opacity-60 hidden md:block">
                PREGAÇÃO: {selectedSermon.title}
              </h2>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl">
                <button onClick={() => setFontSize(Math.max(16, fontSize - 2))} className="p-3 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all"><Type size={18} /></button>
                <span className="text-sm font-black min-w-[3rem] text-center">{fontSize}px</span>
                <button onClick={() => setFontSize(Math.min(60, fontSize + 2))} className="p-3 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all"><Type size={28} /></button>
              </div>

              <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl">
                <button 
                  onClick={() => setReadingTheme('light')} 
                  className={`p-3 rounded-xl transition-all ${readingTheme === 'light' ? 'bg-white shadow-md text-emerald-600' : 'opacity-40'}`}
                >
                  <Sun size={24} />
                </button>
                <button 
                  onClick={() => setReadingTheme('sepia')} 
                  className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center font-serif font-black ${readingTheme === 'sepia' ? 'bg-[#433422] text-[#f8f4e9] shadow-md' : 'bg-[#e2d6b3] text-[#433422] opacity-40'}`}
                >
                  S
                </button>
                <button 
                  onClick={() => setReadingTheme('dark')} 
                  className={`p-3 rounded-xl transition-all ${readingTheme === 'dark' ? 'bg-slate-800 shadow-md text-emerald-400' : 'opacity-40'}`}
                >
                  <Moon size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar-reading pb-40">
            <div className="max-w-5xl mx-auto px-10 py-32 md:py-48">
              <header className="mb-24 border-b-4 border-emerald-500 pb-16 opacity-90">
                <span className="text-xs font-black uppercase tracking-[0.4em] opacity-50 mb-6 block">
                  {selectedSermon.theme} • {selectedSermon.date}
                </span>
                <h1 className="text-5xl md:text-8xl font-black leading-tight mb-6 tracking-tighter">
                  {selectedSermon.title}
                </h1>
              </header>

              <article 
                className="rich-content-reading font-serif leading-relaxed" 
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ __html: selectedSermon.content }} 
              />
              
              <div className="mt-40 pt-20 border-t border-current/10 text-center opacity-30 italic text-lg font-serif">
                Glória a Deus.
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl w-full max-w-md border-2 border-slate-100 dark:border-slate-800 text-center">
            <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-full w-fit mx-auto mb-8">
              <Trash2 size={48} className="text-rose-500" />
            </div>
            <h3 className="text-slate-900 dark:text-white text-2xl font-black mb-10 tracking-tight">Excluir este esboço permanentemente?</h3>
            <div className="flex gap-5">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl transition-all uppercase text-xs tracking-widest"
              >
                Manter
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl shadow-xl shadow-rose-600/30 transition-all uppercase text-xs tracking-widest"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .rich-content h1 { font-size: 3rem; font-weight: 900; margin-bottom: 2rem; color: #059669; }
        .rich-content h2 { font-size: 2.2rem; font-weight: 800; margin-top: 3.5rem; margin-bottom: 1.5rem; border-left: 10px solid #10b981; padding-left: 1.8rem; }
        
        .rich-content-reading h1 { font-size: 2em; font-weight: 900; margin-bottom: 1.2em; color: inherit; border-bottom: 4px solid #10b981; display: inline-block; padding-bottom: 0.2em; }
        .rich-content-reading h2 { font-size: 1.6em; font-weight: 800; margin-top: 2.5em; margin-bottom: 1.2em; opacity: 1; border-left: 0.3em solid #10b981; padding-left: 0.8em; }
        .rich-content-reading p { margin-bottom: 1.5em; }
        .rich-content-reading strong { font-weight: 900; color: #10b981; }
        .rich-content-reading ul { list-style: square; margin-left: 2em; margin-bottom: 1.5em; }
      `}</style>
    </div>
  );
};

export default Gallery;
