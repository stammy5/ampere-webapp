'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Building2 } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading while determining auth state
  return (
    <div className="min-h-screen bg-gradient-to-br from-ampere-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-12 w-12 text-ampere-600 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ampere</h1>
              <p className="text-sm text-gray-500">Engineering</p>
            </div>
          </div>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ampere-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading application...</p>
      </div>
    </div>
  )
}