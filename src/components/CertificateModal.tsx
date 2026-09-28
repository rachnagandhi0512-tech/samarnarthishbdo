import React, { useState } from 'react';
import { Award, Printer, X, CheckCircle, Sparkles } from 'lucide-react';
import { toGujaratiNumerals } from '../utils/gameHelpers';

interface CertificateModalProps {
  score: number;
  accuracy: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  score,
  accuracy,
  isOpen,
  onClose,
}) => {
  const [studentName, setStudentName] = useState<string>('હોશિયાર વિદ્યાર્થી');
  const [schoolName, setSchoolName] = useState<string>('શ્રી મઘાસર પ્રાથમિક શાળા');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayDate = new Intl.DateTimeFormat('gu-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Inputs for Name & School (hidden in print) */}
        <div className="mb-6 bg-stone-50 p-4 rounded-2xl border border-stone-200 print:hidden space-y-3">
          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            પ્રમાણપત્ર વિગત (તમારું નામ લખો):
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-600 block mb-1">વિદ્યાર્થીનું નામ:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                placeholder="દા.ત. અર્જુન પટેલ"
              />
            </div>
            <div>
              <label className="text-xs text-stone-600 block mb-1">શાળાનું નામ:</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                placeholder="દા.ત. શ્રી પ્રાથમિક શાળા"
              />
            </div>
          </div>
        </div>

        {/* The Printable Certificate Design */}
        <div className="relative border-8 border-double border-amber-600/70 p-6 sm:p-10 rounded-2xl bg-amber-50/20 text-center">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 text-amber-600 text-xl">✦</div>
          <div className="absolute top-2 right-2 text-amber-600 text-xl">✦</div>
          <div className="absolute bottom-2 left-2 text-amber-600 text-xl">✦</div>
          <div className="absolute bottom-2 right-2 text-amber-600 text-xl">✦</div>

          {/* Badge Icon */}
          <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Award className="w-9 h-9" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight mb-1">
            વિશેષ સિદ્ધિ પ્રમાણપત્ર
          </h2>
          <p className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-widest mb-4">
            🌸 પલાશ (નવો અભ્યાસક્રમ) & ધોરણ ૮ ગુજરાતી - સમાનાર્થી શબ્દો મહારત
          </p>

          <p className="text-sm text-stone-700 mb-2">આથી પ્રમાણિત કરવામાં આવે છે કે</p>

          <div className="my-2 py-1 px-4 border-b-2 border-stone-800 inline-block min-w-[240px]">
            <span className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              {studentName || 'હોશિયાર વિદ્યાર્થી'}
            </span>
          </div>

          <p className="text-xs text-stone-500 mt-1 mb-4">{schoolName}</p>

          <p className="text-xs sm:text-sm text-stone-700 max-w-md mx-auto leading-relaxed mb-6">
            તેમણે ધોરણ ૮ ગુજરાતી (નવા અભ્યાસક્રમ) ના સમાનાર્થી શબ્દોની રમતમાં ઉત્સાહપૂર્વક ભાગ લઈ{' '}
            <strong className="text-amber-950 font-bold">{toGujaratiNumerals(score)} ગુણ</strong> અને{' '}
            <strong className="text-emerald-800 font-bold">{toGujaratiNumerals(accuracy)}% ચોકસાઈ</strong> સાથે
            સફળતા મેળવી છે.
          </p>

          {/* Seal and Signatures */}
          <div className="flex items-center justify-between border-t border-amber-300 pt-4 mt-4 text-xs text-stone-600">
            <div className="text-left">
              <span className="block font-semibold">તારીખ: {todayDate}</span>
              <span className="text-[11px] text-stone-600">ગુજરાત શિક્ષણ બોર્ડ આધારિત</span>
            </div>

            <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-600 flex items-center justify-center text-[10px] font-bold text-amber-900 rotate-12">
              ગુજરાતી ભાષા ગૌરવ
            </div>

            <div className="text-right">
              <span className="block font-semibold">શિક્ષક / માર્ગદર્શક</span>
              <span className="text-[11px] text-stone-600">ભાષા સજ્જતા મંચ</span>
            </div>
          </div>
        </div>

        {/* Print & Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            બંધ કરો
          </button>

          <button
            onClick={handlePrint}
            className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold transition-colors shadow-xs flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>પ્રિન્ટ / PDF સાચવો</span>
          </button>
        </div>
      </div>
    </div>
  );
};
