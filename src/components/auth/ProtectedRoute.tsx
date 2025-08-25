'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'
import { Shield, Lock } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  requiredPermission?: () => boolean
  fallbackMessage?: string
  moduleName?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermission,
  fallbackMessage,
  moduleName = 'this section'
}) => {
  const { user, hasAnyRole } = useAuth()

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  // Check role-based access
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            {fallbackMessage || 
              `You don't have permission to access ${moduleName}. This area is restricted to specific user roles.`
            }
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-medium">Your role:</span> {user.role.replace('_', ' ').toUpperCase()}
            </p>
            {requiredRoles && (
              <p className="text-sm text-gray-500">
                <span className="font-medium">Required roles:</span> {requiredRoles.map(role => role.replace('_', ' ').toUpperCase()).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Check permission function
  if (requiredPermission && !requiredPermission()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            {fallbackMessage || 
              `You don't have the required permissions to access ${moduleName}.`
            }
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Current role:</span> {user.role.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // User has access, render children
  return <>{children}</>
}

export default ProtectedRoute