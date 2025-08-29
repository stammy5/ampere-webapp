'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Tender, Document } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useAuditLog, createAuditLog } from '@/contexts/AuditLogContext'

interface TenderContextType {
  tenders: Tender[]
  getTender: (id: string) => Tender | undefined
  addTender: (tender: Partial<Tender>) => Tender
  updateTender: (id: string, updates: Partial<Tender>) => boolean
  deleteTender: (id: string) => boolean
  refreshTenders: () => void
  // Document management functions
  addDocumentsToTender: (tenderId: string, documents: Partial<Document>[]) => boolean
  removeDocumentFromTender: (tenderId: string, documentId: string) => boolean
  updateTenderDocument: (tenderId: string, documentId: string, updates: Partial<Document>) => boolean
  getTenderDocuments: (tenderId: string) => Document[]
}

const TenderContext = createContext<TenderContextType | undefined>(undefined)

export const useTenders = () => {
  const context = useContext(TenderContext)
  if (context === undefined) {
    throw new Error('useTenders must be used within a TenderProvider')
  }
  return context
}

interface TenderProviderProps {
  children: React.ReactNode
}

export const TenderProvider: React.FC<TenderProviderProps> = ({ children }) => {
  const [tenders, setTenders] = useState<Tender[]>([])
  const { user: currentUser } = useAuth()
  const auditLog = useAuditLog()

  // Initialize tenders from localStorage if available
  useEffect(() => {
    try {
      const storedTenders = localStorage.getItem('ampere_tenders')
      if (storedTenders) {
        const parsedTenders = JSON.parse(storedTenders)
        // Validate that the data structure is correct
        if (Array.isArray(parsedTenders) && parsedTenders.length > 0) {
          setTenders(parsedTenders)
        }
      }
    } catch (error) {
      console.error('Error loading tenders from localStorage:', error)
      // Fall back to empty array if there's an error
      setTenders([])
    }
  }, [])

  // Save tenders to localStorage whenever tenders change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_tenders', JSON.stringify(tenders))
    } catch (error) {
      console.error('Error saving tenders to localStorage:', error)
    }
  }, [tenders])

  const getTender = (id: string): Tender | undefined => {
    return tenders.find(tender => tender.id === id)
  }

  const addTender = (tenderData: Partial<Tender>): Tender => {
    // Generate a unique ID
    const newId = (Math.max(...tenders.map(t => parseInt(t.id) || 0)) + 1).toString()
    
    const newTender: Tender = {
      id: newId,
      title: tenderData.title || '',
      clientId: tenderData.clientId || '',
      type: tenderData.type || 'open',
      status: tenderData.status || 'opportunity',
      description: tenderData.description || '',
      location: tenderData.location || {
        street: '',
        postalCode: '',
        district: ''
      },
      estimatedValue: tenderData.estimatedValue || 0,
      submissionDeadline: tenderData.submissionDeadline || new Date(),
      startDate: tenderData.startDate,
      completionDate: tenderData.completionDate,
      requirements: tenderData.requirements || [],
      documents: tenderData.documents || [],
      ourQuotation: tenderData.ourQuotation,
      competitorCount: tenderData.competitorCount || 0,
      winProbability: tenderData.winProbability || 50,
      assignedTo: tenderData.assignedTo || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...tenderData
    }

    setTenders(prevTenders => [...prevTenders, newTender])
    return newTender
  }

  const updateTender = (id: string, updates: Partial<Tender>): boolean => {
    const oldTender = getTender(id)
    
    setTenders(prevTenders => {
      const index = prevTenders.findIndex(tender => tender.id === id)
      if (index === -1) return prevTenders

      const updatedTender = {
        ...prevTenders[index],
        ...updates,
        updatedAt: new Date()
      }

      const newTenders = [...prevTenders]
      newTenders[index] = updatedTender
      return newTenders
    })
    
    // Log tender update
    if (currentUser && oldTender) {
      const updatedTender = { ...oldTender, ...updates }
      auditLog.addAuditLog(createAuditLog(
        'UPDATE',
        'TENDER',
        id,
        currentUser,
        {
          entityName: oldTender.title,
          oldData: oldTender,
          newData: updatedTender,
          details: `Updated tender: ${oldTender.title}`,
          excludeFields: ['updatedAt', 'documents']
        }
      ))
    }
    
    return true
  }

  const deleteTender = (id: string): boolean => {
    const tender = getTender(id)
    if (!tender) return false
    
    setTenders(prevTenders => prevTenders.filter(tender => tender.id !== id))
    
    // Log tender deletion
    if (currentUser) {
      auditLog.addAuditLog(createAuditLog(
        'DELETE',
        'TENDER',
        id,
        currentUser,
        {
          entityName: tender.title,
          details: `Deleted tender: ${tender.title}`
        }
      ))
    }
    
    return true
  }

  // Document management functions
  const generateDocumentId = (): string => {
    return `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const addDocumentsToTender = (tenderId: string, documents: Partial<Document>[]): boolean => {
    const tender = getTender(tenderId)
    if (!tender) return false

    const newDocuments: Document[] = documents.map(doc => ({
      id: generateDocumentId(),
      name: doc.name || '',
      type: doc.type || 'other',
      size: doc.size || 0,
      uploadedBy: doc.uploadedBy || currentUser?.id || '',
      uploadedAt: doc.uploadedAt || new Date(),
      url: doc.url || '#',
      tenderId: tenderId,
      isConfidential: doc.isConfidential || false,
      ...doc
    }))

    const updatedDocuments = [...(tender.documents || []), ...newDocuments]
    updateTender(tenderId, { documents: updatedDocuments })

    // Log document upload
    if (currentUser) {
      newDocuments.forEach(doc => {
        auditLog.addAuditLog(createAuditLog(
          'CREATE',
          'TENDER',
          tenderId,
          currentUser,
          {
            entityName: tender.title,
            details: `Uploaded document "${doc.name}" to tender: ${tender.title}`
          }
        ))
      })
    }

    return true
  }

  const removeDocumentFromTender = (tenderId: string, documentId: string): boolean => {
    const tender = getTender(tenderId)
    if (!tender || !tender.documents) return false

    const documentToRemove = tender.documents.find(doc => doc.id === documentId)
    if (!documentToRemove) return false

    const updatedDocuments = tender.documents.filter(doc => doc.id !== documentId)
    updateTender(tenderId, { documents: updatedDocuments })

    // Log document removal
    if (currentUser) {
      auditLog.addAuditLog(createAuditLog(
        'DELETE',
        'TENDER',
        tenderId,
        currentUser,
        {
          entityName: tender.title,
          details: `Removed document "${documentToRemove.name}" from tender: ${tender.title}`
        }
      ))
    }

    return true
  }

  const updateTenderDocument = (tenderId: string, documentId: string, updates: Partial<Document>): boolean => {
    const tender = getTender(tenderId)
    if (!tender || !tender.documents) return false

    const documentIndex = tender.documents.findIndex(doc => doc.id === documentId)
    if (documentIndex === -1) return false

    const oldDocument = tender.documents[documentIndex]
    const updatedDocuments = [...tender.documents]
    updatedDocuments[documentIndex] = { ...oldDocument, ...updates }
    
    updateTender(tenderId, { documents: updatedDocuments })

    // Log document update
    if (currentUser) {
      auditLog.addAuditLog(createAuditLog(
        'UPDATE',
        'TENDER',
        tenderId,
        currentUser,
        {
          entityName: tender.title,
          details: `Updated document "${oldDocument.name}" in tender: ${tender.title}`
        }
      ))
    }

    return true
  }

  const getTenderDocuments = (tenderId: string): Document[] => {
    const tender = getTender(tenderId)
    return tender?.documents || []
  }

  const refreshTenders = () => {
    // Refresh from localStorage or reset to mock data
    try {
      const storedTenders = localStorage.getItem('ampere_tenders')
      if (storedTenders) {
        setTenders(JSON.parse(storedTenders))
      } else {
        setTenders(mockTenders)
      }
    } catch (error) {
      console.error('Error refreshing tenders:', error)
      setTenders(mockTenders)
    }
  }

  const value: TenderContextType = {
    tenders,
    getTender,
    addTender,
    updateTender,
    deleteTender,
    refreshTenders,
    // Document management functions
    addDocumentsToTender,
    removeDocumentFromTender,
    updateTenderDocument,
    getTenderDocuments
  }

  return (
    <TenderContext.Provider value={value}>
      {children}
    </TenderContext.Provider>
  )
}