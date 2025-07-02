# Deployment to GitHub Pages

This app is configured to deploy automatically to GitHub Pages using GitHub Actions.

## Environment Variables

The app requires the following environment variables for Strava integration:

- `STRAVA_CLIENT_ID` - Your Strava app's Client ID
- `STRAVA_CLIENT_SECRET` - Your Strava app's Client Secret  
- `STRAVA_REDIRECT_URI` - The redirect URI for OAuth (should be your GitHub Pages URL)

## Setup Instructions

1. **Create a Strava App:**
   - Go to https://www.strava.com/settings/api
   - Create a new application
   - Set the redirect URI to: `https://yourusername.github.io/activity-visualization/`
   - Note your Client ID and Client Secret

2. **Configure GitHub Repository:**
   - Go to your repository Settings → Secrets and variables → Actions
   - Add the following repository secrets:
     - `STRAVA_CLIENT_ID`: Your Strava Client ID
     - `STRAVA_CLIENT_SECRET`: Your Strava Client Secret
     - `STRAVA_REDIRECT_URI`: `https://yourusername.github.io/activity-visualization/`

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"
   - The app will deploy automatically when you push to main

4. **Manual Deployment (Alternative):**
   ```bash
   # Set environment variables in your local .env file
   STRAVA_CLIENT_ID=your_client_id
   STRAVA_CLIENT_SECRET=your_client_secret
   STRAVA_REDIRECT_URI=https://yourusername.github.io/activity-visualization/
   
   # Deploy manually
   npm run deploy
   ```

## Important Notes

- Replace `yourusername` with your actual GitHub username in the redirect URI
- The redirect URI in your Strava app settings must exactly match the one in your environment variables
- After deployment, it may take a few minutes for GitHub Pages to update

## GitHub Actions Workflow

The deployment is automated via `.github/workflows/deploy.yml` which:
- Triggers on pushes to main branch
- Builds the React app
- Deploys to GitHub Pages automatically

Your app will be available at: `https://yourusername.github.io/activity-visualization/` 