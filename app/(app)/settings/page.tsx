"use client";

import { useState, useEffect } from "react";
import {
  disableGlobalCursorStyles,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import Notifications from "@/components/settings/notifications-panel";
import Settings from "@/components/settings";

export default function SettingsPage() {
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
      }
    };

    // Add global listener
    document.addEventListener("pointerup", handleGlobalPointerUp);

    return () => {
      document.removeEventListener("pointerup", handleGlobalPointerUp);
    };
  }, [resizableHandlePointerDown]);

  return (
    <PanelGroup
      autoSaveId={"quanthive-settings-panel-group"}
      direction="horizontal"
      className="flex flex-row w-full mt-6 h-full"
    >
      <Panel defaultSize={70} minSize={75} className="h-full mr-4">
        <Settings />
      </Panel>

      <div className="flex flex-col items-center justify-center">
        <PanelResizeHandle
          onPointerDown={() => {
            setResizableHandlePointerDown(true);
          }}
          onPointerUp={() => {
            setResizableHandlePointerDown(false);
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
        <Notifications />
      </Panel>
    </PanelGroup>
  );
}
