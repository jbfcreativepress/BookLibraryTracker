import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema } from "@shared/schema";
import multer from "multer";
import { createWorker } from "tesseract.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // === Book Routes ===
  
  // Get all books
  app.get("/api/books", async (req: Request, res: Response) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Error fetching books" });
    }
  });

  // Get a specific book
  app.get("/api/books/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }

      const book = await storage.getBook(id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Error fetching book" });
    }
  });

  // Create a book
  app.post("/api/books", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(validatedData);
      res.status(201).json(book);
    } catch (error) {
      console.error("Error creating book:", error);
      res.status(400).json({ message: "Invalid book data", error });
    }
  });

  // Update a book
  app.put("/api/books/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }

      // Partial validation of the update data
      const validatedData = insertBookSchema.partial().parse(req.body);
      const updatedBook = await storage.updateBook(id, validatedData);

      if (!updatedBook) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json(updatedBook);
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(400).json({ message: "Invalid book data", error });
    }
  });

  // Delete a book
  app.delete("/api/books/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }

      const deleted = await storage.deleteBook(id);
      if (!deleted) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json({ message: "Book deleted successfully" });
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Error deleting book" });
    }
  });

  // Search books by text
  app.get("/api/books/search/text", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const books = await storage.searchBooksByText(query);
      res.json(books);
    } catch (error) {
      console.error("Error searching books:", error);
      res.status(500).json({ message: "Error searching books" });
    }
  });

  // Upload book cover for OCR processing
  app.post("/api/books/ocr", upload.single("cover"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Read image buffer
      const imageBuffer = req.file.buffer;
      
      // Initialize Tesseract worker
      const worker = await createWorker('eng');
      
      // Perform OCR on the image
      const { data } = await worker.recognize(imageBuffer);
      await worker.terminate();
      
      // Extract text from OCR result
      const extractedText = data.text;
      
      // Basic parsing to try to identify title and author
      let title = '';
      let author = '';
      
      const lines = extractedText.split('\n').filter(line => line.trim().length > 0);
      
      if (lines.length > 0) {
        // Assume the first non-empty line is the title
        title = lines[0].trim();
        
        // Look for author indicators in the following lines
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim().toLowerCase();
          if (line.includes('by ') || line.includes('author:')) {
            author = line.replace(/by |author:/i, '').trim();
            break;
          }
        }
        
        // If no author was found but we have multiple lines, use the second line
        if (!author && lines.length > 1) {
          author = lines[1].trim();
        }
      }
      
      // If we have a title, try to get more information from Google Books API
      let bookInfo = { title, author };
      
      if (title) {
        // Setup retry logic for Google Books API
        const maxRetries = 2;
        let currentRetry = 0;
        
        while (currentRetry <= maxRetries) {
          try {
            const googleBooksResponse = await axios.get(
              `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}`,
              { 
                timeout: 10000, // 10 second timeout
                headers: {
                  'Accept': 'application/json'
                }
              }
            );
            
            if (googleBooksResponse.data.items && googleBooksResponse.data.items.length > 0) {
              const bookData = googleBooksResponse.data.items[0].volumeInfo;
              
              bookInfo = {
                title: bookData.title || title,
                author: bookData.authors ? bookData.authors[0] : author,
              };
            }
            
            // If successful, break out of the retry loop
            break;
          } catch (googleApiError) {
            console.error(`Error fetching from Google Books API (attempt ${currentRetry + 1}):`, googleApiError);
            
            // Only retry on network errors or timeouts
            if (axios.isAxiosError(googleApiError) && 
                (!googleApiError.response || googleApiError.code === 'ECONNABORTED')) {
              currentRetry++;
              if (currentRetry <= maxRetries) {
                // Wait 1 second before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
            }
            
            // For all other errors or if we're out of retries, break and use OCR data
            break;
          }
        }
      }
      
      // Create a data URL for the image to send back
      const dataUrl = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;
      
      res.json({
        success: true,
        bookInfo,
        coverData: dataUrl,
        rawText: extractedText
      });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ message: "Error processing image", error: (error as Error).message });
    }
  });

  // Search books by image
  app.post("/api/books/search/image", upload.single("cover"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Read image buffer
      const imageBuffer = req.file.buffer;
      
      // Initialize Tesseract worker
      const worker = await createWorker('eng');
      
      // Perform OCR on the image
      const { data } = await worker.recognize(imageBuffer);
      await worker.terminate();
      
      // Extract text from OCR result
      const extractedText = data.text;
      
      // Basic parsing to try to identify title and author
      let title = '';
      let author = '';
      
      const lines = extractedText.split('\n').filter(line => line.trim().length > 0);
      
      if (lines.length > 0) {
        // Assume the first non-empty line is the title
        title = lines[0].trim();
        
        // Look for author indicators in the following lines
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim().toLowerCase();
          if (line.includes('by ') || line.includes('author:')) {
            author = line.replace(/by |author:/i, '').trim();
            break;
          }
        }
      }
      
      // Search books with extracted title or author
      const books = await storage.searchBooksByText(title || author);
      
      res.json({
        success: true,
        books,
        extractedInfo: {
          title,
          author,
          rawText: extractedText
        }
      });
    } catch (error) {
      console.error("Error searching by image:", error);
      res.status(500).json({ message: "Error searching by image", error: (error as Error).message });
    }
  });

  // External book search with Google Books API
  app.get("/api/external/books", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      // Make request to Google Books API with a timeout and retries
      const maxRetries = 2;
      let currentRetry = 0;
      let lastError;

      while (currentRetry <= maxRetries) {
        try {
          const response = await axios.get(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`,
            { 
              timeout: 10000, // 10 second timeout
              headers: {
                'Accept': 'application/json'
              }
            }
          );
          
          return res.json(response.data);
        } catch (error) {
          lastError = error;
          console.error(`Error fetching from Google Books API (attempt ${currentRetry + 1}):`, error);
          // Only retry on network errors or timeouts, not on 4xx errors
          if (axios.isAxiosError(error) && (!error.response || error.code === 'ECONNABORTED')) {
            currentRetry++;
            if (currentRetry <= maxRetries) {
              // Wait 1 second before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          } else {
            // Don't retry on other types of errors
            break;
          }
        }
      }

      // If we got here, all retries failed
      console.error("All attempts to fetch from Google Books API failed");
      res.status(503).json({ 
        message: "Unable to reach Google Books API after multiple attempts", 
        error: lastError ? (lastError as Error).message : "Unknown error"
      });
    } catch (error) {
      console.error("Error in external books endpoint:", error);
      res.status(500).json({ 
        message: "Error fetching from Google Books API", 
        error: (error as Error).message 
      });
    }
  });

  // Look up a book by ISBN
  app.get("/api/external/books/isbn/:isbn", async (req: Request, res: Response) => {
    try {
      const isbn = req.params.isbn;
      if (!isbn) {
        return res.status(400).json({ message: "ISBN is required" });
      }

      // Make request to Google Books API with ISBN with timeout and retries
      const maxRetries = 2;
      let currentRetry = 0;
      let lastError;

      while (currentRetry <= maxRetries) {
        try {
          const response = await axios.get(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`,
            { 
              timeout: 10000, // 10 second timeout
              headers: {
                'Accept': 'application/json'
              }
            }
          );

          if (!response.data.items || response.data.items.length === 0) {
            return res.status(404).json({ message: "Book not found with provided ISBN" });
          }

          return res.json(response.data.items[0]);
        } catch (error) {
          lastError = error;
          console.error(`Error looking up book by ISBN (attempt ${currentRetry + 1}):`, error);
          // Only retry on network errors or timeouts, not on 4xx errors
          if (axios.isAxiosError(error) && (!error.response || error.code === 'ECONNABORTED')) {
            currentRetry++;
            if (currentRetry <= maxRetries) {
              // Wait 1 second before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          } else {
            // Don't retry on other types of errors
            break;
          }
        }
      }

      // If we got here, all retries failed
      console.error("All attempts to fetch book by ISBN failed");
      res.status(503).json({ 
        message: "Unable to reach Google Books API after multiple attempts", 
        error: lastError ? (lastError as Error).message : "Unknown error"
      });
    } catch (error) {
      console.error("Error in ISBN lookup endpoint:", error);
      res.status(500).json({ 
        message: "Error looking up book by ISBN", 
        error: (error as Error).message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
