'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useFinance } from '@/contexts/FinanceContext'
import { useClients } from '@/contexts/ClientContext'
import { useProjects } from '@/contexts/ProjectContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import InvoiceForm from '@/components/forms/InvoiceForm'
import PaymentForm from '@/components/forms/PaymentForm'
import { Invoice, Payment, InvoiceStatus } from '@/types'
import { 
  ArrowLeft, Edit, Download, Calendar, DollarSign, Users, Building, Phone, Mail,
  FileText, CheckCircle, Clock, AlertTriangle, CreditCard, Plus, Edit as EditIcon, Trash2, X, Receipt, Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  overdue: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { 
    getInvoice, updateInvoice, deleteInvoice, getInvoicePayments,
    addPayment, updatePayment, deletePayment
  } = useFinance()
  const { clients } = useClients()
  const { projects } = useProjects()
  
  const invoiceId = params.id as string
  const invoice = getInvoice(invoiceId)
  const payments = getInvoicePayments(invoiceId)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditForm, setShowEditForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  if (!invoice) {
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Not Found</h3>
            <p className="text-gray-600 mb-4">The invoice you're looking for doesn't exist.</p>
            <Link href="/finance" className="btn-primary">Back to Finance</Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const client = clients.find(c => c.id === invoice.clientId)
  const project = projects.find(p => p.id === invoice.projectId)

  // Calculate payment summary
  const paymentSummary = useMemo(() => {
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const remainingAmount = invoice.totalAmount - totalPaid
    return {
      totalPaid, remainingAmount: Math.max(remainingAmount, 0),
      isFullyPaid: remainingAmount <= 0, paymentCount: payments.length
    }
  }, [invoice.totalAmount, payments])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(amount)
  }

  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateInvoice(invoice.id, invoiceData)
      setSuccessMessage('Invoice updated successfully!')
      setShowEditForm(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating invoice:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePayment = async (paymentData: Partial<Payment>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      addPayment({ ...paymentData, invoiceId: invoice.id })
      setShowPaymentForm(false)
      setSuccessMessage('Payment recorded successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error recording payment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePayment = async (paymentData: Partial<Payment>) => {
    if (!editingPayment) return
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      updatePayment(editingPayment.id, paymentData)
      setEditingPayment(undefined)
      setSuccessMessage('Payment updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating payment:', error)
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
              <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
              <p className="text-gray-600">{client?.name} • {formatCurrency(invoice.totalAmount)}</p>
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
                <span>Edit Invoice</span>
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

        {/* Invoice Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Invoice Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
              </div>
              <Receipt className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(paymentSummary.totalPaid)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className={cn("text-2xl font-bold", paymentSummary.remainingAmount > 0 ? "text-orange-600" : "text-green-600")}>
                  {formatCurrency(paymentSummary.remainingAmount)}
                </p>
              </div>
              {paymentSummary.remainingAmount > 0 ? 
                <Clock className="h-8 w-8 text-orange-600" /> : 
                <CheckCircle className="h-8 w-8 text-green-600" />
              }
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn("flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'overview' ? "border-ampere-500 text-ampere-600" : "border-transparent text-gray-500")}
              >
                <FileText className="h-4 w-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={cn("flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'payments' ? "border-ampere-500 text-ampere-600" : "border-transparent text-gray-500")}
              >
                <CreditCard className="h-4 w-4" />
                <span>Payments ({payments.length})</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Issue Date</p>
                        <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {project && (
                      <div className="flex items-center space-x-3">
                        <Building className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Project</p>
                          <p className="font-medium">{project.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Information */}
                {client && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Client Name</p>
                          <p className="font-medium">{client.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{client.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{client.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                  {canEditFinance && !paymentSummary.isFullyPaid && (
                    <button onClick={() => setShowPaymentForm(true)} className="btn-primary flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Record Payment</span>
                    </button>
                  )}
                </div>

                {payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map(payment => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-medium text-green-600">{formatCurrency(payment.amount)}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-gray-900 capitalize">{payment.method.replace('_', ' ')}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-gray-900">{new Date(payment.receivedDate).toLocaleDateString()}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {canEditFinance && (
                                  <button onClick={() => setEditingPayment(payment)} className="text-gray-600 hover:text-gray-900">
                                    <EditIcon className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Recorded</h3>
                    <p className="text-gray-600 mb-4">No payments have been recorded for this invoice yet.</p>
                    {canEditFinance && (
                      <button onClick={() => setShowPaymentForm(true)} className="btn-primary">
                        Record First Payment
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <InvoiceForm
        invoice={invoice}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleSaveInvoice}
        mode="edit"
        isLoading={isLoading}
      />

      <PaymentForm
        invoiceId={invoice.id}
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        onSave={handleCreatePayment}
        mode="add"
        isLoading={isLoading}
      />

      <PaymentForm
        payment={editingPayment}
        isOpen={!!editingPayment}
        onClose={() => setEditingPayment(undefined)}
        onSave={handleUpdatePayment}
        mode="edit"
        isLoading={isLoading}
      />
    </DashboardLayout>
  )
}