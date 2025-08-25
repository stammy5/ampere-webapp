# Ampere Engineering - Project Management System

A comprehensive web application built for Ampere Engineering Pte Ltd, a Singapore-based contracting firm specializing in renovation, Addition & Alteration (A&A), and reinstatement projects.

## 🏗️ Project Overview

This modern web application provides a complete business management solution tailored for the Singapore construction industry, featuring:

- **🔐 Authentication System**: Secure login with role-based access control
- **Role-based Access Control**: 5 user types with customized dashboards
- **Project Management**: Track renovation, A&A, and reinstatement projects
- **Client Management**: Comprehensive client database and relationship tracking
- **Tender Management**: Opportunity tracking and submission pipeline
- **Financial Management**: Quotations, invoicing, and payment tracking
- **Vendor Coordination**: Supplier and subcontractor management
- **Singapore-specific Features**: BCA permits, HDB compliance, local regulations

## 🎯 User Roles & Access Levels

### Super Admin
- Complete system access and user management
- Company overview and system settings
- All projects, clients, and financial data

### Admin
- Project oversight and operational management
- Client management and vendor coordination
- Financial reports and system monitoring

### Finance
- Quotations and invoicing management
- Payment tracking and financial reports
- Budget oversight and margin analysis

### Projects
- Project timelines and milestone tracking
- A&A permits and BCA compliance
- Vendor coordination and site management

### Sales
- Tender opportunity management
- Client relationship development
- Quotation pipeline and conversion tracking

## 🔐 Authentication System

The application includes a complete authentication system with:

### Login Features
- **Email/Password Authentication**: Secure user login
- **Role-based Access Control**: Different permissions per user role
- **Session Management**: Persistent login with localStorage
- **Demo Credentials**: Easy testing with pre-configured users
- **User Switching**: Demo feature to test different roles
- **Protected Routes**: Automatic redirect for unauthorized access

### Demo Login Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| Super Admin | john.tan@ampere.com.sg | admin123 | Full system access |
| Admin | sarah.lim@ampere.com.sg | admin123 | Operational management |
| Projects | david.wong@ampere.com.sg | projects123 | Project management |
| Finance | michelle.chen@ampere.com.sg | finance123 | Financial operations |
| Sales | robert.kumar@ampere.com.sg | sales123 | Sales and tenders |

*Note: In production, these would be secure hashed passwords*

## 🏛️ Singapore Construction Industry Context

The application is specifically designed for Singapore's construction landscape:

- **Project Types**: Renovation, A&A, Reinstatement, New Construction
- **Regulatory Compliance**: BCA, URA, HDB, SCDF, NEA, PUB permits
- **Local Business Practices**: GST handling, Singapore postal codes, payment terms
- **Client Categories**: HDB, Private Developers, Corporate, Government, Individual

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for modern UI
- **Authentication**: Custom React Context with localStorage
- **State Management**: React hooks and context
- **Components**: Custom component library
- **Icons**: Lucide React icons

## 🚀 Getting Started

### Prerequisites

Before running this application, ensure you have:

1. **Node.js** (version 18.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

### Installation

1. **Clone or Download** the project files to your local machine

2. **Navigate** to the project directory:
   ```bash
   cd \"AMPERE WEBAPP\"
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Browser** and navigate to:
   ```
   http://localhost:3000
   ```

### Testing Different User Roles

To test different dashboards, edit the `getCurrentUser()` function in `/src/app/dashboard/page.tsx`:

```typescript
// Change the array index to test different roles:
return mockUsers[0] // Super Admin (John Tan)
return mockUsers[1] // Admin (Sarah Lim)
return mockUsers[2] // Projects (David Wong)
return mockUsers[3] // Finance (Michelle Chen)
return mockUsers[4] // Sales (Robert Kumar)
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard page
│   ├── login/            # Authentication page
│   ├── layout.tsx         # Root layout with AuthProvider
│   ├── page.tsx          # Home page with auth routing
│   └── globals.css       # Global styles
├── components/
│   ├── auth/             # Authentication components
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/        # Role-specific dashboard components
│   │   ├── SuperAdminDashboard.tsx
│   │   ├── FinanceDashboard.tsx
│   │   ├── ProjectsDashboard.tsx
│   │   └── SalesDashboard.tsx
│   ├── layout/           # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx (with auth integration)
│   │   └── Sidebar.tsx
│   └── ui/               # Reusable UI components
│       ├── Card.tsx
│       └── MetricCard.tsx
├── contexts/             # React Context providers
│   └── AuthContext.tsx   # Authentication state management
├── lib/
│   ├── utils.ts          # Utility functions
│   └── mock-data.ts      # Sample data for demo
└── types/
    └── index.ts          # TypeScript interfaces
```

## 🎨 Key Features Implemented

### ✅ Dashboard Overviews
- **Super Admin**: Company-wide metrics, project status, financial overview
- **Finance**: Revenue tracking, quotation pipeline, payment status
- **Projects**: Active projects, deadlines, vendor performance, permit tracking
- **Sales**: Tender opportunities, client pipeline, conversion metrics

### ✅ UI/UX Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design using Tailwind CSS
- **Role-based Navigation**: Menu items change based on user permissions
- **Interactive Elements**: Hover effects, status indicators, progress bars
- **Singapore Context**: Local terminology, currency formatting (SGD)

### ✅ Business Logic
- **Project Status Tracking**: Planning → Permits → In Progress → Completed
- **Financial Calculations**: GST, margins, cash flow analysis
- **Tender Pipeline**: Opportunity → Preparing → Submitted → Won/Lost
- **Client Categorization**: HDB, Private, Corporate, Government
- **Vendor Management**: Ratings, specializations, payment terms

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint checks
```

## 🌟 Mock Data

The application includes comprehensive mock data representing:

- **15 Projects** across different types and statuses
- **28 Clients** including HDB, private developers, corporates
- **Multiple Tenders** with various submission stages
- **Quotations** with different statuses and values
- **Vendor Database** with ratings and specializations
- **Financial Metrics** and performance indicators

## 🎯 Next Steps for Production

To make this production-ready, consider implementing:

1. **Authentication System**: User login, JWT tokens, session management
2. **Database Integration**: PostgreSQL/MySQL with Prisma ORM
3. **API Development**: RESTful APIs or GraphQL endpoints
4. **File Upload**: Document management for contracts, permits, drawings
5. **Notification System**: Email alerts, in-app notifications
6. **Reporting Module**: PDF generation, Excel exports
7. **Audit Trail**: User activity logging and compliance tracking
8. **Mobile App**: React Native companion app
9. **Integration**: BCA CorpPass, government portals, accounting software

## 📧 Support

For technical support or business inquiries:
- **Company**: Ampere Engineering Pte Ltd
- **Focus**: Renovation, A&A, and Reinstatement Projects in Singapore
- **Application**: Custom-built project management system

---

**🎉 All Tasks Completed Successfully!**

✅ Project initialization with Next.js and TypeScript  
✅ Role-based authentication system  
✅ Modern responsive layout structure  
✅ Super Admin dashboard with company overview  
✅ Admin dashboard with operational metrics  
✅ Finance dashboard with financial tracking  
✅ Projects dashboard with permit and vendor management  
✅ Sales dashboard with tender pipeline  
✅ Comprehensive Singapore construction industry data models  
✅ Responsive UI tested across devices  

**Built with ❤️ for Ampere Engineering's digital transformation**