# Ampere AI Document Processing Service

AI microservice for processing invoices and SOR/BOQ documents in the Ampere Engineering web application.

## Features

- **Invoice Processing**: Extract structured data from PDF and image invoices
- **SOR/BOQ Processing**: Suggest rates for Schedule of Rates/Bill of Quantities items
- **Multiple Output Formats**: JSON and Excel output
- **LLM Integration**: Support for enhanced extraction using Ollama or OpenAI
- **Human-in-the-loop Review**: API endpoints for manual review of extracted data
- **Secure Authentication**: API key based authentication

## Prerequisites

- Python 3.8+
- Docker (optional, for containerized deployment)
- Tesseract OCR (for image processing)
- Poppler (for PDF processing)

## Installation

### Option 1: Direct Installation

1. Install system dependencies:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install tesseract-ocr poppler-utils
   
   # macOS
   brew install tesseract poppler
   
   # Windows
   # Install Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
   # Install Poppler from: https://github.com/oschwartz10612/poppler-windows/releases/
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run the service:
   ```bash
   python main.py
   ```

### Option 2: Docker Installation

1. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

## API Endpoints

### Invoice Processing

- `POST /process_invoice/process` - Process invoice document
- `POST /process_invoice/review` - Submit reviewed invoice data

### SOR/BOQ Processing

- `POST /fill_sor/process` - Process SOR/BOQ document
- `POST /fill_sor/suggest-rates` - Suggest rates for items
- `GET /fill_sor/sample-rates` - Get sample rate data

## Configuration

The service can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `API_KEY` | API key for authentication | None |
| `OLLAMA_BASE_URL` | Ollama API base URL | http://localhost:11434 |
| `OLLAMA_MODEL` | Ollama model to use | llama2 |
| `OPENAI_API_KEY` | OpenAI API key (optional) | None |
| `FAISS_INDEX_PATH` | Vector index file path | data/vector_index.pkl |
| `RATES_CSV` | Rates CSV file path | data/rates.csv |
| `PORT` | Server port | 8000 |
| `ENVIRONMENT` | Environment (development/production) | development |

## Human-in-the-loop Review

The service includes a human review step for invoice processing:

1. Process invoice document using `/process_invoice/process`
2. Present extracted data to user for review
3. User can edit/correct the extracted data
4. Submit reviewed data using `/process_invoice/review`

## Development

### Running Tests

```bash
python -m pytest tests/
```

### Code Structure

```
ai_service/
├── main.py              # FastAPI application entry point
├── routers/             # API route handlers
│   ├── invoice.py       # Invoice processing endpoints
│   └── sor.py           # SOR/BOQ processing endpoints
├── services/            # Business logic services
│   ├── ocr.py           # OCR processing
│   ├── pdf_utils.py     # PDF utilities
│   ├── vector_db.py     # Vector database
│   ├── sor_matcher.py   # SOR matching
│   ├── excel_writer.py  # Excel output generation
│   └── llm.py           # LLM integration
├── data/                # Data files
│   └── rates.csv        # Rate data
├── tests/               # Unit tests
├── requirements.txt     # Python dependencies
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
├── .env.example         # Environment variables template
└── README.md            # This file
```

## License

This project is licensed under the MIT License.