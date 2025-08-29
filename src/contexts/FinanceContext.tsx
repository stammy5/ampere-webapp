'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Invoice, Payment, InvoiceStatus, PaymentMethod, VendorInvoice, VendorInvoiceStatus } from '@/types'

interface FinanceContextType {
  invoices: Invoice[]
  payments: Payment[]
  vendorInvoices: VendorInvoice[]
  getInvoice: (id: string) => Invoice | undefined
  getPayment: (id: string) => Payment | undefined
  getVendorInvoice: (id: string) => VendorInvoice | undefined
  getInvoicePayments: (invoiceId: string) => Payment[]
  getVendorInvoicePayments: (vendorInvoiceId: string) => Payment[]
  addInvoice: (invoice: Partial<Invoice>) => Invoice
  updateInvoice: (id: string, updates: Partial<Invoice>) => boolean
  deleteInvoice: (id: string) => boolean
  addVendorInvoice: (vendorInvoice: Partial<VendorInvoice>) => VendorInvoice
  updateVendorInvoice: (id: string, updates: Partial<VendorInvoice>) => boolean
  deleteVendorInvoice: (id: string) => boolean
  addPayment: (payment: Partial<Payment>) => Payment
  addVendorPayment: (payment: Partial<Payment>) => Payment
  updatePayment: (id: string, updates: Partial<Payment>) => boolean
  deletePayment: (id: string) => boolean
  getInvoicesByClient: (clientId: string) => Invoice[]
  getVendorInvoicesByVendor: (vendorId: string) => VendorInvoice[]
  getInvoicesByProject: (projectId: string) => Invoice[]
  getVendorInvoicesByProject: (projectId: string) => VendorInvoice[]
  getInvoicesByStatus: (status: InvoiceStatus) => Invoice[]
  getVendorInvoicesByStatus: (status: VendorInvoiceStatus) => VendorInvoice[]
  getOverdueInvoices: () => Invoice[]
  getOverdueVendorInvoices: () => VendorInvoice[]
  getTotalOutstanding: () => number
  getTotalVendorOutstanding: () => number
  getTotalPaid: () => number
  getTotalVendorPaid: () => number
  refreshFinanceData: () => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}

interface FinanceProviderProps {
  children: React.ReactNode
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [vendorInvoices, setVendorInvoices] = useState<VendorInvoice[]>([])

  // Initialize finance data from localStorage if available
  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem('ampere_invoices')
      const storedPayments = localStorage.getItem('ampere_payments')
      const storedVendorInvoices = localStorage.getItem('ampere_vendor_invoices')
      
      if (storedInvoices) {
        const parsedInvoices = JSON.parse(storedInvoices)
        if (Array.isArray(parsedInvoices) && parsedInvoices.length > 0) {
          setInvoices(parsedInvoices)
        }
      }
      
      if (storedPayments) {
        const parsedPayments = JSON.parse(storedPayments)
        if (Array.isArray(parsedPayments) && parsedPayments.length > 0) {
          setPayments(parsedPayments)
        }
      }
      
