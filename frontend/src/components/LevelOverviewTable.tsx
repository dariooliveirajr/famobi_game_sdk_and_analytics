import type { LevelOverview } from '../api/fetchRunStatistics';

type LevelOverviewTableProps = {
  runsPlayed: number;
  levelOverviews: LevelOverview[];
};

const wholeNumberFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });
const percentFormat = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 0 });

// Rates and averages are null while a level has no ended run.
const formatPercentOrDash = (value: number | null): string => (value === null ? '–' : percentFormat.format(value));

const formatMillisecondsAsMinutesAndSeconds = (milliseconds: number | null): string => {
  if (milliseconds === null) return '–';
  const totalSeconds = Math.round(milliseconds / 1000);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${Math.floor(totalSeconds / 60)}:${seconds} min`;
};

export const LevelOverviewTable = ({ runsPlayed, levelOverviews }: LevelOverviewTableProps) => (
  <section className="overview-card">
    <div className="overview-total">
      <h2 className="overview-total-label">Total runs played</h2>
      <p className="overview-total-value">{wholeNumberFormat.format(runsPlayed)}</p>
      <p className="overview-explanation">A run is one attempt at one level. Rates and averages count ended runs.</p>
    </div>
    <div className="table-scroll">
      <table className="overview-table">
        <thead>
          <tr>
            <th scope="col">Level</th>
            <th scope="col">Runs</th>
            <th scope="col">Average time spent per run</th>
            <th scope="col">Completed</th>
            <th scope="col">Left</th>
            <th scope="col">Average progress at end</th>
          </tr>
        </thead>
        <tbody>
          {levelOverviews.map((levelOverview) => (
            <tr key={levelOverview.level}>
              <th scope="row">Level {levelOverview.level}</th>
              <td data-label="Runs">{wholeNumberFormat.format(levelOverview.runsPlayed)}</td>
              <td data-label="Average time spent per run">{formatMillisecondsAsMinutesAndSeconds(levelOverview.averageTimeSpentPerRunMs)}</td>
              <td data-label="Completed">{formatPercentOrDash(levelOverview.completedRate)}</td>
              <td data-label="Left">{formatPercentOrDash(levelOverview.leftRate)}</td>
              <td data-label="Average progress at end">{formatPercentOrDash(levelOverview.averageProgressAtEnd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
