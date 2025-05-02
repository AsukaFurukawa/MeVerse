"""Personality traits module for analyzing user traits.

This module analyzes user data to determine personality traits, preferences,
and behavioral patterns.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from app.utils.database import get_db
from app.personality_engine.profile import get_profile

logger = logging.getLogger(__name__)

# Define personality trait dimensions
# Based loosely on Big Five personality traits
TRAIT_DIMENSIONS = {
    'openness': {
        'description': 'Openness to experience, creativity, and intellectual curiosity',
        'high_description': 'You are curious, creative, and open to new experiences',
        'low_description': 'You prefer routine, familiar experiences, and concrete thinking'
    },
    'conscientiousness': {
        'description': 'Organization, responsibility, and goal-oriented behavior',
        'high_description': 'You are organized, responsible, and goal-oriented',
        'low_description': 'You are flexible, spontaneous, and sometimes disorganized'
    },
    'extraversion': {
        'description': 'Sociability, assertiveness, and positive emotions',
        'high_description': 'You are outgoing, sociable, and energized by social interactions',
        'low_description': 'You are reserved, reflective, and energized by solitude'
    },
    'agreeableness': {
        'description': 'Cooperation, empathy, and consideration for others',
        'high_description': 'You are empathetic, cooperative, and considerate of others',
        'low_description': 'You are independent, analytical, and sometimes skeptical'
    },
    'emotional_stability': {
        'description': 'Resilience, calmness, and emotional regulation',
        'high_description': 'You are calm, resilient, and emotionally stable',
        'low_description': 'You experience emotions intensely and might be more sensitive'
    }
}

def get_personality_traits() -> Dict[str, Any]:
    """
    Get the user's personality traits based on their data.
    
    Returns:
        Dictionary containing personality trait scores and descriptions
    """
    # Get user profile
    profile = get_profile()
    
    # Check if we have enough data to determine traits
    if not has_sufficient_data(profile):
        return {
            'status': 'insufficient_data',
            'message': 'Not enough data to determine personality traits. Continue logging your activities.',
            'traits': {},
            'dominant_traits': []
        }
    
    # Calculate trait scores
    trait_scores = calculate_trait_scores(profile)
    
    # Add trait descriptions
    traits_with_descriptions = {}
    for trait, score in trait_scores.items():
        trait_info = TRAIT_DIMENSIONS.get(trait, {})
        description = trait_info.get('high_description' if score > 0.5 else 'low_description', '')
        
        traits_with_descriptions[trait] = {
            'score': score,
            'description': description
        }
    
    # Determine dominant traits (top 2 with scores > 0.6)
    dominant_traits = sorted(
        [(trait, data['score']) for trait, data in traits_with_descriptions.items() if data['score'] > 0.6],
        key=lambda x: x[1],
        reverse=True
    )[:2]
    
    dominant_trait_names = [trait for trait, _ in dominant_traits]
    
    return {
        'status': 'success',
        'last_updated': datetime.now().isoformat(),
        'traits': traits_with_descriptions,
        'dominant_traits': dominant_trait_names
    }

def has_sufficient_data(profile: Dict[str, Any]) -> bool:
    """
    Check if there's sufficient data to determine personality traits.
    
    Args:
        profile: User profile dictionary
        
    Returns:
        True if there's sufficient data, False otherwise
    """
    # Example criteria for sufficient data:
    # - At least 10 journal entries
    # - At least 20 mood logs
    # - At least 5 days of habit tracking
    
    activity = profile.get('activity', {})
    
    journal_entries = activity.get('journal_entries', 0)
    mood_entries = activity.get('mood_entries', 0)
    habit_entries = activity.get('habit_entries', 0)
    
    # Simple threshold check
    if journal_entries >= 10 or mood_entries >= 20 or habit_entries >= 5:
        return True
    
    return False

def calculate_trait_scores(profile: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculate personality trait scores based on user profile data.
    
    Args:
        profile: User profile dictionary
        
    Returns:
        Dictionary of trait scores (0-1 scale)
    """
    # Initialize trait scores with default values
    trait_scores = {
        'openness': 0.5,      # Neutral starting point
        'conscientiousness': 0.5,
        'extraversion': 0.5,
        'agreeableness': 0.5,
        'emotional_stability': 0.5
    }
    
    # Calculate trait scores based on various data points
    # These are simplified heuristics and would be more sophisticated in a real system
    
    # --- Openness ---
    # Indicators: Variety of interests, creative activities, learning
    topics = profile.get('topics', {})
    topic_variety = len(topics)
    
    if topic_variety > 20:
        trait_scores['openness'] += 0.2
    elif topic_variety > 10:
        trait_scores['openness'] += 0.1
    
    # Keywords that might indicate openness
    open_keywords = ['learn', 'art', 'create', 'explore', 'new', 'idea', 'curious']
    open_topic_count = sum(1 for topic in topics if any(kw in topic.lower() for kw in open_keywords))
    
    if open_topic_count > 5:
        trait_scores['openness'] += 0.2
    elif open_topic_count > 2:
        trait_scores['openness'] += 0.1
    
    # --- Conscientiousness ---
    # Indicators: Habit completion, organization, planning
    habits = profile.get('habits', {})
    
    completed_habits = 0
    missed_habits = 0
    
    for habit_name, habit_data in habits.items():
        completed_habits += habit_data.get('completed', 0)
        missed_habits += habit_data.get('missed', 0)
    
    if completed_habits + missed_habits > 0:
        completion_rate = completed_habits / (completed_habits + missed_habits)
        
        if completion_rate > 0.8:
            trait_scores['conscientiousness'] += 0.3
        elif completion_rate > 0.6:
            trait_scores['conscientiousness'] += 0.1
        elif completion_rate < 0.4:
            trait_scores['conscientiousness'] -= 0.1
    
    # --- Extraversion ---
    # Indicators: Social activities, positive emotions, energy levels
    calendar = profile.get('calendar', {})
    event_types = calendar.get('event_types', {})
    
    social_events = event_types.get('social', 0) + event_types.get('meetings', 0)
    
    if social_events > 10:
        trait_scores['extraversion'] += 0.2
    elif social_events > 5:
        trait_scores['extraversion'] += 0.1
    
    # Check mood patterns for positive emotions
    moods = profile.get('moods', {})
    positive_moods = sum(moods.get(mood, 0) for mood in ['happy', 'excited', 'content'])
    negative_moods = sum(moods.get(mood, 0) for mood in ['sad', 'anxious', 'angry'])
    
    if positive_moods + negative_moods > 0:
        positivity_ratio = positive_moods / (positive_moods + negative_moods)
        
        if positivity_ratio > 0.7:
            trait_scores['extraversion'] += 0.1
            trait_scores['emotional_stability'] += 0.2
        elif positivity_ratio < 0.3:
            trait_scores['emotional_stability'] -= 0.2
    
    # --- Agreeableness ---
    # This is harder to determine from basic data, would need more sophisticated analysis
    # of journal content, communication patterns, etc.
    
    # --- Emotional Stability ---
    # Indicators: Mood variability, stress levels, resilience
    mood_intensity = profile.get('mood_intensity', {})
    
    # Calculate mood variability (simplified)
    if mood_intensity:
        mood_variability = 0
        mood_count = 0
        
        for mood, data in mood_intensity.items():
            if 'total' in data and 'count' in data and data['count'] > 0:
                avg_intensity = data['total'] / data['count']
                mood_variability += avg_intensity
                mood_count += 1
        
        if mood_count > 0:
            avg_variability = mood_variability / mood_count
            
            if avg_variability > 7:  # High intensity moods
                trait_scores['emotional_stability'] -= 0.2
    
    # Ensure all scores are between 0 and 1
    for trait in trait_scores:
        trait_scores[trait] = max(0, min(1, trait_scores[trait]))
    
    return trait_scores 