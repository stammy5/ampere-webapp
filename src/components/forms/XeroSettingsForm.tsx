'use client'

import { useState, useEffect } from 'react'
import { useSettings } from '@/contexts/SettingsContext'
import { XeroSettings } from '@/types'
import { Save, RefreshCw, AlertCircle } from 'lucide-react'

interface XeroSettingsFormProps {
  onCancel?: () => void
}

export default function XeroSettingsForm({ onCancel }: XeroSettingsFormProps) {
  const { settings, updateXeroSettings } = useSettings()
  
  const [formData, setFormData] = useState<XeroSettings>({
    isEnabled: false,
    clientId: '',
    clientSecret: '',
    tenantId: '',
    autoSyncEnabled: false,
    syncFrequency: 'daily',
    syncEntities: {
      invoices: true,
      vendorInvoices: true,
      payments: true,
      contacts: false
    }
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Initialize form with existing settings
  useEffect(() => {
    if (settings?.xeroSettings) {
      setFormData({
        ...formData,
        ...settings.xeroSettings,
        syncEntities: {
          invoices: true,
          vendorInvoices: true,
          payments: true,
          contacts: false,
          ...settings.xeroSettings.syncEntities
        }
      })
    }
  }, [settings])

  const handleChange = (field: keyof XeroSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSyncEntitiesChange = (entity: keyof XeroSettings['syncEntities'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      syncEntities: {
        ...prev.syncEntities,
        [entity]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError('')
    setSaveSuccess(false)
    
    try {
      const success = updateXeroSettings(formData)
      if (success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setSaveError('Failed to save Xero settings')
      }
    } catch (error) {
      console.error('Error saving Xero settings:', error)
      setSaveError('An error occurred while saving settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    // In a real implementation, this would test the Xero connection
    alert('In a real implementation, this would test the Xero connection')
  }

  const handleSyncNow = async () => {
    // In a real implementation, this would trigger an immediate sync
    alert('In a real implementation, this would trigger an immediate sync')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Xero settings saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {saveError}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Connection Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Connection Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="form-label">Enable Xero Integration</label>
                <p className="text-sm text-gray-500">Connect your system to Xero for automatic data synchronization</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={(e) => handleChange('isEnabled', e.target.checked)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>
            
            {formData.isEnabled && (
              <>
                <div>
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                    Client ID
                  </label>
                  <input
                    type="password"
                    id="clientId"
                    value={formData.clientId || ''}
                    onChange={(e) => handleChange('clientId', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-ampere-500 focus:border-ampere-500"
                    placeholder="Enter your Xero Client ID"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Your Xero application Client ID from the developer portal
                  </p>
                </div>
                
                <div>
                  <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 mb-1">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    id="clientSecret"
                    value={formData.clientSecret || ''}
                    onChange={(e) => handleChange('clientSecret', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-ampere-500 focus:border-ampere-500"
                    placeholder="Enter your Xero Client Secret"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Your Xero application Client Secret from the developer portal
                  </p>
                </div>
                
                <div>
                  <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-1">
                    Tenant ID
                  </label>
                  <input
                    type="text"
                    id="tenantId"
                    value={formData.tenantId || ''}
                    onChange={(e) => handleChange('tenantId', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-ampere-500 focus:border-ampere-500"
                    placeholder="Enter your Xero Tenant ID"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Your Xero organization Tenant ID
                  </p>
                </div>
                
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    className="btn-secondary flex items-center space-x-2"
                    disabled={!formData.clientId || !formData.clientSecret || !formData.tenantId}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Test Connection</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Sync Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Synchronization Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Automatic Sync</label>
                <p className="text-sm text-gray-500">Automatically sync data with Xero on a schedule</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  checked={formData.autoSyncEnabled}
                  onChange={(e) => handleChange('autoSyncEnabled', e.target.checked)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  disabled={!formData.isEnabled}
                />
                <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>
            
            {formData.autoSyncEnabled && (
              <>
                <div>
                  <label htmlFor="syncFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                    Sync Frequency
                  </label>
                  <select
                    id="syncFrequency"
                    value={formData.syncFrequency}
                    onChange={(e) => handleChange('syncFrequency', e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-ampere-500 focus:border-ampere-500"
                    disabled={!formData.isEnabled}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sync Entities
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Client Invoices</span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          checked={formData.syncEntities.invoices}
                          onChange={(e) => handleSyncEntitiesChange('invoices', e.target.checked)}
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                          disabled={!formData.isEnabled}
                        />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Vendor Invoices</span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          checked={formData.syncEntities.vendorInvoices}
                          onChange={(e) => handleSyncEntitiesChange('vendorInvoices', e.target.checked)}
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                          disabled={!formData.isEnabled}
                        />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Payments</span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          checked={formData.syncEntities.payments}
                          onChange={(e) => handleSyncEntitiesChange('payments', e.target.checked)}
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                          disabled={!formData.isEnabled}
                        />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Contacts</span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          checked={formData.syncEntities.contacts}
                          onChange={(e) => handleSyncEntitiesChange('contacts', e.target.checked)}
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                          disabled={!formData.isEnabled}
                        />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div className="pt-4">
              <button
                type="button"
                onClick={handleSyncNow}
                className="btn-secondary flex items-center space-x-2"
                disabled={!formData.isEnabled}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isSaving}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
            disabled={isSaving || !formData.isEnabled}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}