import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { searchBooksByText, searchBooksByImage } from "@/lib/bookService";
import { Book, ImageSearchResult } from "@/types/books";
import { ImageUpload } from "@/components/imageUpload";
import { BookCard } from "@/components/bookCard";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Camera, Loader } from "lucide-react";

interface TextSearchProps {
  onBookSelect: (book: Book) => void;
  onAddBookFromSearch?: () => void;
}

export function TextSearch({ onBookSelect }: TextSearchProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchBooksByText(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Search Error",
        description: `Error searching for books: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold">
          <span className="material-icons mr-2 text-primary">search</span>
          Search by Title or Author
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter book title or author name"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSearching}>
            {isSearching ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search My Books"
            )}
          </Button>
        </form>

        {isSearching && (
          <div className="my-4 text-center py-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground mt-1">Searching...</p>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-sm mb-3 border-b pb-2">Search Results</h3>
            <div className="space-y-4">
              {searchResults.map((book) => (
                <BookCard key={book.id} book={book} onClick={() => onBookSelect(book)} />
              ))}
            </div>
          </div>
        )}

        {!isSearching && searchQuery && searchResults.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No matching books found in your collection.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ImageSearch({ onBookSelect, onAddBookFromSearch }: TextSearchProps) {
  const { toast } = useToast();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<ImageSearchResult["extractedInfo"] | null>(null);

  const handleImageSelect = (file: File) => {
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
    // Reset search state
    setSearchResults([]);
    setHasSearched(false);
    setExtractedInfo(null);
  };

  const handleImageRemove = () => {
    setCoverImage(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(undefined);
    }
    // Reset search state
    setSearchResults([]);
    setHasSearched(false);
    setExtractedInfo(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) return;

    setIsSearching(true);
    setHasSearched(false);
    
    try {
      const result = await searchBooksByImage(coverImage);
      setSearchResults(result.books);
      setExtractedInfo(result.extractedInfo);
      setHasSearched(true);
    } catch (error) {
      toast({
        title: "Search Error",
        description: `Error searching by image: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold">
          <span className="material-icons mr-2 text-primary">photo_camera</span>
          Search by Cover Photo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <ImageUpload
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            previewUrl={coverPreview}
            disabled={isSearching}
          />

          <Button 
            type="submit" 
            className="w-full" 
            variant="secondary"
            disabled={!coverImage || isSearching}
          >
            {isSearching ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <span className="material-icons mr-1 text-sm">image_search</span>
                Search My Books
              </>
            )}
          </Button>
        </form>

        {isSearching && (
          <div className="my-4 text-center py-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground mt-1">
              Analyzing image and searching...
            </p>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-sm mb-3 border-b pb-2">Image Search Results</h3>
            <div className="space-y-4">
              {searchResults.map((book) => (
                <BookCard key={book.id} book={book} onClick={() => onBookSelect(book)} />
              ))}
            </div>
          </div>
        )}

        {!isSearching && hasSearched && searchResults.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No matching books found in your collection.
            </p>
            {extractedInfo && extractedInfo.title && (
              <Button
                type="button"
                variant="link"
                className="mt-2 text-xs text-secondary"
                onClick={onAddBookFromSearch}
              >
                Add this book to your collection
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
