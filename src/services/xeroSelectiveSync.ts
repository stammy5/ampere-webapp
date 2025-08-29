// Xero Selective Sync Service

// Entity dependencies
const ENTITY_DEPENDENCIES: Record<string, string[]> = {
  'invoice': ['contact'],
  'vendorInvoice': ['contact'],
  'payment': ['invoice', 'vendorInvoice'],
  'purchaseOrder': ['contact']
}

// Selective sync service
class XeroSelectiveSync {
  // Get entities in dependency order
  getEntitiesInDependencyOrder(entityTypes: string[]): string[] {
    const orderedEntities: string[] = []
    const visited = new Set<string>()
    const requestedSet = new Set(entityTypes)
    
    const visit = (entityType: string) => {
      if (visited.has(entityType)) {
        return
      }
      
      visited.add(entityType)
      
      // Visit dependencies first
      const dependencies = ENTITY_DEPENDENCIES[entityType] || []
      dependencies.forEach(dep => visit(dep))
      
      // Add this entity to the ordered list
      orderedEntities.push(entityType)
    }
    
    // Visit all requested entities
    entityTypes.forEach(entityType => visit(entityType))
    
    // Filter to only include requested entities and their required dependencies
    const result: string[] = []
    const added = new Set<string>()
    
    for (const entity of orderedEntities) {
      // Add if it's explicitly requested
      if (requestedSet.has(entity)) {
        if (!added.has(entity)) {
          result.push(entity)
          added.add(entity)
        }
      } 
      // Or if it's a dependency of a requested entity
      else {
        for (const requestedType of entityTypes) {
          const deps = ENTITY_DEPENDENCIES[requestedType] || []
          if (deps.includes(entity) && !added.has(entity)) {
            result.push(entity)
            added.add(entity)
            break
          }
        }
      }
    }
    
    return result
  }

  // Get dependent entities that should also be synced
  getDependentEntities(entityTypes: string[]): string[] {
    const dependentEntities = new Set<string>()
    
    entityTypes.forEach(entityType => {
      // Find entities that depend on this entity type
      Object.entries(ENTITY_DEPENDENCIES).forEach(([dependentType, dependencies]) => {
        if (dependencies.includes(entityType)) {
          dependentEntities.add(dependentType)
        }
      })
    })
    
    return Array.from(dependentEntities)
  }

  // Validate sync selection
  validateSyncSelection(entityTypes: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check for circular dependencies
    const hasCircularDependency = this.hasCircularDependencies(entityTypes)
    if (hasCircularDependency) {
      errors.push('Circular dependencies detected in entity selection')
    }
    
    // Check for missing dependencies
    const missingDependencies = this.getMissingDependencies(entityTypes)
    if (missingDependencies.length > 0) {
      errors.push(`Missing dependencies: ${missingDependencies.join(', ')}`)
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Check for circular dependencies
  private hasCircularDependencies(entityTypes: string[]): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    
    const hasCycle = (entityType: string): boolean => {
      if (recursionStack.has(entityType)) {
        return true
      }
      
      if (visited.has(entityType)) {
        return false
      }
      
      visited.add(entityType)
      recursionStack.add(entityType)
      
      const dependencies = ENTITY_DEPENDENCIES[entityType] || []
      for (const dep of dependencies) {
        if (hasCycle(dep)) {
          return true
        }
      }
      
      recursionStack.delete(entityType)
      return false
    }
    
    return entityTypes.some(entityType => hasCycle(entityType))
  }

  // Get missing dependencies
  private getMissingDependencies(entityTypes: string[]): string[] {
    const missingDependencies: string[] = []
    const selectedSet = new Set(entityTypes)
    
    entityTypes.forEach(entityType => {
      const dependencies = ENTITY_DEPENDENCIES[entityType] || []
      dependencies.forEach(dep => {
        if (!selectedSet.has(dep)) {
          missingDependencies.push(dep)
        }
      })
    })
    
    return Array.from(new Set(missingDependencies)) // Remove duplicates
  }

  // Get recommended sync selection based on user needs
  getRecommendedSyncSelection(userNeeds: {
    trackInvoices?: boolean
    trackPayments?: boolean
    trackVendors?: boolean
    trackPurchaseOrders?: boolean
  }): string[] {
    const recommended: string[] = []
    
    if (userNeeds.trackInvoices) {
      recommended.push('contact', 'invoice')
    }
    
    if (userNeeds.trackPayments) {
      recommended.push('contact', 'invoice', 'payment')
    }
    
    if (userNeeds.trackVendors) {
      recommended.push('contact')
    }
    
    if (userNeeds.trackPurchaseOrders) {
      recommended.push('contact', 'purchaseOrder')
    }
    
    // Remove duplicates and order by dependencies
    const uniqueRecommended = Array.from(new Set(recommended))
    return this.getEntitiesInDependencyOrder(uniqueRecommended)
  }

  // Get sync statistics
  getSyncStats(entityTypes: string[]) {
    const withDependencies = this.getEntitiesInDependencyOrder(entityTypes)
    const dependents = this.getDependentEntities(entityTypes)
    
    return {
      selectedEntities: entityTypes,
      withDependencies,
      dependents,
      totalEntitiesToSync: withDependencies.length,
      hasMissingDependencies: this.getMissingDependencies(entityTypes).length > 0
    }
  }
}

// Export singleton instance
export const xeroSelectiveSync = new XeroSelectiveSync()