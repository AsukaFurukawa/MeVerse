from fastapi import APIRouter, Depends, HTTPException, Body, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging

from app.future_simulation.simulator import simulate_scenario
from app.future_simulation.path_generator import generate_optimal_path

logger = logging.getLogger(__name__)

router = APIRouter()

# Define data models
class SimulationScenario(BaseModel):
    """Model for a simulation scenario."""
    question: str
    context: Optional[Dict[str, Any]] = {}
    timeframe: Optional[str] = "6 months"  # e.g., "6 months", "1 year", "5 years"
    area: Optional[str] = None  # e.g., "career", "education", "relationships"

class PathRequest(BaseModel):
    """Model for an optimal path generation request."""
    goal: str
    constraints: Optional[List[str]] = []
    timeframe: Optional[str] = "1 year"
    area: Optional[str] = None

# Simulation endpoints
@router.post("/what-if", status_code=status.HTTP_200_OK)
async def what_if_simulation(scenario: SimulationScenario):
    """Simulate a 'what if' scenario."""
    try:
        result = simulate_scenario(scenario.dict())
        return result
    except Exception as e:
        logger.error(f"Error simulating scenario: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to simulate scenario: {str(e)}"
        )

@router.post("/optimal-path", status_code=status.HTTP_200_OK)
async def optimal_path(path_request: PathRequest):
    """Generate an optimal path to reach a goal."""
    try:
        result = generate_optimal_path(path_request.dict())
        return result
    except Exception as e:
        logger.error(f"Error generating optimal path: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate optimal path: {str(e)}"
        ) 