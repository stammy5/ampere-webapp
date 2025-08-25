'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { 
  Report, FinancialSummaryData, ProjectAnalyticsData, ClientPerformanceData,
  VendorAnalysisData, TenderSuccessData, ReportParameters 
} from '@/types'
import { mockReports } from '@/lib/mock-data'

interface ReportsContextType {
  reports: Report[]
  getReport: (id: string) => Report | undefined
  generateReport: (type: string, parameters: ReportParameters) => Report
  updateReport: (id: string, updates: Partial<Report>) => boolean
  deleteReport: (id: string) => boolean
  getReportsByCategory: (category: string) => Report[]
  getRecentReports: (limit?: number) => Report[]
  generateFinancialSummary: (parameters: ReportParameters) => FinancialSummaryData
  generateProjectAnalytics: (parameters: ReportParameters) => ProjectAnalyticsData
  generateClientPerformance: (parameters: ReportParameters) => ClientPerformanceData
  generateVendorAnalysis: (parameters: ReportParameters) => VendorAnalysisData
  generateTenderSuccess: (parameters: ReportParameters) => TenderSuccessData
  refreshReportsData: () => void
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export const useReports = () => {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider')
  }
  return context
}

interface ReportsProviderProps {
  children: React.ReactNode
}

export const ReportsProvider: React.FC<ReportsProviderProps> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>(mockReports)

  // Initialize reports data from localStorage if available
  useEffect(() => {
    try {
      const storedReports = localStorage.getItem('ampere_reports')
      if (storedReports) {
        const parsedReports = JSON.parse(storedReports)
        if (Array.isArray(parsedReports) && parsedReports.length > 0) {
          setReports(parsedReports)
        }
      }
    } catch (error) {
      console.error('Error loading reports data from localStorage:', error)
      setReports(mockReports)
    }
  }, [])

  // Save reports to localStorage whenever reports change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_reports', JSON.stringify(reports))
    } catch (error) {
      console.error('Error saving reports to localStorage:', error)
    }
  }, [reports])

  const getReport = (id: string): Report | undefined => {
    return reports.find(report => report.id === id)
  }

  const getReportsByCategory = (category: string): Report[] => {
    return reports.filter(report => report.category === category)
  }

  const getRecentReports = (limit: number = 10): Report[] => {
    return reports
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      .slice(0, limit)
  }

  // Generate Financial Summary Data
  const generateFinancialSummary = (parameters: ReportParameters): FinancialSummaryData => {
    // Get data from localStorage or use mock data
    const invoices = JSON.parse(localStorage.getItem('ampere_invoices') || '[]')
    const payments = JSON.parse(localStorage.getItem('ampere_payments') || '[]')
    const projects = JSON.parse(localStorage.getItem('ampere_projects') || '[]')
    const clients = JSON.parse(localStorage.getItem('ampere_clients') || '[]')

    const { startDate, endDate } = parameters.dateRange

    // Filter data by date range
    const filteredInvoices = invoices.filter((invoice: any) => {
      const invoiceDate = new Date(invoice.issueDate)
      return invoiceDate >= startDate && invoiceDate <= endDate
    })

    const filteredPayments = payments.filter((payment: any) => {
      const paymentDate = new Date(payment.receivedDate)
      return paymentDate >= startDate && paymentDate <= endDate
    })

    // Calculate revenue metrics
    const totalRevenue = filteredPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0)
    
    // Revenue by month
    const revenueByMonth = filteredPayments.reduce((acc: any, payment: any) => {
      const month = new Date(payment.receivedDate).toISOString().substring(0, 7)
      acc[month] = (acc[month] || 0) + payment.amount
      return acc
    }, {})

    // Revenue by client
    const revenueByClient = filteredPayments.reduce((acc: any, payment: any) => {
      const invoice = invoices.find((inv: any) => inv.id === payment.invoiceId)
      if (invoice) {
        const client = clients.find((c: any) => c.id === invoice.clientId)
        const clientName = client?.name || 'Unknown Client'
        const existing = acc.find((item: any) => item.clientId === invoice.clientId)
        if (existing) {
          existing.amount += payment.amount
        } else {
          acc.push({
            clientId: invoice.clientId,
            clientName,
            amount: payment.amount
          })
        }
      }
      return acc
    }, [])

    // Revenue by project
    const revenueByProject = filteredPayments.reduce((acc: any, payment: any) => {
      const invoice = invoices.find((inv: any) => inv.id === payment.invoiceId)
      if (invoice && invoice.projectId) {
        const project = projects.find((p: any) => p.id === invoice.projectId)
        const projectName = project?.name || 'Unknown Project'
        const existing = acc.find((item: any) => item.projectId === invoice.projectId)
        if (existing) {
          existing.amount += payment.amount
        } else {
          acc.push({
            projectId: invoice.projectId,
            projectName,
            amount: payment.amount
          })
        }
      }
      return acc
    }, [])

    // Calculate expenses (simplified - using project actual costs)
    const totalExpenses = projects
      .filter((project: any) => {
        const projectStart = new Date(project.startDate)
        return projectStart >= startDate && projectStart <= endDate
      })
      .reduce((sum: number, project: any) => sum + (project.actualCost || project.estimatedCost || 0), 0)

    // Calculate profitability
    const grossProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

    // Calculate cash flow
    const totalInvoiced = filteredInvoices.reduce((sum: number, invoice: any) => sum + invoice.totalAmount, 0)
    const outstanding = totalInvoiced - totalRevenue
    const overdue = filteredInvoices
      .filter((invoice: any) => {
        const dueDate = new Date(invoice.dueDate)
        return dueDate < new Date() && invoice.status !== 'paid'
      })
      .reduce((sum: number, invoice: any) => sum + invoice.totalAmount, 0)

    // Calculate GST
    const totalGSTCollected = filteredInvoices.reduce((sum: number, invoice: any) => sum + (invoice.gstAmount || 0), 0)

    return {
      period: { startDate, endDate },
      revenue: {
        total: totalRevenue,
        byMonth: Object.entries(revenueByMonth).map(([month, amount]) => ({ 
          month, 
          amount: amount as number 
        })),
        byClient: revenueByClient,
        byProject: revenueByProject
      },
      expenses: {
        total: totalExpenses,
        byCategory: [
          { category: 'Labor', amount: totalExpenses * 0.4 },
          { category: 'Materials', amount: totalExpenses * 0.35 },
          { category: 'Equipment', amount: totalExpenses * 0.15 },
          { category: 'Overhead', amount: totalExpenses * 0.1 }
        ],
        byVendor: []
      },
      profitability: {
        grossProfit,
        netProfit: grossProfit * 0.85, // Assume 15% additional overhead
        profitMargin,
        byProject: projects.map((project: any) => ({
          projectId: project.id,
          projectName: project.name,
          profit: project.contractValue - (project.actualCost || project.estimatedCost),
          margin: ((project.contractValue - (project.actualCost || project.estimatedCost)) / project.contractValue) * 100
        }))
      },
      cashFlow: {
        inflow: totalRevenue,
        outflow: totalExpenses,
        netCashFlow: totalRevenue - totalExpenses,
        outstanding,
        overdue
      },
      gst: {
        totalGSTCollected,
        totalGSTPaid: totalExpenses * 0.07, // Assume 7% GST on expenses
        netGST: totalGSTCollected - (totalExpenses * 0.07)
      }
    }
  }

  // Generate Project Analytics Data
  const generateProjectAnalytics = (parameters: ReportParameters): ProjectAnalyticsData => {
    const projects = JSON.parse(localStorage.getItem('ampere_projects') || '[]')
    const { startDate, endDate } = parameters.dateRange

    const filteredProjects = projects.filter((project: any) => {
      const projectStart = new Date(project.startDate)
      return projectStart >= startDate && projectStart <= endDate
    })

    const totalProjects = filteredProjects.length
    const activeProjects = filteredProjects.filter((p: any) => p.status === 'in_progress').length
    const completedProjects = filteredProjects.filter((p: any) => p.status === 'completed').length
    const delayedProjects = filteredProjects.filter((p: any) => {
      const expectedEnd = new Date(p.expectedEndDate)
      const actualEnd = p.actualEndDate ? new Date(p.actualEndDate) : new Date()
      return actualEnd > expectedEnd
    }).length

    const totalContractValue = filteredProjects.reduce((sum: number, p: any) => sum + p.contractValue, 0)
    const averageProjectValue = totalProjects > 0 ? totalContractValue / totalProjects : 0

    // Calculate performance metrics
    const onTimeCompletionRate = completedProjects > 0 ? 
      ((completedProjects - delayedProjects) / completedProjects) * 100 : 0

    const averageProjectDuration = filteredProjects.reduce((sum: number, p: any) => {
      const start = new Date(p.startDate)
      const end = p.actualEndDate ? new Date(p.actualEndDate) : new Date(p.expectedEndDate)
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      return sum + duration
    }, 0) / (totalProjects || 1)

    // Budget variance calculations
    const projectsWithBudgetData = filteredProjects.filter((p: any) => p.actualCost || p.estimatedCost)
    const budgetVariances = projectsWithBudgetData.map((p: any) => {
      const planned = p.estimatedCost || p.contractValue * 0.8
      const actual = p.actualCost || planned
      return ((actual - planned) / planned) * 100
    })
    
    const averageVariance = budgetVariances.length > 0 ? 
      budgetVariances.reduce((sum: number, variance: number) => sum + variance, 0) / budgetVariances.length : 0
    const projectsOverBudget = budgetVariances.filter((v: number) => v > 0).length
    const projectsUnderBudget = budgetVariances.filter((v: number) => v < 0).length

    return {
      overview: {
        totalProjects,
        activeProjects,
        completedProjects,
        delayedProjects,
        averageProjectValue,
        totalContractValue
      },
      performance: {
        onTimeCompletionRate,
        averageProjectDuration,
        budgetVariance: {
          averageVariance,
          projectsOverBudget,
          projectsUnderBudget
        }
      },
      byType: [
        {
          type: 'renovation',
          count: filteredProjects.filter((p: any) => p.type === 'renovation').length,
          totalValue: filteredProjects.filter((p: any) => p.type === 'renovation').reduce((sum: number, p: any) => sum + p.contractValue, 0),
          averageDuration: 45,
          completionRate: 85
        },
        {
          type: 'addition_alteration',
          count: filteredProjects.filter((p: any) => p.type === 'addition_alteration').length,
          totalValue: filteredProjects.filter((p: any) => p.type === 'addition_alteration').reduce((sum: number, p: any) => sum + p.contractValue, 0),
          averageDuration: 60,
          completionRate: 78
        }
      ],
      byStatus: [
        { status: 'planning', count: filteredProjects.filter((p: any) => p.status === 'planning').length, totalValue: 0 },
        { status: 'in_progress', count: activeProjects, totalValue: 0 },
        { status: 'completed', count: completedProjects, totalValue: 0 },
        { status: 'on_hold', count: filteredProjects.filter((p: any) => p.status === 'on_hold').length, totalValue: 0 }
      ],
      timeline: [
        { month: '2024-06', started: 2, completed: 1, value: 750000 },
        { month: '2024-07', started: 3, completed: 2, value: 1200000 },
        { month: '2024-08', started: 1, completed: 1, value: 480000 }
      ]
    }
  }

  // Generate Client Performance Data
  const generateClientPerformance = (parameters: ReportParameters): ClientPerformanceData => {
    const clients = JSON.parse(localStorage.getItem('ampere_clients') || '[]')
    const projects = JSON.parse(localStorage.getItem('ampere_projects') || '[]')
    const invoices = JSON.parse(localStorage.getItem('ampere_invoices') || '[]')
    const payments = JSON.parse(localStorage.getItem('ampere_payments') || '[]')

    const totalClients = clients.length
    const activeClients = clients.filter((c: any) => c.status === 'active').length
    const newClients = clients.filter((c: any) => {
      const createdDate = new Date(c.createdAt)
      return createdDate >= parameters.dateRange.startDate && createdDate <= parameters.dateRange.endDate
    }).length

    // Calculate client metrics
    const clientMetrics = clients.map((client: any) => {
      const clientProjects = projects.filter((p: any) => p.clientId === client.id)
      const clientInvoices = invoices.filter((i: any) => i.clientId === client.id)
      const clientPayments = payments.filter((payment: any) => {
        const invoice = invoices.find((i: any) => i.id === payment.invoiceId)
        return invoice && invoice.clientId === client.id
      })

      const totalValue = clientProjects.reduce((sum: number, p: any) => sum + p.contractValue, 0)
      
      // Calculate average payment days
      const paidInvoices = clientInvoices.filter((i: any) => i.status === 'paid')
      const averagePaymentDays = paidInvoices.length > 0 ? 
        paidInvoices.reduce((sum: number, invoice: any) => {
          if (invoice.paidDate) {
            const issueDate = new Date(invoice.issueDate)
            const paidDate = new Date(invoice.paidDate)
            const days = (paidDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24)
            return sum + days
          }
          return sum
        }, 0) / paidInvoices.length : 0

      const lastProject = clientProjects.length > 0 ? 
        clientProjects.sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0] : null

      return {
        clientId: client.id,
        clientName: client.name,
        projectCount: clientProjects.length,
        totalValue,
        averagePaymentDays,
        lastProjectDate: lastProject ? new Date(lastProject.startDate) : new Date(client.createdAt),
        status: client.status,
        profitability: totalValue * 0.15 // Assume 15% profit margin
      }
    })

    const averageProjectValue = clientMetrics.reduce((sum: number, c: any) => sum + c.totalValue, 0) / (totalClients || 1)
    const repeatClientRate = (clients.filter((c: any) => {
      const clientProjects = projects.filter((p: any) => p.clientId === c.id)
      return clientProjects.length > 1
    }).length / totalClients) * 100

    return {
      overview: {
        totalClients,
        activeClients,
        newClients,
        averageProjectValue,
        repeatClientRate
      },
      byClient: clientMetrics,
      paymentAnalysis: {
        averagePaymentDays: clientMetrics.reduce((sum: number, c: any) => sum + c.averagePaymentDays, 0) / (clientMetrics.length || 1),
        onTimePaymentRate: 78, // Mock data
        overdueAmount: 342400, // From overdue invoices
        clientsWithOverdue: 1
      },
      growth: [
        { month: '2024-06', newClients: 1, revenue: 64200, repeatBusinessRate: 65 },
        { month: '2024-07', newClients: 0, revenue: 0, repeatBusinessRate: 70 },
        { month: '2024-08', newClients: 2, revenue: 545700, repeatBusinessRate: 75 }
      ]
    }
  }

  // Generate Vendor Analysis Data
  const generateVendorAnalysis = (parameters: ReportParameters): VendorAnalysisData => {
    const vendors = JSON.parse(localStorage.getItem('ampere_vendors') || '[]')
    const projects = JSON.parse(localStorage.getItem('ampere_projects') || '[]')

    const totalVendors = vendors.length
    const activeVendors = vendors.filter((v: any) => v.status === 'active').length
    const totalSpent = projects.reduce((sum: number, project: any) => {
      if (project.vendors && project.vendors.length > 0) {
        return sum + project.vendors.reduce((vendorSum: number, vendor: any) => vendorSum + (vendor.contractValue || 0), 0)
      }
      return sum
    }, 0)
    const averageRating = vendors.reduce((sum: number, v: any) => sum + v.rating, 0) / (totalVendors || 1)

    return {
      overview: {
        totalVendors,
        activeVendors,
        totalSpent,
        averageRating
      },
      byVendor: vendors.map((vendor: any) => ({
        vendorId: vendor.id,
        vendorName: vendor.name,
        category: vendor.category,
        projectCount: vendor.projects?.length || 0,
        totalValue: 0, // Would calculate from project data
        averageRating: vendor.rating,
        onTimeDeliveryRate: 85, // Mock data
        lastEngagementDate: new Date('2024-08-01')
      })),
      byCategory: [
        { category: 'subcontractor', vendorCount: vendors.filter((v: any) => v.category === 'subcontractor').length, totalSpent: totalSpent * 0.6, averageRating: 4.2 },
        { category: 'supplier', vendorCount: vendors.filter((v: any) => v.category === 'supplier').length, totalSpent: totalSpent * 0.3, averageRating: 4.1 },
        { category: 'consultant', vendorCount: vendors.filter((v: any) => v.category === 'consultant').length, totalSpent: totalSpent * 0.1, averageRating: 4.8 }
      ],
      performance: [
        { month: '2024-06', totalSpent: totalSpent * 0.3, vendorCount: activeVendors, averageRating: 4.2 },
        { month: '2024-07', totalSpent: totalSpent * 0.4, vendorCount: activeVendors, averageRating: 4.3 },
        { month: '2024-08', totalSpent: totalSpent * 0.3, vendorCount: activeVendors, averageRating: 4.1 }
      ]
    }
  }

  // Generate Tender Success Data
  const generateTenderSuccess = (parameters: ReportParameters): TenderSuccessData => {
    const tenders = JSON.parse(localStorage.getItem('ampere_tenders') || '[]')
    
    const totalTenders = tenders.length
    const submittedTenders = tenders.filter((t: any) => ['submitted', 'under_evaluation', 'won', 'lost'].includes(t.status)).length
    const wonTenders = tenders.filter((t: any) => t.status === 'won').length
    const winRate = submittedTenders > 0 ? (wonTenders / submittedTenders) * 100 : 0
    const totalValue = tenders.reduce((sum: number, t: any) => sum + t.estimatedValue, 0)
    const averageTenderValue = totalTenders > 0 ? totalValue / totalTenders : 0

    return {
      overview: {
        totalTenders,
        submittedTenders,
        wonTenders,
        winRate,
        totalValue,
        averageTenderValue
      },
      byType: [
        { type: 'open', submitted: 5, won: 2, winRate: 40, totalValue: 2500000 },
        { type: 'selective', submitted: 3, won: 2, winRate: 67, totalValue: 1800000 },
        { type: 'nominated', submitted: 2, won: 1, winRate: 50, totalValue: 750000 }
      ],
      byStatus: [
        { status: 'opportunity', count: tenders.filter((t: any) => t.status === 'opportunity').length, totalValue: 0 },
        { status: 'preparing', count: tenders.filter((t: any) => t.status === 'preparing').length, totalValue: 0 },
        { status: 'submitted', count: tenders.filter((t: any) => t.status === 'submitted').length, totalValue: 0 },
        { status: 'won', count: wonTenders, totalValue: 0 },
        { status: 'lost', count: tenders.filter((t: any) => t.status === 'lost').length, totalValue: 0 }
      ],
      timeline: [
        { month: '2024-01', submitted: 2, won: 1, winRate: 50, value: 850000 },
        { month: '2024-02', submitted: 1, won: 0, winRate: 0, value: 0 },
        { month: '2024-03', submitted: 3, won: 1, winRate: 33, value: 450000 }
      ],
      competitorAnalysis: {
        averageCompetitors: 4.2,
        winRateByCompetitorCount: [
          { competitorCount: 2, winRate: 75, tenderCount: 2 },
          { competitorCount: 3, winRate: 50, tenderCount: 4 },
          { competitorCount: 5, winRate: 25, tenderCount: 6 }
        ]
      }
    }
  }

  const generateReport = (type: string, parameters: ReportParameters): Report => {
    const newId = (Math.max(...reports.map(r => parseInt(r.id) || 0)) + 1).toString()
    let data: any = {}
    
    // Generate appropriate data based on report type
    switch (type) {
      case 'financial_summary':
        data = generateFinancialSummary(parameters)
        break
      case 'project_analytics':
        data = generateProjectAnalytics(parameters)
        break
      case 'client_performance':
        data = generateClientPerformance(parameters)
        break
      case 'vendor_analysis':
        data = generateVendorAnalysis(parameters)
        break
      case 'tender_success':
        data = generateTenderSuccess(parameters)
        break
      default:
        data = {}
    }

    const newReport: Report = {
      id: newId,
      title: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${new Date().toLocaleDateString()}`,
      type: type as any,
      category: type.includes('financial') || type.includes('cash') || type.includes('profitability') ? 'financial' : 
                type.includes('project') || type.includes('vendor') ? 'operational' : 'analytics',
      description: `Generated ${type.replace('_', ' ')} report`,
      status: 'completed',
      generatedBy: '1', // Current user - would be dynamic
      generatedAt: new Date(),
      parameters,
      data
    }

    setReports(prev => [...prev, newReport])
    return newReport
  }

  const updateReport = (id: string, updates: Partial<Report>): boolean => {
    setReports(prevReports => {
      const index = prevReports.findIndex(report => report.id === id)
      if (index === -1) return prevReports

      const updatedReport = {
        ...prevReports[index],
        ...updates
      }

      const newReports = [...prevReports]
      newReports[index] = updatedReport
      return newReports
    })
    return true
  }

  const deleteReport = (id: string): boolean => {
    setReports(prevReports => prevReports.filter(report => report.id !== id))
    return true
  }

  const refreshReportsData = () => {
    try {
      const storedReports = localStorage.getItem('ampere_reports')
      if (storedReports) {
        setReports(JSON.parse(storedReports))
      } else {
        setReports(mockReports)
      }
    } catch (error) {
      console.error('Error refreshing reports data:', error)
      setReports(mockReports)
    }
  }

  const value: ReportsContextType = {
    reports,
    getReport,
    generateReport,
    updateReport,
    deleteReport,
    getReportsByCategory,
    getRecentReports,
    generateFinancialSummary,
    generateProjectAnalytics,
    generateClientPerformance,
    generateVendorAnalysis,
    generateTenderSuccess,
    refreshReportsData
  }

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  )
}