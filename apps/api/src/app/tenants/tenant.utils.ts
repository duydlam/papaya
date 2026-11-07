import _ from 'lodash';
import type { ConfigDiffEntry } from '@papaya/contracts';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  _.isPlainObject(value);

export const diffTenantConfig = (
  left: unknown,
  right: unknown,
  path = '',
): ConfigDiffEntry[] => {
  if (isRecord(left) && isRecord(right)) {
    return _.flatMap(_.union(_.keys(left), _.keys(right)), (key) =>
      diffTenantConfig(left[key], right[key], path ? `${path}.${key}` : key),
    );
  }
  if (_.isEqual(left, right)) return [];
  return [{ path, left: left ?? null, right: right ?? null }];
};
