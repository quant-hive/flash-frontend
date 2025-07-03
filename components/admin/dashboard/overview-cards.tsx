import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OverviewCard {
  title: string;
  value: string;
  description: string;
}

const overviewCards: OverviewCard[] = [
  {
    title: "Total Users",
    value: "345",
    description: "+12% from last month",
  },
  {
    title: "Active Sessions",
    value: "53",
    description: "+19% from last hour",
  },
  {
    title: "New Registrations",
    value: "24",
    description: "+6% from yesterday",
  },
  {
    title: "System Status",
    value: "Operational",
    description: "All systems running normally",
  },
];

export function OverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {overviewCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
