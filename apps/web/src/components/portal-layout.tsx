'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { TenantPage } from '@papaya/contracts';
import { useTenantDirectory } from '@/modules/tenants/hooks/use-tenant-directory';

type PortalContextValue = {
  tenantPage: TenantPage;
  loading: boolean;
  loadTenants: (page?: number, search?: string) => Promise<void>;
  notifyError: (error: unknown) => void;
};

const PortalContext = createContext<PortalContextValue | null>(null);

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) throw new Error('usePortal must be used inside PortalLayout');
  return context;
}

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [error, setError] = useState('');
  const notifyError = useCallback(
    (cause: unknown) =>
      setError(cause instanceof Error ? cause.message : 'Request failed'),
    [],
  );
  const { tenantPage, loading, loadTenants } = useTenantDirectory(notifyError);
  const tenantsActive = pathname === '/' || pathname.startsWith('/tenants/');

  return (
    <PortalContext.Provider
      value={{ tenantPage, loading, loadTenants, notifyError }}
    >
      <div className="app-shell">
        <aside className="sidebar">
          <Link className="brand" href="/">
            papaya<span>✳</span>
          </Link>
          <p className="side-label">WORKSPACE</p>
          <nav>
            <Link
              className={tenantsActive ? 'nav-link active' : 'nav-link'}
              href="/"
            >
              Tenants <span>{tenantPage.total}</span>
            </Link>
            <Link
              className={
                pathname === '/claims' ? 'nav-link active' : 'nav-link'
              }
              href="/claims"
            >
              Claim preview
            </Link>
            <Link
              className={
                pathname === '/compare' ? 'nav-link active' : 'nav-link'
              }
              href="/compare"
            >
              Compare configs
            </Link>
          </nav>
          <div className="sidebar-note">
            <span className="status-dot" /> Demo workspace{' '}
            <small>Fictional tenant data</small>
          </div>
        </aside>
        <main className="main-content">
          {error && (
            <div className="error" role="alert">
              {error}
              <button
                className="dismiss"
                aria-label="Dismiss error"
                onClick={() => setError('')}
              >
                ×
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
    </PortalContext.Provider>
  );
}
