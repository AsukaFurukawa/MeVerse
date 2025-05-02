"""Journal module for managing user journal entries."""

import logging
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
import os
from pathlib import Path

from app.utils.database import get_db
from app.utils.nlp import analyze_sentiment, extract_keywords
from app.personality_engine.profile import update_profile_from_journal

logger = logging.getLogger(__name__)

def save_journal_entry(entry_data: Dict[str, Any]) -> Any:
    """
    Save a journal entry to the database and analyze it for insights.
    
    Args:
        entry_data: Dictionary containing journal entry data
        
    Returns:
        The saved entry object with ID
    """
    # Get current timestamp if not provided
    if not entry_data.get('date'):
        entry_data['date'] = datetime.now().isoformat()
    
    # Analyze content for sentiment and keywords
    if 'content' in entry_data:
        # Run sentiment analysis
        sentiment = analyze_sentiment(entry_data['content'])
        entry_data['sentiment'] = sentiment
        
        # Extract keywords/topics
        keywords = extract_keywords(entry_data['content'])
        if not entry_data.get('tags'):
            entry_data['tags'] = []
        entry_data['tags'].extend(keywords)
        entry_data['tags'] = list(set(entry_data['tags']))  # Remove duplicates
    
    # Save to database
    db = get_db()
    collection = db.journal_entries
    result = collection.insert_one(entry_data)
    
    # Update user profile based on this entry
    try:
        update_profile_from_journal(entry_data)
    except Exception as e:
        logger.warning(f"Failed to update profile from journal: {str(e)}")
    
    return_data = entry_data.copy()
    return_data['id'] = str(result.inserted_id)
    
    return return_data

def get_journal_entries(start_date: Optional[str] = None, 
                        end_date: Optional[str] = None,
                        tags: Optional[List[str]] = None,
                        sentiment: Optional[str] = None,
                        limit: int = 50) -> List[Dict[str, Any]]:
    """
    Retrieve journal entries based on filters.
    
    Args:
        start_date: Start date for filtering entries (ISO format)
        end_date: End date for filtering entries (ISO format)
        tags: List of tags to filter by
        sentiment: Sentiment to filter by (e.g., "positive", "negative", "neutral")
        limit: Maximum number of entries to return
        
    Returns:
        List of journal entries matching the filters
    """
    db = get_db()
    collection = db.journal_entries
    
    # Build query
    query = {}
    
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query['$gte'] = start_date
        if end_date:
            date_query['$lte'] = end_date
        query['date'] = date_query
    
    if tags:
        query['tags'] = {'$in': tags}
    
    if sentiment:
        query['sentiment.label'] = sentiment
    
    # Execute query
    entries = list(collection.find(query).sort('date', -1).limit(limit))
    
    # Convert ObjectId to string for JSON serialization
    for entry in entries:
        entry['id'] = str(entry.pop('_id'))
    
    return entries

def delete_journal_entry(entry_id: str) -> bool:
    """
    Delete a journal entry.
    
    Args:
        entry_id: ID of the entry to delete
        
    Returns:
        True if deletion was successful, False otherwise
    """
    from bson.objectid import ObjectId
    
    db = get_db()
    collection = db.journal_entries
    
    result = collection.delete_one({'_id': ObjectId(entry_id)})
    
    return result.deleted_count > 0 