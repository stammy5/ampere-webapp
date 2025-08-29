'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Project, Permit, Milestone, ProjectVendor } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface ProjectContextType {
  projects: Project[]
  accessibleProjects: Project[] // Filtered based on user permissions
  allProjects: Project[] // All projects (for admin/super_admin)
  getProject: (id: string) => Project | undefined
  addProject: (project: Partial<Project>) => Project
  updateProject: (id: string, updates: Partial<Project>) => boolean
  deleteProject: (id: string) => boolean
  refreshProjects: () => void
  getProjectsByClient: (clientId: string) => Project[]
  getProjectsByStatus: (status: string) => Project[]
  canUserAccessProject: (projectId: string) => boolean
  // New methods for permits, milestones, and vendors
  addPermit: (projectId: string, permit: Partial<Permit>) => boolean
  updatePermit: (projectId: string, permitId: string, updates: Partial<Permit>) => boolean
  deletePermit: (projectId: string, permitId: string) => boolean
  addMilestone: (projectId: string, milestone: Partial<Milestone>) => boolean
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<Milestone>) => boolean
  deleteMilestone: (projectId: string, milestoneId: string) => boolean
  addProjectVendor: (projectId: string, vendor: Partial<ProjectVendor>) => boolean
  updateProjectVendor: (projectId: string, vendorId: string, updates: Partial<ProjectVendor>) => boolean
  deleteProjectVendor: (projectId: string, vendorId: string) => boolean
  updateVendorBudgetUsage: (projectId: string, vendorId: string, amount: number) => boolean // New method
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}

interface ProjectProviderProps {
  children: React.ReactNode
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([])
  const { user, getAccessibleProjects } = useAuth()

  // Initialize projects from localStorage if available
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('ampere_projects')
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects)
        // Validate that the data structure is correct
        if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
          setProjects(parsedProjects)
        }
      }
    } catch (error) {
      console.error('Error loading projects from localStorage:', error)
      // Fall back to empty array if there's an error
      setProjects([])
    }
  }, [])

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_projects', JSON.stringify(projects))
    } catch (error) {
      console.error('Error saving projects to localStorage:', error)
    }
  }, [projects])

  // Get accessible projects based on user permissions
  const accessibleProjects = getAccessibleProjects(projects)
  const allProjects = projects // Full list for admin/super_admin

  const getProject = (id: string): Project | undefined => {
    const project = projects.find(project => project.id === id)
    
    // Check if user can access this specific project
    if (project && user) {
      const hasAccess = accessibleProjects.some(p => p.id === id)
      return hasAccess ? project : undefined
    }
    
    return project
  }

  const getProjectsByClient = (clientId: string): Project[] => {
    return accessibleProjects.filter(project => project.clientId === clientId)
  }

  const getProjectsByStatus = (status: string): Project[] => {
    return accessibleProjects.filter(project => project.status === status)
  }

  const canUserAccessProject = (projectId: string): boolean => {
    return accessibleProjects.some(project => project.id === projectId)
  }

  const addProject = (projectData: Partial<Project>): Project => {
    // Generate a unique ID
    const newId = (Math.max(...projects.map(p => parseInt(p.id) || 0)) + 1).toString()
    
    const newProject: Project = {
      id: newId,
      name: projectData.name || '',
      clientId: projectData.clientId || '',
      type: projectData.type || 'renovation',
      status: projectData.status || 'planning',
      description: projectData.description || '',
      location: projectData.location || {
        street: '',
        postalCode: '',
        district: ''
      },
      contractValue: projectData.contractValue || 0,
      estimatedCost: projectData.estimatedCost || 0,
      actualCost: projectData.actualCost || undefined,
      startDate: projectData.startDate || new Date(),
      expectedEndDate: projectData.expectedEndDate || new Date(),
      actualEndDate: projectData.actualEndDate || undefined,
      projectManager: projectData.projectManager || '',
      team: projectData.team || [], // Employee assignments
      permits: projectData.permits || [],
      milestones: projectData.milestones || [],
      vendors: (projectData.vendors || []).map(vendor => ({
        ...vendor,
        budgetAllocated: vendor.budgetAllocated !== undefined ? vendor.budgetAllocated : 0,
        budgetUsed: vendor.budgetUsed !== undefined ? vendor.budgetUsed : 0
      })), // Initialize budget fields for vendors
      documents: projectData.documents || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...projectData
    }

    setProjects(prevProjects => [...prevProjects, newProject])
    return newProject
  }

  const updateProject = (id: string, updates: Partial<Project>): boolean => {
    setProjects(prevProjects => {
      const index = prevProjects.findIndex(project => project.id === id)
      if (index === -1) return prevProjects

      // If updating vendors, ensure budget fields are initialized
      let updatedVendors = prevProjects[index].vendors;
      if (updates.vendors) {
        updatedVendors = updates.vendors.map(vendor => ({
          ...vendor,
          budgetAllocated: vendor.budgetAllocated !== undefined ? vendor.budgetAllocated : (vendor.budgetAllocated || 0),
          budgetUsed: vendor.budgetUsed !== undefined ? vendor.budgetUsed : (vendor.budgetUsed || 0)
        }));
      }

      const updatedProject = {
        ...prevProjects[index],
        ...updates,
        vendors: updatedVendors,
        updatedAt: new Date()
      }

      const newProjects = [...prevProjects]
      newProjects[index] = updatedProject
      return newProjects
    })
    return true
  }

  const deleteProject = (id: string): boolean => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id))
    return true
  }

  const refreshProjects = () => {
    // Refresh from localStorage or reset to mock data
    try {
      const storedProjects = localStorage.getItem('ampere_projects')
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects))
      } else {
        setProjects([])
      }
    } catch (error) {
      console.error('Error refreshing projects:', error)
      setProjects([])
    }
  }

  // Permit management methods
  const addPermit = (projectId: string, permitData: Partial<Permit>): boolean => {
    setProjects(prevProjects => {
      const index = prevProjects.findIndex(project => project.id === projectId)
      if (index === -1) return prevProjects

      const project = prevProjects[index]
      const newPermitId = (Math.max(0, ...project.permits.map(p => parseInt(p.id) || 0)) + 1).toString()
      
      const newPermit: Permit = {
        id: newPermitId,
        type: permitData.type || 'renovation_permit',
        applicationNumber: permitData.applicationNumber || '',
        status: permitData.status || 'draft',
        submittedDate: permitData.submittedDate || new Date(),
        approvedDate: permitData.approvedDate,
        expiryDate: permitData.expiryDate,
        authority: permitData.authority || 'bca',
        fee: permitData.fee || 0,
        documents: permitData.documents || [],
        notes: permitData.notes,
        ...permitData
      }

      const updatedProject = {
        ...project,
        permits: [...project.permits, newPermit],
        updatedAt: new Date()
      }

      const newProjects = [...prevProjects]
      newProjects[index] = updatedProject
      return newProjects
    })
    return true
  }

  const updatePermit = (projectId: string, permitId: string, updates: Partial<Permit>): boolean => {
    setProjects(prevProjects => {
      const projectIndex = prevProjects.findIndex(project => project.id === projectId)
      if (projectIndex === -1) return prevProjects

      const project = prevProjects[projectIndex]
      const permitIndex = project.permits.findIndex(permit => permit.id === permitId)
      if (permitIndex === -1) return prevProjects

      const updatedPermits = [...project.permits]
      updatedPermits[permitIndex] = { ...updatedPermits[permitIndex], ...updates }

      const updatedProject = {
        ...project,
        permits: updatedPermits,
        updatedAt: new Date()
      }

      const newProjects = [...prevProjects]
      newProjects[projectIndex] = updatedProject
      return newProjects
    })
    return true
  }

  const deletePermit = (projectId: string, permitId: string): boolean => {
    setProjects(prevProjects => {
      const projectIndex = prevProjects.findIndex(project => project.id === projectId)
      if (projectIndex === -1) return prevProjects

      const project = prevProjects[projectIndex]
      const updatedPermits = project.permits.filter(permit => permit.id !== permitId)

      const updatedProject = {
        ...project,
        permits: updatedPermits,
        updatedAt: new Date()
      }

      const newProjects = [...prevProjects]
      newProjects[projectIndex] = updatedProject
      return newProjects
    })
    return true
  }

  // Milestone management methods
  const addMilestone = (projectId: string, milestoneData: Partial<Milestone>): boolean => {
    setProjects(prevProjects => {
      const index = prevProjects.findIndex(project => project.id === projectId)
      if (index === -1) return prevProjects

      const project = prevProjects[index]
      const newMilestoneId = (Math.max(0, ...project.milestones.map(m => parseInt(m.id) || 0)) + 1).toString()
      
      const newMilestone: Milestone = {
        id: newMilestoneId,
        name: milestoneData.name || '',
        description: milestoneData.description || '',
        targetDate: milestoneData.targetDate || new Date(),
        actualDate: milestoneData.actualDate,
        status: milestoneData.status || 'pending',
        dependencies: milestoneData.dependencies || [],
        completionPercentage: milestoneData.completionPercentage || 0,
        ...milestoneData
      }

      const updatedProject = {
        ...project,
        milestones: [...project.milestones, newMilestone],
        updatedAt: new Date()
      }

      const newProjects = [...prevProjects]
      newProjects[index] = updatedProject
      return newProjects
    })
    return true
  }

  const updateMilestone = (projectId: string, milestoneId: string, updates: Partial<Milestone>): boolean => {
    setProjects(prevProjects => {
      const projectIndex = prevProjects.findIndex(project => project.id === projectId)
      if (projectIndex === -1) return prevProjects

      const project = prevProjects[projectIndex]
      const milestoneIndex = project.milestones.findIndex(milestone => milestone.id === milestoneId)
      if (milestoneIndex === -1) return prevProjects

      const updatedMilestones = [...project.milestones]
      updatedMilestones[milestoneIndex] = { ...updatedMilestones[milestoneIndex], ...updates }

      const updatedProject = {
        ...project,
        milestones: updatedMilestones,
        updatedAt: new Date()
      }

      const newProjects = [...prevProjects]
      newProjects[projectIndex] = updatedProject
      return newProjects
    })
    return true
  }

  const deleteMilestone = (projectId: string, milestoneId: string): boolean => {
    setProjects(prevProjects => {
      const projectIndex = prevProjects.findIndex(project => project.id === projectId)
      if (projectIndex === -1) return prevProjects

      const project = prevProjects[projectIndex]
      const updatedMilestones = project.milestones.filter(milestone => milestone.id !== milestoneId)
      
      // Also remove this milestone from any dependencies
      const cleanedMilestones = updatedMilestones.map(milestone => ({
        ...milestone,
        dependencies: milestone.dependencies.filter(depId => depId !== milestoneId)
      }))

      const updatedProject = {
        ...project,
        milestones: cleanedMilestones,
        updatedAt: new Date()
      }

      const newProjects = [...prevProjects]
      newProjects[projectIndex] = updatedProject
      return newProjects
    })
    return true
  }

  // Project vendor management methods
  const addProjectVendor = (projectId: string, vendorData: Partial<ProjectVendor>): boolean => {
    setProjects(prevProjects => {
      const index = prevProjects.findIndex(project => project.id === projectId)
      if (index === -1) return prevProjects

      const project = prevProjects[index]
      
      // Initialize budget fields if not provided
      const newVendor: ProjectVendor = {
        vendorId: vendorData.vendorId || '',
        role: vendorData.role || '',
        contractValue: vendorData.contractValue || 0,
        budgetAllocated: vendorData.budgetAllocated !== undefined ? vendorData.budgetAllocated : 0,
        budgetUsed: vendorData.budgetUsed !== undefined ? vendorData.budgetUsed : 0,
        startDate: vendorData.startDate || new Date(),
        endDate: vendorData.endDate,
        status: vendorData.status || 'assigned'
      }
      
      const updatedProject = {
        ...project,
        vendors: [...project.vendors, newVendor],
        updatedAt: new Date()
      }

      const newProjects = [...prevProjects]
      newProjects[index] = updatedProject
      return newProjects
    })
    return true
  }

  const updateProjectVendor = (projectId: string, vendorId: string, updates: Partial<ProjectVendor>): boolean => {
    setProjects(prevProjects => {
      const projectIndex = prevProjects.findIndex(project => project.id === projectId)
      if (projectIndex === -1) return prevProjects

      const project = prevProjects[projectIndex]
      const vendorIndex = project.vendors.findIndex(v => v.vendorId === vendorId)
      if (vendorIndex === -1) return prevProjects

      const updatedVendors = [...project.vendors]
      updatedVendors[vendorIndex] = {
        ...updatedVendors[vendorIndex],
        ...updates,
        // Ensure budget fields are not overwritten with undefined
        budgetAllocated: updates.budgetAllocated !== undefined ? updates.budgetAllocated : updatedVendors[vendorIndex].budgetAllocated,
        budgetUsed: updates.budgetUsed !== undefined ? updates.budgetUsed : updatedVendors[vendorIndex].budgetUsed
      }

      const updatedProject = {
        ...project,
        vendors: updatedVendors,
        updatedAt: new Date()
      }

      const newProjects = [...prevProjects]
      newProjects[projectIndex] = updatedProject
      return newProjects
    })
    return true
  }

  // Method to update vendor budget usage
  const updateVendorBudgetUsage = (projectId: string, vendorId: string, amount: number): boolean => {
    setProjects(prevProjects => {
      const projectIndex = prevProjects.findIndex(project => project.id === projectId)
      if (projectIndex === -1) return prevProjects

      const project = prevProjects[projectIndex]
      const vendorIndex = project.vendors.findIndex(v => v.vendorId === vendorId)
      if (vendorIndex === -1) return prevProjects

      const updatedVendors = [...project.vendors]
      const currentBudgetUsed = updatedVendors[vendorIndex].budgetUsed || 0
      updatedVendors[vendorIndex] = {
        ...updatedVendors[vendorIndex],
        budgetUsed: Math.max(0, currentBudgetUsed + amount) // Ensure budget used doesn't go negative
      }

      const updatedProject = {
        ...project,
        vendors: updatedVendors,
        updatedAt: new Date()
      }

      const newProjects = [...prevProjects]
      newProjects[projectIndex] = updatedProject
      return newProjects
    })
    return true
  }

  const deleteProjectVendor = (projectId: string, vendorId: string): boolean => {
    setProjects(prevProjects => {
      const projectIndex = prevProjects.findIndex(project => project.id === projectId)
      if (projectIndex === -1) return prevProjects

      const project = prevProjects[projectIndex]
      const updatedVendors = project.vendors.filter(vendor => vendor.vendorId !== vendorId)

      const updatedProject = {
        ...project,
        vendors: updatedVendors,
        updatedAt: new Date()
      }

      const newProjects = [...prevProjects]
      newProjects[projectIndex] = updatedProject
      return newProjects
    })
    return true
  }

  const value: ProjectContextType = {
    projects,
    accessibleProjects,
    allProjects,
    getProject,
    addProject,
    updateProject,
    deleteProject,
    refreshProjects,
    getProjectsByClient,
    getProjectsByStatus,
    canUserAccessProject,
    addPermit,
    updatePermit,
    deletePermit,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addProjectVendor,
    updateProjectVendor,
    deleteProjectVendor,
    updateVendorBudgetUsage
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}