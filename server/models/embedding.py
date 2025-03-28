from google.cloud import aiplatform as vertexai
from google.generativeai import GenerativeModel, embed_content
import os
import random
from utils.config import REGIONS

def get_text_embedding_model():
    vertexai.init(project=os.getenv("PROJECT_ID"), location=REGIONS[random.randint(0, 25)])  # Initialize Vertex AI
    
    model = "models/embedding-001"
    
    return model

def get_embedding(text):
    model = get_text_embedding_model()
    
    result = embed_content(
        model=model,
        content=text,
        task_type="retrieval_document"
    )
    
    return result["embedding"]
