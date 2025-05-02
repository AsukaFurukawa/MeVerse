"""User profile module for the personality engine.

This module manages the user's profile, which contains information about their
personality traits, preferences, habits, and other behavioral patterns.
"""

import logging
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
import os

from app.utils.database import get_db

logger = logging.getLogger(__name__)

def get_profile() -> Dict[str, Any]:
    """
    Get the user's profile.
    
    Returns:
        Dictionary containing the user's profile data
    """
    db = get_db()
    collection = db.user_profile
    
    # Get the user profile (there should only be one document)
    profile = collection.find_one({})
    
    if not profile:
        # Create a new profile if it doesn't exist
        profile = {
            'created_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),
            'traits': {},
            'preferences': {},
            'patterns': {},
            'insights': [],
            'metadata': {}
        }
        
        collection.insert_one(profile)
        profile['id'] = str(profile.pop('_id'))
    else:
        profile['id'] = str(profile.pop('_id'))
    
    return profile

def update_profile(data: Dict[str, Any], override_existing: bool = False) -> Dict[str, Any]:
    """
    Update the user's profile.
    
    Args:
        data: Dictionary containing profile data to update
        override_existing: Whether to override existing data or merge it
        
    Returns:
        Updated profile
    """
    db = get_db()
    collection = db.user_profile
    
    # Get existing profile
    profile = collection.find_one({})
    
    if not profile:
        # Create a new profile if it doesn't exist
        profile = {
            'created_at': datetime.now().isoformat(),
            'traits': {},
            'preferences': {},
            'patterns': {},
            'insights': [],
            'metadata': {}
        }
    
    # Update profile data
    if override_existing:
        # Simply replace top-level keys with new data
        for key, value in data.items():
            profile[key] = value
    else:
        # Recursively merge nested dictionaries
        for key, value in data.items():
            if key in profile and isinstance(profile[key], dict) and isinstance(value, dict):
                # Merge dictionaries
                profile[key].update(value)
            elif key in profile and isinstance(profile[key], list) and isinstance(value, list):
                # For lists, just append new items
                profile[key].extend(value)
                # Remove duplicates if items are simple types
                if all(not isinstance(x, (dict, list)) for x in profile[key]):
                    profile[key] = list(set(profile[key]))
            else:
                # Otherwise, just replace the value
                profile[key] = value
    
    # Update timestamp
    profile['last_updated'] = datetime.now().isoformat()
    
    # Update in database
    if '_id' in profile:
        profile_id = profile.pop('_id')
        collection.update_one({'_id': profile_id}, {'$set': profile})
        profile['id'] = str(profile_id)
    else:
        result = collection.insert_one(profile)
        profile['id'] = str(result.inserted_id)
    
    return profile

def update_profile_from_journal(journal_entry: Dict[str, Any]) -> None:
    """
    Update the user profile based on a journal entry.
    
    Args:
        journal_entry: Dictionary containing journal entry data
    """
    # Extract insights from the journal entry
    updates = {}
    
    # Extract mood information if available
    if 'sentiment' in journal_entry:
        sentiment = journal_entry['sentiment']
        
        # Update mood patterns
        mood_key = f"moods.{sentiment['label']}"
        updates[mood_key] = updates.get(mood_key, 0) + 1
    
    # Extract topics/tags
    if 'tags' in journal_entry and journal_entry['tags']:
        for tag in journal_entry['tags']:
            tag_key = f"topics.{tag}"
            updates[tag_key] = updates.get(tag_key, 0) + 1
    
    # Add journal entry count
    updates['activity.journal_entries'] = 1  # Will be incremented using $inc
    
    # Update profile with new data
    if updates:
        db = get_db()
        collection = db.user_profile
        
        # Use $inc to increment values
        inc_updates = {}
        for key, value in updates.items():
            inc_updates[key] = value
        
        collection.update_one(
            {}, 
            {
                '$inc': inc_updates,
                '$set': {'last_updated': datetime.now().isoformat()}
            },
            upsert=True
        )

