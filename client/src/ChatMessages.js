import React from 'react';
import './ChatMessages.css';
import ScrollToBottom from 'react-scroll-to-bottom';
import ChatMessage from './ChatMessage';

const ChatMessages= (props) => {
    return (
        <ScrollToBottom className="messages">
            {props.messages.map((message, i) => 
                <div key={i}>
                    <ChatMessage message={message} name={props.name}/>
                </div>
            )}
        </ScrollToBottom>
    )
}

export default ChatMessages;