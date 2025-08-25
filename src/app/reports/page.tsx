'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useReports } from '@/contexts/ReportsContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Report, ReportParameters } from '@/types'
import { 
  FileBarChart, Plus, Search, Filter, Download, Eye, Calendar, 
  BarChart3, TrendingUp, PieChart, Users, Building, DollarSign,
  Clock, Activity, FileText, CheckCircle, X, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const REPORT_TYPE_LABELS: Record<string, string> = {
  financial_summary: 'Financial Summary',
  project_analytics: 'Project Analytics',
  client_performance: 'Client Performance',
  vendor_analysis: 'Vendor Analysis',
  tender_success: 'Tender Success',
  cash_flow: 'Cash Flow Analysis',
  profitability: 'Profitability Report',
  aging_report: 'Aging Report',
  performance_metrics: 'Performance Metrics'
}

const REPORT_CATEGORY_COLORS: Record<string, string> = {
  financial: 'bg-green-100 text-green-800',
  operational: 'bg-blue-100 text-blue-800',
  analytics: 'bg-purple-100 text-purple-800',
  compliance: 'bg-orange-100 text-orange-800'
}

const REPORT_STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  generating: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  scheduled: 'bg-blue-100 text-blue-800'
}

export default function ReportsPage() {
  const { user } = useAuth()
  const { 
    reports, 
    generateReport, 
    deleteReport, 
    getReportsByCategory, 
    getRecentReports 
  } = useReports()

  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'operational' | 'analytics'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  // Generate report parameters for quick generation
  const quickReportParams: ReportParameters = {
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
      endDate: new Date()
    },
    filters: {},
    groupBy: 'month',
    includeGST: true
  }

  // Filter reports based on search and active tab
  const filteredReports = useMemo(() => {
    let filtered = reports

    // Filter by category if not overview
    if (activeTab !== 'overview') {
      filtered = getReportsByCategory(activeTab)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        REPORT_TYPE_LABELS[report.type]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
  }, [reports, activeTab, searchTerm, getReportsByCategory])

  // Calculate report statistics
  const reportStats = useMemo(() => {
    const total = reports.length
    const byCategory = {
      financial: getReportsByCategory('financial').length,
      operational: getReportsByCategory('operational').length,
      analytics: getReportsByCategory('analytics').length,
      compliance: getReportsByCategory('compliance').length
    }
    const completed = reports.filter(r => r.status === 'completed').length
    const thisMonth = reports.filter(r => {
      const reportDate = new Date(r.generatedAt)
      const now = new Date()
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
    }).length

    return { total, byCategory, completed, thisMonth }
  }, [reports, getReportsByCategory])

  const handleGenerateQuickReport = async (reportType: string) => {
    setGeneratingReport(reportType)
    try {
      // Simulate report generation time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newReport = generateReport(reportType, quickReportParams)
      setSuccessMessage(`${REPORT_TYPE_LABELS[reportType]} generated successfully!`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setGeneratingReport(null)
    }
  }

  const handleDeleteReport = (report: Report) => {
    if (confirm(`Are you sure you want to delete "${report.title}"?`)) {
      deleteReport(report.id)
      setSuccessMessage('Report deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const canManageReports = user?.role === 'super_admin' || user?.role === 'admin' || 
                           user?.role === 'finance' || user?.role === 'projects'

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Generate and view comprehensive business reports and analytics</p>
          </div>
          
          {canManageReports && (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowGenerateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Generate Report</span>
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
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-600 hover:text-green-800 p-1 rounded-lg hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Report Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reportStats.total}</p>
              </div>
              <FileBarChart className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {reportStats.completed} completed
            </p>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Financial Reports</p>
                <p className="text-2xl font-bold text-green-600">{reportStats.byCategory.financial}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Revenue & profitability
            </p>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Operational</p>
                <p className="text-2xl font-bold text-blue-600">{reportStats.byCategory.operational}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Projects & vendors
            </p>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">{reportStats.thisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Reports generated
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        {canManageReports && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => handleGenerateQuickReport('financial_summary')}
                disabled={generatingReport === 'financial_summary'}
                className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Financial Summary</p>
                    <p className="text-sm text-gray-600">Revenue & expenses</p>
                  </div>
                </div>
                {generatingReport === 'financial_summary' && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span className="text-sm text-green-600">Generating...</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => handleGenerateQuickReport('project_analytics')}
                disabled={generatingReport === 'project_analytics'}
                className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Project Analytics</p>
                    <p className="text-sm text-gray-600">Performance metrics</p>
                  </div>
                </div>
                {generatingReport === 'project_analytics' && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-600">Generating...</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => handleGenerateQuickReport('client_performance')}
                disabled={generatingReport === 'client_performance'}
                className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Client Performance</p>
                    <p className="text-sm text-gray-600">Payment patterns</p>
                  </div>
                </div>
                {generatingReport === 'client_performance' && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span className="text-sm text-purple-600">Generating...</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => handleGenerateQuickReport('vendor_analysis')}
                disabled={generatingReport === 'vendor_analysis'}
                className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Vendor Analysis</p>
                    <p className="text-sm text-gray-600">Performance ratings</p>
                  </div>
                </div>
                {generatingReport === 'vendor_analysis' && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                    <span className="text-sm text-orange-600">Generating...</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'overview'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <FileBarChart className="h-4 w-4" />
                <span>All Reports ({reports.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('financial')}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'financial'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <DollarSign className="h-4 w-4" />
                <span>Financial ({reportStats.byCategory.financial})</span>
              </button>
              <button
                onClick={() => setActiveTab('operational')}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'operational'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Activity className="h-4 w-4" />
                <span>Operational ({reportStats.byCategory.operational})</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'analytics'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Analytics ({reportStats.byCategory.analytics})</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Search and Filters */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                  />
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.length > 0 ? (
                filteredReports.map(report => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{report.title}</h3>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            REPORT_CATEGORY_COLORS[report.category]
                          )}>
                            {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                          </span>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            REPORT_STATUS_COLORS[report.status]
                          )}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Type: {REPORT_TYPE_LABELS[report.type]}</span>
                          <span>•</span>
                          <span>Generated: {new Date(report.generatedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Period: {new Date(report.parameters.dateRange.startDate).toLocaleDateString()} - {new Date(report.parameters.dateRange.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/reports/${report.id}`}
                          className="text-ampere-600 hover:text-ampere-900 p-2 rounded-lg hover:bg-ampere-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
                          <Download className="h-4 w-4" />
                        </button>
                        {canManageReports && (
                          <button
                            onClick={() => handleDeleteReport(report)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileBarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search criteria.'
                      : 'Start by generating your first report using the quick actions above.'
                    }
                  </p>
                  {canManageReports && !searchTerm && (
                    <button onClick={() => setShowGenerateModal(true)} className="btn-primary">
                      Generate First Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}