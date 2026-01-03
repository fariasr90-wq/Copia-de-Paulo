
import React from 'react';
import Gallery from './Gallery';
import { Theme as SermonTheme, Sermon } from '../types';

interface ThemeGalleryProps {
  theme: SermonTheme;
  sermons: Sermon[];
  onDelete: (id: string) => void;
  onEdit: (sermon: Sermon) => void;
}

const ThemeGallery: React.FC<ThemeGalleryProps> = ({ theme, sermons, onDelete, onEdit }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 mb-8">
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Acervo: {theme}</h3>
        <p className="text-slate-500 dark:text-slate-400">Aqui você encontra todos os seus esboços categorizados como {theme}.</p>
      </div>
      <Gallery theme={theme} sermons={sermons} onDelete={onDelete} onEdit={onEdit} />
    </div>
  );
};

export default ThemeGallery;
