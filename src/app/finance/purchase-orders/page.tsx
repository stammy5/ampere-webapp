'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { usePurchaseOrders } from '@/contexts/PurchaseOrderContext'
import { useVendors } from '@/contexts/VendorContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useClients } from '@/contexts/ClientContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PurchaseOrderForm from '@/components/forms/PurchaseOrderForm'
import { PurchaseOrder, PurchaseOrderStatus } from '@/types'
import { 
  Plus, Search, Eye, Edit, Trash2, ShoppingCart, DollarSign,
  Clock, AlertTriangle, CheckCircle, Calendar, Building, Users, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PURCHASE_ORDER_STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  sent: 'bg-indigo-100 text-indigo-800',
  partially_received: 'bg-purple-100 text-purple-800',
  received: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800'
}

const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  sent: 'Sent',
  partially_received: 'Partially Received',
  received: 'Received',
  cancelled: 'Cancelled',
  closed: 'Closed'
}

export default function PurchaseOrdersPage() {
  const { user, canAccessFinance, canEditInvoices, canDeleteInvoices, canManagePayments } = useAuth()
  const { purchaseOrders, getPurchaseOrdersByStatus, getPurchaseOrdersByVendor } = usePurchaseOrders()
  const { getVendor } = useVendors()
  const { getProject } = useProjects()
  const { clients } = useClients()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | 'all'>('all')
  const [vendorFilter, setVendorFilter] = useState<string>('all')
  const [successMessage, setSuccessMessage] = useState('')
  const [showPurchaseOrderForm, setShowPurchaseOrderForm] = useState(false)

  // Check finance access permission
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  if (!canAccessFinance()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the Finance module. 
            This area is restricted to Finance team members, Administrators, and Super Administrators.
          </p>
          <p className="text-sm text-gray-500">
            Current role: <span className="font-medium">{user.role.replace('_', ' ').toUpperCase()}</span>
          </p>
        </div>
      </div>
    )
  }

  // Get unique vendors for filter
  const vendors = useMemo(() => {
    const vendorIds = Array.from(new Set(purchaseOrders.map(po => po.vendorId)))
    return vendorIds.map(id => getVendor(id)).filter(Boolean) as any[]
  }, [purchaseOrders, getVendor])

  // Filter purchase orders
  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter(po => {
      const vendor = getVendor(po.vendorId)
      const project = getProject(po.projectId)
      const client = project ? clients.find(c => c.id === project.clientId) : null
      
      const matchesSearch = !searchTerm || 
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client?.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter
      const matchesVendor = vendorFilter === 'all' || po.vendorId === vendorFilter
      
      return matchesSearch && matchesStatus && matchesVendor
    })
  }, [purchaseOrders, searchTerm, statusFilter, vendorFilter, getVendor, getProject, clients])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency', currency: 'SGD'
    }).format(amount)
  }

  const getVendorName = (vendorId: string) => {
    const vendor = getVendor(vendorId)
    return vendor?.name || 'Unknown Vendor'
  }

  const getProjectName = (projectId: string) => {
    const project = getProject(projectId)
    return project?.name || 'No Project'
  }

  const getClientName = (projectId: string) => {
    const project = getProject(projectId)
    if (!project) return 'No Project'
    const client = clients.find(c => c.id === project.clientId)
    return client?.name || 'Unknown Client'
  }

  return (
    <DashboardLayout user={user || { 
      id: '', 
      name: 'Guest', 
      role: 'finance', 
      email: '', 
      isActive: true,
      createdAt: new Date(),
      assignedProjects: [],
      permissions: { 
        projects: { 
          canViewAllProjects: false,
          canEditAssignedProjects: false,
          canCreateProjects: false,
          canDeleteProjects: false,
          canManageTeam: false
        },
        finance: {
          canViewFinance: true,
          canEditInvoices: true,
          canDeleteInvoices: false,
          canViewReports: true,
          canManagePayments: true
        },
        clients: {
          canViewClients: true,
          canEditClients: false,
          canCreateClients: false,
          canDeleteClients: false
        },
        system: {
          canManageUsers: false,
          canViewAuditLogs: false,
          canManageSettings: false,
          canViewReports: true
        }
      }
    }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-600">Manage purchase orders for projects and vendors</p>
          </div>
          
          <button 
            onClick={() => setShowPurchaseOrderForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Purchase Order</span>
          </button>
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
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search purchase orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500 w-full"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PurchaseOrderStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
            >
              <option value="all">All Status</option>
              {Object.entries(PURCHASE_ORDER_STATUS_LABELS).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
            
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
            >
              <option value="all">All Vendors</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
            
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredPurchaseOrders.length} of {purchaseOrders.length} purchase orders
            </div>
          </div>
        </div>

        {/* Purchase Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PO Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchaseOrders.length > 0 ? (
                  filteredPurchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{po.poNumber}</div>
                        <div className="text-sm text-gray-500">{po.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getVendorName(po.vendorId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getProjectName(po.projectId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getClientName(po.projectId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          PURCHASE_ORDER_STATUS_COLORS[po.status]
                        )}>
                          {PURCHASE_ORDER_STATUS_LABELS[po.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(po.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(po.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/finance/purchase-orders/${po.id}`}
                            className="text-ampere-600 hover:text-ampere-900 p-1 rounded hover:bg-ampere-50"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchase Orders Found</h3>
                      <p className="text-gray-600 mb-4">
                        {purchaseOrders.length === 0 
                          ? "Get started by creating a purchase order." 
                          : "No purchase orders match the current filters."}
                      </p>
                      <button className="btn-primary">
                        Create Purchase Order
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}