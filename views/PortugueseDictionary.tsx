
import React, { useState, useEffect } from 'react';
import { portugueseDictionaryLookup } from '../services/geminiService';
import { Book, Search, Loader2, Bookmark, Repeat, Hash, MessageSquare, History, Trash2, Clock, ScrollText } from 'lucide-react';

interface HistoryItem {
  id: string;
  word: string;
  data: any;
  timestamp: string;
}

const PortugueseDictionary: React.FC = () => {
  const [word, setWord] = useState('');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('paulo_portuguese_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('paulo_portuguese_history', JSON.stringify(history));
  }, [history]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!word) return;
    setIsLoading(true);
    try {
      const result = await portugueseDictionaryLookup(word);
      setData(result);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        word: word,
        data: result,
        timestamp: new Date().toLocaleString('pt-BR')
      };
      
      setHistory(prev => {
        const filtered = prev.filter(h => h.word.toLowerCase() !== word.toLowerCase());
        return [newItem, ...filtered.slice(0, 19)];
      });
    } catch (error) {
      console.error(error);
      alert('Palavra não encontrada ou erro na rede.');
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
    setWord(item.word);
    setData(item.data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-inner">
                <Book size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Dicionário de Português</h2>
                <p className="text-sm text-slate-500 font-medium tracking-tight">Consulte o significado, classe gramatical e sinônimos de qualquer palavra.</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                <input 
                  type="text" 
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Ex: Altruísmo, Plenitude, Efêmero..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-14 pr-6 py-5 focus:ring-4 focus:ring-indigo-500/10 outline-none text-xl font-bold placeholder:font-medium placeholder:text-slate-400 transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading || !word}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 px-10 rounded-2xl text-white font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                {isLoading ? <Loader2 size={22} className="animate-spin" /> : 'PESQUISAR'}
              </button>
            </form>
          </div>

          {data && (
            <div className="animate-in slide-in-from-bottom-6 duration-700 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Book size={120} />
                 </div>
                 <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-8">
                        <h3 className="text-5xl font-black text-indigo-600 dark:text-indigo-400 capitalize tracking-tighter">{word}</h3>
                        <span className="text-sm font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full uppercase tracking-widest mb-2 inline-block w-fit">
                            {data.class}
                        </span>
                    </div>
                    
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Bookmark size={14} /> Definição</p>
                            <p className="text-2xl font-serif leading-relaxed text-slate-700 dark:text-slate-200">
                                {data.definition}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {data.synonyms && data.synonyms.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Repeat size={14} /> Sinônimos</p>
                                    <div className="flex flex-wrap gap-2">
                                        {data.synonyms.map((s: string) => (
                                            <button key={s} onClick={() => { setWord(s); }} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-100 dark:border-indigo-800/30">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data.antonyms && data.antonyms.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Hash size={14} /> Antônimos</p>
                                    <div className="flex flex-wrap gap-2">
                                        {data.antonyms.map((a: string) => (
                                            <span key={a} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl text-sm font-bold border border-slate-100 dark:border-slate-700">
                                                {a}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {data.examples && data.examples.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><MessageSquare size={14} /> Exemplos de Uso</p>
                                <div className="space-y-3">
                                    {data.examples.map((ex: string, i: number) => (
                                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 border-l-4 border-indigo-400 rounded-r-xl italic font-serif text-slate-600 dark:text-slate-300">
                                            "{ex}"
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {!data && !isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-500 delay-200">
              {['Resiliência', 'Empatia', 'Magnânimo', 'Benevolência'].map(t => (
                <button
                  key={t}
                  onClick={() => {setWord(t); setWord(t);}}
                  onMouseDown={() => {setWord(t)}}
                  onMouseUp={() => {handleSearch();}}
                  className="p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all text-sm font-black border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 uppercase tracking-tighter"
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
                <History size={16} className="text-indigo-500" /> Histórico
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
                  className="w-full text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-100 dark:border-slate-700/50 transition-all group"
                >
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 transition-colors">
                    {item.word}
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

export default PortugueseDictionary;
