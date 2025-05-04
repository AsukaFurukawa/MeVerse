"""Voice processing module for handling voice input and output."""

import logging
import base64
import os
import tempfile
from typing import Dict, Any, List, Optional, Tuple
import speech_recognition as sr

logger = logging.getLogger(__name__)

def process_voice_input(audio_data: str, format: str = "wav") -> Tuple[str, float]:
    """
    Process voice input and convert to text.
    
    Args:
        audio_data: Base64 encoded audio data
        format: Audio format (wav, mp3, etc.)
        
    Returns:
        Tuple of (recognized_text, confidence)
    """
    try:
        # Decode base64 audio data
        decoded_audio = base64.b64decode(audio_data)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix=f".{format}", delete=False) as temp_audio_file:
            temp_audio_file.write(decoded_audio)
            temp_audio_path = temp_audio_file.name
        
        # Initialize speech recognition
        recognizer = sr.Recognizer()
        
        # Load audio file
        with sr.AudioFile(temp_audio_path) as source:
            audio = recognizer.record(source)
        
        try:
            # Try using Google Speech Recognition API
            text = recognizer.recognize_google(audio, show_all=True)
            
            # Process the result
            if isinstance(text, dict) and 'alternative' in text:
                # Get the most confident result
                if text['alternative']:
                    best_result = text['alternative'][0]
                    recognized_text = best_result.get('transcript', '')
                    confidence = best_result.get('confidence', 0.0)
                    return recognized_text, confidence
                else:
                    return "", 0.0
            elif isinstance(text, list) and text:
                # Handle different response format
                best_result = text[0]
                if isinstance(best_result, dict) and 'transcript' in best_result:
                    recognized_text = best_result.get('transcript', '')
                    confidence = best_result.get('confidence', 0.0)
                else:
                    recognized_text = str(best_result)
                    confidence = 1.0 if recognized_text else 0.0
                return recognized_text, confidence
            else:
                # Simple string result
                return str(text), 1.0
            
        except sr.UnknownValueError:
            logger.warning("Speech recognition could not understand audio")
            return "", 0.0
        except sr.RequestError as e:
            logger.error(f"Speech recognition service error: {str(e)}")
            return "", 0.0
        
    except Exception as e:
        logger.error(f"Error processing voice input: {str(e)}")
        return "", 0.0
    finally:
        # Cleanup temporary file
        try:
            if 'temp_audio_path' in locals() and os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
        except Exception as e:
            logger.error(f"Error removing temporary file: {str(e)}")

def text_to_speech(text: str) -> Optional[str]:
    """
    Convert text to speech.
    
    Args:
        text: Text to convert to speech
        
    Returns:
        Base64 encoded audio data or None if unsuccessful
    """
    # This is a placeholder for text-to-speech functionality
    # In a real implementation, you would integrate with a TTS service
    # such as Google Cloud Text-to-Speech, Amazon Polly, etc.
    
    logger.info("Text-to-speech functionality not implemented")
    return None 
    
