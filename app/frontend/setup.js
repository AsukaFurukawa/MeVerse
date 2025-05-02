#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.magenta}
╔══════════════════════════════════════════╗
║            MeVerse Frontend              ║
║     Your Digital Twin User Interface     ║
╚══════════════════════════════════════════╝
${colors.reset}`);

// Function to execute shell commands
function executeCommand(command) {
  try {
    console.log(`${colors.cyan}> ${command}${colors.reset}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    return false;
  }
}

// Check if .env file exists, create if not
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log(`${colors.yellow}Creating .env.local file...${colors.reset}`);
  fs.writeFileSync(
    envPath,
    'NEXT_PUBLIC_API_URL=http://localhost:8000/api\n'
  );
  console.log(`${colors.green}Created .env.local file${colors.reset}`);
}

// Install dependencies
console.log(`${colors.blue}Installing dependencies...${colors.reset}`);
if (executeCommand('npm install')) {
  console.log(`${colors.green}Dependencies installed successfully!${colors.reset}`);
} else {
  console.log(`${colors.yellow}Failed to install dependencies. Please run 'npm install' manually.${colors.reset}`);
  process.exit(1);
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
  console.log(`${colors.green}Created public directory${colors.reset}`);

  // Create a simple favicon
  const faviconPath = path.join(publicDir, 'favicon.ico');
  // Here we would normally create or copy a favicon, but we'll just log it
  console.log(`${colors.yellow}You should add a favicon.ico to the public directory${colors.reset}`);
}

// Create necessary directories
const dirs = ['components', 'pages', 'styles', 'lib', 'context', 'hooks'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`${colors.green}Created ${dir} directory${colors.reset}`);
  }
});

console.log(`\n${colors.green}Setup complete!${colors.reset}`);
console.log(`\nYou can now start the development server with:`);
console.log(`${colors.cyan}npm run dev${colors.reset}`);
console.log(`\nThe application will be available at: ${colors.blue}http://localhost:3000${colors.reset}`); 