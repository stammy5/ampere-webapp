'use client'

import { useState, useEffect } from 'react'
import { Project, ProjectType, ProjectStatus } from '@/types'
import { cn } from '@/lib/utils'
import { useClients } from '@/contexts/ClientContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  FolderOpen, X, Save, MapPin, Calendar, DollarSign
} from 'lucide-react'

interface ProjectFormProps {
  project?: Project
  isOpen: boolean
  onClose: () => void
  onSave: (projectData: Partial<Project>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'renovation', label: 'Renovation' },
  { value: 'addition_alteration', label: 'Addition & Alteration' },
  { value: 'reinstatement', label: 'Reinstatement' },
  { value: 'new_construction', label: 'New Construction' },
  { value: 'maintenance', label: 'Maintenance' }
]

const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'permit_application', label: 'Permit Application' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'on_hold', label: 'On Hold' }
]

// Singapore postal code to district mapping
const getDistrictFromPostal = (postalCode: string): string => {
  if (!postalCode) return ''
  const code = parseInt(postalCode.substring(0, 2))
  
  if (code >= 1 && code <= 6) return 'Downtown Core'
  if (code >= 7 && code <= 8) return 'Marina East'
  if (code >= 9 && code <= 10) return 'Museum'
  if (code >= 11 && code <= 13) return 'Newton'
  if (code >= 14 && code <= 16) return 'Orchard'
  if (code >= 17 && code <= 19) return 'Outram'
  if (code >= 20 && code <= 21) return 'River Valley'
  if (code >= 28 && code <= 30) return 'Novena'
  if (code >= 31 && code <= 33) return 'Toa Payoh'
  if (code >= 34 && code <= 36) return 'Bishan'
  if (code >= 37 && code <= 39) return 'Ang Mo Kio'
  if (code >= 40 && code <= 41) return 'Hougang'
  if (code >= 46 && code <= 48) return 'Serangoon'
  if (code >= 49 && code <= 50) return 'Tampines'
  if (code >= 51 && code <= 52) return 'Pasir Ris'
  if (code >= 53 && code <= 54) return 'Bedok'
  if (code >= 55 && code <= 57) return 'Clementi'
  if (code >= 58 && code <= 59) return 'Jurong East'
  if (code >= 60 && code <= 64) return 'Jurong West'
  if (code >= 68 && code <= 69) return 'Bukit Merah'
  if (code >= 75 && code <= 77) return 'Sembawang'
  if (code >= 78 && code <= 79) return 'Yishun'
  if (code >= 80 && code <= 82) return 'Woodlands'
  
  return 'Central'
}

