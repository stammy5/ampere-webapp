'use client'

import { useState, useEffect } from 'react'
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderItem, FrequentlyUsedItem } from '@/types'
import { cn } from '@/lib/utils'
import { useVendors } from '@/contexts/VendorContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePurchaseOrders } from '@/contexts/PurchaseOrderContext'
import { useSettings } from '@/contexts/SettingsContext'
import { 
  FileText, X, Save, Calculator, Calendar, DollarSign, Plus, Trash2, Truck
} from 'lucide-react'

interface PurchaseOrderFormProps {
  purchaseOrder?: PurchaseOrder
  projectId: string
  isOpen: boolean
  onClose: () => void
  onSave: (purchaseOrderData: Partial<PurchaseOrder>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

const PURCHASE_ORDER_STATUSES: { value: PurchaseOrderStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'sent', label: 'Sent' },
  { value: 'partially_received', label: 'Partially Received' },
  { value: 'received', label: 'Received' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'closed', label: 'Closed' }
]

export default function PurchaseOrderForm({ 
  purchaseOrder, 
  projectId,
  isOpen, 
  onClose, 
  onSave, 
  mode, 
  isLoading = false 
}: PurchaseOrderFormProps) {
  const { vendors } = useVendors()
  const { user } = useAuth()
  const { getNextPONumber } = usePurchaseOrders()
  const { getActiveFrequentlyUsedItems } = useSettings()
  
  const [formData, setFormData] = useState({
    poNumber: purchaseOrder?.poNumber || '',
    projectId: purchaseOrder?.projectId || projectId,
    vendorId: purchaseOrder?.vendorId || '',
    title: purchaseOrder?.title || '',
    description: purchaseOrder?.description || '',
    status: purchaseOrder?.status || 'draft' as PurchaseOrderStatus,
    issueDate: purchaseOrder?.issueDate ? new Date(purchaseOrder.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    requiredDate: purchaseOrder?.requiredDate ? new Date(purchaseOrder.requiredDate).toISOString().split('T')[0] : '',
    deliveryDate: purchaseOrder?.deliveryDate ? new Date(purchaseOrder.deliveryDate).toISOString().split('T')[0] : '',
    subtotal: purchaseOrder?.subtotal || 0,
    gst: purchaseOrder?.gst || 0,
    discount: purchaseOrder?.discount || 0,
    totalAmount: purchaseOrder?.totalAmount || 0,
    terms: purchaseOrder?.terms || ['Payment terms: 30 days from invoice date', 'Delivery within 30 days of order confirmation'],
    notes: purchaseOrder?.notes || ''
  })

  const [items, setItems] = useState<PurchaseOrderItem[]>(purchaseOrder?.items || [
    { id: '1', description: '', quantity: 0, unit: 'pcs', unitPrice: 0, totalPrice: 0, category: 'Materials' }
  ])
  const [showSuggestions, setShowSuggestions] = useState<boolean[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize showSuggestions array
  useEffect(() => {
    setShowSuggestions(Array(items.length).fill(false))
  }, [items.length])

  // Generate PO number for new purchase orders
  useEffect(() => {
    if (mode === 'add' && !formData.poNumber) {
      setFormData(prev => ({
        ...prev,
        poNumber: getNextPONumber()
      }))
    }
  }, [mode, formData.poNumber, getNextPONumber])

  // Auto-calculate required date (30 days from issue date)
  useEffect(() => {
    if (formData.issueDate && !formData.requiredDate) {
      const issueDate = new Date(formData.issueDate)
      const requiredDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      setFormData(prev => ({
        ...prev,
        requiredDate: requiredDate.toISOString().split('T')[0]
      }))
    }
  }, [formData.issueDate])

  // Calculate item totals and overall totals
  useEffect(() => {
    // Calculate item totals
    const updatedItems = items.map(item => {
      // Handle string values for numeric fields
      const quantity = typeof item.quantity === 'string' ? 
        (isNaN(parseFloat(item.quantity)) ? 0 : parseFloat(item.quantity)) : 
        item.quantity
      
      const unitPrice = typeof item.unitPrice === 'string' ? 
        (isNaN(parseFloat(item.unitPrice)) ? 0 : parseFloat(item.unitPrice)) : 
        item.unitPrice
      
      return {
        ...item,
        quantity,
        unitPrice,
        totalPrice: Math.round(quantity * unitPrice * 100) / 100
      }
    })
    
    setItems(updatedItems)
    
    // Calculate overall totals
    const subtotal = updatedItems.reduce((sum, item) => {
      const totalPrice = typeof item.totalPrice === 'string' ? 
        (isNaN(parseFloat(item.totalPrice)) ? 0 : parseFloat(item.totalPrice)) : 
        item.totalPrice
      return sum + totalPrice
    }, 0)
    
    const gst = Math.round(subtotal * 0.07 * 100) / 100 // 7% GST for Singapore
    const totalAmount = Math.round((subtotal + gst - formData.discount) * 100) / 100
    
    setFormData(prev => ({
      ...prev,
      subtotal: Math.round(subtotal * 100) / 100,
      gst,
      totalAmount
    }))
  }, [items, formData.discount])

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    const updatedItems = [...items]
    // For numeric fields, preserve empty strings or invalid values during typing
    if (field === 'quantity' || field === 'unitPrice' || field === 'receivedQuantity') {
      // If value is empty or not a valid number, keep it as is for typing
      if (value === '' || (typeof value === 'string' && isNaN(parseFloat(value)))) {
        updatedItems[index] = {
          ...updatedItems[index],
          [field]: value
        }
      } else {
        // Only convert to number when we have a valid numeric value
        const numericValue = typeof value === 'string' ? parseFloat(value) : value
        updatedItems[index] = {
          ...updatedItems[index],
          [field]: numericValue
        }
      }
    } else {
      // For non-numeric fields, use the value as is
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      }
    }
    setItems(updatedItems)
    
    // Show suggestions when description is being edited
    if (field === 'description') {
      setShowSuggestions(prev => {
        const newShowSuggestions = [...prev]
        newShowSuggestions[index] = true
        return newShowSuggestions
      })
    }
  }

  // Function to check if typed text matches a frequently used item
  const getSuggestions = (text: string) => {
    if (!text) return []
    const activeItems = getActiveFrequentlyUsedItems()
    return activeItems.filter(item => 
      item.description.toLowerCase().includes(text.toLowerCase())
    ).slice(0, 5) // Limit to 5 suggestions
  }

  const addItem = () => {
    const newItemId = (Math.max(0, ...items.map(item => parseInt(item.id) || 0)) + 1).toString()
    setItems(prev => [
      ...prev,
      { 
        id: newItemId, 
        description: '', 
        quantity: 0, 
        unit: 'pcs', 
        unitPrice: 0, 
        totalPrice: 0, 
        category: 'Materials' 
      }
    ])
    setShowSuggestions(prev => [...prev, false])
  }

  const addFrequentlyUsedItem = (frequentlyUsedItem: FrequentlyUsedItem) => {
    const newItem: PurchaseOrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: frequentlyUsedItem.description,
      quantity: 1,
      unit: frequentlyUsedItem.unit,
      unitPrice: frequentlyUsedItem.unitPrice,
      totalPrice: frequentlyUsedItem.unitPrice,
      category: frequentlyUsedItem.category
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    const updatedItems = [...items]
    updatedItems.splice(index, 1)
    setItems(updatedItems)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.vendorId) newErrors.vendorId = 'Vendor selection is required'
    if (!formData.title) newErrors.title = 'Title is required'
    if (!formData.issueDate) newErrors.issueDate = 'Issue date is required'
    if (!formData.requiredDate) newErrors.requiredDate = 'Required date is required'

    // Validate dates
    if (formData.issueDate && formData.requiredDate) {
      const issueDate = new Date(formData.issueDate)
      const requiredDate = new Date(formData.requiredDate)
      if (requiredDate <= issueDate) {
        newErrors.requiredDate = 'Required date must be after issue date'
      }
    }

    // Validate delivery date
    if (formData.deliveryDate && formData.issueDate) {
      const issueDate = new Date(formData.issueDate)
      const deliveryDate = new Date(formData.deliveryDate)
      if (deliveryDate < issueDate) {
        newErrors.deliveryDate = 'Delivery date cannot be before issue date'
      }
    }

    // Validate items
    let hasValidItem = false
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      // Check if we have valid numeric values for quantity and unitPrice
      const quantity = typeof item.quantity === 'string' ? 
        (isNaN(parseFloat(item.quantity)) ? 0 : parseFloat(item.quantity)) : 
        item.quantity
      const unitPrice = typeof item.unitPrice === 'string' ? 
        (isNaN(parseFloat(item.unitPrice)) ? 0 : parseFloat(item.unitPrice)) : 
        item.unitPrice
      
      if (item.description && !isNaN(quantity) && quantity > 0 && !isNaN(unitPrice) && unitPrice > 0) {
        hasValidItem = true
        break
      }
    }
    
