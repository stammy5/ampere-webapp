'use client'

import { useState, useRef } from 'react'
import { Document, DocumentType } from '@/types'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Upload, X, FileText, Image, File, AlertCircle, CheckCircle, 
  Download, Trash2, Eye, Lock, Unlock
} from 'lucide-react'

interface DocumentUploadFormProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (documents: Partial<Document>[]) => Promise<void>
  tenderId: string
  existingDocuments?: Document[]
  isLoading?: boolean
}

const DOCUMENT_TYPES: { value: DocumentType; label: string; icon: any }[] = [
  { value: 'contract', label: 'Contract', icon: FileText },
  { value: 'drawing', label: 'Drawing', icon: Image },
  { value: 'permit', label: 'Permit', icon: FileText },
  { value: 'certificate', label: 'Certificate', icon: FileText },
  { value: 'invoice', label: 'Invoice', icon: FileText },
  { value: 'photo', label: 'Photo', icon: Image },
  { value: 'report', label: 'Report', icon: FileText },
  { value: 'other', label: 'Other', icon: File }
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.dwg', '.zip', '.rar']

interface FileUpload {
  file: File
  id: string
  name: string
  type: DocumentType
  isConfidential: boolean
  progress: number
  error?: string
  uploaded: boolean
}

export default function DocumentUploadForm({
  isOpen,
  onClose,
  onUpload,
  tenderId,
  existingDocuments = [],
  isLoading = false
}: DocumentUploadFormProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileUpload[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  if (!isOpen) return null

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileExtension = (filename: string): string => {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'))
  }

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    
    const extension = getFileExtension(file.name)
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `File type ${extension} is not allowed`
    }
    
    return null
  }

  const getDocumentTypeIcon = (type: DocumentType) => {
    const docType = DOCUMENT_TYPES.find(dt => dt.value === type)
    return docType ? docType.icon : File
  }

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: FileUpload[] = []
    
    Array.from(selectedFiles).forEach((file) => {
      const validation = validateFile(file)
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      newFiles.push({
        file,
        id: fileId,
        name: file.name,
        type: 'other',
        isConfidential: false,
        progress: 0,
        error: validation || undefined,
        uploaded: false
      })
    })

    setFiles(prev => [...prev, ...newFiles])
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const updateFileProperty = (fileId: string, property: keyof FileUpload, value: any) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, [property]: value } : f
    ))
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleUpload = async () => {
    const validFiles = files.filter(f => !f.error && !f.uploaded)
    if (validFiles.length === 0) return

    setUploading(true)

    try {
      // Simulate file upload progress
      for (const fileUpload of validFiles) {
        for (let progress = 0; progress <= 100; progress += 20) {
          updateFileProperty(fileUpload.id, 'progress', progress)
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        updateFileProperty(fileUpload.id, 'uploaded', true)
      }

      // Prepare document data for saving
      const documents: Partial<Document>[] = validFiles.map(fileUpload => ({
        name: fileUpload.name,
        type: fileUpload.type,
        size: fileUpload.file.size,
        uploadedBy: user?.id || '',
        uploadedAt: new Date(),
        url: `#`, // In real implementation, this would be the actual file URL
        tenderId: tenderId,
        isConfidential: fileUpload.isConfidential
      }))

      await onUpload(documents)
      onClose()
      setFiles([])
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const hasValidFiles = files.some(f => !f.error && !f.uploaded)

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
              <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* File Drop Zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive ? "border-ampere-500 bg-ampere-50" : "border-gray-300 hover:border-gray-400"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to browse
              </h4>
              <p className="text-gray-600 mb-4">
                Supports: {ALLOWED_EXTENSIONS.join(', ')} (Max size: 10MB)
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                accept={ALLOWED_EXTENSIONS.join(',')}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Selected Files</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {files.map((fileUpload) => {
                    const Icon = getDocumentTypeIcon(fileUpload.type)
                    return (
                      <div key={fileUpload.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 text-gray-400 mt-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-gray-900 truncate">{fileUpload.name}</p>
                              {!fileUpload.uploaded && (
                                <button
                                  onClick={() => removeFile(fileUpload.id)}
                                  className="text-gray-400 hover:text-red-600 ml-2"
                                  disabled={uploading}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Document Type
                                </label>
                                <select
                                  value={fileUpload.type}
                                  onChange={(e) => updateFileProperty(fileUpload.id, 'type', e.target.value)}
                                  className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-ampere-500 focus:border-ampere-500"
                                  disabled={uploading || fileUpload.uploaded}
                                >
                                  {DOCUMENT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`confidential-${fileUpload.id}`}
                                  checked={fileUpload.isConfidential}
                                  onChange={(e) => updateFileProperty(fileUpload.id, 'isConfidential', e.target.checked)}
                                  className="rounded border-gray-300 text-ampere-600 focus:ring-ampere-500"
                                  disabled={uploading || fileUpload.uploaded}
                                />
                                <label htmlFor={`confidential-${fileUpload.id}`} className="text-xs text-gray-600">
                                  Confidential
                                </label>
                                {fileUpload.isConfidential ? (
                                  <Lock className="h-3 w-3 text-red-600" />
                                ) : (
                                  <Unlock className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                Size: {formatFileSize(fileUpload.file.size)}
                              </div>
                            </div>

                            {/* Progress Bar */}
                            {uploading && !fileUpload.uploaded && !fileUpload.error && (
                              <div className="mb-2">
                                <div className="bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-ampere-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${fileUpload.progress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Uploading... {fileUpload.progress}%
                                </p>
                              </div>
                            )}

                            {/* Error */}
                            {fileUpload.error && (
                              <div className="flex items-center space-x-2 text-red-600 text-xs">
                                <AlertCircle className="h-3 w-3" />
                                <span>{fileUpload.error}</span>
                              </div>
                            )}

                            {/* Success */}
                            {fileUpload.uploaded && (
                              <div className="flex items-center space-x-2 text-green-600 text-xs">
                                <CheckCircle className="h-3 w-3" />
                                <span>Uploaded successfully</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Existing Documents */}
            {existingDocuments.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Existing Documents</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {existingDocuments.map((doc) => {
                    const Icon = getDocumentTypeIcon(doc.type)
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.type} • {formatFileSize(doc.size)}
                              {doc.isConfidential && <span className="text-red-600 ml-1">• Confidential</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {files.length > 0 && (
                <span>{files.filter(f => !f.error).length} file(s) ready to upload</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                className="btn-primary"
                disabled={!hasValidFiles || uploading || isLoading}
              >
                {uploading ? 'Uploading...' : `Upload ${files.filter(f => !f.error && !f.uploaded).length} File(s)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}