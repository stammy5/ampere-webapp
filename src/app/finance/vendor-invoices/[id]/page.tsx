'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useFinance } from '@/contexts/FinanceContext'
import { useVendors } from '@/contexts/VendorContext'
import { useProjects } from '@/contexts/ProjectContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { VendorInvoice, VendorInvoiceStatus, Payment } from '@/types'
import { 
  ArrowLeft, FileText, Calendar, DollarSign, User, Building, 
  CreditCard, Edit, Trash2, CheckCircle, AlertTriangle, Clock,
  Download, Eye, Shield
} from 'lucide-react'

const VENDOR_INVOICE_STATUS_COLORS: Record<VendorInvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  received: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  processed: 'bg-indigo-100 text-indigo-800',
  approved: 'bg-purple-100 text-purple-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-red-100 text-red-800'
}

const VENDOR_INVOICE_STATUS_LABELS: Record<VendorInvoiceStatus, string> = {
  draft: 'Draft',
  received: 'Received',
  processing: 'Processing',
  processed: 'Processed',
  approved: 'Approved',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled'
}

export default function VendorInvoiceDetailPage() {
  const { id } = useParams()
  const { user, canAccessFinance } = useAuth()
  const { vendorInvoices, getVendorInvoicePayments, updateVendorInvoice, deleteVendorInvoice } = useFinance()
  const { vendors } = useVendors()
  const { projects } = useProjects()

  const [vendorInvoice, setVendorInvoice] = useState<VendorInvoice | undefined>()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')

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
            You don't have permission to access the Vendor Invoices module. 
            This area is restricted to Finance team members, Administrators, and Super Administrators.
          </p>
          <p className="text-sm text-gray-500">
            Current role: <span className="font-medium">{user.role.replace('_', ' ').toUpperCase()}</span>
          </p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (id) {
      const foundVendorInvoice = vendorInvoices.find(inv => inv.id === id)
      if (foundVendorInvoice) {
        setVendorInvoice(foundVendorInvoice)
        const invoicePayments = getVendorInvoicePayments(foundVendorInvoice.id)
        setPayments(invoicePayments)
      }
      setIsLoading(false)
    }
  }, [id, vendorInvoices, getVendorInvoicePayments])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency', currency: 'SGD'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId)
    return vendor?.name || 'Unknown Vendor'
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'No Project'
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  const handleApproveInvoice = () => {
    if (vendorInvoice) {
      updateVendorInvoice(vendorInvoice.id, { status: 'approved' })
      setSuccessMessage('Vendor invoice approved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handleMarkAsPaid = () => {
    if (vendorInvoice) {
      updateVendorInvoice(vendorInvoice.id, { status: 'paid', paidDate: new Date() })
      setSuccessMessage('Vendor invoice marked as paid!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handleDeleteInvoice = () => {
    if (vendorInvoice && confirm(`Are you sure you want to delete vendor invoice ${vendorInvoice.invoiceNumber}?`)) {
      deleteVendorInvoice(vendorInvoice.id)
      // Redirect to vendor invoices list
      window.location.href = '/finance/vendor-invoices'
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ampere-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!vendorInvoice) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Invoice Not Found</h1>
          <p className="text-gray-600 mb-6">The vendor invoice you're looking for doesn't exist or has been deleted.</p>
          <Link href="/finance/vendor-invoices" className="btn-primary">
            Back to Vendor Invoices
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const balanceDue = vendorInvoice.totalAmount - totalPayments

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/finance/vendor-invoices" className="btn-icon">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vendorInvoice.invoiceNumber}</h1>
              <p className="text-gray-600">Vendor Invoice Details</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            <button className="btn-secondary flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button 
              onClick={handleDeleteInvoice}
              className="btn-danger flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Invoice Information</h2>
                <span className={`
                  px-3 py-1 text-sm font-medium rounded-full
                  ${VENDOR_INVOICE_STATUS_COLORS[vendorInvoice.status]}
                `}>
                  {VENDOR_INVOICE_STATUS_LABELS[vendorInvoice.status]}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Vendor</h3>
                  <p className="text-gray-900">{getVendorName(vendorInvoice.vendorId)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Project</h3>
                  <p className="text-gray-900">{getProjectName(vendorInvoice.projectId)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Issue Date</h3>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{formatDate(new Date(vendorInvoice.issueDate))}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{formatDate(new Date(vendorInvoice.dueDate))}</p>
                  </div>
                </div>
                
                {vendorInvoice.paidDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Paid Date</h3>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{formatDate(new Date(vendorInvoice.paidDate))}</p>
                    </div>
                  </div>
                )}
                
                {vendorInvoice.fileName && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Attached File</h3>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{vendorInvoice.fileName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Financial Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(vendorInvoice.amount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (7%)</span>
                  <span className="text-gray-900">{formatCurrency(vendorInvoice.gstAmount)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-gray-900">{formatCurrency(vendorInvoice.totalAmount)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="text-gray-600">Total Payments</span>
                  <span className="text-green-600">{formatCurrency(totalPayments)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold">
                  <span className="text-gray-900">Balance Due</span>
                  <span className={balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(balanceDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payments */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
                <button className="btn-primary text-sm">
                  Record Payment
                </button>
              </div>
              
              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map(payment => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(new Date(payment.receivedDate))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {payment.method.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.reference}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                            {formatCurrency(payment.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Recorded</h3>
                  <p className="text-gray-600 mb-4">No payments have been made for this vendor invoice yet.</p>
                  <button className="btn-primary">
                    Record First Payment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              
              <div className="space-y-3">
                {vendorInvoice.status === 'processed' && (
                  <button
                    onClick={handleApproveInvoice}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve Invoice</span>
                  </button>
                )}
                
                {vendorInvoice.status !== 'paid' && (
                  <button
                    onClick={handleMarkAsPaid}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Mark as Paid</span>
                  </button>
                )}
                
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Invoice</span>
                </button>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Invoice Received</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(new Date(vendorInvoice.createdAt))}
                    </p>
                  </div>
                </div>
                
                {vendorInvoice.status !== 'received' && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Processing</p>
                      <p className="text-xs text-gray-500">Data extraction and validation</p>
                    </div>
                  </div>
                )}
                
                {vendorInvoice.status === 'processed' && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Processed</p>
                      <p className="text-xs text-gray-500">Ready for approval</p>
                    </div>
                  </div>
                )}
                
                {vendorInvoice.status === 'approved' && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Approved</p>
                      <p className="text-xs text-gray-500">Ready for payment</p>
                    </div>
                  </div>
                )}
                
                {vendorInvoice.status === 'paid' && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Paid</p>
                      <p className="text-xs text-gray-500">
                        {vendorInvoice.paidDate && formatDate(new Date(vendorInvoice.paidDate))}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}