'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { SystemSettings, ClientTypeConfig, VendorSpecializationConfig, FrequentlyUsedItem, CompanyInfo, SystemPreferences, EmailSettings, NotificationSettings, SecuritySettings } from '@/types'

interface SettingsContextType {
  settings: SystemSettings | null
  clientTypes: ClientTypeConfig[]
  getClientType: (id: string) => ClientTypeConfig | undefined
  getActiveClientTypes: () => ClientTypeConfig[]
  addClientType: (clientType: Omit<ClientTypeConfig, 'id' | 'createdAt' | 'updatedAt'>) => ClientTypeConfig
  updateClientType: (id: string, updates: Partial<ClientTypeConfig>) => boolean
  deleteClientType: (id: string) => boolean
  toggleClientTypeStatus: (id: string) => boolean
  vendorSpecializations: VendorSpecializationConfig[]
  getVendorSpecialization: (id: string) => VendorSpecializationConfig | undefined
  getActiveVendorSpecializations: () => VendorSpecializationConfig[]
  addVendorSpecialization: (specialization: Omit<VendorSpecializationConfig, 'id' | 'createdAt' | 'updatedAt'>) => VendorSpecializationConfig
  updateVendorSpecialization: (id: string, updates: Partial<VendorSpecializationConfig>) => boolean
  deleteVendorSpecialization: (id: string) => boolean
  toggleVendorSpecializationStatus: (id: string) => boolean
  frequentlyUsedItems: FrequentlyUsedItem[]
  getFrequentlyUsedItem: (id: string) => FrequentlyUsedItem | undefined
  getActiveFrequentlyUsedItems: () => FrequentlyUsedItem[]
  addFrequentlyUsedItem: (item: Omit<FrequentlyUsedItem, 'id' | 'createdAt' | 'updatedAt'>) => FrequentlyUsedItem
  updateFrequentlyUsedItem: (id: string, updates: Partial<FrequentlyUsedItem>) => boolean
  deleteFrequentlyUsedItem: (id: string) => boolean
  toggleFrequentlyUsedItemStatus: (id: string) => boolean
  updateCompanyInfo: (companyInfo: CompanyInfo) => boolean
  updateSystemPreferences: (preferences: SystemPreferences) => boolean
  updateEmailSettings: (emailSettings: EmailSettings) => boolean
  updateNotificationSettings: (notifications: NotificationSettings) => boolean
  updateSecuritySettings: (security: SecuritySettings) => boolean
  updateXeroSettings: (xeroSettings: Partial<XeroSettings>) => boolean // Add Xero settings update function
  refreshSettings: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Default settings data
const defaultClientTypes: ClientTypeConfig[] = [
  {
    id: '1',
    value: 'individual',
    label: 'Individual',
    description: 'Individual homeowners and private clients',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    value: 'corporate',
    label: 'Corporate',
    description: 'Business entities and corporations',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    value: 'government',
    label: 'Government',
    description: 'Government agencies and statutory boards',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    value: 'hdb',
    label: 'HDB',
    description: 'Housing Development Board',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    value: 'private_developer',
    label: 'Private Developer',
    description: 'Private property developers and real estate companies',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const defaultVendorSpecializations: VendorSpecializationConfig[] = [
  {
    id: '1',
    value: 'electrical_works',
    label: 'Electrical Works',
    description: 'Electrical installation, wiring, and maintenance services',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    value: 'plumbing_sanitary',
    label: 'Plumbing & Sanitary',
    description: 'Plumbing installation, pipe fitting, and sanitary works',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    value: 'aircon_mechanical',
    label: 'Air-conditioning & Mechanical',
    description: 'HVAC systems, air-conditioning, and mechanical ventilation',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    value: 'fire_protection',
    label: 'Fire Protection',
    description: 'Fire alarm systems, sprinkler systems, and fire safety equipment',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    value: 'security_systems',
    label: 'Security Systems',
    description: 'CCTV, access control, alarm systems, and security equipment',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    value: 'building_automation',
    label: 'Building Automation',
    description: 'BMS, smart building systems, and automation controls',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '7',
    value: 'renewable_energy',
    label: 'Renewable Energy',
    description: 'Solar panels, energy storage systems, and green technology',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '8',
    value: 'structural_works',
    label: 'Structural Works',
    description: 'Structural engineering, reinforcement, and construction',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const defaultFrequentlyUsedItems: FrequentlyUsedItem[] = [
  {
    id: '1',
    description: 'Site Supervision (Daily Rate)',
    unit: 'days',
    unitPrice: 350,
    category: 'Labour',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    description: 'Project Management (Monthly Rate)',
    unit: 'months',
    unitPrice: 8500,
    category: 'Labour',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    description: 'Concrete Works',
    unit: 'cubic meter',
    unitPrice: 180,
    category: 'Materials',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    description: 'Steel Reinforcement',
    unit: 'kg',
    unitPrice: 1.2,
    category: 'Materials',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    description: 'Scaffolding Rental',
    unit: 'sqm',
    unitPrice: 8.5,
    category: 'Equipment',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    description: 'Excavation Works',
    unit: 'cubic meter',
    unitPrice: 45,
    category: 'Labour',
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const defaultSettings: SystemSettings = {
  id: '1',
  companyInfo: {
    name: 'Ampere Engineering Pte Ltd',
    registrationNumber: '201234567X',
    gstNumber: '201234567X',
    address: {
      street: '123 Engineering Road',
      building: 'Tech Hub Building',
      unit: '#05-01',
      postalCode: '123456',
      district: 'Central'
    },
    phone: '+65 6123 4567',
    email: 'info@ampere.com.sg',
    website: 'www.ampere.com.sg'
  },
  clientTypes: defaultClientTypes,
  vendorSpecializations: defaultVendorSpecializations,
  frequentlyUsedItems: defaultFrequentlyUsedItems,
  systemPreferences: {
    defaultCurrency: 'SGD',
    defaultGSTRate: 7,
    defaultPaymentTerms: 30,
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Singapore',
    fiscalYearStart: '01-01',
    autoBackup: true,
    maintenanceMode: false
  },
  emailSettings: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'system@ampere.com.sg',
    smtpPassword: '',
    fromEmail: 'noreply@ampere.com.sg',
    fromName: 'Ampere Engineering System',
    isEnabled: false
  },
  notificationSettings: {
    emailNotifications: {
      newProjects: true,
      projectUpdates: true,
      invoiceGenerated: true,
      paymentReceived: true,
      quotationSent: true,
      tenderDeadlines: true
    },
    systemAlerts: {
      lowInventory: true,
      projectDelays: true,
      overdueInvoices: true,
      permitExpiry: true
    }
  },
  securitySettings: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      expiryDays: 90
    },
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    twoFactorAuth: false
  },
  updatedAt: new Date(),
  updatedBy: '1'
}

interface SettingsProviderProps {
  children: React.ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)

  // Initialize settings from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('ampere_settings')
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings)
        // Ensure dates are properly converted
        if (parsedSettings) {
          parsedSettings.updatedAt = new Date(parsedSettings.updatedAt)
          parsedSettings.clientTypes = parsedSettings.clientTypes.map((ct: any) => ({
            ...ct,
            createdAt: new Date(ct.createdAt),
            updatedAt: new Date(ct.updatedAt)
          }))
          // Handle vendor specializations with backward compatibility
          if (parsedSettings.vendorSpecializations) {
            parsedSettings.vendorSpecializations = parsedSettings.vendorSpecializations.map((vs: any) => ({
              ...vs,
              createdAt: new Date(vs.createdAt),
              updatedAt: new Date(vs.updatedAt)
            }))
          } else {
            parsedSettings.vendorSpecializations = defaultVendorSpecializations
          }
          setSettings(parsedSettings)
        }
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error)
      setSettings(defaultSettings)
    }
  }, [])

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving settings to localStorage:', error)
    }
  }, [settings])

  const clientTypes = settings?.clientTypes || defaultClientTypes

  // Vendor Specializations Management
  const vendorSpecializations = settings?.vendorSpecializations || defaultVendorSpecializations

  // Frequently Used Items Management
  const frequentlyUsedItems = settings?.frequentlyUsedItems || defaultFrequentlyUsedItems

  const getVendorSpecialization = (id: string): VendorSpecializationConfig | undefined => {
    return vendorSpecializations.find(vs => vs.id === id)
  }

  const getActiveVendorSpecializations = (): VendorSpecializationConfig[] => {
    return vendorSpecializations.filter(vs => vs.isActive)
  }

  const generateVendorSpecializationId = (): string => {
    const existingIds = vendorSpecializations.map(vs => parseInt(vs.id)).filter(id => !isNaN(id))
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0
    return (maxId + 1).toString()
  }

  const addVendorSpecialization = (specializationData: Omit<VendorSpecializationConfig, 'id' | 'createdAt' | 'updatedAt'>): VendorSpecializationConfig => {
    const newSpecialization: VendorSpecializationConfig = {
      ...specializationData,
      id: generateVendorSpecializationId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setSettings(prevSettings => ({
      ...prevSettings!,
      vendorSpecializations: [...prevSettings!.vendorSpecializations, newSpecialization],
      updatedAt: new Date()
    }))

    return newSpecialization
  }

  const updateVendorSpecialization = (id: string, updates: Partial<VendorSpecializationConfig>): boolean => {
    setSettings(prevSettings => {
      const specializationIndex = prevSettings!.vendorSpecializations.findIndex(vs => vs.id === id)
      if (specializationIndex === -1) return prevSettings!

      const updatedSpecializations = [...prevSettings!.vendorSpecializations]
      updatedSpecializations[specializationIndex] = {
        ...updatedSpecializations[specializationIndex],
        ...updates,
        id, // Ensure ID cannot be changed
        updatedAt: new Date()
      }

      return {
        ...prevSettings!,
        vendorSpecializations: updatedSpecializations,
        updatedAt: new Date()
      }
    })
    return true
  }

  const deleteVendorSpecialization = (id: string): boolean => {
    const specialization = getVendorSpecialization(id)
    if (specialization?.isDefault) {
      console.warn('Cannot delete default vendor specializations')
      return false
    }

    setSettings(prevSettings => ({
      ...prevSettings!,
      vendorSpecializations: prevSettings!.vendorSpecializations.filter(vs => vs.id !== id),
      updatedAt: new Date()
    }))
    return true
  }

  const toggleVendorSpecializationStatus = (id: string): boolean => {
    const specialization = getVendorSpecialization(id)
    if (!specialization) return false

    return updateVendorSpecialization(id, { isActive: !specialization.isActive })
  }

  const getFrequentlyUsedItem = (id: string): FrequentlyUsedItem | undefined => {
    return frequentlyUsedItems.find(item => item.id === id)
  }

  const getActiveFrequentlyUsedItems = (): FrequentlyUsedItem[] => {
    return frequentlyUsedItems.filter(item => item.isActive)
  }

  const generateFrequentlyUsedItemId = (): string => {
    const existingIds = frequentlyUsedItems.map(item => parseInt(item.id)).filter(id => !isNaN(id))
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0
    return (maxId + 1).toString()
  }

  const addFrequentlyUsedItem = (itemData: Omit<FrequentlyUsedItem, 'id' | 'createdAt' | 'updatedAt'>): FrequentlyUsedItem => {
    const newItem: FrequentlyUsedItem = {
      ...itemData,
      id: generateFrequentlyUsedItemId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setSettings(prevSettings => ({
      ...prevSettings!,
      frequentlyUsedItems: [...prevSettings!.frequentlyUsedItems, newItem],
      updatedAt: new Date()
    }))

    return newItem
  }

  const updateFrequentlyUsedItem = (id: string, updates: Partial<FrequentlyUsedItem>): boolean => {
    setSettings(prevSettings => {
      const itemIndex = prevSettings!.frequentlyUsedItems.findIndex(item => item.id === id)
      if (itemIndex === -1) return prevSettings!

      const updatedItems = [...prevSettings!.frequentlyUsedItems]
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        ...updates,
        id, // Ensure ID cannot be changed
        updatedAt: new Date()
      }

      return {
        ...prevSettings!,
        frequentlyUsedItems: updatedItems,
        updatedAt: new Date()
      }
    })
    return true
  }

  const deleteFrequentlyUsedItem = (id: string): boolean => {
    const item = getFrequentlyUsedItem(id)
    if (item?.isDefault) {
      console.warn('Cannot delete default frequently used items')
      return false
    }

    setSettings(prevSettings => ({
      ...prevSettings!,
      frequentlyUsedItems: prevSettings!.frequentlyUsedItems.filter(item => item.id !== id),
      updatedAt: new Date()
    }))
    return true
  }

  const toggleFrequentlyUsedItemStatus = (id: string): boolean => {
    const item = getFrequentlyUsedItem(id)
    if (!item) return false

    return updateFrequentlyUsedItem(id, { isActive: !item.isActive })
  }

  const getClientType = (id: string): ClientTypeConfig | undefined => {
    return clientTypes.find(ct => ct.id === id)
  }

  const getActiveClientTypes = (): ClientTypeConfig[] => {
    return clientTypes.filter(ct => ct.isActive)
  }

  const generateClientTypeId = (): string => {
    const existingIds = clientTypes.map(ct => parseInt(ct.id)).filter(id => !isNaN(id))
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0
    return (maxId + 1).toString()
  }

  const addClientType = (clientTypeData: Omit<ClientTypeConfig, 'id' | 'createdAt' | 'updatedAt'>): ClientTypeConfig => {
    const newClientType: ClientTypeConfig = {
      ...clientTypeData,
      id: generateClientTypeId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setSettings(prevSettings => ({
      ...prevSettings!,
      clientTypes: [...prevSettings!.clientTypes, newClientType],
      updatedAt: new Date()
    }))

    return newClientType
  }

  const updateClientType = (id: string, updates: Partial<ClientTypeConfig>): boolean => {
    setSettings(prevSettings => {
      const clientTypeIndex = prevSettings!.clientTypes.findIndex(ct => ct.id === id)
      if (clientTypeIndex === -1) return prevSettings!

      const updatedClientTypes = [...prevSettings!.clientTypes]
      updatedClientTypes[clientTypeIndex] = {
        ...updatedClientTypes[clientTypeIndex],
        ...updates,
        id, // Ensure ID cannot be changed
        updatedAt: new Date()
      }

      return {
        ...prevSettings!,
        clientTypes: updatedClientTypes,
        updatedAt: new Date()
      }
    })
    return true
  }

  const deleteClientType = (id: string): boolean => {
    const clientType = getClientType(id)
    if (clientType?.isDefault) {
      console.warn('Cannot delete default client types')
      return false
    }

    setSettings(prevSettings => ({
      ...prevSettings!,
      clientTypes: prevSettings!.clientTypes.filter(ct => ct.id !== id),
      updatedAt: new Date()
    }))
    return true
  }

  const toggleClientTypeStatus = (id: string): boolean => {
    const clientType = getClientType(id)
    if (!clientType) return false

    return updateClientType(id, { isActive: !clientType.isActive })
  }

  const updateCompanyInfo = (companyInfo: CompanyInfo): boolean => {
    if (!settings) return false
    
    const updatedSettings = {
      ...settings,
      companyInfo,
      updatedAt: new Date(),
      updatedBy: 'current_user_id' // This would be replaced with actual user ID
    }
    
    setSettings(updatedSettings)
    saveSettingsToStorage(updatedSettings)
    return true
  }

  const updateSystemPreferences = (preferences: SystemPreferences): boolean => {
    if (!settings) return false
    
    const updatedSettings = {
      ...settings,
      systemPreferences: preferences,
      updatedAt: new Date(),
      updatedBy: 'current_user_id' // This would be replaced with actual user ID
    }
    
    setSettings(updatedSettings)
    saveSettingsToStorage(updatedSettings)
    return true
  }

  const updateEmailSettings = (emailSettings: EmailSettings): boolean => {
    if (!settings) return false
    
    const updatedSettings = {
      ...settings,
      emailSettings,
      updatedAt: new Date(),
      updatedBy: 'current_user_id' // This would be replaced with actual user ID
    }
    
    setSettings(updatedSettings)
    saveSettingsToStorage(updatedSettings)
    return true
  }

  const updateNotificationSettings = (notifications: NotificationSettings): boolean => {
    if (!settings) return false
    
    const updatedSettings = {
      ...settings,
      notificationSettings: notifications,
      updatedAt: new Date(),
      updatedBy: 'current_user_id' // This would be replaced with actual user ID
    }
    
    setSettings(updatedSettings)
    saveSettingsToStorage(updatedSettings)
    return true
  }

  const updateSecuritySettings = (security: SecuritySettings): boolean => {
    if (!settings) return false
    
    const updatedSettings = {
      ...settings,
      securitySettings: security,
      updatedAt: new Date(),
      updatedBy: 'current_user_id' // This would be replaced with actual user ID
    }
    
    setSettings(updatedSettings)
    saveSettingsToStorage(updatedSettings)
    return true
  }

  // Add Xero settings update function
  const updateXeroSettings = (xeroSettings: Partial<XeroSettings>): boolean => {
    if (!settings) return false
    
    const updatedSettings = {
      ...settings,
      xeroSettings: {
        ...settings.xeroSettings,
        ...xeroSettings
      },
      updatedAt: new Date(),
      updatedBy: 'current_user_id' // This would be replaced with actual user ID
    }
    
    setSettings(updatedSettings)
    saveSettingsToStorage(updatedSettings)
    return true
  }

  const refreshSettings = () => {
    try {
      const storedSettings = localStorage.getItem('ampere_settings')
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
      } else {
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Error refreshing settings:', error)
      setSettings(defaultSettings)
    }
  }

  const exportSettings = (): string => {
    if (!settings) return ''
    return JSON.stringify(settings, null, 2)
  }

  const importSettings = (settingsJson: string): boolean => {
    try {
      const parsedSettings = JSON.parse(settingsJson)
      setSettings(parsedSettings)
      saveSettingsToStorage(parsedSettings)
      return true
    } catch (error) {
      console.error('Error importing settings:', error)
      return false
    }
  }

  const value: SettingsContextType = {
    settings,
    clientTypes,
    getClientType,
    getActiveClientTypes,
    addClientType,
    updateClientType,
    deleteClientType,
    toggleClientTypeStatus,
    vendorSpecializations,
    getVendorSpecialization,
    getActiveVendorSpecializations,
    addVendorSpecialization,
    updateVendorSpecialization,
    deleteVendorSpecialization,
    toggleVendorSpecializationStatus,
    frequentlyUsedItems,
    getFrequentlyUsedItem,
    getActiveFrequentlyUsedItems,
    addFrequentlyUsedItem,
    updateFrequentlyUsedItem,
    deleteFrequentlyUsedItem,
    toggleFrequentlyUsedItemStatus,
    updateCompanyInfo,
    updateSystemPreferences,
    updateEmailSettings,
    updateNotificationSettings,
    updateSecuritySettings,
    updateXeroSettings, // Add Xero settings update function to the context value
    refreshSettings,
    exportSettings,
    importSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}