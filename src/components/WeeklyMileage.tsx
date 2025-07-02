import React from 'react';
import { stravaService } from '../services/stravaService';
import type { StravaActivity } from '../services/stravaService';
import type { WeekData } from '../types';
import TimeNavigation from './TimeNavigation';
import LoadingIndicator from './LoadingIndicator';
import WeeklySummaryStats from './WeeklySummaryStats';
import WeeklyTimelineChart from './WeeklyTimelineChart';
import WeekItem from './WeekItem';

interface WeeklyMileageProps {
  activities: StravaActivity[];
  loading: boolean;
  onLoadMoreData?: (timePeriod: string, timeOffset?: number) => void;
}



const WeeklyMileage: React.FC<WeeklyMileageProps> = ({ activities, loading, onLoadMoreData }) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = React.useState('last 6 months');
  const [timeOffset, setTimeOffset] = React.useState(0); // 0 = current period, 1 = one period back, etc.
  const [pendingTimeOffset, setPendingTimeOffset] = React.useState<number | null>(null); // Tracks navigation requests

  // Update time offset when loading completes
  React.useEffect(() => {
    if (!loading && pendingTimeOffset !== null) {
      setTimeOffset(pendingTimeOffset);
      setPendingTimeOffset(null);
    }
  }, [loading, pendingTimeOffset]);

  // Don't show full loading screen - keep existing data visible during load

  // Helper function to get start of week (Monday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    // Reset time to start of day to avoid timezone issues
    d.setHours(0, 0, 0, 0);
    
    const day = d.getDay();
    // Convert Sunday (0) to 7, then calculate days to subtract to get to Monday
    const daysToSubtract = day === 0 ? 6 : day - 1;
    
    // Create a new date for the Monday of this week
    const monday = new Date(d);
    monday.setDate(d.getDate() - daysToSubtract);
    
    return monday;
  };

  // Helper function to get end of week (Sunday)
  const getWeekEnd = (weekStart: Date): Date => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999); // End of Sunday
    return weekEnd;
  };

  // Group activities by week and day
  const groupActivitiesByWeek = (activitiesToGroup: StravaActivity[]): WeekData[] => {
    const weekMap = new Map<string, WeekData>();

    // First, populate weeks with activities
    activitiesToGroup.forEach(activity => {
      const activityDate = new Date(activity.start_date_local);
      const weekStart = getWeekStart(activityDate);
      const weekEnd = getWeekEnd(weekStart);
      // Create a consistent week key using year and week number
      const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          weekStart,
          weekEnd,
          totalDistance: 0,
          totalMiles: 0,
          activityCount: 0,
          runCount: 0,
          activities: []
        });
      }

      const weekData = weekMap.get(weekKey)!;
      weekData.totalDistance += activity.distance;
      weekData.totalMiles += activity.distance / 1609.344;
      weekData.activityCount += 1;
      if (activity.type.toLowerCase() === 'run') {
        weekData.runCount += 1;
      }
      weekData.activities.push(activity);
    });

    // Now fill in any missing weeks with 0 data for the full time period
    // Calculate the time period boundaries
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedTimePeriod) {
      case 'last month':
        startDate.setDate(now.getDate() - (4 * 7) - (timeOffset * 4 * 7)); // 4 weeks back
        break;
      case '3 months':
        startDate.setMonth(now.getMonth() - 3 - (timeOffset * 3));
        break;
      case 'last 6 months':
        startDate.setMonth(now.getMonth() - 6 - (timeOffset * 6));
        break;
      case 'last year':
        startDate.setDate(now.getDate() - (51 * 7) - (timeOffset * 365)); // 51 weeks back, gives us 52 weeks total including current week
        break;
      case 'all':
        // For "all", use the earliest activity date if we have activities, otherwise go back 2 years
        if (weekMap.size > 0) {
          const sortedWeeks = Array.from(weekMap.values()).sort((a, b) => 
            a.weekStart.getTime() - b.weekStart.getTime()
          );
          startDate = new Date(sortedWeeks[0].weekStart);
        } else {
          startDate.setFullYear(now.getFullYear() - 2);
        }
        break;
      default:
        startDate.setMonth(now.getMonth() - 6 - (timeOffset * 6)); // Default to last 6 months
    }

    // Calculate the end date based on the time offset
    let endDate = new Date(now);
    
    if (timeOffset > 0) {
      switch (selectedTimePeriod) {
        case 'last month':
          endDate.setDate(now.getDate() - (timeOffset * 4 * 7)); // 4 weeks * timeOffset
          break;
        case '3 months':
          endDate.setMonth(now.getMonth() - (timeOffset * 3));
          break;
        case 'last 6 months':
          endDate.setMonth(now.getMonth() - (timeOffset * 6));
          break;
        case 'last year':
          endDate.setDate(now.getDate() - (timeOffset * 365));
          break;
        case 'all':
          // For "all", always go to now
          break;
        default:
          endDate.setMonth(now.getMonth() - (timeOffset * 6));
      }
    }

    // Generate all weeks from start date to end date
    const firstWeek = getWeekStart(startDate);
    const lastWeek = getWeekStart(endDate);
    
    const currentWeek = new Date(firstWeek);
    while (currentWeek <= lastWeek) {
      const weekStart = getWeekStart(currentWeek);
      const weekEnd = getWeekEnd(weekStart);
      const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          weekStart,
          weekEnd,
          totalDistance: 0,
          totalMiles: 0,
          activityCount: 0,
          runCount: 0,
          activities: []
        });
      }
      
      // Move to next week
      currentWeek.setDate(currentWeek.getDate() + 7);
    }

    // Convert to array and sort by week (most recent first)
    return Array.from(weekMap.values()).sort((a, b) => 
      b.weekStart.getTime() - a.weekStart.getTime()
    );
  };

  // Group activities by day within a week for the graph
  const getWeeklyGraph = (week: WeekData): number[] => {
    const dailyMiles = new Array(7).fill(0); // Monday to Sunday
    
    week.activities.forEach(activity => {
      const activityDate = new Date(activity.start_date_local);
      const dayOfWeek = activityDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      // Convert to Monday-first index: Monday=0, Tuesday=1, ..., Sunday=6
      const mondayFirstIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      dailyMiles[mondayFirstIndex] += activity.distance / 1609.344;
    });
    
    return dailyMiles;
  };

  // Filter activities based on selected time period and time offset
  const getFilteredActivities = (): StravaActivity[] => {
    // For time navigation, we should show all loaded activities since the API call
    // already filtered them correctly based on the time period and offset
    return activities;
  };

  // Handle time period change
  const handleTimePeriodChange = (timePeriod: string) => {
    setSelectedTimePeriod(timePeriod);
    setTimeOffset(0); // Reset to current period when changing time period
    setPendingTimeOffset(null); // Clear any pending navigation
    if (onLoadMoreData) {
      onLoadMoreData(timePeriod, 0);
    }
  };

  // Navigate backward in time
  const goBackward = () => {
    const newOffset = timeOffset + 1;
    setPendingTimeOffset(newOffset);
    if (onLoadMoreData) {
      onLoadMoreData(selectedTimePeriod, newOffset);
    }
  };

  // Navigate forward in time
  const goForward = () => {
    if (timeOffset > 0) {
      const newOffset = timeOffset - 1;
      setPendingTimeOffset(newOffset);
      if (onLoadMoreData) {
        onLoadMoreData(selectedTimePeriod, newOffset);
      }
    }
  };





  const filteredActivities = getFilteredActivities();
  const weeklyData = groupActivitiesByWeek(filteredActivities);

  // Calculate stats
  const totalWeeks = weeklyData.length;
  const totalMiles = weeklyData.reduce((sum, week) => sum + week.totalMiles, 0);
  const averageWeeklyMiles = totalWeeks > 0 ? totalMiles / totalWeeks : 0;
  const highestWeekMiles = weeklyData.length > 0 ? Math.max(...weeklyData.map(w => w.totalMiles)) : 0;
  const totalRuns = weeklyData.reduce((sum, week) => sum + week.runCount, 0);
  const averageWeeklyRuns = totalWeeks > 0 ? totalRuns / totalWeeks : 0;
  
  // Calculate max daily miles across all weeks for consistent scaling
  const maxDayMiles = weeklyData.reduce((max, week) => {
    const dailyMiles = getWeeklyGraph(week);
    const weekMax = Math.max(...dailyMiles);
    return Math.max(max, weekMax);
  }, 0);



  if (activities.length === 0) {
    return (
      <div className="no-activities">
        <h3>No activities found</h3>
        <p>Go for a run and sync with Strava to see your weekly mileage!</p>
      </div>
    );
  }

  return (
          <div className="weekly-mileage-container">
        <div className="weekly-mileage-header">
          <h2>Weekly Mileage</h2>
          
          <TimeNavigation
            selectedTimePeriod={selectedTimePeriod}
            timeOffset={timeOffset}
            onTimePeriodChange={handleTimePeriodChange}
            onGoBackward={goBackward}
            onGoForward={goForward}
            disabled={loading || pendingTimeOffset !== null}
          />

          {/* Loading Indicator */}
          {(loading || pendingTimeOffset !== null) && (
            <LoadingIndicator />
          )}
        </div>
        
        {/* Summary Stats */}
        <WeeklySummaryStats
          totalMiles={totalMiles}
          averageWeeklyMiles={averageWeeklyMiles}
          highestWeekMiles={highestWeekMiles}
          totalWeeks={totalWeeks}
          totalRuns={totalRuns}
          averageWeeklyRuns={averageWeeklyRuns}
        />

        {/* Weekly Timeline Graph */}
        {weeklyData.length > 0 && (
          <WeeklyTimelineChart 
            weeklyData={weeklyData} 
            selectedTimePeriod={selectedTimePeriod}
          />
        )}

        {/* Weekly Breakdown */}
        <div className="weekly-breakdown">
          <h3>Weekly Breakdown</h3>
          <div className="weeks-list">
            {weeklyData.map((week) => (
              <WeekItem
                key={week.weekStart.toISOString()}
                week={week}
                maxDayMiles={maxDayMiles}
                highestWeekMiles={highestWeekMiles}
                getWeeklyGraph={getWeeklyGraph}
              />
            ))}
          </div>
        </div>
      </div>
  );
};

export default WeeklyMileage; 