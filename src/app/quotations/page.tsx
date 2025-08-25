'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/contexts/ClientContext'
import { useQuotations } from '@/contexts/QuotationContext'
import { printQuotation } from '@/lib/pdf-generator'
import DashboardLayout from '@/components/layout/DashboardLayout'
import QuotationForm from '@/components/forms/QuotationForm'
import { Quotation, QuotationStatus } from '@/types'
import { 
  Search, 
  Plus, 
  FileText, 
  DollarSign,
  Calendar,
  Users,
  Edit,
  MoreVertical,
  ChevronDown,
  CheckCircle,
  X,
  Trash2,
  Clock,
  TrendingUp,
  Eye,
  Send,
  AlertTriangle,
  Printer
} from 'lucide-react'
import { cn } from '@/lib/utils'

const QUOTATION_STATUS_COLORS: Record<QuotationStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
  converted: 'bg-purple-100 text-purple-800'
}

const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  converted: 'Converted'
}

export default function QuotationsPage() {
  const { user } = useAuth()
  const { quotations, addQuotation, updateQuotation, deleteQuotation } = useQuotations()
  const { clients } = useClients()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<QuotationStatus | 'all'>('all')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [showQuotationForm, setShowQuotationForm] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState<Quotation | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | undefined>()

  // Calculate quotation statistics
  const quotationStats = useMemo(() => {
    const totalValue = quotations.reduce((sum, quotation) => sum + quotation.totalAmount, 0)
    const acceptedQuotations = quotations.filter(q => q.status === 'accepted')
    const acceptedValue = acceptedQuotations.reduce((sum, q) => sum + q.totalAmount, 0)
    const sentQuotations = quotations.filter(q => q.status === 'sent').length
    const conversionRate = quotations.filter(q => ['accepted', 'rejected', 'expired'].includes(q.status)).length > 0 
      ? Math.round((acceptedQuotations.length / quotations.filter(q => ['accepted', 'rejected', 'expired'].includes(q.status)).length) * 100) 
      : 0

    return {
      total: quotations.length,
      totalValue,
      acceptedValue,
      sentQuotations,
      conversionRate
    }
  }, [quotations])

  // Filter quotations based on search and filters
  const filteredQuotations = useMemo(() => {
    return quotations.filter(quotation => {
      const client = clients.find(c => c.id === quotation.clientId)
      const matchesSearch = quotation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quotation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client?.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = selectedStatus === 'all' || quotation.status === selectedStatus
      const matchesClient = selectedClient === 'all' || quotation.clientId === selectedClient
      
      return matchesSearch && matchesStatus && matchesClient
    })
  }, [quotations, clients, searchTerm, selectedStatus, selectedClient])

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.name || 'Unknown Client'
  }

  const getDaysUntilExpiry = (validUntil: Date) => {
    const now = new Date()
    const expiryDate = new Date(validUntil)
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount)
  }

  const handleAddQuotation = () => {
    setEditingQuotation(undefined)
    setShowQuotationForm(true)
  }

  const handleEditQuotation = (quotation: Quotation) => {
    setEditingQuotation(quotation)
    setShowQuotationForm(true)
  }

  const handleSaveQuotation = async (quotationData: Partial<Quotation>) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingQuotation) {
        updateQuotation(editingQuotation.id, quotationData)
        setSuccessMessage('Quotation updated successfully!')
      } else {
        addQuotation(quotationData)
        setSuccessMessage('Quotation created successfully!')
      }
      
      setShowQuotationForm(false)
      setEditingQuotation(undefined)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error saving quotation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseForm = () => {
    setShowQuotationForm(false)
    setEditingQuotation(undefined)
  }

  const handleDeleteQuotation = async (quotation: Quotation) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      deleteQuotation(quotation.id)
      
      setSuccessMessage(`Quotation "${quotation.quotationNumber}" deleted successfully!`)
      setShowDeleteConfirm(false)
      setQuotationToDelete(undefined)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error deleting quotation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const showDeleteConfirmation = (quotation: Quotation) => {
    setQuotationToDelete(quotation)
    setShowDeleteConfirm(true)
  }

  const handleStatusUpdate = async (quotation: Quotation, newStatus: QuotationStatus) => {
    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updates: Partial<Quotation> = { status: newStatus }
      if (newStatus === 'sent' && !quotation.sentDate) {
        updates.sentDate = new Date()
      }
      
      updateQuotation(quotation.id, updates)
      setSuccessMessage(`Quotation status updated to ${QUOTATION_STATUS_LABELS[newStatus]}`)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error updating quotation status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrintQuotation = (quotation: Quotation) => {
    const client = clients.find(c => c.id === quotation.clientId)
    printQuotation(quotation, client)
  }

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
            <p className="text-gray-600">Manage quotations and track business opportunities</p>
          </div>
          
          {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'sales' || user.role === 'finance') && (
            <button 
              onClick={handleAddQuotation}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Quotation</span>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quotations</p>
                <p className="text-2xl font-bold text-gray-900">{quotationStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-ampere-600">{formatCurrency(quotationStats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(quotationStats.acceptedValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Response</p>
                <p className="text-2xl font-bold text-blue-600">{quotationStats.sentQuotations}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{quotationStats.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
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
                  placeholder="Search quotations by title, number, client, or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as QuotationStatus | 'all')}
              >
                <option value="all">All Status</option>
                {Object.entries(QUOTATION_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>

            {/* Client Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
              >
                <option value="all">All Clients</option>
                {clients.filter(client => client.status === 'active').map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quotations List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Quotations ({filteredQuotations.length})
              </h2>
            </div>
          </div>

          <div className="overflow-hidden">
            {filteredQuotations.map((quotation) => {
              const client = clients.find(c => c.id === quotation.clientId)
              const daysUntilExpiry = getDaysUntilExpiry(quotation.validUntil)
              
              return (
                <div key={quotation.id} className="relative">
                  {/* Clickable Card Area */}
                  <Link href={`/quotations/${quotation.id}`}>
                    <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-ampere-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-ampere-600" />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">{quotation.title}</h3>
                                <span className={cn(
                                  "px-2 py-1 text-xs font-medium rounded-full",
                                  QUOTATION_STATUS_COLORS[quotation.status]
                                )}>
                                  {QUOTATION_STATUS_LABELS[quotation.status]}
                                </span>
                              </div>
                              
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4" />
                                  <span>{client?.name || 'Unknown Client'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4" />
                                  <span>{quotation.quotationNumber}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{formatCurrency(quotation.totalAmount)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    Valid until {new Date(quotation.validUntil).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium text-gray-700">Created:</span>
                                  <span>{new Date(quotation.createdAt).toLocaleDateString()}</span>
                                </div>
                                {quotation.status === 'sent' && (
                                  <div className="flex items-center space-x-1">
                                    <span className="font-medium text-gray-700">Sent:</span>
                                    <span>{quotation.sentDate ? new Date(quotation.sentDate).toLocaleDateString() : 'Not sent'}</span>
                                  </div>
                                )}
                                {quotation.status === 'sent' && daysUntilExpiry <= 3 && daysUntilExpiry > 0 && (
                                  <div className="flex items-center space-x-1 text-orange-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>{daysUntilExpiry} days left</span>
                                  </div>
                                )}
                                {quotation.status === 'sent' && daysUntilExpiry <= 0 && (
                                  <div className="flex items-center space-x-1 text-red-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Expired</span>
                                  </div>
                                )}
                              </div>
                              
                              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                {quotation.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-6 right-6 flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handlePrintQuotation(quotation)
                      }}
                      className="p-2 text-gray-400 hover:text-ampere-600 rounded-lg hover:bg-gray-100 bg-white shadow-sm border"
                      title="Print Quotation"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    
                    {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'sales') && quotation.status === 'draft' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleEditQuotation(quotation)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 bg-white shadow-sm border"
                        title="Edit Quotation"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    
                    {(user.role === 'super_admin' || user.role === 'admin') && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          showDeleteConfirmation(quotation)
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 bg-white shadow-sm border"
                        title="Delete Quotation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredQuotations.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or create a new quotation.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quotation Form Modal */}
      <QuotationForm
        quotation={editingQuotation}
        isOpen={showQuotationForm}
        onClose={handleCloseForm}
        onSave={handleSaveQuotation}
        mode={editingQuotation ? 'edit' : 'add'}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && quotationToDelete && (
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Quotation</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete quotation <strong>{quotationToDelete.quotationNumber}</strong> - <strong>{quotationToDelete.title}</strong>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteQuotation(quotationToDelete)}
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
                    setQuotationToDelete(undefined)
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