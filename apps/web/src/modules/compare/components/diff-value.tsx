import _ from 'lodash';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { DIFF_CHANGE_CLASSES } from '../constants';
import { formatDiffScalar, formatDiffValue } from '../utils/diff.utils';

export function DiffValue({
  value,
  other,
  side,
}: {
  value: unknown;
  other: unknown;
  side: 'left' | 'right';
}) {
  if (!_.isArray(value))
    return <span className="diff-value-text">{formatDiffValue(value)}</span>;
  if (!value.length) return <span className="diff-value-empty">None</span>;
  if (_.some(value, _.isPlainObject))
    return <ObjectValueList values={value} other={other} side={side} />;

  return <ScalarValueList values={value} other={other} side={side} />;
}

function ObjectValueList({
  values,
  other,
  side,
}: {
  values: unknown[];
  other: unknown;
  side: 'left' | 'right';
}) {
  const otherValues = _.filter(_.castArray(other), isPlainObject);

  return (
    <div className="diff-object-list">
      {_.map(values, (value, index) => {
        if (!isPlainObject(value)) return null;
        const identityKey = _.find(['role', 'key', 'value', 'label'], (key) =>
          _.has(value, key),
        );
        const identity = identityKey ? _.get(value, identityKey) : undefined;

        return (
          <DiffObjectCard
            key={`${String(identity ?? 'item')}-${index}`}
            item={value}
            otherItems={otherValues}
            index={index}
            identityKey={identityKey}
            side={side}
          />
        );
      })}
    </div>
  );
}

function DiffObjectCard({
  item,
  otherItems,
  index,
  identityKey,
  side,
}: {
  item: Record<string, unknown>;
  otherItems: Record<string, unknown>[];
  index: number;
  identityKey?: string;
  side: 'left' | 'right';
}) {
  const identity = identityKey ? _.get(item, identityKey) : undefined;
  const counterpart = _.find(otherItems, (candidate, otherIndex) =>
    identityKey && identity !== undefined
      ? _.isEqual(_.get(candidate, identityKey), identity)
      : otherIndex === index,
  );
  const added = !counterpart && side === 'right';
  const removed = !counterpart && side === 'left';

  return (
    <div
      className={`diff-object-card${added ? ' added' : ''}${removed ? ' removed' : ''}`}
    >
      <strong>{_.startCase(String(identity ?? `Item ${index + 1}`))}</strong>
      {_.map(
        _.filter(_.toPairs(item), ([key]) => key !== identityKey),
        ([key, fieldValue]) => (
          <DiffObjectField
            key={key}
            name={key}
            value={fieldValue}
            otherValue={counterpart ? _.get(counterpart, key) : undefined}
            side={side}
          />
        ),
      )}
      {added && <small className="diff-object-status">Added in second</small>}
      {removed && (
        <small className="diff-object-status">Removed from second</small>
      )}
    </div>
  );
}

function DiffObjectField({
  name,
  value,
  otherValue,
  side,
}: {
  name: string;
  value: unknown;
  otherValue: unknown;
  side: 'left' | 'right';
}) {
  const delta =
    _.isNumber(value) && _.isNumber(otherValue)
      ? side === 'left'
        ? otherValue - value
        : value - otherValue
      : 0;

  return (
    <span className="diff-object-field">
      <small>{_.startCase(name)}</small>
      <span>
        {name === 'maxAmount' && _.isNil(value)
          ? 'No upper limit'
          : formatDiffValue(value)}
        {delta !== 0 && (
          <small
            className={`diff-inline-change ${delta > 0 ? DIFF_CHANGE_CLASSES.HIGHER : DIFF_CHANGE_CLASSES.LOWER}`}
          >
            {delta > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {formatDiffScalar(Math.abs(delta))}{' '}
            {side === 'left' ? 'in second' : 'from first'}
          </small>
        )}
      </span>
    </span>
  );
}

function ScalarValueList({
  values,
  other,
  side,
}: {
  values: unknown[];
  other: unknown;
  side: 'left' | 'right';
}) {
  const comparable = _.every(values, (value) => !_.isObject(value));

  return (
    <div className="diff-value-list">
      {_.map(values, (value, index) => {
        const presentOnOther = _.some(_.castArray(other), (otherValue) =>
          _.isEqual(value, otherValue),
        );
        const className =
          comparable && !presentOnOther
            ? side === 'right'
              ? 'added'
              : 'removed'
            : '';

        return (
          <span
            className={`diff-value-chip ${className}`}
            key={`${formatDiffValue(value)}-${index}`}
          >
            {formatDiffValue(value)}
          </span>
        );
      })}
    </div>
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return _.isPlainObject(value);
}
