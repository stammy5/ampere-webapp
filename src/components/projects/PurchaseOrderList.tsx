'use client'

import React, { useState } from 'react'
import { usePurchaseOrders } from '@/contexts/PurchaseOrderContext'
import { useVendors } from '@/contexts/VendorContext'
import { PurchaseOrder, PurchaseOrderStatus } from '@/types'
import { 
  Plus, 
  Edit, 
  Eye, 
  FileText, 
  Truck, 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PURCHASE_ORDER_STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  sent: 'bg-indigo-100 text-indigo-800',
  partially_received: 'bg-purple-100 text-purple-800',
  received: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800'
}

const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  sent: 'Sent',
  partially_received: 'Partially Received',
  received: 'Received',
  cancelled: 'Cancelled',
  closed: 'Closed'
}

interface PurchaseOrderListProps {
  projectId: string
  onAddPurchaseOrder: () => void
  onViewPurchaseOrder: (id: string) => void
  onEditPurchaseOrder: (id: string) => void
}

export default function PurchaseOrderList({ 
  projectId, 
  onAddPurchaseOrder,
  onViewPurchaseOrder,
  onEditPurchaseOrder
}: PurchaseOrderListProps) {
  const { getPurchaseOrdersByProject } = usePurchaseOrders()
  const { getVendor } = useVendors()
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | 'all'>('all')
  
  const purchaseOrders = getPurchaseOrdersByProject(projectId)
  
  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    return statusFilter === 'all' || po.status === statusFilter
  })
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Purchase Orders</h3>
        <button 
          onClick={onAddPurchaseOrder}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={cn(
            "px-3 py-1 text-sm rounded-full",
            statusFilter === 'all' 
              ? 'bg-ampere-100 text-ampere-800 border border-ampere-200' 
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          )}
        >
          All ({purchaseOrders.length})
        </button>
        {Object.entries(PURCHASE_ORDER_STATUS_LABELS).map(([status, label]) => {
          const count = purchaseOrders.filter(po => po.status === status).length
          if (count === 0) return null
          
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status as PurchaseOrderStatus)}
              className={cn(
                "px-3 py-1 text-sm rounded-full",
                statusFilter === status
                  ? 'bg-ampere-100 text-ampere-800 border border-ampere-200'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              )}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>
      
      {/* Purchase Orders List */}
      {filteredPurchaseOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredPurchaseOrders.map((purchaseOrder) => {
            const vendor = getVendor(purchaseOrder.vendorId)
            
            return (
              <div key={purchaseOrder.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{purchaseOrder.title}</h4>
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        PURCHASE_ORDER_STATUS_COLORS[purchaseOrder.status]
                      )}>
                        {PURCHASE_ORDER_STATUS_LABELS[purchaseOrder.status]}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {purchaseOrder.poNumber}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      {vendor && (
                        <div className="flex items-center space-x-1">
                          <Truck className="h-4 w-4" />
                          <span>{vendor.name}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Required: {new Date(purchaseOrder.requiredDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(purchaseOrder.totalAmount)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">{purchaseOrder.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewPurchaseOrder(purchaseOrder.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditPurchaseOrder(purchaseOrder.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchase Orders</h3>
          <p className="text-gray-600 mb-4">
            {purchaseOrders.length === 0 
              ? "Get started by creating a purchase order for this project." 
              : "No purchase orders match the current filter."}
          </p>
          <button
            onClick={onAddPurchaseOrder}
            className="btn-primary"
          >
            Create Purchase Order
          </button>
        </div>
      )}
    </div>
  )
}