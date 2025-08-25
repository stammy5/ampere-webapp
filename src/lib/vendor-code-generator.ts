// Vendor Code Generator for Ampere Engineering
// Generates auto-running vendor codes in format: AMP-V-XXX

import { Vendor } from '@/types'

/**
 * Generates the next sequential vendor code
 * Format: AMP-V-001, AMP-V-002, etc.
 * @param existingVendors Array of existing vendors
 * @returns Next available vendor code
 */
export function generateNextVendorCode(existingVendors: Vendor[]): string {
  const prefix = 'AMP-V-'
  
  // Extract existing code numbers
  const existingNumbers = existingVendors
    .map(vendor => vendor.vendorCode)
    .filter(code => code && code.startsWith(prefix))
    .map(code => {
      const numberPart = code.replace(prefix, '')
      return parseInt(numberPart, 10)
    })
    .filter(num => !isNaN(num))
  
  // Find the highest existing number
  const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0
  
  // Generate next number with leading zeros
  const nextNumber = maxNumber + 1
  const paddedNumber = nextNumber.toString().padStart(3, '0')
  
  return `${prefix}${paddedNumber}`
}

/**
 * Validates if a vendor code follows the correct format
 * @param vendorCode Vendor code to validate
 * @returns true if valid format
 */
export function validateVendorCodeFormat(vendorCode: string): boolean {
  const pattern = /^AMP-V-\d{3}$/
  return pattern.test(vendorCode)
}

/**
 * Extracts the number from a vendor code
 * @param vendorCode Vendor code (e.g., "AMP-V-001")
 * @returns Number part (e.g., 1) or 0 if invalid
 */
export function extractVendorCodeNumber(vendorCode: string): number {
  if (!validateVendorCodeFormat(vendorCode)) {
    return 0
  }
  
  const numberPart = vendorCode.replace('AMP-V-', '')
  return parseInt(numberPart, 10)
}

/**
 * Checks if a vendor code already exists
 * @param vendorCode Code to check
 * @param existingVendors Array of existing vendors
 * @returns true if code already exists
 */
export function vendorCodeExists(vendorCode: string, existingVendors: Vendor[]): boolean {
  return existingVendors.some(vendor => vendor.vendorCode === vendorCode)
}

/**
 * Generates a vendor code ensuring uniqueness
 * @param existingVendors Array of existing vendors
 * @param preferredNumber Optional preferred number (will use next available if not available)
 * @returns Unique vendor code
 */
export function generateUniqueVendorCode(existingVendors: Vendor[], preferredNumber?: number): string {
  const prefix = 'AMP-V-'
  
  if (preferredNumber) {
    const paddedNumber = preferredNumber.toString().padStart(3, '0')
    const preferredCode = `${prefix}${paddedNumber}`
    
    if (!vendorCodeExists(preferredCode, existingVendors)) {
      return preferredCode
    }
  }
  
  // Fall back to next sequential number
  return generateNextVendorCode(existingVendors)
}