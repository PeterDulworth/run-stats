import React from 'react';

interface WeeklySummaryStatsProps {
  totalMiles: number;
  averageWeeklyMiles: number;
  highestWeekMiles: number;
  totalWeeks: number;
  totalRuns: number;
  averageWeeklyRuns: number;
}

const WeeklySummaryStats: React.FC<WeeklySummaryStatsProps> = ({
  totalMiles,
  averageWeeklyMiles,
  highestWeekMiles,
  totalWeeks,
  totalRuns,
  averageWeeklyRuns
}) => {
  return (
    <div className="mileage-summary">
      <div className="summary-card">
        <span className="summary-label">Total Distance</span>
        <span className="summary-value">{totalMiles.toFixed(1)} mi</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Average Weekly</span>
        <span className="summary-value">{averageWeeklyMiles.toFixed(1)} mi</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Highest Week</span>
        <span className="summary-value">{highestWeekMiles.toFixed(1)} mi</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Total Weeks</span>
        <span className="summary-value">{totalWeeks}</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Total Runs</span>
        <span className="summary-value">{totalRuns}</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Average Weekly Runs</span>
        <span className="summary-value">{averageWeeklyRuns.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default WeeklySummaryStats; 