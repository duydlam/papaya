'use client';

import type { MouseEvent } from 'react';
import _ from 'lodash';
import type { TenantSummary } from '@papaya/contracts';
import { ChevronDown, Search } from 'lucide-react';
import { useTenantPicker } from '../hooks/use-tenant-picker';

const preventPickerBlur = (event: MouseEvent<HTMLButtonElement>) =>
  event.preventDefault();

export function TenantPicker({
  label,
  value,
  excludeTenantId,
  onChange,
  onError,
}: {
  label: string;
  value?: TenantSummary;
  excludeTenantId?: string;
  onChange: (tenant?: TenantSummary) => void;
  onError: (error: unknown) => void;
}) {
  const {
    search,
    page,
    open,
    activeIndex,
    result,
    loading,
    totalPages,
    searchPending,
    handleBlur,
    handleFocus,
    handleSearchChange,
    handleKeyDown,
    handleOptionMouseEnter,
    handleTenantClick,
    goToPreviousPage,
    goToNextPage,
  } = useTenantPicker({ value, excludeTenantId, onChange, onError });
  const listId = `tenant-options-${_.kebabCase(label)}`;

  return (
    <div className="tenant-picker" onBlur={handleBlur}>
      <span className="picker-label">{label}</span>
      <div className="tenant-combobox">
        <Search
          className="tenant-combobox-search-icon"
          size={16}
          aria-hidden="true"
        />
        <input
          type="text"
          role="combobox"
          aria-label={label}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
          }
          placeholder="Search companies"
          value={open ? search : (value?.companyName ?? search)}
          onFocus={handleFocus}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
        <ChevronDown
          className={`tenant-combobox-chevron${open ? ' open' : ''}`}
          size={16}
          aria-hidden="true"
        />
        {open && (
          <div className="picker-dropdown">
            <div
              className="picker-options"
              id={listId}
              role="listbox"
              aria-label={`${label} results`}
            >
              {searchPending || loading ? (
                <div className="picker-empty" role="status">
                  Searching companies…
                </div>
              ) : result.items.length ? (
                _.map(result.items, (tenant, index) => (
                  <button
                    className={`picker-option${activeIndex === index ? ' active' : ''}`}
                    id={`${listId}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={value?.id === tenant.id}
                    key={tenant.id}
                    onMouseDown={preventPickerBlur}
                    onMouseEnter={handleOptionMouseEnter(index)}
                    onClick={handleTenantClick(tenant)}
                  >
                    <span>{tenant.companyName}</span>
                    <small>
                      {tenant.enabledClaimTypes.length} claim types · v
                      {tenant.currentVersion}
                    </small>
                  </button>
                ))
              ) : (
                <div className="picker-empty" role="status">
                  No matching companies
                </div>
              )}
            </div>
            {!searchPending && result.total > result.pageSize && (
              <div className="picker-results-footer">
                <span>
                  Page {page} of {totalPages} · {result.total} companies
                </span>
                <div>
                  <button
                    type="button"
                    aria-label={`Previous ${label.toLowerCase()} page`}
                    disabled={loading || page <= 1}
                    onClick={goToPreviousPage}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label={`Next ${label.toLowerCase()} page`}
                    disabled={loading || page >= totalPages}
                    onClick={goToNextPage}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
