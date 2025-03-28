import redis
import os
def get_redis_client():
    redis_host = os.environ.get("REDIS_HOST", "redis")
    redis_port = int(os.environ.get("REDIS_PORT", 6379))
    try:
        redis_client = redis.Redis(host=redis_host, port=redis_port, username=os.environ.get("REDIS_USERNAME"), password=os.environ.get("REDIS_PASSWORD"))
        print("Connected to Redis successfully")
    except Exception as e:
        print(f"Error connecting to Redis: {str(e)}")
        raise e
    return redis_client


redis_client = get_redis_client()

