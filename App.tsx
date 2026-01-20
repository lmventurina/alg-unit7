
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, BookOpen, Target, ChevronRight, ChevronLeft, Star, Lock, CheckCircle2, Award, Zap, Home, ShieldCheck, RefreshCcw, Save } from 'lucide-react';
import { LEVELS } from './constants';
import { UserStats, Level, Slide, Question } from './types';

// Constants for storage keys
const USER_STORAGE_KEY = 'geoquest_user_v1';
const LEVELS_STORAGE_KEY = 'geoquest_levels_v1';

// Helper Components
const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border border-slate-300">
    <div 
      className="bg-indigo-600 h-full transition-all duration-700 ease-out shadow-inner"
      style={{ width: `${(current / total) * 100}%` }}
    />
  </div>
);

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
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize state from LocalStorage
  const [user, setUser] = useState<UserStats>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
    return {
      xp: 0,
      level: 1,
      badges: [],
      completedLevels: []
    };
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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  // Sync to LocalStorage whenever user or levels change
  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    const timer = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem(LEVELS_STORAGE_KEY, JSON.stringify(levels));
    const timer = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(timer);
  }, [levels]);

  const activeLevel = levels.find(l => l.id === activeLevelId);

  const startLevel = (id: number) => {
    const lvl = levels.find(l => l.id === id);
    if (!lvl || !lvl.unlocked) return;
    setActiveLevelId(id);
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
    
    setShowFeedback({
      correct: isCorrect,
      message: isCorrect ? "Excellent! Perfect understanding." : question.explanation
    });

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

        return {
          ...prev,
          xp: newXP,
          completedLevels: newCompleted,
          badges: newBadges,
          level: Math.floor(newXP / 200) + 1
        };
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

  const resetProgress = () => {
    if (confirm("Are you sure you want to reset your progress? This will clear all XP, levels, and badges.")) {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(LEVELS_STORAGE_KEY);
      window.location.reload();
    }
  };

  const returnToMap = () => {
    setView('map');
    setActiveLevelId(null);
    setShowFeedback(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <div className="flex flex-col">
              <h1 className="game-font text-2xl tracking-tighter text-indigo-900 leading-none">GeoQuest</h1>
              <div className={`flex items-center gap-1.5 transition-opacity duration-300 ${isSaving ? 'opacity-100' : 'opacity-0'}`}>
                <Save className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">Syncing...</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">XP Progress</span>
              <div className="w-32 flex flex-col gap-1">
                <ProgressBar current={user.xp % 200} total={200} />
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-700">{user.xp} <span className="text-xs text-slate-400">XP</span></span>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <Star className="w-4 h-4 text-indigo-500 fill-current" />
              <span className="font-bold text-indigo-700">LVL {user.level}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'map' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column: Progress Map */}
              <div className="flex-1">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Unit 7: Building Blocks</h2>
                  <p className="text-slate-500 italic">"Your progress is automatically saved to this browser."</p>
                </div>

                <div className="relative space-y-6 pl-4">
                  <div className="absolute left-[34px] top-6 bottom-6 w-1 bg-slate-200 rounded-full" />
                  
                  {levels.map((lvl) => {
                    const isFinal = lvl.id === 6;
                    return (
                      <div 
                        key={lvl.id}
                        onClick={() => startLevel(lvl.id)}
                        className={`relative flex items-start gap-6 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                          lvl.unlocked 
                            ? lvl.completed 
                              ? 'bg-emerald-50 border-emerald-200' 
                              : isFinal ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20' : 'bg-white border-indigo-100 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1'
                            : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${
                          lvl.unlocked 
                            ? lvl.completed ? 'bg-emerald-500 text-white' : isFinal ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                            : 'bg-slate-300 text-slate-500'
                        }`}>
                          {lvl.completed ? <CheckCircle2 className="w-6 h-6" /> : isFinal && lvl.unlocked ? <ShieldCheck className="w-6 h-6" /> : lvl.unlocked ? <span>{lvl.id}</span> : <Lock className="w-5 h-5" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-bold text-lg ${lvl.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                              {lvl.title}
                            </h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${lvl.completed ? 'bg-emerald-100 text-emerald-700' : isFinal ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                              {lvl.xpValue} XP
                            </span>
                          </div>
                          <p className={`text-sm ${lvl.unlocked ? 'text-slate-500' : 'text-slate-400 line-clamp-1'}`}>
                            {lvl.description}
                          </p>
                        </div>
                        
                        {lvl.unlocked && !lvl.completed && (
                          <div className="flex items-center justify-center self-center">
                            <ChevronRight className="w-6 h-6 text-indigo-300 group-hover:text-indigo-600" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Inventory & Stats */}
              <div className="w-full md:w-64 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" /> Achievement Vault
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <BadgeIcon name="Beginner" earned={user.completedLevels.length >= 1} />
                    <BadgeIcon name="Explorer" earned={user.completedLevels.length >= 3} />
                    <BadgeIcon name="Master" earned={user.badges.includes("Master")} />
                    <BadgeIcon name="Grand Arch" earned={user.badges.includes("Architect")} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Mission Stats
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1 text-indigo-200">
                        <span>Units Clear</span>
                        <span>{user.completedLevels.length}/6</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${(user.completedLevels.length / 6) * 100}%` }} />
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-widest mb-1 text-center">Current Rank</p>
                      <p className="font-bold text-lg text-center">{user.level < 3 ? 'Novice' : user.level < 5 ? 'Elite' : 'Grand Architect'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'lesson' && activeLevel && (
          <div className="animate-in zoom-in-95 duration-300">
            <button 
              onClick={returnToMap}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-6 transition-colors font-medium"
            >
              <ChevronLeft className="w-5 h-5" /> Return to Map
            </button>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
              <div className={`${activeLevel.id === 6 ? 'bg-amber-600' : 'bg-indigo-600'} px-8 py-4 flex items-center justify-between text-white`}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">{activeLevel.id === 6 ? 'Final Mission' : 'Lesson Phase'}</p>
                  <h2 className="text-xl font-bold">{activeLevel.title}</h2>
                </div>
                <div className="text-white/60 font-bold">
                  {currentSlideIndex + 1} / {activeLevel.slides.length}
                </div>
              </div>

              <div className="p-8 min-h-[400px] flex flex-col">
                <div className="flex-1 space-y-6">
                  <h3 className="text-3xl font-bold text-slate-800 leading-tight">
                    {activeLevel.slides[currentSlideIndex].title}
                  </h3>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    {activeLevel.slides[currentSlideIndex].content}
                  </p>
                  {activeLevel.slides[currentSlideIndex].bullets && (
                    <ul className="space-y-4 pt-4">
                      {activeLevel.slides[currentSlideIndex].bullets?.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-4 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                          <div className={`mt-1 w-2 h-2 rounded-full ${activeLevel.id === 6 ? 'bg-amber-500' : 'bg-indigo-500'} shrink-0`} />
                          <span className="text-lg text-slate-700">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-8 flex justify-between items-center pt-8 border-t border-slate-100">
                  <button 
                    disabled={currentSlideIndex === 0}
                    onClick={() => setCurrentSlideIndex(prev => prev - 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 font-bold transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" /> Previous
                  </button>
                  <button 
                    onClick={nextSlide}
                    className={`flex items-center gap-2 ${activeLevel.id === 6 ? 'bg-amber-600' : 'bg-indigo-600'} text-white px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all font-bold`}
                  >
                    {currentSlideIndex === activeLevel.slides.length - 1 ? 'Start Assessment' : 'Next'} 
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'quiz' && activeLevel && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-2xl mx-auto">
              <div className={`${activeLevel.id === 6 ? 'bg-red-600' : 'bg-amber-500'} px-8 py-4 flex items-center justify-between text-white`}>
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Assessment Challenge</p>
                    <h2 className="text-lg font-bold">Question Hub</h2>
                  </div>
                </div>
                <div className="text-white/60 font-bold">
                  {currentQuizIndex + 1} / {activeLevel.quiz.length}
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-8 leading-snug">
                  {activeLevel.quiz[currentQuizIndex].text}
                </h3>

                <div className="space-y-3 mb-8">
                  {activeLevel.quiz[currentQuizIndex].options.map((option, idx) => {
                    const isSelected = showFeedback !== null;
                    const isCorrect = idx === activeLevel.quiz[currentQuizIndex].correctAnswer;
                    
                    let bgClass = "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50";
                    if (showFeedback) {
                      if (isCorrect) bgClass = "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20";
                      else bgClass = "bg-slate-50 border-slate-100 opacity-60";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isSelected}
                        onClick={() => handleAnswer(idx)}
                        className={`w-full p-5 text-left rounded-2xl border-2 font-medium transition-all group relative flex items-center gap-4 ${bgClass}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                          showFeedback && isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-lg text-slate-700">{option}</span>
                        {showFeedback && isCorrect && <CheckCircle2 className="absolute right-4 w-6 h-6 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>

                {showFeedback && (
                  <div className={`p-6 rounded-2xl border-2 mb-8 animate-in slide-in-from-top-4 duration-300 ${
                    showFeedback.correct ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${showFeedback.correct ? 'bg-emerald-200' : 'bg-rose-200'}`}>
                        {showFeedback.correct ? <Star className="w-5 h-5 text-emerald-700" /> : <BookOpen className="w-5 h-5 text-rose-700" />}
                      </div>
                      <div>
                        <p className="font-bold mb-1">{showFeedback.correct ? 'Excellent Job!' : 'Review Hint'}</p>
                        <p className="text-sm leading-relaxed opacity-90">{showFeedback.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  {showFeedback && (
                    <button 
                      onClick={nextQuestion}
                      className={`bg-slate-800 text-white px-10 py-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-900 font-bold transition-all ${activeLevelId === 6 ? 'animate-pulse' : ''}`}
                    >
                      {currentQuizIndex === activeLevel.quiz.length - 1 ? 'Finish Assessment' : 'Continue'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'victory' && (
          <div className="animate-in zoom-in duration-500 text-center py-12">
            <div className="max-w-md mx-auto space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-20 animate-pulse" />
                <div className="relative bg-white p-8 rounded-[40px] shadow-2xl border-4 border-amber-400 inline-flex flex-col items-center">
                  <div className="bg-amber-100 p-6 rounded-full mb-4">
                    {activeLevelId === 6 ? <ShieldCheck className="w-20 h-20 text-amber-500" /> : <Trophy className="w-20 h-20 text-amber-500" />}
                  </div>
                  <h2 className="game-font text-5xl text-slate-800 tracking-tight mb-2 uppercase">
                    {activeLevelId === 6 ? 'Certified!' : 'Level Up!'}
                  </h2>
                  <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">
                    {activeLevelId === 6 ? 'Unit 7 Master Architect' : 'Mission Accomplished'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Assessment Rewards</p>
                  <div className="flex justify-center items-center gap-4">
                    <div className="flex flex-col items-center bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
                      <span className="text-3xl font-black text-indigo-600">+{activeLevel?.xpValue}</span>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">XP</span>
                    </div>
                    {activeLevelId === 6 && (
                      <div className="flex flex-col items-center bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100">
                        <span className="text-3xl font-black text-amber-600">S+</span>
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Rank</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={returnToMap}
                    className="w-full bg-slate-800 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
                  >
                    <Home className="w-5 h-5" /> Return to Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 px-4 text-center space-y-4">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          Algebra I Unit 7 Mastery LMS • Quarter 3 Certification Path
        </p>
        <button 
          onClick={resetProgress}
          className="inline-flex items-center gap-2 text-slate-300 hover:text-rose-400 transition-colors text-[10px] font-bold uppercase tracking-widest"
        >
          <RefreshCcw className="w-3 h-3" /> Reset Mission Progress
        </button>
      </footer>
    </div>
  );
}
