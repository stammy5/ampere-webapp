// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  // Fine-grained permissions
  permissions: UserPermissions;
  assignedProjects: string[]; // Project IDs this user can access
  department?: string;
}

export type UserRole = 'super_admin' | 'admin' | 'finance' | 'projects' | 'sales';

// Fine-grained permission structure
export interface UserPermissions {
  // Finance permissions
  finance: {
    canViewFinance: boolean;
    canEditInvoices: boolean;
    canDeleteInvoices: boolean;
    canViewReports: boolean;
    canManagePayments: boolean;
  };
  // Project permissions
  projects: {
    canViewAllProjects: boolean;
    canEditAssignedProjects: boolean;
    canCreateProjects: boolean;
    canDeleteProjects: boolean;
    canManageTeam: boolean;
  };
  // Client permissions
  clients: {
    canViewClients: boolean;
    canEditClients: boolean;
    canCreateClients: boolean;
    canDeleteClients: boolean;
  };
  // System permissions
  system: {
    canManageUsers: boolean;
    canViewAuditLogs: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
  };
}

// Default permission sets for each role
export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  super_admin: {
    finance: {
      canViewFinance: true,
      canEditInvoices: true,
      canDeleteInvoices: true,
      canViewReports: true,
      canManagePayments: true,
    },
    projects: {
      canViewAllProjects: true,
      canEditAssignedProjects: true,
      canCreateProjects: true,
      canDeleteProjects: true,
      canManageTeam: true,
    },
    clients: {
      canViewClients: true,
      canEditClients: true,
      canCreateClients: true,
      canDeleteClients: true,
    },
    system: {
      canManageUsers: true,
      canViewAuditLogs: true,
      canManageSettings: true,
      canViewReports: true,
    },
  },
  admin: {
    finance: {
      canViewFinance: true,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canViewReports: true,
      canManagePayments: false,
    },
    projects: {
      canViewAllProjects: true,
      canEditAssignedProjects: true,
      canCreateProjects: true,
      canDeleteProjects: false,
      canManageTeam: true,
    },
    clients: {
      canViewClients: true,
      canEditClients: true,
      canCreateClients: true,
      canDeleteClients: false,
    },
    system: {
      canManageUsers: true,
      canViewAuditLogs: false,
      canManageSettings: true,
      canViewReports: true,
    },
  },
  finance: {
    finance: {
      canViewFinance: true,
      canEditInvoices: true,
      canDeleteInvoices: false,
      canViewReports: true,
      canManagePayments: true,
    },
    projects: {
      canViewAllProjects: false,
      canEditAssignedProjects: false,
      canCreateProjects: false,
      canDeleteProjects: false,
      canManageTeam: false,
    },
    clients: {
      canViewClients: true,
      canEditClients: false,
      canCreateClients: false,
      canDeleteClients: false,
    },
    system: {
      canManageUsers: false,
      canViewAuditLogs: false,
      canManageSettings: false,
      canViewReports: true,
    },
  },
  projects: {
    finance: {
      canViewFinance: false,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canViewReports: false,
      canManagePayments: false,
    },
    projects: {
      canViewAllProjects: false,
      canEditAssignedProjects: true,
      canCreateProjects: false,
      canDeleteProjects: false,
      canManageTeam: false,
    },
    clients: {
      canViewClients: true,
      canEditClients: false,
      canCreateClients: false,
      canDeleteClients: false,
    },
    system: {
      canManageUsers: false,
      canViewAuditLogs: false,
      canManageSettings: false,
      canViewReports: false,
    },
  },
  sales: {
    finance: {
      canViewFinance: false,
      canEditInvoices: false,
      canDeleteInvoices: false,
      canViewReports: false,
      canManagePayments: false,
    },
    projects: {
      canViewAllProjects: false,
      canEditAssignedProjects: false,
      canCreateProjects: false,
      canDeleteProjects: false,
      canManageTeam: false,
    },
    clients: {
      canViewClients: true,
      canEditClients: true,
      canCreateClients: true,
      canDeleteClients: false,
    },
    system: {
      canManageUsers: false,
      canViewAuditLogs: false,
      canManageSettings: false,
      canViewReports: false,
    },
  },
};

