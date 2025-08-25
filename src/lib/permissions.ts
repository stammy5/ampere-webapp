import { User, UserPermissions, Project, DEFAULT_PERMISSIONS } from '@/types'

/**
 * Permission Service - Centralized utility for checking user permissions
 * across the application with fine-grained access control
 */
export class PermissionService {
  /**
   * Check if user has permission to access finance module
   */
  static canAccessFinance(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Super admin and admin can always access finance for oversight
    if (user.role === 'super_admin' || user.role === 'admin') return true
    
    // Finance role can access their own module
    if (user.role === 'finance') return true
    
    // Check fine-grained permissions
    return user.permissions?.finance?.canViewFinance ?? false
  }

  /**
   * Check if user can edit invoices
   */
  static canEditInvoices(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Super admin can always edit
    if (user.role === 'super_admin') return true
    
    // Check specific permission
    return user.permissions?.finance?.canEditInvoices ?? false
  }

  /**
   * Check if user can delete invoices
   */
  static canDeleteInvoices(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Only super admin can delete invoices by default
    if (user.role === 'super_admin') return true
    
    // Check specific permission
    return user.permissions?.finance?.canDeleteInvoices ?? false
  }

  /**
   * Check if user can manage payments
   */
  static canManagePayments(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Super admin can always manage payments
    if (user.role === 'super_admin') return true
    
    // Check specific permission
    return user.permissions?.finance?.canManagePayments ?? false
  }

  /**
   * Check if user can view a specific project
   */
  static canViewProject(user: User, project: Project): boolean {
    if (!user || !user.isActive) return false
    
    // Super admin and admin can view all projects
    if (user.role === 'super_admin' || user.role === 'admin') return true
    
    // Check if user can view all projects
    if (user.permissions?.projects?.canViewAllProjects) return true
    
    // Check if user is assigned to this specific project
    if (user.assignedProjects?.includes(project.id)) return true
    
    // Check if user is project manager
    if (project.projectManager === user.id) return true
    
    // Check if user is in project team
    if (project.team?.includes(user.id)) return true
    
    return false
  }

  /**
   * Check if user can edit a specific project
   */
  static canEditProject(user: User, project: Project): boolean {
    if (!user || !user.isActive) return false
    
    // Super admin and admin can edit all projects
    if (user.role === 'super_admin' || user.role === 'admin') return true
    
    // Check if user can edit assigned projects and is assigned to this project
    if (user.permissions?.projects?.canEditAssignedProjects) {
      return (
        user.assignedProjects?.includes(project.id) ||
        project.projectManager === user.id ||
        project.team?.includes(user.id)
      )
    }
    
    return false
  }

  /**
   * Check if user can create projects
   */
  static canCreateProjects(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Super admin and admin can create projects
    if (user.role === 'super_admin' || user.role === 'admin') return true
    
    // Check specific permission
    return user.permissions?.projects?.canCreateProjects ?? false
  }

  /**
   * Check if user can delete projects
   */
  static canDeleteProjects(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Only super admin can delete projects by default
    if (user.role === 'super_admin') return true
    
    // Check specific permission
    return user.permissions?.projects?.canDeleteProjects ?? false
  }

  /**
   * Check if user can manage project teams
   */
  static canManageProjectTeam(user: User, project?: Project): boolean {
    if (!user || !user.isActive) return false
    
    // Super admin and admin can manage teams
    if (user.role === 'super_admin' || user.role === 'admin') return true
    
    // Project managers can manage their project teams
    if (project && project.projectManager === user.id) return true
    
    // Check specific permission
    return user.permissions?.projects?.canManageTeam ?? false
  }

  /**
   * Check if user can view clients
   */
  static canViewClients(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Most roles can view clients (except projects role which has limited access)
    if (user.role !== 'projects') return true
    
    // Check specific permission
    return user.permissions?.clients?.canViewClients ?? true
  }

