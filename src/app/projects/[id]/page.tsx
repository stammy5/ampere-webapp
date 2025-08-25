'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/contexts/ClientContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useVendors } from '@/contexts/VendorContext'
import { usePurchaseOrders } from '@/contexts/PurchaseOrderContext'
import { useUsers } from '@/contexts/UserContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProjectForm from '@/components/forms/ProjectForm'
import PermitForm from '@/components/forms/PermitForm'
import MilestoneForm from '@/components/forms/MilestoneForm'
import ProjectVendorForm from '@/components/forms/ProjectVendorForm'
import AddTeamMemberForm from '@/components/projects/AddTeamMemberForm'
import PurchaseOrderList from '@/components/projects/PurchaseOrderList'
import PurchaseOrderForm from '@/components/forms/PurchaseOrderForm'
import { Project, ProjectStatus, ProjectType, Permit, Milestone, ProjectVendor } from '@/types'
import { 
  ArrowLeft,
  Edit,
  MoreVertical,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Building,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Truck,
  Plus,
  Activity,
  Download,
  X,
  Save,
  ShoppingCart,
  Trash2
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

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { clients } = useClients()
  const { 
    getProject, 
    updateProject,
    addPermit,
    updatePermit,
    deletePermit,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addProjectVendor,
    updateProjectVendor,
    deleteProjectVendor,
    updateVendorBudgetUsage
  } = useProjects()
  const { getVendor } = useVendors()
  const { addPurchaseOrder, updatePurchaseOrder } = usePurchaseOrders()
  const { users } = useUsers()
  
  const projectId = params.id as string
  const project = getProject(projectId)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditForm, setShowEditForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  
  // Form states for permits, milestones, and vendors
  const [showPermitForm, setShowPermitForm] = useState(false)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [showVendorForm, setShowVendorForm] = useState(false)
  const [showAddTeamMemberForm, setShowAddTeamMemberForm] = useState(false)
  const [editingPermit, setEditingPermit] = useState<Permit | undefined>()
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>()
  const [editingVendor, setEditingVendor] = useState<ProjectVendor | undefined>()
  
  // Purchase order states
  const [showPurchaseOrderForm, setShowPurchaseOrderForm] = useState(false)
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<any | undefined>()

  if (!project) {
    return (
      <DashboardLayout user={user || { 
        id: '', 
        name: 'Guest', 
        role: 'sales', 
        email: '', 
        isActive: true,
        createdAt: new Date(),
        assignedProjects: [],
        permissions: { 
          projects: { 
            canViewAllProjects: false,
            canEditAssignedProjects: false,
            canCreateProjects: false,
            canDeleteProjects: false,
            canManageTeam: false
          },
          finance: {
            canViewFinance: false,
            canEditInvoices: false,
            canDeleteInvoices: false,
            canViewReports: false,
            canManagePayments: false
          },
          clients: {
            canViewClients: true,
            canEditClients: true,
            canCreateClients: true,
            canDeleteClients: false
          },
          system: {
            canManageUsers: false,
            canViewAuditLogs: false,
            canManageSettings: false,
            canViewReports: false
          }
        }
      }}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Project Not Found</h3>
            <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
            <Link href="/projects" className="btn-primary">
              Back to Projects
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const client = clients.find(c => c.id === project.clientId)

  // Calculate project progress
  const calculateProgress = (startDate: Date, expectedEndDate: Date, actualEndDate?: Date) => {
    const start = new Date(startDate).getTime()
    const end = new Date(expectedEndDate).getTime()
    const now = actualEndDate ? new Date(actualEndDate).getTime() : new Date().getTime()
    
    const totalDuration = end - start
    const elapsed = now - start
    
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
  }

  const progress = calculateProgress(project.startDate, project.expectedEndDate, project.actualEndDate)
  
  const getDaysUntilDeadline = (expectedEndDate: Date, actualEndDate?: Date) => {
    if (actualEndDate) return 0
    const now = new Date()
    const deadline = new Date(expectedEndDate)
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilDeadline = getDaysUntilDeadline(project.expectedEndDate, project.actualEndDate)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount)
  }

  const handleSaveProject = async (projectData: Partial<Project>) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateProject(project.id, projectData)
      setSuccessMessage('Project updated successfully!')
      setShowEditForm(false)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error updating project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Permit handlers
  const handleAddPermit = () => {
    setEditingPermit(undefined)
    setShowPermitForm(true)
  }

  const handleEditPermit = (permit: Permit) => {
    setEditingPermit(permit)
    setShowPermitForm(true)
  }

  const handleSavePermit = async (permitData: Partial<Permit>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (editingPermit) {
        updatePermit(project.id, editingPermit.id, permitData)
        setSuccessMessage('Permit updated successfully!')
      } else {
        addPermit(project.id, permitData)
        setSuccessMessage('Permit added successfully!')
      }
      
      setShowPermitForm(false)
      setEditingPermit(undefined)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error saving permit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Milestone handlers
  const handleAddMilestone = () => {
    setEditingMilestone(undefined)
    setShowMilestoneForm(true)
  }

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    setShowMilestoneForm(true)
  }

  const handleSaveMilestone = async (milestoneData: Partial<Milestone>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (editingMilestone) {
        updateMilestone(project.id, editingMilestone.id, milestoneData)
        setSuccessMessage('Milestone updated successfully!')
      } else {
        addMilestone(project.id, milestoneData)
        setSuccessMessage('Milestone added successfully!')
      }
      
      setShowMilestoneForm(false)
      setEditingMilestone(undefined)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error saving milestone:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Vendor handlers
  const handleAddVendor = () => {
    setEditingVendor(undefined)
    setShowVendorForm(true)
  }

  const handleEditVendor = (vendor: ProjectVendor) => {
    setEditingVendor(vendor)
    setShowVendorForm(true)
  }

  const handleDeleteVendor = (vendorId: string) => {
    deleteProjectVendor(projectId, vendorId)
    setSuccessMessage('Vendor removed from project successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleSaveVendor = async (vendorData: Partial<ProjectVendor>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingVendor) {
        updateProjectVendor(projectId, editingVendor.vendorId, vendorData)
        setSuccessMessage('Vendor updated successfully!')
      } else {
        addProjectVendor(projectId, vendorData)
        setSuccessMessage('Vendor added to project successfully!')
      }
      
      setShowVendorForm(false)
      setEditingVendor(undefined)
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving vendor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Purchase Order handlers
  const handleAddPurchaseOrder = () => {
    setEditingPurchaseOrder(undefined)
    setShowPurchaseOrderForm(true)
  }

  const handleEditPurchaseOrder = (purchaseOrder: any) => {
    setEditingPurchaseOrder(purchaseOrder)
    setShowPurchaseOrderForm(true)
  }

  const handleViewPurchaseOrder = (id: string) => {
    // For now, we'll just show an alert. In a real implementation, this would navigate to a purchase order detail page
    alert(`Viewing purchase order ${id}`)
  }

  const handleSavePurchaseOrder = async (purchaseOrderData: Partial<any>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (editingPurchaseOrder) {
        updatePurchaseOrder(editingPurchaseOrder.id, purchaseOrderData)
        setSuccessMessage('Purchase order updated successfully!')
      } else {
        addPurchaseOrder(purchaseOrderData)
        setSuccessMessage('Purchase order created successfully!')
      }
      
      setShowPurchaseOrderForm(false)
      setEditingPurchaseOrder(undefined)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error saving purchase order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Team management handlers
  const handleAddEmployee = (userId: string) => {
    if (!project.team.includes(userId)) {
      const updatedTeam = [...project.team, userId];
      updateProject(project.id, { team: updatedTeam });
      setSuccessMessage('Employee added to project successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    setShowAddTeamMemberForm(false);
  };

  const handleRemoveEmployee = (userId: string) => {
    const updatedTeam = project.team.filter(id => id !== userId);
    updateProject(project.id, { team: updatedTeam });
    setSuccessMessage('Employee removed from project successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Check if current user can access this project
  const canAccessProject = user && (
    user.assignedProjects?.includes(projectId) || 
    user.permissions.projects.canViewAllProjects ||
    user.role === 'super_admin' ||
    user.role === 'admin'
  );

  // If user cannot access this project, show access denied message
  if (!canAccessProject) {
    return (
      <DashboardLayout user={user || { 
        id: '', 
        name: 'Guest', 
        role: 'sales', 
        email: '', 
        isActive: true,
        createdAt: new Date(),
        assignedProjects: [],
        permissions: { 
          projects: { 
            canViewAllProjects: false,
            canEditAssignedProjects: false,
            canCreateProjects: false,
            canDeleteProjects: false,
            canManageTeam: false
          },
          finance: {
            canViewFinance: false,
            canEditInvoices: false,
            canDeleteInvoices: false,
            canViewReports: false,
            canManagePayments: false
          },
          clients: {
            canViewClients: true,
            canEditClients: true,
            canCreateClients: true,
            canDeleteClients: false
          },
          system: {
            canManageUsers: false,
            canViewAuditLogs: false,
            canManageSettings: false,
            canViewReports: false
          }
        }
      }}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">You don't have permission to view this project.</p>
            <Link href="/projects" className="btn-primary">
              Back to Projects
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Team Tab
  const renderTeamTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Project Team</h3>
        {user && (user.role === 'super_admin' || user.role === 'admin' || user.role === 'projects') && (
          <button 
            onClick={() => setShowAddTeamMemberForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Team Member</span>
          </button>
        )}
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Assigned Employees</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {project.team.length > 0 ? (
            project.team.map((userId) => {
              // Get user details
              const teamMember = users.find(u => u.id === userId);
              return (
                <div key={userId} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-ampere-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-ampere-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{teamMember?.name || `User ${userId}`}</p>
                      <p className="text-sm text-gray-500">{teamMember?.role ? teamMember.role.replace('_', ' ').toUpperCase() : 'Team Member'}</p>
                    </div>
                  </div>
                  {user && (user.role === 'super_admin' || user.role === 'admin' || user.role === 'projects') && (
                    <button 
                      onClick={() => handleRemoveEmployee(userId)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members assigned</h3>
              <p className="text-gray-600">Add team members to this project to grant them access.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout user={user || { 
      id: '', 
      name: 'Guest', 
      role: 'sales', 
      email: '', 
      isActive: true,
      createdAt: new Date(),
      assignedProjects: [],
      permissions: { 
        projects: { 
          canViewAllProjects: false,
          canEditAssignedProjects: false,
          canCreateProjects: false,
          canDeleteProjects: false,
          canManageTeam: false
        },
        finance: {
          canViewFinance: false,
          canEditInvoices: false,
          canDeleteInvoices: false,
          canViewReports: false,
          canManagePayments: false
        },
        clients: {
          canViewClients: true,
          canEditClients: true,
          canCreateClients: true,
          canDeleteClients: false
        },
        system: {
          canManageUsers: false,
          canViewAuditLogs: false,
          canManageSettings: false,
          canViewReports: false
        }
      }
    }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/projects" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600">{client?.name} • {PROJECT_TYPE_LABELS[project.type]}</p>
            </div>
          </div>
          
          {(user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'projects') && (
            <button 
              onClick={() => {
                setEditingProject(project)
                setShowEditForm(true)
              }}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Project</span>
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

        {/* Project Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contract Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(project.contractValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  PROJECT_STATUS_COLORS[project.status]
                )}>
                  {PROJECT_STATUS_LABELS[project.status]}
                </span>
              </div>
              <CheckCircle className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Start Date</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(project.startDate).toLocaleDateString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-lg font-bold text-gray-900">{Math.round(progress)}%</p>
              </div>
              <Activity className="h-8 w-8 text-ampere-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'overview' 
                    ? "border-ampere-500 text-ampere-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'team' 
                    ? "border-ampere-500 text-ampere-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                Team
              </button>
              <button
                onClick={() => setActiveTab('permits')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'permits' 
                    ? "border-ampere-500 text-ampere-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                Permits
              </button>
              <button
                onClick={() => setActiveTab('milestones')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'milestones' 
                    ? "border-ampere-500 text-ampere-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                Milestones
              </button>
              <button
                onClick={() => setActiveTab('vendors')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'vendors' 
                    ? "border-ampere-500 text-ampere-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                Vendors
              </button>
              <button
                onClick={() => setActiveTab('purchase-orders')}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'purchase-orders' 
                    ? "border-ampere-500 text-ampere-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                Purchase Orders
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Description</p>
                        <p className="text-gray-900">{project.description || 'No description provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Location</p>
                        <p className="text-gray-900">
                          {project.location.street} {project.location.building} {project.location.unit}<br />
                          Singapore {project.location.postalCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Expected Completion</p>
                        <p className="text-gray-900">{new Date(project.expectedEndDate).toLocaleDateString()}</p>
                      </div>
                      {project.actualEndDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Actual Completion</p>
                          <p className="text-gray-900">{new Date(project.actualEndDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-600">Project Manager</p>
                        <p className="text-gray-900">{user?.name || 'Not assigned'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Tracking */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Tracking</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                          <span>Overall Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-ampere-600 h-2 rounded-full" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {daysUntilDeadline <= 0 && project.status !== 'completed' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span className="text-sm font-medium text-red-800">Project Overdue</span>
                          </div>
                          <p className="text-sm text-red-700 mt-1">
                            Project is {Math.abs(daysUntilDeadline)} days past deadline
                          </p>
                        </div>
                      )}
                      
                      {daysUntilDeadline > 0 && daysUntilDeadline <= 7 && project.status !== 'completed' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-800">Deadline Approaching</span>
                          </div>
                          <p className="text-sm text-yellow-700 mt-1">
                            {daysUntilDeadline} days remaining until deadline
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && renderTeamTab()}

            {/* Permits Tab */}
            {activeTab === 'permits' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Construction Permits</h3>
                  {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'projects') && (
                    <button 
                      onClick={handleAddPermit}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Permit</span>
                    </button>
                  )}
                </div>

                {project.permits && project.permits.length > 0 ? (
                  <div className="space-y-4">
                    {project.permits.map((permit, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{permit.type}</h4>
                            <p className="text-sm text-gray-600 mt-1">{permit.notes || 'No additional notes'}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Submitted: {new Date(permit.submittedDate).toLocaleDateString()}</span>
                              {permit.approvedDate && (
                                <span>Approved: {new Date(permit.approvedDate).toLocaleDateString()}</span>
                              )}
                              {permit.expiryDate && (
                                <span>Expires: {new Date(permit.expiryDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full",
                              permit.status === 'approved' ? 'bg-green-100 text-green-800' :
                              permit.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                              permit.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {permit.status.charAt(0).toUpperCase() + permit.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Permits Added</h3>
                    <p className="text-gray-600">Start by adding construction permits for this project.</p>
                  </div>
                )}
              </div>
            )}

            {/* Milestones Tab */}
            {activeTab === 'milestones' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
                  {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'projects') && (
                    <button 
                      onClick={handleAddMilestone}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Milestone</span>
                    </button>
                  )}
                </div>

                {project.milestones && project.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {project.milestones.map((milestone, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Due: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                              {milestone.actualDate && (
                                <span>Completed: {new Date(milestone.actualDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full",
                              milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                              milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              milestone.status === 'delayed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Milestones Added</h3>
                    <p className="text-gray-600">Start by adding project milestones and deliverables.</p>
                  </div>
                )}
              </div>
            )}

            {/* Vendors Tab */}
            {activeTab === 'vendors' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Project Vendors</h3>
                  {user && (user.role === 'super_admin' || user.role === 'admin' || user.role === 'projects') && (
                    <button 
                      onClick={handleAddVendor}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Vendor</span>
                    </button>
                  )}
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">Assigned Vendors with Budgets</h4>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {project.vendors.length > 0 ? (
                      project.vendors.map((projectVendor) => {
                        const vendor = getVendor(projectVendor.vendorId);
                        const budgetUsed = projectVendor.budgetUsed || 0;
                        const budgetAllocated = projectVendor.budgetAllocated || 0;
                        const budgetRemaining = budgetAllocated - budgetUsed;
                        const budgetPercentage = budgetAllocated > 0 ? (budgetUsed / budgetAllocated) * 100 : 0;
                        
                        return (
                          <div key={projectVendor.vendorId} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-ampere-100 rounded-lg flex items-center justify-center">
                                  <Building className="h-6 w-6 text-ampere-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{vendor?.name || 'Unknown Vendor'}</h4>
                                  <p className="text-sm text-gray-500">{projectVendor.role}</p>
                                </div>
                              </div>
                              
                              {user && (user.role === 'super_admin' || user.role === 'admin' || user.role === 'projects') && (
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => handleEditVendor(projectVendor)}
                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteVendor(projectVendor.vendorId)}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-600">Budget Allocated</p>
                                <p className="text-lg font-semibold text-gray-900">{formatCurrency(budgetAllocated)}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-600">Budget Used</p>
                                <p className="text-lg font-semibold text-gray-900">{formatCurrency(budgetUsed)}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-600">Budget Remaining</p>
                                <p className={`text-lg font-semibold ${budgetRemaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                  {formatCurrency(budgetRemaining)}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-600">Utilization</p>
                                <p className="text-lg font-semibold text-gray-900">{Math.round(budgetPercentage)}%</p>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                                <span>Budget Utilization</span>
                                <span>{Math.round(budgetPercentage)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    budgetPercentage > 90 ? 'bg-red-500' : 
                                    budgetPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors assigned</h3>
                        <p className="text-gray-600">Add vendors to this project and allocate budgets.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Orders Tab */}
            {activeTab === 'purchase-orders' && (
              <PurchaseOrderList
                projectId={project.id}
                onAddPurchaseOrder={handleAddPurchaseOrder}
                onViewPurchaseOrder={handleViewPurchaseOrder}
                onEditPurchaseOrder={handleEditPurchaseOrder}
              />
            )}
          </div>
        </div>
      </div>

      {/* Project Form Modal */}
      <ProjectForm
        project={editingProject}
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingProject(undefined);
        }}
        onSave={handleSaveProject}
        mode={editingProject ? 'edit' : 'add'}
        isLoading={isLoading}
      />

      {/* Permit Form Modal */}
      <PermitForm
        permit={editingPermit}
        isOpen={showPermitForm}
        onClose={() => {
          setShowPermitForm(false);
          setEditingPermit(undefined);
        }}
        onSave={handleSavePermit}
        mode={editingPermit ? 'edit' : 'add'}
        isLoading={isLoading}
      />

      {/* Milestone Form Modal */}
      <MilestoneForm
        milestone={editingMilestone}
        isOpen={showMilestoneForm}
        onClose={() => {
          setShowMilestoneForm(false);
          setEditingMilestone(undefined);
        }}
        onSave={handleSaveMilestone}
        mode={editingMilestone ? 'edit' : 'add'}
        isLoading={isLoading}
      />

      {/* Vendor Form Modal */}
      <ProjectVendorForm
        projectVendor={editingVendor}
        isOpen={showVendorForm}
        onClose={() => {
          setShowVendorForm(false);
          setEditingVendor(undefined);
        }}
        onSave={handleSaveVendor}
        mode={editingVendor ? 'edit' : 'add'}
        isLoading={isLoading}
      />

      {/* Purchase Order Form Modal */}
      <PurchaseOrderForm
        purchaseOrder={editingPurchaseOrder}
        projectId={project.id}
        isOpen={showPurchaseOrderForm}
        onClose={() => {
          setShowPurchaseOrderForm(false);
          setEditingPurchaseOrder(undefined);
        }}
        onSave={handleSavePurchaseOrder}
        mode={editingPurchaseOrder ? 'edit' : 'add'}
        isLoading={isLoading}
      />

      {/* Add Team Member Form Modal */}
      <AddTeamMemberForm
        projectId={project.id}
        existingTeam={project.team}
        isOpen={showAddTeamMemberForm}
        onClose={() => setShowAddTeamMemberForm(false)}
        onAdd={handleAddEmployee}
        isLoading={isLoading}
      />
    </DashboardLayout>
  )
}