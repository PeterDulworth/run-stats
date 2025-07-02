import React, { useEffect, useState } from 'react';
import { stravaService } from '../services/stravaService';
import type { StravaTokenResponse } from '../services/stravaService';

interface AuthCallbackProps {
  onAuthSuccess: (tokenData: StravaTokenResponse) => void;
  onAuthError: (error: string) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthSuccess, onAuthError }) => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          onAuthError(`Authorization failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          onAuthError('No authorization code received');
          return;
        }

        // Exchange code for token
        const tokenData = await stravaService.exchangeCodeForToken(code);
        
        setStatus('success');
        onAuthSuccess(tokenData);
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/');
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        onAuthError('Failed to exchange authorization code for token');
      }
    };

    handleCallback();
  }, [onAuthSuccess, onAuthError]);

  return (
    <div className="auth-callback">
      {status === 'processing' && (
        <div className="callback-processing">
          <div className="loading-spinner"></div>
          <h2>Connecting to Strava...</h2>
          <p>Please wait while we complete the authorization process.</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="callback-success">
          <h2>✅ Successfully connected!</h2>
          <p>Redirecting to your activities...</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="callback-error">
          <h2>❌ Connection failed</h2>
          <p>There was an issue connecting to Strava. Please try again.</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback; 