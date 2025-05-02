"""Database utility for MongoDB connections."""

import logging
import os
from typing import Any, Optional
from pymongo import MongoClient
from pymongo.database import Database

logger = logging.getLogger(__name__)

# MongoDB connection singleton
_mongo_client: Optional[MongoClient] = None
_mongo_db: Optional[Database] = None

def get_mongo_client() -> MongoClient:
    """
    Get a MongoDB client instance.
    
    Returns:
        MongoDB client instance
    """
    global _mongo_client
    
    if _mongo_client is None:
        # Get MongoDB connection string from environment variables
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        
        try:
            _mongo_client = MongoClient(mongo_uri)
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    return _mongo_client

def get_db() -> Database:
    """
    Get a MongoDB database instance.
    
    Returns:
        MongoDB database instance
    """
    global _mongo_db
    
    if _mongo_db is None:
        client = get_mongo_client()
        
        # Get database name from environment variables, default to "meverse"
        db_name = os.getenv("MONGODB_DB", "meverse")
        
        _mongo_db = client[db_name]
        logger.info(f"Using MongoDB database: {db_name}")
    
    return _mongo_db

def close_mongo_connection() -> None:
    """Close the MongoDB connection."""
    global _mongo_client
    
    if _mongo_client is not None:
        _mongo_client.close()
        _mongo_client = None
        logger.info("MongoDB connection closed") 