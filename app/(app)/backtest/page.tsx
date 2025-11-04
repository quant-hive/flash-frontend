"use client";

import BacktestForm from "@/components/dashboard/backtest/new-form";
import { useDashboardContext } from "@/context/dashboard";
import { BacktestFormProvider } from "@/context/backtest-form-context";
import { BacktestStatus } from "@/types/backtest-service";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

const Backtest = () => {
  const { latestBacktest } = useDashboardContext();
  const [previousBacktest, setPreviousBacktest] =
    useState<BacktestStatus | null>(null);

  useEffect(() => {
    setPreviousBacktest(latestBacktest ?? null);
  }, [latestBacktest]);

  if (previousBacktest && previousBacktest.status === "completed") {
    redirect(`/backtest/results/${previousBacktest.backtest_id}/overview`);
  }

  return (
    <BacktestFormProvider>
      <BacktestForm />
    </BacktestFormProvider>
  );
};

export default Backtest;
