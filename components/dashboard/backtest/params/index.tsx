import React from "react";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import CustomPopoverContent from "@/components/custom-popover-content";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import HoverTooltipWrapper from "@/components/tooltip";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/new-multi-select";
import { useBacktestForm } from "@/context/backtest-form-context";
import { FormProvider } from "react-hook-form";
import InstrumentSearch from "../instrument-search";

const Params: React.FC = () => {
  const {
    form,
    availableInstruments,
    formatDateForSave,
    formatDateForDisplay,
    isLoading,
  } = useBacktestForm();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="flex flex-col justify-between h-full">
        <div className="relative flex flex-col h-full gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full space-y-0">
                <FormLabel
                  htmlFor="param-name"
                  className="bg-clip-text text-transparent bg-text_accent_gradient pb-2 text-start"
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
                <FormMessage className="text-xs pt-1 text-start" />
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
                  className="bg-clip-text text-transparent bg-text_accent_gradient pb-2 text-start"
                >
                  Instruments
                </FormLabel>
                <FormControl>
                  {/* <MultiSelect
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
                  /> */}
                  <InstrumentSearch id="param-instruments" />
                </FormControl>
                <FormDescription className="sr-only">
                  Select the instruments you want to include
                </FormDescription>
                <FormMessage className="text-xs pt-1 text-start" />
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
                  className="bg-clip-text text-transparent bg-text_accent_gradient pb-2 text-start"
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
                <FormMessage className="text-xs pt-1 text-start" />
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
                  className="bg-clip-text text-transparent bg-text_accent_gradient pb-2 text-start"
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
                <FormMessage className="text-xs pt-1 text-start" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full space-y-0">
                <FormLabel
                  htmlFor="param-start-date"
                  className="bg-clip-text text-transparent bg-text_accent_gradient pb-2 text-start"
                >
                  Start Date
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="param-start-date"
                    type="date"
                    className="bg-input-background hover:bg-primary/10 rounded-lg pl-4 placeholder:text-input border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={field.value ? formatDateForSave(field.value) : ""}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        // Convert yyyy-MM-dd to dd-MM-yyyy for form state
                        const formattedDate = formatDateForDisplay(dateValue);
                        field.onChange(formattedDate);
                      } else {
                        field.onChange("");
                      }
                    }}
                  />
                </FormControl>
                <FormDescription className="sr-only">
                  This is the start date for your backtest.
                </FormDescription>
                <FormMessage className="text-xs pt-1 text-start" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full space-y-0">
                <FormLabel
                  htmlFor="param-end-date"
                  className="bg-clip-text text-transparent bg-text_accent_gradient pb-2 text-start"
                >
                  End Date
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="param-end-date"
                    type="date"
                    className="bg-input-background hover:bg-primary/10 rounded-lg pl-4 placeholder:text-input border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={field.value ? formatDateForSave(field.value) : ""}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        // Convert yyyy-MM-dd to dd-MM-yyyy for form state
                        const formattedDate = formatDateForDisplay(dateValue);
                        field.onChange(formattedDate);
                      } else {
                        field.onChange("");
                      }
                    }}
                  />
                </FormControl>
                <FormDescription className="sr-only">
                  This is the end date for your backtest.
                </FormDescription>
                <FormMessage className="text-xs pt-1 text-start" />
              </FormItem>
            )}
          />
        </div>

        <button
          type="button"
          className="w-full mt-4 bg-button hover:bg-button/50 py-2 rounded-lg transition-colors"
        >
          Save
        </button>
      </div>
    </FormProvider>
  );
};

export default Params;
