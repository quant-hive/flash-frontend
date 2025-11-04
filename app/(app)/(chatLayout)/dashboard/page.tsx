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
import ResultMetricCard from "@/components/result-metric-card";

export default function DashboardPage() {
  return (
    <>
      <BacktestForm />
      {/*
      <div className="flex flex-col w-full h-full">
         <div className="flex flex-col">
          <h1 className="text-2xl font-light">Glance</h1>
          <div className="flex flex-row gap-4 mt-3">
            <ResultMetricCard
              title="Overall Risk Profile"
              value="Moderate"
              suffix=""
              iconSrc={"/svgs/total-risk-profile.svg"}
              iconAlt={"Risk Profile Icon"}
              shadow={"yellow"}
            />
            <ResultMetricCard
              title="Potential Opportunity"
              value="5/12"
              suffix=""
              iconSrc={"/svgs/potential-opportunity.svg"}
              iconAlt={"Potential Opportunity Icon"}
              shadow={"green"}
            />
            <ResultMetricCard
              title="Asset Under Management ($)"
              value="62 Million"
              suffix=""
              iconSrc={"/svgs/asset-under-management.svg"}
              iconAlt={"Asset Under Management Icon"}
              shadow={"black"}
            />
          </div>
        </div>
 
       
      </div>

      <div>
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
