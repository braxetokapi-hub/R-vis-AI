/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  GraduationCap, 
  BrainCircuit, 
  Trophy, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  Timer,
  Loader2,
  Calculator,
  Languages,
  Atom,
  History,
  FlaskConical,
  Library,
  Music,
  TrendingUp,
  Cpu,
  Globe,
  Medal,
  Star,
  Zap,
  Award,
  BookOpenCheck,
  LayoutDashboard,
  FileText,
  Download,
  Plus,
  ArrowLeft,
  AlertCircle,
  Play,
  PenTool,
  Flag,
  Check,
  Info,
  Target,
  ListTodo,
  Calendar,
  Printer,
  Lightbulb,
  Volume2,
  Pause,
  FastForward,
  Printer as PrinterIcon
} from 'lucide-react';
import { Subject, Level, Mode, Question, QuizState, Badge, LeaderboardEntry, RevisionSheet, Language, DailyChallenge, DailyChallengeProgress, OnboardingState, UserStats, Unit, Lesson, LessonStepContent, StudyPlan } from './types';
import { generateQuestions, verifyOpenAnswer, getTopics, getDetailedFeedback, generateRevisionSheet, generateInitialTest, generateLessonCatalogue, generateLessonStep, generateQuestionImages, generateStudyPlan as apiGenerateStudyPlan } from './services/geminiService';
import * as geminiService from './services/geminiService';
import { cn } from './lib/utils';
import Markdown from 'react-markdown';
import { translations } from './translations';
import { DAILY_CHALLENGES } from './constants';
import confetti from 'canvas-confetti';
import { TribesModule } from './components/TribesModule';
import { AudioActivity } from './components/AudioActivity';