// Client Types
export interface Client {
  id: string;
  clientCode: string; // Auto-generated unique client code (e.g., AMP-C-001)
  name: string;
  type: ClientType;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  registrationNumber?: string;
  gstNumber?: string;
  creditLimit?: number;
  paymentTerms: number; // days
  status: ClientStatus;
  projects: string[]; // project IDs
  createdAt: Date;
  notes?: string;
}

export type ClientType = 'individual' | 'corporate' | 'government' | 'hdb' | 'private_developer';
export type ClientStatus = 'active' | 'inactive' | 'blacklisted';

// Address Type (Singapore specific)
export interface Address {
  street: string;
  building?: string;
  unit?: string;
  postalCode: string;
  district: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  clientId: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string;
  location: Address;
  contractValue: number;
  estimatedCost: number;
  actualCost?: number;
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  projectManager: string; // user ID
  team: string[]; // user IDs
  permits: Permit[];
  milestones: Milestone[];
  vendors: ProjectVendor[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectType = 'renovation' | 'addition_alteration' | 'reinstatement' | 'new_construction' | 'maintenance';
export type ProjectStatus = 'planning' | 'permit_application' | 'approved' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

// Singapore Construction Permits
export interface Permit {
  id: string;
  type: PermitType;
  applicationNumber: string;
  status: PermitStatus;
  submittedDate: Date;
  approvedDate?: Date;
  expiryDate?: Date;
  authority: PermitAuthority;
  fee: number;
  documents: string[];
  notes?: string;
}

export type PermitType = 'building_plan' | 'structural_plan' | 'demolition_permit' | 'hacking_permit' | 'renovation_permit' | 'aanda_permit';
export type PermitStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'expired';
export type PermitAuthority = 'bca' | 'ura' | 'hdb' | 'scdf' | 'nea' | 'pub';

// Milestone Types
export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  status: MilestoneStatus;
  dependencies: string[]; // milestone IDs
  completionPercentage: number;
}

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';

// Vendor Types
export interface Vendor {
  id: string;
  vendorCode: string; // Auto-generated unique vendor code (e.g., AMP-V-001)
  name: string;
  category: VendorCategory;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  registrationNumber: string;
  gstNumber?: string;
  rating: number; // 1-5
  certifications: string[];
  specializations: string[];
  paymentTerms: number; // days
  status: VendorStatus;
  projects: string[]; // project IDs
  createdAt: Date;
}

export type VendorCategory = 'subcontractor' | 'supplier' | 'consultant' | 'specialist';
export type VendorStatus = 'active' | 'inactive' | 'blacklisted' | 'pending_approval';

export interface ProjectVendor {
  vendorId: string;
  role: string;
  contractValue: number;
  budgetAllocated: number; // New field for budget tracking
  budgetUsed: number; // New field for tracking used budget
  startDate: Date;
  endDate?: Date;
  status: ProjectVendorStatus;
}

export type ProjectVendorStatus = 'assigned' | 'active' | 'completed' | 'terminated';

// Tender Types
export interface Tender {
  id: string;
  title: string;
  clientId: string;
  type: TenderType;
  status: TenderStatus;
  description: string;
  location: Address;
  estimatedValue: number;
  submissionDeadline: Date;
  startDate?: Date;
  completionDate?: Date;
  requirements: string[];
  documents: Document[];
  ourQuotation?: string; // quotation ID
  competitorCount?: number;
  winProbability: number; // percentage
  assignedTo: string; // user ID
  createdAt: Date;
  updatedAt: Date;
}

export type TenderType = 'open' | 'selective' | 'nominated' | 'negotiated';
export type TenderStatus = 'opportunity' | 'preparing' | 'submitted' | 'under_evaluation' | 'won' | 'lost' | 'cancelled';

// Quotation Types
export interface Quotation {
  id: string;
  clientId: string;
  projectId?: string;
  tenderId?: string;
  quotationNumber: string;
  title: string;
  description: string;
  status: QuotationStatus;
  validUntil: Date;
  items: QuotationItem[];
  subtotal: number;
  gst: number;
  discount?: number;
  totalAmount: number;
  terms: string[];
  preparedBy: string; // user ID
  approvedBy?: string; // user ID
  sentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export type QuotationStatus = 'draft' | 'pending_approval' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string;
  notes?: string;
}

// Frequently Used Quotation Items
export interface FrequentlyUsedItem {
  id: string;
  description: string;
  unit: string;
  unitPrice: number;
  category: string;
  isActive: boolean;
  isDefault: boolean; // Cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

// Finance Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  quotationId?: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: string;
  createdAt: Date;
}

export type InvoiceStatus = 'draft' | 'sent' | 'overdue' | 'paid' | 'cancelled';

// Vendor Invoice Types
export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  projectId?: string;
  purchaseOrderId?: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  status: VendorInvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: string;
  createdAt: Date;
  // For file upload and processing
  fileName?: string;
  fileUrl?: string;
  processedData?: any; // OCR extracted data
}

