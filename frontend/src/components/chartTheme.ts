// Bars are not animated: the bars of Recharts 3 stayed invisible with the entry
// animation on, and a dashboard reads better when the data is there immediately.

// Chart colors are CSS variables (defined in styles.css for light and dark mode),
// so the charts follow the color scheme without React code.
export const chartColors = {
  singleSeries: 'var(--series-single)',
  failed: 'var(--series-failed)',
  surface: 'var(--surface-chart)',
  gridline: 'var(--gridline)',
  axisText: 'var(--text-muted)'
};

export const axisTickStyle = { fill: chartColors.axisText, fontSize: 12 };

export const tooltipStyle = {
  contentStyle: {
    background: 'var(--surface-chart)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)'
  },
  labelStyle: { color: 'var(--text-primary)', fontWeight: 600 },
  cursor: { fill: 'var(--hover-wash)' }
};
