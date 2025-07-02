# Strava Activity Visualization

Try it out: https://peterdulworth.github.io/run-stats/

A React TypeScript application for visualizing your running activities from Strava.

## Running Locally

### 1. Set Up Strava API Application
> If you already know your strava client_id, and client_secret, you can skip this step.
1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application with these settings:
   - **Application Name:** Your choice (e.g., "Activity Visualizer")
   - **Category:** Choose appropriate category
   - **Club:** Leave blank (unless you have one)
   - **Website:** `http://localhost:5173`
   - **Authorization Callback Domain:** `localhost`
   - **Description:** Brief description of your app

3. Record your `client_id` and `client_secret`.

Or, if you already have an app, make sure the callback domain is pointed to `localhost`:

1. **Update Strava callback domain:**
   - Go to https://www.strava.com/settings/api
   - Edit your application
   - Set the *Authorization Callback Domain* to: `localhost`

### 2. Configure Environment Variables

Create a `.env.local` file in the project root (ignored by git):

```env
# Strava API Configuration
VITE_STRAVA_CLIENT_SECRET=...

# YOU MUST COMMENT THIS OUT BEFORE DEPLOYING
VITE_STRAVA_REDIRECT_URI=http://localhost:5173/auth/callback
```

Replace `YOUR_CLIENT_ID_HERE` and `YOUR_CLIENT_SECRET_HERE` with your actual Strava API credentials.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Deploying

See [DEPLOYMENT.md](DEPLOYMENT.md)

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Build and deploy to GitHub Pages


## How It Works

### Authentication Flow

1. **Authorization:** User clicks "Connect with Strava" → Redirected to Strava OAuth
2. **Callback:** Strava redirects back with authorization code
3. **Token Exchange:** App exchanges code for access token
4. **Data Access:** App uses token to fetch user's activities

### Data Storage

- **Access tokens** are stored in browser localStorage
- **Token refresh** is handled automatically
- **No server-side storage** - purely client-side app


### Strava API Limitations

- **Rate Limits:** 200 requests per 15 minutes, 2,000 per day
- **Scope Restrictions:** Limited to user's own data only
- **Data Usage:** Cannot use data for AI/ML training
- **Sharing Restrictions:** Cannot display user data to other users

## Additional Resources

- [Strava API Documentation](https://developers.strava.com/docs/)
- [Strava Developer Community](https://communityhub.strava.com/developers-api-7)