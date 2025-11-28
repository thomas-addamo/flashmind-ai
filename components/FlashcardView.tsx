import React, { useState, useEffect } from 'react';
import { Flashcard, CardType } from '../types';

interface FlashcardViewProps {
  card: Flashcard;
  onAnswer: (isCorrect: boolean) => void;
  currentIndex: number;
  totalCards: number;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ card, onAnswer, currentIndex, totalCards }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Note: Since we are using a unique `key` in the parent App.tsx, 
  // this component mounts fresh for every new card.
  // We don't need a useEffect to reset state based on ID, 
  // but initial state handles the reset.

  const handleMCQSubmit = (option: string) => {
    if (hasAnswered) return;
    setSelectedOption(option);
    setHasAnswered(true);
    
    // Auto flip after short delay
    setTimeout(() => {
      setIsFlipped(true);
    }, 800);
  };

  const handleBasicReveal = () => {
    setIsFlipped(true);
  };

  const handleBasicGrade = (correct: boolean) => {
    setHasAnswered(true);
    onAnswer(correct);
  };

  const handleNext = () => {
    if (card.type === CardType.MultipleChoice || card.type === CardType.TrueFalse) {
       const isCorrect = selectedOption === card.correctAnswer;
       onAnswer(isCorrect);
    }
  };

  const getOptionStyle = (option: string) => {
    if (!hasAnswered) return "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:border-indigo-500";
    if (option === card.correctAnswer) return "bg-emerald-900/50 border-emerald-500 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]";
    if (option === selectedOption && option !== card.correctAnswer) return "bg-red-900/50 border-red-500 text-red-200";
    return "bg-slate-800/50 border-slate-800 text-slate-600 opacity-50";
  };

  const progressPercent = ((currentIndex) / totalCards) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4 animate-slide-up">
      
      {/* Top Info Bar */}
      <div className="flex flex-col mb-8">
        <div className="flex justify-between items-end mb-2">
           <span className="text-2xl font-bold text-white">Domanda {currentIndex + 1} <span className="text-slate-500 text-lg">/ {totalCards}</span></span>
           <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium uppercase tracking-wider text-indigo-400">
             {card.type === 'basic' ? 'Aperta' : card.type === 'true_false' ? 'Vero/Falso' : 'Multipla'}
           </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-700 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* 3D Card Container with Dynamic Height Solution (CSS Grid) */}
      <div className="perspective-1000 w-full">
        <div 
          className={`relative w-full transition-transform duration-700 transform-style-3d card-grid ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          
          {/* FRONT FACE */}
          <div className="card-face backface-hidden bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-700 shadow-2xl flex flex-col justify-between min-h-[450px]">
            
            <div className="flex-grow flex items-center justify-center py-6">
              <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight text-center">
                {card.question}
              </h2>
            </div>
            
            <div className="mt-8 space-y-4 w-full">
              {/* Multiple Choice */}
              {card.type === CardType.MultipleChoice && card.options && (
                <div className="grid grid-cols-1 gap-3">
                  {card.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleMCQSubmit(option)}
                      disabled={hasAnswered}
                      className={`p-5 w-full rounded-2xl border-2 text-left transition-all duration-200 text-lg ${getOptionStyle(option)}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* True / False */}
              {card.type === CardType.TrueFalse && (
                <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => handleMCQSubmit("Vero")}
                    disabled={hasAnswered}
                    className={`py-6 rounded-2xl border-2 font-bold text-xl transition-all ${getOptionStyle("Vero")}`}
                   >
                     Vero
                   </button>
                   <button 
                    onClick={() => handleMCQSubmit("Falso")}
                    disabled={hasAnswered}
                    className={`py-6 rounded-2xl border-2 font-bold text-xl transition-all ${getOptionStyle("Falso")}`}
                   >
                     Falso
                   </button>
                </div>
              )}

              {/* Basic Open Question */}
              {card.type === CardType.Basic && (
                 <div className="flex justify-center pb-4">
                   <button 
                    onClick={handleBasicReveal}
                    className="group relative px-8 py-4 bg-indigo-600 rounded-full font-bold text-white shadow-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
                   >
                     <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12"></div>
                     Rivela Risposta
                   </button>
                 </div>
              )}
              
              {/* Show explanation link if answered but front is still showing (rare case for manual flip back, but good UX) */}
              {(card.type !== CardType.Basic && hasAnswered && !isFlipped) && (
                 <p className="text-center text-slate-500 text-sm animate-pulse">Girando la carta...</p>
              )}
            </div>
          </div>

          {/* BACK FACE */}
          <div className="card-face backface-hidden rotate-y-180 bg-slate-900 rounded-3xl p-8 md:p-12 border border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.15)] flex flex-col justify-between min-h-[450px]">
             
             <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${selectedOption === card.correctAnswer || card.type === CardType.Basic ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Soluzione</span>
                </div>
                
                <h3 className={`text-2xl md:text-3xl font-bold leading-snug ${card.type === CardType.Basic ? 'text-indigo-400' : (selectedOption === card.correctAnswer ? 'text-emerald-400' : 'text-red-400')}`}>
                  {card.correctAnswer}
                </h3>
                
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                  <h4 className="font-semibold text-indigo-300 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Spiegazione
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {card.userExplanation || "Nessuna spiegazione dettagliata disponibile."}
                  </p>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-800">
               {card.type === CardType.Basic ? (
                 <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => handleBasicGrade(false)}
                    className="py-4 rounded-xl border border-red-900/50 bg-red-950/30 text-red-400 font-bold hover:bg-red-900/50 hover:border-red-500 transition-all"
                   >
                     Non lo sapevo
                   </button>
                   <button 
                    onClick={() => handleBasicGrade(true)}
                    className="py-4 rounded-xl border border-emerald-900/50 bg-emerald-950/30 text-emerald-400 font-bold hover:bg-emerald-900/50 hover:border-emerald-500 transition-all"
                   >
                     Lo sapevo
                   </button>
                 </div>
               ) : (
                  <button 
                  onClick={handleNext}
                  className="w-full py-4 bg-white text-slate-900 rounded-xl font-extrabold text-lg hover:bg-indigo-50 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                 >
                   Prossima Domanda
                 </button>
               )}
             </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default FlashcardView;