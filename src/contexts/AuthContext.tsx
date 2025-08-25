'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, UserRole, Project } from '@/types'
import { mockUsers } from '@/lib/mock-data'
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
          // Validate user still exists and is active
          const validUser = mockUsers.find(u => u.id === userData.id && u.isActive)
          if (validUser) {
            setUser(validUser)
          } else {
            localStorage.removeItem('ampere_user')
          }
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
      
      // Find user by email or username (name field)
      let foundUser: User | undefined
      
      if (emailOrUsername.includes('@')) {
        // If input contains @, search by email
        foundUser = mockUsers.find(u => u.email.toLowerCase() === emailOrUsername.toLowerCase())
      } else {
        // If no @, search by name (username)
        foundUser = mockUsers.find(u => u.name.toLowerCase() === emailOrUsername.toLowerCase())
      }
      
      if (!foundUser) {
        return { success: false, error: 'User not found' }
      }
      
      if (!foundUser.isActive) {
        return { success: false, error: 'Account is inactive. Please contact administrator.' }
      }
      
      // For demo purposes, accept any password for existing users
      // In production, this would verify against hashed password
      if (password.length < 3) {
        return { success: false, error: 'Invalid password' }
      }
      
      // Update last login
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date()
      }
      
      setUser(updatedUser)
      localStorage.setItem('ampere_user', JSON.stringify(updatedUser))
      
      // Log successful login (temporarily disabled for debugging)
      try {
        auditLog.addAuditLog(createAuditLog(
          'LOGIN',
          'USER',
          updatedUser.id,
          updatedUser,
          {
            entityName: updatedUser.name,
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

  // Demo function to switch between users for testing
  const switchUser = (userId: string) => {
    const newUser = mockUsers.find(u => u.id === userId && u.isActive)
    if (newUser) {
      const updatedUser = {
        ...newUser,
        lastLogin: new Date()
      }
      
      // Log user switch (with error handling)
      if (user) {
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
      
      try {
        auditLog.addAuditLog(createAuditLog(
          'LOGIN',
          'USER',
          updatedUser.id,
          updatedUser,
          {
            entityName: updatedUser.name,
            details: 'User account switched (demo mode)'
          }
        ))
      } catch (auditError) {
        console.warn('Audit logging failed during user switch login:', auditError)
      }
      
      setUser(updatedUser)
      localStorage.setItem('ampere_user', JSON.stringify(updatedUser))
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

// Demo credentials for easy testing
export const DEMO_CREDENTIALS = [
  { email: 'john.tan@ampere.com.sg', username: 'John Tan', password: 'admin123', role: 'Super Admin' },
  { email: 'zack@ampere.com.sg', username: 'Zack', password: 'admin1234', role: 'Super Admin' },
  { email: 'sarah.lim@ampere.com.sg', username: 'Sarah Lim', password: 'admin123', role: 'Admin' },
  { email: 'david.wong@ampere.com.sg', username: 'David Wong', password: 'projects123', role: 'Projects' },
  { email: 'michelle.chen@ampere.com.sg', username: 'Michelle Chen', password: 'finance123', role: 'Finance' },
  { email: 'robert.kumar@ampere.com.sg', username: 'Robert Kumar', password: 'sales123', role: 'Sales' }
]