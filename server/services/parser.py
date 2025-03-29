from utils.config import DOCAI_LOCATIONS
from google.cloud import documentai_v1 as documentai
from google.api_core import client_options
from fastapi import HTTPException, File, UploadFile
import os
import mimetypes


def get_mime_type(file_path: str) -> str:
    """Determine the MIME type based on file extension."""
    extension = os.path.splitext(file_path)[1].lower()
    mime_types = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg'
    }
    return mime_types.get(extension, 'application/octet-stream')

def initialize_document_ai_client(project_id: str, location: str = "us") -> documentai.DocumentProcessorServiceClient:
    """Initialize Document AI client with specified configuration."""
    if location not in DOCAI_LOCATIONS:
        raise ValueError(f"Invalid location. Available locations: {', '.join(DOCAI_LOCATIONS.keys())}")

    opts = client_options.ClientOptions(
        api_endpoint=DOCAI_LOCATIONS[location]
    )
    return documentai.DocumentProcessorServiceClient(client_options=opts)

def parse_document(temp_file_path: str):
    """
    Parse a document using Document AI OCR processor.
    Returns the extracted text.
    """
    try:
        # Retrieve environment variables
        project_id = os.getenv("PROJECT_ID")
        location = os.getenv("DOCAI_LOCATION", "us")  # Default to "us" if not set
        processor_id = os.getenv("DOCUMENTAI_PROCESSOR")

        if not project_id or not processor_id:
            raise ValueError("Missing required environment variables: PROJECT_ID or DOCAI_PROCESSOR_ID")
        
        # Initialize Document AI client
        client = initialize_document_ai_client(project_id=project_id, location=location)

        # Format the processor name
        name = f"projects/{project_id}/locations/{location}/processors/{processor_id}"

        # Read the file content
        with open(temp_file_path, "rb") as file:
            file_content = file.read()

        

        # Determine the MIME type based on the file extension
        # mime_type= mimetypes.guess_file_type(temp_file_path)
        # if mime_type is None:
        #     raise ValueError("Unsupported input file format. Could not determine MIME type.")

        print(f"Type of file_content: {type(file_content)}")
        print(f"Type of name: {type(name)}")

        raw_document = documentai.RawDocument(content=file_content, mime_type="application/pdf")
        # Create the process request
        try:
            request = documentai.ProcessRequest(
            name=name,
            raw_document=raw_document,
            # Enable advanced OCR features
            process_options=documentai.ProcessOptions(
                ocr_config=documentai.OcrConfig(
                    enable_native_pdf_parsing=True,
                    enable_image_quality_scores=True
                )
            )
        )
        except Exception as e:
            print(f"Error creating process request: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to create process request: {str(e)}")

        # Process the document
        try:
            result = client.process_document(request=request)
            document = result.document
        except Exception as e:
            print(f"Error processing document: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")

        # Extract text from the document
        try:
            text = document.text
            print(f"Extracted text length: {len(text)}")
            return text
        except Exception as e:
            print(f"Error extracting text from document: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")

    except ValueError as ve:
        print(f"ValueError in parsing: {str(ve)}")
        raise HTTPException(status_code=400, detail=f"Document parsing failed: {str(ve)}")
    except Exception as e:
        print(f"Error in parsing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