def update_profile_from_habit(habit_data: Dict[str, Any]) -> None:
    """
    Update the user profile based on habit data.
    
    Args:
        habit_data: Dictionary containing habit data
    """
    # Extract insights from the habit data
    updates = {}
    
    # Get habit name
    habit_name = habit_data.get('name', 'unknown')
    
    # Update habit tracking
    if habit_data.get('completed', False):
        habit_key = f"habits.{habit_name}.completed"
        updates[habit_key] = 1  # Will be incremented
    else:
        habit_key = f"habits.{habit_name}.missed"
        updates[habit_key] = 1  # Will be incremented
    
    # Track durations if available
    if 'duration' in habit_data and habit_data['duration'] is not None:
        duration_key = f"habits.{habit_name}.total_duration"
        updates[duration_key] = habit_data['duration']
        
        count_key = f"habits.{habit_name}.duration_count"
        updates[count_key] = 1
    
    # Add habit tracking count
    updates['activity.habit_entries'] = 1
    
    # Update profile with new data
    if updates:
        db = get_db()
        collection = db.user_profile
        
        # Use $inc to increment values
        inc_updates = {}
        for key, value in updates.items():
            inc_updates[key] = value
        
        collection.update_one(
            {}, 
            {
                '$inc': inc_updates,
                '$set': {'last_updated': datetime.now().isoformat()}
            },
            upsert=True
        )

def update_profile_from_mood(mood_data: Dict[str, Any]) -> None:
    """
    Update the user profile based on mood data.
    
    Args:
        mood_data: Dictionary containing mood data
    """
    # Extract insights from the mood data
    updates = {}
    
    # Get mood category
    mood_category = mood_data.get('mood', 'unknown')
    
    # Update mood tracking
    mood_key = f"moods.{mood_category}"
    updates[mood_key] = 1  # Will be incremented
    
    # Track intensity if available
    if 'intensity' in mood_data and mood_data['intensity'] is not None:
        intensity_key = f"mood_intensity.{mood_category}.total"
        updates[intensity_key] = mood_data['intensity']
        
        count_key = f"mood_intensity.{mood_category}.count"
        updates[count_key] = 1
    
    # Add mood tracking count
    updates['activity.mood_entries'] = 1
    
    # Update profile with new data
    if updates:
        db = get_db()
        collection = db.user_profile
        
        # Use $inc to increment values
        inc_updates = {}
        for key, value in updates.items():
            inc_updates[key] = value
        
        collection.update_one(
            {}, 
            {
                '$inc': inc_updates,
                '$set': {'last_updated': datetime.now().isoformat()}
            },
            upsert=True
        )

def update_profile_from_calendar(events: List[Dict[str, Any]]) -> None:
    """
    Update the user profile based on calendar events.
    
    Args:
        events: List of calendar events
    """
    if not events:
        return
    
    # Extract insights from the calendar events
    updates = {}
    
    # Process each event
    for event in events:
        # Count events by type (determined by keywords in summary)
        summary = event.get('summary', '').lower()
        
        # Simple categorization based on keywords
        if any(kw in summary for kw in ['meeting', 'call', 'discussion', 'interview']):
            event_type = 'meetings'
        elif any(kw in summary for kw in ['work', 'task', 'project', 'deadline']):
            event_type = 'work'
        elif any(kw in summary for kw in ['class', 'lecture', 'study', 'exam', 'assignment']):
            event_type = 'education'
        elif any(kw in summary for kw in ['gym', 'workout', 'exercise', 'fitness']):
            event_type = 'fitness'
        elif any(kw in summary for kw in ['doctor', 'appointment', 'dentist', 'therapy']):
            event_type = 'health'
        elif any(kw in summary for kw in ['lunch', 'dinner', 'breakfast', 'coffee']):
            event_type = 'meals'
        elif any(kw in summary for kw in ['party', 'celebration', 'social', 'hangout']):
            event_type = 'social'
        else:
            event_type = 'other'
        
        # Increment event type count
        event_type_key = f"calendar.event_types.{event_type}"
        updates[event_type_key] = updates.get(event_type_key, 0) + 1
    
    # Add calendar sync count
    updates['activity.calendar_syncs'] = 1
    updates['calendar.total_events'] = len(events)
    
    # Update profile with new data
    if updates:
        db = get_db()
        collection = db.user_profile
        
        # Use $inc to increment values
        inc_updates = {}
        for key, value in updates.items():
            inc_updates[key] = value
        
        collection.update_one(
            {}, 
            {
                '$inc': inc_updates,
                '$set': {'last_updated': datetime.now().isoformat()}
            },
            upsert=True
        ) 