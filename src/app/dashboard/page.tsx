'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard'
import FinanceDashboard from '@/components/dashboard/FinanceDashboard'
import ProjectsDashboard from '@/components/dashboard/ProjectsDashboard'
import SalesDashboard from '@/components/dashboard/SalesDashboard'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  const renderDashboard = () => {
    if (!user) return null
    
    switch (user.role) {
      case 'super_admin':
        return <SuperAdminDashboard />
      case 'admin':
        return <SuperAdminDashboard /> // Admin sees same as Super Admin
      case 'finance':
        return <FinanceDashboard />
      case 'projects':
        return <ProjectsDashboard />
      case 'sales':
        return <SalesDashboard />
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this dashboard.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <ProtectedRoute>
      {user && (
        <DashboardLayout user={user}>
          {renderDashboard()}
        </DashboardLayout>
      )}
    </ProtectedRoute>
  )
}