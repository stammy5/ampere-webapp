import pytest
import os
import sys

# Add the ai_service directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ai_service.services.ocr import OCRService
from ai_service.services.sor_matcher import SORMatcher

def test_ocr_service_initialization():
    """Test OCR service initialization"""
    ocr_service = OCRService()
    assert ocr_service is not None

def test_sor_matcher_initialization():
    """Test SOR matcher initialization"""
    sor_matcher = SORMatcher()
    assert sor_matcher is not None
    assert len(sor_matcher.rates_data) > 0

def test_sor_matcher_sample_data():
    """Test SOR matcher has sample data"""
    sor_matcher = SORMatcher()
    sample_item = {"description": "Demolition of brick wall", "unit": "m2"}
    matched_items = sor_matcher.match_items([sample_item])
    
    assert len(matched_items) == 1
    matched_item = matched_items[0]
    assert matched_item["description"] == sample_item["description"]
    assert matched_item["unit"] == sample_item["unit"]
    assert "suggested_rate" in matched_item
    assert "suggested_category" in matched_item