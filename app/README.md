# MeVerse Digital Twin

MeVerse is a digital twin application that learns from your behavior, predicts your future actions, and helps guide your personal growth.

## Features

- User authentication with password and GitHub OAuth
- Personal journal for tracking thoughts and progress
- Growth monitoring dashboard
- Future simulation and prediction
- Data connections to various sources

## Setup

### Prerequisites

- Python 3.9+
- Node.js 16+
- MongoDB (optional, file-based fallback available)

### Installation

1. Clone the repository
2. Install backend dependencies:

```bash
cd MeVerse/app
pip install -r requirements.txt
```

3. Install frontend dependencies:

```bash
cd frontend
npm install
```

### Setting up GitHub OAuth (optional)

1. Create a GitHub OAuth application at https://github.com/settings/developers
2. Set the callback URL to `http://localhost:8000/api/auth/github/callback`
3. Create a `.env` file in the `MeVerse/app` directory with the following:

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/api/auth/github/callback
FRONTEND_URL=http://localhost:3000
```

For detailed instructions on setting up GitHub OAuth, see the [GitHub_OAuth_Setup.md](GitHub_OAuth_Setup.md) file.

### Running the application

#### Option 1: Using start scripts

**On Windows:**
```powershell
cd MeVerse/app
.\start.ps1
```

**For older PowerShell versions (Windows):**

If you encounter errors with `&&` operators in PowerShell, use the run_command.ps1 helper script:

```powershell
cd MeVerse/app
# Start backend
.\run_command.ps1 -Directory "." -Command "python -m app.main"

# In a new PowerShell window
cd MeVerse/app
.\run_command.ps1 -Directory ".\frontend" -Command "npm run dev"
```

**On Unix/Linux/macOS:**
```bash
cd MeVerse/app
python start.py
```

#### Option 2: Starting servers manually

Start the backend server:

```bash
cd MeVerse/app
python -m app.main
```

Start the frontend development server:

```bash
cd MeVerse/app/frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Default Admin User

The system automatically creates an admin user on startup:
- Username: meverse_admin
- Password: DigitalTwin2023!

## Architecture

- Backend: FastAPI (Python)
- Frontend: Next.js with Chakra UI
- Database: MongoDB with file-based fallback 