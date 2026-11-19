import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { RunStatistics } from '../api/fetchRunStatistics';
import { axisTickStyle, chartColors, tooltipStyle } from './chartTheme';

type RunsPerDayChartProps = {
  runsPerDay: RunStatistics['runsPerDay'];
};

// Days are UTC dates (YYYY-MM-DD) from the backend, so they are formatted in UTC too.
const dayFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const formatDay = (day: string): string => dayFormat.format(new Date(day));

export const RunsPerDayChart = ({ runsPerDay }: RunsPerDayChartProps) => (
  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={runsPerDay} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
      <CartesianGrid vertical={false} stroke={chartColors.gridline} />
      <XAxis dataKey="day" tickFormatter={formatDay} tick={axisTickStyle} tickLine={false} minTickGap={16} />
      <YAxis allowDecimals={false} tick={axisTickStyle} tickLine={false} axisLine={false} />
      <Tooltip {...tooltipStyle} labelFormatter={(day) => formatDay(String(day))} />
      <Bar isAnimationActive={false} dataKey="runs" name="Runs" fill={chartColors.singleSeries} radius={[4, 4, 0, 0]} maxBarSize={32} />
    </BarChart>
  </ResponsiveContainer>
);
