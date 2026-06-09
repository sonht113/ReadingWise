export interface Annotation {
  id: string;
  userId: string;
  articleId: string;
  vocabularyId: string;
  startOffset: number;
  endOffset: number;
  selectedText: string;
  createdAt: string;
}

export interface Vocabulary {
  id: string;
  phrase: string;
  translation: string | null;
  explanation: string | null;
  example: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  collectionId: string;
  title: string;
  content: string;
  sourceUrl?: string | null;
  translatedContent?: string | null;
  language?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  articleId: string;
  type: string;
  question: string;
  options: unknown;
  answer: string;
}

export interface UserAnswer {
  id: string;
  userId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
}