export type VendorInvoiceStatus = 'draft' | 'received' | 'processing' | 'processed' | 'approved' | 'paid' | 'overdue' | 'cancelled';

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  receivedDate: Date;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'cheque' | 'bank_transfer' | 'credit_card' | 'paynow';

// Purchase Order Types
export interface PurchaseOrder {
  id: string;
  poNumber: string; // Auto-generated unique PO number (e.g., AMP-PO-202401-001)
  projectId: string;
  vendorId: string;
  clientId?: string;
  title: string;
  description: string;
  status: PurchaseOrderStatus;
  issueDate: Date;
  requiredDate: Date;
  deliveryDate?: Date;
  items: PurchaseOrderItem[];
  subtotal: number;
  gst: number;
  discount?: number;
  totalAmount: number;
  terms: string[];
  preparedBy: string; // user ID
  approvedBy?: string; // user ID
  approvedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export type PurchaseOrderStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'partially_received' | 'received' | 'cancelled' | 'closed';

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string;
  notes?: string;
  receivedQuantity?: number;
}

// Report Types
export interface Report {
  id: string;
  title: string;
  type: ReportType;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  generatedBy: string; // user ID
  generatedAt: Date;
  parameters: ReportParameters;
  data: any; // Report-specific data structure
  downloadUrl?: string;
  scheduledGeneration?: ReportSchedule;
}

export type ReportType = 'financial_summary' | 'project_analytics' | 'client_performance' | 'vendor_analysis' | 'tender_success' | 'cash_flow' | 'profitability' | 'aging_report' | 'performance_metrics';
export type ReportCategory = 'financial' | 'operational' | 'analytics' | 'compliance';
export type ReportStatus = 'generating' | 'completed' | 'failed' | 'scheduled';

export interface ReportParameters {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  filters: {
    clientIds?: string[];
    projectIds?: string[];
    vendorIds?: string[];
    projectTypes?: ProjectType[];
    projectStatuses?: ProjectStatus[];
    invoiceStatuses?: InvoiceStatus[];
  };
  groupBy?: 'month' | 'quarter' | 'year' | 'client' | 'project' | 'vendor';
  includeGST?: boolean;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  recipients: string[]; // email addresses
  isActive: boolean;
}

// Financial Report Data Structures
export interface FinancialSummaryData {
  period: {
    startDate: Date;
    endDate: Date;
  };
  revenue: {
    total: number;
    byMonth: { month: string; amount: number; }[];
    byClient: { clientId: string; clientName: string; amount: number; }[];
    byProject: { projectId: string; projectName: string; amount: number; }[];
  };
  expenses: {
    total: number;
    byCategory: { category: string; amount: number; }[];
    byVendor: { vendorId: string; vendorName: string; amount: number; }[];
  };
  profitability: {
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    byProject: { projectId: string; projectName: string; profit: number; margin: number; }[];
  };
  cashFlow: {
    inflow: number;
    outflow: number;
    netCashFlow: number;
    outstanding: number;
    overdue: number;
  };
  gst: {
    totalGSTCollected: number;
    totalGSTPaid: number;
    netGST: number;
  };
}

