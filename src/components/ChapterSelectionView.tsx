import React, { useState } from 'react';
import { ChapterInfo, SynonymWord, ChapterFilter } from '../types/game';
import { STD_8_CHAPTERS, STD_8_SYNONYMS } from '../data/std8Synonyms';
import { toGujaratiNumerals } from '../utils/gameHelpers';
import { speakGujarati, playClickSound } from '../utils/audio';
import {
  BookOpen,
  Shuffle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Volume2,
  GraduationCap,
  Sparkle,
  Filter,
} from 'lucide-react';

interface ChapterSelectionViewProps {
  onPlayMatching: (chapterId: ChapterFilter) => void;
  onPlayMcq: (chapterId: ChapterFilter) => void;
  onStudyFlashcard: (chapterId: ChapterFilter) => void;
}

export const ChapterSelectionView: React.FC<ChapterSelectionViewProps> = ({
  onPlayMatching,
  onPlayMcq,
  onStudyFlashcard,
}) => {
  const [selectedBookTab, setSelectedBookTab] = useState<'palash' | 'all' | 'sem1' | 'sem2'>('palash');
  const [expandedChapterId, setExpandedChapterId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter chapters based on active tab & search query
  const filteredChapters = STD_8_CHAPTERS.filter((ch) => {
    let matchesTab = true;
    if (selectedBookTab === 'palash') {
      matchesTab = ch.bookSeries === 'palash';
    } else if (selectedBookTab === 'sem1') {
      matchesTab = ch.semester === 1;
    } else if (selectedBookTab === 'sem2') {
      matchesTab = ch.semester === 2;
    }

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      ch.name.toLowerCase().includes(query) ||
      (ch.author && ch.author.toLowerCase().includes(query)) ||
      (ch.description && ch.description.toLowerCase().includes(query));

    return matchesTab && matchesSearch;
  });

  const getChapterWords = (chapterId: number): SynonymWord[] => {
    return STD_8_SYNONYMS.filter((w) => w.chapterNumber === chapterId);
  };

  const toggleExpand = (id: number) => {
    playClickSound();
    setExpandedChapterId((prev) => (prev === id ? null : id));
  };

  const palashCount = STD_8_CHAPTERS.filter((c) => c.bookSeries === 'palash').length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Hero Banner */}
      <div className="bg-linear-to-r from-emerald-600/15 via-amber-500/15 to-orange-500/15 border border-amber-200/90 rounded-3xl p-5 sm:p-6 mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-stone-900 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5">
                <span>🏫</span>
                <span>શ્રી મઘાસર પ્રાથમિક શાળા</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xs flex items-center gap-1">
                <span>🌸</span>
                <span>પલાશ (Palash) - નવો અભ્યાસક્રમ</span>
              </span>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                GCERT ધોરણ ૮ ગુજરાતી
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              શ્રી મઘાસર પ્રાથમિક શાળા - 'પલાશ' પાઠ પ્રમાણે રમતો
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              વિદ્યાર્થીઓ માટે નવા પાઠ્યપુસ્તકના પાઠ (જેમ કે <strong>'આ તો ઈશ તણો આવાસ'</strong>, <strong>'સાઇકલ-સવારીની ખાટીમીઠી'</strong>, <strong>'ગઢની રઢ છોડો !'</strong>, <strong>'અષાઢે'</strong> વગેરે) ની મજેદાર <strong>જોડકાં રમત</strong> અને <strong>MCQ ક્વિઝ</strong>!
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-emerald-200 text-center shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-emerald-700 block">
                {toGujaratiNumerals(palashCount)}
              </span>
              <span className="text-[11px] font-semibold text-stone-600 uppercase">પલાશ પાઠો</span>
            </div>
            <div className="p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-amber-200 text-center shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-amber-700 block">
                {toGujaratiNumerals(STD_8_SYNONYMS.length)}+
              </span>
              <span className="text-[11px] font-semibold text-stone-600 uppercase">સમાનાર્થી</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌸 પલાશ વિશેષ ક્વિક પ્લે (Fast Start Entire Palash Book) */}
      <div className="bg-gradient-to-r from-emerald-50 via-amber-50 to-orange-50 border border-emerald-200 rounded-2xl p-4 mb-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
              🌸
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                પલાશ વિશેષ ક્વિક-પ્લે (આખા પુસ્તકના સર્વ પાઠોમાંથી રમો)
              </h4>
              <p className="text-[11px] sm:text-xs text-stone-600">
                તમામ પલાશ પાઠોના મિશ્ર સમાનાર્થી શબ્દોની ઝડપી રમત શરૂ કરો:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onPlayMatching('palash_all')}
              className="flex-1 sm:flex-initial px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>પલાશ જોડકાં રમત</span>
            </button>
            <button
              onClick={() => onPlayMcq('palash_all')}
              className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>પલાશ MCQ ક્વિઝ</span>
            </button>
            <button
              onClick={() => onStudyFlashcard('palash_all')}
              className="flex-1 sm:flex-initial px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>પલાશ ફ્લેશકાર્ડ્સ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-2xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              playClickSound();
              setSelectedBookTab('palash');
            }}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedBookTab === 'palash'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <span>🌿</span>
            <span>પલાશ નવો અભ્યાસક્રમ ({toGujaratiNumerals(palashCount)})</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setSelectedBookTab('sem1');
            }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              selectedBookTab === 'sem1'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            સત્ર ૧
          </button>

          <button
            onClick={() => {
              playClickSound();
              setSelectedBookTab('sem2');
            }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              selectedBookTab === 'sem2'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            સત્ર ૨
          </button>

          <button
            onClick={() => {
              playClickSound();
              setSelectedBookTab('all');
            }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              selectedBookTab === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            તમામ ({toGujaratiNumerals(STD_8_CHAPTERS.length)})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="પાઠનું નામ શોધો..."
            className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-600 hover:text-stone-700 bg-stone-100 rounded-full px-1.5 py-0.5"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChapters.map((ch) => {
          const chapterWords = getChapterWords(ch.id);
          const isExpanded = expandedChapterId === ch.id;
          const isPalash = ch.bookSeries === 'palash';

          return (
            <div
              key={ch.id}
              className={`bg-white rounded-2xl border shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden ${
                isPalash
                  ? 'border-emerald-200/80 hover:border-emerald-400'
                  : 'border-stone-200 hover:border-amber-300'
              }`}
            >
              <div className="p-4 sm:p-5">
                {/* Header row: Badge, Type, Word count */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {isPalash ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                        <span>🌿</span>
                        <span>પલાશ</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200">
                        સત્ર {toGujaratiNumerals(ch.semester)}
                      </span>
                    )}

                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {ch.type}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-stone-600 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md">
                    {toGujaratiNumerals(chapterWords.length)} શબ્દો
                  </span>
                </div>

                {/* Chapter Name & Author */}
                <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-1 leading-snug">
                  {ch.name}
                </h3>
                {ch.author && (
                  <p className="text-xs text-emerald-800 font-semibold mb-1">
                    લેખક / પ્રકાર: {ch.author}
                  </p>
                )}
                {ch.description && (
                  <p className="text-xs text-stone-500 mb-3">
                    {ch.description}
                  </p>
                )}

                {/* Word Preview Chips */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {chapterWords.slice(0, 4).map((w) => (
                    <span
                      key={w.id}
                      className="text-[11px] font-medium px-2 py-0.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                    >
                      {w.word} = {w.primarySynonym}
                    </span>
                  ))}
                  {chapterWords.length > 4 && (
                    <span className="text-[11px] font-medium px-1.5 py-0.5 text-stone-600">
                      +{toGujaratiNumerals(chapterWords.length - 4)} વધુ
                    </span>
                  )}
                </div>

                {/* Expandable Word List Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-stone-100 space-y-2 animate-in fade-in duration-200">
                    <span className="text-xs font-bold text-stone-700 block">
                      આ પાઠના તમામ સમાનાર્થી શબ્દો:
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {chapterWords.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 bg-stone-50 rounded-xl text-xs flex items-center justify-between border border-stone-100"
                        >
                          <div>
                            <strong className="text-stone-900">{item.word}</strong>{' '}
                            <span className="text-emerald-700 font-semibold">
                              = {item.primarySynonym}
                            </span>
                            <span className="text-stone-600 block text-[11px]">
                              ({item.meaning})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              speakGujarati(
                                `${item.word} નો સમાનાર્થી ${item.primarySynonym}`
                              )
                            }
                            className="p-1 rounded-md text-stone-600 hover:text-emerald-700 hover:bg-stone-200 transition-colors"
                            title="સાંભળો"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Footer with Game Buttons */}
              <div className="bg-stone-50/80 border-t border-stone-100 p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(ch.id)}
                  className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-stone-200/60 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <span>શબ્દો સંતાડો</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>શબ્દો જુઓ</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      playClickSound();
                      onPlayMatching(ch.id);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    title="આ પાઠની જોડકાં રમત રમો"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>જોડકાં</span>
                  </button>

                  <button
                    onClick={() => {
                      playClickSound();
                      onPlayMcq(ch.id);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    title="આ પાઠની MCQ ક્વિઝ રમો"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>MCQ ક્વિઝ</span>
                  </button>

                  <button
                    onClick={() => {
                      playClickSound();
                      onStudyFlashcard(ch.id);
                    }}
                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition-colors"
                    title="કાર્ડ્સથી પુનરાવર્તન કરો"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredChapters.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-stone-800">કોઈ પાઠ મળ્યો નહીં</h4>
          <p className="text-xs text-stone-500 mt-1">શોધ શબ્દ તપાસો અથવા બધા પાઠો જુઓ.</p>
        </div>
      )}
    </div>
  );
};
