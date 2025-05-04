"""
Admin User Creation Script for MeVerse

This script creates an admin user with predefined credentials if one doesn't already exist.
"""

import sys
import os
import json
from datetime import datetime
from pathlib import Path

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.users.user import UserCreate, UserInDB
from app.models.users.user_db import user_db_service

# Admin user credentials
ADMIN_USERNAME = "meverse_admin"
ADMIN_PASSWORD = "DigitalTwin2023!"
ADMIN_EMAIL = "admin@meverse.io"
ADMIN_FULL_NAME = "MeVerse Administrator"

def create_admin_user():
    """Create an admin user if one doesn't already exist."""
    # Check if an admin already exists
    users = user_db_service.list_users()
    
    for user in users:
        if user.is_admin:
            print(f"Admin user already exists: {user.username}")
            return
    
    # Create admin user
    try:
        admin_data = UserCreate(
            username=ADMIN_USERNAME,
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            full_name=ADMIN_FULL_NAME,
            is_admin=True
        )
        
        admin_user = user_db_service.create_user(admin_data)
        
        print(f"Admin user created successfully:")
        print(f"  Username: {admin_user.username}")
        print(f"  Email: {admin_user.email}")
        print(f"  Password: {ADMIN_PASSWORD}")
        print(f"  Admin: {admin_user.is_admin}")
        
    except ValueError as e:
        print(f"Error creating admin user: {str(e)}")
        
        # If the error is that the username already exists, let's try to find the user
        # and ensure they have admin privileges
        if "Username" in str(e) and "already taken" in str(e):
            user = user_db_service.get_user_by_username(ADMIN_USERNAME)
            if user and not user.is_admin:
                user_db_service.update_user(user.id, is_admin=True)
                print(f"Updated {user.username} to have admin privileges.")
        
        # If the error is that the email already exists, let's try to find the user
        # and ensure they have admin privileges
        if "Email" in str(e) and "already registered" in str(e):
            user = user_db_service.get_user_by_email(ADMIN_EMAIL)
            if user and not user.is_admin:
                user_db_service.update_user(user.id, is_admin=True)
                print(f"Updated {user.username} to have admin privileges.")

if __name__ == "__main__":
    create_admin_user() 