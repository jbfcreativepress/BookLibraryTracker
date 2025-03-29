import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BooksPage from "@/pages/books";
import { BookOpen, Home as HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function Navigation() {
  const [location, navigate] = useLocation();

  return (
    <nav className="bg-background border-b mb-6">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold text-primary">BookTracker</span>
          </div>
          <div className="flex space-x-4">
            <Button
              variant={location === "/" ? "secondary" : "ghost"}
              onClick={() => navigate("/")}
              className="flex items-center"
            >
              <HomeIcon className="h-4 w-4 mr-1" />
              Home
            </Button>
            <Button
              variant={location === "/books" ? "secondary" : "ghost"}
              onClick={() => navigate("/books")}
              className="flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              My Books
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/books" component={BooksPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
