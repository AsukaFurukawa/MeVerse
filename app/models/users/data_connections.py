"""
User Data Connections

This module handles the management of data connections and integrations
for users, including OAuth flows for third-party services.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

from app.models.users.user_db import user_db_service

class ConnectionType(str, Enum):
    """Types of data connections available."""
    SPOTIFY = "spotify"
    GOOGLE_CALENDAR = "google_calendar"
    GOOGLE_FIT = "google_fit"
    TWITTER = "twitter"
    FACEBOOK = "facebook"
    APPLE_HEALTH = "apple_health"
    FITBIT = "fitbit"
    GITHUB = "github"
    NOTION = "notion"
    CUSTOM_API = "custom_api"

class ConnectionStatus(str, Enum):
    """Status of a data connection."""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    PENDING = "pending"
    ERROR = "error"

class DataConnection(BaseModel):
    """Model for a data connection."""
    id: str = Field(default_factory=lambda: f"{datetime.utcnow().timestamp():.0f}")
    user_id: str
    type: ConnectionType
    name: str
    description: Optional[str] = None
    status: ConnectionStatus = ConnectionStatus.DISCONNECTED
    connected_at: Optional[datetime] = None
    last_sync: Optional[datetime] = None
    settings: Dict[str, Any] = {}
    metadata: Dict[str, Any] = {}
    error_message: Optional[str] = None

class ConnectionStats(BaseModel):
    """Statistics for a connection."""
    data_points: int = 0
    last_sync_duration: Optional[float] = None  # in seconds
    avg_sync_duration: Optional[float] = None  # in seconds
    total_syncs: int = 0
    failed_syncs: int = 0

class DataConnectionService:
    """Service for managing user data connections."""
    
    @staticmethod
    def add_connection(user_id: str, connection: DataConnection) -> DataConnection:
        """Add a new data connection for a user."""
        # Ensure user exists
        user = user_db_service.get_user_by_id(user_id)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # Set user ID on the connection
        connection.user_id = user_id
        
        # Create a new data source entry in the user's data
        if not hasattr(user, "data_sources"):
            user.data_sources = []
        
        # Add as a dict
        user.data_sources.append(connection.dict())
        
        # Update user
        user_db_service.update_user(user_id, data_sources=user.data_sources)
        
        return connection
    
    @staticmethod
    def get_connections(user_id: str) -> List[DataConnection]:
        """Get all data connections for a user."""
        # Ensure user exists
        user = user_db_service.get_user_by_id(user_id)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # Get data sources from user
        data_sources = getattr(user, "data_sources", [])
        
        # Convert to DataConnection objects
        connections = []
        for data_source in data_sources:
            # Handle datetime fields
            if "connected_at" in data_source and data_source["connected_at"]:
                if isinstance(data_source["connected_at"], str):
                    data_source["connected_at"] = datetime.fromisoformat(data_source["connected_at"])
            
            if "last_sync" in data_source and data_source["last_sync"]:
                if isinstance(data_source["last_sync"], str):
                    data_source["last_sync"] = datetime.fromisoformat(data_source["last_sync"])
            
            connections.append(DataConnection(**data_source))
        
        return connections
    
    @staticmethod
    def get_connection(user_id: str, connection_id: str) -> Optional[DataConnection]:
        """Get a specific data connection for a user."""
        connections = DataConnectionService.get_connections(user_id)
        for connection in connections:
            if connection.id == connection_id:
                return connection
        return None
    
    @staticmethod
    def update_connection(
        user_id: str, 
        connection_id: str, 
        **update_data
    ) -> Optional[DataConnection]:
        """Update a data connection."""
        # Ensure user exists
        user = user_db_service.get_user_by_id(user_id)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # Get data sources from user
        data_sources = getattr(user, "data_sources", [])
        
        # Find and update the connection
        found = False
        for i, data_source in enumerate(data_sources):
            if data_source.get("id") == connection_id:
                # Update data source
                for key, value in update_data.items():
                    data_sources[i][key] = value
                found = True
                break
        
        if not found:
            return None
        
        # Update user
        user_db_service.update_user(user_id, data_sources=data_sources)
        
        # Get the updated connection
        return DataConnectionService.get_connection(user_id, connection_id)
    
    @staticmethod
    def delete_connection(user_id: str, connection_id: str) -> bool:
        """Delete a data connection."""
        # Ensure user exists
        user = user_db_service.get_user_by_id(user_id)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # Get data sources from user
        data_sources = getattr(user, "data_sources", [])
        
        # Find and remove the connection
        initial_length = len(data_sources)
        data_sources = [ds for ds in data_sources if ds.get("id") != connection_id]
        
        if len(data_sources) == initial_length:
            # Connection not found
            return False
        
        # Update user
        user_db_service.update_user(user_id, data_sources=data_sources)
        
        return True
    
    @staticmethod
    def set_connection_status(
        user_id: str, 
        connection_id: str, 
        status: ConnectionStatus,
        error_message: Optional[str] = None
    ) -> Optional[DataConnection]:
        """Update the status of a connection."""
        update_data = {"status": status}
        
        # Add error message if provided and status is ERROR
        if status == ConnectionStatus.ERROR and error_message:
            update_data["error_message"] = error_message
        
        # If status is CONNECTED, update connected_at
        if status == ConnectionStatus.CONNECTED:
            update_data["connected_at"] = datetime.utcnow()
        
        return DataConnectionService.update_connection(
            user_id, 
            connection_id, 
            **update_data
        )
    
    @staticmethod
    def update_last_sync(
        user_id: str, 
        connection_id: str, 
        sync_time: datetime = None
    ) -> Optional[DataConnection]:
        """Update the last sync time of a connection."""
        if sync_time is None:
            sync_time = datetime.utcnow()
            
        return DataConnectionService.update_connection(
            user_id, 
            connection_id, 
            last_sync=sync_time
        )

# Create a singleton instance
data_connection_service = DataConnectionService() 