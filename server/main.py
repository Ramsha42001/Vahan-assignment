import uvicorn
from fastapi import FastAPI
from routes.routes import router as chat_router
from fastapi.middleware.cors import CORSMiddleware
from storage.redis import redis_client
from services.logger import configure_logging
import logging

configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Vahan Chat API",
    description="API for chat application with authentication",
    version="1.0.0"
)
origins = [
    "http://localhost:3000",  # React frontend default
    "http://localhost:8000",  # FastAPI backend default
    "http://localhost",
    "https://yourdomain.com",  # Replace with your production domain
    "*",  # For development - remove in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")

@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        logger.info("Checking Redis connection")
        redis_status = redis_client.ping()
        
        return {
            "status": "healthy", 
            "services": {
                "redis": "connected" if redis_status else "disconnected"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}

if __name__ == "__main__":
    logger.info("Starting Chat API server")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)