import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, BookX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-white">
      <Card className="w-full max-w-md mx-4 shadow-lg border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4">
          <BookX className="h-16 w-16 text-primary/60 mx-auto" />
        </div>
        <CardContent className="pt-8 pb-8 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-2">
            404 Page Not Found
          </h1>

          <p className="mt-4 text-muted-foreground mb-6">
            We couldn't find the page you were looking for.
          </p>

          <Button 
            onClick={() => navigate("/")} 
            className="mt-2 bg-primary hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
