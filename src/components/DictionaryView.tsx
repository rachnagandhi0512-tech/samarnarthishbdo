import React, { useState, useMemo } from 'react';
import { SynonymWord, ChapterFilter } from '../types/game';
import { STD_8_SYNONYMS, STD_8_CHAPTERS } from '../data/std8Synonyms';
import { toGujaratiNumerals } from '../utils/gameHelpers';
import { speakGujarati } from '../utils/audio';
import { Search, Volume2, BookOpen, Filter, Check, Copy } from 'lucide-react';

export const DictionaryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<ChapterFilter>('palash_all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Alphabet Filter
  const [selectedLetter, setSelectedLetter] = useState<string>('all');
  const alphabetLetters = ['અ', 'આ', 'ઉ', 'ક', 'ગ', 'ચ', 'જ', 'ત', 'દ', 'ધ', 'ન', 'પ', 'બ', 'ભ', 'મ', 'ય', 'ર', 'લ', 'વ', 'શ', 'સ', 'હ', 'ક્ષ'];

  const filteredWords = useMemo(() => {
    return STD_8_SYNONYMS.filter((item) => {
      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.word.toLowerCase().includes(query) ||
        item.primarySynonym.toLowerCase().includes(query) ||
        item.synonyms.some((s) => s.toLowerCase().includes(query)) ||
        item.meaning.toLowerCase().includes(query);

      // Chapter match
      let matchesChapter = true;
      if (selectedChapter === 'palash_all') {
        matchesChapter = item.bookSeries === 'palash' || item.chapterNumber >= 100;
      } else if (selectedChapter === 'gcert_all') {
        matchesChapter = item.bookSeries === 'gcert_sem' || (item.chapterNumber > 0 && item.chapterNumber < 100);
      } else if (typeof selectedChapter === 'number') {
        matchesChapter = item.chapterNumber === selectedChapter;
      }

      // Letter match
      const matchesLetter =
        selectedLetter === 'all' || item.word.startsWith(selectedLetter);

      return matchesSearch && matchesChapter && matchesLetter;
    });
  }, [searchQuery, selectedChapter, selectedLetter]);

  const handleCopy = (item: SynonymWord) => {
    const textToCopy = `${item.word} = ${item.primarySynonym} (${item.synonyms.join(', ')})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Banner */}
      <div className="bg-teal-500/10 border border-teal-200/80 rounded-2xl p-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📖</span>
              <h2 className="text-lg sm:text-xl font-bold text-teal-950">
                ધોરણ ૮ ગુજરાતી સમાનાર્થી શબ્દકોશ
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-teal-900/80 mt-0.5">
              નવા અભ્યાસક્રમના તમામ પાઠો અને કાવ્યોના સમાનાર્થી શબ્દો, અર્થ અને વાક્ય પ્રયોગ.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-teal-800 font-semibold block">કુલ શબ્દો</span>
            <span className="text-base sm:text-lg font-extrabold text-teal-950">
              {toGujaratiNumerals(filteredWords.length)} / {toGujaratiNumerals(STD_8_SYNONYMS.length)}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-stone-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="શબ્દ અથવા સમાનાર્થી શોધો (દા.ત. અગ્નિ, પંખી, સૂર્ય)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
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

        {/* Chapter Filter */}
        <div className="relative">
          <div className="flex items-center gap-1.5 bg-white px-3 py-2.5 rounded-xl border border-stone-200 shadow-2xs">
            <Filter className="w-4 h-4 text-stone-600 shrink-0" />
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
              className="w-full text-xs sm:text-sm font-semibold text-stone-800 bg-transparent focus:outline-hidden cursor-pointer"
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
        </div>
      </div>

      {/* Alphabet Fast Jumper */}
      <div className="flex items-center gap-1 p-1.5 bg-stone-100 rounded-xl mb-5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedLetter('all')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
            selectedLetter === 'all'
              ? 'bg-white text-stone-900 shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          બધા
        </button>
        {alphabetLetters.map((letter) => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter)}
            className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg transition-colors shrink-0 ${
              selectedLetter === letter
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Word Cards Grid */}
      {filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredWords.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-stone-200/90 hover:border-teal-300 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                      {item.word}
                    </h3>
                    <span className="text-sm font-bold text-teal-700">
                      = {item.primarySynonym}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-600">
                    {item.chapter}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => speakGujarati(`${item.word} નો સમાનાર્થી ${item.primarySynonym}`)}
                    className="p-1.5 rounded-lg text-stone-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                    title="ઉચ્ચારણ સાંભળો"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1.5 rounded-lg text-stone-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                    title="કોપી કરો"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* All Synonyms Tag List */}
              <div className="mb-2.5">
                <span className="text-xs text-stone-600 font-semibold mr-1.5">સમાનાર્થી:</span>
                <span className="text-xs sm:text-sm font-medium text-stone-800">
                  {item.synonyms.join(' · ')}
                </span>
              </div>

              {/* Meaning & Example Sentence */}
              <div className="bg-stone-50 rounded-xl p-3 text-xs space-y-1 border border-stone-100">
                <div>
                  <strong className="text-stone-900">અર્થ:</strong>{' '}
                  <span className="text-stone-700">{item.meaning}</span>
                </div>
                <div>
                  <strong className="text-stone-900">વાક્ય પ્રયોગ:</strong>{' '}
                  <span className="text-stone-700 italic">"{item.exampleSentence}"</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-stone-800 mb-1">
            કોઈ શબ્દ મળ્યો નહીં
          </h4>
          <p className="text-xs text-stone-500 mb-4">
            શોધ શબ્દ બદલીને જુઓ અથવા બીજા પાઠની પસંદગી કરો.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedChapter('all');
              setSelectedLetter('all');
            }}
            className="px-4 py-2 text-xs font-bold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
          >
            તમામ શબ્દો જુઓ
          </button>
        </div>
      )}
    </div>
  );
};
