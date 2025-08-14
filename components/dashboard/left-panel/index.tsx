import BacktestForm from "../backtest/new-form";
import { Card, CardContent } from "@/components/ui/card";

const LeftPanel = () => {
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

      <BacktestForm />
    </div>
  );
};

export default LeftPanel;
