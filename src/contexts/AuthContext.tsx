'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, UserRole, Project } from '@/types'
import { useAuditLog, createAuditLog } from '@/contexts/AuditLogContext'
import { PermissionService } from '@/lib/permissions'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasPermission: (requiredRoles: UserRole[]) => boolean
  switchUser: (userId: string) => void // For demo purposes
  // Enhanced permission checking functions
  canAccessFinance: () => boolean
  canEditInvoices: () => boolean
  canDeleteInvoices: () => boolean
  canManagePayments: () => boolean
  canViewProject: (project: Project) => boolean
  canEditProject: (project: Project) => boolean
  canCreateProjects: () => boolean
  canDeleteProjects: () => boolean
  canManageProjectTeam: (project?: Project) => boolean
  canViewClients: () => boolean
  canEditClients: () => boolean
  canCreateClients: () => boolean
  canDeleteClients: () => boolean
  canManageUsers: () => boolean
  canViewAuditLogs: () => boolean
  canManageSettings: () => boolean
  canViewReports: () => boolean
  getAccessibleProjects: (allProjects: Project[]) => Project[]
  getAccessibleProjectIds: (allProjects: Project[]) => string[]
  hasAnyRole: (roles: UserRole[]) => boolean
  isProjectMember: (project: Project) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const auditLog = useAuditLog()

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check for stored user session
        const storedUser = localStorage.getItem('ampere_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          // In production, would validate from database
          setUser(userData)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        localStorage.removeItem('ampere_user')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (emailOrUsername: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In production, this would be a real authentication API call
      // For demo purposes, we're allowing any non-empty credentials
      if (!emailOrUsername || !password) {
        return { success: false, error: 'Email/username and password are required' }
      }
      
      if (password.length < 3) {
        return { success: false, error: 'Password must be at least 3 characters' }
      }
      
      // Create a basic user object for demo purposes
      const demoUser: User = {
        id: '1',
        name: emailOrUsername.split('@')[0] || emailOrUsername,
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@example.com`,
        role: 'super_admin' as UserRole,
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date(),
        permissions: {
          finance: { canViewFinance: true, canEditInvoices: true, canDeleteInvoices: true, canViewReports: true, canManagePayments: true },
          projects: { canViewAllProjects: true, canEditAssignedProjects: true, canCreateProjects: true, canDeleteProjects: true, canManageTeam: true },
          clients: { canViewClients: true, canEditClients: true, canCreateClients: true, canDeleteClients: true },
          system: { canManageUsers: true, canViewAuditLogs: true, canManageSettings: true, canViewReports: true }
        },
        assignedProjects: []
      }
      
      setUser(demoUser)
      localStorage.setItem('ampere_user', JSON.stringify(demoUser))
      
      // Log successful login
      try {
        auditLog.addAuditLog(createAuditLog(
          'LOGIN',
          'USER',
          demoUser.id,
          demoUser,
          {
            entityName: demoUser.name,
            details: `User logged in via ${emailOrUsername.includes('@') ? 'email' : 'username'}`
          }
        ))
      } catch (auditError) {
        console.warn('Audit logging failed, but login will continue:', auditError)
      }
      
      return { success: true }
      
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (user) {
      // Log logout before clearing user (with error handling)
      try {
        auditLog.addAuditLog(createAuditLog(
          'LOGOUT',
          'USER',
          user.id,
          user,
          {
            entityName: user.name,
            details: 'User logged out'
          }
        ))
      } catch (auditError) {
        console.warn('Audit logging failed during logout:', auditError)
      }
    }
    
    setUser(null)
    localStorage.removeItem('ampere_user')
  }

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false
    return requiredRoles.includes(user.role)
  }

  // Enhanced permission checking functions using PermissionService
  const canAccessFinance = (): boolean => {
    return user ? PermissionService.canAccessFinance(user) : false
  }

  const canEditInvoices = (): boolean => {
    return user ? PermissionService.canEditInvoices(user) : false
  }

  const canDeleteInvoices = (): boolean => {
    return user ? PermissionService.canDeleteInvoices(user) : false
  }

  const canManagePayments = (): boolean => {
    return user ? PermissionService.canManagePayments(user) : false
  }

  const canViewProject = (project: Project): boolean => {
    return user ? PermissionService.canViewProject(user, project) : false
  }

  const canEditProject = (project: Project): boolean => {
    return user ? PermissionService.canEditProject(user, project) : false
  }

  const canCreateProjects = (): boolean => {
    return user ? PermissionService.canCreateProjects(user) : false
  }

  const canDeleteProjects = (): boolean => {
    return user ? PermissionService.canDeleteProjects(user) : false
  }

  const canManageProjectTeam = (project?: Project): boolean => {
    return user ? PermissionService.canManageProjectTeam(user, project) : false
  }

  const canViewClients = (): boolean => {
    return user ? PermissionService.canViewClients(user) : false
  }

  const canEditClients = (): boolean => {
    return user ? PermissionService.canEditClients(user) : false
  }

  const canCreateClients = (): boolean => {
    return user ? PermissionService.canCreateClients(user) : false
  }

  const canDeleteClients = (): boolean => {
    return user ? PermissionService.canDeleteClients(user) : false
  }

  const canManageUsers = (): boolean => {
    return user ? PermissionService.canManageUsers(user) : false
  }

  const canViewAuditLogs = (): boolean => {
    return user ? PermissionService.canViewAuditLogs(user) : false
  }

  const canManageSettings = (): boolean => {
    return user ? PermissionService.canManageSettings(user) : false
  }

  const canViewReports = (): boolean => {
    return user ? PermissionService.canViewReports(user) : false
  }

  const getAccessibleProjects = (allProjects: Project[]): Project[] => {
    return user ? PermissionService.getAccessibleProjects(user, allProjects) : []
  }

  const getAccessibleProjectIds = (allProjects: Project[]): string[] => {
    return user ? PermissionService.getAccessibleProjectIds(user, allProjects) : []
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? PermissionService.hasAnyRole(user, roles) : false
  }

  const isProjectMember = (project: Project): boolean => {
    return user ? PermissionService.isProjectMember(user, project) : false
  }

  // Demo function for development environment only
  const switchUser = (userId: string) => {
    // In production, this would not exist
    console.warn('switchUser is only for development and should be removed in production')
    
    if (!user) return;
      
    // Log user switch (with error handling)
    try {
      auditLog.addAuditLog(createAuditLog(
        'LOGOUT',
        'USER',
        user.id,
        user,
        {
          entityName: user.name,
          details: 'User switched account'
        }
      ))
    } catch (auditError) {
      console.warn('Audit logging failed during user switch logout:', auditError)
    }
  }

  const isAuthenticated = !!user

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    switchUser,
    // Enhanced permission functions
    canAccessFinance,
    canEditInvoices,
    canDeleteInvoices,
    canManagePayments,
    canViewProject,
    canEditProject,
    canCreateProjects,
    canDeleteProjects,
    canManageProjectTeam,
    canViewClients,
    canEditClients,
    canCreateClients,
    canDeleteClients,
    canManageUsers,
    canViewAuditLogs,
    canManageSettings,
    canViewReports,
    getAccessibleProjects,
    getAccessibleProjectIds,
    hasAnyRole,
    isProjectMember
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

