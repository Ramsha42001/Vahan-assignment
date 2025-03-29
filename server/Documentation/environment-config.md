# Environment Configuration

## Overview
Documentation of environment variables and configuration settings.

## Environment Variables
[List all environment variables with:
- Variable name
- Purpose
- Required/Optional
- Default value (if any)
- Example value]

## Required Environment Variables

### Authentication
- `JWT_SECRET_KEY`: Secret key for JWT token generation
- `JWT_ALGORITHM`: Algorithm for JWT token generation (e.g., "HS256")

### Storage Configuration
- `REDIS_URL`: Redis connection URL
- `PINECONE_API_KEY`: Pinecone API key
- `PINECONE_ENVIRONMENT`: Pinecone environment
- `GOOGLE_CLOUD_PROJECT`: GCP project ID

### Model Configuration
- `OPENAI_API_KEY`: OpenAI API key for LLM services
- `MODEL_NAME`: Name of the LLM model to use

### Server Configuration
- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: "0.0.0.0")
- `ENVIRONMENT`: Deployment environment (development/production) 