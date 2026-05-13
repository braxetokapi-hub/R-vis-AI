import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Map as MapIcon, 
  Info, 
  History, 
  Brain, 
  ChevronLeft, 
  ExternalLink, 
  Globe, 
  X,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize
} from 'lucide-react';
import { Tribe, Question } from '../types';
import { TRIBES } from '../data/tribes';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface TribesModuleProps {
  language: string;
  t: any;
  onBack: () => void;
}

export const TribesModule: React.FC<TribesModuleProps> = ({ language, t, onBack }) => {
  const [search, setSearch] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('Tous');
  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'quiz'>('info');
  const [gameMode, setGameMode] = useState<'explore' | 'locate'>('explore');
  const [locateTarget, setLocateTarget] = useState<Tribe | null>(null);
  const [locateFeedback, setLocateFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [locateStats, setLocateStats] = useState({ score: 0, total: 0 });
  const [quizState, setQuizState] = useState<{
    currentIndex: number;
    answers: Record<string, string>;
    showResults: boolean;
    feedback: { isCorrect: boolean; message: string } | null;
  }>({
    currentIndex: 0,
    answers: {},
    showResults: false,
    feedback: null
  });
  const [hoveredTribe, setHoveredTribe] = useState<Tribe | null>(null);

  const continents = ['Tous', 'Afrique', 'Amérique', 'Asie', 'Europe', 'Océanie'];

  const filteredTribes = useMemo(() => {
    return TRIBES.filter(tribe => {
      const matchesSearch = tribe.name.toLowerCase().includes(search.toLowerCase());
      const matchesContinent = selectedContinent === 'Tous' || tribe.continent === selectedContinent;
      return matchesSearch && matchesContinent;
    });
  }, [search, selectedContinent]);

  const handleTribeClick = (tribe: Tribe) => {
    if (gameMode === 'locate') {
      handleLocateClick(tribe);
      return;
    }
    setSelectedTribe(tribe);
    setActiveTab('info');
    setQuizState({
      currentIndex: 0,
      answers: {},
      showResults: false,
      feedback: null
    });
  };

  const handleAnswer = (answer: string) => {
    if (!selectedTribe || quizState.feedback) return;

    const currentQuestion = selectedTribe.quiz[quizState.currentIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: answer },
      feedback: {
        isCorrect,
        message: isCorrect ? "Excellent ! C'est la bonne réponse." : `Dommage ! La bonne réponse était : ${currentQuestion.correctAnswer}.`
      }
    }));
  };

  const nextQuestion = () => {
    if (!selectedTribe) return;
    
    if (quizState.currentIndex < selectedTribe.quiz.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        feedback: null
      }));
    } else {
      setQuizState(prev => ({ ...prev, showResults: true }));
    }
  };

  const score = useMemo(() => {
    if (!selectedTribe) return 0;
    return Object.entries(quizState.answers).reduce((acc, [qId, ans]) => {
      const q = selectedTribe.quiz.find(q => q.id === qId);
      return acc + (q?.correctAnswer === ans ? 1 : 0);
    }, 0);
  }, [quizState.answers, selectedTribe]);

  const startLocateGame = () => {
    setGameMode('locate');
    const randomTribe = TRIBES[Math.floor(Math.random() * TRIBES.length)];
    setLocateTarget(randomTribe);
    setLocateFeedback(null);
    setSelectedTribe(null);
  };

  const handleLocateClick = (tribe: Tribe) => {
    if (!locateTarget || locateFeedback) return;

    const isCorrect = tribe.id === locateTarget.id;
    setLocateFeedback({
      isCorrect,
      message: isCorrect 
        ? `Bravo ! C'est bien ici que vivent les ${locateTarget.name}.` 
        : `Non, ici vivent les ${tribe.name}. Les ${locateTarget.name} sont ailleurs !`
    });

    if (isCorrect) {
      setLocateStats(prev => ({ score: prev.score + 1, total: prev.total + 1 }));
    } else {
      setLocateStats(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const nextLocateTarget = () => {
    const remainingTribes = TRIBES.filter(t => t.id !== locateTarget?.id);
    const randomTribe = remainingTribes[Math.floor(Math.random() * remainingTribes.length)];
    setLocateTarget(randomTribe);
    setLocateFeedback(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-[#141414]/40 hover:text-[#141414] font-bold transition-colors mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              {t.backToHome}
            </button>
            <h1 className="text-5xl font-black tracking-tight text-[#141414]">
              {t.tribes?.title || "Tribus du Monde"}
            </h1>
            <p className="text-xl text-[#141414]/60 font-medium">
              {t.tribes?.subtitle || "Explorez les cultures ancestrales et les peuples autochtones."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#141414]/20" />
              <input 
                type="text"
                placeholder={t.tribes?.searchPlaceholder || "Rechercher une tribu..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-6 py-4 rounded-2xl border-2 border-[#141414]/5 bg-white focus:border-[#141414] outline-none transition-all w-full sm:w-64 font-bold"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              <button
                onClick={() => {
                  setGameMode('explore');
                  setLocateTarget(null);
                }}
                className={cn(
                  "px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all border-2",
                  gameMode === 'explore' 
                    ? "bg-[#141414] text-white border-[#141414]" 
                    : "bg-white text-[#141414]/40 border-[#141414]/5 hover:border-[#141414]/20"
                )}
              >
                {t.tribes?.exploreTab || "Exploration"}
              </button>
              <button
                onClick={startLocateGame}
                className={cn(
                  "px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all border-2",
                  gameMode === 'locate' 
                    ? "bg-[#141414] text-white border-[#141414]" 
                    : "bg-white text-[#141414]/40 border-[#141414]/5 hover:border-[#141414]/20"
                )}
              >
                {t.tribes?.locateTab || "Jeu de Localisation"}
              </button>
              <div className="w-px bg-[#141414]/10 mx-2" />
              {continents.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedContinent(c)}
                  className={cn(
                    "px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all border-2",
                    selectedContinent === c 
                      ? "bg-[#141414] text-white border-[#141414]" 
                      : "bg-white text-[#141414]/40 border-[#141414]/5 hover:border-[#141414]/20"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Container */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-[#141414]/5 shadow-2xl shadow-black/5 relative overflow-hidden min-h-[500px]">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <Globe className="w-full h-full" />
            </div>
            
            <div className="relative w-full h-full flex flex-col">
              <div className="flex items-center gap-2 mb-8">
                <div className="p-3 bg-[#141414] text-white rounded-xl">
                  <MapIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Carte Interactive</h2>
              </div>

              {gameMode === 'locate' && locateTarget && (
                <div className="mb-6 p-6 bg-[#141414] text-white rounded-3xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-white/40">
                      {t.tribes?.whereDoTheyLive?.split('{name}')[0] || "Où vivent les "}
                    </p>
                    <h3 className="text-3xl font-black tracking-tight">
                      {t.tribes?.names?.[locateTarget.id] || locateTarget.name}
                      {t.tribes?.whereDoTheyLive?.split('{name}')[1] || " ?"}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-white/40">{t.tribes?.locateScore || "Score"}</p>
                    <p className="text-2xl font-black">{locateStats.score} / {locateStats.total}</p>
                  </div>
                </div>
              )}

              {/* Enhanced Map with Zoom and Pan */}
              <div className="flex-1 relative bg-[#F5F5F0]/50 rounded-3xl border-2 border-dashed border-[#141414]/5 overflow-hidden group/map">
                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={4}
                  centerOnInit={true}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                        <button 
                          onClick={() => zoomIn()}
                          className="p-3 bg-white border border-[#141414]/10 rounded-xl shadow-lg hover:bg-[#F5F5F0] transition-colors"
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => zoomOut()}
                          className="p-3 bg-white border border-[#141414]/10 rounded-xl shadow-lg hover:bg-[#F5F5F0] transition-colors"
                        >
                          <ZoomOut className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => resetTransform()}
                          className="p-3 bg-white border border-[#141414]/10 rounded-xl shadow-lg hover:bg-[#F5F5F0] transition-colors"
                        >
                          <Maximize className="w-5 h-5" />
                        </button>
                      </div>

                      <TransformComponent
                        wrapperStyle={{ width: '100%', height: '100%' }}
                        contentStyle={{ width: '100%', height: '100%' }}
                      >
                        <div className="relative w-full h-full min-h-[400px]">
                          <svg viewBox="0 0 100 100" className="w-full h-full opacity-10 fill-current">
                            {/* Simplified World Map Path */}
                            <path d="M15,25 L25,20 L35,22 L40,15 L50,18 L60,12 L75,15 L85,20 L90,30 L85,45 L75,50 L65,48 L55,55 L45,52 L35,60 L25,55 L15,60 L10,50 L15,40 Z" />
                            <path d="M20,65 L30,60 L40,65 L45,75 L40,85 L30,90 L20,85 L15,75 Z" />
                            <path d="M55,65 L65,60 L75,65 L80,75 L75,85 L65,90 L55,85 L50,75 Z" />
                            <path d="M80,75 L90,70 L95,80 L90,90 L80,85 Z" />
                          </svg>

                          {filteredTribes.map(tribe => (
                            <motion.button
                              key={tribe.id}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.2 }}
                              onMouseEnter={() => gameMode === 'explore' && setHoveredTribe(tribe)}
                              onMouseLeave={() => setHoveredTribe(null)}
                              onClick={() => handleTribeClick(tribe)}
                              className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 group/pin"
                              style={{ left: `${tribe.location.x}%`, top: `${tribe.location.y}%` }}
                            >
                              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                              <div className={cn(
                                "relative w-full h-full rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-colors",
                                selectedTribe?.id === tribe.id ? "bg-[#141414]" : "bg-emerald-600"
                              )}>
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>

                {/* Locate Feedback Overlay */}
                <AnimatePresence>
                  {locateFeedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={cn(
                        "absolute inset-x-8 bottom-8 z-30 p-8 rounded-[2.5rem] border-2 shadow-2xl flex items-center justify-between",
                        locateFeedback.isCorrect ? "bg-emerald-500 border-emerald-400 text-white" : "bg-rose-500 border-rose-400 text-white"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {locateFeedback.isCorrect ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                        <p className="text-xl font-black tracking-tight">
                          {locateFeedback.isCorrect 
                            ? (t.tribes?.correctLocate?.replace('{name}', t.tribes?.names?.[locateTarget.id] || locateTarget.name) || locateFeedback.message)
                            : (t.tribes?.incorrectLocate?.replace('{name1}', t.tribes?.names?.[hoveredTribe?.id || ''] || 'ce peuple')?.replace('{name2}', t.tribes?.names?.[locateTarget.id] || locateTarget.name) || locateFeedback.message)
                          }
                        </p>
                      </div>
                      <button 
                        onClick={nextLocateTarget}
                        className="px-8 py-4 bg-white text-[#141414] rounded-2xl font-black hover:scale-105 transition-transform"
                      >
                        {t.tribes?.next || "Suivant"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip Overlay */}
                <AnimatePresence>
                  {hoveredTribe && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-8 left-8 z-20 p-6 bg-[#141414] text-white rounded-[2rem] shadow-2xl border border-white/10 max-w-xs pointer-events-none"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-black uppercase tracking-widest text-white/60">
                            {hoveredTribe.continent}
                          </span>
                        </div>
                        <h3 className="text-xl font-black tracking-tight">
                          {t.tribes?.names?.[hoveredTribe.id] || hoveredTribe.name}
                        </h3>
                        <p className="text-xs text-white/60 font-medium leading-relaxed">
                          {hoveredTribe.summary}
                        </p>
                        <div className="pt-2 flex flex-wrap gap-2">
                          {hoveredTribe.traditions.slice(0, 2).map((t, i) => (
                            <span key={i} className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded-lg">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Tribes List */}
          <div className={cn(
            "space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar transition-all",
            gameMode === 'locate' && "opacity-20 pointer-events-none grayscale"
          )}>
            {filteredTribes.map(tribe => (
              <motion.button
                key={tribe.id}
                whileHover={{ x: 10 }}
                onClick={() => handleTribeClick(tribe)}
                className={cn(
                  "w-full p-6 rounded-3xl border-2 text-left transition-all group relative overflow-hidden",
                  selectedTribe?.id === tribe.id 
                    ? "bg-[#141414] border-[#141414] text-white" 
                    : "bg-white border-[#141414]/5 hover:border-[#141414]/20"
                )}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-2 inline-block",
                      selectedTribe?.id === tribe.id ? "bg-white/10 text-white/60" : "bg-[#141414]/5 text-[#141414]/40"
                    )}>
                      {tribe.continent}
                    </span>
                    <h3 className="text-xl font-black tracking-tight">
                      {t.tribes?.names?.[tribe.id] || tribe.name}
                    </h3>
                  </div>
                  <ArrowRight className={cn(
                    "w-5 h-5 transition-transform group-hover:translate-x-1",
                    selectedTribe?.id === tribe.id ? "text-white" : "text-[#141414]/20"
                  )} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Tribe Detail Modal */}
      <AnimatePresence>
        {selectedTribe && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#141414]/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-8 md:p-12 bg-[#141414] text-white relative">
                <button 
                  onClick={() => setSelectedTribe(null)}
                  className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white/60">
                      {selectedTribe.continent}
                    </span>
                  </div>
                  <h2 className="text-5xl font-black tracking-tight">
                    {t.tribes?.names?.[selectedTribe.id] || selectedTribe.name}
                  </h2>
                  <p className="text-xl text-white/60 font-medium max-w-2xl">
                    {selectedTribe.summary}
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mt-12">
                  {[
                    { id: 'info', label: t.tribes?.infoTab || "Fiche d'identité", icon: <Info className="w-4 h-4" /> },
                    { id: 'history', label: t.tribes?.historyTab || "Histoire & Contexte", icon: <History className="w-4 h-4" /> },
                    { id: 'quiz', label: t.tribes?.quizTab || "Quiz", icon: <Brain className="w-4 h-4" /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all",
                        activeTab === tab.id 
                          ? "bg-white text-[#141414]" 
                          : "bg-white/10 text-white/60 hover:bg-white/20"
                      )}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-[#F5F5F0]">
                <AnimatePresence mode="wait">
                  {activeTab === 'info' && (
                    <motion.div 
                      key="info"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-12"
                    >
                      <div className="space-y-8">
                        <section className="space-y-4">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#141414]/40">{t.tribes?.habitat || "Habitat"}</h4>
                          <p className="text-lg font-bold text-[#141414]">{selectedTribe.habitat}</p>
                        </section>
                        <section className="space-y-4">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#141414]/40">{t.tribes?.language || "Langue"}</h4>
                          <p className="text-lg font-bold text-[#141414]">{selectedTribe.language}</p>
                        </section>
                        <section className="space-y-4">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#141414]/40">{t.tribes?.religion || "Religion"}</h4>
                          <p className="text-lg font-bold text-[#141414]">{selectedTribe.religion}</p>
                        </section>
                      </div>
                      <div className="space-y-8">
                        <section className="space-y-4">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#141414]/40">{t.tribes?.traditions || "Traditions"}</h4>
                          <ul className="space-y-3">
                            {selectedTribe.traditions.map((trad, i) => (
                              <li key={i} className="flex items-center gap-3 font-bold text-[#141414]">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                {trad}
                              </li>
                            ))}
                          </ul>
                        </section>
                        <section className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-100 space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-widest text-amber-600/60">{t.tribes?.anecdote || "Anecdote"}</h4>
                          <p className="font-bold text-amber-900 leading-relaxed italic">"{selectedTribe.anecdote}"</p>
                        </section>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'history' && (
                    <motion.div 
                      key="history"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-12"
                    >
                      <section className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-[#141414]/40">{t.tribes?.history || "Histoire"}</h4>
                        <div className="prose prose-slate max-w-none prose-p:text-lg prose-p:font-medium prose-p:text-[#141414]/80 prose-p:leading-relaxed">
                          <Markdown>{selectedTribe.history}</Markdown>
                        </div>
                      </section>
                      <section className="p-8 bg-rose-50 rounded-[2rem] border-2 border-rose-100 space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-rose-600/60">{t.tribes?.colonization || "Colonisation & Enjeux"}</h4>
                        <div className="prose prose-rose max-w-none prose-p:text-lg prose-p:font-bold prose-p:text-rose-900 prose-p:leading-relaxed">
                          <Markdown>{selectedTribe.colonization}</Markdown>
                        </div>
                      </section>
                    </motion.div>
                  )}

                  {activeTab === 'quiz' && (
                    <motion.div 
                      key="quiz"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="max-w-2xl mx-auto"
                    >
                      {!quizState.showResults ? (
                        <div className="space-y-8">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black uppercase tracking-widest text-[#141414]/40">
                              Question {quizState.currentIndex + 1} / {selectedTribe.quiz.length}
                            </h4>
                            <div className="flex gap-1">
                              {selectedTribe.quiz.map((_, i) => (
                                <div 
                                  key={i} 
                                  className={cn(
                                    "w-8 h-1.5 rounded-full transition-colors",
                                    i === quizState.currentIndex ? "bg-[#141414]" : 
                                    i < quizState.currentIndex ? "bg-emerald-500" : "bg-[#141414]/10"
                                  )}
                                />
                              ))}
                            </div>
                          </div>

                          <h3 className="text-3xl font-black tracking-tight text-[#141414]">
                            {selectedTribe.quiz[quizState.currentIndex].text}
                          </h3>

                          <div className="grid grid-cols-1 gap-4">
                            {selectedTribe.quiz[quizState.currentIndex].options?.map((option, i) => (
                              <button
                                key={i}
                                onClick={() => handleAnswer(option)}
                                disabled={!!quizState.feedback}
                                className={cn(
                                  "p-6 rounded-2xl border-2 text-left font-bold transition-all",
                                  quizState.answers[selectedTribe.quiz[quizState.currentIndex].id] === option
                                    ? (option === selectedTribe.quiz[quizState.currentIndex].correctAnswer ? "bg-emerald-500 border-emerald-500 text-white" : "bg-rose-500 border-rose-500 text-white")
                                    : "bg-white border-[#141414]/5 hover:border-[#141414]/20"
                                )}
                              >
                                {option}
                              </button>
                            ))}
                          </div>

                          {quizState.feedback && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                "p-6 rounded-2xl border-2 flex items-center justify-between",
                                quizState.feedback.isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"
                              )}
                            >
                              <div className="flex items-center gap-3 font-bold">
                                {quizState.feedback.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                {quizState.feedback.message}
                              </div>
                              <button 
                                onClick={nextQuestion}
                                className="px-6 py-2 bg-[#141414] text-white rounded-xl font-bold text-sm"
                              >
                                {quizState.currentIndex === selectedTribe.quiz.length - 1 ? "Voir le score" : "Suivant"}
                              </button>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center space-y-8 py-12">
                          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                            <Brain className="w-12 h-12" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-4xl font-black tracking-tight">Quiz Terminé !</h3>
                            <p className="text-xl font-bold text-[#141414]/40">Tu as obtenu {score} / {selectedTribe.quiz.length}</p>
                          </div>
                          <button 
                            onClick={() => setSelectedTribe(null)}
                            className="px-10 py-4 bg-[#141414] text-white rounded-2xl font-bold hover:scale-105 transition-transform"
                          >
                            Continuer l'exploration
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-white border-t border-[#141414]/5 flex items-center justify-between">
                <button 
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
                  onClick={() => window.open(`https://www.google.com/search?q=${selectedTribe.name}+tribe+history`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.tribes?.deepenWithAI || "Approfondir avec l'IA"}
                </button>
                <p className="text-xs font-bold text-[#141414]/20 uppercase tracking-widest">
                  Module Tribus du Monde • RevisAI
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
