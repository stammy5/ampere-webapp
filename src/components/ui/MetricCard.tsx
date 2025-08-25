import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
    positive?: boolean
  }
  icon?: LucideIcon
  description?: string
  className?: string
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  description, 
  className 
}: MetricCardProps) {
  return (
    <div className={cn("metric-card", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-ampere-100 rounded-lg flex items-center justify-center">
              <Icon className="h-6 w-6 text-ampere-600" />
            </div>
          </div>
        )}
      </div>
      
      {change && (
        <div className="mt-4 flex items-center">
          <span
            className={cn(
              "text-sm font-medium",
              change.positive ? "text-green-600" : "text-red-600"
            )}
          >
            {change.positive ? "+" : ""}{change.value}%
          </span>
          <span className="text-sm text-gray-500 ml-2">{change.label}</span>
        </div>
      )}
    </div>
  )
}