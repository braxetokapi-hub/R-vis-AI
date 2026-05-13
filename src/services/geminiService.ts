import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Question, Subject, Level, Mode, Language, Unit, LessonStepContent, StudyPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `Tu es un assistant pédagogique expert intégré dans une application de révision scolaire inspirée de Khan Academy. Ton rôle est d'accompagner l'élève dans sa progression selon la **pédagogie de la maîtrise** : un concept n'est validé que lorsque l'élève le maîtrise vraiment, à son propre rythme.

🎯 TES OBJECTIFS PÉDAGOGIQUES :
1. Engagement actif : Propose des activités qui sollicitent la réflexion (QCM, textes à trous, cartes interactives, association).
2. Intégration Google Classroom : Explique comment les ressources peuvent être partagées ou utilisées via cette plateforme.
3. Stratégies de mémorisation : Intègre des séquences basées sur les neurosciences (récupération active, double codage, répétition espacée).
4. Plan d'action structuré : Propose des progressions sur 4 semaines pour maîtriser un chapitre.

Structure de l'application : Matières → Unités → Leçons → Exercices.

📚 Matières disponibles :
- Langues vivantes : Français (langue), Anglais, Espagnol, Allemand, Italien, Arabe
- Histoire-Géographie : Histoire (de l'Antiquité à nos jours), Géographie physique & humaine
- Culture Générale : Module "Tribus du Monde" (Maasaï, Inuits, Touaregs, Batak, Aborigènes, Bédouins, Saamis, Guaranis), actualités, culture générale.
- Mathématiques, Sciences, Éducation civique (EMC)

🎬 FORMAT DES LEÇONS :
Chaque leçon suit ce schéma :
1. Vidéo pédagogique courte (3 à 8 minutes) : Explications visuelles animées, narration claire, progressive, exemples concrets.
2. Résumé de leçon : Texte court + points clés en bullet points + règle principale.
3. Exercices interactifs : QCM, textes à trous, association, glisser-déposer.
4. Quiz de validation : L'élève doit répondre correctement plusieurs fois pour valider la compétence.

🔊 FORMAT AUDIO (Langues Vivantes) :
Pour Français, Anglais, Espagnol, Allemand, Italien, Arabe :
- AUDIO_DIALOGUE : Dialogues audio avec locuteurs natifs. Fournis le texte et la transcription.
- PRONUNCIATION : L'élève doit répéter une phrase. Fournis le texte et la phonétique (IPA).
- AUDIO_DICTATION : Texte à écrire après écoute. Fournis le texte correct.
- LISTENING_COMPREHENSION : Extrait audio + questions de compréhension (QCM).
- AUDIO_FLASHCARD : Mot/phrase + audio + traduction.

🗺️ FORMAT HISTOIRE-GÉOGRAPHIE :
- Histoire : Vidéos animées, frises chronologiques interactives, analyse de documents historiques.
- Géographie : Cartes interactives (placer pays, fleuves), animations de flux, études de cas.

🧠 PERSONNALISATION PÉDAGOGIQUE :
- Explique simplement avec des analogies.
- Génère des exercices adaptés (facile → difficile).
- Corrige avec bienveillance, explique les erreurs.
- Varie les formats de questions.
- Si un élève souhaite approfondir un sujet, mentionne qu'il peut utiliser "Claude" pour aller plus loin.
- Adapte ton langage à l'âge (collège/lycée) et au niveau (A1 → C1).
- Encourage avec des feedbacks positifs.
- Suggère la prochaine étape après validation.
- Si un élève fait une erreur fréquente (déjà signalée), sois encore plus précis dans l'explication.

🌍 SUPPORT MULTILINGUE :
Tu dois être capable de générer du contenu en Français, Anglais, Espagnol, Allemand, Italien et Arabe. Adapte toujours ton contenu à la langue demandée par l'utilisateur.`;

