"""Path generator module for creating optimal paths to reach goals."""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import random

from app.utils.database import get_db
from app.personality_engine.profile import get_profile
from app.personality_engine.traits import get_personality_traits

logger = logging.getLogger(__name__)

def generate_optimal_path(path_request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate an optimal path to reach a goal.
    
    Args:
        path_request: Dictionary containing path request data
        
    Returns:
        Dictionary containing path generation results
    """
    # Extract request details
    goal = path_request.get('goal', '')
    constraints = path_request.get('constraints', [])
    timeframe = path_request.get('timeframe', '1 year')
    area = path_request.get('area')
    
    # Log the path generation request
    logger.info(f"Generating path for goal: {goal} (timeframe: {timeframe}, area: {area})")
    
    # Get user profile
    profile = get_profile()
    
    # Get personality traits
    traits_data = get_personality_traits()
    traits = {}
    if traits_data.get('status') == 'success':
        traits = {
            trait: data.get('score', 0.5) 
            for trait, data in traits_data.get('traits', {}).items()
        }
    
    # Store the path generation in the database
    db = get_db()
    collection = db.paths
    
    path_record = {
        'goal': goal,
        'constraints': constraints,
        'timeframe': timeframe,
        'area': area,
        'created_at': datetime.now().isoformat()
    }
    
    # Detect area if not provided
    if not area:
        area = detect_goal_area(goal)
    
    # Generate path
    if area == 'career':
        path = generate_career_path(goal, constraints, timeframe, traits)
    elif area == 'education':
        path = generate_education_path(goal, constraints, timeframe, traits)
    elif area == 'relationships':
        path = generate_relationship_path(goal, constraints, timeframe, traits)
    elif area == 'health':
        path = generate_health_path(goal, constraints, timeframe, traits)
    else:
        path = generate_generic_path(goal, constraints, timeframe, traits)
    
    # Add the result to the path record
    path_record['path'] = path
    
    # Save the path record
    collection.insert_one(path_record)
    
    return {
        'goal': goal,
        'timeframe': timeframe,
        'area': area,
        'created_at': datetime.now().isoformat(),
        'path': path
    }

def detect_goal_area(goal: str) -> str:
    """
    Detect the area of life a goal pertains to.
    
    Args:
        goal: The goal statement
        
    Returns:
        Detected area (career, education, relationships, health, or other)
    """
    goal_lower = goal.lower()
    
    # Career keywords
    if any(kw in goal_lower for kw in ['job', 'career', 'work', 'profession', 'business', 'employment', 'salary', 'income']):
        return 'career'
    
    # Education keywords
    if any(kw in goal_lower for kw in ['study', 'education', 'school', 'college', 'university', 'degree', 'course', 'learn']):
        return 'education'
    
    # Relationship keywords
    if any(kw in goal_lower for kw in ['relationship', 'partner', 'marriage', 'girlfriend', 'boyfriend', 'spouse', 'friend', 'family']):
        return 'relationships'
    
    # Health keywords
    if any(kw in goal_lower for kw in ['health', 'exercise', 'diet', 'weight', 'fitness', 'doctor', 'medical', 'wellness']):
        return 'health'
    
    # Default
    return 'other'

def generate_generic_path(goal: str, constraints: List[str], timeframe: str, traits: Dict[str, float]) -> Dict[str, Any]:
    """
    Generate a generic path to reach a goal.
    
    Args:
        goal: The goal statement
        constraints: List of constraints
        timeframe: Timeframe for reaching the goal
        traits: Dictionary of personality trait scores
        
    Returns:
        Dictionary containing path generation results
    """
    # Parse timeframe to get duration
    duration_months = parse_timeframe(timeframe)
    
    # Generate milestones
    milestones = []
    
    # Initial preparation phase
    milestones.append({
        'title': 'Research and Planning',
        'description': 'Gather information and create a detailed plan for achieving your goal',
        'timeframe': '0-1 month',
        'actions': [
            'Define specific, measurable outcomes for your goal',
            'Research best practices and approaches for similar goals',
            'Identify potential obstacles and plan how to overcome them',
            'Break down the goal into smaller, manageable tasks'
        ]
    })
    
    # Middle milestones
    if duration_months > 3:
        milestones.append({
            'title': 'Initial Progress',
            'description': 'Begin implementing your plan and making measurable progress',
            'timeframe': '1-3 months',
            'actions': [
                'Start with the simplest or most foundational tasks',
                'Establish regular routines that support your goal',
                'Track your progress and adjust your approach as needed',
                'Celebrate small wins to maintain motivation'
            ]
        })
    
    if duration_months > 6:
        # Create mid-point milestone dictionary
        mid_point_milestone = {}
        mid_point_milestone['title'] = 'Mid-Point Assessment'
        mid_point_milestone['description'] = 'Evaluate your progress and make adjustments to your approach'
        mid_point_milestone['timeframe'] = f'{duration_months // 2} months'
        
        # Create actions list
        mid_point_actions = []
        mid_point_actions.append('Review what strategies have been most effective')
        mid_point_actions.append('Identify areas where you have encountered challenges')
        mid_point_actions.append('Adjust your approach based on what you have learned')
        mid_point_actions.append('Set more specific targets for the second half of your journey')
        
        # Add actions to milestone
        mid_point_milestone['actions'] = mid_point_actions
        
        # Add milestone to list
        milestones.append(mid_point_milestone)
    
    # Final milestone
    milestones.append({
        'title': 'Final Push and Achievement',
        'description': 'Complete remaining tasks and achieve your goal',
        'timeframe': f'{duration_months-2}-{duration_months} months',
        'actions': [
            'Focus on completing any remaining critical tasks',
            'Address any final obstacles or challenges',
            'Consolidate your progress and ensure sustainability',
            'Reflect on your journey and lessons learned'
        ]
    })
    
    # Customize based on personality traits
    customize_path_for_personality(milestones, traits)
    
    # Add resource recommendations
    resources = generate_resources(goal, area='other')
    
    return {
        'milestones': milestones,
        'resources': resources,
        'estimated_completion_time': f'{duration_months} months',
        'key_success_factors': [
            'Consistent effort over time',
            'Regular review and adjustment of approach',
            'Building supportive habits and routines',
            'Maintaining motivation through small wins'
        ]
    }

def generate_career_path(goal: str, constraints: List[str], timeframe: str, traits: Dict[str, float]) -> Dict[str, Any]:
    """Generate a career-focused path."""
    # Basic generic path
    path = generate_generic_path(goal, constraints, timeframe, traits)
    
    # Add career-specific milestones
    if "interview" in goal.lower():
        path['milestones'].insert(1, {
            'title': 'Interview Preparation',
            'description': 'Prepare for interviews to showcase your skills and experience',
            'timeframe': '1-4 weeks',
            'actions': [
                'Research common interview questions in your field',
                'Prepare concise stories that demonstrate your achievements',
                'Practice with mock interviews',
                'Prepare questions to ask your interviewers'
            ]
        })
    
    if "resume" in goal.lower():
        path['milestones'].insert(1, {
            'title': 'Resume Enhancement',
            'description': 'Update and optimize your resume for your target roles',
            'timeframe': '1-2 weeks',
            'actions': [
                'Tailor your resume to highlight relevant experience',
                'Quantify achievements where possible',
                'Have your resume reviewed by peers or professionals',
                'Create versions optimized for applicant tracking systems'
            ]
        })
    
    # Add career-specific resources
    path['resources'] = generate_resources(goal, 'career')
    
    return path

def generate_education_path(goal: str, constraints: List[str], timeframe: str, traits: Dict[str, float]) -> Dict[str, Any]:
    """Generate an education-focused path."""
    # Basic generic path
    path = generate_generic_path(goal, constraints, timeframe, traits)
    
    # Add education-specific resources
    path['resources'] = generate_resources(goal, 'education')
    
    return path

def generate_relationship_path(goal: str, constraints: List[str], timeframe: str, traits: Dict[str, float]) -> Dict[str, Any]:
    """Generate a relationship-focused path."""
    # Basic generic path
    path = generate_generic_path(goal, constraints, timeframe, traits)
    
    # Add relationship-specific resources
    path['resources'] = generate_resources(goal, 'relationships')
    
    return path

def generate_health_path(goal: str, constraints: List[str], timeframe: str, traits: Dict[str, float]) -> Dict[str, Any]:
    """Generate a health-focused path."""
    # Basic generic path
    path = generate_generic_path(goal, constraints, timeframe, traits)
    
    # Add health-specific resources
    path['resources'] = generate_resources(goal, 'health')
    
    return path

def customize_path_for_personality(milestones: List[Dict[str, Any]], traits: Dict[str, float]) -> None:
    """
    Customize path milestones based on personality traits.
    
    Args:
        milestones: List of milestone dictionaries to modify
        traits: Dictionary of personality trait scores
    """
    # Customization for conscientiousness
    if traits.get('conscientiousness', 0.5) < 0.4:
        # For less conscientious individuals, add more structure
        for milestone in milestones:
            milestone['actions'].append('Set up reminders and specific deadlines for tasks')
            milestone['actions'].append('Break large tasks into smaller, more manageable steps')
    
    # Customization for openness
    if traits.get('openness', 0.5) < 0.4:
        # For less open individuals, focus on practical aspects
        for milestone in milestones:
            milestone['actions'] = [action for action in milestone['actions'] if 'research' not in action.lower()]
            milestone['actions'].append('Focus on practical, proven approaches')
    
    # Customization for extraversion
    if traits.get('extraversion', 0.5) < 0.4:
        # For more introverted individuals
        for milestone in milestones:
            milestone['actions'] = [action for action in milestone['actions'] if 'group' not in action.lower()]
            milestone['actions'].append('Allow time for independent work and reflection')
    
    # Customization for emotional stability
    if traits.get('emotional_stability', 0.5) < 0.4:
        # For those who might experience more emotional variability
        for milestone in milestones:
            milestone['actions'].append('Include self-care practices throughout the process')
            milestone['actions'].append('Plan for potential setbacks and how to manage them')

def generate_resources(goal: str, area: str) -> List[Dict[str, str]]:
    """
    Generate recommended resources for a goal.
    
    Args:
        goal: The goal statement
        area: Area of life the goal pertains to
        
    Returns:
        List of resource dictionaries
    """
    # Basic, generic resources
    resources = [
        {
            'type': 'book',
            'title': 'Atomic Habits',
            'author': 'James Clear',
            'description': 'Practical strategies for building good habits and breaking bad ones'
        },
        {
            'type': 'app',
            'title': 'Notion',
            'description': 'All-in-one workspace for notes, tasks, and project management'
        }
    ]
    
    # Add area-specific resources
    if area == 'career':
        resources.extend([
            {
                'type': 'book',
                'title': 'Designing Your Life',
                'author': 'Bill Burnett and Dave Evans',
                'description': 'Using design thinking to build a meaningful career'
            },
            {
                'type': 'website',
                'title': 'LinkedIn Learning',
                'description': 'Professional courses on business, technology, and creative skills'
            }
        ])
    
    elif area == 'education':
        resources.extend([
            {
                'type': 'website',
                'title': 'Coursera',
                'description': 'Online courses from top universities and organizations'
            },
            {
                'type': 'app',
                'title': 'Anki',
                'description': 'Spaced repetition flashcard system for effective learning'
            }
        ])
    
    elif area == 'relationships':
        resources.extend([
            {
                'type': 'book',
                'title': 'Nonviolent Communication',
                'author': 'Marshall B. Rosenberg',
                'description': 'A language of compassion for improving relationships'
            },
            {
                'type': 'podcast',
                'title': 'Where Should We Begin?',
                'description': 'Couples therapy sessions with Esther Perel'
            }
        ])
    
    elif area == 'health':
        resources.extend([
            {
                'type': 'app',
                'title': 'MyFitnessPal',
                'description': 'Track nutrition, exercise, and progress toward health goals'
            },
            {
                'type': 'book',
                'title': 'Why We Sleep',
                'author': 'Matthew Walker',
                'description': 'The science of sleep and its impact on health and performance'
            }
        ])
    
    return resources

def parse_timeframe(timeframe: str) -> int:
    """
    Parse a timeframe string and return the approximate duration in months.
    
    Args:
        timeframe: Timeframe string (e.g., "6 months", "1 year")
        
    Returns:
        Duration in months
    """
    timeframe_lower = timeframe.lower()
    
    if 'year' in timeframe_lower:
        # Extract number of years
        try:
            years = float(timeframe_lower.split('year')[0].strip())
            return int(years * 12)
        except:
            return 12  # Default to 1 year
    
    elif 'month' in timeframe_lower:
        # Extract number of months
        try:
            months = float(timeframe_lower.split('month')[0].strip())
            return int(months)
        except:
            return 6  # Default to 6 months
    
    elif 'week' in timeframe_lower:
        # Extract number of weeks
        try:
            weeks = float(timeframe_lower.split('week')[0].strip())
            return max(1, int(weeks / 4))  # Convert weeks to months, minimum 1
        except:
            return 1  # Default to 1 month
    
    else:
        # Default timeframe
        return 6  # 6 months 