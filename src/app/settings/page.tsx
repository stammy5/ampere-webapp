'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ClientTypeForm from '@/components/forms/ClientTypeForm'
import VendorSpecializationForm from '@/components/forms/VendorSpecializationForm'
import FrequentlyUsedItemForm from '@/components/forms/FrequentlyUsedItemForm'
import CompanyInfoForm from '@/components/forms/CompanyInfoForm'
import SystemPreferencesForm from '@/components/forms/SystemPreferencesForm'
import XeroSettingsForm from '@/components/forms/XeroSettingsForm'
import { ClientTypeConfig, VendorSpecializationConfig, FrequentlyUsedItem } from '@/types'
import { 
  Settings, Building, Tag, DollarSign, Calendar, Shield, 
  Plus, Edit, Trash2, CheckCircle, XCircle, Download, 
  Upload, RefreshCw, X, AlertTriangle, Wrench, Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { user } = useAuth()
  const { 
    settings, clientTypes, addClientType, updateClientType, 
    deleteClientType, toggleClientTypeStatus, updateCompanyInfo,
    updateSystemPreferences, exportSettings, importSettings,
    vendorSpecializations, addVendorSpecialization, updateVendorSpecialization,
    deleteVendorSpecialization, toggleVendorSpecializationStatus,
    frequentlyUsedItems, addFrequentlyUsedItem, updateFrequentlyUsedItem,
    deleteFrequentlyUsedItem, toggleFrequentlyUsedItemStatus
  } = useSettings()

  const [activeTab, setActiveTab] = useState('company')
  const [showXeroSettings, setShowXeroSettings] = useState(false)
  const [showClientTypeForm, setShowClientTypeForm] = useState(false)
  const [editingClientType, setEditingClientType] = useState<ClientTypeConfig | undefined>()
  const [showVendorSpecializationForm, setShowVendorSpecializationForm] = useState(false)
  const [editingVendorSpecialization, setEditingVendorSpecialization] = useState<VendorSpecializationConfig | undefined>()
  const [showFrequentlyUsedItemForm, setShowFrequentlyUsedItemForm] = useState(false)
  const [editingFrequentlyUsedItem, setEditingFrequentlyUsedItem] = useState<FrequentlyUsedItem | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Check if user is authenticated
  if (!user) {
    return null // This will redirect to login via middleware or layout
  }

  // Check if user can manage settings
  const canManageSettings = user.role === 'super_admin' || user.role === 'admin'

  if (!canManageSettings) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">You don't have permission to access system settings.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleCreateClientType = async (clientTypeData: Omit<ClientTypeConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      addClientType(clientTypeData)
      setShowClientTypeForm(false)
      setSuccessMessage('Client type created successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error creating client type:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateClientType = async (clientTypeData: Omit<ClientTypeConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingClientType) return
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateClientType(editingClientType.id, clientTypeData)
      setEditingClientType(undefined)
      setSuccessMessage('Client type updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating client type:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClientType = (clientType: ClientTypeConfig) => {
    if (clientType.isDefault) {
      alert('Default client types cannot be deleted.')
      return
    }

    if (confirm(`Are you sure you want to delete "${clientType.label}"? This action cannot be undone.`)) {
      const success = deleteClientType(clientType.id)
      if (success) {
        setSuccessMessage('Client type deleted successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    }
  }

  const handleToggleClientTypeStatus = (clientType: ClientTypeConfig) => {
    const action = clientType.isActive ? 'deactivate' : 'activate'
    if (confirm(`Are you sure you want to ${action} "${clientType.label}"?`)) {
      const success = toggleClientTypeStatus(clientType.id)
      if (success) {
        setSuccessMessage(`Client type ${action}d successfully!`)
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    }
  }

  // Vendor Specializations Handlers
  const handleCreateVendorSpecialization = async (specializationData: Omit<VendorSpecializationConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      addVendorSpecialization(specializationData)
      setShowVendorSpecializationForm(false)
      setSuccessMessage('Vendor specialization created successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error creating vendor specialization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateVendorSpecialization = async (specializationData: Omit<VendorSpecializationConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingVendorSpecialization) return
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateVendorSpecialization(editingVendorSpecialization.id, specializationData)
      setEditingVendorSpecialization(undefined)
      setSuccessMessage('Vendor specialization updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating vendor specialization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVendorSpecialization = (specialization: VendorSpecializationConfig) => {
    if (specialization.isDefault) {
      alert('Default vendor specializations cannot be deleted.')
      return
    }

    if (confirm(`Are you sure you want to delete "${specialization.label}"? This action cannot be undone.`)) {
      const success = deleteVendorSpecialization(specialization.id)
      if (success) {
        setSuccessMessage('Vendor specialization deleted successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    }
  }

  const handleToggleVendorSpecializationStatus = (specialization: VendorSpecializationConfig) => {
    const action = specialization.isActive ? 'deactivate' : 'activate'
    if (confirm(`Are you sure you want to ${action} "${specialization.label}"?`)) {
      const success = toggleVendorSpecializationStatus(specialization.id)
      if (success) {
        setSuccessMessage(`Vendor specialization ${action}d successfully!`)
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    }
  }

  // Frequently Used Items Handlers
  const handleCreateFrequentlyUsedItem = async (itemData: Omit<FrequentlyUsedItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      addFrequentlyUsedItem(itemData)
      setShowFrequentlyUsedItemForm(false)
      setSuccessMessage('Frequently used item created successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error creating frequently used item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateFrequentlyUsedItem = async (itemData: Omit<FrequentlyUsedItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingFrequentlyUsedItem) return
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateFrequentlyUsedItem(editingFrequentlyUsedItem.id, itemData)
      setEditingFrequentlyUsedItem(undefined)
      setSuccessMessage('Frequently used item updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating frequently used item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFrequentlyUsedItem = (item: FrequentlyUsedItem) => {
    if (item.isDefault) {
      alert('Default frequently used items cannot be deleted.')
      return
    }

    if (confirm(`Are you sure you want to delete "${item.description}"? This action cannot be undone.`)) {
      const success = deleteFrequentlyUsedItem(item.id)
      if (success) {
        setSuccessMessage('Frequently used item deleted successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    }
  }

  const handleToggleFrequentlyUsedItemStatus = (item: FrequentlyUsedItem) => {
    const action = item.isActive ? 'deactivate' : 'activate'
    if (confirm(`Are you sure you want to ${action} "${item.description}"?`)) {
      const success = toggleFrequentlyUsedItemStatus(item.id)
      if (success) {
        setSuccessMessage(`Frequently used item ${action}d successfully!`)
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    }
  }

  const handleSaveCompanyInfo = async (companyInfo: any) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateCompanyInfo(companyInfo)
      setSuccessMessage('Company information saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving company info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async (preferences: any) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateSystemPreferences(preferences)
      setSuccessMessage('System preferences saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportSettings = () => {
    try {
      const settingsData = exportSettings()
      const blob = new Blob([settingsData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ampere-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setSuccessMessage('Settings exported successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error exporting settings:', error)
      alert('Failed to export settings. Please try again.')
    }
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settingsData = e.target?.result as string
        const success = importSettings(settingsData)
        if (success) {
          setSuccessMessage('Settings imported successfully!')
          setTimeout(() => setSuccessMessage(''), 3000)
        } else {
          alert('Invalid settings file format. Please check the file and try again.')
        }
      } catch (error) {
        console.error('Error importing settings:', error)
        alert('Failed to import settings. Please check the file format.')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  if (!user || !settings) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Manage your system configuration and preferences</p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('company')}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === 'company'
                  ? "border-ampere-500 text-ampere-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Company Info
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === 'system'
                  ? "border-ampere-500 text-ampere-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              System Preferences
            </button>
            <button
              onClick={() => setActiveTab('xero')} // Add Xero tab
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === 'xero' // Add Xero tab
                  ? "border-ampere-500 text-ampere-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Xero Integration
            </button>
            <button
              onClick={() => setActiveTab('client-types')}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === 'client-types'
                  ? "border-ampere-500 text-ampere-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Client Types
            </button>
            <button
              onClick={() => setActiveTab('vendor-specializations')}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === 'vendor-specializations'
                  ? "border-ampere-500 text-ampere-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Vendor Specializations
            </button>
            <button
              onClick={() => setActiveTab('frequently-used-items')}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === 'frequently-used-items'
                  ? "border-ampere-500 text-ampere-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Frequently Used Items
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {/* Company Info Tab */}
          {activeTab === 'company' && (
            <CompanyInfoForm 
              companyInfo={settings.companyInfo} 
              onSave={handleSaveCompanyInfo} 
            />
          )}

          {/* System Preferences Tab */}
          {activeTab === 'system' && (
            <SystemPreferencesForm 
              preferences={settings.systemPreferences} 
              onSave={handleSavePreferences} 
            />
          )}

          {/* Xero Integration Tab */}
          {activeTab === 'xero' && (
            <XeroSettingsForm />
          )}

          {/* Client Types Tab */}
          {activeTab === 'client-types' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Client Types Management</h3>
                  <p className="text-gray-600">Manage client categories for better organization and reporting</p>
                </div>
                <button
                  onClick={() => setShowClientTypeForm(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Client Type</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientTypes.map(clientType => (
                  <div key={clientType.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{clientType.label}</h4>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            clientType.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          )}>
                            {clientType.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {clientType.isDefault && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{clientType.description}</p>
                        <p className="text-xs text-gray-500">Value: {clientType.value}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingClientType(clientType)}
                        className="text-ampere-600 hover:text-ampere-900 p-1 rounded-lg hover:bg-ampere-50"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleClientTypeStatus(clientType)}
                        className={cn(
                          "p-1 rounded-lg",
                          clientType.isActive
                            ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                            : "text-green-600 hover:text-green-900 hover:bg-green-50"
                        )}
                      >
                        {clientType.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                      {!clientType.isDefault && (
                        <button
                          onClick={() => handleDeleteClientType(clientType)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {clientTypes.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Client Types</h3>
                  <p className="text-gray-600 mb-4">Create client types to categorize your clients.</p>
                  <button onClick={() => setShowClientTypeForm(true)} className="btn-primary">
                    Add First Client Type
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Vendor Specializations Tab */}
          {activeTab === 'vendor-specializations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Vendor Specializations Management</h3>
                  <p className="text-gray-600">Manage vendor specialization categories for better vendor organization</p>
                </div>
                <button
                  onClick={() => setShowVendorSpecializationForm(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Specialization</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendorSpecializations.map(specialization => (
                  <div key={specialization.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{specialization.label}</h4>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            specialization.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          )}>
                            {specialization.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {specialization.isDefault && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{specialization.description}</p>
                        <p className="text-xs text-gray-500">Value: {specialization.value}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingVendorSpecialization(specialization)}
                        className="text-ampere-600 hover:text-ampere-900 p-1 rounded-lg hover:bg-ampere-50"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleVendorSpecializationStatus(specialization)}
                        className={cn(
                          "p-1 rounded-lg",
                          specialization.isActive
                            ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                            : "text-green-600 hover:text-green-900 hover:bg-green-50"
                        )}
                      >
                        {specialization.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                      {!specialization.isDefault && (
                        <button
                          onClick={() => handleDeleteVendorSpecialization(specialization)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {vendorSpecializations.length === 0 && (
                <div className="text-center py-12">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Vendor Specializations</h3>
                  <p className="text-gray-600 mb-4">Create vendor specializations to categorize vendor expertise.</p>
                  <button onClick={() => setShowVendorSpecializationForm(true)} className="btn-primary">
                    Add First Specialization
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Frequently Used Items Tab */}
          {activeTab === 'frequently-used-items' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Frequently Used Items Management</h3>
                  <p className="text-gray-600">Manage commonly used quotation items for faster quotation creation</p>
                </div>
                <button
                  onClick={() => setShowFrequentlyUsedItemForm(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {frequentlyUsedItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{item.description}</h4>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            item.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          )}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {item.isDefault && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                        <p className="text-xs text-gray-500">{item.unitPrice.toFixed(2)} SGD per {item.unit}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingFrequentlyUsedItem(item)}
                        className="text-ampere-600 hover:text-ampere-900 p-1 rounded-lg hover:bg-ampere-50"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleFrequentlyUsedItemStatus(item)}
                        className={cn(
                          "p-1 rounded-lg",
                          item.isActive
                            ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                            : "text-green-600 hover:text-green-900 hover:bg-green-50"
                        )}
                      >
                        {item.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                      {!item.isDefault && (
                        <button
                          onClick={() => handleDeleteFrequentlyUsedItem(item)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {frequentlyUsedItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Frequently Used Items</h3>
                  <p className="text-gray-600 mb-4">Create frequently used items to speed up quotation creation.</p>
                  <button onClick={() => setShowFrequentlyUsedItemForm(true)} className="btn-primary">
                    Add First Item
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Client Type Form Modal */}
      <ClientTypeForm
        isOpen={showClientTypeForm}
        onClose={() => setShowClientTypeForm(false)}
        onSave={handleCreateClientType}
        mode="add"
        isLoading={isLoading}
      />

      {/* Edit Client Type Form Modal */}
      <ClientTypeForm
        clientType={editingClientType}
        isOpen={!!editingClientType}
        onClose={() => setEditingClientType(undefined)}
        onSave={handleUpdateClientType}
        mode="edit"
        isLoading={isLoading}
      />

      {/* Add Vendor Specialization Form Modal */}
      <VendorSpecializationForm
        isOpen={showVendorSpecializationForm}
        onClose={() => setShowVendorSpecializationForm(false)}
        onSave={handleCreateVendorSpecialization}
        mode="add"
        isLoading={isLoading}
      />

      {/* Edit Vendor Specialization Form Modal */}
      <VendorSpecializationForm
        vendorSpecialization={editingVendorSpecialization}
        isOpen={!!editingVendorSpecialization}
        onClose={() => setEditingVendorSpecialization(undefined)}
        onSave={handleUpdateVendorSpecialization}
        mode="edit"
        isLoading={isLoading}
      />

      {/* Add Frequently Used Item Form Modal */}
      <FrequentlyUsedItemForm
        isOpen={showFrequentlyUsedItemForm}
        onClose={() => setShowFrequentlyUsedItemForm(false)}
        onSave={handleCreateFrequentlyUsedItem}
        mode="add"
        isLoading={isLoading}
      />

      {/* Edit Frequently Used Item Form Modal */}
      <FrequentlyUsedItemForm
        item={editingFrequentlyUsedItem}
        isOpen={!!editingFrequentlyUsedItem}
        onClose={() => setEditingFrequentlyUsedItem(undefined)}
        onSave={handleUpdateFrequentlyUsedItem}
        mode="edit"
        isLoading={isLoading}
      />
    </DashboardLayout>
  )
}