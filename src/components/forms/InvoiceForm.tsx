'use client'

import { useState, useEffect } from 'react'
import { Invoice, InvoiceStatus } from '@/types'
import { cn } from '@/lib/utils'
import { useClients } from '@/contexts/ClientContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useQuotations } from '@/contexts/QuotationContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  FileText, X, Save, Calculator, Calendar, DollarSign
} from 'lucide-react'

interface InvoiceFormProps {
  invoice?: Invoice
  isOpen: boolean
  onClose: () => void
  onSave: (invoiceData: Partial<Invoice>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

const INVOICE_STATUSES: { value: InvoiceStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' }
]

export default function InvoiceForm({ invoice, isOpen, onClose, onSave, mode, isLoading = false }: InvoiceFormProps) {
  const { clients } = useClients()
  const { projects } = useProjects()
  const { quotations } = useQuotations()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    clientId: invoice?.clientId || '',
    projectId: invoice?.projectId || '',
    quotationId: invoice?.quotationId || '',
    amount: invoice?.amount || 0,
    gstAmount: invoice?.gstAmount || 0,
    totalAmount: invoice?.totalAmount || 0,
    status: invoice?.status || 'draft' as InvoiceStatus,
    issueDate: invoice?.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
    paidDate: invoice?.paidDate ? new Date(invoice.paidDate).toISOString().split('T')[0] : '',
    paymentMethod: invoice?.paymentMethod || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate GST and total when amount changes
  useEffect(() => {
    if (formData.amount > 0) {
      const gstAmount = formData.amount * 0.07 // 7% GST for Singapore
      const totalAmount = formData.amount + gstAmount
      setFormData(prev => ({
        ...prev,
        gstAmount: Math.round(gstAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
      }))
    }
  }, [formData.amount])

  // Auto-calculate due date (30 days from issue date)
  useEffect(() => {
    if (formData.issueDate && !formData.dueDate) {
      const issueDate = new Date(formData.issueDate)
      const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      setFormData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0]
      }))
    }
  }, [formData.issueDate])

  // Auto-fill amount from selected quotation
  useEffect(() => {
    if (formData.quotationId) {
      const selectedQuotation = quotations.find(q => q.id === formData.quotationId)
      if (selectedQuotation && (!formData.amount || formData.amount === 0)) {
        setFormData(prev => ({
          ...prev,
          amount: selectedQuotation.subtotal,
          clientId: selectedQuotation.clientId,
          projectId: selectedQuotation.projectId || ''
        }))
      }
    }
  }, [formData.quotationId, quotations])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientId) newErrors.clientId = 'Client selection is required'
    if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0'
    if (!formData.issueDate) newErrors.issueDate = 'Issue date is required'
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required'

    // Validate dates
    if (formData.issueDate && formData.dueDate) {
      const issueDate = new Date(formData.issueDate)
      const dueDate = new Date(formData.dueDate)
      if (dueDate <= issueDate) {
        newErrors.dueDate = 'Due date must be after issue date'
      }
    }

    // Validate paid date
    if (formData.paidDate && formData.issueDate) {
      const issueDate = new Date(formData.issueDate)
      const paidDate = new Date(formData.paidDate)
      if (paidDate < issueDate) {
        newErrors.paidDate = 'Paid date cannot be before issue date'
      }
    }

    // Validate payment method when status is paid
    if (formData.status === 'paid' && !formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required for paid invoices'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const invoiceData: Partial<Invoice> = {
      clientId: formData.clientId,
      projectId: formData.projectId || undefined,
      quotationId: formData.quotationId || undefined,
      amount: formData.amount,
      gstAmount: formData.gstAmount,
      totalAmount: formData.totalAmount,
      status: formData.status,
      issueDate: new Date(formData.issueDate),
      dueDate: new Date(formData.dueDate),
      paidDate: formData.paidDate ? new Date(formData.paidDate) : undefined,
      paymentMethod: formData.paymentMethod || undefined
    }

    await onSave(invoiceData)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount)
  }

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.name || 'Unknown Client'
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'No Project'
  }

  const getQuotationTitle = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId)
    return quotation?.title || 'No Quotation'
  }

  // Filter projects and quotations by selected client
  const filteredProjects = projects.filter(p => p.clientId === formData.clientId)
  const filteredQuotations = quotations.filter(q => q.clientId === formData.clientId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-ampere-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-ampere-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Create New Invoice' : 'Edit Invoice'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Generate an invoice for project work' : 'Update invoice details and payment information'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Invoice Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                    <select
                      value={formData.clientId}
                      onChange={(e) => handleInputChange('clientId', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.clientId ? "border-red-300" : "border-gray-300")}
                    >
                      <option value="">Select Client</option>
                      {clients.filter(client => client.status === 'active').map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                    {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => handleInputChange('projectId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                      disabled={!formData.clientId}
                    >
                      <option value="">No Project</option>
                      {filteredProjects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quotation</label>
                    <select
                      value={formData.quotationId}
                      onChange={(e) => handleInputChange('quotationId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                      disabled={!formData.clientId}
                    >
                      <option value="">No Quotation</option>
                      {filteredQuotations.map(quotation => (
                        <option key={quotation.id} value={quotation.id}>
                          {quotation.quotationNumber} - {quotation.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    >
                      {INVOICE_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Calculator className="h-4 w-4 mr-2 text-ampere-600" />
                  Financial Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (SGD) *</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.amount ? "border-red-300" : "border-gray-300")}
                      min="0"
                      step="0.01"
                    />
                    {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST (7%)</label>
                    <input
                      type="number"
                      value={formData.gstAmount}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                    <input
                      type="number"
                      value={formData.totalAmount}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-medium"
                      readOnly
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                {formData.totalAmount > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Subtotal:</span>
                        <p className="font-medium text-lg">{formatCurrency(formData.amount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">GST (7%):</span>
                        <p className="font-medium text-lg">{formatCurrency(formData.gstAmount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <p className="font-bold text-xl text-ampere-600">{formatCurrency(formData.totalAmount)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-ampere-600" />
                  Date Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => handleInputChange('issueDate', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.issueDate ? "border-red-300" : "border-gray-300")}
                    />
                    {errors.issueDate && <p className="mt-1 text-sm text-red-600">{errors.issueDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.dueDate ? "border-red-300" : "border-gray-300")}
                    />
                    {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid Date</label>
                    <input
                      type="date"
                      value={formData.paidDate}
                      onChange={(e) => handleInputChange('paidDate', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.paidDate ? "border-red-300" : "border-gray-300")}
                    />
                    {errors.paidDate && <p className="mt-1 text-sm text-red-600">{errors.paidDate}</p>}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {(formData.status === 'paid' || formData.paidDate) && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-ampere-600" />
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.paymentMethod ? "border-red-300" : "border-gray-300")}
                      >
                        <option value="">Select Payment Method</option>
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="paynow">PayNow</option>
                      </select>
                      {errors.paymentMethod && <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{mode === 'add' ? 'Creating...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{mode === 'add' ? 'Create Invoice' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}