
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, BookOpen, Target, ChevronRight, ChevronLeft, Star, Lock, CheckCircle2, Award, Zap, Home, ShieldCheck, RefreshCcw, Save, Notebook as NotebookIcon, PenTool, X, ChevronDown, GripVertical } from 'lucide-react';
import { LEVELS } from './constants';
import { UserStats, Level, NotebookEntry } from './types';

// Constants for storage keys
const USER_STORAGE_KEY = 'geoquest_user_v2';
const LEVELS_STORAGE_KEY = 'geoquest_levels_v2';

const BadgeIcon = ({ name, earned }: { name: string, earned: boolean }) => (
  <div className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${earned ? 'border-amber-400 bg-amber-50 scale-105' : 'border-slate-200 bg-slate-50 opacity-40 grayscale'}`}>
    <div className="bg-white p-2 rounded-full shadow-sm mb-2">
      <Award className={`w-8 h-8 ${earned ? 'text-amber-500' : 'text-slate-400'}`} />
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 text-center">{name}</span>
  </div>
);

export default function App() {
  const [view, setView] = useState<'map' | 'lesson' | 'quiz' | 'victory'>('map');
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Draggable FAB State
  const [fabPosition, setFabPosition] = useState({ x: window.innerWidth - 80, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasMovedSignificant = useRef(false);

  // Initialize state from LocalStorage
  const [user, setUser] = useState<UserStats>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.notebook) parsed.notebook = {};
        return parsed;
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
    return { xp: 0, level: 1, badges: [], completedLevels: [], notebook: {} };
  });

  const [levels, setLevels] = useState<Level[]>(() => {
    const saved = localStorage.getItem(LEVELS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse levels data", e);
      }
    }
    return LEVELS;
  });

  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [notebookTopicId, setNotebookTopicId] = useState<number>(1);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    const timer = setTimeout(() => setIsSaving(false), 500);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem(LEVELS_STORAGE_KEY, JSON.stringify(levels));
    const timer = setTimeout(() => setIsSaving(false), 500);
    return () => clearTimeout(timer);
  }, [levels]);

  // Handle Dragging Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      
      // Keep within bounds
      const boundedX = Math.max(10, Math.min(window.innerWidth - 70, newX));
      const boundedY = Math.max(10, Math.min(window.innerHeight - 70, newY));

      // Threshold for "click vs drag"
      if (Math.abs(e.clientX - dragStartPos.current.x) > 5 || Math.abs(e.clientY - dragStartPos.current.y) > 5) {
        hasMovedSignificant.current = true;
      }
      
      setFabPosition({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const onFabMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    hasMovedSignificant.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragOffset.current = {
      x: e.clientX - fabPosition.x,
      y: e.clientY - fabPosition.y
    };
  };

  const onFabClick = (e: React.MouseEvent) => {
    // Only toggle if we didn't drag
    if (!hasMovedSignificant.current) {
      setIsNotebookOpen(!isNotebookOpen);
    }
  };

  const activeLevel = levels.find(l => l.id === activeLevelId);

  const startLevel = (id: number) => {
    const lvl = levels.find(l => l.id === id);
    if (!lvl || !lvl.unlocked) return;
    setActiveLevelId(id);
    setNotebookTopicId(id);
    setCurrentSlideIndex(0);
    setView('lesson');
  };

  const nextSlide = () => {
    if (activeLevel && currentSlideIndex < activeLevel.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      setView('quiz');
      setCurrentQuizIndex(0);
      setQuizScore(0);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (!activeLevel || showFeedback) return;
    const question = activeLevel.quiz[currentQuizIndex];
    const isCorrect = optionIndex === question.correctAnswer;
    setShowFeedback({ correct: isCorrect, message: isCorrect ? "Excellent! Perfect understanding." : question.explanation });
    if (isCorrect) setQuizScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    setShowFeedback(null);
    if (activeLevel && currentQuizIndex < activeLevel.quiz.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      completeLevel();
    }
  };

  const completeLevel = () => {
    if (!activeLevel) return;
    const isFirstTime = !user.completedLevels.includes(activeLevel.id);
    if (isFirstTime) {
      setUser(prev => {
        const newXP = prev.xp + activeLevel.xpValue;
        const newCompleted = [...prev.completedLevels, activeLevel.id];
        const newBadges = [...prev.badges];
        if (newXP >= 500 && !newBadges.includes("Hero")) newBadges.push("Hero");
        if (activeLevel.id === 5 && !newBadges.includes("Master")) newBadges.push("Master");
        if (activeLevel.id === 6 && !newBadges.includes("Architect")) newBadges.push("Architect");
        return { ...prev, xp: newXP, completedLevels: newCompleted, badges: newBadges, level: Math.floor(newXP / 200) + 1 };
      });
      setLevels(prev => prev.map(l => {
        if (l.id === activeLevel.id) return { ...l, completed: true };
        if (l.id === 6 && activeLevel.id === 5) return { ...l, unlocked: true };
        if (l.id === activeLevel.id + 1 && l.id < 6) return { ...l, unlocked: true };
        return l;
      }));
    }
    setView('victory');
  };

  const updateNotes = (levelId: number, field: keyof NotebookEntry, value: string) => {
    setUser(prev => ({
      ...prev,
      notebook: {
        ...prev.notebook,
        [levelId]: {
          ...prev.notebook[levelId] || { cues: '', notes: '', summary: '' },
          [field]: value
        }
      }
    }));
  };

  const resetProgress = () => {
    if (confirm("Reset everything? All XP, badges, and notes will be deleted.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const returnToMap = () => {
    setView('map');
    setActiveLevelId(null);
    setShowFeedback(null);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-50 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg cursor-pointer" onClick={returnToMap}>
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="game-font text-xl text-indigo-900 cursor-pointer" onClick={returnToMap}>GeoQuest</h1>
              <div className={`flex items-center gap-1 transition-opacity ${isSaving ? 'opacity-100' : 'opacity-0'}`}>
                <Save className="w-2 h-2 text-emerald-500 animate-pulse" />
                <span className="text-[8px] font-bold text-emerald-600 uppercase">Synced</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-sm text-slate-700">{user.xp} <span className="text-[10px] text-slate-400">XP</span></span>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              <Star className="w-3.5 h-3.5 text-indigo-500 fill-current" />
              <span className="font-bold text-sm text-indigo-700">LVL {user.level}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 transition-all duration-500 ease-in-out ${isNotebookOpen ? 'lg:mr-[450px]' : 'mr-0'}`}>
          <div className="max-w-4xl mx-auto pb-24">
            {view === 'map' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="mb-8 text-center md:text-left">
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Unit 7 Mastery Map</h2>
                      <p className="text-slate-500 text-sm">Conquer the fundamentals of coordinate geometry.</p>
                    </div>
                    <div className="relative space-y-6">
                      <div className="absolute left-[24px] top-6 bottom-6 w-1 bg-slate-200 rounded-full" />
                      {levels.map((lvl) => (
                        <div 
                          key={lvl.id}
                          onClick={() => startLevel(lvl.id)}
                          className={`relative flex items-center gap-5 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                            lvl.unlocked ? (lvl.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-indigo-100 hover:border-indigo-400 hover:shadow-lg') : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className={`z-10 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${lvl.unlocked ? (lvl.completed ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white') : 'bg-slate-300 text-slate-500'}`}>
                            {lvl.completed ? <CheckCircle2 className="w-6 h-6" /> : lvl.unlocked ? <span className="font-black text-lg">{lvl.id}</span> : <Lock className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-bold ${lvl.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>{lvl.title}</h3>
                            <p className="text-xs text-slate-500">{lvl.description}</p>
                          </div>
                          {lvl.unlocked && !lvl.completed && <ChevronRight className="w-5 h-5 text-indigo-300" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-full md:w-64 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                      <h3 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-500" /> Medals
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <BadgeIcon name="Explorer" earned={user.completedLevels.length >= 2} />
                        <BadgeIcon name="Master" earned={user.badges.includes("Master")} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === 'lesson' && activeLevel && (
              <div className="animate-in zoom-in-95 duration-300">
                <button onClick={returnToMap} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm">
                  <ChevronLeft className="w-4 h-4" /> Exit to Map
                </button>
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
                  <div className="bg-indigo-600 px-8 py-4 flex items-center justify-between text-white">
                    <h2 className="font-bold">Mission {activeLevel.id}: {activeLevel.title}</h2>
                    <span className="text-xs font-bold text-indigo-200">Slide {currentSlideIndex + 1}/{activeLevel.slides.length}</span>
                  </div>
                  <div className="p-8 sm:p-12 flex-1 flex flex-col justify-center">
                    <h3 className="text-3xl font-black text-slate-800 mb-6 leading-tight">{activeLevel.slides[currentSlideIndex].title}</h3>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">{activeLevel.slides[currentSlideIndex].content}</p>
                    {activeLevel.slides[currentSlideIndex].bullets && (
                      <ul className="space-y-4">
                        {activeLevel.slides[currentSlideIndex].bullets?.map((b, i) => (
                          <li key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span className="text-sm font-semibold text-slate-700">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between">
                    <button disabled={currentSlideIndex === 0} onClick={() => setCurrentSlideIndex(p => p - 1)} className="px-6 py-2 rounded-xl font-bold text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all">Back</button>
                    <button onClick={nextSlide} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
                      {currentSlideIndex === activeLevel.slides.length - 1 ? 'Start Quiz' : 'Continue Mission'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {view === 'quiz' && activeLevel && (
              <div className="animate-in slide-in-from-right-8 duration-300 max-w-2xl mx-auto">
                <div className="bg-white rounded-[32px] border-4 border-slate-100 shadow-2xl p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="font-black text-xl text-slate-800">Verification Hub</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {currentQuizIndex + 1} of {activeLevel.quiz.length}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-8">{activeLevel.quiz[currentQuizIndex].text}</h3>
                  <div className="space-y-3">
                    {activeLevel.quiz[currentQuizIndex].options.map((opt, i) => {
                      const selected = showFeedback !== null;
                      const correct = i === activeLevel.quiz[currentQuizIndex].correctAnswer;
                      return (
                        <button key={i} disabled={selected} onClick={() => handleAnswer(i)} className={`w-full p-5 text-left rounded-2xl border-2 font-bold transition-all relative flex items-center gap-4 ${
                          showFeedback ? (correct ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 opacity-40') : 'border-slate-100 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}>
                          <span className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-xs">{String.fromCharCode(65+i)}</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {showFeedback && (
                    <div className={`mt-8 p-6 rounded-2xl border-2 ${showFeedback.correct ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                      <p className="text-sm font-bold mb-1">{showFeedback.correct ? 'Verified!' : 'Recalibrating...'}</p>
                      <p className="text-xs font-medium opacity-80">{showFeedback.message}</p>
                      <button onClick={nextQuestion} className="mt-4 w-full bg-slate-800 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs">Next Phase</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === 'victory' && (
              <div className="text-center animate-in zoom-in-75 duration-500 pt-10">
                <div className="bg-white p-12 rounded-[48px] shadow-2xl border-4 border-amber-400 inline-block">
                  <Trophy className="w-24 h-24 text-amber-500 mx-auto mb-6" />
                  <h2 className="game-font text-5xl text-slate-800 mb-2">Victory!</h2>
                  <p className="font-black text-indigo-600 text-2xl mb-8">+{activeLevel?.xpValue} XP Earned</p>
                  <button onClick={returnToMap} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest">Return to Base</button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Sliding Notebook Drawer */}
        <aside 
          className={`fixed top-0 right-0 h-full w-full lg:w-[450px] bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.05)] z-[60] transition-transform duration-500 ease-in-out border-l border-slate-200 flex flex-col ${
            isNotebookOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <NotebookIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Study Notebook</h3>
            </div>
            <button onClick={() => setIsNotebookOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="p-4 bg-white border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {levels.map(lvl => (
              <button 
                key={lvl.id} 
                onClick={() => setNotebookTopicId(lvl.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border-2 ${
                  notebookTopicId === lvl.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                LEVEL {lvl.id}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col relative">
            <div className="absolute left-10 top-0 bottom-0 w-px bg-rose-100" />
            
            <div className="relative pl-8">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                <Target className="w-3 h-3" /> Cues & Questions
              </label>
              <textarea 
                className="w-full h-32 bg-transparent resize-none focus:outline-none text-sm font-medium text-slate-600 placeholder:text-slate-200 leading-relaxed"
                placeholder="Key terms, vocabulary, or self-test questions..."
                value={user.notebook[notebookTopicId]?.cues || ''}
                onChange={(e) => updateNotes(notebookTopicId, 'cues', e.target.value)}
              />
            </div>

            <div className="relative pl-8 flex-1 border-t border-slate-100 pt-8">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                <PenTool className="w-3 h-3" /> Detailed Notes
              </label>
              <textarea 
                className="w-full h-full bg-transparent resize-none focus:outline-none text-sm font-medium text-slate-800 placeholder:text-slate-200 leading-[2rem]"
                style={{ backgroundImage: 'linear-gradient(#f8fafc 1px, transparent 1px)', backgroundSize: '100% 2rem' }}
                placeholder="Definitions, examples, and formulas from the mission slides..."
                value={user.notebook[notebookTopicId]?.notes || ''}
                onChange={(e) => updateNotes(notebookTopicId, 'notes', e.target.value)}
              />
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-3">Lesson Summary</label>
            <textarea 
              className="w-full h-24 bg-white border border-slate-200 rounded-xl p-3 resize-none focus:outline-none text-xs font-bold text-slate-700 placeholder:text-slate-300"
              placeholder="The big idea of this level in 2 sentences..."
              value={user.notebook[notebookTopicId]?.summary || ''}
              onChange={(e) => updateNotes(notebookTopicId, 'summary', e.target.value)}
            />
          </div>
        </aside>

        {/* Draggable Floating Action Button (FAB) */}
        <div 
          style={{ 
            left: `${fabPosition.x}px`, 
            top: `${fabPosition.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={onFabMouseDown}
          onClick={onFabClick}
          className={`fixed w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(79,70,229,0.3)] z-[100] transition-transform active:scale-95 group select-none ${
            isNotebookOpen ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'
          } ${isDragging ? 'scale-110 shadow-2xl' : 'hover:scale-105'}`}
        >
          {/* Drag Handle Icon Indicator */}
          <div className="absolute top-1 flex gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>

          {isNotebookOpen ? <X className="w-7 h-7" /> : <NotebookIcon className="w-7 h-7" />}
          
          <span className="text-[7px] font-black uppercase mt-1 tracking-tighter opacity-70">
            {isNotebookOpen ? 'Close' : 'Notes'}
          </span>

          {!isNotebookOpen && (
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>
      </div>

      <footer className="py-4 px-4 bg-white border-t border-slate-100 shrink-0 flex justify-between items-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">
        <span>Unit 7 Geometry LMS</span>
        <button onClick={resetProgress} className="hover:text-rose-400 flex items-center gap-1 transition-colors">
          <RefreshCcw className="w-2.5 h-2.5" /> Reset Path
        </button>
      </footer>
    </div>
  );
}
