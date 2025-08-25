'use client'

'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useUsers } from '@/contexts/UserContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import UserForm from '@/components/forms/UserForm'
import { User, UserRole } from '@/types'
import { 
  ArrowLeft, Edit, Shield, Mail, Calendar, Activity, 
  CheckCircle, XCircle, Crown, Star, Briefcase, DollarSign, 
  ShoppingCart, Clock, AlertTriangle, Settings, Eye, 
  UserCheck, Download, MoreVertical, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  super_admin: Crown,
  admin: Star,
  finance: DollarSign,
  projects: Briefcase,
  sales: ShoppingCart
}

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-red-100 text-red-800 border-red-200',
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  finance: 'bg-green-100 text-green-800 border-green-200',
  projects: 'bg-blue-100 text-blue-800 border-blue-200',
  sales: 'bg-orange-100 text-orange-800 border-orange-200'
}

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin', 
  finance: 'Finance',
  projects: 'Projects',
  sales: 'Sales'
}

// Mock activity data
const generateMockActivity = (userId: string) => [
  { id: '1', type: 'login', description: 'Logged into the system', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: '2', type: 'project', description: 'Updated project status for Marina Bay Renovation', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '3', type: 'invoice', description: 'Generated invoice INV-2024-001', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  { id: '4', type: 'quotation', description: 'Submitted quotation for Orchard Road Project', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: '5', type: 'client', description: 'Added new client: Tech Solutions Pte Ltd', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48) }
]

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { getUser, updateUser, toggleUserStatus, deleteUser } = useUsers()
  
  const userId = params.id as string
  const user = getUser(userId)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditForm, setShowEditForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const activityData = useMemo(() => generateMockActivity(userId), [userId])

  if (!user) {
    return (
      <DashboardLayout user={currentUser!}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">User Not Found</h3>
            <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
            <Link href="/users" className="btn-primary">Back to Users</Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleUpdateUser = async (userData: Partial<User>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateUser(user.id, userData)
      setShowEditForm(false)
      setSuccessMessage('User updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = () => {
    if (user.role === 'super_admin' && user.isActive) {
      alert('Super Admin users cannot be deactivated.')
      return
    }

    const action = user.isActive ? 'deactivate' : 'activate'
    if (confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      const success = toggleUserStatus(user.id)
      if (success) {
        setSuccessMessage(`User ${action}d successfully!`)
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    }
  }

  const handleDeleteUser = () => {
    if (user.role === 'super_admin') {
      alert('Super Admin users cannot be deleted.')
      return
    }

    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      const success = deleteUser(user.id)
      if (success) {
        router.push('/users')
      }
    }
  }

  const canManageUser = () => {
    if (!currentUser) return false
    if (currentUser.role === 'super_admin') return true
    if (currentUser.role === 'admin' && user.role !== 'super_admin' && user.role !== 'admin') return true
    return false
  }

  const RoleIcon = ROLE_ICONS[user.role]

  if (!currentUser) return null

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/users" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-600">View and manage user account details</p>
            </div>
          </div>
          
          {canManageUser() && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEditForm(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit User</span>
              </button>
              <div className="relative group">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={handleToggleStatus}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      <span>{user.isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>
                    {user.role !== 'super_admin' && (
                      <button
                        onClick={handleDeleteUser}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span>Delete User</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
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
            <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* User Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-ampere-100 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <span className="text-ampere-600 font-bold text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <span className={cn(
                  "px-3 py-1 text-sm font-medium rounded-full border",
                  ROLE_COLORS[user.role]
                )}>
                  <RoleIcon className="h-4 w-4 inline mr-1" />
                  {ROLE_LABELS[user.role]}
                </span>
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                )}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Last Login:</span>
                  <span className="font-medium">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-medium">#{user.id}</span>
                </div>
              </div>
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
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'overview'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <UserCheck className="h-4 w-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'activity'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Activity className="h-4 w-4" />
                <span>Activity Log</span>
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'permissions'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Shield className="h-4 w-4" />
                <span>Permissions</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">User Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Account Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Status:</span>
                        <span className={cn("font-medium", user.isActive ? "text-green-600" : "text-red-600")}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <span className="font-medium">{ROLE_LABELS[user.role]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member Since:</span>
                        <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Activity Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Logins:</span>
                        <span className="font-medium">45</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Projects Managed:</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Documents Created:</span>
                        <span className="font-medium">28</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Activity:</span>
                        <span className="font-medium">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <div className="space-y-4">
                  {activityData.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 bg-ampere-100 rounded-full flex items-center justify-center">
                        <Activity className="h-4 w-4 text-ampere-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Role Permissions</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <RoleIcon className="h-6 w-6 text-ampere-600" />
                    <span className="font-medium text-gray-900">{ROLE_LABELS[user.role]} Role</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {user.role === 'super_admin' && (
                      <>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Full system access</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>User management</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>System configuration</span></div>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Project management</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Client management</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Vendor coordination</span></div>
                      </>
                    )}
                    {user.role === 'finance' && (
                      <>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Financial data access</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Invoicing and payments</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Financial reports</span></div>
                      </>
                    )}
                    {user.role === 'projects' && (
                      <>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Project management</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Vendor coordination</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Permit tracking</span></div>
                      </>
                    )}
                    {user.role === 'sales' && (
                      <>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Client access</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Tender management</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Quotation creation</span></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Form Modal */}
      <UserForm
        user={user}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleUpdateUser}
        mode="edit"
        isLoading={isLoading}
      />
    </DashboardLayout>
  )
}