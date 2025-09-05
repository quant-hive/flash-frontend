import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Trade } from "@/types/backtest-service";
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate } from "date-fns";
import { formatIndianNumber } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectGroup, SelectLabel } from "@radix-ui/react-select";
import { Row } from "react-day-picker";

const dummyTrades: Trade[] = [
  {
    id: 208,
    ticker: "ADANIGREEN",
    entry_date: "2024-01-24T00:00:00",
    exit_date: "2024-01-25T00:00:00",
    trade_type: "LONG",
    entry_price: 1689.6379011230467,
    exit_price: 4937.6666883338385,
    position_size: 1.8752017182838656,
    pnl: 6090.7091628131375,
    returns_percentage: 192.23224011795273,
  },
  {
    id: 209,
    ticker: "ADANIGREEN",
    entry_date: "2024-01-29T00:00:00",
    exit_date: "2024-02-02T00:00:00",
    trade_type: "LONG",
    entry_price: 1686.634901123047,
    exit_price: 1680.2181243896478,
    position_size: 3.722597917878264,
    pnl: -23.887079707241828,
    returns_percentage: -0.3804484734145297,
  },
  {
    id: 210,
    ticker: "ADANIGREEN",
    entry_date: "2024-02-05T00:00:00",
    exit_date: "2024-02-06T00:00:00",
    trade_type: "LONG",
    entry_price: 1685.6839999999993,
    exit_price: 1666.9813743896484,
    position_size: 3.694452832968548,
    pnl: -69.09596817011092,
    returns_percentage: -1.1094977237934844,
  },
  {
    id: 211,
    ticker: "ADANIGREEN",
    entry_date: "2024-02-07T00:00:00",
    exit_date: "2024-03-13T00:00:00",
    trade_type: "LONG",
    entry_price: 1751.2495000000001,
    exit_price: 1895.2028756103512,
    position_size: 3.5726713236076515,
    pnl: 514.2980969796222,
    returns_percentage: 8.220038070551961,
  },
  {
    id: 212,
    ticker: "ADANIGREEN",
    entry_date: "2024-04-02T00:00:00",
    exit_date: "2024-04-16T00:00:00",
    trade_type: "LONG",
    entry_price: 1892.8909999999998,
    exit_price: 5602.97216378567,
    position_size: 1.68101272557368,
    pnl: 6236.6936492349205,
    returns_percentage: 196.00078207280137,
  },
  {
    id: 213,
    ticker: "ADANIGREEN",
    entry_date: "2024-05-15T00:00:00",
    exit_date: "2024-06-03T00:00:00",
    trade_type: "LONG",
    entry_price: 1791.7899999999997,
    exit_price: 17038.975254191355,
    position_size: 0.8533895782908789,
    pnl: 13011.788994197268,
    returns_percentage: 850.9471117815904,
  },
  {
    id: 208,
    ticker: "SUJAL",
    entry_date: "2024-01-24T00:00:00",
    exit_date: "2024-01-25T00:00:00",
    trade_type: "LONG",
    entry_price: 1689.6379011230467,
    exit_price: 4937.6666883338385,
    position_size: 1.8752017182838656,
    pnl: 6090.7091628131375,
    returns_percentage: 192.23224011795273,
  },
  {
    id: 209,
    ticker: "SUJAL",
    entry_date: "2024-01-29T00:00:00",
    exit_date: "2024-02-02T00:00:00",
    trade_type: "LONG",
    entry_price: 1686.634901123047,
    exit_price: 1680.2181243896478,
    position_size: 3.722597917878264,
    pnl: -23.887079707241828,
    returns_percentage: -0.3804484734145297,
  },
  {
    id: 210,
    ticker: "SUJAL",
    entry_date: "2024-02-05T00:00:00",
    exit_date: "2024-02-06T00:00:00",
    trade_type: "LONG",
    entry_price: 1685.6839999999993,
    exit_price: 1666.9813743896484,
    position_size: 3.694452832968548,
    pnl: -69.09596817011092,
    returns_percentage: -1.1094977237934844,
  },
  {
    id: 211,
    ticker: "SUJAL",
    entry_date: "2024-02-07T00:00:00",
    exit_date: "2024-03-13T00:00:00",
    trade_type: "LONG",
    entry_price: 1751.2495000000001,
    exit_price: 1895.2028756103512,
    position_size: 3.5726713236076515,
    pnl: 514.2980969796222,
    returns_percentage: 8.220038070551961,
  },
  {
    id: 212,
    ticker: "ADANIGREEN",
    entry_date: "2024-04-02T00:00:00",
    exit_date: "2024-04-16T00:00:00",
    trade_type: "LONG",
    entry_price: 1892.8909999999998,
    exit_price: 5602.97216378567,
    position_size: 1.68101272557368,
    pnl: 6236.6936492349205,
    returns_percentage: 196.00078207280137,
  },
  {
    id: 213,
    ticker: "ADANIGREEN",
    entry_date: "2024-05-15T00:00:00",
    exit_date: "2024-06-03T00:00:00",
    trade_type: "LONG",
    entry_price: 1791.7899999999997,
    exit_price: 17038.975254191355,
    position_size: 0.8533895782908789,
    pnl: 13011.788994197268,
    returns_percentage: 850.9471117815904,
  },
];

