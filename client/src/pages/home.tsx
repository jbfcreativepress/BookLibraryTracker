import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllBooks } from "@/lib/bookService";
import { Book } from "@/types/books";
import { TextBookForm } from "@/components/bookForm";
import { ImageBookForm } from "@/components/bookForm";
import { TextSearch } from "@/components/bookSearch";
import { ImageSearch } from "@/components/bookSearch";
import { BookDetailModal } from "@/components/bookDetailModal";
import { BookRecommendations } from "@/components/bookRecommendations";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, BookOpen, Lightbulb } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("add");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: books, isLoading } = useQuery({
    queryKey: ["/api/books"],
    queryFn: getAllBooks,
  });

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
    toast({
      title: "Book Found",
      description: `"${book.title}" is in your collection.`,
      variant: "default",
    });
  };

  const handleEditBook = (book: Book) => {
    setIsModalOpen(false);
    setActiveTab("add");
    toast({
      title: "Book Updated",
      description: `Successfully updated "${book.title}".`,
      variant: "default",
    });
  };

  const handleAddSuccess = () => {
    // Additional actions after adding a book (if needed)
  };

  const handleAddFromSearch = () => {
    setActiveTab("add");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <main className="flex-1 container mx-auto px-3 xs:px-4 py-4 md:py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-lg md:rounded-xl p-3 md:p-8 shadow-sm mb-4 md:mb-12">
          <div>
            <h1 className="text-xl xs:text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-1 md:mb-3">
              Your Personal Book Tracker
            </h1>
            <p className="text-sm xs:text-base md:text-lg text-muted-foreground mb-3 md:mb-6 max-w-3xl">
              Keep track of the books you've read, discover new titles, and build your personal reading history.
            </p>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <Button 
                onClick={() => setActiveTab("add")} 
                className="bg-primary hover:bg-primary/90 text-xs xs:text-sm md:text-base h-8 md:h-10"
                size="sm"
              >
                <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden xxs:inline">Add Book</span>
                <span className="xxs:hidden">Add</span>
              </Button>
              <Button 
                onClick={() => setActiveTab("search")} 
                variant="outline" 
                className="border-primary/30 hover:bg-primary/5 text-xs xs:text-sm md:text-base h-8 md:h-10"
                size="sm"
              >
                <Search className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden xxs:inline">Find Book</span>
                <span className="xxs:hidden">Find</span>
              </Button>
              <Button 
                onClick={() => setActiveTab("discover")} 
                variant="outline" 
                className="border-primary/30 hover:bg-primary/5 text-xs xs:text-sm md:text-base h-8 md:h-10"
                size="sm"
              >
                <Lightbulb className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden xxs:inline">Discover</span>
                <span className="xxs:hidden">New</span>
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6 h-10">
            <TabsTrigger value="add" className="flex items-center justify-center px-1 md:px-4 text-xs xs:text-sm md:text-base">
              <Plus className="h-3 w-3 mr-1 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden xs:inline">Add Book</span>
              <span className="xs:hidden">Add</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center justify-center px-1 md:px-4 text-xs xs:text-sm md:text-base">
              <Search className="h-3 w-3 mr-1 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden xs:inline">Find Book</span>
              <span className="xs:hidden">Find</span>
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center justify-center px-1 md:px-4 text-xs xs:text-sm md:text-base">
              <Lightbulb className="h-3 w-3 mr-1 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden xs:inline">Discover</span>
              <span className="xs:hidden">New</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-0 border-none p-0 mt-2 md:mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <TextBookForm onSuccess={handleAddSuccess} />
              <ImageBookForm onSuccess={handleAddSuccess} />
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-0 border-none p-0 mt-2 md:mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <TextSearch onBookSelect={handleBookSelect} />
              <ImageSearch 
                onBookSelect={handleBookSelect} 
                onAddBookFromSearch={handleAddFromSearch}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="discover" className="space-y-0 border-none p-0 mt-2 md:mt-4">
            <BookRecommendations />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-primary/5 border-t border-primary/10 py-4 md:py-6 mt-4 md:mt-8">
        <div className="container mx-auto px-4 text-xs md:text-sm text-center">
          <p className="text-muted-foreground">BookTracker — Your Personal Reading History</p>
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