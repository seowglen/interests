import React from 'react';
import './ChatInfo.css';
import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const ChatInfo = (props) => {
    return (
        <div className="infoBar">
            <div className="leftInnerContainer">
                <h3>{props.room}</h3>
            </div>
            <div className="rightInnerContainer">
                <IconButton>
                    <div onClick={(e) => props.exitChat(e)}>
                        <CloseIcon />
                    </div>
                </IconButton>
            </div>
        </div>
    )
}

export default ChatInfo;