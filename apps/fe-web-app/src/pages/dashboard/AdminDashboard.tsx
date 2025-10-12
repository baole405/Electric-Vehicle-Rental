import { addDays, eachDayOfInterval, format, startOfMonth } from 'date-fns';
import {
  BadgeCheck,
  BatteryCharging,
  CalendarIcon,
  Car,
  ChartPie,
  CircleDollarSign,
  Gauge,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Calendar } from '@/components/shadcn/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { cn } from '@/utils/utils';
import AdminStatCards from './components/AdminStatCards';
import RevenueAreaChart from './components/RevenueAreaChart';

const SUMMARY_STATS = [
  { title: 'Active rentals', value: '128', delta: '+12.4%', icon: Car },
  { title: 'Fleet utilization', value: '87%', delta: '+4.1%', icon: Gauge },
  {
    title: 'Avg. charge',
    value: '82 kWh',
    delta: '-3%',
    icon: BatteryCharging,
    trend: 'down' as const,
  },
  {
    title: 'Monthly revenue',
    value: '$186k',
    delta: '+9.7%',
    icon: CircleDollarSign,
  },
];

const RECENT_BOOKINGS = [
  {
    id: 'EV-1024',
    customer: 'Alex Johnson',
    vehicle: 'Tesla Model 3',
    start: 'Aug 12, 2024',
    status: 'In Progress',
  },
  {
    id: 'EV-0998',
    customer: 'Priya Singh',
    vehicle: 'Nissan Leaf',
    start: 'Aug 11, 2024',
    status: 'Completed',
  },
  {
    id: 'EV-0982',
    customer: 'Michael Lee',
    vehicle: 'Kia EV6',
    start: 'Aug 10, 2024',
    status: 'Scheduled',
  },
  {
    id: 'EV-0965',
    customer: 'Sofia Martinez',
    vehicle: 'Hyundai Ioniq 5',
    start: 'Aug 09, 2024',
    status: 'Delayed',
  },
  {
    id: 'EV-0952',
    customer: 'Daniel Wu',
    vehicle: 'VinFast VF8',
    start: 'Aug 09, 2024',
    status: 'Completed',
  },
];

const BOOKING_STATUS_STYLE: Record<string, string> = {
  'In Progress': 'bg-primary/10 text-primary border-primary/20',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Scheduled: 'bg-secondary/10 text-secondary border-secondary/20',
  Delayed: 'bg-amber-100 text-amber-700 border-amber-200',
};

const TOP_COMBOS = [
  { name: 'Weekend Explorer', quantity: 92, revenue: 16400 },
  { name: 'Urban Commute', quantity: 74, revenue: 11100 },
  { name: 'Executive Premium', quantity: 58, revenue: 13900 },
];

const TOP_SNACKS = [
  { name: 'Fast charging add-on', quantity: 142, revenue: 4260 },
  { name: 'Insurance bundle', quantity: 121, revenue: 6050 },
  { name: 'In-car Wi-Fi', quantity: 96, revenue: 2880 },
];

const TOP_VEHICLES = [
  { name: 'Tesla Model 3', tickets: 312, revenue: 87320 },
  { name: 'Kia EV6 GT', tickets: 265, revenue: 70250 },
  { name: 'VinFast VF8 Plus', tickets: 226, revenue: 56400 },
];

const generateRevenueData = (start: Date, end: Date) => {
  const base = [
    { date: '2024-08-01', revenue: 5200 },
    { date: '2024-08-02', revenue: 6100 },
    { date: '2024-08-03', revenue: 6400 },
    { date: '2024-08-04', revenue: 5300 },
    { date: '2024-08-05', revenue: 7200 },
    { date: '2024-08-06', revenue: 7600 },
    { date: '2024-08-07', revenue: 8100 },
    { date: '2024-08-08', revenue: 8800 },
    { date: '2024-08-09', revenue: 9400 },
    { date: '2024-08-10', revenue: 9900 },
    { date: '2024-08-11', revenue: 10400 },
    { date: '2024-08-12', revenue: 11200 },
  ];

  const days = eachDayOfInterval({ start, end });

  return days.map((day) => {
    const existing = base.find(
      (entry) => entry.date === format(day, 'yyyy-MM-dd')
    );
    if (existing) {
      return existing;
    }

    const last = base[base.length - 1];
    const offset = Math.floor(Math.random() * 1200) + 4200;
    const revenue = last ? Math.max(4200, last.revenue - 800 + offset) : offset;
    return {
      date: format(day, 'yyyy-MM-dd'),
      revenue,
    };
  });
};

