'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Building2, 
  Users, 
  FolderOpen, 
  TrendingUp, 
  DollarSign, 
  ClipboardList, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  UserCheck,
  Briefcase,
  Shield
} from 'lucide-react'
import { UserRole } from '@/types'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userRole: UserRole
  isCollapsed?: boolean
  onToggle?: () => void
}

interface MenuItem {
  title: string
  href: string
  icon: React.ElementType
  roles?: UserRole[] // For backward compatibility
  badge?: string
  // New permission-based access
  permissionCheck?: () => boolean
  subItems?: MenuItem[] // Add subItems property
}

export default function Sidebar({ userRole, isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { 
    canAccessFinance,
    canViewClients,
    canManageUsers,
    canManageSettings,
    canViewAuditLogs,
    canViewReports,
    hasAnyRole
  } = useAuth()
  
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['super_admin', 'admin', 'finance', 'projects', 'sales'],
    },
    {
      title: 'Clients',
      href: '/clients',
      icon: Users,
      permissionCheck: () => canViewClients(),
    },
    {
      title: 'Vendors',
      href: '/vendors',
      icon: Briefcase,
      roles: ['super_admin', 'admin', 'projects'],
    },
    {
      title: 'Tenders',
      href: '/tenders',
      icon: ClipboardList,
      roles: ['super_admin', 'admin', 'sales'],
    },
    {
      title: 'Quotations',
      href: '/quotations',
      icon: FileText,
      roles: ['super_admin', 'admin', 'sales', 'finance'],
    },
    {
      title: 'Projects',
      href: '/projects',
      icon: FolderOpen,
      // Projects are now accessible to all roles, but filtered based on user access
      roles: ['super_admin', 'admin', 'projects', 'finance', 'sales'],
    },
    {
      title: 'Finance',
      href: '/finance',
      icon: DollarSign,
      permissionCheck: () => canAccessFinance(),
      subItems: [ // Add subItems for Finance
        {
          title: 'Client Invoices',
          href: '/finance',
          icon: FileText,
        },
        {
          title: 'Vendor Invoices',
          href: '/finance/vendor-invoices',
          icon: FileText,
        },
        {
          title: 'Purchase Orders',
          href: '/finance/purchase-orders',
          icon: ClipboardList,
        }
      ]
    },
    {
      title: 'Reports',
      href: '/reports',
      icon: TrendingUp,
      permissionCheck: () => canViewReports(),
    },
    {
      title: 'Users',
      href: '/users',
      icon: UserCheck,
      permissionCheck: () => canManageUsers(),
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
      permissionCheck: () => canManageSettings(),
    },
    {
      title: 'Audit Logs',
      href: '/audit-logs',
      icon: Shield,
      permissionCheck: () => canViewAuditLogs(),
    },
  ]
  
  const filteredMenuItems = menuItems.filter(item => {
    // If item has permission check, use that
    if (item.permissionCheck) {
      return item.permissionCheck()
    }
    
    // Fallback to role-based access
    if (item.roles) {
      return hasAnyRole(item.roles)
    }
    
    return false
  })

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <img src="/images/ampere-logo.png" alt="Ampere Engineering" className="h-10 w-auto" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5 text-gray-600" />
          ) : (
            <X className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "sidebar-item group",
                  isActive && "active",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  !isCollapsed && "mr-3",
                  isActive ? "text-ampere-600" : "text-gray-500 group-hover:text-gray-700"
                )} />
                {!isCollapsed && (
                  <span className={cn(
                    "font-medium",
                    isActive ? "text-ampere-700" : "text-gray-700"
                  )}>
                    {item.title}
                  </span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
              
              {/* Render sub-items if they exist and the parent is active or not collapsed */}
              {!isCollapsed && item.subItems && item.subItems.length > 0 && isActive && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.subItems.map((subItem) => {
                    const SubIcon = subItem.icon
                    const isSubActive = pathname === subItem.href
                    
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "sidebar-item group text-sm",
                          isSubActive && "active"
                        )}
                      >
                        <SubIcon className={cn(
                          "h-4 w-4 mr-3",
                          isSubActive ? "text-ampere-600" : "text-gray-500 group-hover:text-gray-700"
                        )} />
                        <span className={cn(
                          "font-medium",
                          isSubActive ? "text-ampere-700" : "text-gray-700"
                        )}>
                          {subItem.title}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer with accreditations */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-center space-x-2 mb-3">
            <img src="/images/bizsafe-logo.png" alt="BizSafe Star Accredited" className="h-6" />
            <img src="/images/iso45001-logo.png" alt="ISO 45001 Certified" className="h-6" />
          </div>
          <p className="text-xs text-gray-500 text-center">
            © 2024 Ampere Engineering Pte Ltd
          </p>
        </div>
      )}
    </div>
  )
}