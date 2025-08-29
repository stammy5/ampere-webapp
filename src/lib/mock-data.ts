import { User, UserRole, DEFAULT_PERMISSIONS, Client, Project, Quotation, Invoice, Payment, Tender, Vendor, AuditLog } from '@/types';

// Mock Users Data
export const mockUsers: User[] = [
  {
    id: "u001",
    name: "Admin User",
    email: "admin@ampere-eng.com",
    role: "super_admin" as UserRole,
    avatar: "/avatars/admin.png",
    isActive: true,
    createdAt: new Date(2023, 0, 15),
    lastLogin: new Date(),
    permissions: DEFAULT_PERMISSIONS.super_admin,
    assignedProjects: ["p001", "p002", "p003", "p004", "p005"]
  },
  {
    id: "u002",
    name: "Finance Manager",
    email: "finance@ampere-eng.com",
    role: "finance" as UserRole,
    avatar: "/avatars/finance.png",
    isActive: true,
    createdAt: new Date(2023, 1, 20),
    lastLogin: new Date(2023, 6, 15),
    permissions: DEFAULT_PERMISSIONS.finance,
    assignedProjects: ["p001", "p002"]
  },
  {
    id: "u003",
    name: "Project Manager",
    email: "projects@ampere-eng.com",
    role: "projects" as UserRole,
    avatar: "/avatars/projects.png",
    isActive: true,
    createdAt: new Date(2023, 2, 10),
    lastLogin: new Date(2023, 7, 1),
    permissions: DEFAULT_PERMISSIONS.projects,
    assignedProjects: ["p003", "p004"]
  },
  {
    id: "u004",
    name: "Sales Representative",
    email: "sales@ampere-eng.com",
    role: "sales" as UserRole,
    avatar: "/avatars/sales.png",
    isActive: true,
    createdAt: new Date(2023, 3, 5),
    lastLogin: new Date(2023, 7, 10),
    permissions: DEFAULT_PERMISSIONS.sales,
    assignedProjects: []
  },
  {
    id: "u005",
    name: "Inactive User",
    email: "inactive@ampere-eng.com",
    role: "admin" as UserRole,
    avatar: "/avatars/inactive.png",
    isActive: false,
    createdAt: new Date(2023, 4, 1),
    lastLogin: new Date(2023, 5, 15),
    permissions: DEFAULT_PERMISSIONS.admin,
    assignedProjects: []
  }
];

// Sample login credentials for testing
// Username/Email: admin@ampere-eng.com, Password: admin123
// Username/Email: finance@ampere-eng.com, Password: finance123
// Username/Email: projects@ampere-eng.com, Password: projects123
// Username/Email: sales@ampere-eng.com, Password: sales123

// Mock Vendors Data
export const mockVendors: Vendor[] = [
  {
    id: "v001",
    vendorCode: "AMP-V-001",
    name: "ABC Construction Supplies",
    category: "supplier",
    contactPerson: "John Lim",
    email: "john@abcconst.com",
    phone: "+65 6123 4567",
    address: {
      street: "123 Jurong West Ave 6",
      postalCode: "640123",
      district: "Jurong West"
    },
    registrationNumber: "201234567G",
    gstNumber: "M2-1234567-0",
    rating: 4.5,
    certifications: ["ISO 9001"],
    specializations: ["Building Materials", "Plumbing"],
    paymentTerms: 30,
    status: "active",
    projects: ["p001", "p002"],
    createdAt: new Date(2023, 0, 10)
  },
  {
    id: "v002",
    vendorCode: "AMP-V-002",
    name: "XYZ Electrical Services",
    category: "subcontractor",
    contactPerson: "Sarah Tan",
    email: "sarah@xyzelectric.com",
    phone: "+65 9876 5432",
    address: {
      street: "456 Ang Mo Kio Ave 8",
      postalCode: "560456",
      district: "Ang Mo Kio"
    },
    registrationNumber: "201876543H",
    gstNumber: "M2-7654321-0",
    rating: 4.8,
    certifications: ["BCA Licensed", "Safety Certification"],
    specializations: ["Electrical", "Lighting"],
    paymentTerms: 45,
    status: "active",
    projects: ["p001"],
    createdAt: new Date(2023, 1, 5)
  },
  {
    id: "v003",
    vendorCode: "AMP-V-003",
    name: "Best Carpentry Pte Ltd",
    category: "subcontractor",
    contactPerson: "Kumar Patel",
    email: "kumar@bestcarpentry.com",
    phone: "+65 8765 4321",
    address: {
      street: "789 Woodlands Ave 1",
      postalCode: "730789",
      district: "Woodlands"
    },
    registrationNumber: "201765432J",
    gstNumber: "M2-9876543-0",
    rating: 4.2,
    certifications: [],
    specializations: ["Carpentry", "Custom Cabinetry"],
    paymentTerms: 30,
    status: "active",
    projects: ["p002"],
    createdAt: new Date(2023, 2, 15)
  }
];

