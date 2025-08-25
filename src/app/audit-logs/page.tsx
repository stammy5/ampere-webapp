'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuditLog } from '@/contexts/AuditLogContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { AuditLog, AuditAction, AuditEntityType, AuditLogFilter, UserRole } from '@/types'
import { 
  Search, Filter, Download, RefreshCw, Calendar, User, Shield, 
  Activity, Clock, ChevronDown, Eye, FileText, Database,
  AlertTriangle, CheckCircle, X, BarChart3, TrendingUp,
  Users, Building, FileCheck, DollarSign, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTION_COLORS: Record<AuditAction, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN: 'bg-purple-100 text-purple-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  VIEW: 'bg-indigo-100 text-indigo-800',
  EXPORT: 'bg-orange-100 text-orange-800',
  IMPORT: 'bg-yellow-100 text-yellow-800',
  APPROVE: 'bg-emerald-100 text-emerald-800',
  REJECT: 'bg-red-100 text-red-800',
  SEND: 'bg-blue-100 text-blue-800',
  CANCEL: 'bg-gray-100 text-gray-800',
  RESTORE: 'bg-green-100 text-green-800',
  ACTIVATE: 'bg-green-100 text-green-800',
  DEACTIVATE: 'bg-red-100 text-red-800'
}

const ENTITY_ICONS: Record<AuditEntityType, React.ElementType> = {
  USER: Users,
  CLIENT: Building,
  PROJECT: FileCheck,
  TENDER: FileText,
  QUOTATION: FileText,
  INVOICE: DollarSign,
  PAYMENT: DollarSign,
  VENDOR: Building,
  REPORT: BarChart3,
  SETTINGS: Settings,
  CLIENT_TYPE: Settings,
  SYSTEM: Database
}

const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  LOGIN: 'Logged In',
  LOGOUT: 'Logged Out',
  VIEW: 'Viewed',
  EXPORT: 'Exported',
  IMPORT: 'Imported',
  APPROVE: 'Approved',
  REJECT: 'Rejected',
  SEND: 'Sent',
  CANCEL: 'Cancelled',
  RESTORE: 'Restored',
  ACTIVATE: 'Activated',
  DEACTIVATE: 'Deactivated'
}

const ENTITY_LABELS: Record<AuditEntityType, string> = {
  USER: 'User',
  CLIENT: 'Client',
  PROJECT: 'Project',
  TENDER: 'Tender',
  QUOTATION: 'Quotation',
  INVOICE: 'Invoice',
  PAYMENT: 'Payment',
  VENDOR: 'Vendor',
  REPORT: 'Report',
  SETTINGS: 'Settings',
  CLIENT_TYPE: 'Client Type',
  SYSTEM: 'System'
}

