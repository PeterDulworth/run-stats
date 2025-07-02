import React from 'react';
import DailyBreakdownChart from './DailyBreakdownChart';
import { stravaService } from '../services/stravaService';
import type { WeekData } from '../types';

interface WeekItemProps {
  week: WeekData;
  maxDayMiles: number;
  highestWeekMiles: number;
  getWeeklyGraph: (week: WeekData) => number[];
}

const WeekItem: React.FC<WeekItemProps> = ({ 
  week, 
  maxDayMiles, 
  highestWeekMiles, 
  getWeeklyGraph 
}) => {
  const formatWeekRange = (weekStart: Date, weekEnd: Date): string => {
    const startStr = weekStart.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endStr = weekEnd.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    return `${startStr} - ${endStr}`;
  };

  const getBarWidth = (miles: number): number => {
    return highestWeekMiles > 0 ? (miles / highestWeekMiles) * 100 : 0;
  };

  return (
    <div className="week-item">
      <div className="week-header">
        <div className="week-info">
          <span className="week-range">{formatWeekRange(week.weekStart, week.weekEnd)}</span>
          <span className="week-activities">
            {week.activityCount} activities ({week.runCount} runs)
          </span>
        </div>
        <div className="week-distance">
          <span className="distance-value">{week.totalMiles.toFixed(1)} mi</span>
        </div>
      </div>
      
      <div className="week-bar-container">
        <div 
          className="week-bar" 
          style={{ width: `${getBarWidth(week.totalMiles)}%` }}
        />
      </div>

      {/* Daily Mileage Graph */}
      <div className="week-graph-section">
        <h4>Daily Breakdown</h4>
        <DailyBreakdownChart 
          dailyMiles={getWeeklyGraph(week)} 
          maxDayMiles={maxDayMiles}
        />
      </div>
      
      <div className="week-activities-preview">
        {week.activities.slice(0, 3).map(activity => (
          <div key={activity.id} className="activity-preview">
            <span className="activity-type-icon">
              {activity.type.toLowerCase() === 'run' ? '🏃‍♂️' : 
               activity.type.toLowerCase() === 'ride' ? '🚴‍♂️' : '🏃‍♂️'}
            </span>
            <span className="activity-name">{activity.name}</span>
            <span className="activity-distance">
              {stravaService.formatDistance(activity.distance)}
            </span>
          </div>
        ))}
        {week.activities.length > 3 && (
          <div className="activity-preview more-activities">
            <span>+{week.activities.length - 3} more</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeekItem; 