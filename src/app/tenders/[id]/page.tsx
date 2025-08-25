'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/contexts/ClientContext'
import { useTenders } from '@/contexts/TenderContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TenderForm from '@/components/forms/TenderForm'
import DocumentUploadForm from '@/components/forms/DocumentUploadForm'
import { Tender, TenderType, TenderStatus, Document } from '@/types'
import { 
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  FileText,
  Target,
  TrendingUp,
  Building,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Upload,
  Plus,
  X,
  Lock,
  Eye,
  Trash2
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

type TabType = 'overview' | 'documents' | 'timeline'

export default function TenderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { clients } = useClients()
  const { getTender, updateTender, addDocumentsToTender, removeDocumentFromTender } = useTenders()
  const [tender, setTender] = useState<Tender | null>(null)
  const [client, setClient] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const tenderId = params.id as string

  useEffect(() => {
    if (tenderId) {
      const foundTender = getTender(tenderId)
      if (foundTender) {
        setTender(foundTender)
        const foundClient = clients.find(c => c.id === foundTender.clientId)
        setClient(foundClient)
      }
    }
  }, [tenderId, getTender, clients])

  if (!user) return null

  if (!tender) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tender Not Found</h3>
          <p className="text-gray-600 mb-4">The tender you're looking for doesn't exist or has been removed.</p>
          <Link href="/tenders" className="btn-primary">
            Back to Tenders
          </Link>
        </div>
      </DashboardLayout>
    )
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

  const handleEditTender = () => {
    setShowEditForm(true)
  }

  const handleSaveTender = async (tenderData: Partial<Tender>) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateTender(tender.id, tenderData)
      setTender({ ...tender, ...tenderData, updatedAt: new Date() })
      setSuccessMessage('Tender updated successfully!')
      setShowEditForm(false)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error updating tender:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentUpload = async (documents: Partial<Document>[]) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const success = addDocumentsToTender(tender.id, documents)
      if (success) {
        // Refresh tender data to show new documents
        const updatedTender = getTender(tender.id)
        if (updatedTender) {
          setTender(updatedTender)
        }
        setSuccessMessage(`${documents.length} document(s) uploaded successfully!`)
        setShowDocumentUpload(false)
        
        setTimeout(() => {
          setSuccessMessage('')
        }, 3000)
      }
    } catch (error) {
      console.error('Error uploading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    const document = tender.documents?.find(doc => doc.id === documentId)
    if (!document) return
    
    if (confirm(`Are you sure you want to delete "${document.name}"?`)) {
      const success = removeDocumentFromTender(tender.id, documentId)
      if (success) {
        // Refresh tender data
        const updatedTender = getTender(tender.id)
        if (updatedTender) {
          setTender(updatedTender)
        }
        setSuccessMessage('Document deleted successfully!')
        setTimeout(() => {
          setSuccessMessage('')
        }, 3000)
      }
    }
  }

  const daysUntilDeadline = getDaysUntilDeadline(tender.submissionDeadline)

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/tenders"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tender.title}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  TENDER_STATUS_COLORS[tender.status]
                )}>
                  {tender.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {TENDER_TYPE_LABELS[tender.type]}
                </span>
                {client && (
                  <span className="text-sm text-gray-600">{client.name}</span>
                )}
              </div>
            </div>
          </div>
          
          {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'sales') && (
            <button 
              onClick={handleEditTender}
              className="btn-primary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Tender</span>
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

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estimated Value</p>
                <p className="text-2xl font-bold text-ampere-600">{formatCurrency(tender.estimatedValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Days to Deadline</p>
                <p className={cn(
                  "text-2xl font-bold",
                  daysUntilDeadline < 0 ? "text-red-600" : 
                  daysUntilDeadline <= 7 ? "text-orange-600" : "text-blue-600"
                )}>
                  {daysUntilDeadline < 0 ? Math.abs(daysUntilDeadline) + ' overdue' : daysUntilDeadline}
                </p>
              </div>
              <Clock className={cn(
                "h-8 w-8",
                daysUntilDeadline < 0 ? "text-red-600" : 
                daysUntilDeadline <= 7 ? "text-orange-600" : "text-blue-600"
              )} />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Probability</p>
                <p className="text-2xl font-bold text-green-600">{tender.winProbability}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Competitors</p>
                <p className="text-2xl font-bold text-gray-900">{tender.competitorCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
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
                onClick={() => setActiveTab('documents')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'documents'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Documents</span>
                  {tender.documents && tender.documents.length > 0 && (
                    <span className="bg-ampere-100 text-ampere-600 text-xs rounded-full px-2 py-1">
                      {tender.documents.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'timeline'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Timeline</span>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                        <p className="text-gray-900">{tender.description}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                        <div className="flex items-center space-x-2 text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{tender.location.street}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 text-sm mt-1">
                          <span>📮 {tender.location.postalCode}</span>
                          {tender.location.district && <span>• {tender.location.district}</span>}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Submission Deadline</label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className={cn(
                            "font-medium",
                            daysUntilDeadline < 0 ? "text-red-600" : 
                            daysUntilDeadline <= 7 ? "text-orange-600" : "text-gray-900"
                          )}>
                            {new Date(tender.submissionDeadline).toLocaleDateString('en-SG', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
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
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Competition Analysis</label>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Competitors:</span>
                            <span className="font-medium">{tender.competitorCount || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Win Probability:</span>
                            <span className="font-medium text-green-600">{tender.winProbability}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                {tender.requirements && tender.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {tender.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-ampere-600 font-bold text-sm mt-0.5">•</span>
                            <span className="text-gray-900">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Project Timeline */}
                {(tender.startDate || tender.completionDate) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tender.startDate && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Project Start</span>
                          </div>
                          <p className="font-medium">{new Date(tender.startDate).toLocaleDateString('en-SG')}</p>
                        </div>
                      )}
                      {tender.completionDate && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Expected Completion</span>
                          </div>
                          <p className="font-medium">{new Date(tender.completionDate).toLocaleDateString('en-SG')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                  {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'sales') && (
                    <button 
                      onClick={() => setShowDocumentUpload(true)}
                      className="btn-primary flex items-center space-x-2"
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Document</span>
                    </button>
                  )}
                </div>

                {tender.documents && tender.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tender.documents.map((doc) => {
                      const getDocumentIcon = (type: string) => {
                        switch (type) {
                          case 'contract': return FileText
                          case 'drawing': return FileText
                          case 'permit': return FileText
                          case 'certificate': return FileText
                          case 'invoice': return FileText
                          case 'photo': return FileText
                          case 'report': return FileText
                          default: return FileText
                        }
                      }
                      
                      const Icon = getDocumentIcon(doc.type)
                      
                      return (
                        <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Icon className="h-5 w-5 text-ampere-600" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                  <span className="capitalize">{doc.type}</span>
                                  <span>•</span>
                                  <span>{((doc.size || 0) / 1024).toFixed(1)} KB</span>
                                  {doc.isConfidential && (
                                    <>
                                      <span>•</span>
                                      <span className="text-red-600 font-medium flex items-center">
                                        <Lock className="h-3 w-3 mr-1" />
                                        Confidential
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                title="View Document"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                title="Download Document"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              {(user.role === 'super_admin' || user.role === 'admin') && (
                                <button 
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  title="Delete Document"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-100 pt-3">
                            <div className="text-xs text-gray-500">
                              <p>Uploaded by {doc.uploadedBy}</p>
                              <p>{new Date(doc.uploadedAt).toLocaleDateString('en-SG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Documents</h4>
                    <p className="text-gray-600 mb-4">No documents have been uploaded for this tender yet.</p>
                    {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'sales') && (
                      <button 
                        onClick={() => setShowDocumentUpload(true)}
                        className="btn-primary"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload First Document
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Timeline & Activities</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Tender Created</p>
                      <p className="text-sm text-gray-600">
                        {new Date(tender.createdAt).toLocaleDateString('en-SG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {new Date(tender.updatedAt).toLocaleDateString('en-SG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      daysUntilDeadline < 0 ? "bg-red-500" : 
                      daysUntilDeadline <= 7 ? "bg-orange-500" : "bg-gray-400"
                    )}></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Submission Deadline</p>
                      <p className="text-sm text-gray-600">
                        {new Date(tender.submissionDeadline).toLocaleDateString('en-SG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {daysUntilDeadline < 0 && (
                        <p className="text-sm text-red-600 font-medium">
                          ⚠️ {Math.abs(daysUntilDeadline)} days overdue
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
      <TenderForm
        tender={tender}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleSaveTender}
        mode="edit"
        isLoading={isLoading}
      />
      
      {/* Document Upload Modal */}
      <DocumentUploadForm
        isOpen={showDocumentUpload}
        onClose={() => setShowDocumentUpload(false)}
        onUpload={handleDocumentUpload}
        tenderId={tender.id}
        existingDocuments={tender.documents || []}
        isLoading={isLoading}
      />
    </DashboardLayout>
  )
}