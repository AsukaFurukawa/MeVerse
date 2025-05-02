"""Progress module for tracking user progress over time."""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from app.utils.database import get_db
from app.data_ingestion.journal import get_journal_entries
from app.data_ingestion.habit import get_habits
from app.data_ingestion.mood import get_moods
from app.data_ingestion.calendar import get_calendar_events

logger = logging.getLogger(__name__)

def get_progress(start_date: str, end_date: str, period: str = "month") -> Dict[str, Any]:
    """
    Get progress data for the specified time range.
    
    Args:
        start_date: Start date (ISO format)
        end_date: End date (ISO format)
        period: Time period for aggregation (day, week, month)
        
    Returns:
        Dictionary containing progress data
    """
    # Get data from various sources
    journals = get_journal_entries(start_date, end_date)
    habits = get_habits(start_date, end_date)
    moods = get_moods(start_date, end_date)
    events = get_calendar_events(start_date, end_date)
    
    # Track metrics over time
    metrics = {}
    
    # Track journal metrics
    metrics['journal'] = track_journal_metrics(journals, period)
    
    # Track habit metrics
    metrics['habits'] = track_habit_metrics(habits, period)
    
    # Track mood metrics
    metrics['moods'] = track_mood_metrics(moods, period)
    
    # Track calendar metrics
    metrics['calendar'] = track_calendar_metrics(events, period)
    
    # Calculate overall progress
    overall = calculate_overall_progress(metrics)
    
    return {
        'start_date': start_date,
        'end_date': end_date,
        'period': period,
        'metrics': metrics,
        'overall': overall
    }

def track_journal_metrics(journals: List[Dict[str, Any]], period: str) -> Dict[str, Any]:
    """
    Track journal metrics over time.
    
    Args:
        journals: List of journal entries
        period: Time period for aggregation
        
    Returns:
        Dictionary containing journal metrics
    """
    if not journals:
        return {'entries_count': 0, 'avg_length': 0, 'sentiment_trend': None}
    
    # Convert to DataFrame for easier analysis
    df = pd.DataFrame(journals)
    
    # Ensure date column is datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Set date as index
    df.set_index('date', inplace=True)
    
    # Group by period
    if period == 'day':
        grouped = df.groupby(pd.Grouper(freq='D'))
    elif period == 'week':
        grouped = df.groupby(pd.Grouper(freq='W'))
    else:  # default to month
        grouped = df.groupby(pd.Grouper(freq='M'))
    
    # Count entries per period
    entries_count = grouped.size().to_dict()
    
    # Calculate average entry length per period
    df['content_length'] = df['content'].apply(lambda x: len(x) if isinstance(x, str) else 0)
    avg_length = grouped['content_length'].mean().to_dict()
    
    # Track sentiment trend if available
    sentiment_trend = {}
    if 'sentiment' in df.columns:
        df['sentiment_value'] = df['sentiment'].apply(lambda x: x.get('polarity', 0) if isinstance(x, dict) else 0)
        sentiment_trend = grouped['sentiment_value'].mean().to_dict()
    
    # Convert datetime keys to strings for JSON serialization
    entries_count = {k.strftime('%Y-%m-%d'): v for k, v in entries_count.items()}
    avg_length = {k.strftime('%Y-%m-%d'): v for k, v in avg_length.items()}
    if sentiment_trend:
        sentiment_trend = {k.strftime('%Y-%m-%d'): v for k, v in sentiment_trend.items()}
    
    return {
        'entries_count': entries_count,
        'avg_length': avg_length,
        'sentiment_trend': sentiment_trend
    }

