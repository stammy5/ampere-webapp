'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderItem } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useVendors } from '@/contexts/VendorContext'

interface PurchaseOrderContextType {
  purchaseOrders: PurchaseOrder[]
  accessiblePurchaseOrders: PurchaseOrder[] // Filtered based on user permissions
  getPurchaseOrder: (id: string) => PurchaseOrder | undefined
  addPurchaseOrder: (purchaseOrder: Partial<PurchaseOrder>) => PurchaseOrder
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => boolean
  deletePurchaseOrder: (id: string) => boolean
  refreshPurchaseOrders: () => void
  getPurchaseOrdersByProject: (projectId: string) => PurchaseOrder[]
  getPurchaseOrdersByVendor: (vendorId: string) => PurchaseOrder[]
  getPurchaseOrdersByStatus: (status: PurchaseOrderStatus) => PurchaseOrder[]
  getNextPONumber: () => string
  // Item management methods
  addPurchaseOrderItem: (poId: string, item: Partial<PurchaseOrderItem>) => boolean
  updatePurchaseOrderItem: (poId: string, itemId: string, updates: Partial<PurchaseOrderItem>) => boolean
  deletePurchaseOrderItem: (poId: string, itemId: string) => boolean
}

const PurchaseOrderContext = createContext<PurchaseOrderContextType | undefined>(undefined)

export const usePurchaseOrders = () => {
  const context = useContext(PurchaseOrderContext)
  if (context === undefined) {
    throw new Error('usePurchaseOrders must be used within a PurchaseOrderProvider')
  }
  return context
}

interface PurchaseOrderProviderProps {
  children: React.ReactNode
}

// Mock purchase orders data
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'AMP-PO-202401-001',
    projectId: '1',
    vendorId: '1',
    title: 'Electrical Materials for Marina Bay Project',
    description: 'Purchase order for electrical materials and components',
    status: 'approved',
    issueDate: new Date('2024-01-15'),
    requiredDate: new Date('2024-02-15'),
    deliveryDate: new Date('2024-02-10'),
    items: [
      {
        id: '1',
        description: 'Circuit Breakers',
        quantity: 20,
        unit: 'pcs',
        unitPrice: 45.50,
        totalPrice: 910.00,
        category: 'Materials',
        receivedQuantity: 20
      },
      {
        id: '2',
        description: 'Electrical Cables',
        quantity: 100,
        unit: 'meters',
        unitPrice: 3.25,
        totalPrice: 325.00,
        category: 'Materials',
        receivedQuantity: 100
      }
    ],
    subtotal: 1235.00,
    gst: 86.45,
    totalAmount: 1321.45,
    terms: [
      'Payment terms: 30 days from invoice date',
      'Delivery within 30 days of order confirmation'
    ],
    preparedBy: '1',
    approvedBy: '2',
    approvedDate: new Date('2024-01-16'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10'),
    notes: 'Urgent delivery required'
  }
]

