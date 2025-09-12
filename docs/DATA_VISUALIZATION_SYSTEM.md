# Data Visualization System Documentation

This document provides comprehensive documentation for the data visualization mechanisms in the Flash Frontend application, focusing on financial charts and performance metrics visualization.

## Table of Contents

- [Data Visualization System Documentation](#data-visualization-system-documentation)
  - [Table of Contents](#table-of-contents)
  - [Architecture Overview](#architecture-overview)
  - [Chart Libraries](#chart-libraries)
  - [Visualization Components](#visualization-components)
    - [Returns Comparison Chart](#returns-comparison-chart)
    - [Drawdown Charts](#drawdown-charts)
    - [Monthly Returns Heatmap](#monthly-returns-heatmap)
    - [Trade Reports](#trade-reports)
  - [Data Processing Pipeline](#data-processing-pipeline)
  - [Chart Configurations](#chart-configurations)
  - [Responsive Design](#responsive-design)
  - [Theme Integration](#theme-integration)
  - [Performance Optimization](#performance-optimization)
  - [Usage Examples](#usage-examples)

## Architecture Overview

The visualization system is built around multiple chart libraries and custom components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Raw API Data  │────│  Data Processor │────│  Chart Component│
│   (Backend)     │    │  (Transform)    │    │  (Visualization)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐               │
         │              │  Theme Provider │               │
         │              │  (Dark/Light)   │               │
         │              └─────────────────┘               │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Responsive     │
                    │  Container      │
                    └─────────────────┘
```

## Chart Libraries

### Primary Libraries

1. **Recharts**: For line charts, area charts, and interactive components
2. **ApexCharts**: For heatmaps and advanced visualizations
3. **Chart.js**: Legacy support for some chart types

### Library Selection Criteria

- **Recharts**: Primary choice for React integration, good TypeScript support
- **ApexCharts**: Best for heatmaps and complex visualizations
- **Chart.js**: Fallback for specific chart types

## Visualization Components

### Returns Comparison Chart

**Location**: `components/dashboard/backtest/returns-comparison-chart/index.tsx`

Displays strategy performance vs benchmark returns over time.

**Features**:

- Cumulative returns calculation
- Interactive tooltips
- Custom time range filtering
- Responsive design
- Theme-aware styling

```typescript
interface ReturnsComparisonChartProps {
  data: ReturnData[];
}

interface ReturnData {
  id: number;
  date: string;
  strategy_return: number;
  benchmark_return: number;
}
```

**Data Processing**:

```typescript
// Calculate cumulative returns
const cumulativeData = data.reduce((acc, current, index) => {
  if (index === 0) {
    acc.push({
      date: new Date(current.date).toLocaleDateString(),
      strategy: (1 + current.strategy_return) * 100 - 100,
      benchmark: (1 + current.benchmark_return) * 100 - 100,
    });
    return acc;
  }

  const prevCumulative = acc[index - 1];
  acc.push({
    date: new Date(current.date).toLocaleDateString(),
    strategy:
      ((1 + prevCumulative.strategy / 100) * (1 + current.strategy_return) -
        1) *
      100,
    benchmark:
      ((1 + prevCumulative.benchmark / 100) * (1 + current.benchmark_return) -
        1) *
      100,
  });
  return acc;
}, []);
```

### Drawdown Charts

Multiple implementations for different use cases:

#### Standard Drawdown Chart

**Location**: `components/dashboard/backtest/drawdown-chart/index.tsx`

Basic drawdown visualization with pre-calculated drawdown data.

#### Drawdown from Returns

**Location**: `components/dashboard/backtest/drawdown-chart-from-returns/index.tsx`

Calculates drawdown dynamically from returns data.

**Calculation Algorithm**:

```typescript
function calculateDrawdown(
  data: ReturnData[]
): { date: string; drawdown: number }[] {
  let cumulativeReturn = 1;
  let peakValue = 1;

  return data.map((point) => {
    // Update cumulative return
    cumulativeReturn = cumulativeReturn * (1 + point.strategy_return);

    // Update peak value if we have a new high
    peakValue = Math.max(peakValue, cumulativeReturn);

    // Calculate drawdown as the percentage decline from peak
    const drawdown = cumulativeReturn / peakValue - 1;

    return {
      date: new Date(point.date).toLocaleDateString(),
      drawdown: Math.abs(Math.min(0, drawdown)), // Convert negative values to positive
    };
  });
}
```

#### Advanced Drawdown Chart

**Location**: `components/dashboard/backtest/new-drawdown-chrt-from-returns/index.tsx`

Enhanced version with:

- Custom date range filtering
- Interactive settings panel
- Grid line controls
- Label visibility toggles

### Monthly Returns Heatmap

**Location**: `components/dashboard/backtest/monthly-returns-heatmap/index.tsx`

Displays monthly returns in a color-coded heatmap format.

**Features**:

- Color-coded performance indicators
- Responsive grid layout
- Interactive tooltips
- ApexCharts integration

**Data Structure**:

```typescript
interface MonthlyReturnsHeatmapProps {
  returnsData: ReturnData[];
}

// Processed data format
const heatmapOptions = {
  chart: { type: "heatmap" },
  plotOptions: {
    heatmap: {
      colorScale: {
        ranges: [
          { from: -20, to: -5, color: "#FF4560", name: "loss" },
          { from: -5, to: 0, color: "#FEB019", name: "small loss" },
          { from: 0, to: 5, color: "#00E396", name: "small gain" },
          { from: 5, to: 20, color: "#008FFB", name: "gain" },
        ],
      },
    },
  },
};
```

### Trade Reports

**Location**: `components/dashboard/backtest/trade-report/index.tsx`

Interactive table displaying individual trade details.

**Features**:

- Search and filtering
- Performance pagination (1000+ trades)
- Summary statistics
- Sortable columns
- Performance metrics

```typescript
interface TradeReportProps {
  trades: Trade[];
}

interface Trade {
  id: number;
  ticker: string;
  entry_date: string;
  exit_date: string;
  trade_type: string;
  entry_price: number;
  exit_price: number;
  pnl: number;
  returns_percentage: number;
  position_size: number;
}
```

## Data Processing Pipeline

### 1. Data Fetching

```typescript
// Fetch data from API
const fetchReturnsData = async (backtestId: string) => {
  try {
    const returns = await backtestService.getReturnsData(backtestId);
    setReturnsData(returns);
  } catch (error) {
    console.error("Error fetching returns data:", error);
  }
};
```

### 2. Data Transformation

```typescript
// Transform raw data for chart consumption
const chartData = data.map((point) => ({
  date: new Date(point.date).toLocaleDateString(),
  strategy: point.strategy_return * 100, // Convert to percentage
  benchmark: point.benchmark_return * 100,
}));
```

### 3. Chart Rendering

```typescript
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={cumulativeData}>
    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
    <XAxis dataKey="date" />
    <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
    <Tooltip content={<CustomTooltip />} />
    <Line dataKey="strategy" stroke="#84B869" strokeWidth={3} />
    <Line dataKey="benchmark" stroke="#229EC4" strokeWidth={3} />
  </LineChart>
</ResponsiveContainer>
```

## Chart Configurations

### Common Chart Options

```typescript
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
    tooltip: { mode: "index" as const, intersect: false },
  },
  scales: {
    x: { ticks: { maxTicksLimit: 10 } },
    y: { beginAtZero: false },
  },
};

const drawdownChartOptions = {
  ...chartOptions,
  scales: {
    ...chartOptions.scales,
    y: { beginAtZero: false, reverse: true },
  },
};
```

### Custom Tooltips

```typescript
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-2">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-sm">
            <span className="text-blue-500">●</span> Strategy:{" "}
            {payload[0].value.toFixed(2)}%
          </p>
          <p className="text-sm">
            <span className="text-orange-500">●</span> Benchmark:{" "}
            {payload[1].value.toFixed(2)}%
          </p>
        </CardContent>
      </Card>
    );
  }
  return null;
};
```

## Responsive Design

### Container Components

```typescript
<ResponsiveContainer width="100%" height="100%">
  {/* Chart component */}
</ResponsiveContainer>
```

### Breakpoint Handling

```typescript
const chartOptions = {
  responsive: [
    {
      breakpoint: 768,
      options: {
        dataLabels: { enabled: false },
        legend: { position: "bottom" },
      },
    },
  ],
};
```

### Mobile Optimizations

- Reduced data point density on small screens
- Simplified tooltips for touch interfaces
- Adjusted chart margins and spacing
- Disabled complex interactions on mobile

## Theme Integration

### Dark/Light Mode Support

```typescript
import { useTheme } from "next-themes";

const ChartComponent = () => {
  const { theme } = useTheme();

  const strokeColor = theme === "dark" ? "#3b82f6" : "#2563eb";
  const gridColor = theme === "dark" ? "#374151" : "#e5e7eb";

  return (
    <LineChart>
      <CartesianGrid stroke={gridColor} />
      <Line stroke={strokeColor} />
    </LineChart>
  );
};
```

### Theme-Aware Colors

```typescript
const getThemeColors = (theme: string) => ({
  strategy: theme === "dark" ? "#84B869" : "#22c55e",
  benchmark: theme === "dark" ? "#229EC4" : "#3b82f6",
  drawdown: theme === "dark" ? "#ef4444" : "#dc2626",
  grid: theme === "dark" ? "#374151" : "#e5e7eb",
  text: theme === "dark" ? "#f3f4f6" : "#111827",
});
```

## Performance Optimization

### Data Limiting

```typescript
// Limit displayed trades for performance
const displayTrades = useMemo(() => {
  return filteredTrades.slice(0, 1000); // Limit to 1000 rows
}, [filteredTrades]);
```

### Memoization

```typescript
// Memoize expensive calculations
const cumulativeData = useMemo(() => {
  return calculateCumulativeReturns(data);
}, [data]);

const drawdownData = useMemo(() => {
  return calculateDrawdown(data);
}, [data]);
```

### Debounced Search

```typescript
// Debounce search input for better performance
const [searchQuery, setSearchQuery] = useState("");
const [debouncedQuery, setDebouncedQuery] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(searchQuery);
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);
```

### Lazy Loading

```typescript
// Dynamic imports for chart libraries
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
```

## Usage Examples

### Basic Chart Implementation

```typescript
import { ReturnsComparisonChart } from "@/components/dashboard/backtest/returns-comparison-chart";

function BacktestResults({ returnsData }: { returnsData: ReturnData[] }) {
  return (
    <div className="space-y-4">
      <ReturnsComparisonChart data={returnsData} />
    </div>
  );
}
```

### Chart with Settings Panel

```typescript
import { DrawdownChartFromReturns } from "@/components/dashboard/backtest/new-drawdown-chrt-from-returns";

function AdvancedChart({ data }: { data: ReturnData[] }) {
  return (
    <div className="h-96">
      <DrawdownChartFromReturns data={data} />
    </div>
  );
}
```

### Responsive Chart Container

```typescript
function ChartContainer({ children }: { children: React.ReactNode }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 md:h-96">{children}</div>
      </CardContent>
    </Card>
  );
}
```

### Custom Data Processing

```typescript
const processChartData = (rawData: ReturnData[]) => {
  // Filter data by date range
  const filtered = rawData.filter((point) => {
    const date = new Date(point.date);
    return date >= startDate && date <= endDate;
  });

  // Calculate cumulative returns
  return calculateCumulativeReturns(filtered);
};
```

This visualization system provides a comprehensive set of charts and components for displaying financial data with excellent performance, responsive design, and theme integration capabilities.
