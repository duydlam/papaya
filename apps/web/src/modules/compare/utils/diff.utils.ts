import _ from 'lodash';
import {
  DIFF_CHANGE_CLASSES,
  DIFF_CHANGE_LABELS,
  DIFF_CONTEXT_SEPARATOR,
  DIFF_PATH_SEPARATOR,
} from '../constants';

export const getDiffChange = (left: unknown, right: unknown) => {
  if (!_.isNumber(left) || !_.isNumber(right) || left === right)
    return {
      label: DIFF_CHANGE_LABELS.CHANGED,
      className: undefined,
      delta: undefined,
    };

  const increased = right > left;
  return {
    label: increased
      ? DIFF_CHANGE_LABELS.INCREASED
      : DIFF_CHANGE_LABELS.DECREASED,
    className: increased
      ? DIFF_CHANGE_CLASSES.HIGHER
      : DIFF_CHANGE_CLASSES.LOWER,
    delta: Math.abs(right - left),
  };
};

export const getDiffGroupKey = (path: string) =>
  _.head(_.split(path, DIFF_PATH_SEPARATOR));

export const getDiffPathLabels = (path: string) => {
  const parts = _.split(path, DIFF_PATH_SEPARATOR);
  return {
    field: _.startCase(_.last(parts) ?? path),
    context: _.chain(parts)
      .tail()
      .initial()
      .map(_.startCase)
      .join(DIFF_CONTEXT_SEPARATOR)
      .value(),
  };
};

export const formatDiffValue = (value: unknown): string => {
  if (_.isNil(value)) return 'Not set';
  if (_.isArray(value))
    return _.map(value, formatDiffValue).join(', ') || 'None';
  if (_.isPlainObject(value))
    return _.map(
      value,
      (item, key) => `${_.startCase(key)}: ${formatDiffValue(item)}`,
    ).join(' · ');
  return formatDiffScalar(value);
};

export const formatDiffScalar = (value: unknown): string => {
  if (_.isBoolean(value)) return value ? 'Enabled' : 'Disabled';
  if (_.isNumber(value)) return new Intl.NumberFormat().format(value);
  return String(value);
};
