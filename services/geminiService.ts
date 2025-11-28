import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Settings, Flashcard, CardType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFlashcards = async (
  text: string, 
  settings: Settings
): Promise<Flashcard[]> => {
  
  const enabledTypes: string[] = [];
  if (settings.includeTrueFalse) enabledTypes.push("true_false (Vero o Falso)");
  if (settings.includeMultipleChoice) enabledTypes.push("multiple_choice (Risposta Multipla a 4 opzioni)");
  if (settings.includeBasic) enabledTypes.push("basic (Domanda aperta classica)");

  if (enabledTypes.length === 0) {
    throw new Error("Devi selezionare almeno un tipo di flash card.");
  }

  const prompt = `
    Sei un professore esperto. Analizza il seguente testo e crea esattamente ${settings.cardCount} flash card didattiche.
    
    Livello di difficoltà: ${settings.difficulty}.
    Tipi di domande permessi: ${enabledTypes.join(", ")}.
    Lingua: Italiano.

    Regole:
    1. Per 'multiple_choice', fornisci 4 opzioni nell'array 'options'.
    2. Per 'true_false', la risposta deve essere "Vero" o "Falso".
    3. Per 'basic', la domanda deve richiedere una risposta breve ma precisa.
    4. Il campo 'correctAnswer' deve corrispondere esattamente a una delle opzioni (per MC), a "Vero"/"Falso" (per TF), o alla risposta corretta (per Basic).
    
    Testo da analizzare:
    "${text.substring(0, 30000)}" 
  `;

  // Define the schema for structured JSON output
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        type: { 
          type: Type.STRING, 
          enum: [CardType.TrueFalse, CardType.MultipleChoice, CardType.Basic] 
        },
        question: { type: Type.STRING },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING } 
        },
        correctAnswer: { type: Type.STRING },
        userExplanation: { type: Type.STRING, description: "Breve spiegazione del perché la risposta è corretta" }
      },
      required: ["id", "type", "question", "correctAnswer"],
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7, 
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Nessuna risposta dal modello.");

    const cards = JSON.parse(jsonText) as Flashcard[];
    
    // Assign IDs locally to ensure integrity
    return cards.map((card, index) => ({
      ...card,
      id: index + 1
    }));

  } catch (error) {
    console.error("Errore durante la generazione delle flashcard:", error);
    throw new Error("Impossibile generare le flashcard. Riprova o controlla il testo.");
  }
};