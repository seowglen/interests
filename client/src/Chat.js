import React, { useState } from 'react';
import './Chat.css';
import Header from './Header';
import ChatRoom from './ChatRoom';

const Chat = ({ setAuth }) => {

    const [userName, setUserName] = useState('');
    const [room, setRoom] = useState('');
    const [toggle, setToggle] = useState(false);

    const logout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        setAuth(false);
    }

    function handleClick(e) {
        setToggle(true);
    }

    return (
        <div>
            <Header setAuth={setAuth} logout={logout} currentPage='chat'/>
            <div className="joinOuterContainer">
                <div className="joinInnerContainer">
                    {!toggle ? 
                        <div>
                            <h1>This is the Chat page</h1>
                            <div>
                                <input placeholder="Room" className="joinInput" type="text" onChange={(e) => setRoom(e.target.value)} />
                            </div>
                            <button className="button mt-20" type="submit" onClick={handleClick}>Join Room</button>
                        </div>
                    :
                        <ChatRoom roomName={room} />
                    }
                </div>
            </div>
        </div>
    )
}

export default Chat;