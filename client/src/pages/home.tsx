import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllBooks } from "@/lib/bookService";
import { Book } from "@/types/books";
import { TextBookForm, ImageBookForm } from "@/components/bookForm";
import { TextSearch, ImageSearch } from "@/components/bookSearch";
import { BookDetailModal } from "@/components/bookDetailModal";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("add");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: books, isLoading } = useQuery({
    queryKey: ["/api/books"],
    queryFn: getAllBooks,
  });

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setIsModalOpen(false);
    setActiveTab("add");
    // In a real app, you would populate the form with the book data for editing
  };

  const handleAddSuccess = () => {
    // Additional actions after adding a book (if needed)
  };

  const handleAddFromSearch = () => {
    setActiveTab("add");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary flex items-center">
            <span className="material-icons mr-2">auto_stories</span>
            BookTracker
          </h1>
          <div className="flex items-center">
            <div className="h-8 w-8 bg-neutral-light rounded-full flex items-center justify-center text-sm font-medium text-primary">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 border-b border-neutral-light w-full bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="add" 
              className="py-3 px-4 font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=inactive]:text-neutral-dark transition-all bg-transparent rounded-none"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Book
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="py-3 px-4 font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=inactive]:text-neutral-dark transition-all bg-transparent rounded-none"
            >
              <Search className="h-4 w-4 mr-1" />
              Find Book
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-0 border-none p-0">
            <div className="grid md:grid-cols-2 gap-6">
              <TextBookForm onSuccess={handleAddSuccess} />
              <ImageBookForm onSuccess={handleAddSuccess} />
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-0 border-none p-0">
            <div className="grid md:grid-cols-2 gap-6">
              <TextSearch onBookSelect={handleBookSelect} />
              <ImageSearch 
                onBookSelect={handleBookSelect} 
                onAddBookFromSearch={handleAddFromSearch}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-light py-4 mt-6">
        <div className="container mx-auto px-4 text-sm text-neutral-dark text-center">
          <p>BookTracker — Your Personal Reading History</p>
        </div>
      </footer>

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={handleEditBook}
      />
    </div>
  );
}
