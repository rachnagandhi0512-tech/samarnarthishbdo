import React, { useState, useEffect } from 'react';
import { SynonymWord, ChapterFilter } from '../types/game';
import { STD_8_SYNONYMS, STD_8_CHAPTERS } from '../data/std8Synonyms';
import { toGujaratiNumerals, shuffleArray, getWordsByFilter } from '../utils/gameHelpers';
import { playClickSound, playSuccessSound, speakGujarati } from '../utils/audio';
import { RotateCw, Volume2, CheckCircle2, RefreshCw, ChevronLeft, ChevronRight, Filter, BookOpen } from 'lucide-react';

interface FlashcardsGameProps {
  masteredIds: string[];
  onMarkMastered: (wordId: string) => void;
  initialChapterId?: ChapterFilter;
  onNavigateToChapters?: () => void;
  isMuted?: boolean;
}

export const FlashcardsGame: React.FC<FlashcardsGameProps> = ({
  masteredIds,
  onMarkMastered,
  initialChapterId = 'palash_all',
  onNavigateToChapters,
  isMuted,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<ChapterFilter>(initialChapterId);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (initialChapterId !== undefined) {
      setSelectedChapter(initialChapterId);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [initialChapterId]);

  // Filter words
  const wordsList: SynonymWord[] = React.useMemo(() => {
    return getWordsByFilter(selectedChapter);
  }, [selectedChapter]);

  const currentWord = wordsList[currentIndex] || wordsList[0];
  const isMastered = currentWord && masteredIds.includes(currentWord.id);

  const handleNext = () => {
    playClickSound(isMuted);
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % wordsList.length);
  };

  const handlePrev = () => {
    playClickSound(isMuted);
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + wordsList.length) % wordsList.length);
  };

  const handleFlip = () => {
    playClickSound(isMuted);
    setIsFlipped(!isFlipped);
  };

  const handleMasteredClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentWord) return;
    playSuccessSound(isMuted);
    onMarkMastered(currentWord.id);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Banner */}
      <div className="bg-indigo-500/10 border border-indigo-200/80 rounded-2xl p-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h2 className="text-lg sm:text-xl font-bold text-indigo-950">
                શબ્દ કાર્ડ્સ પુનરાવર્તન (Flashcards)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-indigo-900/80 mt-0.5">
              કાર્ડ પર ક્લિક કરી સમાનાર્થી શબ્દો, અર્થ અને વાક્ય પ્રયોગ શીખો.
            </p>
          </div>

          {/* Chapter Filter */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <select
                value={selectedChapter}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'all' || val === 'palash_all' || val === 'gcert_all') {
                    setSelectedChapter(val);
                  } else {
                    setSelectedChapter(Number(val));
                  }
                  setCurrentIndex(0);
                  setIsFlipped(false);
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
          </div>
        </div>
      </div>

      {/* Progress Counter */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-stone-600 mb-3 px-1">
        <span>
          કાર્ડ {toGujaratiNumerals(currentIndex + 1)} / {toGujaratiNumerals(wordsList.length)}
        </span>
        <span className="flex items-center gap-1.5 text-emerald-700">
          <CheckCircle2 className="w-4 h-4" />
          <span>કુલ શીખેલા: {toGujaratiNumerals(masteredIds.length)}</span>
        </span>
      </div>

      {/* Flashcard Display */}
      {currentWord && (
        <div
          onClick={handleFlip}
          className="relative min-h-[320px] sm:min-h-[360px] bg-white rounded-3xl border-2 border-indigo-200/80 shadow-md p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-indigo-300 select-none"
        >
          {/* Top Tag & Audio */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              {currentWord.chapter}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakGujarati(
                    isFlipped
                      ? `${currentWord.word} નો સમાનાર્થી ${currentWord.primarySynonym}`
                      : currentWord.word,
                    isMuted
                  );
                }}
                className="p-2 rounded-xl text-stone-600 hover:text-indigo-700 hover:bg-stone-100 transition-colors"
                title="ઉચ્ચારણ સાંભળો"
              >
                <Volume2 className="w-5 h-5 text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={handleMasteredClick}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-colors border ${
                  isMastered
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isMastered ? 'શીખી લીધું ✓' : 'શીખાયું?'}</span>
              </button>
            </div>
          </div>

          {/* Card Center Content: Front (Word) vs Back (Synonyms & Meaning) */}
          <div className="py-6 sm:py-8 text-center">
            {!isFlipped ? (
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-widest text-stone-600 font-semibold block">
                  મૂળ શબ્દ
                </span>
                <h3 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
                  {currentWord.word}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 italic">
                  (સમાનાર્થી અને અર્થ જોવા માટે કાર્ડ પર ક્લિક કરો)
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200 text-left">
                <div className="text-center">
                  <span className="text-xs uppercase tracking-widest text-stone-600 font-semibold block mb-1">
                    મુખ્ય સમાનાર્થી
                  </span>
                  <h4 className="text-2xl sm:text-4xl font-bold text-indigo-900">
                    {currentWord.primarySynonym}
                  </h4>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-2 text-xs sm:text-sm">
                  <div>
                    <strong className="text-indigo-950">અન્ય સમાનાર્થીઓ:</strong>{' '}
                    <span className="font-semibold text-indigo-900">
                      {currentWord.synonyms.join(', ')}
                    </span>
                  </div>

                  <div>
                    <strong className="text-stone-900">ગુજરાતી અર્થ:</strong>{' '}
                    <span className="text-stone-700">{currentWord.meaning}</span>
                  </div>

                  <div className="pt-1 border-t border-indigo-100">
                    <strong className="text-stone-900">વાક્ય પ્રયોગ:</strong>{' '}
                    <span className="text-stone-700 italic">"{currentWord.exampleSentence}"</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Card Footer */}
          <div className="flex items-center justify-between text-xs text-stone-600 pt-3 border-t border-stone-100">
            <span className="flex items-center gap-1 text-indigo-600 font-medium">
              <RotateCw className="w-3.5 h-3.5" />
              <span>ફેરવવા માટે ક્લિક કરો</span>
            </span>
            <span>સરળતા: {currentWord.difficulty}</span>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 mt-5">
        <button
          onClick={handlePrev}
          className="flex-1 py-3 px-4 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-bold text-sm transition-colors shadow-2xs flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>પાછળનું કાર્ડ</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setIsFlipped(!isFlipped);
          }}
          className="py-3 px-5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-sm hover:bg-indigo-100 transition-colors shadow-2xs flex items-center gap-1.5"
        >
          <RotateCw className="w-4 h-4" />
          <span>કાર્ડ ફેરવો</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors shadow-2xs flex items-center justify-center gap-2"
        >
          <span>આગળનું કાર્ડ</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
