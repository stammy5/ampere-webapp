'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useFinance } from '@/contexts/FinanceContext'
import { useVendors } from '@/contexts/VendorContext'
import { useProjects } from '@/contexts/ProjectContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { VendorInvoice, VendorInvoiceStatus } from '@/types'
import { ocrService } from '@/services/ocrService'
import { 
  FileText, Plus, Search, Eye, Edit, Trash2, Upload, Download, 
  Clock, AlertTriangle, CheckCircle, Calendar, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

export default function VendorInvoicesPage() {
  const { user, canAccessFinance } = useAuth()
  const { vendorInvoices, addVendorInvoice, updateVendorInvoice, deleteVendorInvoice } = useFinance()
  const { vendors } = useVendors()
  const { projects } = useProjects()

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'paid'>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<VendorInvoiceStatus | 'all'>('all')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
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

  // Calculate vendor invoice metrics
  const metrics = useMemo(() => {
    const totalVendorOutstanding = vendorInvoices
      .filter(vi => vi.status !== 'paid' && vi.status !== 'cancelled')
      .reduce((sum, vi) => sum + vi.totalAmount, 0)
    
    const totalVendorPaid = vendorInvoices
      .filter(vi => vi.status === 'paid')
      .reduce((sum, vi) => sum + vi.totalAmount, 0)
    
    const overdueVendorInvoices = vendorInvoices.filter(vi => {
      const now = new Date()
      return vi.status !== 'paid' && 
             vi.status !== 'cancelled' && 
             new Date(vi.dueDate) < now
    })
    
    const totalOverdue = overdueVendorInvoices.reduce((sum, vi) => sum + vi.totalAmount, 0)
    
    const thisMonth = new Date()
    const thisMonthInvoices = vendorInvoices.filter(vi => {
      const invoiceDate = new Date(vi.issueDate)
      return invoiceDate.getMonth() === thisMonth.getMonth() && 
             invoiceDate.getFullYear() === thisMonth.getFullYear()
    })
    const thisMonthExpenses = thisMonthInvoices
      .filter(vi => vi.status === 'paid')
      .reduce((sum, vi) => sum + vi.totalAmount, 0)

    return {
      totalVendorOutstanding,
      totalVendorPaid,
      totalOverdue,
      overdueCount: overdueVendorInvoices.length,
      thisMonthExpenses,
      totalInvoices: vendorInvoices.length
    }
  }, [vendorInvoices])

  // Filter vendor invoices
  const filteredVendorInvoices = useMemo(() => {
    return vendorInvoices.filter(vendorInvoice => {
      const vendor = vendors.find(v => v.id === vendorInvoice.vendorId)
      const project = projects.find(p => p.id === vendorInvoice.projectId)
      
      const matchesSearch = !searchTerm || 
        vendorInvoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project?.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || vendorInvoice.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [vendorInvoices, vendors, projects, searchTerm, statusFilter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency', currency: 'SGD'
    }).format(amount)
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUploadSubmit = async () => {
    if (!selectedFile) return
    
    setIsUploading(true)
    try {
      // Process the file with OCR
      const ocrResult = await ocrService.processInvoice(selectedFile)
      
      if (ocrResult.success && ocrResult.data) {
        // Create a new vendor invoice from the OCR data
        const newVendorInvoice = addVendorInvoice({
          vendorId: '', // This would be set after vendor matching
          amount: ocrResult.data.subtotal || 0,
          gstAmount: ocrResult.data.taxAmount || 0,
          totalAmount: ocrResult.data.totalAmount || 0,
          issueDate: ocrResult.data.issueDate ? new Date(ocrResult.data.issueDate) : new Date(),
          dueDate: ocrResult.data.dueDate ? new Date(ocrResult.data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          fileName: selectedFile.name,
          status: 'processing',
          processedData: ocrResult.data
        })
        
        setSuccessMessage('Invoice uploaded and processed successfully!')
      } else {
        // Create a new vendor invoice with minimal data
        const newVendorInvoice = addVendorInvoice({
          vendorId: '',
          amount: 0,
          gstAmount: 0,
          totalAmount: 0,
          fileName: selectedFile.name,
          status: 'processing'
        })
        
        setSuccessMessage('Invoice uploaded successfully! Processing will begin shortly.')
      }
      
      setShowUploadModal(false)
      setSelectedFile(null)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error uploading invoice:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteVendorInvoice = (vendorInvoice: VendorInvoice) => {
    if (confirm(`Are you sure you want to delete vendor invoice ${vendorInvoice.invoiceNumber}?`)) {
      deleteVendorInvoice(vendorInvoice.id)
      setSuccessMessage('Vendor invoice deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Invoices</h1>
            <p className="text-gray-600">Manage vendor invoices and outgoing payments</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Invoice</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Manual Entry</span>
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

        {/* Vendor Invoice Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.totalVendorOutstanding)}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {vendorInvoices.filter(vi => vi.status !== 'paid' && vi.status !== 'cancelled').length} unpaid invoices
            </p>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalVendorPaid)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {vendorInvoices.filter(vi => vi.status === 'paid').length} payments made
            </p>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(metrics.totalOverdue)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {metrics.overdueCount} overdue invoices
            </p>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.thisMonthExpenses)}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {vendorInvoices.filter(vi => {
                const invoiceDate = new Date(vi.issueDate)
                const thisMonth = new Date()
                return invoiceDate.getMonth() === thisMonth.getMonth() && 
                       invoiceDate.getFullYear() === thisMonth.getFullYear()
              }).length} invoices this month
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendor invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VendorInvoiceStatus | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
            >
              <option value="all">All Statuses</option>
              {Object.entries(VENDOR_INVOICE_STATUS_COLORS).map(([status, colorClass]) => (
                <option key={status} value={status}>
                  {VENDOR_INVOICE_STATUS_LABELS[status as VendorInvoiceStatus]}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                activeTab === 'all' 
                  ? "bg-ampere-100 text-ampere-700" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              All Invoices
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                activeTab === 'pending' 
                  ? "bg-ampere-100 text-ampere-700" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Pending
            </button>
            <button 
              onClick={() => setActiveTab('approved')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                activeTab === 'approved' 
                  ? "bg-ampere-100 text-ampere-700" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Approved
            </button>
            <button 
              onClick={() => setActiveTab('paid')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                activeTab === 'paid' 
                  ? "bg-ampere-100 text-ampere-700" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Paid
            </button>
          </div>
        </div>

        {/* Vendor Invoices List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVendorInvoices.map(vendorInvoice => (
            <Link 
              key={vendorInvoice.id} 
              href={`/finance/vendor-invoices/${vendorInvoice.id}`}
              className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">{vendorInvoice.invoiceNumber}</h3>
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      VENDOR_INVOICE_STATUS_COLORS[vendorInvoice.status]
                    )}>
                      {VENDOR_INVOICE_STATUS_LABELS[vendorInvoice.status]}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{getVendorName(vendorInvoice.vendorId)}</p>
                  <p className="text-sm text-gray-500 mt-1">{getProjectName(vendorInvoice.projectId)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatCurrency(vendorInvoice.totalAmount)}</p>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(vendorInvoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Issued: {new Date(vendorInvoice.issueDate).toLocaleDateString()}</span>
                  {vendorInvoice.fileName && (
                    <span className="flex items-center space-x-1">
                      <Download className="h-4 w-4" />
                      <span>{vendorInvoice.fileName}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteVendorInvoice(vendorInvoice)
                    }}
                    className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Overdue indicator */}
              {vendorInvoice.status === 'overdue' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      {Math.ceil((Date.now() - new Date(vendorInvoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                    </span>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {filteredVendorInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Vendor Invoices Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by uploading your first vendor invoice or creating a manual entry.'
              }
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button 
                onClick={() => setShowUploadModal(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Invoice</span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Manual Entry</span>
              </button>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Vendor Invoice</h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedFile ? selectedFile.name : 'Drag and drop your invoice file here'}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">PDF, JPG, PNG up to 10MB</p>
                  <label className="btn-secondary cursor-pointer">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                    Select File
                  </label>
                </div>
                
                {selectedFile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedFile(null)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setSelectedFile(null)
                  }}
                  className="btn-secondary"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  className="btn-primary"
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload & Process'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}