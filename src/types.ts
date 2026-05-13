export type Subject = 
  | 'Mathématiques' 
  | 'Français' 
  | 'Histoire-Géo' 
  | 'Physique-Chimie' 
  | 'SVT' 
  | 'Sciences'
  | 'Anglais' 
  | 'Philosophie' 
  | 'S.E.S' 
  | 'Espagnol' 
  | 'Technologie' 
  | 'Musique'
  | 'Allemand'
  | 'Italien'
  | 'Arabe'
  | 'EMC'
  | 'Culture Générale';

export type Level = 'CM2' | '6ème' | '5ème' | '4ème' | '3ème' | 'Seconde' | 'Première' | 'Terminale';

export type Language = 'Français' | 'English' | 'Español' | 'Deutsch' | 'Italiano' | 'العربية';

export type Mode = 'Révision' | 'Examen' | 'Compétition' | 'Apprentissage';

export type MasteryLevel = 'NOT_STARTED' | 'IN_PROGRESS' | 'ACQUIRED' | 'MASTERED';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  status: MasteryLevel;
  unitId: string;
  subject?: Subject;
}

export interface Unit {
  id: string;
  title: string;
  subject: Subject;
  lessons: Lesson[];
}

export interface UserStats {
  points: number;
  streak: number;
  bestStreak: number;
  lastActive: string;
  mastery: Record<string, MasteryLevel>; // lessonId -> level
  badges: string[];
}

export interface OnboardingState {
  step: 'name' | 'level' | 'subject' | 'test' | 'result' | 'completed';
  name: string;
  level: Level;
  prioritySubject: Subject;
  testScore: number;
  recommendedLessons: string[];
}

export type QuestionType = 
  | 'QCM' 
  | 'OUVERTE' 
  | 'DEFINITION' 
  | 'CALCUL' 
  | 'DRAG_DROP' 
  | 'IMAGE_ANALYSIS' 
  | 'MAP_INTERACTIVE' 
  | 'TRUE_FALSE' 
  | 'FILL_BLANKS'
  | 'AUDIO_DIALOGUE'
  | 'PRONUNCIATION'
  | 'AUDIO_DICTATION'
  | 'LISTENING_COMPREHENSION'
  | 'AUDIO_FLASHCARD'
  | 'MATCHING';

export interface Hotspot {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  question?: string; // Some code uses .question instead of .text
  options?: string[]; // For QCM
  correctAnswer: string | string[];
  answer?: string; // Some code uses .answer instead of .correctAnswer
  explanation?: string;
  points: number;
  difficulty?: string;
  hint?: string;
  imageUrl?: string; // For image analysis and interactive maps
  hotspots?: Hotspot[]; // For MAP_INTERACTIVE
  imagePrompt?: string;
  pairs?: { term: string; definition: string }[]; // For MATCHING
  data?: any; // For drag and drop or complex types
  subject?: string; // For tracking errors by subject
  topic?: string; // For tracking errors by topic
  audioUrl?: string;
  phonetic?: string;
}

export interface LessonStepContent {
  videoDescription?: string;
  summary?: {
    content: string;
    keyPoints: string[];
    mainRule?: string;
  };
  listeningComprehension?: {
    audioUrl: string;
    transcript: string;
    questions: Question[];
  };
  exercises?: Question[];
  quiz?: Question[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateEarned: string;
}

export interface RevisionSheet {
  id: string;
  title: string;
  subject: Subject;
  level: Level;
  topic: string;
  content: string;
  keyPoints: string[];
  language: Language;
  dateCreated: string;
}

export interface DailyChallenge {
  id: string;
  type: 'correct_answers' | 'speed' | 'subject_mastery';
  target: number;
  subject?: Subject;
  timeLimit?: number; // in seconds
  rewardPoints: number;
  badgeId?: string;
}

export interface DailyChallengeProgress {
  challengeId: string;
  date: string; // YYYY-MM-DD
  currentValue: number;
  isCompleted: boolean;
}

export interface QuizState {
  subject: Subject;
  level: Level;
  mode: Mode;
  topic: string;
  language: Language;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  isFinished: boolean;
  score: number;
  timeLeft?: number; // in seconds
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  subject: string;
  date: string;
}

export interface Tribe {
  id: string;
  name: string;
  continent: string;
  location: { x: number; y: number };
  summary: string;
  habitat: string;
  language: string;
  religion: string;
  traditions: string[];
  anecdote: string;
  history: string;
  colonization: string;
  quiz: Question[];
}

export interface StudyPlan {
  subject: Subject;
  level: Level;
  topic: string;
  weeks: {
    week: number;
    title: string;
    objectives: string[];
    activities: string[];
    memorizationTips: string[];
  }[];
  classroomIntegration: string;
}