      if (storedVendorInvoices) {
        const parsedVendorInvoices = JSON.parse(storedVendorInvoices)
        if (Array.isArray(parsedVendorInvoices) && parsedVendorInvoices.length > 0) {
          setVendorInvoices(parsedVendorInvoices)
        }
      }
    } catch (error) {
      console.error('Error loading finance data from localStorage:', error)
      setInvoices([])
      setPayments([])
      setVendorInvoices([])
    }
  }, [])

  // Save invoices to localStorage whenever invoices change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_invoices', JSON.stringify(invoices))
    } catch (error) {
      console.error('Error saving invoices to localStorage:', error)
    }
  }, [invoices])

  // Save payments to localStorage whenever payments change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_payments', JSON.stringify(payments))
    } catch (error) {
      console.error('Error saving payments to localStorage:', error)
    }
  }, [payments])

  // Save vendor invoices to localStorage whenever vendor invoices change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_vendor_invoices', JSON.stringify(vendorInvoices))
    } catch (error) {
      console.error('Error saving vendor invoices to localStorage:', error)
    }
  }, [vendorInvoices])

  const getInvoice = (id: string): Invoice | undefined => {
    return invoices.find(invoice => invoice.id === id)
  }

  const getPayment = (id: string): Payment | undefined => {
    return payments.find(payment => payment.id === id)
  }

  const getVendorInvoice = (id: string): VendorInvoice | undefined => {
    return vendorInvoices.find(vendorInvoice => vendorInvoice.id === id)
  }

  const getInvoicePayments = (invoiceId: string): Payment[] => {
    return payments.filter(payment => payment.invoiceId === invoiceId)
  }

  const getVendorInvoicePayments = (vendorInvoiceId: string): Payment[] => {
    return payments.filter(payment => payment.invoiceId === vendorInvoiceId)
  }

  const getInvoicesByClient = (clientId: string): Invoice[] => {
    return invoices.filter(invoice => invoice.clientId === clientId)
  }

  const getVendorInvoicesByVendor = (vendorId: string): VendorInvoice[] => {
    return vendorInvoices.filter(vendorInvoice => vendorInvoice.vendorId === vendorId)
  }

  const getInvoicesByProject = (projectId: string): Invoice[] => {
    return invoices.filter(invoice => invoice.projectId === projectId)
  }

  const getVendorInvoicesByProject = (projectId: string): VendorInvoice[] => {
    return vendorInvoices.filter(vendorInvoice => vendorInvoice.projectId === projectId)
  }

  const getInvoicesByStatus = (status: InvoiceStatus): Invoice[] => {
    return invoices.filter(invoice => invoice.status === status)
  }

  const getVendorInvoicesByStatus = (status: VendorInvoiceStatus): VendorInvoice[] => {
    return vendorInvoices.filter(vendorInvoice => vendorInvoice.status === status)
  }

  const getOverdueInvoices = (): Invoice[] => {
    const now = new Date()
    return invoices.filter(invoice => 
      invoice.status !== 'paid' && 
      invoice.status !== 'cancelled' && 
      new Date(invoice.dueDate) < now
    )
  }

  const getOverdueVendorInvoices = (): VendorInvoice[] => {
    const now = new Date()
    return vendorInvoices.filter(vendorInvoice => 
      vendorInvoice.status !== 'paid' && 
      vendorInvoice.status !== 'cancelled' && 
      new Date(vendorInvoice.dueDate) < now
    )
  }

  const getTotalOutstanding = (): number => {
    return invoices
      .filter(invoice => invoice.status !== 'paid' && invoice.status !== 'cancelled')
      .reduce((total, invoice) => total + invoice.totalAmount, 0)
  }

  const getTotalVendorOutstanding = (): number => {
    return vendorInvoices
      .filter(vendorInvoice => vendorInvoice.status !== 'paid' && vendorInvoice.status !== 'cancelled')
      .reduce((total, vendorInvoice) => total + vendorInvoice.totalAmount, 0)
  }

  const getTotalPaid = (): number => {
    return payments.reduce((total, payment) => total + payment.amount, 0)
  }

  const getTotalVendorPaid = (): number => {
    return payments.reduce((total, payment) => total + payment.amount, 0)
  }

  const addInvoice = (invoiceData: Partial<Invoice>): Invoice => {
    // Generate a unique ID
    const newId = (Math.max(...invoices.map(i => parseInt(i.id) || 0)) + 1).toString()
    
    // Generate invoice number
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const invoiceCount = invoices.filter(inv => 
      inv.invoiceNumber.includes(`${year}${month}`)
    ).length + 1
    const invoiceNumber = `AMP-INV-${year}${month}-${String(invoiceCount).padStart(3, '0')}`
    
    const newInvoice: Invoice = {
      id: newId,
      invoiceNumber,
      clientId: invoiceData.clientId || '',
      projectId: invoiceData.projectId,
      quotationId: invoiceData.quotationId,
      amount: invoiceData.amount || 0,
      gstAmount: invoiceData.gstAmount || (invoiceData.amount || 0) * 0.07, // 7% GST for Singapore
      totalAmount: invoiceData.totalAmount || (invoiceData.amount || 0) * 1.07,
      status: invoiceData.status || 'draft',
      issueDate: invoiceData.issueDate || new Date(),
      dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paidDate: invoiceData.paidDate,
      paymentMethod: invoiceData.paymentMethod,
      createdAt: new Date(),
      ...invoiceData
    }

    setInvoices(prevInvoices => [...prevInvoices, newInvoice])
    return newInvoice
  }

  const updateInvoice = (id: string, updates: Partial<Invoice>): boolean => {
    setInvoices(prevInvoices => {
      const index = prevInvoices.findIndex(invoice => invoice.id === id)
      if (index === -1) return prevInvoices

      const updatedInvoice = {
        ...prevInvoices[index],
        ...updates
      }

      // Auto-calculate GST and total if amount changes
      if (updates.amount && !updates.gstAmount) {
        updatedInvoice.gstAmount = updates.amount * 0.07
        updatedInvoice.totalAmount = updates.amount * 1.07
      }

      const newInvoices = [...prevInvoices]
      newInvoices[index] = updatedInvoice
      return newInvoices
    })
    return true
  }

  const deleteInvoice = (id: string): boolean => {
    // Also delete associated payments
    setPayments(prevPayments => prevPayments.filter(payment => payment.invoiceId !== id))
    setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== id))
    return true
  }

  const addVendorInvoice = (vendorInvoiceData: Partial<VendorInvoice>): VendorInvoice => {
    // Generate a unique ID
    const newId = (Math.max(...vendorInvoices.map(i => parseInt(i.id) || 0)) + 1).toString()
    
    // Generate invoice number
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const invoiceCount = vendorInvoices.filter(inv => 
      inv.invoiceNumber.includes(`${year}${month}`)
    ).length + 1
    const invoiceNumber = `AMP-VI-${year}${month}-${String(invoiceCount).padStart(3, '0')}`
    
    const newVendorInvoice: VendorInvoice = {
      id: newId,
      invoiceNumber,
      vendorId: vendorInvoiceData.vendorId || '',
      projectId: vendorInvoiceData.projectId,
      purchaseOrderId: vendorInvoiceData.purchaseOrderId,
      amount: vendorInvoiceData.amount || 0,
      gstAmount: vendorInvoiceData.gstAmount || (vendorInvoiceData.amount || 0) * 0.07, // 7% GST for Singapore
      totalAmount: vendorInvoiceData.totalAmount || (vendorInvoiceData.amount || 0) * 1.07,
      status: vendorInvoiceData.status || 'received',
      issueDate: vendorInvoiceData.issueDate || new Date(),
      dueDate: vendorInvoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paidDate: vendorInvoiceData.paidDate,
      paymentMethod: vendorInvoiceData.paymentMethod,
      createdAt: new Date(),
      fileName: vendorInvoiceData.fileName,
      fileUrl: vendorInvoiceData.fileUrl,
      processedData: vendorInvoiceData.processedData,
      ...vendorInvoiceData
    }

    setVendorInvoices(prevVendorInvoices => [...prevVendorInvoices, newVendorInvoice])
    return newVendorInvoice
  }

  const updateVendorInvoice = (id: string, updates: Partial<VendorInvoice>): boolean => {
    setVendorInvoices(prevVendorInvoices => {
      const index = prevVendorInvoices.findIndex(vendorInvoice => vendorInvoice.id === id)
      if (index === -1) return prevVendorInvoices

      const updatedVendorInvoice = {
        ...prevVendorInvoices[index],
        ...updates
      }

      // Auto-calculate GST and total if amount changes
      if (updates.amount && !updates.gstAmount) {
        updatedVendorInvoice.gstAmount = updates.amount * 0.07
        updatedVendorInvoice.totalAmount = updates.amount * 1.07
      }

      const newVendorInvoices = [...prevVendorInvoices]
      newVendorInvoices[index] = updatedVendorInvoice
      return newVendorInvoices
    })
    return true
  }

  const deleteVendorInvoice = (id: string): boolean => {
    // Also delete associated payments
    setPayments(prevPayments => prevPayments.filter(payment => payment.invoiceId !== id))
    setVendorInvoices(prevVendorInvoices => prevVendorInvoices.filter(vendorInvoice => vendorInvoice.id !== id))
    return true
  }

  const addPayment = (paymentData: Partial<Payment>): Payment => {
    // Generate a unique ID
    const newId = (Math.max(...payments.map(p => parseInt(p.id) || 0)) + 1).toString()
    
    const newPayment: Payment = {
      id: newId,
      invoiceId: paymentData.invoiceId || '',
      amount: paymentData.amount || 0,
      method: paymentData.method || 'bank_transfer',
      reference: paymentData.reference || '',
      receivedDate: paymentData.receivedDate || new Date(),
      notes: paymentData.notes,
      ...paymentData
    }

    setPayments(prevPayments => [...prevPayments, newPayment])

    // Update invoice status if fully paid
    const invoice = getInvoice(newPayment.invoiceId)
    if (invoice) {
      const allPayments = [...payments, newPayment].filter(p => p.invoiceId === invoice.id)
      const totalPayments = allPayments.reduce((sum, p) => sum + p.amount, 0)
      
      if (totalPayments >= invoice.totalAmount && invoice.status !== 'paid') {
        updateInvoice(invoice.id, { 
          status: 'paid', 
          paidDate: newPayment.receivedDate,
          paymentMethod: newPayment.method 
        })
      }
    }

    return newPayment
  }

  const addVendorPayment = (paymentData: Partial<Payment>): Payment => {
    // Generate a unique ID
    const newId = (Math.max(...payments.map(p => parseInt(p.id) || 0)) + 1).toString()
    
    const newPayment: Payment = {
      id: newId,
      invoiceId: paymentData.invoiceId || '',
      amount: paymentData.amount || 0,
      method: paymentData.method || 'bank_transfer',
      reference: paymentData.reference || '',
      receivedDate: paymentData.receivedDate || new Date(),
      notes: paymentData.notes,
      ...paymentData
    }

    setPayments(prevPayments => [...prevPayments, newPayment])

    // Update vendor invoice status if fully paid
    const vendorInvoice = getVendorInvoice(newPayment.invoiceId)
    if (vendorInvoice) {
      const allPayments = [...payments, newPayment].filter(p => p.invoiceId === vendorInvoice.id)
      const totalPayments = allPayments.reduce((sum, p) => sum + p.amount, 0)
      
      if (totalPayments >= vendorInvoice.totalAmount && vendorInvoice.status !== 'paid') {
        updateVendorInvoice(vendorInvoice.id, { 
          status: 'paid', 
          paidDate: newPayment.receivedDate,
          paymentMethod: newPayment.method 
        })
      }
    }

    return newPayment
  }

  const updatePayment = (id: string, updates: Partial<Payment>): boolean => {
    setPayments(prevPayments => {
      const index = prevPayments.findIndex(payment => payment.id === id)
      if (index === -1) return prevPayments

      const updatedPayment = {
        ...prevPayments[index],
        ...updates
      }

      const newPayments = [...prevPayments]
      newPayments[index] = updatedPayment
      return newPayments
    })
    return true
  }

  const deletePayment = (id: string): boolean => {
    const payment = getPayment(id)
    if (payment) {
      // Update invoice status if needed
      const invoice = getInvoice(payment.invoiceId)
      if (invoice && invoice.status === 'paid') {
        const remainingPayments = payments.filter(p => p.invoiceId === payment.invoiceId && p.id !== id)
        const totalRemainingPayments = remainingPayments.reduce((sum, p) => sum + p.amount, 0)
        
        if (totalRemainingPayments < invoice.totalAmount) {
          updateInvoice(invoice.id, { status: 'sent', paidDate: undefined, paymentMethod: undefined })
        }
      }
      
      // Update vendor invoice status if needed
      const vendorInvoice = getVendorInvoice(payment.invoiceId)
      if (vendorInvoice && vendorInvoice.status === 'paid') {
        const remainingPayments = payments.filter(p => p.invoiceId === payment.invoiceId && p.id !== id)
        const totalRemainingPayments = remainingPayments.reduce((sum, p) => sum + p.amount, 0)
        
        if (totalRemainingPayments < vendorInvoice.totalAmount) {
          updateVendorInvoice(vendorInvoice.id, { status: 'approved', paidDate: undefined, paymentMethod: undefined })
        }
      }
    }
    
    setPayments(prevPayments => prevPayments.filter(payment => payment.id !== id))
    return true
  }

  const refreshFinanceData = () => {
    try {
      const storedInvoices = localStorage.getItem('ampere_invoices')
      const storedPayments = localStorage.getItem('ampere_payments')
      const storedVendorInvoices = localStorage.getItem('ampere_vendor_invoices')
      
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices))
      } else {
        setInvoices(mockInvoices)
      }
      
      if (storedPayments) {
        setPayments(JSON.parse(storedPayments))
      } else {
        setPayments(mockPayments)
      }
      
      if (storedVendorInvoices) {
        setVendorInvoices(JSON.parse(storedVendorInvoices))
      }
    } catch (error) {
      console.error('Error refreshing finance data:', error)
      setInvoices(mockInvoices)
      setPayments(mockPayments)
      setVendorInvoices([])
    }
  }

  const value: FinanceContextType = {
    invoices,
    payments,
    vendorInvoices,
    getInvoice,
    getPayment,
    getVendorInvoice,
    getInvoicePayments,
    getVendorInvoicePayments,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addVendorInvoice,
    updateVendorInvoice,
    deleteVendorInvoice,
    addPayment,
    addVendorPayment,
    updatePayment,
    deletePayment,
    getInvoicesByClient,
    getVendorInvoicesByVendor,
    getInvoicesByProject,
    getVendorInvoicesByProject,
    getInvoicesByStatus,
    getVendorInvoicesByStatus,
    getOverdueInvoices,
    getOverdueVendorInvoices,
    getTotalOutstanding,
    getTotalVendorOutstanding,
    getTotalPaid,
    getTotalVendorPaid,
    refreshFinanceData
  }

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  )
}