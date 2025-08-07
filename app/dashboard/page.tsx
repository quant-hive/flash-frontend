"use client";

import React, {
  useState,
  useEffect,
  useRef,
  LegacyRef,
  HTMLProps,
} from "react";
import { BacktestForm } from "@/components/dashboard/backtest/form";
import { BacktestResultsView } from "@/components/dashboard/backtest/results";
import { BacktestResults } from "@/types/backtest-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  ChevronDown,
  EllipsisVertical,
  Mic,
  Mic2,
  PlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { DotsHorizontalIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import CustomPopoverContent from "@/components/custom-popover-content";
import { cn } from "@/lib/utils";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  disableGlobalCursorStyles,
} from "react-resizable-panels";
import HoverTooltipWrapper from "@/components/tooltip";
import TextareaAutosize from "react-textarea-autosize";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MultiSelect } from "@/components/new-multi-select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { backtestService, databaseService } from "@/lib/backtest-service";

export default function DashboardPage() {
  const [backtestId, setBacktestId] = useState<string | null>(null);
  const [backtestResults, setBacktestResults] =
    useState<BacktestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleBacktestSubmitted = async (id: string) => {
    setBacktestId(id);
    setIsLoading(true);
    setError(null);

    try {
      // Poll for backtest completion
      const pollInterval = setInterval(async () => {
        try {
          const status = await backtestService.getBacktestStatus(id);

          if (status.status === "completed") {
            clearInterval(pollInterval);
            const results = await backtestService.getBacktestResults(id);
            setBacktestResults(results);
            setIsLoading(false);
          } else if (status.status === "failed") {
            clearInterval(pollInterval);
            setError(`Backtest failed: ${status.message}`);
            setIsLoading(false);
          }
        } catch (err: any) {
          clearInterval(pollInterval);

          setError(
            err.response?.data?.detail ||
              err.message ||
              "Failed to get backtest status"
          );
          setIsLoading(false);
        }
      }, 3000); // Poll every 3 seconds

      // Cleanup interval on component unmount
      return () => clearInterval(pollInterval);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to process backtest"
      );
      setIsLoading(false);
    }
  };

  const handleCloseResults = () => {
    setBacktestResults(null);
    setBacktestId(null);
  };

  return (
    <PanelGroup
      autoSaveId={"quanthive-dashboard-panel-group"}
      direction="horizontal"
      className="flex flex-row w-full gap-6 mt-6 h-full"
    >
      <Panel defaultSize={70} minSize={70} className="h-full">
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

const LeftPanel = () => {
  const backtestSchema = z
    .object({
      prompt: z.string().min(10, {
        message: "Prompt must be at least 10 characters.",
      }),
      name: z.string().min(1, {
        message: "Name must be at least 1 character.",
      }),
      instruments: z.array(z.string()).min(1, {
        message: "Please select at least one instrument.",
      }),
      initial_cash: z.coerce.number().min(1000, {
        message: "Initial cash must be at least 1000.",
      }),
      start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Please enter a valid date in YYYY-MM-DD format.",
      }),
      end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Please enter a valid date in YYYY-MM-DD format.",
      }),
      commission: z.coerce.number().min(0).max(100, {
        message: "Commission must be between 0 and 100.",
      }),
    })
    .refine((data) => new Date(data.start_date) < new Date(data.end_date), {
      message: "End date must be after start date.",
      path: ["end_date"],
    });

  type BacktestFormValues = z.infer<typeof backtestSchema>;

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [availableInstruments, setAvailableInstruments] = useState<string[]>(
    []
  );
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);

  const form = useForm<BacktestFormValues>({
    resolver: zodResolver(backtestSchema),
    defaultValues: {
      name: "",
      prompt: "",
      instruments: [],
      initial_cash: 100000,
      start_date: "",
      end_date: "",
      commission: 0.1,
    },
  });

  const onSubmit = async (data: BacktestFormValues) => {
    console.log("Form submitted:", data);
  };

  // Load available intruements and database info
  useEffect(() => {
    const loadData = async () => {
      try {
        const [instruments, dbInfo] = await Promise.all([
          databaseService.getAvailableInstruments(),
          databaseService.getDatabaseInfo(),
        ]);

        console.log("Available instruments:", instruments);

        setAvailableInstruments(instruments);
        setDbInfo({
          start_date: dbInfo.start_date,
          end_date: dbInfo.end_date,
        });

        // Set default dates if available
        if (dbInfo.start_date && dbInfo.end_date) {
          form.setValue("start_date", dbInfo.start_date);
          form.setValue("end_date", dbInfo.end_date);
        }
      } catch (err: any) {
        console.error("Error loading form data:", err);
        setError(
          err.message || "Failed to load tickers and database information"
        );
      }
    };

    loadData();
  }, [form]);

  return (
    <div className="flex flex-col h-full">
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

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row mt-6 h-full"
        >
          <div className="flex flex-col w-full h-full">
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
                    <div className="flex flex-col">Playground settings</div>
                  </CustomPopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-4 items-center justify-center mt-4 bg-card border-2 border-card-border rounded-2xl h-full">
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

              <div
                onClick={() => {
                  textAreaRef.current?.focus();
                }}
                className="relative bg-[#232323] rounded-md flex flex-col gap-4 w-full px-4 py-2"
              >
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <TextareaAutosize
                      id="playground-chat"
                      className="w-full bg-transparent border-none outline-none resize-none placeholder:text-input placeholder:select-none text-primary"
                      maxRows={8}
                      placeholder="kisi tarah paisa dede bhai, pleej !!"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  )}
                />

                <div className="flex flex-row items-center justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="bg-button hover:bg-button/50 text-button-foreground h-full px-2 rounded-md"
                  >
                    <AddFilesPlus />
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="bg-button hover:bg-button/50 text-button-foreground h-full px-2 rounded-md"
                  >
                    <Mic size={"16"} />
                  </button>

                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="bg-blue_accent_gradient_90deg text-black px-5 py-1 font-semibold tracking-wider rounded-md"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full h-full">
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
                  <FormItem className="flex flex-col gap-1 w-full">
                    <FormLabel
                      htmlFor="param-name"
                      className="bg-clip-text text-transparent bg-text_accent_gradient"
                    >
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="param-name"
                        type="text"
                        {...field}
                        placeholder="Give your backtest a name"
                        className="bg-input-background rounded-lg pl-4 placeholder:text-input-placeholder border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormDescription className="sr-only">
                      This name will be used to identify your backtest.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instruments"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1 w-full">
                    <FormLabel
                      htmlFor="param-instruments"
                      className="bg-clip-text text-transparent bg-text_accent_gradient"
                    >
                      Instruments
                    </FormLabel>
                    <FormControl>
                      <MultiSelect
                        id="param-instruments"
                        name="instruments"
                        autoSize={false}
                        hideSelectAll
                        singleLine
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
                        placeholder="Select instruments to include in the backtest"
                        popoverClassName="bg-popover border rounded-md shadow-md overflow-auto"
                        className="bg-input-background rounded-lg pl-4 border-none hover:bg-input-background"
                      />
                    </FormControl>
                    <FormDescription className="sr-only">
                      Select the instruments you want to include in the
                      backtest.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initial_cash"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1 w-full">
                    <FormLabel
                      htmlFor="param-initial-cash"
                      className="bg-clip-text text-transparent bg-text_accent_gradient"
                    >
                      Initial Cash
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="param-initial-cash"
                        type="number"
                        placeholder="Starting capital for the backtest in Rs."
                        className="bg-input-background rounded-lg pl-4 placeholder:text-input-placeholder border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormDescription className="sr-only">
                      This is the starting capital for your backtest in Rs.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1 w-full">
                    <FormLabel
                      htmlFor="param-commission"
                      className="bg-clip-text text-transparent bg-text_accent_gradient"
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
                        className="bg-input-background rounded-lg pl-4 placeholder:text-input-placeholder border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormDescription className="sr-only">
                      This is the commission percentage charged on each trade.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-1 w-full">
                <fieldset>
                  <Label
                    htmlFor="param-date"
                    className="bg-clip-text text-transparent bg-text_accent_gradient"
                  >
                    Date
                  </Label>
                  <div className="flex flex-row gap-4 w-full">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              id="param-start-date"
                              type="date"
                              className="bg-input-background rounded-lg pl-4 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </FormControl>
                          <FormDescription className="sr-only">
                            This is the start date for your backtest.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              id="param-end-date"
                              type="date"
                              className="bg-input-background rounded-lg pl-4 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </FormControl>
                          <FormDescription className="sr-only">
                            This is the end date for your backtest.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </fieldset>
              </div>

              <button className="w-full mt-4 bg-button hover:bg-button/50 py-2 rounded-lg">
                Save
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

