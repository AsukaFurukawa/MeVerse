"""Simulator module for simulating future scenarios."""

import logging
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import random

from app.utils.database import get_db
from app.utils.nlp import analyze_text_with_gpt
from app.personality_engine.profile import get_profile
from app.personality_engine.traits import get_personality_traits

logger = logging.getLogger(__name__)

def simulate_scenario(scenario_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulate a 'what if' scenario based on the user's profile.
    
    Args:
        scenario_data: Dictionary containing scenario data
        
    Returns:
        Dictionary containing simulation results
    """
    # Extract scenario details
    question = scenario_data.get('question', '')
    context = scenario_data.get('context', {})
    timeframe = scenario_data.get('timeframe', '6 months')
    area = scenario_data.get('area')
    
    # Log the simulation request
    logger.info(f"Simulating scenario: {question} (timeframe: {timeframe}, area: {area})")
    
    # Get user profile
    profile = get_profile()
    
    # Get personality traits
    traits_data = get_personality_traits()
    
    # Store the simulation in the database
    db = get_db()
    collection = db.simulations
    
    simulation_record = {
        'question': question,
        'context': context,
        'timeframe': timeframe,
        'area': area,
        'created_at': datetime.now().isoformat(),
        'status': 'completed'
    }
    
    # Generate the simulation result
    result = {}
    
    # Try using GPT for simulation if available
    gpt_result = None
    if os.getenv("OPENAI_API_KEY"):
        gpt_result = simulate_with_gpt(question, profile, traits_data, timeframe, area)
    
    if gpt_result:
        result = gpt_result
    else:
        # Fallback to rule-based simulation
        result = simulate_with_rules(question, profile, traits_data, timeframe, area)
    
    # Add the result to the simulation record
    simulation_record['result'] = result
    
    # Save the simulation record
    collection.insert_one(simulation_record)
    
    return {
        'question': question,
        'timeframe': timeframe,
        'area': area,
        'created_at': datetime.now().isoformat(),
        'result': result
    }

def simulate_with_gpt(question: str, 
                    profile: Dict[str, Any], 
                    traits_data: Dict[str, Any],
                    timeframe: str,
                    area: Optional[str] = None) -> Dict[str, Any]:
    """
    Simulate a scenario using OpenAI GPT.
    
    Args:
        question: The 'what if' question
        profile: User profile dictionary
        traits_data: Personality traits data
        timeframe: Timeframe for the simulation
        area: Optional area of life (career, relationships, etc.)
        
    Returns:
        Dictionary containing simulation results
    """
    try:
        # Extract relevant profile information for the prompt
        traits_summary = ""
        if traits_data.get('status') == 'success':
            traits = traits_data.get('traits', {})
            traits_summary = "Personality traits:\n"
            for trait, data in traits.items():
                traits_summary += f"- {trait}: {data.get('score', 0):.2f} - {data.get('description', '')}\n"
        
        # Extract habits
        habits = profile.get('habits', {})
        habits_summary = "Habits:\n"
        for habit_name, habit_data in habits.items():
            completed = habit_data.get('completed', 0)
            missed = habit_data.get('missed', 0)
            if completed + missed > 0:
                completion_rate = (completed / (completed + missed)) * 100
                habits_summary += f"- {habit_name}: {completion_rate:.1f}% completion rate\n"
        
        # Extract moods
        moods = profile.get('moods', {})
        if moods:
            total_moods = sum(moods.values())
            moods_summary = "Emotional patterns:\n"
            for mood, count in sorted(moods.items(), key=lambda x: x[1], reverse=True)[:3]:
                percentage = (count / total_moods) * 100 if total_moods > 0 else 0
                moods_summary += f"- {mood}: {percentage:.1f}%\n"
        else:
            moods_summary = ""
        
        # Create prompt for GPT
        prompt_template = f"""
        Based on the following information about a person, simulate how they would likely respond and what outcomes might occur if they were to {question}.
        
        Consider this scenario over a {timeframe} timeframe.
        
        {traits_summary}
        
        {habits_summary}
        
        {moods_summary}
        
        Please structure your response in JSON format with the following fields:
        1. "likelihood_of_success": A percentage (0-100) indicating how likely this person would succeed in this scenario.
        2. "predicted_outcome": A detailed description of the most likely outcome.
        3. "challenges": A list of challenges this person might face.
        4. "strengths": A list of personal strengths that would help in this scenario.
        5. "advice": Personalized advice for this person to maximize success.
        
        JSON response:
        """
        
        # Call OpenAI API
        response = analyze_text_with_gpt(question, prompt_template)
        
        if "error" in response:
            logger.error(f"Error in GPT simulation: {response['error']}")
            return None
        
        # If we got a valid JSON response, return it
        if isinstance(response, dict) and "likelihood_of_success" in response:
            return response
        elif "result" in response and isinstance(response["result"], str):
            # Try to parse the result as JSON
            try:
                result_json = json.loads(response["result"])
                return result_json
            except:
                # If parsing fails, format the text response
                return {
                    "predicted_outcome": response["result"],
                    "likelihood_of_success": 50,  # Default value
                    "challenges": [],
                    "strengths": [],
                    "advice": ""
                }
        
        # If we got here, something went wrong
        logger.warning(f"Invalid GPT simulation response format: {response}")
        return None
    
    except Exception as e:
        logger.error(f"Error in GPT simulation: {str(e)}")
        return None

def simulate_with_rules(question: str, 
                      profile: Dict[str, Any], 
                      traits_data: Dict[str, Any],
                      timeframe: str,
                      area: Optional[str] = None) -> Dict[str, Any]:
    """
    Simulate a scenario using rule-based logic.
    
    Args:
        question: The 'what if' question
        profile: User profile dictionary
        traits_data: Personality traits data
        timeframe: Timeframe for the simulation
        area: Optional area of life (career, relationships, etc.)
        
    Returns:
        Dictionary containing simulation results
    """
    # This is a simplified, rule-based simulation
    # In a real implementation, you would use more sophisticated
    # machine learning models and simulation techniques
    
    # Extract traits
    traits = {}
    if traits_data.get('status') == 'success':
        traits = {
            trait: data.get('score', 0.5) 
            for trait, data in traits_data.get('traits', {}).items()
        }
    
    # Default traits if not available
    default_traits = {
        'openness': 0.5,
        'conscientiousness': 0.5,
        'extraversion': 0.5,
        'agreeableness': 0.5,
        'emotional_stability': 0.5
    }
    
    for trait, value in default_traits.items():
        if trait not in traits:
            traits[trait] = value
    
    # Extract area from question if not provided
    if not area:
        area = detect_question_area(question)
    
    # Calculate baseline success likelihood based on traits and area
    likelihood = 50  # Neutral starting point
    
    # Adjust likelihood based on area and traits
    if area == 'career':
        likelihood += (traits.get('conscientiousness', 0.5) - 0.5) * 40
        likelihood += (traits.get('openness', 0.5) - 0.5) * 20
    elif area == 'education':
        likelihood += (traits.get('conscientiousness', 0.5) - 0.5) * 50
        likelihood += (traits.get('openness', 0.5) - 0.5) * 30
    elif area == 'relationships':
        likelihood += (traits.get('agreeableness', 0.5) - 0.5) * 40
        likelihood += (traits.get('extraversion', 0.5) - 0.5) * 20
    elif area == 'health':
        likelihood += (traits.get('conscientiousness', 0.5) - 0.5) * 60
        likelihood += (traits.get('emotional_stability', 0.5) - 0.5) * 20
    
    # Ensure likelihood is within 0-100 range
    likelihood = max(0, min(100, likelihood))
    
    # Generate relevant challenges and strengths based on traits
    challenges = []
    strengths = []
    
    # Conscientiousness
    if traits.get('conscientiousness', 0.5) > 0.7:
        strengths.append("Strong ability to stay organized and follow through on commitments")
    elif traits.get('conscientiousness', 0.5) < 0.3:
        challenges.append("May struggle with maintaining consistent effort and organization")
    
    # Openness
    if traits.get('openness', 0.5) > 0.7:
        strengths.append("Creative thinking and openness to new approaches")
    elif traits.get('openness', 0.5) < 0.3:
        challenges.append("May find it difficult to adapt to new or unconventional situations")
    
    # Extraversion
    if traits.get('extraversion', 0.5) > 0.7:
        strengths.append("Strong social skills and ability to build a support network")
    elif traits.get('extraversion', 0.5) < 0.3:
        challenges.append("May find extensive social interaction draining")
    
    # Emotional Stability
    if traits.get('emotional_stability', 0.5) > 0.7:
        strengths.append("Resilience in the face of setbacks and stress")
    elif traits.get('emotional_stability', 0.5) < 0.3:
        challenges.append("May be more sensitive to stress and emotional challenges")
    
    # Generate generic but personalized advice
    advice = generate_personalized_advice(question, traits, area)
    
    # Generate outcome description based on likelihood
    outcome = generate_outcome_description(question, likelihood, timeframe, area, traits)
    
    return {
        "likelihood_of_success": likelihood,
        "predicted_outcome": outcome,
        "challenges": challenges,
        "strengths": strengths,
        "advice": advice
    }

def detect_question_area(question: str) -> str:
    """
    Detect the area of life a question pertains to.
    
    Args:
        question: The 'what if' question
        
    Returns:
        Detected area (career, education, relationships, health, or other)
    """
    question_lower = question.lower()
    
    # Career keywords
    if any(kw in question_lower for kw in ['job', 'career', 'work', 'profession', 'business', 'employment', 'salary', 'income']):
        return 'career'
    
    # Education keywords
    if any(kw in question_lower for kw in ['study', 'education', 'school', 'college', 'university', 'degree', 'course', 'learn']):
        return 'education'
    
    # Relationship keywords
    if any(kw in question_lower for kw in ['relationship', 'partner', 'marriage', 'girlfriend', 'boyfriend', 'spouse', 'friend', 'family']):
        return 'relationships'
    
    # Health keywords
    if any(kw in question_lower for kw in ['health', 'exercise', 'diet', 'weight', 'fitness', 'doctor', 'medical', 'wellness']):
        return 'health'
    
    # Default
    return 'other'

def generate_personalized_advice(question: str, traits: Dict[str, float], area: str) -> str:
    """
    Generate personalized advice based on personality traits and question area.
    
    Args:
        question: The 'what if' question
        traits: Dictionary of personality trait scores
        area: Area of life the question pertains to
        
    Returns:
        Personalized advice string
    """
    # Basic template advice
    advice = "Based on your personality profile, "
    
    # Add trait-specific advice
    if area == 'career':
        if traits.get('conscientiousness', 0.5) < 0.4:
            advice += "you might benefit from creating a structured plan with clear milestones. "
        else:
            advice += "your organizational skills will serve you well in this endeavor. "
            
        if traits.get('extraversion', 0.5) < 0.4:
            advice += "Consider allocating specific time for networking, even though it may be draining. "
    
    elif area == 'education':
        if traits.get('openness', 0.5) > 0.6:
            advice += "leverage your natural curiosity to explore the subject deeply. "
        else:
            advice += "try to connect the new knowledge to practical applications you already understand. "
            
        if traits.get('conscientiousness', 0.5) < 0.4:
            advice += "Creating a consistent study schedule would significantly improve your chances of success. "
    
    elif area == 'relationships':
        if traits.get('agreeableness', 0.5) < 0.4:
            advice += "make a conscious effort to consider the other person's perspective in conflicts. "
        
        if traits.get('emotional_stability', 0.5) < 0.4:
            advice += "Take time to process your emotions before difficult conversations. "
    
    elif area == 'health':
        if traits.get('conscientiousness', 0.5) < 0.4:
            advice += "setting small, achievable goals and tracking your progress will be essential. "
        
        if traits.get('extraversion', 0.5) > 0.6:
            advice += "Consider finding a workout buddy or group activities to stay motivated. "
    
    # Add general advice based on emotional stability
    if traits.get('emotional_stability', 0.5) < 0.4:
        advice += "Remember to build in self-care practices as you navigate this change. "
    
    return advice

def generate_outcome_description(question: str, likelihood: float, timeframe: str, area: str, traits: Dict[str, float]) -> str:
    """
    Generate an outcome description based on simulation parameters.
    
    Args:
        question: The 'what if' question
        likelihood: Likelihood of success (0-100)
        timeframe: Timeframe for the simulation
        area: Area of life the question pertains to
        traits: Dictionary of personality trait scores
        
    Returns:
        Outcome description string
    """
    # Create a more personalized outcome description
    if likelihood > 75:
        outcome = f"There is a strong likelihood ({likelihood:.0f}%) that this would be successful for you. "
    elif likelihood > 50:
        outcome = f"There is a moderate likelihood ({likelihood:.0f}%) that this would be successful for you. "
    elif likelihood > 25:
        outcome = f"There is some uncertainty, with a {likelihood:.0f}% chance of success for you. "
    else:
        outcome = f"This scenario presents significant challenges, with only a {likelihood:.0f}% likelihood of success for you. "
    
    # Add trait-specific outcomes
    if area == 'career':
        if traits.get('conscientiousness', 0.5) > 0.6:
            outcome += "Your natural ability to stay organized and follow through on commitments would serve you well. "
        
        if traits.get('openness', 0.5) > 0.6:
            outcome += "Your adaptability and openness to new ideas would help you navigate the changes. "
        elif traits.get('openness', 0.5) < 0.4:
            outcome += "You might find the adjustment period challenging due to the new routines required. "
    
    elif area == 'education':
        if traits.get('conscientiousness', 0.5) > 0.6:
            outcome += "Your disciplined approach to tasks would help you excel in the learning process. "
        
        if traits.get('openness', 0.5) > 0.6:
            outcome += "Your intellectual curiosity would make the learning experience engaging and rewarding. "
    
    elif area == 'relationships':
        if traits.get('agreeableness', 0.5) > 0.6:
            outcome += "Your natural empathy and cooperative nature would foster positive connections. "
        
        if traits.get('extraversion', 0.5) > 0.6:
            outcome += "Your social energy would help create and maintain these relationships. "
        elif traits.get('extraversion', 0.5) < 0.4:
            outcome += "You might need to balance social engagement with personal recharge time. "
    
    # Add timeframe-specific language
    if "month" in timeframe:
        outcome += f"Within this {timeframe} timeframe, you would likely see initial results, though some aspects may take longer to fully develop. "
    elif "year" in timeframe:
        outcome += f"This {timeframe} timeframe allows for substantial progress and adaptation to the new situation. "
    
    return outcome 