const AdminDashboard = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(startOfMonth(today));
  const [endDate, setEndDate] = useState<Date>(today);
  const loading = false;

  const revenueData = useMemo(
    () =>
      generateRevenueData(startDate, endDate).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    [startDate, endDate]
  );

  const totalRevenue = useMemo(
    () => revenueData.reduce((sum, item) => sum + item.revenue, 0),
    [revenueData]
  );
  const totalBookings = RECENT_BOOKINGS.length + 85;
  const distinctCustomers = 64;

  const nextMaintenance = useMemo(
    () => [
      {
        vehicle: 'Tesla Model 3',
        dueDate: format(addDays(today, 5), 'MMM dd, yyyy'),
        status: 'Scheduled',
      },
      {
        vehicle: 'VinFast VF8',
        dueDate: format(addDays(today, 12), 'MMM dd, yyyy'),
        status: 'Awaiting parts',
      },
      {
        vehicle: 'Kia EV6 GT',
        dueDate: format(addDays(today, 18), 'MMM dd, yyyy'),
        status: 'Scheduled',
      },
    ],
    [today]
  );

  if (loading) {
    return <LoadingSpinner label="Loading dashboard" fullHeight />;
  }

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-6">
          <div className="px-4 lg:px-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                Operations dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Real-time snapshots of vehicle rentals, charging activity, and
                revenue performance.
              </p>
            </div>
          </div>

          <AdminStatCards items={SUMMARY_STATS} />

          <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Analytics by date range
            </h2>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[200px] justify-start text-left text-sm font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(value) => value && setStartDate(value)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[200px] justify-start text-left text-sm font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick an end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(value) => value && setEndDate(value)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-4 px-4 lg:grid-cols-[2fr,1fr] lg:px-6">
            <RevenueAreaChart data={revenueData} />
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <Users className="h-4 w-4 text-primary" />
                  Customer spotlight
                </CardTitle>
                <CardDescription>
                  Enterprise accounts driving repeat bookings.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-sm text-gray-600">
                <div className="flex items-start justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      EcoFleet Logistics
                    </p>
                    <p className="text-xs text-gray-500">42 active vehicles</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                  >
                    +18%
                  </Badge>
                </div>
                <div className="flex items-start justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div>
                    <p className="font-medium text-gray-900">Metro Mobility</p>
                    <p className="text-xs text-gray-500">
                      City shuttle partner
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary"
                  >
                    960 rentals
                  </Badge>
                </div>
                <div className="flex items-start justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      Adventure Voyages
                    </p>
                    <p className="text-xs text-gray-500">
                      Eco-tour experiences
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-amber-700"
                  >
                    4.9★ rating
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 px-4 lg:grid-cols-3 lg:px-6">
            <Card className="border-gray-200 bg-white shadow-sm lg:col-span-2">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Recent bookings
                  </CardTitle>
                  <CardDescription>
                    Live booking status updated every minute.
                  </CardDescription>
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalBookings} total bookings • {distinctCustomers} customers
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Booking ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Start date</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {RECENT_BOOKINGS.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium text-gray-900">
                          {booking.id}
                        </TableCell>
                        <TableCell>{booking.customer}</TableCell>
                        <TableCell>{booking.vehicle}</TableCell>
                        <TableCell>{booking.start}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              'inline-flex items-center gap-1 text-xs font-medium',
                              BOOKING_STATUS_STYLE[booking.status] ?? ''
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

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <ChartPie className="h-4 w-4 text-primary" />
                  Top combos
                </CardTitle>
                <CardDescription>Ancillary revenue by bundle.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm">
                  <div className="text-3xl font-semibold text-gray-900">
                    ${totalRevenue.toLocaleString()}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Revenue captured since {format(startDate, 'MMM dd')}.
                  </p>
                </div>
                <ul className="space-y-3">
                  {TOP_COMBOS.map((combo, index) => (
                    <li
                      key={combo.name}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {index + 1}. {combo.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {combo.quantity} orders
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        ${combo.revenue.toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 px-4 lg:grid-cols-3 lg:px-6">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  Top add-ons
                </CardTitle>
                <CardDescription>
                  High-margin add-ons this period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TOP_SNACKS.map((snack) => (
                      <TableRow key={snack.name}>
                        <TableCell className="font-medium text-gray-900">
                          {snack.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {snack.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ${snack.revenue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Vehicle performance
                </CardTitle>
                <CardDescription>
                  Revenue per vehicle for the selected range.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead className="text-right">Bookings</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TOP_VEHICLES.map((vehicle) => (
                      <TableRow key={vehicle.name}>
                        <TableCell className="font-medium text-gray-900">
                          {vehicle.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {vehicle.tickets}
                        </TableCell>
                        <TableCell className="text-right">
                          ${vehicle.revenue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Maintenance timeline
                </CardTitle>
                <CardDescription>
                  Upcoming service windows for the fleet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {nextMaintenance.map((item) => (
                  <div
                    key={item.vehicle}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <p className="font-medium text-gray-900">{item.vehicle}</p>
                    <p className="text-xs text-gray-500">{item.dueDate}</p>
                    <Badge
                      variant="outline"
                      className="mt-2 border-gray-200 text-xs text-gray-600"
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

