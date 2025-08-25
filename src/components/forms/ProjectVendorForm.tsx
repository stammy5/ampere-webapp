'use client'

import { useState } from 'react'
import { ProjectVendor, ProjectVendorStatus, Vendor } from '@/types'
import { cn } from '@/lib/utils'
import { useVendors } from '@/contexts/VendorContext'
import { 
  Truck, X, Save, DollarSign, Calendar, User, Building2
} from 'lucide-react'

interface ProjectVendorFormProps {
  projectVendor?: ProjectVendor & { vendor?: Vendor }
  isOpen: boolean
  onClose: () => void
  onSave: (vendorData: Partial<ProjectVendor>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

const PROJECT_VENDOR_STATUSES: { value: ProjectVendorStatus; label: string; color: string }[] = [
  { value: 'assigned', label: 'Assigned', color: 'text-yellow-800 bg-yellow-100' },
  { value: 'active', label: 'Active', color: 'text-green-800 bg-green-100' },
  { value: 'completed', label: 'Completed', color: 'text-blue-800 bg-blue-100' },
  { value: 'terminated', label: 'Terminated', color: 'text-red-800 bg-red-100' }
]

const COMMON_VENDOR_ROLES = [
  'Main Contractor',
  'Subcontractor',
  'Electrical Contractor',
  'Plumbing Contractor',
  'Painting Contractor',
  'Flooring Contractor',
  'HVAC Contractor',
  'Structural Engineer',
  'Architect',
  'Interior Designer',
  'Project Consultant',
  'Safety Consultant',
  'Material Supplier',
  'Equipment Supplier',
  'Specialist Contractor'
]

export default function ProjectVendorForm({ 
  projectVendor, 
  isOpen, 
  onClose, 
  onSave, 
  mode, 
  isLoading = false 
}: ProjectVendorFormProps) {
  const { vendors } = useVendors()
  
  const [formData, setFormData] = useState({
    vendorId: projectVendor?.vendorId || '',
    role: projectVendor?.role || '',
    contractValue: projectVendor?.contractValue || 0,
    budgetAllocated: projectVendor?.budgetAllocated || 0, // Add budget allocated field
    budgetUsed: projectVendor?.budgetUsed || 0, // Add budget used field
    startDate: projectVendor?.startDate ? projectVendor.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: projectVendor?.endDate ? projectVendor.endDate.toISOString().split('T')[0] : '',
    status: projectVendor?.status || 'assigned' as ProjectVendorStatus
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Filter vendors to only show active ones and exclude already assigned vendors if in add mode
  const availableVendors = vendors.filter(vendor => 
    vendor.status === 'active' && (mode === 'edit' || vendor.id !== projectVendor?.vendorId)
  )

  const selectedVendor = vendors.find(v => v.id === formData.vendorId)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.vendorId) newErrors.vendorId = 'Please select a vendor'
    if (!formData.role.trim()) newErrors.role = 'Vendor role is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (formData.contractValue < 0) newErrors.contractValue = 'Contract value cannot be negative'
    if (formData.budgetAllocated < 0) newErrors.budgetAllocated = 'Budget allocated cannot be negative'
    if (formData.budgetUsed < 0) newErrors.budgetUsed = 'Budget used cannot be negative'
    if (formData.budgetUsed > formData.budgetAllocated) newErrors.budgetUsed = 'Budget used cannot exceed budget allocated'

    // Date validations
    const startDate = new Date(formData.startDate)
    const endDate = formData.endDate ? new Date(formData.endDate) : null

    if (endDate && endDate <= startDate) {
      newErrors.endDate = 'End date must be after start date'
    }

    // Status validations
    if (formData.status === 'completed' && !formData.endDate) {
      newErrors.endDate = 'End date is required when status is completed'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const vendorData: Partial<ProjectVendor> = {
      vendorId: formData.vendorId,
      role: formData.role.trim(),
      contractValue: formData.contractValue,
      budgetAllocated: formData.budgetAllocated, // Include budget allocated
      budgetUsed: formData.budgetUsed, // Include budget used
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      status: formData.status
    }

    await onSave(vendorData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Assign Vendor to Project' : 'Edit Vendor Assignment'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Assign a vendor to work on this project' : 'Update vendor assignment details'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Vendor Selection */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Vendor Selection</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Vendor *
                  </label>
                  <select
                    value={formData.vendorId}
                    onChange={(e) => handleInputChange('vendorId', e.target.value)}
                    disabled={mode === 'edit'} // Don't allow changing vendor in edit mode
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                      errors.vendorId ? "border-red-300" : "border-gray-300",
                      mode === 'edit' ? "bg-gray-50 cursor-not-allowed" : ""
                    )}
                  >
                    <option value="">Select a vendor...</option>
                    {availableVendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.vendorCode} - {vendor.name} ({vendor.category})
                      </option>
                    ))}
                  </select>
                  {errors.vendorId && <p className="mt-1 text-sm text-red-600">{errors.vendorId}</p>}
                  
                  {selectedVendor && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{selectedVendor.name}</p>
                          <p className="text-sm text-gray-600">{selectedVendor.contactPerson}</p>
                          <p className="text-sm text-gray-600">{selectedVendor.email} • {selectedVendor.phone}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm font-medium">{selectedVendor.rating.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-gray-500">{selectedVendor.category}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Role and Contract Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Contract Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role/Responsibility *
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      list="vendor-roles"
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                        errors.role ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter vendor role (e.g., Main Contractor, Subcontractor)"
                    />
                    <datalist id="vendor-roles">
                      {COMMON_VENDOR_ROLES.map(role => (
                        <option key={role} value={role} />
                      ))}
                    </datalist>
                    {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Value (SGD)
                    </label>
                    <input
                      type="number"
                      value={formData.contractValue}
                      onChange={(e) => handleInputChange('contractValue', parseFloat(e.target.value) || 0)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                        errors.contractValue ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.contractValue && <p className="mt-1 text-sm text-red-600">{errors.contractValue}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {PROJECT_VENDOR_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Budget Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Budget Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Allocated (SGD) *
                    </label>
                    <input
                      type="number"
                      value={formData.budgetAllocated}
                      onChange={(e) => handleInputChange('budgetAllocated', parseFloat(e.target.value) || 0)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                        errors.budgetAllocated ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.budgetAllocated && <p className="mt-1 text-sm text-red-600">{errors.budgetAllocated}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Used (SGD)
                    </label>
                    <input
                      type="number"
                      value={formData.budgetUsed}
                      onChange={(e) => handleInputChange('budgetUsed', parseFloat(e.target.value) || 0)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                        errors.budgetUsed ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      readOnly={mode === 'edit'} // Don't allow editing budget used in edit mode as it's automatically calculated
                    />
                    {errors.budgetUsed && <p className="mt-1 text-sm text-red-600">{errors.budgetUsed}</p>}
                    {mode === 'edit' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Budget used is automatically calculated based on purchase orders
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                        errors.startDate ? "border-red-300" : "border-gray-300"
                      )}
                    />
                    {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
                        errors.endDate ? "border-red-300" : "border-gray-300"
                      )}
                    />
                    {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty if end date is not yet determined
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{mode === 'add' ? 'Assigning...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{mode === 'add' ? 'Assign Vendor' : 'Save Changes'}</span>
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