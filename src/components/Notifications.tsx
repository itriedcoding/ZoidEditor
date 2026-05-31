import { useStore } from '../store';
import { IconCheckCircle, IconErrorCircle, IconInfo, IconX } from './Icons';

function Notifications() {
  const { notifications, removeNotification } = useStore();

  if (notifications.length === 0) return null;

  return (
    <div className="notifications-container">
      {notifications.map(n => (
        <div key={n.id} className={`notification notification-${n.type}`}>
          <div className="notification-icon">
            {n.type === 'success' ? <IconCheckCircle size={18} /> :
             n.type === 'error' ? <IconErrorCircle size={18} /> :
             <IconInfo size={18} />}
          </div>
          <div className="notification-content">
            <div className="notification-message">{n.message}</div>
          </div>
          <button className="notification-close" onClick={() => removeNotification(n.id)}>
            <IconX size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
