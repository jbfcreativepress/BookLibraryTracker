import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalBook } from "@/types/books";
import { searchGoogleBooks } from "@/lib/bookService";
import { Loader } from "lucide-react";

interface ExternalBookSearchProps {
  onBookSelect: (book: ExternalBook) => void;
  onCancel: () => void;
}

export function ExternalBookSearch({ onBookSelect, onCancel }: ExternalBookSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["externalBooks", searchTerm],
    queryFn: () => searchGoogleBooks(searchTerm),
    enabled: !!searchTerm,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchTerm(searchQuery);
    }
  };
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </form>
      
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      )}
      
      {isError && (
        <div className="text-red-500 py-2">
          Error: {(error as Error).message || "Failed to search books"}
        </div>
      )}
      
      {data && data.books.length === 0 && searchTerm && !isLoading && (
        <div className="text-center py-4">
          No books found for "{searchTerm}"
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.books.map((book) => (
          <Card key={book.id} className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex gap-4">
                {book.coverUrl && (
                  <div className="flex-shrink-0">
                    <img 
                      src={book.coverUrl} 
                      alt={`Cover of ${book.title}`}
                      className="w-24 h-auto object-cover rounded"
                    />
                  </div>
                )}
                <div className="space-y-2 flex-1">
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  {book.publisher && (
                    <p className="text-xs text-muted-foreground">{book.publisher}, {book.publishedDate}</p>
                  )}
                  {book.isbn && (
                    <p className="text-xs">ISBN: {book.isbn}</p>
                  )}
                  {book.description && (
                    <p className="text-xs line-clamp-3">{book.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => onBookSelect(book)}
                size="sm"
              >
                Select This Book
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}