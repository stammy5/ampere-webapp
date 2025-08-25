'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Vendor } from '@/types'
import { mockVendors } from '@/lib/mock-data'
import { generateNextVendorCode } from '@/lib/vendor-code-generator'

interface VendorContextType {
  vendors: Vendor[]
  getVendor: (id: string) => Vendor | undefined
  addVendor: (vendor: Partial<Vendor>) => Vendor
  updateVendor: (id: string, updates: Partial<Vendor>) => boolean
  deleteVendor: (id: string) => boolean
  refreshVendors: () => void
}

const VendorContext = createContext<VendorContextType | undefined>(undefined)

export const useVendors = () => {
  const context = useContext(VendorContext)
  if (context === undefined) {
    throw new Error('useVendors must be used within a VendorProvider')
  }
  return context
}

interface VendorProviderProps {
  children: React.ReactNode
}

export const VendorProvider: React.FC<VendorProviderProps> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors)

  // Initialize vendors from localStorage if available
  useEffect(() => {
    try {
      const storedVendors = localStorage.getItem('ampere_vendors')
      if (storedVendors) {
        const parsedVendors = JSON.parse(storedVendors)
        // Validate that the data structure is correct
        if (Array.isArray(parsedVendors) && parsedVendors.length > 0) {
          // Migrate existing vendors to include vendorCode if missing
          const migratedVendors = migrateVendorsWithCodes(parsedVendors)
          setVendors(migratedVendors)
        }
      } else {
        // Ensure mock vendors have codes
        const migratedMockVendors = migrateVendorsWithCodes(mockVendors)
        setVendors(migratedMockVendors)
      }
    } catch (error) {
      console.error('Error loading vendors from localStorage:', error)
      // Fall back to mock data if there's an error
      const migratedMockVendors = migrateVendorsWithCodes(mockVendors)
      setVendors(migratedMockVendors)
    }
  }, [])

  // Migration function to ensure all vendors have vendor codes
  const migrateVendorsWithCodes = (vendorsToMigrate: Vendor[]): Vendor[] => {
    const migratedVendors: Vendor[] = []
    let codeCounter = 1
    
    vendorsToMigrate.forEach(vendor => {
      if (!vendor.vendorCode) {
        // Generate a vendor code for vendors that don't have one
        const paddedNumber = codeCounter.toString().padStart(3, '0')
        const newVendorCode = `AMP-V-${paddedNumber}`
        
        migratedVendors.push({
          ...vendor,
          vendorCode: newVendorCode
        })
        codeCounter++
      } else {
        migratedVendors.push(vendor)
        // Update counter based on existing code if valid
        const existingNumber = extractVendorCodeNumber(vendor.vendorCode)
        if (existingNumber >= codeCounter) {
          codeCounter = existingNumber + 1
        }
      }
    })
    
    return migratedVendors
  }

  // Helper function to extract number from vendor code
  const extractVendorCodeNumber = (vendorCode: string): number => {
    const match = vendorCode.match(/AMP-V-(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  // Save vendors to localStorage whenever vendors change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_vendors', JSON.stringify(vendors))
    } catch (error) {
      console.error('Error saving vendors to localStorage:', error)
    }
  }, [vendors])

  const getVendor = (id: string): Vendor | undefined => {
    return vendors.find(vendor => vendor.id === id)
  }

  const addVendor = (vendorData: Partial<Vendor>): Vendor => {
    // Generate a unique ID
    const newId = (Math.max(...vendors.map(v => parseInt(v.id) || 0)) + 1).toString()
    
    // Generate auto-running vendor code
    const vendorCode = generateNextVendorCode(vendors)
    
    const newVendor: Vendor = {
      id: newId,
      vendorCode,
      name: vendorData.name || '',
      category: vendorData.category || 'supplier',
      contactPerson: vendorData.contactPerson || '',
      email: vendorData.email || '',
      phone: vendorData.phone || '',
      address: vendorData.address || {
        street: '',
        postalCode: '',
        district: ''
      },
      registrationNumber: vendorData.registrationNumber || '',
      gstNumber: vendorData.gstNumber,
      rating: vendorData.rating || 0,
      certifications: vendorData.certifications || [],
      specializations: vendorData.specializations || [],
      paymentTerms: vendorData.paymentTerms || 30,
      status: vendorData.status || 'active',
      projects: [],
      createdAt: new Date(),
      ...vendorData
    }

    setVendors(prevVendors => [...prevVendors, newVendor])
    return newVendor
  }

  const updateVendor = (id: string, updates: Partial<Vendor>): boolean => {
    setVendors(prevVendors => {
      const index = prevVendors.findIndex(vendor => vendor.id === id)
      if (index === -1) return prevVendors

      const updatedVendor = {
        ...prevVendors[index],
        ...updates
      }

      const newVendors = [...prevVendors]
      newVendors[index] = updatedVendor
      return newVendors
    })
    return true
  }

  const deleteVendor = (id: string): boolean => {
    setVendors(prevVendors => prevVendors.filter(vendor => vendor.id !== id))
    return true
  }

  const refreshVendors = () => {
    // Refresh from localStorage or reset to mock data
    try {
      const storedVendors = localStorage.getItem('ampere_vendors')
      if (storedVendors) {
        setVendors(JSON.parse(storedVendors))
      } else {
        setVendors(mockVendors)
      }
    } catch (error) {
      console.error('Error refreshing vendors:', error)
      setVendors(mockVendors)
    }
  }

  const value: VendorContextType = {
    vendors,
    getVendor,
    addVendor,
    updateVendor,
    deleteVendor,
    refreshVendors
  }

  return (
    <VendorContext.Provider value={value}>
      {children}
    </VendorContext.Provider>
  )
}