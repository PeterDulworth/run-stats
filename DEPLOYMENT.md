# Deployment to GitHub Pages

This app is configured to deploy to GitHub Pages using branch-based deployment.

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

2. **Create Local Environment File:**
   ```bash
   # Create .env file in your project root
   STRAVA_CLIENT_ID=your_client_id
   STRAVA_CLIENT_SECRET=your_client_secret
   STRAVA_REDIRECT_URI=https://yourusername.github.io/activity-visualization/
   ```

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/ (root)`
   - Save

4. **Deploy:**
   ```bash
   # Build and deploy to gh-pages branch
   npm run deploy
   ```

## Deployment Workflow

The deployment process:
1. Builds the React app with Vite
2. Creates/updates the `gh-pages` branch
3. Pushes the built files to the `gh-pages` branch
4. GitHub Pages serves the site from that branch

## Important Notes

- Replace `yourusername` with your actual GitHub username in the redirect URI
- The redirect URI in your Strava app settings must exactly match the one in your environment variables
- Environment variables must be set locally before building/deploying
- After deployment, it may take a few minutes for GitHub Pages to update
- The `gh-pages` branch is automatically managed - don't edit it manually

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Build and deploy to GitHub Pages

Your app will be available at: `https://yourusername.github.io/activity-visualization/` 