// Mock Projects Data (can be expanded as needed)
export const mockProjects: Project[] = [
  {
    id: "p001",
    projectCode: "AMP-P-001",
    title: "Office Renovation - CBD",
    description: "Complete office renovation for a financial services company in the CBD area.",
    clientId: "c001",
    status: "in_progress",
    budget: 75000,
    startDate: new Date(2023, 5, 15),
    endDate: new Date(2023, 9, 30),
    createdAt: new Date(2023, 4, 10),
    lastUpdated: new Date(2023, 7, 15),
    team: ["u001", "u002", "u003"],
    location: "10 Raffles Place, Singapore 048616",
    type: "renovation",
    priority: "high"
  },
  {
    id: "p002",
    projectCode: "AMP-P-002",
    title: "HDB Renovation - Tampines",
    description: "Full HDB flat renovation in Tampines.",
    clientId: "c002",
    status: "permit_application",
    budget: 45000,
    startDate: new Date(2023, 7, 1),
    endDate: new Date(2023, 10, 15),
    createdAt: new Date(2023, 6, 5),
    lastUpdated: new Date(2023, 7, 10),
    team: ["u002", "u003"],
    location: "Block 123 Tampines Street 12, Singapore 520123",
    type: "renovation",
    priority: "medium"
  }
];

// Mock function to generate users
export function generateMockUsers(count: number = 5): User[] {
  return mockUsers.slice(0, Math.min(count, mockUsers.length));
}

// You can add more mock data functions as needed

// Mock Clients Data
export const mockClients: Client[] = [
  {
    id: "c001",
    clientCode: "AMP-C-001",
    name: "ABC Corporate Services",
    type: "corporate",
    contactPerson: "Alex Wong",
    email: "alex@abccorp.com",
    phone: "+65 6345 7890",
    address: {
      street: "123 Shenton Way #10-01",
      postalCode: "068803",
      district: "Central Business District"
    },
    paymentTerms: 30,
    status: "active",
    projects: ["p001"],
    createdAt: new Date(2023, 0, 5)
  },
  {
    id: "c002",
    clientCode: "AMP-C-002",
    name: "Residential Owner - Lee Family",
    type: "individual",
    contactPerson: "Michael Lee",
    email: "michael@example.com",
    phone: "+65 9123 4567",
    address: {
      street: "Block 123 Tampines Street 12 #05-123",
      postalCode: "520123",
      district: "Tampines"
    },
    paymentTerms: 14,
    status: "active",
    projects: ["p002"],
    createdAt: new Date(2023, 1, 10)
  },
  {
    id: "c003",
    clientCode: "AMP-C-003",
    name: "XYZ Retail Group",
    type: "corporate",
    contactPerson: "Jasmine Tan",
    email: "jasmine@xyzretail.com",
    phone: "+65 6789 0123",
    address: {
      street: "456 Orchard Road #15-02",
      postalCode: "238866",
      district: "Orchard"
    },
    paymentTerms: 45,
    status: "active",
    projects: [],
    createdAt: new Date(2023, 2, 20)
  }
];

// Mock Quotations Data
export const mockQuotations: Quotation[] = [
  {
    id: "q001",
    quotationNumber: "AMP-Q-2023-001",
    clientId: "c001",
    projectId: "p001",
    title: "Office Renovation - Phase 1",
    items: [
      { description: "Demolition Works", quantity: 1, unitPrice: 5000, totalPrice: 5000, unit: "lot" },
      { description: "Electrical Rewiring", quantity: 1, unitPrice: 15000, totalPrice: 15000, unit: "lot" },
      { description: "Partition Works", quantity: 120, unitPrice: 250, totalPrice: 30000, unit: "sqm" },
      { description: "Ceiling Works", quantity: 200, unitPrice: 75, totalPrice: 15000, unit: "sqm" }
    ],
    subTotal: 65000,
    discountAmount: 5000,
    discountPercentage: 7.69,
    gstPercentage: 8,
    gstAmount: 4800,
    grandTotal: 64800,
    termsAndConditions: [
      "Quotation validity: 30 days from issue date",
      "50% deposit required upon confirmation",
      "Balance payment due within 7 days of completion",
      "Additional works will be quoted separately"
    ],
    status: "accepted",
    acceptedDate: new Date(2023, 5, 20),
    createdBy: "u001",
    createdAt: new Date(2023, 5, 15),
    lastUpdated: new Date(2023, 5, 20)
  },
  {
    id: "q002",
    quotationNumber: "AMP-Q-2023-002",
    clientId: "c002",
    projectId: "p002",
    title: "HDB Renovation - Full Unit",
    items: [
      { description: "Hacking Works", quantity: 1, unitPrice: 3000, totalPrice: 3000, unit: "lot" },
      { description: "Plumbing Works", quantity: 1, unitPrice: 5500, totalPrice: 5500, unit: "lot" },
      { description: "Flooring (Living & Dining)", quantity: 45, unitPrice: 120, totalPrice: 5400, unit: "sqm" },
      { description: "Kitchen Cabinets", quantity: 1, unitPrice: 8500, totalPrice: 8500, unit: "lot" },
      { description: "Painting Works", quantity: 120, unitPrice: 12, totalPrice: 1440, unit: "sqm" }
    ],
    subTotal: 23840,
    discountAmount: 840,
    discountPercentage: 3.52,
    gstPercentage: 8,
    gstAmount: 1840,
    grandTotal: 24840,
    termsAndConditions: [
      "Quotation validity: 21 days from issue date",
      "30% deposit required upon confirmation",
      "40% payment at midpoint of works",
      "Balance 30% payment due within 7 days of completion",
      "Exclude any permit application fees"
    ],
    status: "accepted",
    acceptedDate: new Date(2023, 7, 5),
    createdBy: "u004",
    createdAt: new Date(2023, 6, 25),
    lastUpdated: new Date(2023, 7, 5)
  }
];