export async function getTopics(subject: Subject, level: Level, language: Language): Promise<string[]> {
  if (subject === 'Culture Générale') {
    return [
      "Tribus du Monde",
      "Actualités Internationales",
      "Arts et Littérature",
      "Sciences et Découvertes",
      "Histoire des Civilisations",
      "Géopolitique"
    ];
  }

  const prompt = `Liste les 6 chapitres ou thèmes principaux du programme officiel de l'Éducation Nationale française pour la classe de ${level} en ${subject}. 
  Réponds dans la langue suivante : ${language}.
  Réponds UNIQUEMENT par un tableau JSON de chaînes de caractères.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse topics", e);
    return ["Général"];
  }
}

export async function generateInitialTest(subject: Subject, level: Level, language: Language): Promise<Question[]> {
  const prompt = `Génère un test de niveau initial de 10 questions à choix multiples (QCM) pour un élève de ${level} en ${subject}.
  Difficulté croissante :
  - Questions 1-3 : niveau de base
  - Questions 4-6 : niveau intermédiaire
  - Questions 7-10 : niveau avancé
  
  Réponds en ${language} au format JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { 
              type: Type.STRING, 
              enum: ["QCM", "TRUE_FALSE", "OUVERTE", "DEFINITION", "CALCUL", "FILL_BLANKS", "MATCHING"] 
            },
            text: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Obligatoire pour QCM et TRUE_FALSE."
            },
            pairs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING }
                },
                required: ["term", "definition"]
              },
              description: "Obligatoire pour MATCHING."
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            points: { type: Type.NUMBER }
          },
          required: ["id", "type", "text", "correctAnswer", "explanation", "points"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateLessonCatalogue(subject: Subject, level: Level, language: Language): Promise<Unit[]> {
  const prompt = `Génère un catalogue complet d'unités et de leçons pour le programme de ${level} en ${subject}.
  Structure : Unité -> Liste de leçons.
  Chaque leçon doit avoir un titre et une durée estimée (ex: "~15 min").
  Réponds en ${language} au format JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            lessons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  unitId: { type: Type.STRING }
                },
                required: ["id", "title", "duration", "unitId"]
              }
            }
          },
          required: ["id", "title", "subject", "lessons"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateLessonStep(lessonTitle: string, step: number, subject: Subject, level: Level, language: Language): Promise<LessonStepContent> {
  const stepPrompts = [
    "", // Step 0 unused
    `Génère une description détaillée d'une vidéo pédagogique animée pour la leçon "${lessonTitle}" (${subject}, ${level}). Décris ce qui se passe à l'écran, la narration et les exemples. Durée estimée 3-8 min.`,
    `Génère un résumé de leçon pour "${lessonTitle}". Inclus 3-5 points clés, un encadré "À retenir" et la règle principale.`,
    `Génère un court extrait audio (45s) et 3 questions de compréhension (QCM) pour "${lessonTitle}". Fournis le texte de l'extrait audio et les questions.`,
    `Génère 3 exercices guidés progressifs pour "${lessonTitle}". Inclus des indices pour chaque exercice.`,
    `Génère un quiz de validation de 3 questions pour "${lessonTitle}". Mélange QCM, Ouverte, et Compréhension Orale.`,
    `Génère un bilan de fin de leçon pour "${lessonTitle}".`
  ];

  const prompt = `${stepPrompts[step]} Réponds en ${language} au format JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          videoDescription: { type: Type.STRING },
          summary: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              mainRule: { type: Type.STRING }
            }
          },
          listeningComprehension: {
            type: Type.OBJECT,
            properties: {
              transcript: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ["QCM"] },
                    text: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    points: { type: Type.NUMBER }
                  },
                  required: ["id", "type", "text", "options", "correctAnswer", "points"]
                }
              }
            }
          },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                points: { type: Type.NUMBER },
                difficulty: { type: Type.STRING },
                hint: { type: Type.STRING }
              }
            }
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { 
                  type: Type.STRING, 
                  enum: ["QCM", "OUVERTE", "DEFINITION", "CALCUL", "LISTENING_COMPREHENSION", "TRUE_FALSE", "FILL_BLANKS", "MATCHING", "MAP_INTERACTIVE"] 
                },
                text: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Obligatoire pour QCM, TRUE_FALSE et LISTENING_COMPREHENSION."
                },
                pairs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      definition: { type: Type.STRING }
                    },
                    required: ["term", "definition"]
                  }
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                points: { type: Type.NUMBER }
              },
              required: ["id", "type", "text", "correctAnswer", "points"]
            }
          }
        }
      }
    }
  });

  const content = JSON.parse(response.text) as LessonStepContent;

  // Generate audio for listening comprehension if needed
  if (step === 3 && content.listeningComprehension) {
    const audioData = await generateSpeech(content.listeningComprehension.transcript, language);
    content.listeningComprehension.audioUrl = `data:audio/mp3;base64,${audioData}`;
  }

  return content;
}

export async function generateSpeech(text: string, language: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say in ${language}: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Default voice
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio || "";
}

export async function generateAudioTranscription(theme: string, language: string): Promise<{ text: string; phonetic: string; translation: string; audioData?: string }> {
  const prompt = `Génère un court dialogue audio (45s) sur le thème "${theme}" en ${language}.
  Fournis le texte, la transcription phonétique (IPA) et la traduction mot à mot en français.
  Réponds en JSON: { "text": string, "phonetic": string, "translation": string }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { 
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json" 
    }
  });

  const data = JSON.parse(response.text);
  
  // Generate speech for the text
  try {
    const audioData = await generateSpeech(data.text, language);
    return { ...data, audioData };
  } catch (error) {
    console.error("Speech generation failed", error);
    return data;
  }
}

