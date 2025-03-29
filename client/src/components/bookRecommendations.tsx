import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBookRecommendations, getAllBooks } from "@/lib/bookService";
import { ExternalBook, Book } from "@/types/books";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ExternalLink, RefreshCw, RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BookRecommendations() {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  
  // Get recommendation source info
  const { data: userBooks } = useQuery({
    queryKey: ["/api/books"],
    queryFn: getAllBooks,
  });
  
  const { data: recommendations, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/recommendations'],
    queryFn: getBookRecommendations,
  });
  
  const handleRefresh = async () => {
    setRefreshing(true);
    toast({
      title: "Refreshing recommendations",
      description: "Finding new books based on your reading history",
    });
    
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };
  
  // Extract top authors from user's books to show context
  const getTopAuthors = (): string[] => {
    if (!userBooks || userBooks.length === 0) return [];
    
    const authors = userBooks
      .map(book => book.author)
      .filter(Boolean) as string[];
      
    const authorCounts = authors.reduce((acc, author) => {
      if (author) {
        acc[author] = (acc[author] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 2);
  };
  
  const topAuthors = getTopAuthors();
  const hasBooks = userBooks && userBooks.length > 0;
  
  if (isError) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-primary mb-4">Discover New Titles</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't retrieve your book recommendations at this time.
        </p>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          {refreshing ? (
            <>
              <RotateCw className="h-4 w-4 mr-2 animate-spin" />
              Trying Again...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Discover New Titles</h2>
          <p className="text-muted-foreground">
            {hasBooks 
              ? "Based on your reading history, here are some books you might enjoy." 
              : "Explore popular and trending books across different genres."}
          </p>
          
          {hasBooks && topAuthors.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Based on authors you read:</span>
              {topAuthors.map(author => (
                <Badge key={author} variant="outline" className="bg-primary/5">
                  {author}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 whitespace-nowrap"
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh Recommendations
            </>
          )}
        </Button>
      </div>
      
      {isLoading || refreshing ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[2/3] bg-muted relative">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((book) => (
            <BookRecommendationCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">No recommendations yet</h3>
          <p className="text-muted-foreground mb-6">
            {hasBooks 
              ? "We couldn't find recommendations based on your current collection. Try adding more books with different authors and genres."
              : "Add some books to your collection to get personalized recommendations."}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

interface BookRecommendationCardProps {
  book: ExternalBook;
}

function BookRecommendationCard({ book }: BookRecommendationCardProps) {
  const googleBooksUrl = `https://books.google.com/books?id=${book.id}`;
  
  return (
    <Card className="overflow-hidden h-full flex flex-col group">
      <div className="aspect-[2/3] bg-muted relative overflow-hidden">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={`Cover of ${book.title}`} 
            className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-primary/5">
            <BookOpen className="h-12 w-12 text-primary/30" />
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">{book.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
        
        {book.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
            {book.description}
          </p>
        )}
        
        <div className="mt-auto flex justify-between items-center">
          <a 
            href={googleBooksUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm inline-flex items-center text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Details
          </a>
          
          {book.publisher && (
            <span className="text-xs text-muted-foreground">{book.publisher}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}