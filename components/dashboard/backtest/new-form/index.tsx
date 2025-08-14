"use client";

import React, { useEffect, useRef, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MultiSelect } from "@/components/new-multi-select";
import { BacktestResults } from "@/types/backtest-service";
import { format, parse } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";
import { backtestService, databaseService } from "@/lib/backtest-service";
import { AxiosError } from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import CustomPopoverContent from "@/components/custom-popover-content";
import { Mic, PlusIcon } from "lucide-react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import ReactMarkdown from "react-markdown";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TextareaAutosize from "react-textarea-autosize";
import HoverTooltipWrapper from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const BacktestForm = () => {
  const backtestSchema = z
    .object({
      prompt: z.string().min(10, {
        message: "Prompt must be at least 10 characters.",
      }),
      name: z.string().min(1, {
        message: "Name must be at least 1 character.",
      }),
      tickers: z.array(z.string()).min(1, {
        message: "Please select at least one instrument.",
      }),
      initial_cash: z.coerce.number().min(1000, {
        message: "Initial cash must be at least 1000.",
      }),
      start_date: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, {
        message: "Please enter date in dd-MM-yyyy format.",
      }),
      end_date: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, {
        message: "Please enter date in dd-MM-yyyy format.",
      }),
      commission: z.coerce.number().min(0).max(100, {
        message: "Commission must be between 0 and 100.",
      }),
    })
    .refine(
      (data) => {
        try {
          const startDate = parse(data.start_date, "dd-MM-yyyy", new Date());
          const endDate = parse(data.end_date, "dd-MM-yyyy", new Date());
          return startDate < endDate;
        } catch {
          return false;
        }
      },
      {
        message: "End date must be after start date.",
        path: ["end_date"],
      }
    );

  type BacktestFormValues = z.infer<typeof backtestSchema>;

  interface Chat {
    type: "prompt" | "response";
    content?: string;
    backtest?: BacktestResults;
  }

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [chat, setChat] = useState<Chat[]>([]);
  const [backtestId, setBacktestId] = useState<string | null>(null);
  const [backtestResults, setBacktestResults] =
    useState<BacktestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [availableInstruments, setAvailableInstruments] = useState<string[]>(
    []
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const leftAnchorRef = useRef<HTMLDivElement | null>(null);
  const rightAnchorRef = useRef<HTMLDivElement | null>(null);

  // Helper functions for date formatting
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return format(date, "dd-MM-yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDateForSave = (dateString: string): string => {
    if (!dateString) return "";
    try {
      // Parse dd-MM-yyyy format and convert to yyyy-MM-dd
      const date = parse(dateString, "dd-MM-yyyy", new Date());
      return format(date, "yyyy-MM-dd");
    } catch {
      return dateString;
    }
  };

  const parseDateInput = (value: string): string => {
    if (!value) return "";
    // Remove any non-digit characters except hyphens
    const cleaned = value.replace(/[^\d-]/g, "");
    // Ensure dd-MM-yyyy format
    const parts = cleaned.split("-");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day.length <= 2 && month.length <= 2 && year.length <= 4) {
        return cleaned;
      }
    }
    return cleaned;
  };

  const form = useForm<BacktestFormValues>({
    resolver: zodResolver(backtestSchema),
    defaultValues: {
      name: "",
      prompt: "",
      tickers: [],
      initial_cash: 10000,
      start_date: "",
      end_date: "",
      commission: 0.1,
    },
  });

  const handleBacktestSubmitted = async (id: string) => {
    let hasAppendedResult = false;
    let pollInterval = 3000;

    const pollBacktest = setInterval(async () => {
      try {
        const status = await backtestService.getBacktestStatus(id);

        if (status.status === "completed") {
          clearInterval(pollBacktest);

          if (!hasAppendedResult) {
            hasAppendedResult = true;
            const results = await backtestService.getBacktestResults(id);
            setBacktestResults(results);
            setChat((prevChat) => [
              ...prevChat,
              { type: "response", backtest: results },
            ]);
            setIsLoading(false);
          }
        } else if (status.status === "failed") {
          clearInterval(pollBacktest);

          if (!hasAppendedResult) {
            hasAppendedResult = true;
            const errorMessage = `Backtest failed: ${status.message}`;
            setError(errorMessage);
            setChat((prevChat) => [
              ...prevChat,
              { type: "response", content: `❌ Error: ${errorMessage}` },
            ]);
            setIsLoading(false);
          }
        }
      } catch (err: any) {
        console.log("Polling error (continuing):", err.message);
      }
    }, pollInterval);

    // cleanup
    return () => clearInterval(pollBacktest);
  };

  const onSubmit = async (data: BacktestFormValues) => {
    setChat([...chat, { type: "prompt", content: data.prompt }]);
    setIsLoading(true);
    setError(null);

    try {
      // Convert dates from dd-MM-yyyy to yyyy-MM-dd for saving
      const formattedData = {
        ...data,
        start_date: formatDateForSave(data.start_date),
        end_date: formatDateForSave(data.end_date),
      };
      console.log("Form submitted:", formattedData);

      // Validate date range
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 60) {
        const errorMessage =
          "Backtest period should be at least 60 days for meaningful results";
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Validate initial cash
      if (data.initial_cash < 10000) {
        const errorMessage =
          "Initial cash should be at least Rs. 10,000 for meaningful results";
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      const response = await backtestService.runBacktest(formattedData);
      setBacktestId(response.backtest_id);

      // Clear the prompt field after submission
      form.setValue("prompt", "");

      handleBacktestSubmitted(response.backtest_id);
    } catch (err: AxiosError | any) {
      console.error("Backtest submission error:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to submit backtest. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Load available instruments and database info
  useEffect(() => {
    const loadData = async () => {
      try {
        const [instruments, dbInfo] = await Promise.all([
          databaseService.getAvailableInstruments(),
          databaseService.getDatabaseInfo(),
        ]);

        setAvailableInstruments(instruments);
        setDbInfo({
          start_date: dbInfo.start_date,
          end_date: dbInfo.end_date,
        });

        // Set default dates if available
        if (dbInfo.start_date && dbInfo.end_date) {
          form.setValue("start_date", formatDateForDisplay(dbInfo.start_date));
          form.setValue("end_date", formatDateForDisplay(dbInfo.end_date));
        }
      } catch (err: any) {
        console.error("Error loading form data:", err);
      }
    };

    loadData();
  }, [form]);

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chat, isLoading]);

  return (
    <FormProvider {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative flex flex-row mt-6 h-full w-full gap-x-24"
      >
        <div
          ref={leftAnchorRef}
          className="relative flex flex-col w-[60%] h-full after:absolute after:-right-2 after:top-[53%] after:translate-y-1/2 after:z-30 after:h-4 after:w-4 after:rounded-full after:border-4 after:border-border after:bg-[#181818]"
        >
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-2xl font-light">Playground</h1>
            <div className="flex flex-row items-center gap-2 h-full">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center justify-center px-3 py-1.5 h-full bg-button hover:bg-button/35 rounded-lg">
                    <PlusIcon className="w-4 h-4" />
                  </div>
                </PopoverTrigger>
                <CustomPopoverContent
                  align="end"
                  sideOffset={12}
                  className="text-foreground"
                >
                  <div className="flex flex-col">Playground settings</div>
                </CustomPopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center justify-center px-2.5 py-1.5 bg-button hover:bg-button/35 rounded-lg">
                    <DotsHorizontalIcon className="w-5 h-5" />
                  </div>
                </PopoverTrigger>
                <CustomPopoverContent
                  align="end"
                  sideOffset={12}
                  className="text-foreground"
                >
                  <div className="flex flex-col gap-2">
                    <div>Playground settings</div>
                    <button
                      onClick={() => {
                        // Demo data for testing the chat system
                        const demoBacktest: BacktestResults = {
                          backtest_id: "f60d6e68-2ca5-44db-b03c-ab87094ec6e5",
                          name: "SMA Crossover Strategy",
                          metrics: {
                            total_return: 0.15,
                            annual_return: 0.08,
                            volatility: 0.25,
                            sharpe: 1.2,
                            sortino: 1.5,
                            max_drawdown: -0.12,
                            win_rate: 0.65,
                            trades: 45,
                            initial_value: 100000.0,
                            final_value: 115000.0,
                            alpha: 0.05,
                            beta: 0.95,
                          },
                          insights:
                            "The backtest code attempts to perform a simple moving average (SMA) crossover strategy on three Indian stocks (ADANIGREEN, ADANIPORTS, ADANIPOWER) using data from a SQLite database. However, the provided results indicate a critical failure: the backtest did not produce any meaningful data due to insufficient data to initialize the SMA indicator and execute the strategy. The error stems from insufficient data to initialize the SMA indicator and execute the strategy properly.",
                          improvements:
                            "The backtest's failure can be improved with better risk management, more robust data validation, and using a longer backtest period. Consider implementing stop-loss orders, position sizing based on volatility, and ensuring sufficient historical data is available before running the strategy.",
                          strategy_code: `class InstantMoneyStrategy(bt.Strategy):
    params = (
        ('maperiod', 15),
    )

    def __init__(self):
        self.sma = bt.indicators.SimpleMovingAverage(self.datas[0], period=self.params.maperiod)

    def next(self):
        if not self.position:
            if self.sma[0] > self.sma[-1]:
                self.buy()
        else:
            if self.sma[0] < self.sma[-1]:
                self.close()`,
                          start_date: "",
                          end_date: "",
                        };
                        setChat([
                          {
                            type: "prompt",
                            content:
                              "Create a simple moving average crossover strategy for ADANI stocks with 15-day period",
                          },
                          { type: "response", backtest: demoBacktest },
                        ]);
                      }}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Demo Chat
                    </button>
                    <button
                      onClick={() => setChat([])}
                      className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Clear Chat
                    </button>
                  </div>
                </CustomPopoverContent>
              </Popover>
            </div>
          </div>

          <div className="px-4 py-4 relative flex flex-col gap-2 items-center justify-center mt-4 bg-card border-2 border-card-border rounded-2xl h-[600px]">
            {/* Chat Messages Container */}
            <div className="flex-1 w-full overflow-hidden relative">
              {chat.length === 0 ? (
                // Empty state when no chats
                <div className="relative flex items-center justify-center h-full w-full overflow-hidden select-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="relative w-full h-full px-8 py-6 flex flex-col items-center justify-center">
                      <h2 className="text-2xl text-center bg-clip-text text-transparent bg-new_chat_text_accent_gradient bg-white">
                        Run A New Backtest
                      </h2>
                      <p className="text-sm text-nowrap font-semibold tracking-wider text-[#616161]">
                        Describe your strategy in plain language
                      </p>

                      <Plus className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
                      <Plus className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2" />
                      <Plus className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
                      <Plus className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
                    </div>
                  </div>

                  <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#282828_2px,transparent_2px)] [background-size:24px_24px]" />
                </div>
              ) : (
                // Chat messages with scrollbar
                <div
                  ref={chatContainerRef}
                  className="h-full overflow-y-auto pr-2 pt-4 custom-scrollbar"
                >
                  <div className="flex flex-col gap-4">
                    {chat.map((message, index) => (
                      <div key={index} className="flex flex-col gap-3">
                        {message.type === "prompt" && (
                          <div className="flex justify-end">
                            <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3">
                              <p className="text-sm whitespace-pre-wrap">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        )}

                        {message.type === "response" &&
                          message.content &&
                          !message.backtest && (
                            <div className="flex justify-start">
                              <div className="max-w-[80%] bg-red-900/20 border border-red-800 text-red-300 rounded-2xl rounded-bl-sm px-4 py-3">
                                <p className="text-sm whitespace-pre-wrap">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                          )}

                        {message.type === "response" && message.backtest && (
                          <div className="flex justify-start">
                            <div className="max-w-[90%] bg-[#232323] border border-[#333] rounded-2xl rounded-bl-sm p-4">
                              <div className="flex flex-col gap-4">
                                {/* Backtest Header */}
                                <div className="flex items-center justify-between border-b border-[#333] pb-3">
                                  <div>
                                    <h3 className="text-lg font-semibold text-white">
                                      {message.backtest.name}
                                    </h3>
                                    <p className="text-xs text-[#888] font-mono">
                                      {message.backtest.backtest_id}
                                    </p>
                                  </div>
                                  <div
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      message.backtest.metrics.total_return > 0
                                        ? "bg-green-900/30 text-green-400 border border-green-800"
                                        : "bg-red-900/30 text-red-400 border border-red-800"
                                    }`}
                                  >
                                    {message.backtest.metrics.total_return > 0
                                      ? "Profitable"
                                      : "Loss"}
                                  </div>
                                </div>

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                                    <p className="text-xs text-[#888] mb-1">
                                      Total Return
                                    </p>
                                    <p
                                      className={`text-lg font-bold ${
                                        message.backtest.metrics.total_return >
                                        0
                                          ? "text-green-400"
                                          : "text-red-400"
                                      }`}
                                    >
                                      {(
                                        message.backtest.metrics.total_return *
                                        100
                                      ).toFixed(2)}
                                      %
                                    </p>
                                  </div>
                                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                                    <p className="text-xs text-[#888] mb-1">
                                      Sharpe Ratio
                                    </p>
                                    <p className="text-lg font-bold text-white">
                                      {message.backtest.metrics.sharpe.toFixed(
                                        2
                                      )}
                                    </p>
                                  </div>
                                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                                    <p className="text-xs text-[#888] mb-1">
                                      Max Drawdown
                                    </p>
                                    <p className="text-lg font-bold text-red-400">
                                      {(
                                        message.backtest.metrics.max_drawdown *
                                        100
                                      ).toFixed(2)}
                                      %
                                    </p>
                                  </div>
                                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                                    <p className="text-xs text-[#888] mb-1">
                                      Win Rate
                                    </p>
                                    <p className="text-lg font-bold text-blue-400">
                                      {(
                                        message.backtest.metrics.win_rate * 100
                                      ).toFixed(1)}
                                      %
                                    </p>
                                  </div>
                                </div>

                                {/* Portfolio Value */}
                                <div className="bg-[#1a1a1a] rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs text-[#888]">
                                      Portfolio Value
                                    </p>
                                    <p className="text-xs text-[#888]">
                                      {message.backtest.metrics.trades} trades
                                    </p>
                                  </div>
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="text-xs text-[#888]">
                                        Initial
                                      </p>
                                      <p className="text-sm font-semibold text-white">
                                        ₹
                                        {message.backtest.metrics.initial_value.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-[#888]">
                                        Final
                                      </p>
                                      <p
                                        className={`text-sm font-semibold ${
                                          message.backtest.metrics.final_value >
                                          message.backtest.metrics.initial_value
                                            ? "text-green-400"
                                            : "text-red-400"
                                        }`}
                                      >
                                        ₹
                                        {message.backtest.metrics.final_value.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Strategy Code Preview */}
                                {message.backtest.strategy_code && (
                                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                                    <p className="text-xs text-[#888] mb-2">
                                      Strategy Code
                                    </p>
                                    <pre className="text-xs text-[#ccc] font-mono overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                                      {message.backtest.strategy_code}
                                    </pre>
                                  </div>
                                )}

                                {/* Insights Section */}
                                {message.backtest.insights && (
                                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                                    <p className="text-xs text-[#888] mb-2">
                                      Insights
                                    </p>
                                    <div className="text-sm text-[#ccc] overflow-y-auto custom-scrollbar leading-relaxed">
                                      <ReactMarkdown>
                                        {message.backtest.insights}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                )}

                                {/* Improvements Section */}
                                {message.backtest.improvements && (
                                  <div className="bg-[#1a1a1a] rounded-lg p-3">
                                    <p className="text-xs text-[#888] mb-2">
                                      Suggested Improvements
                                    </p>
                                    <div className="text-sm text-[#ccc] overflow-y-auto custom-scrollbar leading-relaxed">
                                      <ReactMarkdown>
                                        {message.backtest.improvements}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                {/* <div className="flex gap-2 pt-2">
                                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors">
                                      View Details
                                    </button>
                                    <button className="flex-1 bg-[#333] hover:bg-[#444] text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors">
                                      Export Results
                                    </button>
                                  </div> */}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[#232323] border border-[#333] rounded-2xl rounded-bl-sm p-4">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <p className="text-sm text-[#888]">
                              Running backtest...
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="flex justify-start">
                        <div className="bg-[#232323] border border-[#333] rounded-2xl rounded-bl-sm p-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-[#888]">❌ {error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area - Always at bottom */}
            <div className="relative w-full mt-4">
              <div
                onClick={() => {
                  textAreaRef.current?.focus();
                }}
                className="relative bg-[#232323] rounded-md flex flex-col gap-4 px-4 py-2"
              >
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TextareaAutosize
                          id="playground-chat"
                          className="w-full bg-transparent border-none outline-none resize-none placeholder:text-input text-sm placeholder:select-none text-primary"
                          maxRows={8}
                          placeholder="Describe your trading strategy in plain language..."
                          {...field}
                          ref={textAreaRef}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              if (
                                form.getValues().prompt.length > 0 &&
                                !isLoading
                              ) {
                                form.handleSubmit(onSubmit)();
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription className="sr-only">
                        Describe your strategy in plain language
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex flex-row items-center justify-end gap-2 h-8">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    type="button"
                    className="bg-button hover:bg-button/50 text-button-foreground h-full px-2 rounded-md"
                  >
                    <AddFilesPlus />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    type="button"
                    className="bg-button hover:bg-button/50 text-button-foreground h-full px-2 rounded-md"
                  >
                    <Mic size={"16"} />
                  </button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    disabled={form.getValues().prompt.length < 1 || isLoading}
                    type="submit"
                    className="h-full bg-blue_accent_gradient_90deg text-black px-5 py-1 font-semibold tracking-wider rounded-md select-none"
                  >
                    {isLoading ? "Running..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CosineConnector
          containerRef={formRef}
          startRef={leftAnchorRef}
          endRef={rightAnchorRef}
          startPct={0.53}
          endPct={0.45}
        />

        <div
          ref={rightAnchorRef}
          className="relative flex flex-col flex-1 h-fit before:absolute before:-left-2 before:top-[45%] before:translate-y-1/2 before:z-30 before:h-4 before:w-4 before:rounded-full before:border-4 before:border-border before:bg-[#181818]"
        >
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-2xl font-light">Params</h1>
            <div className="flex flex-row items-center gap-2 h-full">
              <Popover>
                <PopoverTrigger>
                  <HoverTooltipWrapper tooltip="view saved params">
                    <div className="flex items-center justify-center px-2.5 py-1.5 bg-button hover:bg-button/35 rounded-lg">
                      <DotsHorizontalIcon className="w-5 h-5" />
                    </div>
                  </HoverTooltipWrapper>
                </PopoverTrigger>
                <CustomPopoverContent
                  align="end"
                  sideOffset={12}
                  className="text-foreground"
                >
                  <div className="flex flex-col">Saved Params</div>
                </CustomPopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col items-center mt-4 bg-card border-2 border-card-border rounded-2xl h-full p-6 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full space-y-0">
                  <FormLabel
                    htmlFor="param-name"
                    className="bg-clip-text text-transparent bg-text_accent_gradient pb-2"
                  >
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="param-name"
                      type="text"
                      {...field}
                      placeholder="Give your backtest a name"
                      className="bg-input-background hover:bg-primary/10 rounded-lg pl-4 placeholder:text-input border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormDescription className="sr-only">
                    This name will be used to identify your backtest.
                  </FormDescription>
                  <FormMessage className="text-xs pt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tickers"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full space-y-0">
                  <FormLabel
                    htmlFor="param-instruments"
                    className="bg-clip-text text-transparent bg-text_accent_gradient pb-2"
                  >
                    Instruments
                  </FormLabel>
                  <FormControl>
                    <MultiSelect
                      id="param-instruments"
                      name="instruments"
                      autoSize={false}
                      hideSelectAll
                      responsive
                      value={field.value}
                      onValueChange={(values) => {
                        field.onChange(values);
                      }}
                      options={availableInstruments.map((inst) => ({
                        label: inst,
                        value: inst,
                      }))}
                      maxCount={2}
                      emptyIndicator="No instruments found."
                      placeholder="Select instruments to include"
                      popoverClassName="bg-popover border rounded-md shadow-md overflow-auto"
                      className="bg-input-background rounded-lg pl-4 border-none hover:bg-primary/10"
                    />
                  </FormControl>
                  <FormDescription className="sr-only">
                    Select the instruments you want to include
                  </FormDescription>
                  <FormMessage className="text-xs pt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initial_cash"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full space-y-0">
                  <FormLabel
                    htmlFor="param-initial-cash"
                    className="bg-clip-text text-transparent bg-text_accent_gradient pb-2"
                  >
                    Initial Cash
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="param-initial-cash"
                      type="number"
                      placeholder="Starting capital for the backtest in Rs."
                      className="bg-input-background hover:bg-primary/10 rounded-lg pl-4 placeholder:text-input border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormDescription className="sr-only">
                    This is the starting capital for your backtest in Rs.
                  </FormDescription>
                  <FormMessage className="text-xs pt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commission"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full space-y-0">
                  <FormLabel
                    htmlFor="param-commission"
                    className="bg-clip-text text-transparent bg-text_accent_gradient pb-2"
                  >
                    Commission (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="param-commission"
                      type="number"
                      step="0.1"
                      placeholder="Trading commission percentage"
                      className="bg-input-background hover:bg-primary/10 rounded-lg pl-4 placeholder:text-input border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormDescription className="sr-only">
                    This is the commission percentage charged on each trade.
                  </FormDescription>
                  <FormMessage className="text-xs pt-1" />
                </FormItem>
              )}
            />

            <div className="flex flex-row gap-4 w-full">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormLabel
                      htmlFor="param-start-date"
                      className="bg-clip-text text-transparent bg-text_accent_gradient pb-2"
                    >
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="param-start-date"
                        type="date"
                        className="bg-input-background hover:bg-primary/10 rounded-lg pl-4 placeholder:text-input border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={
                          field.value ? formatDateForSave(field.value) : ""
                        }
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          if (dateValue) {
                            // Convert yyyy-MM-dd to dd-MM-yyyy for form state
                            const formattedDate =
                              formatDateForDisplay(dateValue);
                            field.onChange(formattedDate);
                          } else {
                            field.onChange("");
                          }
                        }}
                      />
                      {/* 
                        <div className="relative flex gap-2">
                          <Input
                            {...field}
                            id="param-start-date"
                            placeholder="dd-mm-yyyy"
                            className="bg-input-background hover:bg-primary/10 rounded-lg pl-4 placeholder:text-input border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            onChange={(e) => {
                              const value = parseDateInput(e.target.value);
                              field.onChange(value);
                            }}
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="param-start-date-calendar"
                                variant="ghost"
                                className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                              >
                                <CalendarIcon className="size-3.5" />
                                <span className="sr-only">Select date</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={(() => {
                                  if (!field.value) return undefined;
                                  try {
                                    const date = parse(
                                      field.value,
                                      "dd-MM-yyyy",
                                      new Date()
                                    );
                                    return isNaN(date.getTime())
                                      ? undefined
                                      : date;
                                  } catch {
                                    return undefined;
                                  }
                                })()}
                                onSelect={(date) => {
                                  field.onChange(
                                    date ? format(date, "dd-MM-yyyy") : ""
                                  );
                                }}
                                captionLayout="dropdown"
                                defaultMonth={(() => {
                                  if (field.value) {
                                    try {
                                      const date = parse(
                                        field.value,
                                        "dd-MM-yyyy",
                                        new Date()
                                      );
                                      return isNaN(date.getTime())
                                        ? new Date()
                                        : date;
                                    } catch {
                                      return new Date();
                                    }
                                  }
                                  return new Date();
                                })()}
                                classNames={{
                                  months:
                                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                  month: "space-y-4",
                                  caption:
                                    "flex justify-center pt-1 relative items-center",
                                  day: cn(
                                    buttonVariants({ variant: "ghost" }),
                                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                                  ),
                                  head_cell:
                                    "text-primary rounded-md w-9 font-normal text-[0.8rem]",
                                  day_range_end: "day-range-end",
                                  day_selected:
                                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                  day_today:
                                    "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  day_outside:
                                    "day-outside text-popover-foreground aria-selected:bg-primary aria-selected:text-popover-foreground",
                                  day_disabled:
                                    "text-popover-foreground focus:bg-primary focus:text-primary-foreground",
                                  day_range_middle:
                                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                  day_hidden: "invisible",
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        */}
                    </FormControl>
                    <FormDescription className="sr-only">
                      This is the start date for your backtest.
                    </FormDescription>
                    <FormMessage className="text-xs pt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormLabel
                      htmlFor="param-end-date"
                      className="bg-clip-text text-transparent bg-text_accent_gradient pb-2"
                    >
                      End Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="param-end-date"
                        type="date"
                        className="bg-input-background hover:bg-primary/10 rounded-lg pl-4 placeholder:text-input border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={
                          field.value ? formatDateForSave(field.value) : ""
                        }
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          if (dateValue) {
                            // Convert yyyy-MM-dd to dd-MM-yyyy for form state
                            const formattedDate =
                              formatDateForDisplay(dateValue);
                            field.onChange(formattedDate);
                          } else {
                            field.onChange("");
                          }
                        }}
                      />
                      {/* 
                        <div className="relative flex gap-2">
                          <Input
                            {...field}
                            id="param-end-date"
                            placeholder="dd-mm-yyyy"
                            className="bg-input-background hover:bg-primary/10 rounded-lg pl-4 placeholder:text-input border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            onChange={(e) => {
                              const value = parseDateInput(e.target.value);
                              field.onChange(value);
                            }}
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="param-end-date-calendar"
                                variant="ghost"
                                className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                              >
                                <CalendarIcon className="size-3.5" />
                                <span className="sr-only">Select date</span>
                              </Button>
                            </PopoverTrigger>
                            <CustomPopoverContent
                              className="w-auto"
                              align="center"
                            >
                              <Calendar
                                mode="single"
                                selected={(() => {
                                  if (!field.value) return undefined;
                                  try {
                                    const date = parse(
                                      field.value,
                                      "dd-MM-yyyy",
                                      new Date()
                                    );
                                    return isNaN(date.getTime())
                                      ? undefined
                                      : date;
                                  } catch {
                                    return undefined;
                                  }
                                })()}
                                onSelect={(date) => {
                                  field.onChange(
                                    date ? format(date, "dd-MM-yyyy") : ""
                                  );
                                }}
                                captionLayout="dropdown"
                                defaultMonth={(() => {
                                  if (field.value) {
                                    try {
                                      const date = parse(
                                        field.value,
                                        "dd-MM-yyyy",
                                        new Date()
                                      );
                                      return isNaN(date.getTime())
                                        ? new Date()
                                        : date;
                                    } catch {
                                      return new Date();
                                    }
                                  }
                                  return new Date();
                                })()}
                                className="p-0"
                                classNames={{
                                  months:
                                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                  month: "space-y-4",
                                  caption:
                                    "flex justify-center pt-1 relative items-center",
                                  day: cn(
                                    buttonVariants({ variant: "ghost" }),
                                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                                  ),
                                  head_cell:
                                    "text-primary rounded-md w-9 font-normal text-[0.8rem]",
                                  day_range_end: "day-range-end",
                                  day_selected:
                                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                  day_today:
                                    "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  day_outside:
                                    "day-outside text-popover-foreground aria-selected:bg-primary aria-selected:text-popover-foreground",
                                  day_disabled:
                                    "text-popover-foreground focus:bg-primary focus:text-primary-foreground",
                                  day_range_middle:
                                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                  day_hidden: "invisible",
                                }}
                              />
                            </CustomPopoverContent>
                          </Popover>
                        </div>
                        */}
                    </FormControl>
                    <FormDescription className="sr-only">
                      This is the end date for your backtest.
                    </FormDescription>
                    <FormMessage className="text-xs pt-1" />
                  </FormItem>
                )}
              />
            </div>

            <button
              type="button"
              className="w-full mt-4 bg-button hover:bg-button/50 py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

const Plus = (props: React.SVGProps<SVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? "24"}
      height={props.height ?? "24"}
      viewBox="0 0 24 24"
      stroke="#8EA9C7"
      strokeWidth="4"
      className={cn(props.className)}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
};

const AddFilesPlus = (props: React.SVGProps<SVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? "16"}
      height={props.height ?? "16"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className={cn(props.className)}
    >
      <defs>
        <linearGradient
          id="addFilesPlusGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#93C6FF" />
          <stop offset="31%" stopColor="#599BE6" />
          <stop offset="67%" stopColor="#93C6FF" />
          <stop offset="100%" stopColor="#467AB5" />
        </linearGradient>
      </defs>

      <path fill="url(#addFilesPlusGradient)" d="M5 12h14" />
      <path fill="url(#addFilesPlusGradient)" d="M12 5v14" />
    </svg>
  );
};

const CalenderIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.19017 2.81633C4.19017 2.67044 4.24813 2.53053 4.35129 2.42737C4.45445 2.32421 4.59436 2.26625 4.74025 2.26625H9.14092C9.28681 2.26625 9.42673 2.32421 9.52989 2.42737C9.63305 2.53053 9.691 2.67044 9.691 2.81633C9.691 2.96223 9.63305 3.10214 9.52989 3.2053C9.42673 3.30846 9.28681 3.36642 9.14092 3.36642H4.74025C4.59436 3.36642 4.45445 3.30846 4.35129 3.2053C4.24813 3.10214 4.19017 2.96223 4.19017 2.81633ZM3.09 7.58372C3.09 7.34057 3.1866 7.10738 3.35853 6.93544C3.53047 6.76351 3.76366 6.66692 4.00681 6.66692C4.24996 6.66692 4.48316 6.76351 4.65509 6.93544C4.82702 7.10738 4.92362 7.34057 4.92362 7.58372C4.92362 7.82687 4.82702 8.06007 4.65509 8.232C4.48316 8.40394 4.24996 8.50053 4.00681 8.50053C3.76366 8.50053 3.53047 8.40394 3.35853 8.232C3.1866 8.06007 3.09 7.82687 3.09 7.58372ZM8.95756 7.58372C8.95756 7.34057 9.05415 7.10738 9.22609 6.93544C9.39802 6.76351 9.63121 6.66692 9.87436 6.66692C10.1175 6.66692 10.3507 6.76351 10.5226 6.93544C10.6946 7.10738 10.7912 7.34057 10.7912 7.58372C10.7912 7.82687 10.6946 8.06007 10.5226 8.232C10.3507 8.40394 10.1175 8.50053 9.87436 8.50053C9.63121 8.50053 9.39802 8.40394 9.22609 8.232C9.05415 8.06007 8.95756 7.82687 8.95756 7.58372ZM6.02378 7.58372C6.02378 7.34057 6.12037 7.10738 6.29231 6.93544C6.46424 6.76351 6.69744 6.66692 6.94059 6.66692C7.18374 6.66692 7.41693 6.76351 7.58887 6.93544C7.7608 7.10738 7.85739 7.34057 7.85739 7.58372C7.85739 7.82687 7.7608 8.06007 7.58887 8.232C7.41693 8.40394 7.18374 8.50053 6.94059 8.50053C6.69744 8.50053 6.46424 8.40394 6.29231 8.232C6.12037 8.06007 6.02378 7.82687 6.02378 7.58372ZM3.09 10.5175C3.09 10.2743 3.1866 10.0412 3.35853 9.86922C3.53047 9.69729 3.76366 9.60069 4.00681 9.60069C4.24996 9.60069 4.48316 9.69729 4.65509 9.86922C4.82702 10.0412 4.92362 10.2743 4.92362 10.5175C4.92362 10.7607 4.82702 10.9938 4.65509 11.1658C4.48316 11.3377 4.24996 11.4343 4.00681 11.4343C3.76366 11.4343 3.53047 11.3377 3.35853 11.1658C3.1866 10.9938 3.09 10.7607 3.09 10.5175ZM6.02378 10.5175C6.02378 10.2743 6.12037 10.0412 6.29231 9.86922C6.46424 9.69729 6.69744 9.60069 6.94059 9.60069C7.18374 9.60069 7.41693 9.69729 7.58887 9.86922C7.7608 10.0412 7.85739 10.2743 7.85739 10.5175C7.85739 10.7607 7.7608 10.9938 7.58887 11.1658C7.41693 11.3377 7.18374 11.4343 6.94059 11.4343C6.69744 11.4343 6.46424 11.3377 6.29231 11.1658C6.12037 10.9938 6.02378 10.7607 6.02378 10.5175ZM8.13904 0.065918C8.93922 0.065918 9.57439 0.0659179 10.0856 0.107724C10.6093 0.150264 11.0515 0.239744 11.4564 0.445109C12.1118 0.779445 12.6446 1.31271 12.9783 1.96847C13.1844 2.37187 13.2739 2.81487 13.3164 3.33855C13.3582 3.84976 13.3582 4.48492 13.3582 5.28511V8.41545C13.3582 9.21564 13.3582 9.8508 13.3164 10.362C13.2739 10.8857 13.1844 11.328 12.979 11.7328C12.6449 12.3881 12.1119 12.9209 11.4564 13.2547C11.0515 13.4608 10.6093 13.5503 10.0856 13.5928C9.57439 13.6346 8.93922 13.6346 8.13904 13.6346H5.74214C4.94195 13.6346 4.30679 13.6346 3.79558 13.5928C3.2719 13.5503 2.82963 13.4608 2.4255 13.2554C1.76991 12.9214 1.23689 12.3884 0.902873 11.7328C0.696775 11.328 0.607295 10.8857 0.564755 10.362C0.522949 9.8508 0.522949 9.21564 0.522949 8.41545V5.28511C0.522949 4.48492 0.522949 3.84976 0.564755 3.33855C0.607295 2.81487 0.696776 2.3726 0.90214 1.96847C1.23635 1.31276 1.76963 0.779738 2.4255 0.445842C2.8289 0.239744 3.2719 0.150264 3.79558 0.107724C4.30679 0.0659179 4.94195 0.065918 5.74287 0.065918H8.13904ZM3.88506 1.20422C3.43032 1.2409 3.14795 1.31204 2.92425 1.42572C2.47584 1.65424 2.11127 2.01881 1.88276 2.46721C1.76907 2.69092 1.69866 2.97329 1.66126 3.42803C1.63778 3.71407 1.62898 4.05145 1.62458 4.46658H12.2559C12.2561 4.12008 12.2442 3.77368 12.2199 3.42803C12.1832 2.97329 12.1121 2.69092 11.9984 2.46721C11.7699 2.01881 11.4053 1.65424 10.9569 1.42572C10.7332 1.31204 10.4509 1.24163 9.99612 1.20422C9.53405 1.16682 8.94436 1.16608 8.1141 1.16608H5.76708C4.93608 1.16608 4.3464 1.16608 3.88506 1.20422ZM12.4392 4.46658C12.4396 4.11518 12.4274 3.76388 12.4025 3.41336C12.3644 2.94615 12.2911 2.63811 12.162 2.38434C11.9158 1.90114 11.523 1.50831 11.0398 1.26217C10.786 1.13308 10.478 1.05974 10.0115 1.0216C9.54065 0.982723 8.94142 0.982723 8.1141 0.982723H5.76708C4.93975 0.982723 4.34053 0.982723 3.87039 1.0216C3.40319 1.05974 3.09514 1.13308 2.84137 1.26217C2.35817 1.50831 1.96534 1.90114 1.7192 2.38434C1.59011 2.63811 1.51677 2.94615 1.47863 3.41336C1.45442 3.70674 1.44562 4.04925 1.44195 4.46658L1.43975 4.64995H12.4414L12.4392 4.46658ZM12.2581 5.56675H1.62312V8.39051C1.62312 9.2215 1.62312 9.81119 1.66126 10.2725C1.69793 10.7273 1.76907 11.0096 1.88276 11.2333C2.11127 11.6817 2.47584 12.0463 2.92425 12.2748C3.14795 12.3885 3.43032 12.4589 3.88506 12.4963C4.34713 12.5337 4.93608 12.5345 5.76708 12.5345H8.1141C8.94509 12.5345 9.53478 12.5345 9.99612 12.4963C10.4509 12.4597 10.7332 12.3885 10.9569 12.2748C11.4053 12.0463 11.7699 11.6817 11.9984 11.2333C12.1121 11.0096 12.1825 10.7273 12.2199 10.2725C12.2573 9.81046 12.2581 9.22077 12.2581 8.39051V5.56675ZM5.75021 0.249279H8.13097C8.93776 0.249279 9.56705 0.249279 10.0709 0.290352C10.5829 0.332158 10.9987 0.418705 11.3728 0.608667C11.994 0.925125 12.499 1.43016 12.8155 2.05135C13.0062 2.42541 13.092 2.84127 13.1338 3.35322C13.1749 3.85709 13.1749 4.48565 13.1749 5.29318V8.40738C13.1749 9.21417 13.1749 9.84346 13.1338 10.3473C13.092 10.8593 13.0054 11.2751 12.8155 11.6492C12.499 12.2704 11.994 12.7754 11.3728 13.0919C10.9987 13.2826 10.5829 13.3684 10.0709 13.4102C9.56705 13.4513 8.93849 13.4513 8.13097 13.4513H5.75021C4.94342 13.4513 4.31412 13.4513 3.81025 13.4102C3.2983 13.3684 2.88244 13.2819 2.50838 13.0919C1.88719 12.7754 1.38216 12.2704 1.0657 11.6492C0.875003 11.2751 0.78919 10.8593 0.747383 10.3473C0.70631 9.84346 0.70631 9.2149 0.70631 8.40738V5.29318C0.70631 4.48639 0.70631 3.85709 0.747383 3.35322C0.78919 2.84127 0.875736 2.42541 1.0657 2.05135C1.38216 1.43016 1.88719 0.925125 2.50838 0.608667C2.88244 0.417971 3.2983 0.332158 3.81025 0.290352C4.31486 0.249279 4.94269 0.249279 5.75021 0.249279ZM1.43975 5.38339V8.39051C1.43975 9.21784 1.43975 9.81706 1.47863 10.2872C1.51677 10.7544 1.59011 11.0624 1.7192 11.3162C1.96534 11.7994 2.35817 12.1922 2.84137 12.4384C3.09514 12.5675 3.40319 12.6408 3.87039 12.679C4.34053 12.7178 4.93975 12.7178 5.76708 12.7178H8.1141C8.94142 12.7178 9.54065 12.7178 10.0108 12.679C10.478 12.6408 10.786 12.5675 11.0398 12.4384C11.523 12.1922 11.9158 11.7994 12.162 11.3162C12.2911 11.0624 12.3644 10.7544 12.4025 10.2879C12.4414 9.81706 12.4414 9.21784 12.4414 8.39051V5.38339H1.43975ZM4.37353 2.81633C4.37353 2.71907 4.41217 2.6258 4.48094 2.55702C4.54972 2.48825 4.64299 2.44961 4.74025 2.44961H9.14092C9.23818 2.44961 9.33146 2.48825 9.40023 2.55702C9.46901 2.6258 9.50764 2.71907 9.50764 2.81633C9.50764 2.91359 9.46901 3.00687 9.40023 3.07565C9.33146 3.14442 9.23818 3.18306 9.14092 3.18306H4.74025C4.64299 3.18306 4.54972 3.14442 4.48094 3.07565C4.41217 3.00687 4.37353 2.91359 4.37353 2.81633ZM4.00681 6.85028C3.81229 6.85028 3.62573 6.92755 3.48819 7.0651C3.35064 7.20265 3.27337 7.3892 3.27337 7.58372C3.27337 7.77824 3.35064 7.9648 3.48819 8.10235C3.62573 8.23989 3.81229 8.31717 4.00681 8.31717C4.20133 8.31717 4.38789 8.23989 4.52543 8.10235C4.66298 7.9648 4.74025 7.77824 4.74025 7.58372C4.74025 7.3892 4.66298 7.20265 4.52543 7.0651C4.38789 6.92755 4.20133 6.85028 4.00681 6.85028ZM9.14092 7.58372C9.14092 7.3892 9.21819 7.20265 9.35574 7.0651C9.49329 6.92755 9.67984 6.85028 9.87436 6.85028C10.0689 6.85028 10.2554 6.92755 10.393 7.0651C10.5305 7.20265 10.6078 7.3892 10.6078 7.58372C10.6078 7.77824 10.5305 7.9648 10.393 8.10235C10.2554 8.23989 10.0689 8.31717 9.87436 8.31717C9.67984 8.31717 9.49329 8.23989 9.35574 8.10235C9.21819 7.9648 9.14092 7.77824 9.14092 7.58372ZM6.20714 7.58372C6.20714 7.3892 6.28442 7.20265 6.42196 7.0651C6.55951 6.92755 6.74607 6.85028 6.94059 6.85028C7.13511 6.85028 7.32166 6.92755 7.45921 7.0651C7.59676 7.20265 7.67403 7.3892 7.67403 7.58372C7.67403 7.77824 7.59676 7.9648 7.45921 8.10235C7.32166 8.23989 7.13511 8.31717 6.94059 8.31717C6.74607 8.31717 6.55951 8.23989 6.42196 8.10235C6.28442 7.9648 6.20714 7.77824 6.20714 7.58372ZM3.27337 10.5175C3.27337 10.323 3.35064 10.1364 3.48819 9.99888C3.62573 9.86133 3.81229 9.78406 4.00681 9.78406C4.20133 9.78406 4.38789 9.86133 4.52543 9.99888C4.66298 10.1364 4.74025 10.323 4.74025 10.5175C4.74025 10.712 4.66298 10.8986 4.52543 11.0361C4.38789 11.1737 4.20133 11.2509 4.00681 11.2509C3.81229 11.2509 3.62573 11.1737 3.48819 11.0361C3.35064 10.8986 3.27337 10.712 3.27337 10.5175ZM6.20714 10.5175C6.20714 10.323 6.28442 10.1364 6.42196 9.99888C6.55951 9.86133 6.74607 9.78406 6.94059 9.78406C7.13511 9.78406 7.32166 9.86133 7.45921 9.99888C7.59676 10.1364 7.67403 10.323 7.67403 10.5175C7.67403 10.712 7.59676 10.8986 7.45921 11.0361C7.32166 11.1737 7.13511 11.2509 6.94059 11.2509C6.74607 11.2509 6.55951 11.1737 6.42196 11.0361C6.28442 10.8986 6.20714 10.712 6.20714 10.5175Z"
        fill="currentColor"
      />
    </svg>
  );
};

const CosineConnector = ({
  containerRef,
  startRef,
  endRef,
  startPct = 0.5,
  endPct = 0.5,
}: {
  containerRef: React.RefObject<HTMLElement>;
  startRef: React.RefObject<HTMLElement>;
  endRef: React.RefObject<HTMLElement>;
  startPct?: number;
  endPct?: number;
}) => {
  const [d, setD] = useState<string>("");
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    let raf = 0;

    const recalc = () => {
      if (!containerRef.current || !startRef.current || !endRef.current) return;

      const cr = containerRef.current.getBoundingClientRect();
      const sr = startRef.current.getBoundingClientRect();
      const er = endRef.current.getBoundingClientRect();

      const w = Math.ceil(cr.width);
      const h = Math.ceil(cr.height);
      if (w !== size.w || h !== size.h) setSize({ w, h });

      // Calculate the actual pseudo-element positions
      // For ::after at top: 53%, translate-y: -50%
      const startX = sr.right - cr.left;
      const startY = sr.top - cr.top + sr.height * 0.53 + 16; // Use the actual 53% from CSS

      // For ::before at top: 45%, translate-y: -50%
      const endX = er.left - cr.left;
      const endY = er.top - cr.top + er.height * 0.45 + 16; // Use the actual 45% from CSS

      // Use the original curve shape but scale and position it between start and end points
      // Original path: M4.35093e-05 31.7086L24.3268 31.7086C33.6921 31.7085 42.0123 25.7303 44.9999 16.8543V16.8543C47.9876 7.9783 56.3077 2.00004 65.6731 2.00004L76.9999 2.00004

      // Original dimensions
      const originalWidth = 76.9999 - 4.35093e-5;
      const originalHeight = 31.7086 - 2.00004;

      // Calculate scale and offset to fit between our start and end points
      const targetWidth = endX - startX;
      const targetHeight = endY - startY;
      const scaleX = targetWidth / originalWidth;
      const scaleY = targetHeight / originalHeight;

      // Scale all coordinates
      const path = `M ${startX} ${startY}L ${
        startX + 24.3268 * scaleX
      } ${startY}C ${startX + 33.6921 * scaleX} ${startY}, ${
        startX + 42.0123 * scaleX
      } ${startY + (31.7086 - 25.7303) * scaleY}, ${
        startX + 44.9999 * scaleX
      } ${startY + (31.7086 - 16.8543) * scaleY}V ${
        startY + (31.7086 - 16.8543) * scaleY
      }C ${startX + 47.9876 * scaleX} ${
        startY + (31.7086 - 7.9783) * scaleY
      }, ${startX + 56.3077 * scaleX} ${endY}, ${
        startX + 65.6731 * scaleX
      } ${endY}L ${endX} ${endY}`;

      setD(path);
    };

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recalc);
    });

    if (containerRef.current) ro.observe(containerRef.current);
    if (startRef.current) ro.observe(startRef.current);
    if (endRef.current) ro.observe(endRef.current);
    window.addEventListener("resize", recalc);

    recalc();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
      cancelAnimationFrame(raf);
    };
  }, [containerRef, startRef, endRef, startPct, endPct, size.w, size.h]);

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-20"
      width="100%"
      height="100%"
      viewBox={`0 0 ${Math.max(1, size.w)} ${Math.max(1, size.h)}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={d} fill="none" stroke="#232323" strokeWidth="5" />
    </svg>
  );
};

export default BacktestForm;
