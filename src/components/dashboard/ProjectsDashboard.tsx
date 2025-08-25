'use client'

import { 
  FolderOpen, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Users,
  FileCheck,
  MapPin,
  Briefcase,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import MetricCard from '@/components/ui/MetricCard'
import { mockProjects, mockDashboardMetrics, mockVendors } from '@/lib/mock-data'
import { formatCurrency, getProjectStatusColor, calculateProjectProgress } from '@/lib/utils'

export default function ProjectsDashboard() {
  const metrics = mockDashboardMetrics
  
  // Calculate project metrics
  const activeProjects = mockProjects.filter(p => p.status === 'in_progress')
  const delayedProjects = mockProjects.filter(p => {
    const progress = calculateProjectProgress(p.startDate, p.expectedEndDate)
    return progress > 100 && p.status !== 'completed'
  })
  const upcomingDeadlines = mockProjects
    .filter(p => p.status === 'in_progress')
    .sort((a, b) => new Date(a.expectedEndDate).getTime() - new Date(b.expectedEndDate).getTime())
    .slice(0, 5)
  
  // Recent project activities
  const recentProjects = mockProjects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)

  // Vendor performance
  const activeVendors = mockVendors.filter(v => v.status === 'active')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Projects Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive project management for renovation, A&A and reinstatement works
        </p>
      </div>

      {/* Key Project Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Projects"
          value={activeProjects.length}
          change={{ value: 12, label: "vs last month", positive: true }}
          icon={FolderOpen}
          description={`${metrics.projects.total} total projects`}
        />
        <MetricCard
          title="Completed Projects"
          value={metrics.projects.completed}
          change={{ value: 8, label: "vs last month", positive: true }}
          icon={CheckCircle2}
          description="Successfully delivered"
        />
        <MetricCard
          title="Delayed Projects"
          value={delayedProjects.length}
          change={{ value: -25, label: "vs last month", positive: true }}
          icon={AlertTriangle}
          description="Require attention"
        />
        <MetricCard
          title="Total Project Value"
          value={formatCurrency(mockProjects.reduce((sum, p) => sum + p.contractValue, 0))}
          change={{ value: 15, label: "vs last month", positive: true }}
          icon={TrendingUp}
          description="Combined contract value"
        />
      </div>

      {/* Project Status and Permits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-ampere-600" />
              Project Status Distribution
            </CardTitle>
            <CardDescription>
              Current status of all projects in the pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['planning', 'permit_application', 'approved', 'in_progress', 'completed', 'on_hold'].map((status) => {
                const count = mockProjects.filter(p => p.status === status).length
                const percentage = Math.round((count / mockProjects.length) * 100)
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        status === 'completed' ? 'bg-green-500' :
                        status === 'in_progress' ? 'bg-blue-500' :
                        status === 'approved' ? 'bg-emerald-500' :
                        status === 'permit_application' ? 'bg-yellow-500' :
                        status === 'planning' ? 'bg-gray-500' :
                        'bg-orange-500'
                      }`}></div>
                      <span className="text-sm text-gray-600 capitalize">
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{count}</span>
                      <span className="text-xs text-gray-500 ml-2">({percentage}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-ampere-600" />
              Upcoming Project Deadlines
            </CardTitle>
            <CardDescription>
              Projects requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((project) => {
                const daysUntilDeadline = Math.ceil(
                  (new Date(project.expectedEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )
                const progress = calculateProjectProgress(project.startDate, project.expectedEndDate)
                
                return (
                  <div key={project.id} className="border-l-4 border-ampere-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{project.name}</p>
                        <p className="text-xs text-gray-500">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {project.location.district}
                        </p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(project.expectedEndDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium ${
                          daysUntilDeadline < 7 ? 'text-red-600' :
                          daysUntilDeadline < 30 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {daysUntilDeadline > 0 ? `${daysUntilDeadline} days` : 'Overdue'}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.min(progress, 100)}% complete
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Types and Vendor Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-ampere-600" />
              Project Type Breakdown
            </CardTitle>
            <CardDescription>
              Revenue and count by project category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'Addition & Alteration', value: 1250000, count: 6, color: 'bg-ampere-500' },
                { type: 'Renovation', value: 980000, count: 5, color: 'bg-blue-500' },
                { type: 'Reinstatement', value: 420000, count: 3, color: 'bg-green-500' },
                { type: 'New Construction', value: 180000, count: 1, color: 'bg-orange-500' }
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${item.color}`}></div>
                    <div>
                      <span className="text-sm text-gray-900 font-medium">{item.type}</span>
                      <p className="text-xs text-gray-500">{item.count} projects</p>
                    </div>
                  </div>
                  <span className="font-semibold">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-ampere-600" />
              Vendor Performance
            </CardTitle>
            <CardDescription>
              Key vendors and their current engagements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                    <p className="text-xs text-gray-500">
                      {vendor.category} • {vendor.specializations.slice(0, 2).join(', ')}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(vendor.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">{vendor.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-ampere-600">
                      {vendor.projects.length} projects
                    </span>
                    <p className="text-xs text-gray-500">
                      {vendor.paymentTerms} days terms
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Project Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-ampere-600" />
            Recent Project Activity
          </CardTitle>
          <CardDescription>
            Latest updates and milestones across all projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => {
              const progress = calculateProjectProgress(project.startDate, project.expectedEndDate)
              
              return (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{project.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {project.location.district}
                      </p>
                    </div>
                    <span className={`status-badge ${getProjectStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{Math.min(progress, 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          progress > 100 ? 'bg-red-500' : 
                          progress > 75 ? 'bg-green-500' :
                          progress > 50 ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Value: {formatCurrency(project.contractValue)}</span>
                      <span>Due: {new Date(project.expectedEndDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}