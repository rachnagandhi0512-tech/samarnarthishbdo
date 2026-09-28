import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { MatchingCard, SynonymWord, ChapterFilter } from '../types/game';
import { STD_8_CHAPTERS } from '../data/std8Synonyms';
import { generateMatchingCards, toGujaratiNumerals } from '../utils/gameHelpers';
import { playClickSound, playSuccessSound, playErrorSound, playFanfareSound, speakGujarati } from '../utils/audio';
import { RefreshCw, Lightbulb, Volume2, VolumeX, Trophy, Clock, CheckCircle2, Star, Sparkles, Filter } from 'lucide-react';

interface MatchingGameProps {
  onGameWon: (points: number, matchedWordIds: string[]) => void;
  initialChapterId?: ChapterFilter;
  onNavigateToChapters?: () => void;
  isMuted?: boolean;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({
  onGameWon,
  initialChapterId = 'palash_all',
  onNavigateToChapters,
  isMuted,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<ChapterFilter>(initialChapterId);
  const [pairCount, setPairCount] = useState<number>(6);

  useEffect(() => {
    if (initialChapterId !== undefined) {
      setSelectedChapter(initialChapterId);
    }
  }, [initialChapterId]);

  const [wordsCol, setWordsCol] = useState<MatchingCard[]>([]);
  const [synonymsCol, setSynonymsCol] = useState<MatchingCard[]>([]);
  const [sourceWords, setSourceWords] = useState<SynonymWord[]>([]);

  const [selectedWordCard, setSelectedWordCard] = useState<MatchingCard | null>(null);
  const [selectedSynonymCard, setSelectedSynonymCard] = useState<MatchingCard | null>(null);

  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hintActivePairId, setHintActivePairId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize new game round
  const startNewGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const { wordsColumn, synonymsColumn, sourceWords: src } = generateMatchingCards(pairCount, selectedChapter);

    setWordsCol(wordsColumn);
    setSynonymsCol(synonymsColumn);
    setSourceWords(src);
    setSelectedWordCard(null);
    setSelectedSynonymCard(null);
    setMatchedPairsCount(0);
    setMovesCount(0);
    setSeconds(0);
    setIsTimerRunning(true);
    setIsCompleted(false);
    setHintActivePairId(null);
  };

  useEffect(() => {
    startNewGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pairCount, selectedChapter]);

  // Timer tick
  useEffect(() => {
    if (isTimerRunning && !isCompleted) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isCompleted]);

  // Handle Card Click
  const handleCardClick = (card: MatchingCard) => {
    if (card.isMatched || isCompleted) return;

    playClickSound(isMuted);

    if (card.type === 'word') {
      if (selectedWordCard?.id === card.id) {
        setSelectedWordCard(null);
        return;
      }
      setSelectedWordCard(card);
      // Check if synonym was already selected
      if (selectedSynonymCard) {
        processMatchAttempt(card, selectedSynonymCard);
      }
    } else {
      if (selectedSynonymCard?.id === card.id) {
        setSelectedSynonymCard(null);
        return;
      }
      setSelectedSynonymCard(card);
      // Check if word was already selected
      if (selectedWordCard) {
        processMatchAttempt(selectedWordCard, card);
      }
    }
  };

  // Evaluate Match
  const processMatchAttempt = (wordCard: MatchingCard, synCard: MatchingCard) => {
    setMovesCount((m) => m + 1);
    const isCorrect = wordCard.wordId === synCard.wordId;

    if (isCorrect) {
      playSuccessSound(isMuted);
      setWordsCol((prev) =>
        prev.map((c) => (c.id === wordCard.id ? { ...c, isMatched: true, isSelected: false } : c))
      );
      setSynonymsCol((prev) =>
        prev.map((c) => (c.id === synCard.id ? { ...c, isMatched: true, isSelected: false } : c))
      );

      setSelectedWordCard(null);
      setSelectedSynonymCard(null);
      setHintActivePairId(null);

      const nextMatched = matchedPairsCount + 1;
      setMatchedPairsCount(nextMatched);

      // Check for round win
      if (nextMatched === pairCount) {
        handleGameWin();
      }
    } else {
      playErrorSound(isMuted);
      // Mark wrong visually
      setWordsCol((prev) =>
        prev.map((c) => (c.id === wordCard.id ? { ...c, isWrong: true } : c))
      );
      setSynonymsCol((prev) =>
        prev.map((c) => (c.id === synCard.id ? { ...c, isWrong: true } : c))
      );

      setTimeout(() => {
        setWordsCol((prev) =>
          prev.map((c) => (c.id === wordCard.id ? { ...c, isWrong: false } : c))
        );
        setSynonymsCol((prev) =>
          prev.map((c) => (c.id === synCard.id ? { ...c, isWrong: false } : c))
        );
        setSelectedWordCard(null);
        setSelectedSynonymCard(null);
      }, 550);
    }
  };

  // Game Win Handler
  const handleGameWin = () => {
    setIsCompleted(true);
    setIsTimerRunning(false);
    playFanfareSound(isMuted);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    // Calculate score
    const baseScore = pairCount * 25;
    const timeBonus = Math.max(0, 100 - seconds * 2);
    const movesPenalty = Math.max(0, (movesCount - pairCount) * 5);
    const finalScore = Math.max(20, baseScore + timeBonus - movesPenalty);

    const matchedIds = sourceWords.map((w) => w.id);
    onGameWon(finalScore, matchedIds);
  };

  // Give Hint
  const handleGiveHint = () => {
    const unmatchedWords = wordsCol.filter((w) => !w.isMatched);
    if (unmatchedWords.length === 0) return;

    const randomWord = unmatchedWords[0];
    setHintActivePairId(randomWord.wordId);
    playClickSound(isMuted);

    setTimeout(() => {
      setHintActivePairId(null);
    }, 2500);
  };

  // Stars rating (1, 2, or 3 stars)
  const calculateStars = (): number => {
    if (movesCount <= pairCount + 1 && seconds <= pairCount * 8) return 3;
    if (movesCount <= pairCount + 4 && seconds <= pairCount * 14) return 2;
    return 1;
  };

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${toGujaratiNumerals(mins.toString().padStart(2, '0'))}:${toGujaratiNumerals(
      secs.toString().padStart(2, '0')
    )}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Banner / Guidance */}
      <div className="bg-amber-500/10 border border-amber-200/80 rounded-2xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧩</span>
              <h2 className="text-lg sm:text-xl font-bold text-amber-950">
                જોડકાં જોડો રમત (સમાનાર્થી શબ્દો)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-amber-900/80 mt-0.5">
              ડાબી બાજુથી <strong>શબ્દ</strong> અને જમણી બાજુથી તેનો <strong>સાચો સમાનાર્થી</strong> પસંદ કરીને જોડી બનાવો.
            </p>
          </div>