export interface ProjectAnalyticsData {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    delayedProjects: number;
    averageProjectValue: number;
    totalContractValue: number;
  };
  performance: {
    onTimeCompletionRate: number;
    averageProjectDuration: number;
    budgetVariance: {
      averageVariance: number;
      projectsOverBudget: number;
      projectsUnderBudget: number;
    };
  };
  byType: {
    type: ProjectType;
    count: number;
    totalValue: number;
    averageDuration: number;
    completionRate: number;
  }[];
  byStatus: {
    status: ProjectStatus;
    count: number;
    totalValue: number;
  }[];
  timeline: {
    month: string;
    started: number;
    completed: number;
    value: number;
  }[];
}

export interface ClientPerformanceData {
  overview: {
    totalClients: number;
    activeClients: number;
    newClients: number;
    averageProjectValue: number;
    repeatClientRate: number;
  };
  byClient: {
    clientId: string;
    clientName: string;
    projectCount: number;
    totalValue: number;
    averagePaymentDays: number;
    lastProjectDate: Date;
    status: ClientStatus;
    profitability: number;
  }[];
  paymentAnalysis: {
    averagePaymentDays: number;
    onTimePaymentRate: number;
    overdueAmount: number;
    clientsWithOverdue: number;
  };
  growth: {
    month: string;
    newClients: number;
    revenue: number;
    repeatBusinessRate: number;
  }[];
}

export interface VendorAnalysisData {
  overview: {
    totalVendors: number;
    activeVendors: number;
    totalSpent: number;
    averageRating: number;
  };
  byVendor: {
    vendorId: string;
    vendorName: string;
    category: VendorCategory;
    projectCount: number;
    totalValue: number;
    averageRating: number;
    onTimeDeliveryRate: number;
    lastEngagementDate: Date;
  }[];
  byCategory: {
    category: VendorCategory;
    vendorCount: number;
    totalSpent: number;
    averageRating: number;
  }[];
  performance: {
    month: string;
    totalSpent: number;
    vendorCount: number;
    averageRating: number;
  }[];
}

export interface TenderSuccessData {
  overview: {
    totalTenders: number;
    submittedTenders: number;
    wonTenders: number;
    winRate: number;
    totalValue: number;
    averageTenderValue: number;
  };
  byType: {
    type: TenderType;
    submitted: number;
    won: number;
    winRate: number;
    totalValue: number;
  }[];
  byStatus: {
    status: TenderStatus;
    count: number;
    totalValue: number;
  }[];
  timeline: {
    month: string;
    submitted: number;
    won: number;
    winRate: number;
    value: number;
  }[];
  competitorAnalysis: {
    averageCompetitors: number;
    winRateByCompetitorCount: {
      competitorCount: number;
      winRate: number;
      tenderCount: number;
    }[];
  };
}

// Document Types
export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  uploadedBy: string; // user ID
  uploadedAt: Date;
  url: string;
  projectId?: string;
  clientId?: string;
  tenderId?: string;
  isConfidential: boolean;
}

export type DocumentType = 'contract' | 'drawing' | 'permit' | 'certificate' | 'invoice' | 'photo' | 'report' | 'other';

// Dashboard Metrics Types
export interface DashboardMetrics {
  projects: {
    total: number;
    active: number;
    completed: number;
    delayed: number;
  };
  finance: {
    totalRevenue: number;
    outstandingInvoices: number;
    profitMargin: number;
    cashFlow: number;
  };
  tenders: {
    active: number;
    submitted: number;
    winRate: number;
    averageValue: number;
  };
  clients: {
    total: number;
    active: number;
    new: number;
  };
}

// Singapore specific enums and constants
export const SINGAPORE_DISTRICTS = [
  'Central', 'Clementi', 'Jurong East', 'Jurong West', 'Tampines', 'Bedok',
  'Hougang', 'Ang Mo Kio', 'Bishan', 'Bukit Merah', 'Bukit Timah', 'Geylang',
  'Kallang/Whampoa', 'Marine Parade', 'Novena', 'Pasir Ris', 'Punggol',
  'Queenstown', 'Sembawang', 'Sengkang', 'Serangoon', 'Toa Payoh', 'Woodlands',
  'Yishun', 'Downtown Core', 'Marina East', 'Marina South', 'Museum', 'Newton',
  'Orchard', 'Outram', 'River Valley', 'Rochor', 'Singapore River', 'Straits View'
] as const;

