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

/**
 * Get book recommendations based on user's reading history
 * This analyzes the user's books and returns recommended titles
 * @returns Array of recommended books
 */
export async function getBookRecommendations(): Promise<ExternalBook[]> {
  try {
    // Get all the user's books to analyze their reading preferences
    const userBooks = await getAllBooks();
    
    if (!userBooks || userBooks.length === 0) {
      // If user has no books, return popular books in various genres
      return await getDefaultRecommendations();
    }
    
    // Create a combined approach using all available book data
    const recommendations = await Promise.all([
      getAuthorBasedRecommendations(userBooks),
      getGenreBasedRecommendations(userBooks),
      getRecentlyReadRecommendations(userBooks)
    ]);
    
    // Combine and flatten results, then remove duplicates
    const allRecommendations = recommendations.flat();
    
    // Remove duplicates based on book id
    const uniqueRecommendations = Array.from(
      new Map(allRecommendations.map(book => [book.id, book])).values()
    );
    
    // Filter out books the user already has
    const userBookTitles = new Set(userBooks.map(book => book.title));
    const filteredRecommendations = uniqueRecommendations.filter(book => !userBookTitles.has(book.title));
    
    if (filteredRecommendations.length === 0) {
      return await getDefaultRecommendations();
    }
    
    return filteredRecommendations.slice(0, 6); // Return up to 6 recommendations
    
  } catch (error) {
    console.error('Error fetching book recommendations:', error);
    return await getDefaultRecommendations();
  }
}

/**
 * Get recommendations based on authors the user has read
 */
async function getAuthorBasedRecommendations(userBooks: Book[]): Promise<ExternalBook[]> {
  try {
    // Extract authors from user's books
    const authors = userBooks.map(book => book.author).filter(Boolean) as string[];
    
    if (authors.length === 0) {
      return [];
    }
    
    // Get the most frequently occurring author
    const authorCounts = authors.reduce((acc, author) => {
      acc[author] = (acc[author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topAuthors = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 2); // Take top 2 authors
      
    if (topAuthors.length === 0) {
      return [];
    }
    
    // For each top author, get more books by them
    const authorResults = await Promise.all(
      topAuthors.map(author => searchGoogleBooks(`inauthor:"${author}"`))
    );
    
    // Combine results
    const authorBooks = authorResults.flatMap(result => result.books);
    return authorBooks;
    
  } catch (error) {
    console.error('Error getting author-based recommendations:', error);
    return [];
  }
}

/**
 * Get recommendations based on genres/subjects from user's reading history
 */
async function getGenreBasedRecommendations(userBooks: Book[]): Promise<ExternalBook[]> {
  try {
    // Extract info from book titles and descriptions that might indicate genre
    const titleKeywords = userBooks
      .flatMap(book => {
        const words = book.title.split(' ')
          .filter(word => word.length > 4) // Only longer words
          .map(word => word.toLowerCase());
        return words;
      })
      .filter(word => !['about', 'after', 'before', 'their', 'there', 'these', 'those', 'where', 'which'].includes(word));
    
    // Get most frequent keywords
    const keywordCounts = titleKeywords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 3); // Take top 3 keywords
    
    if (topKeywords.length === 0) {
      return [];
    }
    
    // Search for books with similar topics/genres
    const query = topKeywords.join(' ');
    const result = await searchGoogleBooks(query);
    
    return result.books;
    
  } catch (error) {
    console.error('Error getting genre-based recommendations:', error);
    return [];
  }
}

/**
 * Get recommendations based on recently read books
 */
async function getRecentlyReadRecommendations(userBooks: Book[]): Promise<ExternalBook[]> {
  try {
    // Sort books by creation date (most recent first)
    const sortedBooks = [...userBooks].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    // Take the 2 most recent books
    const recentBooks = sortedBooks.slice(0, 2);
    
    if (recentBooks.length === 0) {
      return [];
    }
    
    // For each recent book, find similar books
    const recentResults = await Promise.all(
      recentBooks.map(book => {
        // Use title and author for better results
        const title = book.title || '';
        const author = book.author || '';
        
        // Create a balanced query
        let query = title;
        if (author) {
          // If we have both, search for similar books not by the same author
          query = `${title} -inauthor:"${author}"`;
        }
        
        return searchGoogleBooks(query);
      })
    );
    
    // Combine results
    const similarBooks = recentResults.flatMap(result => result.books);
    return similarBooks;
    
  } catch (error) {
    console.error('Error getting recommendations from recent books:', error);
    return [];
  }
}

/**
 * Get default book recommendations (popular or classic books)
 * Used when user has no reading history
 */
async function getDefaultRecommendations(): Promise<ExternalBook[]> {
  // Popular books across different genres
  const popularQueries = [
    'best sellers fiction',
    'award winning books',
    'classic literature'
  ];
  
  // Randomly select one query to get varied recommendations
  const randomIndex = Math.floor(Math.random() * popularQueries.length);
  const query = popularQueries[randomIndex];
  
  try {
    const result = await searchGoogleBooks(query);
    return result.books.slice(0, 6); // Return up to 6 recommendations
  } catch (error) {
    console.error('Error fetching default recommendations:', error);
    return [];
  }
}
