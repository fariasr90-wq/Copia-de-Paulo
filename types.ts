
export type Theme = 'Ofertório' | 'Doutrina' | 'Sexta Profética' | 'Celebrando em Família' | 'Geral';

export interface Sermon {
  id: string;
  title: string;
  theme: Theme;
  content: string;
  date: string;
  tags: string[];
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
}

export interface TranslationResult {
  original: string;
  translated: string;
  transliteration?: string;
  meanings: string;
  exegesis: string;
  hermeneutics: string;
  biblicalExamples: { verse: string; context: string }[];
  thematicConcordance: string[];
}

export enum NavSection {
  Dashboard = 'dashboard',
  Generator = 'generator',
  Gallery = 'gallery',
  Translator = 'translator',
  Dictionary = 'dictionary',
  PortugueseDictionary = 'portuguese-dictionary',
  ThemeGallery = 'theme-gallery',
  QuickNotes = 'quick-notes',
  BiblicalCommentary = 'biblical-commentary',
  ChronologicalTimeline = 'chronological-timeline'
}
