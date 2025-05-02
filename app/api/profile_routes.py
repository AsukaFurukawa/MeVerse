from fastapi import APIRouter, Depends, HTTPException, Body, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging

from app.personality_engine.profile import get_profile, update_profile
from app.personality_engine.traits import get_personality_traits
from app.personality_engine.insights import get_personality_insights

logger = logging.getLogger(__name__)

router = APIRouter()

# Define data models
class ProfileUpdate(BaseModel):
    """Model for profile updates."""
    data: Dict[str, Any]
    override_existing: Optional[bool] = False

# Profile endpoints
@router.get("/", status_code=status.HTTP_200_OK)
async def get_user_profile():
    """Get the user's profile."""
    try:
        profile = get_profile()
        return profile
    except Exception as e:
        logger.error(f"Error retrieving profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve profile: {str(e)}"
        )

@router.patch("/", status_code=status.HTTP_200_OK)
async def update_user_profile(profile_update: ProfileUpdate):
    """Update the user's profile."""
    try:
        updated_profile = update_profile(
            profile_update.data,
            profile_update.override_existing
        )
        return updated_profile
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@router.get("/traits", status_code=status.HTTP_200_OK)
async def get_traits():
    """Get the user's personality traits based on data analysis."""
    try:
        traits = get_personality_traits()
        return traits
    except Exception as e:
        logger.error(f"Error retrieving personality traits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve personality traits: {str(e)}"
        )

@router.get("/insights", status_code=status.HTTP_200_OK)
async def get_insights():
    """Get insights about the user's personality and behavior patterns."""
    try:
        insights = get_personality_insights()
        return insights
    except Exception as e:
        logger.error(f"Error retrieving insights: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve insights: {str(e)}"
        ) 