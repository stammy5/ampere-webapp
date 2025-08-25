import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ClientProvider } from '@/contexts/ClientContext'
import { VendorProvider } from '@/contexts/VendorContext'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { TenderProvider } from '@/contexts/TenderContext'
import { QuotationProvider } from '@/contexts/QuotationContext'
import { FinanceProvider } from '@/contexts/FinanceContext'
import { ReportsProvider } from '@/contexts/ReportsContext'
import { UserProvider } from '@/contexts/UserContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { AuditLogProvider } from '@/contexts/AuditLogContext'
import { PurchaseOrderProvider } from '@/contexts/PurchaseOrderContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ampere Engineering - Project Management System',
  description: 'Comprehensive project management system for Ampere Engineering Pte Ltd - Managing renovation, A&A and reinstatement projects in Singapore',
  keywords: 'construction, renovation, singapore, project management, A&A, reinstatement, contracting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuditLogProvider>
          <AuthProvider>
            <SettingsProvider>
              <UserProvider>
                <ClientProvider>
                <VendorProvider>
                  <ProjectProvider>
                    <TenderProvider>
                      <QuotationProvider>
                        <FinanceProvider>
                          <PurchaseOrderProvider>
                            <ReportsProvider>
                              <div id="root" className="min-h-screen bg-gray-50">
                                {children}
                              </div>
                            </ReportsProvider>
                          </PurchaseOrderProvider>
                        </FinanceProvider>
                      </QuotationProvider>
                    </TenderProvider>
                  </ProjectProvider>
                </VendorProvider>
              </ClientProvider>
              </UserProvider>
            </SettingsProvider>
          </AuthProvider>
        </AuditLogProvider>
      </body>
    </html>
  )
}