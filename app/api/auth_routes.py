"""
Authentication API Routes

This module handles user authentication routes:
- User registration
- Login
- Token refresh
- Password reset
- User profile access and management
- OAuth providers (GitHub)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from typing import Dict, List, Optional, Any
import logging
import os
import secrets
import httpx

from app.models.users.user import User, UserCreate, UserBase
from app.models.users.user_db import user_db_service
from app.models.users.auth import auth_service, AuthenticationError, Token, LoginCredentials

logger = logging.getLogger(__name__)

router = APIRouter()

# OAuth2 password flow
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# GitHub OAuth configuration
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
GITHUB_REDIRECT_URI = os.getenv("GITHUB_REDIRECT_URI", "http://localhost:8000/api/auth/github/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Check GitHub OAuth configuration on startup
if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
    logger.warning("GitHub OAuth is not fully configured! GitHub login will not work properly.")
    logger.warning("Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.")
else:
    logger.info(f"GitHub OAuth configured with client ID: {GITHUB_CLIENT_ID[:5]}...")
    logger.info(f"GitHub redirect URI: {GITHUB_REDIRECT_URI}")

# Dependency to get current user from token
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Get the current authenticated user."""
    try:
        return auth_service.get_user_from_token(token)
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

# Dependency to get current admin user
async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Check if current user is admin."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    return current_user

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """Register a new user."""
    try:
        # Create user in database
        user = user_db_service.create_user(user_data)
        
        # Return the public user object
        return User.from_user_in_db(user)
        
    except ValueError as e:
        # Handle validation errors like duplicate email/username
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user account"
        )

