import { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import type { TenantConfig, TenantDetails } from '@papaya/contracts';
import {
  createTenant,
  getTenant,
  getTenantVersion,
  updateTenantConfig,
} from '../api/tenant.api';
import { DEFAULT_NEW_TENANT_NAME } from '../constants';

export function useTenantEditor(
  tenantId: string | undefined,
  sampleTenantId: string | undefined,
  onError: (error: unknown) => void,
) {
  const [detail, setDetail] = useState<TenantDetails>();
  const [companyName, setCompanyName] = useState('');
  const [config, setConfig] = useState<TenantConfig>();
  const [saving, setSaving] = useState(false);
  const [readOnlyVersion, setReadOnlyVersion] = useState<number>();

  useEffect(() => {
    setDetail(undefined);
    setCompanyName('');
    setConfig(undefined);
    setReadOnlyVersion(undefined);
    if (!tenantId) return;

    const version = new URLSearchParams(window.location.search).get('version');
    let active = true;
    void (async () => {
      try {
        const data = await getTenant(tenantId);
        if (!active) return;
        setDetail(data);
        if (version) {
          const snapshot = await getTenantVersion(tenantId, Number(version));
          if (!active) return;
          setReadOnlyVersion(snapshot.version);
          setCompanyName(snapshot.config.branding.companyName);
          setConfig(snapshot.config);
        } else {
          setCompanyName(data.companyName);
          setConfig(data.config);
        }
      } catch (error) {
        if (active) onError(error);
      }
    })();
    return () => {
      active = false;
    };
  }, [tenantId, onError]);

  const save = useCallback(
    async (name: string, draft: TenantConfig | undefined) => {
      setSaving(true);
      try {
        if (!draft) throw new Error('Choose a sample configuration first.');
        const nextConfig = _.cloneDeep(draft);
        nextConfig.branding.companyName = name.trim();
        if (tenantId) await updateTenantConfig(tenantId, nextConfig);
        else await createTenant(nextConfig);
        window.location.href = '/';
      } catch (error) {
        onError(error);
      } finally {
        setSaving(false);
      }
    },
    [tenantId, onError],
  );

  const populateTemplate = useCallback(async () => {
    if (!sampleTenantId) return;
    try {
      const data = await getTenant(sampleTenantId);
      const nextConfig = structuredClone(data.config);
      nextConfig.branding.companyName =
        companyName.trim() || DEFAULT_NEW_TENANT_NAME;
      nextConfig.branding.logoUrl = '';
      setConfig(nextConfig);
    } catch (error) {
      onError(error);
    }
  }, [companyName, onError, sampleTenantId]);

  return {
    detail,
    companyName,
    setCompanyName,
    config,
    setConfig,
    saving,
    readOnlyVersion,
    save,
    populateTemplate,
  };
}