    if (!hasValidItem) {
      newErrors.items = 'At least one item with description, quantity, and unit price is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Prepare items with proper numeric values
    const processedItems = items.map(item => ({
      ...item,
      quantity: typeof item.quantity === 'string' ? 
        (isNaN(parseFloat(item.quantity)) ? 0 : parseFloat(item.quantity)) : 
        item.quantity,
      unitPrice: typeof item.unitPrice === 'string' ? 
        (isNaN(parseFloat(item.unitPrice)) ? 0 : parseFloat(item.unitPrice)) : 
        item.unitPrice,
      totalPrice: typeof item.totalPrice === 'string' ? 
        (isNaN(parseFloat(item.totalPrice)) ? 0 : parseFloat(item.totalPrice)) : 
        item.totalPrice,
      receivedQuantity: item.receivedQuantity !== undefined ? 
        (typeof item.receivedQuantity === 'string' ? 
          (isNaN(parseFloat(item.receivedQuantity)) ? 0 : parseFloat(item.receivedQuantity)) : 
          item.receivedQuantity) : 
        undefined
    }))

    const purchaseOrderData: Partial<PurchaseOrder> = {
      poNumber: formData.poNumber,
      projectId: formData.projectId,
      vendorId: formData.vendorId,
      title: formData.title,
      description: formData.description,
      status: formData.status,
      issueDate: new Date(formData.issueDate),
      requiredDate: new Date(formData.requiredDate),
      deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate) : undefined,
      items: processedItems,
      subtotal: formData.subtotal,
      gst: formData.gst,
      discount: formData.discount,
      totalAmount: formData.totalAmount,
      terms: formData.terms,
      notes: formData.notes,
      preparedBy: user?.id || ''
    }

