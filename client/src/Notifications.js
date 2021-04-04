import React from 'react';
import './Notifications.css';
import Notification from './Notification';

function Notifications(props) {

    return(
        <div>
            {props.notifications.map(notification => (
                <Notification notification={notification} />
            ))}
        </div>
    )
}

export default Notifications;