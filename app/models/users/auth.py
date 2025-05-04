"""
Authentication Service

This module handles user authentication including:
- Login with username/email and password
- JWT token generation and validation
- Token refresh functionality
"""

import os
from datetime import datetime, timedelta
from typing import Dict, Optional, Union, Any
import logging
import jwt
from pydantic import BaseModel, EmailStr, Field

from app.models.users.user import User, UserInDB
from app.models.users.user_db import user_db_service

logger = logging.getLogger(__name__)

# Load JWT secret from environment or use default for development
# In production, the secret should be securely set in environment variables
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretdevelopmentkey")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

class Token(BaseModel):
    """Token response model."""
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime
    refresh_token: Optional[str] = None

class TokenData(BaseModel):
    """Token data embedded in JWT."""
    sub: str  # user ID
    exp: datetime
    type: str = "access"  # "access" or "refresh"
    username: Optional[str] = None

class LoginCredentials(BaseModel):
    """Login request model."""
    username: str  # Can be either username or email
    password: str

class AuthenticationError(Exception):
    """Exception raised for authentication errors."""
    pass

class AuthService:
    """Authentication service."""
    
    @staticmethod
    def create_access_token(user_id: str, username: str) -> Dict[str, Any]:
        """Create a new access token."""
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expires_at = datetime.utcnow() + expires_delta
        
        to_encode = {
            "sub": user_id,
            "exp": expires_at,
            "type": "access",
            "username": username
        }
        
        token = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_at": expires_at
        }
    
    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """Create a new refresh token."""
        expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        expires_at = datetime.utcnow() + expires_delta
        
        to_encode = {
            "sub": user_id,
            "exp": expires_at,
            "type": "refresh"
        }
        
        return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    @staticmethod
    def decode_token(token: str) -> TokenData:
        """Decode and validate a JWT token."""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            token_data = TokenData(
                sub=payload["sub"],
                exp=datetime.fromtimestamp(payload["exp"]),
                type=payload.get("type", "access"),
                username=payload.get("username")
            )
            
            # Check if token is expired
            if token_data.exp < datetime.utcnow():
                raise AuthenticationError("Token has expired")
                
            return token_data
            
        except jwt.PyJWTError as e:
            logger.error(f"JWT decode error: {str(e)}")
            raise AuthenticationError(f"Invalid token: {str(e)}")
    
    @staticmethod
    def authenticate_user(credentials: LoginCredentials) -> UserInDB:
        """Authenticate a user with username/email and password."""
        # Try to find user by username or email
        user = user_db_service.get_user_by_username(credentials.username)
        
        if not user:
            # Check if input is an email
            user = user_db_service.get_user_by_email(credentials.username)
        
        if not user:
            raise AuthenticationError("Invalid username or password")
        
        # Verify password
        if not user.verify_password(credentials.password):
            raise AuthenticationError("Invalid username or password")
        
        # Update last login time
        user_db_service.update_last_login(user.id)
        
        return user
    
    @staticmethod
    def get_user_from_token(token: str) -> User:
        """Get user from token."""
        token_data = AuthService.decode_token(token)
        
        # Get user from database
        user = user_db_service.get_user_by_id(token_data.sub)
        if not user:
            raise AuthenticationError("User not found")
            
        # Check if user is active
        if not user.is_active:
            raise AuthenticationError("User is inactive")
            
        return User.from_user_in_db(user)
    
    @staticmethod
    def refresh_access_token(refresh_token: str) -> Dict[str, Any]:
        """Create new access token using refresh token."""
        # Decode refresh token
        token_data = AuthService.decode_token(refresh_token)
        
        # Check token type
        if token_data.type != "refresh":
            raise AuthenticationError("Invalid token type for refresh operation")
        
        # Get user from database
        user = user_db_service.get_user_by_id(token_data.sub)
        if not user:
            raise AuthenticationError("User not found")
            
        # Check if user is active
        if not user.is_active:
            raise AuthenticationError("User is inactive")
        
        # Create new access token
        return AuthService.create_access_token(user.id, user.username)

# Create a singleton instance
auth_service = AuthService() 