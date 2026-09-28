import React from 'react';
import { GameMode } from '../types/game';
import { Volume2, VolumeX, Award, BookOpen, Shuffle, HelpCircle, Sparkles } from 'lucide-react';
import { toGujaratiNumerals } from '../utils/gameHelpers';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  points: number;
  streak: number;
  onOpenAchievements: () => void;
  earnedBadgesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  isMuted,
  onToggleMute,
  points,
  streak,
  onOpenAchievements,
  earnedBadgesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Grade Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-500 text-white font-black flex items-center justify-center text-xl shadow-xs">
                🌸
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                    શ્રી મઘાસર પ્રાથમિક શાળા
                  </h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    ધોરણ ૮
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    🌸 પલાશ નવો અભ્યાસક્રમ
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  ગુજરાતી સમાનાર્થી શબ્દોની શૈક્ષણિક રમત સંગ્રહ (જોડકાં જોડો & MCQ ક્વિઝ)
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={onToggleMute}
                aria-label={isMuted ? 'અવાજ ચાલુ કરો' : 'અવાજ બંધ કરો'}
                className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title={isMuted ? 'અવાજ ચાલુ કરો' : 'અવાજ બંધ કરો'}
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-stone-700" />}
              </button>
              <button
                onClick={onOpenAchievements}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>{toGujaratiNumerals(earnedBadgesCount)}/૬</span>
              </button>
            </div>
          </div>

          {/* Navigation Game Modes */}
          <nav className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto scrollbar-none">
            <button
              onClick={() => onSelectMode('chapters')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                currentMode === 'chapters'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>પાઠ પ્રમાણે (અભ્યાસક્રમ)</span>
            </button>

            <button
              onClick={() => onSelectMode('matching')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                currentMode === 'matching'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Shuffle className="w-4 h-4 text-amber-600" />
              <span>જોડકાં રમત</span>
            </button>

            <button
              onClick={() => onSelectMode('mcq')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                currentMode === 'mcq'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>MCQ ક્વિઝ</span>
            </button>

            <button
              onClick={() => onSelectMode('flashcard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                currentMode === 'flashcard'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>કાર્ડ્સ</span>
            </button>

            <button
              onClick={() => onSelectMode('dictionary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                currentMode === 'dictionary'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>શબ્દકોશ</span>
            </button>
          </nav>

          {/* Desktop Stats & Quick Actions */}
          <div className="hidden md:flex items-center gap-3">
            {streak > 1 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold animate-pulse">
                <span>🔥</span>
                <span>{toGujaratiNumerals(streak)} સળંગ</span>
              </div>
            )}

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-stone-600 font-semibold block">કુલ ગુણ</span>
              <span className="text-base font-bold text-stone-900">
                {toGujaratiNumerals(points)}
              </span>
            </div>

            <button
              onClick={onOpenAchievements}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>સિદ્ધિઓ ({toGujaratiNumerals(earnedBadgesCount)})</span>
            </button>

            <button
              onClick={onToggleMute}
              aria-label={isMuted ? 'અવાજ ચાલુ કરો' : 'અવાજ બંધ કરો'}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors"
              title={isMuted ? 'અવાજ ચાલુ કરો' : 'અવાજ બંધ કરો'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-stone-700" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
