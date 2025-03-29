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
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-xl p-8 shadow-sm mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-3">
              Your Personal Book Tracker
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Keep track of the books you've read, discover new titles, and build your personal reading history.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setActiveTab("add")} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add a Book
              </Button>
              <Button onClick={() => setActiveTab("search")} variant="outline" className="border-primary/30 hover:bg-primary/5">
                <Search className="h-4 w-4 mr-2" />
                Find a Book
              </Button>
              <Button onClick={() => setActiveTab("discover")} variant="outline" className="border-primary/30 hover:bg-primary/5">
                <Lightbulb className="h-4 w-4 mr-2" />
                Discover New Titles
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white rounded-xl shadow-sm p-1 mb-8 inline-flex">
            <TabsList className="bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="add" 
                className="py-3 px-6 font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground transition-all rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="py-3 px-6 font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground transition-all rounded-lg"
              >
                <Search className="h-4 w-4 mr-2" />
                Find Book
              </TabsTrigger>
              <TabsTrigger 
                value="discover"
                className="py-3 px-6 font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground transition-all rounded-lg"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Discover
              </TabsTrigger>
            </TabsList>
          </div>

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
          
          <TabsContent value="discover" className="space-y-0 border-none p-0">
            <BookRecommendations />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-primary/5 border-t border-primary/10 py-6 mt-8">
        <div className="container mx-auto px-4 text-sm text-center">
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