export const PROJECT_CATEGORIES_SG = [
  'HDB Renovation', 'Private Condo A&A', 'Landed Property Renovation',
  'Commercial Fitout', 'Office Renovation', 'Retail Renovation',
  'Restaurant Fitout', 'Medical Clinic Fitout', 'Reinstatement Works',
  'Hotel Renovation', 'School Upgrade', 'Factory Renovation'
] as const;

// Audit Log Types
export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: UserRole;
  userName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  changes?: AuditChange[];
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'VIEW' 
  | 'EXPORT' 
  | 'IMPORT' 
  | 'APPROVE' 
  | 'REJECT' 
  | 'SEND' 
  | 'CANCEL' 
  | 'RESTORE' 
  | 'ACTIVATE' 
  | 'DEACTIVATE';

export type AuditEntityType = 
  | 'USER' 
  | 'CLIENT' 
  | 'PROJECT' 
  | 'TENDER' 
  | 'QUOTATION' 
  | 'INVOICE' 
  | 'PAYMENT' 
  | 'VENDOR' 
  | 'REPORT' 
  | 'SETTINGS' 
  | 'CLIENT_TYPE' 
  | 'SYSTEM';

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  fieldLabel?: string;
}

export interface AuditLogFilter {
  userId?: string;
  userRole?: UserRole;
  action?: AuditAction;
  entityType?: AuditEntityType;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface AuditLogSummary {
  totalLogs: number;
  todayLogs: number;
  weekLogs: number;
  monthLogs: number;
  byAction: Record<AuditAction, number>;
  byEntityType: Record<AuditEntityType, number>;
  byUser: { userId: string; userName: string; count: number; }[];
  recentActivity: AuditLog[];
}

// Settings Types
export interface SystemSettings {
  id: string;
  companyInfo: CompanyInfo;
  clientTypes: ClientTypeConfig[];
  vendorSpecializations: VendorSpecializationConfig[];
  frequentlyUsedItems: FrequentlyUsedItem[];
  systemPreferences: SystemPreferences;
  emailSettings: EmailSettings;
  notificationSettings: NotificationSettings;
  securitySettings: SecuritySettings;
  xeroSettings?: XeroSettings; // Add Xero integration settings
  updatedAt: Date;
  updatedBy: string; // user ID
}

// Xero Integration Settings
export interface XeroSettings {
  isEnabled: boolean;
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  accessToken?: string;
  refreshToken?: string;
  lastSync?: Date;
  autoSyncEnabled: boolean;
  syncFrequency: 'daily' | 'weekly' | 'monthly';
  syncTime?: string; // HH:MM format
  syncEntities: {
    invoices: boolean;
    vendorInvoices: boolean;
    payments: boolean;
    contacts: boolean;
  };
}

export interface CompanyInfo {
  name: string;
  registrationNumber: string;
  gstNumber: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
}

export interface ClientTypeConfig {
  id: string;
  value: string;
  label: string;
  description: string;
  isActive: boolean;
  isDefault: boolean; // Cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorSpecializationConfig {
  id: string;
  value: string;
  label: string;
  description: string;
  isActive: boolean;
  isDefault: boolean; // Cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemPreferences {
  defaultCurrency: string;
  defaultGSTRate: number;
  defaultPaymentTerms: number;
  dateFormat: string;
  timeZone: string;
  fiscalYearStart: string; // MM-DD format
  autoBackup: boolean;
  maintenanceMode: boolean;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  isEnabled: boolean;
}

export interface NotificationSettings {
  emailNotifications: {
    newProjects: boolean;
    projectUpdates: boolean;
    invoiceGenerated: boolean;
    paymentReceived: boolean;
    quotationSent: boolean;
    tenderDeadlines: boolean;
  };
  systemAlerts: {
    lowInventory: boolean;
    projectDelays: boolean;
    overdueInvoices: boolean;
    permitExpiry: boolean;
  };
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
  };
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  twoFactorAuth: boolean;
}