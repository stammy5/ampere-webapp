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