"use client";

import React, { useEffect, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useBacktestResults } from "@/context/backtest-results-context";
import { LoadingState } from "@/components/dashboard/backtest/loading-state";
import { ErrorState } from "@/components/dashboard/backtest/error-state";
import HoverTooltipWrapper from "@/components/tooltip";
import { Check } from "lucide-react";

const Strategy = () => {
  const { loading, error } = useBacktestResults();
  const strategyCode = useBacktestResults().results?.strategy_code;
  const monaco = useMonaco();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = async () => {
    if (strategyCode) {
      try {
        await navigator.clipboard.writeText(strategyCode);
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000); // Reset after 2 seconds
      } catch (err) {
        console.error("Failed to copy code:", err);
      }
    }
  };

  monaco?.editor.defineTheme("custom-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#1B1B1D",
      "editor.lineHighlightBackground": "#1B1B1D",
      "editorLineNumber.foreground": "#666666",
      "editorGutter.background": "#202020",
    },
  });

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onClose={() => {}} />;

  return (
    <div className="w-full h-full flex flex-col overflow-auto custom-scrollbar pr-2">
      <h1 className="text-2xl font-light">Strategy</h1>

      <style jsx global>{`
        .monaco-editor .margin-view-overlays .line-numbers {
          width: 100% !important;
          text-align: center;
        }

        .monaco-editor .margin {
          background-color: #202020 !important;
        }

        .monaco-editor .margin .line-numbers {
          color: #404040 !important;
          background-color: #202020 !important;
        }

        .margin-view-overlays {
          border-right: 2px solid #2a2a2c !important;
        }

        /* .margin-view-overlays .line-numbers {
          border-bottom: 2px solid #2a2a2c !important;
        } */

        .monaco-editor .line-numbers {
          font-family: "Luxe Uno", monospace !important;
        }

        .view-lines {
          margin-left: 10px !important;
        }

        @keyframes pulseShadow {
          0% {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          }
          50% {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.8);
          }
          100% {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          }
        }

        .copy-button:hover {
          animation: pulseShadow 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="relative mt-4 border-2 border-[#2A2A2C] h-fit">
        <Editor
          height="60vh"
          defaultLanguage="python"
          value={strategyCode || "// Loading strategy code..."}
          theme={"custom-dark"}
          loading={<div className="p-4 text-white">Loading editor...</div>}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontFamily: "'Luxe Uno', monospace",
            fontSize: 14,
            lineHeight: 22,
            letterSpacing: "1px",
            guides: {
              highlightActiveIndentation: true,
              indentation: false,
            },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            wrappingIndent: "indent",
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              alwaysConsumeMouseWheel: false,
            },
            padding: { top: 10, bottom: 10 },
            contextmenu: false,
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            folding: false,
            glyphMargin: false,
            lightbulb: { enabled: false },
            suggestOnTriggerCharacters: false,
            tabCompletion: "off",
            quickSuggestions: false,
            lineNumbers: "on",
          }}
        />

        <div className="border-t-2 border-[#303030] h-8 w-full bg-[#202020]" />

        <div className="absolute rounded-full bottom-14 right-6 copy-button transition-all">
          <HoverTooltipWrapper
            tooltip={isCopied ? "Copied!" : "Copy to clipboard"}
          >
            <button
              onClick={handleCopyCode}
              className="flex items-center rounded-full size-12 bg-[#202020] border-2 border-[#2A2A2C] shadow-black/40 shadow-lg justify-center hover:animate-shimmer bg-[linear-gradient(110deg,#202020,45%,#d5dbe3,55%,#202020)] bg-[length:300%_100%] transition-all duration-200"
            >
              {isCopied ? (
                <Check className="size-5 text-green-500" />
              ) : (
                <img
                  src="/svgs/copy.svg"
                  alt="Copy strategy code"
                  className="size-5"
                />
              )}
            </button>
          </HoverTooltipWrapper>
        </div>
      </div>
    </div>
  );
};

export default Strategy;
