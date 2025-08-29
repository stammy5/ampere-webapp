import logging
from typing import Dict, Any, Optional
import pytesseract
from PIL import Image
import pdfplumber
import io

logger = logging.getLogger(__name__)

class OCRService:
    """Service for extracting text from images and PDFs"""
    
    def __init__(self):
        pass
    
    def extract_text_from_image(self, image_bytes: bytes) -> str:
        """
        Extract text from image bytes using OCR
        
        Args:
            image_bytes: Image file bytes
            
        Returns:
            Extracted text from the image
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            raise
    
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """
        Extract text from PDF bytes
        
        Args:
            pdf_bytes: PDF file bytes
            
        Returns:
            Extracted text from the PDF
        """
        try:
            text = ""
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise
    
    def extract_data_from_text(self, text: str) -> Dict[str, Any]:
        """
        Extract structured data from text using basic pattern matching
        
        Args:
            text: Raw text extracted from document
            
        Returns:
            Dictionary with extracted data fields
        """
        # This is a placeholder implementation
        # In a real implementation, this would use more sophisticated NLP techniques
        data = {
            "raw_text": text,
            "invoice_number": self._extract_invoice_number(text),
            "vendor_name": self._extract_vendor_name(text),
            "total_amount": self._extract_total_amount(text),
            "date": self._extract_date(text)
        }
        return data
    
    def _extract_invoice_number(self, text: str) -> Optional[str]:
        """Extract invoice number from text"""
        # Simple pattern matching - in reality, this would be more sophisticated
        import re
        patterns = [
            r'Invoice\s*#?\s*:?\s*([A-Z0-9\-]+)',
            r'INV\s*#?\s*:?\s*([A-Z0-9\-]+)',
            r'([A-Z0-9]{2,}-[0-9]{2,})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        return None
    
    def _extract_vendor_name(self, text: str) -> Optional[str]:
        """Extract vendor name from text"""
        # This would typically use more advanced NLP techniques
        lines = text.split('\n')
        if lines:
            return lines[0].strip()  # Simplified - first line as vendor name
        return None
    
    def _extract_total_amount(self, text: str) -> Optional[float]:
        """Extract total amount from text"""
        import re
        # Look for patterns like Total, Amount, etc. followed by a number
        patterns = [
            r'(?:Total|Amount Due|Balance Due)[:\s]*\$?([0-9,]+\.?[0-9]*)',
            r'\$([0-9,]+\.?[0-9]*)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                # Return the highest amount found
                amounts = []
                for match in matches:
                    try:
                        amounts.append(float(match.replace(',', '')))
                    except ValueError:
                        continue
                if amounts:
                    return max(amounts)
        return None
    
    def _extract_date(self, text: str) -> Optional[str]:
        """Extract date from text"""
        import re
        # Look for date patterns
        patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',  # MM/DD/YYYY or MM-DD-YYYY
            r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})'     # YYYY-MM-DD
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        return None