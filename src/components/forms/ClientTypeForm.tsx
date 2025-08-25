'use client'

import { useState, useEffect } from 'react'
import { ClientTypeConfig } from '@/types'
import { cn } from '@/lib/utils'
import { X, Save, AlertCircle, Tag, FileText, Plus } from 'lucide-react'

interface ClientTypeFormProps {
  clientType?: ClientTypeConfig
  isOpen: boolean
  onClose: () => void
  onSave: (clientTypeData: Omit<ClientTypeConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

export default function ClientTypeForm({
  clientType,
  isOpen,
  onClose,
  onSave,
  mode,
  isLoading = false
}: ClientTypeFormProps) {
  const [formData, setFormData] = useState({
    value: clientType?.value || '',
    label: clientType?.label || '',
    description: clientType?.description || '',
    isActive: clientType?.isActive !== undefined ? clientType.isActive : true,
    isDefault: clientType?.isDefault || false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when clientType prop changes
  useEffect(() => {
    if (clientType) {
      setFormData({
        value: clientType.value,
        label: clientType.label,
        description: clientType.description,
        isActive: clientType.isActive,
        isDefault: clientType.isDefault
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
  }, [clientType, isOpen])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate value from label for new client types
    if (field === 'label' && mode === 'add' && typeof value === 'string') {
      const generatedValue = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 30)
      setFormData(prev => ({ ...prev, value: generatedValue }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Label validation
    if (!formData.label.trim()) {
      newErrors.label = 'Label is required'
    } else if (formData.label.trim().length < 2) {
      newErrors.label = 'Label must be at least 2 characters'
    }

    // Value validation
    if (!formData.value.trim()) {
      newErrors.value = 'Value is required'
    } else if (!/^[a-z0-9_]+$/.test(formData.value)) {
      newErrors.value = 'Value must only contain lowercase letters, numbers, and underscores'
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const clientTypeData: Omit<ClientTypeConfig, 'id' | 'createdAt' | 'updatedAt'> = {
      value: formData.value.trim(),
      label: formData.label.trim(),
      description: formData.description.trim(),
      isActive: formData.isActive,
      isDefault: formData.isDefault
    }

    await onSave(clientTypeData)
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
                  <Tag className="h-5 w-5 text-ampere-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Add Client Type' : 'Edit Client Type'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' 
                      ? 'Create a new client type for categorization' 
                      : 'Update client type information'
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
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-ampere-600" />
                  Client Type Information
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Label *</label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => handleInputChange('label', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.label ? "border-red-300" : "border-gray-300")}
                      placeholder="e.g., Property Developer"
                      disabled={isLoading}
                    />
                    {errors.label && <p className="mt-1 text-sm text-red-600">{errors.label}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">System Value *</label>
                    <input
                      type="text"
                      value={formData.value}
                      onChange={(e) => handleInputChange('value', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.value ? "border-red-300" : "border-gray-300")}
                      placeholder="e.g., property_developer"
                      disabled={isLoading || (mode === 'edit' && formData.isDefault)}
                    />
                    {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
                    {mode === 'edit' && formData.isDefault && (
                      <p className="mt-1 text-sm text-blue-600">Default client types cannot have their system value changed</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.description ? "border-red-300" : "border-gray-300")}
                      placeholder="Describe this client type and when it should be used..."
                      rows={3}
                      disabled={isLoading}
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Status & Settings */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Status & Settings</h4>
                
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

                  {formData.isDefault && (
                    <div className="flex items-center space-x-2">
                      <div className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Default Type
                      </div>
                      <span className="text-xs text-gray-600">This is a system default type and cannot be deleted</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Client Type Guidelines:</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Choose descriptive labels that are clear to users</li>
                        <li>• System values are used internally and should be lowercase with underscores</li>
                        <li>• Inactive types won't appear in client creation forms</li>
                        <li>• Default types cannot be deleted to maintain system integrity</li>
                      </ul>
                    </div>
                  </div>
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
                    <span>{mode === 'add' ? 'Create Type' : 'Save Changes'}</span>
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