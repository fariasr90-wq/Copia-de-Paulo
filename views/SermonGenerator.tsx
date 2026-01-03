
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { generateSermonOutline } from '../services/geminiService';
import { Theme as SermonTheme, Sermon } from '../types';
import { 
  Sparkles, 
  RotateCcw, 
  Save, 
  Edit3, 
  Wand2,
  Plus,
  Trash2,
  ChevronDown,
  CheckCircle2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Type,
  Baseline,
  CaseSensitive,
  X as CloseIcon,
  Highlighter,
  Eraser,
  Palette
} from 'lucide-react';

interface SermonGeneratorProps {
  onSave: (sermon: Sermon) => void;
  initialSermon?: Sermon | null;
}

interface ManualPoint {
  title: string;
  content: string;
}

const SermonGenerator: React.FC<SermonGeneratorProps> = ({ onSave, initialSermon }) => {
  const [mode, setMode] = useState<'ia' | 'manual'>('ia');
  const [topic, setTopic] = useState('');
  const [theme, setTheme] = useState<SermonTheme>('Doutrina');
  const [reference, setReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Controle da Régua de Estilo
  const [showStyleRuler, setShowStyleRuler] = useState(false);
  const [rulerDismissed, setRulerDismissed] = useState(false);

  // Cores de Texto (5 opções)
  const textColors = ['#000000', '#059669', '#dc2626', '#2563eb', '#d97706'];
  // Cores de Marca-texto (5 opções)
  const highlightColors = ['#fef08a', '#bbf7d0', '#fbcfe8', '#bfdbfe', '#ddd6fe'];
  
  const fontSizes = [
    { label: 'P', value: '2' },
    { label: 'N', value: '3' },
    { label: 'M', value: '4' },
    { label: 'G', value: '5' },
    { label: 'XG', value: '6' },
  ];

  const [manualFields, setManualFields] = useState({
    title: '',
    text: '',
    intro: '',
    points: [{ title: '', content: '' }] as ManualPoint[],
    conclusion: ''
  });

  const themes: SermonTheme[] = ['Ofertório', 'Doutrina', 'Sexta Profética', 'Celebrando em Família', 'Geral'];

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0 && !rulerDismissed) {
        setShowStyleRuler(true);
      } else if (selection?.toString().trim().length === 0) {
        setShowStyleRuler(false);
        setRulerDismissed(false);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, [rulerDismissed]);

  useEffect(() => {
    if (initialSermon && editorRef.current) {
      editorRef.current.innerHTML = initialSermon.content;
      setTopic(initialSermon.title);
      setTheme(initialSermon.theme);
      setManualFields(prev => ({ ...prev, title: initialSermon.title }));
      setMode('ia');
    }
  }, [initialSermon]);

  const format = (e: React.MouseEvent | React.ChangeEvent<HTMLSelectElement>, command: string, value: any = undefined) => {
    if ('preventDefault' in e) e.preventDefault();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus({ preventScroll: true });
    }
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const outline = await generateSermonOutline(topic, theme, reference);
      if (editorRef.current) {
        editorRef.current.innerHTML = outline?.replace(/\n/g, '<br>') || '';
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    const content = editorRef.current?.innerHTML || '';
    const title = mode === 'ia' ? topic : manualFields.title;
    
    if (!content || content.trim() === '<br>' || content.trim() === '' || content.trim() === '<div><br></div>') {
      alert('O conteúdo do sermão está vazio!');
      return;
    }

    const newSermon: Sermon = {
      id: initialSermon?.id || Date.now().toString(),
      title: title || 'Sermão sem título',
      theme: theme,
      content: content,
      date: initialSermon?.date || new Date().toLocaleDateString('pt-BR'),
      tags: [theme, reference].filter(Boolean) as string[],
    };
    onSave(newSermon);
  };

  const addPoint = () => {
    setManualFields(prev => ({
      ...prev,
      points: [...prev.points, { title: '', content: '' }]
    }));
  };

  const removePoint = (index: number) => {
    setManualFields(prev => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index)
    }));
  };

  const updatePoint = (index: number, field: keyof ManualPoint, value: string) => {
    setManualFields(prev => {
      const newPoints = [...prev.points];
      newPoints[index] = { ...newPoints[index], [field]: value };
      return { ...prev, points: newPoints };
    });
  };

  const assembleManualDraft = () => {
    const pointsHtml = manualFields.points.map((p, i) => `
      <div style="margin-top: 2rem;">
        <h2 style="font-size: 1.8rem; font-weight: 800; border-left: 8px solid #10b981; padding-left: 1.5rem;">Ponto ${i + 1}: ${p.title}</h2>
        <p style="margin-top: 1rem;">${p.content}</p>
      </div>
    `).join('');

    const draft = `
      <div class="sermon-draft" style="font-family: 'Segoe UI', sans-serif;">
        <h1 style="font-size: 3rem; font-weight: 900; color: #059669; margin-bottom: 2rem;">${manualFields.title || 'Título do Sermão'}</h1>
        <p><strong>Tema:</strong> ${theme}</p>
        <p><strong>Texto Bíblico:</strong> ${manualFields.text}</p>
        <hr style="margin: 2.5rem 0; border: none; border-top: 2px solid #f1f5f9;">
        
        <h2 style="font-size: 1.8rem; font-weight: 800; border-left: 8px solid #059669; padding-left: 1.5rem;">Introdução</h2>
        <p style="margin-top: 1rem;">${manualFields.intro}</p>
        
        ${pointsHtml}
        
        <div style="margin-top: 3rem;">
          <h2 style="font-size: 1.8rem; font-weight: 800; border-left: 8px solid #34d399; padding-left: 1.5rem;">Conclusão & Apelo</h2>
          <p style="margin-top: 1rem;">${manualFields.conclusion}</p>
        </div>
      </div>
    `;
    if (editorRef.current) {
      editorRef.current.innerHTML = draft;
      setTopic(manualFields.title);
    }
    setMode('ia');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const StyleRuler = (
    <div className={`flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-700 px-5 py-3 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 ${showStyleRuler ? 'flex' : 'hidden'}`}>
       {/* Básicos */}
       <div className="flex border-r border-slate-200 dark:border-slate-800 pr-3 gap-1">
          <button onMouseDown={(e) => format(e, 'bold')} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-700 dark:text-slate-300"><Bold size={18}/></button>
          <button onMouseDown={(e) => format(e, 'italic')} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-700 dark:text-slate-300"><Italic size={18}/></button>
          <button onMouseDown={(e) => format(e, 'underline')} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-700 dark:text-slate-300"><UnderlineIcon size={18}/></button>
          <button onMouseDown={(e) => format(e, 'removeFormat')} className="p-2.5 hover:bg-rose-50 text-rose-500 rounded-full transition-all" title="Limpar Formatação"><Eraser size={18}/></button>
       </div>

       {/* Tamanho da Fonte */}
       <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-3">
          <CaseSensitive size={18} className="text-slate-400" />
          <select 
            onChange={(e) => format(e, 'fontSize', e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-black text-emerald-600 appearance-none cursor-pointer"
          >
            {fontSizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
       </div>

       {/* Cores de Texto (5 Opções) */}
       <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3">
          <div className="flex gap-1">
            {textColors.map(c => (
              <button key={c} onMouseDown={(e) => format(e, 'foreColor', c)} className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" style={{backgroundColor: c}} />
            ))}
          </div>
          <Type size={16} className="text-slate-400" />
       </div>

       {/* Marca-texto (5 Opções + Desmarcar) */}
       <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3">
          <div className="flex gap-1">
            {highlightColors.map(c => (
              <button key={c} onMouseDown={(e) => format(e, 'hiliteColor', c)} className="w-5 h-5 rounded-md border border-slate-200 shadow-sm" style={{backgroundColor: c}} />
            ))}
            <button onMouseDown={(e) => format(e, 'hiliteColor', 'transparent')} className="w-5 h-5 rounded-md border border-slate-300 bg-white flex items-center justify-center text-[8px] font-black text-slate-400" title="Remover Marca-texto">X</button>
          </div>
          <Highlighter size={16} className="text-slate-400" />
       </div>

       <button 
          onClick={() => { setShowStyleRuler(false); setRulerDismissed(true); }}
          className="ml-auto p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-full transition-all"
        >
         <CloseIcon size={18} />
       </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-20 relative">
      {document.getElementById('header-style-ruler') && createPortal(StyleRuler, document.getElementById('header-style-ruler')!)}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full">
            <button onClick={() => setMode('ia')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mode === 'ia' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Wand2 size={16} /> IA
            </button>
            <button onClick={() => setMode('manual')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mode === 'manual' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Edit3 size={16} /> Manual
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-y-auto max-h-[75vh] custom-scrollbar">
            {mode === 'ia' ? (
              <div className="space-y-5">
                <h3 className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.2em] text-emerald-600">Configuração Inteligente</h3>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assunto Principal</label>
                  <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex: Perdão e Reconciliação" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none text-xs font-bold focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Texto Sagrado</label>
                  <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ex: Mateus 18:21-22" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none text-xs font-bold focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Temática do Culto</label>
                  <div className="relative">
                    <select value={theme} onChange={(e) => setTheme(e.target.value as SermonTheme)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none text-xs font-bold appearance-none">
                      {themes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <button onClick={handleGenerate} disabled={isLoading || !topic} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-4 uppercase text-[10px] tracking-[0.15em] shadow-lg shadow-emerald-600/20">
                  {isLoading ? <RotateCcw className="animate-spin" size={18} /> : <Sparkles size={18} />} GERAR ESTRUTURA
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <h3 className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.2em] text-emerald-600">Redação Manual</h3>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Título da Mensagem</label>
                  <input type="text" value={manualFields.title} onChange={(e) => setManualFields({...manualFields, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none text-xs font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Bíblica</label>
                  <input type="text" value={manualFields.text} onChange={(e) => setManualFields({...manualFields, text: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none text-xs font-medium" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Introdução</label>
                  <textarea value={manualFields.intro} onChange={(e) => setManualFields({...manualFields, intro: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none text-xs font-medium h-20 resize-none" placeholder="Contextualização inicial..." />
                </div>
                
                <div className="space-y-5 pt-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tópicos do Corpo</label>
                    <button onClick={addPoint} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Plus size={18}/></button>
                  </div>
                  {manualFields.points.map((p, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3 border-2 border-transparent hover:border-emerald-500/20 transition-all">
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Ponto {idx + 1}</span>
                         {manualFields.points.length > 1 && <button onClick={() => removePoint(idx)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 size={14}/></button>}
                      </div>
                      <input type="text" placeholder="Título do Ponto" value={p.title} onChange={(e) => updatePoint(idx, 'title', e.target.value)} className="w-full bg-white dark:bg-slate-700 border-none rounded-lg p-2.5 text-[11px] font-bold" />
                      <textarea placeholder="Desenvolvimento..." value={p.content} onChange={(e) => updatePoint(idx, 'content', e.target.value)} className="w-full bg-white dark:bg-slate-700 border-none rounded-lg p-2.5 text-[11px] font-medium h-24 resize-none" />
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-4">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conclusão & Apelo</label>
                  <textarea value={manualFields.conclusion} onChange={(e) => setManualFields({...manualFields, conclusion: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none text-xs font-medium h-24 resize-none" placeholder="Finalização e chamada à ação..." />
                </div>

                <button onClick={assembleManualDraft} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 mt-4">
                  <CheckCircle2 size={18} /> MONTAR ESBOÇO
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[85vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20 sticky top-0 z-20 backdrop-blur-md">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Editor de Mensagem</span>
              <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-600/30 transition-all active:scale-95">
                <Save size={20} /> {initialSermon ? 'ATUALIZAR' : 'SALVAR NO ACERVO'}
              </button>
            </div>
            <div 
              ref={editorRef}
              contentEditable
              className="w-full p-10 md:p-20 outline-none prose prose-slate dark:prose-invert max-w-none text-xl leading-relaxed bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              style={{ 
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                minHeight: '70vh'
              }}
              data-placeholder="Inicie sua redação ou gere um esboço via IA..."
            />
          </div>
        </div>
      </div>

      <style>{`
        [contentEditable]:empty:before { content: attr(data-placeholder); color: #94a3b8; cursor: text; font-style: italic; }
        .prose h1 { font-family: "Segoe UI", sans-serif; font-size: 3.2rem; font-weight: 900; color: #059669; margin-bottom: 2rem; }
        .prose h2 { font-family: "Segoe UI", sans-serif; font-size: 2.2rem; font-weight: 800; margin-top: 3.5rem; margin-bottom: 1.5rem; border-left: 10px solid #10b981; padding-left: 1.8rem; }
        .prose p { margin-bottom: 1.8rem; font-family: "Segoe UI", sans-serif; }
        .dark .prose h1, .dark .prose h2 { color: #34d399; border-color: #34d399; }
        
        font[size="2"] { font-size: 0.85em; }
        font[size="3"] { font-size: 1em; }
        font[size="4"] { font-size: 1.25em; }
        font[size="5"] { font-size: 1.5em; }
        font[size="6"] { font-size: 2.2em; }
        font[size="7"] { font-size: 3.5em; }
      `}</style>
    </div>
  );
};

export default SermonGenerator;
