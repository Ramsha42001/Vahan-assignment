from google.cloud import firestore
import os
from dotenv import load_dotenv

load_dotenv()

def get_async_database():
    try:
       db=firestore.Client.from_service_account_json(os.getenv("FIRESTORE_ACCOUNT_KEY_FILE"))
       print("Connected to firestore database successfully")
       return db
    except Exception as e:
        print("Error connecting to database")
        raise e