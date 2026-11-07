import _ from 'lodash';
import type { ConfigDiffEntry } from '@papaya/contracts';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { CONFIG_DIFF_GROUPS, DIFF_CHANGE_CLASSES } from '../constants';
import {
  formatDiffScalar,
  getDiffChange,
  getDiffPathLabels,
} from '../utils/diff.utils';
import { DiffValue } from './diff-value';

export function CompareGroup({
  group,
  entries,
  leftName,
  rightName,
}: {
  group: (typeof CONFIG_DIFF_GROUPS)[number];
  entries: ConfigDiffEntry[];
  leftName: string;
  rightName: string;
}) {
  return (
    <section className="diff-group">
      <h3>{group[1]}</h3>
      {entries.length ? (
        <>
          <div className="diff-column-head">
            <span>Configuration item</span>
            <strong>{leftName}</strong>
            <strong>{rightName}</strong>
            <span>Change</span>
          </div>
          {_.map(entries, (entry) => (
            <DiffRow
              key={entry.path}
              entry={entry}
              leftName={leftName}
              rightName={rightName}
            />
          ))}
        </>
      ) : (
        <p className="diff-group-match">No differences in this step.</p>
      )}
    </section>
  );
}

function DiffRow({
  entry,
  leftName,
  rightName,
}: {
  entry: ConfigDiffEntry;
  leftName: string;
  rightName: string;
}) {
  const change = getDiffChange(entry.left, entry.right);
  const { field, context } = getDiffPathLabels(entry.path);

  return (
    <div className="diff-row">
      <div className="diff-item-label">
        <strong>{field}</strong>
        {context && <small>{context}</small>}
      </div>
      <div className="diff-side-value">
        <span className="diff-mobile-tenant">{leftName}</span>
        <DiffValue value={entry.left} other={entry.right} side="left" />
      </div>
      <div className="diff-side-value">
        <span className="diff-mobile-tenant">{rightName}</span>
        <DiffValue value={entry.right} other={entry.left} side="right" />
      </div>
      <span className={`diff-change ${change.className ?? ''}`}>
        {change.className === DIFF_CHANGE_CLASSES.HIGHER && (
          <ArrowUp size={14} />
        )}
        {change.className === DIFF_CHANGE_CLASSES.LOWER && (
          <ArrowDown size={14} />
        )}
        {change.delta === undefined
          ? change.label
          : `${change.label} by ${formatDiffScalar(change.delta)}`}
      </span>
    </div>
  );
}