def track_habit_metrics(habits: List[Dict[str, Any]], period: str) -> Dict[str, Any]:
    """
    Track habit metrics over time.
    
    Args:
        habits: List of habit entries
        period: Time period for aggregation
        
    Returns:
        Dictionary containing habit metrics
    """
    if not habits:
        return {'completion_rate': 0, 'habits_by_period': {}}
    
    # Convert to DataFrame for easier analysis
    df = pd.DataFrame(habits)
    
    # Ensure date column is datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Set date as index
    df.set_index('date', inplace=True)
    
    # Group by period and habit name
    if period == 'day':
        grouped = df.groupby([pd.Grouper(freq='D'), 'name'])
    elif period == 'week':
        grouped = df.groupby([pd.Grouper(freq='W'), 'name'])
    else:  # default to month
        grouped = df.groupby([pd.Grouper(freq='M'), 'name'])
    
    # Calculate completion rate per period and habit
    habits_by_period = {}
    
    for (period_date, habit_name), group in grouped:
        period_key = period_date.strftime('%Y-%m-%d')
        
        if period_key not in habits_by_period:
            habits_by_period[period_key] = {}
        
        completed = group['completed'].sum()
        total = len(group)
        
        if total > 0:
            completion_rate = (completed / total) * 100
        else:
            completion_rate = 0
        
        habits_by_period[period_key][habit_name] = {
            'completed': int(completed),
            'total': total,
            'completion_rate': completion_rate
        }
    
    # Calculate overall completion rate
    overall_completed = df['completed'].sum()
    overall_total = len(df)
    
    if overall_total > 0:
        overall_completion_rate = (overall_completed / overall_total) * 100
    else:
        overall_completion_rate = 0
    
    return {
        'completion_rate': overall_completion_rate,
        'habits_by_period': habits_by_period
    }

def track_mood_metrics(moods: List[Dict[str, Any]], period: str) -> Dict[str, Any]:
    """
    Track mood metrics over time.
    
    Args:
        moods: List of mood entries
        period: Time period for aggregation
        
    Returns:
        Dictionary containing mood metrics
    """
    if not moods:
        return {'avg_intensity': 0, 'mood_distribution': {}, 'moods_by_period': {}}
    
    # Convert to DataFrame for easier analysis
    df = pd.DataFrame(moods)
    
    # Ensure date column is datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Set date as index
    df.set_index('date', inplace=True)
    
    # Group by period
    if period == 'day':
        grouped = df.groupby(pd.Grouper(freq='D'))
    elif period == 'week':
        grouped = df.groupby(pd.Grouper(freq='W'))
    else:  # default to month
        grouped = df.groupby(pd.Grouper(freq='M'))
    
    # Calculate average mood intensity per period
    avg_intensity_by_period = {}
    mood_distribution_by_period = {}
    
    for period_date, group in grouped:
        period_key = period_date.strftime('%Y-%m-%d')
        
        # Average intensity
        if 'intensity' in group.columns:
            avg_intensity_by_period[period_key] = group['intensity'].mean()
        else:
            avg_intensity_by_period[period_key] = 0
        
        # Mood distribution
        if 'mood' in group.columns:
            mood_counts = group['mood'].value_counts().to_dict()
            mood_distribution_by_period[period_key] = mood_counts
    
    # Calculate overall mood distribution
    overall_mood_distribution = df['mood'].value_counts().to_dict() if 'mood' in df.columns else {}
    
    # Calculate overall average intensity
    overall_avg_intensity = df['intensity'].mean() if 'intensity' in df.columns else 0
    
    return {
        'avg_intensity': overall_avg_intensity,
        'mood_distribution': overall_mood_distribution,
        'moods_by_period': {
            'avg_intensity': avg_intensity_by_period,
            'distribution': mood_distribution_by_period
        }
    }

