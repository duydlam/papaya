'use client';

import { useState } from 'react';
import _ from 'lodash';
import type { TenantPage } from '@papaya/contracts';
import { Archive, History as HistoryIcon } from 'lucide-react';
import Link from 'next/link';
import { Button, PageTitle } from '@/components/portal-ui';
import { archiveTenant } from '../api/tenant.api';

export function TenantDirectory({
  tenantPage,
  loading,
  onPageChange,
  onRefresh,
  onError,
  busy,
  setBusy,
}: {
  tenantPage: TenantPage;
  loading: boolean;
  onPageChange: (page: number, search: string) => void;
  onRefresh: (page?: number, search?: string) => Promise<void>;
  onError: (error: unknown) => void;
  busy: boolean;
  setBusy: (value: boolean) => void;
}) {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const totalPages = Math.max(
    1,
    Math.ceil(tenantPage.total / tenantPage.pageSize),
  );
  const archive = async (id: string) => {
    if (
      !window.confirm(
        'Archive this tenant? Its configuration history will be retained.',
      )
    )
      return;
    setBusy(true);
    try {
      await archiveTenant(id);
      await onRefresh(
        tenantPage.items.length === 1 && tenantPage.page > 1
          ? tenantPage.page - 1
          : tenantPage.page,
        appliedSearch,
      );
    } catch (cause) {
      onError(cause);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="CONFIGURATION PLATFORM"
        title="Tenants"
        description="Manage insurance partners and their claim rules."
        action={
          <Link className="button" href="/tenants/new">
            ＋ Add tenant
          </Link>
        }
      />
      <div className="stat-row">
        <div className="stat-card">
          <span>{appliedSearch ? 'MATCHING TENANTS' : 'ACTIVE TENANTS'}</span>
          <strong>{tenantPage.total}</strong>
        </div>
        <div className="stat-card">
          <span>CONFIG VERSIONS</span>
          <strong>Versioned</strong>
        </div>
        <div className="stat-card">
          <span>PROCESSING MODE</span>
          <strong>
            <i className="status-dot" /> Preview & mock
          </strong>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <h2>Insurance partners</h2>
        </div>
        <button
          className="text-button"
          onClick={() => void onRefresh(tenantPage.page, appliedSearch)}
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      <div className="directory-toolbar">
        <form
          className="tenant-search"
          onSubmit={(event) => {
            event.preventDefault();
            const nextSearch = search.trim();
            setAppliedSearch(nextSearch);
            onPageChange(1, nextSearch);
          }}
        >
          <input
            type="search"
            aria-label="Search tenants"
            placeholder="Search by company name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button disabled={loading}>Search</Button>
        </form>
        <span className="muted">
          {tenantPage.total
            ? `Showing ${(tenantPage.page - 1) * tenantPage.pageSize + 1}–${Math.min(tenantPage.page * tenantPage.pageSize, tenantPage.total)} of ${tenantPage.total}`
            : 'No matching tenants'}
        </span>
      </div>
      <div className="tenant-grid">
        {_.map(tenantPage.items, (tenant, index) => (
          <article className="tenant-card" key={tenant.id}>
            <div className={`tenant-mark mark-${index % 3}`}>
              {_.head(tenant.companyName)}
            </div>
            <div className="tenant-main">
              <div className="tenant-title">
                <h3>{tenant.companyName}</h3>
                <span className="pill">v{tenant.currentVersion}</span>
              </div>
              <p className="muted">
                {tenant.enabledClaimTypes.length} claim types enabled
              </p>
              <div className="chips">
                {_.map(_.take(tenant.enabledClaimTypes, 4), (type) => (
                  <span
                    className={`chip chip-${type.toLowerCase()}`}
                    key={type}
                  >
                    {type.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            <div className="tenant-actions">
              <Link className="button secondary" href={`/tenants/${tenant.id}`}>
                Open config
              </Link>
              <Link
                className="icon-action history-action"
                title="Version history"
                aria-label={`Version history for ${tenant.companyName}`}
                href={`/tenants/${tenant.id}/history`}
              >
                <HistoryIcon size={17} aria-hidden="true" />
              </Link>
              <button
                className="icon-action archive-action"
                title="Archive tenant"
                aria-label={`Archive ${tenant.companyName}`}
                disabled={busy}
                onClick={() => void archive(tenant.id)}
              >
                <Archive size={17} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!tenantPage.items.length && !loading && (
        <div className="empty">
          {appliedSearch
            ? `No tenants match “${appliedSearch}”.`
            : 'No active tenants. Add a tenant configuration to begin.'}
        </div>
      )}
      {loading && !tenantPage.items.length && (
        <div className="empty" role="status">
          Loading tenants…
        </div>
      )}
      {tenantPage.total > 0 && (
        <div className="pagination">
          <Button
            disabled={loading || tenantPage.page <= 1}
            className="button secondary"
            onClick={() => onPageChange(tenantPage.page - 1, appliedSearch)}
          >
            Previous
          </Button>
          <span className="muted">
            Page {tenantPage.page} of {totalPages}
          </span>
          <Button
            disabled={loading || tenantPage.page >= totalPages}
            className="button secondary"
            onClick={() => onPageChange(tenantPage.page + 1, appliedSearch)}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
