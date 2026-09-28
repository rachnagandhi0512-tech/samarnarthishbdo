export interface SynonymWord {
  id: string;
  word: string; // મૂળ શબ્દ
  primarySynonym: string; // મુખ્ય સમાનાર્થી
  synonyms: string[]; // અન્ય સમાનાર્થી શબ્દો
  meaning: string; // અર્થ
  exampleSentence: string; // વાક્ય પ્રયોગ
  chapter: string; // પાઠ / કાવ્ય નું નામ
  chapterNumber: number; // ક્રમ
  bookSeries?: 'palash' | 'gcert_sem';
  difficulty: 'સરળ' | 'મધ્યમ' | 'કઠિન';
}

export type ChapterFilter = number | 'all' | 'palash_all' | 'gcert_all';

export interface ChapterInfo {
  id: number;
  number: number;
  name: string;
  shortName: string;
  bookSeries: 'palash' | 'gcert_sem';
  semester: 1 | 2;
  type: 'પાઠ' | 'કાવ્ય' | 'વ્યાકરણ' | 'વાર્તા';
  author?: string;
  description?: string;
}

export type GameMode = 'chapters' | 'matching' | 'mcq' | 'flashcard' | 'dictionary';

export interface MatchingCard {
  id: string;
  wordId: string;
  text: string;
  type: 'word' | 'synonym';
  isMatched: boolean;
  isSelected: boolean;
  isWrong: boolean;
}

export interface McqQuestion {
  id: string;
  wordId: string;
  questionText: string;
  targetWord: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  contextSentence?: string;
  type: 'direct' | 'not_synonym' | 'context';
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  wrongAnswers: number;
  selectedOption: number | null;
  isAnswerSubmitted: boolean;
  timeRemaining: number;
  used5050: boolean;
  usedHint: boolean;
  hiddenOptionIndexes: number[];
  answersLog: {
    question: McqQuestion;
    userSelected: number;
    isCorrect: boolean;
  }[];
}

export interface UserStats {
  matchingGamesPlayed: number;
  matchingGamesWon: number;
  mcqQuizzesPlayed: number;
  totalMcqCorrect: number;
  totalMcqWrong: number;
  totalPoints: number;
  highestStreak: number;
  masteredWordIds: string[];
  earnedBadgeIds: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  conditionDescription: string;
}