export default function AuditLogsPage() {
  const { user } = useAuth()
  const { getAuditLogs, getAuditLogSummary, exportAuditLogs, clearAuditLogs } = useAuditLog()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState<AuditAction | 'all'>('all')
  const [selectedEntityType, setSelectedEntityType] = useState<AuditEntityType | 'all'>('all')
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | 'all'>('all')
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const [activeTab, setActiveTab] = useState('logs')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Check if user is super admin
  if (!user || user.role !== 'super_admin') {
    return (
      <DashboardLayout user={user!}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">Only Super Administrators can access audit logs.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Get filtered audit logs
  const filteredLogs = useMemo(() => {
    const filter: AuditLogFilter = {
      searchTerm: searchTerm || undefined,
      action: selectedAction !== 'all' ? selectedAction : undefined,
      entityType: selectedEntityType !== 'all' ? selectedEntityType : undefined,
      userRole: selectedUserRole !== 'all' ? selectedUserRole : undefined,
      dateFrom: dateRange.from ? new Date(dateRange.from) : undefined,
      dateTo: dateRange.to ? new Date(dateRange.to) : undefined
    }
    return getAuditLogs(filter)
  }, [searchTerm, selectedAction, selectedEntityType, selectedUserRole, dateRange, getAuditLogs])

  // Get audit summary
  const summary = useMemo(() => getAuditLogSummary(), [getAuditLogSummary])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const filter: AuditLogFilter = {
        searchTerm: searchTerm || undefined,
        action: selectedAction !== 'all' ? selectedAction : undefined,
        entityType: selectedEntityType !== 'all' ? selectedEntityType : undefined,
        userRole: selectedUserRole !== 'all' ? selectedUserRole : undefined,
        dateFrom: dateRange.from ? new Date(dateRange.from) : undefined,
        dateTo: dateRange.to ? new Date(dateRange.to) : undefined
      }
      
      const exportData = exportAuditLogs(filter)
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      alert('Failed to export audit logs. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      clearAuditLogs()
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(timestamp)
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600">Track all system changes and user activities</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
            
            <button
              onClick={handleClearLogs}
              className="btn-danger flex items-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Clear Logs</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('logs')}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'logs'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Activity className="h-4 w-4" />
                <span>Activity Logs ({filteredLogs.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'summary'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Summary & Analytics</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'logs' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Search logs..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Action Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value as AuditAction | 'all')}
                      >
                        <option value="all">All Actions</option>
                        {Object.entries(ACTION_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Entity Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Entity</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                        value={selectedEntityType}
                        onChange={(e) => setSelectedEntityType(e.target.value as AuditEntityType | 'all')}
                      >
                        <option value="all">All Entities</option>
                        {Object.entries(ENTITY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* User Role Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                        value={selectedUserRole}
                        onChange={(e) => setSelectedUserRole(e.target.value as UserRole | 'all')}
                      >
                        <option value="all">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="finance">Finance</option>
                        <option value="projects">Projects</option>
                        <option value="sales">Sales</option>
                      </select>
                    </div>

                    {/* Date From */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                        value={dateRange.from}
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      />
                    </div>

                    {/* Date To */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                        value={dateRange.to}
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {filteredLogs.length} of {summary.totalLogs} logs
                    </div>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedAction('all')
                        setSelectedEntityType('all')
                        setSelectedUserRole('all')
                        setDateRange({ from: '', to: '' })
                      }}
                      className="text-sm text-ampere-600 hover:text-ampere-800"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Audit Log List */}
                <div className="space-y-3">
                  {filteredLogs.map((log) => {
                    const EntityIcon = ENTITY_ICONS[log.entityType]
                    return (
                      <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <EntityIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={cn(
                                  "px-2 py-1 text-xs font-medium rounded-full",
                                  ACTION_COLORS[log.action]
                                )}>
                                  {ACTION_LABELS[log.action]}
                                </span>
                                <span className="text-sm text-gray-600">{ENTITY_LABELS[log.entityType]}</span>
                                {log.entityName && (
                                  <span className="text-sm font-medium text-gray-900">"{log.entityName}"</span>
                                )}
                              </div>
                              
                              <div className="text-sm text-gray-600 mb-2">
                                by <span className="font-medium text-gray-900">{log.userName}</span> 
                                <span className="text-xs text-gray-500 ml-2">({log.userRole})</span>
                              </div>
                              
                              {log.details && (
                                <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                              )}
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTimestamp(log.timestamp)}</span>
                                </span>
                                {log.changes && log.changes.length > 0 && (
                                  <span className="text-blue-600">{log.changes.length} field(s) changed</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  
                  {filteredLogs.length === 0 && (
                    <div className="text-center py-12">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
                      <p className="text-gray-600">Try adjusting your search filters.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="metric-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Logs</p>
                        <p className="text-2xl font-bold text-gray-900">{summary.totalLogs}</p>
                      </div>
                      <Database className="h-8 w-8 text-ampere-600" />
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Today</p>
                        <p className="text-2xl font-bold text-green-600">{summary.todayLogs}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">This Week</p>
                        <p className="text-2xl font-bold text-blue-600">{summary.weekLogs}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">This Month</p>
                        <p className="text-2xl font-bold text-purple-600">{summary.monthLogs}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Activity Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* By Action */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity by Action</h3>
                    <div className="space-y-3">
                      {Object.entries(summary.byAction)
                        .filter(([_, count]) => count > 0)
                        .sort(([,a], [,b]) => b - a)
                        .map(([action, count]) => (
                          <div key={action} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={cn(
                                "px-2 py-1 text-xs font-medium rounded-full",
                                ACTION_COLORS[action as AuditAction]
                              )}>
                                {ACTION_LABELS[action as AuditAction]}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* By Entity Type */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity by Entity</h3>
                    <div className="space-y-3">
                      {Object.entries(summary.byEntityType)
                        .filter(([_, count]) => count > 0)
                        .sort(([,a], [,b]) => b - a)
                        .map(([entityType, count]) => {
                          const EntityIcon = ENTITY_ICONS[entityType as AuditEntityType]
                          return (
                            <div key={entityType} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <EntityIcon className="h-4 w-4 text-gray-600" />
                                <span className="text-sm text-gray-900">{ENTITY_LABELS[entityType as AuditEntityType]}</span>
                              </div>
                              <span className="font-medium text-gray-900">{count}</span>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>

                {/* Most Active Users */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users</h3>
                  <div className="space-y-3">
                    {summary.byUser.map((userStat) => (
                      <div key={userStat.userId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-900">{userStat.userName}</span>
                        </div>
                        <span className="font-medium text-gray-900">{userStat.count} activities</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setSelectedLog(null)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
                  <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Action</label>
                    <div className="mt-1">
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        ACTION_COLORS[selectedLog.action]
                      )}>
                        {ACTION_LABELS[selectedLog.action]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Entity Type</label>
                    <p className="mt-1 text-sm text-gray-900">{ENTITY_LABELS[selectedLog.entityType]}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Entity Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.entityName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">User</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.userName} ({selectedLog.userRole})</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">IP Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.ipAddress || 'N/A'}</p>
                  </div>
                </div>

                {selectedLog.details && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Details</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.details}</p>
                  </div>
                )}

                {selectedLog.changes && selectedLog.changes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Changes</label>
                    <div className="mt-2 space-y-2">
                      {selectedLog.changes.map((change, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-medium text-sm text-gray-900 mb-1">
                            {change.fieldLabel || change.field}
                          </div>
                          <div className="text-xs text-gray-600">
                            <div className="flex items-center space-x-2">
                              <span>From:</span>
                              <code className="bg-red-100 text-red-800 px-1 rounded">
                                {String(change.oldValue) || 'null'}
                              </code>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span>To:</span>
                              <code className="bg-green-100 text-green-800 px-1 rounded">
                                {String(change.newValue) || 'null'}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}