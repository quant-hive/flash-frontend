# Backtest Dashboard Integration

This document explains how the backtest dashboard has been integrated with the Flash backend API endpoints for seamless data visualization.

## API Endpoints Used

The dashboard utilizes the following API endpoints:

1. **Trade Reports**
   - Endpoint: `GET /api/backtest/trades/{backtest_id}`
   - Purpose: Retrieves detailed trade information for the backtest, including entry/exit dates, prices, P&L, and returns
   - Component: `TradeReport`

2. **Strategy vs Benchmark Returns**
   - Endpoint: `GET /api/backtest/returns/{backtest_id}`
   - Purpose: Retrieves time series data of both strategy and benchmark returns for comparison
   - Component: `ReturnsComparisonChart`

3. **Drawdown Calculation**
   - Uses the strategy returns from `GET /api/backtest/returns/{backtest_id}`
   - Calculates drawdown as the percentage decline from peak equity
   - Component: `DrawdownChartFromReturns`

## Dashboard Components

The dashboard consists of the following key components:

1. **Overview Tab**
   - Performance metrics summary
   - Strategy vs Benchmark comparison chart
   - Drawdown chart
   - AI strategy insights and improvement suggestions

2. **Trades Tab**
   - Detailed trade report with filtering capabilities
   - Trade statistics (total trades, win rate, P&L, average return)

3. **Performance Tab**
   - Complete metrics table
   - Monthly returns heatmap

4. **Strategy Code Tab**
   - View and debug strategy code

## Implementation Details

### Data Fetching

The dashboard fetches data from the API in the `useEffect` hook within the `BacktestResultsView` component:

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch trade reports
      const trades = await backtestService.getTradeReports(backtestId);
      setTradeData(trades);
      
      // Fetch strategy vs benchmark returns
      const returns = await backtestService.getReturnsData(backtestId);
      setReturnsData(returns);
      
      // ... other data fetching
    } catch (err) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [backtestId, results]);
```

### Drawdown Calculation

The drawdown is calculated from the strategy returns data:

```typescript
function calculateDrawdown(data: ReturnData[]): { date: string; drawdown: number }[] {
  let cumulativeReturn = 1;
  let peakValue = 1;
  
  return data.map(point => {
    // Update cumulative return
    cumulativeReturn = cumulativeReturn * (1 + point.strategy_return);
    
    // Update peak value if we have a new high
    peakValue = Math.max(peakValue, cumulativeReturn);
    
    // Calculate drawdown as the percentage decline from peak
    const drawdown = (cumulativeReturn / peakValue) - 1;
    
    return {
      date: new Date(point.date).toLocaleDateString(),
      drawdown: Math.abs(Math.min(0, drawdown)) // Convert negative values to positive
    };
  });
}
```

## Usage

The backtest dashboard is automatically populated when a backtest is completed. The data flow is as follows:

1. User runs a backtest using the backtest form
2. Backend processes the backtest and stores results
3. Frontend fetches results and displays them in the dashboard
4. Data visualizations are automatically generated from the API responses

## Fallback Mechanism

If the API endpoints fail or return empty data, the dashboard has fallback mechanisms:

1. For older backtests that might not have data in the new API endpoints, the dashboard falls back to parsing CSV data
2. Error states are properly handled and displayed to the user
3. Loading states are shown during data fetching

## Future Improvements

1. Add export functionality for charts and reports
2. Implement position sizing optimization visualization
3. Add regime analysis based on benchmark performance
4. Enhance trade filtering and sorting capabilities 