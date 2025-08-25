import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional, Dict, Any
import io

from ai_service.services.ocr import OCRService
from ai_service.services.pdf_utils import PDFUtils
from ai_service.services.llm import LLMService

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
ocr_service = OCRService()
pdf_utils = PDFUtils()
llm_service = LLMService()

@router.post("/process")
async def process_invoice(
    file: UploadFile = File(...),
    use_llm: bool = Form(False),
    llm_provider: str = Form("ollama")
):
    """
    Process an invoice document (PDF/image) and extract structured data
    
    Args:
        file: Uploaded invoice file (PDF, JPG, PNG)
        use_llm: Whether to use LLM for enhanced extraction
        llm_provider: LLM provider to use (ollama, openai)
        
    Returns:
        Extracted invoice data in JSON format
    """
    try:
        # Validate file type
        if file.content_type not in ["application/pdf", "image/jpeg", "image/png"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Please upload PDF, JPG, or PNG files."
            )
        
        # Read file content
        content = await file.read()
        
        # Extract text based on file type
        if file.content_type == "application/pdf":
            text = pdf_utils.extract_text_from_pdf(content)
        else:  # Image file
            text = ocr_service.extract_text_from_image(content)
        
        # Extract data from text
        if use_llm:
            # Use LLM for enhanced extraction
            extracted_data = llm_service.extract_invoice_data(text)
        else:
            # Use basic pattern matching
            extracted_data = ocr_service.extract_data_from_text(text)
        
        # Add file metadata
        extracted_data["file_name"] = file.filename
        extracted_data["file_size"] = len(content)
        extracted_data["content_type"] = file.content_type
        extracted_data["extraction_method"] = "llm" if use_llm else "pattern_matching"
        
        logger.info(f"Successfully processed invoice: {file.filename}")
        
        return {
            "status": "success",
            "data": extracted_data,
            "message": "Invoice processed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing invoice: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing invoice: {str(e)}"
        )

@router.post("/review")
async def review_invoice_data(
    invoice_data: Dict[str, Any]
):
    """
    Submit reviewed invoice data (human-in-the-loop step)
    
    Args:
        invoice_data: Reviewed invoice data
        
    Returns:
        Confirmation of submission
    """
    try:
        # In a real implementation, this would save the reviewed data
        # For now, we just log it
        logger.info(f"Received reviewed invoice data: {invoice_data}")
        
        return {
            "status": "success",
            "message": "Invoice data submitted successfully",
            "data": invoice_data
        }
        
    except Exception as e:
        logger.error(f"Error submitting reviewed invoice data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting invoice data: {str(e)}"
        )