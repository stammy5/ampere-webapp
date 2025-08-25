'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, ChevronDown, User } from 'lucide-react'
import { User as UserType } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { getRoleDisplayName } from '@/lib/utils'

interface HeaderProps {
  user: UserType
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  const { logout, switchUser } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserSwitcher, setShowUserSwitcher] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const notifications = [
    {
      id: '1',
      title: 'New tender opportunity',
      message: 'Sentosa Resort Hotel Renovation tender is now available',
      time: '2 hours ago',
      unread: true
    },
    {
      id: '2',
      title: 'Project milestone completed',
      message: 'Marina Bay Condo A&A Works - Phase 1 completed',
      time: '4 hours ago',
      unread: true
    },
    {
      id: '3',
      title: 'Invoice payment received',
      message: 'Payment received for Golden Dragon Restaurant project',
      time: '1 day ago',
      unread: false
    }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  // Demo user switching (for testing different roles)
  const handleUserSwitch = (userId: string) => {
    try {
      switchUser(userId)
    } catch (error) {
      console.error('Error switching user:', error)
    }
    setShowUserSwitcher(false)
    setShowUserMenu(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, clients, tenders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="text-sm text-ampere-600 hover:text-ampere-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-ampere-100 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-ampere-600" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    View Profile
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Account Settings
                  </button>
                  <button 
                    onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Switch User (Demo)
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Help & Support
                  </button>
                  <hr className="my-1" />
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Switcher (Demo Feature) - Only show for super admin */}
      {showUserSwitcher && user.role === 'super_admin' && (
        <div className="absolute top-16 right-6 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Switch User (Demo)</h4>
          <p className="text-xs text-gray-500 mb-2">Feature only available in demo mode</p>
          <div className="text-xs text-gray-400">
            In a production environment, this would show available users.
          </div>
        </div>
      )}

      {/* Close dropdowns when clicking outside */}
      {(showUserMenu || showNotifications || showUserSwitcher) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false)
            setShowNotifications(false)
            setShowUserSwitcher(false)
          }}
        />
      )}
    </header>
  )
}