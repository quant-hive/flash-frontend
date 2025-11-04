"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parse } from "date-fns";
import { databaseService } from "@/lib/backtest-service";

// Define the backtest form schema
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
    start_date: z
      .string()
      .min(1, {
        message: "Please enter the start date",
      })
      .regex(/^\d{2}-\d{2}-\d{4}$/, {
        message: "Please enter date in dd-MM-yyyy format.",
      }),
    end_date: z
      .string()
      .min(1, {
        message: "Please enter the end date",
      })
      .regex(/^\d{2}-\d{2}-\d{4}$/, {
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

export type BacktestFormValues = z.infer<typeof backtestSchema>;

// Context interface
interface BacktestFormContextType {
  form: UseFormReturn<BacktestFormValues>;
  availableInstruments: string[];
  dbInfo: {
    start_date: string;
    end_date: string;
  } | null;
  isLoading: boolean;
  formatDateForSave: (dateString: string) => string;
  formatDateForDisplay: (dateString: string) => string;
  parseDateInput: (value: string) => string;
}

// Create the context
const BacktestFormContext = createContext<BacktestFormContextType | undefined>(
  undefined
);

// Hook to use the context
export const useBacktestForm = () => {
  const context = useContext(BacktestFormContext);
  if (context === undefined) {
    throw new Error(
      "useBacktestForm must be used within a BacktestFormProvider"
    );
  }
  return context;
};

// Provider component
interface BacktestFormProviderProps {
  children: React.ReactNode;
}

export const BacktestFormProvider: React.FC<BacktestFormProviderProps> = ({
  children,
}) => {
  const [availableInstruments, setAvailableInstruments] = useState<string[]>(
    []
  );
  const [dbInfo, setDbInfo] = useState<{
    start_date: string;
    end_date: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the form with default values
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

  // Load available instruments and database info
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [instruments, dbInfoData] = await Promise.all([
          databaseService.getAvailableInstruments(),
          databaseService.getDatabaseInfo(),
        ]);

        setAvailableInstruments(instruments);
        setDbInfo({
          start_date: dbInfoData.start_date || "",
          end_date: dbInfoData.end_date || "",
        });

        // Set default dates if available
        if (dbInfoData.start_date && dbInfoData.end_date) {
          form.setValue(
            "start_date",
            formatDateForDisplay(dbInfoData.start_date)
          );
          form.setValue("end_date", formatDateForDisplay(dbInfoData.end_date));
        }
      } catch (err: any) {
        console.error("Error loading form data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [form]);

  const value: BacktestFormContextType = {
    form,
    availableInstruments,
    dbInfo,
    isLoading,
    formatDateForSave,
    formatDateForDisplay,
    parseDateInput,
  };

  return (
    <BacktestFormContext.Provider value={value}>
      {children}
    </BacktestFormContext.Provider>
  );
};
