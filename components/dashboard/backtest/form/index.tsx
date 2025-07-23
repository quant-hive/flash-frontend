"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { backtestService, databaseService } from "@/lib/backtest-service"
import { BacktestFormData } from "@/types/backtest-service"

const backtestSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
  name: z.string().min(1, {
    message: "Name must be at least 1 character.",
  }),
  tickers: z.array(z.string()).min(1, {
    message: "Please select at least one ticker.",
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
}).refine(data => new Date(data.start_date) < new Date(data.end_date), {
  message: "End date must be after start date.",
  path: ["end_date"],
});

type BacktestFormValues = z.infer<typeof backtestSchema>

interface BacktestFormProps {
  onBacktestSubmitted: (backtestId: string) => void
}

export function BacktestForm({ onBacktestSubmitted }: BacktestFormProps) {
  const [availableTickers, setAvailableTickers] = useState<string[]>([])
  const [selectedTickers, setSelectedTickers] = useState<string[]>([])
  const [tickerInput, setTickerInput] = useState<string>("")
  const [dbInfo, setDbInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [backtestId, setBacktestId] = useState<string | null>(null)
  const [statusPolling, setStatusPolling] = useState<any>(null)
  const [apiRetries, setApiRetries] = useState(0)

  const form = useForm<BacktestFormValues>({
    resolver: zodResolver(backtestSchema),
    defaultValues: {
      name: "",
      prompt: "",
      tickers: [],
      initial_cash: 100000,
      start_date: "",
      end_date: "",
      commission: 0.1,
    },
  })

  // Load available tickers and database info
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tickers, dbInfo] = await Promise.all([
          databaseService.getAvailableTickers(),
          databaseService.getDatabaseInfo()
        ]);
        
        setAvailableTickers(tickers);
        setDbInfo({
          start_date: dbInfo.start_date,
          end_date: dbInfo.end_date
        });
        
        // Set default dates if available
        if (dbInfo.start_date && dbInfo.end_date) {
          form.setValue('start_date', dbInfo.start_date);
          form.setValue('end_date', dbInfo.end_date);
        }
      } catch (err: any) {
        console.error("Error loading form data:", err);
        setError(err.message || "Failed to load tickers and database information");
      }
    };
    
    loadData();
  }, [form]);

  const addTicker = () => {
    if (tickerInput && availableTickers.includes(tickerInput) && !selectedTickers.includes(tickerInput)) {
      const newTickers = [...selectedTickers, tickerInput];
      setSelectedTickers(newTickers);
      form.setValue('tickers', newTickers);
      setTickerInput("");
    }
  };

  const removeTicker = (ticker: string) => {
    const newTickers = selectedTickers.filter(t => t !== ticker);
    setSelectedTickers(newTickers);
    form.setValue('tickers', newTickers);
  };

  const onSubmit = async (data: BacktestFormValues) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const backtestRequest: BacktestFormData = {
        name: data.name,
        prompt: data.prompt,
        tickers: data.tickers,
        initial_cash: data.initial_cash,
        start_date: data.start_date,
        end_date: data.end_date,
        commission: data.commission
      };
      
      // Validate date range
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 60) {
        setError("Backtest period should be at least 60 days for meaningful results");
        setIsLoading(false);
        return;
      }
      
      // Validate initial cash
      if (data.initial_cash < 10000) {
        setError("Initial cash should be at least Rs. 10,000 for meaningful results");
        setIsLoading(false);
        return;
      }
      
      const response = await backtestService.runBacktest(backtestRequest);
      setBacktestId(response.backtest_id);
      
      // Start polling for backtest status with exponential backoff
      let pollInterval = 2000; // Start with 2 seconds
      const maxInterval = 10000; // Max 10 seconds between polls
      const multiplier = 1.5; // Increase interval by 50% each time
      
      const pollBacktest = async () => {
        try {
          const status = await backtestService.getBacktestStatus(response.backtest_id);
          
          if (status.status === 'running') {
            // Update progress based on a simple increasing algorithm
            setProgress(prev => {
              // Slow down progress as it gets higher
              if (prev < 50) return Math.min(prev + 8, 50);
              if (prev < 80) return Math.min(prev + 4, 80);
              return Math.min(prev + 1, 95);
            });
            
            // Increase polling interval with exponential backoff
            pollInterval = Math.min(pollInterval * multiplier, maxInterval);
            
            // Set new timeout with updated interval
            const newTimeout = setTimeout(pollBacktest, pollInterval);
            setStatusPolling(newTimeout);
          } else if (status.status === 'completed') {
            setProgress(100);
            
            setTimeout(() => {
              setIsLoading(false);
              onBacktestSubmitted(response.backtest_id);
              
              // Reset the form
              form.reset({
                name: "",
                prompt: "",
                tickers: [],
                initial_cash: 100000,
                start_date: dbInfo?.start_date || "",
                end_date: dbInfo?.end_date || "",
                commission: 0.1,
              });
              setSelectedTickers([]);
              setBacktestId(null);
              setProgress(0);
            }, 1000);
          } else if (status.status === 'failed') {
            setError(status.message || "Backtest failed. Please try again with different parameters.");
            setIsLoading(false);
            setBacktestId(null);
          }
        } catch (err: any) {
          console.error("Error polling backtest status:", err);
          
          // Only show error after several retries
          if (apiRetries > 3) {
            setError("Connection error while checking backtest status. The backtest may still be running.");
          }
          
          // Increase retry counter
          setApiRetries(prev => prev + 1);
          
          // Try again with exponential backoff
          const newTimeout = setTimeout(pollBacktest, pollInterval * 2);
          setStatusPolling(newTimeout);
        }
      };
      
      // Start first poll
      const initialTimeout = setTimeout(pollBacktest, pollInterval);
      setStatusPolling(initialTimeout);
      
    } catch (err: any) {
      console.error("Backtest submission error:", err);
      setError(err.response?.data?.detail || err.message || "Failed to submit backtest. Please try again.");
      setIsLoading(false);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusPolling) {
        clearTimeout(statusPolling);
      }
    };
  }, [statusPolling]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run a New Backtest</CardTitle>
        <CardDescription>
          Describe your trading strategy and select parameters to run a backtest
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Strategy Description */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strategy Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your trading strategy here. Example: Buy AAPL when the 50-day moving average crosses above the 200-day moving average and sell when it crosses below."
                          {...field}
                          rows={16}
                          className="resize-none h-full min-h-[400px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Describe your strategy in plain language. Be as specific as possible.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Right Column - Other Parameters */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Give your backtest a name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tickers"
                  render={() => (
                    <FormItem>
                      <FormLabel>Tickers</FormLabel>
                      <div className="flex space-x-2">
                        <Select 
                          onValueChange={setTickerInput} 
                          value={tickerInput}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select ticker" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTickers
                              .filter(ticker => !selectedTickers.includes(ticker))
                              .map(ticker => (
                                <SelectItem key={ticker} value={ticker}>
                                  {ticker}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          onClick={addTicker}
                          disabled={!tickerInput || selectedTickers.includes(tickerInput)}
                        >
                          Add
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTickers.map(ticker => (
                          <Badge key={ticker} variant="secondary" className="py-1">
                            {ticker}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-2"
                              onClick={() => removeTicker(ticker)}
                            >
                              ✕
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      
                      <FormDescription>
                        Select the tickers you want to include in your backtest.
                      </FormDescription>
                      {form.formState.errors.tickers && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.tickers.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="initial_cash"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Cash (Rs.)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Starting capital for the backtest in Rupees.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="commission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>
                          Trading commission percentage.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Format: YYYY-MM-DD
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Format: YYYY-MM-DD
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Running backtest{backtestId ? ` (ID: ${backtestId})` : ''}...</span>
                    <span className="text-sm">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Please wait while your backtest runs. This could take several minutes.</p>
                </div>
              ) : (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Run Backtest
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 