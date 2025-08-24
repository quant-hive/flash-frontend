"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  disableGlobalCursorStyles,
} from "react-resizable-panels";
import RightPanel from "@/components/dashboard/explainable-ai/page";
import { Card, CardContent } from "@/components/ui/card";
import BacktestForm from "@/components/dashboard/backtest/new-form";

export default function DashboardPage() {
  return (
    <>
      <div className="flex flex-col h-full overflow-auto custom-scrollbar pr-2">
        <div className="flex flex-col">
          <h1 className="text-2xl font-light">Glance</h1>
          <div className="flex flex-row gap-4 mt-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="bg-card border-2 border-card-border w-full h-32"
              >
                <CardContent className="flex items-center justify-center h-full"></CardContent>
              </Card>
            ))}
          </div>
        </div>

        <BacktestForm />
      </div>

      {/* <div>
        <h1 className="text-3xl font-bold mb-1">Flash</h1>
        <p className="text-muted-foreground">
          Test your investment ideas in minutes
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!backtestResults ? (
        <BacktestForm onBacktestSubmitted={handleBacktestSubmitted} />
      ) : (
        <BacktestResultsView
          backtestId={backtestId!}
          onClose={handleCloseResults}
          backtestResults={backtestResults}
        />
      )} */}
    </>
  );
}
