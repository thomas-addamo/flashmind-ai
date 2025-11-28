import React, { useState } from 'react';
import SetupForm from './components/SetupForm';
import FlashcardView from './components/FlashcardView';
import ScoreBoard from './components/ScoreBoard';
import { generateFlashcards } from './services/geminiService';
import { Settings, UserInput, Flashcard, GameState } from './types';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    answers: [],
    currentCardIndex: 0,
    isFinished: false,
  });

  const handleStart = async (settings: Settings, input: UserInput) => {
    setLoading(true);
    setError(null);
    try {
      const generatedCards = await generateFlashcards(input.text, settings);
      setCards(generatedCards);
      setGameState({
        score: 0,
        answers: [],
        currentCardIndex: 0,
        isFinished: false
      });
    } catch (err: any) {
      setError(err.message || "Qualcosa è andato storto.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    const updatedAnswers = [...gameState.answers, isCorrect];
    const isFinished = gameState.currentCardIndex + 1 >= cards.length;

    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      answers: updatedAnswers,
      currentCardIndex: isFinished ? prev.currentCardIndex : prev.currentCardIndex + 1,
      isFinished
    }));
  };

  const handleRestart = () => {
    setCards([]);
    setGameState({
      score: 0,
      answers: [],
      currentCardIndex: 0,
      isFinished: false
    });
    setError(null);
  };

  return (
    <div className="min-h-screen text-slate-200 overflow-x-hidden relative font-sans">
      
      {/* Dark Animated Background */}
      <div className="fixed inset-0 z-[-1] bg-slate-950">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-pink-900/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 flex flex-col min-h-screen">
        
        {/* Header - Compact during game */}
        <header className={`text-center transition-all duration-500 ${cards.length > 0 ? 'mb-4' : 'mb-12 mt-10'}`}>
           <div className="inline-flex items-center justify-center space-x-3 mb-2">
             <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                <span className="text-2xl md:text-3xl text-white">🧠</span>
             </div>
             <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 tracking-tight">
               FlashMind AI
             </h1>
           </div>
           {!cards.length && !loading && (
             <p className="text-lg text-slate-400 max-w-xl mx-auto mt-4 animate-fade-in">
               Carica PDF o MD. L'intelligenza artificiale creerà il tuo percorso di studio personalizzato.
             </p>
           )}
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col items-center justify-center w-full">
          
          {error && (
            <div className="w-full max-w-lg bg-red-950/50 border border-red-500/50 text-red-200 p-6 rounded-2xl shadow-xl mb-8 animate-slide-up backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 className="font-bold text-lg">Si è verificato un errore</h3>
              </div>
              <p className="opacity-90">{error}</p>
              <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-sm font-semibold transition-colors">Riprova</button>
            </div>
          )}

          {cards.length === 0 ? (
            <SetupForm onStart={handleStart} isLoading={loading} />
          ) : gameState.isFinished ? (
            <ScoreBoard state={gameState} onRestart={handleRestart} />
          ) : (
            <FlashcardView 
              // KEY is crucial here. It forces React to unmount the old card and mount a new one.
              // This resets the state inside FlashcardView (isFlipped = false) instantly,
              // preventing the "flip back" animation that reveals the next answer.
              key={cards[gameState.currentCardIndex].id}
              card={cards[gameState.currentCardIndex]} 
              currentIndex={gameState.currentCardIndex}
              totalCards={cards.length}
              onAnswer={handleAnswer}
            />
          )}

        </main>

        <footer className="mt-12 text-center text-slate-600 text-sm py-6">
          <p className="hover:text-slate-400 transition-colors cursor-default">Powered by Google Gemini 2.5 Flash</p>
        </footer>
      </div>
    </div>
  );
}

export default App;