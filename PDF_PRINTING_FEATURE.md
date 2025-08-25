# PDF Printing Feature for Quotations

## Overview
This document describes the implementation of the PDF printing functionality for quotations in the Ampere Engineering application. The feature allows users to generate printable versions of quotations directly from the browser.

## Implementation Details

### 1. PDF Generation Utility
A new utility file `src/lib/pdf-generator.ts` was created with the following functions:

- `generateQuotationPDF(quotation, client)`: Generates an HTML string representation of a quotation that can be printed
- `printQuotation(quotation, client)`: Opens the quotation in a new browser window for printing

### 2. Integration Points

#### Quotation Detail Page
- Added a "Print" button in the header actions
- Uses the `printQuotation` function to generate and open the printable version
- Located at `src/app/quotations/[id]/page.tsx`

#### Quotation Listing Page
- Added a print icon button for each quotation in the table
- Uses the `printQuotation` function to generate and open the printable version
- Located at `src/app/quotations/page.tsx`

#### Quotation Form
- Added a "Print Preview" button when editing a quotation
- Generates a preview of the quotation before saving
- Located at `src/components/forms/QuotationForm.tsx`

## Features

### Printable Quotation Format
The generated PDF includes:

1. **Company Information**
   - Ampere Engineering Pte Ltd branding
   - Company address, phone, email, and website

2. **Quotation Details**
   - Quotation number and date
   - Valid until date
   - Status badge
   - Client information

3. **Items Table**
   - Description, quantity, unit, unit price, and total for each item
   - Professional table formatting

4. **Financial Summary**
   - Subtotal
   - GST (7%)
   - Discount (if applicable)
   - Total amount

5. **Terms & Conditions**
   - List of terms from the quotation

6. **Notes**
   - Additional notes if provided

7. **Signature Section**
   - Prepared by and accepted by signature lines

8. **Footer**
   - Company information and validity notice

### Print Controls
- Browser-native print dialog
- Close button to return to the application
- Responsive design that works on different screen sizes

## Usage Instructions

### From Quotation Detail Page
1. Navigate to a quotation detail page
2. Click the "Print" button in the top right corner
3. A new window will open with the printable quotation
4. Use the browser's print function (Ctrl+P or Cmd+P) to print or save as PDF

### From Quotation Listing Page
1. Navigate to the quotations listing page
2. Find the quotation you want to print
3. Click the printer icon in the actions column
4. A new window will open with the printable quotation
5. Use the browser's print function to print or save as PDF

### From Quotation Form (Preview)
1. When editing a quotation, click the "Print Preview" button
2. A new window will open with the preview of the quotation
3. Use the browser's print function to print or save as PDF

## Technical Implementation

### HTML-Based Approach
The implementation uses HTML and CSS to generate a printable version rather than a dedicated PDF library. This approach was chosen because:

1. **No additional dependencies**: Works with standard browser capabilities
2. **Cross-platform compatibility**: Works on all modern browsers
3. **Easy customization**: Can be styled with CSS
4. **Print optimization**: Uses CSS print media queries for optimal printing

### Styling
The printable version includes:

- Professional layout with company branding
- Responsive design that adapts to different paper sizes
- Print-specific CSS that hides unnecessary UI elements
- Proper formatting for financial information
- Signature sections for legal compliance

### Data Sources
The feature integrates with existing data structures:

- Uses quotation data from `QuotationContext`
- Gets client information from `ClientContext`
- Formats currency using Singapore-specific formatting
- Handles all quotation statuses appropriately

## Browser Support
The feature works with all modern browsers that support:
- `window.open()`
- `window.print()`
- CSS3 features (flexbox, grid, media queries)

## Limitations
1. **No true PDF generation**: Creates HTML that can be saved as PDF through the browser
2. **Limited styling control**: Dependent on browser print engine
3. **No server-side generation**: Processing happens entirely in the browser

## Future Enhancements
Possible improvements for future versions:

1. **Server-side PDF generation**: Using libraries like Puppeteer or wkhtmltopdf
2. **Custom templates**: Allow users to customize the print layout
3. **Digital signatures**: Integration with e-signature services
4. **Batch printing**: Print multiple quotations at once
5. **Export options**: Save directly as PDF without browser dialog

## Troubleshooting

### Print Dialog Not Appearing
- Ensure popups are not blocked by the browser
- Check browser print settings
- Try using the keyboard shortcut (Ctrl+P or Cmd+P)

### Formatting Issues
- Some browsers may render fonts differently
- Check print preview before printing
- Ensure paper size is set correctly in print settings

### Missing Data
- Verify all quotation fields are properly filled
- Check that client information is available
- Ensure browser has access to all required data

## Maintenance
To maintain this feature:

1. Update company information in the PDF generator when it changes
2. Ensure currency formatting remains consistent with other parts of the application
3. Test with new quotation fields when added
4. Verify compatibility with browser updates

## Testing
The feature has been tested with:
- Chrome (latest version)
- Firefox (latest version)
- Safari (latest version)
- Edge (latest version)
- Mobile browsers (responsive design)

All tests confirmed proper printing functionality and formatting.