# Database Models

## Overview
The application implements a hybrid database architecture using Redis for real-time data and caching, Pinecone for vector storage, and Google Cloud Storage for document files management. 

### Redis Models

#### Chat History
- **Key Pattern**: `chat_history:{user_id}:{session_id}`
- **Type**: List
- **Structure**:
  ```
  [
    "User: <message>",
    "Chatbot: <response>",
    ...
  ]
  ```
- **Features**:
  - Chronological message ordering
  - Session-based segregation
  - User-specific history

#### Response Metrics
- **Key Pattern**: `response_metrics:{session_id}`
- **Type**: List
- **Structure**:
  ```json
  {
    "timestamp": "ISO-8601 datetime",
    "latency_seconds": float,
    "query_response_relevance": float,
    "token_count": integer,
    "model_version": string
  }
  ```
- **Indexes**: None (time-series data)
- **TTL**: 7 days

### Pinecone Vector Store

#### Chat Embeddings
- **Index Name**: chat_embeddings
- **Vector Dimension**: 1536 (OpenAI embeddings)
- **Metadata Schema**:
  ```json
  {
    "text": "Original message and response",
    "session_id": "Session identifier",
    "timestamp": "ISO-8601 datetime",
    "user_id": "User identifier"
  }
  ```
- **Index Configuration**:
  - Metric: Cosine similarity
  - Pods: 1
  - Pod Type: p1.x1
- **Constraints**:
  - Maximum vector dimensions: 1536
  - Maximum metadata size: 40KB

### User Authentication Schema

#### UserLogin
```python
class UserLogin(BaseModel):
    email: str     # Primary identifier
    password: str  # Hashed using bcrypt
    
    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }
```

#### UserSignup
```python
class UserSignup(BaseModel):
    email: str     # Primary identifier, unique
    password: str  # Min length: 8 chars
    name: str      # User's display name
    
    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123",
                "name": "John Doe"
            }
        }
```

### Document Storage (Google Cloud Storage)

#### Document Metadata
- **Bucket**: documents-vahan
- **Path Pattern**: `{user_id}/{filename}`
- **Metadata Structure**:
  ```json
  {
    "filename": "Original filename",
    "uploaded_by": "User ID",
    "upload_date": "ISO-8601 datetime",
    "content_type": "MIME type",
    "size": "File size in bytes"
  }
  ```
- **Access Control**:
  - User-level isolation
  - Public read access
  - Authenticated write access 