'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/contexts/ClientContext'
import { useTenders } from '@/contexts/TenderContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TenderForm from '@/components/forms/TenderForm'
import { Tender, TenderType, TenderStatus } from '@/types'
import { 
  Search, 
  Plus, 
  Target, 
  DollarSign,
  Calendar,
  Users,
  Edit,
  MoreVertical,
  ChevronDown,
  CheckCircle,
  X,
  Trash2,
  MapPin,
  Clock,
  TrendingUp,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

const TENDER_TYPE_LABELS: Record<TenderType, string> = {
  open: 'Open Tender',
  selective: 'Selective',
  nominated: 'Nominated',
  negotiated: 'Negotiated'
}

const TENDER_STATUS_COLORS: Record<TenderStatus, string> = {
  opportunity: 'bg-blue-100 text-blue-800',
  preparing: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-purple-100 text-purple-800',
  under_evaluation: 'bg-orange-100 text-orange-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

export default function TendersPage() {
  const { user } = useAuth()
  const { tenders, addTender, updateTender, deleteTender } = useTenders()
  const { clients } = useClients()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<TenderType | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<TenderStatus | 'all'>('all')
  const [showTenderForm, setShowTenderForm] = useState(false)
  const [editingTender, setEditingTender] = useState<Tender | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tenderToDelete, setTenderToDelete] = useState<Tender | undefined>()

  // Calculate tender statistics
  const tenderStats = useMemo(() => {
    const activeTenders = tenders.filter(t => ['opportunity', 'preparing', 'submitted', 'under_evaluation'].includes(t.status)).length
    const totalValue = tenders.reduce((sum, tender) => sum + tender.estimatedValue, 0)
    const wonTenders = tenders.filter(t => t.status === 'won').length
    const winRate = tenders.filter(t => ['won', 'lost'].includes(t.status)).length > 0 
      ? Math.round((wonTenders / tenders.filter(t => ['won', 'lost'].includes(t.status)).length) * 100) 
      : 0
    
    return {
      total: tenders.length,
      active: activeTenders,
      totalValue,
      winRate
    }
  }, [tenders])

  // Filter tenders based on search and filters
  const filteredTenders = useMemo(() => {
    return tenders.filter(tender => {
      const client = clients.find(c => c.id === tender.clientId)
      const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tender.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tender.location.district.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = selectedType === 'all' || tender.type === selectedType
      const matchesStatus = selectedStatus === 'all' || tender.status === selectedStatus
      
      return matchesSearch && matchesType && matchesStatus
    })
  }, [tenders, clients, searchTerm, selectedType, selectedStatus])

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.name || 'Unknown Client'
  }

  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount)
  }

  const handleAddTender = () => {
    setEditingTender(undefined)
    setShowTenderForm(true)
  }

  const handleEditTender = (tender: Tender) => {
    setEditingTender(tender)
    setShowTenderForm(true)
  }

  const handleSaveTender = async (tenderData: Partial<Tender>) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingTender) {
        updateTender(editingTender.id, tenderData)
        setSuccessMessage('Tender updated successfully!')
      } else {
        addTender(tenderData)
        setSuccessMessage('Tender added successfully!')
      }
      
      setShowTenderForm(false)
      setEditingTender(undefined)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error saving tender:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseForm = () => {
    setShowTenderForm(false)
    setEditingTender(undefined)
  }

  const handleDeleteTender = async (tender: Tender) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      deleteTender(tender.id)
      
      setSuccessMessage(`Tender "${tender.title}" deleted successfully!`)
      setShowDeleteConfirm(false)
      setTenderToDelete(undefined)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error deleting tender:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const showDeleteConfirmation = (tender: Tender) => {
    setTenderToDelete(tender)
    setShowDeleteConfirm(true)
  }

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tenders</h1>
            <p className="text-gray-600">Manage tender opportunities and track submissions</p>
          </div>
          
          {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'sales') && (
            <button 
              onClick={handleAddTender}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Tender</span>
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
                <p className="text-sm font-medium text-gray-600">Total Tenders</p>
                <p className="text-2xl font-bold text-gray-900">{tenderStats.total}</p>
              </div>
              <Target className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tenders</p>
                <p className="text-2xl font-bold text-blue-600">{tenderStats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-ampere-600">{formatCurrency(tenderStats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-green-600">{tenderStats.winRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
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
                  placeholder="Search tenders by title, client, description, or location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as TenderType | 'all')}
              >
                <option value="all">All Types</option>
                {Object.entries(TENDER_TYPE_LABELS).map(([value, label]) => (
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
                onChange={(e) => setSelectedStatus(e.target.value as TenderStatus | 'all')}
              >
                <option value="all">All Status</option>
                <option value="opportunity">Opportunity</option>
                <option value="preparing">Preparing</option>
                <option value="submitted">Submitted</option>
                <option value="under_evaluation">Under Evaluation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tender List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Tenders ({filteredTenders.length})
              </h2>
            </div>
          </div>

          <div className="overflow-hidden">
            {filteredTenders.map((tender) => {
              const daysUntilDeadline = getDaysUntilDeadline(tender.submissionDeadline)
              
              return (
                <div key={tender.id} className="relative">
                  {/* Clickable Card Area */}
                  <Link href={`/tenders/${tender.id}`}>
                    <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-ampere-100 rounded-lg flex items-center justify-center">
                                <Target className="h-6 w-6 text-ampere-600" />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">{tender.title}</h3>
                                <span className={cn(
                                  "px-2 py-1 text-xs font-medium rounded-full",
                                  TENDER_STATUS_COLORS[tender.status]
                                )}>
                                  {tender.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {TENDER_TYPE_LABELS[tender.type]}
                                </span>
                              </div>
                              
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4" />
                                  <span>{getClientName(tender.clientId)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{tender.location.district}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{formatCurrency(tender.estimatedValue)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {daysUntilDeadline > 0 
                                      ? `${daysUntilDeadline} days left`
                                      : daysUntilDeadline === 0 
                                        ? 'Due today'
                                        : `${Math.abs(daysUntilDeadline)} days overdue`
                                    }
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium text-gray-700">Deadline:</span>
                                  <span className={cn(
                                    daysUntilDeadline < 0 ? "text-red-600" : 
                                    daysUntilDeadline <= 7 ? "text-orange-600" : "text-gray-600"
                                  )}>
                                    {new Date(tender.submissionDeadline).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium text-gray-700">Win Probability:</span>
                                  <span className="text-ampere-600">{tender.winProbability}%</span>
                                </div>
                                {(tender.competitorCount || 0) > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <span className="font-medium text-gray-700">Competitors:</span>
                                    <span>{tender.competitorCount}</span>
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
                    {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'sales') && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEditTender(tender)
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 bg-white shadow-sm border"
                          title="Edit Tender"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {(user.role === 'super_admin' || user.role === 'admin') && (
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              showDeleteConfirmation(tender)
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 bg-white shadow-sm border"
                            title="Delete Tender"
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

          {filteredTenders.length === 0 && (
            <div className="p-12 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tenders found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or add a new tender.</p>
            </div>
          )}
        </div>
      </div>

      {/* Tender Form Modal */}
      <TenderForm
        tender={editingTender}
        isOpen={showTenderForm}
        onClose={handleCloseForm}
        onSave={handleSaveTender}
        mode={editingTender ? 'edit' : 'add'}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && tenderToDelete && (
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Tender</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete <strong>{tenderToDelete.title}</strong>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteTender(tenderToDelete)}
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
                    setTenderToDelete(undefined)
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