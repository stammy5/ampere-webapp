'use client'

import { useState, useEffect } from 'react'
import { CompanyInfo, Address } from '@/types'
import { cn } from '@/lib/utils'
import { Building, Globe, Mail, Phone, MapPin, Save, AlertCircle } from 'lucide-react'

interface CompanyInfoFormProps {
  companyInfo: CompanyInfo
  onSave: (companyInfo: CompanyInfo) => Promise<void>
  isLoading?: boolean
}

export default function CompanyInfoForm({
  companyInfo,
  onSave,
  isLoading = false
}: CompanyInfoFormProps) {
  const [formData, setFormData] = useState<CompanyInfo>(companyInfo)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when companyInfo prop changes
  useEffect(() => {
    setFormData(companyInfo)
    setErrors({})
  }, [companyInfo])

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Company name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required'
    }

    // Registration number validation
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Company email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    // Address validation
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required'
    }

    if (!formData.address.postalCode.trim()) {
      newErrors['address.postalCode'] = 'Postal code is required'
    } else if (!/^\d{6}$/.test(formData.address.postalCode)) {
      newErrors['address.postalCode'] = 'Please enter a valid 6-digit Singapore postal code'
    }

    if (!formData.address.district.trim()) {
      newErrors['address.district'] = 'District is required'
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
      {/* Company Details */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="h-4 w-4 mr-2 text-ampere-600" />
          Company Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.name ? "border-red-300" : "border-gray-300")}
              placeholder="Enter company name"
              disabled={isLoading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.registrationNumber ? "border-red-300" : "border-gray-300")}
              placeholder="e.g., 201234567X"
              disabled={isLoading}
            />
            {errors.registrationNumber && <p className="mt-1 text-sm text-red-600">{errors.registrationNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
            <input
              type="text"
              value={formData.gstNumber || ''}
              onChange={(e) => handleInputChange('gstNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
              placeholder="e.g., 201234567X"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <Phone className="h-4 w-4 mr-2 text-ampere-600" />
          Contact Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.email ? "border-red-300" : "border-gray-300")}
              placeholder="info@company.com.sg"
              disabled={isLoading}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.phone ? "border-red-300" : "border-gray-300")}
              placeholder="+65 6123 4567"
              disabled={isLoading}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={formData.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
              placeholder="https://www.company.com.sg"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-ampere-600" />
          Address Information
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors['address.street'] ? "border-red-300" : "border-gray-300")}
              placeholder="Enter street address"
              disabled={isLoading}
            />
            {errors['address.street'] && <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
              <input
                type="text"
                value={formData.address.building || ''}
                onChange={(e) => handleInputChange('address.building', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                placeholder="Building name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
              <input
                type="text"
                value={formData.address.unit || ''}
                onChange={(e) => handleInputChange('address.unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                placeholder="#01-01"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
              <input
                type="text"
                value={formData.address.postalCode}
                onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors['address.postalCode'] ? "border-red-300" : "border-gray-300")}
                placeholder="123456"
                maxLength={6}
                disabled={isLoading}
              />
              {errors['address.postalCode'] && <p className="mt-1 text-sm text-red-600">{errors['address.postalCode']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
              <input
                type="text"
                value={formData.address.district}
                onChange={(e) => handleInputChange('address.district', e.target.value)}
                className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors['address.district'] ? "border-red-300" : "border-gray-300")}
                placeholder="Central"
                disabled={isLoading}
              />
              {errors['address.district'] && <p className="mt-1 text-sm text-red-600">{errors['address.district']}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="h-4 w-4 mr-2 text-ampere-600" />
          Branding
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo URL</label>
          <input
            type="url"
            value={formData.logo || ''}
            onChange={(e) => handleInputChange('logo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
            placeholder="https://example.com/logo.png"
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-600">URL to your company logo image</p>
        </div>
      </div>

      {/* Information Note */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Company Information Usage:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• This information appears on invoices, quotations, and reports</li>
              <li>• Registration and GST numbers are used for official documentation</li>
              <li>• Contact details are used for system communications</li>
              <li>• Address information is used for correspondence and legal documents</li>
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
              <span>Save Company Information</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}