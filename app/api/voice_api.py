"""API endpoints for voice interface functionality."""

from fastapi import APIRouter, HTTPException, Body, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

from ..conversational_interface.voice import (
    process_voice_input, 
    process_voice_command, 
    text_to_speech,
    get_available_commands
)

router = APIRouter(prefix="/api/voice", tags=["voice"])

class VoiceInputRequest(BaseModel):
    """Request model for voice input processing."""
    audio_data: str
    format: str = "wav"

class VoiceCommandRequest(BaseModel):
    """Request model for voice command processing."""
    command_text: str

class TextToSpeechRequest(BaseModel):
    """Request model for text-to-speech conversion."""
    text: str

@router.post("/process-input", response_model=Dict[str, Any])
async def api_process_voice_input(request: VoiceInputRequest):
    """
    Process voice input from audio data and convert to text.
    
    Args:
        request: Voice input request with audio data
        
    Returns:
        Dictionary with recognized text and confidence
    """
    try:
        text, confidence = process_voice_input(request.audio_data, request.format)
        
        return {
            "text": text,
            "confidence": confidence,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing voice input: {str(e)}")

@router.post("/command", response_model=Dict[str, Any])
async def api_process_command(request: VoiceCommandRequest):
    """
    Process a voice command and determine the appropriate action.
    
    Args:
        request: Voice command request with command text
        
    Returns:
        Dictionary with command processing results
    """
    try:
        result = process_voice_command(request.command_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing command: {str(e)}")

@router.post("/text-to-speech", response_model=Dict[str, Any])
async def api_text_to_speech(request: TextToSpeechRequest):
    """
    Convert text to speech.
    
    Args:
        request: Text-to-speech request with text
        
    Returns:
        Dictionary with audio data
    """
    try:
        audio_data = text_to_speech(request.text)
        
        if audio_data:
            return {
                "audio_data": audio_data,
                "format": "mp3",
                "success": True
            }
        else:
            return {
                "message": "Text-to-speech conversion not available",
                "success": False
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting text to speech: {str(e)}")

@router.get("/available-commands", response_model=List[Dict[str, Any]])
async def api_get_available_commands():
    """
    Get a list of available voice commands.
    
    Returns:
        List of commands with descriptions and examples
    """
    try:
        return get_available_commands()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving commands: {str(e)}") 