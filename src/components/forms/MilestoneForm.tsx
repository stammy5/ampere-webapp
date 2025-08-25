'use client'

import { useState } from 'react'
import { Milestone, MilestoneStatus } from '@/types'
import { cn } from '@/lib/utils'
import { 
  Target, X, Save, Calendar, CheckCircle, BarChart3
} from 'lucide-react'

interface MilestoneFormProps {
  milestone?: Milestone
  isOpen: boolean
  onClose: () => void
  onSave: (milestoneData: Partial<Milestone>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
  availableMilestones?: Milestone[] // For dependency selection
}

const MILESTONE_STATUSES: { value: MilestoneStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'text-gray-800 bg-gray-100' },
  { value: 'in_progress', label: 'In Progress', color: 'text-blue-800 bg-blue-100' },
  { value: 'completed', label: 'Completed', color: 'text-green-800 bg-green-100' },
  { value: 'delayed', label: 'Delayed', color: 'text-red-800 bg-red-100' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-gray-800 bg-gray-100' }
]

export default function MilestoneForm({ 
  milestone, 
  isOpen, 
  onClose, 
  onSave, 
  mode, 
  isLoading = false,
  availableMilestones = []
}: MilestoneFormProps) {
  const [formData, setFormData] = useState({
    name: milestone?.name || '',
    description: milestone?.description || '',
    targetDate: milestone?.targetDate ? milestone.targetDate.toISOString().split('T')[0] : '',
    actualDate: milestone?.actualDate ? milestone.actualDate.toISOString().split('T')[0] : '',
    status: milestone?.status || 'pending' as MilestoneStatus,
    dependencies: milestone?.dependencies || [],
    completionPercentage: milestone?.completionPercentage || 0
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleDependencyChange = (milestoneId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dependencies: checked 
        ? [...prev.dependencies, milestoneId]
        : prev.dependencies.filter(id => id !== milestoneId)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Milestone name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.targetDate) newErrors.targetDate = 'Target date is required'

    // Completion percentage validation
    if (formData.completionPercentage < 0 || formData.completionPercentage > 100) {
      newErrors.completionPercentage = 'Completion percentage must be between 0 and 100'
    }

    // Date validations
    if (formData.actualDate && formData.targetDate) {
      const targetDate = new Date(formData.targetDate)
      const actualDate = new Date(formData.actualDate)
      
      if (actualDate < targetDate && formData.status === 'completed') {
        // Allow early completion
      }
    }

    // Status validations
    if (formData.status === 'completed') {
      if (!formData.actualDate) {
        newErrors.actualDate = 'Actual completion date is required when status is completed'
      }
      if (formData.completionPercentage !== 100) {
        newErrors.completionPercentage = 'Completion percentage must be 100% when status is completed'
      }
    }

    if (formData.status === 'in_progress' && formData.completionPercentage === 0) {
      newErrors.completionPercentage = 'In progress milestones should have some completion percentage'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const milestoneData: Partial<Milestone> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      targetDate: new Date(formData.targetDate),
      actualDate: formData.actualDate ? new Date(formData.actualDate) : undefined,
      status: formData.status,
      dependencies: formData.dependencies,
      completionPercentage: formData.completionPercentage
    }

    await onSave(milestoneData)
  }

  // Filter out current milestone from dependencies to prevent self-dependency
  const dependencyOptions = availableMilestones.filter(m => m.id !== milestone?.id)

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
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Add Project Milestone' : 'Edit Milestone'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Add a new milestone to track project progress' : 'Update milestone information'}
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
          <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Milestone Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Milestone Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        errors.name ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter milestone name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        errors.description ? "border-red-300" : "border-gray-300"
                      )}
                      rows={3}
                      placeholder="Describe what needs to be accomplished..."
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Status and Progress */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Status & Progress</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {MILESTONE_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Percentage
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.completionPercentage}
                        onChange={(e) => handleInputChange('completionPercentage', parseInt(e.target.value) || 0)}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                          errors.completionPercentage ? "border-red-300" : "border-gray-300"
                        )}
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    {errors.completionPercentage && <p className="mt-1 text-sm text-red-600">{errors.completionPercentage}</p>}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Date *
                    </label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => handleInputChange('targetDate', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        errors.targetDate ? "border-red-300" : "border-gray-300"
                      )}
                    />
                    {errors.targetDate && <p className="mt-1 text-sm text-red-600">{errors.targetDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actual Completion Date
                    </label>
                    <input
                      type="date"
                      value={formData.actualDate}
                      onChange={(e) => handleInputChange('actualDate', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        errors.actualDate ? "border-red-300" : "border-gray-300"
                      )}
                    />
                    {errors.actualDate && <p className="mt-1 text-sm text-red-600">{errors.actualDate}</p>}
                  </div>
                </div>
              </div>

              {/* Dependencies */}
              {dependencyOptions.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Dependencies</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-3">
                      Select milestones that must be completed before this one:
                    </p>
                    {dependencyOptions.map((dep) => (
                      <label key={dep.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.dependencies.includes(dep.id)}
                          onChange={(e) => handleDependencyChange(dep.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{dep.name}</p>
                          <p className="text-xs text-gray-500">{dep.description}</p>
                        </div>
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          MILESTONE_STATUSES.find(s => s.value === dep.status)?.color
                        )}>
                          {MILESTONE_STATUSES.find(s => s.value === dep.status)?.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
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
                    <span>{mode === 'add' ? 'Add Milestone' : 'Save Changes'}</span>
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