import Link from 'next/link';
import type { TenantConfig } from '@papaya/contracts';
import { TENANT_COMPANY_NAME_MAX_LENGTH } from '../constants';
import type { TenantConfigUpdate } from './tenant-editor.types';

export function TenantBrandingStep({
  config,
  tenantId,
  companyName,
  setCompanyName,
  readOnly,
  updateConfig,
}: {
  config: TenantConfig;
  tenantId?: string;
  companyName: string;
  setCompanyName: (name: string) => void;
  readOnly: boolean;
  updateConfig: TenantConfigUpdate;
}) {
  return (
    <section className="config-section">
      <div className="section-heading">
        <div>
          <h2>Branding</h2>
          <p>Identity shown for this insurance partner.</p>
        </div>
        {tenantId && (
          <Link className="text-button" href={`/tenants/${tenantId}/history`}>
            View history →
          </Link>
        )}
      </div>
      <div className="config-grid">
        <label>
          Company name
          <input
            required
            maxLength={TENANT_COMPANY_NAME_MAX_LENGTH}
            readOnly={readOnly}
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
          />
        </label>
        <label>
          Logo URL
          <input
            type="url"
            readOnly={readOnly}
            value={config.branding.logoUrl}
            onChange={(event) =>
              updateConfig((draft) => {
                draft.branding.logoUrl = event.target.value;
              })
            }
          />
        </label>
        <label>
          Primary color
          <input
            type="color"
            disabled={readOnly}
            value={config.branding.primaryColor}
            onChange={(event) =>
              updateConfig((draft) => {
                draft.branding.primaryColor = event.target.value;
              })
            }
          />
        </label>
        <label>
          Secondary color
          <input
            type="color"
            disabled={readOnly}
            value={config.branding.secondaryColor}
            onChange={(event) =>
              updateConfig((draft) => {
                draft.branding.secondaryColor = event.target.value;
              })
            }
          />
        </label>
      </div>
    </section>
  );
}
