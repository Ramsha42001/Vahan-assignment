# Middleware Documentation

## Overview
Documentation of custom middleware functions used in the application.

[Document each middleware with:
- Purpose
- Implementation details
- Usage examples]

## JWT Authentication Middleware
- **Function**: `verify_jwt_token`
- **Purpose**: Validate JWT tokens for protected routes
- **Implementation**:
  - Extracts token from request
  - Validates token signature
  - Returns user_id for valid tokens
  - Raises 401 for invalid tokens

## Evaluation Middleware
- **Function**: `evaluator`
- **Purpose**: Track and analyze model performance
- **Features**:
  - Response latency tracking
  - Query relevance scoring
  - Aggregate metrics calculation 