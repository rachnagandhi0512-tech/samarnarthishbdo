import React, { useState, useEffect } from 'react';
import { GameMode, UserStats, ChapterFilter } from './types/game';
import { Header } from './components/Header';
import { ChapterSelectionView } from './components/ChapterSelectionView';
import { MatchingGame } from './components/MatchingGame';
import { McqGame } from './components/McqGame';
import { FlashcardsGame } from './components/FlashcardsGame';
import { DictionaryView } from './components/DictionaryView';
import { CertificateModal } from './components/CertificateModal';
import { AchievementsModal } from './components/AchievementsModal';
import { loadUserStats, saveUserStats, evaluateBadges, toGujaratiNumerals } from './utils/gameHelpers';
import { getSoundMuted, setSoundMuted } from './utils/audio';
import { Sparkles, BookOpen, Shuffle, HelpCircle, GraduationCap, Heart, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('chapters');
  const [activeChapterId, setActiveChapterId] = useState<ChapterFilter>('palash_all');
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [isMuted, setIsMuted] = useState<boolean>(getSoundMuted);

  // Modals
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [certificateData, setCertificateData] = useState<{
    isOpen: boolean;
    score: number;
    accuracy: number;
  }>({
    isOpen: false,
    score: 0,
    accuracy: 100,
  });

  // Save stats on change & evaluate badges
  const updateStats = (modifier: (prev: UserStats) => UserStats) => {
    setStats((prev) => {
      const next = modifier(prev);
      const { updatedStats } = evaluateBadges(next);
      saveUserStats(updatedStats);
      return updatedStats;
    });
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setSoundMuted(nextMuted);
  };

  // Matching game won handler
  const handleMatchingWon = (points: number, wordIds: string[]) => {
    updateStats((prev) => {
      const combinedMastered = Array.from(new Set([...prev.masteredWordIds, ...wordIds]));
      return {
        ...prev,
        matchingGamesPlayed: prev.matchingGamesPlayed + 1,
        matchingGamesWon: prev.matchingGamesWon + 1,
        totalPoints: prev.totalPoints + points,
        masteredWordIds: combinedMastered,
      };
    });
  };

  // MCQ quiz completed handler
  const handleQuizCompleted = (
    quizScore: number,
    correctCount: number,
    wrongCount: number,
    wordIds: string[]
  ) => {
    updateStats((prev) => {
      const combinedMastered = Array.from(new Set([...prev.masteredWordIds, ...wordIds]));
      const newStreak = Math.max(prev.highestStreak, correctCount);
      return {
        ...prev,
        mcqQuizzesPlayed: prev.mcqQuizzesPlayed + 1,
        totalMcqCorrect: prev.totalMcqCorrect + correctCount,
        totalMcqWrong: prev.totalMcqWrong + wrongCount,
        totalPoints: prev.totalPoints + quizScore,
        highestStreak: newStreak,
        masteredWordIds: combinedMastered,
      };
    });
  };

  // Mark word as mastered in flashcard
  const handleMarkMastered = (wordId: string) => {
    updateStats((prev) => {
      const isAlready = prev.masteredWordIds.includes(wordId);
      const nextIds = isAlready
        ? prev.masteredWordIds.filter((id) => id !== wordId)
        : [...prev.masteredWordIds, wordId];
      return {
        ...prev,
        masteredWordIds: nextIds,
        totalPoints: isAlready ? prev.totalPoints : prev.totalPoints + 10,
      };
    });
  };

  // Reset progress
  const handleResetStats = () => {
    const freshStats: UserStats = {
      matchingGamesPlayed: 0,
      matchingGamesWon: 0,
      mcqQuizzesPlayed: 0,
      totalMcqCorrect: 0,
      totalMcqWrong: 0,
      totalPoints: 0,
      highestStreak: 0,
      masteredWordIds: [],
      earnedBadgeIds: [],
    };
    saveUserStats(freshStats);
    setStats(freshStats);
    setIsAchievementsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans text-stone-800">
      {/* Top App Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        points={stats.totalPoints}
        streak={stats.highestStreak}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        earnedBadgesCount={stats.earnedBadgeIds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentMode === 'chapters' && (
          <ChapterSelectionView
            onPlayMatching={(chId) => {
              setActiveChapterId(chId);
              setCurrentMode('matching');
            }}
            onPlayMcq={(chId) => {
              setActiveChapterId(chId);
              setCurrentMode('mcq');
            }}
            onStudyFlashcard={(chId) => {
              setActiveChapterId(chId);
              setCurrentMode('flashcard');
            }}
          />
        )}

        {currentMode === 'matching' && (
          <MatchingGame
            onGameWon={handleMatchingWon}
            initialChapterId={activeChapterId}
            onNavigateToChapters={() => setCurrentMode('chapters')}
            isMuted={isMuted}
          />
        )}

        {currentMode === 'mcq' && (
          <McqGame
            onQuizCompleted={handleQuizCompleted}
            initialChapterId={activeChapterId}
            onNavigateToChapters={() => setCurrentMode('chapters')}
            onViewCertificate={(sc, acc) =>
              setCertificateData({ isOpen: true, score: sc, accuracy: acc })
            }
            isMuted={isMuted}
          />
        )}

        {currentMode === 'flashcard' && (
          <FlashcardsGame
            masteredIds={stats.masteredWordIds}
            onMarkMastered={handleMarkMastered}
            initialChapterId={activeChapterId}
            onNavigateToChapters={() => setCurrentMode('chapters')}
            isMuted={isMuted}
          />
        )}

        {currentMode === 'dictionary' && <DictionaryView />}
      </main>

      {/* Motivational Bottom Bar for Students */}
      <section className="border-t border-stone-200/80 bg-white/70 py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                શ્રી મઘાસર પ્રાથમિક શાળા • ધોરણ ૮ ગુજરાતી (પલાશ નવો અભ્યાસક્રમ)
              </h4>
              <p className="text-xs text-stone-500">
                વિદ્યાર્થીઓ માટે 'પલાશ' અને GCERT ના તમામ પાઠો-કાવ્યોના સમાનાર્થી શબ્દો, રમતો અને સચોટ વ્યાકરણ.
              </p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMode('chapters')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                currentMode === 'chapters'
                  ? 'bg-amber-500 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>પાઠ સૂચિ</span>
            </button>

            <button
              onClick={() => {
                setActiveChapterId('all');
                setCurrentMode('matching');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                currentMode === 'matching'
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-600" />
              <span>જોડકાં</span>
            </button>

            <button
              onClick={() => {
                setActiveChapterId('all');
                setCurrentMode('mcq');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                currentMode === 'mcq'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>MCQ ક્વિઝ</span>
            </button>

            <button
              onClick={() => setCurrentMode('dictionary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                currentMode === 'dictionary'
                  ? 'bg-teal-100 text-teal-900'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>શબ્દકોશ</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 py-4 px-4 text-center text-xs text-stone-500">
        <p className="flex items-center justify-center gap-1">
          <span>ગુજરાત રાજ્ય શાળા પાઠ્યપુસ્તક મંડળ - ધોરણ ૮ ગુજરાતી અભ્યાસક્રમ</span>
        </p>
      </footer>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={certificateData.isOpen}
        score={certificateData.score}
        accuracy={certificateData.accuracy}
        onClose={() =>
          setCertificateData((prev) => ({ ...prev, isOpen: false }))
        }
      />

      {/* Achievements Modal */}
      <AchievementsModal
        stats={stats}
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        onResetStats={handleResetStats}
      />
    </div>
  );
}