const TradeTable = ({ data }: { data: Trade[] }) => {
  const pageSize = 6;
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [tradeTypeFilter, setTradeTypeFilter] = useState<string>("FILTER");

  // Memoize unique tickers once (data is static here). If using live data, switch to [data].
  const uniqueTickers = useMemo(() => {
    return Array.from(new Set(data.map((trade) => trade.ticker)));
  }, []);

  const columns: ColumnDef<Trade>[] = useMemo(
    () => [
      {
        accessorKey: "ticker",
        header: ({ column }) => {
          const filterVal = column.getFilterValue();
          const selected =
            (typeof filterVal === "string" && filterVal) || "all";
          return (
            <Select
              value={selected}
              onValueChange={(value) => {
                if (value === "all") {
                  column.setFilterValue(undefined);
                } else {
                  column.setFilterValue(value);
                }
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="bg-transparent focus:ring-0 focus:outline-0 focus:ring-offset-0 border-none h-full p-0 [&_svg]:hidden">
                <div className="flex flex-col items-start justify-end mt-4">
                  <p className="text-primary text-lg">Ticker</p>

                  <div
                    className="flex items-center mt-2 justify-center h-[14px] bg-[#97EA74] min-w-[80px] px-6 text-[11px] font-semibold tracking-widest text-[#1D6001]"
                    style={{
                      clipPath:
                        "polygon(8px 0%, calc(100% - 8px) 0%, 100% 100%, 0% 100%)",
                    }}
                  >
                    {selected === "all" ? "ALL" : selected}
                  </div>
                </div>
              </SelectTrigger>

              <SelectContent
                align="start"
                sideOffset={12}
                className="text-primary"
              >
                <SelectItem value="all">All</SelectItem>
                {uniqueTickers.map((ticker) => (
                  <SelectItem key={ticker} value={ticker}>
                    {ticker}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "trade_type",
        header: ({ column }) => (
          <button
            onClick={() => {
              const currentFilter = tradeTypeFilter;
              let newFilter;
              if (currentFilter === "FILTER") {
                newFilter = "LONG";
              } else if (currentFilter === "LONG") {
                newFilter = "SHORT";
              } else {
                newFilter = "LONG";
              }
              setTradeTypeFilter(newFilter);

              if (newFilter === "FILTER") {
                column.setFilterValue(undefined);
              } else {
                column.setFilterValue(newFilter);
              }
            }}
            className="flex flex-col items-start justify-end mt-4"
          >
            <p className="text-primary text-lg">Type</p>

            <div
              className="flex items-center mt-2 justify-center h-[14px] bg-[#97EA74] min-w-[80px] px-6 text-[11px] font-semibold tracking-widest text-[#1D6001]"
              style={{
                clipPath:
                  "polygon(8px 0%, calc(100% - 8px) 0%, 100% 100%, 0% 100%)",
              }}
            >
              <div>{tradeTypeFilter}</div>
            </div>
          </button>
        ),
        cell: ({ row }) => <span>{row.original.trade_type}</span>,
      },
      {
        accessorKey: "entry_date",
        header: ({ column }) => (
          <p className="text-primary text-lg">Entry Date</p>
        ),
        cell: ({ row }) => (
          <span>
            {formatDate(new Date(row.original.entry_date), "dd/MM/yyyy")}
          </span>
        ),
      },
      {
        accessorKey: "exit_date",
        header: ({ column }) => (
          <p className="text-primary text-lg">Exit Date</p>
        ),
        cell: ({ row }) => (
          <span>
            {formatDate(new Date(row.original.exit_date), "dd/MM/yyyy")}
          </span>
        ),
      },
      {
        accessorKey: "entry_price",
        header: ({ column }) => (
          <p className="text-primary text-lg">Entry Price</p>
        ),
        cell: ({ row }) => (
          <span>Rs. {formatIndianNumber(row.original.entry_price)}</span>
        ),
      },
      {
        accessorKey: "exit_price",
        header: ({ column }) => (
          <p className="text-primary text-lg">Exit Price</p>
        ),
        cell: ({ row }) => (
          <span>Rs. {formatIndianNumber(row.original.exit_price)}</span>
        ),
      },
      {
        accessorKey: "pnl",
        header: ({ column }) => (
          <button
            onClick={() => {
              column.toggleSorting(column.getIsSorted() === "asc");
            }}
            className="flex flex-col items-start justify-end mt-4"
          >
            <p className="text-primary text-lg">P&L</p>

            <div
              className="flex items-center mt-2 justify-center h-[14px] bg-[#97EA74] min-w-[80px] px-6 text-[11px] font-semibold tracking-widest text-[#1D6001]"
              style={{
                clipPath:
                  "polygon(8px 0%, calc(100% - 8px) 0%, 100% 100%, 0% 100%)",
              }}
            >
              <div>
                {column.getIsSorted() === "asc"
                  ? "LOW"
                  : column.getIsSorted() === "desc"
                  ? "HIGH"
                  : "FILTER"}
              </div>
            </div>
          </button>
        ),
        cell: ({ row }) => (
          <span
            className={`text-transparent bg-clip-text ${
              row.original.pnl >= 0 ? "bg-green_gradient_text" : "bg-red-500"
            }`}
          >
            Rs. {formatIndianNumber(row.original.pnl)}
          </span>
        ),
      },
      {
        accessorKey: "returns_percentage",
        header: ({ column }) => (
          <p className="text-primary text-lg">Returns %</p>
        ),
        cell: ({ row }) => (
          <span
            className={`text-transparent bg-clip-text ${
              row.original.returns_percentage >= 0
                ? "bg-green_gradient_text"
                : "bg-red-500"
            }`}
          >
            {row.original.returns_percentage.toFixed(2)}%
          </span>
        ),
      },
    ],
    [uniqueTickers, tradeTypeFilter]
  );

  const table = useReactTable<Trade>({
    data: data,
    columns,
    state: {
      pagination: { pageSize, pageIndex },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater(table.getState().pagination)
          : updater;
      setPageIndex(newState.pageIndex);
    },
  });

  return (
    <>
      <div className="overflow-hidden rounded-xl border-2 border-[#2A2A2C]">
        <Table className="w-full">
          <TableHeader className="bg-[#060606]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-0">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0
              ? table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-t-2 border-b-2 border-[#2A2A2C] font-light"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : // Show empty rows when no data
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow
                    key={`empty-${index}`}
                    className="border-none hover:bg-transparent"
                  >
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-6"
                    >
                      {index === Math.floor(pageSize / 2 - 1) ? (
                        <span className="text-[#909092]">
                          No trades available
                        </span>
                      ) : (
                        ""
                      )}
                    </TableCell>
                  </TableRow>
                ))}

            {/* Fill remaining rows if less than pageSize */}
            {table.getRowModel().rows.length > 0 &&
              table.getRowModel().rows.length < pageSize &&
              Array.from({
                length: pageSize - table.getRowModel().rows.length,
              }).map((_, index) => (
                <TableRow
                  key={`filler-${index}`}
                  className="border-none hover:bg-transparent"
                >
                  <TableCell colSpan={columns.length} className="py-6">
                    {/* Empty filler row */}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-transparent mt-4 mr-6">
        <div className="flex flex-row justify-end items-center gap-3">
          <p className="text-[#909092] text-sm">
            Showing Page <span className="text-primary">{pageIndex + 1}</span>{" "}
            of <span className="text-primary">{table.getPageCount()}</span>
          </p>

          <div className="w-0.5 h-6 bg-[#2A2A2C]" />

          <div className="flex flex-row text-[#909092] gap-4">
            <Button
              variant={"ghost"}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-0 h-0"
            >
              previous
            </Button>

            <Button
              variant={"ghost"}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-0 h-0"
            >
              next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TradeTable;
