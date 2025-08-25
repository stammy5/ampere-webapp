'use client'

import { useState } from 'react'
import { Vendor, VendorCategory, VendorStatus } from '@/types'
import { cn } from '@/lib/utils'
import { getDistrictFromPostalCode, validateSingaporePostalCode } from '@/lib/postal-districts'
import { generateNextVendorCode } from '@/lib/vendor-code-generator'
import { useVendors } from '@/contexts/VendorContext'
import { useSettings } from '@/contexts/SettingsContext'
import { 
  Building2, X, Save, User, Mail, Phone, MapPin, Hash, Star, Award, Wrench
} from 'lucide-react'

interface VendorFormProps {
  vendor?: Vendor
  isOpen: boolean
  onClose: () => void
  onSave: (vendorData: Partial<Vendor>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

const VENDOR_CATEGORIES: { value: VendorCategory; label: string }[] = [
  { value: 'supplier', label: 'Supplier' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'specialist', label: 'Specialist' }
]

const VENDOR_STATUSES: { value: VendorStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blacklisted', label: 'Blacklisted' },
  { value: 'pending_approval', label: 'Pending Approval' }
]

const SINGAPORE_DISTRICTS = [
  'Ang Mo Kio', 'Bedok', 'Bishan', 'Boon Lay', 'Bukit Batok', 'Bukit Merah',
  'Bukit Panjang', 'Bukit Timah', 'Central Water Catchment', 'Changi',
  'Choa Chu Kang', 'Clementi', 'Downtown Core', 'Geylang', 'Hougang',
  'Jurong East', 'Jurong West', 'Kallang', 'Marine Parade', 'Museum',
  'Newton', 'Novena', 'Orchard', 'Pasir Ris', 'Punggol', 'Queenstown',
  'Sembawang', 'Sengkang', 'Serangoon', 'Tampines', 'Toa Payoh', 'Tuas',
  'Woodlands', 'Yishun'
]

export default function VendorForm({ vendor, isOpen, onClose, onSave, mode, isLoading = false }: VendorFormProps) {
  const { vendors } = useVendors()
  const { getActiveVendorSpecializations } = useSettings()
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    category: vendor?.category || 'supplier' as VendorCategory,
    contactPerson: vendor?.contactPerson || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    street: vendor?.address?.street || '',
    building: vendor?.address?.building || '',
    unit: vendor?.address?.unit || '',
    postalCode: vendor?.address?.postalCode || '',
    district: vendor?.address?.district || '',
    registrationNumber: vendor?.registrationNumber || '',
    gstNumber: vendor?.gstNumber || '',
    rating: vendor?.rating || 0,
    certifications: vendor?.certifications || [],
    specializations: vendor?.specializations || [],
    paymentTerms: vendor?.paymentTerms || 30,
    status: vendor?.status || 'active' as VendorStatus
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Get the next vendor code for preview when adding
  const nextVendorCode = mode === 'add' ? generateNextVendorCode(vendors) : null

  const handleInputChange = (field: string, value: string | number | string[]) => {
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
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required'

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

    // Rating validation
    if (formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 0 and 5'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const vendorData: Partial<Vendor> = {
      name: formData.name.trim(),
      category: formData.category,
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
      registrationNumber: formData.registrationNumber.trim(),
      gstNumber: formData.gstNumber.trim() || undefined,
      rating: formData.rating,
      certifications: formData.certifications,
      specializations: formData.specializations,
      paymentTerms: formData.paymentTerms,
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-ampere-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-ampere-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Add New Vendor' : 'Edit Vendor'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Create a new vendor record' : 'Update vendor information'}
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
              {/* Vendor Code Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Vendor Identification</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Hash className="h-5 w-5 text-ampere-600" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Vendor Code
                      </label>
                      {mode === 'edit' && vendor?.vendorCode ? (
                        <p className="text-lg font-mono font-semibold text-ampere-600 mt-1">
                          {vendor.vendorCode}
                        </p>
                      ) : (
                        <p className="text-lg font-mono font-semibold text-ampere-600 mt-1">
                          {nextVendorCode} <span className="text-sm text-gray-500 font-normal">(Auto-generated)</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {mode === 'edit' 
                          ? 'Vendor code cannot be modified after creation' 
                          : 'A unique vendor code will be automatically assigned'
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
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    >
                      {VENDOR_CATEGORIES.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
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
                      {VENDOR_STATUSES.map(status => (
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

              {/* Address Information - Similar pattern */}
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
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",
                        errors.registrationNumber ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Company registration number"
                    />
                    {errors.registrationNumber && <p className="mt-1 text-sm text-red-600">{errors.registrationNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating (0-5)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.rating}
                        onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                        className={cn(
                          "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",
                          errors.rating ? "border-red-300" : "border-gray-300"
                        )}
                        placeholder="0"
                        min="0"
                        max="5"
                        step="0.1"
                      />
                      <Star className="h-5 w-5 text-yellow-400" />
                    </div>
                    {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
                  </div>
                </div>
              </div>

              {/* Vendor Specializations */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Wrench className="h-4 w-4 mr-2 text-ampere-600" />
                  Vendor Specializations
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Specializations
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Choose the areas of expertise that this vendor specializes in.
                  </p>
                  
                  {(() => {
                    const availableSpecializations = getActiveVendorSpecializations()
                    
                    if (availableSpecializations.length === 0) {
                      return (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Wrench className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">No Specializations Available</p>
                              <p className="text-sm text-yellow-700 mt-1">
                                No vendor specializations have been configured. Contact your administrator to set up specializations in the system settings.
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableSpecializations.map((specialization) => {
                          const isSelected = formData.specializations.includes(specialization.value)
                          
                          return (
                            <label
                              key={specialization.id}
                              className={cn(
                                "flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors",
                                isSelected
                                  ? "border-ampere-200 bg-ampere-50"
                                  : "border-gray-200 hover:bg-gray-50"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const currentSpecializations = [...formData.specializations]
                                  if (e.target.checked) {
                                    if (!currentSpecializations.includes(specialization.value)) {
                                      currentSpecializations.push(specialization.value)
                                    }
                                  } else {
                                    const index = currentSpecializations.indexOf(specialization.value)
                                    if (index > -1) {
                                      currentSpecializations.splice(index, 1)
                                    }
                                  }
                                  handleInputChange('specializations', currentSpecializations)
                                }}
                                className="mt-1 h-4 w-4 text-ampere-600 focus:ring-ampere-500 border-gray-300 rounded"
                                disabled={isLoading}
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">{specialization.label}</span>
                                  <span className={cn(
                                    "px-2 py-1 text-xs font-medium rounded-full",
                                    isSelected 
                                      ? "bg-ampere-100 text-ampere-800" 
                                      : "bg-gray-100 text-gray-600"
                                  )}>
                                    {specialization.value.replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{specialization.description}</p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )
                  })()
                  }
                  
                  {formData.specializations.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Wrench className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">
                            Selected Specializations ({formData.specializations.length})
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.specializations.map((spec, index) => {
                              const specialization = getActiveVendorSpecializations().find(s => s.value === spec)
                              return (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                                >
                                  {specialization?.label || spec}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                    <span>{mode === 'add' ? 'Adding...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{mode === 'add' ? 'Add Vendor' : 'Save Changes'}</span>
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