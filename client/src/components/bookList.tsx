import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@/types/books";
import { getAllBooks, deleteBook } from "@/lib/bookService";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Loader, 
  Search, 
  BookOpen, 
  Info, 
  Trash2,
  SortAsc,
  SortDesc,
  FilterX
} from "lucide-react";
import { BookDetailModal } from "./bookDetailModal";

export function BookList() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [sortField, setSortField] = useState<keyof Book>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const {
    data: books = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["/api/books"],
    queryFn: getAllBooks
  });

  const deleteBookMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({
        title: "Book Deleted",
        description: "The book has been removed from your collection.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete book: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  });

  const handleViewBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleEditBook = (updatedBook: Book) => {
    // The modal will handle the API call
    setSelectedBook(null);
    queryClient.invalidateQueries({ queryKey: ["/api/books"] });
  };

  const handleDeleteBook = (id: number) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      deleteBookMutation.mutate(id);
    }
  };

  const handleSort = (field: keyof Book) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredBooks = books.filter(book => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      (book.author && book.author.toLowerCase().includes(query)) ||
      (book.isbn && book.isbn.toLowerCase().includes(query)) ||
      (book.publisher && book.publisher.toLowerCase().includes(query))
    );
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (fieldA === undefined || fieldA === null) return sortDirection === "asc" ? 1 : -1;
    if (fieldB === undefined || fieldB === null) return sortDirection === "asc" ? -1 : 1;

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc" 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    }

    if (typeof fieldA === "number" && typeof fieldB === "number") {
      return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA;
    }

    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Book Collection</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search books..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="text-red-500 py-2">
          Error: {(error as Error).message || "Failed to load books"}
        </div>
      )}

      {!isLoading && !books.length && (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No books yet</h3>
          <p className="text-muted-foreground">
            You haven't added any books to your collection yet.
          </p>
        </div>
      )}

      {!isLoading && books.length > 0 && filteredBooks.length === 0 && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No matching books</h3>
          <p className="text-muted-foreground">
            No books match your search for "{searchQuery}".
          </p>
        </div>
      )}

      {filteredBooks.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center">
                        Title
                        {sortField === "title" && (
                          sortDirection === "asc" ? 
                            <SortAsc className="ml-1 h-4 w-4" /> : 
                            <SortDesc className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("author")}
                    >
                      <div className="flex items-center">
                        Author
                        {sortField === "author" && (
                          sortDirection === "asc" ? 
                            <SortAsc className="ml-1 h-4 w-4" /> : 
                            <SortDesc className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("yearRead")}
                    >
                      <div className="flex items-center">
                        Year Read
                        {sortField === "yearRead" && (
                          sortDirection === "asc" ? 
                            <SortAsc className="ml-1 h-4 w-4" /> : 
                            <SortDesc className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("rating")}
                    >
                      <div className="flex items-center">
                        Rating
                        {sortField === "rating" && (
                          sortDirection === "asc" ? 
                            <SortAsc className="ml-1 h-4 w-4" /> : 
                            <SortDesc className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("isbn")}
                    >
                      <div className="flex items-center">
                        ISBN
                        {sortField === "isbn" && (
                          sortDirection === "asc" ? 
                            <SortAsc className="ml-1 h-4 w-4" /> : 
                            <SortDesc className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        {book.coverUrl || book.coverData ? (
                          <div className="w-10 h-14 overflow-hidden rounded">
                            <img 
                              src={book.coverUrl || book.coverData} 
                              alt={`Cover of ${book.title}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.yearRead}</TableCell>
                      <TableCell>
                        {book.rating && (
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <span key={index} className="text-yellow-500">
                                {index < book.rating! ? "★" : "☆"}
                              </span>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{book.isbn}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewBook(book)}
                            title="View Details"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBook(book.id)}
                            title="Delete Book"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="text-xs text-muted-foreground">
              Showing {filteredBooks.length} of {books.length} books
            </div>
          </CardFooter>
        </Card>
      )}

      <BookDetailModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onEdit={handleEditBook}
      />
    </div>
  );
}