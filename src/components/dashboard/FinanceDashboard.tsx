'use client'

import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  AlertCircle,
  FileText,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import MetricCard from '@/components/ui/MetricCard'
import { formatCurrency } from '@/lib/utils'

export default function FinanceDashboard() {
  // In production, these would come from API calls or context
  const metrics = {
    finance: {
      totalRevenue: 2450000,
      outstandingInvoices: 350000,
      profitMargin: 18.5,
      cashFlow: 175000
    }
  }
  
  // In production, these would come from API calls or context
  const recentQuotations = []
  const totalQuotationValue = 0
  const acceptedQuotations = []
  const pendingQuotations = []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Financial overview and performance metrics for Ampere Engineering
        </p>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.finance.totalRevenue)}
          change={{ value: 8.5, label: "vs last month", positive: true }}
          icon={DollarSign}
          description="Year-to-date revenue"
        />
        <MetricCard
          title="Outstanding Invoices"
          value={formatCurrency(metrics.finance.outstandingInvoices)}
          change={{ value: -12.3, label: "vs last month", positive: true }}
          icon={AlertCircle}
          description="Pending collections"
        />
        <MetricCard
          title="Profit Margin"
          value={`${metrics.finance.profitMargin}%`}
          change={{ value: 2.1, label: "vs last quarter", positive: true }}
          icon={TrendingUp}
          description="Current quarter margin"
        />
        <MetricCard
          title="Cash Flow"
          value={formatCurrency(metrics.finance.cashFlow)}
          change={{ value: 18, label: "vs last month", positive: true }}
          icon={CreditCard}
          description="Monthly cash flow"
        />
      </div>

      {/* Quotation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Quotations"
          value={formatCurrency(totalQuotationValue)}
          icon={FileText}
          description={`${mockQuotations.length} quotations issued`}
        />
        <MetricCard
          title="Accepted Quotations"
          value={acceptedQuotations.length}
          change={{ value: 25, label: "vs last month", positive: true }}
          icon={TrendingUp}
          description="Successfully converted"
        />
        <MetricCard
          title="Pending Quotations"
          value={pendingQuotations.length}
          icon={Calendar}
          description="Awaiting client response"
        />
      </div>

      {/* Charts and Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-ampere-600" />
              Revenue by Project Type
            </CardTitle>
            <CardDescription>
              Revenue distribution across different project categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-ampere-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">A&A Projects</span>
                </div>
                <span className="font-semibold">{formatCurrency(850000)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Renovation</span>
                </div>
                <span className="font-semibold">{formatCurrency(750000)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Reinstatement</span>
                </div>
                <span className="font-semibold">{formatCurrency(480000)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Maintenance</span>
                </div>
                <span className="font-semibold">{formatCurrency(370000)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Quotations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-ampere-600" />
              Recent Quotations
            </CardTitle>
            <CardDescription>
              Latest quotations and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuotations.map((quotation) => (
                <div key={quotation.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{quotation.title}</p>
                    <p className="text-xs text-gray-500">
                      {quotation.quotationNumber} • {formatCurrency(quotation.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Valid until: {new Date(quotation.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`status-badge ${
                    quotation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    quotation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    quotation.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {quotation.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment and Invoice Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-ampere-600" />
              Payment Status Overview
            </CardTitle>
            <CardDescription>
              Current status of invoices and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Paid Invoices</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{formatCurrency(1650000)}</span>
                  <p className="text-xs text-gray-500">85% of total</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Pending Payment</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{formatCurrency(185000)}</span>
                  <p className="text-xs text-gray-500">12% of total</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Overdue</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{formatCurrency(65000)}</span>
                  <p className="text-xs text-gray-500">3% of total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-ampere-600" />
              Monthly Financial Performance
            </CardTitle>
            <CardDescription>
              Key financial indicators for this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Revenue Target</span>
                  <span className="text-sm font-medium">78% achieved</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-ampere-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Collection Target</span>
                  <span className="text-sm font-medium">92% achieved</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Margin Target</span>
                  <span className="text-sm font-medium">105% achieved</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}