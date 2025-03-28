import google.generativeai as genai
from dotenv import load_dotenv
import os
from google.cloud import aiplatform as vertexai
from utils.config import REGIONS
import random
from google.generativeai import GenerativeModel
load_dotenv()


def get_model(temperature=0.3, top_p=0.7, top_k=40, max_output_tokens=1024):
    vertexai.init(project=os.getenv("PROJECT_ID"), location=REGIONS[random.randint(0, 25)])  # Initialize Vertex AI
    
    generation_config = {
        "temperature": temperature,
        "top_p": top_p,
        "top_k": top_k,
        "max_output_tokens": max_output_tokens,
    }
    
    model = GenerativeModel(
        "gemini-1.5-pro-001",
        generation_config=generation_config
    ) 
    return model


