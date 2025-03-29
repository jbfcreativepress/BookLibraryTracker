import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { deleteBook } from "@/lib/bookService";
import { queryClient } from "@/lib/queryClient";
import { Book } from "@/types/books";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Book Details</DialogTitle>
          </DialogHeader>
          <div className="flex mb-4">
            <div className="flex-shrink-0 mr-4">
              {book.coverData || book.coverUrl ? (
                <img
                  src={book.coverData || book.coverUrl}
                  alt={`Cover of ${book.title}`}
                  className="w-24 h-36 object-cover rounded-sm shadow-sm"
                />
              ) : (
                <div className="w-24 h-36 bg-muted flex items-center justify-center rounded-sm shadow-sm">
                  <span className="material-icons text-muted-foreground text-3xl">book</span>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-bold text-lg">{book.title}</h4>
              <p className="text-muted-foreground">{book.author || "Unknown author"}</p>
              <div className="mt-1">{renderRating(book.rating)}</div>
              {book.yearRead && (
                <p className="text-sm text-muted-foreground mt-1">Read in {book.yearRead}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h5 className="font-medium text-sm mb-2">Your Notes</h5>
            <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
              {book.notes || "No notes added for this book."}
            </p>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => book && onEdit(book)}
              className="flex items-center"
            >
              <Pencil className="mr-1 h-4 w-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{book.title}" from your collection.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
