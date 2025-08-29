import os
import logging
import pandas as pd
from typing import List, Dict, Tuple, Optional
import csv

logger = logging.getLogger(__name__)

class SORMatcher:
    """Service for matching SOR/BOQ items with rate suggestions"""
    
    def __init__(self, rates_csv_path: str = None):
        self.rates_csv_path = rates_csv_path or os.getenv("RATES_CSV", "data/rates.csv")
        self.rates_data = []
        self.load_rates()
    
    def load_rates(self):
        """Load rate data from CSV file"""
        try:
            if os.path.exists(self.rates_csv_path):
                with open(self.rates_csv_path, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    self.rates_data = list(reader)
                logger.info(f"Loaded {len(self.rates_data)} rate entries from {self.rates_csv_path}")
            else:
                logger.warning(f"Rates file not found: {self.rates_csv_path}")
                # Create sample data
                self.rates_data = self._create_sample_rates()
        except Exception as e:
            logger.error(f"Error loading rates data: {str(e)}")
            self.rates_data = self._create_sample_rates()
    
    def _create_sample_rates(self) -> List[Dict]:
        """Create sample rate data for demonstration"""
        return [
            {"item": "Demolition of brick wall", "unit": "m2", "rate": "25.00", "category": "Demolition"},
            {"item": "Plastering walls", "unit": "m2", "rate": "18.50", "category": "Finishes"},
            {"item": "Laying ceramic tiles", "unit": "m2", "rate": "32.00", "category": "Finishes"},
            {"item": "Installing ceiling boards", "unit": "m2", "rate": "22.00", "category": "Finishes"},
            {"item": "Electrical wiring", "unit": "m", "rate": "8.50", "category": "Electrical"},
            {"item": "Plumbing pipes installation", "unit": "m", "rate": "15.00", "category": "Plumbing"},
            {"item": "Painting walls", "unit": "m2", "rate": "12.00", "category": "Finishes"},
            {"item": "Floor screeding", "unit": "m2", "rate": "20.00", "category": "Finishes"},
            {"item": "Installing kitchen cabinets", "unit": "set", "rate": "850.00", "category": "Carpentry"},
            {"item": "Door installation", "unit": "no", "rate": "180.00", "category": "Carpentry"}
        ]
    
    def match_items(self, items: List[Dict]) -> List[Dict]:
        """
        Match SOR/BOQ items with rate suggestions
        
        Args:
            items: List of item dictionaries with description and unit
            
        Returns:
            List of items with matched rates and suggestions
        """
        matched_items = []
        
        for item in items:
            # Find best matching rate
            best_match = self._find_best_match(item)
            
            # Create matched item
            matched_item = item.copy()
            if best_match:
                matched_item.update({
                    "suggested_rate": best_match.get("rate"),
                    "suggested_unit": best_match.get("unit"),
                    "suggested_category": best_match.get("category"),
                    "confidence": best_match.get("confidence", 0.0)
                })
            else:
                matched_item.update({
                    "suggested_rate": None,
                    "suggested_unit": None,
                    "suggested_category": None,
                    "confidence": 0.0
                })
            
            matched_items.append(matched_item)
        
        return matched_items
    
    def _find_best_match(self, item: Dict) -> Optional[Dict]:
        """
        Find the best matching rate for an item
        
        Args:
            item: Item dictionary with description and unit
            
        Returns:
            Best matching rate entry or None
        """
        item_description = item.get("description", "").lower()
        item_unit = item.get("unit", "").lower()
        
        best_match = None
        best_score = 0.0
        
        for rate_entry in self.rates_data:
            rate_description = rate_entry.get("item", "").lower()
            rate_unit = rate_entry.get("unit", "").lower()
            
            # Calculate similarity score
            score = self._calculate_similarity(item_description, rate_description, item_unit, rate_unit)
            
            if score > best_score:
                best_score = score
                best_match = rate_entry.copy()
                best_match["confidence"] = score
        
        return best_match if best_score > 0.3 else None  # Only return matches with reasonable confidence
    
    def _calculate_similarity(self, item_desc: str, rate_desc: str, item_unit: str, rate_unit: str) -> float:
        """
        Calculate similarity between item and rate entry
        
        Args:
            item_desc: Item description
            rate_desc: Rate entry description
            item_unit: Item unit
            rate_unit: Rate entry unit
            
        Returns:
            Similarity score between 0 and 1
        """
        # Simple keyword matching approach
        # In a real implementation, this would use more sophisticated NLP techniques
        
        # Description similarity
        desc_score = 0.0
        item_words = set(item_desc.split())
        rate_words = set(rate_desc.split())
        
        if item_words and rate_words:
            common_words = item_words.intersection(rate_words)
            desc_score = len(common_words) / max(len(item_words), len(rate_words))
        
        # Unit similarity
        unit_score = 1.0 if item_unit == rate_unit else 0.0
        
        # Combined score (weighted)
        combined_score = 0.8 * desc_score + 0.2 * unit_score
        return combined_score
    
    def add_rate(self, item: str, unit: str, rate: str, category: str):
        """
        Add a new rate entry
        
        Args:
            item: Item description
            unit: Unit of measurement
            rate: Rate value
            category: Category
        """
        new_entry = {
            "item": item,
            "unit": unit,
            "rate": rate,
            "category": category
        }
        
        self.rates_data.append(new_entry)
        logger.info(f"Added new rate entry: {item}")
    
    def save_rates(self):
        """Save rates data to CSV file"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(self.rates_csv_path), exist_ok=True)
            
            with open(self.rates_csv_path, 'w', newline='', encoding='utf-8') as f:
                if self.rates_data:
                    writer = csv.DictWriter(f, fieldnames=self.rates_data[0].keys())
                    writer.writeheader()
                    writer.writerows(self.rates_data)
            
            logger.info(f"Saved {len(self.rates_data)} rate entries to {self.rates_csv_path}")
        except Exception as e:
            logger.error(f"Error saving rates data: {str(e)}")
            raise