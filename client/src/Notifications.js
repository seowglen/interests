import React from 'react';
import { Avatar } from '@material-ui/core';

function Notifications() {
    return(
        <div style={{width: '350px', height: '100px'}}>
            <Avatar />
            <div>This is a notification.</div>
        </div>
    )
}

export default Notifications