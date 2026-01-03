
import React, { useState, useEffect } from 'react';
import { fetchChronologicalEvents } from '../services/geminiService';
import { 
  Milestone, 
  Search, 
  Loader2, 
  History as HistoryIcon, 
  Trash2, 
  Clock, 
  Users, 
  Calendar, 
  ArrowRight,
  ScrollText,
  MapPin,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  figures: string[];
  eventReference: string;
}

interface TimelineResult {
  reference: string;
  period: string;
  events: TimelineEvent[];
}

interface HistoryItem {
  id: string;
  passage: string;
  result: TimelineResult;
  timestamp: string;
}

const ChronologicalTimeline: React.FC = () => {
  const [passage, setPassage] = useState('');
  const [result, setResult] = useState<TimelineResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('paulo_timeline_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('paulo_timeline_history', JSON.stringify(history));
  }, [history]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!passage) return;
    setIsLoading(true);
    try {
      const data = await fetchChronologicalEvents(passage);
      setResult(data);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        passage: passage,
        result: data,
        timestamp: new Date().toLocaleString('pt-BR')
      };
      
      setHistory(prev => {
        const filtered = prev.filter(h => h.passage.toLowerCase() !== passage.toLowerCase());
        return [newItem, ...filtered.slice(0, 19)];
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao buscar cronologia. Verifique a referência.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Excluir esta pesquisa do histórico?')) {
      setHistory(history.filter(item => item.id !== id));
      if (result?.reference && history.find(h => h.id === id)?.passage === passage) {
        setResult(null);
        setPassage('');
      }
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setPassage(item.passage);
    setResult(item.result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <Milestone size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Linha do Tempo Bíblica</h2>
                <p className="text-sm text-slate-500 font-medium">Localize passagens e eventos na ordem cronológica da história sagrada.</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                <input 
                  type="text" 
                  value={passage}
                  onChange={(e) => setPassage(e.target.value)}
                  placeholder="Ex: Vida de José, Atos 1-10, O Êxodo..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-14 pr-6 py-5 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xl font-bold transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading || !passage}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 px-10 rounded-2xl text-white font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20"
              >
                {isLoading ? <Loader2 size={22} className="animate-spin" /> : 'LOCALIZAR'}
              </button>
            </form>
          </div>

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
              <div className="text-center">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-6 py-2 rounded-full uppercase tracking-[0.3em] mb-4 inline-block">
                  {result.period}
                </span>
                <h3 className="text-4xl font-black tracking-tighter">Eventos Cronológicos de {result.reference}</h3>
              </div>

              <div className="relative">
                {/* Linha Central da Timeline */}
                <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500/50 via-emerald-500 to-emerald-500/50 sm:-translate-x-1/2 rounded-full"></div>

                <div className="space-y-16">
                  {result.events.map((event, idx) => (
                    <div key={idx} className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-12 ${idx % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                      {/* Ponto na Linha */}
                      <div className="absolute left-8 sm:left-1/2 w-4 h-4 bg-white border-4 border-emerald-500 rounded-full sm:-translate-x-1/2 z-10 shadow-lg"></div>

                      {/* Card de Conteúdo */}
                      <div className="flex-1 w-full pl-16 sm:pl-0">
                        <div className={`bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/30 transition-all group ${idx % 2 === 0 ? 'sm:mr-12' : 'sm:ml-12'}`}>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg uppercase">
                              {event.year}
                            </span>
                          </div>
                          <h4 className="text-xl font-black mb-3 group-hover:text-emerald-600 transition-colors">{event.title}</h4>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-serif">
                            {event.description}
                          </p>
                          
                          <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            {event.figures && event.figures.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                <Users size={14} className="text-emerald-500 mt-1" />
                                {event.figures.map((fig, fi) => (
                                  <span key={fi} className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md uppercase">
                                    {fig}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* Rodapé com a Referência Exata (Capítulo/Versículo) */}
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 mt-2">
                                <BookOpen size={16} className="text-emerald-600" />
                                <div className="flex-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Localização na Pesquisa</p>
                                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">{event.eventReference || result.reference}</p>
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Espaço Vazio para Alinhamento Desktop */}
                      <div className="flex-1 hidden sm:block"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar de Histórico */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-24 max-h-[85vh] flex flex-col overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
              <HistoryIcon size={16} className="text-emerald-500" /> Histórico Cronológico
            </h3>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {history.length > 0 ? history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="w-full text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-100 dark:border-slate-700/50 transition-all group relative"
                >
                  <div className="pr-8">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 truncate group-hover:text-emerald-600 transition-colors">
                      {item.passage}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={10} className="text-slate-400" />
                      <span className="text-[9px] text-slate-400 font-bold uppercase truncate">{item.result.period}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => deleteHistoryItem(e, item.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-slate-800 rounded-lg shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </button>
              )) : (
                <div className="text-center py-12 opacity-30">
                  <ScrollText size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sem históricos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChronologicalTimeline;
