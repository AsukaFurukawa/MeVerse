from fastapi import APIRouter, Depends, HTTPException, Body, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging

from app.conversational_interface.chat import get_response
from app.conversational_interface.voice import process_voice_input

logger = logging.getLogger(__name__)

router = APIRouter()

# Define data models
class ChatMessage(BaseModel):
    """Model for a chat message."""
    message: str
    context: Optional[Dict[str, Any]] = {}

class VoiceInput(BaseModel):
    """Model for voice input."""
    audio_data: str  # Base64 encoded audio
    format: Optional[str] = "wav"

class Conversation(BaseModel):
    """Model for a full conversation history."""
    messages: List[Dict[str, Any]]

# Conversation endpoints
@router.post("/chat", status_code=status.HTTP_200_OK)
async def chat(message: ChatMessage):
    """Process a chat message and get a response."""
    try:
        response = get_response(message.message, message.context)
        return {"response": response}
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat message: {str(e)}"
        )

@router.post("/voice", status_code=status.HTTP_200_OK)
async def voice(voice_input: VoiceInput):
    """Process voice input and get a response."""
    try:
        # Process voice to text
        text, confidence = process_voice_input(voice_input.audio_data, voice_input.format)
        
        # Get response from chat system
        response = get_response(text, {"source": "voice", "confidence": confidence})
        
        return {
            "recognized_text": text,
            "confidence": confidence,
            "response": response
        }
    except Exception as e:
        logger.error(f"Error processing voice input: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process voice input: {str(e)}"
        ) 