import { Card, CardContent, CardHeader, CardTitle } from "@/components/Shadcn/ui/card";
import type { LucideIcon } from "lucide-react";

type StatCard = {
  title: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  trend?: "up" | "down";
};

type AdminStatCardsProps = {
  items: StatCard[];
};

const AdminStatCards = ({ items }: AdminStatCardsProps) => {
  return (
    <div className="grid gap-4 px-4 sm:grid-cols-2 xl:grid-cols-4 xl:px-6">
      {items.map((item) => (
        <Card key={item.title} className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{item.title}</CardTitle>
            <item.icon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
            <p className="text-xs text-gray-500">
              <span className={item.trend === "down" ? "text-destructive" : "text-emerald-600"}>{item.delta}</span>
              <span className="ml-1 text-muted-foreground">vs last month</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStatCards;
