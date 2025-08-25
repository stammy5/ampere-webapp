// Mock OCR service for processing invoice documents
// In a real implementation, this would integrate with an OCR service like Google Vision API, AWS Textract, or Tesseract.js

interface OcrResult {
  invoiceNumber?: string
  vendorName?: string
  issueDate?: string
  dueDate?: string
  totalAmount?: number
  subtotal?: number
  taxAmount?: number
  lineItems?: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  vendorAddress?: string
  vendorContact?: string
}

class OcrService {
  async processInvoice(file: File): Promise<{ success: boolean; data?: OcrResult; error?: string }> {
    try {
      // Simulate OCR processing time
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In a real implementation, you would:
      // 1. Upload the file to your OCR service
      // 2. Process the document
      // 3. Extract relevant data
      // 4. Return structured data
      
      // For demonstration, we'll return mock data
      const mockResult: OcrResult = {
        invoiceNumber: 'INV-2025-001',
        vendorName: 'ABC Supplies Pte Ltd',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalAmount: 1070.00,
        subtotal: 1000.00,
        taxAmount: 70.00,
        lineItems: [
          {
            description: 'Office Supplies',
            quantity: 1,
            unitPrice: 500.00,
            total: 500.00
          },
          {
            description: 'Equipment',
            quantity: 1,
            unitPrice: 500.00,
            total: 500.00
          }
        ],
        vendorAddress: '123 Business Park, Singapore 123456',
        vendorContact: 'contact@abcsupplies.com'
      }

      return { success: true, data: mockResult }
    } catch (error) {
      console.error('Error processing invoice with OCR:', error)
      return { success: false, error: 'Failed to process invoice with OCR' }
    }
  }

  async processInvoiceFromUrl(fileUrl: string): Promise<{ success: boolean; data?: OcrResult; error?: string }> {
    try {
      // Simulate OCR processing time
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In a real implementation, you would process the file from the URL
      // For demonstration, we'll return mock data
      const mockResult: OcrResult = {
        invoiceNumber: 'INV-2025-002',
        vendorName: 'XYZ Services Pte Ltd',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalAmount: 2140.00,
        subtotal: 2000.00,
        taxAmount: 140.00,
        lineItems: [
          {
            description: 'Consulting Services',
            quantity: 20,
            unitPrice: 100.00,
            total: 2000.00
          }
        ],
        vendorAddress: '456 Commercial Road, Singapore 654321',
        vendorContact: 'billing@xyzservices.com'
      }

      return { success: true, data: mockResult }
    } catch (error) {
      console.error('Error processing invoice from URL with OCR:', error)
      return { success: false, error: 'Failed to process invoice from URL with OCR' }
    }
  }
}

// Export singleton instance
export const ocrService = new OcrService()