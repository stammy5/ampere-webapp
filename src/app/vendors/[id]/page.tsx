'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useVendors } from '@/contexts/VendorContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useQuotations } from '@/contexts/QuotationContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import VendorForm from '@/components/forms/VendorForm'
import { Vendor } from '@/types'
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Calendar, 
  FileText,
  TrendingUp,
  Edit,
  ArrowLeft,
  Users,
  Award,
  Clock,
  Activity,
  CheckCircle,
  X,
  Wrench
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate, getProjectStatusColor, cn } from '@/lib/utils'

export default function VendorDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { getVendor, updateVendor } = useVendors()
  const { projects } = useProjects()
  const { quotations } = useQuotations()
  const vendorId = params.id as string
  
  const vendor = getVendor(vendorId)
  const vendorProjects = projects.filter(p => p.vendors?.some(v => v.vendorId === vendorId))
  const vendorQuotations = quotations.filter(q => q.preparedBy === vendorId)
  
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'quotations' | 'documents'>('overview')
  const [showEditForm, setShowEditForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [currentVendor, setCurrentVendor] = useState(vendor)

  // Update local vendor state when context vendor changes
  useEffect(() => {
    const updatedVendor = getVendor(vendorId)
    setCurrentVendor(updatedVendor)
  }, [vendorId, getVendor])

  const handleEditVendor = () => {
    setShowEditForm(true)
  }

  const handleSaveVendor = async (vendorData: Partial<Vendor>) => {
    if (!currentVendor) return
    
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update vendor using context
      updateVendor(currentVendor.id, vendorData)
      
      // Refresh local vendor data
      const updatedVendor = getVendor(vendorId)
      setCurrentVendor(updatedVendor)
      
      setSuccessMessage('Vendor updated successfully!')
      setShowEditForm(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error updating vendor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseForm = () => {
    setShowEditForm(false)
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

  if (!user) {
    return <div>Loading...</div>
  }

  if (!currentVendor) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Vendor not found</h2>
          <p className="text-gray-600 mt-2">The vendor you're looking for doesn't exist.</p>
          <Link href="/vendors" className="btn-primary mt-4">
            Back to Vendors
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const totalProjectValue = vendorProjects.reduce((sum, project) => sum + project.contractValue, 0)
  const completedProjects = vendorProjects.filter(p => p.status === 'completed').length
  const activeProjects = vendorProjects.filter(p => p.status === 'in_progress').length

  const VENDOR_CATEGORY_LABELS = {
    supplier: 'Supplier',
    subcontractor: 'Subcontractor',
    consultant: 'Consultant',
    specialist: 'Specialist'
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/vendors"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">{currentVendor.name}</h1>
                <span className="px-3 py-1 text-sm font-medium bg-ampere-100 text-ampere-800 rounded-lg font-mono">
                  {currentVendor.vendorCode}
                </span>
              </div>
              <p className="text-gray-600">Vendor Details & Project Portfolio</p>
            </div>
          </div>
          
          {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'projects') && (
            <button 
              onClick={handleEditVendor}
              className="btn-primary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Vendor</span>
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

        {/* Vendor Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-ampere-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-ampere-600" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h2 className="text-xl font-semibold text-gray-900">{currentVendor.name}</h2>
                  <span className="px-3 py-1 text-sm font-medium bg-ampere-100 text-ampere-800 rounded-lg font-mono font-semibold">
                    {currentVendor.vendorCode}
                  </span>
                  <span className={cn(
                    "px-3 py-1 text-sm font-medium rounded-full",
                    currentVendor.status === 'active' ? 'bg-green-100 text-green-800' :
                    currentVendor.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    currentVendor.status === 'blacklisted' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  )}>
                    {currentVendor.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {VENDOR_CATEGORY_LABELS[currentVendor.category]}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{currentVendor.contactPerson}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${currentVendor.email}`} className="text-ampere-600 hover:underline">
                      {currentVendor.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${currentVendor.phone}`} className="text-ampere-600 hover:underline">
                      {currentVendor.phone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{currentVendor.address.street}, {currentVendor.address.district} {currentVendor.address.postalCode}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>Reg: {currentVendor.registrationNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Payment: {currentVendor.paymentTerms} days</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="mt-4 flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Rating:</span>
                  <div className="flex items-center space-x-1">
                    {renderStars(currentVendor.rating)}
                    <span className="text-sm text-gray-600 ml-2">({currentVendor.rating}/5)</span>
                  </div>
                </div>

                {/* Certifications */}
                {currentVendor.certifications.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-700">Certifications:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {currentVendor.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specializations */}
                {currentVendor.specializations.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-700">Specializations:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {currentVendor.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                        >
                          <Wrench className="h-3 w-3 mr-1" />
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{vendorProjects.length}</p>
              </div>
              <Activity className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-green-600">{activeProjects}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{completedProjects}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-ampere-600">{formatCurrency(totalProjectValue)}</p>
              </div>
              <Star className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'projects', label: `Projects (${vendorProjects.length})`, icon: Building2 },
                { id: 'quotations', label: `Quotations (${vendorQuotations.length})`, icon: FileText },
                { id: 'documents', label: 'Documents', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                      activeTab === tab.id 
                        ? "border-ampere-500 text-ampere-600" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Projects */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
                    <div className="space-y-3">
                      {vendorProjects.slice(0, 3).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <p className="text-sm text-gray-600">{formatCurrency(project.contractValue)}</p>
                          </div>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            getProjectStatusColor(project.status)
                          )}>
                            {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Business Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Payment Terms</span>
                        <span className="font-medium">{currentVendor.paymentTerms} days</span>
                      </div>
                      {currentVendor.gstNumber && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">GST Number</span>
                          <span className="font-medium">{currentVendor.gstNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center space-x-1">
                          {renderStars(currentVendor.rating)}
                          <span className="font-medium ml-2">({currentVendor.rating})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                {vendorProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            getProjectStatusColor(project.status)
                          )}>
                            {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                        <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                          <span><strong>Value:</strong> {formatCurrency(project.contractValue)}</span>
                          <span><strong>Start:</strong> {formatDate(project.startDate)}</span>
                          <span><strong>End:</strong> {formatDate(project.expectedEndDate)}</span>
                        </div>
                      </div>
                      <Link 
                        href={`/projects/${project.id}`}
                        className="btn-secondary"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
                
                {vendorProjects.length === 0 && (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600">This vendor doesn't have any projects assigned.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quotations' && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations yet</h3>
                <p className="text-gray-600">No quotations have been prepared by this vendor.</p>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Documents</h3>
                <p className="text-gray-600">Document management feature coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Edit Form Modal */}
      <VendorForm
        vendor={currentVendor}
        isOpen={showEditForm}
        onClose={handleCloseForm}
        onSave={handleSaveVendor}
        mode="edit"
        isLoading={isLoading}
      />
    </DashboardLayout>
  )
}