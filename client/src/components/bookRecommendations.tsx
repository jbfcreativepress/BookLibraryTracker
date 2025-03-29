import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBookRecommendations } from "@/lib/bookService";
import { ExternalBook } from "@/types/books";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ExternalLink } from "lucide-react";

export function BookRecommendations() {
  const { toast } = useToast();
  
  const { data: recommendations, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/recommendations'],
    queryFn: getBookRecommendations,
  });
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing recommendations",
      description: "Finding new books you might enjoy",
    });
  };
  
  if (isError) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-primary mb-4">Discover New Titles</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't retrieve your book recommendations at this time.
        </p>
        <Button onClick={handleRefresh} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Discover New Titles</h2>
          <p className="text-muted-foreground">
            Based on your reading history, here are some books you might enjoy.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2">
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
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
            Add more books to your collection to get personalized recommendations.
          </p>
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
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-[2/3] bg-muted relative">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={`Cover of ${book.title}`} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-primary/5">
            <BookOpen className="h-12 w-12 text-primary/30" />
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
        
        {book.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
            {book.description}
          </p>
        )}
        
        <a 
          href={googleBooksUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm inline-flex items-center text-primary hover:underline mt-auto"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View on Google Books
        </a>
      </CardContent>
    </Card>
  );
}