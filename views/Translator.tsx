
import React, { useState, useEffect } from 'react';
import { translateBiblical } from '../services/geminiService';
import { TranslationResult } from '../types';
import { 
  Languages, 
  ArrowRightLeft, 
  Search, 
  Book, 
  Lightbulb, 
  Microscope, 
  ScrollText, 
  Link as LinkIcon,
  Quote,
  History,
  Trash2,
  Clock
} from 'lucide-react';

interface HistoryItem {
  id: string;
  query: string;
  direction: string;
  result: TranslationResult;
  timestamp: string;
}

const Translator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [direction, setDirection] = useState<'pt-gr' | 'gr-pt' | 'pt-he' | 'he-pt'>('pt-gr');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('paulo_translator_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('paulo_translator_history', JSON.stringify(history));
  }, [history]);

  const handleTranslate = async () => {
    if (!inputText) return;
    setIsLoading(true);
    try {
      const translation = await translateBiblical(inputText, direction);
      setResult(translation);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        query: inputText,
        direction: direction,
        result: translation,
        timestamp: new Date().toLocaleString('pt-BR')
      };
      
      setHistory(prev => [newItem, ...prev.slice(0, 19)]); // Mantém as últimas 20 pesquisas
    } catch (error) {
      console.error(error);
      alert('Erro ao traduzir. Tente novamente.');
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
    setInputText(item.query);
    setDirection(item.direction as any);
    setResult(item.result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDirLabel = (dir: string) => {
    switch(dir) {
      case 'pt-gr': return 'Português → Grego';
      case 'gr-pt': return 'Grego → Português';
      case 'pt-he': return 'Português → Hebraico';
      case 'he-pt': return 'Hebraico → Português';
      default: return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                <Languages size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Tradutor Bíblico & Exegético</h2>
                <p className="text-sm text-slate-500 font-medium tracking-tight">Análise profunda de termos originais com exegese e hermenêutica.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {(['pt-gr', 'gr-pt', 'pt-he', 'he-pt'] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => {setDirection(dir); setResult(null);}}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${direction === dir ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  {getDirLabel(dir)}
                </button>
              ))}
            </div>

            <div className="relative mb-6">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite o texto ou termo bíblico para análise..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-[2rem] p-8 h-40 focus:ring-4 focus:ring-indigo-500/10 outline-none text-xl font-medium resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all"
              />
            </div>

            <button 
              onClick={handleTranslate}
              disabled={isLoading || !inputText}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-600/20 uppercase tracking-[0.2em] text-sm"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <ArrowRightLeft size={20} />
                  Iniciar Análise Bíblica
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Resultado Principal */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                    <Languages size={180} />
                 </div>
                 <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Original</p>
                        <p className="text-3xl font-serif text-slate-800 dark:text-slate-100">{result.original}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Tradução</p>
                        <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{result.translated}</p>
                        {result.transliteration && (
                          <p className="text-xl font-serif text-slate-400 italic mt-2">[{result.transliteration}]</p>
                        )}
                      </div>
                    </div>
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Book size={14} /> Significados & Definições
                      </p>
                      <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                        {result.meanings}
                      </p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Microscope size={16} /> Análise Exegética
                  </p>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed font-serif whitespace-pre-wrap">
                      {result.exegesis}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Lightbulb size={16} /> Hermenêutica & Aplicação
                  </p>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed font-serif whitespace-pre-wrap">
                      {result.hermeneutics}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <Quote size={16} /> Exemplos Bíblicos
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {result.biblicalExamples.map((ex, idx) => (
                      <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group">
                        <p className="font-black text-indigo-600 dark:text-indigo-400 text-sm mb-2 group-hover:scale-105 transition-transform origin-left">{ex.verse}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">"{ex.context}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <LinkIcon size={16} /> Concordância Temática
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.thematicConcordance.map((theme, idx) => (
                      <span 
                        key={idx} 
                        className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-tighter border border-indigo-100 dark:border-indigo-800"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
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
                    {item.query}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{getDirLabel(item.direction)}</span>
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

export default Translator;
