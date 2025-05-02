from fastapi import APIRouter, Depends, HTTPException, Body, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging
from datetime import datetime

from app.growth_tracker.progress import get_progress
from app.growth_tracker.visualization import generate_visualization
from app.growth_tracker.prediction import predict_trajectory

logger = logging.getLogger(__name__)

router = APIRouter()

# Define data models
class TimeRange(BaseModel):
    """Model for a time range specification."""
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    period: Optional[str] = "month"  # day, week, month, year

class VisualizationRequest(BaseModel):
    """Model for a visualization request."""
    metric: str  # e.g., "mood", "productivity", "habits"
    time_range: Optional[TimeRange] = None
    visualization_type: Optional[str] = "line"  # line, bar, radar, etc.

class TrajectoryRequest(BaseModel):
    """Model for a trajectory prediction request."""
    areas: List[str]  # e.g., ["career", "health", "relationships"]
    time_horizon: Optional[str] = "6 months"  # e.g., "6 months", "1 year", "5 years"

# Growth tracker endpoints
@router.post("/progress", status_code=status.HTTP_200_OK)
async def track_progress(time_range: TimeRange):
    """Get progress data for a specified time range."""
    try:
        start = time_range.start_date or datetime.now().strftime("%Y-%m-01")
        end = time_range.end_date or datetime.now().strftime("%Y-%m-%d")
        
        progress_data = get_progress(start, end, time_range.period)
        return progress_data
    except Exception as e:
        logger.error(f"Error retrieving progress data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve progress data: {str(e)}"
        )

@router.post("/visualize", status_code=status.HTTP_200_OK)
async def visualize(visualization_request: VisualizationRequest):
    """Generate visualization for a specific metric."""
    try:
        visualization = generate_visualization(
            visualization_request.metric,
            visualization_request.time_range.dict() if visualization_request.time_range else None,
            visualization_request.visualization_type
        )
        return visualization
    except Exception as e:
        logger.error(f"Error generating visualization: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate visualization: {str(e)}"
        )

@router.post("/trajectory", status_code=status.HTTP_200_OK)
async def trajectory(trajectory_request: TrajectoryRequest):
    """Predict future trajectory in specified areas."""
    try:
        prediction = predict_trajectory(
            trajectory_request.areas,
            trajectory_request.time_horizon
        )
        return prediction
    except Exception as e:
        logger.error(f"Error predicting trajectory: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to predict trajectory: {str(e)}"
        ) 