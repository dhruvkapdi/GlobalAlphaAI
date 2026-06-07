import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface MiniChartProps {
  data: { date: string; value: number }[] | number[];
  color?: string;
  height?: number;
}

export const MiniChart = ({ data, color = 'hsl(var(--primary))', height = 40 }: MiniChartProps) => {
  const chartData = Array.isArray(data) && typeof data[0] === 'number'
    ? (data as number[]).map((value, i) => ({ value, idx: i }))
    : (data as { date: string; value: number }[]);

  const values = chartData.map((d: any) => d.value);
  const isPositive = values[values.length - 1] >= values[0];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <YAxis domain={['dataMin', 'dataMax']} hide />
        <Line
          type="monotone"
          dataKey="value"
          stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
