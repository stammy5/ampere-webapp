'use client'

import { useState, useEffect } from 'react'
import { FrequentlyUsedItem } from '@/types'
import { cn } from '@/lib/utils'
import { 
  Package, X, Save, AlertTriangle
} from 'lucide-react'

interface FrequentlyUsedItemFormProps {
  item?: FrequentlyUsedItem
  isOpen: boolean
  onClose: () => void
  onSave: (itemData: Omit<FrequentlyUsedItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

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
  'pcs', 'units', 'sqm', 'sqft', 'lot', 'set', 'days', 'hours', 'm', 'kg', 'tons', 'months', 'cubic meter'
]

export default function FrequentlyUsedItemForm({ 
  item, 
  isOpen, 
  onClose, 
  onSave, 
  mode, 
  isLoading = false 
}: FrequentlyUsedItemFormProps) {
  
  const [formData, setFormData] = useState({
    description: item?.description || '',
    unit: item?.unit || 'pcs',
    unitPrice: item?.unitPrice || 0,
    category: item?.category || 'Materials',
    isActive: item?.isActive !== undefined ? item.isActive : true,
    isDefault: item?.isDefault || false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when item prop changes
  useEffect(() => {
    if (item) {
      setFormData({
        description: item.description,
        unit: item.unit,
        unitPrice: item.unitPrice,
        category: item.category,
        isActive: item.isActive,
        isDefault: item.isDefault
      })
    } else {
      setFormData({
        description: '',
        unit: 'pcs',
        unitPrice: 0,
        category: 'Materials',
        isActive: true,
        isDefault: false
      })
    }
    setErrors({})
  }, [item, isOpen])

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (formData.unitPrice <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const itemData = {
      description: formData.description.trim(),
      unit: formData.unit,
      unitPrice: formData.unitPrice,
      category: formData.category,
      isActive: formData.isActive,
      isDefault: formData.isDefault
    }

    await onSave(itemData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-ampere-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-ampere-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Add Frequently Used Item' : 'Edit Frequently Used Item'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' 
                      ? 'Create a new frequently used quotation item' 
                      : 'Update frequently used item information'
                    }
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
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Item Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.description ? "border-red-300" : "border-gray-300")}
                      placeholder="Enter item description"
                      disabled={isLoading}
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => handleInputChange('unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                        disabled={isLoading}
                      >
                        {COMMON_UNITS.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                        disabled={isLoading}
                      >
                        {ITEM_CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (SGD) *</label>
                    <input
                      type="number"
                      value={formData.unitPrice}
                      onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.unitPrice ? "border-red-300" : "border-gray-300")}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                    {errors.unitPrice && <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Status Settings</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="h-4 w-4 text-ampere-600 focus:ring-ampere-500 border-gray-300 rounded"
                        disabled={isLoading}
                      />
                      <span className="text-sm font-medium text-gray-900">Active</span>
                    </label>
                    <div className={cn("px-2 py-1 text-xs font-medium rounded-full", 
                      formData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  {item?.isDefault && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Default Item</p>
                          <p className="mt-1">This is a default system item and cannot be deleted.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{mode === 'add' ? 'Creating...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{mode === 'add' ? 'Create Item' : 'Save Changes'}</span>
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