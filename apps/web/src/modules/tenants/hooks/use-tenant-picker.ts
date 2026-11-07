import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import _ from 'lodash';
import type { TenantPage, TenantSummary } from '@papaya/contracts';
import { listTenants } from '../api/tenant.api';
import { TENANT_PAGE_SIZE } from '../constants';

export function useTenantPicker({
  value,
  excludeTenantId,
  onChange,
  onError,
}: {
  value?: TenantSummary;
  excludeTenantId?: string;
  onChange: (tenant?: TenantSummary) => void;
  onError: (error: unknown) => void;
}) {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TenantPage>({
    items: [],
    page: 1,
    pageSize: TENANT_PAGE_SIZE,
    total: 0,
  });
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const searchPending = search.trim() !== appliedSearch;
  const applySearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setAppliedSearch(value.trim());
        setPage(1);
      }, 250),
    [],
  );

  useEffect(() => {
    applySearch(search);
  }, [applySearch, search]);

  useEffect(() => () => applySearch.cancel(), [applySearch]);

  useEffect(() => {
    let active = true;
    setResult((current) => ({ ...current, items: [], page, total: 0 }));
    setLoading(true);
    void listTenants(page, appliedSearch, excludeTenantId)
      .then((data) => active && setResult(data))
      .catch((error) => active && onError(error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, appliedSearch, excludeTenantId, onError]);

  const selectTenant = useCallback(
    (tenant: TenantSummary) => {
      onChange(tenant);
      setSearch('');
      setActiveIndex(-1);
      setOpen(false);
    },
    [onChange],
  );

  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null))
      setOpen(false);
  }, []);

  const handleFocus = useCallback(() => {
    setOpen(true);
    setActiveIndex(-1);
    if (value) {
      setSearch('');
      setPage(1);
    }
  }, [value]);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
      setPage(1);
      setActiveIndex(-1);
      setOpen(true);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
        setActiveIndex((current) =>
          Math.min(current + 1, result.items.length - 1),
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      } else if (event.key === 'Enter' && open) {
        event.preventDefault();
        const tenant = result.items[activeIndex];
        if (tenant) selectTenant(tenant);
      } else if (event.key === 'Escape') {
        setOpen(false);
        setActiveIndex(-1);
      }
    },
    [activeIndex, open, result.items, selectTenant],
  );

  const goToPreviousPage = useCallback(() => {
    setPage((current) => current - 1);
    setActiveIndex(-1);
  }, []);

  const goToNextPage = useCallback(() => {
    setPage((current) => current + 1);
    setActiveIndex(-1);
  }, []);

  const handleOptionMouseEnter = useCallback(
    (index: number) => () => setActiveIndex(index),
    [],
  );

  const handleTenantClick = useCallback(
    (tenant: TenantSummary) => () => selectTenant(tenant),
    [selectTenant],
  );

  return {
    search,
    setSearch,
    page,
    open,
    activeIndex,
    setActiveIndex,
    result,
    loading,
    totalPages,
    searchPending,
    selectTenant,
    handleOptionMouseEnter,
    handleTenantClick,
    handleBlur,
    handleFocus,
    handleSearchChange,
    handleKeyDown,
    goToPreviousPage,
    goToNextPage,
  };
}
