
import React, { useState, useEffect } from 'react';
import { theologicalLookup } from '../services/geminiService';
import { BookMarked, Search, Loader2, History, Trash2, Clock, ScrollText } from 'lucide-react';

interface HistoryItem {
  id: string;
  term: string;
  definition: string;
  timestamp: string;
}

const Dictionary: React.FC = () => {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('paulo_theological_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('paulo_theological_history', JSON.stringify(history));
  }, [history]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!term) return;
    setIsLoading(true);
    try {
      const result = await theologicalLookup(term);
      setDefinition(result || '');
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        term: term,
        definition: result || '',
        timestamp: new Date().toLocaleString('pt-BR')
      };
      
      setHistory(prev => {
        const filtered = prev.filter(h => h.term.toLowerCase() !== term.toLowerCase());
        return [newItem, ...filtered.slice(0, 19)];
      });
    } catch (error) {
      console.error(error);
      alert('Termo não encontrado ou erro na rede.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Deseja limpar o histórico?')) {
      setHistory([]);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setTerm(item.term);
    setDefinition(item.definition);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                <BookMarked size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Dicionário Teológico IA</h2>
                <p className="text-sm text-slate-500">Consulte conceitos, doutrinas e termos históricos do cristianismo.</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Digite um termo (ex: Soteriologia, Graça Irresistível...)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading || !term}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 px-8 rounded-2xl text-white font-bold transition-all flex items-center gap-2"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Buscar'}
              </button>
            </form>
          </div>

          {definition && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-3xl font-serif font-bold mb-6 text-indigo-600 dark:text-indigo-400 capitalize">{term}</h3>
              <div className="prose dark:prose-invert max-w-none text-xl leading-relaxed whitespace-pre-wrap font-serif">
                {definition}
              </div>
            </div>
          )}

          {!definition && !isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Escatologia', 'Hamartologia', 'Trindade', 'Propiciação'].map(t => (
                <button
                  key={t}
                  onClick={() => {setTerm(t); handleSearch();}}
                  className="p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all text-sm font-black border border-slate-100 dark:border-slate-800 shadow-sm uppercase tracking-tighter"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar de Histórico */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-24 max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <History size={16} className="text-amber-500" /> Histórico
              </h3>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Limpar histórico"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {history.length > 0 ? history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="w-full text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-slate-100 dark:border-slate-700/50 transition-all group"
                >
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200 truncate group-hover:text-amber-600 transition-colors">
                    {item.term}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] text-slate-300 flex items-center gap-1"><Clock size={10} /> {item.timestamp.split(',')[0]}</span>
                  </div>
                </button>
              )) : (
                <div className="text-center py-10 opacity-30">
                  <ScrollText size={40} className="mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Vazio</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dictionary;
