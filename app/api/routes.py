from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
import logging

# Import route modules
from app.api.data_routes import router as data_router
from app.api.simulation_routes import router as simulation_router
from app.api.conversation_routes import router as conversation_router
from app.api.profile_routes import router as profile_router
from app.api.growth_routes import router as growth_router

logger = logging.getLogger(__name__)

# Create main API router
router = APIRouter()

# Include module-specific routers
router.include_router(data_router, prefix="/data", tags=["Data Ingestion"])
router.include_router(simulation_router, prefix="/simulation", tags=["Future Simulation"])
router.include_router(conversation_router, prefix="/conversation", tags=["Conversation"])
router.include_router(profile_router, prefix="/profile", tags=["Profile"])
router.include_router(growth_router, prefix="/growth", tags=["Growth Tracking"])

@router.get("/status")
async def status():
    """Check the API status."""
    return {"status": "online", "version": "0.1.0"} 