def track_calendar_metrics(events: List[Dict[str, Any]], period: str) -> Dict[str, Any]:
    """
    Track calendar metrics over time.
    
    Args:
        events: List of calendar events
        period: Time period for aggregation
        
    Returns:
        Dictionary containing calendar metrics
    """
    if not events:
        return {'events_count': 0, 'events_by_period': {}}
    
    # Convert to DataFrame for easier analysis
    df = pd.DataFrame(events)
    
    # Ensure start date column is datetime
    df['start'] = pd.to_datetime(df['start'])
    
    # Set start date as index
    df.set_index('start', inplace=True)
    
    # Group by period
    if period == 'day':
        grouped = df.groupby(pd.Grouper(freq='D'))
    elif period == 'week':
        grouped = df.groupby(pd.Grouper(freq='W'))
    else:  # default to month
        grouped = df.groupby(pd.Grouper(freq='M'))
    
    # Count events per period
    events_count = grouped.size().to_dict()
    
    # Convert datetime keys to strings for JSON serialization
    events_count = {k.strftime('%Y-%m-%d'): v for k, v in events_count.items()}
    
    return {
        'events_count': len(events),
        'events_by_period': events_count
    }

def calculate_overall_progress(metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate overall progress metrics.
    
    Args:
        metrics: Dictionary of metrics by category
        
    Returns:
        Dictionary containing overall progress metrics
    """
    # This is a simplified calculation of overall progress
    # In a real implementation, you would use more sophisticated
    # analysis techniques
    
    overall = {
        'activity_score': 0,
        'consistency_score': 0,
        'growth_areas': [],
        'strength_areas': []
    }
    
    # Calculate activity score
    activity_components = []
    
    # Journal activity
    journal_metrics = metrics.get('journal', {})
    journal_entries_count = sum(journal_metrics.get('entries_count', {}).values())
    journal_activity_score = min(100, journal_entries_count * 10)  # 10 points per entry, max 100
    activity_components.append(journal_activity_score)
    
    # Habit activity
    habit_metrics = metrics.get('habits', {})
    habit_completion_rate = habit_metrics.get('completion_rate', 0)
    activity_components.append(habit_completion_rate)
    
    # Mood tracking activity
    mood_metrics = metrics.get('moods', {})
    mood_entries_count = len(mood_metrics.get('mood_distribution', {}))
    mood_activity_score = min(100, mood_entries_count * 5)  # 5 points per mood entry, max 100
    activity_components.append(mood_activity_score)
    
    # Calendar activity
    calendar_metrics = metrics.get('calendar', {})
    events_count = calendar_metrics.get('events_count', 0)
    calendar_activity_score = min(100, events_count * 2)  # 2 points per event, max 100
    activity_components.append(calendar_activity_score)
    
    # Average the activity components
    if activity_components:
        overall['activity_score'] = sum(activity_components) / len(activity_components)
    
    # Identify growth areas
    if journal_activity_score < 50:
        overall['growth_areas'].append('journal_entries')
    
    if habit_completion_rate < 50:
        overall['growth_areas'].append('habit_consistency')
    
    if mood_activity_score < 50:
        overall['growth_areas'].append('mood_tracking')
    
    # Identify strength areas
    if journal_activity_score >= 70:
        overall['strength_areas'].append('journal_entries')
    
    if habit_completion_rate >= 70:
        overall['strength_areas'].append('habit_consistency')
    
    if mood_activity_score >= 70:
        overall['strength_areas'].append('mood_tracking')
    
    # Calculate consistency score based on regularity of entries
    journal_entries = journal_metrics.get('entries_count', {})
    periods_with_entries = sum(1 for count in journal_entries.values() if count > 0)
    total_periods = len(journal_entries) if journal_entries else 1
    
    if total_periods > 0:
        journal_consistency = (periods_with_entries / total_periods) * 100
    else:
        journal_consistency = 0
    
    mood_entries = mood_metrics.get('moods_by_period', {}).get('distribution', {})
    periods_with_moods = sum(1 for counts in mood_entries.values() if counts)
    total_mood_periods = len(mood_entries) if mood_entries else 1
    
    if total_mood_periods > 0:
        mood_consistency = (periods_with_moods / total_mood_periods) * 100
    else:
        mood_consistency = 0
    
    # Average the consistency components
    consistency_components = [journal_consistency, mood_consistency]
    if consistency_components:
        overall['consistency_score'] = sum(consistency_components) / len(consistency_components)
    
    return overall 