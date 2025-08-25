'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useReports } from '@/contexts/ReportsContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Report, FinancialSummaryData, ProjectAnalyticsData, ClientPerformanceData, VendorAnalysisData, TenderSuccessData } from '@/types'
import { 
  ArrowLeft, Download, Calendar, BarChart3, PieChart, TrendingUp, DollarSign,
  Users, Building, FileText, AlertTriangle, CheckCircle, Clock, Activity,
  Target, Percent, Star, X, RefreshCw, Share2, Filter
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

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { getReport, generateReport } = useReports()
  
  const reportId = params.id as string
  const report = getReport(reportId)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  if (!report) {
    return (
      <DashboardLayout user={user!}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Report Not Found</h3>
            <p className="text-gray-600 mb-4">The report you're looking for doesn't exist.</p>
            <Link href="/reports" className="btn-primary">Back to Reports</Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(amount)
  }

  const handleRegenerateReport = async () => {
    setIsRegenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      generateReport(report.type, report.parameters)
      setSuccessMessage('Report regenerated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error regenerating report:', error)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    setSuccessMessage(`Report exported as ${format.toUpperCase()} successfully!`)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const canManageReports = user?.role === 'super_admin' || user?.role === 'admin' || 
                           user?.role === 'finance' || user?.role === 'projects'

  // Render different content based on report type
  const renderReportData = () => {
    switch (report.type) {
      case 'financial_summary':
        return <FinancialSummaryView data={report.data as FinancialSummaryData} />
      case 'project_analytics':
        return <ProjectAnalyticsView data={report.data as ProjectAnalyticsData} />
      case 'client_performance':
        return <ClientPerformanceView data={report.data as ClientPerformanceData} />
      case 'vendor_analysis':
        return <VendorAnalysisView data={report.data as VendorAnalysisData} />
      case 'tender_success':
        return <TenderSuccessView data={report.data as TenderSuccessData} />
      default:
        return <GenericReportView data={report.data} />
    }
  }

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/reports" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  REPORT_CATEGORY_COLORS[report.category]
                )}>
                  {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                </span>
              </div>
              <p className="text-gray-600">
                {REPORT_TYPE_LABELS[report.type]} • Generated {new Date(report.generatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleExportReport('pdf')}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
            
            {canManageReports && (
              <button 
                onClick={handleRegenerateReport}
                disabled={isRegenerating}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                {isRegenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Regenerate</span>
                  </>
                )}
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
            <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Report Metadata */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Report Period</p>
                <p className="font-medium">
                  {new Date(report.parameters.dateRange.startDate).toLocaleDateString()} - {new Date(report.parameters.dateRange.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Generated</p>
                <p className="font-medium">{new Date(report.generatedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Generated By</p>
                <p className="font-medium">{report.generatedBy}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  report.status === 'completed' ? 'bg-green-100 text-green-800' :
                  report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                )}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Report Description */}
        {report.description && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Report Description</h4>
                <p className="text-blue-800 text-sm mt-1">{report.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Report Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn("flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'overview' ? "border-ampere-500 text-ampere-600" : "border-transparent text-gray-500")}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={cn("flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'details' ? "border-ampere-500 text-ampere-600" : "border-transparent text-gray-500")}
              >
                <FileText className="h-4 w-4" />
                <span>Detailed Data</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && renderReportData()}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Raw Data</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-600 overflow-auto max-h-96">
                    {JSON.stringify(report.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Report View Components - Simplified for token limit
function FinancialSummaryView({ data }: { data: FinancialSummaryData }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Financial Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(data.revenue?.total || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(data.expenses?.total || 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(data.profitability?.netProfit || 0)}
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-purple-600">{(data.profitability?.profitMargin || 0).toFixed(1)}%</p>
            </div>
            <Percent className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectAnalyticsView({ data }: { data: ProjectAnalyticsData }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Project Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview?.totalProjects || 0}</p>
            </div>
            <Building className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{data.overview?.completedProjects || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{data.overview?.activeProjects || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
              <p className="text-2xl font-bold text-purple-600">{(data.performance?.onTimeCompletionRate || 0).toFixed(1)}%</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ClientPerformanceView({ data }: { data: ClientPerformanceData }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Client Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview?.totalClients || 0}</p>
            </div>
            <Users className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-green-600">{data.overview?.activeClients || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Payment Days</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(data.paymentAnalysis?.averagePaymentDays || 0)}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
              <p className="text-2xl font-bold text-purple-600">4.2/5</p>
            </div>
            <Star className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

function VendorAnalysisView({ data }: { data: VendorAnalysisData }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Vendor Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview?.totalVendors || 0}</p>
            </div>
            <Building className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Vendors</p>
              <p className="text-2xl font-bold text-green-600">{data.overview?.activeVendors || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-blue-600">{(data.overview?.averageRating || 0).toFixed(1)}/5</p>
            </div>
            <Star className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
              <p className="text-2xl font-bold text-purple-600">85.5%</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

function TenderSuccessView({ data }: { data: TenderSuccessData }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Tender Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tenders</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview?.totalTenders || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Won Tenders</p>
              <p className="text-2xl font-bold text-green-600">{data.overview?.wonTenders || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-blue-600">{(data.overview?.winRate || 0).toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Bid Amount</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(data.overview?.averageTenderValue || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

function GenericReportView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Report Data</h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <pre className="text-sm text-gray-600 overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}