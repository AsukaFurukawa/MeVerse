"""Chat module for processing and responding to user messages."""

import logging
import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.utils.database import get_db
from app.utils.nlp import analyze_text_with_gpt
from app.personality_engine.profile import get_profile
from app.personality_engine.traits import get_personality_traits
from app.future_simulation.simulator import simulate_scenario

logger = logging.getLogger(__name__)

def get_response(message: str, context: Dict[str, Any] = None) -> str:
    """
    Process a chat message and generate a response.
    
    Args:
        message: User message text
        context: Optional context information
        
    Returns:
        Response text
    """
    if context is None:
        context = {}
    
    # Log the incoming message
    logger.info(f"Processing chat message: {message[:50]}...")
    
    # Store the message in the database
    db = get_db()
    collection = db.chat_history
    
    message_record = {
        'role': 'user',
        'content': message,
        'timestamp': datetime.now().isoformat(),
        'context': context
    }
    
    collection.insert_one(message_record)
    
    # Determine message intent and generate appropriate response
    intent = determine_intent(message)
    
    # Generate response based on intent
    if intent == 'simulation':
        response = handle_simulation_intent(message, context)
    elif intent == 'profile':
        response = handle_profile_intent(message, context)
    elif intent == 'help':
        response = handle_help_intent(message, context)
    else:
        # General conversation
        response = generate_conversational_response(message, context)
    
    # Store the response in the database
    response_record = {
        'role': 'assistant',
        'content': response,
        'timestamp': datetime.now().isoformat(),
        'in_response_to': message_record['_id']
    }
    
    collection.insert_one(response_record)
    
    return response

def determine_intent(message: str) -> str:
    """
    Determine the intent of a user message.
    
    Args:
        message: User message text
        
    Returns:
        Intent category (simulation, profile, help, or conversation)
    """
    message_lower = message.lower()
    
    # Check for simulation intent (what-if scenarios)
    if any(phrase in message_lower for phrase in ['what if', 'what would happen', 'simulate', 'predict']):
        return 'simulation'
    
    # Check for profile intent (questions about personality, traits, etc.)
    if any(phrase in message_lower for phrase in ['who am i', 'my personality', 'my traits', 'what do you know about me']):
        return 'profile'
    
    # Check for help intent
    if any(phrase in message_lower for phrase in ['help', 'how do i', 'how does this work', 'what can you do']):
        return 'help'
    
    # Default to general conversation
    return 'conversation'

def handle_simulation_intent(message: str, context: Dict[str, Any]) -> str:
    """
    Handle a simulation intent (what-if scenario).
    
    Args:
        message: User message text
        context: Context information
        
    Returns:
        Response text
    """
    # Extract the scenario from the message
    # This is a simplistic extraction; in a real implementation,
    # you would use more sophisticated NLP techniques
    scenario = message.lower().replace('what if', '').replace('?', '').strip()
    
    if not scenario:
        return "I'm not sure what scenario you want me to simulate. Could you provide more details?"
    
    # Simulate the scenario
    simulation_data = {
        'question': scenario,
        'context': context,
        'timeframe': '6 months'  # Default timeframe
    }
    
    try:
        result = simulate_scenario(simulation_data)
        
        # Format the response
        simulation_result = result.get('result', {})
        
        response = f"Here's what might happen if {scenario}:\n\n"
        
        # Add likelihood of success
        likelihood = simulation_result.get('likelihood_of_success', 0)
        response += f"Likelihood of success: {likelihood}%\n\n"
        
        # Add predicted outcome
        outcome = simulation_result.get('predicted_outcome', '')
        if outcome:
            response += f"Predicted outcome: {outcome}\n\n"
        
        # Add challenges
        challenges = simulation_result.get('challenges', [])
        if challenges:
            response += "Potential challenges:\n"
            for challenge in challenges:
                response += f"- {challenge}\n"
            response += "\n"
        
        # Add strengths
        strengths = simulation_result.get('strengths', [])
        if strengths:
            response += "Your strengths in this scenario:\n"
            for strength in strengths:
                response += f"- {strength}\n"
            response += "\n"
        
        # Add advice
        advice = simulation_result.get('advice', '')
        if advice:
            response += f"Advice: {advice}"
        
        return response
    
    except Exception as e:
        logger.error(f"Error simulating scenario: {str(e)}")
        return "I'm having trouble simulating that scenario right now. Could you try again with different wording?"

