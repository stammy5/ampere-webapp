import io
import logging
from typing import Dict, List, Any
import pdfplumber
import pandas as pd
from PIL import Image

logger = logging.getLogger(__name__)

class PDFUtils:
    """Utility service for processing PDF documents"""
    
    def __init__(self):
        pass
    
    def extract_tables_from_pdf(self, pdf_bytes: bytes) -> List[List[List[str]]]:
        """
        Extract tables from PDF bytes
        
        Args:
            pdf_bytes: PDF file bytes
            
        Returns:
            List of tables, where each table is a list of rows, 
            and each row is a list of cell values
        """
        try:
            tables = []
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    page_tables = page.extract_tables()
                    if page_tables:
                        tables.extend(page_tables)
            return tables
        except Exception as e:
            logger.error(f"Error extracting tables from PDF: {str(e)}")
            raise
    
    def extract_images_from_pdf(self, pdf_bytes: bytes) -> List[bytes]:
        """
        Extract images from PDF bytes
        
        Args:
            pdf_bytes: PDF file bytes
            
        Returns:
            List of image bytes
        """
        try:
            images = []
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    for image in page.images:
                        try:
                            # Extract image bytes
                            image_bytes = image["stream"].get_data()
                            images.append(image_bytes)
                        except Exception as e:
                            logger.warning(f"Could not extract image: {str(e)}")
                            continue
            return images
        except Exception as e:
            logger.error(f"Error extracting images from PDF: {str(e)}")
            raise
    
    def pdf_to_images(self, pdf_bytes: bytes) -> List[Image.Image]:
        """
        Convert PDF pages to PIL Images
        
        Args:
            pdf_bytes: PDF file bytes
            
        Returns:
            List of PIL Images, one for each page
        """
        try:
            images = []
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    # Convert page to image
                    image = page.to_image(resolution=150)
                    # Convert to PIL Image
                    pil_image = image.original
                    images.append(pil_image)
            return images
        except Exception as e:
            logger.error(f"Error converting PDF to images: {str(e)}")
            raise
    
    def extract_metadata(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Extract metadata from PDF
        
        Args:
            pdf_bytes: PDF file bytes
            
        Returns:
            Dictionary with PDF metadata
        """
        try:
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                metadata = pdf.metadata or {}
                return {
                    "title": metadata.get("Title", ""),
                    "author": metadata.get("Author", ""),
                    "subject": metadata.get("Subject", ""),
                    "creator": metadata.get("Creator", ""),
                    "producer": metadata.get("Producer", ""),
                    "creation_date": metadata.get("CreationDate", ""),
                    "modification_date": metadata.get("ModDate", ""),
                    "num_pages": len(pdf.pages)
                }
        except Exception as e:
            logger.error(f"Error extracting metadata from PDF: {str(e)}")
            raise