// Mock Invoices Data
export const mockInvoices: Invoice[] = [
  {
    id: "i001",
    invoiceNumber: "AMP-INV-2023-001",
    clientId: "c001",
    projectId: "p001",
    quotationId: "q001",
    title: "Office Renovation - Phase 1 (50% Deposit)",
    items: [
      { description: "50% Deposit for Office Renovation Works", quantity: 1, unitPrice: 32400, totalPrice: 32400, unit: "lot" }
    ],
    subTotal: 32400,
    discountAmount: 0,
    discountPercentage: 0,
    gstPercentage: 8,
    gstAmount: 2400,
    grandTotal: 32400,
    status: "paid",
    dueDate: new Date(2023, 5, 30),
    paidDate: new Date(2023, 5, 28),
    paymentMethod: "bank_transfer",
    paymentReference: "FT123456789",
    createdBy: "u002",
    createdAt: new Date(2023, 5, 21),
    lastUpdated: new Date(2023, 5, 28)
  },
  {
    id: "i002",
    invoiceNumber: "AMP-INV-2023-002",
    clientId: "c002",
    projectId: "p002",
    quotationId: "q002",
    title: "HDB Renovation - Deposit",
    items: [
      { description: "30% Deposit for HDB Renovation", quantity: 1, unitPrice: 7452, totalPrice: 7452, unit: "lot" }
    ],
    subTotal: 7452,
    discountAmount: 0,
    discountPercentage: 0,
    gstPercentage: 8,
    gstAmount: 552,
    grandTotal: 7452,
    status: "paid",
    dueDate: new Date(2023, 7, 12),
    paidDate: new Date(2023, 7, 10),
    paymentMethod: "paynow",
    paymentReference: "PN9876543",
    createdBy: "u002",
    createdAt: new Date(2023, 7, 6),
    lastUpdated: new Date(2023, 7, 10)
  },
  {
    id: "i003",
    invoiceNumber: "AMP-INV-2023-003",
    clientId: "c001",
    projectId: "p001",
    quotationId: "q001",
    title: "Office Renovation - Phase 1 (Balance Payment)",
    items: [
      { description: "Balance Payment for Office Renovation Works", quantity: 1, unitPrice: 32400, totalPrice: 32400, unit: "lot" }
    ],
    subTotal: 32400,
    discountAmount: 0,
    discountPercentage: 0,
    gstPercentage: 8,
    gstAmount: 2400,
    grandTotal: 32400,
    status: "pending",
    dueDate: new Date(2023, 9, 15),
    createdBy: "u002",
    createdAt: new Date(2023, 9, 1),
    lastUpdated: new Date(2023, 9, 1)
  }
];

// Mock Payments Data
export const mockPayments: Payment[] = [
  {
    id: "p001",
    paymentNumber: "AMP-PMT-2023-001",
    invoiceId: "i001",
    clientId: "c001",
    projectId: "p001",
    amount: 32400,
    paymentMethod: "bank_transfer",
    paymentReference: "FT123456789",
    paymentDate: new Date(2023, 5, 28),
    status: "completed",
    notes: "Deposit payment received",
    createdBy: "u002",
    createdAt: new Date(2023, 5, 28),
    lastUpdated: new Date(2023, 5, 28)
  },
  {
    id: "p002",
    paymentNumber: "AMP-PMT-2023-002",
    invoiceId: "i002",
    clientId: "c002",
    projectId: "p002",
    amount: 7452,
    paymentMethod: "paynow",
    paymentReference: "PN9876543",
    paymentDate: new Date(2023, 7, 10),
    status: "completed",
    notes: "Deposit payment received via PayNow",
    createdBy: "u002",
    createdAt: new Date(2023, 7, 10),
    lastUpdated: new Date(2023, 7, 10)
  }
];

