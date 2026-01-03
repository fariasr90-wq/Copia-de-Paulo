
import React from 'react';
import { NavSection, Sermon } from '../types';
import { Plus, Clock, Book, Star, Trash2, ChevronRight, Edit2 } from 'lucide-react';

interface DashboardProps {
  onNavigate: (section: NavSection) => void;
  sermons: Sermon[];
  onDelete: (id: string) => void;
  onEdit: (sermon: Sermon) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, sermons, onDelete, onEdit }) => {
  const recentSermons = sermons.slice(0, 5);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (window.confirm('Deseja realmente excluir este esboço recente?')) {
      onDelete(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, sermon: Sermon) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(sermon);
  };

  return (
    <div className="space-y-10">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={() => onNavigate(NavSection.Generator)}
          className="group relative bg-emerald-600 p-8 rounded-[2.5rem] text-white overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-emerald-600/20 text-left"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <Plus size={100} />
          </div>
          <h3 className="text-2xl font-black mb-2">Novo Esboço</h3>
          <p className="text-emerald-50 text-sm font-medium">Crie sua próxima mensagem com inteligência bíblica.</p>
        </button>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Próximo Evento</h3>
          </div>
          <p className="text-2xl font-black mb-1">Culto de Domingo</p>
          <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">19:00 • Celebração</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <Book size={20} />
            </div>
            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Acervo Total</h3>
          </div>
          <p className="text-4xl font-black mb-1">{sermons.length}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Sermões preparados</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
              <Star size={20} />
            </div>
            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Favoritos</h3>
          </div>
          <p className="text-4xl font-black mb-1">0</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Destaques da semana</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h3 className="text-xl font-black tracking-tight">Esboços Recentes</h3>
            </div>
            <button 
              onClick={() => onNavigate(NavSection.Gallery)}
              className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all uppercase tracking-widest"
            >
              Ver Galeria <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentSermons.length > 0 ? recentSermons.map((sermon) => (
              <div 
                key={sermon.id} 
                onClick={() => onNavigate(NavSection.Gallery)}
                className="group flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer border-2 border-transparent hover:border-emerald-500/20 hover:shadow-xl"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-4 h-4 rounded-full shadow-lg ring-4 ring-white dark:ring-slate-800 ${
                    sermon.theme === 'Ofertório' ? 'bg-pink-500' : 
                    sermon.theme === 'Doutrina' ? 'bg-emerald-500' : 
                    sermon.theme === 'Sexta Profética' ? 'bg-amber-500' : 'bg-emerald-400'
                  }`}></div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">{sermon.title}</h4>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-[10px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-[0.2em]">{sermon.theme}</span>
                      <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                      <span className="text-[10px] font-bold text-slate-400">{sermon.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={(e) => handleEdit(e, sermon)}
                    className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleDelete(e, sermon.id)}
                    className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-800/20 rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/20 rounded-full w-fit mx-auto mb-6">
                   <Book size={40} className="text-emerald-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-black text-lg mb-6">Comece sua jornada homilética hoje.</p>
                <button 
                  onClick={() => onNavigate(NavSection.Generator)}
                  className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 transition-all"
                >
                  Criar Primeiro Esboço
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-xl">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70 mb-6">Versículo em Destaque</h4>
              <p className="text-2xl font-serif italic leading-relaxed mb-6">"Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade."</p>
              <p className="font-black text-sm uppercase tracking-widest text-emerald-100">— 2 Timóteo 2:15</p>
           </div>
           
           <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Incentivo Ministerial</h4>
              <p className="text-lg font-bold text-center text-slate-700 dark:text-slate-300 mb-2">A mensagem correta no momento certo.</p>
              <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
