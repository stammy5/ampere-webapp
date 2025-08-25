'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Client } from '@/types'
import { mockClients } from '@/lib/mock-data'
import { generateNextClientCode } from '@/lib/client-code-generator'
import { useAuth } from '@/contexts/AuthContext'
import { useAuditLog, createAuditLog } from '@/contexts/AuditLogContext'

interface ClientContextType {
  clients: Client[]
  getClient: (id: string) => Client | undefined
  addClient: (client: Partial<Client>) => Client
  updateClient: (id: string, updates: Partial<Client>) => boolean
  deleteClient: (id: string) => boolean
  refreshClients: () => void
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export const useClients = () => {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider')
  }
  return context
}

interface ClientProviderProps {
  children: React.ReactNode
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const { user: currentUser } = useAuth()
  const auditLog = useAuditLog()

  // Initialize clients from localStorage if available
  useEffect(() => {
    try {
      const storedClients = localStorage.getItem('ampere_clients')
      if (storedClients) {
        const parsedClients = JSON.parse(storedClients)
        // Validate that the data structure is correct
        if (Array.isArray(parsedClients) && parsedClients.length > 0) {
          // Migrate existing clients to include clientCode if missing
          const migratedClients = migrateClientsWithCodes(parsedClients)
          setClients(migratedClients)
        }
      } else {
        // Ensure mock clients have codes
        const migratedMockClients = migrateClientsWithCodes(mockClients)
        setClients(migratedMockClients)
      }
    } catch (error) {
      console.error('Error loading clients from localStorage:', error)
      // Fall back to mock data if there's an error
      const migratedMockClients = migrateClientsWithCodes(mockClients)
      setClients(migratedMockClients)
    }
  }, [])

  // Migration function to ensure all clients have client codes
  const migrateClientsWithCodes = (clientsToMigrate: Client[]): Client[] => {
    const migratedClients: Client[] = []
    let codeCounter = 1
    
    clientsToMigrate.forEach(client => {
      if (!client.clientCode) {
        // Generate a client code for clients that don't have one
        const paddedNumber = codeCounter.toString().padStart(3, '0')
        const newClientCode = `AMP-C-${paddedNumber}`
        
        migratedClients.push({
          ...client,
          clientCode: newClientCode
        })
        codeCounter++
      } else {
        migratedClients.push(client)
        // Update counter based on existing code if valid
        const existingNumber = extractClientCodeNumber(client.clientCode)
        if (existingNumber >= codeCounter) {
          codeCounter = existingNumber + 1
        }
      }
    })
    
    return migratedClients
  }

  // Helper function to extract number from client code
  const extractClientCodeNumber = (clientCode: string): number => {
    const match = clientCode.match(/AMP-C-(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  // Save clients to localStorage whenever clients change
  useEffect(() => {
    try {
      localStorage.setItem('ampere_clients', JSON.stringify(clients))
    } catch (error) {
      console.error('Error saving clients to localStorage:', error)
    }
  }, [clients])

  const getClient = (id: string): Client | undefined => {
    return clients.find(client => client.id === id)
  }

  const addClient = (clientData: Partial<Client>): Client => {
    // Generate a unique ID
    const newId = (Math.max(...clients.map(c => parseInt(c.id) || 0)) + 1).toString()
    
    // Generate auto-running client code
    const clientCode = generateNextClientCode(clients)
    
    const newClient: Client = {
      id: newId,
      clientCode,
      name: clientData.name || '',
      type: clientData.type || 'corporate',
      contactPerson: clientData.contactPerson || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      address: clientData.address || {
        street: '',
        postalCode: '',
        district: ''
      },
      paymentTerms: clientData.paymentTerms || 30,
      status: clientData.status || 'active',
      projects: [],
      createdAt: new Date(),
      ...clientData
    }

    setClients(prevClients => [...prevClients, newClient])
    
    // Log client creation
    if (currentUser) {
      auditLog.addAuditLog(createAuditLog(
        'CREATE',
        'CLIENT',
        newClient.id,
        currentUser,
        {
          entityName: newClient.name,
          details: `Created new client (${newClient.clientCode}) of type: ${newClient.type}`
        }
      ))
    }
    
    return newClient
  }

  const updateClient = (id: string, updates: Partial<Client>): boolean => {
    const oldClient = getClient(id)
    if (!oldClient) return false
    
    setClients(prevClients => {
      const index = prevClients.findIndex(client => client.id === id)
      if (index === -1) return prevClients

      const updatedClient = {
        ...prevClients[index],
        ...updates
      }

      const newClients = [...prevClients]
      newClients[index] = updatedClient
      return newClients
    })
    
    // Log client update
    if (currentUser && oldClient) {
      const updatedClient = { ...oldClient, ...updates }
      auditLog.addAuditLog(createAuditLog(
        'UPDATE',
        'CLIENT',
        id,
        currentUser,
        {
          entityName: oldClient.name,
          oldData: oldClient,
          newData: updatedClient,
          details: `Updated client information for ${oldClient.clientCode}`,
          excludeFields: ['projects', 'createdAt']
        }
      ))
    }
    
    return true
  }

  const deleteClient = (id: string): boolean => {
    const client = getClient(id)
    if (!client) return false
    
    setClients(prevClients => prevClients.filter(client => client.id !== id))
    
    // Log client deletion
    if (currentUser) {
      auditLog.addAuditLog(createAuditLog(
        'DELETE',
        'CLIENT',
        id,
        currentUser,
        {
          entityName: client.name,
          details: `Deleted client ${client.clientCode} (${client.name})`
        }
      ))
    }
    
    return true
  }

  const refreshClients = () => {
    // Refresh from localStorage or reset to mock data
    try {
      const storedClients = localStorage.getItem('ampere_clients')
      if (storedClients) {
        setClients(JSON.parse(storedClients))
      } else {
        setClients(mockClients)
      }
    } catch (error) {
      console.error('Error refreshing clients:', error)
      setClients(mockClients)
    }
  }

  const value: ClientContextType = {
    clients,
    getClient,
    addClient,
    updateClient,
    deleteClient,
    refreshClients
  }

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  )
}