import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BooksPage from "@/pages/books";
import { BookOpen, Home as HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-background border-b mb-6">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold text-primary">BookTracker</span>
          </div>
          <div className="flex space-x-4">
            <Link href="/">
              {props => (
                <a 
                  href={props.href} 
                  onClick={props.onClick}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground",
                    location === "/" && "bg-accent text-accent-foreground"
                  )}
                >
                  <HomeIcon className="h-4 w-4 mr-1" />
                  Home
                </a>
              )}
            </Link>
            <Link href="/books">
              {props => (
                <a 
                  href={props.href} 
                  onClick={props.onClick}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground",
                    location === "/books" && "bg-accent text-accent-foreground"
                  )}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  My Books
                </a>
              )}
            </Link>
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
