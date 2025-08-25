'use client'

import { useState } from 'react'
import { User } from '@/types'
import { cn } from '@/lib/utils'
import { useUsers } from '@/contexts/UserContext'
import { 
  Users, X, Save, Search, User as UserIcon
} from 'lucide-react'

interface AddTeamMemberFormProps {
  projectId: string
  existingTeam: string[]
  isOpen: boolean
  onClose: () => void
  onAdd: (userId: string) => void
  isLoading?: boolean
}

export default function AddTeamMemberForm({ 
  projectId,
  existingTeam,
  isOpen, 
  onClose, 
  onAdd,
  isLoading = false 
}: AddTeamMemberFormProps) {
  const { users } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filter users to only show active users and exclude already assigned team members
  const availableUsers = users.filter(user => 
    user.isActive && 
    !existingTeam.includes(user.id) &&
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddMember = (userId: string) => {
    onAdd(userId)
    setSearchTerm('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-ampere-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-ampere-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Team Member
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select employees to add to this project
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500"
                placeholder="Search employees..."
              />
            </div>
          </div>

          {/* User List */}
          <div className="max-h-96 overflow-y-auto">
            {availableUsers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {availableUsers.map(user => (
                  <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-ampere-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-ampere-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(user.id)}
                      disabled={isLoading}
                      className="btn-primary text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'No employees match your search criteria' 
                    : 'All available employees are already assigned to this project'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}