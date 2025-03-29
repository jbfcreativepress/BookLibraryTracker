export interface Book {
  id: number;
  title: string;
  author?: string;
  yearRead?: number;
  rating?: number;
  notes?: string;
  coverUrl?: string;
  coverData?: string;
  createdAt?: Date;
}

export interface BookFormValues {
  title: string;
  author?: string;
  yearRead?: number;
  rating?: number;
  notes?: string;
  coverUrl?: string;
  coverData?: string;
}

export interface OcrResult {
  success: boolean;
  bookInfo: {
    title: string;
    author: string;
  };
  coverData: string;
  rawText: string;
}

export interface ImageSearchResult {
  success: boolean;
  books: Book[];
  extractedInfo: {
    title: string;
    author: string;
    rawText: string;
  };
}
