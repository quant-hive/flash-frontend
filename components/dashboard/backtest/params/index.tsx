import React from "react";
import { Control } from "react-hook-form";
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

interface ParamsProps {
  control: Control<any>;
  availableInstruments: string[];
  formatDateForSave: (dateString: string) => string;
  formatDateForDisplay: (dateString: string) => string;
  rightAnchorRef: React.RefObject<HTMLDivElement>;
}

const Params: React.FC<ParamsProps> = ({
  control,
  availableInstruments,
  formatDateForSave,
  formatDateForDisplay,
  rightAnchorRef,
}) => {
  return (
    <div
      ref={rightAnchorRef}
      className="relative flex flex-col flex-1 h-fit" // SVG Connector anchor - before:absolute before:-left-2 before:top-[45%] before:translate-y-1/2 before:z-30 before:h-4 before:w-4 before:rounded-full before:border-4 before:border-border before:bg-[#181818]
    >
      {/* <div className="flex flex-row justify-between items-center">
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
      </div> */}

      <div className="flex flex-col items-center mt-4 bg-card border-2 border-card-border rounded-2xl h-full p-6 gap-4">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
            control={control}
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
                <FormMessage className="text-xs pt-1" />
              </FormItem>
            )}
          />
          <FormField
            control={control}
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
  );
};

export default Params;
