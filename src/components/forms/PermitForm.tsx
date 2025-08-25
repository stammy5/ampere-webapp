'use client'

import { useState } from 'react'
import { Permit, PermitType, PermitStatus, PermitAuthority } from '@/types'
import { cn } from '@/lib/utils'
import { 
  CheckCircle, X, Save, FileText, Calendar, DollarSign, Building
} from 'lucide-react'

interface PermitFormProps {
  permit?: Permit
  isOpen: boolean
  onClose: () => void
  onSave: (permitData: Partial<Permit>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

const PERMIT_TYPES: { value: PermitType; label: string }[] = [
  { value: 'building_plan', label: 'Building Plan Approval' },
  { value: 'structural_plan', label: 'Structural Plan Approval' },
  { value: 'demolition_permit', label: 'Demolition Permit' },
  { value: 'hacking_permit', label: 'Hacking Permit' },
  { value: 'renovation_permit', label: 'Renovation Permit' },
  { value: 'aanda_permit', label: 'A&A Permit' }
]

const PERMIT_STATUSES: { value: PermitStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' }
]

const PERMIT_AUTHORITIES: { value: PermitAuthority; label: string }[] = [
  { value: 'bca', label: 'Building and Construction Authority (BCA)' },
  { value: 'ura', label: 'Urban Redevelopment Authority (URA)' },
  { value: 'hdb', label: 'Housing Development Board (HDB)' },
  { value: 'scdf', label: 'Singapore Civil Defence Force (SCDF)' },
  { value: 'nea', label: 'National Environment Agency (NEA)' },
  { value: 'pub', label: 'Public Utilities Board (PUB)' }
]

export default function PermitForm({ permit, isOpen, onClose, onSave, mode, isLoading = false }: PermitFormProps) {
  const [formData, setFormData] = useState({
    type: permit?.type || 'renovation_permit' as PermitType,
    applicationNumber: permit?.applicationNumber || '',
    status: permit?.status || 'draft' as PermitStatus,
    submittedDate: permit?.submittedDate ? permit.submittedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    approvedDate: permit?.approvedDate ? permit.approvedDate.toISOString().split('T')[0] : '',
    expiryDate: permit?.expiryDate ? permit.expiryDate.toISOString().split('T')[0] : '',
    authority: permit?.authority || 'bca' as PermitAuthority,
    fee: permit?.fee || 0,
    notes: permit?.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.applicationNumber.trim()) newErrors.applicationNumber = 'Application number is required'
    if (!formData.submittedDate) newErrors.submittedDate = 'Submitted date is required'
    if (formData.fee < 0) newErrors.fee = 'Fee cannot be negative'

    // Date validations
    const submittedDate = new Date(formData.submittedDate)
    const approvedDate = formData.approvedDate ? new Date(formData.approvedDate) : null
    const expiryDate = formData.expiryDate ? new Date(formData.expiryDate) : null

    if (approvedDate && approvedDate < submittedDate) {
      newErrors.approvedDate = 'Approved date cannot be before submitted date'
    }

    if (expiryDate && expiryDate < submittedDate) {
      newErrors.expiryDate = 'Expiry date cannot be before submitted date'
    }

    if (formData.status === 'approved' && !formData.approvedDate) {
      newErrors.approvedDate = 'Approved date is required when status is approved'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const permitData: Partial<Permit> = {
      type: formData.type,
      applicationNumber: formData.applicationNumber.trim(),
      status: formData.status,
      submittedDate: new Date(formData.submittedDate),
      approvedDate: formData.approvedDate ? new Date(formData.approvedDate) : undefined,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      authority: formData.authority,
      fee: formData.fee,
      documents: permit?.documents || [],
      notes: formData.notes.trim() || undefined
    }

    await onSave(permitData)
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
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Add Construction Permit' : 'Edit Permit'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Add a new construction permit to this project' : 'Update permit information'}
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
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Permit Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Permit Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {PERMIT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Number *
                    </label>
                    <input
                      type="text"
                      value={formData.applicationNumber}
                      onChange={(e) => handleInputChange('applicationNumber', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500",
                        errors.applicationNumber ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter application number"
                    />
                    {errors.applicationNumber && <p className="mt-1 text-sm text-red-600">{errors.applicationNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {PERMIT_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Authority *
                    </label>
                    <select
                      value={formData.authority}
                      onChange={(e) => handleInputChange('authority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {PERMIT_AUTHORITIES.map(authority => (
                        <option key={authority.value} value={authority.value}>{authority.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dates and Fees */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Dates & Fees</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Submitted Date *
                    </label>
                    <input
                      type="date"
                      value={formData.submittedDate}
                      onChange={(e) => handleInputChange('submittedDate', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500",
                        errors.submittedDate ? "border-red-300" : "border-gray-300"
                      )}
                    />
                    {errors.submittedDate && <p className="mt-1 text-sm text-red-600">{errors.submittedDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approved Date
                    </label>
                    <input
                      type="date"
                      value={formData.approvedDate}
                      onChange={(e) => handleInputChange('approvedDate', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500",
                        errors.approvedDate ? "border-red-300" : "border-gray-300"
                      )}
                    />
                    {errors.approvedDate && <p className="mt-1 text-sm text-red-600">{errors.approvedDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500",
                        errors.expiryDate ? "border-red-300" : "border-gray-300"
                      )}
                    />
                    {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fee (SGD)
                    </label>
                    <input
                      type="number"
                      value={formData.fee}
                      onChange={(e) => handleInputChange('fee', parseFloat(e.target.value) || 0)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500",
                        errors.fee ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.fee && <p className="mt-1 text-sm text-red-600">{errors.fee}</p>}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Additional notes about the permit..."
                />
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
                    <span>{mode === 'add' ? 'Adding...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{mode === 'add' ? 'Add Permit' : 'Save Changes'}</span>
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