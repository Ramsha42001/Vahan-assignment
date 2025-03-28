from typing import Dict, List, Any, Tuple
import time
import numpy as np
from models.embedding import get_embedding
from storage.redis import redis_client
import logging
import json
logger = logging.getLogger(__name__)

class ResponseEvaluator:
    def __init__(self):
        self.metrics = {}
        self.response_times = []
        self.context_relevance_scores = []
        self.total_requests = 0
        self.successful_requests = 0
    
    def start_timer(self) -> float:
        """Start timing a request"""
        return time.time()
    
    def record_latency(self, start_time: float) -> float:
        """Record the latency of a request"""
        latency = time.time() - start_time
        self.response_times.append(latency)
        return latency
    
    def evaluate_response(self, 
                          user_query: str, 
                          response: str, 
                          context: str, 
                          session_id: str, 
                          start_time: float) -> Dict[str, Any]:
        """Evaluate a single response against multiple metrics"""
        self.total_requests += 1
        
        try:
            # 1. Latency measurement
            latency = self.record_latency(start_time)
            
            # 2. Response length analysis
            response_length = len(response.split())
            
            # 3. Calculate semantic similarity between query and response
            query_embedding = get_embedding(user_query)
            response_embedding = get_embedding(response)
            relevance_score = self._calculate_cosine_similarity(query_embedding, response_embedding)
            
            # 4. Calculate semantic similarity between context and response
            if context and context != "No context found.":
                context_embedding = get_embedding(context)
                context_relevance = self._calculate_cosine_similarity(context_embedding, response_embedding)
                self.context_relevance_scores.append(context_relevance)
            else:
                context_relevance = None
            
            # 5. Count tokens for cost estimation
            token_count = len(user_query.split()) + len(response.split())
            
            # 6. Record successful completion
            self.successful_requests += 1
            
            # Compile all metrics
            response_metrics = {
                "latency_seconds": latency,
                "response_length_words": response_length,
                "query_response_relevance": relevance_score,
                "context_relevance": context_relevance,
                "token_count": token_count,
                "session_id": session_id,
                "timestamp": time.time()
            }
            
            # Store in Redis for analysis
            self._store_metrics(session_id, response_metrics)
            
            return response_metrics
            
        except Exception as e:
            logger.error(f"Error evaluating response: {e}")
            return {"error": str(e)}
    
    def get_aggregate_metrics(self) -> Dict[str, Any]:
        """Get aggregate metrics across all responses"""
        if not self.response_times:
            return {"error": "No responses recorded yet"}
        
        return {
            "total_requests": self.total_requests,
            "successful_requests": self.successful_requests,
            "success_rate": self.successful_requests / self.total_requests if self.total_requests > 0 else 0,
            "avg_latency": np.mean(self.response_times),
            "p50_latency": np.percentile(self.response_times, 50),
            "p95_latency": np.percentile(self.response_times, 95),
            "p99_latency": np.percentile(self.response_times, 99),
            "avg_context_relevance": np.mean(self.context_relevance_scores) if self.context_relevance_scores else None
        }
    
    def _calculate_cosine_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        dot_product = np.dot(embedding1, embedding2)
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        return dot_product / (norm1 * norm2)
    
    def _store_metrics(self, session_id: str, metrics: Dict[str, Any]) -> None:
        """Store metrics in Redis using JSON format"""
        try:
            
            # Convert numpy values to native Python types
            serializable_metrics = {}
            for k, v in metrics.items():
                if hasattr(v, "item") and callable(getattr(v, "item")):
                    serializable_metrics[k] = float(v.item())
                else:
                    serializable_metrics[k] = v
                    
            # Store as JSON string
            redis_client.lpush(f"response_metrics:{session_id}", json.dumps(serializable_metrics))
            
            # Set expiry to prevent unlimited growth
            redis_client.expire(f"response_metrics:{session_id}", 60*60*24*30)  # 30 days
        except Exception as e:
            logger.error(f"Error storing metrics in Redis: {e}")

    def _store_time_metrics(self, metric_name: str, value: float):
        """Store time-based metrics using Redis Time Series"""
        try:
            print("metric_name: ",metric_name)
            # Convert NumPy float to Python float
            if hasattr(value, "item") and callable(getattr(value, "item")):
                value = float(value.item())
            
            # Check if timeseries exists, create if not
            try:
                redis_client.execute_command("TS.INFO", f"metric:{metric_name}")
            except:
                # Create timeseries with retention of 30 days
                redis_client.execute_command(
                    "TS.CREATE", f"metric:{metric_name}", 
                    "RETENTION", 60*60*24*30*1000  # 30 days in milliseconds
                )
            
            # Add data point with current timestamp
            timestamp = int(time.time() * 1000)  # Redis TS uses milliseconds
            redis_client.execute_command("TS.ADD", f"metric:{metric_name}", timestamp, value)
            
        except Exception as e:
            logger.error(f"Error storing time metrics: {e}")

# Global evaluator instance
evaluator = ResponseEvaluator()