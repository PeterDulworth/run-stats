import React from 'react';
import { stravaService } from '../services/stravaService';
import type { StravaActivity } from '../services/stravaService';

interface ActivitiesListProps {
  activities: StravaActivity[];
  loading: boolean;
}

const ActivitiesList: React.FC<ActivitiesListProps> = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your activities...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="no-activities">
        <h3>No activities found</h3>
        <p>Go for a run and sync with Strava to see your activities here!</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'run':
        return '🏃‍♂️';
      case 'ride':
        return '🚴‍♂️';
      case 'swim':
        return '🏊‍♂️';
      case 'walk':
        return '🚶‍♂️';
      case 'hike':
        return '🥾';
      default:
        return '🏃‍♂️';
    }
  };

  return (
    <div className="activities-container">
      <h2>Your Recent Activities</h2>
      <div className="activities-grid">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-card">
            <div className="activity-header">
              <span className="activity-emoji">{getActivityEmoji(activity.type)}</span>
              <div className="activity-title">
                <h3>{activity.name}</h3>
                <p className="activity-date">{formatDate(activity.start_date_local)}</p>
              </div>
              <span className="activity-type">{activity.type}</span>
            </div>
            
            <div className="activity-stats">
              <div className="stat">
                <span className="stat-label">Distance</span>
                <span className="stat-value">{stravaService.formatDistance(activity.distance)}</span>
              </div>
              
              <div className="stat">
                <span className="stat-label">Time</span>
                <span className="stat-value">{stravaService.formatTime(activity.moving_time)}</span>
              </div>
              
              <div className="stat">
                <span className="stat-label">Pace</span>
                <span className="stat-value">{stravaService.formatPace(activity.average_speed)}</span>
              </div>
              
              {activity.total_elevation_gain > 0 && (
                <div className="stat">
                  <span className="stat-label">Elevation</span>
                  <span className="stat-value">{Math.round(activity.total_elevation_gain)}m</span>
                </div>
              )}
              
              {activity.has_heartrate && activity.average_heartrate && (
                <div className="stat">
                  <span className="stat-label">Avg HR</span>
                  <span className="stat-value">{Math.round(activity.average_heartrate)} bpm</span>
                </div>
              )}
            </div>
            
            {activity.map?.summary_polyline && (
              <div className="activity-map">
                <p>📍 Route data available</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivitiesList; 