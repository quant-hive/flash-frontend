import { BacktestStatus } from "@/types/backtest-service";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type DashboardContextType = {
  latestBacktest: BacktestStatus | null;
  setLatestBacktest: (data: BacktestStatus | null) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const DashboardContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [latestBacktest, setLatestBacktest] = useState<BacktestStatus | null>(null);

  return (
    <DashboardContext.Provider value={{ latestBacktest, setLatestBacktest }}>
      {children}
    </DashboardContext.Provider>
  );
};

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboardContext must be used within a DashboardContextProvider"
    );
  }
  return context;
}