const RightPanel = () => {
  const [isSchedulePopoverOpen, setIsSchedulePopoverOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row gap-3 justify-end">
        <Popover
          open={isSchedulePopoverOpen}
          onOpenChange={setIsSchedulePopoverOpen}
        >
          <PopoverTrigger asChild>
            <div className="flex flex-row items-center justify-center gap-2 bg-button hover:bg-button/35 py-1.5 pl-3.5 pr-3 rounded-lg text-sm font-light">
              Schedule
              <ChevronDown
                className={cn("w-5 h-5 transition-transform duration-300", {
                  "rotate-180": isSchedulePopoverOpen,
                })}
              />
            </div>
          </PopoverTrigger>
          <CustomPopoverContent
            align="end"
            sideOffset={12}
            className="text-foreground"
          >
            <div className="flex flex-col">
              <p className="text-sm font-light">Schedule Options</p>
              <ul className="mt-2 space-y-1">
                <li className="cursor-pointer hover:text-primary">Daily</li>
                <li className="cursor-pointer hover:text-primary">Weekly</li>
                <li className="cursor-pointer hover:text-primary">Monthly</li>
              </ul>
            </div>
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
            <div className="flex flex-col">Explainable AI settings</div>
          </CustomPopoverContent>
        </Popover>
        <div></div>
      </div>

      <Card className="bg-card border-2 border-card-border w-full mt-4 h-full">
        <CardContent className="pt-6 px-8 text-center">
          <span className=" text-xl bg-clip-text text-transparent bg-text_accent_gradient">
            Explainable AI
            <sup className="bg-clip-text text-transparent bg-text_accent_gradient text-[10px] -top-2">
              {" "}
              TM
            </sup>
          </span>

          <hr className="my-4 h-0.5 bg-card-border" />
        </CardContent>
      </Card>
    </div>
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
