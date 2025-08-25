// Client Code Generator for Ampere Engineering
// Generates auto-running client codes in format: AMP-C-XXX

import { Client } from '@/types'

/**
 * Generates the next sequential client code
 * Format: AMP-C-001, AMP-C-002, etc.
 * @param existingClients Array of existing clients
 * @returns Next available client code
 */
export function generateNextClientCode(existingClients: Client[]): string {
  const prefix = 'AMP-C-'
  
  // Extract existing code numbers
  const existingNumbers = existingClients
    .map(client => client.clientCode)
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
 * Validates if a client code follows the correct format
 * @param clientCode Client code to validate
 * @returns true if valid format
 */
export function validateClientCodeFormat(clientCode: string): boolean {
  const pattern = /^AMP-C-\d{3}$/
  return pattern.test(clientCode)
}

/**
 * Extracts the number from a client code
 * @param clientCode Client code (e.g., "AMP-C-001")
 * @returns Number part (e.g., 1) or 0 if invalid
 */
export function extractClientCodeNumber(clientCode: string): number {
  if (!validateClientCodeFormat(clientCode)) {
    return 0
  }
  
  const numberPart = clientCode.replace('AMP-C-', '')
  return parseInt(numberPart, 10)
}

/**
 * Checks if a client code already exists
 * @param clientCode Code to check
 * @param existingClients Array of existing clients
 * @returns true if code already exists
 */
export function clientCodeExists(clientCode: string, existingClients: Client[]): boolean {
  return existingClients.some(client => client.clientCode === clientCode)
}

/**
 * Generates a client code ensuring uniqueness
 * @param existingClients Array of existing clients
 * @param preferredNumber Optional preferred number (will use next available if not available)
 * @returns Unique client code
 */
export function generateUniqueClientCode(existingClients: Client[], preferredNumber?: number): string {
  const prefix = 'AMP-C-'
  
  if (preferredNumber) {
    const paddedNumber = preferredNumber.toString().padStart(3, '0')
    const preferredCode = `${prefix}${paddedNumber}`
    
    if (!clientCodeExists(preferredCode, existingClients)) {
      return preferredCode
    }
  }
  
  // Fall back to next sequential number
  return generateNextClientCode(existingClients)
}