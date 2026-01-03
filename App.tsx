
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Library, 
  Languages, 
  BookMarked, 
  Moon, 
  Sun,
  Menu,
  X,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Heart,
  Church,
  Zap,
  Users,
  StickyNote,
  Book,
  Settings,
  LogIn,
  FileText,
  History as HistoryIcon,
  Milestone
} from 'lucide-react';
import { NavSection, Theme as SermonTheme, Sermon } from './types';
import Dashboard from './views/Dashboard';
import SermonGenerator from './views/SermonGenerator';
import Gallery from './views/Gallery';
import Translator from './views/Translator';
import Dictionary from './views/Dictionary';
import ThemeGallery from './views/ThemeGallery';
import QuickNotes from './views/QuickNotes';
import PortugueseDictionary from './views/PortugueseDictionary';
import BiblicalCommentary from './views/BiblicalCommentary';
import ChronologicalTimeline from './views/ChronologicalTimeline';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSection>(NavSection.Dashboard);
  const [selectedGalleryTheme, setSelectedGalleryTheme] = useState<SermonTheme>('Geral');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sermonToEdit, setSermonToEdit] = useState<Sermon | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kerygma_user');
    return saved ? JSON.parse(saved) : {
      name: "Paulo",
      email: "paulo@pregador.com",
      initials: "P"
    };
  });

  const [loginFields, setLoginFields] = useState({ name: user.name, email: user.email });

  const [sermons, setSermons] = useState<Sermon[]>(() => {
    const saved = localStorage.getItem('kerygma_sermons');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Erro ao carregar sermões", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('kerygma_sermons', JSON.stringify(sermons));
  }, [sermons]);

  useEffect(() => {
    localStorage.setItem('kerygma_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSaveSermon = (newSermon: Sermon) => {
    setSermons(prev => {
      const exists = prev.find(s => s.id === newSermon.id);
      if (exists) {
        return prev.map(s => s.id === newSermon.id ? newSermon : s);
      }
      return [newSermon, ...prev];
    });
    setSermonToEdit(null);
    setActiveSection(NavSection.Gallery);
  };

  const handleDeleteSermon = (id: string) => {
    setSermons(prevSermons => prevSermons.filter(s => s.id !== id));
  };

  const handleEditSermon = (sermon: Sermon) => {
    setSermonToEdit(sermon);
    setActiveSection(NavSection.Generator);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginFields.name) return;
    
    const initials = loginFields.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    setUser({
      name: loginFields.name,
      email: loginFields.email || "sem@email.com",
      initials: initials || "?"
    });
    setShowLoginModal(false);
  };

  const navItems = [
    { id: NavSection.Dashboard, label: 'Painel', icon: <LayoutDashboard size={20} /> },
    { id: NavSection.Generator, label: 'Estruturador', icon: <BookOpen size={20} /> },
    { id: NavSection.Gallery, label: 'Galeria Geral', icon: <Library size={20} /> },
    { id: NavSection.QuickNotes, label: 'Notas Rápidas', icon: <StickyNote size={20} /> },
  ];

  const themeGalleries = [
    { theme: 'Ofertório' as SermonTheme, icon: <Heart size={18} className="text-pink-500" /> },
    { theme: 'Doutrina' as SermonTheme, icon: <Church size={18} className="text-emerald-500" /> },
    { theme: 'Sexta Profética' as SermonTheme, icon: <Zap size={18} className="text-yellow-500" /> },
    { theme: 'Celebrando em Família' as SermonTheme, icon: <Users size={18} className="text-emerald-400" /> },
  ];

  const toolItems = [
    { id: NavSection.ChronologicalTimeline, label: 'Linha do Tempo', icon: <Milestone size={20} /> },
    { id: NavSection.BiblicalCommentary, label: 'Comentário Bíblico', icon: <FileText size={20} /> },
    { id: NavSection.Translator, label: 'Tradutor Bíblico', icon: <Languages size={20} /> },
    { id: NavSection.Dictionary, label: 'Dicionário Teológico', icon: <BookMarked size={20} /> },
    { id: NavSection.PortugueseDictionary, label: 'Dicionário Português', icon: <Book size={20} /> },
  ];

  const renderContent = () => {
    const commonProps = { sermons, onDelete: handleDeleteSermon, onEdit: handleEditSermon };
    switch (activeSection) {
      case NavSection.Dashboard: 
        return <Dashboard onNavigate={setActiveSection} {...commonProps} />;
      case NavSection.Generator: 
        return <SermonGenerator onSave = {handleSaveSermon} initialSermon={sermonToEdit} />;
      case NavSection.Gallery: 
        return <Gallery theme="Geral" {...commonProps} />;
      case NavSection.ThemeGallery: 
        return <ThemeGallery theme={selectedGalleryTheme} {...commonProps} />;
      case NavSection.QuickNotes: 
        return <QuickNotes />;
      case NavSection.Translator: 
        return <Translator />;
      case NavSection.Dictionary: 
        return <Dictionary />;
      case NavSection.PortugueseDictionary:
        return <PortugueseDictionary />;
      case NavSection.BiblicalCommentary:
        return <BiblicalCommentary />;
      case NavSection.ChronologicalTimeline:
        return <ChronologicalTimeline />;
      default: 
        return <Dashboard onNavigate={setActiveSection} {...commonProps} />;
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-50`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-black font-serif bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent truncate">PAULO</h1>}
          <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar-sidebar pb-4">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === NavSection.Generator) setSermonToEdit(null);
                  setActiveSection(item.id);
                }}
                className={`w-full flex items-center p-3 rounded-xl transition-all ${activeSection === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'}`}
              >
                {item.icon}
                {isSidebarOpen && <span className="ml-3 font-bold text-[15px]">{item.label}</span>}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {isSidebarOpen && <p className="text-[11px] font-black text-slate-400 px-3 mb-2 uppercase tracking-[0.15em]">Categorias</p>}
            <div className="space-y-0.5">
              {themeGalleries.map((tg) => (
                <button
                  key={tg.theme}
                  onClick={() => {
                    setSelectedGalleryTheme(tg.theme);
                    setActiveSection(NavSection.ThemeGallery);
                  }}
                  className={`w-full flex items-center p-2.5 rounded-xl transition-all ${activeSection === NavSection.ThemeGallery && selectedGalleryTheme === tg.theme ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'}`}
                >
                  {tg.icon}
                  {isSidebarOpen && <span className="ml-3 font-medium text-[14px] truncate">{tg.theme}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            {isSidebarOpen && <p className="text-[11px] font-black text-slate-400 px-3 mb-2 uppercase tracking-[0.15em]">Ferramentas</p>}
            <div className="space-y-0.5">
              {toolItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all ${activeSection === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'}`}
                >
                  {item.icon}
                  {isSidebarOpen && <span className="ml-3 font-bold text-[15px]">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/40">
          <button 
            onClick={() => setShowLoginModal(true)}
            className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-emerald-500/10 transition-all text-left group"
          >
             <div className="w-8 h-8 min-w-[2rem] rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-[12px] shadow-md">
                {user.initials}
             </div>
             {isSidebarOpen && (
               <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-black truncate dark:text-white leading-none mb-1">{user.name}</p>
                 <p className="text-[10px] text-slate-500 truncate leading-none">Perfil do Pregador</p>
               </div>
             )}
          </button>

          <div className="flex flex-col gap-0.5 mt-1">
            <button className="w-full flex items-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-emerald-500 group">
              <Settings size={16} />
              {isSidebarOpen && <span className="ml-3 font-bold text-xs">Configurações</span>}
            </button>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-emerald-500"
            >
              {isDarkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-emerald-500" />}
              {isSidebarOpen && <span className="ml-3 font-bold text-xs">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
            </button>
          </div>
        </div>
      </aside>

      {showLoginModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[280px] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 transform animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-sm tracking-tight flex items-center gap-2 text-emerald-600"><LogIn size={18} /> Perfil</h3>
              <button onClick={() => setShowLoginModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Pregador</label>
                <input 
                  type="text" 
                  value={loginFields.name}
                  onChange={(e) => setLoginFields({...loginFields, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-xl p-3 text-xs font-bold outline-none transition-all"
                  placeholder="Nome completo..."
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail de Contato</label>
                <input 
                  type="email" 
                  value={loginFields.email}
                  onChange={(e) => setLoginFields({...loginFields, email: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-xl p-3 text-xs font-bold outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95 mt-2"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-6 sm:p-10`}>
        <header className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md py-4">
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-black dark:text-white capitalize tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
              {activeSection === NavSection.ThemeGallery ? selectedGalleryTheme : 
               navItems.find(n => n.id === activeSection)?.label || 
               toolItems.find(n => n.id === activeSection)?.label || 'Bem-vindo'}
            </h2>
          </div>

          <div id="header-style-ruler" className="flex-1 flex justify-center items-center px-4"></div>

          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex-shrink-0">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <CalendarIcon size={16} className="text-emerald-500" />
              <span className="font-bold text-sm">
                {currentTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            </div>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ClockIcon size={16} className="text-emerald-500" />
              <span className="font-mono font-black text-sm tracking-tight">
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-3 duration-500">
          {renderContent()}
        </section>
      </main>

      <style>{`
        .custom-scrollbar-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-sidebar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }
        .dark .custom-scrollbar-sidebar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.1);
        }
      `}</style>
    </div>
  );
};

export default App;
