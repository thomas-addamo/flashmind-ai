import React, { useEffect, useState } from 'react';
import { GameState } from '../types';

interface ScoreBoardProps {
  state: GameState;
  onRestart: () => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ state, onRestart }) => {
  const [displayPct, setDisplayPct] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const total = state.answers.length;
  const correct = state.answers.filter(a => a).length;
  const actualPercentage = total > 0 ? (correct / total) * 100 : 0;

  // Calcolo Voto Italiano (Logica invariata)
  const calculateItalianGrade = (pct: number) => {
    if (pct >= 98) return { grade: "10", message: "Leggendario!", color: "from-fuchsia-400 to-purple-600", glow: "shadow-fuchsia-500/50", stroke: "#d946ef" };
    if (pct >= 95) return { grade: "9 ½", message: "Eccellente", color: "from-violet-400 to-indigo-600", glow: "shadow-violet-500/50", stroke: "#8b5cf6" };
    if (pct >= 90) return { grade: "9", message: "Ottimo", color: "from-indigo-400 to-blue-600", glow: "shadow-indigo-500/50", stroke: "#6366f1" };
    if (pct >= 85) return { grade: "8 ½", message: "Molto Buono", color: "from-cyan-400 to-blue-500", glow: "shadow-cyan-500/50", stroke: "#06b6d4" };
    if (pct >= 80) return { grade: "8", message: "Buono", color: "from-teal-400 to-emerald-600", glow: "shadow-teal-500/50", stroke: "#14b8a6" };
    if (pct >= 75) return { grade: "7 ½", message: "Discreto", color: "from-emerald-400 to-green-600", glow: "shadow-emerald-500/50", stroke: "#10b981" };
    if (pct >= 70) return { grade: "7", message: "Più che sufficiente", color: "from-green-400 to-emerald-600", glow: "shadow-green-500/50", stroke: "#22c55e" };
    if (pct >= 65) return { grade: "6 ½", message: "Sufficiente +", color: "from-lime-400 to-green-600", glow: "shadow-lime-500/50", stroke: "#84cc16" };
    if (pct >= 60) return { grade: "6", message: "Sufficiente", color: "from-yellow-400 to-orange-500", glow: "shadow-yellow-500/50", stroke: "#eab308" };
    if (pct >= 55) return { grade: "5 ½", message: "Quasi sufficiente", color: "from-orange-400 to-red-500", glow: "shadow-orange-500/50", stroke: "#f97316" };
    if (pct >= 45) return { grade: "5", message: "Insufficiente", color: "from-orange-500 to-red-600", glow: "shadow-orange-500/50", stroke: "#f97316" };
    if (pct >= 35) return { grade: "4 ½", message: "Gravemente insufficiente", color: "from-red-500 to-rose-700", glow: "shadow-red-500/50", stroke: "#ef4444" };
    if (pct >= 25) return { grade: "4", message: "Gravemente insufficiente", color: "from-red-600 to-rose-800", glow: "shadow-red-600/50", stroke: "#dc2626" };
    return { grade: "2", message: "Disastroso", color: "from-red-700 to-rose-950", glow: "shadow-red-900/50", stroke: "#991b1b" };
  };

  const result = calculateItalianGrade(actualPercentage);

  // Animazione Percentuale
  useEffect(() => {
    // Delay iniziale per fluidità
    setTimeout(() => {
      let start = 0;
      const duration = 1500;
      const stepTime = 20;
      const steps = duration / stepTime;
      const increment = actualPercentage / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= actualPercentage) {
          setDisplayPct(actualPercentage);
          clearInterval(timer);
          setShowContent(true);
        } else {
          setDisplayPct(start);
        }
      }, stepTime);
      return () => clearInterval(timer);
    }, 300);
  }, [actualPercentage]);

  // SVG Config
  const size = 280;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayPct / 100) * circumference;

  return (
    <div className="w-full flex flex-col items-center justify-center animate-fade-in py-8">
      
      {/* HUD Container */}
      <div className="relative w-[320px] h-[320px] flex items-center justify-center mb-8">
        
        {/* Background Glow */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${result.color} opacity-20 blur-3xl animate-pulse`}></div>

        {/* Outer Rotating Ring (Decorative) */}
        <div className="absolute inset-0 border-[2px] border-slate-700/30 rounded-full border-dashed animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-4 border-[1px] border-slate-600/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

        {/* Main SVG Circle */}
        <svg width={size} height={size} className="transform -rotate-90 relative z-10 drop-shadow-2xl">
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#1e293b" // Slate 800
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={result.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-100 ease-linear"
            style={{ filter: `drop-shadow(0 0 6px ${result.stroke})` }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Voto</span>
          <div className={`text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b ${result.color} drop-shadow-sm`}>
             {/* Mostra il voto finale solo quando l'animazione è vicina alla fine, altrimenti mostra un loader o il numero che sale */}
             {showContent ? result.grade : Math.round((displayPct / 10) * 10) / 10}
          </div>
          <div className={`mt-4 px-4 py-1 rounded-full bg-slate-800/80 backdrop-blur border border-slate-700 text-sm font-medium ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500`}>
            {Math.round(displayPct)}% Accuratezza
          </div>
        </div>
      </div>

      {/* Text Result */}
      <div className={`text-center space-y-2 mb-10 transition-all duration-700 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <h2 className={`text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${result.color}`}>
          {result.message}
        </h2>
        <p className="text-slate-400 text-lg">Hai completato la sessione.</p>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-2 gap-4 w-full max-w-lg mb-12 transition-all duration-1000 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-emerald-500/20 flex flex-col items-center shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <span className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">{correct}</span>
          <span className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Corrette</span>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-red-500/20 flex flex-col items-center shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <span className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">{total - correct}</span>
          <span className="text-xs text-red-400 uppercase font-bold tracking-wider">Errate</span>
        </div>
      </div>

      {/* Restart Button */}
      <button 
        onClick={onRestart}
        className="group relative px-10 py-4 bg-slate-900 rounded-xl font-bold text-lg text-white overflow-hidden border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 active:scale-95"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <span className="relative flex items-center space-x-2">
          <svg className="w-5 h-5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          <span>Nuova Sessione</span>
        </span>
      </button>

    </div>
  );
};

export default ScoreBoard;