'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/contexts/ClientContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useQuotations } from '@/contexts/QuotationContext'
import { useSettings } from '@/contexts/SettingsContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ClientForm from '@/components/forms/ClientForm'
import { Client, ClientTypeConfig } from '@/types'
import { 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText,
  TrendingUp,
  Edit,
  ArrowLeft,
  Users,
  CreditCard,
  Clock,
  Activity,
  CheckCircle,
  X
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate, getProjectStatusColor, cn } from '@/lib/utils'
import { getDistrictFromPostalCode } from '@/lib/postal-districts'

export default function ClientDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { getClient, updateClient } = useClients()
  const { projects } = useProjects()
  const { quotations } = useQuotations()
  const { getActiveClientTypes } = useSettings()
  const clientId = params.id as string
  
  // Get dynamic client types from settings
  const clientTypes = getActiveClientTypes()
  const clientTypeLabels = clientTypes.reduce((acc: Record<string, string>, type: ClientTypeConfig) => {
    acc[type.value] = type.label
    return acc
  }, {} as Record<string, string>)
  
  const client = getClient(clientId)
  const clientProjects = projects.filter(p => p.clientId === clientId)
  const clientQuotations = quotations.filter(q => q.clientId === clientId)
  
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'quotations' | 'documents'>('overview')
  const [showEditForm, setShowEditForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [currentClient, setCurrentClient] = useState(client)

  // Update local client state when context client changes
  useEffect(() => {
    const updatedClient = getClient(clientId)
    setCurrentClient(updatedClient)
  }, [clientId, getClient])

  const handleEditClient = () => {
    setShowEditForm(true)
  }

  const handleSaveClient = async (clientData: Partial<Client>) => {
    if (!currentClient) return
    
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update client using context
      updateClient(currentClient.id, clientData)
      
      // Refresh local client data
      const updatedClient = getClient(clientId)
      setCurrentClient(updatedClient)
      
      setSuccessMessage('Client updated successfully!')
      setShowEditForm(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error updating client:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseForm = () => {
    setShowEditForm(false)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  if (!currentClient) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Client not found</h2>
          <p className="text-gray-600 mt-2">The client you're looking for doesn't exist.</p>
          <Link href="/clients" className="btn-primary mt-4">
            Back to Clients
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const totalProjectValue = clientProjects.reduce((sum, project) => sum + project.contractValue, 0)
  const completedProjects = clientProjects.filter(p => p.status === 'completed').length
  const activeProjects = clientProjects.filter(p => p.status === 'in_progress').length

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/clients"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">{currentClient.name}</h1>
                <span className="px-3 py-1 text-sm font-medium bg-ampere-100 text-ampere-800 rounded-lg font-mono">
                  {currentClient.clientCode}
                </span>
              </div>
              <p className="text-gray-600">Client Details & Project Portfolio</p>
            </div>
          </div>
          
          {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'sales') && (
            <button 
              onClick={handleEditClient}
              className="btn-primary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Client</span>
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

        {/* Client Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-ampere-100 rounded-lg flex items-center justify-center">
                <Building className="h-8 w-8 text-ampere-600" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h2 className="text-xl font-semibold text-gray-900">{currentClient.name}</h2>
                  <span className="px-3 py-1 text-sm font-medium bg-ampere-100 text-ampere-800 rounded-lg font-mono font-semibold">
                    {currentClient.clientCode}
                  </span>
                  <span className={cn(
                    "px-3 py-1 text-sm font-medium rounded-full",
                    currentClient.status === 'active' ? 'bg-green-100 text-green-800' :
                    currentClient.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  )}>
                    {currentClient.status.charAt(0).toUpperCase() + currentClient.status.slice(1)}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {clientTypeLabels[currentClient.type] || currentClient.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{currentClient.contactPerson}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${currentClient.email}`} className="text-ampere-600 hover:underline">
                      {currentClient.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${currentClient.phone}`} className="text-ampere-600 hover:underline">
                      {currentClient.phone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{currentClient.address.street}, {currentClient.address.district} {currentClient.address.postalCode}</span>
                  </div>
                  {currentClient.registrationNumber && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>Reg: {currentClient.registrationNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Payment: {currentClient.paymentTerms} days</span>
                  </div>
                </div>

                {currentClient.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Notes:</strong> {currentClient.notes}
                    </p>
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
                <p className="text-2xl font-bold text-gray-900">{clientProjects.length}</p>
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
              <DollarSign className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'projects', label: `Projects (${clientProjects.length})`, icon: Building },
                { id: 'quotations', label: `Quotations (${clientQuotations.length})`, icon: FileText },
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
                      {clientProjects.slice(0, 3).map((project) => (
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

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Payment Terms</span>
                        <span className="font-medium">{currentClient.paymentTerms} days</span>
                      </div>
                      {currentClient.creditLimit && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Credit Limit</span>
                          <span className="font-medium">{formatCurrency(currentClient.creditLimit)}</span>
                        </div>
                      )}
                      {currentClient.gstNumber && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">GST Number</span>
                          <span className="font-medium">{currentClient.gstNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                {clientProjects.map((project) => (
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
                
                {clientProjects.length === 0 && (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600">This client doesn't have any projects assigned.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quotations' && (
              <div className="space-y-4">
                {clientQuotations.map((quotation) => (
                  <div key={quotation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-semibold text-gray-900">{quotation.title}</h4>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            quotation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            quotation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            quotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          )}>
                            {quotation.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{quotation.description}</p>
                        <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                          <span><strong>Amount:</strong> {formatCurrency(quotation.totalAmount)}</span>
                          <span><strong>Valid Until:</strong> {formatDate(quotation.validUntil)}</span>
                          {quotation.sentDate && (
                            <span><strong>Sent:</strong> {formatDate(quotation.sentDate)}</span>
                          )}
                        </div>
                      </div>
                      <Link 
                        href={`/quotations/${quotation.id}`}
                        className="btn-secondary"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
                
                {clientQuotations.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations yet</h3>
                    <p className="text-gray-600">No quotations have been sent to this client.</p>
                  </div>
                )}
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

      {/* Client Edit Form Modal */}
      <ClientForm
        client={currentClient}
        isOpen={showEditForm}
        onClose={handleCloseForm}
        onSave={handleSaveClient}
        mode="edit"
        isLoading={isLoading}
      />
    </DashboardLayout>
  )
}