const SUBJECTS: { name: Subject; icon: React.ReactNode; color: string; levels: Level[] }[] = [
  { name: 'Mathématiques', icon: <Calculator className="w-6 h-6" />, color: 'bg-blue-500', levels: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
  { name: 'Français', icon: <Library className="w-6 h-6" />, color: 'bg-rose-500', levels: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
  { name: 'Histoire-Géo', icon: <History className="w-6 h-6" />, color: 'bg-amber-500', levels: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
  { name: 'Physique-Chimie', icon: <FlaskConical className="w-6 h-6" />, color: 'bg-purple-500', levels: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
  { name: 'SVT', icon: <Atom className="w-6 h-6" />, color: 'bg-emerald-500', levels: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
  { name: 'Sciences', icon: <Atom className="w-6 h-6" />, color: 'bg-emerald-600', levels: ['6ème', '5ème', '4ème', '3ème'] },
  { name: 'Anglais', icon: <Languages className="w-6 h-6" />, color: 'bg-indigo-500', levels: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
  { name: 'Philosophie', icon: <BrainCircuit className="w-6 h-6" />, color: 'bg-slate-700', levels: ['Terminale'] },
  { name: 'S.E.S', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-orange-500', levels: ['Seconde', 'Première', 'Terminale'] },
  { name: 'Espagnol', icon: <Globe className="w-6 h-6" />, color: 'bg-red-600', levels: ['5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
  { name: 'Allemand', icon: <Globe className="w-6 h-6" />, color: 'bg-yellow-600', levels: ['5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
  { name: 'Italien', icon: <Globe className="w-6 h-6" />, color: 'bg-green-600', levels: ['5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
  { name: 'Arabe', icon: <Globe className="w-6 h-6" />, color: 'bg-emerald-700', levels: ['5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
  { name: 'Technologie', icon: <Cpu className="w-6 h-6" />, color: 'bg-cyan-600', levels: ['6ème', '5ème', '4ème', '3ème'] },
  { name: 'Musique', icon: <Music className="w-6 h-6" />, color: 'bg-pink-500', levels: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
  { name: 'EMC', icon: <GraduationCap className="w-6 h-6" />, color: 'bg-indigo-700', levels: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
  { name: 'Culture Générale', icon: <Globe className="w-6 h-6" />, color: 'bg-emerald-600', levels: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] },
];

const LEVELS: { name: Level; category: 'Collège' | 'Lycée' }[] = [
  { name: '6ème', category: 'Collège' },
  { name: '5ème', category: 'Collège' },
  { name: '4ème', category: 'Collège' },
  { name: '3ème', category: 'Collège' },
  { name: 'Seconde', category: 'Lycée' },
  { name: 'Première', category: 'Lycée' },
  { name: 'Terminale', category: 'Lycée' },
];

const BADGE_TYPES = [
  { id: 'perfect', name: 'Sans Faute', description: 'Réussir un quiz avec 100% de bonnes réponses.', icon: <Star className="w-6 h-6 text-amber-500" /> },
  { id: 'expert', name: 'Expert du Thème', description: 'Compléter 3 quiz sur le même thème.', icon: <Award className="w-6 h-6 text-purple-500" /> },
  { id: 'speed', name: 'Éclair', description: 'Répondre correctement en moins de 10 secondes.', icon: <Zap className="w-6 h-6 text-blue-500" /> },
  { id: 'marathon', name: 'Marathonien', description: 'Compléter un quiz de 30 questions.', icon: <Medal className="w-6 h-6 text-emerald-500" /> },
];

export default function App() {
  const [step, setStep] = useState<'landing' | 'onboarding' | 'setup' | 'quiz' | 'results' | 'revision_sheet' | 'lesson' | 'dashboard' | 'tribes' | 'study_plan'>('landing');
  const [level, setLevel] = useState<Level>('3ème');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [mode, setMode] = useState<Mode | 'Fiche'>('Révision');
  const [topic, setTopic] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [topics, setTopics] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [userAnswer, setUserAnswer] = useState<any>('');
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matchingMatches, setMatchingMatches] = useState<Record<string, string>>({});
  const [shuffledTerms, setShuffledTerms] = useState<string[]>([]);
  const [shuffledDefinitions, setShuffledDefinitions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [failedQuestions, setFailedQuestions] = useState<Question[]>([]);
  const [revisionSheets, setRevisionSheets] = useState<RevisionSheet[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [currentSheet, setCurrentSheet] = useState<RevisionSheet | null>(null);
  const [language, setLanguage] = useState<Language>('Français');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; onConfirm: () => void } | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyChallengeProgress | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async (text: string) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setLoading(true);
      const { generateSpeech } = await import('./services/geminiService');
      const base64 = await generateSpeech(text, language);
      if (base64) {
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audio.playbackRate = playbackRate;
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback failed", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlaybackRate = () => {
    const nextRate = playbackRate === 1 ? 0.75 : (playbackRate === 0.75 ? 0.5 : 1);
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const [onboarding, setOnboarding] = useState<OnboardingState>({
    step: 'name',
    name: '',
    level: '3ème',
    prioritySubject: 'Mathématiques',
    testScore: 0,
    recommendedLessons: []
  });
  const [userStats, setUserStats] = useState<UserStats>({
    points: 0,
    streak: 0,
    bestStreak: 0,
    lastActive: new Date().toISOString(),
    mastery: {},
    badges: []
  });
  const [catalogue, setCatalogue] = useState<Unit[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonStep, setLessonStep] = useState(1);
  const [lessonContent, setLessonContent] = useState<LessonStepContent | null>(null);
  
  useEffect(() => {
    const savedStats = localStorage.getItem('revisai_stats');
    if (savedStats) setUserStats(JSON.parse(savedStats));
  }, []);

  useEffect(() => {
    if (quiz && quiz.questions[quiz.currentQuestionIndex].type === 'MATCHING') {
      const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
      if (currentQuestion.pairs) {
        const terms = currentQuestion.pairs.map(p => p.term);
        const definitions = currentQuestion.pairs.map(p => p.definition);
        setShuffledTerms([...terms].sort(() => Math.random() - 0.5));
        setShuffledDefinitions([...definitions].sort(() => Math.random() - 0.5));
      }
    }
  }, [quiz?.currentQuestionIndex, quiz?.questions]);
    
  useEffect(() => {
    const savedOnboarding = localStorage.getItem('revisai_onboarding');
    if (savedOnboarding) {
      const parsed = JSON.parse(savedOnboarding);
      setOnboarding(parsed);
      if (parsed.step === 'completed') setStep('dashboard');
    }
  }, []);

  const saveOnboarding = (updates: Partial<OnboardingState>) => {
    const newState = { ...onboarding, ...updates };
    setOnboarding(newState);
    localStorage.setItem('revisai_onboarding', JSON.stringify(newState));
  };

  const handleMatch = (term: string, definition: string) => {
    const newMatches = { ...matchingMatches, [term]: definition };
    setMatchingMatches(newMatches);
    setSelectedTerm(null);
    
    const currentQuestion = quiz!.questions[quiz!.currentQuestionIndex];
    if (currentQuestion.pairs && Object.keys(newMatches).length === currentQuestion.pairs.length) {
      const answerStr = Object.entries(newMatches)
        .map(([t, d]) => `${t}:${d}`)
        .sort()
        .join(', ');
      setUserAnswer(answerStr);
    }
  };

  const startInitialTest = async () => {
    setLoading(true);
    try {
      const questions = await generateInitialTest(onboarding.prioritySubject, onboarding.level, language);
      setQuiz({
        subject: onboarding.prioritySubject,
        level: onboarding.level,
        mode: 'Révision',
        topic: 'Test Initial',
        language,
        questions,
        currentQuestionIndex: 0,
        answers: {},
        isFinished: false,
        score: 0
      });
      saveOnboarding({ step: 'test' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = () => {
    saveOnboarding({ step: 'completed' });
    setStep('dashboard');
  };

  const startLesson = async (lesson: Lesson) => {
    setLoading(true);
    setCurrentLesson(lesson);
    setLessonStep(1);
    setFeedback(null);
    setUserAnswer('');
    try {
      const content = await generateLessonStep(lesson.title, 1, subject!, level, language);
      setLessonContent(content);
      setStep('lesson');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const nextLessonStep = async () => {
    if (!currentLesson) return;
    const nextStep = lessonStep + 1;
    if (nextStep > 6) {
      setStep('dashboard');
      return;
    }

    if (nextStep === 6) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
    }
    
    setLoading(true);
    setFeedback(null);
    setUserAnswer('');
    try {
      const content = await generateLessonStep(currentLesson.title, nextStep, subject!, level, language);
      setLessonContent(content);
      setLessonStep(nextStep);
      
      if (nextStep === 3 && content.listeningComprehension) {
        setQuiz({
          subject: subject!,
          level,
          mode: 'Révision',
          topic: currentLesson.title,
          language,
          questions: content.listeningComprehension.questions,
          currentQuestionIndex: 0,
          answers: {},
          isFinished: false,
          score: 0
        });
      }

      if (nextStep === 5 && content.quiz) {
        setQuiz({
          subject: subject!,
          level,
          mode: 'Révision',
          topic: currentLesson.title,
          language,
          questions: content.quiz,
          currentQuestionIndex: 0,
          answers: {},
          isFinished: false,
          score: 0
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const DashboardView = () => (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight">Bonjour, {onboarding.name} ! 👋</h2>
          <p className="text-[#141414]/60">{t.footerTagline}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#141414]/5 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Streak</p>
              <p className="font-bold">{userStats.streak} jours</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#141414]/5 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Points</p>
              <p className="font-bold">{userStats.points} pts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-[#141414]/5 shadow-xl space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <BookOpenCheck className="w-6 h-6 text-blue-600" />
              {t.onboarding.recommendedPath}
            </h3>
            <div className="space-y-4">
              {catalogue.length === 0 ? (
                <button 
                  onClick={async () => {
                    setLoading(true);
                    const units = await generateLessonCatalogue(onboarding.prioritySubject, onboarding.level, language);
                    setCatalogue(units);
                    setLoading(false);
                  }}
                  className="w-full py-8 border-2 border-dashed border-[#141414]/10 rounded-2xl text-[#141414]/40 font-bold hover:border-[#141414]/30 hover:text-[#141414] transition-all"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Charger mon catalogue de leçons"}
                </button>
              ) : (
                catalogue[0].lessons.map((lesson, i) => (
                  <motion.div 
                    key={lesson.id}
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-4 bg-[#F5F5F0]/50 rounded-2xl group cursor-pointer"
                    onClick={() => startLesson(lesson)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                        lesson.status === 'ACQUIRED' ? "bg-emerald-500 text-white" : "bg-white text-[#141414]"
                      )}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold">{lesson.title}</p>
                        <p className="text-xs text-[#141414]/40">{lesson.duration} • {t.lesson.mastery[lesson.status]}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#141414]/20 group-hover:text-[#141414] transition-all" />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#141414] text-white p-8 rounded-[2rem] shadow-xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Défis du jour
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">Maths</p>
                <p className="text-sm font-medium">Réussir 5 calculs mentaux</p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-1/2" />
                </div>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">Général</p>
                <p className="text-sm font-medium">Connecté 3 jours de suite</p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-[#141414]/5 shadow-xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Medal className="w-6 h-6 text-purple-600" />
              {t.myRewards}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-[#F5F5F0] rounded-xl flex items-center justify-center text-[#141414]/20">
                  <Award className="w-6 h-6" />
                </div>
              ))}
            </div>
          </div>

          {/* General Culture Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 px-2">
              <Globe className="w-6 h-6 text-emerald-600" />
              {t.generalCulture || "Culture Générale"}
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep('tribes')}
              className="w-full p-8 bg-emerald-600 text-white rounded-[2rem] shadow-xl space-y-4 text-left group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform" />
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{t.tribes?.title || "Tribus du Monde"}</h3>
              </div>
              <p className="text-sm text-white/80 font-medium">
                {t.tribes?.subtitle || "Explorez les cultures ancestrales et les peuples autochtones."}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest pt-2">
                <span>Explorer maintenant</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
  const OnboardingView = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-8 bg-white rounded-[2rem] border border-[#141414]/5 shadow-2xl space-y-8"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">{t.onboarding.welcome}</h2>
      </div>

      {onboarding.step === 'name' && (
        <div className="space-y-6">
          <label className="text-lg font-bold block text-center">{t.onboarding.askName}</label>
          <input
            type="text"
            autoFocus
            className="w-full p-6 rounded-2xl border-2 border-[#141414]/10 bg-[#F5F5F0]/50 focus:border-[#141414] focus:bg-white outline-none transition-all text-center text-2xl font-bold"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                saveOnboarding({ name: e.currentTarget.value, step: 'level' });
              }
            }}
          />
        </div>
      )}

      {onboarding.step === 'level' && (
        <div className="space-y-6">
          <label className="text-lg font-bold block text-center">{t.onboarding.askLevel}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['CM2', '6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'].map((l) => (
              <motion.button
                key={l}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => saveOnboarding({ level: l as Level, step: 'subject' })}
                className="p-4 rounded-xl border-2 border-[#141414]/10 hover:border-[#141414] font-bold"
              >
                {l}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {onboarding.step === 'subject' && (
        <div className="space-y-6">
          <label className="text-lg font-bold block text-center">{t.onboarding.askSubject}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUBJECTS.filter(s => s.levels.includes(onboarding.level)).map((s) => (
              <motion.button
                key={s.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => saveOnboarding({ prioritySubject: s.name, step: 'test' })}
                className="p-4 rounded-xl border-2 border-[#141414]/10 hover:border-[#141414] font-bold flex flex-col items-center gap-2"
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", s.color)}>
                  {s.icon}
                </div>
                <span className="text-xs">{t.subjects[s.name as keyof typeof t.subjects] || s.name}</span>
              </motion.button>
            ))}
          </div>
          <div className="pt-4">
            <button 
              onClick={startInitialTest}
              className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.onboarding.startTest}
            </button>
          </div>
        </div>
      )}

      {onboarding.step === 'test' && quiz && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#141414]/40">
            <span>Question {quiz.currentQuestionIndex + 1}/10</span>
            <span>{onboarding.prioritySubject}</span>
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center">{quiz.questions[quiz.currentQuestionIndex].text}</h3>
            <div className="grid gap-3">
              {quiz.questions[quiz.currentQuestionIndex].options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const isCorrect = opt === quiz.questions[quiz.currentQuestionIndex].correctAnswer;
                    const newScore = isCorrect ? quiz.score + 1 : quiz.score;
                    if (quiz.currentQuestionIndex < 9) {
                      setQuiz({ ...quiz, currentQuestionIndex: quiz.currentQuestionIndex + 1, score: newScore });
                    } else {
                      saveOnboarding({ step: 'result', testScore: newScore });
                    }
                  }}
                  className="p-4 rounded-xl border-2 border-[#141414]/10 hover:border-[#141414] font-medium text-left transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {onboarding.step === 'result' && (
        <div className="text-center space-y-8">
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-widest text-[#141414]/40">{t.onboarding.resultTitle}</p>
            <h3 className="text-4xl font-black">
              {onboarding.testScore >= 7 ? t.onboarding.advanced : onboarding.testScore >= 4 ? t.onboarding.intermediate : t.onboarding.beginner}
            </h3>
            <p className="text-[#141414]/60">Score : {onboarding.testScore}/10</p>
          </div>
          
          <div className="p-6 bg-[#F5F5F0] rounded-3xl space-y-4 text-left">
            <p className="font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              {t.onboarding.recommendedPath}
            </p>
            <ul className="space-y-2">
              {['Les bases de la matière', 'Consolidation des acquis', 'Approfondissement', 'Préparation examen', 'Maîtrise totale'].map((l, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium">
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold">{i+1}</span>
                  {l}
                </li>
              ))}
            </ul>
          </div>

          <button 
            onClick={completeOnboarding}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
          >
            {t.onboarding.startPath} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </motion.div>
  );

  const LessonView = () => {
    if (!currentLesson || !lessonContent) return null;

    const steps = [
      { id: 1, label: t.lesson.video, icon: <Play className="w-4 h-4" /> },
      { id: 2, label: t.lesson.summary, icon: <FileText className="w-4 h-4" /> },
      { id: 3, label: t.lesson.listeningComprehension, icon: <Volume2 className="w-4 h-4" /> },
      { id: 4, label: t.lesson.exercises, icon: <PenTool className="w-4 h-4" /> },
      { id: 5, label: t.lesson.quiz, icon: <CheckCircle2 className="w-4 h-4" /> },
      { id: 6, label: t.lesson.bilan, icon: <Flag className="w-4 h-4" /> }
    ];

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setStep('dashboard')}
            className="p-2 hover:bg-[#141414]/5 rounded-full transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">{currentLesson.subject}</p>
            <h2 className="text-xl font-bold">{currentLesson.title}</h2>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex items-center justify-between px-4">
          {steps.map((s, i) => {
            const isCompleted = steps.findIndex(st => st.id === lessonStep) > i;
            const isActive = s.id === lessonStep;
            return (
              <div key={s.id} className="flex flex-col items-center gap-2 relative">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all z-10",
                  isCompleted ? "bg-emerald-500 text-white" : isActive ? "bg-[#141414] text-white" : "bg-white border-2 border-[#141414]/10 text-[#141414]/40"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : s.icon}
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-tighter", isActive ? "text-[#141414]" : "text-[#141414]/20")}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className="absolute top-5 left-10 w-[calc(100%+2rem)] h-[2px] bg-[#141414]/5 -z-0" />
                )}
              </div>
            );
          })}
        </div>

        <motion.div 
          key={lessonStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2rem] border border-[#141414]/5 shadow-2xl min-h-[400px] flex flex-col"
        >
          <div className="flex-1 space-y-6">
            {lessonStep === 1 && (
              <div className="space-y-6">
                <div className="aspect-video bg-[#141414] rounded-3xl flex items-center justify-center text-white/20 overflow-hidden relative group">
                  <Play className="w-16 h-16 group-hover:scale-110 transition-all" />
                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/40 backdrop-blur-md rounded-xl text-xs text-white/80">
                    {lessonContent.videoDescription}
                  </div>
                </div>
                <div className="p-6 bg-[#F5F5F0] rounded-2xl">
                  <h4 className="font-bold mb-2">{t.lesson.videoPoints}:</h4>
                  <ul className="space-y-2 text-sm">
                    {lessonContent.summary.keyPoints.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {lessonStep === 2 && (
              <div className="prose prose-slate max-w-none">
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 mb-6">
                  <h4 className="text-blue-900 font-bold flex items-center gap-2 m-0">
                    <Info className="w-5 h-5" />
                    {t.lesson.toRemember}
                  </h4>
                  <p className="text-blue-800 m-0 mt-2">{lessonContent.summary.mainRule}</p>
                </div>
                <div className="markdown-body">
                  <Markdown>{lessonContent.summary.content}</Markdown>
                </div>
              </div>
            )}

            {lessonStep === 3 && lessonContent.listeningComprehension && (
              <div className="space-y-8">
                <div className="p-6 bg-[#F5F5F0] rounded-3xl border border-[#141414]/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-blue-500" />
                      {t.lesson.listeningComprehension}
                    </h4>
                  </div>
                  
                  <div className="flex flex-col items-center gap-4 py-4">
                    <button
                      onClick={() => {
                        if (lessonContent.listeningComprehension?.audioUrl) {
                          const audio = new Audio(lessonContent.listeningComprehension.audioUrl);
                          audio.play();
                        }
                      }}
                      className="w-16 h-16 bg-[#141414] text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                    >
                      <Play className="w-8 h-8 ml-1" />
                    </button>
                    <p className="text-sm text-[#141414]/60 font-medium">{t.audioActivities.listenToAudio}</p>
                  </div>

                  <div className="space-y-6">
                    {lessonContent.listeningComprehension.questions.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-4 p-4 bg-white rounded-2xl border border-[#141414]/5">
                        <p className="font-bold text-sm">{q.text}</p>
                        <div className="grid gap-2">
                          {q.options?.map((opt, oIdx) => {
                            const isAnswered = quiz?.answers?.[`lc_${qIdx}`] !== undefined;
                            const isSelected = quiz?.answers?.[`lc_${qIdx}`] === opt;
                            const isCorrect = opt === q.correctAnswer;
                            
                            return (
                              <button
                                key={oIdx}
                                disabled={isAnswered}
                                onClick={() => {
                                  if (quiz) {
                                    const newAnswers = { ...quiz.answers, [`lc_${qIdx}`]: opt };
                                    const newScore = isCorrect ? quiz.score + 1 : quiz.score;
                                    setQuiz({ ...quiz, answers: newAnswers, score: newScore });
                                  }
                                }}
                                className={cn(
                                  "p-3 rounded-xl border-2 text-sm font-medium text-left transition-all",
                                  !isAnswered ? "border-[#141414]/10 hover:border-[#141414]" :
                                  isSelected ? (isCorrect ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50") :
                                  (isCorrect ? "border-emerald-500/30" : "border-[#141414]/5 opacity-50")
                                )}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {lessonStep === 4 && (
              <div className="space-y-8">
                {lessonContent.exercises.map((ex, i) => (
                  <div key={i} className="p-6 bg-[#F5F5F0]/50 rounded-3xl border border-[#141414]/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Exercice {i+1}</span>
                      <span className="px-2 py-1 bg-white rounded-lg text-[10px] font-bold">{ex.difficulty}</span>
                    </div>
                    <p className="font-bold">{ex.question}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setConfirmModal({ isOpen: true, title: `Indice : ${ex.hint}`, onConfirm: () => setConfirmModal(null) })}
                        className="px-4 py-2 bg-white rounded-xl text-xs font-bold border border-[#141414]/5"
                      >
                        {t.lesson.hint}
                      </button>
                      <button 
                        onClick={() => setConfirmModal({ isOpen: true, title: `Réponse : ${ex.answer}`, onConfirm: () => setConfirmModal(null) })}
                        className="px-4 py-2 bg-white rounded-xl text-xs font-bold border border-[#141414]/5"
                      >
                        {t.lesson.showAnswer}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {lessonStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#141414]/40">
                  <span>Question {(quiz?.currentQuestionIndex || 0) + 1}/{lessonContent.quiz?.length || 0}</span>
                </div>
                {quiz && quiz.questions && quiz.questions[quiz.currentQuestionIndex] && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-center">{quiz.questions[quiz.currentQuestionIndex].text}</h3>
                    <div className="grid gap-3">
                      {quiz.questions[quiz.currentQuestionIndex].options?.map((opt, i) => (
                        <button
                          key={i}
                          disabled={!!feedback || checking}
                          onClick={async () => {
                            const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
                            const isCorrect = opt === currentQuestion.correctAnswer;
                            setChecking(true);
                            setUserAnswer(opt);
                            
                            let aiFeedback = '';
                            if (isCorrect) {
                              aiFeedback = t.excellent;
                            } else {
                              const correctAnswer = currentQuestion.correctAnswer;
                              const correctStr = Array.isArray(correctAnswer) 
                                ? correctAnswer.join(', ') 
                                : correctAnswer.toString();
                              aiFeedback = await getDetailedFeedback(
                                currentQuestion.text, 
                                opt, 
                                correctStr, 
                                quiz.subject, 
                                quiz.level, 
                                language
                              );
                            }
                            
                            setFeedback({ isCorrect, message: aiFeedback });
                            setChecking(false);
                            
                            if (isCorrect) {
                              setQuiz({ ...quiz, score: quiz.score + 1 });
                            }
                          }}
                          className={cn(
                            "p-4 rounded-xl border-2 font-medium text-left transition-all",
                            !feedback ? "border-[#141414]/10 hover:border-[#141414]" :
                            opt === quiz.questions[quiz.currentQuestionIndex].correctAnswer ? "border-emerald-500 bg-emerald-50" :
                            opt === userAnswer ? "border-rose-500 bg-rose-50" : "border-[#141414]/5 opacity-50"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {checking && (
                      <div className="flex items-center justify-center gap-2 text-sm text-[#141414]/40 italic">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t.analyzing}
                      </div>
                    )}

                    <AnimatePresence>
                      {feedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-6 rounded-2xl border-2 space-y-4 shadow-lg",
                            feedback.isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                          )}
                        >
                          <div className="flex items-center justify-between font-bold text-lg">
                            <div className="flex items-center gap-2">
                              {feedback.isCorrect ? <CheckCircle2 className="text-emerald-600 w-6 h-6" /> : <XCircle className="text-rose-600 w-6 h-6" />}
                              {feedback.isCorrect ? (language === 'Français' ? "Excellent !" : (language === 'English' ? "Excellent!" : "¡Excelente!")) : t.aiAnalysis}
                            </div>
                          </div>
                          <div className="text-base leading-relaxed prose prose-slate max-w-none text-[#141414]/80">
                            <Markdown>{feedback.message}</Markdown>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setFeedback(null);
                                setUserAnswer('');
                                const nextIdx = quiz.currentQuestionIndex + 1;
                                if (nextIdx < quiz.questions.length) {
                                  setQuiz({ ...quiz, currentQuestionIndex: nextIdx });
                                } else {
                                  setQuiz({ ...quiz, isFinished: true });
                                  nextLessonStep();
                                }
                              }}
                              className="px-6 py-2 bg-[#141414] text-white rounded-xl font-bold text-sm hover:scale-105 transition-all"
                            >
                              {quiz.currentQuestionIndex === quiz.questions.length - 1 ? t.lesson.finishLesson : t.nextQuestion}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {lessonStep === 6 && (
              <div className="text-center space-y-8 py-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <Trophy className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black">Leçon terminée !</h3>
                  <p className="text-[#141414]/60">Tu as maîtrisé ce sujet avec brio.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="p-4 bg-[#F5F5F0] rounded-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Points gagnés</p>
                    <p className="text-xl font-bold">+50</p>
                  </div>
                  <div className="p-4 bg-[#F5F5F0] rounded-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Mastery</p>
                    <p className="text-xl font-bold">100%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 flex justify-end">
            {lessonStep !== 5 && (
              <button 
                onClick={nextLessonStep}
                className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
              >
                {lessonStep === 6 ? t.lesson.finishLesson : t.lesson.nextStep}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  const t = translations[language];

  useEffect(() => {
    const isTimerMode = quiz?.mode === 'Examen' || quiz?.mode === 'Compétition';
    let interval: any;
    if (step === 'quiz' && quiz && isTimerMode && quiz.timeLeft !== undefined && quiz.timeLeft > 0 && !feedback) {
      interval = setInterval(() => {
        setQuiz(prev => {
          if (!prev || prev.timeLeft === undefined || prev.timeLeft <= 0) return prev;
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else if (quiz?.timeLeft === 0 && step === 'quiz') {
      setStep('results');
    }
    return () => clearInterval(interval);
  }, [step, quiz?.timeLeft, quiz?.mode, feedback]);

  useEffect(() => {
    const savedBadges = localStorage.getItem('revisai_badges');
    if (savedBadges) setBadges(JSON.parse(savedBadges));

    const savedLeaderboard = localStorage.getItem('revisai_leaderboard');
    if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));

    const savedErrors = localStorage.getItem('revisai_errors');
    if (savedErrors) setFailedQuestions(JSON.parse(savedErrors));

    const savedSheets = localStorage.getItem('revisai_sheets');
    if (savedSheets) setRevisionSheets(JSON.parse(savedSheets));

    // Daily Challenge Initialization
    const today = new Date().toISOString().split('T')[0];
    const savedProgress = localStorage.getItem('revisai_daily_progress');
    const progress: DailyChallengeProgress | null = savedProgress ? JSON.parse(savedProgress) : null;

    const challengeIndex = new Date().getDate() % DAILY_CHALLENGES.length;
    const challenge = DAILY_CHALLENGES[challengeIndex];
    setDailyChallenge(challenge);

    if (progress && progress.date === today && progress.challengeId === challenge.id) {
      setDailyProgress(progress);
    } else {
      const newProgress = {
        challengeId: challenge.id,
        date: today,
        currentValue: 0,
        isCompleted: false
      };
      setDailyProgress(newProgress);
      localStorage.setItem('revisai_daily_progress', JSON.stringify(newProgress));
    }
  }, []);

  const checkDailyChallenge = (type: DailyChallenge['type'], value: number, quizSubject?: Subject, timeTaken?: number) => {
    if (!dailyChallenge || !dailyProgress || dailyProgress.isCompleted) return;

    let updatedValue = dailyProgress.currentValue;
    let isCompleted = false;

    if (dailyChallenge.type === type) {
      if (dailyChallenge.subject && dailyChallenge.subject !== quizSubject) return;

      if (type === 'correct_answers') {
        updatedValue += value;
      } else if (type === 'speed') {
        if (timeTaken !== undefined && dailyChallenge.timeLimit !== undefined && timeTaken <= dailyChallenge.timeLimit) {
          updatedValue += value;
        }
      } else if (type === 'subject_mastery') {
        updatedValue = Math.max(updatedValue, value);
      }

      if (updatedValue >= dailyChallenge.target) {
        isCompleted = true;
        updatedValue = dailyChallenge.target;
      }

      const newProgress = { ...dailyProgress, currentValue: updatedValue, isCompleted };
      setDailyProgress(newProgress);
      localStorage.setItem('revisai_daily_progress', JSON.stringify(newProgress));

      if (isCompleted) {
        celebrateChallenge();
        if (dailyChallenge.badgeId) saveBadge(dailyChallenge.badgeId);
        if (step === 'quiz' && quiz) {
          setQuiz(prev => prev ? { ...prev, score: prev.score + dailyChallenge.rewardPoints } : null);
        }
      }
    }
  };

  const saveBadge = (badgeId: string) => {
    const badgeType = t.badges[badgeId as keyof typeof t.badges];
    if (!badgeType || badges.some(b => b.id === badgeId)) return;

    const badge: Badge = {
      id: badgeId,
      name: badgeType.name,
      description: badgeType.desc,
      icon: badgeId,
      dateEarned: new Date().toLocaleDateString(),
    };

    const updated = [...badges, badge];
    setBadges(updated);
    localStorage.setItem('revisai_badges', JSON.stringify(updated));
    setNewBadge(badge);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b']
    });
    setTimeout(() => setNewBadge(null), 5000);
  };

  const celebrateChallenge = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const fetchTopics = async (s: Subject) => {
    setLoadingTopics(true);
    setTopic(null);
    try {
      const topics = await getTopics(s, level, language);
      setTopics(topics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const startQuiz = async () => {
    if (!subject || !topic) return;

    if (subject === 'Culture Générale' && topic === 'Tribus du Monde') {
      setStep('tribes');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'Fiche') {
        const sheetData = await generateRevisionSheet(subject, level, topic, language);
        const newSheet: RevisionSheet = {
          id: Math.random().toString(36).substr(2, 9),
          title: `${subject} - ${topic}`,
          subject,
          level,
          topic,
          content: sheetData.content,
          keyPoints: sheetData.keyPoints,
          language,
          dateCreated: new Date().toLocaleDateString(),
        };
        const updatedSheets = [newSheet, ...revisionSheets];
        setRevisionSheets(updatedSheets);
        localStorage.setItem('revisai_sheets', JSON.stringify(updatedSheets));
        setCurrentSheet(newSheet);
        setStep('revision_sheet');
        return;
      }

      let questions: Question[] = [];
      
      if (mode === 'Apprentissage') {
        const errors = failedQuestions.filter(q => q.subject === subject);
        if (errors.length > 0) {
          questions = errors.slice(0, 10); // Take up to 10 errors
        } else {
          // Fallback to normal if no errors
          const rawQuestions = await generateQuestions(subject, level, mode as Mode, topic, language);
          questions = await generateQuestionImages(rawQuestions);
        }
      } else {
        const rawQuestions = await generateQuestions(subject, level, mode as Mode, topic, language);
        questions = await generateQuestionImages(rawQuestions);
      }

      setQuiz({
        subject,
        level,
        mode: mode as Mode,
        topic,
        language,
        questions,
        currentQuestionIndex: 0,
        answers: {},
        isFinished: false,
        score: 0,
        timeLeft: mode === 'Examen' ? questions.length * 60 : (mode === 'Compétition' ? 60 : undefined),
      });
      setQuizStartTime(Date.now());
      setStep('quiz');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateStudyPlan = async (subj: Subject, lvl: Level, top: string) => {
    setLoading(true);
    try {
      const plan = await geminiService.generateStudyPlan(subj, lvl, top, language);
      setStudyPlan(plan);
      setStep('study_plan');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (overrideAnswer?: string, overrideEvaluation?: { score: number; feedback: string; recognizedText: string }) => {
    const finalAnswer = overrideAnswer !== undefined ? overrideAnswer : userAnswer;
    if (!quiz || (finalAnswer === '' && !overrideEvaluation)) return;
    
    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
    setChecking(true);

    let isCorrect = false;
    let aiFeedback = '';

    if (overrideEvaluation) {
      isCorrect = overrideEvaluation.score >= 70;
      aiFeedback = overrideEvaluation.feedback;
    } else if (currentQuestion.type === 'AUDIO_DICTATION' || currentQuestion.type === 'LISTENING_COMPREHENSION') {
      isCorrect = finalAnswer.toString().toLowerCase().trim() === currentQuestion.correctAnswer.toString().toLowerCase().trim();
      if (isCorrect) {
        aiFeedback = t.excellent;
      } else {
        aiFeedback = await getDetailedFeedback(currentQuestion.text, finalAnswer, currentQuestion.correctAnswer as string, quiz.subject, quiz.level, language);
      }
    } else if (currentQuestion.type === 'AUDIO_FLASHCARD' || currentQuestion.type === 'AUDIO_DIALOGUE') {
      isCorrect = true;
      aiFeedback = t.excellent;
    } else if (currentQuestion.type === 'MAP_INTERACTIVE') {
      isCorrect = finalAnswer.toString().toLowerCase().trim() === currentQuestion.correctAnswer.toString().toLowerCase().trim();
      const correctHotspot = currentQuestion.hotspots?.find(h => h.id === currentQuestion.correctAnswer);
      if (isCorrect) {
        aiFeedback = t.excellentMap;
      } else {
        const correctStr = Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(', ') : currentQuestion.correctAnswer.toString();
        aiFeedback = await getDetailedFeedback(currentQuestion.text, finalAnswer, correctStr, quiz.subject, quiz.level, language);
      }
    } else if (currentQuestion.type === 'MATCHING') {
      isCorrect = finalAnswer.toString().toLowerCase().trim() === currentQuestion.correctAnswer.toString().toLowerCase().trim();
      if (isCorrect) {
        aiFeedback = t.excellent;
      } else {
        aiFeedback = await getDetailedFeedback(currentQuestion.text, finalAnswer, currentQuestion.correctAnswer as string, quiz.subject, quiz.level, language);
      }
    } else if (['QCM', 'TRUE_FALSE', 'DEFINITION', 'CALCUL', 'IMAGE_ANALYSIS', 'FILL_BLANKS'].includes(currentQuestion.type)) {
      isCorrect = finalAnswer.toString().toLowerCase().trim() === currentQuestion.correctAnswer.toString().toLowerCase().trim();
      if (isCorrect) {
        aiFeedback = t.excellent;
      } else {
        const correctStr = Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(', ') : currentQuestion.correctAnswer.toString();
        aiFeedback = await getDetailedFeedback(currentQuestion.text, finalAnswer, correctStr, quiz.subject, quiz.level, language);
      }
    } else if (currentQuestion.type === 'OUVERTE') {
      const result = await verifyOpenAnswer(currentQuestion.text, finalAnswer, currentQuestion.correctAnswer as string, language);
      isCorrect = result.isCorrect;
      aiFeedback = result.feedback;
    } else if (currentQuestion.type === 'DRAG_DROP') {
      isCorrect = finalAnswer.toString().trim() === currentQuestion.correctAnswer.toString().trim();
      if (isCorrect) {
        aiFeedback = t.perfectOrder;
      } else {
        const correctStr = Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(', ') : currentQuestion.correctAnswer.toString();
        aiFeedback = await getDetailedFeedback(currentQuestion.text, finalAnswer, correctStr, quiz.subject, quiz.level, language);
      }
    }

    const isFrequentError = failedQuestions.some(q => q.id === currentQuestion.id);
    if (!isCorrect && isFrequentError) {
      aiFeedback = `⚠️ ${t.frequentError}\n\n${aiFeedback}`;
    }

    setFeedback({ isCorrect, message: aiFeedback });
    setChecking(false);

    if (isCorrect) {
      setQuiz(prev => prev ? { ...prev, score: prev.score + currentQuestion.points } : null);
      
      // Daily Challenge Progress
      if (quiz) {
        const timeTaken = quizStartTime ? (Date.now() - quizStartTime) / 1000 : 0;
        checkDailyChallenge('correct_answers', 1, quiz.subject);
        checkDailyChallenge('speed', 1, quiz.subject, timeTaken);
      }

      // Remove from failed questions if it was there
      if (mode === 'Apprentissage') {
        const updatedErrors = failedQuestions.filter(q => q.id !== currentQuestion.id);
        setFailedQuestions(updatedErrors);
        localStorage.setItem('revisai_errors', JSON.stringify(updatedErrors));
      }
    } else {
      // Add to failed questions
      const alreadyExists = failedQuestions.some(q => q.id === currentQuestion.id);
      if (!alreadyExists && quiz) {
        const updatedErrors = [...failedQuestions, { ...currentQuestion, subject: quiz.subject, topic: quiz.topic }];
        setFailedQuestions(updatedErrors);
        localStorage.setItem('revisai_errors', JSON.stringify(updatedErrors));
      }
    }
  };

  const nextQuestion = () => {
    if (!quiz) return;
    setFeedback(null);
    setUserAnswer('');
    setSelectedTerm(null);
    setMatchingMatches({});
    if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
      setQuiz(prev => prev ? { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 } : null);
    } else {
      const totalPoints = quiz.questions.reduce((acc, q) => acc + q.points, 0);
      if (quiz.score === totalPoints) saveBadge('perfect');
      if (quiz.questions.length >= 30) saveBadge('marathon');
      
      // Daily Challenge Progress (Subject Mastery)
      checkDailyChallenge('subject_mastery', quiz.questions.length, quiz.subject);

      if (quiz.mode === 'Compétition') {
        const entry: LeaderboardEntry = {
          username: username || t.anonymousPlayer,
          score: quiz.score,
          subject: quiz.subject,
          date: new Date().toLocaleDateString(),
        };
        const updatedLeaderboard = [...leaderboard, entry].sort((a, b) => b.score - a.score).slice(0, 10);
        setLeaderboard(updatedLeaderboard);
        localStorage.setItem('revisai_leaderboard', JSON.stringify(updatedLeaderboard));
      }
      
      setStep('results');
    }
  };

  const reset = () => {
    setStep('landing');
    setSubject(null);
    setQuiz(null);
    setFeedback(null);
    setUserAnswer('');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans selection:bg-emerald-200">
      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="absolute inset-0 bg-[#141414]/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-6"
            >
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">{confirmModal.title}</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-3 px-6 rounded-2xl font-bold text-[#141414]/60 hover:bg-gray-100 transition-colors"
                >
                  {language === 'Français' ? 'Annuler' : (language === 'English' ? 'Cancel' : 'Cancelar')}
                </button>
                <button 
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-3 px-6 rounded-2xl font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                >
                  {language === 'Français' ? 'Confirmer' : (language === 'English' ? 'Confirm' : 'Confirmar')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Badge Notification */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-white border-2 border-amber-500 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-amber-600 tracking-widest">{t.newBadge}</p>
              <p className="font-bold text-lg">{newBadge.name}</p>
              <p className="text-xs text-[#141414]/60">{newBadge.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-[#141414]/10 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-8 h-8 bg-[#141414] rounded-lg flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Révis'AI</span>
          </div>
          {quiz ? (
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="px-3 py-1 bg-white border border-[#141414]/10 rounded-full hidden md:inline-block">
                {quiz.subject} • {quiz.level}
              </span>
              <span className="px-3 py-1 bg-[#141414]/5 rounded-full text-xs max-w-[200px] truncate">
                {quiz.topic}
              </span>
              <span className="text-[#141414]/50">
                {quiz.currentQuestionIndex + 1}/{quiz.questions.length}
              </span>
              {quiz.mode === 'Examen' && quiz.timeLeft !== undefined && (
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold",
                  quiz.timeLeft < 60 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-blue-100 text-blue-600"
                )}>
                  <Timer className="w-4 h-4" />
                  {Math.floor(quiz.timeLeft / 60)}:{(quiz.timeLeft % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {badges.slice(0, 3).map((b, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-[#F5F5F0] flex items-center justify-center shadow-sm" title={b.name}>
                    {BADGE_TYPES.find(bt => bt.id === b.id)?.icon}
                  </div>
                ))}
                {badges.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-[#141414] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#F5F5F0]">
                    +{badges.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 ml-4">
            <Globe className="w-4 h-4 text-[#141414]/40" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none cursor-pointer hover:text-emerald-600 transition-colors"
            >
              <option value="Français">FR</option>
              <option value="English">EN</option>
              <option value="Español">ES</option>
              <option value="Deutsch">DE</option>
              <option value="Italiano">IT</option>
              <option value="العربية">AR</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-6xl font-bold tracking-tighter sm:text-7xl">
                  {t.studySmarter.split(' ').slice(0, -1).join(' ')}{' '}
                  <span className="italic font-serif text-emerald-600">
                    {t.studySmarter.split(' ').slice(-1)}
                  </span>.
                </h1>
                <p className="text-xl text-[#141414]/60 max-w-2xl mx-auto">
                  {t.tagline}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep('setup')}
                  className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-black/10"
                >
                  {t.startNow} <ChevronRight className="w-5 h-5" />
                </motion.button>
                {failedQuestions.length > 0 && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setMode('Apprentissage');
                      setStep('setup');
                    }}
                    className="px-8 py-4 bg-emerald-50 text-emerald-700 border-2 border-emerald-200 rounded-2xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <BookOpenCheck className="w-5 h-5" />
                    {t.resumeErrors} ({failedQuestions.length})
                  </motion.button>
                )}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMode('Fiche');
                    setStep('setup');
                  }}
                  className="px-8 py-4 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-2xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <FileText className="w-5 h-5" />
                  {t.createSheet}
                </motion.button>
              </div>

              {/* Daily Challenge Section */}
              {dailyChallenge && dailyProgress && (
                <div className="pt-8 max-w-2xl mx-auto">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-8 rounded-[2.5rem] border-2 transition-all text-left space-y-6 relative overflow-hidden shadow-xl",
                      dailyProgress.isCompleted 
                        ? "bg-emerald-50 border-emerald-200" 
                        : "bg-white border-[#141414]/5"
                    )}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                          <Timer className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl">{t.dailyChallenges}</h3>
                          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                            {dailyProgress.isCompleted ? t.challengeCompleted : t.completeChallenge}
                          </p>
                        </div>
                      </div>
                      {dailyProgress.isCompleted && (
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    <div className="relative z-10">
                      <p className="text-lg font-medium text-[#141414]/80">
                        {t.dailyChallengeDesc[dailyChallenge.id as keyof typeof t.dailyChallengeDesc]}
                      </p>
                      
                      <div className="mt-6 space-y-3">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[#141414]/40">
                          <span>{t.challengeProgress}</span>
                          <span>{dailyProgress.currentValue} / {dailyChallenge.target}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-[#141414]/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(dailyProgress.currentValue / dailyChallenge.target) * 100}%` }}
                            className={cn(
                              "h-full transition-all duration-1000",
                              dailyProgress.isCompleted ? "bg-emerald-500" : "bg-amber-500"
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {!dailyProgress.isCompleted && (
                      <div className="flex flex-wrap gap-3 pt-2 relative z-10">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100/50 px-4 py-2 rounded-xl border border-emerald-200">
                          <Plus className="w-4 h-4" /> {dailyChallenge.rewardPoints} {t.pointsLabel}
                        </div>
                        {dailyChallenge.badgeId && (
                          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-100/50 px-4 py-2 rounded-xl border border-purple-200">
                            <Award className="w-4 h-4" /> {t.exclusiveBadge}
                          </div>
                        )}
                      </div>
                    )}

                    {dailyProgress.isCompleted && (
                      <motion.div 
                        initial={{ opacity: 0, rotate: -20 }}
                        animate={{ opacity: 0.1, rotate: -10 }}
                        className="absolute -right-8 -bottom-8 text-[#141414]"
                      >
                        <Trophy className="w-48 h-48" />
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              )}

              {failedQuestions.length > 0 && (
                <div className="pt-12 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <LayoutDashboard className="w-6 h-6 text-emerald-600" />
                      {t.learningCenter}
                    </h3>
                    <button 
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: t.deleteEverything + "?",
                          onConfirm: () => {
                            setFailedQuestions([]);
                            localStorage.removeItem('revisai_errors');
                            setConfirmModal(null);
                          }
                        });
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline uppercase tracking-widest"
                    >
                      {t.deleteEverything}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from(new Set(failedQuestions.map(q => q.subject))).map(subj => {
                      const count = failedQuestions.filter(q => q.subject === subj).length;
                      const subjectInfo = SUBJECTS.find(s => s.name === subj);
                      const topTopic = failedQuestions.find(q => q.subject === subj)?.topic || "";
                      return (
                        <motion.div 
                          key={subj}
                          whileHover={{ y: -5 }}
                          className="p-6 bg-white rounded-3xl border border-[#141414]/5 shadow-sm hover:shadow-md transition-shadow text-left space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", subjectInfo?.color || "bg-gray-500")}>
                              {subjectInfo?.icon}
                            </div>
                            <span className="text-2xl font-bold text-emerald-600">{count}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{subj}</h4>
                            <p className="text-xs text-[#141414]/40 uppercase tracking-widest font-bold">{t.modes.Apprentissage.desc}</p>
                          </div>
                          <div className="flex gap-2">
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSubject(subj as Subject);
                                setMode('Apprentissage');
                                setStep('setup');
                              }}
                              className="flex-1 py-2 bg-[#141414]/5 hover:bg-[#141414] hover:text-white rounded-xl text-sm font-bold transition-all"
                            >
                              {t.reviewErrors}
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => generateStudyPlan(subj as Subject, level as Level, topTopic)}
                              className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                              title={t.generateStudyPlan}
                            >
                              <Calendar className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {revisionSheets.length > 0 && (
                <div className="pt-12 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <FileText className="w-6 h-6 text-blue-600" />
                      {t.myRevisionSheets}
                    </h3>
                    <button 
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: t.deleteAllSheets + "?",
                          onConfirm: () => {
                            setRevisionSheets([]);
                            localStorage.removeItem('revisai_sheets');
                            setConfirmModal(null);
                          }
                        });
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline uppercase tracking-widest"
                    >
                      {t.deleteAllSheets}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {revisionSheets.map(sheet => (
                      <motion.div 
                        key={sheet.id}
                        whileHover={{ y: -5 }}
                        className="p-6 bg-white rounded-3xl border border-[#141414]/5 shadow-sm hover:shadow-md transition-shadow text-left space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                            <FileText className="w-6 h-6" />
                          </div>
                          <span className="text-xs text-[#141414]/40 font-bold">{sheet.dateCreated}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg line-clamp-1">{sheet.title}</h4>
                          <p className="text-xs text-[#141414]/40 uppercase tracking-widest font-bold">{sheet.level} • {sheet.language}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setCurrentSheet(sheet);
                            setStep('revision_sheet');
                          }}
                          className="w-full py-2 bg-[#141414]/5 hover:bg-[#141414] hover:text-white rounded-xl text-sm font-bold transition-all"
                        >
                          {t.viewSheet}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {badges.length > 0 && (
                <div className="pt-12 space-y-4">
                  <p className="text-sm font-bold uppercase tracking-widest text-[#141414]/40">{t.myRewards}</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {badges.map((b) => (
                      <motion.div 
                        key={b.id} 
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="bg-white p-4 rounded-2xl border border-[#141414]/5 shadow-sm flex items-center gap-3"
                      >
                        <motion.div 
                          whileHover={{ rotate: 15 }}
                          className="w-10 h-10 bg-[#F5F5F0] rounded-full flex items-center justify-center"
                        >
                          {BADGE_TYPES.find(bt => bt.id === b.id)?.icon}
                        </motion.div>
                        <div className="text-left">
                          <p className="font-bold text-sm">{b.name}</p>
                          <p className="text-[10px] text-[#141414]/40">{b.dateEarned}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                {[
                  { title: t.multiSubject, desc: t.multiSubjectDesc, icon: <BookOpen className="text-blue-500" /> },
                  { title: t.aiPedagogy, desc: t.aiPedagogyDesc, icon: <BrainCircuit className="text-emerald-500" /> },
                  { title: t.examMode, desc: t.examModeDesc, icon: <Trophy className="text-amber-500" /> },
                ].map((feature, i) => (
                  <div key={i} className="p-6 bg-white rounded-3xl border border-[#141414]/5 text-left space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F0] flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-lg">{feature.title}</h3>
                    <p className="text-sm text-[#141414]/60">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'setup' && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">{t.configureSession}</h2>
                
                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-[#141414]/40">{t.schoolLevel}</label>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-[#141414]/30 mb-2 uppercase">{t.college}</p>
                      <div className="flex flex-wrap gap-3">
                        {LEVELS.filter(l => l.category === 'Collège').map((l) => (
                          <motion.button
                            key={l.name}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setLevel(l.name);
                              setSubject(null);
                            }}
                            className={cn(
                              "px-6 py-3 rounded-xl border-2 transition-all font-bold",
                              level === l.name 
                                ? "border-[#141414] bg-[#141414] text-white" 
                                : "border-[#141414]/10 bg-white hover:border-[#141414]/30"
                            )}
                          >
                            {l.name}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#141414]/30 mb-2 uppercase">{t.lycee}</p>
                      <div className="flex flex-wrap gap-3">
                        {LEVELS.filter(l => l.category === 'Lycée').map((l) => (
                          <motion.button
                            key={l.name}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setLevel(l.name);
                              setSubject(null);
                            }}
                            className={cn(
                              "px-6 py-3 rounded-xl border-2 transition-all font-bold",
                              level === l.name 
                                ? "border-[#141414] bg-[#141414] text-white" 
                                : "border-[#141414]/10 bg-white hover:border-[#141414]/30"
                            )}
                          >
                            {l.name}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-[#141414]/40">{t.subject}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {SUBJECTS.filter(s => s.levels.includes(level)).map((s) => (
                      <motion.button
                        key={s.name}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSubject(s.name);
                          fetchTopics(s.name);
                        }}
                        className={cn(
                          "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 text-center",
                          subject === s.name 
                            ? "border-[#141414] bg-white shadow-lg" 
                            : "border-[#141414]/5 bg-white/50 hover:border-[#141414]/20"
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white", s.color)}>
                          {s.icon}
                        </div>
                        <span className="font-bold text-sm">{t.subjects[s.name as keyof typeof t.subjects] || s.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {subject && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <label className="text-sm font-semibold uppercase tracking-wider text-[#141414]/40">{t.chapterTheme}</label>
                      {loadingTopics ? (
                        <div className="flex items-center gap-2 text-sm text-[#141414]/40 italic">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t.loadingChapters}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {topics.map((t, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setTopic(t)}
                              className={cn(
                                "p-4 rounded-2xl border-2 text-left text-sm font-medium transition-all",
                                topic === t 
                                  ? "border-[#141414] bg-[#141414]/5" 
                                  : "border-[#141414]/5 bg-white hover:border-[#141414]/20"
                              )}
                            >
                              {t}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-[#141414]/40">{t.yourName}</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-[#141414]/10 bg-white focus:border-[#141414] outline-none transition-all font-bold"
                    placeholder={t.enterPseudo}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-[#141414]/40">{t.mode}</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'Révision', label: t.modes.Révision.label, desc: t.modes.Révision.desc, color: 'bg-blue-500' },
                      { id: 'Examen', label: t.modes.Examen.label, desc: t.modes.Examen.desc, color: 'bg-rose-500' },
                      { id: 'Compétition', label: t.modes.Compétition.label, desc: t.modes.Compétition.desc, color: 'bg-amber-500' },
                      { id: 'Apprentissage', label: t.modes.Apprentissage.label, desc: `${failedQuestions.filter(q => q.subject === subject).length} ${t.errorsToReview}`, color: 'bg-emerald-500' },
                      { id: 'Fiche', label: t.modes.Fiche.label, desc: t.modes.Fiche.desc, color: 'bg-indigo-500' },
                    ].map((m) => (
                      <motion.button
                        key={m.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={m.id === 'Apprentissage' && failedQuestions.filter(q => q.subject === subject).length === 0}
                        onClick={() => setMode(m.id as Mode | 'Fiche')}
                        className={cn(
                          "p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group",
                          mode === m.id 
                            ? "border-[#141414] bg-[#141414] text-white" 
                            : "border-[#141414]/10 bg-white hover:border-[#141414]/30",
                          m.id === 'Apprentissage' && failedQuestions.filter(q => q.subject === subject).length === 0 && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-110",
                          m.color
                        )} />
                        <p className="font-bold text-lg mb-1">{m.label}</p>
                        <p className={cn("text-xs leading-tight", mode === m.id ? "text-white/60" : "text-[#141414]/40")}>{m.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!subject || !topic || loading}
                  onClick={startQuiz}
                  className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/20"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    mode === 'Fiche' ? t.generateSheet : t.generateQuestions
                  )}
                  {!loading && <ChevronRight className="w-5 h-5" />}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'quiz' && quiz && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-[#141414]/5 shadow-2xl shadow-black/5 space-y-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#141414]/5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {quiz.questions[quiz.currentQuestionIndex].type}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                        {quiz.questions[quiz.currentQuestionIndex].points} Points
                      </span>
                    </div>
                    <motion.h3 
                      key={quiz.currentQuestionIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-2xl md:text-3xl font-bold leading-tight"
                    >
                      {quiz.questions[quiz.currentQuestionIndex].text}
                    </motion.h3>
                  </div>

                  {['Français', 'Anglais', 'Espagnol', 'Allemand', 'Histoire-Géo'].includes(quiz.subject) && (
                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => playAudio(quiz.questions[quiz.currentQuestionIndex].text)}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                          isPlaying ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                        )}
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlaybackRate}
                        className="w-12 h-12 rounded-full bg-[#141414]/5 flex flex-col items-center justify-center text-[10px] font-bold"
                      >
                        <FastForward className="w-4 h-4 mb-0.5" />
                        {playbackRate}x
                      </motion.button>
                    </div>
                  )}
                </div>

                {quiz.questions[quiz.currentQuestionIndex].imageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-[#141414]/10 bg-[#F5F5F0]">
                    <img 
                      src={quiz.questions[quiz.currentQuestionIndex].imageUrl} 
                      alt={t.imageAnalysis} 
                      className="w-full h-auto object-cover max-h-[400px]"
                      referrerPolicy="no-referrer"
                    />
                    {quiz.questions[quiz.currentQuestionIndex].type === 'MAP_INTERACTIVE' && (
                      <div className="absolute inset-0">
                        {quiz.questions[quiz.currentQuestionIndex].hotspots?.map((hs) => (
                          <motion.button
                            key={hs.id}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={!!feedback}
                            onClick={() => setUserAnswer(hs.id)}
                            style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                            className={cn(
                              "absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center transition-all",
                              userAnswer === hs.id 
                                ? "bg-[#141414] border-white text-white scale-110 shadow-lg" 
                                : "bg-white/80 border-[#141414] text-[#141414] hover:scale-110"
                            )}
                          >
                            <span className="text-[10px] font-bold">{hs.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {['AUDIO_DIALOGUE', 'PRONUNCIATION', 'AUDIO_DICTATION', 'LISTENING_COMPREHENSION', 'AUDIO_FLASHCARD'].includes(quiz.questions[quiz.currentQuestionIndex].type) ? (
                  <AudioActivity
                    question={quiz.questions[quiz.currentQuestionIndex]}
                    language={language}
                    onAnswer={(answer, isCorrect, evaluation) => {
                      setUserAnswer(answer);
                      handleAnswer(answer, evaluation);
                    }}
                    feedback={feedback}
                  />
                ) : (
                  <div className="space-y-4">
                    {quiz.questions[quiz.currentQuestionIndex].type === 'MAP_INTERACTIVE' && (
                      <p className="text-sm text-[#141414]/50 italic">{t.clickOnMap}</p>
                    )}
                  {(quiz.questions[quiz.currentQuestionIndex].type === 'QCM' || 
                    quiz.questions[quiz.currentQuestionIndex].type === 'TRUE_FALSE') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {quiz.questions[quiz.currentQuestionIndex].options?.map((option, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!!feedback}
                          onClick={() => setUserAnswer(option)}
                          className={cn(
                            "p-6 rounded-2xl border-2 text-left font-bold transition-all relative overflow-hidden group",
                            userAnswer === option 
                              ? "border-[#141414] bg-[#141414] text-white shadow-lg" 
                              : "border-[#141414]/10 hover:border-[#141414]/30 bg-white text-[#141414]/70"
                          )}
                        >
                          <span className="relative z-10">{option}</span>
                          {userAnswer === option && (
                            <motion.div 
                              layoutId="activeOption"
                              className="absolute inset-0 bg-[#141414] -z-0"
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {(quiz.questions[quiz.currentQuestionIndex].type === 'OUVERTE' || 
                    quiz.questions[quiz.currentQuestionIndex].type === 'DEFINITION' || 
                    quiz.questions[quiz.currentQuestionIndex].type === 'CALCUL' ||
                    quiz.questions[quiz.currentQuestionIndex].type === 'IMAGE_ANALYSIS' ||
                    quiz.questions[quiz.currentQuestionIndex].type === 'FILL_BLANKS') && (
                    <textarea
                      disabled={!!feedback}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={t.yourAnswerPlaceholder}
                      className="w-full p-6 rounded-2xl border-2 border-[#141414]/5 bg-[#F5F5F0]/50 focus:border-[#141414] focus:bg-white outline-none transition-all min-h-[120px] font-medium"
                    />
                  )}

                  {quiz.questions[quiz.currentQuestionIndex].type === 'DRAG_DROP' && (
                    <div className="space-y-4">
                      <p className="text-sm text-[#141414]/50 italic">{t.dragDropInstructions}</p>
                      <input
                        disabled={!!feedback}
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder={t.dragDropPlaceholder}
                        className="w-full p-5 rounded-2xl border-2 border-[#141414]/5 bg-[#F5F5F0]/50 focus:border-[#141414] focus:bg-white outline-none transition-all font-medium"
                      />
                    </div>
                  )}

                  {quiz.questions[quiz.currentQuestionIndex].type === 'MATCHING' && (
                    <div className="space-y-6">
                      <p className="text-sm text-[#141414]/50 italic">{t.matchingInstructions}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Terms Column */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 px-2">{language === 'Français' ? 'Termes' : 'Terms'}</h4>
                          {shuffledTerms.map((term, idx) => {
                            const isMatched = !!matchingMatches[term];
                            return (
                              <motion.button
                                key={idx}
                                whileHover={!isMatched ? { scale: 1.02 } : {}}
                                whileTap={!isMatched ? { scale: 0.98 } : {}}
                                disabled={!!feedback || isMatched}
                                onClick={() => setSelectedTerm(term)}
                                className={cn(
                                  "w-full p-4 rounded-xl border-2 text-left font-bold transition-all relative",
                                  isMatched 
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 opacity-50" 
                                    : selectedTerm === term
                                      ? "border-[#141414] bg-[#141414] text-white shadow-md"
                                      : "border-[#141414]/10 hover:border-[#141414]/30 bg-white"
                                )}
                              >
                                {term}
                                {isMatched && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" />}
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Definitions Column */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 px-2">{language === 'Français' ? 'Définitions' : 'Definitions'}</h4>
                          {shuffledDefinitions.map((def, idx) => {
                            const matchedTerm = Object.keys(matchingMatches).find(k => matchingMatches[k] === def);
                            const isMatched = !!matchedTerm;
                            return (
                              <motion.button
                                key={idx}
                                whileHover={!isMatched && selectedTerm ? { scale: 1.02 } : {}}
                                whileTap={!isMatched && selectedTerm ? { scale: 0.98 } : {}}
                                disabled={!!feedback || isMatched || !selectedTerm}
                                onClick={() => selectedTerm && handleMatch(selectedTerm, def)}
                                className={cn(
                                  "w-full p-4 rounded-xl border-2 text-left text-sm transition-all relative",
                                  isMatched 
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 opacity-50" 
                                    : !selectedTerm
                                      ? "border-[#141414]/5 bg-white opacity-50 cursor-not-allowed"
                                      : "border-[#141414]/10 hover:border-[#141414]/30 bg-white"
                                )}
                              >
                                {def}
                                {isMatched && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" />}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                      {Object.keys(matchingMatches).length > 0 && (
                        <div className="pt-4 border-t border-[#141414]/5">
                          <button 
                            onClick={() => {
                              setMatchingMatches({});
                              setSelectedTerm(null);
                              setUserAnswer('');
                            }}
                            className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> {language === 'Français' ? 'Réinitialiser les correspondances' : 'Reset matches'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fallback for unknown types or missing options */}
                  {((quiz.questions[quiz.currentQuestionIndex].type === 'QCM' || quiz.questions[quiz.currentQuestionIndex].type === 'TRUE_FALSE') && (!quiz.questions[quiz.currentQuestionIndex].options || quiz.questions[quiz.currentQuestionIndex].options.length === 0)) && (
                    <div className="p-8 bg-amber-50 rounded-2xl border-2 border-amber-200 text-center space-y-4">
                      <p className="font-bold text-amber-800">{t.missingOptions}</p>
                      <button 
                        onClick={() => {
                          setUserAnswer('skipped');
                          handleAnswer('skipped');
                        }}
                        className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
                      >
                        {t.skipQuestion}
                      </button>
                    </div>
                  )}

                  {!['QCM', 'TRUE_FALSE', 'OUVERTE', 'DEFINITION', 'CALCUL', 'IMAGE_ANALYSIS', 'FILL_BLANKS', 'DRAG_DROP', 'MAP_INTERACTIVE', 'MATCHING', 'AUDIO_DIALOGUE', 'PRONUNCIATION', 'AUDIO_DICTATION', 'LISTENING_COMPREHENSION', 'AUDIO_FLASHCARD'].includes(quiz.questions[quiz.currentQuestionIndex].type) && (
                    <div className="p-8 bg-amber-50 rounded-2xl border-2 border-amber-200 text-center space-y-4">
                      <p className="font-bold text-amber-800">{t.unsupportedType} {quiz.questions[quiz.currentQuestionIndex].type}</p>
                      <button 
                        onClick={() => {
                          setUserAnswer('skipped');
                          handleAnswer('skipped');
                        }}
                        className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
                      >
                        {t.skipQuestion}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-6 rounded-2xl border-2 space-y-4 shadow-lg",
                        feedback.isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                      )}
                    >
                      <div className="flex items-center justify-between font-bold text-lg">
                        <div className="flex items-center gap-2">
                          {feedback.isCorrect ? <CheckCircle2 className="text-emerald-600 w-6 h-6" /> : <XCircle className="text-rose-600 w-6 h-6" />}
                          {feedback.isCorrect ? (language === 'Français' ? "Excellent !" : (language === 'English' ? "Excellent!" : "¡Excelente!")) : t.aiAnalysis}
                        </div>
                        {!feedback.isCorrect && failedQuestions.some(q => q.id === quiz.questions[quiz.currentQuestionIndex].id) && (
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-200"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {t.frequentError}
                          </motion.div>
                        )}
                        {feedback.isCorrect && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs"
                          >
                            +{quiz.questions[quiz.currentQuestionIndex].points} pts
                          </motion.span>
                        )}
                      </div>
                      <div className="text-base leading-relaxed prose prose-slate max-w-none text-[#141414]/80">
                        <Markdown>{feedback.message}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end pt-4">
                  {!feedback ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={userAnswer === '' || checking}
                      onClick={() => handleAnswer()}
                      className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {checking ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t.analyzing}
                        </>
                      ) : t.validateAnswer}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={nextQuestion}
                      className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                    >
                      {quiz.currentQuestionIndex === quiz.questions.length - 1 ? t.seeResults : t.nextQuestion}
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'revision_sheet' && currentSheet && (
            <motion.div 
              key="revision_sheet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-[#141414]/5 shadow-2xl shadow-black/5 space-y-8">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setStep('landing')}
                    className="text-sm font-bold text-[#141414]/40 hover:text-[#141414] flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" /> {t.backHome}
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => generateStudyPlan(currentSheet.subject as Subject, currentSheet.level, currentSheet.title)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors"
                    >
                      <Calendar className="w-4 h-4" /> {t.generateStudyPlan}
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="p-3 bg-[#141414]/5 hover:bg-[#141414]/10 rounded-xl transition-colors"
                      title={t.print}
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-center">
                  <div className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest">
                    {t.modes.Fiche.label} • {currentSheet.level}
                  </div>
                  <h2 className="text-4xl font-black tracking-tight">{currentSheet.title}</h2>
                  <p className="text-[#141414]/40 font-medium">{t.generatedOn} {currentSheet.dateCreated}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-[#141414]/80 prose-p:leading-relaxed">
                      <Markdown>{currentSheet.content}</Markdown>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-[#F5F5F0] rounded-3xl space-y-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" /> {t.keyPoints}
                      </h3>
                      <ul className="space-y-3">
                        {currentSheet.keyPoints.map((point, i) => (
                          <li key={i} className="flex gap-3 text-sm font-medium text-[#141414]/70">
                            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              {i + 1}
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6 border-2 border-dashed border-[#141414]/10 rounded-3xl space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-widest text-[#141414]/40">{t.readyForTest}</h3>
                      <p className="text-sm font-medium">{t.readyForTestDesc}</p>
                      <button 
                        onClick={() => {
                          setSubject(currentSheet.subject);
                          setTopic(currentSheet.topic);
                          setMode('Révision');
                          setStep('setup');
                        }}
                        className="w-full py-3 bg-[#141414] text-white rounded-2xl font-bold text-sm hover:scale-105 transition-transform"
                      >
                        {t.startQuiz}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'study_plan' && studyPlan && (
            <motion.div 
              key="study_plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setStep('landing')}
                  className="flex items-center gap-2 text-sm font-bold text-[#141414]/40 hover:text-[#141414] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> {t.backHome}
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#141414]/5 rounded-xl font-bold text-sm hover:bg-[#141414]/10 transition-colors"
                >
                  <Printer className="w-4 h-4" /> {t.print}
                </button>
              </div>

              <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-xl border border-[#141414]/5 space-y-12">
                <div className="space-y-4 text-center">
                  <div className="inline-block px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest">
                    {studyPlan.subject} • {studyPlan.level}
                  </div>
                  <h2 className="text-4xl font-bold tracking-tight">{t.masteryPlan}: {studyPlan.topic}</h2>
                  <p className="text-lg text-[#141414]/60 max-w-2xl mx-auto">{t.studyPlanDesc}</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {studyPlan.weeks.map((week, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-8 rounded-[2.5rem] border-2 border-[#141414]/5 hover:border-emerald-200 transition-colors space-y-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                          {idx + 1}
                        </div>
                        <h3 className="text-2xl font-bold">{t.week} {idx + 1}: {week.title}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                          <h4 className="font-bold text-sm uppercase tracking-widest text-[#141414]/40 flex items-center gap-2">
                            <Target className="w-4 h-4" /> {t.objectives}
                          </h4>
                          <ul className="space-y-2">
                            {week.objectives.map((obj, i) => (
                              <li key={i} className="text-sm text-[#141414]/80 flex gap-2">
                                <span className="text-emerald-500">•</span> {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-bold text-sm uppercase tracking-widest text-[#141414]/40 flex items-center gap-2">
                            <ListTodo className="w-4 h-4" /> {t.tasks}
                          </h4>
                          <ul className="space-y-2">
                            {week.activities.map((task, i) => (
                              <li key={i} className="text-sm text-[#141414]/80 flex gap-2">
                                <span className="text-blue-500">•</span> {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-bold text-sm uppercase tracking-widest text-[#141414]/40 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" /> {t.resources}
                          </h4>
                          <ul className="space-y-2">
                            {week.memorizationTips.map((res, i) => (
                              <li key={i} className="text-sm text-[#141414]/80 flex gap-2">
                                <span className="text-amber-500">•</span> {res}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-blue-900">
                    <Globe className="w-6 h-6" /> Google Classroom Integration
                  </h3>
                  <p className="text-blue-800 leading-relaxed">
                    {studyPlan.classroomIntegration}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && quiz && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-12 max-w-2xl mx-auto"
            >
              <div className="space-y-4">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-6">
                  <Trophy className="w-12 h-12" />
                </div>
                <h2 className="text-5xl font-bold tracking-tight">{t.sessionFinished}</h2>
                <p className="text-xl text-[#141414]/60">
                  {t.bravo} {quiz.subject}. {t.hereIsYourReport} :
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-[#141414]/5 shadow-xl">
                  <p className="text-sm font-bold uppercase tracking-widest text-[#141414]/40 mb-2">{t.finalScore}</p>
                  <p className="text-5xl font-bold text-emerald-600">{quiz.score}</p>
                  <p className="text-xs text-[#141414]/40 mt-2">{t.pointsAccumulated}</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-[#141414]/5 shadow-xl">
                  <p className="text-sm font-bold uppercase tracking-widest text-[#141414]/40 mb-2">{t.accuracy}</p>
                  <p className="text-5xl font-bold text-blue-600">
                    {quiz.questions.length > 0 ? Math.round((quiz.score / quiz.questions.reduce((acc, q) => acc + q.points, 0)) * 100) : 0}%
                  </p>
                  <p className="text-xs text-[#141414]/40 mt-2">{t.overallSuccess}</p>
                </div>
              </div>

              {failedQuestions.filter(q => q.subject === quiz.subject).length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 space-y-4"
                >
                  <div className="flex items-center justify-center gap-3 text-emerald-700">
                    <Calendar className="w-6 h-6" />
                    <h3 className="text-xl font-bold">{t.studyPlan}</h3>
                  </div>
                  <p className="text-emerald-600 text-sm max-w-md mx-auto">
                    {t.studyPlanDesc}
                  </p>
                  <button 
                    onClick={() => generateStudyPlan(quiz.subject, quiz.level, quiz.topic)}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                  >
                    {t.generateStudyPlan}
                  </button>
                </motion.div>
              )}

              {quiz.mode === 'Compétition' && (
                <div className="bg-white p-8 rounded-[2rem] border border-[#141414]/5 shadow-xl space-y-6">
                  <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" /> {t.leaderboard}
                  </h3>
                  <div className="space-y-2">
                    {leaderboard.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F0]/50">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#141414]/30 w-4">{idx + 1}</span>
                          <span className="font-medium">{entry.username}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-[#141414]/40">{entry.subject}</span>
                          <span className="font-bold text-emerald-600">{entry.score} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={reset}
                  className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all"
                >
                  <RotateCcw className="w-5 h-5" /> {t.restartSession}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep('setup')}
                  className="px-8 py-4 bg-white border-2 border-[#141414] text-[#141414] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#141414] hover:text-white transition-all"
                >
                  {t.changeSubject}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'tribes' && (
            <motion.div
              key="tribes"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <TribesModule language={language} t={t} onBack={() => setStep('dashboard')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-[#141414]/5 text-center text-[#141414]/40 text-sm">
        <p>© 2026 Révis'AI — {t.footerTagline}</p>
      </footer>
    </div>
  );
}
