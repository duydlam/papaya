import type { ClaimProcessingResult } from '@papaya/contracts';
import _ from 'lodash';

function getApprovalReason(result: ClaimProcessingResult) {
  return result.approval.status === 'auto_approved'
    ? `Amount is below the ${result.approval.autoApprovalThreshold} auto-approval threshold`
    : `Amount matches the ${result.approval.approverRole} approval band`;
}

export function ClaimResultCard({ result }: { result: ClaimProcessingResult }) {
  return (
    <div className="panel result-card">
      <div className="result-top">
        <div>
          <p className="eyebrow">
            EVALUATION RESULT · CONFIG V{result.configVersion}
          </p>
          <h2>
            {result.approval.status === 'auto_approved'
              ? 'Auto-approved'
              : 'Needs review'}
          </h2>
        </div>
        <span className="result-icon">✓</span>
      </div>
      <p>{getApprovalReason(result)}</p>
      {result.approval.approverRole && (
        <div className="result-line">
          <span>Approver</span>
          <strong>{result.approval.approverRole}</strong>
        </div>
      )}
      <div className="result-line">
        <span>Required documents</span>
        <strong>
          {result.documents.required.length
            ? _.join(result.documents.required, ', ')
            : 'None'}
        </strong>
      </div>
      <div className="result-line">
        <span>Optional documents</span>
        <strong>
          {result.documents.optional.length
            ? _.join(result.documents.optional, ', ')
            : 'None'}
        </strong>
      </div>
      <div className="result-line">
        <span>Notifications</span>
        <strong>
          {_.join(
            _.map(
              result.notifications,
              ({ event, channels }) =>
                `${event}: ${_.join(channels, ', ') || 'none'}`,
            ),
            ' · ',
          )}
        </strong>
      </div>
      <div className="result-line">
        <span>SLA deadline</span>
        <strong>
          {result.sla
            ? `${result.sla.deadline} · Escalates to ${result.sla.escalationRole}`
            : 'No SLA configured'}
        </strong>
      </div>
      {'mockDeliveries' in result && (
        <p className="mock-status">
          Mock sends logged:{' '}
          {_.join(
            _.map(
              (
                result as ClaimProcessingResult & {
                  mockDeliveries: { event: string; channel: string }[];
                }
              ).mockDeliveries,
              (item) => `${item.event}/${item.channel}`,
            ),
            ', ',
          ) || 'none configured'}
        </p>
      )}
    </div>
  );
}
