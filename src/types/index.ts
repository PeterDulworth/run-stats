import type { StravaActivity } from '../services/stravaService';

export interface WeekData {
  weekStart: Date;
  weekEnd: Date;
  totalDistance: number;
  totalMiles: number;
  activityCount: number;
  runCount: number;
  activities: StravaActivity[];
} 