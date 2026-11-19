import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { FailedRunsOfLevel, RunStatistics } from '../api/fetchRunStatistics';
import { axisTickStyle, chartColors, tooltipStyle } from './chartTheme';

type FailedRunsPerLevelChartProps = {
  failedRunsPerLevel: RunStatistics['failedRunsPerLevel'];
};

const percentFormat = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 0 });

const formatFailedRunsWithRate = (failedRuns: unknown, _name: unknown, item: { payload?: FailedRunsOfLevel }) => {
  const failedRate = item.payload?.failedRate;
  const rate = failedRate === null || failedRate === undefined ? '' : ` (${percentFormat.format(failedRate)} of ended runs)`;
  return [`${failedRuns}${rate}`, 'Failed runs'];
};

export const FailedRunsPerLevelChart = ({ failedRunsPerLevel }: FailedRunsPerLevelChartProps) => (
  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={failedRunsPerLevel} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
      <CartesianGrid vertical={false} stroke={chartColors.gridline} />
      <XAxis dataKey="level" tickFormatter={(level) => `Level ${level}`} tick={axisTickStyle} tickLine={false} />
      <YAxis allowDecimals={false} tick={axisTickStyle} tickLine={false} axisLine={false} />
      <Tooltip {...tooltipStyle} formatter={formatFailedRunsWithRate} labelFormatter={(level) => `Level ${level}`} />
      <Bar isAnimationActive={false} dataKey="failedRuns" name="Failed runs" fill={chartColors.failed} radius={[4, 4, 0, 0]} maxBarSize={72} />
    </BarChart>
  </ResponsiveContainer>
);
