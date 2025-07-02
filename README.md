# 🏃‍♂️ Strava Activity Visualization

A React TypeScript application for visualizing your running activities from Strava.

## ⚠️ Important Notice - Recent Strava API Changes

**Due to Strava's API policy changes (November 2024), this application has significant limitations:**

- ✅ Can display **your own activity data** to you
- ❌ Cannot share data with other users
- ❌ Cannot use data for AI/ML training
- ❌ Cannot aggregate data across multiple users
- ❌ Many third-party integrations are now broken

**Recommendation:** Consider using [Garmin Connect API](https://developer.garmin.com/gc-developer-program/) instead for more stable, business-friendly data access.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Strava account with activities
- Strava API application credentials

### 1. Set Up Strava API Application

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application with these settings:
   - **Application Name:** Your choice (e.g., "Activity Visualizer")
   - **Category:** Choose appropriate category
   - **Club:** Leave blank (unless you have one)
   - **Website:** `http://localhost:5173`
   - **Authorization Callback Domain:** `localhost`
   - **Description:** Brief description of your app

3. Note down your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Strava API Configuration
VITE_STRAVA_CLIENT_ID=your_client_id_here
VITE_STRAVA_CLIENT_SECRET=your_client_secret_here
VITE_STRAVA_REDIRECT_URI=http://localhost:5173/auth/callback
```

Replace `your_client_id_here` and `your_client_secret_here` with your actual Strava API credentials.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 How It Works

### Authentication Flow

1. **Authorization:** User clicks "Connect with Strava" → Redirected to Strava OAuth
2. **Callback:** Strava redirects back with authorization code
3. **Token Exchange:** App exchanges code for access token
4. **Data Access:** App uses token to fetch user's activities

### Data Storage

- **Access tokens** are stored in browser localStorage
- **Token refresh** is handled automatically
- **No server-side storage** - purely client-side app

### API Calls Made

- `GET /athlete` - Get authenticated user info
- `GET /athlete/activities` - Get user's recent activities (max 30)
- `GET /activities/{id}` - Get detailed activity data (if needed)

## 📊 Features

### Current Features

- ✅ Strava OAuth authentication
- ✅ Display recent activities (runs, rides, etc.)
- ✅ Show activity metrics (distance, time, pace, elevation, heart rate)
- ✅ Responsive design for mobile/desktop
- ✅ Activity type icons and formatting
- ✅ Token refresh handling
- ✅ Error handling and loading states

### Potential Future Features (Limited by API)

- 📊 Activity charts and graphs
- 🗺️ Route visualization (if polyline data available)
- 📈 Performance trends
- 🏃‍♂️ Running-specific analytics

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Axios** for HTTP requests
- **CSS Grid/Flexbox** for responsive layout
- **Local Storage** for token persistence

## 📁 Project Structure

```
src/
├── components/
│   ├── StravaAuth.tsx        # Authentication component
│   ├── AuthCallback.tsx      # OAuth callback handler
│   └── ActivitiesList.tsx    # Activities display component
├── services/
│   └── stravaService.ts      # Strava API service
├── App.tsx                   # Main application component
├── App.css                   # Styles
└── main.tsx                  # Entry point
```

## 🔒 Security Considerations

### Client-Side Security

- **Client Secret Exposure:** The client secret is exposed in the browser (unavoidable in pure client-side apps)
- **Token Storage:** Access tokens are stored in localStorage (consider sessionStorage for higher security)
- **HTTPS Required:** Use HTTPS in production to protect token transmission

### Strava API Limitations

- **Rate Limits:** 200 requests per 15 minutes, 2,000 per day
- **Scope Restrictions:** Limited to user's own data only
- **Data Usage:** Cannot use data for AI/ML training
- **Sharing Restrictions:** Cannot display user data to other users

## 🚨 Error Handling

The app handles various error scenarios:

- **Authentication failures**
- **API rate limiting**
- **Network connectivity issues**
- **Token expiration**
- **Invalid API responses**

## 🎨 Customization

### Styling

The app uses modern CSS with:
- CSS Grid for responsive layouts
- Custom CSS variables for colors
- Hover effects and animations
- Mobile-first responsive design

### Activity Types

The app recognizes these activity types:
- 🏃‍♂️ Run
- 🚴‍♂️ Ride
- 🏊‍♂️ Swim
- 🚶‍♂️ Walk
- 🥾 Hike

Add more in `ActivitiesList.tsx` → `getActivityEmoji()` function.

## 🐛 Troubleshooting

### Common Issues

1. **"Client ID not found"**
   - Check your `.env` file has correct `VITE_STRAVA_CLIENT_ID`
   - Restart development server after changing `.env`

2. **"Authorization failed"**
   - Verify your Strava app's Authorization Callback Domain is set to `localhost`
   - Check the redirect URI matches exactly

3. **"Rate limit exceeded"**
   - Wait 15 minutes for rate limit reset
   - Strava allows 200 requests per 15 minutes

4. **"No activities found"**
   - Make sure you have activities in your Strava account
   - Check activity privacy settings (must be visible to the app)

### Debug Mode

Enable browser dev tools to see:
- Console logs for API calls
- Network tab for HTTP requests
- Application tab for localStorage data

## 📚 Additional Resources

- [Strava API Documentation](https://developers.strava.com/docs/)
- [Strava Developer Community](https://communityhub.strava.com/developers-api-7)
- [React TypeScript Documentation](https://react-typescript-cheatsheet.netlify.app/)

## ⚖️ License

This project is for educational/personal use only. Respect Strava's API terms of service and rate limits.

---

**Note:** Due to recent Strava API changes, consider this more of a learning project than a production-ready application. For serious fitness data applications, consider using Garmin Connect API or direct device integrations instead.
