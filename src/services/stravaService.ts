import axios from 'axios';

const STRAVA_BASE_URL = 'https://www.strava.com/api/v3';
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

// Common Strava activity types
export const ACTIVITY_TYPES = {
  RUN: 'Run',
  RIDE: 'Ride',
  SWIM: 'Swim',
  HIKE: 'Hike',
  WALK: 'Walk',
  ALPINE_SKI: 'AlpineSki',
  NORDIC_SKI: 'NordicSki',
  SNOWBOARD: 'Snowboard',
  WORKOUT: 'Workout',
  YOGA: 'Yoga',
} as const;

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  average_speed: number;
  max_speed: number;
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  elev_high?: number;
  elev_low?: number;
  map?: {
    id: string;
    summary_polyline: string;
  };
}

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
  city: string;
  state: string;
  country: string;
}

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

class StravaService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = import.meta.env.STRAVA_CLIENT_ID || '';
    this.clientSecret = import.meta.env.STRAVA_CLIENT_SECRET || '';
    this.redirectUri = import.meta.env.STRAVA_REDIRECT_URI || '';
  }

  // Generate authorization URL
  getAuthorizationUrl(): string {
    const scopes = 'read,activity:read_all'; // Note: Limited scopes due to new API restrictions
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      approval_prompt: 'force',
      scope: scopes,
    });
    
    return `${STRAVA_AUTH_URL}?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
    try {
      const response = await axios.post(STRAVA_TOKEN_URL, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<StravaTokenResponse> {
    try {
      const response = await axios.post(STRAVA_TOKEN_URL, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });
      
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  // Get authenticated athlete's activities
  async getActivities(
    accessToken: string, 
    page = 1, 
    perPage = 30, 
    activityType?: string
  ): Promise<StravaActivity[]> {
    try {
      const response = await axios.get(`${STRAVA_BASE_URL}/athlete/activities`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page,
          per_page: perPage,
        },
      });
      
      let activities: StravaActivity[] = response.data;

      // Filter by activity type if provided
      if (activityType) {
        const filterType = activityType.toLowerCase();
        activities = activities.filter(activity => 
          activity.type.toLowerCase() === filterType
        );
      }
      
      return activities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  // Get detailed activity data
  async getActivity(accessToken: string, activityId: number): Promise<StravaActivity> {
    try {
      const response = await axios.get(`${STRAVA_BASE_URL}/activities/${activityId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching activity details:', error);
      throw error;
    }
  }

  // Get authenticated athlete info
  async getAthlete(accessToken: string): Promise<StravaAthlete> {
    try {
      const response = await axios.get(`${STRAVA_BASE_URL}/athlete`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching athlete data:', error);
      throw error;
    }
  }

  // Helper to check if token is expired
  isTokenExpired(expiresAt: number): boolean {
    return Date.now() / 1000 > expiresAt;
  }

  // Helper to format distance
  formatDistance(meters: number): string {
    const miles = meters / 1609.344;
    return `${miles.toFixed(2)} mi`;
  }

  // Helper to format time
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Helper to format pace (min/mile)
  formatPace(metersPerSecond: number): string {
    const secondsPerMile = 1609.344 / metersPerSecond;
    const minutes = Math.floor(secondsPerMile / 60);
    const seconds = Math.round(secondsPerMile % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /mi`;
  }

  // Convenience methods for specific activity types
  async getRunningActivities(accessToken: string, page = 1, perPage = 30): Promise<StravaActivity[]> {
    return this.getActivities(accessToken, page, perPage, ACTIVITY_TYPES.RUN);
  }

  async getCyclingActivities(accessToken: string, page = 1, perPage = 30): Promise<StravaActivity[]> {
    return this.getActivities(accessToken, page, perPage, ACTIVITY_TYPES.RIDE);
  }

  async getSwimmingActivities(accessToken: string, page = 1, perPage = 30): Promise<StravaActivity[]> {
    return this.getActivities(accessToken, page, perPage, ACTIVITY_TYPES.SWIM);
  }
}

export const stravaService = new StravaService(); 