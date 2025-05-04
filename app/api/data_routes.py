"""
Data API Routes

This module handles all data-related API endpoints including:
- Data ingestion from various sources
- User data connections management
- Export and backup
"""

from fastapi import APIRouter, Depends, HTTPException, Body, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging

from app.data_ingestion.journal import save_journal_entry
from app.data_ingestion.habit import track_habit
from app.data_ingestion.mood import log_mood
from app.data_ingestion.calendar import sync_calendar_events
from app.models.users.user import User
from app.models.users.data_connections import (
    ConnectionType, 
    ConnectionStatus,
    DataConnection, 
    data_connection_service
)
from app.api.auth_routes import get_current_user

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

# Get all connections for the current user
@router.get("/connections", response_model=List[DataConnection])
async def get_user_connections(current_user: User = Depends(get_current_user)):
    """Get all data connections for the current user."""
    try:
        connections = data_connection_service.get_connections(current_user.id)
        return connections
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error getting user connections: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user connections"
        )

# Get a specific connection
@router.get("/connections/{connection_id}", response_model=DataConnection)
async def get_connection(
    connection_id: str, 
    current_user: User = Depends(get_current_user)
):
    """Get a specific data connection by ID."""
    try:
        connection = data_connection_service.get_connection(current_user.id, connection_id)
        if not connection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Connection with ID {connection_id} not found"
            )
        return connection
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error getting connection: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving connection details"
        )

# Create a new connection
@router.post("/connections", response_model=DataConnection, status_code=status.HTTP_201_CREATED)
async def create_connection(
    connection_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Create a new data connection."""
    try:
        # Validate connection type
        connection_type = connection_data.get("type")
        if not connection_type or connection_type not in [t.value for t in ConnectionType]:
            raise ValueError(f"Invalid connection type: {connection_type}")
        
        # Create connection object
        connection = DataConnection(
            user_id=current_user.id,
            type=connection_type,
            name=connection_data.get("name", f"{connection_type.title()} Connection"),
            description=connection_data.get("description", ""),
            settings=connection_data.get("settings", {}),
            status=ConnectionStatus.PENDING
        )
        
        # Add to database
        new_connection = data_connection_service.add_connection(current_user.id, connection)
        return new_connection
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating connection: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating data connection"
        )

# Update a connection
@router.put("/connections/{connection_id}", response_model=DataConnection)
async def update_connection(
    connection_id: str,
    connection_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Update an existing data connection."""
    try:
        # Verify connection exists
        connection = data_connection_service.get_connection(current_user.id, connection_id)
        if not connection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Connection with ID {connection_id} not found"
            )
        
        # Update the connection
        updated_connection = data_connection_service.update_connection(
            current_user.id,
            connection_id,
            **connection_data
        )
        
        return updated_connection
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating connection: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating data connection"
        )

# Delete a connection
@router.delete("/connections/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(
    connection_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a data connection."""
    try:
        # Delete the connection
        success = data_connection_service.delete_connection(current_user.id, connection_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Connection with ID {connection_id} not found"
            )
        return None
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error deleting connection: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting data connection"
        )

# Connect to a service (this would typically trigger OAuth flow)
@router.post("/connections/{connection_id}/connect", response_model=DataConnection)
async def connect_service(
    connection_id: str,
    current_user: User = Depends(get_current_user)
):
    """Connect to a service (start authentication flow)."""
    try:
        # Update connection status
        updated_connection = data_connection_service.set_connection_status(
            current_user.id,
            connection_id,
            ConnectionStatus.CONNECTED
        )
        
        if not updated_connection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Connection with ID {connection_id} not found"
            )
        
        return updated_connection
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error connecting to service: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error connecting to service"
        )

# Disconnect from a service
@router.post("/connections/{connection_id}/disconnect", response_model=DataConnection)
async def disconnect_service(
    connection_id: str,
    current_user: User = Depends(get_current_user)
):
    """Disconnect from a service."""
    try:
        # Update connection status
        updated_connection = data_connection_service.set_connection_status(
            current_user.id,
            connection_id,
            ConnectionStatus.DISCONNECTED
        )
        
        if not updated_connection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Connection with ID {connection_id} not found"
            )
        
        return updated_connection
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error disconnecting from service: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error disconnecting from service"
        )

# Additional data endpoints can be added here as needed, such as:
# - Data import
# - Data export
# - Data analysis
# - etc. 