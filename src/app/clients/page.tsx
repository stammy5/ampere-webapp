'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/contexts/ClientContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useSettings } from '@/contexts/SettingsContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ClientForm from '@/components/forms/ClientForm'
import { Client, ClientType, ClientStatus, ClientTypeConfig } from '@/types'
import { 
  Search, 
  Filter, 
  Plus, 
  Building, 
  Phone, 
  Mail, 
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Edit,
  Eye,
  MoreVertical,
  ChevronDown,
  CheckCircle,
  X,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  blacklisted: 'bg-red-100 text-red-800'
}

export default function ClientsPage() {
  const { user } = useAuth()
  const { clients, addClient, updateClient, deleteClient } = useClients()
  const { projects } = useProjects()
  const { getActiveClientTypes } = useSettings()
  
  // Get dynamic client types from settings
  const clientTypes = getActiveClientTypes()
  const clientTypeLabels = clientTypes.reduce((acc: Record<ClientType, string>, type: ClientTypeConfig) => {
    acc[type.value as ClientType] = type.label
    return acc
  }, {} as Record<ClientType, string>)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<ClientType | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<ClientStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showClientForm, setShowClientForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | undefined>()

  // Calculate client statistics
  const clientStats = useMemo(() => {
    const activeClients = clients.filter(c => c.status === 'active').length
    const totalRevenue = clients.reduce((sum, client) => {
      const clientProjects = projects.filter(p => p.clientId === client.id)
      return sum + clientProjects.reduce((projectSum, project) => projectSum + project.contractValue, 0)
    }, 0)
    
    return {
      total: clients.length,
      active: activeClients,
      inactive: clients.filter(c => c.status === 'inactive').length,
      totalRevenue
    }
  }, [clients, projects])

  // Filter clients based on search and filters
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.clientCode.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = selectedType === 'all' || client.type === selectedType
      const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus
      
      return matchesSearch && matchesType && matchesStatus
    })
  }, [clients, searchTerm, selectedType, selectedStatus])

  const getClientProjects = (clientId: string) => {
    return projects.filter(p => p.clientId === clientId)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount)
  }

  const handleAddClient = () => {
    setEditingClient(undefined)
    setShowClientForm(true)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setShowClientForm(true)
  }

  const handleSaveClient = async (clientData: Partial<Client>) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingClient) {
        // Update existing client
        updateClient(editingClient.id, clientData)
        setSuccessMessage('Client updated successfully!')
      } else {
        // Add new client
        const newClient = addClient(clientData)
        setSuccessMessage('Client added successfully!')
      }
      
      setShowClientForm(false)
      setEditingClient(undefined)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error saving client:', error)
      // In a real app, you would show an error message
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseForm = () => {
    setShowClientForm(false)
    setEditingClient(undefined)
  }

  const handleDeleteClient = async (client: Client) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove client using context
      deleteClient(client.id)
      
      setSuccessMessage(`Client "${client.name}" deleted successfully!`)
      setShowDeleteConfirm(false)
      setClientToDelete(undefined)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error deleting client:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const showDeleteConfirmation = (client: Client) => {
    setClientToDelete(client)
    setShowDeleteConfirm(true)
  }

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">Manage your client relationships and project portfolios</p>
          </div>
          
          {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'sales') && (
            <button 
              onClick={handleAddClient}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Client</span>
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
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clientStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-green-600">{clientStats.active}</p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Clients</p>
                <p className="text-2xl font-bold text-gray-600">{clientStats.inactive}</p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-ampere-600">{formatCurrency(clientStats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-ampere-600" />
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
                  placeholder="Search clients by name, code, contact person, or email..."
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
                onChange={(e) => setSelectedType(e.target.value as ClientType | 'all')}
              >
                <option value="all">All Types</option>
                {clientTypes.map((type: ClientTypeConfig) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ClientStatus | 'all')}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Clients ({filteredClients.length})
              </h2>
            </div>
          </div>

          <div className="overflow-hidden">
            {filteredClients.map((client) => {
              const clientProjects = getClientProjects(client.id)
              const totalValue = clientProjects.reduce((sum, project) => sum + project.contractValue, 0)
              
              return (
                <div key={client.id} className="relative">
                  {/* Clickable Card Area */}
                  <Link href={`/clients/${client.id}`}>
                    <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-ampere-100 rounded-lg flex items-center justify-center">
                                <Building className="h-6 w-6 text-ampere-600" />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                                <span className="px-2 py-1 text-xs font-medium bg-ampere-100 text-ampere-800 rounded-full font-mono">
                                  {client.clientCode}
                                </span>
                                <span className={cn(
                                  "px-2 py-1 text-xs font-medium rounded-full",
                                  CLIENT_STATUS_COLORS[client.status]
                                )}>
                                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {clientTypeLabels[client.type] || client.type}
                                </span>
                              </div>
                              
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4" />
                                  <span>{client.contactPerson}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{client.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4" />
                                  <span>{client.phone}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{client.address.district}</span>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium text-gray-700">Projects:</span>
                                  <span className="text-ampere-600">{clientProjects.length}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium text-gray-700">Total Value:</span>
                                  <span className="text-green-600 font-semibold">{formatCurrency(totalValue)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium text-gray-700">Payment Terms:</span>
                                  <span>{client.paymentTerms} days</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Action Buttons - Positioned absolutely to avoid interfering with card click */}
                  <div className="absolute top-6 right-6 flex items-center space-x-2">
                    {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'sales') && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEditClient(client)
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 bg-white shadow-sm border"
                          title="Edit Client"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {(user.role === 'super_admin' || user.role === 'admin') && (
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              showDeleteConfirmation(client)
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 bg-white shadow-sm border"
                            title="Delete Client"
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

          {filteredClients.length === 0 && (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or add a new client.</p>
            </div>
          )}
        </div>
      </div>

      {/* Client Form Modal */}
      <ClientForm
        client={editingClient}
        isOpen={showClientForm}
        onClose={handleCloseForm}
        onSave={handleSaveClient}
        mode={editingClient ? 'edit' : 'add'}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && clientToDelete && (
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Client</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete <strong>{clientToDelete.name}</strong>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteClient(clientToDelete)}
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
                    setClientToDelete(undefined)
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