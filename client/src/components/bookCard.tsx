import { Book } from "@/types/books";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  // Function to render star rating
  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-500" : "text-neutral-300"}>
          ★
        </span>
      );
    }
    return <div className="mt-1 text-xs">{stars}</div>;
  };

  return (
    <div className="border-b border-neutral-light py-3 flex">
      <div className="flex-shrink-0 mr-3">
        {book.coverData || book.coverUrl ? (
          <img 
            src={book.coverData || book.coverUrl} 
            alt={`Cover of ${book.title}`} 
            className="w-12 h-16 object-cover rounded-sm shadow-sm" 
          />
        ) : (
          <div className="w-12 h-16 bg-muted flex items-center justify-center rounded-sm shadow-sm">
            <span className="material-icons text-muted-foreground">book</span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-sm">{book.title}</h4>
        {book.author && <p className="text-xs text-muted-foreground">{book.author}</p>}
        {renderRating(book.rating)}
        {book.yearRead && (
          <p className="text-xs text-muted-foreground mt-1">
            Read in {book.yearRead}
          </p>
        )}
      </div>
      <div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-primary hover:text-primary/80"
          onClick={onClick}
        >
          <InfoIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
