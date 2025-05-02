"""Natural Language Processing utility functions."""

import logging
import os
from typing import Dict, Any, List, Tuple
import nltk
from textblob import TextBlob
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from collections import Counter
import openai

logger = logging.getLogger(__name__)

# Initialize NLTK resources
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

# Get stop words
stop_words = set(stopwords.words('english'))

def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyze sentiment of text.
    
    Args:
        text: Text to analyze
        
    Returns:
        Dictionary containing sentiment analysis results
    """
    # Use TextBlob for sentiment analysis
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity
    
    # Determine sentiment label
    if polarity > 0.2:
        label = "positive"
    elif polarity < -0.2:
        label = "negative"
    else:
        label = "neutral"
    
    return {
        'polarity': polarity,
        'subjectivity': subjectivity,
        'label': label
    }

def extract_keywords(text: str, num_keywords: int = 5) -> List[str]:
    """
    Extract keywords from text.
    
    Args:
        text: Text to analyze
        num_keywords: Number of keywords to extract
        
    Returns:
        List of keywords
    """
    # Tokenize and normalize text
    tokens = word_tokenize(text.lower())
    
    # Remove stop words and punctuation
    filtered_tokens = [
        lemmatizer.lemmatize(token) 
        for token in tokens 
        if token.isalpha() and token not in stop_words and len(token) > 3
    ]
    
    # Count token frequencies
    token_counts = Counter(filtered_tokens)
    
    # Get most common tokens
    keywords = [word for word, _ in token_counts.most_common(num_keywords)]
    
    return keywords

def analyze_text_with_gpt(text: str, prompt_template: str) -> Dict[str, Any]:
    """
    Analyze text using OpenAI GPT models.
    
    Args:
        text: Text to analyze
        prompt_template: Template for the prompt
        
    Returns:
        Dictionary containing GPT analysis results
    """
    # Check if OpenAI API key is available
    if not os.getenv("OPENAI_API_KEY"):
        logger.warning("OpenAI API key not found. Skipping GPT analysis.")
        return {}
    
    # Set up OpenAI API
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    # Create prompt
    prompt = prompt_template.format(text=text)
    
    try:
        # Call OpenAI API
        response = openai.Completion.create(
            model="text-davinci-003",  # Use appropriate model
            prompt=prompt,
            max_tokens=400,
            temperature=0.2
        )
        
        # Extract and return result
        result_text = response.choices[0].text.strip()
        
        # Try to parse as JSON if the prompt requested JSON
        if "JSON" in prompt_template or "json" in prompt_template:
            try:
                import json
                return json.loads(result_text)
            except:
                # If parsing fails, return as text
                return {"result": result_text}
        else:
            return {"result": result_text}
    
    except Exception as e:
        logger.error(f"Error during GPT analysis: {str(e)}")
        return {"error": str(e)}

def extract_emotions(text: str) -> Dict[str, float]:
    """
    Extract emotions from text.
    
    Args:
        text: Text to analyze
        
    Returns:
        Dictionary of emotion scores
    """
    # This is a simplified implementation
    # In a real implementation, you would use a more sophisticated
    # emotion detection model or API
    
    emotions = {
        'joy': 0.0,
        'sadness': 0.0,
        'anger': 0.0,
        'fear': 0.0,
        'surprise': 0.0
    }
    
    # Simple keyword-based approach
    text_lower = text.lower()
    
    # Joy keywords
    joy_keywords = ['happy', 'joy', 'delighted', 'pleased', 'glad', 'excited']
    emotions['joy'] = sum(1 for word in joy_keywords if word in text_lower) / len(joy_keywords)
    
    # Sadness keywords
    sad_keywords = ['sad', 'unhappy', 'depressed', 'miserable', 'disappointed']
    emotions['sadness'] = sum(1 for word in sad_keywords if word in text_lower) / len(sad_keywords)
    
    # Anger keywords
    anger_keywords = ['angry', 'mad', 'furious', 'irritated', 'annoyed']
    emotions['anger'] = sum(1 for word in anger_keywords if word in text_lower) / len(anger_keywords)
    
    # Fear keywords
    fear_keywords = ['afraid', 'scared', 'terrified', 'anxious', 'worried']
    emotions['fear'] = sum(1 for word in fear_keywords if word in text_lower) / len(fear_keywords)
    
    # Surprise keywords
    surprise_keywords = ['surprised', 'shocked', 'astonished', 'amazed']
    emotions['surprise'] = sum(1 for word in surprise_keywords if word in text_lower) / len(surprise_keywords)
    
    return emotions 