export const PurchaseOrderProvider: React.FC<PurchaseOrderProviderProps> = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders)
  const { user } = useAuth()
  const { 
    accessibleProjects, 
    updateVendorBudgetUsage // Add this new method
  } = useProjects()
  const { vendors } = useVendors()

  // Initialize purchase orders from localStorage if available
  useEffect(() => {
    try {
      const storedPurchaseOrders = localStorage.getItem('ampere_purchase_orders')
      if (storedPurchaseOrders) {
        const parsedPurchaseOrders = JSON.parse(storedPurchaseOrders)
        // Validate that the data structure is correct
        if (Array.isArray(parsedPurchaseOrders) && parsedPurchaseOrders.length > 0) {
          setPurchaseOrders(parsedPurchaseOrders)
        }
      }
    } catch (error) {
      console.error('Error loading purchase orders from localStorage:', error)
      // Fall back to mock data if there's an error
      setPurchaseOrders(mockPurchaseOrders)
    }
  }, [])

  // Save purchase orders to localStorage whenever purchase orders change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_purchase_orders', JSON.stringify(purchaseOrders))
    } catch (error) {
      console.error('Error saving purchase orders to localStorage:', error)
    }
  }, [purchaseOrders])

  // Get accessible purchase orders based on user permissions
  const accessiblePurchaseOrders = purchaseOrders.filter(po => {
    // For now, we'll allow access to all purchase orders
    // In a real implementation, this would be filtered based on user permissions
    return true
  })

  const getPurchaseOrder = (id: string): PurchaseOrder | undefined => {
    return purchaseOrders.find(po => po.id === id)
  }

  const getPurchaseOrdersByProject = (projectId: string): PurchaseOrder[] => {
    return accessiblePurchaseOrders.filter(po => po.projectId === projectId)
  }

  const getPurchaseOrdersByVendor = (vendorId: string): PurchaseOrder[] => {
    return accessiblePurchaseOrders.filter(po => po.vendorId === vendorId)
  }

  const getPurchaseOrdersByStatus = (status: PurchaseOrderStatus): PurchaseOrder[] => {
    return accessiblePurchaseOrders.filter(po => po.status === status)
  }

  // Generate next PO number
  const getNextPONumber = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    
    // Count existing POs for this month
    const poCount = purchaseOrders.filter(po => 
      po.poNumber.includes(`${year}${month}`)
    ).length + 1
    
    return `AMP-PO-${year}${month}-${String(poCount).padStart(3, '0')}`
  }

  const addPurchaseOrder = (purchaseOrderData: Partial<PurchaseOrder>): PurchaseOrder => {
    // Generate a unique ID
    const newId = (Math.max(...purchaseOrders.map(po => parseInt(po.id) || 0)) + 1).toString()
    
    // Generate PO number if not provided
    const poNumber = purchaseOrderData.poNumber || getNextPONumber()
    
    const newPurchaseOrder: PurchaseOrder = {
      id: newId,
      poNumber,
      projectId: purchaseOrderData.projectId || '',
      vendorId: purchaseOrderData.vendorId || '',
      clientId: purchaseOrderData.clientId,
      title: purchaseOrderData.title || '',
      description: purchaseOrderData.description || '',
      status: purchaseOrderData.status || 'draft',
      issueDate: purchaseOrderData.issueDate || new Date(),
      requiredDate: purchaseOrderData.requiredDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      deliveryDate: purchaseOrderData.deliveryDate,
      items: purchaseOrderData.items || [],
      subtotal: purchaseOrderData.subtotal || 0,
      gst: purchaseOrderData.gst || 0,
      discount: purchaseOrderData.discount,
      totalAmount: purchaseOrderData.totalAmount || 0,
      terms: purchaseOrderData.terms || [],
      preparedBy: purchaseOrderData.preparedBy || (user?.id || ''),
      approvedBy: purchaseOrderData.approvedBy,
      approvedDate: purchaseOrderData.approvedDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: purchaseOrderData.notes,
      ...purchaseOrderData
    }

    setPurchaseOrders(prevPurchaseOrders => [...prevPurchaseOrders, newPurchaseOrder])
    
    // Deduct budget from vendor if this is a new PO with a total amount
    if (newPurchaseOrder.totalAmount > 0 && newPurchaseOrder.projectId && newPurchaseOrder.vendorId) {
      updateVendorBudgetUsage(
        newPurchaseOrder.projectId, 
        newPurchaseOrder.vendorId, 
        newPurchaseOrder.totalAmount
      )
    }
    
    return newPurchaseOrder
  }

  const updatePurchaseOrder = (id: string, updates: Partial<PurchaseOrder>): boolean => {
    const originalPO = purchaseOrders.find(po => po.id === id)
    
    setPurchaseOrders(prevPurchaseOrders => {
      const index = prevPurchaseOrders.findIndex(po => po.id === id)
      if (index === -1) return prevPurchaseOrders

      const updatedPurchaseOrder = {
        ...prevPurchaseOrders[index],
        ...updates,
        updatedAt: new Date()
      }

      const newPurchaseOrders = [...prevPurchaseOrders]
      newPurchaseOrders[index] = updatedPurchaseOrder
      return newPurchaseOrders
    })
    
    // If the total amount changed, adjust the vendor budget accordingly
    if (originalPO && updates.totalAmount !== undefined && originalPO.totalAmount !== updates.totalAmount) {
      const amountDifference = updates.totalAmount - originalPO.totalAmount
      if (originalPO.projectId && originalPO.vendorId && amountDifference !== 0) {
        updateVendorBudgetUsage(
          originalPO.projectId, 
          originalPO.vendorId, 
          amountDifference
        )
      }
    }
    
    return true
  }

  const deletePurchaseOrder = (id: string): boolean => {
    // Get the PO before deleting to adjust vendor budget
    const poToDelete = purchaseOrders.find(po => po.id === id)
    
    setPurchaseOrders(prevPurchaseOrders => prevPurchaseOrders.filter(po => po.id !== id))
    
    // If the PO existed, add back the budget (negative amount to increase budget)
    if (poToDelete && poToDelete.totalAmount > 0 && poToDelete.projectId && poToDelete.vendorId) {
      updateVendorBudgetUsage(
        poToDelete.projectId, 
        poToDelete.vendorId, 
        -poToDelete.totalAmount
      )
    }
    
    return true
  }

  const refreshPurchaseOrders = () => {
    // Refresh from localStorage or reset to mock data
    try {
      const storedPurchaseOrders = localStorage.getItem('ampere_purchase_orders')
      if (storedPurchaseOrders) {
        setPurchaseOrders(JSON.parse(storedPurchaseOrders))
      } else {
        setPurchaseOrders(mockPurchaseOrders)
      }
    } catch (error) {
      console.error('Error refreshing purchase orders:', error)
      setPurchaseOrders(mockPurchaseOrders)
    }
  }

  // Item management methods
  const addPurchaseOrderItem = (poId: string, itemData: Partial<PurchaseOrderItem>): boolean => {
    const originalPO = purchaseOrders.find(po => po.id === poId)
    
    setPurchaseOrders(prevPurchaseOrders => {
      const poIndex = prevPurchaseOrders.findIndex(po => po.id === poId)
      if (poIndex === -1) return prevPurchaseOrders

      const purchaseOrder = prevPurchaseOrders[poIndex]
      const newItemId = (Math.max(0, ...purchaseOrder.items.map(i => parseInt(i.id) || 0)) + 1).toString()
      
      const newItem: PurchaseOrderItem = {
        id: newItemId,
        description: itemData.description || '',
        quantity: itemData.quantity || 0,
        unit: itemData.unit || 'pcs',
        unitPrice: itemData.unitPrice || 0,
        totalPrice: itemData.totalPrice || (itemData.quantity || 0) * (itemData.unitPrice || 0),
        category: itemData.category || 'Materials',
        notes: itemData.notes,
        receivedQuantity: itemData.receivedQuantity,
        ...itemData
      }

      const updatedPurchaseOrder = {
        ...purchaseOrder,
        items: [...purchaseOrder.items, newItem],
        updatedAt: new Date()
      }

      // Recalculate totals
      const subtotal = updatedPurchaseOrder.items.reduce((sum, item) => sum + item.totalPrice, 0)
      const gst = subtotal * 0.07 // 7% GST for Singapore
      const discount = updatedPurchaseOrder.discount || 0
      const totalAmount = subtotal + gst - discount

      updatedPurchaseOrder.subtotal = subtotal
      updatedPurchaseOrder.gst = gst
      updatedPurchaseOrder.totalAmount = totalAmount

      const newPurchaseOrders = [...prevPurchaseOrders]
      newPurchaseOrders[poIndex] = updatedPurchaseOrder
      return newPurchaseOrders
    })
    
    // If the PO existed, adjust the vendor budget for the added item value
    if (originalPO) {
      const newItemTotal = (itemData.quantity || 0) * (itemData.unitPrice || 0)
      const gstAmount = newItemTotal * 0.07
      const totalWithGst = newItemTotal + gstAmount
      
      if (originalPO.projectId && originalPO.vendorId && totalWithGst > 0) {
        updateVendorBudgetUsage(
          originalPO.projectId, 
          originalPO.vendorId, 
          totalWithGst
        )
      }
    }
    
    return true
  }

  const updatePurchaseOrderItem = (poId: string, itemId: string, updates: Partial<PurchaseOrderItem>): boolean => {
    const originalPO = purchaseOrders.find(po => po.id === poId)
    const originalItem = originalPO?.items.find(item => item.id === itemId)
    
    setPurchaseOrders(prevPurchaseOrders => {
      const poIndex = prevPurchaseOrders.findIndex(po => po.id === poId)
      if (poIndex === -1) return prevPurchaseOrders

      const purchaseOrder = prevPurchaseOrders[poIndex]
      const itemIndex = purchaseOrder.items.findIndex(item => item.id === itemId)
      if (itemIndex === -1) return prevPurchaseOrders

      const updatedItem = {
        ...purchaseOrder.items[itemIndex],
        ...updates
      }

      // Recalculate total price if quantity or unit price changes
      if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
        updatedItem.totalPrice = (updates.quantity !== undefined ? updates.quantity : updatedItem.quantity) * 
                                (updates.unitPrice !== undefined ? updates.unitPrice : updatedItem.unitPrice)
      }

      const updatedItems = [...purchaseOrder.items]
      updatedItems[itemIndex] = updatedItem

      const updatedPurchaseOrder = {
        ...purchaseOrder,
        items: updatedItems,
        updatedAt: new Date()
      }

      // Recalculate totals
      const subtotal = updatedPurchaseOrder.items.reduce((sum, item) => sum + item.totalPrice, 0)
      const gst = subtotal * 0.07 // 7% GST for Singapore
      const discount = updatedPurchaseOrder.discount || 0
      const totalAmount = subtotal + gst - discount

      updatedPurchaseOrder.subtotal = subtotal
      updatedPurchaseOrder.gst = gst
      updatedPurchaseOrder.totalAmount = totalAmount

      const newPurchaseOrders = [...prevPurchaseOrders]
      newPurchaseOrders[poIndex] = updatedPurchaseOrder
      return newPurchaseOrders
    })
    
    // If the item existed and values changed, adjust the vendor budget
    if (originalPO && originalItem) {
      const originalTotal = originalItem.totalPrice
      const newTotal = (updates.quantity !== undefined ? updates.quantity : originalItem.quantity) * 
                      (updates.unitPrice !== undefined ? updates.unitPrice : originalItem.unitPrice)
      const difference = newTotal - originalTotal
      const gstDifference = difference * 0.07
      const totalDifference = difference + gstDifference
      
      if (originalPO.projectId && originalPO.vendorId && totalDifference !== 0) {
        updateVendorBudgetUsage(
          originalPO.projectId, 
          originalPO.vendorId, 
          totalDifference
        )
      }
    }
    
    return true
  }

  const deletePurchaseOrderItem = (poId: string, itemId: string): boolean => {
    const originalPO = purchaseOrders.find(po => po.id === poId)
    const itemToDelete = originalPO?.items.find(item => item.id === itemId)
    
    setPurchaseOrders(prevPurchaseOrders => {
      const poIndex = prevPurchaseOrders.findIndex(po => po.id === poId)
      if (poIndex === -1) return prevPurchaseOrders

      const purchaseOrder = prevPurchaseOrders[poIndex]
      const updatedItems = purchaseOrder.items.filter(item => item.id !== itemId)

      const updatedPurchaseOrder = {
        ...purchaseOrder,
        items: updatedItems,
        updatedAt: new Date()
      }

      // Recalculate totals
      const subtotal = updatedPurchaseOrder.items.reduce((sum, item) => sum + item.totalPrice, 0)
      const gst = subtotal * 0.07 // 7% GST for Singapore
      const discount = updatedPurchaseOrder.discount || 0
      const totalAmount = subtotal + gst - discount

      updatedPurchaseOrder.subtotal = subtotal
      updatedPurchaseOrder.gst = gst
      updatedPurchaseOrder.totalAmount = totalAmount

      const newPurchaseOrders = [...prevPurchaseOrders]
      newPurchaseOrders[poIndex] = updatedPurchaseOrder
      return newPurchaseOrders
    })
    
    // If the item existed, subtract its value from the vendor budget (negative to reduce budget usage)
    if (originalPO && itemToDelete) {
      const itemTotal = itemToDelete.totalPrice
      const gstAmount = itemTotal * 0.07
      const totalWithGst = itemTotal + gstAmount
      
      if (originalPO.projectId && originalPO.vendorId && totalWithGst > 0) {
        updateVendorBudgetUsage(
          originalPO.projectId, 
          originalPO.vendorId, 
          -totalWithGst
        )
      }
    }
    
    return true
  }

  const contextValue: PurchaseOrderContextType = {
    purchaseOrders,
    accessiblePurchaseOrders,
    getPurchaseOrder,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    refreshPurchaseOrders,
    getPurchaseOrdersByProject,
    getPurchaseOrdersByVendor,
    getPurchaseOrdersByStatus,
    getNextPONumber,
    addPurchaseOrderItem,
    updatePurchaseOrderItem,
    deletePurchaseOrderItem
  }

  return (
    <PurchaseOrderContext.Provider value={contextValue}>
      {children}
    </PurchaseOrderContext.Provider>
  )
}