'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useVendors } from '@/contexts/VendorContext'
import { useProjects } from '@/contexts/ProjectContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import VendorForm from '@/components/forms/VendorForm'
import { Vendor, VendorCategory, VendorStatus } from '@/types'
import { 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  Calendar,
  Users,
  Edit,
  Eye,
  MoreVertical,
  ChevronDown,
  CheckCircle,
  X,
  Trash2,
  Award,
  Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'

const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  supplier: 'Supplier',
  subcontractor: 'Subcontractor',
  consultant: 'Consultant',
  specialist: 'Specialist'
}

const VENDOR_STATUS_COLORS: Record<VendorStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  blacklisted: 'bg-red-100 text-red-800',
  pending_approval: 'bg-yellow-100 text-yellow-800'
}

export default function VendorsPage() {
  const { user } = useAuth()
  const { vendors, addVendor, updateVendor, deleteVendor } = useVendors()
  const { projects } = useProjects()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<VendorStatus | 'all'>('all')
  const [showVendorForm, setShowVendorForm] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | undefined>()

  // Calculate vendor statistics
  const vendorStats = useMemo(() => {
    const activeVendors = vendors.filter(v => v.status === 'active').length
    const averageRating = vendors.reduce((sum, vendor) => sum + vendor.rating, 0) / vendors.length || 0
    
    return {
      total: vendors.length,
      active: activeVendors,
      inactive: vendors.filter(v => v.status === 'inactive').length,
      averageRating: Math.round(averageRating * 10) / 10
    }
  }, [vendors])

  // Filter vendors based on search and filters
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.vendorCode.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || vendor.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [vendors, searchTerm, selectedCategory, selectedStatus])

  const getVendorProjects = (vendorId: string) => {
    return projects.filter(p => p.vendors?.some(v => v.vendorId === vendorId))
  }

  const handleAddVendor = () => {
    setEditingVendor(undefined)
    setShowVendorForm(true)
  }

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setShowVendorForm(true)
  }

  const handleSaveVendor = async (vendorData: Partial<Vendor>) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingVendor) {
        // Update existing vendor
        updateVendor(editingVendor.id, vendorData)
        setSuccessMessage('Vendor updated successfully!')
      } else {
        // Add new vendor
        const newVendor = addVendor(vendorData)
        setSuccessMessage('Vendor added successfully!')
      }
      
      setShowVendorForm(false)
      setEditingVendor(undefined)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error saving vendor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseForm = () => {
    setShowVendorForm(false)
    setEditingVendor(undefined)
  }

  const handleDeleteVendor = async (vendor: Vendor) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      deleteVendor(vendor.id)
      
      setSuccessMessage(`Vendor "${vendor.name}" deleted successfully!`)
      setShowDeleteConfirm(false)
      setVendorToDelete(undefined)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error deleting vendor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const showDeleteConfirmation = (vendor: Vendor) => {
    setVendorToDelete(vendor)
    setShowDeleteConfirm(true)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ))
  }

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
            <p className="text-gray-600">Manage your vendor relationships and contractor network</p>
          </div>
          
          {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'projects') && (
            <button 
              onClick={handleAddVendor}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Vendor</span>
            </button>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-600 hover:text-green-800 p-1 rounded-lg hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{vendorStats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                <p className="text-2xl font-bold text-green-600">{vendorStats.active}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Vendors</p>
                <p className="text-2xl font-bold text-gray-600">{vendorStats.inactive}</p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-ampere-600">{vendorStats.averageRating}</p>
                  <Star className="h-6 w-6 text-yellow-400 fill-current" />
                </div>
              </div>
              <Award className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search vendors by name, code, contact person, or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as VendorCategory | 'all')}
              >
                <option value="all">All Categories</option>
                {Object.entries(VENDOR_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as VendorStatus | 'all')}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blacklisted">Blacklisted</option>
                <option value="pending_approval">Pending Approval</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Vendor List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Vendors ({filteredVendors.length})
              </h2>
            </div>
          </div>

          <div className="overflow-hidden">
            {filteredVendors.map((vendor) => {
              const vendorProjects = getVendorProjects(vendor.id)
              
              return (
                <div key={vendor.id} className="relative">
                  {/* Clickable Card Area */}
                  <Link href={`/vendors/${vendor.id}`}>
                    <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-ampere-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-ampere-600" />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                                <span className="px-2 py-1 text-xs font-medium bg-ampere-100 text-ampere-800 rounded-full font-mono">
                                  {vendor.vendorCode}
                                </span>
                                <span className={cn(
                                  "px-2 py-1 text-xs font-medium rounded-full",
                                  VENDOR_STATUS_COLORS[vendor.status]
                                )}>
                                  {vendor.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {VENDOR_CATEGORY_LABELS[vendor.category]}
                                </span>
                              </div>
                              
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4" />
                                  <span>{vendor.contactPerson}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{vendor.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4" />
                                  <span>{vendor.phone}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{vendor.address.district}</span>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium text-gray-700">Rating:</span>
                                  <div className="flex items-center space-x-1">
                                    {renderStars(vendor.rating)}
                                    <span className="text-gray-600">({vendor.rating})</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium text-gray-700">Projects:</span>
                                  <span className="text-ampere-600">{vendorProjects.length}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium text-gray-700">Payment Terms:</span>
                                  <span>{vendor.paymentTerms} days</span>
                                </div>
                                {vendor.specializations.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Wrench className="h-4 w-4" />
                                    <span>{vendor.specializations.slice(0, 2).join(', ')}</span>
                                    {vendor.specializations.length > 2 && (
                                      <span className="text-gray-500">+{vendor.specializations.length - 2} more</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-6 right-6 flex items-center space-x-2">
                    {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'projects') && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEditVendor(vendor)
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 bg-white shadow-sm border"
                          title="Edit Vendor"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {(user.role === 'super_admin' || user.role === 'admin') && (
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              showDeleteConfirmation(vendor)
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 bg-white shadow-sm border"
                            title="Delete Vendor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                    
                    <div className="relative">
                      <button 
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 bg-white shadow-sm border"
                        title="More Options"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredVendors.length === 0 && (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or add a new vendor.</p>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Form Modal */}
      <VendorForm
        vendor={editingVendor}
        isOpen={showVendorForm}
        onClose={handleCloseForm}
        onSave={handleSaveVendor}
        mode={editingVendor ? 'edit' : 'add'}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && vendorToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Vendor</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete <strong>{vendorToDelete.name}</strong>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteVendor(vendorToDelete)}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setVendorToDelete(undefined)
                  }}
                  disabled={isLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}