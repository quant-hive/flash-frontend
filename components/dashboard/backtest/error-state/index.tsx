import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onClose: () => void;
}

export function ErrorState({ error, onClose }: ErrorStateProps) {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      <Button onClick={onClose}>Return to History</Button>
    </div>
  );
}
