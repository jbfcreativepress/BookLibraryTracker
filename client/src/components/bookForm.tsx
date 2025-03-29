import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { createBook } from "@/lib/bookService";
import { queryClient } from "@/lib/queryClient";
import { ImageUpload } from "@/components/imageUpload";
import { BookFormValues, OcrResult, ExternalBook } from "@/types/books";
import { processBookCoverImage } from "@/lib/bookService";
import { ExternalBookSearch } from "@/components/externalBookSearch";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, Search, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  author: z.string().optional(),
  yearRead: z
    .number()
    .min(1900, { message: "Year must be 1900 or later" })
    .max(new Date().getFullYear(), { message: "Year cannot be in the future" })
    .optional()
    .nullable()
    .transform((val) => val === null ? undefined : val),
  rating: z
    .number()
    .min(1, { message: "Rating must be between 1 and 5" })
    .max(5, { message: "Rating must be between 1 and 5" })
    .optional()
    .nullable()
    .transform((val) => val === null ? undefined : val),
  notes: z.string().optional(),
  coverUrl: z.string().optional(),
  coverData: z.string().optional(),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  description: z.string().optional(),
});

interface TextFormProps {
  onSuccess: () => void;
}

export function TextBookForm({ onSuccess }: TextFormProps) {
  const { toast } = useToast();
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      yearRead: undefined,
      rating: undefined,
      notes: "",
      isbn: "",
      publisher: "",
      publishedDate: "",
      description: "",
    },
  });

  const addBookMutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      form.reset();
      toast({
        title: "Success!",
        description: "Book successfully added to your collection!",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add book: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleExternalBookSelect = (book: ExternalBook) => {
    // Fill the form with the selected book's data
    form.setValue("title", book.title);
    form.setValue("author", book.author);
    form.setValue("isbn", book.isbn || "");
    form.setValue("publisher", book.publisher || "");
    form.setValue("publishedDate", book.publishedDate || "");
    form.setValue("description", book.description || "");
    form.setValue("coverUrl", book.coverUrl || "");
    
    // Close the search dialog
    setIsSearchDialogOpen(false);
    
    toast({
      title: "Book selected",
      description: "Book information has been added to the form.",
    });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addBookMutation.mutate(values as BookFormValues);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold">
            <span className="material-icons mr-2 text-primary">title</span>
            Add by Title
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex justify-end mb-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsSearchDialogOpen(true)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Look up a book
                </Button>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter book title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter author name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISBN</FormLabel>
                      <FormControl>
                        <Input placeholder="ISBN number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearRead"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Read</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="YYYY"
                          min={1900}
                          max={new Date().getFullYear()}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? parseInt(value) : null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "0" ? null : parseInt(value))}
                        value={field.value?.toString() || "0"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No rating</SelectItem>
                          <SelectItem value="5">★★★★★ (5)</SelectItem>
                          <SelectItem value="4">★★★★☆ (4)</SelectItem>
                          <SelectItem value="3">★★★☆☆ (3)</SelectItem>
                          <SelectItem value="2">★★☆☆☆ (2)</SelectItem>
                          <SelectItem value="1">★☆☆☆☆ (1)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publisher</FormLabel>
                      <FormControl>
                        <Input placeholder="Publisher name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publishedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publication Date</FormLabel>
                      <FormControl>
                        <Input placeholder="Publication date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Book description"
                        className="h-20 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your notes about the book"
                        className="h-20 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
  
              {form.watch("coverUrl") && (
                <div className="flex justify-center my-4">
                  <div className="border rounded p-2 w-32">
                    <img
                      src={form.watch("coverUrl")}
                      alt="Book cover"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={addBookMutation.isPending}
              >
                {addBookMutation.isPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add to My Books"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Book Search Dialog */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Search for a Book
            </DialogTitle>
          </DialogHeader>
          <ExternalBookSearch 
            onBookSelect={handleExternalBookSelect} 
            onCancel={() => setIsSearchDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ImageBookForm({ onSuccess }: TextFormProps) {
  const { toast } = useToast();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      yearRead: undefined,
      rating: undefined,
      notes: "",
      coverData: "",
      isbn: "",
      publisher: "",
      publishedDate: "",
      description: "",
    },
  });

  useEffect(() => {
    if (ocrResult) {
      form.setValue("title", ocrResult.bookInfo.title);
      form.setValue("author", ocrResult.bookInfo.author);
      form.setValue("coverData", ocrResult.coverData);
    }
  }, [ocrResult, form]);

  const addBookMutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      form.reset();
      setCoverImage(null);
      setCoverPreview(undefined);
      setOcrResult(null);
      toast({
        title: "Success!",
        description: "Book successfully added to your collection!",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add book: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleExternalBookSelect = (book: ExternalBook) => {
    // Fill the form with the selected book's data
    form.setValue("title", book.title);
    form.setValue("author", book.author);
    form.setValue("isbn", book.isbn || "");
    form.setValue("publisher", book.publisher || "");
    form.setValue("publishedDate", book.publishedDate || "");
    form.setValue("description", book.description || "");
    form.setValue("coverUrl", book.coverUrl || "");
    
    // Close the search dialog
    setIsSearchDialogOpen(false);
    
    toast({
      title: "Book selected",
      description: "Book information has been added to the form.",
    });
  };

  const handleImageSelect = async (file: File) => {
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
    setIsProcessing(true);

    try {
      const result = await processBookCoverImage(file);
      setOcrResult(result);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to process image: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageRemove = () => {
    setCoverImage(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(undefined);
    }
    setOcrResult(null);
    form.setValue("title", "");
    form.setValue("author", "");
    form.setValue("coverData", "");
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Make sure to use coverData from the uploaded image if available
    const formValues = { ...values };
    if (coverImage && coverPreview) {
      formValues.coverData = form.getValues("coverData");
    }
    addBookMutation.mutate(formValues as BookFormValues);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold">
            <span className="material-icons mr-2 text-primary">image</span>
            Add by Cover Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Upload a photo of your book cover
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsSearchDialogOpen(true)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Look up a book
                </Button>
              </div>
            
              <ImageUpload
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
                previewUrl={coverPreview}
                disabled={isProcessing || addBookMutation.isPending}
                isLoading={isProcessing}
              />

              {isProcessing && (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader className="h-8 w-8 animate-spin" />
                  <p className="text-sm text-muted-foreground mt-2">Analyzing book cover...</p>
                </div>
              )}

              {ocrResult && (
                <div className="bg-muted p-4 rounded-md border border-border">
                  <h3 className="font-medium mb-2">Detected Information:</h3>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Title:</span> {ocrResult.bookInfo.title}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Author:</span> {ocrResult.bookInfo.author}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setIsSearchDialogOpen(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Verify with Google Books
                  </Button>
                </div>
              )}

              {coverImage && !isProcessing && !ocrResult && (
                <div className="space-y-4">
                  <div className="text-center py-2 px-4 bg-warning/10 text-warning rounded-md">
                    <p className="text-sm">
                      Couldn't automatically detect book information. Please fill in manually or search online.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setIsSearchDialogOpen(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Look up book online
                  </Button>
                </div>
              )}

              {(!!coverImage || form.watch("coverUrl")) && (
                <div className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Book Title*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter book title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter author name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isbn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ISBN</FormLabel>
                          <FormControl>
                            <Input placeholder="ISBN number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yearRead"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Read</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="YYYY"
                              min={1900}
                              max={new Date().getFullYear()}
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? parseInt(value) : null);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Your notes about the book"
                            className="h-20 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {form.watch("coverUrl") && !coverPreview && (
                <div className="flex justify-center my-4">
                  <div className="border rounded p-2 w-32">
                    <img
                      src={form.watch("coverUrl")}
                      alt="Book cover"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                variant="secondary"
                disabled={((!coverImage && !form.watch("coverUrl")) || isProcessing || addBookMutation.isPending)}
              >
                {addBookMutation.isPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-1 text-sm">photo_library</span>
                    Add to My Books
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Book Search Dialog */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Search for a Book
            </DialogTitle>
          </DialogHeader>
          <ExternalBookSearch 
            onBookSelect={handleExternalBookSelect} 
            onCancel={() => setIsSearchDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
