import React from "react";

export function LoadingState() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading backtest results...
          </p>
        </div>
      </div>
    </div>
  );
}
