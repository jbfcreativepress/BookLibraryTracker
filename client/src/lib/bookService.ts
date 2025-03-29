import { apiRequest } from "./queryClient";
import { 
  Book, 
  BookFormValues, 
  OcrResult, 
  ImageSearchResult,
  GoogleBookSearchResult,
  ExternalBookSearchResult,
  ExternalBook
} from "@/types/books";

export async function getAllBooks(): Promise<Book[]> {
  const response = await apiRequest("GET", "/api/books");
  return response.json();
}

export async function getBook(id: number): Promise<Book> {
  const response = await apiRequest("GET", `/api/books/${id}`);
  return response.json();
}

export async function createBook(book: BookFormValues): Promise<Book> {
  const response = await apiRequest("POST", "/api/books", book);
  return response.json();
}

export async function updateBook(id: number, book: Partial<BookFormValues>): Promise<Book> {
  const response = await apiRequest("PUT", `/api/books/${id}`, book);
  return response.json();
}

export async function deleteBook(id: number): Promise<{ message: string }> {
  const response = await apiRequest("DELETE", `/api/books/${id}`);
  return response.json();
}

export async function searchBooksByText(query: string): Promise<Book[]> {
  const response = await apiRequest("GET", `/api/books/search/text?q=${encodeURIComponent(query)}`);
  return response.json();
}

export async function processBookCoverImage(image: File): Promise<OcrResult> {
  const formData = new FormData();
  formData.append("cover", image);
  
  const response = await fetch("/api/books/ocr", {
    method: "POST",
    body: formData,
    credentials: "include"
  });
  
  if (!response.ok) {
    throw new Error(`Image processing failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function searchBooksByImage(image: File): Promise<ImageSearchResult> {
  const formData = new FormData();
  formData.append("cover", image);
  
  const response = await fetch("/api/books/search/image", {
    method: "POST",
    body: formData,
    credentials: "include"
  });
  
  if (!response.ok) {
    throw new Error(`Image search failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Search for books using the Google Books API
 * @param query The search query (title, author, ISBN, etc.)
 * @returns An array of books matching the query
 */
export async function searchGoogleBooks(query: string): Promise<ExternalBookSearchResult> {
  // Make a request to our backend which will proxy the call to Google Books API
  const response = await apiRequest("GET", `/api/external/books?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  
  // Convert the Google Books API response to our ExternalBook format
  if (!data.items || data.items.length === 0) {
    return { books: [], totalItems: 0 };
  }
  
  const books: ExternalBook[] = data.items.map((item: any) => {
    const volumeInfo = item.volumeInfo;
    const isbn = volumeInfo.industryIdentifiers?.find(
      (id: any) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
    )?.identifier;
    
    return {
      id: item.id,
      title: volumeInfo.title || 'Unknown Title',
      author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
      coverUrl: volumeInfo.imageLinks?.thumbnail || '',
      isbn: isbn || '',
      publisher: volumeInfo.publisher || '',
      publishedDate: volumeInfo.publishedDate || '',
      description: volumeInfo.description || ''
    };
  });
  
  return {
    books,
    totalItems: data.totalItems || books.length
  };
}

/**
 * Get a book's details from Google Books by ISBN
 * @param isbn The ISBN of the book to look up
 * @returns Details of the book matching the ISBN
 */
export async function getBookByIsbn(isbn: string): Promise<ExternalBook | null> {
  try {
    const result = await searchGoogleBooks(`isbn:${isbn}`);
    return result.books.length > 0 ? result.books[0] : null;
  } catch (error) {
    console.error('Error fetching book by ISBN:', error);
    return null;
  }
}
