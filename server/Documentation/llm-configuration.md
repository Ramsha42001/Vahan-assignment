# LLM Model Configuration

## Overview
This document outlines the configuration and implementation details of the Large Language Models (LLMs) used in the Vahan Chat API system.

## Model Architecture

### Primary Components
- **Chat Model**: Used for generating conversational responses
- **Embedding Model**: Used for text vectorization and semantic search
- **Context Management System**: Handles conversation history and context

## Configuration Settings

### Environment Variables
```env
OPENAI_API_KEY=<your-api-key>
MODEL_NAME=<model-name>
MAX_TOKENS=150
TEMPERATURE=0.7
```

### Model Parameters
```python
DEFAULT_MODEL_CONFIG = {
    "model": "gpt-3.5-turbo",  # or as specified in env
    "temperature": 0.7,        # Controls response randomness
    "max_tokens": 150,         # Maximum response length
    "top_p": 1.0,             # Nucleus sampling parameter
    "frequency_penalty": 0,    # Reduces repetition
    "presence_penalty": 0      # Encourages topic diversity
}
```

## Implementation Structure

### File Organization 