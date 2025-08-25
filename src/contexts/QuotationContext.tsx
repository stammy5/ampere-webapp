'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Quotation } from '@/types'
import { mockQuotations } from '@/lib/mock-data'

interface QuotationContextType {
  quotations: Quotation[]
  getQuotation: (id: string) => Quotation | undefined
  addQuotation: (quotation: Partial<Quotation>) => Quotation
  updateQuotation: (id: string, updates: Partial<Quotation>) => boolean
  deleteQuotation: (id: string) => boolean
  refreshQuotations: () => void
  generateQuotationNumber: () => string
}

const QuotationContext = createContext<QuotationContextType | undefined>(undefined)

export const useQuotations = () => {
  const context = useContext(QuotationContext)
  if (context === undefined) {
    throw new Error('useQuotations must be used within a QuotationProvider')
  }
  return context
}

interface QuotationProviderProps {
  children: React.ReactNode
}

export const QuotationProvider: React.FC<QuotationProviderProps> = ({ children }) => {
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations)

  // Initialize quotations from localStorage if available
  useEffect(() => {
    try {
      const storedQuotations = localStorage.getItem('ampere_quotations')
      if (storedQuotations) {
        const parsedQuotations = JSON.parse(storedQuotations)
        // Validate that the data structure is correct
        if (Array.isArray(parsedQuotations) && parsedQuotations.length > 0) {
          setQuotations(parsedQuotations)
        }
      }
    } catch (error) {
      console.error('Error loading quotations from localStorage:', error)
      // Fall back to mock data if there's an error
      setQuotations(mockQuotations)
    }
  }, [])

  // Save quotations to localStorage whenever quotations change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_quotations', JSON.stringify(quotations))
    } catch (error) {
      console.error('Error saving quotations to localStorage:', error)
    }
  }, [quotations])

  const getQuotation = (id: string): Quotation | undefined => {
    return quotations.find(quotation => quotation.id === id)
  }

  const generateQuotationNumber = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    // Find the highest existing quotation number for this month
    const monthPrefix = `AMP-${year}${month}-`
    const existingNumbers = quotations
      .filter(q => q.quotationNumber.startsWith(monthPrefix))
      .map(q => {
        const numberPart = q.quotationNumber.split('-')[2]
        return parseInt(numberPart) || 0
      })
    
    const nextNumber = Math.max(0, ...existingNumbers) + 1
    return `${monthPrefix}${String(nextNumber).padStart(3, '0')}`
  }

  const addQuotation = (quotationData: Partial<Quotation>): Quotation => {
    // Generate a unique ID
    const newId = (Math.max(...quotations.map(q => parseInt(q.id) || 0)) + 1).toString()
    
    // Generate quotation number if not provided
    const quotationNumber = quotationData.quotationNumber || generateQuotationNumber()
    
    // Calculate totals based on items
    const items = quotationData.items || []
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const gst = subtotal * 0.07 // 7% GST in Singapore
    const discount = quotationData.discount || 0
    const totalAmount = subtotal + gst - discount
    
    const newQuotation: Quotation = {
      id: newId,
      clientId: quotationData.clientId || '',
      projectId: quotationData.projectId,
      tenderId: quotationData.tenderId,
      quotationNumber,
      title: quotationData.title || '',
      description: quotationData.description || '',
      status: quotationData.status || 'draft',
      validUntil: quotationData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items: items,
      subtotal,
      gst,
      discount,
      totalAmount,
      terms: quotationData.terms || [
        'Prices valid for 30 days',
        'Payment terms: 30 days from invoice date',
        'All materials comply with Singapore standards'
      ],
      preparedBy: quotationData.preparedBy || '',
      approvedBy: quotationData.approvedBy,
      sentDate: quotationData.sentDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: quotationData.notes,
      ...quotationData
    }

    setQuotations(prevQuotations => [...prevQuotations, newQuotation])
    return newQuotation
  }

  const updateQuotation = (id: string, updates: Partial<Quotation>): boolean => {
    setQuotations(prevQuotations => {
      const index = prevQuotations.findIndex(quotation => quotation.id === id)
      if (index === -1) return prevQuotations

      // If items are being updated, recalculate totals
      let calculatedUpdates = { ...updates }
      if (updates.items) {
        const subtotal = updates.items.reduce((sum, item) => sum + item.totalPrice, 0)
        const gst = subtotal * 0.07
        const discount = updates.discount || prevQuotations[index].discount || 0
        const totalAmount = subtotal + gst - discount
        
        calculatedUpdates = {
          ...updates,
          subtotal,
          gst,
          totalAmount
        }
      }

      const updatedQuotation = {
        ...prevQuotations[index],
        ...calculatedUpdates,
        updatedAt: new Date()
      }

      const newQuotations = [...prevQuotations]
      newQuotations[index] = updatedQuotation
      return newQuotations
    })
    return true
  }

  const deleteQuotation = (id: string): boolean => {
    setQuotations(prevQuotations => prevQuotations.filter(quotation => quotation.id !== id))
    return true
  }

  const refreshQuotations = () => {
    // Refresh from localStorage or reset to mock data
    try {
      const storedQuotations = localStorage.getItem('ampere_quotations')
      if (storedQuotations) {
        setQuotations(JSON.parse(storedQuotations))
      } else {
        setQuotations(mockQuotations)
      }
    } catch (error) {
      console.error('Error refreshing quotations:', error)
      setQuotations(mockQuotations)
    }
  }

  const value: QuotationContextType = {
    quotations,
    getQuotation,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    refreshQuotations,
    generateQuotationNumber
  }

  return (
    <QuotationContext.Provider value={value}>
      {children}
    </QuotationContext.Provider>
  )
}