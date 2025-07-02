import React from 'react';
import { stravaService } from '../services/stravaService';

interface StravaAuthProps {
  onAuthStart: () => void;
}

const StravaAuth: React.FC<StravaAuthProps> = ({ onAuthStart }) => {
  const handleAuth = () => {
    onAuthStart();
    const authUrl = stravaService.getAuthorizationUrl();
    window.location.href = authUrl;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🏃‍♂️ Activity Visualization</h1>
        <p>Connect your Strava account to visualize your running activities</p>
        
        <div className="warning-box">
          <h3>⚠️ Important Notice</h3>
          <p>
            Due to recent Strava API changes (November 2024), this app can only display 
            <strong> your own activity data</strong> to you. Data sharing and aggregation 
            features are now restricted by Strava's new policies.
          </p>
        </div>

        <button 
          className="strava-connect-btn" 
          onClick={handleAuth}
        >
          <span>🔗</span>
          Connect with Strava
        </button>
        
        <div className="setup-instructions">
          <h3>Setup Instructions:</h3>
          <ol>
            <li>Register your app at <a href="https://www.strava.com/settings/api" target="_blank" rel="noopener noreferrer">Strava API Settings</a></li>
            <li>Set your Authorization Callback Domain to: <code>localhost</code></li>
            <li>Update your <code>.env</code> file with your Client ID and Secret</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default StravaAuth; 