  /**
   * Check if user can edit clients
   */
  static canEditClients(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Super admin, admin, and sales can edit clients
    if (['super_admin', 'admin', 'sales'].includes(user.role)) return true
    
    // Check specific permission
    return user.permissions?.clients?.canEditClients ?? false
  }

  /**
   * Check if user can create clients
   */
  static canCreateClients(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Super admin, admin, and sales can create clients
    if (['super_admin', 'admin', 'sales'].includes(user.role)) return true
    
    // Check specific permission
    return user.permissions?.clients?.canCreateClients ?? false
  }

  /**
   * Check if user can delete clients
   */
  static canDeleteClients(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Only super admin can delete clients by default
    if (user.role === 'super_admin') return true
    
    // Check specific permission
    return user.permissions?.clients?.canDeleteClients ?? false
  }

  /**
   * Check if user can manage other users
   */
  static canManageUsers(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Super admin and admin can manage users
    if (['super_admin', 'admin'].includes(user.role)) return true
    
    // Check specific permission
    return user.permissions?.system?.canManageUsers ?? false
  }

  /**
   * Check if user can view audit logs
   */
  static canViewAuditLogs(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Only super admin can view audit logs by default
    if (user.role === 'super_admin') return true
    
    // Check specific permission
    return user.permissions?.system?.canViewAuditLogs ?? false
  }

  /**
   * Check if user can manage system settings
   */
  static canManageSettings(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Super admin and admin can manage settings
    if (['super_admin', 'admin'].includes(user.role)) return true
    
    // Check specific permission
    return user.permissions?.system?.canManageSettings ?? false
  }

  /**
   * Check if user can view financial reports
   */
  static canViewReports(user: User): boolean {
    if (!user || !user.isActive) return false
    
    // Super admin, admin, and finance can view reports
    if (['super_admin', 'admin', 'finance'].includes(user.role)) return true
    
    // Check specific permission
    return user.permissions?.system?.canViewReports ?? false
  }

  /**
   * Get filtered projects list based on user permissions
   */
  static getAccessibleProjects(user: User, allProjects: Project[]): Project[] {
    if (!user || !user.isActive) return []
    
    // Super admin and admin can see all projects
    if (user.role === 'super_admin' || user.role === 'admin') {
      return allProjects
    }
    
    // If user can view all projects
    if (user.permissions?.projects?.canViewAllProjects) {
      return allProjects
    }
    
    // Filter projects based on user access
    return allProjects.filter(project => this.canViewProject(user, project))
  }

  /**
   * Initialize user permissions based on role
   */
  static initializeUserPermissions(role: User['role']): UserPermissions {
    return { ...DEFAULT_PERMISSIONS[role] }
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(user: User, roles: User['role'][]): boolean {
    if (!user || !user.isActive) return false
    return roles.includes(user.role)
  }

  /**
   * Check if user is project team member or manager
   */
  static isProjectMember(user: User, project: Project): boolean {
    if (!user || !user.isActive) return false
    
    return (
      project.projectManager === user.id ||
      project.team?.includes(user.id) ||
      user.assignedProjects?.includes(project.id)
    )
  }

  /**
   * Get user's accessible project IDs
   */
  static getAccessibleProjectIds(user: User, allProjects: Project[]): string[] {
    if (!user || !user.isActive) return []
    
    // Super admin and admin can access all projects
    if (user.role === 'super_admin' || user.role === 'admin') {
      return allProjects.map(p => p.id)
    }
    
    // If user can view all projects
    if (user.permissions?.projects?.canViewAllProjects) {
      return allProjects.map(p => p.id)
    }
    
    // Collect accessible project IDs
    const accessibleIds = new Set<string>()
    
    // Add assigned projects
    if (user.assignedProjects) {
      user.assignedProjects.forEach(id => accessibleIds.add(id))
    }
    
    // Add projects where user is manager or team member
    allProjects.forEach(project => {
      if (project.projectManager === user.id || project.team?.includes(user.id)) {
        accessibleIds.add(project.id)
      }
    })
    
    return Array.from(accessibleIds)
  }
}