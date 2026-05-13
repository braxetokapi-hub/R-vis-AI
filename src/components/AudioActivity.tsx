import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Languages,
  Info
} from 'lucide-react';
import { Question, Language } from '../types';
import { translations } from '../translations';
import { generateSpeech, evaluatePronunciation } from '../services/geminiService';
import { cn } from '../lib/utils';

interface AudioActivityProps {
  question: Question;
  language: Language;
  onAnswer: (answer: string, isCorrect: boolean, evaluation?: { score: number; feedback: string; recognizedText: string }) => void;
  feedback: { isCorrect: boolean; message: string } | null;
}

export const AudioActivity: React.FC<AudioActivityProps> = ({ 
  question, 
  language, 
  onAnswer,
  feedback 
}) => {
  const t = translations[language].audioActivities;
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [evaluation, setEvaluation] = useState<{ score: number; feedback: string; recognizedText: string; details: { sounds: number; rhythm: number; intonation: number } } | null>(null);
  const [userInput, setUserInput] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTargetAudio = async () => {
    if (isPlaying) return;
    try {
      setIsPlaying(true);
      const base64 = await generateSpeech(question.text, language);
      if (base64) {
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audio.onended = () => setIsPlaying(false);
        audio.play();
      }
    } catch (error) {
      console.error("Audio playback failed", error);
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        evaluateRecording(blob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const evaluateRecording = async (blob: Blob) => {
    try {
      setIsEvaluating(true);
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await evaluatePronunciation(base64, question.text, language);
        setEvaluation(result);
        setIsEvaluating(false);
        onAnswer(result.recognizedText, result.score >= 70, result);
      };
    } catch (error) {
      console.error("Evaluation failed", error);
      setIsEvaluating(false);
    }
  };

  const handleDictationSubmit = () => {
    const correctStr = String(question.correctAnswer || '').trim().toLowerCase();
    const isCorrect = userInput.trim().toLowerCase() === correctStr;
    onAnswer(userInput, isCorrect);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-3 p-4 bg-[#141414]/5 rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          <Languages className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#141414]/40 uppercase tracking-widest">
            {question.type === 'AUDIO_DIALOGUE' && t.dialogue}
            {question.type === 'PRONUNCIATION' && t.pronunciation}
            {question.type === 'AUDIO_DICTATION' && t.dictation}
            {question.type === 'LISTENING_COMPREHENSION' && t.comprehension}
            {question.type === 'AUDIO_FLASHCARD' && t.flashcard}
          </p>
          <h4 className="font-bold text-[#141414]">{question.text}</h4>
          {question.phonetic && (
            <p className="text-sm font-mono text-emerald-600">{question.phonetic}</p>
          )}
        </div>
      </div>

      {/* Activity Area */}
      <div className="bg-white rounded-3xl p-8 border-2 border-[#141414]/5 space-y-8">
        {/* Audio Controls */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playTargetAudio}
            disabled={isPlaying}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg",
              isPlaying ? "bg-rose-500 text-white" : "bg-emerald-500 text-white hover:bg-emerald-600"
            )}
          >
            {isPlaying ? <Loader2 className="w-6 h-6 animate-spin" /> : <Volume2 className="w-6 h-6" />}
            {t.listenToAudio}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playTargetAudio}
            disabled={isPlaying}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50",
              isPlaying && "opacity-50 cursor-not-allowed"
            )}
          >
            <RotateCcw className="w-6 h-6" />
            {t.reListenToAudio}
          </motion.button>
        </div>

        {/* Specific Activity UI */}
        <AnimatePresence mode="wait">
          {question.type === 'PRONUNCIATION' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isEvaluating}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl relative",
                  isRecording ? "bg-rose-500 text-white animate-pulse" : "bg-[#141414] text-white",
                  isEvaluating && "opacity-50"
                )}
              >
                {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                {isRecording && (
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-rose-300"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </motion.button>
              
              <div className="text-center">
                <p className="font-bold text-lg">
                  {isRecording ? t.listening : (isEvaluating ? t.evaluating : t.startRecording)}
                </p>
              </div>

              {evaluation && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "w-full p-6 rounded-2xl border-2 space-y-3",
                    evaluation.score >= 70 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">Score: {evaluation.score}%</span>
                    {evaluation.score >= 70 ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-rose-500" />}
                  </div>
                  <p className="text-sm italic">"{evaluation.recognizedText}"</p>
                  <p className="text-sm font-medium">{evaluation.feedback}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {question.type === 'AUDIO_DICTATION' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <label className="text-sm font-bold text-[#141414]/40 uppercase tracking-widest">{t.typeWhatYouHear}</label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={!!feedback}
                className="w-full p-6 rounded-2xl border-2 border-[#141414]/10 bg-[#F5F5F0] focus:border-[#141414] outline-none transition-all font-medium text-lg min-h-[120px]"
                placeholder="..."
              />
              <button
                onClick={handleDictationSubmit}
                disabled={!userInput.trim() || !!feedback}
                className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold hover:bg-[#141414]/90 disabled:opacity-50 transition-all"
              >
                {translations[language].checkAnswer}
              </button>
            </motion.div>
          )}

          {(question.type === 'LISTENING_COMPREHENSION' || question.type === 'AUDIO_DIALOGUE') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 gap-3"
            >
              {question.options && question.options.length > 0 ? (
                question.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!!feedback}
                    onClick={() => {
                      setUserInput(option);
                      onAnswer(option, option === question.correctAnswer);
                    }}
                    className={cn(
                      "p-6 rounded-2xl border-2 text-left font-bold transition-all",
                      feedback && option === question.correctAnswer ? "border-emerald-500 bg-emerald-50" :
                      feedback && userInput === option ? "border-rose-500 bg-rose-50" :
                      "border-[#141414]/5 bg-[#F5F5F0] hover:border-[#141414]/20"
                    )}
                  >
                    {option}
                  </motion.button>
                ))
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-[#141414]/60">{question.explanation || "Écoute attentivement le dialogue."}</p>
                  <button
                    onClick={() => onAnswer('listened', true)}
                    className="px-12 py-4 bg-[#141414] text-white rounded-2xl font-bold hover:bg-[#141414]/90 transition-all"
                  >
                    {translations[language].nextQuestion}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {question.type === 'AUDIO_FLASHCARD' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-full p-12 bg-emerald-50 rounded-[2.5rem] border-4 border-emerald-100 text-center space-y-4 shadow-inner">
                <h3 className="text-4xl font-bold text-emerald-900">{question.text}</h3>
                <p className="text-xl text-emerald-700/60 italic">{question.phonetic}</p>
                <div className="pt-6 border-t border-emerald-200">
                  <p className="text-lg font-medium text-emerald-800">{question.explanation}</p>
                </div>
              </div>
              <button
                onClick={() => onAnswer('understood', true)}
                className="px-12 py-4 bg-[#141414] text-white rounded-2xl font-bold hover:bg-[#141414]/90 transition-all"
              >
                {translations[language].nextQuestion}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper Info */}
      <div className="flex items-center gap-2 text-xs text-[#141414]/40 bg-[#141414]/5 p-3 rounded-xl">
        <Info className="w-4 h-4" />
        <p>L'IA évalue ta prononciation en temps réel. Assure-toi d'être dans un endroit calme.</p>
      </div>
    </div>
  );
};