def process_voice_command(command_text: str) -> Dict[str, Any]:
    """
    Process a voice command and determine the appropriate action.
    
    Args:
        command_text: The voice command text to process
        
    Returns:
        A dict containing the command type, action, and additional parameters
    """
    command_text = command_text.lower().strip()
    
    # Initialize result structure
    result = {
        "recognized": False,
        "command_type": None,
        "action": None,
        "confidence": 0.5,  # Default medium confidence
        "parameters": {},
        "response_text": None
    }
    
    # Dashboard navigation commands
    if any(phrase in command_text for phrase in ["show dashboard", "go to dashboard", "open dashboard"]):
        result.update({
            "recognized": True,
            "command_type": "navigation",
            "action": "navigate_to",
            "parameters": {"destination": "dashboard"},
            "confidence": 0.9,
            "response_text": "Opening dashboard"
        })
    
    # Mood tracking commands
    elif any(phrase in command_text for phrase in ["log mood", "track mood", "record mood", "how am i feeling"]):
        result.update({
            "recognized": True,
            "command_type": "feature",
            "action": "open_mood_tracker",
            "confidence": 0.9,
            "response_text": "Opening mood tracker"
        })
    
    # Data visualization commands
    elif any(phrase in command_text for phrase in ["show data", "visualize data", "data visualization", "show charts"]):
        result.update({
            "recognized": True,
            "command_type": "feature",
            "action": "show_visualization",
            "confidence": 0.9,
            "response_text": "Showing data visualizations"
        })
    
    # Journal commands
    elif any(phrase in command_text for phrase in ["journal", "diary", "write entry", "start journal"]):
        result.update({
            "recognized": True,
            "command_type": "navigation",
            "action": "navigate_to",
            "parameters": {"destination": "journal"},
            "confidence": 0.9,
            "response_text": "Opening journal"
        })
    
    # Growth tracking commands
    elif any(phrase in command_text for phrase in ["show progress", "my progress", "growth tracking", "achievements"]):
        result.update({
            "recognized": True,
            "command_type": "feature",
            "action": "show_growth",
            "confidence": 0.9,
            "response_text": "Showing your progress and growth"
        })
    
    # Simulation commands
    elif any(phrase in command_text for phrase in ["future simulation", "predict future", "simulation", "future self"]):
        result.update({
            "recognized": True,
            "command_type": "feature",
            "action": "show_simulation",
            "confidence": 0.9,
            "response_text": "Opening future simulation"
        })
    
    # Help commands
    elif any(phrase in command_text for phrase in ["help", "commands", "what can you do", "list commands"]):
        result.update({
            "recognized": True,
            "command_type": "system",
            "action": "show_help",
            "confidence": 0.95,
            "response_text": "Here are the available commands you can use"
        })
    
    # Avatar interaction
    elif any(phrase in command_text for phrase in ["customize avatar", "change avatar", "avatar appearance"]):
        result.update({
            "recognized": True,
            "command_type": "feature",
            "action": "customize_avatar",
            "confidence": 0.85,
            "response_text": "Opening avatar customization"
        })
    
    # General info/greeting
    elif any(phrase in command_text for phrase in ["hello", "hi there", "hey"]):
        result.update({
            "recognized": True,
            "command_type": "conversation",
            "action": "greeting",
            "confidence": 0.95,
            "response_text": "Hello! How can I assist you today?"
        })
    
    # If no specific command is recognized
    else:
        # Check if this might be a query
        if command_text.startswith(("what", "who", "when", "where", "why", "how")) or "?" in command_text:
            result.update({
                "recognized": True,
                "command_type": "conversation",
                "action": "query",
                "parameters": {"query_text": command_text},
                "confidence": 0.7,
                "response_text": "Let me find that information for you"
            })
        else:
            # Treat as general input
            result.update({
                "recognized": False,
                "command_type": "unknown",
                "confidence": 0.3,
                "response_text": "I'm not sure how to help with that. Try saying 'help' for a list of commands."
            })
    
    return result

def get_available_commands() -> List[Dict[str, str]]:
    """
    Get a list of available voice commands.
    
    Returns:
        A list of dictionaries with command information
    """
    return [
        {
            "command": "show dashboard",
            "description": "Navigate to the dashboard view",
            "examples": ["show dashboard", "go to dashboard", "open dashboard"]
        },
        {
            "command": "log mood",
            "description": "Open the mood tracking interface",
            "examples": ["log mood", "track mood", "how am I feeling today"]
        },
        {
            "command": "show data visualization",
            "description": "Display data visualizations",
            "examples": ["show data", "visualize data", "show charts"]
        },
        {
            "command": "journal",
            "description": "Open the journal feature",
            "examples": ["journal", "diary", "write entry", "start journal"]
        },
        {
            "command": "show progress",
            "description": "Show growth and progress metrics",
            "examples": ["show progress", "my progress", "achievements"]
        },
        {
            "command": "future simulation",
            "description": "Open the future simulation feature",
            "examples": ["future simulation", "predict future", "simulation"]
        },
        {
            "command": "help",
            "description": "Display available voice commands",
            "examples": ["help", "commands", "what can you do"]
        },
        {
            "command": "customize avatar",
            "description": "Customize your digital twin's appearance",
            "examples": ["customize avatar", "change avatar", "avatar appearance"]
        }
    ] 