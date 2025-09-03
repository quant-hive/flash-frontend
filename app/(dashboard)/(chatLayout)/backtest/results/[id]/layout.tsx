"use client";

import React, { use } from "react";
import { BacktestResultsProvider } from "@/context/backtest-results-context";

export default function BacktestResultsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string } | Promise<{ id: string }>;
}) {
  const resolvedParams =
    typeof (params as any)?.then === "function"
      ? (use(params as Promise<{ id: string }>) as { id: string })
      : (params as { id: string });

  return (
    <BacktestResultsProvider backtestId={resolvedParams.id}>
      {children}
    </BacktestResultsProvider>
  );
}
