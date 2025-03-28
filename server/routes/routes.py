
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, File
from storage.pinecone import pinecone_chat_index
from storage.redis import redis_client
from middlewares.token import verify_jwt_token
from google.cloud import firestore
from models.embedding import get_embedding
from services.chat import get_chat_response
from services.login import login_user
from schema.user import UserLogin, UserSignup
from middlewares.evaluation import evaluator
from services.signup import signup_user
from services.getSessionId import generate_session_id
import time
import logging
import os
from datetime import datetime
from services.upload import upload_service
import tempfile
import json

logger = logging.getLogger(__name__)

router = APIRouter()

active_connections: dict = {}

@router.get("/metrics")
async def get_model_metrics(user_id: str = Depends(verify_jwt_token)):
    """Get aggregated model performance metrics"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        # Get real-time metrics from the evaluator instance
        metrics = evaluator.get_aggregate_metrics()
        
        # Convert numpy values to native Python types
        serializable_metrics = {}
        for k, v in metrics.items():
            if hasattr(v, "item") and callable(getattr(v, "item")):
                serializable_metrics[k] = float(v.item())
            else:
                serializable_metrics[k] = v
        
        # If Redis TS is used, get time-series metrics
        try:
            # Get average latency over time (last 24 hours)
            end_time = int(time.time() * 1000)
            start_time = end_time - (24 * 60 * 60 * 1000)  # 24 hours back
            
            latency_data = redis_client.execute_command(
                "TS.RANGE", "metric:latency_seconds", start_time, end_time
            )
            
            if latency_data:
                serializable_metrics["latency_over_time"] = [
                    {"timestamp": point[0], "value": point[1]} 
                    for point in latency_data
                ]
        except Exception as e:
            logger.warning(f"Could not retrieve time-series metrics: {e}")
            
        return serializable_metrics
    except Exception as e:
        logger.error(f"Error retrieving metrics: {e}")
        return {"error": str(e)}

@router.get("/session_id")
async def get_session_id(user_id: str = Depends(verify_jwt_token)):
    """Get a new session ID"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return generate_session_id()

@router.get("/metrics/sessions/{session_id}")
async def get_session_metrics(session_id: str, user_id: str = Depends(verify_jwt_token)):
    """Get metrics for a specific session"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        metrics_list = redis_client.lrange(f"response_metrics:{session_id}", 0, -1)
        if not metrics_list:
            raise HTTPException(status_code=404, detail="No metrics found for this session")
        
        # Parse JSON strings
        parsed_metrics = [json.loads(m.decode('utf-8')) for m in metrics_list]
        
        # Calculate session-level aggregates
        if parsed_metrics:
            avg_latency = sum(m.get("latency_seconds", 0) for m in parsed_metrics) / len(parsed_metrics)
            avg_relevance = sum(m.get("query_response_relevance", 0) for m in parsed_metrics) / len(parsed_metrics)
            
            return {
                "session_id": session_id,
                "metrics": parsed_metrics,
                "summary": {
                    "total_interactions": len(parsed_metrics),
                    "avg_latency": avg_latency,
                    "avg_relevance_score": avg_relevance,
                    "start_time": parsed_metrics[-1].get("timestamp"),
                    "end_time": parsed_metrics[0].get("timestamp")
                }
            }
        return {"session_id": session_id, "metrics": []}
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        raise HTTPException(status_code=500, detail="Error parsing metrics data")
    except Exception as e:
        logger.error(f"Error retrieving session metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_file(file: bytes = File(...), user_id: str = Depends(verify_jwt_token)):
    with tempfile.TemporaryDirectory() as temp_dir:
        local_file_path = os.path.join(temp_dir, file.filename)

        try:
            start_time = datetime.now()
            print("start time: ", start_time)
            # Save the uploaded file to the temporary path
            with open(local_file_path, "wb") as local_file:
                local_file.write(await file.read())

            print(f"File saved at {local_file_path}")
            file.file.seek(0)
            # Pass email to upload_service
            public_url = await upload_service(user_id, file)
            print("File uploaded to GCS successfully public_url: ", public_url)
        
            end_time = datetime.now()
            print("end time: ", end_time)
            print("time taken: ", end_time - start_time)
            return {
                "public_url": public_url,
                "message": "File uploaded successfully!"
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error uploading file: {e}")



@router.websocket("/chat")
async def websocket_endpoint(
    websocket: WebSocket, 
    session_id: str,
    user_id: str = Depends(lambda w=None: verify_jwt_token)
):
    await websocket.accept()
    if user_id is None:
        await websocket.close(code=1008)
        return 

    if user_id not in active_connections:
        active_connections[user_id] = {}
    active_connections[user_id][session_id] = websocket

    try:
        while True:
            data = await websocket.receive_text()
            
            # Get response from model
            try:
                response = await get_chat_response(user_id, session_id, data)
            except Exception as e:
                print(f"Error getting chat response: {e}")
                response = "I'm sorry, I encountered an error processing your request."
            
            # Save to Redis
            try:
                redis_client.rpush(f"chat_history:{user_id}:{session_id}", f"User: {data}")
                redis_client.rpush(f"chat_history:{user_id}:{session_id}", f"Chatbot: {response}")
            except Exception as e:
                print(f"Error saving to Redis: {e}")
            
            # Save to Pinecone
            try:
                embedding = get_embedding(data + response)
                pinecone_chat_index.upsert(
                    vectors=[{
                        "id": str(hash(data + response + session_id)),
                        "values": embedding,
                        "metadata": {"text": data + response, "session_id": session_id}
                    }]
                )
            except Exception as e:
                print(f"Error upserting to Pinecone: {e}")
            
            # Send response
            await websocket.send_text(response)

    except WebSocketDisconnect:
        if user_id in active_connections and session_id in active_connections[user_id]:
            del active_connections[user_id][session_id]
            if not active_connections[user_id]:
                del active_connections[user_id]
    except Exception as e:
        print(f"Unexpected error in WebSocket: {e}")
        await websocket.close(code=1011)

@router.post("/login")
async def login(user_data: UserLogin):
    return await login_user(user_data)

@router.post("/signup")
async def signup(user_data: UserSignup):
    return await signup_user(user_data)