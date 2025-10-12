import {
  Activity,
  BatteryCharging,
  Bell,
  Car,
  BarChart3,
  ChevronRight,
  CircleDollarSign,
  Gauge,
  Leaf,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/ui/avatar";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Input } from "@/components/shadcn/ui/input";
import { Progress } from "@/components/shadcn/ui/progress";
import { Separator } from "@/components/shadcn/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import { cn } from "@/utils/utils";
import React from "react";

const navigation = [
  { label: "Overview", icon: Gauge },
  { label: "Fleet", icon: Car },
  { label: "Customers", icon: Users },
  { label: "Charging", icon: BatteryCharging },
  { label: "Maintenance", icon: ShieldCheck },
  { label: "Revenue", icon: CircleDollarSign },
  { label: "Settings", icon: Settings },
];

const summaryCards = [
  {
    title: "Active Rentals",
    value: "128",
    change: "+12.4%",
    description: "vs last month",
    icon: Car,
  },
  {
    title: "Fleet Utilization",
    value: "87%",
    change: "+4.1%",
    description: "In service",
    icon: Gauge,
  },
  {
    title: "Avg. Charge",
    value: "82 kWh",
    change: "-3%",
    description: "per vehicle daily",
    icon: BatteryCharging,
  },
  {
    title: "Monthly Revenue",
    value: "$186k",
    change: "+9.7%",
    description: "from EV fleet",
    icon: CircleDollarSign,
  },
];

const bookingStatusStyles: Record<string, string> = {
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  Completed: "bg-success/10 text-success border-success/20",
  Scheduled: "bg-secondary/10 text-secondary border-secondary/20",
  Delayed: "bg-warning/10 text-warning border-warning/20",
};

const recentBookings = [
  {
    id: "EV-1024",
    customer: "Alex Johnson",
    vehicle: "Tesla Model 3",
    start: "Aug 12, 2024",
    status: "In Progress",
  },
  {
    id: "EV-0998",
    customer: "Priya Singh",
    vehicle: "Nissan Leaf",
    start: "Aug 11, 2024",
    status: "Completed",
  },
  {
    id: "EV-0982",
    customer: "Michael Lee",
    vehicle: "Kia EV6",
    start: "Aug 10, 2024",
    status: "Scheduled",
  },
  {
    id: "EV-0934",
    customer: "Sara Ahmed",
    vehicle: "Hyundai Ioniq 5",
    start: "Aug 08, 2024",
    status: "Delayed",
  },
];

const energyInsights = [
  { label: "Fast Charger Usage", value: 76 },
  { label: "Solar Offset", value: 62 },
  { label: "Home Charging", value: 44 },
];

const topVehicles = [
  {
    model: "Tesla Model 3 Performance",
    utilization: 92,
    efficiency: "5.1 mi/kWh",
  },
  {
    model: "Polestar 2 Long Range",
    utilization: 88,
    efficiency: "4.7 mi/kWh",
  },
  {
    model: "Kia EV6 GT-Line",
    utilization: 85,
    efficiency: "4.5 mi/kWh",
  },
];

const Home: React.FC = () => {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-base-200 text-base-content">
        <aside className="hidden w-64 flex-col border-r border-base-300 bg-base-100/80 backdrop-blur xl:flex">
          <div className="flex h-16 items-center gap-2 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Zap className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-semibold">EV Rental</p>
              <p className="text-xs text-base-content/60">Intelligent fleet hub</p>
            </div>
          </div>
          <Separator className="bg-base-300" />
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => (
              <button
                key={item.label}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  item.label === "Overview"
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                )}
                type="button"
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto space-y-4 px-6 pb-6">
            <Card className="border-none bg-gradient-to-br from-primary/15 via-primary/10 to-secondary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary">Upgrade available</CardTitle>
                <CardDescription className="text-xs text-base-content/70">
                  Unlock predictive maintenance and AI demand forecasting.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button size="sm" className="w-full">
                  Explore Pro Suite
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </CardFooter>
            </Card>
            <div className="rounded-xl border border-dashed border-base-300 bg-base-100/80 p-4 text-xs text-base-content/70">
              <p className="font-semibold text-base-content">Sustainability goal</p>
              <p>Reduce emissions by 35% before Q4 by expanding solar charging.</p>
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between gap-4 border-b border-base-300 bg-base-100/80 px-4 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="xl:hidden">
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Open navigation</span>
              </Button>
              <div>
                <p className="text-sm text-base-content/70">Fleet health</p>
                <h1 className="text-lg font-semibold md:text-xl">Operations dashboard</h1>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
              <div className="relative hidden w-full max-w-xs items-center md:flex">
                <Input
                  type="search"
                  placeholder="Search vehicles, customers, routes..."
                  className="rounded-full border-base-300 bg-base-200/60 pl-10"
                />
                <Sparkles className="absolute left-3 h-4 w-4 text-base-content/50" aria-hidden="true" />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" aria-hidden="true" />
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-warning" />
                    <span className="sr-only">View notifications</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>System alerts</TooltipContent>
              </Tooltip>
              <Avatar className="h-10 w-10 border border-base-300">
                <AvatarImage src="https://i.pravatar.cc/100?img=12" alt="Operations lead" />
                <AvatarFallback>EV</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 space-y-6 overflow-y-auto bg-base-200 px-4 py-6 md:px-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <Card key={card.title} className="border-base-300 bg-base-100/90 shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <CardTitle className="text-sm font-medium text-base-content/70">
                        {card.title}
                      </CardTitle>
                      <p className="text-2xl font-semibold text-base-content">{card.value}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 p-2 text-primary">
                      <card.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-base-content/60">
                      {card.change} {card.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
              <Card className="border-base-300 bg-base-100/90 shadow-sm xl:col-span-2">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Fleet performance</CardTitle>
                    <CardDescription>Live utilization metrics across all depots.</CardDescription>
                  </div>
                  <Tabs defaultValue="utilization" className="w-full sm:w-auto">
                    <TabsList className="grid h-auto grid-cols-3 gap-2 bg-base-200/80 p-1">
                      <TabsTrigger value="utilization" className="rounded-lg">
                        Utilization
                      </TabsTrigger>
                      <TabsTrigger value="efficiency" className="rounded-lg">
                        Efficiency
                      </TabsTrigger>
                      <TabsTrigger value="health" className="rounded-lg">
                        Health
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="utilization" className="mt-6 space-y-4">
                      {topVehicles.map((vehicle) => (
                        <div
                          key={vehicle.model}
                          className="rounded-xl border border-base-200 bg-base-100/80 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-base-content/70">{vehicle.model}</p>
                              <p className="text-lg font-semibold">{vehicle.utilization}% utilization</p>
                            </div>
                            <Badge variant="outline" className="border-primary/20 text-primary">
                              <Activity className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                              Prime status
                            </Badge>
                          </div>
                          <Progress value={vehicle.utilization} className="mt-4" />
                          <p className="mt-2 text-xs text-base-content/60">
                            Energy efficiency: {vehicle.efficiency}
                          </p>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="efficiency" className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-base-200 bg-base-100/80 p-4">
                        <h3 className="text-sm font-semibold">Charging sources</h3>
                        <p className="text-xs text-base-content/60">
                          Distribution of energy usage per charger type.
                        </p>
                        <div className="mt-4 space-y-3">
                          {energyInsights.map((item) => (
                            <div key={item.label}>
                              <div className="flex items-center justify-between text-xs font-medium">
                                <span>{item.label}</span>
                                <span>{item.value}%</span>
                              </div>
                              <Progress value={item.value} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-base-200 bg-base-100/80 p-4">
                        <h3 className="text-sm font-semibold">Energy cost per mile</h3>
                        <div className="mt-4 grid gap-3 text-xs">
                          <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
                            <span>Urban routes</span>
                            <span className="font-semibold text-primary">$0.18</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-secondary/10 px-3 py-2">
                            <span>Highway routes</span>
                            <span className="font-semibold text-secondary">$0.21</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2">
                            <span>Long range</span>
                            <span className="font-semibold text-accent">$0.24</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="health" className="mt-6 space-y-4">
                      <div className="rounded-xl border border-base-200 bg-base-100/80 p-4">
                        <h3 className="text-sm font-semibold">Predictive maintenance</h3>
                        <p className="mt-2 text-xs text-base-content/60">
                          18 vehicles scheduled for service this week. Prioritize battery calibration for high mileage units.
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border border-base-200 bg-base-100/70 p-3">
                            <p className="text-xs text-base-content/60">Battery health</p>
                            <p className="text-lg font-semibold">94%</p>
                            <p className="text-xs text-success">Stable</p>
                          </div>
                          <div className="rounded-lg border border-base-200 bg-base-100/70 p-3">
                            <p className="text-xs text-base-content/60">Tire inspections</p>
                            <p className="text-lg font-semibold">12 pending</p>
                            <p className="text-xs text-warning">Due within 5 days</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>

              <Card className="border-base-300 bg-base-100/90 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    Sustainability index
                    <Badge variant="outline" className="border-accent/30 text-accent">
                      <Leaf className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                      +28% YoY
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Tracking our carbon savings and renewable energy mix.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Carbon offset</p>
                    <p className="text-3xl font-semibold text-base-content">742 tons</p>
                    <p className="text-xs text-base-content/60">Equivalent to planting 34,000 trees.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-base-200 bg-base-100/70 p-3">
                      <p className="text-xs text-base-content/60">Renewable energy mix</p>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span>Solar</span>
                        <span className="font-semibold text-primary">48%</span>
                      </div>
                      <Progress value={48} className="mt-2 h-2" />
                    </div>
                    <div className="rounded-lg border border-base-200 bg-base-100/70 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Wind</span>
                        <span className="font-semibold text-secondary">27%</span>
                      </div>
                      <Progress value={27} className="mt-2 h-2" />
                    </div>
                    <div className="rounded-lg border border-base-200 bg-base-100/70 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Grid (green tariff)</span>
                        <span className="font-semibold text-accent">18%</span>
                      </div>
                      <Progress value={18} className="mt-2 h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-base-content/60">
                  Automatic adjustments enabled to keep emissions below the 2030 target curve.
                </CardFooter>
              </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Card className="border-base-300 bg-base-100/90 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle>Recent bookings</CardTitle>
                    <CardDescription>Real-time rental activity across the network.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="border-base-300">
                    View all
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </CardHeader>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Booking ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Start date</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.id}</TableCell>
                          <TableCell>{booking.customer}</TableCell>
                          <TableCell>{booking.vehicle}</TableCell>
                          <TableCell>{booking.start}</TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className={cn(
                                "inline-flex items-center gap-1 text-xs font-medium",
                                bookingStatusStyles[booking.status] ?? ""
                              )}
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                <Card className="border-base-300 bg-base-100/90 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <div>
                      <CardTitle>Charging network</CardTitle>
                      <CardDescription>Charger availability and queue insights.</CardDescription>
                    </div>
                    <Badge variant="outline" className="border-secondary/30 text-secondary">
                      <BarChart3 className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                      54 stations
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl border border-base-200 bg-base-100/70 p-4">
                      <p className="text-xs text-base-content/60">Avg. queue time</p>
                      <p className="text-2xl font-semibold text-base-content">6.5 min</p>
                      <p className="text-xs text-success">12% faster than last week</p>
                    </div>
                    <div className="grid gap-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Stations at capacity</span>
                        <Badge variant="outline" className="border-warning/30 text-warning">
                          3
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active charging sessions</span>
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          42
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Maintenance alerts</span>
                        <Badge variant="outline" className="border-destructive/30 text-destructive">
                          2
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-base-300 bg-base-100/90 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                      Customer spotlight
                    </CardTitle>
                    <CardDescription>
                      Enterprise partners driving the highest repeat bookings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between rounded-lg border border-base-200 bg-base-100/70 p-3">
                      <div>
                        <p className="font-medium">GreenRide Logistics</p>
                        <p className="text-xs text-base-content/60">42 vehicles subscribed</p>
                      </div>
                      <Badge variant="outline" className="border-success/30 text-success">
                        +18%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-base-200 bg-base-100/70 p-3">
                      <div>
                        <p className="font-medium">CityShare Mobility</p>
                        <p className="text-xs text-base-content/60">Metropolitan shuttle partner</p>
                      </div>
                      <Badge variant="outline" className="border-secondary/30 text-secondary">
                        960 rides
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-base-200 bg-base-100/70 p-3">
                      <div>
                        <p className="font-medium">EcoTour Adventures</p>
                        <p className="text-xs text-base-content/60">Sustainable travel experiences</p>
                      </div>
                      <Badge variant="outline" className="border-accent/30 text-accent">
                        4.9 ★ rating
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-base-content/60">
                    Loyalty automation unlocked 12% uplift in repeat business this quarter.
                  </CardFooter>
                </Card>
              </div>
            </section>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Home;
