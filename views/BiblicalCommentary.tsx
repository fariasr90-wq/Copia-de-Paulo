
import React, { useState, useEffect } from 'react';
import { fetchBiblicalCommentary } from '../services/geminiService';
import { 
  FileText, 
  Search, 
  Loader2, 
  History, 
  Trash2, 
  Clock, 
  BookOpen, 
  Quote, 
  History as HistoryIcon,
  MessageCircle,
  Calendar,
  X,
  ScrollText,
  Bookmark
} from 'lucide-react';

interface CommentaryResult {
  reference: string;
  historicalContext: string;
  verseByVerse: { verse: string; text: string; commentary: string }[];
  theologicalInsights: string[];
  practicalApplication: string;
}

interface HistoryItem {
  id: string;
  passage: string;
  result: CommentaryResult;
  timestamp: string;
}

const BiblicalCommentary: React.FC = () => {
  const [passage, setPassage] = useState('');
  const [result, setResult] = useState<CommentaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('paulo_commentary_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('paulo_commentary_history', JSON.stringify(history));
  }, [history]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!passage) return;
    setIsLoading(true);
    try {
      const data = await fetchBiblicalCommentary(passage);
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
      alert('Erro ao buscar comentário. Verifique a referência.');
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

  const clearAllHistory = () => {
    if (window.confirm('Deseja apagar todo o seu histórico de comentários?')) {
      setHistory([]);
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
                <FileText size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Comentário Bíblico Exegético</h2>
                <p className="text-sm text-slate-500 font-medium">Estudo profundo sintetizando pensadores clássicos e modernos.</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                <input 
                  type="text" 
                  value={passage}
                  onChange={(e) => setPassage(e.target.value)}
                  placeholder="Ex: João 3:16, Salmo 23, Romanos 8..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-14 pr-6 py-5 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xl font-bold placeholder:font-medium placeholder:text-slate-400 transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading || !passage}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 px-10 rounded-2xl text-white font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 active:scale-95"
              >
                {isLoading ? <Loader2 size={22} className="animate-spin" /> : 'CONSULTAR'}
              </button>
            </form>
          </div>

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
              {/* Cabeçalho do Estudo */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">Ref. Confirmada</span>
                    <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{result.reference}</h3>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Bookmark size={14} className="text-emerald-500" /> Contexto Histórico
                  </h4>
                  <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                    {result.historicalContext}
                  </p>
                </div>
              </div>

              {/* Versículo por Versículo */}
              <div className="space-y-6">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-4">Análise Versículo por Versículo</h4>
                {result.verseByVerse.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm group hover:border-emerald-500/30 transition-all">
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-600/20">
                        {item.verse}
                      </div>
                      <div className="space-y-4">
                        <p className="text-xl font-serif font-black italic text-slate-800 dark:text-slate-100 leading-relaxed border-l-4 border-emerald-500/20 pl-6">
                          "{item.text}"
                        </p>
                        <p className="text-lg font-serif text-slate-600 dark:text-slate-400 leading-relaxed">
                          {item.commentary}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Insights e Aplicação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm">
                  <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Quote size={16} /> Destaques Teológicos
                  </h4>
                  <ul className="space-y-4">
                    {result.theologicalInsights.map((insight, i) => (
                      <li key={i} className="flex gap-3 text-lg font-serif text-slate-700 dark:text-slate-300">
                        <span className="text-emerald-500 font-black">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-600 text-white rounded-[2.5rem] p-10 shadow-xl shadow-emerald-600/20">
                  <h4 className="text-xs font-black text-emerald-100 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <MessageCircle size={16} /> Aplicação Prática
                  </h4>
                  <p className="text-xl leading-relaxed font-serif font-medium">
                    {result.practicalApplication}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar de Histórico */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-24 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <HistoryIcon size={16} className="text-emerald-500" /> Histórico de Estudos
              </h3>
              {history.length > 0 && (
                <button 
                  onClick={clearAllHistory}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Limpar tudo"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

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
                      <Clock size={10} className="text-slate-400" />
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{item.timestamp.split(',')[0]}</span>
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
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sem pesquisas recentes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiblicalCommentary;