export async function evaluatePronunciation(audioBase64: string, targetText: string, language: string): Promise<{ score: number; feedback: string; recognizedText: string; details: { sounds: number; rhythm: number; intonation: number } }> {
  const prompt = `Évalue la prononciation de l'élève pour la phrase suivante : "${targetText}".
  Compare l'audio fourni avec le texte cible.
  Réponds en JSON avec :
  - score: de 0 à 100
  - feedback: un court conseil pédagogique en ${language}
  - recognizedText: ce que tu as entendu
  - details: { sounds: number, rhythm: number, intonation: number } (scores de 0 à 100)`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { text: prompt },
      {
        inlineData: {
          mimeType: "audio/wav",
          data: audioBase64
        }
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          recognizedText: { type: Type.STRING },
          details: {
            type: Type.OBJECT,
            properties: {
              sounds: { type: Type.NUMBER },
              rhythm: { type: Type.NUMBER },
              intonation: { type: Type.NUMBER }
            },
            required: ["sounds", "rhythm", "intonation"]
          }
        },
        required: ["score", "feedback", "recognizedText", "details"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateQuestions(subject: Subject, level: Level, mode: Mode, topic: string, language: Language): Promise<Question[]> {
  const prompt = `Génère 30 questions de révision pour le niveau ${level} en ${subject}, spécifiquement sur le thème "${topic}".
  Le mode est ${mode}. 
  Réponds dans la langue suivante : ${language}.
  Inclus un mélange varié de types: QCM (prioritaire), OUVERTE, DEFINITION, CALCUL, DRAG_DROP, IMAGE_ANALYSIS, MAP_INTERACTIVE, TRUE_FALSE, FILL_BLANKS, MATCHING, AUDIO_DIALOGUE, PRONUNCIATION, AUDIO_DICTATION, LISTENING_COMPREHENSION, et AUDIO_FLASHCARD.
  
  Pour les types AUDIO, fournis toujours un champ "text" (le texte à lire/écouter) et si possible "phonetic" (IPA).
  Pour MAP_INTERACTIVE, fournis un tableau "hotspots" { id, x, y, label } (x,y en %). "correctAnswer" est l'id du hotspot. L'élève devra cliquer sur le bon point sur l'image (carte).
  Pour MATCHING, fournis un tableau "pairs" { term, definition }. L'élève devra associer les termes aux définitions. "correctAnswer" doit être une chaîne de caractères listant les paires correctes (ex: "Term1:Def1, Term2:Def2").
  
  Réponds UNIQUEMENT en JSON compact pour la rapidité.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { 
              type: Type.STRING, 
              enum: ["QCM", "OUVERTE", "DEFINITION", "CALCUL", "DRAG_DROP", "IMAGE_ANALYSIS", "MAP_INTERACTIVE", "TRUE_FALSE", "FILL_BLANKS", "MATCHING", "AUDIO_DIALOGUE", "PRONUNCIATION", "AUDIO_DICTATION", "LISTENING_COMPREHENSION", "AUDIO_FLASHCARD"] 
            },
            text: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Obligatoire pour QCM, TRUE_FALSE et LISTENING_COMPREHENSION."
            },
            pairs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING }
                },
                required: ["term", "definition"]
              }
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            points: { type: Type.NUMBER },
            imagePrompt: { type: Type.STRING },
            hotspots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  label: { type: Type.STRING }
                },
                required: ["id", "x", "y", "label"]
              }
            }
          },
          required: ["id", "type", "text", "correctAnswer", "explanation", "points"]
        }
      }
    }
  });

  try {
    const questions: any[] = JSON.parse(response.text);
    
    // Process image generation for IMAGE_ANALYSIS and MAP_INTERACTIVE questions
    // We limit image generation to first few to keep it fast
    const processedQuestions = await Promise.all(questions.map(async (q, index) => {
      if ((q.type === 'IMAGE_ANALYSIS' || q.type === 'MAP_INTERACTIVE') && q.imagePrompt && index < 5) {
        try {
          const imgResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [{ text: `Illustration pédagogique: ${q.imagePrompt} pour ${subject} ${level}.` }]
            },
            config: {
              imageConfig: { aspectRatio: "16:9" }
            }
          });
          
          for (const part of imgResponse.candidates[0].content.parts) {
            if (part.inlineData) {
              q.imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch (e) {
          q.imageUrl = `https://picsum.photos/seed/${q.id}/800/450`;
        }
      } else if ((q.type === 'IMAGE_ANALYSIS' || q.type === 'MAP_INTERACTIVE') && !q.imageUrl) {
        q.imageUrl = `https://picsum.photos/seed/${q.id}/800/450`;
      }
      return q;
    }));

    return processedQuestions;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
}

