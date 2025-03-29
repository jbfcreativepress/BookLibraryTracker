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
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
}

export interface BookFormValues {
  title: string;
  author?: string;
  yearRead?: number;
  rating?: number;
  notes?: string;
  coverUrl?: string;
  coverData?: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
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

// Google Books API types
export interface GoogleBookSearchResult {
  kind: string;
  totalItems: number;
  items: GoogleBookItem[];
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
    categories?: string[];
    language?: string;
    pageCount?: number;
  };
}

export interface ExternalBookSearchResult {
  books: ExternalBook[];
  totalItems: number;
}

export interface ExternalBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
}
