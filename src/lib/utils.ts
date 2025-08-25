import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting for Singapore Dollars
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
  }).format(amount)
}

// Date formatting
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

// Calculate project progress percentage
export function calculateProjectProgress(startDate: Date, endDate: Date, currentDate: Date = new Date()): number {
  const totalDuration = endDate.getTime() - startDate.getTime()
  const elapsedDuration = currentDate.getTime() - startDate.getTime()
  const progress = Math.max(0, Math.min(100, (elapsedDuration / totalDuration) * 100))
  return Math.round(progress)
}

// Get project status color
export function getProjectStatusColor(status: string): string {
  const statusColors = {
    'planning': 'bg-gray-100 text-gray-800',
    'permit_application': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-blue-100 text-blue-800',
    'in_progress': 'bg-green-100 text-green-800',
    'completed': 'bg-emerald-100 text-emerald-800',
    'cancelled': 'bg-red-100 text-red-800',
    'on_hold': 'bg-orange-100 text-orange-800',
  }
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
}

// Get role display name
export function getRoleDisplayName(role: string): string {
  const roleNames = {
    'super_admin': 'Super Admin',
    'admin': 'Admin',
    'finance': 'Finance',
    'projects': 'Projects',
    'sales': 'Sales',
  }
  return roleNames[role as keyof typeof roleNames] || role
}

// Generate quotation number
export function generateQuotationNumber(): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `AMP-${year}${month}-${random}`
}