export async function verifyOpenAnswer(question: string, userAnswer: string, correctAnswer: string, language: Language): Promise<{ isCorrect: boolean; feedback: string }> {
  const prompt = `Analyse cette réponse d'élève.
  Question: ${question}
  Réponse attendue: ${correctAnswer}
  Réponse de l'élève: ${userAnswer}
  
  L'élève a-t-il raison ? Réponds en ${language}.
  Fournis une explication ciblée sur l'erreur si nécessaire.
  Réponds en JSON: { "isCorrect": boolean, "feedback": string }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING }
        },
        required: ["isCorrect", "feedback"]
      }
    }
  });

  return JSON.parse(response.text);
}


export async function getDetailedFeedback(question: string, userAnswer: string, correctAnswer: string, subject: string, level: string, language: Language): Promise<string> {
  const prompt = `En tant que tuteur IA bienveillant pour un élève de ${level}, analyse l'erreur suivante :
  Question: "${question}"
  Réponse de l'élève: "${userAnswer}"
  Réponse correcte: "${correctAnswer}"
  
  Explique précisément l'erreur de l'élève en ${language}. 
  Sois pédagogique, encourageant et donne un conseil pour ne plus refaire l'erreur. 
  Max 3 phrases.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return response.text || "Continue tes efforts !";
}

export async function generateRevisionSheet(subject: Subject, level: Level, topic: string, language: Language): Promise<{ content: string; keyPoints: string[] }> {
  const prompt = `Génère une fiche de révision structurée pour un élève de ${level} en ${subject} sur le thème "${topic}".
  La fiche doit être claire, concise et pédagogique.
  Réponds dans la langue suivante : ${language}.
  Inclus:
  1. Un résumé structuré (Markdown)
  2. Une liste de 5 à 8 points clés (Key Points)
  
  Réponds UNIQUEMENT en JSON avec les champs "content" (string Markdown) et "keyPoints" (array of strings).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["content", "keyPoints"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse revision sheet", e);
    return { content: "# Erreur\nImpossible de générer la fiche.", keyPoints: [] };
  }
}

export async function generateQuestionImages(questions: Question[]): Promise<Question[]> {
  const updatedQuestions = [...questions];
  
  for (let i = 0; i < updatedQuestions.length; i++) {
    const q = updatedQuestions[i];
    if ((q.type === 'MAP_INTERACTIVE' || q.type === 'IMAGE_ANALYSIS') && !q.imageUrl) {
      try {
        const prompt = q.imagePrompt || `Une carte géographique ou une image éducative pour : ${q.text}`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        });
        
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64EncodeString = part.inlineData.data;
              updatedQuestions[i].imageUrl = `data:image/png;base64,${base64EncodeString}`;
              break;
            }
          }
        }
      } catch (e) {
        console.error("Failed to generate image for question", q.id, e);
        // Fallback to a placeholder
        updatedQuestions[i].imageUrl = `https://picsum.photos/seed/${q.id}/800/800`;
      }
    }
  }
  
  return updatedQuestions;
}

export async function generateStudyPlan(subject: Subject, level: Level, topic: string, language: Language): Promise<StudyPlan> {
  const prompt = `Génère un plan d'étude pédagogique sur 4 semaines pour le sujet "${topic}" en ${subject} pour le niveau ${level}.
  Le plan doit être structuré par semaine avec des objectifs, des activités et des conseils de mémorisation basés sur les neurosciences (récupération active, double codage, répétition espacée).
  Ajoute aussi une section sur l'intégration avec Google Classroom.
  Réponds dans la langue suivante : ${language}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          level: { type: Type.STRING },
          topic: { type: Type.STRING },
          weeks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.NUMBER },
                title: { type: Type.STRING },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                memorizationTips: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["week", "title", "objectives", "activities", "memorizationTips"]
            }
          },
          classroomIntegration: { type: Type.STRING }
        },
        required: ["subject", "level", "topic", "weeks", "classroomIntegration"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse study plan", e);
    throw new Error("Impossible de générer le plan d'étude.");
  }
}
