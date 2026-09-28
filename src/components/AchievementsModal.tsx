import React from 'react';
import { UserStats } from '../types/game';
import { BADGES_LIST } from '../data/std8Synonyms';
import { toGujaratiNumerals } from '../utils/gameHelpers';
import { X, Award, CheckCircle2, Lock, Flame, Trophy, BookOpen, RefreshCw } from 'lucide-react';

interface AchievementsModalProps {
  stats: UserStats;
  isOpen: boolean;
  onClose: () => void;
  onResetStats: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  stats,
  isOpen,
  onClose,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const earnedSet = new Set(stats.earnedBadgeIds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900">તમારી સિદ્ધિઓ અને પ્રગતિ</h3>
            <p className="text-xs text-stone-500">
              સમાનાર્થી શબ્દો રમતમાં પ્રાપ્ત કરેલા પદકો અને સ્કોર
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-stone-50 rounded-2xl mb-6 text-center">
          <div className="p-2">
            <span className="text-[11px] text-stone-600 font-semibold block">કુલ ગુણ</span>
            <span className="text-base sm:text-lg font-bold text-amber-600">
              {toGujaratiNumerals(stats.totalPoints)}
            </span>
          </div>

          <div className="p-2 border-l border-stone-200">
            <span className="text-[11px] text-stone-600 font-semibold block">જોડકાં વિજય</span>
            <span className="text-base sm:text-lg font-bold text-stone-800">
              {toGujaratiNumerals(stats.matchingGamesWon)}
            </span>
          </div>

          <div className="p-2 border-l border-stone-200">
            <span className="text-[11px] text-stone-600 font-semibold block">MCQ સાચા</span>
            <span className="text-base sm:text-lg font-bold text-emerald-600">
              {toGujaratiNumerals(stats.totalMcqCorrect)}
            </span>
          </div>

          <div className="p-2 border-l border-stone-200">
            <span className="text-[11px] text-stone-600 font-semibold block">મહત્તમ સ્ટ્રીક</span>
            <span className="text-base sm:text-lg font-bold text-orange-600">
              {toGujaratiNumerals(stats.highestStreak)}
            </span>
          </div>
        </div>

        {/* Badges List */}
        <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
          મેળવેલા પદકો ({toGujaratiNumerals(stats.earnedBadgeIds.length)} / {toGujaratiNumerals(BADGES_LIST.length)}):
        </h4>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {BADGES_LIST.map((badge) => {
            const isEarned = earnedSet.has(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                  isEarned
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-stone-50/60 border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-sm font-bold text-stone-900">
                        {badge.title}
                      </h5>
                      {isEarned && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <p className="text-xs text-stone-600">{badge.description}</p>
                    <span className="text-[11px] text-stone-600">શરત: {badge.conditionDescription}</span>
                  </div>
                </div>

                <div>
                  {isEarned ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                      પ્રાપ્ત ✓
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-stone-600">
                      <Lock className="w-3 h-3" />
                      <span>બાકી</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset & Close Buttons */}
        <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('શું તમે તમારો સ્કોર અને સિદ્ધિઓ રીસેટ કરવા માંગો છો?')) {
                onResetStats();
              }
            }}
            className="text-xs text-stone-600 hover:text-rose-600 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>પ્રગતિ રીસેટ કરો</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            સમજાઈ ગયું
          </button>
        </div>
      </div>
    </div>
  );
};
