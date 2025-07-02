import React, { useState, useEffect } from 'react';
import { stravaService, ACTIVITY_TYPES } from './services/stravaService';
import StravaAuth from './components/StravaAuth';
import AuthCallback from './components/AuthCallback';
import ActivitiesList from './components/ActivitiesList';
import WeeklyMileage from './components/WeeklyMileage';
import type { StravaTokenResponse, StravaActivity, StravaAthlete } from './services/stravaService';
import './App.css';

interface AppState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  athlete: StravaAthlete | null;
  activities: StravaActivity[];
  loading: boolean;
  loadingMoreForWeekly: boolean;
  activitiesLoaded: number;
  error: string | null;
  currentView: 'activities' | 'weekly';
}

function App() {
  const [state, setState] = useState<AppState>({
    isAuthenticated: false,
    isAuthenticating: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    athlete: null,
    activities: [],
    loading: false,
    loadingMoreForWeekly: false,
    activitiesLoaded: 0,
    error: null,
    currentView: 'weekly',
  });

  // Check for existing auth on app load
  useEffect(() => {
    const checkExistingAuth = () => {
      const savedAuth = localStorage.getItem('strava_auth');
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          if (authData.expiresAt && !stravaService.isTokenExpired(authData.expiresAt)) {
            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
              expiresAt: authData.expiresAt,
              athlete: authData.athlete,
            }));
          } else {
            // Token expired, try to refresh
            refreshTokenIfNeeded(authData.refreshToken);
          }
        } catch (error) {
          console.error('Error parsing saved auth:', error);
          localStorage.removeItem('strava_auth');
        }
      }
    };

    checkExistingAuth();
  }, []);

  // Load activities when authenticated - load 6 months for default weekly view
  useEffect(() => {
    if (state.isAuthenticated && state.accessToken && !state.loading) {
      // Since weekly is the default view, load 6 months of data initially
      loadMoreActivitiesForWeekly('last 6 months', 0);
    }
  }, [state.isAuthenticated, state.accessToken]);

  // Check if we're on the callback URL
  const isCallback = window.location.search.includes('code=') || window.location.search.includes('error=');

  const refreshTokenIfNeeded = async (refreshToken: string) => {
    try {
      const tokenData = await stravaService.refreshToken(refreshToken);
      handleAuthSuccess(tokenData);
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  const handleAuthStart = () => {
    setState(prev => ({ ...prev, isAuthenticating: true, error: null }));
  };

  const handleAuthSuccess = (tokenData: StravaTokenResponse) => {
    const authData = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_at,
      athlete: tokenData.athlete,
    };

    localStorage.setItem('strava_auth', JSON.stringify(authData));

    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      isAuthenticating: false,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_at,
      athlete: tokenData.athlete,
      error: null,
    }));
  };

  const handleAuthError = (error: string) => {
    setState(prev => ({
      ...prev,
      isAuthenticating: false,
      error,
    }));
  };

  const loadActivities = async (count: number = 30) => {
    if (!state.accessToken) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const activities = await stravaService.getActivities(state.accessToken, 1, count, ACTIVITY_TYPES.RUN);
      setState(prev => ({
        ...prev,
        activities,
        activitiesLoaded: count,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading activities:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load activities. Please try again.',
      }));
    }
  };

  const loadMoreActivitiesForWeekly = async (timePeriod: string = 'last 6 months', timeOffset: number = 0) => {
    if (!state.accessToken) return;

    setState(prev => ({ ...prev, loadingMoreForWeekly: true, error: null }));

    try {
      // Calculate date cutoff based on time period
      const now = new Date();
      let cutoffDate = new Date();
      let maxPages = 2; // Default for short periods

            switch (timePeriod) {
        case 'last month':
          cutoffDate.setDate(now.getDate() - (4 * 7) - (timeOffset * 4 * 7)); // 4 weeks back
          maxPages = 1;
          break;
        case '3 months':
          cutoffDate.setMonth(now.getMonth() - 3 - (timeOffset * 3));
          maxPages = 2;
          break;
        case 'last 6 months':
          cutoffDate.setMonth(now.getMonth() - 6 - (timeOffset * 6));
          maxPages = 5;
          break;
        case 'last year':
          cutoffDate.setDate(now.getDate() - (51 * 7) - (timeOffset * 52 * 7)); // 51 weeks back + offset years
          maxPages = 10;
          break;
        case 'all':
          cutoffDate = new Date(2000, 0, 1); // Far back date
          maxPages = 20; // Load lots of data for all-time
          break;
                 default:
           cutoffDate.setMonth(now.getMonth() - 6 - (timeOffset * 6));
           maxPages = 5;
      }
      
      // Calculate end date for the time period window
      let endDate = new Date(now);
      if (timeOffset > 0) {
        switch (timePeriod) {
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
            endDate.setDate(now.getDate() - (timeOffset * 52 * 7));
            break;
          case 'all':
            // For "all", always go to now
            break;
          default:
            endDate.setMonth(now.getMonth() - (timeOffset * 6));
        }
      }

      // Load activities from multiple pages
      const allActivities: StravaActivity[] = [];
      let page = 1;
      let keepLoading = true;
      
      while (keepLoading && page <= maxPages) {
        const pageActivities = await stravaService.getActivities(
          state.accessToken, 
          page, 
          200, 
          ACTIVITY_TYPES.RUN
        );
        
        if (pageActivities.length === 0) {
          // No more activities available
          keepLoading = false;
          break;
        }
        
        // Filter activities based on selected time period window
        const windowActivities = pageActivities.filter(activity => {
          const activityDate = new Date(activity.start_date_local);
          return activityDate >= cutoffDate && activityDate <= endDate;
        });
        
        allActivities.push(...windowActivities);
        
        // If we got activities older than cutoff, stop loading (unless all-time)
        if (timePeriod !== 'all' && pageActivities.some(activity => 
          new Date(activity.start_date_local) < cutoffDate)) {
          keepLoading = false;
        }
        
        page++;
      }

      setState(prev => ({
        ...prev,
        activities: allActivities,
        activitiesLoaded: allActivities.length,
        loadingMoreForWeekly: false,
      }));
    } catch (error) {
      console.error('Error loading activities for weekly view:', error);
      setState(prev => ({
        ...prev,
        loadingMoreForWeekly: false,
        error: 'Failed to load activities for weekly view.',
      }));
    }
  };

  const logout = () => {
    localStorage.removeItem('strava_auth');
    setState({
      isAuthenticated: false,
      isAuthenticating: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      athlete: null,
      activities: [],
      loading: false,
      loadingMoreForWeekly: false,
      activitiesLoaded: 0,
      error: null,
      currentView: 'weekly',
    });
  };

  const switchView = (view: 'activities' | 'weekly') => {
    setState(prev => ({ ...prev, currentView: view }));
    
    // Load 6 months worth of activities for weekly view
    if (view === 'weekly') {
      // Check if we need to load more activities (either none loaded for weekly or data might be stale)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const hasRecentSixMonthsData = state.activities.length > 0 && 
        state.activities.some(activity => new Date(activity.start_date_local) >= sixMonthsAgo);
      
      if (!hasRecentSixMonthsData || state.activitiesLoaded < 200) {
        loadMoreActivitiesForWeekly('last 6 months', 0);
      }
    }
  };

  // Show callback handling
  if (isCallback) {
    return (
      <div className="App">
        <AuthCallback
          onAuthSuccess={handleAuthSuccess}
          onAuthError={handleAuthError}
        />
      </div>
    );
  }

  // Show authenticated app
  if (state.isAuthenticated && state.athlete) {
    return (
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="site-title">RunTracker</h1>
              
              {/* Navigation Tabs */}
              <div className="header-navigation">
                <button 
                  className={`nav-tab ${state.currentView === 'weekly' ? 'active' : ''}`}
                  onClick={() => switchView('weekly')}
                >
                  📊 Weekly Mileage
                </button>
                <button 
                  className={`nav-tab ${state.currentView === 'activities' ? 'active' : ''}`}
                  onClick={() => switchView('activities')}
                >
                  📱 Recent Activities
                </button>
              </div>
            </div>
            
            <div className="header-right">
              <div className="user-info">
                <img 
                  src={state.athlete.profile_medium} 
                  alt={`${state.athlete.firstname} ${state.athlete.lastname}`}
                  className="profile-pic"
                />
                <div className="user-details">
                  <h2>{state.athlete.firstname} {state.athlete.lastname}</h2>
                  <p>{state.athlete.city}, {state.athlete.state}</p>
                </div>
              </div>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="app-main">
          {state.error && (
            <div className="error-message">
              <p>{state.error}</p>
              <button onClick={() => {
                if (state.currentView === 'weekly') {
                  loadMoreActivitiesForWeekly('last 6 months', 0);
                } else {
                  loadActivities();
                }
              }}>Retry</button>
            </div>
          )}

          {/* Content Views */}
          {state.currentView === 'activities' ? (
            <ActivitiesList 
              activities={state.activities} 
              loading={state.loading} 
            />
          ) : (
            <WeeklyMileage 
              activities={state.activities} 
              loading={state.loading || state.loadingMoreForWeekly}
              onLoadMoreData={loadMoreActivitiesForWeekly}
            />
          )}
        </main>
      </div>
    );
  }

  // Show authentication screen
  return (
    <div className="App">
      <StravaAuth onAuthStart={handleAuthStart} />
      {state.error && (
        <div className="error-message">
          <p>{state.error}</p>
        </div>
      )}
    </div>
  );
}

export default App;
