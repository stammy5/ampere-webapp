import os
import logging
import pickle
import numpy as np
from typing import List, Dict, Tuple, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class VectorDB:
    """Simple vector database using TF-IDF and cosine similarity"""
    
    def __init__(self, index_path: str = None):
        self.index_path = index_path or os.getenv("FAISS_INDEX_PATH", "data/vector_index.pkl")
        self.vectorizer = TfidfVectorizer()
        self.documents = []
        self.vectors = None
        self.metadata = []
        
        # Load existing index if it exists
        if os.path.exists(self.index_path):
            self.load_index()
    
    def add_documents(self, documents: List[str], metadata: List[Dict] = None):
        """
        Add documents to the vector database
        
        Args:
            documents: List of text documents
            metadata: Optional list of metadata for each document
        """
        self.documents.extend(documents)
        if metadata:
            self.metadata.extend(metadata)
        else:
            self.metadata.extend([{}] * len(documents))
        
        # Update vectors
        self.vectors = self.vectorizer.fit_transform(self.documents)
        logger.info(f"Added {len(documents)} documents to vector database")
    
    def search(self, query: str, k: int = 5) -> List[Tuple[int, float, Dict]]:
        """
        Search for similar documents
        
        Args:
            query: Search query
            k: Number of results to return
            
        Returns:
            List of (index, similarity_score, metadata) tuples
        """
        if self.vectors is None or len(self.documents) == 0:
            return []
        
        # Vectorize query
        query_vector = self.vectorizer.transform([query])
        
        # Calculate similarities
        similarities = cosine_similarity(query_vector, self.vectors).flatten()
        
        # Get top k results
        top_indices = np.argsort(similarities)[::-1][:k]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0:  # Only return results with some similarity
                results.append((
                    idx,
                    float(similarities[idx]),
                    self.metadata[idx] if idx < len(self.metadata) else {}
                ))
        
        return results
    
    def get_document(self, index: int) -> Tuple[str, Dict]:
        """
        Get document by index
        
        Args:
            index: Document index
            
        Returns:
            Tuple of (document_text, metadata)
        """
        if index < len(self.documents):
            return self.documents[index], self.metadata[index] if index < len(self.metadata) else {}
        else:
            raise IndexError("Document index out of range")
    
    def save_index(self):
        """Save vector index to disk"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
            
            index_data = {
                'documents': self.documents,
                'metadata': self.metadata,
                'vectors': self.vectors,
                'vectorizer': self.vectorizer
            }
            
            with open(self.index_path, 'wb') as f:
                pickle.dump(index_data, f)
            
            logger.info(f"Vector index saved to {self.index_path}")
        except Exception as e:
            logger.error(f"Error saving vector index: {str(e)}")
            raise
    
    def load_index(self):
        """Load vector index from disk"""
        try:
            with open(self.index_path, 'rb') as f:
                index_data = pickle.load(f)
            
            self.documents = index_data['documents']
            self.metadata = index_data['metadata']
            self.vectors = index_data['vectors']
            self.vectorizer = index_data['vectorizer']
            
            logger.info(f"Vector index loaded from {self.index_path}")
        except Exception as e:
            logger.warning(f"Could not load vector index: {str(e)}")
            # Initialize empty vectors
            self.vectors = self.vectorizer.fit_transform(self.documents) if self.documents else None