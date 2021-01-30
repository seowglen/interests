import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ChatRoom = (props) => {

    const [room, setRoom] = useState('');
    const ENDPOINT = 'localhost:5000';

    useEffect(() => {
        var socket = io(ENDPOINT, { transport : ['websocket'] });
        
        setRoom(props.roomName);
        
        socket.emit('join', {room: props.roomName});

        return () => {
            socket.emit('disconnected');
            socket.off();
        }
        //asdfasdfsda

    }, [ENDPOINT, props.roomName]);

    return (
        <h1>Chat Room Entered: {room}</h1>
    )
}

export default ChatRoom;