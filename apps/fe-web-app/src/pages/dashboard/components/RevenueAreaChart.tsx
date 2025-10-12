import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/Shadcn/ui/card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type RevenuePoint = {
  date: string;
  revenue: number;
};

type RevenueAreaChartProps = {
  data: RevenuePoint[];
};

const RevenueAreaChart = ({ data }: RevenueAreaChartProps) => {
  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-gray-900">
            Revenue overview
          </CardTitle>
          <CardDescription>Daily revenue across all bookings.</CardDescription>
        </div>
        <div className="text-sm text-gray-500">
          Total revenue:{' '}
          <span className="font-semibold text-gray-900">
            $
            {data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d10009" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#d10009" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="#6b7280"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="#6b7280"
            />
            <Tooltip
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 40px rgba(15, 23, 42, 0.1)',
              }}
              labelStyle={{ color: '#0f172a', fontWeight: 600 }}
              formatter={(value: number) => [
                `$${value.toLocaleString()}`,
                'Revenue',
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#d10009"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueAreaChart;
