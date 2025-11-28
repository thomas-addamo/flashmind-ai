import React, { useState, useCallback } from 'react';
import { Difficulty, Settings, UserInput } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Imposta il worker per PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

interface SetupFormProps {
  onStart: (settings: Settings, input: UserInput) => void;
  isLoading: boolean;
}

const SetupForm: React.FC<SetupFormProps> = ({ onStart, isLoading }) => {
  const [text, setText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isFileProcessing, setIsFileProcessing] = useState<boolean>(false);
  
  const [cardCount, setCardCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Intermediate);
  
  const [types, setTypes] = useState({
    tf: true,
    mc: true,
    basic: true
  });

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (e) {
      console.error("Errore PDF", e);
      throw new Error("Impossibile leggere il PDF.");
    }
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isMd = file.name.toLowerCase().endsWith('.md') || file.type === 'text/markdown';

    if (!isPdf && !isMd) {
      alert("Formato non supportato. Carica solo PDF o MD.");
      return;
    }

    setFileName(file.name);
    setIsFileProcessing(true);
    setText('');

    try {
      if (isPdf) {
        const pdfText = await extractTextFromPDF(file);
        setText(pdfText);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setText(content);
          setIsFileProcessing(false);
        };
        reader.readAsText(file);
        return;
      }
    } catch (error) {
      console.error("Errore lettura file:", error);
      alert("Impossibile leggere il file.");
      setFileName('');
    } finally {
      if (isPdf) {
        setIsFileProcessing(false);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert("Per favore carica un documento valido (PDF o MD).");
      return;
    }
    if (!types.tf && !types.mc && !types.basic) {
      alert("Seleziona almeno un tipo di carta.");
      return;
    }

    onStart({
      cardCount,
      difficulty,
      includeTrueFalse: types.tf,
      includeMultipleChoice: types.mc,
      includeBasic: types.basic
    }, { text, fileName });
  };

  return (
    <div className="w-full max-w-3xl mx-auto backdrop-blur-xl bg-slate-900/80 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden animate-slide-up relative">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      <div className="p-8 md:p-10 space-y-8">
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Setup Sessione
          </h2>
          <p className="text-slate-400">Carica i tuoi appunti e personalizza l'esperienza</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* File Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider">
              1. Documento (PDF / MD)
            </label>
            <div className="group relative">
              <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                isFileProcessing ? 'border-slate-600 bg-slate-800/50 cursor-wait' : 
                fileName ? 'border-emerald-500/50 bg-emerald-950/20' : 
                'border-slate-600 bg-slate-800/30 hover:bg-slate-800 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20'
              }`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isFileProcessing ? (
                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-3"></div>
                  ) : fileName ? (
                    <>
                       <div className="w-12 h-12 mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                       </div>
                       <p className="mb-1 text-sm text-emerald-400 font-semibold">{fileName}</p>
                       <p className="text-xs text-slate-500">Pronto per l'analisi</p>
                    </>
                  ) : (
                    <>
                       <div className="w-12 h-12 mb-3 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                       </div>
                       <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-indigo-400">Clicca per caricare</span></p>
                       <p className="text-xs text-slate-500">PDF o Markdown</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept=".pdf,.md" onChange={handleFileUpload} disabled={isFileProcessing} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Difficulty */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider">2. Livello</label>
              <div className="flex bg-slate-800 p-1 rounded-xl">
                {(Object.values(Difficulty) as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-2.5 text-sm rounded-lg transition-all font-medium ${
                      difficulty === level 
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider">3. Quantità</label>
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm font-bold">{cardCount} Card</span>
              </div>
              <input 
                type="range" 
                min="3" 
                max="20" 
                value={cardCount} 
                onChange={(e) => setCardCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Card Types */}
          <div className="space-y-3">
             <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">4. Tipologie</label>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'tf', label: 'Vero/Falso', val: types.tf },
                  { id: 'mc', label: 'Multipla', val: types.mc },
                  { id: 'basic', label: 'Aperta', val: types.basic },
                ].map((type) => (
                  <label key={type.id} className={`flex items-center justify-center p-4 rounded-xl cursor-pointer border transition-all ${
                    type.val 
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-900/20' 
                    : 'bg-slate-800 border-transparent text-slate-500 hover:border-slate-600'
                  }`}>
                    <input 
                      type="checkbox" 
                      checked={type.val} 
                      onChange={() => setTypes(p => ({...p, [type.id]: !p[type.id as keyof typeof types]}))} 
                      className="hidden" 
                    />
                    <span className="font-semibold">{type.label}</span>
                  </label>
                ))}
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || isFileProcessing || !text}
            className="w-full py-5 relative group overflow-hidden rounded-xl font-bold text-lg text-white shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-all duration-300 group-hover:scale-105"></div>
            <div className="absolute inset-0 w-full h-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative flex items-center justify-center">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Elaborazione con IA...
                </>
              ) : (
                "GENERA FLASHCARD"
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupForm;