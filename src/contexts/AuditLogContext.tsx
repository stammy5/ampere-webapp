'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuditLog, AuditAction, AuditEntityType, AuditChange, AuditLogFilter, AuditLogSummary, UserRole } from '@/types'

interface AuditLogContextType {
  auditLogs: AuditLog[]
  getAuditLogs: (filter?: AuditLogFilter) => AuditLog[]
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void
  getAuditLogSummary: () => AuditLogSummary
  exportAuditLogs: (filter?: AuditLogFilter) => string
  clearAuditLogs: () => void
  getAuditLogById: (id: string) => AuditLog | undefined
  getLogsByEntity: (entityType: AuditEntityType, entityId: string) => AuditLog[]
  getLogsByUser: (userId: string) => AuditLog[]
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined)

export const useAuditLog = () => {
  const context = useContext(AuditLogContext)
  if (context === undefined) {
    throw new Error('useAuditLog must be used within an AuditLogProvider')
  }
  return context
}

interface AuditLogProviderProps {
  children: React.ReactNode
}

// Helper function to detect changes between old and new objects
const detectChanges = (oldObject: any, newObject: any, excludeFields: string[] = []): AuditChange[] => {
  const changes: AuditChange[] = []
  
  if (!oldObject || !newObject) return changes

  const allKeys = new Set([...Object.keys(oldObject), ...Object.keys(newObject)])
  
  allKeys.forEach(key => {
    if (excludeFields.includes(key)) return
    
    const oldValue = oldObject[key]
    const newValue = newObject[key]
    
    // Handle nested objects (like address)
    if (typeof oldValue === 'object' && typeof newValue === 'object' && oldValue !== null && newValue !== null) {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue: JSON.stringify(oldValue),
          newValue: JSON.stringify(newValue),
          fieldLabel: key.charAt(0).toUpperCase() + key.slice(1)
        })
      }
    } else if (oldValue !== newValue) {
      changes.push({
        field: key,
        oldValue,
        newValue,
        fieldLabel: key.charAt(0).toUpperCase() + key.slice(1)
      })
    }
  })
  
  return changes
}

export const AuditLogProvider: React.FC<AuditLogProviderProps> = ({ children }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  // Initialize audit logs from localStorage on mount
  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem('ampere_audit_logs')
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs)
        // Convert timestamp strings back to Date objects
        const logsWithDates = parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }))
        setAuditLogs(logsWithDates)
      }
    } catch (error) {
      console.error('Error loading audit logs from localStorage:', error)
    }
  }, [])

  // Save audit logs to localStorage whenever logs change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_audit_logs', JSON.stringify(auditLogs))
    } catch (error) {
      console.error('Error saving audit logs to localStorage:', error)
    }
  }, [auditLogs])

  const generateLogId = (): string => {
    return `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...logData,
      id: generateLogId(),
      timestamp: new Date(),
      ipAddress: logData.ipAddress || 'localhost',
      userAgent: logData.userAgent || navigator.userAgent
    }

    setAuditLogs(prevLogs => [newLog, ...prevLogs])
  }

  const getAuditLogs = (filter?: AuditLogFilter): AuditLog[] => {
    if (!filter) return auditLogs

    return auditLogs.filter(log => {
      // Filter by user ID
      if (filter.userId && log.userId !== filter.userId) return false
      
      // Filter by user role
      if (filter.userRole && log.userRole !== filter.userRole) return false
      
      // Filter by action
      if (filter.action && log.action !== filter.action) return false
      
      // Filter by entity type
      if (filter.entityType && log.entityType !== filter.entityType) return false
      
      // Filter by date range
      if (filter.dateFrom && log.timestamp < filter.dateFrom) return false
      if (filter.dateTo && log.timestamp > filter.dateTo) return false
      
      // Filter by search term (searches in user name, entity name, and details)
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase()
        const searchableText = [
          log.userName,
          log.entityName,
          log.details,
          log.action,
          log.entityType
        ].join(' ').toLowerCase()
        
        if (!searchableText.includes(searchTerm)) return false
      }
      
      return true
    })
  }

  const getAuditLogSummary = (): AuditLogSummary => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const todayLogs = auditLogs.filter(log => log.timestamp >= today).length
    const weekLogs = auditLogs.filter(log => log.timestamp >= weekAgo).length
    const monthLogs = auditLogs.filter(log => log.timestamp >= monthAgo).length

    // Count by action
    const byAction = auditLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {} as Record<AuditAction, number>)

    // Count by entity type
    const byEntityType = auditLogs.reduce((acc, log) => {
      acc[log.entityType] = (acc[log.entityType] || 0) + 1
      return acc
    }, {} as Record<AuditEntityType, number>)

    // Count by user
    const userCounts = auditLogs.reduce((acc, log) => {
      const existing = acc.find(u => u.userId === log.userId)
      if (existing) {
        existing.count++
      } else {
        acc.push({
          userId: log.userId,
          userName: log.userName,
          count: 1
        })
      }
      return acc
    }, [] as { userId: string; userName: string; count: number; }[])

    // Sort by count and take top 10
    const byUser = userCounts.sort((a, b) => b.count - a.count).slice(0, 10)

    // Recent activity (last 20 logs)
    const recentActivity = auditLogs.slice(0, 20)

    return {
      totalLogs: auditLogs.length,
      todayLogs,
      weekLogs,
      monthLogs,
      byAction,
      byEntityType,
      byUser,
      recentActivity
    }
  }

  const exportAuditLogs = (filter?: AuditLogFilter): string => {
    const logsToExport = getAuditLogs(filter)
    return JSON.stringify(logsToExport, null, 2)
  }

  const clearAuditLogs = () => {
    setAuditLogs([])
    localStorage.removeItem('ampere_audit_logs')
  }

  const getAuditLogById = (id: string): AuditLog | undefined => {
    return auditLogs.find(log => log.id === id)
  }

  const getLogsByEntity = (entityType: AuditEntityType, entityId: string): AuditLog[] => {
    return auditLogs.filter(log => log.entityType === entityType && log.entityId === entityId)
  }

  const getLogsByUser = (userId: string): AuditLog[] => {
    return auditLogs.filter(log => log.userId === userId)
  }

  const contextValue: AuditLogContextType = {
    auditLogs,
    getAuditLogs,
    addAuditLog,
    getAuditLogSummary,
    exportAuditLogs,
    clearAuditLogs,
    getAuditLogById,
    getLogsByEntity,
    getLogsByUser
  }

  return (
    <AuditLogContext.Provider value={contextValue}>
      {children}
    </AuditLogContext.Provider>
  )
}

// Utility function to create audit logs for different scenarios
export const createAuditLog = (
  action: AuditAction,
  entityType: AuditEntityType,
  entityId: string,
  user: { id: string; name: string; role: UserRole },
  options?: {
    entityName?: string
    oldData?: any
    newData?: any
    details?: string
    excludeFields?: string[]
  }
): Omit<AuditLog, 'id' | 'timestamp'> => {
  const changes = options?.oldData && options?.newData 
    ? detectChanges(options.oldData, options.newData, options.excludeFields || ['id', 'createdAt', 'updatedAt'])
    : undefined

  return {
    userId: user.id,
    userRole: user.role,
    userName: user.name,
    action,
    entityType,
    entityId,
    entityName: options?.entityName,
    changes,
    details: options?.details
  }
}