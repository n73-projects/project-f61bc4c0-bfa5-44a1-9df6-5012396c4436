import { create } from 'zustand';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastStudied?: Date;
  timesStudied: number;
  correctCount: number;
}

export interface StudySession {
  totalCards: number;
  studiedCards: number;
  correctAnswers: number;
  startTime: Date;
}

interface FlashcardStore {
  flashcards: Flashcard[];
  currentSession: StudySession | null;
  selectedCategory: string;
  isStudying: boolean;
  currentCardIndex: number;
  
  // Actions
  addFlashcard: (flashcard: Omit<Flashcard, 'id' | 'timesStudied' | 'correctCount'>) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  startStudySession: (category?: string) => void;
  endStudySession: () => void;
  markCardStudied: (id: string, correct: boolean) => void;
  nextCard: () => void;
  setCategory: (category: string) => void;
  getAvailableCategories: () => string[];
  getFilteredCards: () => Flashcard[];
}

export const useFlashcardStore = create<FlashcardStore>((set, get) => ({
  flashcards: [
    {
      id: '1',
      front: 'What is React?',
      back: 'A JavaScript library for building user interfaces, particularly web applications.',
      category: 'Programming',
      difficulty: 'medium',
      timesStudied: 0,
      correctCount: 0,
    },
    {
      id: '2',
      front: 'What is TypeScript?',
      back: 'A programming language that builds on JavaScript by adding static type definitions.',
      category: 'Programming',
      difficulty: 'medium',
      timesStudied: 0,
      correctCount: 0,
    },
    {
      id: '3',
      front: 'What is the capital of France?',
      back: 'Paris',
      category: 'Geography',
      difficulty: 'easy',
      timesStudied: 0,
      correctCount: 0,
    },
  ],
  currentSession: null,
  selectedCategory: 'All',
  isStudying: false,
  currentCardIndex: 0,

  addFlashcard: (flashcard) =>
    set((state) => ({
      flashcards: [
        ...state.flashcards,
        {
          ...flashcard,
          id: Date.now().toString(),
          timesStudied: 0,
          correctCount: 0,
        },
      ],
    })),

  updateFlashcard: (id, updates) =>
    set((state) => ({
      flashcards: state.flashcards.map((card) =>
        card.id === id ? { ...card, ...updates } : card
      ),
    })),

  deleteFlashcard: (id) =>
    set((state) => ({
      flashcards: state.flashcards.filter((card) => card.id !== id),
    })),

  startStudySession: (category) => {
    const filteredCards = get().getFilteredCards();
    const cards = category && category !== 'All' 
      ? filteredCards.filter(card => card.category === category)
      : filteredCards;
    
    set({
      isStudying: true,
      currentCardIndex: 0,
      currentSession: {
        totalCards: cards.length,
        studiedCards: 0,
        correctAnswers: 0,
        startTime: new Date(),
      },
      selectedCategory: category || 'All',
    });
  },

  endStudySession: () =>
    set({
      isStudying: false,
      currentSession: null,
      currentCardIndex: 0,
    }),

  markCardStudied: (id, correct) => {
    set((state) => ({
      flashcards: state.flashcards.map((card) =>
        card.id === id
          ? {
              ...card,
              timesStudied: card.timesStudied + 1,
              correctCount: card.correctCount + (correct ? 1 : 0),
              lastStudied: new Date(),
            }
          : card
      ),
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            studiedCards: state.currentSession.studiedCards + 1,
            correctAnswers: state.currentSession.correctAnswers + (correct ? 1 : 0),
          }
        : null,
    }));
  },

  nextCard: () =>
    set((state) => ({
      currentCardIndex: state.currentCardIndex + 1,
    })),

  setCategory: (category) =>
    set({ selectedCategory: category }),

  getAvailableCategories: () => {
    const categories = Array.from(
      new Set(get().flashcards.map((card) => card.category))
    );
    return ['All', ...categories];
  },

  getFilteredCards: () => {
    const { flashcards, selectedCategory } = get();
    return selectedCategory === 'All'
      ? flashcards
      : flashcards.filter((card) => card.category === selectedCategory);
  },
}));