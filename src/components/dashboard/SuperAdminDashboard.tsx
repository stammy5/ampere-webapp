'use client'

import { 
  Building2, 
  Users, 
  FolderOpen, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Target,
  Briefcase
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import MetricCard from '@/components/ui/MetricCard'
import { useProjects } from '@/contexts/ProjectContext'
import { useClients } from '@/contexts/ClientContext'
import { useTenders } from '@/contexts/TenderContext'
import { formatCurrency, getProjectStatusColor } from '@/lib/utils'

export default function SuperAdminDashboard() {
  const { projects } = useProjects()
  const { clients } = useClients()
  const { tenders } = useTenders()
  
  // Calculate metrics
  const activeProjects = projects.filter(p => p.status === 'in_progress').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const delayedProjects = projects.filter(p => {
    const now = new Date()
    return p.status !== 'completed' && new Date(p.expectedEndDate) < now
  }).length
  
  const activeTenders = tenders.filter(t => t.status === 'preparing' || t.status === 'submitted').length
  const submittedTenders = tenders.filter(t => t.status === 'submitted').length
  
  const activeClients = clients.filter(c => c.status === 'active').length
  const newClients = clients.filter(c => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return new Date(c.createdAt) > thirtyDaysAgo
  }).length
  
  // Calculate financial metrics (simplified for this example)
  const totalRevenue = projects.reduce((sum, project) => sum + project.contractValue, 0)
  const outstandingInvoices = 0 // Would come from invoice context in a real app
  const profitMargin = 18.5 // Would be calculated in a real app
  const cashFlow = 425000 // Would come from financial context in a real app
  
  // Calculate recent projects
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
  
  // Calculate recent clients
  const recentClients = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome to Ampere Engineering's comprehensive project management system
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Projects"
          value={projects.length}
          change={{ value: 12, label: "vs last month", positive: true }}
          icon={FolderOpen}
          description={`${activeProjects} active projects`}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={{ value: 8.5, label: "vs last month", positive: true }}
          icon={DollarSign}
          description="YTD revenue performance"
        />
        <MetricCard
          title="Active Tenders"
          value={activeTenders}
          change={{ value: 15, label: "vs last month", positive: true }}
          icon={Target}
          description={`${submittedTenders} submitted`}
        />
        <MetricCard
          title="Total Clients"
          value={clients.length}
          change={{ value: 5, label: "vs last month", positive: true }}
          icon={Users}
          description={`${newClients} new this month`}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Outstanding Invoices"
          value={formatCurrency(outstandingInvoices)}
          icon={AlertTriangle}
          description="Pending payments"
        />
        <MetricCard
          title="Profit Margin"
          value={`${profitMargin}%`}
          change={{ value: 2.1, label: "vs last quarter", positive: true }}
          icon={TrendingUp}
          description="Current quarter"
        />
        <MetricCard
          title="Cash Flow"
          value={formatCurrency(cashFlow)}
          change={{ value: 18, label: "vs last month", positive: true }}
          icon={DollarSign}
          description="Monthly cash flow"
        />
      </div>

      {/* Project Status and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-ampere-600" />
              Project Status Overview
            </CardTitle>
            <CardDescription>
              Current status of all projects in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Active Projects</span>
                </div>
                <span className="font-semibold">{activeProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Completed Projects</span>
                </div>
                <span className="font-semibold">{completedProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Delayed Projects</span>
                </div>
                <span className="font-semibold">{delayedProjects}</span>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm font-medium text-gray-900 mb-2">Project Completion Rate</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${projects.length > 0 ? (completedProjects / projects.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0}% completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-ampere-600" />
              Recent Project Activity
            </CardTitle>
            <CardDescription>
              Latest updates from ongoing projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(project.contractValue)} • 
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`status-badge ${getProjectStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenders and Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tenders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-ampere-600" />
              Active Tenders
            </CardTitle>
            <CardDescription>
              Opportunities currently being pursued
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenders.filter(t => t.status === 'preparing' || t.status === 'submitted').map((tender) => (
                <div key={tender.id} className="border-l-4 border-ampere-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{tender.title}</p>
                      <p className="text-xs text-gray-500">
                        Est. Value: {formatCurrency(tender.estimatedValue)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Deadline: {new Date(tender.submissionDeadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`status-badge ${
                        tender.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tender.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {tender.winProbability}% win rate
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-ampere-600" />
              Recent Clients
            </CardTitle>
            <CardDescription>
              Newly acquired and active clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{client.name}</p>
                    <p className="text-xs text-gray-500">
                      {client.type.replace('_', ' ')} • {client.contactPerson}
                    </p>
                    <p className="text-xs text-gray-500">
                      Added: {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`status-badge ${
                      client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {client.projects?.length || 0} projects
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}