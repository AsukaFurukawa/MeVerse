"""Mood tracking module for monitoring user mood."""

import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

from app.utils.database import get_db
from app.personality_engine.profile import update_profile_from_mood

logger = logging.getLogger(__name__)

# List of predefined mood categories
MOOD_CATEGORIES = [
    "happy", "content", "excited", "grateful", "relaxed",  # Positive
    "sad", "anxious", "angry", "frustrated", "stressed",   # Negative
    "neutral", "bored", "tired", "confused"                # Neutral
]

def log_mood(mood_data: Dict[str, Any]) -> Any:
    """
    Log a mood entry.
    
    Args:
        mood_data: Dictionary containing mood data
        
    Returns:
        The saved mood entry with ID
    """
    # Get current timestamp if not provided
    if not mood_data.get('date'):
        mood_data['date'] = datetime.now().isoformat()
    
    # Validate mood category
    if 'mood' in mood_data and mood_data['mood'] not in MOOD_CATEGORIES:
        logger.warning(f"Unknown mood category: {mood_data['mood']}. Allowing as custom category.")
    
    # Save to database
    db = get_db()
    collection = db.moods
    result = collection.insert_one(mood_data)
    
    # Update user profile based on this mood entry
    try:
        update_profile_from_mood(mood_data)
    except Exception as e:
        logger.warning(f"Failed to update profile from mood: {str(e)}")
    
    return_data = mood_data.copy()
    return_data['id'] = str(result.inserted_id)
    
    return return_data

def get_moods(start_date: Optional[str] = None,
              end_date: Optional[str] = None,
              mood_category: Optional[str] = None,
              min_intensity: Optional[int] = None,
              max_intensity: Optional[int] = None,
              limit: int = 100) -> List[Dict[str, Any]]:
    """
    Retrieve mood entries based on filters.
    
    Args:
        start_date: Start date for filtering entries (ISO format)
        end_date: End date for filtering entries (ISO format)
        mood_category: Category of mood to filter by
        min_intensity: Minimum intensity value (1-10)
        max_intensity: Maximum intensity value (1-10)
        limit: Maximum number of entries to return
        
    Returns:
        List of mood entries matching the filters
    """
    db = get_db()
    collection = db.moods
    
    # Build query
    query = {}
    
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query['$gte'] = start_date
        if end_date:
            date_query['$lte'] = end_date
        query['date'] = date_query
    
    if mood_category:
        query['mood'] = mood_category
    
    if min_intensity is not None or max_intensity is not None:
        intensity_query = {}
        if min_intensity is not None:
            intensity_query['$gte'] = min_intensity
        if max_intensity is not None:
            intensity_query['$lte'] = max_intensity
        query['intensity'] = intensity_query
    
    # Execute query
    moods = list(collection.find(query).sort('date', -1).limit(limit))
    
    # Convert ObjectId to string for JSON serialization
    for mood in moods:
        mood['id'] = str(mood.pop('_id'))
    
    return moods

def get_mood_stats(start_date: Optional[str] = None,
                  end_date: Optional[str] = None) -> Dict[str, Any]:
    """
    Get mood statistics for a specified time period.
    
    Args:
        start_date: Start date for filtering entries (ISO format)
        end_date: End date for filtering entries (ISO format)
        
    Returns:
        Dictionary containing mood statistics
    """
    moods = get_moods(start_date, end_date)
    
    if not moods:
        return {
            'total_entries': 0,
            'average_intensity': 0,
            'mood_distribution': {},
            'dominant_mood': None
        }
    
    # Calculate average intensity
    intensities = [m.get('intensity', 5) for m in moods if m.get('intensity') is not None]
    avg_intensity = sum(intensities) / len(intensities) if intensities else 0
    
    # Calculate mood distribution
    mood_counts = {}
    for mood in moods:
        category = mood.get('mood', 'unknown')
        mood_counts[category] = mood_counts.get(category, 0) + 1
    
    # Calculate percentages
    total_entries = len(moods)
    mood_distribution = {
        category: (count / total_entries) * 100 
        for category, count in mood_counts.items()
    }
    
    # Find dominant mood
    dominant_mood = max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else None
    
    return {
        'total_entries': total_entries,
        'average_intensity': avg_intensity,
        'mood_distribution': mood_distribution,
        'dominant_mood': dominant_mood
    }

def detect_mood_patterns(days: int = 30) -> List[Dict[str, Any]]:
    """
    Detect patterns in mood data.
    
    Args:
        days: Number of days to analyze
        
    Returns:
        List of detected patterns
    """
    # Calculate start date (last N days)
    end_date = datetime.now().isoformat()
    start_date = (datetime.now() - datetime.timedelta(days=days)).isoformat()
    
    moods = get_moods(start_date, end_date)
    
    patterns = []
    
    # This is a simplified implementation
    # In a real implementation, you would use more sophisticated
    # time series analysis and pattern recognition algorithms
    
    # Example: Detect consecutive days with same mood
    current_mood = None
    streak = 0
    
    for mood in sorted(moods, key=lambda x: x['date']):
        if mood.get('mood') == current_mood:
            streak += 1
        else:
            if streak >= 3:  # Consider 3+ days as a pattern
                patterns.append({
                    'type': 'mood_streak',
                    'mood': current_mood,
                    'duration': streak,
                    'description': f"You felt {current_mood} for {streak} consecutive days"
                })
            current_mood = mood.get('mood')
            streak = 1
    
    # Check final streak
    if streak >= 3:
        patterns.append({
            'type': 'mood_streak',
            'mood': current_mood,
            'duration': streak,
            'description': f"You've been feeling {current_mood} for {streak} consecutive days"
        })
    
    return patterns 