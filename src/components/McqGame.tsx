import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { McqQuestion, ChapterFilter } from '../types/game';
import { STD_8_CHAPTERS } from '../data/std8Synonyms';
import { generateMcqQuestions, toGujaratiNumerals } from '../utils/gameHelpers';
import { playClickSound, playSuccessSound, playErrorSound, playFanfareSound, speakGujarati } from '../utils/audio';
import { 
  HelpCircle, 
  Volume2, 
  VolumeX,
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Clock, 
  Flame, 
  Sparkles, 
  Award, 
  ChevronRight, 
  HelpCircle as HintIcon,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';

interface McqGameProps {
  onQuizCompleted: (score: number, correctCount: number, wrongCount: number, wordIds: string[]) => void;
  onViewCertificate?: (score: number, accuracy: number) => void;
  initialChapterId?: ChapterFilter;
  onNavigateToChapters?: () => void;
  isMuted?: boolean;
}

const MOTIVATIONAL_PRAISES = [
  'વાહ ભાઈ વાહ! જબરદસ્ત! 🔥',
  'ખૂબ સરસ! એકદમ સાચો જવાબ! 🌟',
  'કમાલ કરી દીધી! શાબાશ! 👏',
  'સુપર સ્ટાર! તમારી તૈયારી ઉત્તમ છે! 🚀',
  'અદભુત! આગળ વધતા રહો! 🎯',
];

export const McqGame: React.FC<McqGameProps> = ({
  onQuizCompleted,
  onViewCertificate,
  initialChapterId = 'palash_all',
  onNavigateToChapters,
  isMuted,
}) => {
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [selectedChapter, setSelectedChapter] = useState<ChapterFilter>(initialChapterId);
  const [isTimerEnabled, setIsTimerEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (initialChapterId !== undefined) {
      setSelectedChapter(initialChapterId);
    }
  }, [initialChapterId]);

  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);

  // Lifelines
  const [hasUsed5050, setHasUsed5050] = useState<boolean>(false);
  const [hasUsedHint, setHasUsedHint] = useState<boolean>(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [isHintVisible, setIsHintVisible] = useState<boolean>(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Praise message
  const [praiseText, setPraiseText] = useState<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [answerReview, setAnswerReview] = useState<{
    question: McqQuestion;
    userSelected: number | null;
    isCorrect: boolean;
  }[]>([]);

  // Start new quiz
  const startQuiz = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const newQuestions = generateMcqQuestions(questionCount, selectedChapter);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setHasUsed5050(false);
    setHasUsedHint(false);
    setEliminatedOptions([]);
    setIsHintVisible(false);
    setTimeLeft(20);
    setIsFinished(false);
    setAnswerReview([]);
    setPraiseText('');
  };

  useEffect(() => {
    startQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questionCount, selectedChapter]);

  // Reset timer on question change
  useEffect(() => {
    if (isFinished || questions.length === 0) return;

    setTimeLeft(20);
    setEliminatedOptions([]);
    setIsHintVisible(false);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setPraiseText('');

    if (timerRef.current) clearInterval(timerRef.current);

    if (isTimerEnabled && !isAnswerSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isFinished, isTimerEnabled, questions]);

  // Time-up handler
  const handleTimeUp = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnswerSubmitted(true);
    playErrorSound(isMuted);
    setWrongCount((w) => w + 1);
    setStreak(0);

    const currentQ = questions[currentIndex];
    setAnswerReview((prev) => [
      ...prev,
      {
        question: currentQ,
        userSelected: null,
        isCorrect: false,
      },
    ]);
  };

  // Option selection
  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswerSubmitted || eliminatedOptions.includes(optionIndex)) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(optionIndex);
    setIsAnswerSubmitted(true);

    const currentQ = questions[currentIndex];
    const isCorrect = optionIndex === currentQ.correctOptionIndex;

    if (isCorrect) {
      playSuccessSound(isMuted);
      const currentPraise = MOTIVATIONAL_PRAISES[Math.floor(Math.random() * MOTIVATIONAL_PRAISES.length)];
      setPraiseText(currentPraise);

      const streakBonus = streak * 15;
      const timeBonus = isTimerEnabled ? timeLeft * 5 : 0;
      const pointsEarned = 100 + streakBonus + timeBonus;

      setScore((s) => s + pointsEarned);
      setCorrectCount((c) => c + 1);
      setStreak((st) => st + 1);
    } else {
      playErrorSound(isMuted);
      setWrongCount((w) => w + 1);
      setStreak(0);
    }

    setAnswerReview((prev) => [
      ...prev,
      {
        question: currentQ,
        userSelected: optionIndex,
        isCorrect,
      },
    ]);
  };

  // 50-50 Lifeline
  const handleUse5050 = () => {
    if (hasUsed5050 || isAnswerSubmitted) return;
    playClickSound(isMuted);

    const currentQ = questions[currentIndex];
    const wrongIndexes = currentQ.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== currentQ.correctOptionIndex);

    // Pick 2 random wrong options to eliminate
    const shuffledWrong = [...wrongIndexes].sort(() => 0.5 - Math.random());
    setEliminatedOptions(shuffledWrong.slice(0, 2));
    setHasUsed5050(true);
  };

  // Clue / Hint Lifeline
  const handleUseHint = () => {
    if (hasUsedHint || isAnswerSubmitted) return;
    playClickSound(isMuted);
    setIsHintVisible(true);
    setHasUsedHint(true);
  };

  // Move to next question or finish
  const handleNextQuestion = () => {
    playClickSound(isMuted);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);
    playFanfareSound(isMuted);
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const wordIds = questions.map((q) => q.wordId);
    onQuizCompleted(score, correctCount, wrongCount, wordIds);
  };

  const currentQ = questions[currentIndex];
  const optionLetters = ['અ', 'બ', 'ક', 'ડ'];

  if (!currentQ && !isFinished) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
        <p className="text-stone-600 font-medium">પ્રશ્નો લોડ થઈ રહ્યા છે...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Banner & Filters */}
      <div className="bg-emerald-500/10 border border-emerald-200/80 rounded-2xl p-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">❓</span>
              <h2 className="text-lg sm:text-xl font-bold text-emerald-950">
                MCQ ક્વિઝ રમત (સમાનાર્થી શબ્દો)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900/80 mt-0.5">
              યોગ્ય વિકલ્પ પસંદ કરી મહત્તમ સ્કોર બનાવો અને લાઈફલાઇનનો ઉપયોગ કરો.
            </p>
          </div>

          {/* Controls: Chapter & Timer Switch */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <select
                value={selectedChapter}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'all' || val === 'palash_all' || val === 'gcert_all') {
                    setSelectedChapter(val);
                  } else {
                    setSelectedChapter(Number(val));
                  }
                }}
                className="text-xs font-bold text-stone-800 bg-transparent focus:outline-hidden cursor-pointer max-w-[210px] truncate"
              >
                <option value="palash_all">🌸 પલાશ (સમગ્ર નવો અભ્યાસક્રમ)</option>
                <option value="all">🌟 સમગ્ર અભ્યાસક્રમ (બધા પાઠો)</option>
                <option value="gcert_all">📖 ધોરણ ૮ GCERT (સત્ર ૧ અને ૨)</option>
                <optgroup label="🌸 પલાશ પાઠ પ્રમાણે (Palash Chapters)">
                  {STD_8_CHAPTERS.filter((c) => c.bookSeries === 'palash').map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="📖 ધોરણ ૮ સત્ર ૧ અને ૨ પાઠ">
                  {STD_8_CHAPTERS.filter((c) => c.bookSeries === 'gcert_sem').map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Audio Feedback Status */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                isMuted
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-white text-emerald-800 border-emerald-200 shadow-2xs'
              }`}
              title={isMuted ? 'ઓડિયો ફીડબેક બંધ છે (હેડરમાંથી ચાલુ કરો)' : 'ઓડિયો ફીડબેક: સાચા/ખોટા અવાજો ચાલુ છે'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isMuted ? 'અવાજ બંધ' : 'ઓડિયો ચાલુ'}</span>
            </div>

            {onNavigateToChapters && (
              <button
                type="button"
                onClick={onNavigateToChapters}
                className="px-2.5 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                title="પાઠવાર સૂચિ જુઓ"
              >
                પાઠ સૂચિ
              </button>
            )}

            <button
              onClick={() => setIsTimerEnabled(!isTimerEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                isTimerEnabled
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
              title="ટાઈમર ચાલુ / બંધ કરો"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isTimerEnabled ? 'ટાઈમર: ચાલુ' : 'ટાઈમર: બંધ'}</span>
            </button>
          </div>
        </div>

        {/* Selected Chapter indicator banner */}
        {selectedChapter !== 'all' && (
          <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <span className="font-bold">ચાલુ ક્વિઝ અભ્યાસક્રમ:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold">
                {selectedChapter === 'palash_all'
                  ? '🌸 પલાશ (સમગ્ર નવો અભ્યાસક્રમ)'
                  : selectedChapter === 'gcert_all'
                  ? '📖 ધોરણ ૮ GCERT (સત્ર ૧ અને ૨)'
                  : STD_8_CHAPTERS.find((c) => c.id === selectedChapter)?.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedChapter('all')}
              className="text-emerald-800 underline hover:text-emerald-950 font-medium"
            >
              બધા પાઠોમાંથી રમો
            </button>
          </div>
        )}
      </div>

      {!isFinished ? (
        <div className="space-y-4">
          {/* Progress Header & Lifelines */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">
                  પ્રશ્ન {toGujaratiNumerals(currentIndex + 1)} / {toGujaratiNumerals(questions.length)}
                </span>
                {streak > 1 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold animate-pulse">
                    <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                    <span>{toGujaratiNumerals(streak)} સળંગ સાચા!</span>
                  </span>
                )}
              </div>

              {/* Score & Timer Badge */}
              <div className="flex items-center gap-3">
                {isTimerEnabled && (
                  <div
                    className={`flex items-center gap-1 font-mono font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg border ${
                      timeLeft <= 5
                        ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{toGujaratiNumerals(timeLeft)} સે</span>
                  </div>
                )}

                <div className="text-right">
                  <span className="text-sm sm:text-base font-extrabold text-stone-900">
                    +{toGujaratiNumerals(score)} ગુણ
                  </span>
                </div>
              </div>
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mb-3">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Lifelines row */}
            <div className="flex items-center justify-between border-t border-stone-100 pt-2.5 text-xs">
              <span className="text-stone-600 font-semibold">સહાયક લાઈફલાઇન:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUse5050}
                  disabled={hasUsed5050 || isAnswerSubmitted}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                    hasUsed5050
                      ? 'bg-stone-100 text-stone-600 border-stone-200 cursor-not-allowed'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                  title="૫૦-૫૦: બે ખોટા વિકલ્પો દૂર કરો"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>૫૦:૫૦ {hasUsed5050 ? '(વપરાયેલ)' : ''}</span>
                </button>

                <button
                  onClick={handleUseHint}
                  disabled={hasUsedHint || isAnswerSubmitted}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                    hasUsedHint
                      ? 'bg-stone-100 text-stone-600 border-stone-200 cursor-not-allowed'
                      : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-300'
                  }`}
                  title="અર્થ સંકેત મેળવો"
                >
                  <HintIcon className="w-3.5 h-3.5" />
                  <span>સંકેત {hasUsedHint ? '(વપરાયેલ)' : ''}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hint alert card */}
          {isHintVisible && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs sm:text-sm text-sky-900 flex items-start gap-2.5 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong>સંકેત / અર્થ સંકેત:</strong> {currentQ.explanation.split('(')[1]?.replace(')', '') || 'શબ્દના મૂળ અર્થને ધ્યાને રાખીને સાચો વિકલ્પ પસંદ કરો.'}
              </div>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                {currentQ.questionText}
              </h3>
              <button
                type="button"
                onClick={() => speakGujarati(currentQ.questionText, isMuted)}
                className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="પ્રશ્ન સાંભળો"
              >
                <Volume2 className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {/* Target Word Highlight Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-base sm:text-lg mb-5">
              <span>શબ્દ:</span>
              <span className="text-amber-700 underline underline-offset-4 decoration-amber-400">
                {currentQ.targetWord}
              </span>
            </div>

            {/* Options Grid (4 Options) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {currentQ.options.map((optText, idx) => {
                const isEliminated = eliminatedOptions.includes(idx);
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctOptionIndex;

                let btnStyle = 'bg-white border-stone-200 text-stone-800 hover:border-emerald-300 hover:bg-emerald-50/30';
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-100/90 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-100/90 border-rose-500 text-rose-950 ring-2 ring-rose-400 font-bold';
                  } else {
                    btnStyle = 'bg-stone-50 border-stone-200 text-stone-600 opacity-60';
                  }
                }

                if (isEliminated) {
                  btnStyle = 'bg-stone-100/60 border-dashed border-stone-300 text-stone-600 cursor-not-allowed line-through opacity-40';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={isAnswerSubmitted || isEliminated}
                    className={`p-3.5 sm:p-4 rounded-xl border text-left flex items-center justify-between transition-all select-none ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isAnswerSubmitted && isCorrect
                            ? 'bg-emerald-500 text-white'
                            : isAnswerSubmitted && isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {optionLetters[idx]}
                      </span>
                      <span className="text-base sm:text-lg font-semibold">{optText}</span>
                    </div>

                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Answer Feedback & Explanation */}
            {isAnswerSubmitted && (
              <div className="mt-4 pt-4 border-t border-stone-200 animate-in fade-in">
                {selectedOption === currentQ.correctOptionIndex ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl mb-3 text-emerald-950">
                    <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>{praiseText || 'એકદમ સાચો જવાબ!'}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-900/90 mt-1">
                      {currentQ.explanation}
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl mb-3 text-rose-950">
                    <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>ખોટો જવાબ! કોઈ વાંધો નહીં, શીખી લો:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-rose-900/90 mt-1">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}

                {/* Example sentence from textbook */}
                {currentQ.contextSentence && (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-700 mb-4">
                    <strong className="text-stone-900">પાઠ્યપુસ્તક વાક્ય પ્રયોગ:</strong>{' '}
                    <span className="italic font-medium">"{currentQ.contextSentence}"</span>
                  </div>
                )}

                {/* Next button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-xs flex items-center gap-2"
                  >
                    <span>
                      {currentIndex + 1 < questions.length ? 'આગળનો પ્રશ્ન' : 'પરિણામ જુઓ'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Completed Screen */
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 text-center shadow-md animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-1">
            ક્વિઝ સફળતાપૂર્વક પૂર્ણ! 🎓
          </h3>
          <p className="text-sm text-stone-600 mb-6">
            ધોરણ ૮ ગુજરાતીના સમાનાર્થી શબ્દોની MCQ પરીક્ષાનું પરિણામ પત્રક
          </p>

          {/* Scorecards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 rounded-2xl mb-6">
            <div className="p-2">
              <span className="text-xs text-stone-600 font-semibold block">કુલ ગુણ</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600">
                {toGujaratiNumerals(score)}
              </span>
            </div>

            <div className="p-2">
              <span className="text-xs text-stone-600 font-semibold block">સાચા જવાબો</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600">
                {toGujaratiNumerals(correctCount)} / {toGujaratiNumerals(questions.length)}
              </span>
            </div>

            <div className="p-2">
              <span className="text-xs text-stone-600 font-semibold block">ખોટા જવાબો</span>
              <span className="text-xl sm:text-2xl font-black text-rose-600">
                {toGujaratiNumerals(wrongCount)}
              </span>
            </div>

            <div className="p-2">
              <span className="text-xs text-stone-600 font-semibold block">ચોકસાઈ ટકાવારી</span>
              <span className="text-xl sm:text-2xl font-black text-sky-600">
                {toGujaratiNumerals(Math.round((correctCount / questions.length) * 100))}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button
              onClick={startQuiz}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ફરીથી ક્વિઝ રમો</span>
            </button>

            {onViewCertificate && (
              <button
                onClick={() =>
                  onViewCertificate(
                    score,
                    Math.round((correctCount / questions.length) * 100)
                  )
                }
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>વિજય પ્રમાણપત્ર મેળવો</span>
              </button>
            )}
          </div>

          {/* Review of all Questions */}
          <div className="text-left border-t border-stone-200 pt-6">
            <h4 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
              <span>📋</span>
              <span>તમામ પ્રશ્નો અને જવાબોની ચકાસણી:</span>
            </h4>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {answerReview.map((rev, rIdx) => {
                const isCorrect = rev.isCorrect;
                return (
                  <div
                    key={rIdx}
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                      isCorrect
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-rose-50/60 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-stone-900 mb-1">
                        {toGujaratiNumerals(rIdx + 1)}. {rev.question.questionText}
                      </p>
                      {isCorrect ? (
                        <span className="text-emerald-700 font-bold shrink-0">✓ સાચું</span>
                      ) : (
                        <span className="text-rose-700 font-bold shrink-0">✗ ખોટું</span>
                      )}
                    </div>

                    <div className="space-y-0.5 text-stone-700">
                      <div>
                        <strong>સાચો સમાનાર્થી:</strong>{' '}
                        <span className="text-emerald-700 font-semibold">
                          {rev.question.options[rev.question.correctOptionIndex]}
                        </span>
                      </div>
                      {!isCorrect && rev.userSelected !== null && (
                        <div>
                          <strong>તમે પસંદ કરેલ:</strong>{' '}
                          <span className="text-rose-700">
                            {rev.question.options[rev.userSelected]}
                          </span>
                        </div>
                      )}
                      <div className="text-stone-600 italic mt-1">
                        {rev.question.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
