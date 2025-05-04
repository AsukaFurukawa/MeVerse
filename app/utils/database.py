"""Database utility for MongoDB connections with file-based fallback."""

import logging
import os
import json
from typing import Any, Optional, Dict, List
from pathlib import Path
import warnings

logger = logging.getLogger(__name__)

# MongoDB imports with error handling
try:
    from pymongo import MongoClient
    from pymongo.database import Database
    MONGODB_AVAILABLE = True
except ImportError:
    warnings.warn("pymongo not installed, using file-based database fallback")
    MONGODB_AVAILABLE = False
    MongoClient = None
    Database = None

# MongoDB connection singleton
_mongo_client: Optional[Any] = None
_mongo_db: Optional[Any] = None

# File-based database fallback
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

class FileBasedDB:
    """A simple file-based database fallback when MongoDB is not available."""
    
    def __init__(self, db_name: str):
        self.db_name = db_name
        self.db_dir = DATA_DIR / db_name
        self.db_dir.mkdir(exist_ok=True)
        self.collections = {}
    
    def __getitem__(self, collection_name: str) -> 'FileBasedCollection':
        if collection_name not in self.collections:
            self.collections[collection_name] = FileBasedCollection(self.db_dir, collection_name)
        return self.collections[collection_name]

class FileBasedCollection:
    """A simple file-based collection fallback when MongoDB is not available."""
    
    def __init__(self, db_dir: Path, collection_name: str):
        self.collection_name = collection_name
        self.file_path = db_dir / f"{collection_name}.json"
        self._ensure_file_exists()
    
    def _ensure_file_exists(self) -> None:
        """Ensure the collection file exists."""
        if not self.file_path.exists():
            with open(self.file_path, 'w') as f:
                json.dump([], f)
    
    def _read_data(self) -> List[Dict[str, Any]]:
        """Read all documents from the collection file."""
        try:
            with open(self.file_path, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            # If file is corrupted, initialize as empty
            with open(self.file_path, 'w') as f:
                json.dump([], f)
            return []
    
    def _write_data(self, data: List[Dict[str, Any]]) -> None:
        """Write all documents to the collection file."""
        with open(self.file_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find a single document matching the query."""
        documents = self._read_data()
        for doc in documents:
            matches = all(k in doc and doc[k] == v for k, v in query.items())
            if matches:
                return doc
        return None
    
    def find(self, query: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Find all documents matching the query."""
        documents = self._read_data()
        if not query:
            return documents
            
        result = []
        for doc in documents:
            matches = all(k in doc and doc[k] == v for k, v in query.items())
            if matches:
                result.append(doc)
        return result
    
    def insert_one(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a single document."""
        documents = self._read_data()
        documents.append(document)
        self._write_data(documents)
        return {"inserted_id": document.get("_id")}
    
    def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False) -> Dict[str, Any]:
        """Update a single document."""
        documents = self._read_data()
        updated = False
        
        # Handle the $set operator
        set_fields = update.get("$set", {})
        
        for i, doc in enumerate(documents):
            matches = all(k in doc and doc[k] == v for k, v in query.items())
            if matches:
                # Update the document
                documents[i].update(set_fields)
                updated = True
                break
        
        if not updated and upsert:
            # If document not found and upsert is True, insert a new document
            new_doc = {**query, **set_fields}
            documents.append(new_doc)
        
        self._write_data(documents)
        return {"modified_count": 1 if updated else 0, "upserted_id": None}
    
    def delete_one(self, query: Dict[str, Any]) -> Dict[str, Any]:
        """Delete a single document."""
        documents = self._read_data()
        initial_count = len(documents)
        
        for i, doc in enumerate(documents):
            matches = all(k in doc and doc[k] == v for k, v in query.items())
            if matches:
                documents.pop(i)
                break
        
        self._write_data(documents)
        return {"deleted_count": initial_count - len(documents)}

def get_mongo_client() -> Any:
    """
    Get a MongoDB client instance or fallback.
    
    Returns:
        MongoDB client instance or None for fallback
    """
    global _mongo_client
    
    if not MONGODB_AVAILABLE:
        logger.warning("MongoDB not available, using file-based fallback")
        return None
    
    if _mongo_client is None:
        # Get MongoDB connection string from environment variables
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        
        try:
            _mongo_client = MongoClient(mongo_uri)
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            _mongo_client = None
    
    return _mongo_client

def get_db() -> Any:
    """
    Get a MongoDB database instance or file-based fallback.
    
    Returns:
        MongoDB database instance or file-based fallback
    """
    global _mongo_db
    
    if _mongo_db is None:
        client = get_mongo_client()
        
        # Get database name from environment variables, default to "meverse"
        db_name = os.getenv("MONGODB_DB", "meverse")
        
        if client is not None:
            _mongo_db = client[db_name]
            logger.info(f"Using MongoDB database: {db_name}")
        else:
            # Use file-based fallback
            _mongo_db = FileBasedDB(db_name)
            logger.info(f"Using file-based database fallback: {db_name}")
    
    return _mongo_db

def close_mongo_connection() -> None:
    """Close the MongoDB connection if it exists."""
    global _mongo_client
    
    if MONGODB_AVAILABLE and _mongo_client is not None:
        _mongo_client.close()
        _mongo_client = None
        logger.info("MongoDB connection closed") 