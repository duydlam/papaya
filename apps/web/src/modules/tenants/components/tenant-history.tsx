'use client';

import { useTenantHistory } from '../hooks/use-tenant-history';
import Link from 'next/link';
import moment from 'moment';
import _ from 'lodash';
import { PageTitle } from '@/components/portal-ui';
import { TENANT_HISTORY_DATE_TIME_FORMAT } from '../constants';

export function History({
  tenantId,
  onError,
}: {
  tenantId: string;
  onError: (error: unknown) => void;
}) {
  const { versions, company, busy, restore } = useTenantHistory(
    tenantId,
    onError,
  );
  return (
    <>
      <PageTitle
        eyebrow="TENANT CONFIGURATION"
        title={`${company || 'Tenant'} history`}
        description="Every saved configuration is retained. Rollback creates a new version."
        action={
          <Link className="button secondary" href={`/tenants/${tenantId}`}>
            ← Config
          </Link>
        }
      />
      <div className="panel history-list">
        {_.map(versions, (version) => (
          <article className="history-row" key={version.version}>
            <div className="history-icon">
              {version.restoredFromVersion ? '↶' : '◷'}
            </div>
            <div className="history-info">
              <h3>
                Version {version.version}
                {version.restoredFromVersion && (
                  <span className="pill">
                    Restored from v{version.restoredFromVersion}
                  </span>
                )}
              </h3>
              <time>
                {moment(version.createdAt).format(
                  TENANT_HISTORY_DATE_TIME_FORMAT,
                )}
              </time>
            </div>
            <div className="history-actions">
              <Link
                className="text-button"
                href={`/tenants/${tenantId}?version=${version.version}`}
              >
                View config
              </Link>
              {version.version !== versions[0]?.version && (
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() => void restore(version.version)}
                >
                  Restore this version
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