          {/* Controls: Difficulty & Chapter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Pair Count selector */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs">
              {[4, 6, 8].map((count) => (
                <button
                  key={count}
                  onClick={() => setPairCount(count)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    pairCount === count
                      ? 'bg-amber-500 text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {toGujaratiNumerals(count)} જોડી
                </button>
              ))}
            </div>

            {/* Chapter filter */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-amber-600" />
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
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-xl border transition-colors ${
                isMuted
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-white text-emerald-800 border-emerald-200 shadow-2xs'
              }`}
              title={isMuted ? 'અવાજ બંધ છે (હેડરમાંથી ચાલુ કરી શકો છો)' : 'ઓડિયો ફીડબેક: સાચા/ખોટા અવાજો ચાલુ છે'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isMuted ? 'અવાજ બંધ' : 'ઓડિયો ચાલુ'}</span>
            </div>

            {onNavigateToChapters && (
              <button
                type="button"
                onClick={onNavigateToChapters}
                className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                title="પાઠવાર સૂચિ જુઓ"
              >
                પાઠ સૂચિ
              </button>
            )}
          </div>
        </div>

        {/* Selected Chapter indicator banner */}
        {selectedChapter !== 'all' && (
          <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <span className="font-bold">ચાલુ અભ્યાસક્રમ:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-white font-bold">
                {selectedChapter === 'palash_all'
                  ? '🌸 પલાશ (સમગ્ર નવો અભ્યાસક્રમ)'
                  : selectedChapter === 'gcert_all'
                  ? '📖 ધોરણ ૮ GCERT (સત્ર ૧ અને ૨)'
                  : STD_8_CHAPTERS.find((c) => c.id === selectedChapter)?.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedChapter('all')}
              className="text-amber-800 underline hover:text-amber-950 font-medium"
            >
              બધા પાઠોમાંથી રમો
            </button>
          </div>
        )}
      </div>

      {/* Game Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-600 uppercase block">જોડી બનેલી</span>
            <span className="text-base sm:text-lg font-bold text-stone-900">
              {toGujaratiNumerals(matchedPairsCount)} / {toGujaratiNumerals(pairCount)}
            </span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-600 uppercase block">સમય</span>
            <span className="text-base sm:text-lg font-bold text-stone-900 font-mono">
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-600 uppercase block">ચાલ (Moves)</span>
            <span className="text-base sm:text-lg font-bold text-stone-900">
              {toGujaratiNumerals(movesCount)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGiveHint}
            disabled={matchedPairsCount === pairCount}
            className="flex-1 h-full bg-white border border-amber-200 hover:bg-amber-50 disabled:opacity-50 text-amber-900 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs py-2.5 px-3"
            title="જોડકું શોધવામાં મદદ મેળવો"
          >
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>સંકેત (Hint)</span>
          </button>

          <button
            onClick={startNewGame}
            className="h-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl flex items-center justify-center p-3 transition-colors shadow-2xs"
            title="નવો રાઉન્ડ શરૂ કરો"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Matching Board: Left Column (Words) vs Right Column (Synonyms) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative">
        {/* Column 1: મૂળ શબ્દો (Words) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              સ્તંભ 'અ': મૂળ શબ્દ
            </span>
            <span className="text-xs text-stone-600 font-medium">ક્લિક કરીને પસંદ કરો</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {wordsCol.map((card) => {
              const isSelected = selectedWordCard?.id === card.id;
              const isHinted = hintActivePairId === card.wordId && !card.isMatched;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`group relative p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-200 select-none ${
                    card.isMatched
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 opacity-90 cursor-default'
                      : card.isWrong
                      ? 'bg-rose-50 border-rose-400 text-rose-950 animate-shake ring-2 ring-rose-300'
                      : isSelected
                      ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 scale-[1.02] shadow-sm cursor-pointer'
                      : isHinted
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 animate-pulse cursor-pointer'
                      : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-xs cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          card.isMatched
                            ? 'bg-emerald-200 text-emerald-800'
                            : isSelected
                            ? 'bg-amber-500 text-white'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {card.isMatched ? '✓' : 'અ'}
                      </span>
                      <span className="text-base sm:text-lg font-bold tracking-tight">
                        {card.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakGujarati(card.text, isMuted);
                      }}
                      className="p-1.5 rounded-lg text-stone-600 hover:text-amber-700 hover:bg-stone-100 transition-colors"
                      title="ઉચ્ચારણ સાંભળો"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: સમાનાર્થી શબ્દો (Synonyms) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              સ્તંભ 'બ': સાચો સમાનાર્થી શબ્દ
            </span>
            <span className="text-xs text-stone-600 font-medium">યોગ્ય જોડી જોડો</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {synonymsCol.map((card) => {
              const isSelected = selectedSynonymCard?.id === card.id;
              const isHinted = hintActivePairId === card.wordId && !card.isMatched;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`group relative p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-200 select-none ${
                    card.isMatched
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 opacity-90 cursor-default'
                      : card.isWrong
                      ? 'bg-rose-50 border-rose-400 text-rose-950 animate-shake ring-2 ring-rose-300'
                      : isSelected
                      ? 'bg-teal-100 border-teal-500 ring-2 ring-teal-400 scale-[1.02] shadow-sm cursor-pointer'
                      : isHinted
                      ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-300 animate-pulse cursor-pointer'
                      : 'bg-white border-stone-200 hover:border-teal-300 hover:shadow-xs cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          card.isMatched
                            ? 'bg-emerald-200 text-emerald-800'
                            : isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {card.isMatched ? '✓' : 'બ'}
                      </span>
                      <span className="text-base sm:text-lg font-bold tracking-tight">
                        {card.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakGujarati(card.text, isMuted);
                      }}
                      className="p-1.5 rounded-lg text-stone-600 hover:text-teal-700 hover:bg-stone-100 transition-colors"
                      title="ઉચ્ચારણ સાંભળો"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completion Modal / Victory Screen */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-xl border border-stone-200">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-1">
              શાબાશ! ઉત્તમ પ્રદર્શન! 🎉
            </h3>
            <p className="text-sm text-stone-600 mb-5">
              તમે ધોરણ ૮ ના સમાનાર્થી શબ્દોની તમામ {toGujaratiNumerals(pairCount)} જોડીઓ સફળતાપૂર્વક જોડી દીધી છે.
            </p>

            {/* Stars rating */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className={`w-7 h-7 ${
                    starIdx <= calculateStars()
                      ? 'fill-amber-400 text-amber-400 animate-bounce'
                      : 'fill-stone-100 text-stone-300'
                  }`}
                />
              ))}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50 rounded-xl mb-6 text-center">
              <div>
                <span className="text-[11px] text-stone-600 font-semibold block">કુલ સમય</span>
                <span className="text-sm sm:text-base font-bold text-stone-800">
                  {formatTime(seconds)}
                </span>
              </div>
              <div className="border-x border-stone-200">
                <span className="text-[11px] text-stone-600 font-semibold block">ચાલ (Moves)</span>
                <span className="text-sm sm:text-base font-bold text-stone-800">
                  {toGujaratiNumerals(movesCount)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-stone-600 font-semibold block">ચોકસાઈ</span>
                <span className="text-sm sm:text-base font-bold text-emerald-600">
                  {toGujaratiNumerals(Math.round((pairCount / Math.max(pairCount, movesCount)) * 100))}%
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={startNewGame}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ફરીથી રમો</span>
              </button>

              <button
                onClick={() => {
                  // Switch to harder count or another round
                  if (pairCount < 8) {
                    setPairCount((prev) => (prev === 4 ? 6 : 8));
                  } else {
                    startNewGame();
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>આગળનું સ્તર ➔</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
