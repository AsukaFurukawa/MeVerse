#!/usr/bin/env python
"""
MeVerse Startup Script

This script starts both the backend and frontend servers.
"""

import os
import subprocess
import sys
import time
from pathlib import Path

BACKEND_CMD = ["python", "-m", "app.main"]
FRONTEND_CMD = ["npm", "run", "dev"]

def start_process(cmd, cwd, name):
    """Start a process and return the process object."""
    print(f"Starting {name}...")
    
    # Use shell=True on Windows for npm commands
    use_shell = sys.platform == "win32" and cmd[0] == "npm"
    
    if use_shell:
        cmd_str = " ".join(cmd)
        process = subprocess.Popen(
            cmd_str, 
            cwd=cwd, 
            shell=True
        )
    else:
        process = subprocess.Popen(
            cmd, 
            cwd=cwd
        )
    
    print(f"{name} started with PID {process.pid}")
    return process

def main():
    """Main function to start all servers."""
    app_dir = Path(__file__).parent.absolute()
    frontend_dir = app_dir / "frontend"
    
    # Check if frontend directory exists
    if not frontend_dir.exists():
        print(f"Error: Frontend directory not found at {frontend_dir}")
        return
    
    # Start backend
    backend_process = start_process(BACKEND_CMD, app_dir, "Backend")
    
    # Wait a bit for backend to start
    time.sleep(2)
    
    # Start frontend
    frontend_process = start_process(FRONTEND_CMD, frontend_dir, "Frontend")
    
    print("\nMeVerse Digital Twin is starting up!")
    print("- Backend: http://localhost:8000")
    print("- Frontend: http://localhost:3000")
    print("\nPress Ctrl+C to stop all servers")
    
    try:
        # Wait for backend process to complete (or be interrupted)
        backend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down services...")
        
        # Try to terminate processes gracefully
        if backend_process:
            backend_process.terminate()
        
        if frontend_process:
            frontend_process.terminate()
        
        print("MeVerse shutdown complete")

if __name__ == "__main__":
    main() 