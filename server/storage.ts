import { books, type Book, type InsertBook, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book-related methods
  getAllBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  searchBooksByText(query: string): Promise<Book[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private userCurrentId: number;
  private bookCurrentId: number;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.userCurrentId = 1;
    this.bookCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.bookCurrentId++;
    const now = new Date();
    
    // Convert undefined values to null to satisfy the Book type
    const book: Book = {
      id,
      title: insertBook.title,
      author: insertBook.author ?? null,
      yearRead: insertBook.yearRead ?? null,
      rating: insertBook.rating ?? null,
      notes: insertBook.notes ?? null,
      coverUrl: insertBook.coverUrl ?? null,
      coverData: insertBook.coverData ?? null,
      isbn: insertBook.isbn ?? null,
      publisher: insertBook.publisher ?? null,
      publishedDate: insertBook.publishedDate ?? null,
      description: insertBook.description ?? null,
      createdAt: now
    };
    
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: number, updateData: Partial<InsertBook>): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;

    // Create a new book object with the updated data
    const updatedBook: Book = {
      ...book,
      title: updateData.title ?? book.title,
      author: updateData.author ?? book.author,
      yearRead: updateData.yearRead ?? book.yearRead,
      rating: updateData.rating ?? book.rating,
      notes: updateData.notes ?? book.notes,
      coverUrl: updateData.coverUrl ?? book.coverUrl,
      coverData: updateData.coverData ?? book.coverData,
      isbn: updateData.isbn ?? book.isbn,
      publisher: updateData.publisher ?? book.publisher,
      publishedDate: updateData.publishedDate ?? book.publishedDate,
      description: updateData.description ?? book.description,
    };

    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }

  async searchBooksByText(query: string): Promise<Book[]> {
    if (!query || query.trim() === '') {
      return [];
    }
    
    const normalizedQuery = query.trim().toLowerCase();
    return Array.from(this.books.values()).filter(book => {
      return (
        book.title.toLowerCase().includes(normalizedQuery) ||
        (book.author && book.author.toLowerCase().includes(normalizedQuery)) ||
        (book.isbn && book.isbn.toLowerCase().includes(normalizedQuery)) ||
        (book.publisher && book.publisher.toLowerCase().includes(normalizedQuery)) ||
        (book.description && book.description.toLowerCase().includes(normalizedQuery))
      );
    });
  }
}

export const storage = new MemStorage();
