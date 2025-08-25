'use client'

import { useState, useEffect } from 'react'
import { Quotation, QuotationStatus, QuotationItem, FrequentlyUsedItem } from '@/types'
import { cn } from '@/lib/utils'
import { useClients } from '@/contexts/ClientContext'
import { useTenders } from '@/contexts/TenderContext'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { printQuotation } from '@/lib/pdf-generator'
import { 
  FileText, X, Save, Plus, Trash2, Calculator, DollarSign, Calendar, Users, Printer
} from 'lucide-react'

interface QuotationFormProps {
  quotation?: Quotation
  isOpen: boolean
  onClose: () => void
  onSave: (quotationData: Partial<Quotation>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

const QUOTATION_STATUSES: { value: QuotationStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
  { value: 'converted', label: 'Converted' }
]

const ITEM_CATEGORIES = [
  'Labour',
  'Materials',
  'Equipment',
  'Transportation',
  'Permits & Fees',
  'Overhead',
  'Other'
]

const COMMON_UNITS = [
  'pcs', 'units', 'sqm', 'sqft', 'lot', 'set', 'days', 'hours', 'm', 'kg', 'tons'
]

const DEFAULT_TERMS = [
  'Prices valid for 30 days',
  'Payment terms: 30 days from invoice date',
  'Work completion as per agreed timeline',
  'All materials comply with Singapore standards',
  'Subject to final measurements and variations'
]

export default function QuotationForm({ quotation, isOpen, onClose, onSave, mode, isLoading = false }: QuotationFormProps) {
  const { clients } = useClients()
  const { tenders } = useTenders()
  const { user } = useAuth()
  const { getActiveFrequentlyUsedItems } = useSettings()
  
  const [formData, setFormData] = useState({
    title: quotation?.title || '',
    clientId: quotation?.clientId || '',
    tenderId: quotation?.tenderId || '',
    projectId: quotation?.projectId || '',
    description: quotation?.description || '',
    status: quotation?.status || 'draft' as QuotationStatus,
    validUntil: quotation?.validUntil ? new Date(quotation.validUntil).toISOString().split('T')[0] : '',
    discount: quotation?.discount || 0,
    notes: quotation?.notes || '',
    terms: quotation?.terms ? quotation.terms.join('\n') : DEFAULT_TERMS.join('\n')
  })

  const [items, setItems] = useState<QuotationItem[]>(quotation?.items || [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [totals, setTotals] = useState({
    subtotal: 0,
    gst: 0,
    totalAmount: 0
  })
  const [showSuggestions, setShowSuggestions] = useState<boolean[]>([])

  // Calculate totals when items or discount change
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const gst = subtotal * 0.07 // 7% GST in Singapore
    const discount = formData.discount || 0
    const totalAmount = subtotal + gst - discount

    setTotals({ subtotal, gst, totalAmount })
  }, [items, formData.discount])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      unit: 'pcs',
      unitPrice: 0,
      totalPrice: 0,
      category: 'Materials',
      notes: ''
    }
    setItems(prev => [...prev, newItem])
    setShowSuggestions(prev => [...prev, false])
  }