// Mock Tenders Data
export const mockTenders: Tender[] = [
  {
    id: "t001",
    tenderNumber: "AMP-T-2023-001",
    title: "Office Building Renovation - Downtown",
    client: "XYZ Commercial Properties",
    location: "50 Raffles Place, Singapore 048623",
    tenderAmount: 250000,
    submissionDate: new Date(2023, 3, 15),
    closingDate: new Date(2023, 4, 30),
    status: "awarded",
    awardDate: new Date(2023, 5, 10),
    description: "Full renovation of 10,000 sqft office space including electrical, HVAC, and interior fit-out",
    scope: [
      "Demolition of existing interior walls and fixtures",
      "Installation of new electrical and data cabling",
      "HVAC system upgrades",
      "New partitions and ceilings",
      "Flooring and finishes",
      "Custom reception and meeting areas"
    ],
    requirements: [
      "BCA registered contractor",
      "Minimum 5 years experience in commercial renovation",
      "ISO 9001 certification",
      "Bizsafe Level 3 or above"
    ],
    notes: "Contract awarded after negotiation phase",
    createdBy: "u001",
    assignedTo: "u004",
    createdAt: new Date(2023, 3, 1),
    lastUpdated: new Date(2023, 5, 10)
  },
  {
    id: "t002",
    tenderNumber: "AMP-T-2023-002",
    title: "Shopping Mall Food Court Renovation",
    client: "East Point Mall Management",
    location: "3 Simei Street 6, Singapore 528833",
    tenderAmount: 180000,
    submissionDate: new Date(2023, 6, 5),
    closingDate: new Date(2023, 7, 31),
    status: "submitted",
    description: "Renovation of 5,000 sqft food court including kitchen facilities and dining area",
    scope: [
      "Demolition of existing food stalls and seating area",
      "Installation of new kitchen equipment and utilities",
      "Plumbing and electrical works",
      "New flooring and ceiling",
      "Custom food stalls and counter design",
      "Dining furniture and decor"
    ],
    requirements: [
      "BCA registered contractor",
      "Experience in F&B facility construction",
      "NEA compliance knowledge",
      "Bizsafe Level 3 or above"
    ],
    notes: "Tender submission acknowledged, awaiting evaluation",
    createdBy: "u004",
    assignedTo: "u004",
    createdAt: new Date(2023, 6, 1),
    lastUpdated: new Date(2023, 7, 5)
  }
];

// Mock Reports Data
export const mockReports: AuditLog[] = [
  {
    id: "a001",
    action: "LOGIN",
    entityType: "USER",
    entityId: "u001",
    userId: "u001",
    userName: "Admin User",
    userRole: "super_admin",
    timestamp: new Date(2023, 7, 15, 9, 30),
    details: {
      entityName: "Admin User",
      details: "User logged in successfully"
    },
    ip: "192.168.1.100"
  },
  {
    id: "a002",
    action: "CREATE",
    entityType: "CLIENT",
    entityId: "c003",
    userId: "u001",
    userName: "Admin User",
    userRole: "super_admin",
    timestamp: new Date(2023, 7, 15, 10, 15),
    details: {
      entityName: "XYZ Retail Group",
      details: "Created new client (AMP-C-003) of type: corporate"
    },
    ip: "192.168.1.100"
  },
  {
    id: "a003",
    action: "UPDATE",
    entityType: "PROJECT",
    entityId: "p001",
    userId: "u003",
    userName: "Project Manager",
    userRole: "projects",
    timestamp: new Date(2023, 7, 15, 14, 45),
    details: {
      entityName: "Office Renovation - CBD",
      details: "Updated project status from 'planning' to 'in_progress'",
      oldData: { status: "planning" },
      newData: { status: "in_progress" }
    },
    ip: "192.168.1.105"
  },
  {
    id: "a004",
    action: "CREATE",
    entityType: "INVOICE",
    entityId: "i003",
    userId: "u002",
    userName: "Finance Manager",
    userRole: "finance",
    timestamp: new Date(2023, 7, 16, 11, 20),
    details: {
      entityName: "Office Renovation - Phase 1 (Balance Payment)",
      details: "Created new invoice AMP-INV-2023-003 for client ABC Corporate Services"
    },
    ip: "192.168.1.102"
  }
];