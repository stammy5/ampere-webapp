'use client'

import { useState, useEffect } from 'react'
import { VendorSpecializationConfig } from '@/types'
import { cn } from '@/lib/utils'
import { 
  Wrench, X, Save, AlertTriangle
} from 'lucide-react'

interface VendorSpecializationFormProps {
  vendorSpecialization?: VendorSpecializationConfig
  isOpen: boolean
  onClose: () => void
  onSave: (specializationData: Omit<VendorSpecializationConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

export default function VendorSpecializationForm({ 
  vendorSpecialization, 
  isOpen, 
  onClose, 
  onSave, 
  mode, 
  isLoading = false 
}: VendorSpecializationFormProps) {
  
  const [formData, setFormData] = useState({
    value: vendorSpecialization?.value || '',
    label: vendorSpecialization?.label || '',
    description: vendorSpecialization?.description || '',
    isActive: vendorSpecialization?.isActive !== undefined ? vendorSpecialization.isActive : true,
    isDefault: vendorSpecialization?.isDefault || false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when vendorSpecialization prop changes
  useEffect(() => {
    if (vendorSpecialization) {
      setFormData({
        value: vendorSpecialization.value,
        label: vendorSpecialization.label,
        description: vendorSpecialization.description,
        isActive: vendorSpecialization.isActive,
        isDefault: vendorSpecialization.isDefault
      })
    } else {
      setFormData({
        value: '',
        label: '',
        description: '',
        isActive: true,
        isDefault: false
      })
    }
    setErrors({})
  }, [vendorSpecialization, isOpen])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Auto-generate value from label
    if (field === 'label' && typeof value === 'string') {
      const autoValue = value.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim()
      
      setFormData(prev => ({ ...prev, value: autoValue }))
      
      if (errors.value) {
        setErrors(prev => ({ ...prev, value: '' }))
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.value.trim()) {
      newErrors.value = 'Value is required'
    } else if (!/^[a-z0-9_]+$/.test(formData.value)) {
      newErrors.value = 'Value must contain only lowercase letters, numbers, and underscores'
    }

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const specializationData = {
      value: formData.value.trim(),
      label: formData.label.trim(),
      description: formData.description.trim(),
      isActive: formData.isActive,
      isDefault: formData.isDefault
    }

    await onSave(specializationData)
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
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Add Vendor Specialization' : 'Edit Vendor Specialization'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' 
                      ? 'Create a new vendor specialization category' 
                      : 'Update vendor specialization information'
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
                <h4 className="text-md font-semibold text-gray-900 mb-4">Basic Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => handleInputChange('label', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500", errors.label ? "border-red-300" : "border-gray-300")}
                      placeholder="Enter specialization label (e.g., Electrical Works)"
                      disabled={isLoading}
                    />
                    {errors.label && <p className="mt-1 text-sm text-red-600">{errors.label}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                    <input
                      type="text"
                      value={formData.value}
                      onChange={(e) => handleInputChange('value', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500", errors.value ? "border-red-300" : "border-gray-300")}
                      placeholder="Enter unique value (e.g., electrical_works)"
                      disabled={isLoading}
                    />
                    {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      Auto-generated from label. Use lowercase letters, numbers, and underscores only.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500", errors.description ? "border-red-300" : "border-gray-300")}
                      placeholder="Enter a detailed description of this specialization"
                      disabled={isLoading}
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
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
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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
                  
                  {vendorSpecialization?.isDefault && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Default Specialization</p>
                          <p className="mt-1">This is a default system specialization and cannot be deleted.</p>
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
                    <span>{mode === 'add' ? 'Create Specialization' : 'Save Changes'}</span>
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