import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import List, Dict, Any, Optional
import io
import csv

from ai_service.services.pdf_utils import PDFUtils
from ai_service.services.sor_matcher import SORMatcher
from ai_service.services.excel_writer import ExcelWriter
from ai_service.services.llm import LLMService

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
pdf_utils = PDFUtils()
sor_matcher = SORMatcher()
excel_writer = ExcelWriter()
llm_service = LLMService()

@router.post("/process")
async def process_sor(
    file: UploadFile = File(...),
    use_llm: bool = Form(False),
    output_format: str = Form("json")
):
    """
    Process a SOR/BOQ document and suggest rates
    
    Args:
        file: Uploaded SOR/BOQ file (PDF, CSV)
        use_llm: Whether to use LLM for enhanced rate suggestions
        output_format: Output format (json, excel)
        
    Returns:
        Processed SOR data with rate suggestions
    """
    try:
        # Validate file type
        if file.content_type not in ["application/pdf", "text/csv"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Please upload PDF or CSV files."
            )
        
        # Read file content
        content = await file.read()
        
        # Extract items based on file type
        items = []
        if file.content_type == "application/pdf":
            items = _extract_items_from_pdf(content)
        elif file.content_type == "text/csv":
            items = _extract_items_from_csv(content)
        
        # Match items with rate suggestions
        if use_llm:
            # Use LLM for enhanced rate suggestions
            matched_items = llm_service.suggest_sor_rates(items)
        else:
            # Use basic matching
            matched_items = sor_matcher.match_items(items)
        
        # Prepare response based on output format
        if output_format == "excel":
            # Generate Excel file
            excel_bytes = excel_writer.create_sor_excel(matched_items)
            
            return {
                "status": "success",
                "data": matched_items,
                "excel_data": excel_bytes.hex(),  # Convert to hex for JSON serialization
                "message": "SOR processed successfully"
            }
        else:
            # Return JSON
            return {
                "status": "success",
                "data": matched_items,
                "message": "SOR processed successfully"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing SOR: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing SOR: {str(e)}"
        )

def _extract_items_from_pdf(pdf_bytes: bytes) -> List[Dict]:
    """
    Extract items from PDF SOR/BOQ document
    
    Args:
        pdf_bytes: PDF file bytes
        
    Returns:
        List of item dictionaries
    """
    try:
        # Extract tables from PDF
        tables = pdf_utils.extract_tables_from_pdf(pdf_bytes)
        
        items = []
        for table in tables:
            # Process each table
            if len(table) > 1:  # Need at least header and one row
                header = table[0]
                for row in table[1:]:
                    # Create item dictionary
                    item = {}
                    for i, cell in enumerate(row):
                        if i < len(header):
                            item[header[i].lower().replace(' ', '_')] = cell or ""
                    
                    # Ensure required fields exist
                    if "description" not in item:
                        item["description"] = item.get("item", "") or item.get("work_description", "")
                    
                    if "unit" not in item:
                        item["unit"] = item.get("uom", "") or item.get("units", "")
                    
                    if "quantity" not in item:
                        item["quantity"] = item.get("qty", "") or "1"
                    
                    items.append(item)
        
        return items
    except Exception as e:
        logger.error(f"Error extracting items from PDF: {str(e)}")
        return []

def _extract_items_from_csv(csv_bytes: bytes) -> List[Dict]:
    """
    Extract items from CSV SOR/BOQ document
    
    Args:
        csv_bytes: CSV file bytes
        
    Returns:
        List of item dictionaries
    """
    try:
        # Decode bytes to string
        csv_string = csv_bytes.decode('utf-8')
        
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(csv_string))
        
        items = []
        for row in csv_reader:
            # Normalize field names
            item = {}
            for key, value in row.items():
                normalized_key = key.lower().replace(' ', '_')
                item[normalized_key] = value
            
            # Ensure required fields exist
            if "description" not in item:
                item["description"] = item.get("item", "") or item.get("work_description", "")
            
            if "unit" not in item:
                item["unit"] = item.get("uom", "") or item.get("units", "")
            
            if "quantity" not in item:
                item["quantity"] = item.get("qty", "") or "1"
            
            items.append(item)
        
        return items
    except Exception as e:
        logger.error(f"Error extracting items from CSV: {str(e)}")
        return []

@router.post("/suggest-rates")
async def suggest_rates(
    items: List[Dict[str, Any]]
):
    """
    Suggest rates for SOR/BOQ items
    
    Args:
        items: List of SOR/BOQ items
        
    Returns:
        Items with suggested rates
    """
    try:
        # Match items with rate suggestions
        matched_items = sor_matcher.match_items(items)
        
        return {
            "status": "success",
            "data": matched_items,
            "message": "Rate suggestions generated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error suggesting rates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error suggesting rates: {str(e)}"
        )

@router.get("/sample-rates")
async def get_sample_rates():
    """
    Get sample rate data for demonstration
    
    Returns:
        Sample rate data
    """
    try:
        return {
            "status": "success",
            "data": sor_matcher.rates_data,
            "message": "Sample rates retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error retrieving sample rates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving sample rates: {str(e)}"
        )