'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'

interface UserContextType {
  users: User[]
  getUser: (id: string) => User | undefined
  refreshUsers: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUsers = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: React.ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([])

  // Initialize users from localStorage if available
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('ampere_users')
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers)
        // Validate that the data structure is correct
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setUsers(parsedUsers)
        }
      }
    } catch (error) {
      console.error('Error loading users from localStorage:', error)
      // Fall back to empty array if there's an error
      setUsers([])
    }
  }, [])

  // Save users to localStorage whenever users change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_users', JSON.stringify(users))
    } catch (error) {
      console.error('Error saving users to localStorage:', error)
    }
  }, [users])

  const getUser = (id: string): User | undefined => {
    return users.find(user => user.id === id)
  }

  const refreshUsers = () => {
    // Refresh from localStorage or reset to empty array
    try {
      const storedUsers = localStorage.getItem('ampere_users')
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers))
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Error refreshing users:', error)
      setUsers([])
    }
  }

  const contextValue: UserContextType = {
    users,
    getUser,
    refreshUsers
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}
