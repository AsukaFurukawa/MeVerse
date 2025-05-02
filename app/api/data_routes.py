from fastapi import APIRouter, Depends, HTTPException, Body, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging

from app.data_ingestion.journal import save_journal_entry
from app.data_ingestion.habit import track_habit
from app.data_ingestion.mood import log_mood
from app.data_ingestion.calendar import sync_calendar_events

logger = logging.getLogger(__name__)

router = APIRouter()

# Define data models
class JournalEntry(BaseModel):
    """Model for a journal entry."""
    content: str
    tags: Optional[List[str]] = []
    date: Optional[str] = None

class HabitData(BaseModel):
    """Model for habit tracking data."""
    name: str
    duration: Optional[int] = None  # in minutes
    completed: bool = True
    date: Optional[str] = None
    notes: Optional[str] = None

class MoodLog(BaseModel):
    """Model for mood tracking data."""
    mood: str  # e.g., "happy", "sad", "stressed", etc.
    intensity: int  # 1-10 scale
    date: Optional[str] = None
    notes: Optional[str] = None

class CalendarSync(BaseModel):
    """Model for calendar sync request."""
    start_date: str
    end_date: str
    calendar_id: Optional[str] = None

# Journal endpoints
@router.post("/journal", status_code=status.HTTP_201_CREATED)
async def add_journal_entry(entry: JournalEntry):
    """Save a new journal entry."""
    try:
        result = save_journal_entry(entry.dict())
        return {"status": "success", "id": result.id}
    except Exception as e:
        logger.error(f"Error saving journal entry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save journal entry: {str(e)}"
        )

# Habit tracking endpoints
@router.post("/habits", status_code=status.HTTP_201_CREATED)
async def log_habit(habit: HabitData):
    """Track a habit."""
    try:
        result = track_habit(habit.dict())
        return {"status": "success", "id": result.id}
    except Exception as e:
        logger.error(f"Error tracking habit: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to track habit: {str(e)}"
        )

# Mood tracking endpoints
@router.post("/mood", status_code=status.HTTP_201_CREATED)
async def track_mood(mood_data: MoodLog):
    """Log a mood entry."""
    try:
        result = log_mood(mood_data.dict())
        return {"status": "success", "id": result.id}
    except Exception as e:
        logger.error(f"Error logging mood: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log mood: {str(e)}"
        )

# Calendar integration endpoints
@router.post("/calendar/sync", status_code=status.HTTP_200_OK)
async def sync_calendar(sync_data: CalendarSync):
    """Sync calendar events."""
    try:
        events = sync_calendar_events(
            sync_data.start_date,
            sync_data.end_date,
            sync_data.calendar_id
        )
        return {"status": "success", "events_synced": len(events)}
    except Exception as e:
        logger.error(f"Error syncing calendar: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync calendar: {str(e)}"
        ) 