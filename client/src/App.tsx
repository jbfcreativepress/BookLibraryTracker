import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BooksPage from "@/pages/books";
import { BookOpen, Home as HomeIcon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

function Navigation() {
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Close mobile menu when screen size changes from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <nav className="bg-gradient-to-r from-primary/90 to-primary mb-6 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <span 
              className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80"
              onClick={() => handleNavigate("/")}
              style={{ cursor: 'pointer' }}
            >
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 inline-block mr-2 text-white" />
              <span className="hidden xs:inline">BookTracker</span>
            </span>
          </div>

          {isMobile ? (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant={location === "/" ? "secondary" : "ghost"}
                onClick={() => handleNavigate("/")}
                className="flex items-center text-white hover:text-primary hover:bg-white"
              >
                <HomeIcon className="h-4 w-4 mr-1" />
                Home
              </Button>
              <Button
                variant={location === "/books" ? "secondary" : "ghost"}
                onClick={() => handleNavigate("/books")}
                className="flex items-center text-white hover:text-primary hover:bg-white"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                My Books
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {isMobile && isMenuOpen && (
          <div className="pb-3 px-2 space-y-2 animate-in fade-in slide-in-from-top-5">
            <Button
              variant={location === "/" ? "secondary" : "ghost"}
              onClick={() => handleNavigate("/")}
              className="flex items-center w-full justify-start text-white hover:text-primary hover:bg-white"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button
              variant={location === "/books" ? "secondary" : "ghost"}
              onClick={() => handleNavigate("/books")}
              className="flex items-center w-full justify-start text-white hover:text-primary hover:bg-white"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              My Books
            </Button>
          </div>
        )}
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
