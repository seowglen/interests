import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './ChatRoom.css';
import ChatInfo from './ChatInfo';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import TextContainer from './TextContainer';

let socket;
const ENDPOINT = 'localhost:5000';

const ChatRoom = (props) => {

    const [name, setName] = useState('')
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState('');
    
    //asdf
    useEffect(() => {
        socket = io(ENDPOINT, { rememberTransport: false, transport : ['websocket'] });

        setName(props.userName);
        setRoom(props.roomName);
        
        socket.emit('join', {name: props.userName, room: props.roomName});

        return () => {
            socket.emit('disconnected');
            socket.off();
        }
        //asdfasdfsda

    }, [ENDPOINT, props.userName, props.roomName]);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages(messages => [...messages, message]);
        })

        socket.on("roomData", ({ users }) => {
            setUsers(users);
        });
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message) {
            socket.emit('sendMessage', message);
        }
        setMessage('');
    }

    const exitChat = (e) => {
        e.preventDefault();
        props.toggleChat(false);
    }

    return (
        <div className="outerContainer">
            <div className="container">
                <ChatInfo room={room} exitChat={exitChat}/>
                <ChatMessages messages={messages} name={name}/>
                {/* <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' ? sendMessage(e) : null}/> */}
                <ChatInput message={message} setMessage={setMessage} sendMessage={sendMessage}/>
            </div>
            <TextContainer users={users}/>
        </div>
    )
}

export default ChatRoom;