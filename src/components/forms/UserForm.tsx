'use client'

import { useState, useEffect } from 'react'
import { User, UserRole } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { 
  UserCheck, X, Save, AlertCircle, Shield, Mail, User as UserIcon, 
  Calendar, Activity, Eye, EyeOff
} from 'lucide-react'

interface UserFormProps {
  user?: User
  isOpen: boolean
  onClose: () => void
  onSave: (userData: Partial<User>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

const USER_ROLES: { value: UserRole; label: string; description: string; color: string }[] = [
  { 
    value: 'super_admin', 
    label: 'Super Admin', 
    description: 'Full system access including user management',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  { 
    value: 'admin', 
    label: 'Admin', 
    description: 'Administrative access to most system functions',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  { 
    value: 'finance', 
    label: 'Finance', 
    description: 'Access to financial data, invoicing, and payments',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    value: 'projects', 
    label: 'Projects', 
    description: 'Access to project management and vendor coordination',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  { 
    value: 'sales', 
    label: 'Sales', 
    description: 'Access to clients, tenders, and quotations',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  }
]

export default function UserForm({ 
  user, 
  isOpen, 
  onClose, 
  onSave, 
  mode, 
  isLoading = false 
}: UserFormProps) {
  const { user: currentUser } = useAuth()
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'sales' as UserRole,
    isActive: user?.isActive !== undefined ? user.isActive : true,
    avatar: user?.avatar || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showRoleHelper, setShowRoleHelper] = useState(false)

  // Reset form when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatar: user.avatar || ''
      })
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'sales',
        isActive: true,
        avatar: ''
      })
    }
    setErrors({})
  }, [user, isOpen])

  const handleInputChange = (field: string, value: string | boolean | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      } else if (!formData.email.endsWith('@ampere.com.sg')) {
        newErrors.email = 'Email must be from @ampere.com.sg domain'
      }
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required'
    }

    // Role-specific restrictions
    if (currentUser?.role !== 'super_admin' && formData.role === 'super_admin') {
      newErrors.role = 'Only Super Admins can create Super Admin users'
    }

    if (currentUser?.role === 'admin' && (formData.role === 'super_admin' || formData.role === 'admin')) {
      newErrors.role = 'Admins cannot create Admin or Super Admin users'
    }

    // Prevent editing super admin users by non-super admins
    if (mode === 'edit' && user?.role === 'super_admin' && currentUser?.role !== 'super_admin') {
      newErrors.role = 'Only Super Admins can edit Super Admin users'
    }

    // Prevent deactivating super admin users
    if (mode === 'edit' && user?.role === 'super_admin' && !formData.isActive) {
      newErrors.isActive = 'Super Admin users cannot be deactivated'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const userData: Partial<User> = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      isActive: formData.isActive,
      avatar: formData.avatar.trim() || undefined
    }

    await onSave(userData)
  }

  const canEditRole = () => {
    if (mode === 'add') {
      return currentUser?.role === 'super_admin' || currentUser?.role === 'admin'
    }
    
    // Editing existing user
    if (!user) return false
    
    // Super admins can edit anyone
    if (currentUser?.role === 'super_admin') return true
    
    // Admins can edit non-admin users
    if (currentUser?.role === 'admin' && user.role !== 'super_admin' && user.role !== 'admin') {
      return true
    }
    
    return false
  }

  const getAvailableRoles = (): typeof USER_ROLES => {
    if (currentUser?.role === 'super_admin') {
      return USER_ROLES
    }
    
    if (currentUser?.role === 'admin') {
      return USER_ROLES.filter(role => role.value !== 'super_admin' && role.value !== 'admin')
    }
    
    return USER_ROLES.filter(role => role.value === 'sales')
  }

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
                <div className="w-10 h-10 bg-ampere-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-ampere-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Add New User' : 'Edit User'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' 
                      ? 'Create a new user account for Ampere Engineering' 
                      : 'Update user information and permissions'
                    }
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
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 text-ampere-600" />
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.name ? "border-red-300" : "border-gray-300")}
                      placeholder="Enter full name"
                      disabled={isLoading}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.email ? "border-red-300" : "border-gray-300")}
                      placeholder="user@ampere.com.sg"
                      disabled={isLoading}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL (optional)</label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => handleInputChange('avatar', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    placeholder="https://example.com/avatar.jpg"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Role & Permissions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-ampere-600" />
                    Role & Permissions
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowRoleHelper(!showRoleHelper)}
                    className="text-sm text-ampere-600 hover:text-ampere-700 flex items-center"
                  >
                    {showRoleHelper ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                    {showRoleHelper ? 'Hide' : 'Show'} Role Details
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Role *</label>
                  <div className="space-y-2">
                    {getAvailableRoles().map((roleOption) => (
                      <label key={roleOption.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value={roleOption.value}
                          checked={formData.role === roleOption.value}
                          onChange={(e) => handleInputChange('role', e.target.value as UserRole)}
                          className="mt-1 h-4 w-4 text-ampere-600 focus:ring-ampere-500 border-gray-300"
                          disabled={!canEditRole() || isLoading}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{roleOption.label}</span>
                            <span className={cn("px-2 py-1 text-xs font-medium rounded-full border", roleOption.color)}>
                              {roleOption.value.replace('_', ' ')}
                            </span>
                          </div>
                          {showRoleHelper && (
                            <p className="text-sm text-gray-600">{roleOption.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-ampere-600" />
                  Account Status
                </h4>
                
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="h-4 w-4 text-ampere-600 focus:ring-ampere-500 border-gray-300 rounded"
                      disabled={user?.role === 'super_admin' || isLoading}
                    />
                    <span className="text-sm font-medium text-gray-900">Active Account</span>
                  </label>
                  <div className={cn("px-2 py-1 text-xs font-medium rounded-full", 
                    formData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  )}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                {errors.isActive && <p className="mt-1 text-sm text-red-600">{errors.isActive}</p>}
                
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Account Status Information:</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Active users can log in and access the system</li>
                        <li>• Inactive users are blocked from logging in</li>
                        <li>• Super Admin accounts cannot be deactivated</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creation Info (Edit mode only) */}
              {mode === 'edit' && user && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Login:</span>
                      <p className="font-medium">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                    <span>{mode === 'add' ? 'Create User' : 'Save Changes'}</span>
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