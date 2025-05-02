"""Calendar module for synchronizing and analyzing calendar events."""

import logging
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

from app.utils.database import get_db
from app.personality_engine.profile import update_profile_from_calendar
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google.oauth2 import service_account

logger = logging.getLogger(__name__)

def get_google_calendar_service():
    """
    Get an authenticated Google Calendar service.
    
    Returns:
        Google Calendar API service object
    """
    # Check if we're using service account or OAuth2
    if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        # Service account authentication
        credentials = service_account.Credentials.from_service_account_file(
            os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
            scopes=['https://www.googleapis.com/auth/calendar.readonly']
        )
    else:
        # OAuth2 authentication
        # This is a simplified implementation and would need to be expanded
        # to handle token refresh, storage, etc. in a real application
        token_path = os.path.join(os.getenv("DATA_DIR", "data"), "token.json")
        
        credentials = None
        if os.path.exists(token_path):
            credentials = Credentials.from_authorized_user_info(
                json.loads(open(token_path).read()),
                ['https://www.googleapis.com/auth/calendar.readonly']
            )
        
        if not credentials or not credentials.valid:
            if credentials and credentials.expired and credentials.refresh_token:
                credentials.refresh(Request())
            else:
                # In a real app, you'd redirect to an auth flow here
                raise Exception("No valid credentials available. Authentication required.")
    
    return build('calendar', 'v3', credentials=credentials)

def sync_calendar_events(start_date: str, end_date: str, calendar_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Sync calendar events from Google Calendar.
    
    Args:
        start_date: Start date for events (ISO format)
        end_date: End date for events (ISO format)
        calendar_id: Calendar ID to sync from (default: primary)
        
    Returns:
        List of synced events
    """
    try:
        # Convert ISO dates to RFC3339 format expected by Google Calendar API
        start_datetime = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        # Get Google Calendar service
        service = get_google_calendar_service()
        
        # Default to primary calendar if not specified
        calendar_id = calendar_id or 'primary'
        
        # Fetch events
        events_result = service.events().list(
            calendarId=calendar_id,
            timeMin=start_datetime.isoformat(),
            timeMax=end_datetime.isoformat(),
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        # Process and store events
        processed_events = []
        for event in events:
            # Extract relevant event details
            event_data = {
                'event_id': event['id'],
                'calendar_id': calendar_id,
                'summary': event.get('summary', 'No Title'),
                'description': event.get('description', ''),
                'location': event.get('location', ''),
                'start': event['start'].get('dateTime', event['start'].get('date')),
                'end': event['end'].get('dateTime', event['end'].get('date')),
                'status': event.get('status', ''),
                'organizer': event.get('organizer', {}).get('email', ''),
                'attendees': [a.get('email') for a in event.get('attendees', [])],
                'recurrence': event.get('recurrence', []),
                'visibility': event.get('visibility', 'default'),
                'sync_time': datetime.now().isoformat()
            }
            
            # Store in database
            db = get_db()
            collection = db.calendar_events
            
            # Check if event already exists and update if needed
            existing = collection.find_one({'event_id': event_data['event_id']})
            
            if existing:
                collection.update_one(
                    {'event_id': event_data['event_id']},
                    {'$set': event_data}
                )
            else:
                collection.insert_one(event_data)
            
            processed_events.append(event_data)
        
        # Update user profile based on calendar data
        try:
            update_profile_from_calendar(processed_events)
        except Exception as e:
            logger.warning(f"Failed to update profile from calendar: {str(e)}")
        
        return processed_events
    
    except Exception as e:
        logger.error(f"Error syncing calendar events: {str(e)}")
        raise

def get_calendar_events(start_date: Optional[str] = None,
                       end_date: Optional[str] = None,
                       keyword: Optional[str] = None,
                       limit: int = 100) -> List[Dict[str, Any]]:
    """
    Retrieve calendar events from the database.
    
    Args:
        start_date: Start date for filtering events (ISO format)
        end_date: End date for filtering events (ISO format)
        keyword: Keyword to search in event summary or description
        limit: Maximum number of events to return
        
    Returns:
        List of calendar events matching the filters
    """
    db = get_db()
    collection = db.calendar_events
    
    # Build query
    query = {}
    
    if start_date or end_date:
        start_query = {}
        if start_date:
            start_query['$gte'] = start_date
        if end_date:
            start_query['$lte'] = end_date
        query['start'] = start_query
    
    if keyword:
        query['$or'] = [
            {'summary': {'$regex': keyword, '$options': 'i'}},
            {'description': {'$regex': keyword, '$options': 'i'}}
        ]
    
    # Execute query
    events = list(collection.find(query).sort('start', 1).limit(limit))
    
    # Convert ObjectId to string for JSON serialization
    for event in events:
        event['id'] = str(event.pop('_id'))
    
    return events

def analyze_calendar_usage(days: int = 30) -> Dict[str, Any]:
    """
    Analyze calendar usage patterns.
    
    Args:
        days: Number of days to analyze
        
    Returns:
        Dictionary containing calendar usage statistics
    """
    # Calculate date range
    end_date = datetime.now().isoformat()
    start_date = (datetime.now() - timedelta(days=days)).isoformat()
    
    events = get_calendar_events(start_date, end_date)
    
    if not events:
        return {
            'total_events': 0,
            'event_distribution': {},
            'busiest_day': None,
            'average_events_per_day': 0
        }
    
    # Count total events
    total_events = len(events)
    
    # Analyze event distribution by day of week
    day_counts = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}  # Monday=0, Sunday=6
    
    for event in events:
        # Parse event start time
        start_time = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
        day_of_week = start_time.weekday()
        day_counts[day_of_week] += 1
    
    # Convert day numbers to names
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    event_distribution = {day_names[day]: count for day, count in day_counts.items()}
    
    # Find busiest day
    busiest_day = day_names[max(day_counts.items(), key=lambda x: x[1])[0]]
    
    # Calculate average events per day
    average_events_per_day = total_events / days
    
    return {
        'total_events': total_events,
        'event_distribution': event_distribution,
        'busiest_day': busiest_day,
        'average_events_per_day': average_events_per_day
    } 