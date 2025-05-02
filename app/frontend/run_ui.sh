#!/bin/bash

echo "======================================="
echo "MeVerse UI Development Server"
echo "======================================="
echo ""
echo "Starting development server..."
echo ""

# Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies first..."
  npm install
fi

# Run the development server
npm run dev 