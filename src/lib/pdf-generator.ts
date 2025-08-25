// PDF Generator utility for quotation printing
// This is a simplified version that creates a printable HTML version
// In a production environment, you would use libraries like jsPDF or html2canvas

/**
 * Generate a printable HTML version of a quotation
 * @param quotation The quotation data
 * @param client The client data
 * @returns HTML string for printing
 */
export const generateQuotationPDF = (quotation: any, client: any): string => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-SG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
      converted: 'bg-purple-100 text-purple-800'
    }

    const statusLabels: Record<string, string> = {
      draft: 'Draft',
      pending_approval: 'Pending Approval',
      sent: 'Sent',
      accepted: 'Accepted',
      rejected: 'Rejected',
      expired: 'Expired',
      converted: 'Converted'
    }

    return `
      <span class="${statusColors[status] || 'bg-gray-100 text-gray-800'} px-2 py-1 text-xs font-medium rounded-full">
        ${statusLabels[status] || status}
      </span>
    `
  }

  // Generate items table HTML
  const itemsTable = `
    <table class="items-table">
      <thead>
        <tr>
          <th width="40%" style="text-align: left;">Description</th>
          <th width="15%" style="text-align: left;">Quantity</th>
          <th width="15%" style="text-align: left;">Unit</th>
          <th width="15%" style="text-align: right;">Unit Price</th>
          <th width="15%" style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${quotation.items.map((item: any) => `
          <tr>
            <td style="text-align: left;">${item.description}</td>
            <td style="text-align: left;">${item.quantity}</td>
            <td style="text-align: left;">${item.unit}</td>
            <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
            <td style="text-align: right;">${formatCurrency(item.totalPrice)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `

  // Generate terms list
  const termsList = quotation.terms && quotation.terms.length > 0 ? `
    <ul class="list-disc pl-5 space-y-1">
      ${quotation.terms.map((term: string) => `<li class="text-sm text-gray-600">${term}</li>`).join('')}
    </ul>
  ` : ''

  // Generate HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quotation ${quotation.quotationNumber}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .company-info h1 {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin: 0 0 5px 0;
        }
        .company-info p {
          margin: 2px 0;
          font-size: 14px;
          color: #6b7280;
        }
        .quotation-info {
          text-align: right;
        }
        .quotation-info h2 {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 10px 0;
          color: #1f2937;
        }
        .quotation-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .client-info div {
          margin: 5px 0;
          font-size: 14px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        .items-table th {
          background-color: #f9fafb;
          padding: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .totals-table {
          width: 300px;
        }
        .totals-table tr:not(:last-child) td {
          padding-bottom: 8px;
        }
        .totals-table td {
          padding-top: 8px;
        }
        .totals-table td:first-child {
          text-align: left;
        }
        .totals-table td:last-child {
          text-align: right;
          width: 15%; /* Match the width of the Total column in items table */
        }
        .total-row {
          font-weight: bold;
          font-size: 16px;
        }
        .terms-list {
          padding-left: 20px;
        }
        .terms-list li {
          margin: 5px 0;
          font-size: 14px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        .signature-box {
          width: 45%;
        }
        .signature-line {
          margin-top: 60px;
          border-top: 1px solid #000;
          padding-top: 5px;
          font-size: 14px;
        }
        .accreditations {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 30px;
          padding: 20px 0;
        }
        .accreditation-logo {
          height: 50px;
        }
        .company-logo {
          height: 40px;
          margin-bottom: 10px;
        }
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <img src="/images/ampere-logo.png" alt="Ampere Engineering Pte Ltd" class="company-logo" />
          <h1>Ampere Engineering Pte Ltd</h1>
          <p>101 Upper Cross Street, #04-05 People's Park Centre</p>
          <p>Singapore 058357</p>
          <p>Phone: +65 6123 4567</p>
          <p>Email: projects@ampere.com.sg</p>
          <p>GST Registration No: 201021612W</p>
        </div>
        <div class="quotation-info">
          <h2>QUOTATION</h2>
          <p><strong>Number:</strong> ${quotation.quotationNumber}</p>
          <p><strong>Date:</strong> ${formatDate(quotation.createdAt)}</p>
          <p><strong>Valid Until:</strong> ${formatDate(quotation.validUntil)}</p>
          <div style="margin-top: 10px;">${getStatusBadge(quotation.status)}</div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Client Information</h3>
        <div class="client-info">
          <div><strong>${client?.name || 'N/A'}</strong></div>
          <div>${client?.contactPerson || 'N/A'}</div>
          <div>${client?.address?.street || ''} ${client?.address?.building || ''} ${client?.address?.unit || ''}</div>
          <div>Singapore ${client?.address?.postalCode || ''}</div>
          <div>Phone: ${client?.phone || 'N/A'}</div>
          <div>Email: ${client?.email || 'N/A'}</div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Quotation Details</h3>
        <p>${quotation.description || 'No description provided'}</p>
      </div>

      <div class="section">
        <h3 class="section-title">Items</h3>
        ${itemsTable}
        
        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td width="70%" style="text-align: right;">Subtotal:</td>
              <td width="15%" style="text-align: right;">${formatCurrency(quotation.subtotal)}</td>
            </tr>
            <tr>
              <td style="text-align: right;">GST (7%):</td>
              <td style="text-align: right;">${formatCurrency(quotation.gst)}</td>
            </tr>
            ${quotation.discount && quotation.discount > 0 ? `
            <tr>
              <td style="text-align: right;">Discount:</td>
              <td style="text-align: right;">-${formatCurrency(quotation.discount)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td style="text-align: right;">Total Amount:</td>
              <td style="text-align: right;">${formatCurrency(quotation.totalAmount)}</td>
            </tr>
          </table>
        </div>
      </div>

      ${quotation.terms && quotation.terms.length > 0 ? `
      <div class="section">
        <h3 class="section-title">Terms & Conditions</h3>
        ${termsList}
      </div>
      ` : ''}

      ${quotation.notes ? `
      <div class="section">
        <h3 class="section-title">Notes</h3>
        <p>${quotation.notes}</p>
      </div>
      ` : ''}

      <div class="signature-section">
        <div class="signature-box">
          <div>Prepared by:</div>
          <div class="signature-line">Authorized Signature</div>
        </div>
        <div class="signature-box">
          <div>Accepted by:</div>
          <div class="signature-line">Client Signature</div>
        </div>
      </div>

      <div class="accreditations">
        <img src="/images/bizsafe-logo.png" alt="BizSafe Star Accredited" class="accreditation-logo" />
        <img src="/images/iso45001-logo.png" alt="ISO 45001 Certified" class="accreditation-logo" />
      </div>

      <div class="footer">
        <p>This quotation is generated by Ampere Engineering Pte Ltd. Please contact us for any inquiries.</p>
        <p>Quotation is valid for 30 days from the date of issue unless otherwise stated.</p>
      </div>

      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="background-color: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
          Print Quotation
        </button>
        <button onclick="window.close()" style="background-color: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-left: 10px;">
          Close
        </button>
      </div>
    </body>
    </html>
  `

  return htmlContent
}

/**
 * Open quotation in a new window for printing
 * @param quotation The quotation data
 * @param client The client data
 */
export const printQuotation = (quotation: any, client: any) => {
  const htmlContent = generateQuotationPDF(quotation, client)
  
  // Open in new window
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
  }
}