export default function ProjectForm({ project, isOpen, onClose, onSave, mode, isLoading = false }: ProjectFormProps) {
  const { clients } = useClients()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    name: project?.name || '',
    clientId: project?.clientId || '',
    type: project?.type || 'renovation' as ProjectType,
    status: project?.status || 'planning' as ProjectStatus,
    description: project?.description || '',
    location: {
      street: project?.location?.street || '',
      building: project?.location?.building || '',
      unit: project?.location?.unit || '',
      postalCode: project?.location?.postalCode || '',
      district: project?.location?.district || ''
    },
    contractValue: project?.contractValue || 0,
    estimatedCost: project?.estimatedCost || 0,
    actualCost: project?.actualCost || 0,
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    expectedEndDate: project?.expectedEndDate ? new Date(project.expectedEndDate).toISOString().split('T')[0] : '',
    actualEndDate: project?.actualEndDate ? new Date(project.actualEndDate).toISOString().split('T')[0] : '',
    projectManager: project?.projectManager || user?.id || '',
    team: project?.team || []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-fill district when postal code changes
  useEffect(() => {
    if (formData.location.postalCode && formData.location.postalCode.length === 6) {
      const district = getDistrictFromPostal(formData.location.postalCode)
      if (district && district !== formData.location.district) {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, district }
        }))
      }
    }
  }, [formData.location.postalCode])

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith('location.')) {
      const locationField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [locationField]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Project name is required'
    if (!formData.clientId) newErrors.clientId = 'Client selection is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.location.street.trim()) newErrors['location.street'] = 'Street address is required'
    if (!formData.location.postalCode.trim()) newErrors['location.postalCode'] = 'Postal code is required'
    if (formData.contractValue <= 0) newErrors.contractValue = 'Contract value must be greater than 0'
    if (formData.estimatedCost <= 0) newErrors.estimatedCost = 'Estimated cost must be greater than 0'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.expectedEndDate) newErrors.expectedEndDate = 'Expected end date is required'
    if (!formData.projectManager) newErrors.projectManager = 'Project manager is required'

    // Validate postal code format (6 digits)
    if (formData.location.postalCode && !/^\d{6}$/.test(formData.location.postalCode)) {
      newErrors['location.postalCode'] = 'Postal code must be 6 digits'
    }

    // Validate dates
    if (formData.startDate && formData.expectedEndDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.expectedEndDate)
      if (endDate <= startDate) {
        newErrors.expectedEndDate = 'Expected end date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const projectData: Partial<Project> = {
      name: formData.name.trim(),
      clientId: formData.clientId,
      type: formData.type,
      status: formData.status,
      description: formData.description.trim(),
      location: {
        street: formData.location.street.trim(),
        building: formData.location.building?.trim() || undefined,
        unit: formData.location.unit?.trim() || undefined,
        postalCode: formData.location.postalCode.trim(),
        district: formData.location.district || getDistrictFromPostal(formData.location.postalCode)
      },
      contractValue: formData.contractValue,
      estimatedCost: formData.estimatedCost,
      actualCost: formData.actualCost || undefined,
      startDate: new Date(formData.startDate),
      expectedEndDate: new Date(formData.expectedEndDate),
      actualEndDate: formData.actualEndDate ? new Date(formData.actualEndDate) : undefined,
      projectManager: formData.projectManager,
      team: formData.team
    }

    await onSave(projectData)
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-ampere-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-ampere-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Create New Project' : 'Edit Project'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Set up a new construction project' : 'Update project details and specifications'}
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
                <h4 className="text-md font-semibold text-gray-900 mb-4">Project Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.name ? "border-red-300" : "border-gray-300")}
                      placeholder="Enter project name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    >
                      {PROJECT_TYPES.map(type => (
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
                      {PROJECT_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager *</label>
                    <select
                      value={formData.projectManager}
                      onChange={(e) => handleInputChange('projectManager', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.projectManager ? "border-red-300" : "border-gray-300")}
                    >
                      <option value="">Select Project Manager</option>
                      <option value="1">John Tan</option>
                      <option value="2">Sarah Lim</option>
                      <option value="3">David Wong</option>
                      <option value="4">Michelle Chen</option>
                      <option value="5">Robert Kumar</option>
                    </select>
                    {errors.projectManager && <p className="mt-1 text-sm text-red-600">{errors.projectManager}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.description ? "border-red-300" : "border-gray-300")}
                      placeholder="Describe the project scope and requirements..."
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-ampere-600" />
                  Project Location
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      value={formData.location.street}
                      onChange={(e) => handleInputChange('location.street', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors['location.street'] ? "border-red-300" : "border-gray-300")}
                      placeholder="Enter street address"
                    />
                    {errors['location.street'] && <p className="mt-1 text-sm text-red-600">{errors['location.street']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
                    <input
                      type="text"
                      value={formData.location.building}
                      onChange={(e) => handleInputChange('location.building', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                      placeholder="Building or development name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
                    <input
                      type="text"
                      value={formData.location.unit}
                      onChange={(e) => handleInputChange('location.unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                      placeholder="Unit or floor number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      value={formData.location.postalCode}
                      onChange={(e) => handleInputChange('location.postalCode', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors['location.postalCode'] ? "border-red-300" : "border-gray-300")}
                      placeholder="6-digit postal code"
                      maxLength={6}
                    />
                    {errors['location.postalCode'] && <p className="mt-1 text-sm text-red-600">{errors['location.postalCode']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input
                      type="text"
                      value={formData.location.district}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      placeholder="Auto-filled based on postal code"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-ampere-600" />
                  Financial Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value (SGD) *</label>
                    <input
                      type="number"
                      value={formData.contractValue}
                      onChange={(e) => handleInputChange('contractValue', parseFloat(e.target.value) || 0)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.contractValue ? "border-red-300" : "border-gray-300")}
                      min="0"
                      step="0.01"
                    />
                    {errors.contractValue && <p className="mt-1 text-sm text-red-600">{errors.contractValue}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (SGD) *</label>
                    <input
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.estimatedCost ? "border-red-300" : "border-gray-300")}
                      min="0"
                      step="0.01"
                    />
                    {errors.estimatedCost && <p className="mt-1 text-sm text-red-600">{errors.estimatedCost}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Cost (SGD)</label>
                    <input
                      type="number"
                      value={formData.actualCost}
                      onChange={(e) => handleInputChange('actualCost', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                {formData.contractValue > 0 && formData.estimatedCost > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Estimated Margin:</span>
                        <p className={cn("font-medium", 
                          (formData.contractValue - formData.estimatedCost) > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {formatCurrency(formData.contractValue - formData.estimatedCost)} 
                          ({Math.round(((formData.contractValue - formData.estimatedCost) / formData.contractValue) * 100)}%)
                        </p>
                      </div>
                      {formData.actualCost > 0 && (
                        <div>
                          <span className="text-gray-600">Actual Margin:</span>
                          <p className={cn("font-medium", 
                            (formData.contractValue - formData.actualCost) > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatCurrency(formData.contractValue - formData.actualCost)}
                            ({Math.round(((formData.contractValue - formData.actualCost) / formData.contractValue) * 100)}%)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-ampere-600" />
                  Project Timeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.startDate ? "border-red-300" : "border-gray-300")}
                    />
                    {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected End Date *</label>
                    <input
                      type="date"
                      value={formData.expectedEndDate}
                      onChange={(e) => handleInputChange('expectedEndDate', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.expectedEndDate ? "border-red-300" : "border-gray-300")}
                    />
                    {errors.expectedEndDate && <p className="mt-1 text-sm text-red-600">{errors.expectedEndDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual End Date</label>
                    <input
                      type="date"
                      value={formData.actualEndDate}
                      onChange={(e) => handleInputChange('actualEndDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    />
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
                    <span>{mode === 'add' ? 'Create Project' : 'Save Changes'}</span>
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