    await onSave(purchaseOrderData)
  }

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? 
      (isNaN(parseFloat(amount)) ? 0 : parseFloat(amount)) : 
      amount
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(numericAmount)
  }

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId)
    return vendor?.name || 'Unknown Vendor'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-ampere-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-ampere-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {mode === 'add' ? 'Create Purchase Order' : 'Edit Purchase Order'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {mode === 'add' ? 'Create a new purchase order for this project' : 'Edit the purchase order details'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* PO Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PO Number
                    </label>
                    <input
                      type="text"
                      value={formData.poNumber}
                      onChange={(e) => handleInputChange('poNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500"
                      readOnly={mode === 'edit'}
                    />
                  </div>

                  {/* Vendor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.vendorId}
                      onChange={(e) => handleInputChange('vendorId', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500",
                        errors.vendorId && "border-red-300"
                      )}
                    >
                      <option value="">Select a vendor</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                    {errors.vendorId && (
                      <p className="mt-1 text-sm text-red-600">{errors.vendorId}</p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500",
                        errors.title && "border-red-300"
                      )}
                      placeholder="Purchase order title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500"
                      placeholder="Purchase order description"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as PurchaseOrderStatus)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500"
                    >
                      {PURCHASE_ORDER_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Issue Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => handleInputChange('issueDate', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500",
                        errors.issueDate && "border-red-300"
                      )}
                    />
                    {errors.issueDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.issueDate}</p>
                    )}
                  </div>

                  {/* Required Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.requiredDate}
                      onChange={(e) => handleInputChange('requiredDate', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500",
                        errors.requiredDate && "border-red-300"
                      )}
                    />
                    {errors.requiredDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.requiredDate}</p>
                    )}
                  </div>

                  {/* Delivery Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500",
                        errors.deliveryDate && "border-red-300"
                      )}
                    />
                    {errors.deliveryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliveryDate}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500"
                      placeholder="Additional notes"
                    />
                  </div>

                  {/* Terms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Terms & Conditions
                    </label>
                    <div className="space-y-2">
                      {formData.terms.map((term, index) => (
                        <input
                          key={index}
                          type="text"
                          value={term}
                          onChange={(e) => {
                            const newTerms = [...formData.terms]
                            newTerms[index] = e.target.value
                            handleInputChange('terms', newTerms)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500"
                          placeholder={`Term ${index + 1}`}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => handleInputChange('terms', [...formData.terms, ''])}
                        className="text-sm text-ampere-600 hover:text-ampere-800"
                      >
                        + Add term
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {errors.items && (
                  <p className="mb-4 text-sm text-red-600">{errors.items}</p>
                )}

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500"
                              placeholder="Item description"
                              onBlur={() => {
                                // Hide suggestions after a short delay to allow clicking
                                setTimeout(() => {
                                  setShowSuggestions(prev => {
                                    const newShowSuggestions = [...prev]
                                    newShowSuggestions[index] = false
                                    return newShowSuggestions
                                  })
                                }, 150)
                              }}
                            />
                            {/* Suggestions dropdown */}
                            {showSuggestions[index] && getSuggestions(item.description).length > 0 && (
                              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                                {getSuggestions(item.description).map(suggestion => (
                                  <div
                                    key={suggestion.id}
                                    className="px-4 py-2 hover:bg-ampere-50 cursor-pointer"
                                    onClick={() => {
                                      handleItemChange(index, 'description', suggestion.description)
                                      handleItemChange(index, 'unit', suggestion.unit)
                                      handleItemChange(index, 'unitPrice', suggestion.unitPrice)
                                      handleItemChange(index, 'category', suggestion.category)
                                      // Recalculate total price
                                      const updatedItems = [...items]
                                      updatedItems[index] = {
                                        ...updatedItems[index],
                                        unit: suggestion.unit,
                                        unitPrice: suggestion.unitPrice,
                                        category: suggestion.category,
                                        totalPrice: updatedItems[index].quantity * suggestion.unitPrice
                                      }
                                      setItems(updatedItems)
                                      // Hide suggestions
                                      setShowSuggestions(prev => {
                                        const newShowSuggestions = [...prev]
                                        newShowSuggestions[index] = false
                                        return newShowSuggestions
                                      })
                                    }}
                                  >
                                    <div className="font-medium">{suggestion.description}</div>
                                    <div className="text-sm text-gray-600">
                                      {suggestion.unitPrice.toFixed(2)} SGD per {suggestion.unit} • {suggestion.category}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500"
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500"
                            placeholder="pcs, m, kg, etc."
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Price
                          </label>
                          <input
                            type="text"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500"
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total
                          </label>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-3">
                        <div className="md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500"
                            placeholder="Materials, Services, etc."
                          />
                        </div>
                        
                        <div className="md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Received Quantity
                          </label>
                          <input
                            type="text"
                            value={item.receivedQuantity || ''}
                            onChange={(e) => handleItemChange(index, 'receivedQuantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500"
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ampere-500 focus:border-ampere-500"
                            placeholder="Additional notes for this item"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(formData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (7%):</span>
                    <span className="font-medium">{formatCurrency(formData.gst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                      <span>{formatCurrency(formData.discount)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                    <span>Total Amount:</span>
                    <span className="text-ampere-600">{formatCurrency(formData.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{mode === 'add' ? 'Create Purchase Order' : 'Update Purchase Order'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}