def handle_profile_intent(message: str, context: Dict[str, Any]) -> str:
    """
    Handle a profile intent (questions about personality, traits, etc.).
    
    Args:
        message: User message text
        context: Context information
        
    Returns:
        Response text
    """
    # Get user profile and traits
    profile = get_profile()
    traits_data = get_personality_traits()
    
    if traits_data.get('status') == 'insufficient_data':
        return "I don't have enough data yet to provide insights about your personality. Continue using the app by logging your moods, habits, and journal entries to help me learn more about you."
    
    # Format the response
    response = "Based on your data, here's what I know about you:\n\n"
    
    # Add traits information
    traits = traits_data.get('traits', {})
    if traits:
        response += "Your personality traits:\n"
        for trait, data in traits.items():
            score = data.get('score', 0) * 100  # Convert to percentage
            description = data.get('description', '')
            response += f"- {trait.capitalize()}: {score:.0f}% - {description}\n"
        response += "\n"
    
    # Add dominant traits
    dominant_traits = traits_data.get('dominant_traits', [])
    if dominant_traits:
        response += "Your dominant traits are: " + ", ".join(dominant_traits) + "\n\n"
    
    # Add habits information
    habits = profile.get('habits', {})
    if habits:
        response += "Your top habits:\n"
        for habit_name, habit_data in list(habits.items())[:3]:
            completed = habit_data.get('completed', 0)
            missed = habit_data.get('missed', 0)
            if completed + missed > 0:
                completion_rate = (completed / (completed + missed)) * 100
                response += f"- {habit_name}: {completion_rate:.0f}% completion rate\n"
        response += "\n"
    
    # Add mood information
    moods = profile.get('moods', {})
    if moods:
        total_moods = sum(moods.values())
        response += "Your most common moods:\n"
        for mood, count in sorted(moods.items(), key=lambda x: x[1], reverse=True)[:3]:
            percentage = (count / total_moods) * 100 if total_moods > 0 else 0
            response += f"- {mood}: {percentage:.0f}%\n"
    
    return response

def handle_help_intent(message: str, context: Dict[str, Any]) -> str:
    """
    Handle a help intent (questions about how to use the system).
    
    Args:
        message: User message text
        context: Context information
        
    Returns:
        Response text
    """
    # Basic help message
    response = "I'm your Digital Twin, an AI version of you that learns from your data and helps you make decisions. Here's what you can do:\n\n"
    
    response += "1. Ask 'what if' questions to simulate future scenarios\n"
    response += "   Example: 'What if I take this new job?'\n\n"
    
    response += "2. Ask about your personality and traits\n"
    response += "   Example: 'What do you know about my personality?'\n\n"
    
    response += "3. Log your daily activities, moods, and journal entries\n"
    response += "   The more data you provide, the more accurate my insights will be.\n\n"
    
    response += "4. Get suggestions for improvement\n"
    response += "   Example: 'How can I improve my productivity?'\n\n"
    
    response += "5. Have general conversations\n"
    response += "   I'll respond in a way that reflects your personality and preferences.\n\n"
    
    response += "Is there anything specific you'd like to know more about?"
    
    return response

def generate_conversational_response(message: str, context: Dict[str, Any]) -> str:
    """
    Generate a conversational response to a user message.
    
    Args:
        message: User message text
        context: Context information
        
    Returns:
        Response text
    """
    # Try to use GPT for conversation if available
    if os.getenv("OPENAI_API_KEY"):
        gpt_response = generate_response_with_gpt(message, context)
        if gpt_response:
            return gpt_response
    
    # Fallback to simpler response generation
    return generate_simple_response(message, context)

def generate_response_with_gpt(message: str, context: Dict[str, Any]) -> Optional[str]:
    """
    Generate a response using OpenAI GPT.
    
    Args:
        message: User message text
        context: Context information
        
    Returns:
        Generated response or None if unsuccessful
    """
    try:
        # Get user profile and traits
        profile = get_profile()
        traits_data = get_personality_traits()
        
        # Extract relevant profile information for the prompt
        traits_summary = ""
        if traits_data.get('status') == 'success':
            traits = traits_data.get('traits', {})
            traits_summary = "Personality traits:\n"
            for trait, data in traits.items():
                traits_summary += f"- {trait}: {data.get('score', 0):.2f} - {data.get('description', '')}\n"
        
        # Create prompt for GPT
        prompt_template = f"""
        You are acting as an AI digital twin of a person with the following traits and characteristics:
        
        {traits_summary}
        
        Respond to the following message in a way that reflects these personality traits.
        Keep your response concise but helpful, and maintain a tone that matches the person's personality profile.
        
        User message: {message}
        
        Response:
        """
        
        # Call OpenAI API
        response = analyze_text_with_gpt(message, prompt_template)
        
        if "error" in response:
            logger.error(f"Error in GPT response generation: {response['error']}")
            return None
        
        # Extract the text response
        if isinstance(response, dict) and "result" in response:
            return response["result"]
        
        # If we got here, something went wrong
        logger.warning(f"Invalid GPT response format: {response}")
        return None
    
    except Exception as e:
        logger.error(f"Error generating GPT response: {str(e)}")
        return None

def generate_simple_response(message: str, context: Dict[str, Any]) -> str:
    """
    Generate a simple response when GPT is not available.
    
    Args:
        message: User message text
        context: Context information
        
    Returns:
        Generated response
    """
    # Very basic rule-based responses
    message_lower = message.lower()
    
    # Greeting
    if any(word in message_lower for word in ['hello', 'hi', 'hey', 'greetings']):
        return "Hello! I'm your Digital Twin. How can I help you today?"
    
    # Farewell
    if any(word in message_lower for word in ['bye', 'goodbye', 'see you', 'farewell']):
        return "Goodbye! Looking forward to our next conversation."
    
    # Thank you
    if any(phrase in message_lower for phrase in ['thank you', 'thanks']):
        return "You're welcome! I'm here to help."
    
    # How are you
    if 'how are you' in message_lower:
        return "I'm functioning well, thank you for asking. How are you feeling today?"
    
    # Default response
    return "I understand what you're saying. To get the most out of our conversation, try asking me about 'what if' scenarios, your personality traits, or how I can help you make decisions." 