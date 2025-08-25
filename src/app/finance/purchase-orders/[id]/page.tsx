'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  ArrowLeft, Edit, Download, Calendar, DollarSign, Users, Building, Phone, Mail,
  FileText, CheckCircle, Clock, AlertTriangle, ShoppingCart, Plus, X
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

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { getPurchaseOrder, updatePurchaseOrder } = usePurchaseOrders()
  const { getVendor } = useVendors()
  const { getProject } = useProjects()
  const { clients } = useClients()
  
  const purchaseOrderId = params.id as string
  const purchaseOrder = getPurchaseOrder(purchaseOrderId)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditForm, setShowEditForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  if (!purchaseOrder) {
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
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Purchase Order Not Found</h3>
            <p className="text-gray-600 mb-4">The purchase order you're looking for doesn't exist.</p>
            <Link href="/finance" className="btn-primary">Back to Finance</Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const vendor = getVendor(purchaseOrder.vendorId)
  const project = getProject(purchaseOrder.projectId)
  const client = project ? clients.find(c => c.id === project.clientId) : null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(amount)
  }

  const handleSavePurchaseOrder = async (purchaseOrderData: Partial<PurchaseOrder>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      updatePurchaseOrder(purchaseOrder.id, purchaseOrderData)
      setSuccessMessage('Purchase order updated successfully!')
      setShowEditForm(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating purchase order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const canEditFinance = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'finance'

  if (!user) return null

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
          <div className="flex items-center space-x-4">
            <Link href="/finance" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{purchaseOrder.poNumber}</h1>
              <p className="text-gray-600">{vendor?.name} • {formatCurrency(purchaseOrder.totalAmount)}</p>
            </div>
          </div>
          
          {canEditFinance && (
            <div className="flex items-center space-x-2">
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
              <button onClick={() => setShowEditForm(true)} className="btn-secondary flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Edit Purchase Order</span>
              </button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Purchase Order Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PO Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(purchaseOrder.totalAmount)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  PURCHASE_ORDER_STATUS_COLORS[purchaseOrder.status]
                )}>
                  {PURCHASE_ORDER_STATUS_LABELS[purchaseOrder.status]}
                </span>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Issue Date</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(purchaseOrder.issueDate).toLocaleDateString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Required By</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(purchaseOrder.requiredDate).toLocaleDateString()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'overview'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'items'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                Items ({purchaseOrder.items.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'history'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                History
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Order Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
                        <p className="text-gray-900">{purchaseOrder.title}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                        <p className="text-gray-900">{purchaseOrder.description || 'No description provided'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Issue Date</label>
                        <p className="text-gray-900">{new Date(purchaseOrder.issueDate).toLocaleDateString('en-SG')}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Required Date</label>
                        <p className="text-gray-900">{new Date(purchaseOrder.requiredDate).toLocaleDateString('en-SG')}</p>
                      </div>
                      
                      {purchaseOrder.deliveryDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Delivery Date</label>
                          <p className="text-gray-900">{new Date(purchaseOrder.deliveryDate).toLocaleDateString('en-SG')}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {vendor && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Vendor Information</label>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{vendor.name}</span>
                            </div>
                            {vendor.email && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span>{vendor.email}</span>
                              </div>
                            )}
                            {vendor.phone && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{vendor.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {project && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Project</label>
                          <p className="text-gray-900">{project.name}</p>
                        </div>
                      )}
                      
                      {client && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Client</label>
                          <p className="text-gray-900">{client.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(purchaseOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GST (7%):</span>
                        <span className="font-medium">{formatCurrency(purchaseOrder.gst)}</span>
                      </div>
                      {purchaseOrder.discount && purchaseOrder.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-medium text-red-600">-{formatCurrency(purchaseOrder.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                        <span>Total Amount:</span>
                        <span className="text-ampere-600">{formatCurrency(purchaseOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                {purchaseOrder.terms && purchaseOrder.terms.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {purchaseOrder.terms.map((term, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-ampere-600 font-bold text-sm mt-0.5">•</span>
                            <span className="text-gray-900">{term}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {purchaseOrder.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900">{purchaseOrder.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Items Tab */}
            {activeTab === 'items' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Purchase Order Items</h3>
                </div>

                {purchaseOrder.items.length > 0 ? (
                  <div className="space-y-4">
                    {purchaseOrder.items.map((item, index) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                            <p className="font-medium text-gray-900">{item.description}</p>
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                            <p className="text-gray-900">{item.quantity} {item.unit}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Unit Price</label>
                            <p className="text-gray-900">{formatCurrency(item.unitPrice)}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                              {item.category}
                            </span>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Total Price</label>
                            <p className="font-bold text-ampere-600">{formatCurrency(item.totalPrice)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Items Summary */}
                    <div className="bg-ampere-50 rounded-lg p-4 border border-ampere-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-ampere-800">
                          Total: {purchaseOrder.items.length} item{purchaseOrder.items.length !== 1 ? 's' : ''}
                        </span>
                        <span className="font-bold text-ampere-800">
                          {formatCurrency(purchaseOrder.subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Items</h4>
                    <p className="text-gray-600">This purchase order doesn't have any items yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Purchase Order History</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Purchase Order Created</p>
                      <p className="text-sm text-gray-600">
                        {new Date(purchaseOrder.createdAt).toLocaleDateString('en-SG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {new Date(purchaseOrder.updatedAt).toLocaleDateString('en-SG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {purchaseOrder.approvedDate && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Purchase Order Approved</p>
                        <p className="text-sm text-gray-600">
                          {new Date(purchaseOrder.approvedDate).toLocaleDateString('en-SG', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Purchase Order Form Modal */}
      <PurchaseOrderForm
        purchaseOrder={purchaseOrder}
        projectId={purchaseOrder.projectId}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleSavePurchaseOrder}
        mode="edit"
        isLoading={isLoading}
      />
    </DashboardLayout>
  )
}