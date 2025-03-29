import { apiRequest } from "./queryClient";
import { Book, BookFormValues, OcrResult, ImageSearchResult } from "@/types/books";

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
