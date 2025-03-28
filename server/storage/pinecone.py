from pinecone import Pinecone
import os
from dotenv import load_dotenv

load_dotenv()

def get_pinecone_client():
    api_key = os.getenv("PINECONE_API_KEY")
    # Add environment parameter which is required
    environment = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")  # Default to gcp-starter if not specified
    
    print(f"Initializing Pinecone with environment: {environment}")
    
    return Pinecone(api_key=api_key)

def get_pinecone_index(name, dimension=768):
    pc = get_pinecone_client()
    
    # List available indexes
    indexes = pc.list_indexes()
    print(f"Available Pinecone indexes: {indexes}")
    
    # Check if the index exists
    if name not in [idx["name"] for idx in indexes.get("indexes", [])]:
        print(f"Index '{name}' not found. Creating it now...")
        
        # Create the index if it doesn't exist
        pc.create_index(
            name=name,
            dimension=dimension,
            metric="cosine",
            spec={"serverless": {"cloud": "aws", "region": "us-east-1"}}  # Use serverless spec
        )
        print(f"Index '{name}' created successfully!")
    
    # Connect to the index
    print(f"Connecting to index '{name}'")
    return pc.Index(name)


pinecone_chat_index = get_pinecone_index(name="vahan-chat")
pinecone_doc_index = get_pinecone_index(name="document-data")