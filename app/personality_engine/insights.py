"""Insights module for generating personality insights.

This module analyzes user data to generate insights about behavior patterns,
preferences, and potential areas for improvement.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import random

from app.utils.database import get_db
from app.personality_engine.profile import get_profile
from app.personality_engine.traits import get_personality_traits

logger = logging.getLogger(__name__)

def get_personality_insights() -> List[Dict[str, Any]]:
    """
    Get insights about the user's personality.
    
    Returns:
        List of insight dictionaries
    """
    # Get user profile
    profile = get_profile()
    
    # Generate insights
    all_insights = []
    
    # Add productivity insights
    productivity_insights = generate_productivity_insights(profile)
    all_insights.extend(productivity_insights)
    
    # Add habit insights
    habit_insights = generate_habit_insights(profile)
    all_insights.extend(habit_insights)
    
    # Add mood insights
    mood_insights = generate_mood_insights(profile)
    all_insights.extend(mood_insights)
    
    # Add social insights
    social_insights = generate_social_insights(profile)
    all_insights.extend(social_insights)
    
    # Add personality trait-based insights
    trait_insights = generate_trait_based_insights(profile)
    all_insights.extend(trait_insights)
    
    # Sort insights by relevance (more recently generated or higher confidence)
    sorted_insights = sorted(
        all_insights,
        key=lambda x: (x.get('confidence', 0), x.get('generated_at', '')),
        reverse=True
    )
    
    return sorted_insights

def generate_productivity_insights(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate insights related to productivity patterns.
    
    Args:
        profile: User profile dictionary
        
    Returns:
        List of productivity insights
    """
    insights = []
    
    # Check if we have enough data
    habits = profile.get('habits', {})
    if not habits:
        return insights
    
    # Analyze completion rates for different habits
    high_completion_habits = []
    low_completion_habits = []
    
    for habit_name, habit_data in habits.items():
        completed = habit_data.get('completed', 0)
        missed = habit_data.get('missed', 0)
        
        if completed + missed >= 5:  # Only consider habits with enough data
            completion_rate = completed / (completed + missed) if completed + missed > 0 else 0
            
            if completion_rate >= 0.8:
                high_completion_habits.append(habit_name)
            elif completion_rate <= 0.4:
                low_completion_habits.append(habit_name)
    
    # Generate insights based on high-completion habits
    if high_completion_habits:
        habits_str = ", ".join(high_completion_habits[:3])  # Limit to 3 for readability
        
        insights.append({
            'id': 'productivity_strength',
            'type': 'productivity',
            'subtype': 'strength',
            'title': 'Productivity Strength',
            'content': f"You consistently excel at {habits_str}. These are your strength habits that you can rely on.",
            'confidence': 0.8,
            'generated_at': datetime.now().isoformat()
        })
    
    # Generate insights based on low-completion habits
    if low_completion_habits:
        habits_str = ", ".join(low_completion_habits[:3])  # Limit to 3 for readability
        
        insights.append({
            'id': 'productivity_improvement',
            'type': 'productivity',
            'subtype': 'improvement',
            'title': 'Area for Improvement',
            'content': f"You struggle with consistently completing {habits_str}. Consider setting smaller goals or finding ways to make these activities more enjoyable.",
            'confidence': 0.7,
            'generated_at': datetime.now().isoformat()
        })
    
    return insights

