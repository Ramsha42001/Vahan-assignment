# 🚀 : Vahan Conversational AI chatbot- made for Customer Support

Vahan is a powerful document-based conversational AI system that processes uploaded documents to build a knowledge base, then intelligently answers user queries based on that information. It combines the advanced natural language processing capabilities of Google's Gemini AI model with a robust document processing pipeline and scalable architecture to provide accurate, context-aware responses drawn directly from your documents. This README provides a developer-focused overview of the project.

## Table of Contents

* [Architecture](#architecture)
* [Key Features](#key-features)
* [Technology Stack](#technology-stack)
* [Design Philosophy](#design-philosophy)
* [Prompt Engineering and Model Optimization](#prompt-engineering-and-model-optimization)
* [Scalability and Performance](#scalability-and-performance)
* [Getting Started](#getting-started)
* [Limitations and Future Improvements](#limitations-and-future-improvements)
* [Usage](#usage)
    * [Authentication](#authentication)
    * [Chat Interaction (WebSocket)](#chat-interaction-websocket)
* [API Documentation](#api-documentation)
* [Contributing](#contributing)
* [License](#license)

 ## Video demo link
 https://drive.google.com/file/d/12DRKpeTNz299sJApiAHgW1ORo4ZeXpXK/view?usp=sharing

## Architecture

Vahan Chatbot's architecture is designed for modularity, scalability, and resilience.  It follows a microservices-oriented approach:

![Untitled diagram-2025-03-29-114219](https://github.com/user-attachments/assets/86a6fbff-3bd8-4421-b168-30a7e835dfeb)

## Key Features, Technologies, Design, and Usage of Vahan

This section provides a concise overview of Vahan's key features, underlying technologies, design principles, scalability, performance considerations, and basic usage instructions.  It's designed to be a developer-friendly summary within a larger README.

### Architecture Components

* **Clients:** Users interact with Vahan Chatbot through a web interface or via API clients.
* **API Gateway:** Handles request routing, load balancing across Chat Service instances.
* **Authentication Service:** Manages user authentication and authorization using JWTs.
* **Chat Service:** The core application logic. Processes queries, interacts with data stores (Redis, Pinecone), and the Gemini AI model, and generates responses.  Designed for horizontal scaling.
* **Redis Cache:** Stores conversation context (short-term memory) for fast retrieval, enabling personalized interactions.
* **Pinecone Vector Database:** Stores and retrieves knowledge embeddings, enabling semantic search and Retrieval-Augmented Generation (RAG) for accurate, knowledge-based responses.
* **Google Gemini AI Model:** Provides the natural language understanding and generation capabilities.
* **Evaluation Metrics:** Stores and provides access to performance metrics,including types of questions asked latency etc.

### Key Features

* **Natural Language Understanding:** Processes and understands complex user input, going beyond simple keyword matching.
* **Knowledge-Based Responses:** Leverages a dedicated knowledge base (Pinecone) for accurate and informative answers.
* **Contextual Memory:** Remembers past interactions to provide a personalized and efficient conversational experience.
* **Real-time Communication:** Utilizes WebSockets for instant, bidirectional communication.
* **Secure Authentication:** Employs JWT authentication to protect API endpoints.
* **Scalable Architecture:** Designed for horizontal scaling to handle increasing user loads.
* **Performance Monitoring:** Tracks key metrics to ensure optimal performance and identify areas for improvement.
* **RAG Implementation:** Documents uploaded by users are processed into embeddings using Google's text embedding model and stored in Pinecone vector database. During chat, relevant document chunks are retrieved from Pinecone using semantic similarity search and provided as context to Gemini AI for generating accurate, knowledge-grounded responses.
* **Round Robin Algorithm :**

### Technology Stack

* **Programming Language:** Python 3.9+
* **AI Model:** Google Gemini
* **Vector Database:** Pinecone
* **Cache Storage:** Redis
* **Authentication:** JWT (JSON Web Tokens)
* **Communication:** WebSockets
* **Backend Framework:** FastAPI
* **Frontend Library:** React-Vite
* **Styling UI Library:** Tailwind CSS, Material UI

### Design Philosophy

Vahan Chatbot is built upon these core principles:
* **Modularity:** Independent, well-defined services for improved maintainability, testability, and scalability.
* **Scalability:** Designed for horizontal scaling of key components (especially the Chat Service).
* **Context Awareness:** Prioritizes maintaining conversation history for personalized and efficient interactions.
* **Knowledge Integration:** Integrates a robust knowledge base to ensure accurate and informative responses.
* **Document Processing:** Handles document uploads through a dedicated service that:
  - Processes uploaded documents into chunks
  - Generates embeddings using Google's text embedding model
  - Stores embeddings in Pinecone for efficient retrieval
* **Intelligent Retrieval:** During chat interactions:
  - Performs semantic similarity search on document embeddings
  - Retrieves relevant document chunks as context
  - Provides this context to Gemini for knowledge-grounded responses
* **Security:** Employs JWT authentication for secure access control and document management.
* **Real-time Interaction:** Uses WebSockets for low-latency communication.
* **Best-in-Class AI:** Leverages Google's Gemini for state-of-the-art language processing and document understanding.

### Prompt Engineering and Model Optimization

#### Prompt Engineering Approach

* **System Prompts:** Carefully crafted system prompts that:
  - Define the chatbot's personality and tone
  - Set boundaries for appropriate responses
  - Include specific instructions for handling different query types
  - Provide clear and concise instructions to the model
  - Constrain the model's output to prevent irrelevant or inappropriate responses
  
* **Context Management:**
  - Dynamic prompt construction incorporating relevant document chunks
  - Maintenance of conversation history for contextual understanding
  - Intelligent context window management to prevent token overflow
  - Specific formatting requirements for structured outputs

* **Response Optimization:**
  - Temperature adjustment (0.3-0.7) based on query type:
    - Lower (0.2-0.4) for factual/technical responses requiring precision
    - Higher (0.7-1.0) for creative/conversational responses
  - Use of few-shot examples for complex query patterns
  - Structured output formatting for consistent responses

#### Model Optimization

* **Round-Robin Algorithm for Gemini Instances:**
  - Distributes requests evenly across multiple Gemini model instances
  - Maximizes Requests Per Minute (RPM) efficiency
  - Prevents individual instance overload
  - Ensures optimal response times through load balancing
  - Implementation maintains a circular list of available instances

* **Temperature Control Strategy:**
  - Dynamic temperature adjustment based on query context:
    - Customer support queries: 0.2-0.4 (focused, deterministic)
    - Creative tasks: 0.7-1.0 (diverse, exploratory)
  - Continuous monitoring and adjustment based on response quality
  - Balance between accuracy and creativity

* **Performance Optimization:**
  - Efficient token usage through prompt compression
  - Caching of common queries and responses
  - Batch processing for document embeddings
  - Regular performance metric analysis and tuning

### Setup Instructions (Detailed)

1. **Environment Setup**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # Unix
   # or
   .\venv\Scripts\activate  # Windows
   ```

2. **Dependencies Installation**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt

   # Install frontend dependencies
   cd client
   npm install
   ```

3. **Configuration**
   - Create `config/` directory in project root
   - Set up configuration files:
     ```bash
     touch config/development.env
     touch config/production.env
     ```
   - Configure environment variables as specified in the template

4. **Database Setup**
   ```bash
   # Initialize Redis
   redis-server

   # Configure Pinecone (via web interface)
   # Create index with dimension=1536 (for Gemini embeddings)
   ```

### Limitations and Future Improvements

#### Current Technical Limitations

1. **Infrastructure Constraints**
   * Single-instance FastAPI deployment without load balancing
   * Limited middleware stack for request processing

2. **AI Model Limitations**
   * Single Gemini model instance without failover and fallback mechanism
   * Synchronous request processing in the chat service
   * Fixed temperature settings for model responses and also fine tuning

3. **Security and Authentication**
   * Basic JWT implementation without refresh token mechanism
   * Limited rate limiting and request throttling
   * Basic error handling in middleware layer
   * File type validation constraints in document upload (only pdf file can be uploaded at present)

4. **Data Management**
   * No automated cleanup for stored documents

#### Future Improvements Roadmap

1. **Infrastructure Enhancements**
   - [ ] Implement Docker Compose for multi-container deployment
   - [ ] Add health check endpoints for service monitoring
   - [ ] Implement circuit breakers for external service calls

2. **AI and Processing Improvements**
   - [ ] Add streaming response support in WebSocket implementation
   - [ ] Add support for multiple Gemini model instances
   - [ ] Implement adaptive temperature control based on query type

3. **Security Enhancements**
   - [ ] Add OAuth2 support with multiple providers
   - [ ] Implement refresh token rotation
   - [ ] Add IP-based rate limiting in middleware
   - [ ] Enhance input validation in schema layer

4. **Storage and Caching**
   - [ ] Add document versioning support
   - [ ] Implement automated document cleanup policies

5. **Monitoring and Analytics**
   - [ ] Add detailed API usage analytics
   - [ ] Implement automated performance testing
   - [ ] Add error tracking and reporting system

6. **Developer Experience**
   - [ ] Enhance API documentation with more examples
   - [ ] Add integration test suite
   - [ ] Implement CI/CD pipeline

7. **Feature Additions**
   - [ ] Implement document summarization service
   - [ ] Add support for image and PDF processing
   - [ ] Implement conversation export functionality
   - [ ] Add batch document processing capabilities

### Getting Started

#### Prerequisites

* Python 3.9 or higher
* Node.js and npm (for the frontend)
* Redis server running
* Pinecone account (and API key)
* Google Cloud account (and API key for Gemini)

#### Installation


1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/Ramsha42001/Vahan-assignment](https://github.com/Ramsha42001/Vahan-assignment)
    cd vahan-assignment
    ```



## Method 1 Using Docker Engine (Recommended for production)    
    
# For Frontend
First Navigate to /client folder

3. **Start Docker Engine**
    Install docker engine after downloading the setup from browser

4.  **Run Docker Build Command:**
    First Navigate to /client folder

    ```bash
      docker build -t gcr.io/[GOOGLE_CLOUD_Project_ID]/[Image_name] .
    ```
    If you are using mac 
    ```bash
      docker build --platform linux/amd64 -t gcr.io/[GOOGLE_CLOUD_Project_ID]/[Image_name] .
    ```
5. **Run Docker Run Command:**

    ```bash
      docker run  -p 8080:8080 gcr.io/[Google_cloud_project_id]/[Image_name]
    ```
    If you are using mac 
    ```bash
      docker run --platform linux/amd64 -p 8080:8080 gcr.io/[Google_cloud_project_id]/[Image_name]
    ```
    This will start your frontend to run locally on `http://localhost:8080`

# For Backend
Navigate to /server folder

1.  **Create a `.env` file in server folder:**
    Create a `.env` file in the project's root directory and add your API keys and configuration:

    ```
    # Example .env content
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
    PINECONE_API_KEY=YOUR_PINECONE_API_KEY
    PINECONE_ENVIRONMENT=YOUR_PINECONE_ENVIRONMENT
    REDIS_HOST=localhost
    REDIS_PORT=6379
    # ... other environment variables
    ```

    **IMPORTANT:** Do *not* commit your `.env` file to version control!  Add `.env` to your `.gitignore` file.

3.  **Run Docker Build Command:**
    First Navigate to /client folder

    ```bash
      docker build -t gcr.io/[GOOGLE_CLOUD_Project_ID]/[backend_Image_name] .
    ```
    If you are using mac 
    ```bash
      docker build --platform linux/amd64 -t gcr.io/[GOOGLE_CLOUD_Project_ID]/[backend_Image_name] .
    ```
4. **Run Docker Run Command:**

    ```bash
      docker run  -p 8080:8080 gcr.io/[Google_cloud_project_id]/[backend_Image_name]
    ```
    If you are using mac 
    ```bash
      docker run --platform linux/amd64 -p 8080:8080 gcr.io/[Google_cloud_project_id]/[backend_Image_name]
    ```
    This will start your frontend to run locally on `http://localhost:8080`


## Method 2 Setting up local Development 

# For Frontend
Navigate to /client folder   

1.  **Install frontend dependencies:**

    ```bash
    cd client
    npm install
    cd ..
    ```

2.  **Start Frontend Server:**
     ```bash
    npm run dev
    cd ..
    ```

    This will typically start the frontend on a local development server (e.g., `http://localhost:5173`).

# For Backend

1.  **Navigate to the `server` directory:**

    ```bash
    cd server
    ```

2.  **Install the requirements.txt file**

    ```bash
    pip3 install -r requirements.txt
    ```
    If you are using older version of Pip
     ```bash
    pip install -r requirements.txt
    ```

3. **Start the server**
    ```bash
    python3 main.py
    ```

(optional only if you want to connect to local server) Navigate to  `client/services/apiConfig.js ` :
    Add baseURL   `http://localhost:8000` if not present to connect your server to frontend locally

(optional only if you want to connect to local server) Navigate to  `client/src/views/Home.jsx`:
    Add baseWebsocketURL to `ws://127.0.0.0.0:8000/api/chat?session_id=${currentSession.id}`  if not already present to connect websocket connection for chat locally to server

#### Authentication

Users must authenticate before interacting with the chat API:

* **Registration:** `POST /api/signup`  (Requires `email`, `name`, `password` in the request body)
* **Login:** `POST /api/login` (Requires `email`, `password` in the request body)

Both endpoints return a JWT upon successful authentication.  This token *must* be included in subsequent requests to the chat API.

#### Chat Interaction (WebSocket)

The primary interaction with Vahan Chatbot is via a WebSocket connection:

* **Endpoint:** `/api/chat`
* **Query Parameters:**
    * `session_id`:  A unique identifier for the conversation session (UUID recommended).
    * `token`: The JWT obtained during authentication.

* **Message Format (JSON):**

    **Sending a message (Client to Server):**

    ```json
    {
        "message": "User's input here"
    }
    ```

    **Receiving a message (Server to Client):**

    ```json
    {
        "message": "Chatbot's response"
    }
    ```


#### Document Upload

The document upload feature allows users to add reference materials that inform the chatbot's knowledge base:

* **Endpoint:** `/api/upload`
* **Method:** POST
* **Authentication:** Required (JWT token in header)
* **Content-Type:** multipart/form-data

**Request Parameters:**
* `file`: The document file to upload (PDF, TXT, DOCX supported)

#### Document Getting on Frontend

The document upload feature allows users to add reference materials that inform the chatbot's knowledge base:

* **Endpoint:** `/api/documents`
* **Method:** GET
* **Authentication:** Required (JWT token in header)

### API Documentation

### API Endpoints Documentation

#### Authentication
* `POST /api/signup`
  * Description: Register a new user account
  * Required fields: `email`, `name`, `password`
  * Returns: JWT token on successful registration
  * Status codes: 201 (Created), 400 (Bad Request), 409 (Conflict)

* `POST /api/login`
  * Description: Authenticate existing user
  * Required fields: `email`, `password`
  * Returns: JWT token on successful authentication
  * Status codes: 200 (OK), 401 (Unauthorized)

#### Chat
* `WebSocket /api/chat`
  * Description: Establish real-time chat connection
  * Query parameters:
    * `session_id`: Unique session identifier (UUID)
    * `token`: Valid JWT token
  * Events:
    * Client -> Server: JSON message object
    * Server -> Client: JSON response object
  * Status codes: 101 (Switching Protocols), 401 (Unauthorized)

#### Documents
* `POST /api/upload`
  * Description: Upload document to knowledge base
  * Authentication: Required (JWT token)
  * Content-Type: multipart/form-data
  * Parameters:
    * `file`: Document file (PDF, TXT, DOCX)
  * Status codes: 201 (Created), 400 (Bad Request), 401 (Unauthorized)

* `GET /api/documents`
  * Description: Retrieve list of uploaded documents
  * Authentication: Required (JWT token)
  * Returns: Array of document metadata
  * Status codes: 200 (OK), 401 (Unauthorized)

#### Analytics & Metrics
* `GET /api/metrics`
  * Description: Retrieve system-wide performance metrics
  * Authentication: Required (JWT token)
  * Returns: Aggregated analytics data
  * Status codes: 200 (OK), 401 (Unauthorized)