  const addFrequentlyUsedItem = (frequentlyUsedItem: FrequentlyUsedItem) => {
    const newItem: QuotationItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: frequentlyUsedItem.description,
      quantity: 1,
      unit: frequentlyUsedItem.unit,
      unitPrice: frequentlyUsedItem.unitPrice,
      totalPrice: frequentlyUsedItem.unitPrice,
      category: frequentlyUsedItem.category,
      notes: ''
    }
    setItems(prev => [...prev, newItem])
  }

  // Function to check if typed text matches a frequently used item
  const getSuggestions = (text: string) => {
    if (!text) return []
    const activeItems = getActiveFrequentlyUsedItems()
    return activeItems.filter(item => 
      item.description.toLowerCase().includes(text.toLowerCase())
    ).slice(0, 5) // Limit to 5 suggestions
  }

  const updateItem = (index: number, field: keyof QuotationItem, value: string | number) => {
    setItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      
      // Recalculate total price for quantity or unit price changes
      if (field === 'quantity' || field === 'unitPrice') {
        updated[index].totalPrice = updated[index].quantity * updated[index].unitPrice
      }
      
      return updated
    })
    
    // Show suggestions when description is being edited
    if (field === 'description') {
      setShowSuggestions(prev => {
        const newShowSuggestions = [...prev]
        newShowSuggestions[index] = true
        return newShowSuggestions
      })
    }
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Quotation title is required'
    if (!formData.clientId) newErrors.clientId = 'Client selection is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.validUntil) newErrors.validUntil = 'Valid until date is required'
    if (items.length === 0) newErrors.items = 'At least one item is required'

    // Validate items
    items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = 'Item description is required'
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0'
      }
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] = 'Unit price must be greater than 0'
      }
    })

    // Validate valid until date is in the future
    if (formData.validUntil) {
      const validDate = new Date(formData.validUntil)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (validDate < today) {
        newErrors.validUntil = 'Valid until date must be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const quotationData: Partial<Quotation> = {
      title: formData.title.trim(),
      clientId: formData.clientId,
      tenderId: formData.tenderId || undefined,
      projectId: formData.projectId || undefined,
      description: formData.description.trim(),
      status: formData.status,
      validUntil: new Date(formData.validUntil),
      items: items,
      discount: formData.discount,
      terms: formData.terms.split('\n').filter(term => term.trim()).map(term => term.trim()),
      notes: formData.notes.trim() || undefined,
      preparedBy: user?.id || '',
      subtotal: totals.subtotal,
      gst: totals.gst,
      totalAmount: totals.totalAmount
    }

    await onSave(quotationData)
  }

  const handlePrintPreview = () => {
    // Create a temporary quotation object for preview
    const tempQuotation = {
      id: quotation?.id || 'temp',
      quotationNumber: quotation?.quotationNumber || 'QUO-TEMP',
      title: formData.title,
      clientId: formData.clientId,
      description: formData.description,
      status: formData.status,
      validUntil: new Date(formData.validUntil),
      items: items,
      subtotal: totals.subtotal,
      gst: totals.gst,
      discount: formData.discount,
      totalAmount: totals.totalAmount,
      terms: formData.terms.split('\n').filter(term => term.trim()),
      notes: formData.notes,
      preparedBy: user?.id || '',
      createdAt: quotation?.createdAt || new Date(),
      updatedAt: new Date(),
      ...(quotation?.projectId && { projectId: quotation.projectId }),
      ...(quotation?.tenderId && { tenderId: quotation.tenderId }),
      ...(quotation?.sentDate && { sentDate: quotation.sentDate })
    }
    
    const client = clients.find(c => c.id === formData.clientId)
    printQuotation(tempQuotation, client)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount)
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Create New Quotation' : 'Edit Quotation'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Prepare a new quotation for client' : 'Update quotation details and items'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Quotation Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.title ? "border-red-300" : "border-gray-300")}
                      placeholder="Enter quotation title"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                    <select
                      value={formData.clientId}
                      onChange={(e) => handleInputChange('clientId', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.clientId ? "border-red-300" : "border-gray-300")}
                    >
                      <option value="">Select Client</option>
                      {clients.filter(client => client.status === 'active').map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                    {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Related Tender (Optional)</label>
                    <select
                      value={formData.tenderId}
                      onChange={(e) => handleInputChange('tenderId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    >
                      <option value="">No related tender</option>
                      {tenders.filter(tender => 
                        !formData.clientId || tender.clientId === formData.clientId
                      ).map(tender => (
                        <option key={tender.id} value={tender.id}>{tender.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    >
                      {QUOTATION_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until *</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => handleInputChange('validUntil', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.validUntil ? "border-red-300" : "border-gray-300")}
                    />
                    {errors.validUntil && <p className="mt-1 text-sm text-red-600">{errors.validUntil}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.description ? "border-red-300" : "border-gray-300")}
                    placeholder="Describe the quotation scope and requirements..."
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>
              </div>

              {/* Quotation Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900">Quotation Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {errors.items && <p className="mb-4 text-sm text-red-600">{errors.items}</p>}

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", 
                                errors[`item_${index}_description`] ? "border-red-300" : "border-gray-300")}
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
                                      updateItem(index, 'description', suggestion.description)
                                      updateItem(index, 'unit', suggestion.unit)
                                      updateItem(index, 'unitPrice', suggestion.unitPrice)
                                      updateItem(index, 'category', suggestion.category)
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
                          {errors[`item_${index}_description`] && <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_description`]}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",
                              errors[`item_${index}_quantity`] ? "border-red-300" : "border-gray-300")}
                            min="0"
                            step="0.01"
                          />
                          {errors[`item_${index}_quantity`] && <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_quantity`]}</p>}
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                          <select
                            value={item.unit}
                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                          >
                            {COMMON_UNITS.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (SGD) *</label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",
                              errors[`item_${index}_unitPrice`] ? "border-red-300" : "border-gray-300")}
                            min="0"
                            step="0.01"
                          />
                          {errors[`item_${index}_unitPrice`] && <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_unitPrice`]}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium">
                            {formatCurrency(item.totalPrice)}
                          </div>
                        </div>

                        <div className="md:col-span-1 flex items-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            title="Remove Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            value={item.category}
                            onChange={(e) => updateItem(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                          >
                            {ITEM_CATEGORIES.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => updateItem(index, 'notes', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                            placeholder="Additional notes for this item"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Calculator className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No items added yet. Click "Add Item" to start.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals */}
              {items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Quotation Summary</h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount (SGD)</label>
                        <input
                          type="number"
                          value={formData.discount}
                          onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Subtotal:</span>
                          <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">GST (7%):</span>
                          <span className="font-medium">{formatCurrency(totals.gst)}</span>
                        </div>
                        {formData.discount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Discount:</span>
                            <span className="font-medium text-red-600">-{formatCurrency(formData.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                          <span>Total Amount:</span>
                          <span className="text-ampere-600">{formatCurrency(totals.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => handleInputChange('terms', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    placeholder="Enter terms and conditions (one per line)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    placeholder="Any additional notes or special instructions..."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              {mode === 'edit' && (
                <button 
                  type="button" 
                  onClick={handlePrintPreview}
                  className="btn-secondary flex items-center space-x-2"
                  disabled={isLoading}
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Preview</span>
                </button>
              )}
              <button type="submit" disabled={isLoading} className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{mode === 'add' ? 'Creating...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{mode === 'add' ? 'Create Quotation' : 'Save Changes'}</span>
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