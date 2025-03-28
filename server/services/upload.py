from typing import Annotated
from fastapi import UploadFile, HTTPException, File  
import os
import time
from dotenv import load_dotenv
from pathlib import Path
from google.cloud import storage
from google.cloud import firestore
from datetime import datetime
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

async def upload_service(email: str, file: UploadFile):
    """Uploads a file to the configured GCS bucket with metadata and generates a contract ID."""
    try:
        BUCKET_NAME = "documents-vahan" 
        print(f"Uploading file to bucket: {BUCKET_NAME}")
        storage_client = storage.Client()
        bucket = storage_client.bucket(BUCKET_NAME)
        
     
            
        if not bucket.exists():
            print(f"Creating bucket: {BUCKET_NAME}")  # Debug print
            bucket = storage_client.create_bucket(BUCKET_NAME)
            print(f"Bucket created: {BUCKET_NAME}")  # Debug print
            time.sleep(2)  # Wait 2 seconds

        print(f"Retrieving bucket: {BUCKET_NAME}")  # Debug print
        bucket = storage_client.bucket(BUCKET_NAME)  # Retrieve the bucket
        print(f"Bucket retrieved: {BUCKET_NAME}")  # Debug print

        # Create a unique path for the user's file
        destination_blob_name = f"{email}/{file.filename}"

        blob = bucket.blob(destination_blob_name)

        # Set metadata for the blob including the contract ID
        blob.metadata = {
            "uploaded_by": email,
            "filename": file.filename,
            "upload_date": datetime.now().isoformat(),
        }
        blob.upload_from_file(file.file)

        # Store contract metadata in Firestore for easy access

        return {
            "public_url": blob.public_url,
            "message": "Document uploaded successfully!"
        }
    except Exception as e:
        print(f"Error in uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading PDF: {e}")

