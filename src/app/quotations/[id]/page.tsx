'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/contexts/ClientContext'
import { useQuotations } from '@/contexts/QuotationContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import QuotationForm from '@/components/forms/QuotationForm'
import { Quotation, QuotationStatus } from '@/types'
import { printQuotation } from '@/lib/pdf-generator'
import { 
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  Users,
  Clock,
  FileText,
  Building,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Send,
  Plus,
  X,
  Calculator,
  Eye,
  Trash2,
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

type TabType = 'overview' | 'items' | 'history'

export default function QuotationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { clients } = useClients()
  const { getQuotation, updateQuotation } = useQuotations()
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [client, setClient] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showEditForm, setShowEditForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const quotationId = params.id as string

  useEffect(() => {
    if (quotationId) {
      const foundQuotation = getQuotation(quotationId)
      if (foundQuotation) {
        setQuotation(foundQuotation)
        const foundClient = clients.find(c => c.id === foundQuotation.clientId)
        setClient(foundClient)
      }
    }
  }, [quotationId, getQuotation, clients])

  if (!user) return null

  if (!quotation) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quotation Not Found</h3>
          <p className="text-gray-600 mb-4">The quotation you're looking for doesn't exist or has been removed.</p>
          <Link href="/quotations" className="btn-primary">
            Back to Quotations
          </Link>
        </div>
      </DashboardLayout>
    )
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

  const handleEditQuotation = () => {
    setShowEditForm(true)
  }

  const handleSaveQuotation = async (quotationData: Partial<Quotation>) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateQuotation(quotation.id, quotationData)
      setQuotation({ ...quotation, ...quotationData, updatedAt: new Date() })
      setSuccessMessage('Quotation updated successfully!')
      setShowEditForm(false)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error updating quotation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: QuotationStatus) => {
    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updates: Partial<Quotation> = { status: newStatus }
      if (newStatus === 'sent' && !quotation.sentDate) {
        updates.sentDate = new Date()
      }
      
      updateQuotation(quotation.id, updates)
      setQuotation({ ...quotation, ...updates, updatedAt: new Date() })
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

  const handlePrintQuotation = () => {
    printQuotation(quotation, client)
  }

  const daysUntilExpiry = getDaysUntilExpiry(quotation.validUntil)

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/quotations"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quotation.title}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  QUOTATION_STATUS_COLORS[quotation.status]
                )}>
                  {QUOTATION_STATUS_LABELS[quotation.status]}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {quotation.quotationNumber}
                </span>
                {client && (
                  <span className="text-sm text-gray-600">{client.name}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrintQuotation}
              className="btn-secondary flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            
            {quotation.status === 'draft' && (
              <button
                onClick={handleEditQuotation}
                className="btn-primary flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
            
            {quotation.status === 'draft' && (user.role === 'super_admin' || user.role === 'admin' || user.role === 'sales') && (
              <button 
                onClick={() => handleStatusUpdate('sent')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send Quotation</span>
              </button>
            )}
            
            {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'sales' || user.role === 'finance') && (
              <button 
                onClick={handleEditQuotation}
                className="btn-primary flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Quotation</span>
              </button>
            )}
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
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-ampere-600">{formatCurrency(quotation.totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Days to Expiry</p>
                <p className={cn(
                  "text-2xl font-bold",
                  daysUntilExpiry < 0 ? "text-red-600" : 
                  daysUntilExpiry <= 7 ? "text-orange-600" : "text-blue-600"
                )}>
                  {daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry}
                </p>
              </div>
              <Clock className={cn(
                "h-8 w-8",
                daysUntilExpiry < 0 ? "text-red-600" : 
                daysUntilExpiry <= 7 ? "text-orange-600" : "text-blue-600"
              )} />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Items Count</p>
                <p className="text-2xl font-bold text-gray-900">{quotation.items.length}</p>
              </div>
              <Calculator className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">GST Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(quotation.gst)}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4" />
                  <span>Overview</span>
                </div>
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
                <div className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span>Items ({quotation.items.length})</span>
                </div>
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
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>History</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotation Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                        <p className="text-gray-900">{quotation.description}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Valid Until</label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className={cn(
                            "font-medium",
                            daysUntilExpiry < 0 ? "text-red-600" : 
                            daysUntilExpiry <= 7 ? "text-orange-600" : "text-gray-900"
                          )}>
                            {new Date(quotation.validUntil).toLocaleDateString('en-SG', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {daysUntilExpiry < 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            ⚠️ This quotation has expired
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Created Date</label>
                        <p className="text-gray-900">{new Date(quotation.createdAt).toLocaleDateString('en-SG')}</p>
                      </div>
                      
                      {quotation.sentDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Sent Date</label>
                          <p className="text-gray-900">{new Date(quotation.sentDate).toLocaleDateString('en-SG')}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {client && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Client Information</label>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{client.name}</span>
                            </div>
                            {client.email && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span>{client.email}</span>
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{client.phone}</span>
                              </div>
                            )}
                          </div>
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
                        <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GST (7%):</span>
                        <span className="font-medium">{formatCurrency(quotation.gst)}</span>
                      </div>
                      {quotation.discount && quotation.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-medium text-red-600">-{formatCurrency(quotation.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                        <span>Total Amount:</span>
                        <span className="text-ampere-600">{formatCurrency(quotation.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                {quotation.terms && quotation.terms.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {quotation.terms.map((term, index) => (
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
                {quotation.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900">{quotation.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Items Tab */}
            {activeTab === 'items' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Quotation Items</h3>
                </div>

                {quotation.items.length > 0 ? (
                  <div className="space-y-4">
                    {quotation.items.map((item, index) => (
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
                          Total: {quotation.items.length} item{quotation.items.length !== 1 ? 's' : ''}
                        </span>
                        <span className="font-bold text-ampere-800">
                          {formatCurrency(quotation.subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Items</h4>
                    <p className="text-gray-600">This quotation doesn't have any items yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Quotation History</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Quotation Created</p>
                      <p className="text-sm text-gray-600">
                        {new Date(quotation.createdAt).toLocaleDateString('en-SG', {
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
                        {new Date(quotation.updatedAt).toLocaleDateString('en-SG', {
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
                  
                  {quotation.sentDate && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Quotation Sent</p>
                        <p className="text-sm text-gray-600">
                          {new Date(quotation.sentDate).toLocaleDateString('en-SG', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      daysUntilExpiry < 0 ? "bg-red-500" : 
                      daysUntilExpiry <= 7 ? "bg-orange-500" : "bg-gray-400"
                    )}></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Quotation Expiry</p>
                      <p className="text-sm text-gray-600">
                        {new Date(quotation.validUntil).toLocaleDateString('en-SG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {daysUntilExpiry < 0 && (
                        <p className="text-sm text-red-600 font-medium">
                          ⚠️ Expired {Math.abs(daysUntilExpiry)} days ago
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      <QuotationForm
        quotation={quotation}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleSaveQuotation}
        mode="edit"
        isLoading={isLoading}
      />
    </DashboardLayout>
  )
}