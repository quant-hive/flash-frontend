import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown, XIcon } from "lucide-react";
import { forwardRef, useEffect, useState, useRef, HTMLAttributes } from "react";

const InstrumentSearch = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const [remainingInstrumentsOpen, setRemainingInstrumentsOpen] =
      useState(false);
    const [value, setValue] = useState("");

    const inputRef = useRef<HTMLInputElement | null>(null);
    const selectedInstrumentsRef = useRef<HTMLDivElement | null>(null);

    const [selectedInstruments, setSelectedInstruments] = useState<string[]>([
      "BAAPL",
      "CAAPL",
      "DAAPL",
    ]);
    const [searchedInstruments, setSearchedInstruments] = useState<string[]>([
      "AAPL",
      "GOOGL",
      "MSFT",
      "AMZN",
      "TSLA",
    ]);

    const toggleOption = (instrument: string) => {
      if (selectedInstruments.includes(instrument)) {
        setSelectedInstruments((prev) =>
          prev.filter((item) => item !== instrument)
        );
      } else {
        setSelectedInstruments((prev) => [...prev, instrument]);
      }
    };

    useEffect(() => {
      if (value.trim() && value.length >= 2) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    }, [value]);

    useEffect(() => {
      console.log(inputRef.current?.clientWidth);
    }, [inputRef.current?.clientWidth]);

    return (
      <div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger onClick={(e) => e.preventDefault()} asChild>
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search instruments to include"
              className="bg-input-background hover:bg-primary/10 rounded-lg pl-4 placeholder:text-input border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => {
                if (value.trim() && value.length >= 2) {
                  setOpen(true);
                }
              }}
            />
          </PopoverTrigger>
          <PopoverContent
            align="center"
            side="bottom"
            sideOffset={
              (selectedInstrumentsRef.current?.clientHeight ?? 0) + 14
            }
            style={{
              width: inputRef.current?.clientWidth,
            }}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col gap-2 p-2"
          >
            {searchedInstruments.map((instrument) => (
              <div
                key={instrument}
                className={`text-sm flex flex-row justify-between items-center text-foreground py-1 px-2 ${
                  selectedInstruments.includes(instrument)
                    ? "bg-primary/10 hover:bg-primary/20 rounded-sm w-full"
                    : "hover:bg-secondary"
                } hover:bg-secondary rounded-sm w-full`}
                onClick={() => toggleOption(instrument)}
              >
                <span>{instrument}</span>
                {selectedInstruments.includes(instrument) && (
                  <Check className="ml-2 h-[14px] w-[14px] text-primary" />
                )}
              </div>
            ))}
          </PopoverContent>
        </Popover>

        {selectedInstruments.length > 0 && (
          <div
            ref={selectedInstrumentsRef}
            className="flex flex-row mt-2 gap-2 overflow-hidden"
          >
            {(() => {
              const containerWidth = inputRef.current?.clientWidth ?? 0;
              const maxVisible =
                containerWidth < 330 ? (containerWidth < 260 ? 1 : 2) : 3;
              const visibleInstruments = selectedInstruments.slice(
                0,
                maxVisible
              );
              const remainingCount = selectedInstruments.length - maxVisible;

              return (
                <>
                  {visibleInstruments.map((instrument) => (
                    <Badge
                      key={instrument}
                      className="px-2 border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-shrink-0"
                    >
                      <span>{instrument}</span>
                      <XIcon
                        className="ml-2 h-[14px] w-[14px] cursor-pointer hover:scale-125"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleOption(instrument);
                        }}
                      />
                    </Badge>
                  ))}
                  {remainingCount > 0 && (
                    <Popover
                      open={remainingInstrumentsOpen}
                      onOpenChange={setRemainingInstrumentsOpen}
                    >
                      <PopoverTrigger asChild>
                        <Badge className="px-2 border-foreground/10 bg-muted hover:bg-secondary/80 text-secondary-foreground flex-shrink-0">
                          +{remainingCount} more{" "}
                          <ChevronDown
                            className={`ml-1 h-[14px] w-[14px] ${
                              remainingInstrumentsOpen ? "rotate-180" : ""
                            } duration-300 transition-all`}
                          />
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent className="p-2 w-fit max-w-[200px] overflow-hidden">
                        <div className="flex flex-wrap gap-2 max-w-full">
                          {selectedInstruments
                            .slice(maxVisible)
                            .map((instrument) => (
                              <Badge
                                key={instrument}
                                className="px-2 border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80 flex-shrink-0 w-fit"
                              >
                                <span>{instrument}</span>
                                <XIcon
                                  className="ml-2 h-[14px] w-[14px] cursor-pointer hover:scale-125"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleOption(instrument);
                                  }}
                                />
                              </Badge>
                            ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    );
  }
);

export default InstrumentSearch;
