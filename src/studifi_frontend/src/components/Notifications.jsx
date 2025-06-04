import React from 'react';

const Notifications = ({ notifications }) => (
  <>
    {notifications.length > 0 && (
      <div className="notifications">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        ))}
      </div>
    )}
  </>
);

export default Notifications;