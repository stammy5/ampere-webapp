'use client'

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useUsers } from '@/contexts/UserContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import UserForm from '@/components/forms/UserForm'
import { User, UserRole } from '@/types'
import { 
  UserCheck, Plus, Search, Filter, Eye, Edit, Trash2, UserPlus, Users,
  Shield, Clock, Activity, CheckCircle, XCircle, AlertTriangle, X,
  Crown, Star, Briefcase, DollarSign, ShoppingCart
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

export default function UsersPage() {
  const { user } = useAuth()
  const { 
    users, addUser, updateUser, deleteUser, toggleUserStatus, 
    getUsersByRole, getActiveUsers, searchUsers 
  } = useUsers()

  const [activeTab, setActiveTab] = useState<'all' | 'active' | UserRole>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Filter users based on search term and active tab
  const filteredUsers = useMemo(() => {
    let filtered = users

    // Apply tab filter
    if (activeTab === 'active') {
      filtered = getActiveUsers()
    } else if (activeTab !== 'all') {
      filtered = getUsersByRole(activeTab as UserRole)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      // Sort by role hierarchy first, then by name
      const roleOrder = { super_admin: 0, admin: 1, finance: 2, projects: 3, sales: 4 }
      const roleComparison = roleOrder[a.role] - roleOrder[b.role]
      return roleComparison !== 0 ? roleComparison : a.name.localeCompare(b.name)
    })
  }, [users, activeTab, searchTerm, getUsersByRole, getActiveUsers])

  // Calculate user statistics
  const userStats = useMemo(() => {
    const total = users.length
    const active = getActiveUsers().length
    const inactive = total - active
    const byRole = {
      super_admin: getUsersByRole('super_admin').length,
      admin: getUsersByRole('admin').length,
      finance: getUsersByRole('finance').length,
      projects: getUsersByRole('projects').length,
      sales: getUsersByRole('sales').length
    }

    return { total, active, inactive, byRole }
  }, [users, getActiveUsers, getUsersByRole])

  const handleCreateUser = async (userData: Partial<User>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      addUser(userData)
      setShowUserForm(false)
      setSuccessMessage('User created successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!editingUser) return
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateUser(editingUser.id, userData)
      setEditingUser(undefined)
      setSuccessMessage('User updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = (userToDelete: User) => {
    if (userToDelete.role === 'super_admin') {
      alert('Super Admin users cannot be deleted.')
      return
    }

    if (confirm(`Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`)) {
      const success = deleteUser(userToDelete.id)
      if (success) {
        setSuccessMessage('User deleted successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    }
  }

  const handleToggleStatus = (userToToggle: User) => {
    if (userToToggle.role === 'super_admin' && userToToggle.isActive) {
      alert('Super Admin users cannot be deactivated.')
      return
    }

    const action = userToToggle.isActive ? 'deactivate' : 'activate'
    if (confirm(`Are you sure you want to ${action} ${userToToggle.name}?`)) {
      const success = toggleUserStatus(userToToggle.id)
      if (success) {
        setSuccessMessage(`User ${action}d successfully!`)
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    }
  }

  const canManageUsers = user?.role === 'super_admin' || user?.role === 'admin'
  const canDeleteUser = (targetUser: User) => {
    if (!canManageUsers) return false
    if (targetUser.role === 'super_admin') return false
    if (user?.role === 'admin' && targetUser.role === 'admin') return false
    return true
  }

  const canEditUser = (targetUser: User) => {
    if (!canManageUsers) return false
    if (user?.role === 'super_admin') return true
    if (user?.role === 'admin' && targetUser.role !== 'super_admin' && targetUser.role !== 'admin') return true
    return false
  }

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage user accounts, roles, and permissions for Ampere Engineering</p>
          </div>
          
          {canManageUsers && (
            <button 
              onClick={() => setShowUserForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
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

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              All registered users
            </p>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Currently active accounts
            </p>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold text-red-600">{userStats.inactive}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Deactivated accounts
            </p>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administrators</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.byRole.super_admin + userStats.byRole.admin}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Super Admin & Admin users
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'all'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Users className="h-4 w-4" />
                <span>All Users ({userStats.total})</span>
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                  activeTab === 'active'
                    ? "border-ampere-500 text-ampere-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Active ({userStats.active})</span>
              </button>
              {Object.entries(userStats.byRole).map(([role, count]) => {
                const RoleIcon = ROLE_ICONS[role as UserRole]
                return (
                  <button
                    key={role}
                    onClick={() => setActiveTab(role as UserRole)}
                    className={cn(
                      "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm",
                      activeTab === role
                        ? "border-ampere-500 text-ampere-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <RoleIcon className="h-4 w-4" />
                    <span>{ROLE_LABELS[role as UserRole]} ({count})</span>
                  </button>
                )
              })}
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
                    placeholder="Search users by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500 w-80"
                  />
                </div>
              </div>
            </div>

            {/* Users Grid */}
            <div className="space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(userItem => {
                  const RoleIcon = ROLE_ICONS[userItem.role]
                  return (
                    <div key={userItem.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-ampere-100 rounded-full flex items-center justify-center">
                            {userItem.avatar ? (
                              <img src={userItem.avatar} alt={userItem.name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <span className="text-ampere-600 font-semibold text-lg">
                                {userItem.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="font-medium text-gray-900">{userItem.name}</h3>
                              <span className={cn(
                                "px-2 py-1 text-xs font-medium rounded-full border",
                                ROLE_COLORS[userItem.role]
                              )}>
                                <RoleIcon className="h-3 w-3 inline mr-1" />
                                {ROLE_LABELS[userItem.role]}
                              </span>
                              <span className={cn(
                                "px-2 py-1 text-xs font-medium rounded-full",
                                userItem.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              )}>
                                {userItem.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{userItem.email}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Joined: {new Date(userItem.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>
                                Last login: {userItem.lastLogin 
                                  ? new Date(userItem.lastLogin).toLocaleDateString() 
                                  : 'Never'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/users/${userItem.id}`}
                            className="text-ampere-600 hover:text-ampere-900 p-2 rounded-lg hover:bg-ampere-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {canEditUser(userItem) && (
                            <button
                              onClick={() => setEditingUser(userItem)}
                              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {canManageUsers && userItem.role !== 'super_admin' && (
                            <button
                              onClick={() => handleToggleStatus(userItem)}
                              className={cn(
                                "p-2 rounded-lg",
                                userItem.isActive
                                  ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                                  : "text-green-600 hover:text-green-900 hover:bg-green-50"
                              )}
                            >
                              {userItem.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </button>
                          )}
                          {canDeleteUser(userItem) && (
                            <button
                              onClick={() => handleDeleteUser(userItem)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search criteria.' 
                      : activeTab === 'all' 
                        ? 'No users exist in the system.'
                        : `No users found in the ${activeTab} category.`
                    }
                  </p>
                  {canManageUsers && !searchTerm && activeTab === 'all' && (
                    <button onClick={() => setShowUserForm(true)} className="btn-primary">
                      Add First User
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Form Modal */}
      <UserForm
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        onSave={handleCreateUser}
        mode="add"
        isLoading={isLoading}
      />

      {/* Edit User Form Modal */}
      <UserForm
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(undefined)}
        onSave={handleUpdateUser}
        mode="edit"
        isLoading={isLoading}
      />
    </DashboardLayout>
  )
}