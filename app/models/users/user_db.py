"""
User Database Service

This module handles all database operations related to users.
"""

import json
import os
from typing import Dict, List, Optional, Union
from datetime import datetime
import logging
from pathlib import Path

from app.models.users.user import User, UserInDB, UserCreate

logger = logging.getLogger(__name__)

# Set the path for the user database file
DB_DIR = Path("data/users")
DB_FILE = DB_DIR / "users.json"

# Ensure the directory exists
DB_DIR.mkdir(parents=True, exist_ok=True)

class UserDBService:
    """Service for user database operations."""
    
    def __init__(self):
        """Initialize the user database service."""
        self._users: Dict[str, UserInDB] = {}
        self._users_by_email: Dict[str, str] = {}  # email -> id
        self._users_by_username: Dict[str, str] = {}  # username -> id
        self._load_users()
    
    def _load_users(self) -> None:
        """Load users from the database file."""
        if not DB_FILE.exists():
            # Initialize with empty data if file doesn't exist
            self._save_users()
            return
        
        try:
            with open(DB_FILE, "r") as f:
                users_data = json.load(f)
                
            for user_data in users_data:
                # Convert dict to UserInDB
                # Handle datetime fields
                if "created_at" in user_data:
                    user_data["created_at"] = datetime.fromisoformat(user_data["created_at"])
                if "last_login" in user_data and user_data["last_login"]:
                    user_data["last_login"] = datetime.fromisoformat(user_data["last_login"])
                
                user = UserInDB(**user_data)
                self._users[user.id] = user
                self._users_by_email[user.email.lower()] = user.id
                self._users_by_username[user.username.lower()] = user.id
                
        except (json.JSONDecodeError, FileNotFoundError) as e:
            logger.error(f"Error loading users: {str(e)}")
            # Initialize with empty data
            self._users = {}
            self._users_by_email = {}
            self._users_by_username = {}
            # Create the file with empty data
            self._save_users()
    
    def _save_users(self) -> None:
        """Save users to the database file."""
        try:
            users_data = []
            for user in self._users.values():
                # Convert UserInDB to dict and handle datetime serialization
                user_dict = user.dict()
                user_dict["created_at"] = user_dict["created_at"].isoformat()
                if user_dict["last_login"]:
                    user_dict["last_login"] = user_dict["last_login"].isoformat()
                users_data.append(user_dict)
                
            with open(DB_FILE, "w") as f:
                json.dump(users_data, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving users: {str(e)}")
    
    # User CRUD operations
    
    def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get a user by ID."""
        return self._users.get(user_id)
    
    def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get a user by email address."""
        user_id = self._users_by_email.get(email.lower())
        if user_id:
            return self._users.get(user_id)
        return None
    
    def get_user_by_username(self, username: str) -> Optional[UserInDB]:
        """Get a user by username."""
        user_id = self._users_by_username.get(username.lower())
        if user_id:
            return self._users.get(user_id)
        return None
    
    def email_exists(self, email: str) -> bool:
        """Check if an email is already registered."""
        return email.lower() in self._users_by_email
    
    def username_exists(self, username: str) -> bool:
        """Check if a username is already taken."""
        return username.lower() in self._users_by_username
    
    def create_user(self, user: UserCreate) -> UserInDB:
        """Create a new user."""
        # Check for existing email or username
        if self.email_exists(user.email):
            raise ValueError(f"Email {user.email} is already registered")
        
        if self.username_exists(user.username):
            raise ValueError(f"Username {user.username} is already taken")
        
        # Create user in DB
        db_user = UserInDB.from_user_create(user)
        
        # Add to in-memory dictionaries
        self._users[db_user.id] = db_user
        self._users_by_email[db_user.email.lower()] = db_user.id
        self._users_by_username[db_user.username.lower()] = db_user.id
        
        # Save to disk
        self._save_users()
        
        return db_user
    
    def update_user(self, user_id: str, **update_data) -> Optional[UserInDB]:
        """Update a user with the provided data."""
        user = self._users.get(user_id)
        if not user:
            return None
        
        # Update user
        for key, value in update_data.items():
            if hasattr(user, key):
                # Handle special case for email and username updates
                if key == 'email' and value.lower() != user.email.lower():
                    # Check that new email is not taken
                    if self.email_exists(value):
                        raise ValueError(f"Email {value} is already registered")
                    # Update email index
                    self._users_by_email.pop(user.email.lower())
                    self._users_by_email[value.lower()] = user.id
                
                if key == 'username' and value.lower() != user.username.lower():
                    # Check that new username is not taken
                    if self.username_exists(value):
                        raise ValueError(f"Username {value} is already taken")
                    # Update username index
                    self._users_by_username.pop(user.username.lower())
                    self._users_by_username[value.lower()] = user.id
                
                # Set the attribute
                setattr(user, key, value)
        
        # Save to disk
        self._save_users()
        
        return user
    
    def update_last_login(self, user_id: str) -> None:
        """Update the last login timestamp."""
        user = self._users.get(user_id)
        if user:
            user.last_login = datetime.utcnow()
            self._save_users()
    
    def delete_user(self, user_id: str) -> bool:
        """Delete a user by ID."""
        user = self._users.get(user_id)
        if not user:
            return False
        
        # Remove from indices
        self._users_by_email.pop(user.email.lower(), None)
        self._users_by_username.pop(user.username.lower(), None)
        
        # Remove from users dict
        self._users.pop(user_id)
        
        # Save to disk
        self._save_users()
        
        return True
    
    def list_users(self) -> List[User]:
        """List all users (public view)."""
        return [User.from_user_in_db(user) for user in self._users.values()]

# Create a singleton instance
user_db_service = UserDBService() 