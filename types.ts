
export interface Slide {
  title: string;
  content: string;
  image?: string;
  bullets?: string[];
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // index
  explanation: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  xpValue: number;
  slides: Slide[];
  quiz: Question[];
  unlocked: boolean;
  completed: boolean;
}

export interface NotebookEntry {
  cues: string;
  notes: string;
  summary: string;
}

export interface UserStats {
  xp: number;
  level: number;
  badges: string[];
  completedLevels: number[];
  notebook: Record<number, NotebookEntry>;
}
