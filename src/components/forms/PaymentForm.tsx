'use client'

import { useState, useEffect } from 'react'
import { Payment, PaymentMethod } from '@/types'
import { cn } from '@/lib/utils'
import { useFinance } from '@/contexts/FinanceContext'
import { useClients } from '@/contexts/ClientContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  CreditCard, X, Save, Calculator, Calendar, Receipt, AlertCircle
} from 'lucide-react'

interface PaymentFormProps {
  payment?: Payment
  invoiceId?: string
  isOpen: boolean
  onClose: () => void
  onSave: (paymentData: Partial<Payment>) => Promise<void>
  mode: 'add' | 'edit'
  isLoading?: boolean
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon?: string }[] = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'cheque', label: 'Cheque', icon: '📝' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'paynow', label: 'PayNow', icon: '📱' }
]

export default function PaymentForm({ 
  payment, 
  invoiceId, 
  isOpen, 
  onClose, 
  onSave, 
  mode, 
  isLoading = false 
}: PaymentFormProps) {
  const { invoices, getInvoice, getInvoicePayments } = useFinance()
  const { clients } = useClients()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    invoiceId: payment?.invoiceId || invoiceId || '',
    amount: payment?.amount || 0,
    method: payment?.method || 'bank_transfer' as PaymentMethod,
    reference: payment?.reference || '',
    receivedDate: payment?.receivedDate ? new Date(payment.receivedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: payment?.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedInvoice, setSelectedInvoice] = useState(
    formData.invoiceId ? getInvoice(formData.invoiceId) : undefined
  )

  // Update selected invoice when invoiceId changes
  useEffect(() => {
    if (formData.invoiceId) {
      const invoice = getInvoice(formData.invoiceId)
      setSelectedInvoice(invoice)
      
      // Auto-calculate remaining amount if this is a new payment
      if (mode === 'add' && invoice) {
        const existingPayments = getInvoicePayments(invoice.id)
        const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0)
        const remainingAmount = invoice.totalAmount - totalPaid
        
        if (remainingAmount > 0 && formData.amount === 0) {
          setFormData(prev => ({ ...prev, amount: remainingAmount }))
        }
      }
    } else {
      setSelectedInvoice(undefined)
    }
  }, [formData.invoiceId, getInvoice, getInvoicePayments, mode])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.invoiceId) newErrors.invoiceId = 'Invoice selection is required'
    if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0'
    if (!formData.method) newErrors.method = 'Payment method is required'
    if (!formData.receivedDate) newErrors.receivedDate = 'Received date is required'

    // Validate payment amount against invoice
    if (selectedInvoice && formData.amount > 0) {
      const existingPayments = getInvoicePayments(selectedInvoice.id)
      // Exclude current payment if editing
      const otherPayments = mode === 'edit' && payment 
        ? existingPayments.filter(p => p.id !== payment.id)
        : existingPayments
      
      const totalOtherPayments = otherPayments.reduce((sum, p) => sum + p.amount, 0)
      const remainingAmount = selectedInvoice.totalAmount - totalOtherPayments
      
      if (formData.amount > remainingAmount) {
        newErrors.amount = `Amount cannot exceed remaining balance of ${formatCurrency(remainingAmount)}`
      }
    }

    // Validate reference for certain payment methods
    if ((formData.method === 'cheque' || formData.method === 'bank_transfer') && !formData.reference.trim()) {
      newErrors.reference = `Reference number is required for ${PAYMENT_METHODS.find(m => m.value === formData.method)?.label}`
    }

    // Validate received date
    if (formData.receivedDate && selectedInvoice) {
      const receivedDate = new Date(formData.receivedDate)
      const invoiceDate = new Date(selectedInvoice.issueDate)
      
      if (receivedDate < invoiceDate) {
        newErrors.receivedDate = 'Payment date cannot be before invoice date'
      }
      
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today
      if (receivedDate > today) {
        newErrors.receivedDate = 'Payment date cannot be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const paymentData: Partial<Payment> = {
      invoiceId: formData.invoiceId,
      amount: formData.amount,
      method: formData.method,
      reference: formData.reference.trim() || undefined,
      receivedDate: new Date(formData.receivedDate),
      notes: formData.notes.trim() || undefined
    }

    await onSave(paymentData)
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

  // Calculate payment summary for selected invoice
  const getPaymentSummary = () => {
    if (!selectedInvoice) return null

    const existingPayments = getInvoicePayments(selectedInvoice.id)
    const otherPayments = mode === 'edit' && payment 
      ? existingPayments.filter(p => p.id !== payment.id)
      : existingPayments
    
    const totalPaid = otherPayments.reduce((sum, p) => sum + p.amount, 0)
    const remainingAmount = selectedInvoice.totalAmount - totalPaid
    const newBalance = remainingAmount - formData.amount

    return {
      invoiceTotal: selectedInvoice.totalAmount,
      totalPaid,
      remainingAmount,
      newBalance: Math.max(newBalance, 0),
      isFullyPaid: newBalance <= 0
    }
  }

  const paymentSummary = getPaymentSummary()

  // Filter unpaid or partially paid invoices for new payments
  const availableInvoices = mode === 'add' 
    ? invoices.filter(invoice => {
        if (invoice.status === 'paid' || invoice.status === 'cancelled') return false
        const payments = getInvoicePayments(invoice.id)
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
        return totalPaid < invoice.totalAmount
      })
    : invoices

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'add' ? 'Record New Payment' : 'Edit Payment'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Record a payment received against an invoice' : 'Update payment details'}
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
            <div className="space-y-6">
              {/* Invoice Selection */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Receipt className="h-4 w-4 mr-2 text-ampere-600" />
                  Invoice Information
                </h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice *</label>
                    <select
                      value={formData.invoiceId}
                      onChange={(e) => handleInputChange('invoiceId', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.invoiceId ? "border-red-300" : "border-gray-300")}
                      disabled={mode === 'edit'}
                    >
                      <option value="">Select Invoice</option>
                      {availableInvoices.map(invoice => {
                        const client = clients.find(c => c.id === invoice.clientId)
                        const payments = getInvoicePayments(invoice.id)
                        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
                        const remaining = invoice.totalAmount - totalPaid
                        
                        return (
                          <option key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber} - {client?.name} - {formatCurrency(remaining)} remaining
                          </option>
                        )
                      })}
                    </select>
                    {errors.invoiceId && <p className="mt-1 text-sm text-red-600">{errors.invoiceId}</p>}
                  </div>

                  {/* Invoice Details */}
                  {selectedInvoice && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Client:</span>
                          <p className="font-medium">{getClientName(selectedInvoice.clientId)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Invoice Date:</span>
                          <p className="font-medium">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Due Date:</span>
                          <p className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full ml-2",
                            selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            selectedInvoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          )}>
                            {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Calculator className="h-4 w-4 mr-2 text-ampere-600" />
                  Payment Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                    <select
                      value={formData.method}
                      onChange={(e) => handleInputChange('method', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.method ? "border-red-300" : "border-gray-300")}
                    >
                      {PAYMENT_METHODS.map(method => (
                        <option key={method.value} value={method.value}>
                          {method.icon} {method.label}
                        </option>
                      ))}
                    </select>
                    {errors.method && <p className="mt-1 text-sm text-red-600">{errors.method}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Number
                      {(formData.method === 'cheque' || formData.method === 'bank_transfer') && ' *'}
                    </label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => handleInputChange('reference', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.reference ? "border-red-300" : "border-gray-300")}
                      placeholder={
                        formData.method === 'cheque' ? 'Cheque number' :
                        formData.method === 'bank_transfer' ? 'Transaction reference' :
                        formData.method === 'paynow' ? 'PayNow reference' :
                        'Payment reference'
                      }
                    />
                    {errors.reference && <p className="mt-1 text-sm text-red-600">{errors.reference}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Received Date *</label>
                    <input
                      type="date"
                      value={formData.receivedDate}
                      onChange={(e) => handleInputChange('receivedDate', e.target.value)}
                      className={cn("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500", errors.receivedDate ? "border-red-300" : "border-gray-300")}
                    />
                    {errors.receivedDate && <p className="mt-1 text-sm text-red-600">{errors.receivedDate}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                    rows={3}
                    placeholder="Additional notes about the payment..."
                  />
                </div>
              </div>

              {/* Payment Summary */}
              {paymentSummary && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <Calculator className="h-4 w-4 mr-2 text-blue-600" />
                    Payment Summary
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Invoice Total:</span>
                      <p className="font-medium text-lg">{formatCurrency(paymentSummary.invoiceTotal)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Previously Paid:</span>
                      <p className="font-medium text-lg">{formatCurrency(paymentSummary.totalPaid)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Payment:</span>
                      <p className="font-medium text-lg text-green-600">{formatCurrency(formData.amount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Remaining Balance:</span>
                      <p className={cn(
                        "font-bold text-xl",
                        paymentSummary.newBalance === 0 ? "text-green-600" : "text-orange-600"
                      )}>
                        {formatCurrency(paymentSummary.newBalance)}
                      </p>
                    </div>
                  </div>

                  {paymentSummary.isFullyPaid && (
                    <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-800 text-sm font-medium">
                        This payment will fully settle the invoice
                      </span>
                    </div>
                  )}
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
                    <span>{mode === 'add' ? 'Recording...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{mode === 'add' ? 'Record Payment' : 'Save Changes'}</span>
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