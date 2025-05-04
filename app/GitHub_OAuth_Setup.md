# Setting up GitHub OAuth for MeVerse

To enable GitHub login in MeVerse, you need to set up a GitHub OAuth application and configure your environment variables.

## Step 1: Create a GitHub OAuth Application

1. Go to your GitHub account settings page
2. Navigate to **Developer settings** → **OAuth Apps** → **New OAuth App**
3. Fill in the application details:
   - **Application name**: MeVerse Digital Twin
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:8000/api/auth/github/callback`
4. Click **Register application**
5. After registration, you'll see your Client ID
6. Click **Generate a new client secret** to create a client secret

## Step 2: Configure Environment Variables

Create a `.env` file in the `MeVerse/app` directory with the following content:

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/api/auth/github/callback
FRONTEND_URL=http://localhost:3000
```

Replace `your_github_client_id` and `your_github_client_secret` with the values from your GitHub OAuth application.

## Step 3: Restart the Server

After setting up the environment variables, restart your MeVerse application:

1. Stop any running instances
2. Start the application again using the provided scripts:

```powershell
# On Windows
.\start.ps1

# On Unix/Linux/macOS
python start.py
```

## Troubleshooting

If GitHub login still doesn't work:

1. Check the server logs for any error messages
2. Verify that your OAuth application settings are correct
3. Ensure the callback URL exactly matches the one in your GitHub application settings
4. Make sure your `.env` file is properly formatted and in the correct location

## Running in Production

For production environments, you'll need to:

1. Create a separate GitHub OAuth application with your production URLs
2. Set environment variables in your production environment
3. Use HTTPS for security 