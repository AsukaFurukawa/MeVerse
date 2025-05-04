"""
User Model for MeVerse Application

This module defines the user model, authentication methods, and related schemas.
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, validator
import uuid
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserBase(BaseModel):
    """Base User data model with shared fields."""
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    is_active: bool = True
    is_admin: bool = False
    github_id: Optional[str] = None

class UserCreate(UserBase):
    """User creation model with password."""
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v

class UserInDB(UserBase):
    """User model as stored in the database."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    data_sources: List[Dict[str, Any]] = []
    
    @classmethod
    def from_user_create(cls, user_create: UserCreate):
        """Create a UserInDB from UserCreate model."""
        return cls(
            email=user_create.email,
            username=user_create.username,
            full_name=user_create.full_name,
            hashed_password=pwd_context.hash(user_create.password)
        )
    
    def verify_password(self, plain_password: str) -> bool:
        """Verify password against stored hash."""
        return pwd_context.verify(plain_password, self.hashed_password)
    
    def change_password(self, new_password: str) -> None:
        """Change user password."""
        self.hashed_password = pwd_context.hash(new_password)

class User(UserBase):
    """Public user model without sensitive information."""
    id: str
    created_at: datetime
    last_login: Optional[datetime] = None
    
    @classmethod
    def from_user_in_db(cls, user_db: UserInDB):
        """Create a public User model from UserInDB."""
        return cls(
            id=user_db.id,
            email=user_db.email,
            username=user_db.username,
            full_name=user_db.full_name,
            is_active=user_db.is_active,
            is_admin=user_db.is_admin,
            github_id=user_db.github_id,
            created_at=user_db.created_at,
            last_login=user_db.last_login
        )

class UserPreferences(BaseModel):
    """User preferences model."""
    theme: Optional[str] = "dark"
    notifications_enabled: bool = True
    language: str = "en"
    time_zone: str = "UTC"
    data_collection_consent: bool = True 