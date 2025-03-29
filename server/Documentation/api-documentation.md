# API Documentation

## Base URL
`/api`


## Authentication
Authentication is handled via JWT tokens. Most endpoints require a valid JWT token passed through the `verify_jwt_token` middleware.

## API Endpoints

### Authentication Endpoints

#### POST `/login`
- **Purpose**: Authenticate user and get JWT token
- **Request Body**: UserLogin schema
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: JWT token and user details

#### POST `/signup`
- **Purpose**: Register new user
- **Request Body**: UserSignup schema
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string"
  }
  ```
- **Response**: Success message and user details

### Chat Endpoints

#### WebSocket `/chat`
- **Purpose**: Real-time chat communication
- **Query Parameters**:
  - `session_id`: string
  - `user_id`: string (will automatically be added from JWT token)
- **Features**:
  - Real-time message exchange
  - Chat history saved in Redis
  - Message embeddings stored in Pinecone
  - Document extracted details stored in Pinecone
  - Automatic response generation

### Document Management

#### POST `/upload`
- **Purpose**: Upload documents so that it will be processed for chatbot knowledge base
- **Authentication**: Required
- **Request**: Multipart form data with file
- **Response**: Public URL of uploaded file

#### GET `/documents`
- **Purpose**: Retrieve user's uploaded documents
- **Authentication**: Required
- **Response**: List of documents with metadata

### Metrics and Monitoring

#### GET `/metrics`
- **Purpose**: Get model performance metrics including questions asked, latency etc
- **Authentication**: Required
- **Response**: Aggregated performance metrics

#### GET `/metrics/sessions/{session_id}`
- **Purpose**: Get metrics for specific chat session
- **Authentication**: Required
- **Parameters**: session_id (path)
- **Response**: Detailed session metrics

#### GET `/session_id`
- **Purpose**: Generate new chat session ID
- **Authentication**: Required
- **Response**: New session ID

### Health Check

#### GET `/`
- **Purpose**: System health check
- **Response**: Health status of services including Redis 