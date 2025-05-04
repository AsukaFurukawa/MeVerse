# MeVerse - Your Digital Twin

MeVerse is a personalized AI application that learns from your behavior to provide guidance. The application consists of a FastAPI backend and a Next.js/React frontend with ChakraUI components.

## Features

- **Growth Tracker**: Monitor your personal development and patterns
- **Future Simulation**: Predict possible outcomes based on your data
- **Personality Engine**: Understand your traits, behaviors, and tendencies
- **Data Ingestion**: Connect your digital life to improve your MeVerse experience
- **Journal**: Keep track of your thoughts, ideas, and personal narratives

## Running the Application

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Python 3.8+ (for the backend)

### Starting the Frontend (Windows)

#### Option 1: Using the Batch file (Recommended for Windows users)

```batch
# Simply double-click the startup.bat file in File Explorer
# Or run it from Command Prompt:
cd path\to\MeVerse
startup.bat
```

#### Option 2: Using PowerShell

```powershell
# Navigate to the MeVerse directory
cd path\to\MeVerse

# Run the startup script
.\startup.ps1
```

#### Option 3: Manually

```powershell
# Navigate to the frontend directory
cd path\to\MeVerse\app\frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000

### Starting the Backend

```bash
# Navigate to the backend directory
cd path/to/MeVerse/app/backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## Project Structure

- `/app/frontend` - Next.js React frontend
  - `/pages` - Main application pages
  - `/components` - Reusable UI components
  - `/styles` - Global CSS and theme settings
  - `/public` - Static assets like images and favicon
- `/app/backend` - FastAPI Python backend
- `/design` - Design assets and mockups

## Available Endpoints

- `/` - Landing page
- `/dashboard` - Main dashboard with overview of all components
- `/growth` - Growth tracking interface
- `/simulation` - Future simulation interface
- `/personality` - Personality engine interface
- `/data` - Data ingestion interface
- `/journal` - Journal interface
- `/chat` - Chat with your digital twin

## Technologies

- **Frontend**: Next.js, React, ChakraUI, Framer Motion
- **Backend**: FastAPI, Python
- **State Management**: React Context API
- **Animations**: Framer Motion

## Troubleshooting

### If you get errors related to React or Chakra UI:

1. Make sure you have the latest dependencies installed
   ```
   npm install
   ```

2. If you see a "useTabsContext" error, ensure you've wrapped TabPanels with Tabs component

3. For Windows PowerShell execution issues, try using the batch file instead:
   ```
   .\startup.bat
   ```

## License

MIT 