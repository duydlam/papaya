import _ from 'lodash';
import { NOTIFICATION_CHANNELS, NOTIFICATION_EVENTS } from '@papaya/contracts';
import type { TenantConfigStepProps } from './tenant-editor.types';

export function TenantNotificationsStep({
  config,
  readOnly,
  updateConfig,
}: TenantConfigStepProps) {
  return (
    <section className="config-section">
      <div className="section-heading">
        <div>
          <h2>Notifications</h2>
          <p>Choose which channels receive each event.</p>
        </div>
      </div>
      <div className="notification-list">
        {_.map(NOTIFICATION_EVENTS, (eventName) => (
          <div className="notification-row" key={eventName}>
            <strong>{eventName.replaceAll('_', ' ')}</strong>
            <div className="channel-options">
              {_.map(NOTIFICATION_CHANNELS, (channel) => (
                <label className="check-row" key={channel}>
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={_.includes(
                      config.notifications[eventName].channels,
                      channel,
                    )}
                    onChange={(event) =>
                      updateConfig((draft) => {
                        const channels =
                          draft.notifications[eventName].channels;
                        draft.notifications[eventName].channels = event.target
                          .checked
                          ? _.uniq([...channels, channel])
                          : _.filter(channels, (item) => item !== channel);
                      })
                    }
                  />
                  {channel}
                </label>
              ))}
            </div>
            {_.includes(config.notifications[eventName].channels, 'email') && (
              <label>
                Email template
                <textarea
                  rows={2}
                  readOnly={readOnly}
                  value={config.notifications[eventName].emailTemplate ?? ''}
                  onChange={(event) =>
                    updateConfig((draft) => {
                      draft.notifications[eventName].emailTemplate =
                        event.target.value || null;
                    })
                  }
                  placeholder="Use default template"
                />
              </label>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
