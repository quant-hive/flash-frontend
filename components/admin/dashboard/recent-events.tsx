import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const events = [
  { title: "System update completed", time: "2 hours ago" },
  { title: "New user registered", time: "4 hours ago" },
  { title: "Database backup completed", time: "6 hours ago" },
];

export function RecentEvents() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Events</CardTitle>
        <CardDescription>Latest system activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, idx) => (
            <div className="flex items-start gap-4" key={idx}>
              <div className="grid gap-1">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
