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
import LeftPanel from "@/components/dashboard/left-panel";
import RightPanel from "@/components/dashboard/right-panel/page";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [resizableHandlePointerUp, setResizableHandlePointerUp] =
    useState(false);
  const [resizableHandlePointerDown, setResizableHandlePointerDown] =
    useState(false);

  useEffect(() => {
    // Disable global cursor styles for resizable panels
    disableGlobalCursorStyles();
  }, []);

  useEffect(() => {
    // Global pointer up listener to handle drag end when pointer is released outside the handle
    const handleGlobalPointerUp = () => {
      if (resizableHandlePointerDown) {
        setResizableHandlePointerDown(false);
        setResizableHandlePointerUp(true);
      }
    };

    // Add global listener
    document.addEventListener("pointerup", handleGlobalPointerUp);

    return () => {
      document.removeEventListener("pointerup", handleGlobalPointerUp);
    };
  }, [resizableHandlePointerDown]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <PanelGroup
      autoSaveId={"quanthive-dashboard-panel-group"}
      direction="horizontal"
      className="flex flex-row w-full gap-6 mt-6 h-full"
    >
      <Panel defaultSize={70} minSize={75} className="h-full">
        <LeftPanel />
      </Panel>

      <div className="flex flex-col items-center justify-center">
        <PanelResizeHandle
          onPointerDown={() => {
            setResizableHandlePointerDown(true);
            setResizableHandlePointerUp(false);
          }}
          onPointerUp={() => {
            setResizableHandlePointerDown(false);
            setResizableHandlePointerUp(true);
          }}
          id="resize-handle"
          className={`flex flex-col gap-1 px-1.5 py-2 rounded-full bg-card text-[#5E5E5E] border-2 border-[#5E5E5E] ${
            resizableHandlePointerDown
              ? "bg-card-foreground outline outline-2 outline-offset-2 outline-blue-400"
              : "hover:bg-card-foreground hover:outline outline-2 outline-offset-2 outline-blue-400"
          }`}
        >
          <div className="w-1 h-1 rounded-full bg-[#5E5E5E]" />
          <div className="w-1 h-1 rounded-full bg-[#5E5E5E]" />
          <div className="w-1 h-1 rounded-full bg-[#5E5E5E]" />
        </PanelResizeHandle>
      </div>

      <Panel collapsible minSize={17} defaultSize={20} className="h-full">
        <RightPanel />
      </Panel>

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
    </PanelGroup>
  );
}
