'use client'

import { useState, useEffect } from 'react'
import { SystemPreferences } from '@/types'
import { cn } from '@/lib/utils'
import { Settings, DollarSign, Calendar, Globe, Save, AlertCircle, Shield } from 'lucide-react'

interface SystemPreferencesFormProps {
  preferences: SystemPreferences
  onSave: (preferences: SystemPreferences) => Promise<void>
  isLoading?: boolean
}

const CURRENCY_OPTIONS = [
  { value: 'SGD', label: 'Singapore Dollar (SGD)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' }
]

const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)' }
]

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (UTC+8)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (UTC+8)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (UTC+7)' },
  { value: 'UTC', label: 'UTC (UTC+0)' }
]

export default function SystemPreferencesForm({
  preferences,
  onSave,
  isLoading = false
}: SystemPreferencesFormProps) {
  const [formData, setFormData] = useState<SystemPreferences>(preferences)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when preferences prop changes
  useEffect(() => {
    setFormData(preferences)
    setErrors({})
  }, [preferences])

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // GST rate validation
    if (formData.defaultGSTRate < 0 || formData.defaultGSTRate > 100) {
      newErrors.defaultGSTRate = 'GST rate must be between 0 and 100'
    }

    // Payment terms validation
    if (formData.defaultPaymentTerms < 1 || formData.defaultPaymentTerms > 365) {
      newErrors.defaultPaymentTerms = 'Payment terms must be between 1 and 365 days'
    }

    // Fiscal year start validation
    if (!/^\d{2}-\d{2}$/.test(formData.fiscalYearStart)) {
      newErrors.fiscalYearStart = 'Fiscal year start must be in MM-DD format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    await onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Financial Settings */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-4 w-4 mr-2 text-ampere-600" />
          Financial Settings
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
            <select
              value={formData.defaultCurrency}
              onChange={(e) => handleInputChange('defaultCurrency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
              disabled={isLoading}
            >
              {CURRENCY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default GST Rate (%)</label>
            <input
              type="number"
              value={formData.defaultGSTRate}
              onChange={(e) => handleInputChange('defaultGSTRate', parseFloat(e.target.value) || 0)}
              className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.defaultGSTRate ? "border-red-300" : "border-gray-300")}
              placeholder="7"
              min="0"
              max="100"
              step="0.1"
              disabled={isLoading}
            />
            {errors.defaultGSTRate && <p className="mt-1 text-sm text-red-600">{errors.defaultGSTRate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Payment Terms (Days)</label>
            <input
              type="number"
              value={formData.defaultPaymentTerms}
              onChange={(e) => handleInputChange('defaultPaymentTerms', parseInt(e.target.value) || 0)}
              className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.defaultPaymentTerms ? "border-red-300" : "border-gray-300")}
              placeholder="30"
              min="1"
              max="365"
              disabled={isLoading}
            />
            {errors.defaultPaymentTerms && <p className="mt-1 text-sm text-red-600">{errors.defaultPaymentTerms}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year Start (MM-DD)</label>
            <input
              type="text"
              value={formData.fiscalYearStart}
              onChange={(e) => handleInputChange('fiscalYearStart', e.target.value)}
              className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.fiscalYearStart ? "border-red-300" : "border-gray-300")}
              placeholder="01-01"
              pattern="\d{2}-\d{2}"
              disabled={isLoading}
            />
            {errors.fiscalYearStart && <p className="mt-1 text-sm text-red-600">{errors.fiscalYearStart}</p>}
            <p className="mt-1 text-sm text-gray-600">Format: MM-DD (e.g., 01-01 for January 1st)</p>
          </div>
        </div>
      </div>

      {/* Date & Time Settings */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-ampere-600" />
          Date & Time Settings
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
            <select
              value={formData.dateFormat}
              onChange={(e) => handleInputChange('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
              disabled={isLoading}
            >
              {DATE_FORMAT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
            <select
              value={formData.timeZone}
              onChange={(e) => handleInputChange('timeZone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
              disabled={isLoading}
            >
              {TIMEZONE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-4 w-4 mr-2 text-ampere-600" />
          System Settings
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoBackup}
                onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                className="h-4 w-4 text-ampere-600 focus:ring-ampere-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-gray-900">Enable Automatic Backup</span>
            </label>
            <div className={cn("px-2 py-1 text-xs font-medium rounded-full", 
              formData.autoBackup ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            )}>
              {formData.autoBackup ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-yellow-600" />
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-gray-900">Maintenance Mode</span>
                </label>
                <p className="text-xs text-gray-600 ml-6">
                  When enabled, only administrators can access the system
                </p>
              </div>
              <div className={cn("px-2 py-1 text-xs font-medium rounded-full", 
                formData.maintenanceMode ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              )}>
                {formData.maintenanceMode ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Note */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">System Preferences Impact:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Currency and GST settings affect all financial calculations</li>
              <li>• Date format applies to all date displays throughout the system</li>
              <li>• Fiscal year setting affects financial reporting periods</li>
              <li>• Maintenance mode restricts access to administrators only</li>
              <li>• Changes take effect immediately upon saving</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}