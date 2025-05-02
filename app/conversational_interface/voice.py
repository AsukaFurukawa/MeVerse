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