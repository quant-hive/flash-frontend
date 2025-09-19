"use client";

import ActionBar from "@/components/actionbar";
import Breadcrumbs from "@/components/breadcrumbs";
import ExplainableAI from "@/components/dashboard/explainable-ai/page";
import Footer from "@/components/footer";
import { Sidebar } from "@/components/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DashboardContextProvider } from "@/context/dashboard";
import React, { useEffect, useState } from "react";
import {
  disableGlobalCursorStyles,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

const NotFound = () => {
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

  return (
    <DashboardContextProvider>
      <div className="flex flex-col h-screen pt-8 px-4 pb-4 w-full">
        <ActionBar />
        <div className="flex flex-row h-full bg-background border-1 rounded-xl overflow-auto">
          <Sidebar />
          {/* Content area: children fills remaining height, footer at bottom */}
          <main className="flex flex-col flex-1 pl-4 pt-6 pr-4 pb-4">
            {/* Stretch area for page content */}
            <div className="flex-1 min-h-0 flex flex-col h-full">
              <Breadcrumb>
                <BreadcrumbList className="gap-1 sm:gap-1 font-light text-muted-text">
                  <BreadcrumbSeparator>{"/"}</BreadcrumbSeparator>

                  <BreadcrumbItem>
                    <BreadcrumbLink className="text-foreground">
                      404
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <PanelGroup
              autoSaveId={"quanthive-dashboard-panel-group"}
              direction="horizontal"
              className="flex flex-row w-full mt-6 h-full"
            >
              <Panel defaultSize={70} minSize={75} className="h-full mr-4">
                <div className="flex flex-col items-center justify-center h-full select-none">
                  <img src="/images/png/404.png" alt="404 Not Found" />
                  <p className="text-lg text-[#838383]">[ 404 ]</p>
                  <p className="text-lg text-white">
                    [ The page you are looking for cannot be found ]
                  </p>
                </div>
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

              <Panel
                collapsible
                minSize={17}
                defaultSize={20}
                className="h-full ml-4"
              >
                <ExplainableAI />
              </Panel>
            </PanelGroup>

            <Footer />
          </main>
        </div>
      </div>
    </DashboardContextProvider>
  );
};

export default NotFound;
