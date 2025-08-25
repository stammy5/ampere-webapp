'use client'

import { useState } from 'react'
import { Client, ClientType, ClientStatus } from '@/types'
import { cn } from '@/lib/utils'
import { getDistrictFromPostalCode, validateSingaporePostalCode } from '@/lib/postal-districts'
import { generateNextClientCode } from '@/lib/client-code-generator'
import { useClients } from '@/contexts/ClientContext'
import { useSettings } from '@/contexts/SettingsContext'
import { 
  Building, 
  X, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  Clock,
  FileText,
  Hash
} from 'lucide-react'

interface ClientFormProps {
  client?: Client
  isOpen: boolean
  onClose: () => void
  onSave: (clientData: Partial<Client>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

const CLIENT_STATUSES: { value: ClientStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blacklisted', label: 'Blacklisted' }
]

const SINGAPORE_DISTRICTS = [
  'Ang Mo Kio', 'Bedok', 'Bishan', 'Boon Lay', 'Bukit Batok', 'Bukit Merah',
  'Bukit Panjang', 'Bukit Timah', 'Central Water Catchment', 'Changi',
  'Choa Chu Kang', 'Clementi', 'Downtown Core', 'Geylang', 'Hougang',
  'Jurong East', 'Jurong West', 'Kallang', 'Marine Parade', 'Museum',
  'Newton', 'North-Eastern Islands', 'Novena', 'Orchard', 'Outram',
  'Pasir Ris', 'Punggol', 'Queenstown', 'River Valley', 'Rochor',
  'Sembawang', 'Sengkang', 'Serangoon', 'Singapore River', 'Southern Islands',
  'Tampines', 'Tanglin', 'Toa Payoh', 'Tuas', 'Western Islands', 'Western Water Catchment',
  'Woodlands', 'Yishun'
]

export default function ClientForm({ client, isOpen, onClose, onSave, mode, isLoading = false }: ClientFormProps) {
  const { clients } = useClients()
  const { getActiveClientTypes } = useSettings()
  
  // Get dynamic client types from settings
  const clientTypes = getActiveClientTypes()
  const [formData, setFormData] = useState({
    name: client?.name || '',
    type: client?.type || 'corporate' as ClientType,
    contactPerson: client?.contactPerson || '',
    email: client?.email || '',
    phone: client?.phone || '',
    street: client?.address?.street || '',
    building: client?.address?.building || '',
    unit: client?.address?.unit || '',
    postalCode: client?.address?.postalCode || '',
    district: client?.address?.district || '',
    registrationNumber: client?.registrationNumber || '',
    gstNumber: client?.gstNumber || '',
    creditLimit: client?.creditLimit || 0,
    paymentTerms: client?.paymentTerms || 30,
    status: client?.status || 'active' as ClientStatus,
    notes: client?.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Get the next client code for preview when adding
  const nextClientCode = mode === 'add' ? generateNextClientCode(clients) : null

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-select district when postal code changes
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

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Company name is required'
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.street.trim()) newErrors.street = 'Street address is required'
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required'
    if (!formData.district.trim()) newErrors.district = 'District is required'

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation (Singapore format)
    if (formData.phone && !/^(\+65\s?)?\d{4}\s?\d{4}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Singapore phone number'
    }

    // Postal code validation (Singapore format)
    if (formData.postalCode && !validateSingaporePostalCode(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid 6-digit postal code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const clientData: Partial<Client> = {
      name: formData.name.trim(),
      type: formData.type,
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: {
        street: formData.street.trim(),
        building: formData.building.trim() || undefined,
        unit: formData.unit.trim() || undefined,
        postalCode: formData.postalCode.trim(),
        district: formData.district
      },
      registrationNumber: formData.registrationNumber.trim() || undefined,
      gstNumber: formData.gstNumber.trim() || undefined,
      creditLimit: formData.creditLimit > 0 ? formData.creditLimit : undefined,
      paymentTerms: formData.paymentTerms,
      status: formData.status,
      notes: formData.notes.trim() || undefined
    }

    await onSave(clientData)
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
                  <Building className="h-5 w-5 text-ampere-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Add New Client' : 'Edit Client'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Create a new client record' : 'Update client information'}
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
              {/* Client Code Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Client Identification</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Hash className="h-5 w-5 text-ampere-600" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Client Code
                      </label>
                      {mode === 'edit' && client?.clientCode ? (
                        <p className="text-lg font-mono font-semibold text-ampere-600 mt-1">
                          {client.clientCode}
                        </p>
                      ) : (
                        <p className="text-lg font-mono font-semibold text-ampere-600 mt-1">
                          {nextClientCode} <span className="text-sm text-gray-500 font-normal">(Auto-generated)</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {mode === 'edit' 
                          ? 'Client code cannot be modified after creation' 
                          : 'A unique client code will be automatically assigned'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",
                        errors.name ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter company name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    >
                      {clientTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",
                        errors.contactPerson ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter contact person name"
                    />
                    {errors.contactPerson && <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    >
                      {CLIENT_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",
                        errors.email ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter email address"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",
                        errors.phone ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="+65 1234 5678"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",
                        errors.street ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter street address"
                    />
                    {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Building Name
                    </label>
                    <input
                      type="text"
                      value={formData.building}
                      onChange={(e) => handleInputChange('building', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                      placeholder="Enter building name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Number
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                      placeholder="#12-34"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",
                        errors.postalCode ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="123456"
                      maxLength={6}
                    />
                    {formData.postalCode && getDistrictFromPostalCode(formData.postalCode) && (
                      <p className="mt-1 text-xs text-green-600">
                        📍 Auto-selected: {getDistrictFromPostalCode(formData.postalCode)}
                      </p>
                    )}
                    {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District *
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",
                        errors.district ? "border-red-300" : "border-gray-300"
                      )}
                    >
                      <option value="">Select District</option>
                      {SINGAPORE_DISTRICTS.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Business Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                      placeholder="Company registration number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                      placeholder="GST registration number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credit Limit (SGD)
                    </label>
                    <input
                      type="number"
                      value={formData.creditLimit}
                      onChange={(e) => handleInputChange('creditLimit', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Terms (Days) *
                    </label>
                    <input
                      type="number"
                      value={formData.paymentTerms}
                      onChange={(e) => handleInputChange('paymentTerms', parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                      placeholder="30"
                      min="1"
                      max="365"
                    />
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                  placeholder="Additional notes about this client..."
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
                    <span>{mode === 'add' ? 'Add Client' : 'Save Changes'}</span>
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