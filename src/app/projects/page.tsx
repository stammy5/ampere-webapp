'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/contexts/ClientContext'
import { useProjects } from '@/contexts/ProjectContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProjectForm from '@/components/forms/ProjectForm'
import { Project, ProjectStatus, ProjectType } from '@/types'
import { 
  Search, 
  Plus, 
  FolderOpen, 
  DollarSign,
  Calendar,
  Users,
  MapPin,
  Edit,
  MoreVertical,
  ChevronDown,
  CheckCircle,
  X,
  Trash2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Building,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: 'bg-gray-100 text-gray-800',
  permit_application: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-emerald-100 text-emerald-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  on_hold: 'bg-orange-100 text-orange-800'
}

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  permit_application: 'Permit Application',
  approved: 'Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  on_hold: 'On Hold'
}

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  renovation: 'Renovation',
  addition_alteration: 'A&A',
  reinstatement: 'Reinstatement',
  new_construction: 'New Construction',
  maintenance: 'Maintenance'
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const { projects, accessibleProjects, addProject, updateProject, deleteProject } = useProjects()
  const { clients } = useClients()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'all'>('all')
  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | undefined>()

  // Calculate project statistics based on accessible projects only
  const projectStats = useMemo(() => {
    const activeProjects = accessibleProjects.filter(p => ['approved', 'in_progress'].includes(p.status)).length
    const completedProjects = accessibleProjects.filter(p => p.status === 'completed').length
    const delayedProjects = accessibleProjects.filter(p => {
      if (p.status !== 'in_progress') return false
      const now = new Date()
      const expectedEnd = new Date(p.expectedEndDate)
      return now > expectedEnd
    }).length
    const totalValue = accessibleProjects.reduce((sum, project) => sum + project.contractValue, 0)
    const avgMargin = accessibleProjects.length > 0 
      ? accessibleProjects.reduce((sum, p) => sum + ((p.contractValue - p.estimatedCost) / p.contractValue * 100), 0) / accessibleProjects.length 
      : 0

    return {
      total: accessibleProjects.length,
      active: activeProjects,
      completed: completedProjects,
      delayed: delayedProjects,
      totalValue,
      avgMargin
    }
  }, [accessibleProjects])

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return accessibleProjects.filter(project => {
      const client = clients.find(c => c.id === project.clientId)
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.location.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client?.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus
      const matchesType = selectedType === 'all' || project.type === selectedType
      const matchesClient = selectedClient === 'all' || project.clientId === selectedClient
      
      return matchesSearch && matchesStatus && matchesType && matchesClient
    })
  }, [accessibleProjects, clients, searchTerm, selectedStatus, selectedType, selectedClient])

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.name || 'Unknown Client'
  }

  const calculateProgress = (startDate: Date, expectedEndDate: Date, actualEndDate?: Date) => {
    const start = new Date(startDate).getTime()
    const end = new Date(expectedEndDate).getTime()
    const now = actualEndDate ? new Date(actualEndDate).getTime() : new Date().getTime()
    
    const totalDuration = end - start
    const elapsed = now - start
    
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
  }

  const getDaysUntilDeadline = (expectedEndDate: Date, actualEndDate?: Date) => {
    if (actualEndDate) return 0
    const now = new Date()
    const deadline = new Date(expectedEndDate)
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount)
  }

  const handleAddProject = () => {
    setEditingProject(undefined)
    setShowProjectForm(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowProjectForm(true)
  }

  const handleSaveProject = async (projectData: Partial<Project>) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingProject) {
        updateProject(editingProject.id, projectData)
        setSuccessMessage('Project updated successfully!')
      } else {
        addProject(projectData)
        setSuccessMessage('Project created successfully!')
      }
      
      setShowProjectForm(false)
      setEditingProject(undefined)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error saving project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseForm = () => {
    setShowProjectForm(false)
    setEditingProject(undefined)
  }

  const handleDeleteProject = async (project: Project) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      deleteProject(project.id)
      setSuccessMessage('Project deleted successfully!')
      setShowDeleteConfirm(false)
      setProjectToDelete(undefined)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const canCreateProjects = user?.permissions.projects.canCreateProjects || 
                          user?.role === 'super_admin' || 
                          user?.role === 'admin'

  const canDeleteProjects = user?.permissions.projects.canDeleteProjects || 
                           user?.role === 'super_admin'

  return (
    <DashboardLayout user={user!}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">Manage your construction projects and track progress</p>
          </div>
          
          {canCreateProjects && (
            <button 
              onClick={handleAddProject}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
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

        {/* Project Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projectStats.total}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projectStats.active}</p>
              </div>
              <Activity className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(projectStats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Margin</p>
                <p className="text-2xl font-bold text-gray-900">{projectStats.avgMargin.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                  placeholder="Search projects..."
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ProjectStatus | 'all')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
              >
                <option value="all">All Statuses</option>
                {Object.entries(PROJECT_STATUS_LABELS).map(([status, label]) => (
                  <option key={status} value={status}>{label}</option>
                ))}
              </select>
            </div>
            
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ProjectType | 'all')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
              >
                <option value="all">All Types</option>
                {Object.entries(PROJECT_TYPE_LABELS).map(([type, label]) => (
                  <option key={type} value={type}>{label}</option>
                ))}
              </select>
            </div>
            
            {/* Client Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
              >
                <option value="all">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Project List</h2>
          </div>
          
          {filteredProjects.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredProjects.map(project => {
                const client = clients.find(c => c.id === project.clientId)
                const progress = calculateProgress(project.startDate, project.expectedEndDate, project.actualEndDate)
                const daysUntilDeadline = getDaysUntilDeadline(project.expectedEndDate, project.actualEndDate)
                
                return (
                  <div key={project.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <Link href={`/projects/${project.id}`} className="text-lg font-semibold text-gray-900 hover:text-ampere-600">
                            {project.name}
                          </Link>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            PROJECT_STATUS_COLORS[project.status]
                          )}>
                            {PROJECT_STATUS_LABELS[project.status]}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span>{client?.name || 'Unknown Client'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{project.location.district}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatCurrency(project.contractValue)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(project.expectedEndDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-ampere-600 h-2 rounded-full" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          
                          {daysUntilDeadline <= 0 && project.status !== 'completed' && (
                            <div className="mt-2 flex items-center space-x-1 text-red-600">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">Overdue by {Math.abs(daysUntilDeadline)} days</span>
                            </div>
                          )}
                          
                          {daysUntilDeadline > 0 && daysUntilDeadline <= 7 && project.status !== 'completed' && (
                            <div className="mt-2 flex items-center space-x-1 text-yellow-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{daysUntilDeadline} days remaining</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Link 
                          href={`/projects/${project.id}`}
                          className="p-2 text-gray-400 hover:text-ampere-600 rounded-lg hover:bg-ampere-50"
                        >
                          <FolderOpen className="h-5 w-5" />
                        </Link>
                        
                        {(user?.role === 'super_admin' || user?.role === 'admin' || 
                          (user?.permissions.projects.canEditAssignedProjects && 
                           (project.projectManager === user?.id || project.team.includes(user?.id || '')))) && (
                          <button
                            onClick={() => handleEditProject(project)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        )}
                        
                        {canDeleteProjects && (
                          <button
                            onClick={() => {
                              setProjectToDelete(project)
                              setShowDeleteConfirm(true)
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedStatus !== 'all' || selectedType !== 'all' || selectedClient !== 'all'
                  ? 'No projects match your search criteria'
                  : 'Get started by creating your first project'}
              </p>
              {canCreateProjects && !searchTerm && selectedStatus === 'all' && selectedType === 'all' && selectedClient === 'all' && (
                <button
                  onClick={handleAddProject}
                  className="btn-primary"
                >
                  Create Project
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project Form Modal */}
      <ProjectForm
        project={editingProject}
        isOpen={showProjectForm}
        onClose={handleCloseForm}
        onSave={handleSaveProject}
        mode={editingProject ? 'edit' : 'add'}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && projectToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Project
                  </h3>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
                    <p className="text-sm text-gray-600">
                      This action cannot be undone. This will permanently delete the project{' '}
                      <span className="font-medium">{projectToDelete.name}</span> and all associated data.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(projectToDelete)}
                    disabled={isLoading}
                    className="btn-danger flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Project</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}