@router.post("/login", response_model=Token)
async def login(credentials: LoginCredentials):
    """Authenticate user and return access token."""
    try:
        # Authenticate user
        user = auth_service.authenticate_user(credentials)
        
        # Create access token
        token_data = auth_service.create_access_token(user.id, user.username)
        
        # Create refresh token
        refresh_token = auth_service.create_refresh_token(user.id)
        
        # Return token data
        return Token(
            access_token=token_data["access_token"],
            token_type=token_data["token_type"],
            expires_at=token_data["expires_at"],
            refresh_token=refresh_token
        )
        
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token."""
    try:
        # Refresh access token
        token_data = auth_service.refresh_access_token(refresh_token)
        
        # Return token data
        return Token(
            access_token=token_data["access_token"],
            token_type=token_data["token_type"],
            expires_at=token_data["expires_at"],
            # Return the same refresh token since it's still valid
            refresh_token=refresh_token
        )
        
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.get("/me", response_model=User)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user

@router.put("/me", response_model=User)
async def update_user_profile(
    user_data: UserBase,
    current_user: User = Depends(get_current_user)
):
    """Update current user profile."""
    try:
        # Extract only allowed fields from the input
        update_data = {
            key: value for key, value in user_data.dict().items()
            if key in ["username", "email", "full_name"]
        }
        
        # Update user in database
        updated_user = user_db_service.update_user(current_user.id, **update_data)
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Return the updated user
        return User.from_user_in_db(updated_user)
        
    except ValueError as e:
        # Handle validation errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user profile"
        )

@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user)
):
    """Change user password."""
    try:
        # Get full user from database
        user = user_db_service.get_user_by_id(current_user.id)
        
        # Verify old password
        if not user.verify_password(old_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password"
            )
        
        # Change password
        user.change_password(new_password)
        
        # Update user in database
        user_db_service.update_user(user.id, hashed_password=user.hashed_password)
        
        return {"detail": "Password changed successfully"}
        
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error changing password"
        )

# Admin endpoint to list all users
@router.get("/users", response_model=List[User])
async def list_users(current_user: User = Depends(get_current_admin)):
    """List all users (admin only)."""
    return user_db_service.list_users()

@router.get("/github/login")
async def github_login():
    """
    Redirect to GitHub for OAuth authorization.
    """
    if not GITHUB_CLIENT_ID:
        logger.error("GitHub OAuth login attempted but client ID is not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitHub OAuth is not configured"
        )
    
    # Generate a random state token to prevent CSRF
    state = secrets.token_urlsafe(32)
    logger.info(f"Initiating GitHub OAuth flow with state: {state[:10]}...")
    
    # In a real implementation, you should store this state in a session or database
    # to verify it when GitHub redirects back to your callback URL
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
        f"&state={state}"
        f"&scope=user:email"
    )
    
    logger.info(f"Redirecting to GitHub authorization URL: {github_auth_url}")
    return RedirectResponse(url=github_auth_url)

@router.get("/github/callback")
async def github_callback(code: str = None, state: str = None, error: str = None):
    """
    Handle GitHub OAuth callback.
    """
    # Log the incoming request
    logger.info(f"GitHub callback received - code: {'present' if code else 'missing'}, state: {'present' if state else 'missing'}")
    
    # Check for error from GitHub
    if error:
        logger.error(f"GitHub OAuth error: {error}")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=github_auth_failed&message={error}")
    
    # Check required parameters
    if not code or not state:
        logger.error("GitHub callback missing required parameters")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=missing_parameters")
    
    # Check OAuth configuration
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        logger.error("GitHub OAuth callback received but OAuth is not configured")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=oauth_not_configured")
    
    # In a real implementation, you should verify the state token here
    
    try:
        logger.info("Exchanging code for GitHub access token")
        # Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": GITHUB_CLIENT_ID,
                    "client_secret": GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": GITHUB_REDIRECT_URI
                },
                headers={"Accept": "application/json"}
            )
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                error_description = token_data.get("error_description", "Unknown error")
                logger.error(f"Failed to obtain GitHub access token: {error_description}")
                return RedirectResponse(url=f"{FRONTEND_URL}/login?error=token_exchange_failed&message={error_description}")
            
            logger.info("Successfully obtained GitHub access token")
            
            # Fetch user information from GitHub
            logger.info("Fetching GitHub user information")
            user_response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"token {access_token}",
                    "Accept": "application/json"
                }
            )
            
            github_user = user_response.json()
            
            # Fetch user's emails if available
            logger.info("Fetching GitHub user emails")
            emails_response = await client.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"token {access_token}",
                    "Accept": "application/json"
                }
            )
            
            github_emails = emails_response.json()
            primary_email = next(
                (email["email"] for email in github_emails if email["primary"]),
                github_user.get("email")
            )
            
            if not primary_email:
                logger.error("No email found for GitHub user")
                return RedirectResponse(url=f"{FRONTEND_URL}/login?error=no_email_found")
            
            logger.info(f"Found primary email: {primary_email}")
            
            # Check if user already exists
            user = user_db_service.get_user_by_email(primary_email)
            
            if not user:
                # Create a new user
                logger.info(f"Creating new user with GitHub login: {github_user.get('login')}")
                user_data = UserCreate(
                    username=github_user.get("login"),
                    email=primary_email,
                    full_name=github_user.get("name") or github_user.get("login"),
                    password=secrets.token_urlsafe(16),  # Random password
                    github_id=str(github_user.get("id"))
                )
                
                user = user_db_service.create_user(user_data)
            else:
                logger.info(f"Found existing user with email: {primary_email}")
            
            # Generate JWT token
            token = auth_service.create_access_token(user.id, user.username)
            logger.info(f"Generated JWT token for user: {user.username}")
            
            # Redirect to frontend with token
            redirect_url = f"{FRONTEND_URL}/auth/callback?token={token.access_token}&refresh_token={token.refresh_token}"
            logger.info(f"Redirecting to: {redirect_url}")
            return RedirectResponse(url=redirect_url)
            
    except Exception as e:
        logger.error(f"GitHub OAuth error: {str(e)}", exc_info=True)
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=server_error&message={str(e)}") 