import { SynonymWord, MatchingCard, McqQuestion, UserStats, ChapterFilter } from '../types/game';
import { STD_8_SYNONYMS, BADGES_LIST } from '../data/std8Synonyms';

// Shuffle an array using Fisher-Yates
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper to filter words based on ChapterFilter
export function getWordsByFilter(filter?: ChapterFilter): SynonymWord[] {
  if (!filter || filter === 'all') {
    return STD_8_SYNONYMS;
  }
  if (filter === 'palash_all') {
    const palashWords = STD_8_SYNONYMS.filter(
      (w) => w.bookSeries === 'palash' || w.chapterNumber >= 100
    );
    return palashWords.length > 0 ? palashWords : STD_8_SYNONYMS;
  }
  if (filter === 'gcert_all') {
    const gcertWords = STD_8_SYNONYMS.filter(
      (w) => w.bookSeries === 'gcert_sem' || (w.chapterNumber > 0 && w.chapterNumber < 100)
    );
    return gcertWords.length > 0 ? gcertWords : STD_8_SYNONYMS;
  }
  if (typeof filter === 'number') {
    const chWords = STD_8_SYNONYMS.filter((w) => w.chapterNumber === filter);
    return chWords.length > 0 ? chWords : STD_8_SYNONYMS;
  }
  return STD_8_SYNONYMS;
}

// Generate Matching Pair Cards
export function generateMatchingCards(
  count: number = 6,
  chapterFilter?: ChapterFilter
): {
  wordsColumn: MatchingCard[];
  synonymsColumn: MatchingCard[];
  sourceWords: SynonymWord[];
} {
  const pool = getWordsByFilter(chapterFilter);

  const actualCount = Math.min(count, pool.length);
  const selectedWords = shuffleArray(pool).slice(0, actualCount);

  const wordsColumn: MatchingCard[] = selectedWords.map((item, idx) => ({
    id: `w-${item.id}-${idx}`,
    wordId: item.id,
    text: item.word,
    type: 'word',
    isMatched: false,
    isSelected: false,
    isWrong: false,
  }));

  const synonymsColumn: MatchingCard[] = shuffleArray(
    selectedWords.map((item, idx) => ({
      id: `s-${item.id}-${idx}`,
      wordId: item.id,
      text: item.primarySynonym,
      type: 'synonym',
      isMatched: false,
      isSelected: false,
      isWrong: false,
    }))
  );

  return {
    wordsColumn: shuffleArray(wordsColumn),
    synonymsColumn,
    sourceWords: selectedWords,
  };
}

// Generate Multiple Choice Questions (MCQ)
export function generateMcqQuestions(
  count: number = 10,
  chapterFilter?: ChapterFilter
): McqQuestion[] {
  const pool = getWordsByFilter(chapterFilter);

  const actualCount = Math.min(count, pool.length);
  const selectedWords = shuffleArray(pool).slice(0, actualCount);

  return selectedWords.map((target, idx) => {
    // Generate distractors from other words in the syllabus
    const otherWords = STD_8_SYNONYMS.filter((w) => w.id !== target.id);
    const shuffledOthers = shuffleArray(otherWords);

    // Random question type for diversity (mostly direct, some negative)
    const questionType = idx % 4 === 3 ? 'not_synonym' : 'direct';

    if (questionType === 'not_synonym') {
      // 3 correct synonyms and 1 wrong distractor
      const correctSyns = [...target.synonyms];
      // if not enough synonyms, pick primary plus 1 or 2
      while (correctSyns.length < 3) {
        correctSyns.push(target.primarySynonym);
      }
      const threeSyns = shuffleArray(Array.from(new Set(correctSyns))).slice(0, 3);
      const wrongDistractor = shuffledOthers[0].primarySynonym;
      const allOptions = shuffleArray([...threeSyns, wrongDistractor]);
      const correctIdx = allOptions.indexOf(wrongDistractor);

      return {
        id: `q-${idx}-${target.id}`,
        wordId: target.id,
        questionText: `નીચેનામાંથી કયો શબ્દ '${target.word}' નો સમાનાર્થી નથી?`,
        targetWord: target.word,
        options: allOptions,
        correctOptionIndex: correctIdx,
        explanation: `'${wrongDistractor}' એ '${target.word}' નો સમાનાર્થી નથી. '${target.word}' ના સાચા સમાનાર્થી: ${target.synonyms.join(', ')} છે.`,
        contextSentence: target.exampleSentence,
        type: 'not_synonym',
      };
    } else {
      // Standard Direct Synonym Question
      const correctAnswer = target.primarySynonym;
      const wrongOptions = shuffledOthers.slice(0, 3).map((w) => w.primarySynonym);
      const allOptions = shuffleArray([correctAnswer, ...wrongOptions]);
      const correctIdx = allOptions.indexOf(correctAnswer);

      return {
        id: `q-${idx}-${target.id}`,
        wordId: target.id,
        questionText: `'${target.word}' શબ્દનો સાચો સમાનાર્થી શબ્દ કયો છે?`,
        targetWord: target.word,
        options: allOptions,
        correctOptionIndex: correctIdx,
        explanation: `'${target.word}' નો સાચો સમાનાર્થી '${correctAnswer}' છે. (${target.meaning})`,
        contextSentence: target.exampleSentence,
        type: 'direct',
      };
    }
  });
}

const STATS_KEY = 'std8_gujarati_stats_v1';

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') {
    return defaultStats();
  }
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw);
  } catch {
    return defaultStats();
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

function defaultStats(): UserStats {
  return {
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
}

export function evaluateBadges(stats: UserStats): { updatedStats: UserStats; newlyEarned: string[] } {
  const currentBadges = new Set(stats.earnedBadgeIds);
  const newlyEarned: string[] = [];

  if (stats.matchingGamesWon >= 1 && !currentBadges.has('first_match')) {
    newlyEarned.push('first_match');
  }
  if (stats.matchingGamesWon >= 5 && !currentBadges.has('match_master')) {
    newlyEarned.push('match_master');
  }
  if (stats.mcqQuizzesPlayed >= 1 && !currentBadges.has('quiz_starter')) {
    newlyEarned.push('quiz_starter');
  }
  if (stats.highestStreak >= 5 && !currentBadges.has('streak_five')) {
    newlyEarned.push('streak_five');
  }
  if (stats.totalPoints >= 500 && !currentBadges.has('century_scorer')) {
    newlyEarned.push('century_scorer');
  }
  if (stats.masteredWordIds.length >= 20 && !currentBadges.has('word_collector')) {
    newlyEarned.push('word_collector');
  }

  const updatedBadges = Array.from(new Set([...stats.earnedBadgeIds, ...newlyEarned]));
  const updatedStats: UserStats = {
    ...stats,
    earnedBadgeIds: updatedBadges,
  };

  return { updatedStats, newlyEarned };
}

// Convert English numbers to Gujarati numerals
export function toGujaratiNumerals(num: number | string): string {
  const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return String(num).replace(/[0-9]/g, (w) => gujaratiDigits[+w]);
}