def generate_habit_insights(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate insights related to habit patterns.
    
    Args:
        profile: User profile dictionary
        
    Returns:
        List of habit insights
    """
    insights = []
    
    # Check if we have enough data
    habits = profile.get('habits', {})
    if not habits:
        return insights
    
    # Calculate average durations for habits that have duration data
    habits_with_duration = {}
    
    for habit_name, habit_data in habits.items():
        total_duration = habit_data.get('total_duration', 0)
        duration_count = habit_data.get('duration_count', 0)
        
        if duration_count > 0:
            avg_duration = total_duration / duration_count
            habits_with_duration[habit_name] = avg_duration
    
    # Generate insight about time investment
    if habits_with_duration:
        # Find habit with highest time investment
        max_habit = max(habits_with_duration.items(), key=lambda x: x[1])
        
        insights.append({
            'id': 'habit_time_investment',
            'type': 'habit',
            'subtype': 'time_investment',
            'title': 'Time Investment',
            'content': f"You spend the most time on {max_habit[0]}, averaging {round(max_habit[1])} minutes per session. This reflects your priorities.",
            'confidence': 0.75,
            'generated_at': datetime.now().isoformat()
        })
    
    return insights

def generate_mood_insights(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate insights related to mood patterns.
    
    Args:
        profile: User profile dictionary
        
    Returns:
        List of mood insights
    """
    insights = []
    
    # Check if we have enough data
    moods = profile.get('moods', {})
    if not moods:
        return insights
    
    # Determine dominant moods
    total_mood_entries = sum(moods.values())
    
    if total_mood_entries >= 10:  # Ensure we have enough data
        # Calculate mood percentages
        mood_percentages = {mood: (count / total_mood_entries) * 100 for mood, count in moods.items()}
        
        # Find dominant mood (highest percentage)
        dominant_mood = max(mood_percentages.items(), key=lambda x: x[1])
        
        # Generate insight for dominant mood
        insights.append({
            'id': 'mood_dominant',
            'type': 'mood',
            'subtype': 'dominant',
            'title': 'Emotional Pattern',
            'content': f"Your dominant mood is '{dominant_mood[0]}', accounting for {round(dominant_mood[1])}% of your recorded moods. This suggests you often experience this emotional state.",
            'confidence': 0.8,
            'generated_at': datetime.now().isoformat()
        })
        
        # Check for mood variability
        if len(moods) >= 3 and total_mood_entries >= 20:
            mood_variety = len([m for m, p in mood_percentages.items() if p >= 10])  # Count moods that make up at least 10%
            
            if mood_variety >= 4:
                insights.append({
                    'id': 'mood_variability',
                    'type': 'mood',
                    'subtype': 'variability',
                    'title': 'Emotional Variability',
                    'content': "You experience a wide range of emotions regularly. This emotional variety indicates a rich inner experience.",
                    'confidence': 0.7,
                    'generated_at': datetime.now().isoformat()
                })
            elif mood_variety <= 2:
                insights.append({
                    'id': 'mood_stability',
                    'type': 'mood',
                    'subtype': 'stability',
                    'title': 'Emotional Stability',
                    'content': "Your mood tends to be consistent, with less variability than average. This suggests emotional stability.",
                    'confidence': 0.7,
                    'generated_at': datetime.now().isoformat()
                })
    
    return insights

def generate_social_insights(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate insights related to social patterns.
    
    Args:
        profile: User profile dictionary
        
    Returns:
        List of social insights
    """
    insights = []
    
    # Check if we have calendar data
    calendar = profile.get('calendar', {})
    event_types = calendar.get('event_types', {})
    
    if not event_types:
        return insights
    
    # Calculate social event ratio
    total_events = calendar.get('total_events', 0)
    social_events = event_types.get('social', 0) + event_types.get('meetings', 0)
    
    if total_events >= 10:  # Ensure we have enough data
        social_ratio = social_events / total_events if total_events > 0 else 0
        
        if social_ratio >= 0.6:
            insights.append({
                'id': 'social_orientation',
                'type': 'social',
                'subtype': 'extraversion',
                'title': 'Social Orientation',
                'content': f"You spend about {round(social_ratio * 100)}% of your scheduled time in social activities. This suggests you're energized by social interactions.",
                'confidence': 0.75,
                'generated_at': datetime.now().isoformat()
            })
        elif social_ratio <= 0.2:
            insights.append({
                'id': 'social_orientation',
                'type': 'social',
                'subtype': 'introversion',
                'title': 'Social Orientation',
                'content': f"Only about {round(social_ratio * 100)}% of your scheduled activities involve social interaction. You may be more energized by solitude and focused work.",
                'confidence': 0.75,
                'generated_at': datetime.now().isoformat()
            })
    
    return insights

def generate_trait_based_insights(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate insights based on personality traits.
    
    Args:
        profile: User profile dictionary
        
    Returns:
        List of trait-based insights
    """
    insights = []
    
    # Get personality traits
    traits_data = get_personality_traits()
    
    if traits_data.get('status') == 'insufficient_data':
        return insights
    
    traits = traits_data.get('traits', {})
    
    # Generate insights based on dominant traits
    for trait, data in traits.items():
        score = data.get('score', 0.5)
        
        if score >= 0.7:  # Highly expressed trait
            # Generate trait-specific insights
            if trait == 'openness':
                insights.append({
                    'id': 'trait_openness',
                    'type': 'trait',
                    'subtype': 'strength',
                    'title': 'Creative Potential',
                    'content': "Your high openness score suggests you have strong creative potential. You likely enjoy exploring new ideas and experiences. Consider channeling this into creative projects or learning new skills.",
                    'confidence': 0.8,
                    'generated_at': datetime.now().isoformat()
                })
            
            elif trait == 'conscientiousness':
                insights.append({
                    'id': 'trait_conscientiousness',
                    'type': 'trait',
                    'subtype': 'strength',
                    'title': 'Productivity Strength',
                    'content': "Your high conscientiousness indicates you're naturally organized and goal-oriented. You excel at planning and following through on commitments. This trait is highly correlated with professional success.",
                    'confidence': 0.8,
                    'generated_at': datetime.now().isoformat()
                })
            
            elif trait == 'extraversion':
                insights.append({
                    'id': 'trait_extraversion',
                    'type': 'trait',
                    'subtype': 'strength',
                    'title': 'Social Energy',
                    'content': "Your extraversion score suggests you gain energy from social interactions. You likely excel in collaborative environments and social settings. Consider leveraging this trait in team-based projects.",
                    'confidence': 0.8,
                    'generated_at': datetime.now().isoformat()
                })
            
            elif trait == 'agreeableness':
                insights.append({
                    'id': 'trait_agreeableness',
                    'type': 'trait',
                    'subtype': 'strength',
                    'title': 'Collaborative Strength',
                    'content': "Your high agreeableness indicates you're naturally cooperative and empathetic. You likely excel in team environments and relationship-building. This trait is valuable in roles requiring emotional intelligence.",
                    'confidence': 0.8,
                    'generated_at': datetime.now().isoformat()
                })
            
            elif trait == 'emotional_stability':
                insights.append({
                    'id': 'trait_emotional_stability',
                    'type': 'trait',
                    'subtype': 'strength',
                    'title': 'Resilience',
                    'content': "Your high emotional stability suggests you're naturally resilient to stress and able to maintain calm under pressure. This trait is valuable in high-pressure environments and leadership roles.",
                    'confidence': 0.8,
                    'generated_at': datetime.now().isoformat()
                })
        
        elif score <= 0.3:  # Low expression of trait
            # Generate insights for potential growth areas
            if trait == 'openness':
                insights.append({
                    'id': 'trait_openness_growth',
                    'type': 'trait',
                    'subtype': 'growth',
                    'title': 'Expanding Horizons',
                    'content': "Your preference for routine and the familiar provides stability, but occasionally trying new experiences or perspectives might lead to unexpected growth. Consider small, comfortable steps outside your routine.",
                    'confidence': 0.7,
                    'generated_at': datetime.now().isoformat()
                })
            
            elif trait == 'conscientiousness':
                insights.append({
                    'id': 'trait_conscientiousness_growth',
                    'type': 'trait',
                    'subtype': 'growth',
                    'title': 'Structure Building',
                    'content': "While your spontaneous approach has advantages, developing a few structured routines for important areas might reduce stress. Simple planning tools or reminders could complement your flexible style.",
                    'confidence': 0.7,
                    'generated_at': datetime.now().isoformat()
                })
    
    return insights 