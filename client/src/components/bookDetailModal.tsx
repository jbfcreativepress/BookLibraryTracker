import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { deleteBook } from "@/lib/bookService";
import { queryClient } from "@/lib/queryClient";
import { Book } from "@/types/books";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (book: Book) => void;
}

export function BookDetailModal({ book, isOpen, onClose, onEdit }: BookDetailModalProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const deleteBookMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({
        title: "Book Deleted",
        description: "The book has been removed from your collection.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete book: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = async () => {
    if (book) {
      await deleteBookMutation.mutateAsync(book.id);
      setIsDeleteDialogOpen(false);
    }
  };

  // Function to render star rating
  const renderRating = (rating?: number) => {
    if (!rating) return "Not rated";
    
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-500" : "text-neutral-300"}>
          ★
        </span>
      );
    }
    return <>{stars}</>;
  };

  if (!book) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md overflow-hidden rounded-lg p-3 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-primary/20 to-primary/5 px-4 md:px-6 py-3 md:py-4 -mx-3 sm:-mx-6 -mt-3 sm:-mt-6 mb-3 md:mb-4">
            <DialogTitle className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">Book Details</DialogTitle>
          </DialogHeader>
          
          <div className={`${isMobile ? 'flex flex-col' : 'flex'} mb-4`}>
            <div className={`${isMobile ? 'mx-auto mb-3' : 'flex-shrink-0 mr-4'}`}>
              {book.coverData || book.coverUrl ? (
                <img
                  src={book.coverData || book.coverUrl}
                  alt={`Cover of ${book.title}`}
                  className={`${isMobile ? 'w-28 h-40' : 'w-24 h-36'} object-cover rounded-sm shadow-sm`}
                />
              ) : (
                <div className={`${isMobile ? 'w-28 h-40' : 'w-24 h-36'} bg-muted flex items-center justify-center rounded-sm shadow-sm`}>
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className={isMobile ? 'text-center' : ''}>
              <h4 className="font-bold text-base md:text-lg">{book.title}</h4>
              <p className="text-sm md:text-base text-muted-foreground">{book.author || "Unknown author"}</p>
              <div className="mt-1 text-sm md:text-base">{renderRating(book.rating)}</div>
              {book.yearRead && (
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Read in {book.yearRead}</p>
              )}
              {book.isbn && (
                <p className="text-xs text-muted-foreground mt-2">ISBN: {book.isbn}</p>
              )}
            </div>
          </div>

          {(book.publisher || book.publishedDate) && (
            <div className="mt-3 md:mt-4 text-xs md:text-sm">
              <h5 className="font-medium text-xs md:text-sm mb-1">Publication Details</h5>
              <div className="flex flex-wrap gap-x-3 md:gap-x-4 text-muted-foreground">
                {book.publisher && <p>Publisher: {book.publisher}</p>}
                {book.publishedDate && <p>Published: {book.publishedDate}</p>}
              </div>
            </div>
          )}

          {book.description && (
            <div className="mt-3 md:mt-4">
              <h5 className="font-medium text-xs md:text-sm mb-1">Book Description</h5>
              <p className="text-xs md:text-sm text-muted-foreground p-2 md:p-3 bg-muted rounded-md max-h-16 md:max-h-24 overflow-y-auto">
                {book.description}
              </p>
            </div>
          )}

          <div className="mt-3 md:mt-4">
            <h5 className="font-medium text-xs md:text-sm mb-1">Your Notes</h5>
            <p className="text-xs md:text-sm text-muted-foreground p-2 md:p-3 bg-muted rounded-md max-h-16 md:max-h-24 overflow-y-auto">
              {book.notes || "No notes added for this book."}
            </p>
          </div>

          <DialogFooter className="mt-4 md:mt-6 gap-2 flex-row justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => book && onEdit(book)}
              className="flex items-center text-xs md:text-sm h-8 md:h-10"
              size="sm"
            >
              <Pencil className="mr-1 h-3 w-3 md:h-4 md:w-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center text-xs md:text-sm h-8 md:h-10"
              size="sm"
            >
              <Trash2 className="mr-1 h-3 w-3 md:h-4 md:w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="p-4 sm:p-6 max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base md:text-lg">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs md:text-sm">
              This will permanently delete "{book.title}" from your collection.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 flex-row sm:flex-row-reverse mt-4">
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs md:text-sm h-8 md:h-10"
            >
              Delete
            </AlertDialogAction>
            <AlertDialogCancel className="text-xs md:text-sm h-8 md:h-10">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
