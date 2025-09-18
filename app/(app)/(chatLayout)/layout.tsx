"use client";

import React, { useEffect, useState } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  disableGlobalCursorStyles,
} from "react-resizable-panels";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import ExplainableAI from "@/components/dashboard/explainable-ai/page";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
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
      className="flex flex-row w-full mt-6 h-full"
    >
      <Panel defaultSize={70} minSize={75} className="h-full mr-4">
        {children}
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

      <Panel collapsible minSize={17} defaultSize={20} className="h-full ml-4">
        <ExplainableAI />
      </Panel>
    </PanelGroup>
  );
};

export default ChatLayout;
