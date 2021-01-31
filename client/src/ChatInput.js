import React from 'react';
import './ChatInput.css';

const ChatInput = (props) => {
    return (
        <form className="chatForm">
            <input 
                className="input" 
                type="text" 
                placeholder="Type a message..."
                value={props.message}
                onChange={(e) => props.setMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' ? props.sendMessage(e) : null} 
            />
            <button className="sendButton" onClick={e => props.sendMessage(e)}>Send</button>
        </form>
    )
}

export default ChatInput;