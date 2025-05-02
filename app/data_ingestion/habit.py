"""Habit tracking module for monitoring user habits."""

import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

from app.utils.database import get_db
from app.personality_engine.profile import update_profile_from_habit

logger = logging.getLogger(__name__)

def track_habit(habit_data: Dict[str, Any]) -> Any:
    """
    Track a habit entry.
    
    Args:
        habit_data: Dictionary containing habit tracking data
        
    Returns:
        The saved habit entry with ID
    """
    # Get current timestamp if not provided
    if not habit_data.get('date'):
        habit_data['date'] = datetime.now().isoformat()
    
    # Save to database
    db = get_db()
    collection = db.habits
    result = collection.insert_one(habit_data)
    
    # Update user profile based on this habit entry
    try:
        update_profile_from_habit(habit_data)
    except Exception as e:
        logger.warning(f"Failed to update profile from habit: {str(e)}")
    
    return_data = habit_data.copy()
    return_data['id'] = str(result.inserted_id)
    
    return return_data

def get_habits(start_date: Optional[str] = None,
               end_date: Optional[str] = None,
               habit_name: Optional[str] = None,
               completed: Optional[bool] = None,
               limit: int = 100) -> List[Dict[str, Any]]:
    """
    Retrieve habit entries based on filters.
    
    Args:
        start_date: Start date for filtering entries (ISO format)
        end_date: End date for filtering entries (ISO format)
        habit_name: Name of habit to filter by
        completed: Filter by completion status
        limit: Maximum number of entries to return
        
    Returns:
        List of habit entries matching the filters
    """
    db = get_db()
    collection = db.habits
    
    # Build query
    query = {}
    
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query['$gte'] = start_date
        if end_date:
            date_query['$lte'] = end_date
        query['date'] = date_query
    
    if habit_name:
        query['name'] = habit_name
    
    if completed is not None:
        query['completed'] = completed
    
    # Execute query
    habits = list(collection.find(query).sort('date', -1).limit(limit))
    
    # Convert ObjectId to string for JSON serialization
    for habit in habits:
        habit['id'] = str(habit.pop('_id'))
    
    return habits

def get_habit_stats(habit_name: str, 
                   start_date: Optional[str] = None,
                   end_date: Optional[str] = None) -> Dict[str, Any]:
    """
    Get statistics for a specific habit.
    
    Args:
        habit_name: Name of the habit
        start_date: Start date for filtering entries (ISO format)
        end_date: End date for filtering entries (ISO format)
        
    Returns:
        Dictionary containing habit statistics
    """
    habits = get_habits(start_date, end_date, habit_name)
    
    total_entries = len(habits)
    completed_entries = sum(1 for h in habits if h.get('completed', False))
    
    # Calculate completion rate
    completion_rate = 0
    if total_entries > 0:
        completion_rate = (completed_entries / total_entries) * 100
    
    # Calculate average duration (if applicable)
    durations = [h.get('duration', 0) for h in habits if h.get('duration') is not None]
    avg_duration = sum(durations) / len(durations) if durations else 0
    
    # Get streak information
    current_streak, longest_streak = calculate_streak(habits)
    
    return {
        'habit_name': habit_name,
        'total_entries': total_entries,
        'completed_entries': completed_entries,
        'completion_rate': completion_rate,
        'average_duration': avg_duration,
        'current_streak': current_streak,
        'longest_streak': longest_streak
    }

def calculate_streak(habits: List[Dict[str, Any]]) -> tuple:
    """
    Calculate the current and longest streak for a habit.
    
    Args:
        habits: List of habit entries sorted by date (descending)
        
    Returns:
        Tuple of (current_streak, longest_streak)
    """
    if not habits:
        return 0, 0
    
    # Sort by date ascending
    sorted_habits = sorted(habits, key=lambda x: x['date'])
    
    current_streak = 0
    longest_streak = 0
    streak_count = 0
    
    # Convert dates to datetime objects for easier comparison
    for i, habit in enumerate(sorted_habits):
        if habit.get('completed', False):
            streak_count += 1
            
            # Check if this is the last entry or if there's a break in the streak
            if i == len(sorted_habits) - 1 or not sorted_habits[i+1].get('completed', False):
                longest_streak = max(longest_streak, streak_count)
                if i == len(sorted_habits) - 1:
                    current_streak = streak_count
                streak_count = 0
        else:
            longest_streak = max(longest_streak, streak_count)
            streak_count = 0
            
            # If this is the last entry, current streak is 0
            if i == len(sorted_habits) - 1:
                current_streak = 0
    
    return current_streak, longest_streak 