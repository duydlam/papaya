import type { Metadata } from 'next';
import { PortalLayout } from '@/components/portal-layout';
import './globals.css';
export const metadata: Metadata = {
  title: 'Papaya | Tenant configuration',
  description: 'Configure insurance partners and preview claims.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PortalLayout>{children}</PortalLayout>
      </body>
    </html>
  );
}
