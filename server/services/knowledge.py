from langchain.text_splitter import RecursiveCharacterTextSplitter
from models.embedding import get_embedding
from storage.pinecone import pinecone_doc_index
import os

def update_knowledge_base(user_id: str, file_content: str) -> dict:
    """
    Updates the knowledge base by splitting documents, creating embeddings, and storing in Pinecone.
    
    Args:
        user_id: The ID of the user uploading the document
        file_content: The content of the file to be processed
    
    Returns:
        dict: Status of the operation
    """
    try:
        # Validate user_id
        if not user_id:
            raise ValueError("user_id cannot be null or empty")

        # Initialize text splitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=100,
            chunk_overlap=20,
            length_function=len,
        )
        
        # Split the document into chunks
        chunks = text_splitter.split_text(file_content)
        
        # Process chunks and store in Pinecone
        for i, chunk in enumerate(chunks):
            # Skip empty chunks
            if not chunk.strip():
                continue
                
            embedding = get_embedding(chunk)
            
            # Create a unique ID for the vector
            vector_id = f"{user_id}-{i}"
            
            # Create metadata with validation
            metadata = {
                "text": chunk if chunk else "",  # Ensure text is never null
                "user_id": str(user_id)  # Convert user_id to string to ensure it's never null
            }
            
            # Store in Pinecone
            pinecone_doc_index.upsert(
                    vectors=[{
                        "id": str(hash(vector_id)),
                        "values": embedding,
                        "metadata": {"text": metadata["text"], "user_id": metadata["user_id"], "user_id": user_id}
                    }]
                )
        
        return {"status": "success", "chunks_processed": len(chunks)}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}