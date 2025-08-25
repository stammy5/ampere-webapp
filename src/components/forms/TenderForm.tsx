'use client'

import { useState, useEffect } from 'react'
import { Tender, TenderType, TenderStatus } from '@/types'
import { cn } from '@/lib/utils'
import { useClients } from '@/contexts/ClientContext'
import { useAuth } from '@/contexts/AuthContext'
import { getDistrictFromPostalCode, validateSingaporePostalCode } from '@/lib/postal-districts'
import { 
  Building, X, Save, Target, MapPin, Calendar, DollarSign
} from 'lucide-react'

interface TenderFormProps {
  tender?: Tender
  isOpen: boolean
  onClose: () => void
  onSave: (tenderData: Partial<Tender>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

const TENDER_TYPES: { value: TenderType; label: string }[] = [
  { value: 'open', label: 'Open Tender' },
  { value: 'selective', label: 'Selective Tender' },
  { value: 'nominated', label: 'Nominated Tender' },
  { value: 'negotiated', label: 'Negotiated Contract' }
]

const TENDER_STATUSES: { value: TenderStatus; label: string }[] = [
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_evaluation', label: 'Under Evaluation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'cancelled', label: 'Cancelled' }
]

const SINGAPORE_DISTRICTS = [
  'Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Batok', 'Bukit Merah', 'Bukit Timah',
  'Clementi', 'Downtown Core', 'Geylang', 'Hougang', 'Jurong East', 'Jurong West',
  'Kallang', 'Marine Parade', 'Newton', 'Orchard', 'Pasir Ris', 'Punggol',
  'Queenstown', 'Sembawang', 'Sengkang', 'Tampines', 'Toa Payoh', 'Woodlands', 'Yishun'
]

export default function TenderForm({ tender, isOpen, onClose, onSave, mode, isLoading = false }: TenderFormProps) {
  const { clients } = useClients()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    title: tender?.title || '',
    clientId: tender?.clientId || '',
    type: tender?.type || 'open' as TenderType,
    status: tender?.status || 'opportunity' as TenderStatus,
    description: tender?.description || '',
    street: tender?.location?.street || '',
    postalCode: tender?.location?.postalCode || '',
    district: tender?.location?.district || '',
    estimatedValue: tender?.estimatedValue || 0,
    submissionDeadline: tender?.submissionDeadline ? new Date(tender.submissionDeadline).toISOString().split('T')[0] : '',
    startDate: tender?.startDate ? new Date(tender.startDate).toISOString().split('T')[0] : '',
    completionDate: tender?.completionDate ? new Date(tender.completionDate).toISOString().split('T')[0] : '',
    requirements: tender?.requirements?.join('\n') || '',
    competitorCount: tender?.competitorCount || 0,
    winProbability: tender?.winProbability || 50,
    assignedTo: tender?.assignedTo || user?.id || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      if (field === 'postalCode' && typeof value === 'string') {
        const district = getDistrictFromPostalCode(value)
        if (district) {
          updated.district = district
        }
      }
      
      return updated
    })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Tender title is required'
    if (!formData.clientId) newErrors.clientId = 'Client selection is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.street.trim()) newErrors.street = 'Street address is required'
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required'
    if (!formData.submissionDeadline) newErrors.submissionDeadline = 'Submission deadline is required'
    if (formData.estimatedValue <= 0) newErrors.estimatedValue = 'Estimated value must be greater than 0'

    if (formData.postalCode && !validateSingaporePostalCode(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid 6-digit postal code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const tenderData: Partial<Tender> = {
      title: formData.title.trim(),
      clientId: formData.clientId,
      type: formData.type,
      status: formData.status,
      description: formData.description.trim(),
      location: {
        street: formData.street.trim(),
        postalCode: formData.postalCode.trim(),
        district: formData.district
      },
      estimatedValue: formData.estimatedValue,
      submissionDeadline: new Date(formData.submissionDeadline),
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      completionDate: formData.completionDate ? new Date(formData.completionDate) : undefined,
      requirements: formData.requirements.split('\n').filter(req => req.trim()).map(req => req.trim()),
      competitorCount: formData.competitorCount,
      winProbability: formData.winProbability,
      assignedTo: formData.assignedTo,
      documents: tender?.documents || []
    }

    await onSave(tenderData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-ampere-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-ampere-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Add New Tender' : 'Edit Tender'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Create a new tender opportunity' : 'Update tender information'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tender Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.title ? "border-red-300" : "border-gray-300")}
                      placeholder="Enter tender title"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tender Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    >
                      {TENDER_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
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
                      {TENDER_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value (SGD) *</label>
                    <input
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => handleInputChange('estimatedValue', parseFloat(e.target.value) || 0)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.estimatedValue ? "border-red-300" : "border-gray-300")}
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                    {errors.estimatedValue && <p className="mt-1 text-sm text-red-600">{errors.estimatedValue}</p>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.description ? "border-red-300" : "border-gray-300")}
                  placeholder="Describe the tender scope and requirements..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Location & Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Location</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.street ? "border-red-300" : "border-gray-300")}
                        placeholder="Enter street address"
                      />
                      {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.postalCode ? "border-red-300" : "border-gray-300")}
                        placeholder="123456"
                        maxLength={6}
                      />
                      {formData.postalCode && getDistrictFromPostalCode(formData.postalCode) && (
                        <p className="mt-1 text-xs text-green-600">📍 Auto-selected: {getDistrictFromPostalCode(formData.postalCode)}</p>
                      )}
                      {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <select
                        value={formData.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                      >
                        <option value="">Select District</option>
                        {SINGAPORE_DISTRICTS.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Timeline & Competition</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Submission Deadline *</label>
                      <input
                        type="date"
                        value={formData.submissionDeadline}
                        onChange={(e) => handleInputChange('submissionDeadline', e.target.value)}
                        className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.submissionDeadline ? "border-red-300" : "border-gray-300")}
                      />
                      {errors.submissionDeadline && <p className="mt-1 text-sm text-red-600">{errors.submissionDeadline}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Competitors</label>
                        <input
                          type="number"
                          value={formData.competitorCount}
                          onChange={(e) => handleInputChange('competitorCount', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Win Probability (%)</label>
                        <input
                          type="number"
                          value={formData.winProbability}
                          onChange={(e) => handleInputChange('winProbability', parseInt(e.target.value) || 50)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                          placeholder="50"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                  placeholder="Enter requirements (one per line)"
                />
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
                    <span>{mode === 'add' ? 'Adding...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{mode === 'add' ? 'Add Tender' : 'Save Changes'}</span>
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