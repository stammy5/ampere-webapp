'use client'

import { 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Award,
  FileText,
  Phone,
  Mail,
  MapPin,
  Percent,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import MetricCard from '@/components/ui/MetricCard'
import { mockTenders, mockClients, mockQuotations, mockDashboardMetrics } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

export default function SalesDashboard() {
  const metrics = mockDashboardMetrics
  
  // Calculate sales metrics
  const activeTenders = mockTenders.filter(t => t.status === 'preparing' || t.status === 'submitted')
  const wonTenders = mockTenders.filter(t => t.status === 'won')
  const totalTenderValue = mockTenders.reduce((sum, t) => sum + t.estimatedValue, 0)
  
  // Quotation metrics
  const sentQuotations = mockQuotations.filter(q => q.status === 'sent')
  const acceptedQuotations = mockQuotations.filter(q => q.status === 'accepted')
  const quotationConversionRate = Math.round((acceptedQuotations.length / mockQuotations.length) * 100)
  
  // Client metrics
  const newClients = mockClients.filter(c => {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return new Date(c.createdAt) > monthAgo
  })
  
  // Recent opportunities
  const recentOpportunities = mockTenders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Track tender opportunities, client relationships, and sales performance
        </p>
      </div>

      {/* Key Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Tenders"
          value={activeTenders.length}
          change={{ value: 20, label: "vs last month", positive: true }}
          icon={Target}
          description={`${formatCurrency(activeTenders.reduce((sum, t) => sum + t.estimatedValue, 0))} total value`}
        />
        <MetricCard
          title="Win Rate"
          value={`${metrics.tenders.winRate}%`}
          change={{ value: 5.2, label: "vs last quarter", positive: true }}
          icon={Award}
          description="Tender success rate"
        />
        <MetricCard
          title="Pipeline Value"
          value={formatCurrency(totalTenderValue)}
          change={{ value: 18, label: "vs last month", positive: true }}
          icon={DollarSign}
          description="Total opportunity value"
        />
        <MetricCard
          title="New Clients"
          value={newClients.length}
          change={{ value: 12, label: "vs last month", positive: true }}
          icon={Users}
          description="This month acquisitions"
        />
      </div>

      {/* Quotation Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Quotations Sent"
          value={sentQuotations.length}
          icon={FileText}
          description="Awaiting client response"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${quotationConversionRate}%`}
          change={{ value: 8, label: "vs last month", positive: true }}
          icon={Percent}
          description="Quote to project ratio"
        />
        <MetricCard
          title="Average Quote Value"
          value={formatCurrency(mockQuotations.reduce((sum, q) => sum + q.totalAmount, 0) / mockQuotations.length)}
          icon={TrendingUp}
          description="Per quotation average"
        />
      </div>

      {/* Pipeline and Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-ampere-600" />
              Sales Pipeline by Status
            </CardTitle>
            <CardDescription>
              Current tender opportunities and their stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { status: 'Opportunity', count: 8, value: 3200000, color: 'bg-gray-500' },
                { status: 'Preparing', count: 4, value: 2100000, color: 'bg-yellow-500' },
                { status: 'Submitted', count: 3, value: 1800000, color: 'bg-blue-500' },
                { status: 'Under Evaluation', count: 2, value: 950000, color: 'bg-purple-500' },
                { status: 'Won', count: 1, value: 450000, color: 'bg-green-500' }
              ].map((stage) => (
                <div key={stage.status} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${stage.color}`}></div>
                    <div>
                      <span className="text-sm text-gray-900 font-medium">{stage.status}</span>
                      <p className="text-xs text-gray-500">{stage.count} tenders</p>
                    </div>
                  </div>
                  <span className="font-semibold">{formatCurrency(stage.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-ampere-600" />
              Recent Tender Opportunities
            </CardTitle>
            <CardDescription>
              Latest tenders and submission deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOpportunities.map((tender) => {
                const daysUntilDeadline = Math.ceil(
                  (new Date(tender.submissionDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )
                
                return (
                  <div key={tender.id} className="border-l-4 border-ampere-500 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{tender.title}</p>
                        <p className="text-xs text-gray-500">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {tender.location.district}
                        </p>
                        <p className="text-xs text-gray-500">
                          Value: {formatCurrency(tender.estimatedValue)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Deadline: {new Date(tender.submissionDeadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`status-badge ${
                          tender.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                          tender.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          tender.status === 'won' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tender.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Overdue'}
                        </p>
                        <p className="text-xs text-ampere-600 font-medium">
                          {tender.winProbability}% win rate
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Analysis and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-ampere-600" />
              Client Portfolio Analysis
            </CardTitle>
            <CardDescription>
              Revenue distribution by client type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'Private Developer', count: 8, revenue: 1250000, color: 'bg-ampere-500' },
                { type: 'Corporate', count: 12, revenue: 980000, color: 'bg-blue-500' },
                { type: 'Government/HDB', count: 5, revenue: 750000, color: 'bg-green-500' },
                { type: 'Individual', count: 3, revenue: 320000, color: 'bg-orange-500' }
              ].map((clientType) => (
                <div key={clientType.type} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${clientType.color}`}></div>
                    <div>
                      <span className="text-sm text-gray-900 font-medium">{clientType.type}</span>
                      <p className="text-xs text-gray-500">{clientType.count} clients</p>
                    </div>
                  </div>
                  <span className="font-semibold">{formatCurrency(clientType.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-ampere-600" />
              Key Client Relationships
            </CardTitle>
            <CardDescription>
              Most valuable client partnerships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockClients
                .sort((a, b) => (b.creditLimit || 0) - (a.creditLimit || 0))
                .slice(0, 4)
                .map((client, index) => (
                <div key={client.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-ampere-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-ampere-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">
                        <Phone className="inline h-3 w-3 mr-1" />
                        {client.contactPerson}
                      </p>
                      <p className="text-xs text-gray-500">
                        {client.projects.length} active projects
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-ampere-600">
                      {formatCurrency(client.creditLimit || 0)}
                    </span>
                    <p className="text-xs text-gray-500">credit limit</p>
                    <span className={`status-badge ${
                      client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-ampere-600" />
            Monthly Sales Performance
          </CardTitle>
          <CardDescription>
            Key performance indicators and targets for current month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Tender Submissions</span>
                <span className="text-sm font-medium">85% of target</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-ampere-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>17 submitted</span>
                <span>Target: 20</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Revenue Target</span>
                <span className="text-sm font-medium">92% achieved</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatCurrency(2254000)}</span>
                <span>Target: {formatCurrency(2450000)}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Client Acquisition</span>
                <span className="text-sm font-medium">120% of target</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>6 new clients</span>
                <span>Target: 5</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}