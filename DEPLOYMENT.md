# Deployment to GitHub Pages

This app is configured to deploy to GitHub Pages using branch-based deployment.

## Environment Variables

The app requires the following environment variables for Strava integration:

- `STRAVA_CLIENT_ID` - Your Strava app's Client ID
- `STRAVA_CLIENT_SECRET` - Your Strava app's Client Secret  
- `STRAVA_REDIRECT_URI` - The redirect URI for OAuth (should be your GitHub Pages URL)

## Setup Instructions

1. **Update Strava callback domain:**
   - Go to https://www.strava.com/settings/api
   - Edit your application
   - Set the *Authorization Callback Domain* to: `peterdulworth.github.io`

2. **Configure local env files:**
   
   Make sure your `.env.local` file does not specify a `STRAVA_REDIRECT_URI`. It should look something like:
   ```bash
   # Strava API Configuration
   VITE_STRAVA_CLIENT_SECRET=...

   # YOU MUST COMMENT THIS OUT BEFORE DEPLOYING
   # VITE_STRAVA_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

4. **Deploy:**
   ```bash
   # Build and deploy to gh-pages branch
   npm run deploy
   ```

## Important Notes

- The redirect URI in your Strava app settings must exactly match the one in your environment variables
- Environment variables must be set locally before building/deploying
- After deployment, it may take a few minutes for GitHub Pages to update
- The `gh-pages` branch is automatically managed - don't edit it manually


Your app will be available at: `https://peterdulworth.github.io/run-stats/` 