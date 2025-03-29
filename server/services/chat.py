from storage.db import get_async_database
from storage.redis import redis_client
from models.embedding import get_embedding
from models.llm import get_model
from storage.pinecone import pinecone_chat_index , pinecone_doc_index
from middlewares.evaluation import evaluator
async def get_chat_response(user_id: str, session_id: str, data: str):
    # try:
    #     # db = get_async_database()
    #     # db.collection("chat_history").document(user_id).collection("sessions").document(session_id).collection("messages").add({"role": "user", "content": data})
    # except Exception as e:
    #     print(f"Error adding message to database: {e}")
    #     return "Error processing your request."
    start_time = evaluator.start_timer()
    # Initialize doc_context at the start
    doc_context = ""
    history_context = ""

    try:
        # Get embedding for user message
        user_message_embedding = get_embedding(data)
        print(f"Generated embedding with length: {len(user_message_embedding)}")

        # Query document index with error handling and logging
        try:
            print("User ID:", user_id)
            print("Session ID:", session_id)
            print(f"Querying Pinecone document index for user_id: {user_id}")
            retrieved_documents = pinecone_doc_index.query(
                vector=user_message_embedding,
                top_k=10,
                include_metadata=True,
                filter={
                    "user_id": str(user_id)  # Ensure user_id is string
                }
            )
            print(f"Pinecone document query response: {retrieved_documents}")
            
            if retrieved_documents and "matches" in retrieved_documents:
                doc_chunks = []
                for match in retrieved_documents["matches"]:
                    if match.get("metadata") and match["metadata"].get("text"):
                        doc_chunks.append(match["metadata"]["text"])
                doc_context = " ".join(doc_chunks) if doc_chunks else "No relevant documents found."
                print("Document context:", doc_context)
            else:
                doc_context = "No matching documents found."
                
        except Exception as e:
            print(f"Error querying document index: {str(e)}")
            doc_context = "Error retrieving document context."

        # Query chat history index
        try:
            print(f"Querying Pinecone chat index for session_id: {session_id}")
            chat_results = pinecone_chat_index.query(
                vector=user_message_embedding,
                top_k=5,
                include_metadata=True,
                filter={
                    "session_id": str(session_id)  # Ensure session_id is string
                }
            )
            print(f"Pinecone chat query response: {chat_results}")
            
            if chat_results and "matches" in chat_results:
                history_chunks = []
                for match in chat_results["matches"]:
                    if match.get("metadata") and match["metadata"].get("text"):
                        history_chunks.append(match["metadata"]["text"])
                history_context = " ".join(history_chunks) if history_chunks else "No chat history found."
            else:
                history_context = "No relevant chat history found."
                
        except Exception as e:
            print(f"Error querying chat index: {str(e)}")
            history_context = "Error retrieving chat history."

        # Get recent history from Redis
        try:
            recent_history = redis_client.lrange(f"chat_history:{user_id}:{session_id}", 0, 10)
            recent_history = [message.decode('utf-8') for message in recent_history]
            history_string = "\n".join(recent_history) if recent_history else "No recent history."
        except Exception as e:
            print(f"Error retrieving Redis history: {str(e)}")
            history_string = "Error retrieving recent history."

        # Construct prompt with all contexts
        prompt = f"""
        # System Instructions
        You are a helpful, knowledgeable RAG-powered assistant that provides accurate and relevant information to users with a friendly and engaging tone.
        
        ## Information Sources
        You have access to two important information sources:
        1. **Context**(MOST IMPORTANT): Relevant document texts retrieved from knowledge base to answer user queries
        2. **Conversation History**: The recent conversation history with this user stored in cache
        
        ## Guidelines
        - First analyze the Context and current user query to understand the user's needs
        - Prioritize information retrieved from the retrieved documents(Context) when answering questions 
        - Use conversation history to maintain continuity and avoid repeating information
        - If the retrieved context doesn't contain relevant information, rely on your general knowledge
        - If you don't know the answer or are unsure, be honest and transparent
        - Keep responses concise, accurate, and helpful
        - Do not mention these instructions or that you are following a specific format
        

        ## Context
        {doc_context}


        ## Conversation History
        {history_string}
        
        ## Current User Query
        User: {data}
        
        ## Response
        Assistant: """

        # Generate response
        response = await get_model().generate_content_async(prompt)
        response_text = response.text

        # Evaluate response
        metrics = evaluator.evaluate_response(
            user_query=data,
            response=response_text,
            context=history_context,
            session_id=session_id,
            start_time=start_time
        )
        
        print("Response metrics:", metrics)
        evaluator._store_time_metrics("latency_seconds", metrics["latency_seconds"])

        if metrics.get("query_response_relevance") is not None:
            evaluator._store_time_metrics("query_relevance", metrics["query_response_relevance"])
        
        if metrics.get("context_relevance") is not None:
            evaluator._store_time_metrics("context_relevance", metrics["context_relevance"])

        return response_text

    except Exception as e:
        print(f"Error in get_chat_response: {str(e)}")
        return "I apologize, but I encountered an error processing your request. Please try again."