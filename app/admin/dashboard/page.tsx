"use client";

import { useAuth } from "@/context/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewCards } from "@/components/admin/dashboard/overview-cards";
import { RecentEvents } from "@/components/admin/dashboard/recent-events";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex flex-col items-start justify-between space-y-2">
        <h1 className="text-2xl tracking-wide">Admin Dashboard</h1>
        <p className="text-muted-text">Welcome back, Admin {user?.name}!</p>
      </div>
      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className="bg-card gap-2">
          <TabsTrigger
            value="organizations"
            className="data-[state=active]:bg-button-focus text-button-foreground hover:bg-button-focus"
          >
            Organizations
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="data-[state=active]:bg-button-focus text-button-foreground hover:bg-button-focus"
          >
            Subscriptions
          </TabsTrigger>
          <TabsTrigger
            value="purchases"
            className="data-[state=active]:bg-button-focus text-button-foreground hover:bg-button-focus"
          >
            Purchases
          </TabsTrigger>
          <TabsTrigger
            value="coupons"
            className="data-[state=active]:bg-button-focus text-button-foreground hover:bg-button-focus"
          >
            Coupons
          </TabsTrigger>
          <TabsTrigger
            value="api_keys"
            className="data-[state=active]:bg-button-focus text-button-foreground hover:bg-button-focus"
          >
            API Keys
          </TabsTrigger>
        </TabsList>
        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Management</CardTitle>
              <CardDescription>
                View and manage all registered organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-text">
                Organizations list will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>Manage user subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-text">
                Subscriptions interface will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchases</CardTitle>
              <CardDescription>Manage user purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-text">
                Purchases interface will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="coupons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coupons</CardTitle>
              <CardDescription>Manage discount coupons</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-text">
                Coupons management interface will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="api_keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for users and applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-text">
                API keys management interface will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
