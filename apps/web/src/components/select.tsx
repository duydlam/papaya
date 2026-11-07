import type { SelectHTMLAttributes } from 'react';
import _ from 'lodash';

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={_.compact(['ui-select', className]).join(' ')}
      {...props}
    />
  );
}
