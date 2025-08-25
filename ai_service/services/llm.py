import os
import logging
import json
import requests
from typing import Dict, Any, Optional, List
import openai

logger = logging.getLogger(__name__)

class LLMService:
    """Service for interacting with Large Language Models"""
    
    def __init__(self):
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "llama2")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
        # Configure OpenAI if API key is provided
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
    
    def extract_invoice_data(self, text: str) -> Dict[str, Any]:
        """
        Extract structured invoice data from text using LLM
        
        Args:
            text: Raw text from invoice document
            
        Returns:
            Dictionary with extracted invoice data
        """
        prompt = f"""
        Extract the following information from the invoice text below:
        - Invoice number
        - Vendor name
        - Issue date
        - Due date
        - Total amount
        - GST amount
        - Subtotal
        - Line items (description, quantity, unit price, total)
        - Vendor address
        - Vendor contact information
        
        Invoice text:
        {text}
        
        Return the extracted information as a JSON object with the following structure:
        {{
            "invoice_number": "string",
            "vendor_name": "string",
            "issue_date": "string (YYYY-MM-DD)",
            "due_date": "string (YYYY-MM-DD)",
            "total_amount": number,
            "gst_amount": number,
            "subtotal": number,
            "line_items": [
                {{
                    "description": "string",
                    "quantity": number,
                    "unit_price": number,
                    "total": number
                }}
            ],
            "vendor_address": "string",
            "vendor_contact": "string"
        }}
        
        If any information is not found, leave the field as null or empty array.
        Only return the JSON object, nothing else.
        """
        
        try:
            response = self._call_llm(prompt)
            # Parse JSON response
            extracted_data = json.loads(response)
            return extracted_data
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing LLM response as JSON: {str(e)}")
            return {}
        except Exception as e:
            logger.error(f"Error extracting invoice data with LLM: {str(e)}")
            return {}
    
    def suggest_sor_rates(self, items: List[Dict]) -> List[Dict]:
        """
        Suggest rates for SOR/BOQ items using LLM
        
        Args:
            items: List of SOR/BOQ items
            
        Returns:
            List of items with suggested rates
        """
        items_text = "\n".join([
            f"- {item.get('description', '')} (Unit: {item.get('unit', '')})"
            for item in items
        ])
        
        prompt = f"""
        For each of the following construction items, suggest appropriate rates in SGD:
        
        {items_text}
        
        Return the results as a JSON array with the following structure for each item:
        {{
            "description": "string",
            "unit": "string",
            "suggested_rate": number,
            "suggested_category": "string",
            "notes": "string (optional)"
        }}
        
        Base your suggestions on typical Singapore construction rates.
        Only return the JSON array, nothing else.
        """
        
        try:
            response = self._call_llm(prompt)
            # Parse JSON response
            suggested_rates = json.loads(response)
            return suggested_rates
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing LLM response as JSON: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Error suggesting SOR rates with LLM: {str(e)}")
            return []
    
    def _call_llm(self, prompt: str) -> str:
        """
        Call the LLM with the given prompt
        
        Args:
            prompt: Prompt to send to the LLM
            
        Returns:
            LLM response text
        """
        # Try OpenAI first if API key is available
        if self.openai_api_key:
            try:
                return self._call_openai(prompt)
            except Exception as e:
                logger.warning(f"OpenAI call failed: {str(e)}")
        
        # Fall back to Ollama
        try:
            return self._call_ollama(prompt)
        except Exception as e:
            logger.error(f"Ollama call failed: {str(e)}")
            raise
    
    def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts structured data from documents."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        return response.choices[0].message.content.strip()
    
    def _call_ollama(self, prompt: str) -> str:
        """Call Ollama API"""
        url = f"{self.ollama_base_url}/api/generate"
        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "stream": False
        }
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        result = response.json()
        return result.get("response", "").strip()